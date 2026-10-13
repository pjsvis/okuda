/**
 * squint-probe.ts — 2026-10-12
 *
 * Progressive engagement, measured. The question: as the glass narrows,
 * which ELEMENT CLASSES stop being legible as themselves? A heading that
 * still reads as a heading survives; a diagram whose right-hand boxes have
 * been elided into the gutter does not.
 *
 * Controls first, and the positive one must pass before any corpus number
 * is read:
 *
 *   POS  the fixture at the widest rung — every class present, zero elision.
 *        If this fails, the detector cannot see anything and the run stops.
 *   NEG  the same fixture at the narrowest rung — elision must APPEAR.
 *        If it does not, the detector cannot see the failure it is for.
 *
 * Only then the corpus: 515 tracked documents on a geometric ladder.
 *
 * Elision is the tell. ADR-UNIVERSAL-ELISION-050 cut every overflow with
 * `⋮`, so a cut is a character in the stream, not an inference. Nothing
 * here guesses at a width; the renderer states it.
 *
 * Prints numbers, not conclusions.
 *
 * Run: bun scripts/squint-probe.ts
 */
import { renderDocument } from "../src/render";
import { stripANSI } from "../src/width";

// Geometric ladder, ratio ~1.4, all prime-or-odd: no rung shares a residue
// with the 2-col margins or the 4-col wrap budget.
const LADDER = [79, 61, 43, 31];

const CUT = "\u2026"; // … the table-edge cut lands as a trailing ellipsis
const ART_LOST = /art elided/; // the renderer states the art cut in words
const SRC_OMITTED = /source elided/; // every fence says this regardless of width
const HEADING = /^\s*#{1,6} /;
const RULE = /─{10,}/;
// `│` is shared by table columns and diagram boxes, so it discriminates
// neither: table damage is measured by the trailing cut, not by the glyph.
const GLYPH = /[┌┐└┘├┤┬┴┼│▲▼◄►▶◁△▽◤◥◣◐◑●]/;

interface Tally {
  lines: number;
  head: number;
  rule: number;
  glyph: number;
  prose: number;
}
const zero = (): Tally => ({ lines: 0, head: 0, rule: 0, glyph: 0, prose: 0 });
const has = (t: Tally, cls: keyof Tally) => t[cls] > 0;

/** The two losses are counted apart from the line classes: a cut line is
 *  still a diagram/table line, but it is a DAMAGED one. · is not … */
function losses(raw: string) {
  let artElided = 0;
  let srcOmitted = 0;
  let cuts = 0;
  for (const line of stripANSI(raw).split("\n")) {
    if (ART_LOST.test(line)) artElided++;
    if (SRC_OMITTED.test(line)) srcOmitted++;
    if (line.trimEnd().endsWith(CUT)) cuts++;
  }
  return { artElided, srcOmitted, cuts };
}

function count(raw: string): Tally {
  const t = zero();
  for (const line of stripANSI(raw).split("\n")) {
    if (line.trim() === "") continue;
    t.lines++;
    if (HEADING.test(line)) t.head++;
    else if (RULE.test(line)) t.rule++;
    else if (GLYPH.test(line)) t.glyph++;
    else t.prose++;
  }
  return t;
}

const WIDE_DIAGRAM = [
  "```mermaid",
  "graph TD",
  "  A[compositing belongs to the environment] --> B[windowing belongs to the host]",
  "  B --> C[rendering belongs to okuda]",
  "  C --> D[coloured bytes out]",
  "```",
].join("\n");

const FIXTURE = [
  "---",
  "callsign: DOC-SQUINT",
  "---",
  "",
  "# A map, not a field",
  "",
  "One line of prose that states the point and stops.",
  "",
  "| element | owner | note |",
  "| --- | --- | --- |",
  "| compositing | environment | the origin of the bytes |",
  "| windowing | host | the pane |",
  "",
  "- a short list",
  "- of short items",
  "",
  WIDE_DIAGRAM,
  "",
].join("\n");

// ── Controls ───────────────────────────────────────────────────────────
const wide = LADDER[0]!;
const narrow = LADDER[LADDER.length - 1]!;
const pos = count(await renderDocument(FIXTURE, { width: wide, color: "none" }));
const neg = count(await renderDocument(FIXTURE, { width: narrow, color: "none" }));
const posLoss = losses(await renderDocument(FIXTURE, { width: wide, color: "none" }));
const negLoss = losses(await renderDocument(FIXTURE, { width: narrow, color: "none" }));

const classes: (keyof Tally)[] = ["head", "rule", "glyph", "prose"];
const posMissing = classes.filter((c) => !has(pos, c));

console.log("=== controls ===");
console.log(`POS @${wide} : ${JSON.stringify(pos)} losses ${JSON.stringify(posLoss)}`);
console.log(`NEG @${narrow}  : ${JSON.stringify(neg)} losses ${JSON.stringify(negLoss)}`);
if (posMissing.length > 0) {
  console.log(`\nHALT — positive control fails: no ${posMissing.join(", ")} at the widest rung.`);
  console.log("The detector cannot see the classes it is for. Corpus numbers withheld.");
  process.exit(1);
}
if (posLoss.artElided > 0 || posLoss.cuts > 0) {
  console.log(`\nHALT — positive control is not clean at ${wide}: the fixture already loses art.`);
  console.log("The rung is not a baseline. Corpus numbers withheld.");
  process.exit(1);
}
if (negLoss.artElided === 0 && negLoss.cuts === 0) {
  console.log(`\nHALT — negative control fails: no loss at ${narrow}.`);
  console.log("The detector cannot see the failure it is for. Corpus numbers withheld.");
  process.exit(1);
}
console.log("POS passes (every class present, no art loss, no cut).");
console.log(`NEG passes (loss appears: art elided ${negLoss.artElided}, cuts ${negLoss.cuts}).`);

