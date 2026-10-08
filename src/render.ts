/**
 * render.ts — Bun.markdown custom handlers: grammar → ansi + wrap.
 *
 * Two additional contracts land here (brief 003):
 *  (a) Mermaid fences intercepted pre-render, piped to `mermaid-to-md`
 *      via Bun.spawn, classified into border/arrow/text channels and
 *      coloured per the palette (brief: diagram colour classification).
 *  (b) The table handler applies the uniform presentation layer — loose
 *      rows, no internal pipes, header rule kept, three-channel colour,
 *      alignment preserved, no provenance detection (brief: table policy).
 *
 * Bun.markdown (bun 1.3.8) callbacks are string-in/string-out and
 * post-order (children resolve before parents). Structure moves through
 * the string-tag protocol in grammar.ts (decisions/005): listItem
 * markers are assigned by the `list` handler, nested lists tag their
 * depth, never-wrapped blocks ride in RAW tags.
 */

import { type ColorMode, makeStyler, unwrapStrongSpan } from "./ansi";
import {
  PARSER_OPTIONS,
  RE_CODE_TOKEN,
  RE_DESCRIBED_TOKEN,
  RE_INLINE_HTML,
  RE_MERMAID_TOKEN,
  RE_PB_TAG,
  RE_RHS_TOKEN,
  RE_RHS_WIRE,
  TAG_ITEM,
  TAG_NESTED_CLOSE,
  TAG_PROBE_CLOSE,
  TAG_RAW_CLOSE,
  TAG_RHS_WIRE,
  codeToken,
  describedToken,
  mermaidToken,
  stripTags,
  tagNestedOpen,
  tagProbeOpen,
  tagRawOpen,
} from "./grammar";
import { loadPalette, type Palette } from "./palette";
import {
  displayWidth,
  padCenterDisplay,
  padDisplay,
  padStartDisplay,
} from "./width";
import { stripANSI, elideToWidth } from "./width";
import { wrapANSI } from "./wrap";

/** Left indent for list blocks, inside the content margin (Glow list level_indent). */
const LIST_INDENT = 2;

/** Inline vector paint — strip the token and any comment-wrapped path
 *  from a rendered child string, returning the remaining slug and the
 *  token number for bracket painting. Tolerant of the inline parser's
 *  mangling: the token may arrive with one or two percents per side.
 *  Two token kinds (ADR-031):
 *    - `%okuda-vector:NN%` — live: painted as a badge in the reserved
 *      vector role (the main document's derived jump map made visible).
 *    - `%okuda-rhs:NN%` — legacy (ADR-022, retired): stripped silently,
 *      no badge — the authored numbers are not honored.
 *  The jump map is derived from the *source* (vectors.ts); this only
 *  paints. Returns null when the child carries neither token. Pure. */
function stripVector(children: string): { slug: string; num: string; live: boolean } | null {
  const vec = children.match(/%{1,2}okuda-vector:(\d{1,2})%{1,2}/);
  const legacy = children.match(/%{1,2}okuda-rhs:(\d{1,2})%{1,2}/);
  const m = vec ?? legacy;
  if (!m) return null;
  const slug = children.replace(/%{1,2}okuda-(?:vector|rhs):(\d{1,2})%{1,2}/, "").replace(RE_INLINE_HTML, "").trim();
  return { slug, num: m[1]!, live: vec !== null };
}

/** The closed state-glyph vocabulary — lexicon-applied, not author-editable.
 *  The renderer colours a ✓ green because ✓ is in this set, not because
 *  an author can tag arbitrary text green. Extends ADR-015's alert
 *  discipline to the full traffic lamp. ◆ is NOT here — priority, not
 *  state; colouring it would collapse two axes. (brief:
 *  state-glyph-render-path.) */
const STATE_GLYPH_ROLE: Record<string, keyof Palette> = {
  "\u2713": "state-ok",      // ✓ done/shipped — green
  "\u2610": "state-todo",    // ☐ todo/pending — yellow
  "\u22ee": "state-parked",  // ⋮ parked/elided — orange
  "\u2717": "state-failed",  // ✗ rejected/failed — red (= alert)
};

/** If `text` begins with a state glyph (the closed set), colour + bold
 *  that leading glyph via its lexicon role; leave the rest unchanged.
 *  Detects the glyph after any leading ANSI SGR runs (inline-styled
 *  cells may carry SGR before the visible char) and splices the styled
 *  glyph over exactly the glyph — the leading runs are kept (they may
 *  be the enclosing style). The glyph's reset does NOT hand the
 *  enclosing style back for the tail: only the heading handler
 *  re-opens (keepHeading); the list-lead/table-cell tail is a
 *  recorded follow-up. Byte-idempotent: text already painted in
 *  this role (the inline paint got here first) returns unchanged.
 *  Pure; in none mode the colour drops but the weight survives
 *  (roleBold emits SGR 1). */
