#!/usr/bin/env bun
/**
 * tables-check.ts — the table cut, measured (brief: 2026-09-14-brief-table-width).
 *
 * `renderTable` shrinks an over-wide table by handing every column a floor of
 * three characters plus a share proportional to its content (src/render.ts:
 * 987-1016). The widest column therefore sets the scale and the narrow ones
 * are squeezed toward three. When a squeezed column is narrower than its
 * longest word the wrapper has nowhere to break and CUTS the word — a reader
 * sees `#99ccf` / `f` and `0.82` / `8`.
 *
 * This reports that cut, per table, as `file:line`. It does not predict
 * widths; it reads the render:
 *
 *   1. render the table in isolation at the target width;
 *   2. take the column geometry off the last line before the header rule that
 *      carries a `│` — the body gutter is built to align with those separators
 *      (src/render.ts:1022-1027), so slicing is exact. Taking the FIRST line of
 *      the block instead is the trap: it is the title when not isolated;
 *   3. slice every line per column, collect each cell's fragments;
 *   4. a fragment that is not a whitespace-delimited run of that column's
 *      source text was cut. Fragments pair only across ADJACENT rendered
 *      lines — the blank line between body rows is a row boundary, and pairing
 *      across it invents cuts.
 *
 * Reflow alone is not a fault: the allocator wraps cells on purpose. Only a
 * cut is reported.
 *
 * Traps, all of them found the hard way:
 *   - an ESCAPED pipe (`\|`) is cell content, not a boundary — splitting on it
 *     invents a column and inflates the word budget;
 *   - the header's FIRST line is the title when the table is not isolated, and
 *     carries no `│` — take the geometry off the last line before the rule;
 *   - fragments pair only across ADJACENT lines; the blank line between body
 *     rows is a row boundary, and pairing across it invents cuts.
 *
 * The word budget is measured too, because it decides the remedy: a table
 * whose columns could each hold their longest word is an ALLOCATOR fault, and
 * a table that cannot is a document (or generator) fault.
 *
 * The word budget measures the CUT. It cannot see the second fault, because
 * elision is normal here (ADR-UNIVERSAL-ELISION-050: cells elide, they do not
 * wrap) — a prose cell wider than its slot is *meant* to elide, and it elides
 * with a marker, so nothing is cut and this script reports 0. The fault that
 * hides behind that 0 is STARVATION: a column elided while the budget had room
 * to render it whole.
 *
 * STARVED, per column k, is a predicate over the source plus one observation:
 *
 *   nat[k] + 3 * (cols - 1) <= CONTENT      -- k fits whole alongside every
 *                                              other column's floor
 *   && the render shows an elision in k    -- and the allocator elided it anyway
 *
 * The floor is the allocator's own (`floors = colWidth.map(() => 3)`, src/
 * render.ts) — the predicate asks whether a better allocation existed, so it
 * uses the current allocation's minimum as the promise to the other columns.
 * A starved column is not a fault of the document; it is characters the
 * allocator had and handed to a wider column. `--strict-starved` gates on it.
 *
 * Bracket slack is the third reading, and it is not a fault — it is the open
 * question (should rows fill the glass, or should the rule shrink to the
 * cells?). `slack = CONTENT - natural` for a table that fits: the rule spans
 * CONTENT, the cells stop at natural, and everything between the two is air
 * under the bar.
 *
 * Traps, the third one:
 *   - elision is read as `endsWith('…')`, not `includes('…')` — a cell is
 *     elided at its tail, and prose that merely mentions an ellipsis mid-
 *     sentence is not the allocator's doing;
 *   - a cell whose SOURCE ends in `…` also ends in `…` when rendered, and the
 *     allocator did nothing — the column's source is checked before its
 *     elisions are counted;
 *   - the band boundary is fuzzy by a few characters: `plain()` estimates markup
 *     stripping, `Bun.markdown` does it for real, and a table measured at 115
 *     can land at 117 in the renderer. Expect a residue of a handful of
 *     boundary tables at any width; do not chase it.
 *
 * Usage:
 *   bun scripts/tables-check.ts [--width N] [--strict] [--strict-starved]
 *                               [--json] [--top N] [files...]
 *
 * Exit 0 = no cut (and no starved column, under --strict-starved) at the target
 * width; a report, without the strict flags. Exit 1 when the gate it was given
 * fails.
 */

