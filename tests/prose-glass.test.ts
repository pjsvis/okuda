import { describe, expect, test } from "bun:test";
import { renderDocument } from "../src/render";
import { displayWidth, stripANSI } from "../src/width";

/** The counter-test to a renderer-side prose cap.
 *
 *  On 2026-10-26 `PROSE_MEASURE = 76` shipped and was reversed the same day: at
 *  a wide pane a paragraph stopped at the measure and the rest of the frame was
 *  margin, which reads as the predecessor tool (`ADR-PROSE-MEASURE-071`,
 *  reversing `ADR-PROSE-MEASURE-070`). Nine tests agreed with the cap because
 *  they were written to it — an instrument that encodes a decision can only
 *  confirm it.
 *
 *  What was missing is this: an assertion that prose **follows the glass**. A
 *  paragraph is a flow; where its lines stop is the glass's business and never
 *  a constant the reader cannot raise. Measured as a width rather than a byte
 *  golden, so a legitimate change to wrapping does not disturb these tests while
 *  a reinstated cap fails them at once. */

/** One paragraph long enough that its unwrapped width is far past any cap a
 *  future author might choose. */
const LONG = Array.from({ length: 40 }, (_, i) => `word${String(i).padStart(3, "0")}`).join(" ");
const DOC = `# Title\n\n${LONG}\n`;

/** Widest **prose** line, ANSI stripped. The H1 rail and the thematic rule also
 *  span the content width, so they are excluded: this test is about the text the
 *  cap was applied to, and letting a rule supply the number would let a future
 *  cap hide behind it. */
const widestProse = async (width: number): Promise<number> => {
  const out = stripANSI(await renderDocument(DOC, { width, color: "none" }));
  const prose = out.split("\n").filter((l) => l.includes("word"));
  return Math.max(...prose.map((l) => displayWidth(l)));
};

describe("prose takes the glass (ADR-PROSE-MEASURE-071)", () => {
  test("a paragraph fills a wide glass — no cap between 76 and the margin", async () => {
    // The measure made this 76 at every width. Measured today: 193 at 200.
    expect(await widestProse(200)).toBeGreaterThan(150);
  });

  test("the wrap tracks the glass across widths — 120, 160, 200 all widen", async () => {
    const at120 = await widestProse(120);
    const at160 = await widestProse(160);
    const at200 = await widestProse(200);
    expect(at120).toBeGreaterThan(100);
    expect(at160).toBeGreaterThan(at120);
    expect(at200).toBeGreaterThan(at160);
  });

  test("the narrow glass is unchanged — 80 still wraps inside 76 content", async () => {
    // The cap was a no-op at and below 80, so removing it must not move the one
    // width every reader has. Measured: 73 at 80, 57 at 60.
    expect(await widestProse(80)).toBeLessThanOrEqual(76);
    expect(await widestProse(60)).toBeLessThanOrEqual(60);
  });
});