function styleStateGlyph(text: string, styler: ReturnType<typeof makeStyler>): string {
  if (text === "") return text;
  // Find the first visible char by skipping leading ANSI SGR sequences.
  const stripped = stripANSI(text);
  const first = [...stripped][0];
  if (first === undefined) return text;
  const role = STATE_GLYPH_ROLE[first];
  if (!role) return text;
  // Already painted in this role? The inline text() paint reached the
  // glyph before the list lead / table cell did — once is the lexicon.
  if (text.startsWith(styler.roleBoldOpen(role))) return text;
  // The glyph sits after any leading SGR runs (an enclosing style).
  // Splice over exactly the glyph — its own code-unit length, never one
  // byte at a run boundary: skipping one BYTE at the SGR decapitated
  // the escape and its body leaked as literal `[38;2;…` text while the
  // original glyph stayed (the list-lead fault, 2026-10-02).
  let glyphStart = 0;
  const re = /\x1b\[[0-9;]*m/g;
  for (;;) {
    re.lastIndex = glyphStart;
    const m = re.exec(text);
    if (!m || m.index !== glyphStart) break;
    glyphStart = m.index + m[0].length;
  }
  return text.slice(0, glyphStart) + styler.roleBold(role, first) + text.slice(glyphStart + first.length);
}

export interface RenderOptions {
  width: number;
  palette?: Palette;
  color?: ColorMode;
  /** Override mermaid binary path (default: ~/.local/bin/mermaid-to-md, then $PATH). */
  mermaidBin?: string;
  /** Override chroma binary path (default: $PATH lookup). */
  chromaBin?: string;
  /** Override diagram-describe binary path (default: $PATH lookup) —
   *  the seam a hermetic test needs: with the real binary on PATH the
   *  "absent binary" case would call a local model and hang. */
  describeBin?: string;
}

// ── Mermaid pipe ─────────────────────────────────────────────────────

const MERMAID_BIN_CANDIDATES = [
  `${process.env.HOME ?? ""}/.local/bin/mermaid-to-md`,
  "mermaid-to-md",
];

/** Run the mermaid binary; return its stdout (empty string on failure). */
async function spawnMermaid(source: string, opts: RenderOptions): Promise<string> {
  const candidates = opts.mermaidBin
    ? [opts.mermaidBin]
    : MERMAID_BIN_CANDIDATES;
  for (const bin of candidates) {
    try {
      const proc = Bun.spawn([bin], {
        stdin: "pipe",
        stdout: "pipe",
        stderr: "pipe",
      });
      proc.stdin.write(source);
      proc.stdin.end();
      const out = await new Response(proc.stdout).text();
      const code = await proc.exited;
      if (code === 0 && out.trim().length > 0) return out;
    } catch {
      // try next candidate
    }
  }
  return "";
}

/** Pipe mermaid source to diagram-describe for a prose description
 *  (BRF-DIAGRAM-DESCRIBE). Same contract as spawnMermaid: source in,
 *  text out. Falls back to empty on missing binary or failure. */
async function spawnDescribe(source: string, opts: RenderOptions): Promise<string> {
  const bin = opts.describeBin ?? "diagram-describe";
  try {
    const proc = Bun.spawn([bin], {
      stdin: "pipe",
      stdout: "pipe",
      stderr: "pipe",
    });
    proc.stdin.write(source);
    proc.stdin.end();
    const out = await new Response(proc.stdout).text();
    const code = await proc.exited;
    if (code === 0 && out.trim().length > 0) return out.trim();
  } catch {
    // binary absent or failed — graceful degradation
  }
  return "";
}

/** Extract the ASCII art from the binary's output (the ```text fence). */
export function extractDiagramArt(binaryOutput: string): string {
  const m = binaryOutput.match(/```text\n([\s\S]*?)\n?```/);
  if (!m) return binaryOutput;
  // The binary pads the fence with blank lines — trim them (structural
  // padding, not art content; interior blank lines survive).
  return m[1]!.replace(/^\n+/, "").replace(/\n+$/, "");
}


// ── Diagram colour classification (brief: diagram-colour-classification)
//
// Border: box-drawing rails — structure, they recede.
// Arrow: the Unicode flow glyphs the engine emits (never ASCII ^v><,
// which false-positive on labels like `v2.0` or `x > 5`).
// Text: everything else.

const BORDER_CHARS = new Set(
  "─│┌┐└┘├┤┬┴┼╭╮╰╯╌╍═║╔╗╚╝╠╣╦╩╬".split(""),
);
const ARROW_CHARS = new Set(
  "▲▼◄►▶◁△▽◤◥◣◐◑●×✕".split(""),
);

export type DiagramChannel = "border" | "arrow" | "text";

export function classifyChar(ch: string): DiagramChannel {
  if (BORDER_CHARS.has(ch)) return "border";
  if (ARROW_CHARS.has(ch)) return "arrow";
  return "text";
}

/** Classify an ASCII diagram line into channel runs; colour per palette. */
export function classifyDiagramLine(
  line: string,
  palette: Palette,
  color: ColorMode,
): string {
  if (color === "none") return line;
  let out = "";
  let current: DiagramChannel | null = null;
  let run = "";
  const emitRun = (): void => {
    if (current === null || run === "") return;
    const role =
      current === "border"
        ? "diagram-border"
        : current === "arrow"
          ? "diagram-arrow"
          : "diagram-text";
    out += palette[role] ? colorFg(palette[role], run) : run;
  };
  for (const ch of line) {
    const channel = classifyChar(ch);
    if (channel !== current) {
      emitRun();
      current = channel;
      run = ch;
    } else {
      run += ch;
    }
  }
  emitRun();
  return out;
}

// Local fg helper to avoid importing emitter internals into classification.
function colorFg(hex: string, text: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `\x1b[38;2;${r};${g};${b}m${text}`;
}

// ── Table machinery (brief: table-rendering-policy) ──────────────────

/** The band's cap (BRF-TABLE-LADDER): a table is authored to fit 80 columns
 *  (content 76) and is never drawn wider than 120 (content 116). Past the cap a
 *  table gains air between its columns rather than information, and the eye
 *  crosses more gap to compare two cells. The menu pattern is exempt — its
 *  number is the strong-stop at the visual right edge, which the cap would park
 *  mid-glass (ADR-ROLE-LAYOUT-022). */
const BAND_CONTENT = 116;

interface Cell {
  text: string; // may contain inline ANSI
  align?: "left" | "center" | "right";
  wired?: boolean; // carries jump wiring — the menu-pattern mark (td-b81597)
}
interface TableState {
  headerRows: Cell[][];
  bodyRows: Cell[][];
  row: Cell[];
  rowIsHeader: boolean; // set by th cells; tr reads it (post-order safe)
  active: boolean;
}

function newTableState(): TableState {
  return { headerRows: [], bodyRows: [], row: [], rowIsHeader: false, active: true };
}

// ── Document render ───────────────────────────────────────────────────

interface Ctx {
  width: number;
  /** Full terminal width (opts.width), for header chip placement at the
   *  extreme right column. Body wraps at `width` (content); the header chip
   *  eats the 2-col right margin so it sits at the visible right edge. */
  fullWidth: number;
  styler: ReturnType<typeof makeStyler>;
  color: ColorMode;
  palette: Palette;
  table: TableState | null;
  mermaid: Map<string, { art: string; title?: string | null }>;
  /** Described diagrams — prose from diagram-describe (BRF-DIAGRAM-DESCRIBE). */
  described: Map<string, { prose: string; title?: string | null }>;
  /** Coloured fence lines keyed by token id (BRF-FENCE-COLOUR). */
  code: Map<string, string[]>;
  /** When set, `list` handlers record structure instead of rendering
   *  (the probe pass — see probeListDepths). */
  listProbe?: (children: string) => string;
  /** Per-list nesting depth from the probe pass, consumed in call order. */
  listDepths?: number[];
  /** Call-order cursor into listDepths (the render pass). */
  listSeq: number;
}

/** Render a closed-grammar markdown document to ANSI lines. */
export async function renderDocument(
  source: string,
  opts: RenderOptions,
): Promise<string> {
  const color = opts.color ?? "truecolor";
  const palette = opts.palette ?? loadPalette();
  const styler = makeStyler(palette, color);
  const ctx: Ctx = {
    // Content width reserves a 2-char left + 2-char right margin (Glow
    // Document margin). Wrap, hr, and table-fit all respect this;
    // raw blocks (code/diagrams) elide to the same right edge rather
    // than wrap (ADR-UNIVERSAL-ELISION-050 — the "art is art" gutter
    // exemption repealed).
    width: Math.max(10, opts.width - 4),
    fullWidth: opts.width,
    styler,
    color,
    palette,
    table: null,
    mermaid: new Map(),
    described: new Map(),
    code: new Map(),
    listSeq: 0,
  };

  // Pre-pass 1: elide YAML front matter (document-start `---\n…\n---`).
  // CommonMark parses this as setext h2 (the keys promoted to a heading)
  // because the closing `---` is an h2 underline. Front matter is provenance,
  // not content — elide entirely (foxtrot oscar on the setext trap).
  const source1 = stripFrontMatter(source);

  // Pre-pass 2: neutralise mid-document setext headings. A `---` (or `***`,
  // `___`) line directly under non-blank text is a setext h2 underline, not
  // a thematic break. Headers use hashes (gravitas, not underlines); insert
  // a blank line before the rule so Bun.markdown sees a paragraph + hr.
  const source2 = neutraliseSetext(source1);

  // Pre-pass 2.5: inline math glyphs (BRF-MATH-GLYPHS). It runs on the
  // SOURCE, not in the `text` handler the brief named: a probe on bun
  // 1.4.0 shows fenced and codespan content is delivered to `text`
  // BEFORE its own handler sees it (`text: "$\\Delta t$ fence"` then
  // `code: …`), so a handler-level pass would translate inside code
  // however it was placed. Scanning fences and code spans here makes
  // the exemption structural instead of hopeful.
  const source2a = applyMathGlyphs(source2);

  // Pre-pass 3: intercept mermaid fences → pipe to binary → placeholder tokens.
  const source3 = await interceptMermaid(source2a, opts, ctx);

  // Pre-pass 3.5: intercept tagged code fences → chroma → placeholder
  // tokens (BRF-FENCE-COLOUR). Runs after mermaid so its fences are already
  // gone; only a *successful* colour buys a token — unknown tags, absent
  // binary, and none mode leave the fence in place for `code()`, so those
  // paths are byte-identical to yesterday by construction.
  const source4 = await interceptCode(source3, opts, ctx);

  // Pre-pass 4 (structural probe): each list's nesting depth. Post-order
  // callbacks mean a nested list renders before its parent fires — depth
  // (top-down) can't reach it in one pass. The probe renders once with
  // list handlers swapped for identity tags; parents' children name their
  // descendants, giving the containment chain. The render pass then draws
  // depths from it in identical call order (same source, same parser —
  // deterministic sequence).
  ctx.listDepths = probeListDepths(source4, ctx);
  ctx.listSeq = 0;

  const rendered = Bun.markdown.render(source4, handlers(ctx), {
    ...PARSER_OPTIONS,
  }).replace(/\n+$/, "\n\n"); // terminator wants exactly one blank line above

  // Block terminator — the okudagram's bottom (candidate B of the
  // 2026-08-27 four-way probe). Two chips bookend a muted rule: the
  // LHS chip mirrors the H1 badge's column (subdued — muted, not
  // heading-coloured, so it orients without declaring depth; the badge
  // encodes level, the terminator encodes *exit*), the RHS chip mirrors
  // the heading chip's cell. The eye, trained by the H1 badge on the
  // left, lands on the muted LHS chip on scroll and reads "closed" —
  // no false promise of more to read. Completes the diagonal (heading
  // blue top+LHS, muted RHS+footer) and closes the frame a bare rule
  // cannot — a separator that doubles as a terminator terminates
  // nothing. Emitted by the renderer, never authored: every document
  // ends, so termination is a property of rendering (the TUI's closer
  // is the Gloam footer, its own frame — the terminator belongs to the
  // streaming canvas). none-mode parity via the styler: plain `─` rail,
  // plain `█` chips.
  let out = rendered;
  if (stripTags(rendered).trim() !== "") {
    const rail = ctx.width - 4; // chip + space + rail + space + chip = width
    out = rendered + styler.headingChip() + " " + styler.rule(rail) + " " + styler.headingChip() + "\n";
  }
  return finalize(out);
}

/**
 * Render once with probe list handlers to map each list call to its
 * nesting depth. Each probe call wraps its (already-rendered) children
 * in a PB tag; a parent's children therefore name every descendant list.
 * The nearest LATER call containing tag i is i's immediate parent
 * (post-order: ancestors fire after descendants; the minimum index beats
 * every grandparent). Depth = ancestor-chain length. Probe output is
 * discarded — only the depth map survives.
 */
function probeListDepths(source: string, ctx: Ctx): number[] {
  const RE_PB_ALL = new RegExp(RE_PB_TAG.source, "g");
  const contained: number[][] = [];
  ctx.listProbe = (children: string): string => {
    const id = contained.length;
    contained.push([...children.matchAll(RE_PB_ALL)].map((m) => Number(m[1])));
    return tagProbeOpen(id) + children + TAG_PROBE_CLOSE;
  };
  try {
    Bun.markdown.render(source, handlers(ctx), { ...PARSER_OPTIONS });
  } finally {
    ctx.listProbe = undefined;
    // The probe runs every handler, not just `list` — table handlers can
    // mutate ctx.table. A well-formed table self-resets (the `table`
    // handler sets ctx.table = null), but a malformed unclosed table would
    // leave stale state for the render pass to inherit via ensureTable.
    // Reset here so probe state never leaks into the render pass.
    ctx.table = null;
  }

  const parentOf = new Array<number>(contained.length).fill(-1);
  for (let j = 0; j < contained.length; j++) {
    for (const id of contained[j]!) {
      if (parentOf[id] === -1) parentOf[id] = j; // first (nearest) wins
    }
  }
  const depths = new Array<number>(contained.length).fill(-1);
  const depthOf = (i: number): number => {
    if (depths[i] !== -1) return depths[i]!;
    const p = parentOf[i]!;
    return (depths[i] = p === -1 ? 0 : depthOf(p) + 1);
  };
  for (let i = 0; i < contained.length; i++) depthOf(i);
  return depths;
}

/**
 * Strip YAML front matter from document start: `^---\n…\n---\n`.
 * Elided entirely — provenance is not content. (Glow strips it silently;
 * okuda's position is the same: front matter is for tools, not readers.)
 */
function stripFrontMatter(source: string): string {
  const m = source.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/);
  return m ? source.slice(m[0].length) : source;
}

/**
 * A line is a thematic-break rule if it is ONLY 3+ of `-`, `*`, or `_`,
 * optionally with 1-3 leading spaces and trailing spaces/tabs.
 * (CommonMark thematic break form — the same characters that, when directly
 * under non-blank text, double as a setext h2 underline.)
 */
