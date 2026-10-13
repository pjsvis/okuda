/**
 * elision-monotone.ts — 2026-10-12
 *
 * The one thing the squint ladder did not test: is the cut RECOVERABLE?
 *
 * ADR-TABLE-EDGE-CUT-055 states the law and it is older than this probe —
 * *below the cap a cut is recoverable: the reader's lever is widen, and
 * widening brings the bytes back; past the cap there is no lever, so the cut
 * no longer truncates, it HIDES, and hiding is the one thing the model
 * refuses.* Tables are covered: `tests/table-fit.test.ts` asserts *elision is
 * monotone in the glass*, and `scripts/tables-check.ts` owns the class.
 *
 * Nothing asserts it for the other classes. Diagram art elides at the glass
 * (`diagramBlock`), code fences at the glass minus the margin, and prose wraps.
 * `ADR-UNIVERSAL-ELISION-050` made elision universal; if the law is universal,
 * this is where it is checked. **The invariant: the number of cut lines is
 * non-increasing as the glass widens.** A document that cuts more at a wider
 * rung is a hide, and a hide is the defect class — not the cut.
 *
 * Controls first, and they halt the run:
 *
 *   POS  the fixture at the narrowest rung must CUT. If nothing cuts the
 *        sweep measures nothing.
 *   NEG  the same fixture at a wide rung must be CLEAN. If it still cuts, the
 *        ladder is too short to be a baseline.
 *
 * A cut is read from the renderer's own output: a line ending in `…` whose
 * display width reaches the content budget. The width gate is what keeps a
 * literal ellipsis in prose from being read as a cut — and the ungated count
 * is printed beside it, so the size of that error is visible rather than
 * asserted. BAND_CONTENT is imported, never copied: an instrument that reads a
 * constant the renderer does not use will call a whole table cut
 * (ADR-TABLE-EDGE-CUT-055, *the instrument must measure what the renderer
 * DRAWS*).
 *
 * Prints numbers, not conclusions.
 *
 * Run: bun scripts/elision-monotone.ts
 */
import { renderDocument, BAND_CONTENT } from "../src/render";
import { displayWidth, stripANSI } from "../src/width";

// 74 and 80 are the ADR's own rungs (an observed split pane; the design
// width); 116 is the band. Nothing here is a multiple of the 2-col margin.
const LADDER = [60, 74, 80, 100, 120, 160];
const CUT = "\u2026"; // …
const ART_LOST = /art elided/;

interface Reading {
  cuts: number;
  art: number;
}

/** **The exact provenance test, and it costs one substitution.** A source
 *  ellipsis and a renderer cut are indistinguishable in the output — and a
 *  source ellipsis that lands at a wrap boundary reads as a cut, which is what
 *  made ten documents look non-monotone. Matching contexts was the wrong
 *  instrument: partial, heuristic, and leaky. Neutralise the source instead —
 *  replace every `…` with `x` (same display width, same break behaviour, so the
 *  layout is bit-identical) before rendering. Now every `…` in the output is
 *  the renderer's own, by construction, and needs no proof. */
function read(raw: string, glass: number): Reading {
  const budget = Math.min(glass, BAND_CONTENT) - 2;
  let cuts = 0;
  let art = 0;
  for (const line of stripANSI(raw).split("\n")) {
    const t = line.trimEnd();
    if (t.endsWith(CUT) && displayWidth(t) >= budget) cuts++;
    if (ART_LOST.test(line)) art++;
  }
  return { cuts, art };
}

const neutral = (src: string): string => src.replace(/\u2026/g, "x");

/** The fixture is built to be genuinely irreducible, because the fit work
 *  (BRF-TABLE-GLASS-FIT) made the obvious fixture wrap instead of cut. Two
 *  carriers of a cut that only widening repairs:
 *   - a table cell holding a 70-character atomic token (no `/ . _ @ -` to
 *     break at), which no target below 70 can hold;
 *   - an LR diagram chain whose art is ~116 columns, wider than the narrow
 *     rungs and fitting at 120.
 *  Verified: 4 cut lines at 60, 0 at 120. */
const ATOMIC = "ALPHA".repeat(14);

const FIXTURE = [
  "---",
  "callsign: DOC-MONOTONE",
  "---",
  "",
  "# The fixture",
  "",
  "| element | note |",
  "| --- | --- |",
  `| atomic | ${ATOMIC} |`,
  "",
  "A long prose line that carries a path like",
  "`src/some/deeply/nested/directory/module-name.ts` and keeps going, so it must wrap rather than cut.",
  "",
  "```mermaid",
  "graph LR",
  "  A[compositing] --> B[windowing] --> C[rendering] --> D[colour] --> E[bytes]",
  "```",
  "",
].join("\n");

