import { describe, expect, test } from "bun:test";
import {
  displayWidth,
  expandTabs,
  graphemeWidth,
  padCenterDisplay,
  padDisplay,
  padStartDisplay,
  stripANSI,
} from "../src/width";

describe("width — contract: graphemes, EAW, combining, escapes, tabs", () => {
  test("ASCII counts 1 per column", () => {
    expect(displayWidth("hello")).toBe(5);
  });

  test("CJK occupies 2 columns (EAW W)", () => {
    expect(displayWidth("日本語")).toBe(6);
    expect(graphemeWidth("一")).toBe(2);
  });

  test("emoji occupy 2 columns", () => {
    expect(displayWidth("🎉")).toBe(2);
    expect(displayWidth("party 🎉 time")).toBe(13);
  });

  test("ZWJ family emoji is one 2-column grapheme", () => {
    expect(displayWidth("👨‍👩‍👦")).toBe(2);
  });

  test("combining diacritics add 0 columns", () => {
    expect(displayWidth("e\u0301")).toBe(1);
    expect(displayWidth("cafe\u0301")).toBe(4);
  });

  test("variation selector-16 forces emoji presentation width", () => {
    expect(displayWidth("▶")).toBe(1);
    expect(displayWidth("▶\uFE0F")).toBe(2);
  });

  test("ANSI escapes are zero-width", () => {
    expect(displayWidth("\x1b[1mhi\x1b[0m")).toBe(2);
    expect(displayWidth("\x1b[38;2;224;222;244mtext\x1b[0m")).toBe(4);
    expect(displayWidth("\x1b]8;;https://example.com\x1b\\link\x1b]8;;\x1b\\")).toBe(4);
  });

  test("stripANSI removes SGR and OSC 8", () => {
    expect(stripANSI("\x1b[1;38;2;1;2;3mbold\x1b[0m")).toBe("bold");
    expect(stripANSI("\x1b]8;;https://x.y\x1b\\text\x1b]8;;\x1b\\")).toBe("text");
  });

  test("tabs expand to 2 spaces", () => {
    expect(expandTabs("a\tb")).toBe("a  b");
    expect(displayWidth("a\tb")).toBe(4);
  });

  test("box-drawing and geometric glyphs are 1 column (ambiguous = 1)", () => {
    expect(graphemeWidth("─")).toBe(1);
    expect(graphemeWidth("│")).toBe(1);
    expect(graphemeWidth("▶")).toBe(1);
    expect(graphemeWidth("●")).toBe(1);
  });

  test("display padding helpers are ANSI-aware", () => {
    expect(displayWidth(padDisplay("\x1b[1mab\x1b[0m", 5))).toBe(5);
    expect(displayWidth(padStartDisplay("\x1b[1mab\x1b[0m", 5))).toBe(5);
    expect(displayWidth(padCenterDisplay("\x1b[1mab\x1b[0m", 5))).toBe(5);
    // centre leans left on odd remainder
    expect(padCenterDisplay("ab", 5)).toBe(" ab  ");
  });
});
