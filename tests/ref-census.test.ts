import { describe, expect, test } from "bun:test";
import { refFindings, findingLine, type BranchRow, type Declaration } from "../scripts/ref-census";

/** The census's judgement, asserted by constructing the rows.
 *
 *  Why this file exists: the gate ran for a day on its author's *transient*
 *  evidence — it failed against the real sidings, which were then deleted, so
 *  from that moment nothing in the repo showed the gate could fail at all. Every
 *  other lint here exports a pure core for exactly this reason (`verdict`,
 *  `countIds`, `statusFor`); this one was written as a straight-line script and
 *  had no test for a day, which is the defect this file closes. */

const row = (over: Partial<BranchRow> & { name: string }): BranchRow => ({
  ahead: 1,
  behind: 0,
  age: 1,
  subjects: [],
  ...over,
});

const TODAY = new Date("2026-10-13");
const declared = (why: string, review: string): Record<string, Declaration> => ({
  "feat/declared": { why, review },
});

describe("ref-census — a branch is deleted, current, or declared, and nothing else", () => {
  test("the three states, and only one of them is quiet", () => {
    const rows = [
      row({ name: "feat/done", ahead: 0, behind: 9 }), // merged: the tip is in main
      row({ name: "feat/live", ahead: 3, behind: 0 }), // current: can still fast-forward
      row({ name: "feat/siding", ahead: 2, behind: 40 }), // neither
    ];
    const { findings, merged, live } = refFindings(rows, {}, TODAY);
    expect(merged.map((r) => r.name)).toEqual(["feat/done"]);
    expect(live.map((r) => r.name)).toEqual(["feat/live", "feat/siding"]);
    expect(findings.map((f) => f.kind)).toEqual(["merged", "siding"]);
    expect(findings.map((f) => f.branch)).toEqual(["feat/done", "feat/siding"]);
  });

  test("a CURRENT branch is not a finding — the negative that keeps the gate usable", () => {
    // In flight is the normal case. A gate that failed here would be waived
    // within a day, which is how a gate stops meaning anything.
    expect(refFindings([row({ name: "feat/live", ahead: 5, behind: 0 })], {}, TODAY).findings).toEqual([]);
  });

  test("a siding names its own remedy", () => {
    const f = refFindings([row({ name: "feat/siding", ahead: 2, behind: 9 })], {}, TODAY).findings;
    expect(f).toHaveLength(1);
    expect(findingLine(f[0]!)).toContain("cannot fast-forward");
    expect(findingLine(f[0]!)).toContain("rebase it, land it, or declare it");
  });

  test("a merged branch's remedy is the delete, named", () => {
    const f = refFindings([row({ name: "feat/done", ahead: 0, behind: 30 })], {}, TODAY).findings;
    expect(findingLine(f[0]!)).toBe("merged but still here: feat/done — git branch -d feat/done");
  });

  test("a declaration silences a siding while its review date holds", () => {
    const rows = [row({ name: "feat/declared", ahead: 1, behind: 259, age: 12 })];
    expect(refFindings(rows, declared("parked on #999", "2026-11-15"), TODAY).findings).toEqual([]);
    // …and stops silencing it the day after.
    const late = refFindings(rows, declared("parked on #999", "2026-11-15"), new Date("2026-11-16")).findings;
    expect(late.map((f) => f.kind)).toEqual(["expired"]);
    expect(findingLine(late[0]!)).toContain("review date 2026-11-15 has passed");
  });

  test("a declaration for a branch that is gone is stale — the list may only shrink", () => {
    const f = refFindings([row({ name: "feat/other", ahead: 1, behind: 0 })], declared("gone", "2026-11-15"), TODAY).findings;
    expect(f.map((x) => x.kind)).toEqual(["stale-declaration"]);
    expect(findingLine(f[0]!)).toContain("drop the declaration");
  });

  test("a merged branch fails even when declared — carrying nothing is not parkable", () => {
    const rows = [row({ name: "feat/declared", ahead: 0, behind: 5 })];
    expect(refFindings(rows, declared("parked on #999", "2026-11-15"), TODAY).findings.map((f) => f.kind)).toEqual([
      "merged",
    ]);
  });

  test("every kind has a line, and no kind is unworded", () => {
    // The report and the gate print `findingLine`; a kind without a line would
    // typecheck and fail at the glass.
    const kinds = ["merged", "siding", "expired", "stale-declaration"] as const;
    for (const kind of kinds) {
      const line = findingLine({ kind, branch: "b", remedy: "r" });
      expect(line).toContain("b");
      expect(line).toContain("r");
    }
  });
});
