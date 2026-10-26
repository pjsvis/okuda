import { describe, expect, test } from "bun:test";
import { renderDocument, PROSE_MEASURE, MIN_RENDER_WIDTH } from "../src/render";
import { displayWidth, stripANSI } from "../src/width";

/** BRF-PROSE-MEASURE — **text takes the measure, art takes the glass.**
 *
 *  Prose was the one class with no width band: at a 300-column glass it wrapped
 *  to 296, the readline length nobody reads at, while tables stopped at 116 and
 *  diagrams cut at the glass. The fix is one constant (`PROSE_MEASURE`, 76
 *  content) and a class rule, not a dial: a live measure would be a third
 *  geometry input, and `needsRepaint` is deliberately two
 *  (ADR-RESIZE-GEOMETRY-046).
 *
 *  These tests pin the property that makes the change safe and the properties
 *  that keep the two classes apart. */

const lines = (out: string) => stripANSI(out).split("\n");
const widest = (out: string) => Math.max(...lines(out).map(displayWidth));

/** ~1200 characters of prose with room to wrap at any rung. */
const PARAGRAPH =
  "Map versus territory is the whole of the argument, and it is older than the " +
  "terminal: the description is never the thing described, the frame is never " +
  "the document, and the measure is never the glass. A reader who is given a " +
  "line three hundred columns long does not read it, they scan it and give up, " +
  "which is the same failure as a diagram cut so short that the topology is a " +
  "rumour. So the renderer states its two classes plainly: text takes the " +
  "measure, art takes the glass, and neither pretends to be the other. ";

const render = (src: string, width: number) =>
  renderDocument(src, { width, color: "none" });

describe("the prose measure (BRF-PROSE-MEASURE)", () => {
  test("prose never exceeds the measure, however wide the glass", async () => {
    const out = await render(PARAGRAPH, 300);
    // measure 76 + the 2-char document margin on each side.
    expect(widest(out)).toBeLessThanOrEqual(PROSE_MEASURE + 2);
    // and the glass invariant is not weakened: nothing overruns the pane
    expect(widest(out)).toBeLessThanOrEqual(300);
  });

  test("prose fills the measure rather than shrinking to it", async () => {
    // A cap that never binds would also pass the test above; this one fails if
    // the wrap is narrower than the measure (an off-by-the-margin floor).
    const out = await render(PARAGRAPH, 300);
    expect(widest(out)).toBeGreaterThanOrEqual(PROSE_MEASURE);
  });

  test("the measure is a no-op at and below 80 columns", async () => {
    // Content width at glass 80 is 76 == the measure, so the code path is byte
    // for byte the old one. This is the regression gate for the whole change:
    // every pane that works today must keep its exact output.
    for (const glass of [MIN_RENDER_WIDTH, 40, 60, 74, 80]) {
      const out = await render(PARAGRAPH, glass);
      expect(widest(out), `glass ${glass}`).toBeLessThanOrEqual(glass - 4 + 2);
      // the prose still reaches the glass's own content width — not the measure
      // of a wider pane, and not a narrower one
      if (glass >= 40) {
        expect(widest(out), `glass ${glass} fills`).toBeGreaterThanOrEqual(glass - 6);
      }
    }
  });

  test("art takes the glass: a fence is not banded by the measure", async () => {
    // 200 columns of preformatted text, a 300-column glass: nothing is cut, and
    // the measure is nowhere near it.
    const fence = "```\n" + "x".repeat(200) + "\n```\n";
    const out = await render(fence, 300);
    expect(widest(out)).toBeGreaterThan(PROSE_MEASURE * 2);
    expect(out).not.toContain("…");
  });

  test("art takes the glass: a table keeps its own 116 band", async () => {
    const table =
      "| a | " + "b".repeat(60) + " | " + "c".repeat(60) + " |\n|---|---|---|\n| 1 | 2 | 3 |\n";
    const out = await render(table, 300);
    // the band (116 content) is narrower than the glass and wider than prose
    expect(widest(out)).toBeLessThanOrEqual(120);
    expect(widest(out)).toBeGreaterThan(PROSE_MEASURE);
  });

  test("the rule and the H1 rail follow the text, not the page", async () => {
    const out = await render("# Title\n\ntext\n\n---\n\nmore text\n", 300);
    const drawn = lines(out).filter((l) => /^\s*[─]+$/.test(l));
    expect(drawn.length).toBeGreaterThan(0);
    // a thematic break is `measure` columns wide, plus the 2-char margin
    for (const l of drawn) expect(displayWidth(l)).toBe(PROSE_MEASURE + 2);
    // the title rail is measure - 4, bracketed by two chips
    const rail = lines(out).find((l) => l.includes("█") && l.includes("─"));
    expect(rail).toBeDefined();
    expect(displayWidth(rail!.trim())).toBe(PROSE_MEASURE - 4 + 4);
  });
});

describe("a fence says that it was cut, not how much (BRF-PROSE-MEASURE P2)", () => {
  /** The operator's ruling: *the elision sign says it all — more to see here, if
   *  you want*. A requirement receipt under a fence was refused, so this test
   *  exists to make the next well-meaning addition argue with a red test. */

  test("an elided fence carries `…` and no receipt vocabulary", async () => {
    const fence = "```\n" + "y".repeat(200) + "\n```\n";
    const out = await render(fence, 80);
    expect(out).toContain("…");
    expect(out).not.toMatch(/\bneeds \d+ cols?\b/);
    expect(out).not.toContain("elided");
  });

  test("a fence that fits says nothing at all", async () => {
    const fence = "```\nshort line\n```\n";
    const out = await render(fence, 80);
    expect(out).not.toContain("…");
    expect(out).not.toContain("elided");
  });

  test("the elision costs no block: line count is invariant under the glass", async () => {
    // ADR-PANE-NOT-CANVAS-069 §5 — a receipt would have been one block that
    // appears and disappears with the pane. It does not exist, so the count is
    // the same at every rung, for a fence that elides at the narrow end.
    const doc = "# T\n\n" + "```\n" + "z".repeat(200) + "\n```\n\ntail\n";
    const counts = new Set<number>();
    for (const glass of [60, 80, 120, 160, 200]) {
      counts.add(lines(await render(doc, glass)).length);
    }
    expect([...counts]).toHaveLength(1);
  });
});