function isThematicBreakLine(line: string): boolean {
  const s = line.replace(/[ \t]+$/, ""); // trailing ws
  if (s.length < 3) return false;
  const c = s[0];
  if (c !== "-" && c !== "*" && c !== "_") return false;
  return [...s].every((ch) => ch === c);
}

/**
 * A line is a setext h1 underline if it is ONLY 1+ `=`, optionally with
 * trailing spaces/tabs. (No leading-space form per CommonMark.) `===` has no
 * alternate valid meaning in okuda's grammar — it is setext-only, so it is
 * stripped; the text above becomes a plain paragraph.
 */
function isSetextH1Line(line: string): boolean {
  const s = line.replace(/[ \t]+$/, "");
  if (s.length < 1) return false;
  return [...s].every((ch) => ch === "=");
}

/**
 * Neutralise setext headings, *outside* fenced code blocks. Headers use `#`
 * only — gravitas, not underlines. Two cases:
 *
 *  - h2 underline (`---`/`***`/`___` under non-blank text): the line is also a
 *    valid thematic break, so insert a blank line before it → Bun.markdown
 *    parses it as hr (the operator's "`---` is a horizontal line").
 *  - h1 underline (`===` under non-blank text): `=` has no alternate meaning,
 *    so strip the line; the text above becomes a plain paragraph.
 */
