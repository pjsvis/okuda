#!/usr/bin/env bun
/**
 * html-package.ts — publish a markdown document as one self-contained HTML
 * file: the main document to read, and its one-hop references dereferenceable
 * through a `:target` panel that returns the reader to the same place.
 *
 * Contract: briefs/2026-11-05-brief-html-package.md
 *
 * This is a COMPOSITOR, and compositing belongs to the environment
 * (AGENTS.md, three concerns). It lives in `scripts/` and imports okuda's
 * exports; the binary's contract — markdown in, coloured bytes out — is
 * unchanged. There is no `--html` flag, and there will not be one.
 *
 * The emitter is `Bun.markdown.html()`. Two shortcuts were measured and are
 * closed: `html()` ignores a handlers argument, and `render()` with partial
 * handlers falls back to plain text, not HTML. So: `html()` plus post-passes.
 *
 * Order is not arbitrary. Maths is a PRE-pass on the source — the glyphs are
 * text substitutions and must land before the parser sees them, exactly as
 * `renderDocument` does it. State glyphs are a POST-pass — they need elements,
 * and they must not touch `<pre>` or `<code>`.
 *
 * Usage:  bun scripts/html-package.ts <file.md> [-o out.html]
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";
import {
  applyMathGlyphs,
  classifyChar,
  extractDiagramArt,
  RE_CITED_PATH,
  STATE_GLYPH_ROLE,
} from "../src/render.ts";
import { loadCallsigns, resolveAmongCallsigns, siloRoot } from "../src/root.ts";
import palette from "../src/palettes/okuda.json" with { type: "json" };

// ── The palette, derived not specified ────────────────────────────────
//
// The 25 roles come from src/palettes/okuda.json, never from a hand-copied
// table: a second list is a second thing to drift. An empty value means
// "emit nothing, inherit the glass's own" — so it becomes no custom
// property at all, and the stylesheet's `var(--okuda-body, …)` fallback
// does the inheriting.

function paletteVars(): string {
  const lines: string[] = [];
  for (const [role, hex] of Object.entries(palette as Record<string, string>)) {
    if (!hex) continue; // empty = no ink; the glass supplies it
    lines.push(`  --okuda-${role}: ${hex};`);
  }
  return `:root {\n${lines.join("\n")}\n}`;
}

// ── The mermaid pipe ──────────────────────────────────────────────────
//
// The binary is the environment's, not ours: okuda never parses mermaid.
// Same candidates as src/render.ts:208-211, and the same channel — the
// engine reads its canvas width from $COLUMNS.

const MERMAID_BIN_CANDIDATES = [
  `${process.env.HOME ?? ""}/.local/bin/mermaid-to-md`,
  "mermaid-to-md",
];

async function mermaidArt(source: string, width: number): Promise<string | null> {
  for (const bin of MERMAID_BIN_CANDIDATES) {
    try {
      const proc = Bun.spawn([bin], {
        stdin: "pipe",
        stdout: "pipe",
        stderr: "pipe",
        env: { ...process.env, COLUMNS: String(width) },
      });
      const outP = new Response(proc.stdout).text();
      const errP = new Response(proc.stderr).text();
      proc.stdin.write(source);
      proc.stdin.end();
      const [out] = await Promise.all([outP, errP]);
      const code = await proc.exited;
      if (code === 0 && out.trim().length > 0) return extractDiagramArt(out);
    } catch {
      // No such binary on this candidate — try the next.
    }
  }
  return null;
}

// ── Post-pass 1: mermaid fences → ASCII art ───────────────────────────
//
// `html()` emits `<pre><code class="language-mermaid">…</code></pre>` with
// the body HTML-escaped, so the fence is unescaped before it reaches the
// engine and the art is escaped again on the way out.

const RE_MERMAID_FENCE =
  /<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/g;

function unescapeHtml(s: string): string {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Colour the art by channel, run-length: borders recede, arrows lead, text
 *  sits in the foreground. `classifyChar` is okuda's own classifier, so the
 *  HTML and the terminal cannot disagree about what a border is. */
