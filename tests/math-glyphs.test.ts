import { describe, expect, test } from "bun:test";
import { MATH_GLYPHS, MATH_REWRITE_ONLY, mathGlyphs, renderDocument } from "../src/render";
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

  describe("whitespace is syntax", () => {
    test("commands close up — the terminator is not content", () => {
      expect(mathGlyphs("$\\Delta \\rho g L^2$")).toBe("ΔρgL²");
      expect(mathGlyphs("$\\mu \\sigma \\rho$")).toBe("μσρ");
      expect(mathGlyphs("$\\epsilon \\sigma A_{\\text{rad}} T^4$")).toBe("εσA_{rad}T⁴");
      expect(mathGlyphs("$\\Delta\\rho$")).toBe("Δρ");
    });

    test("a relation or operator keeps its gap", () => {
      expect(mathGlyphs("$\\alpha \\in [0.2, 1.2]$")).toBe("α ∈ [0.2, 1.2]");
      expect(mathGlyphs("$M_{\\text{anchor}} \\gg M_{\\text{worker}}$"))
        .toBe("M_{anchor} ≫ M_{worker}");
      expect(mathGlyphs("$I_{\\text{max}} - I_{\\text{min}}$")).toBe("I_{max} - I_{min}");
      expect(mathGlyphs("$\\sin x$")).toBe("sin x");
      expect(mathGlyphs("$E \\approx 450\\text{ GPa}$")).toBe("E ≈ 450 GPa");
    });

    test("a gap is never invented — tight stays tight", () => {
      expect(mathGlyphs("$\\mu+Q$")).toBe("μ+Q");
      expect(mathGlyphs("$\\mu = Q$")).toBe("μ = Q");
      expect(mathGlyphs("$a\\to b$")).toBe("a→ b");
    });

    test("the value–unit space is the author's, and it survives", () => {
      // ISO 80000-1: value and unit separated. The space lives inside
      // \text{}, which the strip masks, so it is content rather than syntax.
      expect(mathGlyphs("$65\\text{ m}^3$")).toBe("65 m³");
      expect(mathGlyphs("$9.5\\text{ t}$")).toBe("9.5 t");
      expect(mathGlyphs("$15+\\text{ g/cm}^2$")).toBe("15+ g/cm²");
    });

    test("a literal underscore is prose: its word gaps stay", () => {
      expect(mathGlyphs("$a \\_ b \\to c$")).toBe("a _ b → c");
    });
  });

  describe("script digits", () => {
    test("digits are a total mapping, so they may be pretty", () => {
      expect(mathGlyphs("$\\sigma_1^2$")).toBe("σ₁²");
      expect(mathGlyphs("$\\mu^{-1}$")).toBe("μ⁻¹");
      expect(mathGlyphs("$\\mu^{10}$")).toBe("μ¹⁰");
      expect(mathGlyphs("$\\text{H}_2\\text{O}$")).toBe("H₂O");
      expect(mathGlyphs("$15+\\text{ g/cm}^2$")).toBe("15+ g/cm²");
    });

    test("letters are not: a partial alphabet works once and fails later", () => {
      expect(mathGlyphs("$\\tau_{max}$")).toBe("τ_{max}");
      expect(mathGlyphs("$\\mu^{n}$")).toBe("μ^{n}");
    });

    test("an escaped underline is prose, not a subscript", () => {
      expect(mathGlyphs("$\\text{model\\_2}$")).toBe("model_2");
    });

    test("a command-free span is still left alone — the guard, not the gap", () => {
      expect(mathGlyphs("$T^4$")).toBe("$T^4$");
    });

    test("the composed strings measure what they look like", () => {
      expect(displayWidth(mathGlyphs("$\\text{H}_2\\text{O}$"))).toBe(3);
      expect(displayWidth(mathGlyphs("$\\mu^{10}$"))).toBe(3);
      expect(displayWidth(mathGlyphs("$\\frac{3\\mu}{2R^3}$"))).toBe(8); // 3μ/(2R³)
    });
  });

  test("the fraction restores the grouping LaTeX had, and only where it must", () => {
    // The asymmetry: a numerator needs no brackets unless it holds a loose
    // operator; a denominator must also be a single FACTOR, because `a/2R`
    // continues multiplying outside the fraction under left-associativity.
    expect(mathGlyphs("$\\frac{F}{A}$")).toBe("F/A");
    expect(mathGlyphs("$\\frac{3\\mu}{2R^3}$")).toBe("3μ/(2R³)");
    expect(mathGlyphs("$\\frac{a+b}{c}$")).toBe("(a+b)/c");
    expect(mathGlyphs("$\\frac{x}{2R}$")).toBe("x/(2R)"); // a product denominator
    expect(mathGlyphs("$\\frac{x}{(a+b)}$")).toBe("x/(a+b)"); // already a group
    expect(mathGlyphs("$\\frac{F \\times d}{A}$")).toBe("(F × d)/A");
  });

  test("a malformed rewrite fails the second gate — no partial mangle", () => {
    // `\frac` is recognised, but there are no braces to rewrite: the
    // whole span stays literal rather than emitting `{F}{A}`.
    expect(mathGlyphs("$\\frac{F}{A}$")).toBe("F/A");
    expect(mathGlyphs("$\\frac F A$")).toBe("$\\frac F A$");
    expect(mathGlyphs("$\\text{oops$")).toBe("$\\text{oops$");
  });

  test("an unknown command keeps the whole span literal", () => {
    // `\\zeta` was this exemplar until the 2026-10-30 tranche made it
    // translatable — the exemplar has to be a command with no evidence and
    // no prospect, or the test quietly turns into an assertion about ζ.
    expect(mathGlyphs("$\\oint$")).toBe("$\\oint$");
    expect(mathGlyphs("$\\alpha \\oint$")).toBe("$\\alpha \\oint$");
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

  describe("the 2026-10-30 tranche (ADR-MATH-GRAMMAR-076)", () => {
    test("the regression case: at 17 rows this rendered literally", () => {
      expect(mathGlyphs("$e^{i\\pi}+1=0$")).toBe("e^{iπ}+1=0");
    });

    test("Greek", () => {
      // No gaps: a command terminator is syntax, and nothing here is a relation.
      expect(mathGlyphs("$\\mu \\sigma \\rho \\tau \\theta \\Omega \\zeta$"))
        .toBe("μσρτθΩζ");
    });

    test("relations and operators", () => {
      expect(mathGlyphs("$E \\approx 450\\text{ GPa}$")).toBe("E ≈ 450 GPa");
      expect(mathGlyphs("$M \\gg m \\propto \\pm \\sim \\times$")).toBe("M ≫ m ∝ ± ∼ ×");
      expect(mathGlyphs("$77^\\circ\\text{C}$")).toBe("77^°C");
      expect(mathGlyphs("$34\\%\\text{ O}_2$")).toBe("34% O₂");
      expect(mathGlyphs("$a \\longrightarrow b$")).toBe("a ⟶ b");
    });

    test("accents are rewrites, and the braces are mandatory", () => {
      expect(mathGlyphs("$\\vec{v} \\cdot \\vec{B}$")).toBe("v⃗ · B⃗");
      expect(mathGlyphs("$\\dot{m} = 0$")).toBe("ṁ = 0");
      // No braces, no rewrite: the second gate keeps the span literal rather
      // than emitting an arrow in front of its operand.
      expect(mathGlyphs("$\\vec v$")).toBe("$\\vec v$");
      expect(mathGlyphs("$\\dot m$")).toBe("$\\dot m$");
    });

    test("a function name keeps its word gap", () => {
      expect(mathGlyphs("$\\sin x$")).toBe("sin x");
      expect(mathGlyphs("$\\sin(2\\theta)$")).toBe("sin(2θ)");
      expect(mathGlyphs("$\\sin \\theta$")).toBe("sin θ");
    });

    test("a governing equation now resolves whole", () => {
      expect(mathGlyphs("$\\sum \\vec{F}_{\\text{int}} = 0$")).toBe("∑F⃗_{int} = 0");
      expect(mathGlyphs("$\\tau_{gg} = \\frac{3\\mu}{2R^3}(I_{\\text{max}} - I_{\\text{min}})\\sin(2\\theta)$"))
        .toBe("τ_{gg} = 3μ/(2R³)(I_{max} - I_{min})sin(2θ)");
    });
  });

  test("every glyph in the table measures the columns it spells", () => {
    // The table is the assertion, not a copy of it. The literal list that
    // stood here was the copy, and it had already fallen behind by the time
    // the 2026-10-30 tranche landed — a green test over a stale inventory.
    // A glyph is one column per *character*; an accent is zero, so an
    // accented operand still measures one.
    for (const [cmd, glyph] of MATH_GLYPHS) {
      if (MATH_REWRITE_ONLY.has(cmd)) continue; // syntax, no width of its own
      const columns = [...glyph].filter((c) => displayWidth(c) > 0).length;
      expect(displayWidth(glyph), `${cmd} → ${glyph}`).toBe(columns);
    }
  });

  test("the accent rewrites leave the operand one column wide", () => {
    expect(displayWidth(mathGlyphs("$\\vec{v}$"))).toBe(1);
    expect(displayWidth(mathGlyphs("$\\dot{m}$"))).toBe(1);
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
    const src = "The interval is $\\Delta t$ wide, $\\oint$ stays.";
    const [colour, plain] = [await text(src, "truecolor"), await text(src, "none")];
    expect(plain).toBe(colour);
    expect(plain).toContain("Δt");
    expect(plain).toContain("$\\oint$");
  });

  test("an unknown command degrades visibly, not silently", async () => {
    expect(await text("$\\oint$ renders as authored.")).toContain("$\\oint$ renders as authored.");
  });

  test("the tranche, in the render: a table cell carries a governing equation", async () => {
    const out = await text("| inv | eq |\n| --- | --- |\n| 3 | $P_{\\text{in}} + Q_{\\text{gen}} = \\epsilon \\sigma A_{\\text{rad}} T^4$ |");
    expect(out).toContain("P_{in} + Q_{gen} = εσA_{rad}T⁴");
  });
});
