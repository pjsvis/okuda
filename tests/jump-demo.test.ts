import { describe, expect, test } from "bun:test";
import { slugify, stateGlyph } from "../scripts/jump-demo";

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
