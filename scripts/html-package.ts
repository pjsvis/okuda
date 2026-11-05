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
 * Usage:
 *   bun scripts/html-package.ts <file.md> [-o out.html]
 *                                        [--root <dir>]
 *                                        [--source-url <url>]
 *                                        [--source-title <title>]
 *                                        [--max-panels <n>]
 */

import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";
import {
  applyMathGlyphs,
  classifyChar,
  extractDiagramArt,
  RE_CITED_PATH,
  STATE_GLYPH_ROLE,
  wrapWholeFile,
} from "../src/render.ts";
import { loadCallsigns, resolveAmongCallsigns, siloRoot } from "../src/root.ts";
import { styleBlock } from "./html-palette.ts";

// ── The document's own date ───────────────────────────────────────────
//
// A record's date is the date it was made, not the date it was copied.
// The front matter says so when it says anything; the source's first
// commit says so otherwise; the mtime is the last resort and is honest
// about being one.

function firstCommitDate(file: string): string | null {
  try {
    const p = Bun.spawnSync({
      cmd: ["git", "log", "--diff-filter=A", "--format=%ad", "--date=short", "--", file],
      stdout: "pipe",
      stderr: "pipe",
    });
    if (p.exitCode !== 0) return null;
    const lines = new TextDecoder().decode(p.stdout).trim().split("\n").filter(Boolean);
    return lines.at(-1) ?? null; // the oldest, i.e. the first commit
  } catch {
    return null;
  }
}

