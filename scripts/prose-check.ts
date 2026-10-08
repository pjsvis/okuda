#!/usr/bin/env bun
/**
 * prose-check.ts — the wall meter (discussion: the prose pass, 2026-10-08).
 *
 * A METER, not a gate. Paragraph length is editorial — the authoring
 * playbook's "Short paragraphs" entry carries a para-length rule as
 * "in reserve, not decided", because the only threshold with a perceptual
 * warrant is glass-bound: a paragraph taller than the glass breaks the
 * glance-confirm. This reports that height, by name, for a human to judge.
 * It always exits 0.
 *
 * Two readings:
 *
 *   1. WALLS — prose units whose RENDERED height at the reference width
 *      exceeds the threshold. The height is not estimated: it is computed
 *      with the renderer's own wrapper (`wrapANSI`, src/wrap.ts) over the
 *      unit's plain text. Styling is zero-width, and soft returns are inert
 *      (ADR-PROSE-BREAKS-056), so the wrapper's answer is the render's.
 *   2. LEAKS — markdown emphasis that survived the render (`**Date:**`
 *      printing its own asterisks). Code is stripped first, so a fence full
 *      of asterisks is not a finding. This is the one unambiguous defect
 *      class — a render failure, not a taste — and the only one that could
 *      ever gate.
 *
 * Sentence counts come from `Intl.Segmenter`, with an abbreviation guard:
 * ICU splits "Dr. Smith met Mr. Jones"; the guard merges the false boundary
 * back. Approximate, and reported as such.
 *
 * Usage:
 *   bun scripts/prose-check.ts [--width N] [--min-lines N] [--top N] [--leaks]
 *                              [--json] [files...]
 */

import { readFileSync } from "node:fs";
import { stripANSI } from "../src/width";
import { wrapANSI } from "../src/wrap";
import { renderDocument } from "../src/render";
import { scannedFiles } from "./td-id-lint";

// ── args ─────────────────────────────────────────────────────────────

const argv = process.argv.slice(2);
const flag = (name: string, fallback: number): number => {
  const i = argv.indexOf(name);
  if (i < 0) return fallback;
  const v = Number(argv[i + 1]);
  argv.splice(i, 2);
  return Number.isFinite(v) ? v : fallback;
};
const width = flag("--width", 100);
const minLines = flag("--min-lines", 6);
const top = flag("--top", 25);
const json = argv.includes("--json");
const leaksOnly = argv.includes("--leaks");
/** A gate, not a meter: any leak fails the run. The leak class is a render
 *  failure rather than a taste — a raw `**` reached the reader — so it is the
 *  one reading that earns a gate. The corpus reads zero, so there is no
 *  baseline to grandfather. */
const strictLeaks = argv.includes("--strict-leaks");
const positional = argv.filter((a) => !a.startsWith("--"));

/** LIST_INDENT (src/render.ts) — a list item's marker column. */
const ITEM_INDENT = 2;
// ── sentences ────────────────────────────────────────────────────────

const SEG = new Intl.Segmenter("en", { granularity: "sentence" });
/** ICU splits on abbreviations; merge those boundaries back. Approximate. */
const ABBREV =
  /(?:^|\s)(?:Mr|Mrs|Ms|Dr|Prof|St|Fig|No|vs|etc|e\.g|i\.e|cf|al|Jr|Sr|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sept?|Oct|Nov|Dec|approx|dept|est)\.$/i;

export function countSentences(text: string): number {
  const segs = [...SEG.segment(text)].map((s) => s.segment.trim()).filter(Boolean);
  let n = 0;
  for (let i = 0; i < segs.length; i++) {
    const next = segs[i + 1] ?? "";
    if (ABBREV.test(segs[i]!) || /^[a-z]/.test(next)) continue; // not a boundary
    n++;
  }
  return Math.max(1, n);
}

/** A unit's text as the reader sees it: markup stripped, whitespace collapsed. */
export function plain(s: string): string {
  return s
    .replace(/\\(.)/g, "$1")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\*\*|__|`/g, "")
    .replace(/\*|_/g, "")
    .replace(/^\s*#{1,6}\s+/, "")
    .replace(/\s+/g, " ")
    .trim();
}

// ── source walk ──────────────────────────────────────────────────────

/** Which source lines are fence markers or fence content.
 *
 *  CommonMark's closing rule, not a bare toggle: a closing fence carries NO
 *  info string, so ```` ```bash ```` inside an open fence is content, not a
 *  close. A naive toggle desynchronises on the corpus's own files (an unclosed
 *  fence then reads its whole tail as prose) and both readings inherit the lie
 *  — the meter measures a diagram as a paragraph, the leak scan calls code
 *  asterisks failed emphasis. */