import { renderDocument } from "../src/render";
import { stripANSI, displayWidth } from "../src/width";
import { readFileSync } from "node:fs";

const RULE = /^\s*─{10,}\s*$/;
const PIPE = "│";
const GUTTER = 3;
/** The state-glyph vocabulary (src/render.ts:77) — a cut involving one of
 *  these is the orphan-escape defect's shadow, not a table fault. */
const GLYPH = /[✓☐⋮✗]/;
/** The orphan escape tail `styleStateGlyph` leaves behind (src/render.ts:99-121).
 *  It is four bytes of layout the renderer never counted, so it shifts every
 *  following column. Drop it to restore the intended geometry; a tail the
 *  source itself carries is prose about escapes and stays. */
const ORPHAN_TAIL = /\[[0-9;]{1,8}m/g;

// ── args ─────────────────────────────────────────────────────────────

const argv = process.argv.slice(2);
const flag = (name: string, fallback: number): number => {
  const i = argv.indexOf(name);
  if (i < 0) return fallback;
  const v = Number(argv[i + 1]);
  argv.splice(i, 2);
  return Number.isFinite(v) ? v : fallback;
};
const width = flag("--width", 80);
const top = flag("--top", 20);
const strict = argv.includes("--strict");
const strictStarved = argv.includes("--strict-starved");
const json = argv.includes("--json");
const positional = argv.filter((a) => !a.startsWith("--"));
const CONTENT = width - 4;
/** The authoring contract (this brief's design, BRF-TABLE-LADDER): tables are
 *  written to fit 80 columns, and 120 is the degradation threshold — a table
 *  that fits the band is drawn whole at its natural width, single-line, and is
 *  never elided. Absolute, not relative to `--width`: the band is a property of
 *  the corpus, and a run at 60 columns must not move it. */
const DESIGN_CONTENT = 76;
const BAND_CONTENT = 116;

/** The four shapes the band makes of the corpus (BRF-TABLE-LADDER). Geometric,
 *  measured off the source naturals, no roles and no semantics: the renderer
 *  never has to ask what the table is *for*.
 *
 *  design — natural ≤ 76. Authored to the 80-col contract; draws whole.
 *  band   — 76 < natural ≤ 116. Draws whole on any glass of that width.
 *  matrix — natural > 116 with every column ≤ 116. Many short columns; the
 *           sum overflows, so keys elide on a narrow glass (ADR-TABLE-ELISION-014:
 *           the scan is the table, and a matrix is all scan).
 *  prose  — natural > 116 with a column past 116. One cell that no allowed
 *           width can hold — the only shape where elide-vs-wrap is a real
 *           choice rather than a policy. */
type Shape = "design" | "band" | "matrix" | "prose";
const shapeOf = (natural: number, nat: number[]): Shape =>
  natural <= DESIGN_CONTENT ? "design"
    : natural <= BAND_CONTENT ? "band"
      : Math.max(...nat) > BAND_CONTENT ? "prose" : "matrix";

// ── the silo ─────────────────────────────────────────────────────────

/** Every markdown file git tracks, `.archive/` excluded — the archived tier is
 *  a lifecycle state and Gloam does not read it (playbooks/briefs-playbook.md). */
function siloFiles(): string[] {
  const out = Bun.spawnSync(["git", "ls-files", "*.md"], { stdout: "pipe" });
  return out.stdout
    .toString()
    .split("\n")
    .filter((f) => f.length > 0 && !f.startsWith(".archive/"));
}

// ── source parsing ───────────────────────────────────────────────────

/** A cell's text as the renderer sees it: markup removed (parity with the
 *  parsed cell Bun.markdown hands `renderTable`). */
function plain(s: string): string {
  return s
    .replace(/\*\*|__|`/g, "")
    .replace(/\*|_/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

/** Split a table row on cell separators. An ESCAPED pipe (`\|`, which the
 *  concordance brief uses inside a code span) is cell content, not a boundary —
 *  Bun.markdown honours the escape, and splitting on it invents a column. */
const ESCAPED_PIPE = "\u0000";
function cellsOf(line: string): string[] {
  return line
    .trim()
    .replace(/\\\|/g, ESCAPED_PIPE)
    .replace(/^\||\|$/g, "")
    .split("|")
    .map((c) => c.replaceAll(ESCAPED_PIPE, "|").trim());
}

interface Table {
  line: number;
  header: string[];
  body: string[][];
  src: string;
  /** Natural width: longest cell per column, plus the gutters. */
  natural: number;
  /** Word budget: longest WORD per column, plus the gutters. The width a
   *  word-aware allocation needs. */
  wordBudget: number;
  /** Per-column natural width (longest cell) — the whole-column test. */
  nat: number[];
  /** Per-column longest word — the cut test's unit. */
  word: number[];
  /** Per-column natural width of the HEADER row alone. */
  headNat: number[];
  /** Per-column longest word IN the header — what a multiline header needs. */
  headWord: number[];
  /** Per-column natural width of the body alone. */
  bodyNat: number[];
}

function findTables(text: string): Table[] {
  const lines = text.split("\n");
  const out: Table[] = [];
  let fence: string | null = null;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i]!;
    const f = l.match(/^\s*(`{3,}|~{3,})/);
    if (f) {
      fence = fence === null ? f[1]! : null;
      continue;
    }
    if (fence !== null || !/^\s*\|/.test(l)) continue;
    const next = lines[i + 1];
    if (!next || !/^\s*\|?[\s:|-]*-[\s:|-]*\|?\s*$/.test(next)) continue;
    const rows: string[][] = [cellsOf(l)];
    let j = i + 2;
    while (j < lines.length && /^\s*\|/.test(lines[j]!)) {
      rows.push(cellsOf(lines[j]!));
      j++;
    }
    const cols = Math.max(...rows.map((r) => r.length));
    const nat = new Array<number>(cols).fill(0);
    const word = new Array<number>(cols).fill(0);
    const headNat = new Array<number>(cols).fill(0);
    const headWord = new Array<number>(cols).fill(0);
    const bodyNat = new Array<number>(cols).fill(0);
    for (const r of rows) {
      for (let k = 0; k < cols; k++) {
        const cell = plain(r[k] ?? "");
        nat[k] = Math.max(nat[k]!, displayWidth(cell));
        for (const w of cell.split(/\s+/)) word[k] = Math.max(word[k]!, displayWidth(w));
      }
    }
    // The header row is rows[0] (findTables pushes it first). A multiline header
    // needs only its longest word — the label is allowed to be three lines tall.
    for (let k = 0; k < cols; k++) {
      const h = plain(rows[0]?.[k] ?? "");
      headNat[k] = displayWidth(h);
      for (const w of h.split(/\s+/)) headWord[k] = Math.max(headWord[k]!, displayWidth(w));
      let b = 0;
      for (const r of rows.slice(1)) b = Math.max(b, displayWidth(plain(r[k] ?? "")));
      bodyNat[k] = b;
    }
    out.push({
      line: i + 1,
      header: cellsOf(l),
      body: rows.slice(1),
      src: [l, next, ...lines.slice(i + 2, j)].join("\n") + "\n",
      natural: nat.reduce((a, b) => a + b, 0) + GUTTER * (cols - 1),
      wordBudget: word.reduce((a, b) => a + b, 0) + GUTTER * (cols - 1),
      nat,
      word,
      headNat,
      headWord,
      bodyNat,
    });
    i = j - 1;
  }
  return out;
}

