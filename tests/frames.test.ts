import { describe, expect, test } from "bun:test";
import { headingLines, frameBounds, snapFrame } from "../src/frames";

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

describe("frames — the okudagram rule (BRF-PAGED-OKUDAGRAM)", () => {
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