export function inFence(source: string): boolean[] {
  const flags: boolean[] = [];
  let char = "";
  let len = 0;
  let open = false;
  for (const l of source.split("\n")) {
    const m = l.match(/^\s*(`{3,}|~{3,})(.*)$/);
    if (!open) {
      if (m) { char = m[1]![0]!; len = m[1]!.length; open = true; flags.push(true); continue; }
      flags.push(false);
    } else {
      flags.push(true);
      if (m && m[1]![0] === char && m[1]!.length >= len && m[2]!.trim() === "") open = false;
    }
  }
  return flags;
}

export type Kind = "para" | "item" | "quote";
export interface Unit {
  line: number;
  kind: Kind;
  text: string;
}

/** Prose units in a document: paragraphs, list items, blockquote lines.
 *  Fences, tables, headings, rules, HTML and front matter are skipped. */
export function units(source: string): Unit[] {
  const lines = source.split("\n");
  const fenced = inFence(source);
  const out: Unit[] = [];
  let front = false;
  let current: Unit | null = null;

  const flush = () => {
    if (current) {
      const text = plain(current.text);
      if (text) out.push({ ...current, text });
      current = null;
    }
  };
  const start = (lineNo: number, kind: Kind, text: string) => {
    flush();
    current = { line: lineNo, kind, text };
  };
  const cont = (text: string) => {
    // A soft return is inert (ADR-PROSE-BREAKS-056): a plain line continues
    // the open unit, whatever kind it is. A blank line closed it already.
    if (current) current.text += " " + text;
  };

  for (let i = 0; i < lines.length; i++) {
    const l = lines[i]!;
    const n = i + 1;
    // front matter at document start
    if (i === 0 && l.trim() === "---") { front = true; continue; }
    if (front) { if (l.trim() === "---") front = false; continue; }
    // fences (CommonMark's rule, see inFence)
    if (fenced[i]) { flush(); continue; }
    if (l.trim() === "") { flush(); continue; }
    if (/^\s*\|/.test(l)) { flush(); continue; } // table row
    if (/^\s*(#{1,6})\s/.test(l)) { flush(); continue; } // heading
    if (/^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/.test(l)) { flush(); continue; } // rule
    if (/^\s*<[a-zA-Z/!]/.test(l)) { flush(); continue; } // html
    const item = l.match(/^(\s*)(?:[-*+]|\d+[.)])\s+(.*)$/);
    if (item) { start(n, "item", item[2]!); continue; }
    const quote = l.match(/^\s*>\s?(.*)$/);
    if (quote) { start(n, "quote", quote[1]!); continue; }
    if (current) cont(l.trim());
    else start(n, "para", l.trim());
  }
  flush();
  return out;
}

/** The wrapper width for a unit — the renderer's own budget. */
function avail(kind: Kind, w: number): number {
  const content = w - 4;
  const base = kind === "item" ? content - ITEM_INDENT - 2 : kind === "quote" ? content - 2 : content;
  return Math.max(4, base);
}

/** Rendered height of a unit, via the renderer's own wrapper. */
export function height(text: string, kind: Kind, w: number = width): number {
  return wrapANSI(text, { width: avail(kind, w) }).length;
}

// ── the leak scan ────────────────────────────────────────────────────

/** Markdown emphasis that survived the render — the one unambiguous defect
 *  class, because it is a render failure rather than a taste.
 *
 *  One real render, no source surgery: neutralising code before rendering
 *  cannot be made structure-preserving (removing an inline span breaks the
 *  emphasis around it; replacing one breaks a table row whose cell holds a
 *  pipe), so the non-prose carriers are excluded by name instead. */
/** Emphasis-shaped `**`/`__`: a run at a word boundary followed by a word
 *  character. A glob (`**.archive/**`), a mention (`(#, **, backticks)`) and a
 *  URL's `__` are literal content, not failed emphasis — and the render is right
 *  to show them. */
const EMPHASIS_SHAPED = /(?:^|[\s(])\*\*(?=[A-Za-z0-9])|(?<!_)__(?!_)/;

export async function leaks(source: string): Promise<string[]> {
  const rendered = stripANSI(await renderDocument(source, { width, color: "none" }));
  // Code spans, by content. A span that deliberately DISPLAYS markup
  // (`` `**Date:**` ``) renders its own text and that is the point of the span;
  // a line is skipped only when EVERY markup token on it is inside a span, so a
  // real leak beside a code span still reports.
  const spans = [...source.matchAll(/`([^`\n]*)`/g)].map((m) => m[1]!).filter(Boolean);
  // Fence content, by KEY at both ends: a long fence line is elided at the
  // glass, so the whole line is not a substring of what was drawn — and a
  // document with an UNCLOSED fence renders its whole body as code, whose `**`
  // are literal by the renderer's own judgement, not leaks.
  const fenceKeys = new Set<string>();
  const fenced = inFence(source);
  source.split("\n").forEach((l, i) => {
    if (!fenced[i]) return;
    const t = l.trim();
    if (!t) return;
    fenceKeys.add(t.slice(0, 20));
    fenceKeys.add(t.slice(-20));
  });
  const out: string[] = [];
  for (const line of rendered.split("\n").map((l) => l.trim())) {
    // `**` anywhere; `__` only as an emphasis PAIR. A run of three or more
    // underscores is a placeholder rule (`______`), and a double underscore in
    // a URL (`@__bbak`) is an address — neither is failed emphasis.
    if (!EMPHASIS_SHAPED.test(line)) continue;
    if (line.includes("://")) continue;
    if ([...fenceKeys].some((k) => line.includes(k))) continue;
    const tokens = line.match(/\*\*[^*\n]{0,60}\*\*|(?<!_)__(?!_)/g) ?? [];
    if (tokens.length > 0 && tokens.every((t) => spans.some((c) => c.includes(t)))) continue;
    out.push(line);
  }
  return out;
}

// ── the pass ─────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const files = positional.length > 0 ? positional : scannedFiles().filter((f) => f.endsWith(".md"));
  const rows: Array<Unit & { file: string; lines: number; sent: number; words: number }> = [];
  const leakRows: Array<{ file: string; text: string }> = [];
  let scanned = 0;
  let totalUnits = 0;

  for (const file of files) {
    let source: string;
    try { source = readFileSync(file, "utf8"); } catch { continue; }
    scanned++;
    for (const u of units(source)) {
      totalUnits++;
      const lines = height(u.text, u.kind);
      if (lines >= minLines) {
        rows.push({ ...u, file, lines, sent: countSentences(u.text), words: u.text.split(/\s+/).length });
      }
    }
    for (const text of await leaks(source)) leakRows.push({ file, text });
  }

  rows.sort((a, b) => b.lines - a.lines || b.words - a.words || a.file.localeCompare(b.file));
  const walls = rows.length;
  const tallest = rows[0]?.lines ?? 0;

  if (json) {
    console.log(JSON.stringify({ width, minLines, scanned, totalUnits, walls, tallest, rows, leaks: leakRows }, null, 2));
  } else if (strictLeaks) {
    console.log(`prose-check — leaks: ${leakRows.length} across ${scanned} files`);
    for (const r of leakRows) console.log(`  ${r.file}  ${r.text.length > 90 ? r.text.slice(0, 89) + "…" : r.text}`);
  } else {
    console.log(`\nprose-check — the wall meter at ${width} columns`);
    console.log(`  scanned        ${scanned} files, ${totalUnits} prose units`);
    console.log(`  walls          ${walls} units ≥ ${minLines} rendered lines (tallest ${tallest})`);
    if (leakRows.length > 0) console.log(`  markdown leaks ${leakRows.length} line(s) printed their own syntax`);
    if (!leaksOnly && rows.length > 0 && top > 0) {
      console.log(`\nworst ${Math.min(top, rows.length)} — lines  sent  words  file:line`);
      for (const r of rows.slice(0, top)) {
        const text = r.text.length > 58 ? r.text.slice(0, 57) + "…" : r.text;
        console.log(`${String(r.lines).padStart(10)}  ${String(r.sent).padStart(4)}  ${String(r.words).padStart(5)}  ${r.file}:${r.line}  «${text}»`);
      }
    }
    if (leakRows.length > 0) {
      console.log(`\nmarkdown that survived the render — the one unambiguous defect class`);
      for (const r of leakRows.slice(0, top || leakRows.length)) {
        console.log(`  ${r.file}  ${r.text.length > 80 ? r.text.slice(0, 79) + "…" : r.text}`);
      }
    }
  }
  if (strictLeaks && leakRows.length > 0) {
    console.error(
      `prose-check: FAIL — ${leakRows.length} line(s) printed markdown emphasis instead of formatting it.`,
    );
    process.exitCode = 1;
  }
}

if (import.meta.main) void main();
