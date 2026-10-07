import { describe, expect, test } from "bun:test";
import { mathGlyphs, renderDocument } from "../src/render";
import { DRACULA_PALETTE } from "../src/palette";
import { displayWidth, stripANSI } from "../src/width";

const W = 100;

/** Render with colour, then drop the SGR — the text as the eye reads it. */
async function text(src: string, color: "truecolor" | "none" = "truecolor") {
  const out = await renderDocument(src, { width: W, color, palette: DRACULA_PALETTE });
  return stripANSI(out);
}

describe("math glyphs — the pure pass (BRF-MATH-GLYPHS)", () => {
  test("the acceptance criteria, one span at a time", () => {
    expect(mathGlyphs("$\\Delta t$")).toBe("Δt");
    expect(mathGlyphs("$\\rightarrow$")).toBe("→");
    expect(mathGlyphs("$\\le 10$")).toBe("≤ 10");
    expect(mathGlyphs("$\\alpha \\in [0.2, 1.2]$")).toBe("α ∈ [0.2, 1.2]");
    expect(mathGlyphs("$0.5–2.0\\text{ Hz}$")).toBe("0.5–2.0 Hz");
    expect(mathGlyphs("$3{,}840\\text{px}$")).toBe("3,840px");
  });

  test("the rewrites: \\text drops braces, \\frac becomes a slash", () => {
    expect(mathGlyphs("$f(\\text{instruction}, \\text{params}) \\to \\text{render}$"))
      .toBe("f(instruction, params) → render");
    expect(mathGlyphs("$P = \\frac{F}{A}$")).toBe("P = F/A");
    expect(mathGlyphs("$O(\\text{arithmetic})$")).toBe("O(arithmetic)");
  });

  test("a malformed rewrite fails the second gate — no partial mangle", () => {
    // `\frac` is recognised, but there are no braces to rewrite: the
    // whole span stays literal rather than emitting `{F}{A}`.
    expect(mathGlyphs("$\\frac{F}{A}$")).toBe("F/A");
    expect(mathGlyphs("$\\frac F A$")).toBe("$\\frac F A$");
    expect(mathGlyphs("$\\text{oops$")).toBe("$\\text{oops$");
  });

  test("an unknown command keeps the whole span literal", () => {
    expect(mathGlyphs("$\\zeta$")).toBe("$\\zeta$");
    expect(mathGlyphs("$\\alpha \\zeta$")).toBe("$\\alpha \\zeta$");
  });

  test("no command, no translation — the currency guard", () => {
    expect(mathGlyphs("costs $5 and $10")).toBe("costs $5 and $10");
    expect(mathGlyphs("$O(1)$")).toBe("$O(1)$");
    expect(mathGlyphs("$W$ and $11$")).toBe("$W$ and $11$");
    expect(mathGlyphs("a lone $ sign")).toBe("a lone $ sign");
  });

  test("spans pair independently; a newline breaks the pair", () => {
    expect(mathGlyphs("$\\to$ and $\\le$")).toBe("→ and ≤");
    expect(mathGlyphs("$\\to\n\\le$")).toBe("$\\to\n\\le$");
  });

  test("the escape entry covers an unprocessed \\_", () => {
    expect(mathGlyphs("$a \\_ b \\to c$")).toBe("a _ b → c");
  });

  test("every glyph in the table measures one column", () => {
    for (const [, g] of [
      ["\\alpha", "α"], ["\\Delta", "Δ"], ["\\epsilon", "ε"], ["\\in", "∈"],
      ["\\le", "≤"], ["\\ge", "≥"], ["\\neq", "≠"], ["\\to", "→"],
      ["\\times", "×"], ["\\S", "§"], ["\\dots", "…"], ["{,}", ","],
      ["--", "–"], ["\\_", "_"],
    ] as const) {
      expect(displayWidth(g)).toBe(1);
    }
  });
});

describe("math glyphs — in the render", () => {
  test("prose: the span renders as Unicode, delimiters gone", async () => {
    expect(await text("The interval is $\\Delta t$ wide.")).toContain("The interval is Δt wide.");
  });

  test("a table cell translates too (cells route through the text handler)", async () => {
    const out = await text("| a | b |\n| --- | --- |\n| $\\le 10$ | $2.5\\times$ |");
    expect(out).toContain("≤ 10");
    expect(out).toContain("2.5×");
  });

  test("a list item translates", async () => {
    expect(await text("- $\\alpha \\in [0.2, 1.2]$")).toContain("α ∈ [0.2, 1.2]");
  });

  test("fenced code and code spans are untouched — the pass never sees them", async () => {
    const fenced = await text("```\n$\\Delta t$ and ${rowStr}\n```");
    expect(fenced).toContain("$\\Delta t$ and ${rowStr}");
    // The backticks are markup and are consumed by the renderer; the
    // span inside them is content, and it stays authored.
    const span = await text("Use `$\\Delta t$` in a fence.");
    expect(span).toContain("$\\Delta t$");
    expect(span).not.toContain("Δt");
  });

  test("NO_COLOR parity: the substitution is the only difference", async () => {
    const src = "The interval is $\\Delta t$ wide, $\\zeta$ stays.";
    const [colour, plain] = [await text(src, "truecolor"), await text(src, "none")];
    expect(plain).toBe(colour);
    expect(plain).toContain("Δt");
    expect(plain).toContain("$\\zeta$");
  });

  test("an unknown command degrades visibly, not silently", async () => {
    expect(await text("$\\zeta$ renders as authored.")).toContain("$\\zeta$ renders as authored.");
  });
});
