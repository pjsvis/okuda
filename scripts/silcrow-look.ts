#!/usr/bin/env bun
/**
 * silcrow-look.ts — the search row, looked at.
 *
 * Three modes, one frozen capture:
 *   --control   fzf's row, faithfully (pointer + match paint), no silcrow.
 *               The baseline. Hold it next to `just search-replay`.
 *   (default)   the agreed row: the address column as the cursor — only the
 *               selected § is rubricated — then callsign (if any), filename,
 *               text. Match terms bold. Selected row is NOT bold (bold is
 *               the match's channel, so selection stays positional).
 *   --variants  the early address-only experiments, kept for the record.
 *
 * The control's paint is lifted from a live fzf 0.74.4 capture, not
 * guessed: pointer ▌ bold #f297cd; fg+ bold #eaeaea; fg #cacacc; match
 * bold+underline #dfa21a (the launcher's --color). The chrome (border,
 * prompt, info, header) is deliberately not reproduced — constant across
 * control and variant, so it cancels.
 *
 * Frozen input: --from reads a capture the recipe froze, so two parties
 * address the same bytes (rg's body-channel order is not deterministic
 * yet — td-975a6e). Addresses come from the real allocator (buildJumpMap,
 * fed in rank order); callsigns from the real registry reader.
 *
 * Ephemeral in its input, not its code: the *capture* it reads is frozen and
 * throwaway (`just silcrow-freeze`), while this renderer is kept — it is the
 * look gate of record for `BRF-SEARCH-ROW`, and the recipes in the justfile
 * point here. It reports a ceiling; it is an instrument, not the judge.
 *
 * Usage:
 *   bun scripts/silcrow-look.ts --from tmp/silcrow-look.entries silcrow --focus 3
 *   bun scripts/silcrow-look.ts --from tmp/silcrow-look.entries silcrow --selected-bold
 *   bun scripts/silcrow-look.ts --from tmp/silcrow-look.entries silcrow --control
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { loadPalette } from "../src/palette";
import { makeCallsignResolver, TIER_REGISTRIES } from "../src/root";
import { buildJumpMap, MAX_ADDRESSES } from "../src/vectors";

const ROOT = join(import.meta.dir, "..");
const NO_COLOR = !!process.env.NO_COLOR;
const RESET = "\x1b[0m";
const DIM = "\x1b[2m";
const PLAIN = "\x1b[0m";

// ── args ─────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const has = (n: string): boolean => argv.includes(`--${n}`);
const flag = (n: string, dflt: number): number => {
  const i = argv.indexOf(`--${n}`);
  return i === -1 ? dflt : Number(argv[i + 1]);
};
const N = flag("n", 30);
const EDGE = flag("edge", 80);
const COLS = flag("cols", process.stdout.columns || 100);
const FOCUS = flag("focus", 1); // the selected row (1-indexed)
const CONTROL = has("control");
const VARIANTS = has("variants");
const MODE = CONTROL ? "control" : VARIANTS ? "variants" : "row";
const BLANK = has("blank");
const HIGHLIGHT = has("highlight") || MODE === "control" || MODE === "row";
const CALLSIGN = has("callsign-first") ? true : has("no-callsign") ? false : true;
const SELECTED_BOLD = has("selected-bold");
const ATTRS = has("attrs"); // the channel control: which SGR does the glass render?
const QUIET = has("quiet"); // rows only — no header, no edge, no criteria
const PLANK = has("plank") ? argv[argv.indexOf("--plank") + 1]! : "both"; // rose | neutral | off | both
const FROM = has("from") ? argv[argv.indexOf("--from") + 1]! : null;

const VALUE_FLAGS = new Set(["--n", "--edge", "--cols", "--focus", "--from", "--plank"]);
const positional: string[] = [];
for (let i = 0; i < argv.length; i++) {
  const a = argv[i]!;
  if (a.startsWith("--")) {
    if (VALUE_FLAGS.has(a)) i++;
    continue;
  }
  positional.push(a);
}
const QUERY = positional[0] ?? "silcrow";

// ── the freeze: one capture, one render ──────────────────────────────
let raw: string;
if (FROM) {
  raw = await Bun.file(FROM).text();
} else {
  const proc = Bun.spawn(["./okuda", "--entries", QUERY], { cwd: ROOT, stdout: "pipe" });
  raw = await new Response(proc.stdout).text();
  await proc.exited;
}
const entries = raw.split("\n").filter(Boolean);

// ── the real allocator, fed in rank order ────────────────────────────
const map = buildJumpMap(entries.map((e, i) => ({ pos: i, end: i, target: e.split("\t")[0]! })));
const numOf = new Map<string, number>();
for (const [n, target] of map) if (!numOf.has(target)) numOf.set(target, n);

// ── the real registry reader (callsign per path) ─────────────────────
const callsignFor = CALLSIGN ? makeCallsignResolver(ROOT) : () => null;

// ── the date per path ────────────────────────────────────────────────
// The register carries it (decisions are numbered, not dated, so the path
// can't supply it); the path is the fallback for unregistered docs/ rows.
// ISO, because `2026-10-12` sorts lexically *as* chronologically — the
// column's left-to-right reading is its top-to-bottom reading.
const dateOf = (() => {
  const idx = new Map<string, string>();
  for (const [dir, file] of TIER_REGISTRIES) {
    try {
      for (const line of readFileSync(join(ROOT, dir, file), "utf8").split("\n")) {
        if (!line.trim()) continue;
        const e = JSON.parse(line) as { file?: string; date?: string };
        if (e.file && e.date) idx.set(`${dir}/${e.file}`, e.date);
      }
    } catch {
      /* absent tier */
    }
  }
  return (path: string): string | null => {
    const reg = idx.get(path);
    if (reg) return reg;
    return path.match(/\d{4}-\d{2}-\d{2}/)?.[0] ?? null;
  };
})();

