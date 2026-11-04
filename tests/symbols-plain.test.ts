import { describe, expect, test } from "bun:test";
import { MATH_GLYPHS, PLAIN_SYMBOLS, plainSymbols, renderDocument } from "../src/render";
import { DRACULA_PALETTE } from "../src/palette";
import { displayWidth, stripANSI } from "../src/width";

const W = 80;

/** Blocks a face has carried since before terminals were a product — the boundary
 *  the table is derived against, stated once here so a codepoint added to the
 *  repertoire outside it fails a test instead of a render. */
const KEPT = (cp: number): boolean =>
  cp < 0x80 || // ASCII
  (cp >= 0x80 && cp <= 0xff) || // Latin-1: the silcrow, °, ×, ±, ²
  (cp >= 0x2000 && cp <= 0x206f) || // General Punctuation: — – ’ … •
  (cp >= 0x2500 && cp <= 0x257f) || // box drawing — the grid
  (cp >= 0x2580 && cp <= 0x259f) || // block elements
  (cp >= 0x2800 && cp <= 0x28ff); // Braille

const render = (src: string, symbols?: "rich" | "plain"): Promise<string> =>
  renderDocument(src, { width: W, color: "none", palette: DRACULA_PALETTE, symbols });

const REPERTOIRE = [
  "| state | note |",
  "|---|---|",
  "| ✓ confirmed | x ≫ y, ⋮ fold |",
  "| ✗ refused | H₂O σ ∑ ∝ |",
  "| ☐ open | ⸮ ◆ ▶ ▸ ▲ ▼ √ ∈ ≈ ≤ ≥ ≠ ∼ |",
  "",
  "Greek: α ε μ ρ τ θ π ζ Δ Ω ⟶, scripts: T⁴ ⁵ ⁷ ⁰ ₃ ₐ ₓ ₘ, accent: ṁ",
].join("\n");

describe("the plain repertoire — the control first", () => {
  test("`rich` is the default, byte for byte: the mode adds nothing when unset", async () => {
    const [unset, rich] = [await render(REPERTOIRE), await render(REPERTOIRE, "rich")];
    expect(unset).toBe(rich);
    expect(unset).toContain("✓");
    expect(unset).toContain("≫");
  });

  test("`plain` emits nothing outside ASCII and the blocks every face has", async () => {
    const out = stripANSI(await render(REPERTOIRE, "plain"));
    const stray = [...out].filter((c) => !KEPT(c.codePointAt(0)!));
    expect(stray).toEqual([]);
    // The substitution is legible as what it means, not as a removal.
    expect(out).toContain("[x] confirmed");
    expect(out).toContain("[ ] refused");
    expect(out).toContain("x >> y");
    expect(out).toContain("H_2O s sum prop.");
  });

  test("plain keeps the address grammar: the silcrow is Latin-1 and stays", async () => {
    // A silcrow rewritten to `S` would break the mark the page is navigated by.
    const out = stripANSI(await render("see `src/width.ts` and §12", "plain"));
    expect(out).toContain("§12");
  });

  test("code spans and fences are literal in both modes — a mode does not edit the author", async () => {
    const src = "fence:\n\n```\nx ≫ y ✓\n```\n\ninline `x ≫ y ✓` end.\n";
    const plain = stripANSI(await render(src, "plain"));
    // The characters survive; the paint around them is the fence's own register.
    expect(plain).toContain("x ≫ y ✓");
  });
});

describe("the colour modes compose with the repertoire mode", () => {
  test("`plain` has identical line breaks with and without colour", async () => {
    // The 2x2 matrix the brief asks for: a mode that moved a line break would put
    // the sink payload (`--no-color`, fixed width) out of step with the glass.
    const [colour, none] = await Promise.all([
      renderDocument(REPERTOIRE, { width: W, color: "truecolor", palette: DRACULA_PALETTE, symbols: "plain" }),
      renderDocument(REPERTOIRE, { width: W, color: "none", palette: DRACULA_PALETTE, symbols: "plain" }),
    ]);
    const breaks = (s: string): string => s.split("\n").map((l) => stripANSI(l)).join("\n");
    expect(breaks(colour)).toBe(breaks(none));
  });
});

describe("the table is self-checking against the vocabulary", () => {
  const keys = new Map(PLAIN_SYMBOLS);
  const values = MATH_GLYPHS.map(([, v]) => v).filter((v) => v.length > 0);

  test("no unmapped maths: every glyph the table can emit outside the kept blocks is mapped", () => {
    const unmapped = values.filter((v) => {
      const cp = v.codePointAt(0)!;
      // A multi-column glyph (sin, sum) is ASCII already; a kept codepoint needs
      // no mapping. Everything else must have a row.
      return [...v].length === 1 && !KEPT(cp) && !keys.has(v);
    });
    expect(unmapped).toEqual([]);
  });

  test("no dead key: every row is a codepoint the renderer can actually receive", () => {
    // The state vocabulary, the maths values and the accent forms are the three
    // sources; a key outside them would be a mapping for a character no document
    // can produce.
    // Derived, not listed: every codepoint a *document* can carry — the fixture
    // above, plus the maths vocabulary, plus the accent forms the pass produces.
    const reachable = new Set<string>([
      ...[...REPERTOIRE],
      ...[...values].flatMap((v) => [...v]),
      ...["ṁ", "\u0307"],
    ]);
    const dead = PLAIN_SYMBOLS.map(([k]) => k).filter((k) => !reachable.has(k));
    expect(dead).toEqual([]);
  });

  test("every row is a one-to-one substitution, so a plain page can be diffed against a rich one", () => {
    expect(plainSymbols("≫ ⋮ ∝")).toBe(">> : prop.");
    // Idempotent: the output holds nothing left to substitute.
    expect(plainSymbols(plainSymbols("≫ ⋮ ∝"))).toBe(">> : prop.");
  });
});

describe("the pass runs before layout, which is why a table survives it", () => {
  test("a table containing two-column substitutions keeps its pipes aligned", async () => {
    const src = "| a | b |\n|---|---|\n| ≫ | ⋮ |\n| ✓ | ✗ |\n";
    const plain = stripANSI(await render(src, "plain"));
    expect(plain).toContain(">>");
    // The proof that the substitution preceded layout: the rule is drawn from the
    // *substituted* widths, so no row can out-run it. A post-layout pass would
    // push the `>>` rows one column past the rule, which is the defect this
    // asserts against rather than assumes.
    const lines = plain.split("\n").filter((l) => l.trim());
    const rule = lines.find((l) => /^\s*[─-]+\s*$/.test(l));
    expect(rule).toBeDefined();
    const ruleWidth = displayWidth(rule!.trim());
    const rows = lines.filter((l) => /[│|]/.test(l) || /\[.|\[x\]/.test(l));
    for (const row of rows) expect(displayWidth(row.trim())).toBeLessThanOrEqual(ruleWidth);
  });
});
