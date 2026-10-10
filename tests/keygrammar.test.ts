import { describe, expect, test } from "bun:test";
import { KEYBINDINGS, readOnlyActive, verbFor, splitKeyEvents } from "../src/keygrammar";
import { CLONE_TOKEN, RESERVED_VECTORS, VECTOR_MIN, VECTOR_MAX } from "../src/vectors";

describe("keygrammar — read-only mode (BRF-ROOT-CONTAINMENT: the spawn verbs retire)", () => {
  test("OKUDA_READONLY=1 declares retirement; anything else does not", () => {
    const saved = process.env.OKUDA_READONLY;
    try {
      delete process.env.OKUDA_READONLY;
      expect(readOnlyActive()).toBe(false); // unset: the verbs stand
      process.env.OKUDA_READONLY = "1";
      expect(readOnlyActive()).toBe(true); // declared: editNew and clone flash
      process.env.OKUDA_READONLY = "0";
      expect(readOnlyActive()).toBe(false); // a declaration, not a truthiness
    } finally {
      if (saved === undefined) delete process.env.OKUDA_READONLY;
      else process.env.OKUDA_READONLY = saved;
    }
  });
});

describe("keygrammar — the two-digit language as data", () => {
  test("verbs and modes occupy the reserved block 00-10", () => {
    expect(verbFor(0)).toBe("exit");
    expect(verbFor(1)).toBe("frame");
    expect(verbFor(2)).toBe("slide");
    expect(verbFor(3)).toBe("freeze");
  });

  test("88 is the edit verb and 99 the clone verb — the spawn pair, doubled", () => {
    expect(verbFor(88)).toBe("edit");
    expect(verbFor(99)).toBe("clone");
    expect(CLONE_TOKEN).toBe(99);
  });

  test("the address range resolves to vectors — the floor is 12 now, 11 is the pocket", () => {
    expect(verbFor(12)).toBe("vector");
    expect(verbFor(98)).toBe("vector");
  });

  test("reserved-unassigned tokens are silent, not missing", () => {
    // 09 and 10 joined the pocket 2026-10-05, when the edit verb moved
    // to the doubled pair (88) beside clone.
    for (const t of [4, 5, 6, 7, 8, 9, 10]) expect(verbFor(t)).toBeNull();
  });

  test("repeated-digit actuators are reserved (ADR-032 — one class, never vectors)", () => {
    // The class is bound at 00 (exit), 88 (edit) and 99 (clone); the
    // rest of the pocket stays silent.
    for (const t of [11, 22, 33, 44, 55, 66, 77]) expect(verbFor(t)).toBeNull();
  });

  test("the bindings are a table — renumbering is data, not code", () => {
    // A binding key is never an ALLOCATABLE address: it is either
    // outside the vector range, or a doubled pair the allocator skips
    // (ADR-032 — 88 and 99 are bound verbs, not addresses).
    for (const key of Object.keys(KEYBINDINGS)) {
      const n = Number(key);
      const allocatable = n >= VECTOR_MIN && n <= VECTOR_MAX && !RESERVED_VECTORS.has(n);
      expect(allocatable).toBe(false);
    }
  });
});

describe("keygrammar — splitKeyEvents (the lexer)", () => {
  test("brackets are not lexed — a run is not a spelling (BRF-SEAM-AUDIT)", () => {
    // `]]` is two keypresses delivered as two reads; the run buffer pairs
    // them (tui.ts, advanceRunBuffer), not the lexer. The lexer groups only
    // the terminal's spellings — the escape sequences below.
    const events = splitKeyEvents(new Uint8Array([0x5d, 0x5d, 0x6a]));
    expect(events.map((e) => Array.from(e))).toEqual([[0x5d], [0x5d], [0x6a]]);
    const up = splitKeyEvents(new Uint8Array([0x5b, 0x5b]));
    expect(up.map((e) => Array.from(e))).toEqual([[0x5b], [0x5b]]);
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