/** Drop the leading date from a path/name — the date column supplies it,
 *  so the identifier must not repeat it (the elision economy, applied to
 *  the date). */
const stripDate = (p: string): string => p.replace(/(\d{4}-\d{2}-\d{2})-?/, "");

/** Join fields with a two-space gap, recording which spans are tokens (a
 *  match inside a token lights the whole token). */
function buildFields(fields: Array<{ text: string; token: boolean }>): {
  content: string;
  tokens: Array<[number, number]>;
} {
  let pos = 0;
  const parts: string[] = [];
  const tokens: Array<[number, number]> = [];
  for (const f of fields) {
    if (!f.text) continue;
    if (parts.length) pos += 2;
    parts.push(f.text);
    if (f.token) tokens.push([pos, pos + f.text.length]);
    pos += f.text.length;
  }
  return { content: parts.join("  "), tokens };
}

// ── paint (lifted from fzf 0.74.4) ───────────────────────────────────
const pal = loadPalette();
const rgb = (hex: string): string => {
  const n = parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255};${(n >> 8) & 255};${n & 255}`;
};
/** SGR for a role + attributes. Under NO_COLOR the colour drops and the
 *  attributes survive (the doc's own rule: the § keeps its weight). */
const S = (hex: string, mods = ""): string =>
  NO_COLOR ? (mods ? `\x1b[${mods}m` : "") : `\x1b[${mods ? mods + ";" : ""}38;2;${rgb(hex)}m`;

const HL = "#dfa21a"; // launcher --color=hl / hl+ / selected-hl
const POINTER = "#f297cd"; // fzf default pointer
const FG_FOCUS = "#eaeaea"; // fzf default fg+
const FG = "#cacacc"; // fzf default fg
// A mid brightness between muted and text — the date's step on the ramp.
// Ad-hoc for the look: the honest home for it is a palette role (a fourth
// level), which is a decision, not a hex in the panel.
const MID = "#878f99";

const visible = (s: string): number => [...s.replace(/\x1b\[[0-9;]*m/g, "")].length;
const clip = (s: string, n: number): string => [...s].slice(0, Math.max(0, n)).join("");
const reset = (): string => (NO_COLOR ? "\x1b[0m" : RESET);

// ── mode: attrs — the channel control ────────────────────────────────
// A detector needs a control, for the *channel* too. Prints the same
// truecolor text under each attribute the design might lean on, so the
// glass can be asked which ones it actually renders. If bold is a no-op
// here, "bold for the match" is a claim that does not cash out.
if (ATTRS) {
  const sample = "DBF-CODE-SILCROWS silcrow debriefs";
  const rows: Array<[string, string]> = [
    ["plain  #cacacc", S(FG)],
    ["brighter #eaeaea", S(FG_FOCUS)],
    ["bold  (SGR 1)", S(FG, "1")],
    ["underline (SGR 4)", S(FG, "4")],
    ["bold+underline", S(FG, "1;4")],
    ["dim   (SGR 2)", "\x1b[2;38;2;202;202;204m"],
    ["reverse (SGR 7)", "\x1b[7;38;2;202;202;204m"],
    ["amber plain", S(HL)],
    ["amber bold", S(HL, "1")],
    ["amber bold+underline", S(HL, "1;4")],
    ["brighter amber", "\x1b[38;2;255;196;60m"],
  ];
  for (const [label, sgr] of rows) {
    console.log(`${DIM}${label.padEnd(22)}${PLAIN}│${sgr}${sample}${reset()}│`);
  }
  process.exit(0);
}

/** fzf's row text: `path␣␣snippet` (the tab is the gap the eye sees). */
function rowText(entry: string): string {
  const [path, snippet = ""] = entry.split("\t");
  return snippet ? `${path}  ${snippet}` : path;
}

/** `--exact`, single/multi term: each whitespace term is a literal,
 *  case-insensitive substring. The sigil grammar (!word, dir/, @date) is
 *  NOT modelled — the look gate needs plain terms. */
function matchRanges(text: string, query: string): Array<[number, number]> {
  const ranges: Array<[number, number]> = [];
  for (const term of query.trim().split(/\s+/).filter((t) => t && !t.startsWith("!"))) {
    const needle = term.toLowerCase();
    const hay = text.toLowerCase();
    for (let i = 0; (i = hay.indexOf(needle, i)) !== -1; i += needle.length) {
      ranges.push([i, i + needle.length]);
    }
  }
  return ranges.sort((a, b) => a[0] - b[0]);
}

/** A match that lands inside a token lights the WHOLE token — the token is
 *  the match unit, not the character run. The callsign is a name (`the-
 *  silcrow.md`: names for recognition) and `CALLSIGN_SHAPE` is already
 *  token-boundaried, so splitting `DBF-CODE-SILCROWS` at `SILCROW` splits the
 *  recognition unit in half. Because the callsign starts at a fixed x, whole-
 *  token lights align into a column — structure, where scattered runs are noise. */
function expandTokens(ranges: Array<[number, number]>, tokens: Array<[number, number]>): Array<[number, number]> {
  const out = ranges.map(([s, e]) => tokens.find(([ts, te]) => s < te && e > ts) ?? [s, e] as [number, number]);
  out.sort((a, b) => a[0] - b[0]);
  const merged: Array<[number, number]> = [];
  for (const r of out) {
    const last = merged[merged.length - 1];
    if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1]);
    else merged.push([...r] as [number, number]);
  }
  return merged;
}

/** Paint a line: base role/attributes, matches bold amber. Underline is
 *  opt-in: the agreed row drops it (a third channel for one signal, and
 *  the rungs never line up), while the fzf control keeps it. */
function paintContent(text: string, query: string, baseHex: string, baseMods: string, underline = false, tokens: Array<[number, number]> = []): string {
  const ranges = expandTokens(HIGHLIGHT ? matchRanges(text, query) : [], tokens);
  const base = S(baseHex, baseMods);
  const hl = S(HL, underline ? "1;4" : "1");
  if (ranges.length === 0) return base + text + reset();
  let out = "";
  let pos = 0;
  for (const [s, e] of ranges) {
    if (s < pos) continue; // overlapping term
    if (s > pos) out += base + text.slice(pos, s);
    out += hl + text.slice(s, e);
    pos = e;
  }
  if (pos < text.length) out += base + text.slice(pos);
  return out + reset();
}

// ── mode: control — fzf's row, no silcrow ────────────────────────────
if (MODE === "control") {
  entries.slice(0, N).forEach((e, i) => {
    const focus = i + 1 === FOCUS;
    const pointer = focus ? S(POINTER, "1") + "▌" : " ";
    const gutter = S(FG) + " ";
    const text = clip(rowText(e), COLS - 2);
    console.log(pointer + gutter + paintContent(text, QUERY, focus ? FG_FOCUS : FG, focus ? "1" : "", true));
  });
  process.exit(0);
}

// ── mode: the agreed row ─────────────────────────────────────────────
/** The address cell is the cursor column: only the selected § is
 *  rubricated. Fixed 3 cells so the column aligns; an unaddressed row
 *  (past 80) shows blank, and if the *selected* row is unaddressed the §
 *  alone marks the cursor rather than going blind.
 *
 *  Unselected addresses take the muted role — a step *dimmer* than the
 *  row text. The address is furniture except where it is actionable
 *  (names for recognition, numbers for actuation), and the hierarchy is
 *  the palette's own: text, muted, vector. Dimming costs nothing because
 *  the address is navigated, not scanned — you jump to it and it lights. */
function addrCell(n: number | undefined, focus: boolean): string {
  if (n === undefined && !focus) return " ".repeat(3);
  const glyph = n === undefined ? "§" : `§${n}`.padEnd(3);
  return focus ? S(pal.vector, "1") + glyph + reset() : S(pal.muted) + glyph + reset();
}

function rowLine(entry: string, idx: number): string {
  const focus = idx + 1 === FOCUS;
  const [path, snippet = ""] = entry.split("\t");
  const cs = callsignFor(path);
  const date = dateOf(path);
  // Registry rows carry `CALLSIGN — summary` in the snippet; drop the
  // duplicated name so callsign-first shows it once.
  let text = snippet;
  if (cs && text.startsWith(cs)) text = text.slice(cs.length).replace(/^\s*[—–-]\s*/, "");

  // The path is elided when a callsign names the row — but if the match
  // lies ONLY in the path, the elision would hide the evidence, so the
  // path returns. (A conditional element is a signal: its presence says
  // "the match was in the name.") Named rows only; unnamed rows keep it.
  const pathOnly = !!cs && matchRanges(path, QUERY).length > 0 &&
    matchRanges(cs, QUERY).length === 0 && matchRanges(text, QUERY).length === 0;

  // §NN · DATE · CALLSIGN(slug) · text   — a brightness ramp, dim to
  // bright, left to right: the muted rank recedes, the date takes a mid
  // step, the name and content are full. The field that needs the
  // *aligned* slot (the comparable date) starts at a fixed x; the
  // recognised field may be ragged. The active § interrupts the ramp —
  // the control is the one thing that does not recede.
  const restFields: Array<{ text: string; token: boolean }> = [];
  restFields.push(cs ? { text: cs, token: true } : { text: stripDate(path), token: false });
  if (pathOnly) restFields.push({ text: stripDate(path), token: false });
  if (text) restFields.push({ text, token: false });
  const { content: rest, tokens } = buildFields(restFields);

  const mods = SELECTED_BOLD && focus ? "1" : "";
  const dateCell = (date ?? "").padEnd(10); // fixed 10 — the column
  const datePaint = paintContent(dateCell, QUERY, MID, mods, false, date ? [[0, 10]] : []);
  const restPaint = paintContent(clip(rest, COLS - 4 - 12), QUERY, FG, mods, false, tokens);
  return addrCell(numOf.get(path), focus) + " " + datePaint + "  " + restPaint;
}

/** The band's edge rule: a row-scoped rule drawn above AND below the
 *  selected row, from the § to the end of the text — a held frame. A
 *  single rule below is an incomplete figure and the eye completes it,
 *  which is why the top edge is not optional. A literal rule rather than
 *  SGR 4, so its colour is uniform across the row's runs (a text underline
 *  takes each run's own colour and would break at every match).
 *
 *  Two colour candidates, and the house already knows which: the heading
 *  chip is *muted, not heading-coloured, because it does structural work
 *  (coordinate frame), not declarative work* (`src/ansi.ts:104-110`). The
 *  band is structure — a frame — so `muted` is its role; rose is reserved
 *  for the control (the active §). A rose frame overpowers because it
 *  paints the *frame* in the *control's* colour. */
function plankLine(width: number, plank: "rose" | "muted"): string {
  const hex = plank === "rose" ? pal.vector : pal.muted;
  return S(hex) + "─".repeat(Math.max(1, width)) + reset();
}

if (MODE === "row") {
  const planks: Array<"rose" | "muted" | "off"> =
    PLANK === "rose" ? ["rose"]
    : PLANK === "muted" ? ["muted"]
    : PLANK === "off" ? ["off"]
    : ["rose", "muted"];
  if (!QUIET) {
    console.log(`\n${DIM}row${PLAIN} ${COLS} cols   ${DIM}selected${PLAIN} row ${FOCUS}` +
      `   ${DIM}callsign-first${PLAIN} ${CALLSIGN ? "on" : "off"}` +
      `   ${DIM}selected-bold${PLAIN} ${SELECTED_BOLD ? "ON" : "off"}` +
      `   ${DIM}addresses${PLAIN} ${MAX_ADDRESSES}   ${DIM}source${PLAIN} ${FROM ? "frozen" : "live"}\n`);
  }
  for (const plank of planks) {
    console.log(`${DIM}plank ${plank}${PLAIN}`);
    entries.slice(0, N).forEach((e, i) => {
      const line = rowLine(e, i);
      const focus = i + 1 === FOCUS;
      const rule = plank !== "off" && focus ? plankLine(visible(line), plank) : null;
      if (rule) console.log(rule); // the band's top edge — the demand the plank made
      console.log(line);
      if (rule) console.log(rule); // the band's bottom edge
      if (BLANK) console.log();
    });
    console.log();
  }
  if (!QUIET) {
    console.log(`${DIM}── the cap edge: rows ${EDGE - 1}..${EDGE + 3} (address stops after ${EDGE}) ${PLAIN}`);
    for (let r = EDGE - 1; r <= Math.min(EDGE + 3, entries.length); r++) {
      console.log(rowLine(entries[r - 1]!, r - 1));
    }
    console.log();
  }
  process.exit(0);
}

// ── mode: variants — the early address experiments ───────────────────
type Variant = { label: string; render: (e: string) => string };
const variants: Variant[] = [
  {
    label: "§NN  rose-bold, left (the document's own paint)",
    render: (e) => {
      const n = numOf.get(e.split("\t")[0]!);
      const addr = n ? S(pal.vector, "1") + `§${n}` + reset() : "   ";
      return `${addr} ${paintContent(clip(rowText(e), COLS - 4), QUERY, FG, "")}`;
    },
  },
  {
    label: "§NN  muted, left (the number is furniture)",
    render: (e) => {
      const n = numOf.get(e.split("\t")[0]!);
      const addr = n ? S(pal.muted) + `§${n}` + reset() : "   ";
      return `${addr} ${paintContent(clip(rowText(e), COLS - 4), QUERY, FG, "")}`;
    },
  },
  {
    label: "NN   rose-bold, no glyph",
    render: (e) => {
      const n = numOf.get(e.split("\t")[0]!);
      const addr = n ? S(pal.vector, "1") + `${n}` + reset() : "  ";
      return `${addr} ${paintContent(clip(rowText(e), COLS - 3), QUERY, FG, "")}`;
    },
  },
  {
    label: "§NN  rose-bold, far-right gutter (the distant RHS anchor)",
    render: (e) => {
      const n = numOf.get(e.split("\t")[0]!);
      const addr = n ? S(pal.vector, "1") + `§${n}` + reset() : "   ";
      const body = paintContent(clip(rowText(e), COLS - 4), QUERY, FG, "");
      return `${body}${" ".repeat(Math.max(1, COLS - 4 - visible(body) + 1))}${addr}`;
    },
  },
];

console.log(`\n${DIM}query${PLAIN} ${QUERY}   ${DIM}rows${PLAIN} ${entries.length}` +
  `   ${DIM}addresses${PLAIN} ${MAX_ADDRESSES}   ${DIM}cols${PLAIN} ${COLS}` +
  `   ${DIM}highlight${PLAIN} ${HIGHLIGHT ? "on" : "off"}` +
  `   ${DIM}source${PLAIN} ${FROM ? "frozen" : "live"}\n`);
for (const v of variants) {
  console.log(`${DIM}── ${v.label} ${PLAIN}`);
  entries.slice(0, N).forEach((e) => console.log(v.render(e)));
  console.log();
}
