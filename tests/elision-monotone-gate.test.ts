import { describe, expect, test } from "bun:test";
import { risesIn, totalsMonotone, residueAgainst, measureUnit } from "../scripts/elision-monotone";

/** The gate's OWN judgement, asserted by constructing the counts.
 *
 *  `tests/elision-monotone.test.ts` is the sibling, and its name is close
 *  enough to mislead: it does **not** import this script. It asserts the
 *  renderer's monotonicity through `renderDocument` — real, supporting coverage
 *  of the invariant, and not coverage of the gate. Those are different claims,
 *  and only one of them was checked.
 *
 *  What makes the gate escapable: it ran for a day on *transient* evidence — it
 *  passed against the corpus, and the corpus is clean, so nothing in the repo
 *  showed it could fail. Every other lint here exports a pure core for exactly
 *  this reason (`verdict`, `countIds`, `statusFor`). */

const LADDER = [60, 80, 120, 160];
const docs = (rows: Record<string, Record<number, number>>) =>
  new Map(Object.entries(rows).map(([f, m]) => [f, new Map(Object.entries(m).map(([w, n]) => [Number(w), n]))]));

describe("elision-monotone — cut counts never rise as the glass widens", () => {
  test("a document that cuts MORE at a wider rung is found, with its coordinates", () => {
    const rises = risesIn(docs({ "a.md": { 60: 5, 80: 6, 120: 2, 160: 0 } }), LADDER);
    expect(rises).toEqual([{ file: "a.md", from: 60, to: 80, before: 5, after: 6 }]);
  });

  test("the negative that keeps the gate usable: a monotone document is silent", () => {
    // Non-increasing is the normal case — most documents only lose cuts as the
    // glass grows. A gate that fired here would be waived within a day.
    expect(risesIn(docs({ "a.md": { 60: 9, 80: 4, 120: 4, 160: 0 }, "b.md": { 60: 0, 80: 0, 120: 0, 160: 0 } }), LADDER)).toEqual([]);
  });

  test("a rise is per STEP, and one document can rise twice", () => {
    const rises = risesIn(docs({ "a.md": { 60: 1, 80: 3, 120: 2, 160: 4 } }), LADDER);
    expect(rises.map((r) => `${r.from}->${r.to}`)).toEqual(["60->80", "120->160"]);
  });

  test("the corpus totals obey the same rule", () => {
    expect(totalsMonotone(new Map([[60, 100], [80, 50], [120, 50], [160, 0]]), LADDER)).toBe(true);
    expect(totalsMonotone(new Map([[60, 100], [80, 101], [120, 50], [160, 0]]), LADDER)).toBe(false);
  });

  test("a document with a cut diagram is measured by its cut diagrams, not its marker lines", () => {
    // The hump this rule exists for, with the real numbers: `diagram-monster`'s
    // marker lines go 3 at 80 → 15 at 120 because the same rows are blank in
    // view at 80 and in view at 120. Measured as cut lines that is a hide; the
    // number of its cut diagrams went 1 → 1, which is the truth.
    const perDoc = new Map([
      [
        "monster.md",
        new Map([
          [60, { cuts: 9, art: 3 }],
          [80, { cuts: 3, art: 1 }],
          [120, { cuts: 15, art: 1 }],
          [160, { cuts: 11, art: 1 }],
        ]),
      ],
    ]);
    // the marker count would have been flagged
    expect(risesIn(new Map([["monster.md", new Map([[60, 9], [80, 3], [120, 15], [160, 11]])]]), LADDER).length).toBeGreaterThan(0);
    // the unit choice silences it, because the unit is monotone
    expect(risesIn(measureUnit(perDoc), LADDER)).toEqual([]);
    expect([...measureUnit(perDoc).get("monster.md")!.values()]).toEqual([3, 1, 1, 1]);
  });

  test("the unit is chosen per document, never per rung", () => {
    // A per-rung choice would compare marker lines at one width with cut
    // diagrams at the next — two different units across one step — and invent a
    // rise where a document's last diagram stops being cut. Such a document
    // takes cut diagrams at EVERY rung, zeros included.
    const perDoc = new Map([
      [
        "fades.md",
        new Map([
          [60, { cuts: 20, art: 2 }],
          [80, { cuts: 9, art: 1 }],
          [120, { cuts: 0, art: 0 }],
          [160, { cuts: 0, art: 0 }],
        ]),
      ],
    ]);
    expect([...measureUnit(perDoc).get("fades.md")!.values()]).toEqual([2, 1, 0, 0]);
    expect(risesIn(measureUnit(perDoc), LADDER)).toEqual([]);
  });

  test("a document with no diagrams is measured by its cut lines, as it always was", () => {
    const perDoc = new Map([
      [
        "code.md",
        new Map([
          [60, { cuts: 40, art: 0 }],
          [80, { cuts: 12, art: 0 }],
          [120, { cuts: 3, art: 0 }],
          [160, { cuts: 0, art: 0 }],
        ]),
      ],
    ]);
    expect([...measureUnit(perDoc).get("code.md")!.values()]).toEqual([40, 12, 3, 0]);
  });
});

describe("elision-monotone — the residue is baselined, and the baseline may only shrink", () => {
  const accepted = { "wide.md": { cuts: 4 } };

  test("a document outside the baseline is a grown residue", () => {
    const r = residueAgainst([{ file: "wide.md", cuts: 4 }, { file: "new.md", cuts: 2 }], accepted);
    expect(r.grown).toEqual(["new.md"]);
    expect(r.worse).toEqual([]);
    expect(r.shrunk).toEqual([]);
  });

  test("the ratchet: exactly at the baseline passes; one cut worse fails", () => {
    expect(residueAgainst([{ file: "wide.md", cuts: 4 }], accepted)).toEqual({ grown: [], worse: [], shrunk: [] });
    const worse = residueAgainst([{ file: "wide.md", cuts: 5 }], accepted);
    expect(worse.worse).toEqual([{ file: "wide.md", cuts: 5, baseline: 4 }]);
    // …and BETTER than the baseline is not an error either: it is the prune,
    // reported by `shrunk` only when the document stops being stubborn at all.
    expect(residueAgainst([{ file: "wide.md", cuts: 3 }], accepted).worse).toEqual([]);
  });

  test("a document that no longer loses content must be dropped — the baseline names its own prune", () => {
    const r = residueAgainst([], accepted);
    expect(r.shrunk).toEqual(["wide.md"]);
    expect(r.grown).toEqual([]);
  });
});
