import { describe, expect, test } from "bun:test";
import { KEYBINDINGS, verbFor, splitKeyEvents } from "../src/keygrammar";
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

  test("the address range resolves to vectors — the floor is 12 now, 11 is the pocket", () => {
    expect(verbFor(12)).toBe("vector");
    expect(verbFor(98)).toBe("vector");
  });

  test("reserved-unassigned tokens are silent, not missing", () => {
    for (const t of [4, 5, 6, 7, 8]) expect(verbFor(t)).toBeNull();
  });

  test("repeated-digit actuators are reserved (ADR-032 canonized 2026-09-12 — one class, never vectors)", () => {
    for (const t of [11, 22, 33, 44, 55, 66, 77, 88]) expect(verbFor(t)).toBeNull();
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

describe("keygrammar — splitKeyEvents (the lexer)", () => {
  test("vim section pairs ride whole: ]] and [[ are one event each", () => {
    // BRF-OKUDAGRAM-STEP: the declared header-to-header jump. A burst
    // paste of "]]j" is a frame jump then a line step, not two loose
    // brackets swallowed one at a time.
    const events = splitKeyEvents(new Uint8Array([0x5d, 0x5d, 0x6a]));
    expect(events.map((e) => Array.from(e))).toEqual([[0x5d, 0x5d], [0x6a]]);
    const up = splitKeyEvents(new Uint8Array([0x5b, 0x5b]));
    expect(up.map((e) => Array.from(e))).toEqual([[0x5b, 0x5b]]);
  });

  test("mixed brackets split — [ and ] alone are single events", () => {
    const events = splitKeyEvents(new Uint8Array([0x5d, 0x5b, 0x5d]));
    expect(events.map((e) => Array.from(e))).toEqual([[0x5d], [0x5b], [0x5d]]);
  });

  test("escape sequences still ride whole — the ESC [ A family", () => {
    const events = splitKeyEvents(new Uint8Array([0x1b, 0x5b, 0x41, 0x6b]));
    expect(events.map((e) => Array.from(e))).toEqual([[0x1b, 0x5b, 0x41], [0x6b]]);
  });
});
