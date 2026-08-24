import { describe, expect, test } from "bun:test";
import { decodeKey, footerLine, viewport, HINTS } from "../src/tui";
import { makeStyler } from "../src/ansi";
import { DEFAULT_PALETTE } from "../src/palette";

function buf(...bytes: number[]): Uint8Array {
  return new Uint8Array(bytes);
}

describe("tui — decodeKey (single-byte controls)", () => {
  test("quit: q, Q, Ctrl-C (0x03), Ctrl-Z (0x1a), lone Esc", () => {
    expect(decodeKey(buf(0x71))).toBe("quit"); // q
    expect(decodeKey(buf(0x51))).toBe("quit"); // Q (Glow's convention)
    expect(decodeKey(buf(0x03))).toBe("quit"); // Ctrl-C
    expect(decodeKey(buf(0x1a))).toBe("quit"); // Ctrl-Z
    expect(decodeKey(buf(0x1b))).toBe("quit"); // lone Esc
  });
  test("motion: j down, k up, g top, G bottom", () => {
    expect(decodeKey(buf(0x6a))).toBe("down");
    expect(decodeKey(buf(0x6b))).toBe("up");
    expect(decodeKey(buf(0x67))).toBe("top");
    expect(decodeKey(buf(0x47))).toBe("bottom");
  });
  test("half-page: Ctrl-D (0x04) down, Ctrl-U (0x15) up", () => {
    expect(decodeKey(buf(0x04))).toBe("half-down");
    expect(decodeKey(buf(0x15))).toBe("half-up");
  });
  test("reload: r", () => {
    expect(decodeKey(buf(0x72))).toBe("reload");
  });
  test("empty buffer → null", () => {
    expect(decodeKey(buf())).toBeNull();
  });
  test("unknown byte → null", () => {
    expect(decodeKey(buf(0x7a))).toBeNull(); // 'z' — unbound
  });
});

describe("tui — decodeKey (escape sequences)", () => {
  // ESC [ A = ↑, ESC [ B = ↓, ESC [ 5 ~ = PgUp, ESC [ 6 ~ = PgDn
  test("arrows → up/down", () => {
    expect(decodeKey(buf(0x1b, 0x5b, 0x41))).toBe("up");
    expect(decodeKey(buf(0x1b, 0x5b, 0x42))).toBe("down");
  });
  test("page keys → page-up/page-down", () => {
    expect(decodeKey(buf(0x1b, 0x5b, 0x35, 0x7e))).toBe("page-up");
    expect(decodeKey(buf(0x1b, 0x5b, 0x36, 0x7e))).toBe("page-down");
  });
  test("unknown escape sequence → null", () => {
    expect(decodeKey(buf(0x1b, 0x5b, 0x43))).toBeNull(); // ESC [ C — right, unbound
  });
});

describe("tui — viewport slice", () => {
  test("scroll 0 shows the first `height` lines", () => {
    const lines = ["a", "b", "c", "d", "e"];
    const v = viewport(lines, 0, 3);
    expect(v.visible).toEqual(["a", "b", "c"]);
    expect(v.scroll).toBe(0);
    expect(v.maxScroll).toBe(2);
  });
  test("scroll clamps to [0, maxScroll]", () => {
    const lines = ["a", "b", "c"];
    expect(viewport(lines, -5, 2).scroll).toBe(0);
    expect(viewport(lines, 99, 2).scroll).toBe(1);
    expect(viewport(lines, 99, 2).visible).toEqual(["b", "c"]);
  });
  test("doc shorter than viewport: maxScroll 0, no slice beyond end", () => {
    const v = viewport(["only"], 0, 10);
    expect(v.visible).toEqual(["only"]);
    expect(v.maxScroll).toBe(0);
  });
  test("empty doc: visible empty, maxScroll 0", () => {
    expect(viewport([], 0, 5).visible).toEqual([]);
  });
});

describe("tui — footerLine", () => {
  const styler = makeStyler(DEFAULT_PALETTE, "truecolor");
  const muted = (s: string) => styler.role("muted", s);

  test("label right-aligned, hints left, plain gap between", () => {
    const f = footerLine(60, "Gloam", muted);
    // Hints come first (muted-coloured), then spaces, then Gloam.
    expect(f).toContain(HINTS);
    expect(f.endsWith("Gloam\x1b[0m")).toBe(true);
  });
  test("narrow width: at least one space gap, no throw", () => {
    const f = footerLine(10, "Gloam", muted);
    expect(f).toContain("Gloam");
  });
  test("NO_COLOR: plain text, no escapes", () => {
    const none = makeStyler(DEFAULT_PALETTE, "none");
    const f = footerLine(60, "Gloam", (s) => none.role("muted", s));
    expect(f).not.toContain("\x1b");
    expect(f.endsWith("Gloam")).toBe(true);
  });
});