function paintDiagram(art: string): string {
  return art
    .split("\n")
    .map((line) => {
      if (line.trim() === "") return "";
      let out = "";
      let current: string | null = null;
      let run = "";
      const flush = () => {
        if (current === null || run === "") return;
        out += `<span class="diagram-${current}">${escapeHtml(run)}</span>`;
      };
      for (const ch of line) {
        const channel = classifyChar(ch);
        if (channel !== current) {
          flush();
          current = channel;
          run = ch;
        } else {
          run += ch;
        }
      }
      flush();
      return out;
    })
    .join("\n");
}

async function mermaidPass(html: string, width: number): Promise<string> {
  const fences = [...html.matchAll(RE_MERMAID_FENCE)];
  if (fences.length === 0) return html;
  const arts = await Promise.all(
    fences.map((m) => mermaidArt(unescapeHtml(m[1]!), width)),
  );
  let i = 0;
  return html.replace(RE_MERMAID_FENCE, () => {
    const art = arts[i++];
    if (art === null) {
      // The engine declined. Say so rather than showing the source as if it
      // were the diagram — the same honesty the terminal's receipt carries.
      return `<figure class="diagram"><span class="diagram-text">⋮ mermaid-to-md declined</span></figure>`;
    }
    return `<figure class="diagram">${paintDiagram(art)}</figure>`;
  });
}

// ── Post-pass 2: state glyphs → spans ─────────────────────────────────
//
// CSS cannot colour a character. The renderer colours ✓ green because ✓ is
// in a set (src/render.ts:117); in HTML that set becomes a span, and the set
// is already a map from glyph to palette role. Skip `<pre>` and `<code>`:
// a glyph inside a fence is art, not a state.

const RE_PROTECTED = /(<pre[\s\S]*?<\/pre>|<code[\s\S]*?<\/code>)/g;

