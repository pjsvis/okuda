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
 *  Detects the glyph after any leading ANSI escapes (inline-styled
 *  cells may carry SGR before the visible char). Pure; in none mode the
 *  colour drops but the weight survives (roleBold emits SGR 1). */
function styleStateGlyph(text: string, styler: ReturnType<typeof makeStyler>): string {
  if (text === "") return text;
  // Find the first visible char by skipping leading ANSI SGR sequences.
  const stripped = stripANSI(text);
  const first = [...stripped][0];
  if (first === undefined) return text;
  const role = STATE_GLYPH_ROLE[first];
  if (!role) return text;
  // Locate the glyph in the original (with ANSI) by matching the
  // stripped prefix length, then splice the styled glyph in.
  const prefixLen = stripped.length - [...stripped].slice(1).join("").length;
  // Walk the original text, counting visible chars until we hit the glyph.
  let visStart = -1;
  let visible = 0;
  const re = /\x1b\[[0-9;]*m/g;
  let m: RegExpExecArray | null;
  let i = 0;
  for (;;) {
    re.lastIndex = i;
    m = re.exec(text);
    const ansiStart = m ? m.index : text.length;
    if (visible === 0) { visStart = ansiStart; break; }
    // count chars between i and ansiStart
    if (ansiStart > i) {
      const chunk = text.slice(i, ansiStart);
      visible += [...chunk].length;
    }
    i = m ? m.index + m[0].length : text.length;
    if (!m) break;
  }
  if (visStart < 0) visStart = 0;
  const glyph = first;
  return text.slice(0, visStart) + styler.roleBold(role, glyph) + text.slice(visStart + prefixLen);
}

export interface RenderOptions {
  width: number;
  palette?: Palette;
  color?: ColorMode;
  /** Override mermaid binary path (default: ~/.local/bin/mermaid-to-md, then $PATH). */
  mermaidBin?: string;
  /** Override chroma binary path (default: $PATH lookup). */
  chromaBin?: string;
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
    // raw blocks (code/diagrams) bypass it and may overflow the right
    // gutter — art is art.
    width: Math.max(10, opts.width - 4),
    fullWidth: opts.width,
    styler,
    color,
    palette,
    table: null,
    mermaid: new Map(),
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

  // Pre-pass 3: intercept mermaid fences → pipe to binary → placeholder tokens.
  const source3 = await interceptMermaid(source2, opts, ctx);

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

/** Replace mermaid fences with placeholder tokens; stash classified art. */
async function interceptMermaid(
  source: string,
  opts: RenderOptions,
  ctx: Ctx,
): Promise<string> {
  const fences: { code: string; title: string | null }[] = [];
  const src = source.replace(
    /(^|\n)```mermaid\n([\s\S]*?)\n?```/g,
    (_m, lead: string, code: string) => {
      // Extract a leading `title: <caption>` line (mermaid-native) before
      // piping — the binary doesn't parse the directive and would dump it
      // as a literal box. okuda renders the title at the diagram's
      // indicator line (diagramBlock), where the `⋮ mermaid source elided`
      // statement sat. Only a title at the very first line is honoured —
      // mid-fence `title:` is mermaid syntax we don't own.
      let title: string | null = null;
      const firstNl = code.indexOf("\n");
      const firstLine = firstNl === -1 ? code : code.slice(0, firstNl);
      const tm = firstLine.match(/^title:\s*(.+?)\s*$/);
      if (tm) {
        title = tm[1]!;
        code = firstNl === -1 ? "" : code.slice(firstNl + 1);
      }
      fences.push({ code, title });
      return `${lead}${mermaidToken(String(fences.length - 1))}`;
    },
  );
  if (fences.length === 0) return src;

  const arts = await Promise.all(
    fences.map(async (f) => {
      const out = await spawnMermaid(f.code, opts);
      if (out === "") return null;
      return { art: extractDiagramArt(out), title: f.title };
    }),
  );
  for (const [i, entry] of arts.entries()) {
    if (entry === null) continue;
    ctx.mermaid.set(String(i), entry);
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
  const re = /(^|\n)```([^\n`]*)\n([\s\S]*?)\n?```/g;
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
 * them would fight the terminal's palette for the same bytes. */
function codeBlockLines(lines: string[], ctx: Ctx): string {
  const open = tagRawOpen("code");
  const body = lines.map((l) => (l === "" ? "" : "  " + elideToWidth(l, ctx.width)));
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
      const lines = wrapANSI(markers + " " + stripHtml(children), { width: wrapW });
      return (
        lines
          .map((l, i) => {
            if (l === "") return "";
            const body =
              i === 0
                ? styler.headingBadge(markers) +
                  styler.roleBold("heading", l.slice(markers.length))
                : styler.roleBold("heading", l);
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
      // line is hard-truncated to the content width with `…` at the cut
      // — the terminal never soft-wraps what okuda emits (a wrapped code
      // line is one line pretending to be two). Budget: handler margin 2
      // + finalize margin 2 + ctx.width = exactly the terminal width.
      const body = children.replace(/\n$/, "");
      const open = tagRawOpen("code");
      const lines = body
        .split("\n")
        .map((l) => (l === "" ? "" : styler.codeLine("  " + elideToWidth(l, width))));
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

/** Mermaid ASCII block: classified, coloured, never wrapped. Beneath
 *  the art, one muted indicator line names the source's home — the
 *  source itself is not rendered (it is tautological in a single-render
 *  seam; `mermaid-to-md --verify` is the drift check, and it reads the
 *  .md, not the render). The `⋮` glyph borrows the state-parked lexicon
 *  ("elided into a further question"). (brief: mermaid-source-omitted.) */
function diagramBlock(art: string, ctx: Ctx, title?: string | null): string {
  const open = tagRawOpen("diagram");
  const lines = art.split("\n").map((l) => {
    if (l === "") return "";
    if (ctx.color === "none") return l; // byte-identical to the binary's output
    return classifyDiagramLine(l, ctx.palette, ctx.color) + "\x1b[0m";
  });
  // Indicator line: the diagram's caption. A leading `title: <caption>`
  // in the mermaid fence (extracted pre-pipe by interceptMermaid) lands
  // here — the `⋮` leads (state-parked colour, vocabulary parity), the
  // caption follows in the muted register. Every fence states the elision
  // (BRF-PROJECTION-LOSSES): the notice used to ride only the untitled
  // branch, so 22 of the silo's 58 fences never said the source is not
  // shown. The titled branch appends the SHORTER clause, and the reason
  // is measured — this line is RAW-protected and never wrapped, and the
  // silo's longest title (51 columns) plus `· mermaid source elided`
  // measures 79 against a 78-column budget at width 80. `source elided`
  // measures 71. The untitled branch keeps its exact bytes: 36 fences
  // already read `mermaid source elided` and nothing here changes them.
  // The glyph keeps its weight under NO_COLOR (roleBold emits SGR 1 —
  // colour drops, attributes survive); the `⋮` reads as a control among
  // the art.
  const glyph = ctx.styler.roleBold("state-parked", "⋮");
  const stmt = title
    ? ctx.styler.role("muted", " " + title + " · source elided")
    : ctx.styler.role("muted", " mermaid source elided");
  const indOpen = tagRawOpen("diagramsrc");
  return `${open}${lines.join("\n")}${TAG_RAW_CLOSE}\n${indOpen}${glyph}${stmt}${TAG_RAW_CLOSE}\n\n`;
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

  // Natural column widths from cell display width.
  const colWidth = new Array<number>(cols).fill(0);
  const measure = (cell: Cell | undefined, i: number): void => {
    const w = cell ? displayWidth(cell.text) : 0;
    colWidth[i] = Math.max(colWidth[i]!, w);
  };
  header.forEach(measure);
  for (const r of rows) r.forEach(measure);

  const gutter = 3;
  let total = colWidth.reduce((a, b) => a + b, 0) + gutter * (cols - 1);

  // Fit the terminal width — never overflow (table policy). Shrink wide
  // tables by wrapping the widest columns to a proportional budget.
  if (total > width && cols > 0) {
    const budget = width - gutter * (cols - 1);
    const sum = colWidth.reduce((a, b) => a + b, 0);
    const floors = colWidth.map(() => 3);
    const floorSum = floors.reduce((a, b) => a + b, 0);
    if (budget >= floorSum) {
      colWidth.forEach((w, i) => {
        const natural = Math.max(0, w - 3);
        const share =
          floors[i]! +
          Math.floor(((budget - floorSum) * natural) / Math.max(1, sum - floorSum));
        colWidth[i] = Math.min(w, share);
      });
    }
    total = colWidth.reduce((a, b) => a + b, 0) + gutter * (cols - 1);
  }

  const out: string[] = [];
  // Header row: purple bold + `│` separators (grid cue); header rule +
  // closing rule span the FULL content width (glow parity — the bar is
  // the table-scan signal, not the table's natural width). Body rows
  // keep a 3-space gutter so columns align with the header separators.
  // In-cell wraps are zipped line-by-line (zipRow) so columns hold —
  // the fix for the word-salad fault where a wrapped cell's \n dumped
  // its tail to the left margin and dragged siblings out of column.
  const sep = ` ${styler.tablePipe()} `;
  const bodySep = " ".repeat(gutter);
  if (header.length > 0) {
    const cells = header.map((c, i) =>
      padCell(
        { text: styler.roleBold("table-header", c.text), align: c.align },
        i, colWidth,
      ),
    );
    out.push(zipRow(cells, colWidth, sep));
    out.push(styler.rule(width));
  }
  for (const r of rows) {
    const cells: string[][] = [];
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
      cells.push(padCell(cell, i, colWidth));
    }
    out.push(zipRow(cells, colWidth, bodySep));
  }
  // Closing rule under the table (Glow parity: tables are bracketed,
  // full content width).
  if (header.length > 0 || rows.length > 0) {
    out.push(styler.rule(width));
  }
  // Loose rows: blank line between rows. The header rule sits directly
  // under the header — it belongs to the header, not the rows. Trailing
  // pad spaces are ours, not content — trim them per line (a wrapped row
  // is a multi-line block — trim each line within it).
  const trimmed = out.map((block) =>
    block.split("\n").map((l) => l.replace(/[ ]+$/, "")).join("\n"),
  );
  if (header.length > 0) {
    return trimmed.slice(0, 2).join("\n") + "\n\n" +
      trimmed.slice(2).join("\n\n") + "\n\n";
  }
  return trimmed.join("\n\n") + "\n\n";
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

/** Pad a cell to its column width, returning one line per wrapped row.
 *  Colour is applied by the caller (to `c.text` before this call);
 *  wrapANSI is ANSI-state-aware and re-emits SGR at wrap boundaries, so
 *  coloured-then-wrapped cells stay coloured through the wrap. Each
 *  emitted line is padded to the column width (display-aware) so columns
 *  align under the header separators. */
function padCell(c: Cell, i: number, colWidth: number[]): string[] {
  const w = colWidth[i]!;
  const raw = c.text;
  if (displayWidth(raw) > w) {
    return wrapANSI(raw, { width: w }).map((l) => padDisplay(l, w));
  }
  switch (c.align) {
    case "right":
      return [padStartDisplay(raw, w)];
    case "center":
      return [padCenterDisplay(raw, w)];
    default:
      return [padDisplay(raw, w)];
  }
}

/** Zip multi-line cells into aligned row lines. Each cell is an array
 *  of pre-padded lines (padCell output); blank-pad short cells to the
 *  row height, then join line N of every cell with the separator. This
 *  is what holds columns through in-cell wraps — the single fix for the
 *  word-salad fault on wide/crowded tables (sections 5/7/10 of the
 *  table audit). */
function zipRow(cells: string[][], colWidth: number[], sep: string): string {
  const height = Math.max(...cells.map((c) => c.length));
  const lines: string[] = [];
  for (let n = 0; n < height; n++) {
    const parts = cells.map((c, i) => c[n] ?? " ".repeat(colWidth[i]!));
    lines.push(parts.join(sep));
  }
  return lines.join("\n");
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
