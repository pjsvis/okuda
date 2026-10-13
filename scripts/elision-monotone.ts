/**
 * elision-monotone.ts — 2026-10-12
 *
 * **The recoverability invariant.** ADR-TABLE-EDGE-CUT-055 states the law and
 * it is older than this probe — *below the cap a cut is recoverable: the
 * reader's lever is widen, and widening brings the bytes back; past the cap
 * there is no lever, so the cut no longer truncates, it HIDES, and hiding is
 * the one thing the model refuses.* Tables are covered: `tests/table-fit.test.ts`
 * asserts *elision is monotone in the glass*, and `scripts/tables-check.ts` owns
 * the class. This measures the same law for every other class — diagram art
 * (elided at the glass), code fences (at the glass minus the margin), prose.
 *
 * **The invariant: cut lines are non-increasing as the glass widens.** A
 * document that cuts MORE at a wider rung is a hide. A hide is the defect class;
 * a cut never was.
 *
 * **Widening is not only the pane.** A host that zooms out buys columns too, so
 * the lever is better read as *the reader's lever is COLUMNS* — and the zoom-out
 * floor is where the second floor lives. Two floors bound a document: the
 * **artefact floor** (its widest unbreakable segment, in columns) and the
 * **glass floor** (the narrowest glass whose text is still legible). Where the
 * artefact floor exceeds the glass floor no rendering is both complete and
 * legible, and the document — not the renderer — owns the problem. That is the
 * set `--strict` names, and the shape a recommendation to the author takes: the
 * document, and the columns it would need.
 *
 * **The provenance test is a substitution, not a heuristic.** A source ellipsis
 * and a renderer cut are indistinguishable in the output, and a source ellipsis
 * that lands at a wrap boundary reads as a cut — which is what made ten
 * documents look non-monotone. Matching contexts was the wrong instrument:
 * partial and leaky. Neutralise the source instead — replace every `…` with `x`
 * (same display width, same break behaviour, so the layout is bit-identical)
 * before rendering. Every `…` in the output is then the renderer's own, by
 * construction, and needs no proof.
 *
 * Controls first, and they halt the run before any corpus number is read:
 *
 *   POS  the fixture at the narrowest rung must CUT. If nothing cuts, the
 *        sweep measures nothing.
 *   NEG  the same fixture at a wide rung must be CLEAN. If it still cuts, the
 *        ladder has no baseline.
 *
 * `BAND_CONTENT` is imported, never copied: an instrument that reads a constant
 * the renderer does not use will call a whole table cut
 * (ADR-TABLE-EDGE-CUT-055, *the instrument must measure what the renderer DRAWS*).
 *
 * Usage:
 *   bun scripts/elision-monotone.ts            # the report — every rung, numbers
 *   bun scripts/elision-monotone.ts --gate     # the invariant only; exit 1 on a rise
 *   bun scripts/elision-monotone.ts --strict   # --gate, and exit 1 on the irreducible set
 *
 * `--gate` runs on `just check`. The corpus is clean as of 2026-10-12 (0 rises
 * in 516 documents), which is the house condition for promoting a report to a
 * gate (BRF-RENDER-DEFECTS: *ship as a report first; a gate when the corpus is
 * clean*).
 */
import { renderDocument, BAND_CONTENT } from "../src/render";
import { displayWidth, stripANSI } from "../src/width";

const args = new Set(process.argv.slice(2));
const GATE = args.has("--gate") || args.has("--strict");
const STRICT = args.has("--strict");

// The report walks a geometric ladder; the gate walks the contractual rungs —
// the design width (80) and the band cap (120) are decisions, not samples, so
// they belong in the gate. 60 and 160 bracket them by 20 columns either side.
const REPORT_LADDER = [60, 74, 80, 100, 120, 160];
const GATE_LADDER = [60, 80, 120, 160];
const LADDER = GATE ? GATE_LADDER : REPORT_LADDER;

