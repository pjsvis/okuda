import { describe, expect, test } from "bun:test";
import { splitKeyEvents } from "../src/keygrammar";
import { advanceNumBuffer, digitOf } from "../src/tui";

/**
 * The gesture matrix (BRF-PROLONGED-PRESS) — the CONTRACT, not the
 * mechanism. tmp/burst-probe.ts measured what a held key does; these
 * tests are what the measurement became: three physical affordances
 * — two delayed taps, a fast double tap, a prolonged hold — are ONE
 * gesture that emits ONE token, and it is the same token for all
 * three. Written against the observable interface only: the harness
 * drives the real lexer (splitKeyEvents) and the real buffer
 * (advanceNumBuffer) exactly as the reducer does, and carries the
 * buffer OPAQUELY between events — the contract never inspects its
 * shape, so the run buffer (the mechanism, the next layer) may change
 * it underneath without rewriting these tests.
 *
 * The cases the pre-run-buffer mechanism failed were test.todo —
 * the contract on the record, red until the run buffer landed, then
 * flipped live without touching the harness or the bodies. A held
 * key used to fire its actuator once per pair; the contract says
 * once per gesture, and the run buffer is what makes it so.
 *
 * NO CLOCK, ANYWHERE. A pending digit waits forever because TIME IS
 * NOT AN INPUT: the buffer sees only (digit | non-digit), the gap
 * between two reads is the arbitrary wait, and nothing that happens
 * in a gap can reach a pure function. The parked quiet period (the
 * latch expiry, BRF-PROLONGED-PRESS's later layer) is scoped to the
 * SPENT latch only, starts after resolution so it can never expire a
 * half-typed pair, and — by its own constraint — the clock is IO and
 * lives in the caller. advanceNumBuffer stays pure forever; the scan
 * below is the tripwire that keeps it so.
 */

const enc = (s: string) => new Uint8Array([...s].map((c) => c.charCodeAt(0)));

/** Run the reducer's digit path by hand: each read through the real
 *  lexer, each event through the real buffer, digitOf deciding digit
 *  vs non-digit exactly as applyKey does. Reads model TTY delivery
 *  boundaries — the buffer accumulates across them by construction,
 *  which is the whole point: chunking decides where the pairs fall,
 *  never how many there are. Returns the tokens that fired, in
 *  order. */
const feed = (reads: string[]): number[] => {
  let buffer: ReturnType<typeof advanceNumBuffer>["buffer"] = null;
  const tokens: number[] = [];
  for (const read of reads) {
    for (const ev of splitKeyEvents(enc(read))) {
      const step = advanceNumBuffer(buffer, digitOf(ev));
      buffer = step.buffer;
      if (step.token !== null) tokens.push(step.token);
    }
  }
  return tokens;
};

/** The gesture's token: digit d, doubled — 0 → 0 (`00`), 9 → 99. */
const pair = (d: number): number => Number(`${d}${d}`);

