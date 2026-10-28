import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { configBlock, oklchL, ratio, rows, rungLine } from "../scripts/contrast";

// The page is a claim set — every ratio on it is arithmetic, so every ratio on it
// can be checked. This file is what makes `docs/2026-10-28-the-ground-you-read-on.md`
// an instrument rather than prose: change a pair, or change a palette hex, and the
// page fails rather than quietly going stale. The generator-drift lesson is
// `just palette-swatch`'s: a derived doc nobody regenerates claimed a hex for weeks.

const DOC = join(
  import.meta.dir,
  "..",
  "docs",
  "2026-10-28-the-ground-you-read-on.md",
);
const page = (): string => readFileSync(DOC, "utf8");

describe("the ground page — pinned against its instrument (ADR-GLASS-INK-073)", () => {
  test("the paste block is verbatim from the instrument, so a pair cannot drift", () => {
    // The block is rendered from PAIRS, never hand-typed twice: a rung added to
    // the instrument and forgotten in the page is the drift this catches.
    expect(page()).toContain(configBlock());
  });

  test("every rung on the page is the instrument's own line, verbatim", () => {
    // One line per rung, rendered by the instrument and asserted here: the page
    // cannot drift from the measurement, and a number cannot wrap mid-value —
    // the fields are atomic, which is also why this is a list and not a table.
    const text = page();
    for (const r of rows()) expect(text).toContain(rungLine(r));
  });

  test("the hierarchy holds on every rung: no rule out-shouts the prose", () => {
    // `share` = muted ÷ ink. Above 1 the divider is louder than the thing it
    // divides. The instrument prints it; this is the pass/fail reading.
    for (const r of rows()) expect(r.ruleShare).toBeLessThan(1);
  });

  test("the refused rung is refused by measurement, not by taste", () => {
    // The page says "the rules erode". That claim is checked: the refused pair
    // must have the weakest `muted` contrast of any ground in the set, which is
    // the mechanism the prose names.
    const all = rows();
    const refused = all.filter((r) => r.refused);
    expect(refused).toHaveLength(1);
    const weakest = all.reduce((a, b) => (a.watched["muted"]! <= b.watched["muted"]! ? a : b));
    expect(refused[0]!.n).toBe(weakest.n);
  });

  test("the refusal's number is on the page", () => {
    const refused = rows().find((r) => r.refused)!;
    expect(page()).toContain(refused.watched["muted"]!.toFixed(2));
  });

  test("the page names its instrument — a claimed fact names how it was made", () => {
    expect(page()).toContain("scripts/contrast.ts");
    expect(page()).toContain("tests/contrast.test.ts");
  });

  test("a foreground change leaves the palette's contrast alone; a ground change does not", () => {
    // The page's central distinction, asserted rather than asserted-in-prose:
    // rungs 1–3 share one ground with the control, so every role reads the same
    // against it. Rung 4 changes the ground and therefore the roles.
    const [control, r1, r2, r3, r4] = [0, 1, 2, 3, 4].map(
      (n) => rows().find((r) => r.n === n)!,
    );
    for (const r of [r1!, r2!, r3!]) {
      expect(r.watched).toEqual(control!.watched);
    }
    expect(r4!.watched["muted"]).not.toBe(control!.watched["muted"]);
  });
});

describe("the contrast primitives", () => {
  test("ratio is order-free and bounded 1–21", () => {
    expect(ratio("#ffffff", "#000000")).toBeCloseTo(21, 5);
    expect(ratio("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(ratio("#282c34", "#282c34")).toBeCloseTo(1, 5);
  });

  test("OKLCH L is perceptual: black 0, white 1, mid grey near 0.6", () => {
    expect(oklchL("#000000")).toBeCloseTo(0, 3);
    expect(oklchL("#ffffff")).toBeCloseTo(1, 3);
    // #808080 is linear-Y ≈ 0.216 (contrast 5.3:1 against white) but reads as
    // ~0.6 in L — the reason the table carries both numbers.
    expect(oklchL("#808080")).toBeGreaterThan(0.55);
    expect(oklchL("#808080")).toBeLessThan(0.65);
  });
});
