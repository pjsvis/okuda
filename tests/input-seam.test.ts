import { describe, expect, test } from "bun:test";
import { splitKeyEvents } from "../src/keygrammar";
import { advanceRunBuffer, tapOf } from "../src/tui";

/**
 * The input seam (BRF-SEAM-AUDIT). The units were green — the lexer paired
 * `]]`, `decodeKey` mapped it, `snapFrame` jumped — and the feature was dead,
 * because two keypresses arrive as two reads and the lexer paired within one.
 * This drives the real lexer and the real run buffer EXACTLY as `applyKey`
 * does, across read boundaries, and asserts the motion fires.
 *
 * Digits are not exercised here — the numeric gestures are `gesture.test.ts`.
 * This is the seam the units never tested: the read boundary.
 */
const enc = (s: string) => new Uint8Array([...s].map((c) => c.charCodeAt(0)));

/** The motions a sequence of reads produces, reduced as applyKey reads them:
 *  lexer → tapOf → run buffer → pair → motion. */
function motions(reads: string[]): string[] {
  const out: string[] = [];
  let buffer: ReturnType<typeof advanceRunBuffer>["buffer"] = null;
  for (const r of reads) {
    for (const ev of splitKeyEvents(enc(r))) {
      const { buffer: next, pair } = advanceRunBuffer(buffer, tapOf(ev));
      buffer = next;
      if (pair === "]]") out.push("frame-down");
      else if (pair === "[[") out.push("frame-up");
    }
  }
  return out;
}

describe("input seam — a two-tap run spans reads (BRF-SEAM-AUDIT)", () => {
  test("]] across two reads fires frame-down — the reported bug", () => {
    expect(motions(["]", "]"])).toEqual(["frame-down"]);
  });

  test("[[ across two reads fires frame-up", () => {
    expect(motions(["[", "["])).toEqual(["frame-up"]);
  });

  test("]] in one read fires too — the run buffer needs no lexer fast-path", () => {
    expect(motions(["]]"])).toEqual(["frame-down"]);
  });

  test("a mixed bracket pair fires nothing", () => {
    expect(motions(["]", "["])).toEqual([]);
    expect(motions(["[", "]"])).toEqual([]);
  });

  test("a held bracket fires once, not a stream — the latch spans reads", () => {
    expect(motions(["]", "]", "]", "]", "]"])).toEqual(["frame-down"]);
  });

  test("a motion between taps aborts the run", () => {
    // `]` held, then `j` (a non-tap) aborts it, then `]` starts fresh: no pair.
    expect(motions(["]", "j", "]"])).toEqual([]);
  });
});