// ── the measurement ──────────────────────────────────────────────────

interface Reading {
  /** Rendered body lines. */
  lines: number;
  /** Source body rows. */
  rows: number;
  /** Column widths as rendered — the geometry the allocator chose. */
  slots: number[];
  /** Cut fragments, `prefix|suffix`. */
  cuts: string[];
  /** Observed elisions per column — cells whose rendered tail is `…`. */
  elided: number[];
  /** The column's HEADER cell was cut — the label lost, the data kept. */
  headerCut: boolean[];
  /** First elided fragment per column, `""` when the column is whole. */
  samples: string[];
  /** The gap between the rule and the widest row, measured on the render.
   *  Structurally 0 since BRF-TABLE-LADDER made the rule the table's own
   *  width — so any non-zero reading is a regression, not a finding. */
  ruleSlack: number;
}

async function read(t: Table, source: string): Promise<Reading> {
  const raw = await renderDocument(t.src, { width, color: "none" });
  const out = stripANSI(raw).replace(ORPHAN_TAIL, (m) => (source.includes(m) ? m : ""));
  const lines = out.split("\n");
  const rules: number[] = [];
  lines.forEach((l, i) => {
    if (RULE.test(l)) rules.push(i);
  });
  const rows = t.body.length;
  if (rules.length < 2) return { lines: -1, rows, slots: [], cuts: [], elided: [], samples: [], headerCut: [], ruleSlack: 0 };

  const start = lines.findIndex((l) => l.trim().length > 0);
  const head = lines.slice(start, rules[0]!);
  const bodyAll = lines.slice(rules[0]! + 1, rules[1]!);

  // Geometry off the LAST line before the rule that carries a separator: the
  // header's first line is the title when the table is not isolated.
  const h0 = [...head].reverse().find((l) => l.includes(PIPE)) ?? head[head.length - 1] ?? "";
  const seps: number[] = [];
  for (let i = 0; i < h0.length; i++) if (h0[i] === PIPE) seps.push(i);
  if (seps.length === 0) {
    // A single-column table carries no separator. Nothing to slice; reflow is
    // all it can do, so report the count and stop.
    return { lines: bodyAll.filter((l) => l.trim().length > 0).length, rows, slots: [], cuts: [], elided: [], samples: [], headerCut: [], ruleSlack: 0 };
  }

  const starts = [h0.search(/\S/), ...seps.map((s) => s + 2)];
  const ends = [...seps.map((s) => s - 1), 10 ** 6];
  // The last slot runs to the end of the line, so its width is clamped by the
  // content width only when the table was shrunk; report the widest slice seen.
  const known = seps.map((s, k) => s - 1 - starts[k]!);
  // An empty leading header cell makes its separator the first non-space, so
  // the slot computes to -1. Slicing is unaffected (the slice is empty); clamp
  // it so the report reads honestly.
  const slots = [...known.map((w) => Math.max(0, w)), CONTENT - known.reduce((a, b) => a + b, 0) - GUTTER * seps.length];

  const cols = Math.max(t.header.length, ...t.body.map((r) => r.length));
  const columnText = Array.from({ length: cols }, (_, k) =>
    plain([t.header[k] ?? "", ...t.body.map((r) => r[k] ?? "")].join(" ")),
  );

  const cuts: string[] = [];
  const frag = (line: string, k: number) =>
    line.slice(starts[k]!, ends[k]! === 10 ** 6 ? undefined : ends[k]!).trim();
  const run = [...head, ...bodyAll];
  /** The header is a BLOCK of lines since BRF-TABLE-LADDER (it wraps), so two
   *  adjacent lines inside it are a wrap, and the pair straddling its last line
   *  is a row boundary. Neither is a broken word: pairing across them reads a
   *  legitimate wrap as a cut, which is how four tables with no allocator fault
   *  were reported as cut. Body rows are still single-line by construction
   *  (ADR-UNIVERSAL-ELISION-050), so the pairing still catches what it was
   *  built for. */
  const headEnd = head.length;
  // Elision, observed: a cell is elided at its tail (never wrapped — ADR-050),
  // so `endsWith`, not `includes`. A column whose SOURCE ends in `…` renders one
  // too, with the allocator blameless — skip those columns outright.
  const elided = starts.map((_, k) => {
    if (plain(columnText[k] ?? "").endsWith("…")) return 0;
    return run.filter((l) => frag(l, k).endsWith("…")).length;
  });
  const samples = starts.map((_, k) => run.map((l) => frag(l, k)).find((c) => c.endsWith("…")) ?? "");
  // The inversion: the header is the column's decode key, and it is usually the
  // widest cell in its column — so under squeeze it is the FIRST thing cut,
  // while the data it labels survives. Cheap to fix (a header is one block, so
  // wrapping it costs O(1) table lines, not O(rows)) and therefore worth
  // counting separately from starvation.
  const headerCut = starts.map((_, k) => frag(h0, k).endsWith("…"));
  // The rule against the widest row it brackets. Before BRF-TABLE-LADDER this
  // was a source-side guess (CONTENT − natural) that assumed the rule spanned
  // the glass; now it is measured off the render, and it should be 0.
  const ruleSlack = Math.max(
    0,
    Math.max(displayWidth(lines[rules[0]!]!), displayWidth(lines[rules[1]!]!)) -
      Math.max(0, ...[...head, ...bodyAll].map((l) => displayWidth(l.trimEnd()))),
  );
  for (let k = 0; k < starts.length; k++) {
    const hay = " " + columnText[k]! + " ";
    for (let i = 0; i + 1 < run.length; i++) {
      if (i < headEnd) continue;
      const a = frag(run[i]!, k);
      const b = frag(run[i + 1]!, k);
      if (!a || !b) continue;
      if (a.endsWith("…") || b.startsWith("…")) continue;
      if (GLYPH.test(a + b)) continue;
      if (!hay.includes(" " + a + " ") || !hay.includes(" " + b + " ")) cuts.push(a + "|" + b);
    }
  }
  return { lines: bodyAll.filter((l) => l.trim().length > 0).length, rows, slots, cuts, elided, samples, headerCut, ruleSlack };
}

