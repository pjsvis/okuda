import { describe, expect, test } from "bun:test";
import { countIds, verdict } from "../scripts/td-id-lint";

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

describe("td-id lint — the verdict against baseline", () => {
  test("clean is ok without an entry; a clean file WITH an entry is the loudest shrink", () => {
    expect(verdict(0, undefined)).toBe("ok");
    // Stale entry on a cleaned file: report it, prune it — never leave a
    // count allowance behind (the checksum review's live demonstration).
    expect(verdict(0, 5)).toBe("shrink");
  });

  test("at baseline grandfathers; below suggests the shrink", () => {
    expect(verdict(5, 5)).toBe("ok");
    expect(verdict(4, 5)).toBe("shrink");
  });

  test("over baseline fails", () => {
    expect(verdict(6, 5)).toBe("violation");
  });

  test("any hit in an unbaselined file fails — the valve governs forward", () => {
    expect(verdict(1, undefined)).toBe("violation");
  });
});