function stateGlyphPass(html: string): string {
  const glyphs = Object.keys(STATE_GLYPH_ROLE);
  if (glyphs.length === 0) return html;
  const re = new RegExp(`(${glyphs.map((g) => g.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "g");
  return html
    .split(RE_PROTECTED)
    .map((part, i) => {
      // Odd indices are the protected regions, by construction of the split.
      if (i % 2 === 1) return part;
      return part.replace(re, (g) => {
        const role = STATE_GLYPH_ROLE[g];
        return role ? `<span class="state-${role.replace(/^state-/, "")}">${g}</span>` : g;
      });
    })
    .join("");
}

// ── Post-pass 3: bare .md paths → the doc-ref gold ────────────────────
//
// The address is the path; the line is prose. The gold stops at the
// extension, so a `:1396` after it stays plain (ADR-LINE-IS-PROSE-078).
// Skip tags and protected regions: a path inside an href is already an
// address and must not be gilded twice.

function docRefPass(html: string): string {
  return html
    .split(RE_PROTECTED)
    .map((part, i) => {
      if (i % 2 === 1) return part;
      // Split on tags so a path inside an attribute is never touched.
      return part
        .split(/(<[^>]*>)/)
        .map((seg, j) => (j % 2 === 1 ? seg : seg.replace(RE_CITED_PATH, (p) => `<span class="doc-ref">${p}</span>`)))
        .join("");
    })
    .join("");
}

// ── The dereference layer ─────────────────────────────────────────────
//
// An address line is a paragraph that is nothing but `path §NN` — the
// renderer's own distinction (RE_ADDRESS_LINE, src/render.ts:78). It is a
// block, so it can carry a panel. A silcrow mid-sentence cannot: `<details>`
// and `<section>` are flow content and cannot sit inside a `<p>`, so an
// inline silcrow stays a link. The content model reached that verdict.

// Both authored orders, as the renderer's own RE_ADDRESS_LINE accepts them
// (src/render.ts:78): `§NN path` and `path §NN`. Anchored at both ends, so a
// silcrow mid-sentence stays prose — and stays a link, because a `<section>`
// cannot sit inside a `<p>`.
const RE_ADDRESS_LINE_HTML =
  /<p>(?:§(\d{1,2})\s+([\w][\w/.-]*\.md)|([\w][\w/.-]*\.md)\s+§(\d{1,2}))<\/p>/g;

interface Ref {
  num: string;
  path: string;
  id: string;
  title: string;
  callsign: string | null;
  body: string;
}

function panel(r: Ref): string {
  return `<section class="deref" id="${r.id}"><a class="deref-close" href="#_">close</a>${r.body}</section>`;
}

// ── The template ──────────────────────────────────────────────────────

function template(title: string, css: string, body: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>
${css}
</style>
</head>
<body>
<main>
${body}
</main>
</body>
</html>
`;
}

// ── Main ──────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const input = args.find((a) => !a.startsWith("-"));
if (!input) {
  console.error("usage: bun scripts/html-package.ts <file.md> [-o out.html]");
  process.exit(2);
}
const outIdx = args.indexOf("-o");
const outPath = outIdx >= 0 ? args[outIdx + 1]! : input.replace(/\.md$/, ".html");
// The silo root, when the document does not sit inside one (a fixture in a
// temp directory, a document published from elsewhere). Defaults to the
// document's own silo.
const rootIdx = args.indexOf("--root");
const rootOverride = rootIdx >= 0 ? args[rootIdx + 1] : undefined;

const WIDTH = 79; // the authoring contract's top rung

const source = readFileSync(input, "utf8");
const css = readFileSync(new URL("./html-package.css", import.meta.url), "utf8");

// PRE-pass: maths glyphs, before the parser sees them.
const withMath = applyMathGlyphs(source);

// The emitter.
let html = Bun.markdown.html(withMath);

// POST-passes, in order: fences first (they introduce protected regions),
// then glyphs, then address lines — and the doc-ref gold LAST, because it
// would otherwise gild the path inside an address line and break the match.
html = await mermaidPass(html, WIDTH);
html = stateGlyphPass(html);

// The dereference layer: resolve each address line, render the target once,
// emit a receipt in the flow and a panel holding the full render.
// The path substrate, anchored the way actuation resolves a target: the
// document's own directory first, the silo root second (makePathValidator,
// src/root.ts:280 — "resolveJumpTarget's HTML semantics"). One rule, so the
// package and the terminal cannot disagree about where an address lands.
const docDir = dirname(resolve(input));
const root = rootOverride ? resolve(rootOverride) : siloRoot(docDir);
const anchors = [docDir, root];
const callsigns = loadCallsigns(root);
const refs = new Map<string, Ref>();
for (const m of html.matchAll(RE_ADDRESS_LINE_HTML)) {
  const num = m[1] ?? m[4];
  const path = m[2] ?? m[3];
  const target = anchors.map((a) => resolve(a, path!)).find((p) => existsSync(p));
  if (!target) continue; // unresolvable — leave the address as prose, honestly
  let body: string;
  try {
    body = Bun.markdown.html(applyMathGlyphs(readFileSync(target, "utf8")));
  } catch {
    continue;
  }
  const id = `ref-${num}`;
  if (refs.has(id)) continue;
  const title =
    body.match(/<h1>([\s\S]*?)<\/h1>/)?.[1]?.replace(/<[^>]*>/g, "") ??
    basename(path!);
  // The panel is a document and must look like one: the same glyph and
  // address passes, so a ✓ in a panel is green and a path is gold. What it
  // does NOT get is the address-line pass — its own silcrows stay prose,
  // because the bound is the design and `:target` is singular.
  refs.set(id, {
    num: num!,
    path: path!,
    id,
    title,
    callsign: resolveAmongCallsigns(callsigns, `ADR-${num}`) ? `ADR-${num}` : null,
    body: docRefPass(stateGlyphPass(body)),
  });
}

// Replace each address line with a receipt that opens its panel. The panel
// itself is appended at the end of the document, off-screen until :target.
html = html.replace(RE_ADDRESS_LINE_HTML, (whole, a: string, b: string, c: string, d: string) => {
  const num = a ?? d;
  const r = refs.get(`ref-${num}`);
  if (!r) return whole;
  return `<p><a class="receipt" href="#${r.id}"><span class="receipt-title">§${r.num} ${escapeHtml(r.title)}</span> <span class="receipt-meta">${escapeHtml(r.callsign ?? r.path)}</span></a></p>`;
});

html = docRefPass(html);

const panels = [...refs.values()].map(panel).join("\n");
const title = source.match(/^#\s+(.+)$/m)?.[1] ?? basename(input, ".md");

writeFileSync(
  outPath,
  template(title, `${paletteVars()}\n\n${css}`, `${html}\n${panels}`),
);
console.log(`${outPath} — ${refs.size} reference(s), ${(readFileSync(outPath).length / 1024).toFixed(1)} KiB`);
