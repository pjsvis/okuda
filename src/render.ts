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
  RE_INLINE_HTML,
  RE_MERMAID_TOKEN,
  TAG_ITEM,
  TAG_NESTED_CLOSE,
  TAG_RAW_CLOSE,
  mermaidToken,
  stripTags,
  tagNestedOpen,
  tagRawOpen,
} from "./grammar";
import { loadPalette, type Palette } from "./palette";
import {
  displayWidth,
  padCenterDisplay,
  padDisplay,
  padStartDisplay,
} from "./width";
import { wrapANSI } from "./wrap";

/** Left indent for list blocks, inside the content margin (Glow list level_indent). */
const LIST_INDENT = 2;

export interface RenderOptions {
  width: number;
  palette?: Palette;
  color?: ColorMode;
  /** Override mermaid binary path (default: ~/.local/bin/mermaid-to-md, then $PATH). */
  mermaidBin?: string;
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

/** Extract the mermaid source checksum (the ```mmd fence the binary emits). */
export function extractDiagramChecksum(binaryOutput: string): string | null {
  const m = binaryOutput.match(/```mmd\n([\s\S]*?)\n?```/);
  if (!m) return null;
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
  styler: ReturnType<typeof makeStyler>;
  color: ColorMode;
  palette: Palette;
  table: TableState | null;
  mermaid: Map<string, { art: string; checksum: string | null }>;
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
    styler,
    color,
    palette,
    table: null,
    mermaid: new Map(),
  };

  // Pre-pass: intercept mermaid fences → pipe to binary → placeholder tokens.
  const source2 = await interceptMermaid(source, opts, ctx);

  const rendered = Bun.markdown.render(source2, handlers(ctx), {
    ...PARSER_OPTIONS,
  });

  return finalize(rendered);
}

