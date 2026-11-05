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
import { basename, dirname, relative, resolve } from "node:path";
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
import { artefactName, splitFrontMatter } from "./html-naming.ts";

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

// ── Post-pass 1b: code fences → chroma, as HTML ───────────────────────
//
// The terminal pipes every tagged fence through chroma with
// `--formatter terminal16 --style monokai`: the tool classifies, the
// terminal themes (BRF-FENCE-COLOUR). The page does the same with a
// different formatter — `--formatter html --html-only` — so there is ONE
// classifier and two output formats, not two highlighters that disagree
// about what a keyword is.
//
// A JavaScript highlighter was the obvious alternative and is refused on
// two counts. It is a second classifier, which is the defect this week
// wrote down twice (the substrate implemented twice has half the rules in
// each). And it is a runtime: Shiki's grammars are megabytes, so the
// artefact would either fetch them — breaking the one property it has —
// or carry them, which is a different artefact. Chroma runs at build time
// and the page stays static.

const CHROMA_BIN = "chroma";

/** chroma's alias table, parsed once. chroma never rejects an unknown
 *  --lexer: it falls back to plaintext, colours it white, and exits 0. So
 *  "an unknown tag renders as today" is reachable only by knowing the
 *  table (src/render.ts:1013, the same rule). */
let chromaAliases: Set<string> | undefined;

async function getChromaAliases(): Promise<Set<string> | null> {
  if (chromaAliases !== undefined) return chromaAliases;
  try {
    const proc = Bun.spawn([CHROMA_BIN, "--list"], {
      stdin: "ignore",
      stdout: "pipe",
      stderr: "pipe",
    });
    const out = await new Response(proc.stdout).text();
    await proc.exited;
    const set = new Set<string>();
    for (const m of out.matchAll(/^ {4}aliases:[ \t]*([^\n]*)$/gm)) {
      for (const a of m[1]!.split(/\s+/)) if (a) set.add(a);
    }
    if (set.size > 0) chromaAliases = set;
    return set.size > 0 ? set : null;
  } catch {
    return null;
  }
}

async function chromaHtml(tag: string, code: string): Promise<string | null> {
  try {
    const proc = Bun.spawn(
      [
        CHROMA_BIN,
        "--formatter", "html",
        "--html-only",
        "--html-prevent-surrounding-pre",
        "--html-prefix", "ok-",
        "--lexer", tag,
      ],
      { stdin: "pipe", stdout: "pipe", stderr: "pipe" },
    );
    proc.stdin.write(code);
    proc.stdin.end();
    const out = await new Response(proc.stdout).text();
    const code2 = await proc.exited;
    return code2 === 0 && out.trim() !== "" ? out : null;
  } catch {
    return null;
  }
}

const RE_CODE_FENCE = /<pre><code class="language-([\w+#.-]+)">([\s\S]*?)<\/code><\/pre>/g;