describe("gesture matrix — green today, green under the run buffer", () => {
  test("two delayed taps: one token, same as every other spelling — and the wait between the taps is arbitrary by construction", () => {
    // Two reads, one tap each. The gap between the reads IS the wait:
    // nothing happens in it, because nothing can — time is not an
    // input to a pure function. A timer sneaking into the input path
    // is what this case exists to break: the second tap must always
    // complete the pair, however long the reader paused.
    for (let d = 0; d <= 9; d++) {
      expect(feed([`${d}`, `${d}`])).toEqual([pair(d)]);
    }
  });

  test("a fast double tap: one read, two events, one token — burst-safe", () => {
    for (let d = 0; d <= 9; d++) {
      expect(feed([`${d}${d}`])).toEqual([pair(d)]);
    }
  });

  test("a run of three fires once — the pair resolves at two and the tail is swallowed, never a second token", () => {
    // Under the pre-run-buffer mechanism this also fired once — but by
    // re-arming a stale pending digit, the ambush the one-shot probe
    // below catches. The run buffer swallows the tail instead: same
    // observable, honest reason now. Either mechanism, one token —
    // the observable is the contract.
    for (let d = 0; d <= 9; d++) {
      expect(feed([`${d}${d}${d}`])).toEqual([pair(d)]);
    }
  });

  test("the pending state's exits are exhaustive — every digit completes the pair, a non-digit aborts it; there is no input left that could carry a clock", () => {
    // From a pending 9, the input space is {0–9, non-digit} and it is
    // exhausted here: each digit completes a token, null clears.
    // The "arbitrary wait" is the absence of input, and absence has
    // no representation in the function — so a pending digit cannot
    // expire, only complete or abort. This totality IS the no-clock
    // property, behaviourally.
    const first = advanceNumBuffer(null, "9");
    expect(first.token).toBeNull();
    for (let e = 0; e <= 9; e++) {
      const second = advanceNumBuffer(first.buffer, String(e));
      expect(second.token).toBe(Number(`9${e}`)); // completes, never expires
    }
    expect(advanceNumBuffer(first.buffer, null).token).toBeNull(); // the abort
  });

  test("the buffer's own source carries no clock — a timer cannot sneak in (the quiet period, when it lands, lives in the caller)", () => {
    // Function-scoped, not file-scoped: the TUI has legitimate timers
    // (the flash receipt), but the token path may not. The parked
    // quiet period is IO by its own constraint — if its clock ever
    // creeps into the pure function, this goes red and the creep is
    // loud instead of silent.
    const src = advanceNumBuffer.toString();
    expect(src).not.toContain("setTimeout");
    expect(src).not.toContain("setInterval");
    expect(src).not.toContain("Date.now");
    expect(src).not.toContain("performance.now");
  });

  test("mixed pairs repeat freely: 1212 is TWO vectors, no intervening key — the asymmetry that allocates repeatable verbs to the vector space", () => {
    // A vector is never latched: mixed digits cannot repeat within a
    // run, so the run buffer has nothing to swallow. Jumps repeat
    // back-to-back; doubled pairs cannot. That is the allocation,
    // not a defect.
    expect(feed(["1212"])).toEqual([12, 12]);
  });

  test("a different digit intervenes: 1122 is two actuators — 11, then 22", () => {
    expect(feed(["1122"])).toEqual([11, 22]);
  });

  test("the abort affordances: a lone ESC stands a pending digit down; so does any non-digit — letters, arrows, the ]]/[[ motion", () => {
    // The deliberate way out of a half-typed pair. It exists today
    // and the contract keeps it: the abort is the only thing that
    // ends a pending digit besides completing it.
    expect(feed(["9", "\x1b"])).toEqual([]); // the named affordance
    expect(feed(["9", "u"])).toEqual([]); // a stray letter
    expect(feed(["9", "\x1b[A"])).toEqual([]); // an arrow, whole as one event
    expect(feed(["9", "]]"])).toEqual([]); // the section motion, one event
  });

  test("after a completed pair the grammar is empty — a fresh 12 jumps on its own, never fused with stale state", () => {
    expect(feed(["99", "12"])).toEqual([99, 12]);
  });
});

describe("gesture matrix — the contract, red until the run buffer, live since it landed (BRF-PROLONGED-PRESS layer 1)", () => {
  // These were the cases the pre-run-buffer mechanism failed — a held
  // key fired once per PAIR, the contract says once per GESTURE —
  // written first, verified red, then flipped live the day the run
  // buffer landed. Same opaque harness, same bodies: flipping was the
  // whole change.

  test("a prolonged hold fires once: ten repeats, one token, the same token as the taps — every digit 0–9 (pre-run-buffer: ⌈N/2⌉ fired)", () => {
    for (let d = 0; d <= 9; d++) {
      expect(feed([`${d}`.repeat(10)])).toEqual([pair(d)]);
    }
  });

  test("the hold is delivery-proof: one read of ten bytes and ten reads of one byte fire the same one token (the shape that defeats a read-scoped fix)", () => {
    for (let d = 0; d <= 9; d++) {
      const oneRead = [`${d}`.repeat(10)];
      const tenReads = Array.from({ length: 10 }, () => `${d}`);
      expect(feed(oneRead)).toEqual([pair(d)]);
      expect(feed(tenReads)).toEqual([pair(d)]);
    }
  });

  test("a run of four fires once (was two before the run buffer) — the run's remainder is swallowed, not re-armed", () => {
    for (let d = 0; d <= 9; d++) {
      expect(feed([`${d}`.repeat(4)])).toEqual([pair(d)]);
    }
  });

  test("a run of ten fires once (was five before the run buffer)", () => {
    for (let d = 0; d <= 9; d++) {
      expect(feed([`${d}`.repeat(10)])).toEqual([pair(d)]);
    }
  });

  test("99 then 99 with no intervening key fires ONE clone, not two — the one-shot slot: no key-up, no clock, so a repeat of a doubled pair is a hold by any other name", () => {
    // Two deliberate double-taps in separate reads. The equivalence
    // cuts both ways and the contract honours it in both directions:
    // a doubled pair cannot be fired twice in a row without an
    // intervening key. That is the allocation, not a defect.
    expect(feed(["99", "99"])).toEqual([99]);
  });

  test("no pending digit survives a gesture: after a hold, a fresh keystroke starts fresh — never fused with stale state (any digit 0–9)", () => {
    // Under the pre-run-buffer mechanism the third digit re-armed a
    // pending digit, and the next keystroke ambushed into a fused
    // token — for d=9 a fresh 0 jumped to silcrow 90; for d=0 a fresh
    // 1 resolved token 1. The run buffer swallows the tail and the
    // probe digit is a new first tap: [pair(d)], nothing else,
    // nothing left pending from the gesture.
    for (let d = 0; d <= 9; d++) {
      const e = (d + 1) % 10; // differs from d — never the swallowed digit
      expect(feed([`${d}`.repeat(3), `${e}`])).toEqual([pair(d)]);
    }
  });
});