/** Replace mermaid fences with placeholder tokens; stash classified art. */
async function interceptMermaid(
  source: string,
  opts: RenderOptions,
  ctx: Ctx,
): Promise<string> {
  const fences: string[] = [];
  const src = source.replace(
    /(^|\n)```mermaid\n([\s\S]*?)\n?```/g,
    (_m, lead: string, code: string) => {
      fences.push(code);
      return `${lead}${mermaidToken(String(fences.length - 1))}`;
    },
  );
  if (fences.length === 0) return src;

  const arts = await Promise.all(
    fences.map(async (code) => {
      const out = await spawnMermaid(code, opts);
      if (out === "") return null;
      return { art: extractDiagramArt(out), checksum: extractDiagramChecksum(out) };
    }),
  );
  for (const [i, entry] of arts.entries()) {
    if (entry === null) continue;
    ctx.mermaid.set(String(i), entry);
  }
  return src;
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
      const marker = "#".repeat(level) + " ";
      const lines = wrapANSI(marker + stripHtml(children), { width });
      return (
        lines
          .map((l) => (l === "" ? "" : styler.roleBold("heading", l)))
          .join("\n") + "\n\n"
      );
    },

    paragraph(children: string) {
      // Mermaid placeholder paragraph → the classified ASCII block.
      const m = children.trim().match(RE_MERMAID_TOKEN);
      if (m) {
        const entry = ctx.mermaid.get(m[1]!);
        if (entry !== undefined) return diagramBlock(entry.art, entry.checksum, ctx);
        return ""; // pipe failed → drop the placeholder silently
      }
      const lines = wrapBlock(stripHtml(children));
      return lines.join("\n") + "\n\n";
    },

    text(children: string) {
      return stripHtml(children);
    },

    strong(children: string) {
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
      // Fenced code (mermaid never reaches here — pre-pass). Never wrapped.
      const body = children.replace(/\n$/, "");
      const open = tagRawOpen("code");
      const lines = body
        .split("\n")
        .map((l) => (l === "" ? "" : styler.codeLine("  " + l)));
      return `${open}${lines.join("\n")}${TAG_RAW_CLOSE}\n\n`;
    },

    blockquote(children: string) {
      return quoteBlock(children, ctx);
    },

    // List items emit a placeholder; the `list` handler assigns markers
    // (bun 1.3.8 passes no listItem metadata — decisions/005).
    listItem(children: string) {
      return TAG_ITEM + children;
    },

    list(children: string, meta: { ordered: boolean; start?: number }) {
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
      t.row.push({ text: children, align: meta?.align });
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

/** Mermaid ASCII block: classified, coloured, never wrapped. The
 *  checksum (original mermaid source) follows as a muted code block. */
function diagramBlock(art: string, checksum: string | null, ctx: Ctx): string {
  const open = tagRawOpen("diagram");
  const lines = art.split("\n").map((l) => {
    if (l === "") return "";
    if (ctx.color === "none") return l; // byte-identical to the binary's output
    return classifyDiagramLine(l, ctx.palette, ctx.color) + "\x1b[0m";
  });
  let out = `${open}${lines.join("\n")}${TAG_RAW_CLOSE}`;
  // Checksum: the mermaid source, muted, beneath the diagram.
  if (checksum) {
    const csOpen = tagRawOpen("checksum");
    const csLines = checksum.split("\n").map((l) =>
      l === "" ? "" : ctx.styler.role("muted", "  " + l),
    );
    out += `\n${csOpen}${csLines.join("\n")}${TAG_RAW_CLOSE}`;
  }
  return out + "\n\n";
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
    // Pass B (2026-08-24): blockquote text styled to match glow —
    // yellow (#f1fa8c) italic, the same SGR as emphasis. (snagging item 6)
    // The │ pipe stays as an okuda divergence (candidate ADR-007 row).
    const lines = wrapANSI(seg.text, { width: width - 2 });
    for (const line of lines) {
      out.push(line === "" ? "" : styler.quotePipe() + " " + styler.roleItalic("emphasis", line));
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
    const avail = Math.max(4, width - textCol - LIST_INDENT);
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
          lines.push(markerPrefix + line);
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

  // Natural column widths from cell display width.
  const colWidth = new Array<number>(cols).fill(0);
  const measure = (cell: Cell | undefined, i: number): void => {
    const w = cell ? displayWidth(cell.text) : 0;
    colWidth[i] = Math.max(colWidth[i]!, w);
  };
  header.forEach(measure);
  for (const r of rows) r.forEach(measure);

  const gutter = 2;
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
  // Header row: cyan + bold; header rule kept; alignment carried.
  if (header.length > 0) {
    const cells = header.map((c, i) =>
      styler.roleBold("table-header", pad(c, i, colWidth, styler.mode)),
    );
    out.push(cells.join(" ".repeat(gutter)));
    const ruleW = Math.min(total, width);
    out.push(styler.rule(ruleW));
  }
  for (const r of rows) {
    const padded: string[] = [];
    for (let i = 0; i < cols; i++) {
      const cell: Cell = i === 0
        ? { text: styler.roleBold("table-key", r[0]?.text ?? ""), align: r[0]?.align }
        : r[i] ?? { text: "" };
      padded.push(pad(cell, i, colWidth, styler.mode));
    }
    out.push(padded.join(" ".repeat(gutter)));
  }
  // Closing rule under the table (Glow parity: tables are bracketed).
  if (header.length > 0 || rows.length > 0) {
    const ruleW = Math.min(total, width);
    out.push(styler.rule(ruleW));
  }
  // Loose rows: blank line between rows. The header rule sits directly
  // under the header — it belongs to the header, not the rows. Trailing
  // pad spaces are ours, not content — trim them per line.
  const trimmed = out.map((l) => l.replace(/[ ]+$/, ""));
  if (header.length > 0) {
    return trimmed.slice(0, 2).join("\n") + "\n\n" +
      trimmed.slice(2).join("\n\n") + "\n\n";
  }
  return trimmed.join("\n\n") + "\n\n";
}

function pad(c: Cell, i: number, colWidth: number[], mode: string): string {
  const w = colWidth[i]!;
  const raw = c.text;
  if (displayWidth(raw) > w) {
    // Cell content wider than its column (post-shrink): wrap in-cell.
    return wrapANSI(raw, { width: w })
      .map((l) => (mode === "none" ? l : padDisplay(l, w)))
      .join("\n");
  }
  switch (c.align) {
    case "right":
      return padStartDisplay(raw, w);
    case "center":
      return padCenterDisplay(raw, w);
    default:
      return padDisplay(raw, w);
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