async function codeFencePass(html: string): Promise<string> {
  const fences = [...html.matchAll(RE_CODE_FENCE)];
  if (fences.length === 0) return html;
  const aliases = await getChromaAliases();
  const painted = await Promise.all(
    fences.map((m) => {
      const tag = m[1]!.toLowerCase();
      // No table, or a tag the table does not know: the plain fence stands.
      if (aliases === null || !aliases.has(tag)) return Promise.resolve(null);
      return chromaHtml(tag, unescapeHtml(m[2]!));
    }),
  );
  let i = 0;
  return html.replace(RE_CODE_FENCE, (whole) => {
    const out = painted[i++];
    // chroma's output is already escaped; it must not be escaped again.
    return out === null ? whole : `<pre class="code"><code>${out}</code></pre>`;
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

// ── Post-pass 4: a rule before a heading is redundant ─────────────────
//
// Measured across the corpus 2026-11-05: 656 thematic breaks outside front
// matter, and **603 of them (92%) are immediately followed by a heading**.
// The heading is the structure; the rule in front of it is a second
// statement of the same break, drawn at a weight the terminal never gives
// it (there it is box-drawing glyphs at text weight, here a 1px line across
// the full measure). The 53 that are not followed by a heading are real
// breaks and stay.

const RE_HR_BEFORE_HEADING = /<hr\s*\/?>\s*(?=<h[1-6][\s>])/gi;

function redundantHrPass(html: string): string {
  return html.replace(RE_HR_BEFORE_HEADING, "");
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
  displayPath: string;
  num: string | null;
  title: string;
  callsign: string | null;
  body: string;
}

function slug(path: string): string {
  return basename(path, ".md").replace(/[^a-z0-9]+/gi, "-").toLowerCase();
}

/** The panel's chrome: the identity run the terminal carries in its footer —
 *  the mark, the callsign, the filename — made sticky, because a scrolled
 *  panel otherwise has no identity at all. The browser tab still names the
 *  MAIN document, so without this the reader is inside a document that
 *  nothing on screen names. */
function panel(r: Ref): string {
  const mark = r.num ? `<span class="deref-mark">§${r.num}</span>` : "";
  const callsign = r.callsign
    ? `<span class="deref-callsign">${escapeHtml(r.callsign)}</span>`
    : "";
  // The spaces between the spans are for textContent — a copy-paste of the
  // identity run should read as words, not as a run-together token. The
  // visual gap is the flex `gap`, so the spaces cost nothing on screen.
  return `<section class="deref" id="${r.id}"><header class="deref-chrome"><span class="deref-id">${mark} ${callsign} <span class="deref-path">${escapeHtml(r.displayPath)}</span></span><a class="deref-close" href="#_">close</a></header><div class="deref-body">${r.body}</div></section>`;
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
  source: string,
): string {
  const prov = provenance
    ? `<p class="provenance">Published from <a href="${escapeHtml(provenance.url)}">${escapeHtml(provenance.title)}</a></p>\n`
    : "";
  return `<!doctype html>
<!-- source: ${escapeHtml(source)} -->
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
// The panel budget. Two limits, because they measure different things:
//
//   - BYTES is the cost. A panel is a document, and documents differ in
//     size by an order of magnitude: measured 2026-11-05, decisions/index.md
//     costs 9.4 KiB per panel and docs/2026-10-12-the-squint-test.md costs
//     18.5 KiB, so a count of 24 is 226 KiB in one case and 388 KiB in the
//     other. A count is a proxy that does not track what it proxies.
//   - COUNT is the backstop, for a document that cites a hundred stubs.
//
// Both are reported when they bite. A dropped reference looks exactly like
// an unresolvable one, so silence here is the defect the package keeps
// finding elsewhere.
const maxPanels = Number(flag("--max-panels") ?? 200);
const maxBytes = Number(flag("--max-bytes") ?? 2 * 1024 * 1024);

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
// The name, from the one function that owns the rule — the batch gate
// predicts this exact answer, so a second copy here would make the gate lie.
const finalPath = outPath ?? resolve("html", artefactName(input, meta));
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
html = await codeFencePass(html);
html = stateGlyphPass(html);
html = redundantHrPass(html);

const refs = new Map<string, Ref>(); // id → ref
const byPath = new Map<string, string>(); // resolved path → id
// The budget's survivors and casualties. A cap that drops a reference must
// SAY so: a dropped reference looks exactly like an unresolvable one —
// gold text, no link — and silence is the failure mode this package keeps
// finding (the quiet citation, the stale glyph, the too-wide heading).
let panelBytes = 0;
let droppedByCap = 0;
const droppedPaths = new Set<string>();

// The document's own path, resolved once, for the self-exclusion below.
const SELF = resolve(input);

function resolveTarget(ref: string): string | null {
  // A path — markdown or code. The filesystem is the substrate for both
  // (ADR-045), and a code file is a document the terminal renders too
  // (wrapWholeFile, src/render.ts:1175).
  if (ref.includes("/") || /\.(md|ts|rs|sh|py)$/.test(ref)) {
    const hit =
      anchors.map((a) => resolve(a, ref)).find((p) => existsSync(p)) ??
      archiveAnchors.map((a) => resolve(a, ref)).find((p) => existsSync(p));
    // A document citing itself mints nothing: the reader is already there,
    // and a panel holding the page you are standing on is a recursive
    // mystery tour with no rainbow at the end. The terminal retired this
    // with makeSelfExclusion (src/root.ts:305); the package had no such
    // rule, and docs/showcase.md — which names its own path in its first
    // paragraph — grew a panel containing a copy of itself.
    if (hit && resolve(hit) === SELF) return null;
    if (hit) return hit;
  }
  // A callsign, gated by the registry (ADR-044) — the same gate the
  // terminal's scan applies, so the paint and the link cannot disagree.
  return resolveAmongCallsigns(callsigns, ref);
}

function addRef(path: string, num: string | null): string | null {
  const existing = byPath.get(path);
  if (existing) return existing;
  if (refs.size >= maxPanels || panelBytes >= maxBytes) {
    if (!byPath.has(path)) {
      droppedByCap++;
      droppedPaths.add(path);
    }
    byPath.set(path, ""); // remember the casualty, don't recount
    return null;
  }
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
    displayPath: relative(root, path) || path,
    num,
    title,
    callsign: callsigns.find((c) => c.path === path)?.callsign ?? null,
    body: docRefPass(stateGlyphPass(redundantHrPass(body))),
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
  // A callsign is not a path. In the terminal a callsign stays in prose ink
  // and the ACTUATION is a rose `§NN` badge painted after it; painting the
  // callsign gold borrowed the path's register and painted an uppercase
  // identifier in the address colour, which is the one thing the style guide
  // says the gold is for. So: prose ink, quiet rule, no badge (the rule is
  // the affordance in a medium that has no cursor).
  out = out.replace(RE_CALLSIGN, (c) => {
    const target = resolveTarget(c);
    if (!target) return c;
    const id = addRef(target, null);
    return id ? `<a class="ref-callsign" href="#${id}">${c}</a>` : c;
  });
  return out;
});

// 4. Whatever is left is an address with no target: gold, not a link.
html = docRefPass(html);

// A panel is a document and gets the same passes as one — including the
// code colour. It did not, and the operator saw it: every code-file panel
// rendered in a single colour while the main document's fences were
// painted. The pass is last because it only touches `<pre><code
// class="language-…">`, which the glyph and address passes skip.
for (const r of refs.values()) {
  r.body = await codeFencePass(r.body);
}
// The budget is measured AFTER the code pass, because colouring is what
// makes a code panel expensive: chroma's spans tripled the showcase's
// panels (176 KiB to 519 KiB). A budget that measured the uncoloured body
// would be measuring the wrong artefact — the same mistake as counting
// panels instead of bytes.
panelBytes = [...refs.values()].reduce((n, r) => n + r.body.length, 0);

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
if (existsSync(finalPath)) {
  const prior = readFileSync(finalPath, "utf8")
    .slice(0, 400)
    .match(/<!-- source: ([\s\S]*?) -->/)?.[1];
  if (prior && prior !== input) {
    console.warn(
      `  ! ${finalPath} was built from ${prior} and is about to be overwritten by ${input}.`,
    );
    console.warn(
      `    Two documents, one artefact name. Rename one, or pass -o.`,
    );
  }
}
writeFileSync(
  finalPath,
  template(title, css, `${html}\n${panels}`, byline, provenance, input),
);

const kib = (readFileSync(finalPath).length / 1024).toFixed(1);
const panelsKib = (panelBytes / 1024).toFixed(0);
console.log(
  `${finalPath} — ${refs.size} panel(s) (${panelsKib} KiB of panel), ${kib} KiB total`,
);
if (droppedByCap > 0) {
  console.warn(
    `  ! ${droppedByCap} reference(s) dropped by the budget — left as prose, indistinguishable from an unresolvable one.`,
  );
  console.warn(
    `    budget: ${maxPanels} panels / ${(maxBytes / 1024).toFixed(0)} KiB; used ${refs.size} panels / ${(panelBytes / 1024).toFixed(0)} KiB.`,
  );
}