function neutraliseSetext(source: string): string {
  const lines = source.split("\n");
  let inFence = false;
  let fence = "";
  for (let i = 0; i < lines.length; i++) {
    const cur = lines[i];
    // Toggle fenced-code state (``` or ~~~). Must run for line 0 too —
    // a document may open with a code fence.
    const open = cur.match(/^( {0,3})(`{3,}|~{3,})/);
    if (open && (fence === "" || open[2][0] === fence[0])) {
      inFence = !inFence;
      fence = inFence ? open[2][0] : "";
      continue;
    }
    if (inFence) continue;
    if (i === 0) continue; // no previous line to form a setext pair
    if (lines[i - 1].trim() === "") continue;
    if (isThematicBreakLine(cur)) {
      lines.splice(i, 0, "");
      i++; // skip the inserted blank line
    } else if (isSetextH1Line(cur)) {
      lines.splice(i, 1); // strip the `===` underline
      i--; // re-examine this index (next line shifted up)
    }
  }
  return lines.join("\n");
}

/** Replace mermaid fences with placeholder tokens; stash classified art
 *  or prose descriptions. The `describe` tag routes to diagram-describe
 *  instead of mermaid-to-md (BRF-DIAGRAM-DESCRIBE). */
async function interceptMermaid(
  source: string,
  opts: RenderOptions,
  ctx: Ctx,
): Promise<string> {
  interface FenceEntry {
    code: string;
    title: string | null;
    described: boolean;
  }
  const fences: FenceEntry[] = [];
  const src = source.replace(
    /(^|\n)```mermaid( describe)?\n([\s\S]*?)\n?```/g,
    (_m, lead: string, tag: string | undefined, code: string) => {
      const described = tag != null; // " describe" → true
      let title: string | null = null;
      const firstNl = code.indexOf("\n");
      const firstLine = firstNl === -1 ? code : code.slice(0, firstNl);
      const tm = firstLine.match(/^title:\s*(.+?)\s*$/);
      if (tm) {
        title = tm[1]!;
        code = firstNl === -1 ? "" : code.slice(firstNl + 1);
      }
      fences.push({ code, title, described });
      // described diagrams use a different token type so the paragraph
      // handler can route them to the prose renderer.
      const id = String(fences.length - 1);
      return `${lead}${described ? describedToken(id) : mermaidToken(id)}`;
    },
  );
  if (fences.length === 0) return src;

  // Run all pipes in parallel — mermaid-to-md and diagram-describe.
  const results = await Promise.all(
    fences.map(async (f) => {
      if (f.described) {
        const prose = await spawnDescribe(f.code, opts);
        if (prose === "") return null;
        return { described: true, prose, title: f.title };
      }
      const out = await spawnMermaid(f.code, opts);
      if (out === "") return null;
      return { described: false, art: extractDiagramArt(out), title: f.title };
    }),
  );
  for (const [i, entry] of results.entries()) {
    if (entry === null) continue;
    if (entry.described) {
      ctx.described.set(String(i), { prose: entry.prose!, title: entry.title });
    } else {
      ctx.mermaid.set(String(i), { art: entry.art!, title: entry.title });
    }
  }
  return src;
}

// ── Chroma pipe (BRF-FENCE-COLOUR) ───────────────────────────────────

/** A fence tag we will forward: one conservative word (ts, c++, c#,
 * objective-c). Anything else is not a language claim. */
const RE_FENCE_TAG = /^[A-Za-z0-9][A-Za-z0-9_+#.-]*$/;

/** chroma's alias table, parsed once per process from `chroma --list`.
 * Why a table at all: chroma never rejects an unknown --lexer — it falls
 * back to plaintext, colours it white, and exits 0 with empty stderr.
 * "An unknown tag renders as today" is reachable only by knowing the
 * table. The cache holds *successful* probes only, so an absent binary
 * is retried per render (cheap) and never poisons a later one. */
let chromaAliases: Set<string> | undefined;

async function getChromaAliases(bin: string): Promise<Set<string> | null> {
  if (chromaAliases !== undefined) return chromaAliases;
  try {
    const proc = Bun.spawn([bin, "--list"], {
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

/** Pipe one fence through chroma — `--formatter terminal16 --style
 * monokai`: 16-colour class codes, the terminal's palette supplies the
 * hues. BRF-FENCE-COLOUR's one rule holds: the tool classifies, the
 * terminal themes. The style is the emphasis *map* — which token class
 * lands in which slot (monokai quantised: loud cyan keywords, yellow
 * function names, full-white identifiers, blue comments — 94, the one
 * hand-patch, see below) — while the
 * hues themselves stay the terminal's; no TrueColor, no 256, no hex.
 * The default style was measured out: swapoff quantises identifiers —
 * the bulk of every fence — to ANSI-white 37, gray on every dark
 * terminal, so most of the code was the dimmest text on screen.
 * Dracula quantises to yellow-everything (pastels have no 16-slot
 * equivalents) — the probe refuted it.
 *
 * The hand-patch (td-3e6d24, measured at the glass): monokai lands
 * comments on class 90 (bright black — the dimmest slot on every dark
 * terminal, unreadable there, the same register as the chrome footer's
 * muted #445566). The emphasis map is ours to choose, so the comment
 * class is remapped 90 → 94: the one free bright slot in monokai's map
 * (96 keywords, 97 identifiers, 93 functions, 91 operators, 33
 * numbers, 37 strings). Probes refuted the alternatives — 37 collides
 * with strings, 92/95 shout past identifiers, 34 is the dark-on-dark
 * trap, and every stock style that brightens comments (vim, doom-one,
 * github-dark) does it by dropping identifiers to dim 37, the exact
 * failure the default was measured out of. The hues stay the
 * terminal's; only the slot assignment changes. Returns null on any
 * failure — absent binary, dead pipe, empty output. */
async function spawnChroma(
  bin: string,
  tag: string,
  code: string,
): Promise<string | null> {
  try {
    const proc = Bun.spawn(
      [bin, "--formatter", "terminal16", "--style", "monokai", "--lexer", tag],
      { stdin: "pipe", stdout: "pipe", stderr: "pipe" },
    );
    proc.stdin.write(code);
    proc.stdin.end();
    const out = await new Response(proc.stdout).text();
    await proc.exited;
    // The hand-patch: monokai's comment class 90 → 94 (doc block above).
    const body = out.replace(/\n$/, "").replace(/\x1b\[90m/g, "\x1b[94m");
    return body.trim() === "" ? null : body;
  } catch {
    return null;
  }
}

/** Pre-pass 3.5: tagged, non-mermaid fences → chroma → tokens. The
 * mermaid shape exactly: handlers are sync, the pipe is not, so colour
 * is bought before the parse and `code()` never sees a fence it must
 * colour. Only a *successful* pipe buys a token — the fence otherwise
 * stays in the source and renders through `code()` as always, so the
 * unknown-tag, absent-binary, and none-mode paths are byte-identical to
 * yesterday by construction, not by imitation. */
async function interceptCode(
  source: string,
  opts: RenderOptions,
  ctx: Ctx,
): Promise<string> {
  if ((opts.color ?? "truecolor") === "none") return source;
  const bin = opts.chromaBin ?? "chroma";
  const aliases = await getChromaAliases(bin);
  if (!aliases) return source;
  // CommonMark close discipline: a closing fence is its own line
  // (`\n?```[ \t]*(?=\n|$)` — the close may end the document, and a
  // trailing newline is eaten as before, keeping the pinned chroma
  // bytes). Without the EOL lookahead the lazy match closes at the
  // first ``` anywhere — mid-line included — so a source file that
  // *contains* a fence-shaped regex (e.g. `/^\s*(```|~~~)/` in
  // src/vectors.ts, rendered via wrapWholeFile) truncated the fence at
  // its own fence-detector and the tail of the file fell out of the
  // code path into prose: doc comments whitened, ` * ` lines became
  // bullets, `**bold**` styled (td-3e6d24 glass session).
  const re = /(^|\n)```([^\n`]*)\n([\s\S]*?)\n?```[ \t]*(?=\n|$)/g;
  const found: { tag: string; code: string; valid: boolean }[] = [];
  for (const m of source.matchAll(re)) {
    // The info string's first word is the tag; the rest is ignored
    // (`js title=...` is still js). lowercase — chroma's aliases are.
    const tag = (m[2] ?? "").trim().split(/\s+/)[0]!.toLowerCase();
    const valid = tag !== "mermaid" && RE_FENCE_TAG.test(tag) && aliases.has(tag);
    found.push({ tag, code: m[3] ?? "", valid });
  }
  if (!found.some((f) => f.valid)) return source;
  const arts = await Promise.all(
    found.map((f) => (f.valid ? spawnChroma(bin, f.tag, f.code) : null)),
  );
  let i = 0;
  return source.replace(re, (m, lead: string) => {
    const art = arts[i++];
    if (art === null || art === undefined) return m;
    ctx.code.set(String(ctx.code.size), art.split("\n"));
    return `${lead}${codeToken(String(ctx.code.size - 1))}`;
  });
}

/** The coloured fence block: chroma's lines with `code()`'s RAW
 * protection, indent, and elision — but no `codeLine` wrap. chroma's
 * class codes ARE the styling; layering the palette's code colour over
 * them would fight the terminal's palette for the same bytes.
 *
 * The budget is `ctx.width - 2`, not `ctx.width`: this function adds a
 * 2-column indent and `finalize` adds a 2-column document margin, so eliding at
 * the content width puts the line at `ctx.width + 4` — the terminal's LAST
 * column, holding the `…`, where the terminal soft-wraps what okuda emits (the
 * one thing it must never do). Prose stops at `width - 2`; so does this. */
function codeBlockLines(lines: string[], ctx: Ctx): string {
  const open = tagRawOpen("code");
  const body = lines.map((l) => (l === "" ? "" : "  " + elideToWidth(l, ctx.width - 2)));
  return `${open}${body.join("\n")}${TAG_RAW_CLOSE}\n\n`;
}

/** Whole-file rendering (BRF-FENCE-COLOUR P2): a code file is a
 * one-fence document. Input normalisation at the source boundary — the
 * extension becomes the fence tag, and chroma's alias table does the
 * mapping (we own no map). No text is invented or merged: the file IS
 * the fence, so this is normalisation, not compositing. Markdown stays
 * itself; extensionless and dotless files pass through untouched. */
export function wrapWholeFile(file: string, text: string): string {
  if (/\.markdown$/i.test(file) || /\.md$/i.test(file)) return text;
  const dot = file.lastIndexOf(".");
  if (dot <= 0) return text;
  const tag = file.slice(dot + 1).toLowerCase();
  if (!RE_FENCE_TAG.test(tag)) return text;
  return `\`\`\`${tag}\n${text.replace(/\n+$/, "")}\n\`\`\`\n`;
}

/** Build the Bun.markdown handler set. */
function handlers(ctx: Ctx): Record<string, (children: string, meta?: any) => string | null> {
  const { styler, width } = ctx;

  const wrapBlock = (text: string, indent = ""): string[] =>
    wrapANSI(text, {
      width,
      indent,
      firstIndent: "",
    });

  return {
    heading(children: string, meta: { level: number }) {
      const level = meta?.level ?? 1;
      // Glow way: `#`×level marker + heading colour on every level.
      // (ADR-007: H4+ no longer collapses; the marker count is the level.)
      // The marker is badged: bg = fg = heading colour → a solid colour
      // block the width of the level (LCARS tab). The glyph stays in the
      // stream for NO_COLOR parity (strip escapes → `## Heading` as before).
      //
      // RHS chip (brief: right-edge LCARS tab): a solid heading-coloured
      // block (bg=fg=heading on `█`), constant 1 cell, at the RHS edge of
      // the text (the content boundary = body's right margin). The chip is
      // the H1 unit — a fixed reference the LHS badge is measured against
      // (LHS encodes depth by growing; RHS references it by staying
      // constant). Same visual language as the H1 LHS badge. bg=fg-on-glyph
      // renders reliably (the badge proves it). Headers wrap at `width-1`
      // (reserving 1 column); each line padded to `width-1`, chip fills the
      // last column. Every line (the bar form) bounds the reflow.
      const markers = "#".repeat(level);
      const wrapW = width - 1;
      // Guest paints (silcrows, doc-refs, state glyphs) close with a full
      // reset; the heading re-opens after each one — the enclosing style
      // owns the run, the guest borrows and hands it back (td-290433).
      // Reset-then-reopen keeps the wrap state machine's invariant: runs
      // open with full resets only, never partial ones.
      const reopen = styler.roleBoldOpen("heading");
      const keepHeading = (l: string) => l.replace(/\x1b\[0m/g, `\x1b[0m${reopen}`);
      // Bun pre-renders inline formatting (e.g. `**text**`) into
      // ANSI-coloured children — strong/emphasis colours leak into the
      // heading. stripANSI removes all of it, then we re-apply guest
      // paint colours for the known guest types (vectors, state glyphs)
      // so they survive. The heading role owns the run; guests borrow
      // and hand back via keepHeading (td-290433 / BRF-HEADING-ANSI-STRIP).
      let clean = stripANSI(stripHtml(children));
      // Re-apply vector paint: §NN → vector-coloured §NN
      clean = clean.replace(/§(\d+)/g, (_m, n: string) =>
        styler.roleBold("vector", `\u00a7${n}`));
      // Re-apply state-glyph paint: standalone state glyphs
      clean = clean.replace(
        /(^|\s)([\u2713\u2610\u22ee\u2717])(?=\s|$)/g,
        (_whole, pre: string, g: string) =>
          pre + styler.roleBold(STATE_GLYPH_ROLE[g]!, g),
      );
      const lines = wrapANSI(markers + " " + clean, { width: wrapW });
      return (
        lines
          .map((l, i) => {
            if (l === "") return "";
            const body =
              i === 0
                ? styler.headingBadge(markers) +
                  styler.roleBold("heading", keepHeading(l.slice(markers.length)))
                : styler.roleBold("heading", keepHeading(l));
            return padDisplay(body, wrapW) + styler.headingChip();
          })
          .join("\n") + "\n\n"
      );
    },

    paragraph(children: string) {
      // Code placeholder paragraph → the chroma-painted fence
      // (BRF-FENCE-COLOUR: the same resolution shape as mermaid below).
      const c = children.trim().match(RE_CODE_TOKEN);
      if (c) {
        const lines = ctx.code.get(c[1]!);
        if (lines !== undefined) return codeBlockLines(lines, ctx);
        return ""; // tokenised then dropped — unreachable by construction
      }
      // Mermaid placeholder paragraph → the classified ASCII block.
      const m = children.trim().match(RE_MERMAID_TOKEN);
      if (m) {
        const entry = ctx.mermaid.get(m[1]!);
        if (entry !== undefined) return diagramBlock(entry.art, ctx, entry.title);
        return ""; // pipe failed → drop the placeholder silently
      }
      // Described diagram placeholder → prose block (BRF-DIAGRAM-DESCRIBE).
      const d = children.trim().match(RE_DESCRIBED_TOKEN);
      if (d) {
        const entry = ctx.described.get(d[1]!);
        if (entry !== undefined) return describedBlock(entry.prose, ctx, entry.title);
        return "";
      }
      // Inline vector paint: strip the token; live vectors paint a
      // bracketed badge in the reserved vector role, right after the
      // slug — no layout assumptions, the badge travels with the text
      // (ADR-026 paint direction). Legacy tokens strip silently (ADR-031:
      // the authored numbers are not honored).
      const v = stripVector(children);
      if (v) {
        if (!v.live) return wrapBlock(stripHtml(v.slug)).join("\n") + "\n\n";
        const badge = `\u00a7${v.num}`;
        const slugLines = wrapBlock(stripHtml(v.slug));
        const avail = Math.max(width - 2 - badge.length - 1, 8);
        const body = elideToWidth(slugLines.join(" "), avail);
        return body + " " + styler.roleBold("vector", badge) + "\n\n";
      }
      const lines = wrapBlock(stripHtml(children));
      return lines.join("\n") + "\n\n";
    },

    text(children: string) {
      // A table cell's jump wiring (whole-comment RHS form) survives as
      // the wire tag — the td handler consumes it as the menu-pattern
      // mark; residuals are swept by stripTags at finalize. (td-b81597.)
      if (RE_RHS_WIRE.test(children)) return TAG_RHS_WIRE;
      let out = stripHtml(children);
      // Vector markers (ADR-031) — table cells route through here, not
      // the paragraph handler: live tokens paint as rose silcrows, legacy
      // tokens strip silently (retired, not honored).
      out = out.replace(/%{1,2}okuda-vector:(\d{1,2})%{1,2}/g, (_m, n: string) =>
        " " + styler.roleBold("vector", `§${n}`));
      out = out.replace(/%{1,2}okuda-(?:vector|rhs):\d{1,2}%{1,2}/g, "");
      // Bare .md-path tokens in prose are affordances, not provenance
      // (amended 2026-09-12 — the 2026-08-28 gloaming called them far by
      // location; the test is by function). An actable path lifts to
      // the doc-ref gold: visible, subordinate to the rose vector
      // paint — the silcrow is the actuation point, the path is the
      // address. Type it in the search and it resolves.
      out = out.replace(/\b([\w][\w/.-]*\.md)\b/g, (m) =>
        styler.role("doc-ref", m));
      // A standalone state glyph colours in prose — the vocabulary's
      // "colour + bold" intent applies wherever the glyph appears as a
      // glyph (standalone, not embedded). The lexicon is consistent
      // everywhere. (brief: state-glyph-vocab.)
      out = out.replace(
        /(^|\s)([\u2713\u2610\u22ee\u2717])(?=\s|$)/g,
        (_whole, pre: string, g: string) =>
          pre + styler.roleBold(STATE_GLYPH_ROLE[g]!, g),
      );
      // The L§AB wordmark — the § rubricated (rose, the vector role),
      // LA and B in context colour. A literal-string glyph ligature:
      // the renderer kerns the wordmark, the source stays clean. The
      // mystery logo — the colour appears at render time, by
      // recognition, not by syntax. (L§AB — Leith Scriptorium & Bond.)
      out = out.replace(/L§AB/g, (m) =>
        "L" + styler.roleBold("vector", "§") + "AB");
      // The GLöam wordmark — the BÖC move: the metal umlaut exists only
      // at render time. The source stays clean ("GLoam"/"Gloam"); the
      // terminal shows the canonical GLöam, the ö rubricated in the
      // vector rose (the wordmark channel, §'s role — recognition, not
      // syntax, the mystery-logo pattern, second of its name). The
      // lowercase Scots word ("gloam", the gloaming) is the word, not
      // the name — it stays plain, and the launcher command (lowercase
      // `gloam`) is the word in corpus codespans too: never touched, in
      // prose or code. Like L§AB, this fires inside codespans as
      // well — accepted: the capitalized form never appears in code in
      // the corpus, only in prose mentions. Precomposed U+00F6: width
      // 1; the combining diaeresis would lie to displayWidth.
      out = out.replace(/GLoam|Gloam/g, () =>
        "GL" + styler.roleBold("vector", "\u00f6") + "am");
      return out;
    },

    strong(children: string) {
      // A digits-only strong run is a menu's jump token — white bold,
      // not the amber strong colour. The number is the content; bold is
      // the affordance. No chip, no token, no private-use marker: the
      // compositor emits plain `**01**`, extractJumps reads it from source,
      // the renderer colours it. (brief: index-and-jump — the chip that
      // retired.)
      if (/^\d{1,3}$/.test(children)) return styler.bold(children);
      return styler.roleBold("strong", children);
    },
    emphasis(children: string) {
      // ***bold italic*** nests as emphasis(strong(text)) post-order (Bun
      // resolves children first; emphasis is the outer handler). Glow
      // renders the combo in the EMPHASIS colour, not strong's — so detect
      // a pure strong child and re-emit as one combined SGR. Otherwise a
      // normal italic span. (The reverse nest **_x_** falls through; rare.)
      const strongInner = unwrapStrongSpan(children, ctx.palette);
      if (strongInner !== null) return styler.roleBoldItalic("emphasis", strongInner);
      return styler.roleItalic("emphasis", children);
    },
    strikethrough(children: string) {
      return styler.strike(children);
    },
    codespan(children: string) {
      return styler.codespan(children);
    },

    link(children: string, meta: { href: string }) {
      return styler.link(children, meta?.href ?? "");
    },
    image(_children: string, meta: { alt?: string; src?: string }) {
      // Grammar: images rejected — alt text as [image: alt]. Bun 1.3.8
      // delivers the alt as children, not meta.
      return styler.role("muted", `[image: ${_children || meta?.alt || ""}]`);
    },

    html() {
      return null; // Raw HTML blocks stripped silently.
    },

    hr() {
      return styler.rule(width) + "\n\n";
    },

    code(children: string) {
      // Fenced code (mermaid never reaches here — pre-pass). Never
      // wrapped — elided (td-b81597, closing ADR-004's fence exception:
      // "overflow ugly by design" was the lesser evil when wrapping was
      // the only alternative; elision is crueler and more useful). Each
      // line is hard-truncated with `…` at the cut — the terminal never
      // soft-wraps what okuda emits (a wrapped code line is one line
      // pretending to be two).
      //
      // Budget: `width - 2`. The arithmetic this line used to carry —
      // handler indent 2 + finalize margin 2 + ctx.width — resolves to
      // exactly the terminal width, which is not a budget but the boundary:
      // the last column then holds the `…`, and the terminal wraps it onto
      // the next line. The old comment stated that result as the intent.
      // Eliding two columns short of it stops the fence where prose stops,
      // at `width - 2`, `…` at the cut and the glass untouched. (Dogfood
      // find, 2026-10-07: the showcase's fences wrapped their marker at 60
      // columns and nowhere else, because elision fires only on a line that
      // exceeds the budget.)
      const body = children.replace(/\n$/, "");
      const open = tagRawOpen("code");
      const lines = body
        .split("\n")
        .map((l) => (l === "" ? "" : styler.codeLine("  " + elideToWidth(l, width - 2))));
      return `${open}${lines.join("\n")}${TAG_RAW_CLOSE}\n\n`;
    },

    blockquote(children: string) {
      return quoteBlock(children, ctx);
    },

    // List items emit a placeholder; the `list` handler assigns markers
    // (bun 1.3.8 passes no listItem metadata — decisions/005).
    listItem(children: string) {
      // Inline vector paint for list items too — the same badge, no
      // layout math; the token used to leak raw from this handler.
      const v = stripVector(children);
      if (v) {
        if (!v.live) return TAG_ITEM + v.slug;
        return TAG_ITEM + v.slug + " " + styler.roleBold("vector", `\u00a7${v.num}`);
      }
      return TAG_ITEM + children;
    },

    list(children: string, meta: { ordered: boolean; start?: number }) {
      if (ctx.listProbe) return ctx.listProbe(children);
      return renderList(children, meta, ctx);
    },

    // ── Table uniform presentation layer ──
    // th/td classify the section (post-order: tr fires before thead, so
    // thead/tbody handlers can't switch sections — cells carry the flag).
    th(children: string, meta: { align?: "left" | "center" | "right" }) {
      const t = ensureTable(ctx);
      t.rowIsHeader = true;
      t.row.push({ text: children, align: meta?.align });
      return "";
    },
    td(children: string, meta: { align?: "left" | "center" | "right" }) {
      const t = ensureTable(ctx);
      t.rowIsHeader = false;
      // Consume the wire tag: the cell is marked wired (menu pattern),
      // the tag never flows further. (td-b81597.)
      const wired = children.includes(TAG_RHS_WIRE);
      t.row.push({
        text: wired ? children.split(TAG_RHS_WIRE).join("").trim() : children,
        align: meta?.align,
        wired,
      });
      return "";
    },
    tr(_children: string) {
      const t = ensureTable(ctx);
      const target = t.rowIsHeader ? t.headerRows : t.bodyRows;
      target.push(t.row);
      t.row = [];
      return "";
    },
    thead(_children: string) {
      return "";
    },
    tbody(_children: string) {
      return "";
    },
    table(_children: string) {
      const t = ctx.table;
      ctx.table = null;
      return t ? renderTable(t, ctx) : "";
    },
  };
}

function ensureTable(ctx: Ctx): TableState {
  if (!ctx.table) ctx.table = newTableState();
  return ctx.table;
}

function stripHtml(s: string): string {
  return s.replace(RE_INLINE_HTML, "");
}

// ── Inline math glyphs (BRF-MATH-GLYPHS) ─────────────────────────────

/** The closed vocabulary: LaTeX token → Unicode. Corpus-derived and
 *  append-only, like the conceptual lexicon — an entry arrives with grep
 *  evidence, never with anticipation. `\ge` is the one deliberate mirror
 *  (`\le` is evidenced; symmetry, not scope creep). `\text{X}` and
 *  `\frac{X}{Y}` are rewrites rather than glyphs: syntax dropped, not a
 *  character substituted. */
const MATH_GLYPHS: ReadonlyArray<readonly [string, string]> = [
  ["\\alpha", "α"],
  ["\\Delta", "Δ"],
  ["\\epsilon", "ε"],
  ["\\in", "∈"],
  ["\\le", "≤"],
  ["\\ge", "≥"],
  ["\\neq", "≠"],
  ["\\to", "→"],
  ["\\rightarrow", "→"],
  ["\\times", "×"],
  ["\\S", "§"],
  ["\\dots", "…"],
  ["\\text", ""], // \text{X} → X (the braces go with the rewrite)
  ["\\frac", ""], // \frac{X}{Y} → X/Y
  ["{,}", ","],
  ["--", "–"],
  ["\\_", "_"],
];

const MATH_LOOKUP = new Map(MATH_GLYPHS);
/** The two entries whose command must not survive the rewrite pass. */
const MATH_REWRITE_ONLY = new Set(["\\text", "\\frac"]);
/** Commands whose trailing space is a space the eye wants: a relation or
 *  an operator reads wrong welded to its operand (`\le 10` → `≤ 10`,
 *  `W \times H` → `W × H`). Every other command is a *glyph*, and the
 *  space after it is the terminator that ends the command name — LaTeX's
 *  own rule, and the whole difference between `Δt` and the `Δ t` this
 *  pass first emitted. */
const MATH_SPACED = new Set([
  "\\le",
  "\\ge",
  "\\neq",
  "\\in",
  "\\to",
  "\\rightarrow",
  "\\times",
]);
/** Any backslash token: a command (`\alpha`) or an escape (`\_`). */
const RE_MATH_ESCAPE = /\\[A-Za-z]+|\\[^A-Za-z]/g;
const RE_HAS_ESCAPE = /\\[A-Za-z]|\\[^A-Za-z]/;
/** A command name, an optional single space, and the operand character
 *  that space was terminating — the one place a terminator space can be
 *  removed. The substitution happens in this same pass: removing the
 *  space first re-forms the command (`\Delta t` → `\Deltat`, a command
 *  nobody wrote), which is how this pass first shipped wrong. */
const RE_MATH_TERMINATED = /(\\[A-Za-z]+)( ?)(?=[A-Za-z0-9])/g;
/** The remaining substitutable tokens — `[A-Za-z]+` is greedy, so
 *  `\times` cannot be pre-empted by a shorter sibling, and `\to` cannot
 *  be either. */
const RE_MATH_TOKEN = /\\[A-Za-z]+|\\_|\{,\}|--/g;
const RE_MATH_FRAC = /\\frac\{([^{}]*)\}\{([^{}]*)\}/g;
const RE_MATH_TEXT = /\\text\{([^{}]*)\}/g;
/** An inline span: no `$` inside, no newline (display math is out of
 *  scope, and a multi-line pair is a table or a currency accident). */
const RE_MATH_SPAN = /\$([^$\n]+)\$/g;

/** Translate one span body, or `null` if it must stay literal. The
 *  gate is all-or-nothing, and it runs twice: once on the source, and
 *  again after the rewrites — so a malformed `\frac{F}` (braces absent,
 *  command recognised) fails the second gate instead of half-
 *  translating into `{F}`. */
function mathSpanBody(body: string): string | null {
  for (const m of body.matchAll(RE_MATH_ESCAPE)) {
    if (!MATH_LOOKUP.has(m[0])) return null;
  }
  const out = body.replace(RE_MATH_FRAC, "$1/$2").replace(RE_MATH_TEXT, "$1");
  for (const m of out.matchAll(RE_MATH_ESCAPE)) {
    if (!MATH_LOOKUP.has(m[0]) || MATH_REWRITE_ONLY.has(m[0])) return null;
  }
  const spaced = out.replace(RE_MATH_TERMINATED, (_m, cmd: string, space: string) =>
    (MATH_LOOKUP.get(cmd) ?? cmd) + (MATH_SPACED.has(cmd) ? space : ""),
  );
  return spaced.replace(RE_MATH_TOKEN, (t) => MATH_LOOKUP.get(t) ?? t);
}

/** Replace inline math spans with the Unicode they denote
 *  (`$\Delta t$` → `Δt`). A span with no backslash command is left
 *  exactly as authored — which is the currency guard, not a gap: `costs
 *  $5 and $10` pairs into a span with nothing to translate and stays
 *  literal. A span holding an unknown command (`$\zeta$`) stays literal
 *  whole — visible degradation, never partial mangling. Fenced code and
 *  code spans route through their own handlers and never reach here. */
export function mathGlyphs(s: string): string {
  if (!s.includes("$")) return s; // the common case costs a scan
  return s.replace(RE_MATH_SPAN, (whole, body: string) => {
    if (!RE_HAS_ESCAPE.test(body)) return whole;
    return mathSpanBody(body) ?? whole;
  });
}

// ── The source pass: math outside code ───────────────────────────────

/** A fence marker at the left margin (``` or ~~~, up to three spaces of
 *  indent — CommonMark's own allowance). */
const RE_FENCE_OPEN = /^\s{0,3}(`{3,}|~{3,})/;

/** Is this line the closing marker of `fence`? Same character, at least
 *  as long, nothing else on the line. */
function closesFence(line: string, fence: string): boolean {
  const m = /^\s{0,3}(`{3,}|~{3,})\s*$/.exec(line);
  return m !== null && m[1]![0] === fence[0] && m[1]!.length >= fence.length;
}

/** Apply the math pass to the segments of a line outside code spans. */
function mathOutsideCodeSpans(line: string): string {
  let out = "";
  let last = 0;
  for (const m of line.matchAll(/`+[^`]*`+/g)) {
    const at = m.index ?? 0;
    out += mathGlyphs(line.slice(last, at)) + m[0];
    last = at + m[0].length;
  }
  return out + mathGlyphs(line.slice(last));
}

/** The math pass over a whole source. Fenced blocks and code spans are
 *  skipped, everything else is offered to the span translator. Both
 *  exemptions are structural — a fence state machine and a backtick
 *  split — because the parser will not say which `text` events are code
 *  (see pre-pass 2.5 in `renderDocument`). */
export function applyMathGlyphs(source: string): string {
  if (!source.includes("$")) return source;
  const lines = source.split("\n");
  let fence: string | null = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    if (fence === null) {
      const open = RE_FENCE_OPEN.exec(line);
      if (open) {
        fence = open[1]!;
        continue;
      }
      lines[i] = mathOutsideCodeSpans(line);
    } else if (closesFence(line, fence)) {
      fence = null;
    }
  }
  return lines.join("\n");
}

/** Described diagram block — prose from diagram-describe, rendered as a
 *  muted panel with a left border. The title (if present) sits above the
 *  prose in the diagram-text colour. (BRF-DIAGRAM-DESCRIBE.) */
function describedBlock(
  prose: string,
  ctx: Ctx,
  title?: string | null,
): string {
  const { styler, width } = ctx;
  const indent = "  ";
  const pipe = styler.quotePipe();
  const wrapped = wrapANSI(prose, { width: width - 2, indent, firstIndent: "" });
  const lines = wrapped.map((l) => `${pipe}${l}`);
  let out = lines.join("\n");
  if (title) {
    // Title in the diagram-text role, indented to match the left border.
    const titleLine = styler.role("diagram-text", title);
    out = `${indent}${titleLine}\n${out}`;
  }
  return out + "\n\n";
}

/** Mermaid ASCII block: classified, coloured, never wrapped. Beneath
 *  the art, one muted indicator line names the source's home — the
 *  source itself is not rendered (it is tautological in a single-render
 *  seam; `mermaid-to-md --verify` is the drift check, and it reads the
 *  .md, not the render). The `⋮` glyph borrows the state-parked lexicon
 *  ("elided into a further question"). (brief: mermaid-source-omitted.) */
function diagramBlock(art: string, ctx: Ctx, title?: string | null): string {
  const open = tagRawOpen("diagram");
  // Art elides at the code-fence right edge (ADR-UNIVERSAL-ELISION-050):
  // budget + the finalize margin 2 = `width - 2`, where prose stops. The
  // arithmetic here used to be `ctx.width + 2`, which resolves to exactly the
  // terminal width — the last column then holds the glyph the cut lands on, and
  // the terminal soft-wraps it onto the next line. The comment stated that
  // result as the intent; it is the defect. The "art is art" gutter exemption
  // repeals — a wrapped diagram is a diagram pretending to be a taller diagram,
  // and the terminal never soft-wraps what okuda emits. classifyDiagramLine
  // FIRST (border / arrow detection needs the glyphs intact), then the composed
  // line elides — elideToWidth walks ANSI runs and closes open SGR at the cut.
  // Under NO_COLOR the art is the binary's bytes until over budget — parity
  // holds where it always did, the cut is new honesty. (Dogfood find,
  // 2026-10-07: diagram art and elided fences were the two witnesses, because
  // they are the lines that reach the content width.)
  const budget = ctx.width;
  let elided = 0;
  const lines = art.split("\n").map((l) => {
    if (l === "") return "";
    const painted =
      ctx.color === "none"
        ? l
        : classifyDiagramLine(l, ctx.palette, ctx.color) + "\x1b[0m";
    if (displayWidth(painted) <= budget) return painted;
    elided++;
    return elideToWidth(painted, budget);
  });
  // Indicator line: the diagram's caption. A leading `title: <caption>`
  // in the mermaid fence (extracted pre-pipe by interceptMermaid) lands
  // here — the `⋮` leads (state-parked colour, vocabulary parity), the
  // caption follows in the muted register. Every fence states the elision
  // (BRF-PROJECTION-LOSSES): the notice used to ride only the untitled
  // branch, so 22 of the silo's 58 fences never said the source is not
  // shown. The titled branch appends the SHORTER clause; the
  // hand-measured arithmetic (longest title + `· source elided` = 79
  // against a 78-column budget) is now guarded rather than load-bearing
  // — the indicator itself elides to the same budget, RAW-protected from
  // wrapping, cut by the same primitive as the art. A cut in the art is
  // a second loss and gets said: `· art elided` rides the same muted
  // clause. The glyph keeps its weight under NO_COLOR (roleBold emits
  // SGR 1 — colour drops, attributes survive); the `⋮` reads as a
  // control among the art.
  const glyph = ctx.styler.roleBold("state-parked", "⋮");
  const note = elided > 0 ? " · art elided" : "";
  const base = title ? " " + title + " · source elided" : " mermaid source elided";
  const fits = (s: string) => displayWidth(glyph + ctx.styler.role("muted", s)) <= budget;
  // Fit ladder: the receipt's claims outrank the caption — the title is
  // first to go, then the standing source clause; the art loss is the
  // NEW fact and holds to the last rung. At comfortable widths every
  // rung fits and the branch bytes are unchanged (the 36-fence
  // byte-stability claim holds where it always applied).
  let text = base + note;
  if (!fits(text) && title) text = " source elided" + note;
  if (!fits(text) && note) text = note;
  const stmt = ctx.styler.role("muted", text);
  const indOpen = tagRawOpen("diagramsrc");
  const indicator = elideToWidth(`${glyph}${stmt}`, budget);
  return `${open}${lines.join("\n")}${TAG_RAW_CLOSE}\n${indOpen}${indicator}${TAG_RAW_CLOSE}\n\n`;
}

/** Blockquote: single-level pipe prefix, muted, re-wrapped at width-2. */
function quoteBlock(children: string, ctx: Ctx): string {
  const { styler, width } = ctx;
  // Strip any inner quote pipes (single-level normalisation); the pipe
  // may carry ANSI colour, so allow optional SGR around it.
  const inner = children
    .replace(/^(?:\x1b\[[0-9;]*m)?│(?:\x1b\[[0-9;]*m)? ?/gm, "")
    .replace(/\n+$/, "");
  const segments = splitRaw(inner);
  const out: string[] = [];
  for (const seg of segments) {
    if (seg.raw !== null) {
      for (const line of seg.raw.split("\n")) {
        out.push(line === "" ? "" : styler.quotePipe() + " " + line);
      }
      continue;
    }
    // An aside is italic — that is the invariant. The pipe is the
    // blockquote cue; the italic is the aside's identity. Inline
    // emphasis inside an aside composes: bold renders bold-italic
    // (visible), italic renders italic (same as the aside — redundant,
    // but correct). The catch: inline spans emit full RESET (styler
    // reset) that kills the outer italic. The fix: wrap the line in
    // italic and re-open italic after every reset in the content. We
    // own the render; the styler gives mode-aware reset (empty in
    // NO_COLOR) so parity holds.
    const reset = styler.reset();
    const italicOpen = styler.roleItalic("emphasis", "").replace(/\x1b\[0m$/, "");
    const lines = wrapANSI(seg.text, { width: width - 2 });
    for (const line of lines) {
      if (line === "") { out.push(""); continue; }
      // Re-open italic after every reset so inline spans compose instead
      // of spilling; close with a single reset at the end.
      const reItalicised = reset ? line.replace(/\x1b\[0m/g, `${reset}${italicOpen}`) : line;
      out.push(styler.quotePipe() + " " + italicOpen + reItalicised + reset);
    }
  }
  return out.join("\n") + "\n\n";
}

interface Segment { text: string; raw: string | null }

/** Split a handler-children string on RAW tags (never-wrapped blocks). */
function splitRaw(s: string): Segment[] {
  const segs: Segment[] = [];
  const re = /\u0000RAW:[a-z]+\u0000([\s\S]*?)\u0000\/RAW\u0000/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s)) !== null) {
    if (m.index > last) segs.push({ text: s.slice(last, m.index), raw: null });
    segs.push({ text: "", raw: m[1]! });
    last = re.lastIndex;
  }
  if (last < s.length) segs.push({ text: s.slice(last), raw: null });
  return segs;
}

/**
 * List rendering: markers, loose spacing, continuation indents.
 *
 * Every list renders its markers at column 0 (the level-0 assumption) and
 * tags its output NL:<maxInternal> so the parent can (a) detect embedded
 * lists and (b) shift or flatten them. The parent shifts a level-0 block
 * +2 (giving the child col-2 markers / col-4 continuation — contract
 * table) and flattens an already-shifted (level-1) block to continuation
 * text, enforcing the grammar's two-level cap. Top-level tags are
 * stripped at finalize (decisions/005).
 */
function renderList(
  children: string,
  meta: { ordered: boolean; start?: number },
  ctx: Ctx,
): string {
  const { width } = ctx;
  // Nesting depth from the probe pass (0 = top-level), drawn in the
  // same call order the probe recorded it.
  const depth = ctx.listDepths?.[ctx.listSeq++] ?? 0;
  const embedded = [...children.matchAll(/\u0000NL:(\d)\u0000/g)].map((m) =>
    Number(m[1]),
  );
  const maxEmbedded = embedded.length > 0 ? Math.max(...embedded) : -1;
  // maxInternal of this list's own block (for the tag we emit).
  const myTag = Math.min(maxEmbedded + 1, 1);

  const items = children.split(TAG_ITEM).slice(1);
  const itemBlocks: string[] = [];

  items.forEach((item, i) => {
    const marker = meta.ordered ? `${(meta.start ?? 1) + i}.` : "•";
    const markerPrefix = `${marker} `;
    const textCol = displayWidth(markerPrefix);
    // Composition shifts a nested block +4 per level AFTER wrapping
    // (item continuation +2 and the parent's LIST_INDENT +2 — or the
    // flatten equivalent at the depth cap). Budget it here, at wrap
    // time, so every emitted line lands inside the terminal (ADR-004:
    // okuda owns every \n; nested overflow was the violation).
    const avail = Math.max(4, width - 4 * depth - textCol - LIST_INDENT);
    const contIndent = " ".repeat(textCol);

    const parts = splitNested(item);
    const lines: string[] = [];
    let firstLine = true;
    for (const part of parts) {
      if (part.nested !== null) {
        const block = part.level >= 1
          ? flattenNested(part.nested) // beyond cap: continuation text
          : part.nested.split("\n").map((l) => (l === "" ? "" : "  " + l)).join("\n");
        lines.push(...block.split("\n"));
        firstLine = false;
        continue;
      }
      const text = part.text.replace(/^\n+/, "").replace(/\n+$/, "");
      if (text === "") continue;
      const wrapped = wrapANSI(text, { width: avail });
      for (const line of wrapped) {
        if (firstLine) {
          // State-glyph lead: colour + bold the leading state glyph on
          // the first line of a list item (brief: state-glyph-render-path).
          // The glyph is content the author chose; the colour honours
          // the lexicon. `◆` is NOT a state role — it stays on the
          // heading/strong channel (priority, not lifecycle).
          lines.push(markerPrefix + styleStateGlyph(line, ctx.styler));
          firstLine = false;
        } else {
          lines.push(contIndent + line);
        }
      }
    }
    if (lines.length === 0) lines.push(markerPrefix.trimEnd());
    itemBlocks.push(lines.join("\n"));
  });

  const body = itemBlocks.join("\n\n") + "\n\n";
  // Indent the whole list block by LIST_INDENT so list markers sit
  // to the right of body paragraphs (Glow list level_indent).
  const indented = body
    .split("\n")
    .map((l) => (l === "" ? "" : " ".repeat(LIST_INDENT) + l))
    .join("\n");
  return tagNestedOpen(myTag) + indented + TAG_NESTED_CLOSE;
}

/** Strip list markers and indent as continuation text (cap flatten). */
function flattenNested(body: string): string {
  return body
    .split("\n")
    .map((l) => {
      const stripped = l.replace(/^\s*(?:•|\d+\.)\s+/, "");
      return stripped === "" ? "" : "  " + stripped;
    })
    .join("\n");
}

interface ListPart { text: string; nested: string | null; level: number }

/** Split list-item children into text segments and nested-list blocks. */
function splitNested(item: string): ListPart[] {
  const parts: ListPart[] = [];
  const re = /\u0000NL:(\d)\u0000([\s\S]*?)\u0000\/NL\u0000/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(item)) !== null) {
    if (m.index > last) parts.push({ text: item.slice(last, m.index), nested: null, level: 0 });
    parts.push({
      text: "",
      nested: m[2]!.replace(/^\n+|\n+$/g, ""),
      level: Number(m[1]),
    });
    last = re.lastIndex;
  }
  if (last < item.length) parts.push({ text: item.slice(last), nested: null, level: 0 });
  return parts;
}

/** Table uniform presentation layer (brief: table-rendering-policy). */
function renderTable(t: TableState, ctx: Ctx): string {
  const { styler, width } = ctx;
  const header = t.headerRows[0] ?? [];
  const rows = t.bodyRows;
  if (header.length === 0 && rows.length === 0) return "";

  const cols = Math.max(
    header.length,
    ...rows.map((r) => r.length),
  );

  // Patterned surface? A 3-column table whose last column carries jump
  // wiring is the menu pattern (slug → callsign → number, ADR-022): the
  // renderer owns the closed vocabulary — right-anchored roles, priority
  // suppression. Any other shape, wired or not, is a generic table.
  // (td-b81597 — the table consumer of the elision primitive, reframed.)
  if (cols === 3 && rows.some((r) => r[2]?.wired)) {
    return renderMenuTable(t, ctx);
  }

  // Column measurement (BRF-TABLE-LADDER). A column's width is what its BODY
  // needs, with the header contributing only its LONGEST WORD: a header is
  // allowed to be three lines tall, so a label like "lines over 80 by the
  // reference ruler" must not hold thirty-five columns open for three characters
  // of data. 143 of the corpus's 1038 columns were sized by their label.
  const bodyNat = new Array<number>(cols).fill(0);
  const bodyWord = new Array<number>(cols).fill(0);
  const headWord = new Array<number>(cols).fill(0);
  const longestWord = (text: string, into: number[], i: number): void => {
    for (const word of stripANSI(text).split(/\s+/)) {
      into[i] = Math.max(into[i]!, displayWidth(word));
    }
  };
  header.forEach((cell, i) => longestWord(cell?.text ?? "", headWord, i));
  for (const r of rows) {
    r.forEach((cell, i) => {
      const text = cell?.text ?? "";
      bodyNat[i] = Math.max(bodyNat[i]!, displayWidth(text));
      longestWord(text, bodyWord, i);
    });
  }
  // The AUTHOR's column widths, and nothing below adjusts them. A column is as wide
  // as its body needs, with the header contributing only its longest word — a header
  // may be three lines tall, so a label like "lines over 80 by the reference ruler"
  // must not hold thirty-five columns open for three characters of data.
  const colWidth = bodyNat.map((n, i) => Math.max(n, headWord[i]!));

  const gutter = 3;

  // The band's cap: a table is never drawn wider than 120 columns, whatever the
  // glass offers (BRF-TABLE-LADDER), and this is the width the drawn lines are cut
  // to.
  const target = Math.min(width, BAND_CONTENT);

  // A column's floor is its longest word, header or body (BRF-WRAP-AT-CAP). A
  // word cannot be broken, so no share may fall below it; the floor is the
  // PREDICATE's unit, never an allocation across columns.
  const wordFloor = colWidth.map((_, i) => Math.max(headWord[i]!, bodyWord[i]!));

  // The three branches, one grammar (BRF-WRAP-AT-CAP). The boundary is the CAP,
  // not the glass: below it the reader's lever is to widen, so the edge cut is
  // recoverable and nothing is asked of the words. Past the cap, 120 and 200
  // columns render identically and the cut HIDES content — the one thing the
  // table model refuses — so the columns wrap until the table fits the cap, and
  // only a word that cannot fit falls through to the edge cut.
  const natural = colWidth.reduce((a, w) => a + w, 0) + gutter * (cols - 1);
  const wordBudget = wordFloor.reduce((a, w) => a + w, 0) + gutter * (cols - 1);
  // Two columns no band width can hold are a prose matrix — two notes wearing
  // pipes. The remedy is the document (ADR-REFERENCES-SECTION-047), not a
  // taller render, and ADR-TABLE-EDGE-CUT-055 already names them.
  const giants = colWidth.filter((n) => n > BAND_CONTENT).length > 1;
  const wrap = natural > BAND_CONTENT && wordBudget <= BAND_CONTENT && !giants;

  // The wrap's allocation, and why it is not the ladder: every column takes its
  // longest word as a floor (a word cannot break below it) and the SLACK IS SPLIT
  // EVENLY. There is no per-column need, no completion order and no proportional
  // budget — the arithmetic that made two models disagree is deliberately absent.
  // The floor test above is a predicate at the cap, never an allocator across
  // columns.
  let slots = colWidth;
  if (wrap) {
    const avail = BAND_CONTENT - gutter * (cols - 1);
    const slack = avail - wordFloor.reduce((a, w) => a + w, 0);
    const base = Math.floor(slack / cols);
    const rem = slack % cols;
    slots = wordFloor.map((w, i) => w + base + (i < rem ? 1 : 0));
  }

  // The EDGE CUT (ADR-TABLE-EDGE-CUT-055). The table renders at the author's widths
  // and is never squeezed: when the glass is narrower than the table, the composed
  // LINE is elided at the content budget with `…` at the cut — the same policy a
  // diagram line gets, so the visible prefix stays a proper table with aligned
  // columns and the tail falls off one edge. This replaced the ladder, which asked
  // "how do I make this fit" of an artefact that was written down and cannot be
  // elided; the ladder's own measurements are the evidence for its removal.
  const cut = (line: string): string =>
    displayWidth(line) > target ? elideToWidth(line, target) : line;

  const sep = ` ${styler.tablePipe()} `;
  const bodySep = " ".repeat(gutter);
  const headDrawn: string[] = [];
  const bodyDrawn: string[][] = [];
  let headHeight = 0;
  if (header.length > 0) {
    // Headers wrap and never elide (BRF-TABLE-LADDER). A header is one block, so
    // its cost is O(1) table lines where a body cell's is O(rows) — and the label
    // is the column's decode key, so it is the last thing that should be cut.
    const headLines: string[][] = Array.from({ length: cols }, (_, i) => {
      const c = header[i];
      if (!c) return [" ".repeat(slots[i]!)];
      const slot = slots[i]!;
      const text = styler.roleBold("table-header", c.text);
      const wrapped = slot > 0 && displayWidth(c.text) > slot
        ? wrapANSI(text, { width: slot })
        : [text];
      // The slot is at least the column's longest word, so a wrapped line always
      // fits it: a header pads, never cuts.
      return wrapped.map((l) => padNatural({ text: l, align: c.align }, i, slots));
    });
    headHeight = Math.max(1, ...headLines.map((l) => l.length));
    for (let k = 0; k < headHeight; k++) {
      // Every line of the header block carries the column separators, so the grid
      // survives a label three lines tall — and the composed line is then cut at
      // the glass like every other line in the table.
      headDrawn.push(
        cut(headLines.map((l, i) => l[k] ?? " ".repeat(slots[i]!)).join(sep).replace(/[ ]+$/, "")),
      );
    }
  }
  for (const r of rows) {
    // Compose each cell to lines, then let the tallest cell set the row block's
    // height: the shorter cells pad with air so the grid survives the wrap. Below
    // the cap every cell is one line, and the block is one line deep — the shape
    // the edge cut always drew.
    const cellLines: string[][] = [];
    for (let i = 0; i < cols; i++) {
      const raw = r[i]?.text ?? "";
      // State-glyph column: colour + bold a leading state glyph via the
      // lexicon role. Applied to non-key columns (i>0); the key column
      // already gets table-key styling. The first column's glyph, if any,
      // rides in table-key bold — a separate axis, not state. (brief:
      // state-glyph-render-path.)
      const styled = i === 0 ? raw : styleStateGlyph(raw, styler);
      const cell: Cell = i === 0
        ? { text: styler.roleBold("table-key", r[0]?.text ?? ""), align: r[0]?.align }
        : { text: styled, align: r[i]?.align };
      const slot = slots[i]!;
      const lines = wrap && slot > 0 && displayWidth(cell.text) > slot
        ? wrapANSI(cell.text, { width: slot })
        : [cell.text];
      cellLines.push(lines.map((l) => padNatural({ text: l, align: cell.align }, i, slots)));
    }
    const height = Math.max(1, ...cellLines.map((l) => l.length));
    const block: string[] = [];
    for (let k = 0; k < height; k++) {
      // The row is composed at its slots and cut at the glass — never squeezed,
      // so the cells that fit are whole. Trailing pad is trimmed FIRST: a cut
      // that lands in a row's own padding would put a `…` on the glass claiming
      // a loss that did not happen.
      block.push(
        cut(cellLines.map((l, i) => l[k] ?? " ".repeat(slots[i]!)).join(bodySep).replace(/[ ]+$/, "")),
      );
    }
    bodyDrawn.push(block);
  }

  // Trailing pad spaces are ours, not content — trim per line BEFORE measuring,
  // so the rule brackets what is actually drawn and not what was padded.
  const trim = (l: string): string => l.replace(/[ ]+$/, "");
  const headLines = headDrawn.map(trim);
  const bodyBlocks = bodyDrawn.map((b) => b.map(trim).join("\n"));

  // The rule is the TABLE's width, not the glass's (BRF-TABLE-LADDER): a bracket
  // wider than its contents is a promise the table does not keep, and it was up
  // to 103 columns of air under the bar. Measured off the lines actually
  // emitted, so the bar cannot disagree with the cells it brackets.
  const tableWidth = [...headDrawn, ...bodyDrawn.flat()].reduce(
    (a, l) => Math.max(a, displayWidth(trim(l))),
    0,
  );
  const rule = styler.rule(tableWidth);

  // Header block + its rule (the rule belongs to the header, not the rows); body
  // rows keep a 3-space gutter so columns align with the header separators.
  // Loose rows: a blank line between BLOCKS. A wrapped row is one block — its
  // lines stay contiguous, or the grid dissolves into single-column stripes.
  const headPart = headLines.length > 0 ? headLines.join("\n") + "\n" + rule + "\n\n" : "";
  const bodyPart = bodyBlocks.length > 0 ? bodyBlocks.join("\n\n") + "\n\n" : "";
  return headPart + bodyPart + rule + "\n\n";
}

/** Right-anchored role layout for patterned surfaces (ADR-022, td-b81597):
 *  the menu pattern as a closed vocabulary — number (floor) at the far
 *  right edge, callsign its stable home left of it, slug filling leftward.
 *  Suppression, not wrap: the slug truncates with `…` (the transition
 *  rung), then suppresses entirely when the budget can't hold a scan
 *  unit; the callsign+number floor never reflows — freed space is empty
 *  left. The strong-stop and the stable home are the same thing: the
 *  number is always at the right edge; widening reverses the ladder
 *  (suppressed → truncated → full slug). The compositor emits full
 *  content; the renderer truncates to the live budget (retires
 *  reg-menu's 50-char slug cap — a compositor guessing width it
 *  doesn't have). */
function renderMenuTable(t: TableState, ctx: Ctx): string {
  const { styler, width } = ctx;
  const header = t.headerRows[0] ?? [];
  const rows = t.bodyRows;

  const GUTTER = 3; // matches the generic body gutter
  const csW = Math.max(
    1,
    ...rows.map((r) => displayWidth(r[1]?.text ?? "")),
    displayWidth(header[1]?.text ?? ""),
  );
  const numW = Math.max(
    1,
    ...rows.map((r) => displayWidth(r[2]?.text ?? "")),
    displayWidth(header[2]?.text ?? ""),
  );
  const rightW = csW + GUTTER + numW;
  const slugBudget = width - rightW - GUTTER;
  const floorFits = rightW + GUTTER <= width;

  const out: string[] = [];
  // The degenerate branch mirrors the body's: the floor itself overruns,
  // so the header elides the callsign slot and drops the pipes — the
  // columns are the scan signal, and they still align with the body.
  const csSlot = Math.max(1, width - numW - GUTTER);
  if (header.length > 0) {
    if (floorFits) {
      const sep = ` ${styler.tablePipe()} `;
      const h0 = styler.roleBold("table-header", header[0]?.text ?? "");
      const h1 = styler.roleBold("table-header", header[1]?.text ?? "");
      const h2 = styler.roleBold("table-header", header[2]?.text ?? "");
      const slugPart = slugBudget >= 4
        ? padDisplay(elideToWidth(h0, slugBudget), width - rightW - GUTTER)
        : " ".repeat(width - rightW - GUTTER);
      out.push(slugPart + sep + padDisplay(h1, csW) + sep + padStartDisplay(h2, numW));
    } else {
      const h1 = styler.roleBold("table-header", header[1]?.text ?? "");
      const h2 = styler.roleBold("table-header", header[2]?.text ?? "");
      out.push(
        padDisplay(elideToWidth(h1, csSlot), csSlot) +
          " ".repeat(GUTTER) + padStartDisplay(h2, numW),
      );
    }
    out.push(styler.rule(width));
  }
  for (const r of rows) {
    const num = r[2]?.text ?? "";
    const cs = r[1]?.text ?? "";
    let line: string;
    if (!floorFits) {
      // Degenerate: the floor itself overruns — elide the callsign, the
      // number keeps its home (width floor 10 means numW always fits).
      line = padDisplay(elideToWidth(cs, csSlot), csSlot) +
        " ".repeat(GUTTER) + padStartDisplay(num, numW);
    } else {
      const rb = padDisplay(cs, csW) + " ".repeat(GUTTER) +
        padStartDisplay(num, numW);
      const slug = styler.roleBold("table-key", r[0]?.text ?? "");
      const left = slugBudget >= 4
        ? padDisplay(elideToWidth(slug, slugBudget), width - rightW)
        : " ".repeat(width - rightW); // suppressed — freed space is empty left
      line = left + rb;
    }
    out.push(line);
  }
  if (header.length > 0 || rows.length > 0) out.push(styler.rule(width));
  // Trailing pad spaces are ours, not content — trim per line (loose rows
  // keep the blank line between; the header rule belongs to the header).
  const trimmed = out.map((l) => l.replace(/[ ]+$/, ""));
  if (header.length > 0) {
    return trimmed.slice(0, 2).join("\n") + "\n\n" +
      trimmed.slice(2).join("\n\n") + "\n\n";
  }
  return trimmed.join("\n\n") + "\n\n";
}

/** Pad or align a cell to its column width. It never elides: under
 *  ADR-TABLE-EDGE-CUT-055 a table is composed at the author's widths and the
 *  composed LINE is cut at the glass, so a cell is only ever padded. Colour is
 *  applied by the caller; elision is `cut`'s job, at the edge. */
function padNatural(c: Cell, i: number, colWidth: number[]): string {
  const w = colWidth[i]!;
  switch (c.align) {
    case "right":
      return padStartDisplay(c.text, w);
    case "center":
      return padCenterDisplay(c.text, w);
    default:
      return padDisplay(c.text, w);
  }
}

/** Final document assembly: strip tags, apply margins, tidy edges. */
function finalize(rendered: string): string {
  const stripped = stripTags(rendered);
  // 2-char left margin on every non-empty line (Glow Document margin).
  // Right margin is implicit: wrap used (width - 4), so content stops
  // 2 cols short of the terminal edge.
  const margined = stripped
    .split("\n")
    .map((l) => (l === "" ? "" : "  " + l))
    .join("\n");
  // Leading blank line — Glow parity: breathing room above the doc.
  return "\n" + margined.replace(/\n+$/, "") + "\n";
}