function mtimeDate(file: string): string {
  try {
    return statSync(file).mtime.toISOString().slice(0, 10);
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

// ── Front matter: use it, do not render it ────────────────────────────
//
// Every silo document carries YAML front matter, and `Bun.markdown.html()`
// renders it as a rule and a heading — a document publishing its own
// metadata. The fix is not to strip it but to spend it: the title becomes
// the `<title>` and the `<h1>`, the rest becomes the byline.

interface Meta {
  [key: string]: string;
}

function splitFrontMatter(source: string): { meta: Meta; body: string } {
  const m = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { meta: {}, body: source };
  const meta: Meta = {};
  for (const line of m[1]!.split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (kv) meta[kv[1]!] = kv[2]!.trim().replace(/^["']|["']$/g, "");
  }
  return { meta, body: source.slice(m[0].length) };
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
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** The inverse, for text read back out of generated HTML. A title
 *  containing `&lt;details&gt;` was escaped twice and rendered as
 *  `&amp;lt;details&amp;gt;` — the double-escape, 2026-11-05. */
function unescapeHtml(s: string): string {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
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
  const re = new RegExp(
    `(${glyphs.map((g) => g.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
    "g",
  );
  return html
    .split(RE_PROTECTED)
    .map((part, i) => {
      // Odd indices are the protected regions, by construction of the split.
      if (i % 2 === 1) return part;
      return part.replace(re, (g) => {
        const role = STATE_GLYPH_ROLE[g];
        return role
          ? `<span class="state-${role.replace(/^state-/, "")}">${g}</span>`
          : g;
      });
    })
    .join("");
}

// ── Text-node traversal ───────────────────────────────────────────────
//
// A reference is only a reference in prose. Inside a tag it is an attribute;
// inside `<a>` it is already a link; inside `<pre>` or `<code>` it is art or
// source. One traversal, so every pass agrees about what counts as text.

function transformText(html: string, fn: (text: string) => string): string {
  const parts = html.split(/(<[^>]*>)/);
  let inA = 0;
  let inPre = 0;
  return parts
    .map((p, i) => {
      if (i % 2 === 1) {
        if (/^<a\b/i.test(p)) inA++;
        else if (/^<\/a>/i.test(p)) inA = Math.max(0, inA - 1);
        // Fences, not spans: the renderer's scan skips fenced blocks and
        // treats a code span as prose (src/vectors.ts:220), so a callsign
        // in backticks is a reference in the terminal and is one here.
        else if (/^<pre\b/i.test(p)) inPre++;
        else if (/^<\/pre>/i.test(p)) inPre = Math.max(0, inPre - 1);
        return p;
      }
      if (inA > 0 || inPre > 0) return p;
      return fn(p);
    })
    .join("");
}

// ── Post-pass 3: bare .md paths → the doc-ref gold ────────────────────
//
// The address is the path; the line is prose. The gold stops at the
// extension, so a `:1396` after it stays plain (ADR-LINE-IS-PROSE-078).
// This runs LAST, on whatever the reference pass could not resolve: a path
// with no target is still an address, and it is still gold.

function docRefPass(html: string): string {
  return transformText(html, (text) =>
    text.replace(RE_CITED_PATH, (p) => `<span class="doc-ref">${p}</span>`),
  );
}

// ── The dereference layer ─────────────────────────────────────────────
//
// Two authored forms, and the renderer's own distinction between them
// (RE_ADDRESS_LINE, src/render.ts:78):
//
//   - an ADDRESS LINE is a paragraph that is nothing but `path §NN` — a
//     block, so it carries a receipt and a panel;
//   - an INLINE reference is a `.md` path or a callsign in prose — it
//     becomes a link to the same panel, because the panel is a sibling at
//     the end of the document and a `<section>` cannot sit inside a `<p>`.
//
// `§NN` on its own is NOT a reference: in the terminal it is a badge the
// renderer paints after a reference (src/vectors.ts), and in prose it is a
// section number. It stays text.

const RE_ADDRESS_LINE_HTML =
  /<p>(?:§(\d{1,2})\s+([\w][\w/.-]*\.md)|([\w][\w/.-]*\.md)\s+§(\d{1,2}))<\/p>/g;

const RE_CALLSIGN = /\b[A-Z]{3}(?:-[A-Z0-9]+)+\b/g;

interface Ref {
  id: string;
  path: string;
  num: string | null;
  title: string;
  callsign: string | null;
  body: string;
}

function slug(path: string): string {
  return basename(path, ".md").replace(/[^a-z0-9]+/gi, "-").toLowerCase();
}

function panel(r: Ref): string {
  return `<section class="deref" id="${r.id}"><a class="deref-close" href="#_">close</a>${r.body}</section>`;
}

// ── The template ──────────────────────────────────────────────────────

interface Provenance {
  url: string;
  title: string;
}

function template(
  title: string,
  css: string,
  body: string,
  byline: string,
  provenance: Provenance | null,
): string {
  const prov = provenance
    ? `<p class="provenance">Published from <a href="${escapeHtml(provenance.url)}">${escapeHtml(provenance.title)}</a></p>\n`
    : "";
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
${prov}${byline}
${body}
<footer class="terminator"><span class="rule"></span></footer>
</main>
<script>
/* The state of a package is: the main document, or one of its references.
 * A panel open is a VIEW of the same document, not a new page, so it must
 * not become a history entry — a back button that walks through
 * dereferences is a history of views, not of documents.
 *
 * Progressive enhancement, and only that: with this script absent the
 * hrefs still work and :target still opens the panel. What the script adds
 * is the address moving without the history growing — replaceState
 * changes the URL, and a class carries the state because replaceState
 * does not re-fire :target. */
(() => {
  const panels = [...document.querySelectorAll('.deref')];
  const show = (id) => {
    for (const p of panels) p.classList.toggle('is-open', p.id === id);
    const base = location.href.split('#')[0];
    try {
      history.replaceState(null, '', id ? base + '#' + id : base);
    } catch {
      /* file:// or a sandboxed origin refuses replaceState — the panel
         still opens and closes; only the address does not follow. */
    }
  };
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href').slice(1);
    if (id === '_') { e.preventDefault(); show(null); return; }
    if (!document.getElementById(id)) return; /* not a panel: leave it */
    e.preventDefault();
    show(id);
  });
  const h = location.hash.slice(1);
  if (h && document.getElementById(h)) show(h);
})();
</script>
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
const flag = (name: string): string | undefined => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};

// The artefact directory. A separate folder is the test of file
// independence: if the package needs anything beside it, it fails here.
const outPath = flag("-o");
const rootOverride = flag("--root");
const provenanceUrl = flag("--source-url");
const provenanceTitle = flag("--source-title");
const maxPanels = Number(flag("--max-panels") ?? 24);

const WIDTH = 79; // the authoring contract's top rung

const raw = readFileSync(input, "utf8");
const { meta, body: source } = splitFrontMatter(raw);

// The date prefix. A document of record is static: re-publishing it means
// publishing the same document under the same name, and a different name
// means a different document. So the date is the document's OWN, never the
// publication date — a name that moved every day would make one document
// look like a series.
//
// Derived, in order: the front matter's `date`; the source's first commit
// (the document's birth, which is what a record's date is); the file's
// mtime. A name that already carries an ISO date keeps it — the corpus is
// date-first, and prefixing again would say the date twice.
const stem = basename(input, ".md");
const datePrefix = meta.date ?? firstCommitDate(input) ?? mtimeDate(input);
const named = /^\d{4}-\d{2}-\d{2}-/.test(stem) ? stem : `${datePrefix}-${stem}`;
const finalPath = outPath ?? resolve("html", `${named}.html`);
const css = styleBlock();

// The path substrate, anchored the way actuation resolves a target: the
// document's own directory first, the silo root second (makePathValidator,
// src/root.ts:280 — "resolveJumpTarget's HTML semantics"). One rule, so the
// package and the terminal cannot disagree about where an address lands.
const docDir = dirname(resolve(input));
const root = rootOverride ? resolve(rootOverride) : siloRoot(docDir);
// Three anchors, in the order actuation uses, plus one the terminal does not
// have: the archive. A brief that lands is `git mv`d to `.archive/briefs/`,
// and every document that cites it keeps the citation — so a resolver that
// does not look in the archive breaks every citation the moment a brief is
// filed. Found 2026-11-05: ADR-PANEL-NOT-DOOR-081's own Related section
// pointed at a brief that had just been archived, and the link went quiet.
const anchors = [docDir, root];
const archiveAnchors = [docDir, root].map((a) => resolve(a, ".archive"));
const callsigns = loadCallsigns(root);

// PRE-pass: maths glyphs, before the parser sees them.
let html = Bun.markdown.html(applyMathGlyphs(source));

// POST-passes, in order: fences first (they introduce protected regions),
// then glyphs, then references — and the doc-ref gold LAST, because it
// would otherwise gild the path inside a reference and break the match.
html = await mermaidPass(html, WIDTH);
html = stateGlyphPass(html);

const refs = new Map<string, Ref>(); // id → ref
const byPath = new Map<string, string>(); // resolved path → id

function resolveTarget(ref: string): string | null {
  // A path — markdown or code. The filesystem is the substrate for both
  // (ADR-045), and a code file is a document the terminal renders too
  // (wrapWholeFile, src/render.ts:1175).
  if (ref.includes("/") || /\.(md|ts|rs|sh|py)$/.test(ref)) {
    const hit =
      anchors.map((a) => resolve(a, ref)).find((p) => existsSync(p)) ??
      archiveAnchors.map((a) => resolve(a, ref)).find((p) => existsSync(p));
    if (hit) return hit;
  }
  // A callsign, gated by the registry (ADR-044) — the same gate the
  // terminal's scan applies, so the paint and the link cannot disagree.
  return resolveAmongCallsigns(callsigns, ref);
}

function addRef(path: string, num: string | null): string | null {
  const existing = byPath.get(path);
  if (existing) return existing;
  if (refs.size >= maxPanels) return null;
  let body: string;
  try {
    const text = readFileSync(path, "utf8");
    // A code file is not markdown. The terminal renders it as a document —
    // one fence, its comments as prose (wrapWholeFile, src/render.ts:1175) —
    // so the panel does the same rather than parsing TypeScript as markdown.
    body = Bun.markdown.html(
      applyMathGlyphs(
        path.endsWith(".md")
          ? splitFrontMatter(text).body
          : wrapWholeFile(path, text),
      ),
    );
  } catch {
    return null;
  }
  const id = num ? `ref-${num}` : `ref-${slug(path)}`;
  const title = unescapeHtml(
    body.match(/<h1>([\s\S]*?)<\/h1>/)?.[1]?.replace(/<[^>]*>/g, "") ??
      basename(path, ".md"),
  );
  // The panel is a document and must look like one: the same glyph and
  // address passes, so a ✓ in a panel is green and a path is gold. What it
  // does NOT get is the reference pass — its own references stay prose,
  // because the bound is the design and `:target` is singular.
  refs.set(id, {
    id,
    path,
    num,
    title,
    callsign: callsigns.find((c) => c.path === path)?.callsign ?? null,
    body: docRefPass(stateGlyphPass(body)),
  });
  byPath.set(path, id);
  return id;
}

// 1. Address lines: the declared references. They carry the number, so they
//    mint the readable ids (`#ref-27`) that a blog post can deep-link to.
html = html.replace(
  RE_ADDRESS_LINE_HTML,
  (whole, a: string, b: string, c: string, d: string) => {
    const num = a ?? d;
    const path = b ?? c;
    const target = resolveTarget(path!);
    if (!target) return whole;
    const id = addRef(target, num!);
    if (!id) return whole;
    const r = refs.get(id)!;
    return `<p><a class="receipt" href="#${id}"><span class="receipt-title">§${r.num} ${escapeHtml(r.title)}</span> <span class="receipt-meta">${escapeHtml(r.callsign ?? r.path)}</span></a></p>`;
  },
);

// 2. Explicit markdown links to a local document. `[showcase](showcase.md)`
//    is the author's deliberate claim, and in a single-file package a
//    relative href would 404 — the file is not beside it. So the link
//    becomes a panel link, which is the same claim kept.
const RE_MD_LINK_HTML = /<a href="([^"#:][^"]*\.md)">/g;
html = html.replace(RE_MD_LINK_HTML, (whole, href: string) => {
  const target = resolveTarget(decodeURIComponent(href));
  if (!target) return whole;
  const id = addRef(target, null);
  return id ? `<a class="doc-ref" href="#${id}">` : whole;
});

// 3. Inline references: a `.md` path or a callsign in prose becomes a link
//    to the same panel. This is what makes a blog post work — its
//    references are inline, not address lines.
html = transformText(html, (text) => {
  let out = text.replace(RE_CITED_PATH, (p) => {
    const target = resolveTarget(p);
    if (!target) return p;
    const id = addRef(target, null);
    return id ? `<a class="doc-ref" href="#${id}">${p}</a>` : p;
  });
  out = out.replace(RE_CALLSIGN, (c) => {
    const target = resolveTarget(c);
    if (!target) return c;
    const id = addRef(target, null);
    return id ? `<a class="doc-ref" href="#${id}">${c}</a>` : c;
  });
  return out;
});

// 4. Whatever is left is an address with no target: gold, not a link.
html = docRefPass(html);

const panels = [...refs.values()].map(panel).join("\n");

// The title: front matter, then the H1, then the filename.
const h1 = unescapeHtml(
  html.match(/<h1>([\s\S]*?)<\/h1>/)?.[1]?.replace(/<[^>]*>/g, "") ?? "",
);
const title = meta.title ?? (h1 || basename(input, ".md"));

// The byline. The callsign is the document's registered name — from the
// front matter, or from the registry when the front matter omits it. A
// publication has to say what it is, and the callsign is the address
// every other document in the corpus uses for it.
const registered = callsigns.find(
  (c) => resolve(root, c.path) === resolve(input),
)?.callsign;
const bylineBits = [meta.callsign ?? registered, meta.type, meta.date].filter(Boolean);
const byline = bylineBits.length
  ? `<p class="byline">${bylineBits.map(escapeHtml).join(" · ")}</p>\n`
  : "";

const provenance =
  provenanceUrl && provenanceTitle
    ? { url: provenanceUrl, title: provenanceTitle }
    : null;

mkdirSync(dirname(finalPath), { recursive: true });
writeFileSync(
  finalPath,
  template(title, css, `${html}\n${panels}`, byline, provenance),
);

const kib = (readFileSync(finalPath).length / 1024).toFixed(1);
console.log(
  `${finalPath} — ${refs.size} panel(s)${refs.size >= maxPanels ? ` (cap ${maxPanels})` : ""}, ${kib} KiB`,
);
