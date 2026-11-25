/**
 * cahier-math.test.ts — the three-stage maths ladder (BRF-CAHIER-MATH).
 *
 * The claim under test is not "pandoc ran". It is that the ladder's *order*
 * holds: the converter's answer wins where it has one, the glyph table rescues
 * what it declined, and the currency guard survives both. Each test below is a
 * span from the corpus census taken 2026-11-25, so a failure names the document
 * that produced it.
 */

import { describe, expect, test } from "bun:test";
import { mathsPass, pandocMath, resolveMathAnswer } from "../scripts/cahier-math.ts";
import { applyMathGlyphs } from "../src/render.ts";

const NO_PANDOC = "/nonexistent/pandoc-for-the-degrade-test";

describe("cahier maths — stage 1, the converter wins", () => {
  test("a fraction becomes real MathML, not a flattened one-liner", () => {
    const out = mathsPass("$\\frac{3\\mu}{2R^3} \\approx \\zeta$");
    expect(out).toContain("<math");
    expect(out).toContain("<mfrac");
    // The terminal's answer is the one we are leaving behind.
    expect(applyMathGlyphs("$\\frac{3\\mu}{2R^3} \\approx \\zeta$")).toBe("3μ/(2R³) ≈ ζ");
  });

  test("a command-free span is maths after all — the census's 24", () => {
    const out = mathsPass("$H_2O$");
    expect(out).toContain("<math");
    expect(out).toContain("<msub>");
    // …and the guard is why the terminal cannot say so.
    expect(applyMathGlyphs("$H_2O$")).toBe("$H_2O$");
  });

  test("the TeX survives in the annotation — degradation is the author's text", () => {
    expect(mathsPass("$Z=13$")).toContain('encoding="application/x-tex"');
  });
});

describe("cahier maths — stage 3, the table rescues the decline", () => {
  test("$\\S$ renders § — the one span where the table beats the converter", () => {
    const out = mathsPass("a $\\S$ b");
    expect(out).toContain("§");
    expect(out).not.toContain("$\\S$");
    // Still wrapped, so the page says this came from maths.
    expect(out).toContain('class="math inline"');
  });

  test("glyphs are escaped: a declined span may linearise to a '<'", () => {
    // `\beta` is not in the table, so the span must use a command that is —
    // otherwise this tests the decline path instead of the escaping path.
    expect(applyMathGlyphs("$\\alpha < \\beta$")).toBe("$\\alpha < \\beta$");
    const out = resolveMathAnswer('<span class="math inline">$\\alpha &lt; 1$</span>');
    expect(out).toBe('<span class="math inline">α &lt; 1</span>');
  });

  test("MathML wins over the wrapper when both are present", () => {
    const out = resolveMathAnswer('<span class="math inline">$x$</span><math><mi>x</mi></math>');
    expect(out).toBe("<math><mi>x</mi></math>");
  });
});

describe("cahier maths — the currency guard survives both converters", () => {
  test("a currency pair is untouched, byte for byte", () => {
    const src = "costs $5 and $10 for two.";
    expect(mathsPass(src)).toBe(src);
  });

  test("a single amount is untouched", () => {
    const src = "Cost: $5.";
    expect(mathsPass(src)).toBe(src);
  });

  test("the accidental pair the conversion leaves is not scanned", () => {
    // pandoc leaves `$5 and $` as literal text; stage 3 enters by the span
    // wrapper, never by hunting `$`, so that pair is never a candidate.
    expect(mathsPass("costs $5 and $10 plus $\\frac{1}{2}$")).toContain("$5 and $10");
  });
});

describe("cahier maths — the exemptions are structural", () => {
  test("an inline code span keeps its TeX", () => {
    const out = mathsPass("the flag `$\\alpha$` and the value $\\alpha$");
    expect(out).toContain("`$\\alpha$`");
    expect(out).toContain("<math");
  });

  test("a fenced block is not touched", () => {
    const src = "```\n$\\alpha$\n```\n";
    expect(mathsPass(src)).toBe(src);
  });

  test("a source with no dollar costs nothing and returns identically", () => {
    const src = "# Heading\n\nPlain prose.\n";
    expect(mathsPass(src)).toBe(src);
  });
});

describe("cahier maths — the degrade", () => {
  test("no converter on PATH gives the terminal's answer, exactly", () => {
    const src = "a $\\alpha$ b and costs $5 and $10 and $H_2O$";
    expect(mathsPass(src, NO_PANDOC)).toBe(applyMathGlyphs(src));
  });

  test("pandocMath reports absence rather than throwing", () => {
    expect(pandocMath(["\\alpha"], NO_PANDOC)).toBeNull();
  });
});

describe("cahier maths — the batch pairs answers by marker, not by position", () => {
  test("answers land on their own index", () => {
    const bodies = ["\\alpha", "\\frac{a}{b}", "5 and "];
    const answers = pandocMath(bodies)!;
    expect(answers).toHaveLength(3);
    expect(answers[0]).toContain("<mi>α</mi>");
    expect(answers[1]).toContain("<mfrac>");
    // The currency fragment is declined, and says so rather than lying.
    expect(answers[2]).not.toContain("<math");
  });

  test("an empty batch does not spawn a process", () => {
    expect(pandocMath([])).toEqual([]);
  });
});
