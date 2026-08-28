import { describe, expect, test } from "bun:test";
import {
  decodeKey,
  digitOf,
  extractJumps,
  advanceNumBuffer,
  footerLine,
  viewport,
  contentHeight,
  hintsLine,
  displayPath,
  stripForAnchor,
  anchorFor,
  findAnchor,
  proportionalScroll,
  reanchoredScroll,
  gateFetch,
  renderEqual,
  type Fetch,
  type FetchState,
} from "../src/tui";
import { makeStyler } from "../src/ansi";
import { DRACULA_PALETTE } from "../src/palette";
import { displayWidth, stripANSI } from "../src/width";

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
  test("space → page-down, b → page-up (less/man convention)", () => {
    expect(decodeKey(buf(0x20))).toBe("page-down");
    expect(decodeKey(buf(0x62))).toBe("page-up");
  });
  test("unknown escape sequence → null", () => {
    expect(decodeKey(buf(0x1b, 0x5b, 0x43))).toBeNull(); // ESC [ C — right, unbound
  });
  // ESC O A/B = ↑/↓ under DECCKM (application cursor mode) — the form the
  // shell's line editor leaves active, and what alt-scroll wheels emit.
  test("SS3 arrows (DECCKM on) → up/down", () => {
    expect(decodeKey(buf(0x1b, 0x4f, 0x41))).toBe("up");
    expect(decodeKey(buf(0x1b, 0x4f, 0x42))).toBe("down");
  });
  test("SS3 page keys → page-up/page-down; malformed → null", () => {
    expect(decodeKey(buf(0x1b, 0x4f, 0x35, 0x7e))).toBe("page-up");
    expect(decodeKey(buf(0x1b, 0x4f, 0x36, 0x7e))).toBe("page-down");
    expect(decodeKey(buf(0x1b, 0x4f, 0x35))).toBeNull(); // ESC O 5 (no tilde)
    expect(decodeKey(buf(0x1b, 0x4f, 0x43))).toBeNull(); // ESC O C — right, unbound
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
    const f = footerLine(72, "Gloam", FILE, muted, badge);
    expect(f.startsWith(badge("Gloam") + " " + muted("docs/audit.md"))).toBe(true);
    expect(f.endsWith(muted("? help") + " ")).toBe(true);
  });
  test("RHS corner pad: the last column is blank, never ink", () => {
    const f = footerLine(72, "Gloam", FILE, muted, badge);
    expect(displayWidth(stripANSI(f))).toBe(72); // exactly fills the row…
    expect(stripANSI(f).endsWith(" ")).toBe(true); // …but the last column is the pad
  });
  test("narrow width: at least one space gap, no throw", () => {
    const f = footerLine(10, "Gloam", FILE, muted, badge);
    expect(f).toContain("Gloam");
  });
  test("NO_COLOR: plain text, no escapes; padding kept (shape parity)", () => {
    const none = makeStyler(DRACULA_PALETTE, "none");
    const f = footerLine(72, "Gloam", FILE,
      (s) => none.role("muted", s), (s) => none.badge(s));
    expect(f).not.toContain("\x1b");
    expect(f.startsWith(" Gloam  docs/audit.md")).toBe(true);
    expect(f.endsWith("? help ")).toBe(true);
  });
  test("contentHeight: hints row reserved when toggled", () => {
    expect(contentHeight(24, false)).toBe(23); // footer only
    expect(contentHeight(24, true)).toBe(22);  // badge row + hints row
  });
  test("hintsLine: right-justified on the last row, corner column blank", () => {
    const plain = (s: string) => s;
    const h = hintsLine(80, plain);
    expect(h.endsWith(" ")).toBe(true); // corner pad
    expect(h.startsWith(" ")).toBe(true); // right-justified
    expect(h.trimStart().startsWith("q quit")).toBe(true);
    expect(displayWidth(h)).toBe(80); // fills the row exactly
  });
  test("hintsLine: too narrow → no left pad, text starts at col 1 (legible)", () => {
    const plain = (s: string) => s;
    expect(hintsLine(60, plain).startsWith("q")).toBe(true);
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

describe("tui — renderEqual (the content gate primitive)", () => {
  test("identical renders are equal", () => {
    expect(renderEqual(["a", "b"], ["a", "b"])).toBe(true);
  });
  test("length differs → not equal", () => {
    expect(renderEqual(["a"], ["a", "b"])).toBe(false);
  });
  test("any line differs → not equal", () => {
    expect(renderEqual(["a", "b"], ["a", "x"])).toBe(false);
  });
  test("both empty → equal (the cron-rewrite-with-identical-content case)", () => {
    expect(renderEqual([], [])).toBe(true);
  });
});

describe("tui — gateFetch (changed / same / failed, retain-on-failure)", () => {
  const ok = (text: string): Fetch => ({ ok: true, text });
  const fail = (reason = "missing"): Fetch => ({ ok: false, reason });
  const render = (text: string): string[] => text.split("\n");
  const prev = render("alpha\nbeta\ngamma");

  test("failed fetch retains the last-known-good and marks failed, no repaint", () => {
    const d = gateFetch(prev, fail("mount gone"), []);
    expect(d.state).toBe("failed");
    expect(d.lines).toBe(prev); // last-known-good retained, not blanked
    expect(d.repaint).toBe(false);
  });

  test("failed fetch with no prior (initial load) → empty lines, failed, no repaint", () => {
    const d = gateFetch(null, fail(), []);
    expect(d.state).toBe("failed");
    expect(d.lines).toEqual([]); // nothing to retain
    expect(d.repaint).toBe(false);
  });

  test("same content → same, no repaint (the mechanised ‘neither’)", () => {
    const same = render("alpha\nbeta\ngamma");
    const d = gateFetch(prev, ok("alpha\nbeta\ngamma"), same);
    expect(d.state).toBe("same");
    expect(d.repaint).toBe(false);
    expect(d.lines).toBe(prev);
  });

  test("identical-bytes rewrite (mtime moved, content didn’t) → same, no repaint", () => {
    // mtime is not meaning: a cron rewrite with identical content is a no-op.
    const d = gateFetch(prev, ok("alpha\nbeta\ngamma"), [...prev]);
    expect(d.state).toBe("same");
    expect(d.repaint).toBe(false);
  });

  test("changed content → changed, repaint, new lines", () => {
    const next = render("alpha\nBETA\ngamma");
    const d = gateFetch(prev, ok("alpha\nBETA\ngamma"), next);
    expect(d.state).toBe("changed");
    expect(d.repaint).toBe(true);
    expect(d.lines).toBe(next);
  });

  test("initial-load sentinel (prev null) + success → changed (content arrived)", () => {
    const next = render("hello");
    const d = gateFetch(null, ok("hello"), next);
    expect(d.state).toBe("changed");
    expect(d.lines).toBe(next);
    expect(d.repaint).toBe(true);
  });

  test("the three states are mutually exclusive (no overlap)", () => {
    const states: FetchState[] = [
      gateFetch(prev, fail(), []).state,
      gateFetch(prev, ok("alpha\nbeta\ngamma"), render("alpha\nbeta\ngamma")).state,
      gateFetch(prev, ok("alpha\nBETA\ngamma"), render("alpha\nBETA\ngamma")).state,
    ];
    expect(new Set(states).size).toBe(3);
  });
});

// ── Index-and-jump (brief 2026-08-28) ───────────────────────────────

describe("tui — decodeKey (back-nav: u / Backspace)", () => {
  test("u → back", () => {
    expect(decodeKey(buf(0x75))).toBe("back");
  });
  test("DEL (0x7f) → back (Backspace on most terminals)", () => {
    expect(decodeKey(buf(0x7f))).toBe("back");
  });
  test("BS (0x08) → back (Backspace on some terminals)", () => {
    expect(decodeKey(buf(0x08))).toBe("back");
  });
});

describe("tui — digitOf (single-byte digit → char, else null)", () => {
  test("digits 0–9 → their character", () => {
    expect(digitOf(buf(0x30))).toBe("0");
    expect(digitOf(buf(0x35))).toBe("5");
    expect(digitOf(buf(0x39))).toBe("9");
  });
  test("letters → null (the buffer only collects digits)", () => {
    expect(digitOf(buf(0x6a))).toBeNull(); // j
    expect(digitOf(buf(0x75))).toBeNull(); // u — not a digit, clears buffer
  });
  test("multi-byte escape sequence → null (arrows, page keys)", () => {
    expect(digitOf(buf(0x1b, 0x5b, 0x41))).toBeNull(); // ↑
    expect(digitOf(buf(0x1b, 0x5b, 0x35, 0x7e))).toBeNull(); // PgUp
  });
  test("empty buffer → null", () => {
    expect(digitOf(buf())).toBeNull();
  });
});

describe("tui — extractJumps (scan source for [NN] … path.md lines)", () => {
  test("lifts two-digit token + trailing path into a token→path map", () => {
    const src = [
      "# Index",
      "",
      "- [01] Foo — briefs/foo.md",
      "- [02] Bar — decisions/bar.md",
    ].join("\n");
    const j = extractJumps(src);
    expect(j.size).toBe(2);
    expect(j.get(1)).toBe("briefs/foo.md");
    expect(j.get(2)).toBe("decisions/bar.md");
  });
  test("zero-pads: [05] → token 5", () => {
    const j = extractJumps("- [05] X — x.md");
    expect(j.get(5)).toBe("x.md");
    expect(j.has(5)).toBe(true);
  });
  test("duplicate tokens: last wins (compositor error surfaces)", () => {
    const j = extractJumps("- [01] A — a.md\n- [01] B — b.md");
    expect(j.get(1)).toBe("b.md");
    expect(j.size).toBe(1);
  });
  test("a [NN] in prose with no trailing path is inert (not a jump line)", () => {
    expect(extractJumps("See [01] in the notes below.").size).toBe(0);
  });
  test("one-digit tokens [5] are ignored — the convention is two-digit", () => {
    expect(extractJumps("- [5] X — a.md").size).toBe(0);
  });
  test("a line without a trailing .md path is not a jump line", () => {
    expect(extractJumps("- [01] a title, no path").size).toBe(0);
  });
  test("paths with spaces: only the last space-free .md token is captured", () => {
    // `decisions/old name.md` — \S+\.md$ grabs `name.md` (the last
    // space-free run ending in .md). Compositors should emit space-free
    // paths; this documents the fallback when they don't.
    const j = extractJumps("- [01] X — decisions/old name.md");
    expect(j.get(1)).toBe("name.md");
  });
  test("token need not be in a list item — bare [NN] … path works", () => {
    expect(extractJumps("[01] X — docs/a.md").get(1)).toBe("docs/a.md");
  });
  test("empty source → empty map", () => {
    expect(extractJumps("").size).toBe(0);
  });
});

describe("tui — advanceNumBuffer (the two-digit jump state machine)", () => {
  test("first digit → buffer holds it, no token yet", () => {
    expect(advanceNumBuffer(null, "0")).toEqual({ buffer: "0", token: null });
    expect(advanceNumBuffer(null, "5")).toEqual({ buffer: "5", token: null });
  });
  test("second digit → token resolves, buffer resets to empty", () => {
    expect(advanceNumBuffer("0", "5")).toEqual({ buffer: null, token: 5 });
    expect(advanceNumBuffer("1", "0")).toEqual({ buffer: null, token: 10 });
    expect(advanceNumBuffer("9", "9")).toEqual({ buffer: null, token: 99 });
  });
  test("zero-pads: '0' then '1' → token 1 (not 10)", () => {
    // The compositor zero-pads; [05] is token 5. Two-digit entry '0'+'5'
    // must resolve to 5, matching extractJumps(…).get(5).
    expect(advanceNumBuffer("0", "5").token).toBe(5);
  });
  test("non-digit after one digit → buffer cancelled, no token", () => {
    // A stray j or u must not ambush a half-typed token.
    expect(advanceNumBuffer("0", null)).toEqual({ buffer: null, token: null });
  });
  test("non-digit on empty buffer → still empty, no token", () => {
    expect(advanceNumBuffer(null, null)).toEqual({ buffer: null, token: null });
  });
  test("the resolved token round-trips through extractJumps", () => {
    // End-to-end contract: typing '0'+'5' yields token 5, and an index
    // line `[05] … path.md` lifts to token 5 → path. The two pure halves
    // agree on the numbering convention.
    const jumps = extractJumps("- [05] Title — docs/target.md");
    const step = advanceNumBuffer(advanceNumBuffer(null, "0").buffer, "5");
    expect(step.token).not.toBeNull();
    expect(jumps.get(step.token!)).toBe("docs/target.md");
  });
  test("typing '0'+'0' → token 0 (matches [00] if the compositor emits it)", () => {
    expect(advanceNumBuffer("0", "0").token).toBe(0);
  });
});