// ── the pass ─────────────────────────────────────────────────────────

interface Finding {
  file: string;
  line: number;
  cols: number;
  slots: number[];
  cuts: number;
  sample: string;
  /** True when the columns could each hold their longest word. */
  allocatorFault: boolean;
  wordBudget: number;
  /** Columns elided although the budget had room to render them whole. */
  starved: number;
  /** How much elision the allocator observed, starved or not. */
  elided: number;
  /** An elided fragment from a starved column — the evidence, not the count. */
  starvedSample: string;
  /** Air between the rule's CONTENT span and the cells' natural width. */
  slack: number;
  /** The table's natural width — the design width the author implied. */
  natural: number;
  /** Natural width exceeds the band max: degradation is forced, not chosen. */
  forced: boolean;
  /** Which of the four shapes the band makes of this table. */
  shape: Shape;
  /** Per-column natural widths — the outlier tests read these. */
  nat: number[];
  /** Outside the band by construction: a word no band width holds, or a
   *  second un-holdable column. Rethink the authoring, not the allocation. */
  outlier: "word" | "giants" | null;
  /** The source says it is machine-written (`Generated from the registry`),
   *  so the rethink belongs to the compositor, not to a person. */
  generated: boolean;
  /** Columns whose label is wider than every body cell — a multiline header
   *  would recover the surplus. */
  headerDominated: number;
  /** Columns whose label was cut in the render while its data was whole. */
  headerCut: number;
}

