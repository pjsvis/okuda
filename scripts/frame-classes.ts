/**
 * frame-classes.ts — 2026-10-30
 *
 * The instrument frame's acceptance test, measured. `ADR-MATH-GRAMMAR-076` is
 * not what this is about; the question is
 * `docs/2026-10-28-the-instrument-frame.md`: an instrument frame is a document
 * with the prose deleted, so the squint ladder's classes (heading, rule,
 * diagram, prose — `squint-probe.ts`) are not its classes and its figures do
 * not transfer. The doc says the first measure any build owes is to name the
 * frame's own classes. This does that, and runs them over the same ladder.
 *
 * Controls first, and the positive one must pass before any number is read:
 *
 *   POS  the fixture at the widest rung — every class present, nothing cut.
 *   NEG  the same fixture at the narrowest rung — damage must APPEAR. A probe
 *        that cannot see a loss cannot report a survival.
 *
 * A class SURVIVES a rung if it is present in the VISIBLE part of at least one
 * line — the text before the cut, which lands as a trailing `…`
 * (`ADR-UNIVERSAL-ELISION-050`). Nothing is inferred about what the cut took.
 * Damage is reported beside the classes, because a frame that withholds a value
 * silently is lying at the moment it matters most.
 *
 * Prints numbers, not conclusions.
 *
 * Run: bun scripts/frame-classes.ts
 */
import { renderDocument } from "../src/render";
import { stripANSI } from "../src/width";
import { DRACULA_PALETTE } from "../src/palette";

const LADDER = [79, 61, 43, 31];
const CUT = "\u2026";

/** A frame, not a document: no title, no prose, no address. Three slots on a
 *  row — slug, state glyph, value — plus the two channels the silo already
 *  owns: a Braille texture and a block history. */
const FIXTURE = [
  "| zone | state | value | note |",
  "|---|---|---|---|",
  "| hab | ✓ | 21.4 °C | nominal |",
  "| core | ⸮ | 55.2 kPa | watch |",
  "| spine | ✗ | 723 W/m² | derated |",
  "",
  `load ⣿⣶⣤⣀⣀⣤⣶⣿`,
  "",
  `week ▁▂▃▅▆▇█▇▆▅▃▂▁`,
].join("\n");

interface Klass {
  name: string;
  /** What the class is, in the predicate's own terms. */
  predicate: string;
  test: (line: string) => boolean;
}

const CLASSES: readonly Klass[] = [
  { name: "value", predicate: "a numeric measurement, with its unit", test: (l) => /\d+(?:\.\d+)?\s*(?:°C|kPa|W\/m²)/.test(l) },
  { name: "glyph", predicate: "a state glyph, one column", test: (l) => /[✓✗⸮]/.test(l) },
  { name: "slug", predicate: "the row's name, left of its state", test: (l) => /^\s*[a-z]{2,}\s/.test(l) },
  { name: "texture", predicate: "a Braille density run (U+2800–28FF)", test: (l) => /[\u2800-\u28FF]{3,}/.test(l) },
  { name: "history", predicate: "a block run — one cell, one time step", test: (l) => /[▁▂▃▄▅▆▇█]{5,}/.test(l) },
];

/** Not a class, and measured anyway: the note column is PROSE, and the thesis
 *  is that prose is what a frame deletes. Reporting it separates "the frame
 *  survived" from "the note was never a class". */
const NOTES = ["nominal", "watch", "derated"];

/** The receipt: the frame states what it withheld. */
const RECEIPT = /…|needs \d+ cols|art elided/;

async function frame(width: number): Promise<string> {
  const out = await renderDocument(FIXTURE, { width, color: "none", palette: DRACULA_PALETTE });
  return stripANSI(out);
}

/** What a reader can see of a line: everything before the cut. */
function visible(line: string): string {
  const at = line.indexOf(CUT);
  return at === -1 ? line : line.slice(0, at);
}

/** A class survives when it is present in what the reader can see. */
function survives(text: string, k: Klass): boolean {
  return text.split("\n").some((line) => k.test(visible(line)));
}

function damaged(text: string): boolean {
  return text.split("\n").some((line) => RECEIPT.test(line));
}

const results = [];
for (const width of LADDER) {
  const text = await frame(width);
  results.push({ width, text, alive: CLASSES.map((k) => survives(text, k)), receipt: damaged(text) });
}

// ── Controls ────────────────────────────────────────────────────────────
const pos = results[0]!;
const neg = results[results.length - 1]!;
const posPass = pos.alive.every(Boolean) && !pos.receipt;
// The negative control is the RECEIPT, not a lost class: this probe reports
// survival AND damage, and a run in which narrowing produces neither would mean
// the fixture never met the glass edge.
const negPass = neg.receipt;

console.log("frame classes — the instrument frame's ladder");
console.log(`\nPOS widest rung ${pos.width}: every class present, nothing cut → ${posPass ? "PASS" : "FAIL"}`);
console.log(`NEG narrowest ${neg.width}: damage appears → ${negPass ? "PASS" : "FAIL"}`);
if (!posPass) {
  console.log("\nthe detector cannot see the fixture — no number below is read");
  process.exit(1);
}
if (!negPass) {
  console.log("\nthe detector cannot see damage — no survival below is read");
  process.exit(1);
}

const head = ["class".padEnd(9), ...results.map((r) => String(r.width).padStart(4))].join(" ");
console.log(`\n${head}`);
console.log("-".repeat(head.length));
CLASSES.forEach((k, i) => {
  const row = [k.name.padEnd(9), ...results.map((r) => (r.alive[i] ? "   ✓" : "   ✗"))].join(" ");
  console.log(row);
});
console.log([ "damage".padEnd(9), ...results.map((r) => (r.receipt ? "   ⋯" : "   ·"))].join(" "));
const noteVisible = (text: string) => NOTES.filter((n) => text.includes(n)).length;
console.log(`\nnot a class, measured: note column visible → ${results.map((r) => `${r.width}=${noteVisible(r.text)}/${NOTES.length}`).join(" · ")}`);
console.log(`\nclasses: ${CLASSES.length}`);
console.log(`survive: ${results.map((r) => `${r.width}=${r.alive.filter(Boolean).length}/${CLASSES.length}`).join(" · ")}`);
console.log("\npredicates, so the table can be argued with:");
for (const k of CLASSES) console.log(`  ${k.name.padEnd(9)} ${k.predicate}`);