const CUT = "\u2026"; // …
/** Anchored on the leading `⋮`: the renderer's indicator line opens with it, and
 *  a document that merely QUOTES the phrase in prose (this project's own
 *  documents do, at length) must not be read as losing a diagram. */
const ART_LOST = /^\s*\u22ee.*art elided/;

/** Replace the source's own ellipses — see the header. One character, same
 *  width, no break semantics, so the composed layout is unchanged. */
const neutral = (src: string): string => src.replace(/\u2026/g, "x");

interface Reading {
  cuts: number;
  art: number;
}

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

/** The fixture is genuinely irreducible, because the fit work
 *  (BRF-TABLE-GLASS-FIT) made the obvious fixture wrap instead of cut. Two
 *  carriers of a cut only widening repairs: a table cell holding a 70-character
 *  atomic token (no `/ . _ @ -` to break at), which no target below 70 can
 *  hold; and an LR diagram chain whose art is ~116 columns. Verified: 4 cut
 *  lines at 60, 0 at 120. */
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

const NARROW = LADDER[0]!;
const WIDE = LADDER[LADDER.length - 1]!;
const pos = read(await renderDocument(neutral(FIXTURE), { width: NARROW, color: "none" }), NARROW);
const neg = read(await renderDocument(neutral(FIXTURE), { width: 120, color: "none" }), 120);

if (!GATE) {
  console.log("=== controls ===");
  console.log(`POS @${NARROW} : ${JSON.stringify(pos)}`);
  console.log(`NEG @120  : ${JSON.stringify(neg)}`);
}
if (pos.cuts === 0) {
  console.error(`HALT — the fixture does not cut at ${NARROW}. The sweep measures nothing.`);
  process.exit(1);
}
if (neg.cuts > 0) {
  console.error("HALT — the fixture still cuts at 120. The ladder has no clean baseline.");
  process.exit(1);
}
if (!GATE) {
  console.log(`POS passes (the fixture cuts at ${NARROW}: ${pos.cuts}).`);
  console.log("NEG passes (the fixture is clean at 120).");
}

// ── The corpus ─────────────────────────────────────────────────────────
const files = Bun.spawnSync(["git", "ls-files", "*.md"], { stdout: "pipe" })
  .stdout.toString()
  .split("\n")
  .filter((s) => s.trim() !== "");

/** A rendering pass is subprocess-bound (the mermaid pipe spawns per fence), so
 *  a small pool buys most of the wall clock back. Renders are pure, and one
 *  document's fences never touch another's. */
async function pool<T, R>(items: T[], limit: number, fn: (t: T) => Promise<R>): Promise<R[]> {
  const out = new Array<R>(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      for (;;) {
        const k = next++;
        if (k >= items.length) return;
        out[k] = await fn(items[k]!);
      }
    }),
  );
  return out;
}

/** One document, one glass. Returns what the renderer lost there. */
async function lose(srcPromise: Promise<string>, w: number): Promise<Reading> {
  return read(await renderDocument(neutral(await srcPromise), { width: w, color: "none" }), w);
}

const CONCURRENCY = 8;

async function sweep(widths: number[]) {
  const cuts = new Map<number, number>();
  const docs = new Map<number, number>();
  const art = new Map<number, number>();
  const perDoc = new Map<string, Map<number, number>>();
  for (const w of widths) {
    cuts.set(w, 0);
    docs.set(w, 0);
    art.set(w, 0);
    const readings = await pool(files, CONCURRENCY, (f) => {
      let m = perDoc.get(f);
      if (!m) perDoc.set(f, (m = new Map()));
      return lose(Bun.file(f).text(), w).then((r) => {
        m.set(w, r.cuts);
        return r;
      });
    });
    for (const r of readings) {
      cuts.set(w, cuts.get(w)! + r.cuts);
      if (r.cuts > 0) docs.set(w, docs.get(w)! + 1);
      if (r.art > 0) art.set(w, art.get(w)! + 1);
    }
    if (!GATE) process.stderr.write(`  ${w} done\n`);
  }
  return { cuts, docs, art, perDoc };
}

const { cuts, docs, art, perDoc } = await sweep(LADDER);

