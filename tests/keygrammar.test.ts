import { describe, expect, test } from "bun:test";
import { KEYBINDINGS, verbFor } from "../src/keygrammar";
import { CLONE_TOKEN, VECTOR_MIN, VECTOR_MAX } from "../src/vectors";

describe("keygrammar — the two-digit language as data", () => {
  test("verbs and modes occupy the reserved block 00-10", () => {
    expect(verbFor(0)).toBe("exit");
    expect(verbFor(1)).toBe("frame");
    expect(verbFor(2)).toBe("slide");
    expect(verbFor(3)).toBe("freeze");
    expect(verbFor(9)).toBe("editNew");
    expect(verbFor(10)).toBe("edit");
  });

  test("99 is the clone verb, reserved", () => {
    expect(verbFor(99)).toBe("clone");
    expect(CLONE_TOKEN).toBe(99);
  });

  test("the address range resolves to vectors", () => {
    expect(verbFor(11)).toBe("vector");
    expect(verbFor(98)).toBe("vector");
  });

  test("reserved-unassigned tokens are silent, not missing", () => {
    for (const t of [4, 5, 6, 7, 8]) expect(verbFor(t)).toBeNull();
  });

  test("the bindings are a table — renumbering is data, not code", () => {
    // Every binding key is outside the address range: verbs and modes
    // never collide with silcrow addresses, and renumbering is a one-
    // line table edit.
    for (const key of Object.keys(KEYBINDINGS)) {
      const n = Number(key);
      expect(n < VECTOR_MIN || n > VECTOR_MAX).toBe(true);
    }
  });
});