const files = positional.length > 0 ? positional : siloFiles();
const rowsRead: Finding[] = [];
let scanned = 0;
let docsWithTables = 0;
let tables = 0;
let reflow = 0;

for (const file of files) {
  scanned++;
  let source: string;
  try {
    source = readFileSync(file, "utf8");
  } catch {
    continue;
  }
  const found = findTables(source);
  if (found.length === 0) continue;
  docsWithTables++;
  for (const t of found) {
    tables++;
    const r = await read(t, source);
    const cols = t.nat.length;
    // The column the RENDERER allocates: the body's need with the header floor at
    // its longest word, because headers wrap (BRF-TABLE-LADDER). Reading the
    // label's full width here would measure a column the renderer never makes.
    const colNat = t.nat.map((n, k) => Math.max(t.bodyNat[k] ?? 0, t.headWord[k] ?? 0, 0));
    const natural = colNat.reduce((a, b) => a + b, 0) + GUTTER * Math.max(0, cols - 1);
    // A column is starved when it fits whole alongside every other column's
    // floor, and the render shows the allocator eliding it anyway. The floor is
    // the allocator's own (3, src/render.ts) — the promise it makes each
    // column the moment it starts handing out shares. The budget is the
    // renderer's TARGET, not the glass: since BRF-TABLE-LADDER a table is never
    // drawn wider than the band's cap, so judging starvation against a wider
    // glass counts elisions the renderer was right to make.
    const floorOthers = 3 * Math.max(0, cols - 1);
    const budget = Math.min(CONTENT, BAND_CONTENT) - GUTTER * Math.max(0, cols - 1);
    const starvedCols = colNat
      .map((n, k) => (n + floorOthers <= budget && (r.elided[k] ?? 0) > 0 ? k : -1))
      .filter((k) => k >= 0);
    if (r.cuts.length === 0 && r.lines !== r.rows && r.lines >= 0) reflow++;
    // The last slot is inferred from the header geometry as whatever is left to
    // CONTENT (the header's first line is the title when the table is not
    // isolated). When the table is NOT shrunk that remainder is air, not cell —
    // and the air is already reported as `slack`, so clamping the slot to the
    // column's natural width keeps the two readings from double-counting it.
    const slots = r.slots.length === cols
      ? r.slots.map((s, k) => (k === cols - 1 ? Math.min(s, colNat[k] ?? s) : s))
      : r.slots;
    rowsRead.push({
      file,
      line: t.line,
      cols: r.slots.length,
      slots,
      cuts: r.cuts.length,
      sample: r.cuts[0] ?? starvedCols.map((k) => r.samples[k]).find((s) => s) ?? "",
      allocatorFault: t.wordBudget <= Math.min(CONTENT, BAND_CONTENT),
      wordBudget: t.wordBudget,
      starved: starvedCols.length,
      elided: r.elided.reduce((a, b) => a + b, 0),
      starvedSample: starvedCols.map((k) => r.samples[k]).find((s) => s && s.length > 0) ?? "",
      slack: r.ruleSlack,
      natural,
      forced: natural > BAND_CONTENT,
      shape: shapeOf(natural, colNat),
      nat: colNat,
      // Two ways to leave the band, and both are the document's problem:
      // a longest word the band cannot hold at all, or a second column past
      // the band (a prose matrix — two notes pretending to be a table).
      outlier: t.wordBudget > BAND_CONTENT
        ? "word"
        : colNat.filter((n) => n > BAND_CONTENT).length > 1 ? "giants" : null,
      generated: source.includes("Generated from the registry"),
      headerDominated: t.headNat.filter((h, k) => h > (t.bodyNat[k] ?? 0)).length,
      headerCut: r.headerCut.filter(Boolean).length,
    });
  }
}

