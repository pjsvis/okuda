import { beforeEach, afterEach, describe, expect, test } from "bun:test";
import {
  displayWidth,
  elideToWidth,
  expandTabs,
  graphemeWidth,
  padCenterDisplay,
  padDisplay,
  padStartDisplay,
  stripANSI,
  terminalCols,
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

describe("elideToWidth — the elision primitive (ADR-014 doctrine, td-b81597)", () => {
  test("fits: returns unchanged", () => {
    expect(elideToWidth("abc", 5)).toBe("abc");
    expect(elideToWidth("abc", 3)).toBe("abc");
  });

  test("overflows: last column becomes …, never exceeds budget", () => {
    const out = elideToWidth("abcdef", 4);
    expect(out).toBe("abc…");
    expect(displayWidth(out)).toBe(4);
  });

  test("budget 1: marker only", () => {
    expect(elideToWidth("abcdef", 1)).toBe("…");
  });

  test("ANSI-aware: escapes preserved, SGR closed before the marker", () => {
    const out = elideToWidth("\x1b[31mabcdef\x1b[0m", 4);
    expect(stripANSI(out)).toBe("abc…");
    // the cut closes the open SGR — no colour leaks past the elision
    expect(out).toContain("\x1b[31mabc\x1b[0m…");
    expect(displayWidth(out)).toBe(4);
  });

  test("grapheme-aware: a wide cluster is never split — a straddling CJK char drops whole", () => {
    // 世界 = 4 cols; budget 4 → both fit, marker replaces col 5… world is
    // exactly 4 wide so it fits: use a longer line. 世 (2) + 界 (2) + x:
    // elide to 3 → 世 fits (2), 界 would straddle (2+2>3) → dropped whole.
    const out = elideToWidth("世界x", 3);
    expect(out).toBe("世…");
    expect(displayWidth(out)).toBe(3);
  });

  test("grapheme-aware: emoji with VS16 counts 2, not split", () => {
    const e = "\u2713\ufe0f"; // ✓️ — VS16 forces width 2
    const out = elideToWidth(e + "abcdef", 4);
    expect(stripANSI(out)).toBe(e + "a…");
    expect(displayWidth(out)).toBe(4);
  });

  test("NO_COLOR parity: the marker is content, not styling", () => {
    // the marker carries no escapes of its own — under NO_COLOR the
    // elided line still ends …
    const out = elideToWidth("abcdef", 4);
    expect(out.endsWith("…")).toBe(true);
    expect(out).not.toMatch(/\x1b/);
  });
});

describe("terminalCols — fzf preview width (FZF_PREVIEW_COLUMNS)", () => {
  const ENV_KEY = "FZF_PREVIEW_COLUMNS";

  // The fallback tests assume the non-TTY (fzf-preview) condition:
  // terminalSize() returns null, so the fallback is the only path.
  // That holds under CI/piped stdout but NOT when `just ship` runs in a
  // real terminal — there stdout.isTTY is true and the ambient width
  // leaks through, making terminalCols(80) return the real cols, not 80.
  // Force non-TTY so the fallback path is isolated from the host terminal.
  let savedIsTTY: boolean | undefined;
  let savedColumns: number | undefined;
  let savedRows: number | undefined;
  beforeEach(() => {
    savedIsTTY = (process.stdout as any).isTTY;
    savedColumns = (process.stdout as any).columns;
    savedRows = (process.stdout as any).rows;
    Object.defineProperty(process.stdout, "isTTY", { value: false, configurable: true });
    Object.defineProperty(process.stdout, "columns", { value: 0, configurable: true });
    Object.defineProperty(process.stdout, "rows", { value: 0, configurable: true });
  });
  afterEach(() => {
    Object.defineProperty(process.stdout, "isTTY", { value: savedIsTTY, configurable: true });
    Object.defineProperty(process.stdout, "columns", { value: savedColumns, configurable: true });
    Object.defineProperty(process.stdout, "rows", { value: savedRows, configurable: true });
  });

  test("preview env overrides the fallback when stdout is a pipe", () => {
    process.env[ENV_KEY] = "42";
    try {
      // stdout forced non-TTY (above), so terminalSize() is null — exactly
      // the fzf-preview condition. The env value must win.
      expect(terminalCols(80)).toBe(42);
    } finally {
      delete process.env[ENV_KEY];
    }
  });

  test("garbage and non-positive values fall through to the fallback", () => {
    for (const bad of ["", "0", "-3", "not-a-number"]) {
      process.env[ENV_KEY] = bad;
      try {
        expect(terminalCols(97)).toBe(97);
      } finally {
        delete process.env[ENV_KEY];
      }
    }
  });

  test("unset env: fallback path unchanged", () => {
    delete process.env[ENV_KEY];
    expect(terminalCols(80)).toBe(80);
  });
});
