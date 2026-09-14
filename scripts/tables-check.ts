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
 * Usage:
 *   bun scripts/tables-check.ts [--width N] [--strict] [--json] [--top N] [files...]
 *
 * Exit 0 = no cut at the target width (or a report, without --strict);
 * exit 1 = a cut, under --strict.
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
const json = argv.includes("--json");
const positional = argv.filter((a) => !a.startsWith("--"));
const CONTENT = width - 4;

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
    for (const r of rows) {
      for (let k = 0; k < cols; k++) {
        const cell = plain(r[k] ?? "");
        nat[k] = Math.max(nat[k]!, displayWidth(cell));
        for (const w of cell.split(/\s+/)) word[k] = Math.max(word[k]!, displayWidth(w));
      }
    }
    out.push({
      line: i + 1,
      header: cellsOf(l),
      body: rows.slice(1),
      src: [l, next, ...lines.slice(i + 2, j)].join("\n") + "\n",
      natural: nat.reduce((a, b) => a + b, 0) + GUTTER * (cols - 1),
      wordBudget: word.reduce((a, b) => a + b, 0) + GUTTER * (cols - 1),
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
  if (rules.length < 2) return { lines: -1, rows, slots: [], cuts: [] };

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
    return { lines: bodyAll.filter((l) => l.trim().length > 0).length, rows, slots: [], cuts: [] };
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
  for (let k = 0; k < starts.length; k++) {
    const hay = " " + columnText[k]! + " ";
    for (let i = 0; i + 1 < run.length; i++) {
      const a = frag(run[i]!, k);
      const b = frag(run[i + 1]!, k);
      if (!a || !b) continue;
      if (a.endsWith("…") || b.startsWith("…")) continue;
      if (GLYPH.test(a + b)) continue;
      if (!hay.includes(" " + a + " ") || !hay.includes(" " + b + " ")) cuts.push(a + "|" + b);
    }
  }
  return { lines: bodyAll.filter((l) => l.trim().length > 0).length, rows, slots, cuts };
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
}

const files = positional.length > 0 ? positional : siloFiles();
const findings: Finding[] = [];
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
    if (r.cuts.length === 0) {
      if (r.lines !== r.rows && r.lines >= 0) reflow++;
      continue;
    }
    findings.push({
      file,
      line: t.line,
      cols: r.slots.length,
      slots: r.slots,
      cuts: r.cuts.length,
      sample: r.cuts[0]!,
      allocatorFault: t.wordBudget <= CONTENT,
      wordBudget: t.wordBudget,
    });
  }
}

findings.sort((a, b) => b.cuts - a.cuts || a.file.localeCompare(b.file));
const allocator = findings.filter((f) => f.allocatorFault);
const irreducible = findings.filter((f) => !f.allocatorFault);
const docs = new Set(findings.map((f) => f.file)).size;
const cutPoints = findings.reduce((a, f) => a + f.cuts, 0);

if (json) {
  console.log(JSON.stringify({ width, scanned, docsWithTables, tables, reflow, findings }, null, 2));
} else {
  const head = (s: string) => console.log(`\n${s}`);
  head(`tables-check — the cut at ${width} columns`);
  console.log(`  scanned           ${scanned} files`);
  console.log(`  with tables       ${docsWithTables} files, ${tables} tables`);
  console.log(`  reflow only       ${reflow}  (wrapped on word boundaries — intended)`);
  console.log(`  CUT               ${findings.length} tables in ${docs} files, ${cutPoints} cut points`);
  console.log(`    allocator fault ${allocator.length}  (the columns could hold every word)`);
  console.log(`    irreducible     ${irreducible.length}  (a longest word exceeds the whole width)`);

  if (findings.length > 0 && top > 0) {
    head(`worst ${Math.min(top, findings.length)} — cuts  file:line  slots  sample`);
    for (const f of findings.slice(0, top)) {
      const kind = f.allocatorFault ? " " : "!";
      console.log(
        `${kind} ${String(f.cuts).padStart(4)}  ${f.file}:${f.line}  [${f.slots.join(",")}]  ${f.sample}`,
      );
    }
    if (irreducible.length > 0) {
      head(`irreducible — no allocation holds these (needs > ${CONTENT})`);
      for (const f of irreducible) console.log(`  need ${String(f.wordBudget).padStart(3)}  ${f.file}:${f.line}`);
    }
    console.log(`\n! = irreducible; the rest are the allocator (brief: BRF-TABLE-WIDTH)`);
  }
}

if (strict && findings.length > 0) {
  console.error(`\ntables-check: FAIL — ${findings.length} table(s) cut a word at ${width} columns`);
  process.exit(1);
}
if (!json) console.log(`\ntables-check: ${findings.length === 0 ? "OK" : "REPORT"} — ${findings.length} cut`);