const wide = LADDER[LADDER.length - 1]!;
const narrow = LADDER[0]!;
const pos = read(await renderDocument(neutral(FIXTURE), { width: narrow, color: "none" }), narrow);
const neg = read(await renderDocument(neutral(FIXTURE), { width: 120, color: "none" }), 120);

console.log("=== controls ===");
console.log(`POS @${narrow} : ${JSON.stringify(pos)}`);
console.log(`NEG @120  : ${JSON.stringify(neg)}`);
if (pos.cuts === 0) {
  console.log(`\nHALT — the fixture does not cut at ${narrow}. The sweep measures nothing.`);
  process.exit(1);
}
if (neg.cuts > 0) {
  console.log(`\nHALT — the fixture still cuts at 120. The ladder has no clean baseline.`);
  process.exit(1);
}
console.log(`POS passes (the fixture cuts at ${narrow}: ${pos.cuts}).`);
console.log("NEG passes (the fixture is clean at 120).");

// ── The corpus ─────────────────────────────────────────────────────────
const files = Bun.spawnSync(["git", "ls-files", "*.md"], { stdout: "pipe" })
  .stdout.toString()
  .split("\n")
  .filter((s) => s.trim() !== "");

const total: Map<number, Reading> = new Map();
const docsWith: Map<number, { cuts: number; art: number }> = new Map();
const perDoc: Map<string, Map<number, number>> = new Map();

for (const w of LADDER) {
  total.set(w, { cuts: 0, art: 0 });
  docsWith.set(w, { cuts: 0, art: 0 });
}

console.log(`\n=== corpus: ${files.length} documents on the ladder ===\n`);
for (const w of LADDER) {
  const t = total.get(w)!;
  const d = docsWith.get(w)!;
  for (const f of files) {
    const src = await Bun.file(f).text();
    const r = read(await renderDocument(neutral(src), { width: w, color: "none" }), w);
    t.cuts += r.cuts;
    t.art += r.art;
    if (r.cuts > 0) d.cuts++;
    if (r.art > 0) d.art++;
    let m = perDoc.get(f);
    if (!m) perDoc.set(f, (m = new Map()));
    m.set(w, r.cuts);
  }
  process.stderr.write(`  ${w} done\n`);
}

console.log(`width   cuts   docs  artElided`);
console.log("-".repeat(34));
for (const w of LADDER) {
  const t = total.get(w)!;
  const d = docsWith.get(w)!;
  console.log(
    [
      String(w).padStart(5),
      String(t.cuts).padStart(6),
      String(d.cuts).padStart(6),
      String(d.art).padStart(10),
    ].join(""),
  );
}

// ── The invariant ──────────────────────────────────────────────────────
const violations: { file: string; from: number; to: number; before: number; after: number }[] = [];
for (const [file, m] of perDoc) {
  for (let i = 1; i < LADDER.length; i++) {
    const lo = LADDER[i - 1]!;
    const hi = LADDER[i]!;
    const a = m.get(lo) ?? 0;
    const b = m.get(hi) ?? 0;
    if (b > a) violations.push({ file, from: lo, to: hi, before: a, after: b });
  }
}

console.log(`\n=== the invariant: cuts are non-increasing as the glass widens ===`);
console.log(`documents whose cut count ROSE at a wider rung : ${violations.length}`);
for (const v of violations.slice(0, 12)) {
  console.log(`  ${v.file}: ${v.before} at ${v.from} -> ${v.after} at ${v.to}`);
}

const totalMono = LADDER.every((w, i) => i === 0 || total.get(w)!.cuts <= total.get(LADDER[i - 1]!)!.cuts);
console.log(`corpus totals non-increasing                   : ${totalMono ? "yes" : "NO"}`);

// ── The irreducible set ────────────────────────────────────────────────
// ADR-TABLE-EDGE-CUT-055 names its irreducible tables by file and line
// ("Computer says NO: Too ugly"). Nothing names the residue in the other
// classes — the cuts that widening cannot repair, which are the ones the law
// hands back to the document. So name them.
const stubborn: { file: string; cuts: number; art: number }[] = [];
for (const f of files) {
  const src = await Bun.file(f).text();
  const r = read(await renderDocument(neutral(src), { width: wide, color: "none" }), wide);
  if (r.cuts > 0 || r.art > 0) stubborn.push({ file: f, cuts: r.cuts, art: r.art });
}
console.log(`\n=== the irreducible set at ${wide} columns (widening cannot repair) ===`);
console.log(`documents still losing content : ${stubborn.length} of ${files.length}`);
for (const s of stubborn.sort((a, b) => b.cuts - a.cuts)) {
  console.log(`  ${String(s.cuts).padStart(3)} cut line(s), art ${s.art > 0 ? "LOST" : "ok  "}  ${s.file}`);
}