// ── The corpus ─────────────────────────────────────────────────────────
const files = Bun.spawnSync(["git", "ls-files", "*.md"], { stdout: "pipe" })
  .stdout.toString()
  .split("\n")
  .filter((s) => s.trim() !== "");

const per: Map<number, Tally> = new Map(LADDER.map((w) => [w, zero()]));
const loss: Map<number, { artElided: number; docsArt: number; cuts: number; docsCut: number }> = new Map(
  LADDER.map((w) => [w, { artElided: 0, docsArt: 0, cuts: 0, docsCut: 0 }]),
);
const docs: Map<number, number> = new Map(LADDER.map((w) => [w, 0]));
const withClass: Map<number, Map<keyof Tally, number>> = new Map(
  LADDER.map((w) => [w, new Map(classes.map((c) => [c, 0]))]),
);

console.log(`\n=== corpus: ${files.length} documents on the ladder ===\n`);
for (const w of LADDER) {
  const t = per.get(w)!;
  const l = loss.get(w)!;
  for (const f of files) {
    const src = await Bun.file(f).text();
    const raw = await renderDocument(src, { width: w, color: "none" });
    const one = count(raw);
    const ls = losses(raw);
    t.lines += one.lines;
    t.head += one.head;
    t.rule += one.rule;
    t.glyph += one.glyph;
    t.prose += one.prose;
    l.artElided += ls.artElided;
    if (ls.artElided > 0) l.docsArt++;
    l.cuts += ls.cuts;
    if (ls.cuts > 0) l.docsCut++;
    docs.set(w, (docs.get(w) ?? 0) + 1);
    const wc = withClass.get(w)!;
    for (const c of classes) if (has(one, c)) wc.set(c, (wc.get(c) ?? 0) + 1);
  }
  process.stderr.write(`  ${w} done\n`);
}

const base = per.get(LADDER[0]!)!;
const baseDocs = withClass.get(LADDER[0]!)!;

console.log(`width  lines  head  rule  glyph   prose`);
console.log("-".repeat(48));
for (const w of LADDER) {
  const t = per.get(w)!;
  console.log(
    [
      String(w).padStart(5),
      String(t.lines).padStart(6),
      String(t.head).padStart(5),
      String(t.rule).padStart(5),
      String(t.glyph).padStart(6),
      String(t.prose).padStart(7),
    ].join(""),
  );
}

console.log(`\nelement-class survival (documents holding >=1 line of the class)`);
console.log(`width  head%  rule%  glyph%  prose%`);
console.log("-".repeat(38));
for (const w of LADDER) {
  const wc = withClass.get(w)!;
  console.log(
    [
      String(w).padStart(5),
      ...classes.map((c) =>
        `${Math.round(((wc.get(c) ?? 0) / (baseDocs.get(c) || 1)) * 100)}%`.padStart(7),
      ),
    ].join(""),
  );
}

console.log(`\ndamage (documents showing a loss, and the marks counted)`);console.log(`width  artElided  docs  cuts  docs`);
console.log("-".repeat(38));
for (const w of LADDER) {
  const l = loss.get(w)!;
  console.log(
    [
      String(w).padStart(5),
      String(l.artElided).padStart(10),
      String(l.docsArt).padStart(6),
      String(l.cuts).padStart(6),
      String(l.docsCut).padStart(6),
    ].join(""),
  );
}

console.log(`\nreflow inflation (lines vs the widest rung)`);
for (const w of LADDER) {
  const t = per.get(w)!;
  console.log(`  ${String(w).padStart(3)} : ${((t.lines / base.lines) * 100).toFixed(0)}% of baseline lines`);
}

// Which documents inflate, and which class inflates with them. Speculation
// about the mechanism is what this exists to replace.
const growth: { file: string; at79: number; at31: number; g79: number; g31: number }[] = [];
for (const f of files) {
  const src = await Bun.file(f).text();
  const a = count(await renderDocument(src, { width: wide, color: "none" }));
  const b = count(await renderDocument(src, { width: narrow, color: "none" }));
  growth.push({ file: f, at79: a.lines, at31: b.lines, g79: a.glyph, g31: b.glyph });
}
growth.sort((x, y) => (y.at31 - y.at79) - (x.at31 - x.at79));
console.log(`\ntop inflators (lines added 79 -> 31, and glyph lines added)`);
for (const g of growth.slice(0, 10)) {
  console.log(
    `  +${String(g.at31 - g.at79).padStart(4)} lines (glyph +${String(g.g31 - g.g79).padStart(4)})  ${g.file}`,
  );
}
const gAdd = growth.reduce((s, g) => s + Math.max(0, g.g31 - g.g79), 0);
const gAll = growth.reduce((s, g) => s + (g.g31 - g.g79), 0);
console.log(`\nglyph-line growth attributed to the top 10: ${growth.slice(0, 10).reduce((s, g) => s + (g.g31 - g.g79), 0)} of ${gAll} net (${gAdd} gross)`);
