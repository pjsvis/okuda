import { describe, expect, test } from "bun:test";
import { slugify, stateGlyph, jumpToken, tableRow } from "../scripts/jump-demo";

describe("jump-demo — slugify (the slug is a title, never a stem)", () => {
  test("strips the `Brief:` classification prefix", () => {
    expect(slugify("Brief: Viewport padding — upper and lower render margins"))
      .toBe("Viewport padding — upper and lower render margins");
  });
  test("strips `Decision:` (case-insensitive)", () => {
    expect(slugify("Decision: adopt OKF v0.2")).toBe("adopt OKF v0.2");
  });
  test("stem form: strips the numeric sequence prefix, spaces + capitalises", () => {
    expect(slugify("decision: 011-zero-notification-stillness-and-decoupled-inbox-watchers"))
      .toBe("Zero notification stillness and decoupled inbox watchers");
  });
  test("stem form: the number belongs to the jump token, not the slug", () => {
    expect(slugify("brief: 042-build-the-launcher")).toBe("Build the launcher");
  });
  test("non-stem title: legitimate hyphens preserved (code-fence, soft-wrap, ADR-014)", () => {
    expect(slugify("Brief: Elision primitive — close ADR-014, fix the code-fence soft-wrap lie"))
      .toBe("Elision primitive — close ADR-014, fix the code-fence soft-wrap lie");
  });
  test("title with no class prefix passes through untouched", () => {
    expect(slugify("Rooted Gloam — silo badge and document callsigns"))
      .toBe("Rooted Gloam — silo badge and document callsigns");
  });
});

describe("jump-demo — stateGlyph (deviations earn their mark; default bare)", () => {
  test("rejected → ✗", () => {
    expect(stateGlyph("**Status:** Rejected (2026-08-25, same day)")).toBe("\u2717");
  });
  test("parked → ⋮", () => {
    expect(stateGlyph("**Status:** parked")).toBe("\u22ee");
  });
  test("parked — gate not yet fired → ⋮ (word-boundary match)", () => {
    expect(stateGlyph("**Status:** parked — gate not yet fired")).toBe("\u22ee");
  });
  test("accepted → ✓", () => {
    expect(stateGlyph("**Status:** accepted (as ADR-020)")).toBe("\u2713");
  });
  test("open → no glyph (the default; a column of ☐ is decoration)", () => {
    expect(stateGlyph("**Status:** Open (dogfood-fired)")).toBe("");
  });
  test("pending → no glyph (synonymous with the default)", () => {
    expect(stateGlyph("**Status:** pending")).toBe("");
  });
  test("no Status line → no glyph (unknown is the default)", () => {
    expect(stateGlyph("# A brief with no status line")).toBe("");
  });
  test("case-insensitive: REJECTED → ✗", () => {
    expect(stateGlyph("**Status:** REJECTED")).toBe("\u2717");
  });
});

describe("jump-demo — jumpToken (mixed digits from 12 — ADR-021 amended: the doubled-pair canon, 2026-09-12)", () => {
  test("item 0 (the first) → 12, not 01 — and never 11, which is reserved", () => {
    expect(jumpToken(0)).toBe("12");
  });
  test("item 1 → 13", () => {
    expect(jumpToken(1)).toBe("13");
  });
  test("a ≤8-item list never pays the 0-key stretch (12–19 are 0-free)", () => {
    for (let i = 0; i < 8; i++) expect(jumpToken(i)).not.toContain("0");
  });
  test("the 9th item (i=8 → 20) reintroduces the 0 — the decade boundary bites one item earlier now", () => {
    expect(jumpToken(8)).toBe("20");
    expect(jumpToken(8)).toContain("0");
  });
  test("the two-digit ceiling: item 79 → 98 (80 mixed-digit tokens); item 80 goes three-digit", () => {
    expect(jumpToken(79)).toBe("98");
    expect(jumpToken(80)).toBe("100");
  });
  test("the sequence skips the doubled pairs in place: 21 → 23, 32 → 34", () => {
    expect(jumpToken(9)).toBe("21");
    expect(jumpToken(10)).toBe("23");
    expect(jumpToken(19)).toBe("32");
    expect(jumpToken(20)).toBe("34");
  });
  test("01-09 and every doubled pair are reserved — jumpToken never emits them (the canon)", () => {
    for (let i = 0; i < 80; i++) {
      const n = Number(jumpToken(i));
      expect(n).toBeGreaterThanOrEqual(12);
      expect(n % 11).not.toBe(0); // never 22, 33, … — the actuator class
    }
  });
});

describe("tableRow — the three-column form (td-bdfce0)", () => {
  test("content → address → action; wiring hides in the row's comment", () => {
    const r = tableRow("Ephemeral index generation", "", "BRF-INDEX-JUMP", "14", "briefs/x.md");
    expect(r).toBe("| *Ephemeral index generation* | BRF-INDEX-JUMP | **14** <!-- %%okuda-rhs:14%% briefs/x.md --> |");
  });
  test("the glyph nests as a trailing mark on the slug — no glyph column", () => {
    const r = tableRow("Viewport padding", "\u2717", "BRF-VIEWPORT-PADDING", "11", "briefs/v.md");
    expect(r).toBe("| *Viewport padding* \u2717 | BRF-VIEWPORT-PADDING | **11** <!-- %%okuda-rhs:11%% briefs/v.md --> |");
  });
  test("absent callsign renders an empty cell — honest, not derived", () => {
    const r = tableRow("A slug", "", "", "12", "briefs/y.md");
    expect(r).toContain("| *A slug* |  | **12**");
  });
  test("the row's wiring resolves through extractJumps (line-scan)", async () => {
    const { extractJumps } = await import("../src/tui");
    const row = tableRow("A slug", "", "BRF-A", "15", "briefs/a.md");
    const jumps = extractJumps(`| Document | Callsign | # |\n|---|---|---|\n${row}\n`);
    expect(jumps.get(15)).toBe("briefs/a.md");
  });
});
