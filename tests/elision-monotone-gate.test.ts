import { describe, expect, test } from "bun:test";
import { risesIn, totalsMonotone, residueAgainst } from "../scripts/elision-monotone";

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
