/**
 * frame-probe.ts — 2026-10-12
 *
 * Three questions about the frame, all of them properties of the emitted
 * bytes rather than of prose. Nothing here depends on a decision not yet
 * taken: the bytes exist, so the questions are answerable now.
 *
 *  A. The bracket contract. Every main render should open with the identity
 *     header and close with the terminator. Which renders do not, and where
 *     do they stop?
 *
 *  B. Boundary blanks. The frame doctrine says blank appears only at a
 *     boundary. Where are the interior runs, and how long?
 *
 *  C. The diagram gutter. A rendered diagram is an ELEMENT, so centring it
 *     within its own block is admissible where centring the document is not.
 *     How much slack does each diagram leave, and on which side?
 *
 * Prints numbers, not conclusions.
 *
 * Run: bun scripts/frame-probe.ts
 */
import { renderDocument } from "../src/render";
import { displayWidth, stripANSI } from "../src/width";

const W = 80;
const TERMINATOR = /^\s*█ ─+ █\s*$/;
const DIAGRAM_GLYPH = /[┌┐└┘├┤┬┴┼│─▲▼◄►●]/;

const files = Bun.spawnSync(["git", "ls-files", "*.md"], { stdout: "pipe" })
  .stdout.toString()
  .split("\n")
  .filter((s) => s.trim() !== "");

interface Row {
  file: string;
  first: string;
  last: string;
  opens: boolean;
  closes: boolean;
  lead: number;
  trail: number;
  interior: number;
  maxRun: number;
}

const rows: Row[] = [];

for (const f of files) {
  const src = await Bun.file(f).text();
  const raw = await renderDocument(src, { width: W, color: "none", file: f });
  // `split("\n")` on a string ending in "\n" yields one trailing "". That
  // is the last line's terminator, not a blank line: drop it before counting.
  const lines = stripANSI(raw).split("\n");
  if (lines[lines.length - 1] === "") lines.pop();
  // With `file` given the identity header is line 0, and finalize's leading
  // blank becomes the header-to-body separator at line 1.
  const body = lines.slice();
  const firstIdx = body.findIndex((l) => l.trim() !== "");
  const lastIdx = body.length - 1 - [...body].reverse().findIndex((l) => l.trim() !== "");

  let maxRun = 0;
  let gaps = 0; // every blank run
  let breaks = 0; // runs >= 2 — a section break, not a paragraph gap
  let run = 0;
  for (let k = firstIdx; k <= lastIdx; k++) {
    if (body[k]!.trim() === "") {
      run++;
      maxRun = Math.max(maxRun, run);
    } else {
      if (run > 0) { gaps++; if (run >= 2) breaks++; }
      run = 0;
    }
  }

  rows.push({
    file: f,
    first: (body[firstIdx] ?? "").trim(),
    last: (body[lastIdx] ?? "").trim(),
    opens: (body[firstIdx] ?? "").trim() === f,
    closes: TERMINATOR.test(body[lastIdx] ?? ""),
    lead: firstIdx,
    trail: body.length - 1 - lastIdx,
    interior: breaks,
    maxRun,
  });
}

const n = rows.length;
const pad = (s: string | number, w: number) => String(s).padStart(w);

console.log("\n=== A. the bracket contract ===");
console.log(`files: ${n}`);
console.log(`opens with a header : ${rows.filter((r) => r.opens).length}`);
console.log(`closes with the bar : ${rows.filter((r) => r.closes).length}`);
console.log(`both                : ${rows.filter((r) => r.opens && r.closes).length}`);

const missOpen = rows.filter((r) => !r.opens);
const missClose = rows.filter((r) => !r.closes);
if (missOpen.length) {
  console.log(`\nno header (${missOpen.length}) — first line, truncated:`);
  for (const r of missOpen.slice(0, 12)) console.log(`  ${pad(0, 3)}  ${r.file.slice(0, 44).padEnd(44)} | ${r.first.slice(0, 28)}`);
}
if (missClose.length) {
  console.log(`\nno terminator (${missClose.length}) — last line, truncated:`);
  for (const r of missClose.slice(0, 12)) console.log(`  ${r.file.slice(0, 44).padEnd(44)} | ${r.last.slice(0, 28)}`);
}

console.log("\n=== B. boundary blanks ===");
console.log(`leading blank lines  : max ${Math.max(...rows.map((r) => r.lead))} (0 = the header is line 0)`);
console.log(`trailing blank lines : max ${Math.max(...rows.map((r) => r.trail))} (0 = the bar is the last line)`);
console.log(`section breaks (>=2) : max ${Math.max(...rows.map((r) => r.interior))} per doc`);
console.log(`longest blank run    : ${Math.max(...rows.map((r) => r.maxRun))} lines (a paragraph gap is 1)`);
console.log(`docs with a run >=3  : ${rows.filter((r) => r.maxRun >= 3).length} of ${rows.length}`);
const deep = rows.filter((r) => r.maxRun >= 3).sort((a, b) => b.maxRun - a.maxRun).slice(0, 8);
for (const r of deep) console.log(`  run ${r.maxRun}: ${r.file} (interior runs ${r.interior})`);

console.log("\n=== C. the diagram gutter (element centring) ===");
const gutters: number[] = [];
const indents: number[] = [];
let blocks = 0;
let flushLeft = 0;
const CONTENT = W - 2;

for (const f of files) {
  const src = await Bun.file(f).text();
  const raw = await renderDocument(src, { width: W, color: "none" });
  const lines = stripANSI(raw).split("\n");
  let k = 0;
  while (k < lines.length) {
    if (!DIAGRAM_GLYPH.test(lines[k]!)) { k++; continue; }
    const block: string[] = [];
    while (k < lines.length && DIAGRAM_GLYPH.test(lines[k]!)) { block.push(lines[k]!); k++; }
    if (block.length < 3) continue;
    blocks++;
    const live = block.filter((l) => l.trim() !== "");
    const ind = Math.min(...live.map((l) => l.length - l.trimStart().length));
    const right = Math.max(...live.map((l) => displayWidth(l)));
    indents.push(ind);
    const slack = CONTENT - right;
    gutters.push(slack);
    if (ind <= 2) flushLeft++;
  }
}

const dist = (a: number[]) => {
  if (!a.length) return "none";
  const s = [...a].sort((x, y) => x - y);
  return `min ${s[0]} p25 ${s[Math.floor(s.length * 0.25)]} med ${s[Math.floor(s.length * 0.5)]} p75 ${s[Math.floor(s.length * 0.75)]} max ${s[s.length - 1]}`;
};
console.log(`diagram blocks        : ${blocks}`);
console.log(`flush to the margin   : ${flushLeft} (${blocks ? Math.round((flushLeft / blocks) * 100) : 0}%)`);
console.log(`left indent           : ${dist(indents)}`);
console.log(`right slack (cols)    : ${dist(gutters)}`);
console.log(`slack >= 20 cols      : ${gutters.filter((g) => g >= 20).length} of ${gutters.length}`);
console.log(`slack >= 35 cols      : ${gutters.filter((g) => g >= 35).length} of ${gutters.length}`);
console.log(
  `left-flush + >=20 slack: ${blocks ? Math.round((gutters.filter((g, i) => g >= 20 && indents[i]! <= 2).length / blocks) * 100) : 0}% of blocks (the side-pushed case)`,
);