const findings = rowsRead.filter((f) => f.cuts > 0);
const starvedRows = rowsRead.filter((f) => f.starved > 0);
findings.sort((a, b) => b.cuts - a.cuts || a.file.localeCompare(b.file));
starvedRows.sort((a, b) => b.starved - a.starved || a.file.localeCompare(b.file));
const allocator = findings.filter((f) => f.allocatorFault);
const irreducible = findings.filter((f) => !f.allocatorFault);
const docs = new Set(findings.map((f) => f.file)).size;
const cutPoints = findings.reduce((a, f) => a + f.cuts, 0);
const starvedDocs = new Set(starvedRows.map((f) => f.file)).size;
const starvedCells = starvedRows.reduce((a, f) => a + f.starved, 0);
const elidedCells = starvedRows.reduce((a, f) => a + f.elided, 0);
const slackRows = rowsRead.filter((f) => f.slack > 0);
const maxSlack = slackRows.reduce((a, f) => Math.max(a, f.slack), 0);
// The band split: a starved table whose natural width fits 116 could have been
// drawn whole, so the degradation was chosen. One over 116 was forced by the
// author and no allocation or glass can draw it whole.
const starvedUnforced = starvedRows.filter((f) => !f.forced).length;
const overDesign = rowsRead.filter((f) => f.natural > DESIGN_CONTENT).length;
const forcedRows = rowsRead.filter((f) => f.forced);
const outliers = rowsRead.filter((f) => f.outlier !== null);
const headerCols = rowsRead.reduce((a, f) => a + f.nat.length, 0);
const headerDominated = rowsRead.reduce((a, f) => a + f.headerDominated, 0);
const headerCut = rowsRead.reduce((a, f) => a + f.headerCut, 0);
const headerCutRows = rowsRead.filter((f) => f.headerCut > 0);
const shapes = (["design", "band", "matrix", "prose"] as Shape[]).map(
  (s) => [s, rowsRead.filter((f) => f.shape === s).length] as const,
);
// Worst first: a starved column is the allocator's choice, a cut is a document
// fault, and both are worse than air under the bar.
const worst = [...rowsRead]
  .filter((f) => f.starved > 0 || f.cuts > 0)
  .sort((a, b) => b.starved - a.starved || b.cuts - a.cuts || b.slack - a.slack || a.file.localeCompare(b.file));

