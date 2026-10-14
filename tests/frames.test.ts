import { describe, expect, test } from "bun:test";
import { headingLines, frameBounds, snapFrame, pageStep, paragraphStarts, STEP_OVERLAP } from "../src/frames";

const doc = [
  "  # Title",            // 0 — heading
  "  intro text",         // 1
  "",                     // 2
  "  ## Section A",       // 3 — heading
  "  a1",                 // 4
  "  a2",                 // 5
  "",                     // 6
  "  ### Sub",            // 7 — heading (nested frames too)
  "  s1",                 // 8
  "  ## Section B",       // 9 — heading
  "  b1",                 // 10
];

describe("frames — the frame rule (BRF-PAGED-OKUDAGRAM)", () => {
  test("a frame is a header to the next header", () => {
    const h = headingLines(doc);
    expect(h).toEqual([0, 3, 7, 9]);
    const f = frameBounds(h, doc.length, 4); // inside Section A
    expect(f).toEqual({ index: 1, start: 3, end: 7 });
  });

  test("the last frame runs to EOF", () => {
    const h = headingLines(doc);
    const f = frameBounds(h, doc.length, 10);
    expect(f).toEqual({ index: 3, start: 9, end: doc.length });
  });

  test("the frame fills from the top: snap lands on the header", () => {
    const h = headingLines(doc);
    expect(snapFrame(h, doc.length, 4, 1)).toBe(7);  // A → Sub
    // k from MID-frame snaps to the current frame's header first —
    // you are inside it — then walks previous frames.
    expect(snapFrame(h, doc.length, 4, -1)).toBe(3); // mid-A → A's header
    expect(snapFrame(h, doc.length, 3, -1)).toBe(0); // at the header → Title
    expect(snapFrame(h, doc.length, 5, 1)).toBe(7);  // still A → Sub
    expect(snapFrame(h, doc.length, 0, -1)).toBe(0); // clamped at the top
    expect(snapFrame(h, doc.length, 10, 1)).toBe(9); // clamped at the bottom
  });

  test("a document with no headings is one frame", () => {
    const flat = ["just", "text"];
    expect(headingLines(flat)).toEqual([]);
    expect(snapFrame([], flat.length, 0, 1)).toBe(0);
  });
});

describe("frames — the step's two strides (BRF-OKUDAGRAM-STEP)", () => {
  test("pageStep: one contiguous glass page — height − overlap, overlap not gap", () => {
    expect(STEP_OVERLAP).toBe(1);
    expect(pageStep(0, 24, 1)).toBe(23);    // 24 − 1: the seam line shows twice
    expect(pageStep(23, 24, 1)).toBe(46);
    expect(pageStep(10, 24, -1)).toBe(0);   // clamped at the top, never negative
    expect(pageStep(0, 1, 1)).toBe(1);      // tiny glass: the stride never dies
  });

  test("the step never gaps: a full walk covers every line", () => {
    // The invariant as a property: walking page steps from the top,
    // every line of the document lands on some glass. Snap-to-header
    // fails this (the tails vanish); the contiguous step passes.
    const height = 5;
    const total = 17;
    const seen = new Set<number>();
    let scroll = 0;
    for (;;) {
      for (let i = scroll; i < Math.min(scroll + height, total); i++) seen.add(i);
      if (scroll + height >= total) break; // maxScroll lives in the TUI; here it's total − height
      const next = pageStep(scroll, height, 1);
      if (next <= scroll) break;
      scroll = next;
    }
    for (let i = 0; i < total; i++) expect(seen.has(i)).toBe(true);
  });

  test("paragraphStarts: blank-separated blocks over the rendered array", () => {
    const doc = [
      "  # Heading",   // 0 — a heading is a block start
      "",              // 1
      "  one",         // 2
      "  two",         // 3
      "",              // 4
      "",              // 5 — consecutive blanks don't mint starts
      "  three",       // 6
      "",              // 7
      "  code",        // 8 — a code block's first line, still a block
    ];
    expect(paragraphStarts(doc)).toEqual([0, 2, 6, 8]);
    expect(paragraphStarts([])).toEqual([]);
  });

  test("the VI stride: }/{ walk paragraph starts, back-steps snap to the current start", () => {
    const doc = ["  a1", "", "  b1", "  b2", "", "  c1"];
    const starts = paragraphStarts(doc);
    expect(starts).toEqual([0, 2, 5]);
    expect(snapFrame(starts, doc.length, 0, 1)).toBe(2);   // } from a1 → b1
    expect(snapFrame(starts, doc.length, 3, 1)).toBe(5);  // } mid-b → c1
    expect(snapFrame(starts, doc.length, 3, -1)).toBe(2); // { mid-b → b's start
    expect(snapFrame(starts, doc.length, 2, -1)).toBe(0);  // { at b's start → a's
  });
});
