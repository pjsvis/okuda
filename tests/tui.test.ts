import { describe, expect, test } from "bun:test";
import {
  decodeKey,
  footerLine,
  viewport,
  HINTS,
  displayPath,
  stripForAnchor,
  anchorFor,
  findAnchor,
  proportionalScroll,
  reanchoredScroll,
} from "../src/tui";
import { makeStyler } from "../src/ansi";
import { DRACULA_PALETTE } from "../src/palette";

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
  test("help: ? toggles verbose hints", () => {
    expect(decodeKey(buf(0x3f))).toBe("help");
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

describe("tui — footerLine (identity left, affordance right)", () => {
  const styler = makeStyler(DRACULA_PALETTE, "truecolor");
  const muted = (s: string) => styler.role("muted", s);
  const badge = (s: string) => styler.badge(s);
  const FILE = "/Users/x/Dev/okuda/docs/audit.md";

  test("compact: badge + folder/file left; ? help right", () => {
    const f = footerLine(72, "Gloam", FILE, false, muted, badge);
    expect(f.startsWith(badge("Gloam") + " " + muted("docs/audit.md"))).toBe(true);
    expect(f.endsWith(muted("? help"))).toBe(true);
  });
  test("toggled: verbose HINTS replace the compact right", () => {
    const f = footerLine(72, "Gloam", FILE, true, muted, badge);
    expect(f.startsWith(badge("Gloam") + " " + muted("docs/audit.md"))).toBe(true);
    expect(f.endsWith(muted(HINTS))).toBe(true);
  });
  test("narrow width: at least one space gap, no throw", () => {
    const f = footerLine(10, "Gloam", FILE, false, muted, badge);
    expect(f).toContain("Gloam");
  });
  test("NO_COLOR: plain text, no escapes; padding kept (shape parity)", () => {
    const none = makeStyler(DRACULA_PALETTE, "none");
    const f = footerLine(72, "Gloam", FILE, false,
      (s) => none.role("muted", s), (s) => none.badge(s));
    expect(f).not.toContain("\x1b");
    expect(f.startsWith(" Gloam  docs/audit.md")).toBe(true);
    expect(f.endsWith("? help")).toBe(true);
  });
});

describe("tui — displayPath", () => {
  test("full path → folder/basename", () => {
    expect(displayPath("/Users/x/Dev/okuda/docs/audit.md")).toBe("docs/audit.md");
    expect(displayPath("docs/audit.md")).toBe("docs/audit.md");
  });
  test("bare filename → itself", () => {
    expect(displayPath("audit.md")).toBe("audit.md");
  });
});

describe("tui — stripForAnchor (ANSI + 2-char margin removed)", () => {
  test("strips SGR codes then the leading 2-char margin", () => {
    // finalize emits: "  " + coloured content.
    const line = "  \x1b[1m# Heading\x1b[0m";
    expect(stripForAnchor(line)).toBe("# Heading");
  });
  test("blank line (no margin) → empty", () => {
    expect(stripForAnchor("")).toBe("");
  });
  test("content with its own indent keeps it after margin strip", () => {
    // margin 2 + code indent 4 → after strip: 4-space indent preserved.
    expect(stripForAnchor("      code")).toBe("    code");
  });
  test("NO_COLOR line: margin stripped, no escapes to remove", () => {
    expect(stripForAnchor("  # Plain heading")).toBe("# Plain heading");
  });
});

describe("tui — anchorFor (non-blank line nearest the viewport middle)", () => {
  test("returns stripped text + screen-row offset of the mid line", () => {
    // height 4: middle row is index 2 (scroll+2). Anchor lands there.
    const lines = ["", "  \x1b[1m# Title\x1b[0m", "  body", "  tail"];
    expect(anchorFor(lines, 0, 4)).toEqual({ text: "body", offset: 2 });
  });
  test("mid blank → nearest non-blank (search outward)", () => {
    // height 6: mid row 3 is blank; nearest non-blank is row 2.
    const lines = ["", "", "  x", "", "  y", ""];
    expect(anchorFor(lines, 0, 6)).toEqual({ text: "x", offset: 2 });
  });
  test("all-blank viewport → null", () => {
    expect(anchorFor(["", "", ""], 0, 3)).toBeNull();
  });
  test("empty doc → null", () => {
    expect(anchorFor([], 0, 5)).toBeNull();
  });
});

describe("tui — findAnchor (bounded reflow-stable index lookup)", () => {
  test("finds the anchor near the hint within radius", () => {
    const lines = ["  alpha", "  beta", "  gamma"];
    expect(findAnchor(lines, "gamma", 2, 3)).toBe(2);
  });
  test("biased search returns the nearest of duplicates", () => {
    // Two "  dup" lines; hint near the second should pick index 3.
    const lines = ["  dup", "  x", "  dup", "  dup"];
    expect(findAnchor(lines, "dup", 3, 4)).toBe(3);
    // hint near the first picks index 0.
    expect(findAnchor(lines, "dup", 0, 4)).toBe(0);
  });
  test("anchor shifted by reflow: found at the new index", () => {
    // Old scroll was 5; after reflow the anchor landed at index 3.
    const lines = ["  a", "  b", "  c", "  TARGET", "  e"];
    expect(findAnchor(lines, "TARGET", 5, 5)).toBe(3);
  });
  test("not found within radius → returns -1 (never grabs distant dup)", () => {
    const lines = ["  a", "  b"];
    expect(findAnchor(lines, "missing", 1, 2)).toBe(-1);
  });
  test("distant duplicate beyond radius → returns -1 (the top-jump bug fix)", () => {
    // Anchor at index 0, hint at 50, radius 2: the match is too far.
    const lines = ["  dup", "", "", "", "", "", "", "", "", "", "  dup"];
    expect(findAnchor(lines, "dup", 50, 2)).toBe(-1);
  });
});

describe("tui — proportionalScroll (the robust floor)", () => {
  test("preserves the reading fraction across reflow", () => {
    // Halfway through a 100-line doc → halfway through a 200-line doc.
    expect(proportionalScroll(50, 100, 200)).toBe(100);
  });
  test("oldMax 0 (doc shorter than viewport) → 0", () => {
    expect(proportionalScroll(0, 0, 50)).toBe(0);
  });
  test("top of doc stays top", () => {
    expect(proportionalScroll(0, 100, 200)).toBe(0);
  });
  test("bottom of doc stays bottom", () => {
    expect(proportionalScroll(100, 100, 200)).toBe(200);
  });
});

describe("tui — reanchoredScroll (the one repaint path: reload / resize / watch)", () => {
  // height 6: mid row is scroll+3. 20 content lines, scrolled to 10:
  // viewport rows 10..15, anchor = lines[13] ("  line-13"), offset 3.
  const doc = Array.from({ length: 20 }, (_, i) => `  line-${i}`);

  test("reload on unchanged content keeps the scroll (regression: was reset to 0)", () => {
    expect(reanchoredScroll(doc, doc, 10, 6)).toBe(10);
  });

  test("content inserted above the viewport advances the scroll with it", () => {
    // Three lines prepended: the anchor text moves from 13 to 16.
    const grown = Array.from({ length: 3 }, (_, i) => `  new-${i}`).concat(doc);
    expect(reanchoredScroll(doc, grown, 10, 6)).toBe(13);
  });

  test("content removed above the viewport pulls the scroll back", () => {
    const shrunk = doc.slice(3); // anchor "line-13" now at index 10
    expect(reanchoredScroll(doc, shrunk, 10, 6)).toBe(7);
  });

  test("anchor gone (big edit) → proportional fallback, never top", () => {
    const rewritten = Array.from({ length: 40 }, (_, i) => `  x-${i}`);
    const s = reanchoredScroll(doc, rewritten, 10, 6);
    expect(s).toBeGreaterThan(0); // not the old top-jump
    expect(s).toBe(Math.round((10 / 14) * 34)); // old fraction of new max
  });

  test("scroll clamps to the new max when the doc shrinks hard", () => {
    const tiny = ["  only", "  lines"];
    expect(reanchoredScroll(doc, tiny, 10, 6)).toBe(0); // maxScroll 0
  });
});