const rises: { file: string; from: number; to: number; before: number; after: number }[] = [];
for (const [file, m] of perDoc) {
  for (let i = 1; i < LADDER.length; i++) {
    const lo = LADDER[i - 1]!;
    const hi = LADDER[i]!;
    const a = m.get(lo) ?? 0;
    const b = m.get(hi) ?? 0;
    if (b > a) rises.push({ file, from: lo, to: hi, before: a, after: b });
  }
}
const totalMono = LADDER.every((w, i) => i === 0 || cuts.get(w)! <= cuts.get(LADDER[i - 1]!)!);

if (GATE) {
  if (rises.length > 0 || !totalMono) {
    console.error(`elision-monotone: FAIL — ${rises.length} document(s) cut MORE at a wider glass`);
    for (const r of rises.slice(0, 12)) console.error(`  ${r.file}: ${r.before} at ${r.from} -> ${r.after} at ${r.to}`);
    process.exit(1);
  }
  if (STRICT) {
    const widest = LADDER[LADDER.length - 1]!;
    const readings = await pool(files, CONCURRENCY, (f) => lose(Bun.file(f).text(), widest));
    const stubborn = files.filter((_, i) => readings[i]!.cuts > 0 || readings[i]!.art > 0);
    if (stubborn.length > 0) {
      console.error(`elision-monotone: FAIL (strict) — ${stubborn.length} document(s) widening cannot repair at ${widest}`);
      for (const f of stubborn) {
        const i = files.indexOf(f);
        const r = readings[i]!;
        console.error(`  ${String(r.cuts).padStart(3)} cut line(s), art ${r.art > 0 ? "LOST" : "ok  "}  ${f}`);
      }
      process.exit(1);
    }
  }
  console.log(
    `elision-monotone: OK (${files.length} documents; cut lines ${cuts.get(LADDER[0]!)} at ${LADDER[0]!} to ${cuts.get(WIDE)} at ${WIDE}; no rise anywhere)`,
  );
  process.exit(0);
}

// ── The report ─────────────────────────────────────────────────────────
console.log(`\n=== corpus: ${files.length} documents on the ladder ===\n`);
console.log(`width   cuts   docs  artElided`);
console.log("-".repeat(34));
for (const w of LADDER) {
  console.log(
    [
      String(w).padStart(5),
      String(cuts.get(w)).padStart(6),
      String(docs.get(w)).padStart(6),
      String(art.get(w)).padStart(10),
    ].join(""),
  );
}

console.log(`\n=== the invariant: cuts are non-increasing as the glass widens ===`);
console.log(`documents whose cut count ROSE at a wider rung : ${rises.length}`);
for (const r of rises.slice(0, 12)) {
  console.log(`  ${r.file}: ${r.before} at ${r.from} -> ${r.after} at ${r.to}`);
}
console.log(`corpus totals non-increasing                   : ${totalMono ? "yes" : "NO"}`);

// ── The irreducible set ────────────────────────────────────────────────
// ADR-TABLE-EDGE-CUT-055 names its irreducible tables by file and line
// ("Computer says NO: Too ugly"). Nothing named the residue in the other
// classes — the losses widening cannot repair, which the law hands back to the
// document. So name them, with the columns they would need.
console.log(`\n=== the irreducible set at ${WIDE} columns (widening cannot repair) ===`);
const widestRead = await pool(files, CONCURRENCY, (f) => lose(Bun.file(f).text(), WIDE));
const stubborn = files
  .map((file, i) => ({ file, ...widestRead[i]! }))
  .filter((s) => s.cuts > 0 || s.art > 0);
console.log(`documents still losing content : ${stubborn.length} of ${files.length}`);
console.log("(the recommendation to the author is this list — a named set, never a warning)");
for (const s of stubborn.sort((a, b) => b.cuts - a.cuts)) {
  console.log(`  ${String(s.cuts).padStart(3)} cut line(s), art ${s.art > 0 ? "LOST" : "ok  "}  ${s.file}`);
}
