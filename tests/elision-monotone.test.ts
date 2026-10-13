import { describe, expect, test } from "bun:test";
import { renderDocument, BAND_CONTENT } from "../src/render";
import { displayWidth, stripANSI } from "../src/width";

/** The recoverability invariant, pinned where it is fast to pin.
 *
 *  SCOPE, stated because the sibling test's name is close enough to mislead:
 *  this file asserts the **renderer's** monotonicity through `renderDocument`.
 *  It does not import `scripts/elision-monotone.ts`. The GATE's own judgement
 *  (the ladder's rise detection, the baseline comparison) is asserted in
 *  `tests/elision-monotone-gate.test.ts`. Two different claims; both are now
 *  checked, and for a day only one of them was.
 *
 *  ADR-TABLE-EDGE-CUT-055: *below the cap a cut is recoverable — the reader's
 *  lever is widen; past the cap there is no lever.* `tests/table-fit.test.ts`
 *  asserts this for tables (*elision is monotone in the glass*). This asserts it
 *  for the classes that test does not reach — diagram art and code fences — and
 *  for the whole document rather than one block.
 *
 *  The corpus-wide form is the integration test (`scripts/elision-monotone.ts
 *  --gate`, on `just check`); this is the branch it cannot isolate. The house
 *  precedent is BRF-TABLE-GLASS-FIT, which put its own width sweep here rather
 *  than in an instrument mode: *isolated and fast*. */

const CUT = "\u2026";

/** A cut line is one that ends in the elision mark at the content budget. The
 *  budget differs by class — diagram art elides at the glass, code at the glass
 *  minus the margin, a table at `min(glass, cap)` — so the gate takes the
 *  smallest of them. */
const cutsAt = (out: string, glass: number): number => {
  const budget = Math.min(glass, BAND_CONTENT) - 2;
  return stripANSI(out)
    .split("\n")
    .filter((l) => l.trimEnd().endsWith(CUT) && displayWidth(l.trimEnd()) >= budget).length;
};

/** A document whose only cut carrier is a table cell holding a 70-character
 *  atomic token (no `/ . _ @ -` to break at). No target below 70 can hold it, so
 *  the narrow rungs cut the composed line; at 120 the token fits and the table
 *  draws whole. Diagram art is added because it cuts by a different path — the
 *  binary's line, elided at the glass — and the two must obey one law. */
const ATOMIC = "ALPHA".repeat(14);
const DOC = [
  "# Recoverability",
  "",
  "| element | note |",
  "| --- | --- |",
  `| atomic | ${ATOMIC} |`,
  "",
  "```mermaid",
  "graph LR",
  "  A[compositing] --> B[windowing] --> C[rendering] --> D[colour] --> E[bytes]",
  "```",
  "",
].join("\n");

const width = (w: number) => renderDocument(DOC, { width: w, color: "none" });

describe("elision is monotone in the glass (ADR-TABLE-EDGE-CUT-055)", () => {
  test("the fixture cuts at the narrow rung — the sweep is measuring something", async () => {
    expect(cutsAt(await width(60), 60)).toBeGreaterThan(0);
  });

  test("the fixture is clean at the band cap", async () => {
    expect(cutsAt(await width(120), 120)).toBe(0);
  });

  test("cut count never rises as the glass widens", async () => {
    const ladder = [60, 74, 80, 100, 120, 160];
    const counts = await Promise.all(ladder.map(async (w) => cutsAt(await width(w), w)));
    for (let i = 1; i < counts.length; i++) {
      expect(
        counts[i]!,
        `cuts rose from ${counts[i - 1]} at ${ladder[i - 1]} to ${counts[i]} at ${ladder[i]}`,
      ).toBeLessThanOrEqual(counts[i - 1]!);
    }
    expect(counts[counts.length - 1]).toBe(0);
  });

  test("a widened glass restores the content the narrow one cut", async () => {
    const narrow = stripANSI(await width(60));
    const wide = stripANSI(await width(160));
    expect(narrow).not.toContain(ATOMIC); // cut, not wrapped: the token is atomic
    expect(wide).toContain(ATOMIC);
  });

  test("the source's own ellipsis is not a cut (the provenance test)", async () => {
    // A document whose only ellipsis is the author's: nothing is cut at any
    // width, so the detector must read zero. This is the substitution the
    // corpus instrument makes, asserted at the unit level.
    const doc = [
      "# Prose",
      "",
      "The silo owns `…` in its prose, and an ellipsis that ends a wrapped line is",
      "still the author's and not the renderer's.",
      "",
    ].join("\n");
    for (const w of [60, 74, 80, 120]) {
      const out = await renderDocument(doc, { width: w, color: "none" });
      expect(cutsAt(out, w), `a source ellipsis read as a cut at ${w}`).toBe(0);
    }
  });
});
