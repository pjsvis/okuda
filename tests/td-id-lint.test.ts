import { describe, expect, test } from "bun:test";
import { countIds, judge, readBaseline, tally, tdToken, verdict } from "../scripts/td-id-lint";

describe("td-id lint — the pattern (BRF-VALVE-LINT)", () => {
  test("real ID shapes are caught", () => {
    for (const id of ["td-c05892", "td-f10a01", "td-623d89", "td-1234567", "TD-C05892"]) {
      expect(countIds(`see ${id} for the work`)).toBe(1);
    }
  });

  test("near-misses stand: too short, non-hex, prefix-adjacent, 9-hex", () => {
    // countIds, not TD_ID.test — a global regex is stateful across .test()
    // calls; match() resets lastIndex, .test() doesn't.
    for (const s of ["td-12345", "td-xyz789", "atd-c05892", "td-c05892100 words", "vector-12"]) {
      expect(countIds(s)).toBe(0);
    }
  });

  test("a citation-dense line counts them all", () => {
    expect(countIds("td-aaaaaa then td-bbbbbb then td-cccccc")).toBe(3);
  });
});

describe("td-id lint — the tally (pure)", () => {
  test("counts multiplicity, normalised outside the tally", () => {
    expect(tally(["a", "b", "a"])).toEqual({ a: 2, b: 1 });
    expect(tally(["TD-C05892", "td-c05892"], tdToken)).toEqual({ "td-c05892": 2 });
    expect(tally([])).toEqual({});
  });
});

describe("td-id lint — the verdict against a per-token baseline", () => {
  test("clean is ok without an entry; a clean file WITH entries is the loudest shrink", () => {
    expect(judge({}, undefined).verdict).toBe("ok");
    // Stale entry on a cleaned file: report it, prune it — never leave an
    // allowance behind (the checksum review's live demonstration).
    const stale = judge({}, { "td-aaaaaa": 5 });
    expect(stale.verdict).toBe("shrink");
    expect(stale.shrunk).toEqual([["td-aaaaaa", 0, 5]]);
  });

  test("at baseline grandfathers; below suggests the shrink", () => {
    expect(judge({ "td-aaaaaa": 5 }, { "td-aaaaaa": 5 }).verdict).toBe("ok");
    expect(judge({ "td-aaaaaa": 4 }, { "td-aaaaaa": 5 }).verdict).toBe("shrink");
  });

  test("over its own count fails, naming the token", () => {
    const j = judge({ "td-aaaaaa": 6 }, { "td-aaaaaa": 5 });
    expect(j.verdict).toBe("violation");
    expect(j.grown).toEqual([["td-aaaaaa", 6, 5]]);
  });

  test("any hit in an unbaselined file fails — the valve governs forward", () => {
    const j = judge({ "td-bbbbbb": 1 }, undefined);
    expect(j.verdict).toBe("violation");
    expect(j.newTokens).toEqual(["td-bbbbbb"]);
  });

  test("the swap hole: drop one baselined token, gain another, count parity — FAILS", () => {
    // The case the count baseline could not see (BRF-COUNT-BASELINE-TOKENS):
    // two citations before, two after, one of them new. A count comparison
    // reads `ok` here; the token comparison names the intruder.
    const j = judge({ "td-aaaaaa": 1, "td-cccccc": 1 }, { "td-aaaaaa": 1, "td-bbbbbb": 1 });
    expect(j.verdict).toBe("violation");
    expect(j.newTokens).toEqual(["td-cccccc"]);
    expect(j.shrunk).toEqual([["td-bbbbbb", 0, 1]]);
    // the total never moved — which is exactly why the total could not judge
    expect(judge({ a: 1, b: 1 }, { a: 1, b: 1 }).verdict).toBe("ok");
  });
});

describe("td-id lint — the count verdict, and its boundary", () => {
  // Kept for QUANTITY baselines (scripts/date-lint.ts), where the counted
  // things are interchangeable. The boundary is the point: this cannot see a
  // swap, so an identifier namespace takes judge() instead.
  test("the count verdict still holds at, below and over baseline", () => {
    expect(verdict(5, 5)).toBe("ok");
    expect(verdict(4, 5)).toBe("shrink");
    expect(verdict(6, 5)).toBe("violation");
    expect(verdict(0, 5)).toBe("shrink");
    expect(verdict(1, undefined)).toBe("violation");
    expect(verdict(0, undefined)).toBe("ok");
  });

  test("the boundary: a count verdict reads `ok` over a swap, by design", () => {
    // one before, one after, different referent — the count cannot tell
    expect(verdict(1, 1)).toBe("ok");
    expect(judge({ "td-new000": 1 }, { "td-old000": 1 }).verdict).toBe("violation");
  });
});

describe("td-id lint — the baseline reader refuses a total", () => {
  test("a legacy flat {file: count} baseline throws rather than guessing a token set", () => {
    const path = `${import.meta.dir}/fixtures/legacy-count-baseline.json`;
    expect(() => readBaseline(path)).toThrow(/legacy per-file count/);
  });

  test("a token-shaped baseline reads through", () => {
    const path = `${import.meta.dir}/fixtures/token-baseline.json`;
    expect(readBaseline(path)).toEqual({ "a.md": { "td-aaaaaa": 2 } });
  });
});