if (json) {
  console.log(JSON.stringify({
    width,
    scanned,
    docsWithTables,
    tables,
    reflow,
    cuts: { tables: findings.length, docs, points: cutPoints },
    starved: { tables: starvedRows.length, docs: starvedDocs, columns: starvedCells, elidedCells, unforced: starvedUnforced },
    slack: { tables: slackRows.length, max: maxSlack, content: CONTENT },
    headers: { columns: headerCols, dominated: headerDominated, cut: headerCut, tables: headerCutRows.length },
    band: {
      design: DESIGN_CONTENT,
      max: BAND_CONTENT,
      overDesign,
      forced: forcedRows.length,
      shapes: Object.fromEntries(shapes),
      outliers: outliers.length,
    },
    findings: rowsRead,
  }, null, 2));
} else {
  const head = (s: string) => console.log(`\n${s}`);
  head(`tables-check — the table at ${width} columns`);
  console.log(`  scanned           ${scanned} files`);
  console.log(`  with tables       ${docsWithTables} files, ${tables} tables`);
  console.log(`  reflow only       ${reflow}  (wrapped on word boundaries — intended)`);
  console.log(`  CUT               ${findings.length} tables in ${docs} files, ${cutPoints} cut points`);
  console.log(`    allocator fault ${allocator.length}  (the columns could hold every word)`);
  console.log(`    irreducible     ${irreducible.length}  (a longest word exceeds the whole width)`);
  console.log(`  STARVED           ${starvedRows.length} tables in ${starvedDocs} files, ${starvedCells} columns`);
  console.log(`                    (elided while the budget had room to render them whole;`);
  console.log(`                     ${elidedCells} elided cells in those tables, ${starvedUnforced} tables within the band)`);
  console.log(`  bracket slack     ${slackRows.length} tables, up to ${maxSlack} cols of air under the rule`);
  console.log(`  design width      ${overDesign} of ${tables} tables exceed ${DESIGN_CONTENT} (the 80-col design width)`);
  console.log(`  shape             ${shapes.map(([s, n]) => `${n} ${s}`).join(", ")}`);
  console.log(`  outliers          ${outliers.length} tables leave the band by construction`);
  console.log(`  headers           ${headerDominated} of ${headerCols} columns sized by the label, ${headerCut} labels cut`);

  if (worst.length > 0 && top > 0) {
    head(`worst ${Math.min(top, worst.length)} — starved  cuts  file:line  slots  evidence`);
    for (const f of worst.slice(0, top)) {
      const kind = f.cuts > 0 && !f.allocatorFault ? "!" : " ";
      console.log(
        `${kind} ${String(f.starved).padStart(4)}  ${String(f.cuts).padStart(4)}  ${f.file}:${f.line}  ` +
          `[${f.slots.join(",")}]  ${f.starvedSample || f.sample}`,
      );
    }
    if (outliers.length > 0) {
      head(`outliers — a word no band width holds, or a second un-holdable column`);
      const why = (f: Finding) =>
        f.outlier === "word" ? `word budget ${String(f.wordBudget).padStart(3)}` : `${f.nat.filter((n) => n > BAND_CONTENT).length} columns past ${BAND_CONTENT}`;
      for (const f of outliers) {
        console.log(
          `  ${f.generated ? "generated" : "authored "}  ${why(f)}  ${f.file}:${f.line}`,
        );
      }
      console.log(`  the rethink is the document's (or the compositor's), not the allocator's`);
    }
    if (irreducible.length > 0) {
      head(`irreducible — no allocation holds these (needs > ${CONTENT})`);
      for (const f of irreducible) console.log(`  need ${String(f.wordBudget).padStart(3)}  ${f.file}:${f.line}`);
    }
    console.log(`\nstarved = columns the allocator starved; ! = a cut with no allocation to blame`);
  }
}

if (strict && findings.length > 0) {
  console.error(`\ntables-check: FAIL — ${findings.length} table(s) cut a word at ${width} columns`);
  process.exit(1);
}
if (strictStarved && starvedRows.length > 0) {
  console.error(
    `\ntables-check: FAIL — ${starvedRows.length} table(s) starved a column at ${width} columns ` +
      `(${starvedCells} columns elided with room to be whole)`,
  );
  process.exit(1);
}
if (!json) {
  const parts = [`${findings.length} cut`, `${starvedRows.length} starved`];
  console.log(`\ntables-check: ${findings.length + starvedRows.length === 0 ? "OK" : "REPORT"} — ${parts.join(", ")}`);
}
