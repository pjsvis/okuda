import { describe, expect, test } from "bun:test";
import {
  decodeKey,
  digitOf,
  extractJumps,
  resolveJumpTarget,
  advanceNumBuffer,
  footerLine,
  pendingMark,
  viewport,
  heldViewport,
  contentHeight,
  geometryOf,
  needsRepaint,
  hintsLine,
  displayPath,
  stripForAnchor,
  SYNC_BEGIN,
  SYNC_END,
  syncWrap,
  anchorFor,
  findAnchor,
  proportionalScroll,
  reanchoredScroll,
  frameAcrossRender,
  gateFetch,
  renderEqual,
  type Fetch,
  type FetchState,
  frameStale,
  frameTrace,
  CHROME_JITTER,
} from "../src/tui";
import { makeStyler } from "../src/ansi";
import { MIN_RENDER_WIDTH } from "../src/render";
import { DRACULA_PALETTE } from "../src/palette";
import { displayWidth, stripANSI } from "../src/width";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";

function buf(...bytes: number[]): Uint8Array {
  return new Uint8Array(bytes);
}

describe("tui — synchronized output bracket (BRF-SYNC-OUTPUT)", () => {
  test("the bracket is the DECSET 2026 set/reset pair", () => {
    // The mode is the contract; changing it is a protocol change, not a
    // tweak. 2026 = synchronized output; terminals without it ignore
    // unrecognised private modes, so the pair is safe to emit anywhere.
    expect(SYNC_BEGIN).toBe("\x1b[?2026h");
    expect(SYNC_END).toBe("\x1b[?2026l");
  });

  test("syncWrap: opener first, closer last, frame untouched between", () => {
    const frame = "\x1b[2J\x1b[Hbody\x1b[24;1Hfooter";
    const wrapped = syncWrap(frame);
    expect(wrapped.startsWith(SYNC_BEGIN)).toBe(true);
    expect(wrapped.endsWith(SYNC_END)).toBe(true);
    // the frame is byte-identical between the brackets — the bracket is
    // additive, no content byte changes (BRF-SYNC-OUTPUT acceptance)
    expect(wrapped.slice(SYNC_BEGIN.length, -SYNC_END.length)).toBe(frame);
  });

  test("syncWrap adds exactly one opener and one closer, injects nothing", () => {
    // A frame containing its own 2026 sequences would be a caller
    // contract violation (the renderer never emits them); syncWrap
    // cannot un-emit what the caller put in. What it does guarantee:
    // one opener at the front, one closer at the end, nothing else.
    const frame = "x\x1b[2J\x1b[Hy";
    const wrapped = syncWrap(frame);
    expect(wrapped.split(SYNC_BEGIN).length - 1).toBe(1);
    expect(wrapped.split(SYNC_END).length - 1).toBe(1);
  });
});

describe("tui — decodeKey (single-byte controls)", () => {
  test("quit: q, Q, Ctrl-C (0x03) — Ctrl-Z is unbound, lone Esc is the cancel", () => {
    expect(decodeKey(buf(0x71))).toBe("quit"); // q
    expect(decodeKey(buf(0x51))).toBe("quit"); // Q (Glow's convention)
    expect(decodeKey(buf(0x03))).toBe("quit"); // Ctrl-C
    // Ctrl-Z unbound (the flense): raw mode turned it into a surprise
    // exit — the OFF verb is 00. Lone Esc is the partial-vector cancel,
    // handled in applyKey before decodeKey.
    expect(decodeKey(buf(0x1a))).toBeNull();
    expect(decodeKey(buf(0x1b))).toBeNull();
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
  test("the VI stride: } para-down, { para-up (BRF-OKUDAGRAM-STEP)", () => {
    expect(decodeKey(buf(0x7d))).toBe("para-down"); // }
    expect(decodeKey(buf(0x7b))).toBe("para-up");   // {
  });
  test("brackets are a run, not a spelling — the run buffer owns them (BRF-SEAM-AUDIT)", () => {
    // decodeKey never sees ]] / [[ now: they are two keypresses, paired
    // across reads by advanceRunBuffer (tui.ts). Single brackets unbound.
    expect(decodeKey(buf(0x5d, 0x5d))).toBeNull(); // ]]
    expect(decodeKey(buf(0x5b, 0x5b))).toBeNull(); // [[
    expect(decodeKey(buf(0x5d))).toBeNull();       // lone ]
    expect(decodeKey(buf(0x5b))).toBeNull();       // lone [
  });
  test("unknown byte → null", () => {
    expect(decodeKey(buf(0x7a))).toBeNull(); // 'z' — unbound
  });
});

describe("tui — decodeKey (escape sequences)", () => {
  // ESC [ A = ↑, ESC [ B = ↓, ESC [ 5 ~ = PgUp, ESC [ 6 ~ = PgDn
  test("arrows → line-up/line-down (slippy — their own actions, BRF-OKUDAGRAM-STEP)", () => {
    expect(decodeKey(buf(0x1b, 0x5b, 0x41))).toBe("line-up");
    expect(decodeKey(buf(0x1b, 0x5b, 0x42))).toBe("line-down");
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
  test("SS3 arrows (DECCKM on) → line-up/line-down", () => {
    expect(decodeKey(buf(0x1b, 0x4f, 0x41))).toBe("line-up");
    expect(decodeKey(buf(0x1b, 0x4f, 0x42))).toBe("line-down");
  });
  test("SS3 page keys → page-up/page-down; malformed → null", () => {
    expect(decodeKey(buf(0x1b, 0x4f, 0x35, 0x7e))).toBe("page-up");
    expect(decodeKey(buf(0x1b, 0x4f, 0x36, 0x7e))).toBe("page-down");
    expect(decodeKey(buf(0x1b, 0x4f, 0x35))).toBeNull(); // ESC O 5 (no tilde)
    expect(decodeKey(buf(0x1b, 0x4f, 0x43))).toBeNull(); // ESC O C — right, unbound
  });
});

describe("tui — the held viewport (a document withheld for width)", () => {
  // Below the renderer's floor there is one receipt line and then nothing, while
  // the chrome survives — so the pane reads as a document that has GONE rather
  // than one that is HELD. The space to fill is the viewport, not the document.
  const receipt = ["  \u22ee needs 20 cols \u00b7 13 here"];

  test("fills to the viewport height, so the frame is exactly as tall as the pane", () => {
    const height = 22;
    const shown = heldViewport(receipt, height, 13);
    expect(shown.length).toBe(height);
    expect(shown[0]).toBe(receipt[0]); // the receipt is untouched
  });

  test("one mark per row, every row — not one every ten", () => {
    // Every row of the withheld document is elided by definition, so every row
    // earns a mark. A sparse sprinkle would assert the unmarked rows are empty,
    // which is the one thing certainly false. (Inverse of the diagram stripe:
    // there the rows were blank in view and the marks had no referent.)
    const shown = heldViewport(receipt, 12, 13);
    expect(shown.slice(1).every((l) => l.trim() === "\u2026")).toBe(true);
  });

  test("the column runs to the last row — the pane's edge is not the document's edge", () => {
    const shown = heldViewport(receipt, 20, 13);
    expect(shown[shown.length - 1]!.trim()).toBe("\u2026");
  });

  test("every mark fits the pane, down to one column", () => {
    for (const cols of [1, 2, 3, 5, 13, 19]) {
      const shown = heldViewport(receipt, 10, cols);
      for (const l of shown.slice(1)) {
        // Columns are bytes here — the mark is one grapheme, the indent spaces.
        expect(l.length, `cols=${cols}: ${JSON.stringify(l)}`).toBeLessThanOrEqual(cols);
      }
    }
  });

  test("a full viewport is returned untouched, so the helper cannot shorten a document", () => {
    const full = Array.from({ length: 8 }, (_, i) => `line ${i}`);
    expect(heldViewport(full, 8, 13)).toEqual(full);
    expect(heldViewport(full, 4, 13)).toEqual(full); // never trims
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
  test("rooted: silo badge leads the identity run, muted (provenance)", () => {
    const f = footerLine(72, "Gloam", FILE, muted, badge, "okuda");
    expect(f.startsWith(badge("Gloam") + " " + muted("okuda") + " \u00b7 " + muted("docs/audit.md"))).toBe(true);
  });
  test("callsign slot: identity run reads silo · callsign · filename (ADR-020)", () => {
    const f = footerLine(96, "Gloam", FILE, muted, badge, "okuda", "BRF-INDEX-JUMP");
    expect(f.startsWith(
      badge("Gloam") + " " + muted("okuda") + " \u00b7 " + muted("BRF-INDEX-JUMP") + " \u00b7 " + muted("docs/audit.md"),
    )).toBe(true);
    expect(displayWidth(stripANSI(f))).toBe(96); // width parity, corner pad kept
  });
  test("callsign without silo: the run composes what it is given", () => {
    const f = footerLine(96, "Gloam", FILE, muted, badge, undefined, "ADR-BOUND-010");
    expect(f.startsWith(badge("Gloam") + " " + muted("ADR-BOUND-010") + " \u00b7 " + muted("docs/audit.md"))).toBe(true);
  });
  test("rooted NO_COLOR: silo run is plain text, no escapes added", () => {
    const none = makeStyler(DRACULA_PALETTE, "none");
    const f = footerLine(72, "Gloam", FILE,
      (s) => none.role("muted", s), (s) => none.badge(s), "okuda");
    expect(f.startsWith(" Gloam  okuda \u00b7 docs/audit.md")).toBe(true);
  });
  test("rooted: RHS corner pad still fills the row exactly", () => {
    const f = footerLine(72, "Gloam", FILE, muted, badge, "okuda");
    expect(displayWidth(stripANSI(f))).toBe(72);
    expect(stripANSI(f).endsWith(" ")).toBe(true);
  });
  test("the pending tap is visible, muted, and left of the affordance", () => {
    // BRF-PROLONGED-PRESS: with no expiry, a held tap waits forever, so it must
    // be VISIBLE or the reader fires an actuation they cannot explain. Muted,
    // because it is state and the rose+bold channel is reserved for what is
    // actuable (BRF-READING-FRACTION ruling 2).
    const f = footerLine(72, "Gloam", FILE, muted, badge, "okuda", "DOC-X", pendingMark("9"));
    // The mark and the affordance share ONE muted run — both are state on the
    // perimeter, so the reader distinguishes them by PRESENCE, not by role.
    expect(stripANSI(f)).toContain("[9]  ? help");
    expect(f).toContain(muted("[9]  ? help"));
    expect(stripANSI(f).indexOf("[9]")).toBeLessThan(stripANSI(f).indexOf("? help"));
    expect(f.endsWith(" ")).toBe(true); // the corner pad still owns the last column
    expect(displayWidth(stripANSI(f))).toBe(72); // the gap absorbs it; the row still fills
  });
  test("no tap: no mark, and no empty slot where one would be (the conditional reports)", () => {
    const without = footerLine(72, "Gloam", FILE, muted, badge, "okuda", "DOC-X");
    // Assert on the rendered mark, not on "[" — the escapes carry brackets
    // (\x1b[7m), which is how this assertion first failed.
    expect(without).not.toContain("[9]");
    expect(without).toBe(footerLine(72, "Gloam", FILE, muted, badge, "okuda", "DOC-X", undefined));
  });
  test("pendingMark: a keycap for a digit, the gesture's own spelling for a bracket", () => {
    expect(pendingMark("9")).toBe("[9]");
    expect(pendingMark("0")).toBe("[0]");
    // `[` is already an enclosure, so doubling it shows the half-gesture: the
    // reader's own spelling of "one more and it is a frame motion".
    expect(pendingMark("[")).toBe("[[");
    expect(pendingMark("]")).toBe("]]");
  });
  test("pending mark under NO_COLOR: plain text, no escapes, width still exact", () => {
    const none = makeStyler(DRACULA_PALETTE, "none");
    const f = footerLine(72, "Gloam", FILE,
      (s) => none.role("muted", s), (s) => none.badge(s), "okuda", "DOC-X", pendingMark("9"));
    expect(f).not.toContain("\x1b");
    expect(f).toContain("[9]  ? help");
    expect(displayWidth(f)).toBe(72);
  });

  test("unrooted (no silo): byte-for-byte today's footer", () => {
    const withSilo = footerLine(72, "Gloam", FILE, muted, badge, undefined);
    const without = footerLine(72, "Gloam", FILE, muted, badge);
    expect(withSilo).toBe(without);
  });
  test("contentHeight: constant — the separator + badge rows, never hints-dependent (BRF-FOOTER-SEPARATOR)", () => {
    expect(contentHeight(24)).toBe(22); // badge owns the bottom edge, separator above it
    expect(contentHeight(23)).toBe(21); // hints toggling paints one row, never reflows content
  });
  test("hintsLine: right-justified on the last row, corner column blank", () => {
    const plain = (s: string) => s;
    const h = hintsLine(80, plain);
    expect(h.endsWith(" ")).toBe(true); // corner pad
    expect(h.startsWith(" ")).toBe(true); // right-justified
    expect(h.trimStart().startsWith("00 off")).toBe(true);
    expect(displayWidth(h)).toBe(80); // fills the row exactly
  });
  test("hintsLine: too narrow → no left pad, text starts at col 1 (legible)", () => {
    const plain = (s: string) => s;
    expect(hintsLine(60, plain).startsWith("0")).toBe(true);
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

describe("tui — frameAcrossRender (the anchor survives a withheld frame)", () => {
  // The Hopper bug, 2026-10-26: narrow below MIN_RENDER_WIDTH and the renderer
  // returns one receipt instead of a document. Stored as `lines`, three things
  // broke at once — the document was lost, `maxScroll` collapsed to 0, and paint
  // wrote the clamped scroll back as 0 — so widening restored nothing and the
  // reader was back at the top.
  const doc = Array.from({ length: 200 }, (_, i) => `  line-${i}`);
  const receipt = ["", "  ▸ 20 cols · 8 here", ""];
  const height = 20;

  test("below the floor the document passes through and the receipt is held apart", () => {
    const f = frameAcrossRender(doc, 137, receipt, 8, height);
    expect(f.lines).toEqual(doc);
    expect(f.held).toEqual(receipt);
    expect(f.scroll).toBe(137); // untouched: not re-anchored, not clamped to 0
  });

  test("at or above the floor the receipt is released and the anchor re-applies", () => {
    const widened = Array.from({ length: 200 }, (_, i) => `  wider-line-${i}`);
    const f = frameAcrossRender(doc, 137, widened, 120, height);
    expect(f.held).toBeNull();
    expect(f.lines).toEqual(widened);
    // The anchor line-147 (scroll 137 + mid 10) sits at the same index, so the
    // scroll is preserved rather than reset — the property the bug destroyed.
    expect(f.scroll).toBe(137);
  });

  test("narrow, widen, narrow again — the position never drifts", () => {
    let lines = doc;
    let scroll = 90;
    let held: string[] | null = null;
    for (const cols of [8, 120, 12, 200, 6, 120]) {
      const r = frameAcrossRender(lines, scroll, cols < 20 ? receipt : doc, cols, height);
      ({ lines, held } = r);
      scroll = r.scroll;
      expect(lines).toEqual(doc); // never replaced by a receipt
      expect(cols < 20 ? held : null).toEqual(cols < 20 ? receipt : null);
      expect(scroll).toBe(90);
    }
  });

  test("the floor is the renderer's constant, not a second one", () => {
    // 19 holds, 20 does not: conditioned on MIN_RENDER_WIDTH so the receipt and
    // its handling cannot drift apart.
    expect(frameAcrossRender(doc, 50, receipt, MIN_RENDER_WIDTH - 1, height).held).toEqual(receipt);
    expect(frameAcrossRender(doc, 50, doc, MIN_RENDER_WIDTH, height).held).toBeNull();
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

// ── The glass's second input (ADR-RESIZE-GEOMETRY-046) ──────────────
// The gate is tested above and is correct. These pin the seam ABOVE it:
// the caller's use of the gate, where a height-only resize produced
// `repaint:false` and the frame was never laid out.
describe("tui — geometryOf / needsRepaint (content OR geometry)", () => {
  const sameContent: Fetch = { ok: true, text: "alpha" };

  test("geometryOf is one comparable token over both axes", () => {
    expect(geometryOf(24, 80)).toBe("24x80");
    expect(geometryOf(40, 80)).not.toBe(geometryOf(24, 80)); // height alone
    expect(geometryOf(24, 100)).not.toBe(geometryOf(24, 80)); // width alone
  });

  test("a height-only resize repaints — the gate says `same`, the glass says otherwise", () => {
    const d = gateFetch(["alpha"], sameContent, ["alpha"]);
    expect(d.repaint).toBe(false); // the gate is right about the CONTENT
    // …and the frame still needs laying out at the new height.
    expect(needsRepaint(d.repaint, geometryOf(40, 80), geometryOf(24, 80))).toBe(true);
  });

  test("unchanged content at the same geometry does NOT repaint (the gate's property holds)", () => {
    const d = gateFetch(["alpha"], sameContent, ["alpha"]);
    expect(needsRepaint(d.repaint, geometryOf(24, 80), geometryOf(24, 80))).toBe(false);
  });

  test("changed content repaints at any geometry", () => {
    expect(needsRepaint(true, geometryOf(24, 80), geometryOf(24, 80))).toBe(true);
    expect(needsRepaint(true, geometryOf(40, 80), geometryOf(24, 80))).toBe(true);
  });

  test("a width-only resize repaints", () => {
    expect(needsRepaint(false, geometryOf(24, 100), geometryOf(24, 80))).toBe(true);
  });

  test("the first paint always lands (nothing is on the glass yet)", () => {
    // paintedGeometry starts empty, so no geometry can equal it.
    expect(needsRepaint(false, geometryOf(24, 80), "")).toBe(true);
  });

  test("a failed fetch still re-lays-out when the glass changed", () => {
    // Retain the last-known-good (the gate's job) but at the new geometry —
    // otherwise a resize during an unreadable source leaves the rows blank.
    const d = gateFetch(["alpha"], { ok: false, reason: "gone" }, []);
    expect(d.state).toBe("failed");
    expect(d.repaint).toBe(false);
    expect(needsRepaint(d.repaint, geometryOf(40, 80), geometryOf(24, 80))).toBe(true);
  });
});

// ── Index-and-jump (brief 2026-08-28) ───────────────────────────────

describe("tui — decodeKey (back-nav: u and Backspace are synonyms)", () => {
  test("u → back", () => {
    expect(decodeKey(buf(0x75))).toBe("back");
  });
  test("DEL/BS → back — RHS ergonomics; no-op at main by the depth-one stack", () => {
    expect(decodeKey(buf(0x7f))).toBe("back");
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

describe("tui — extractJumps (scan source for %%okuda-rhs:NN%% + path.md)", () => {
  test("lifts the RHS number + the path from a comment in the paragraph", () => {
    const src = [
      "# Menu",
      "",
      "*Foo* %%okuda-rhs:01%% <!-- briefs/foo.md -->",
      "",
      "*Bar* %%okuda-rhs:02%% <!-- decisions/bar.md -->",
    ].join("\n");
    const j = extractJumps(src);
    expect(j.size).toBe(2);
    expect(j.get(1)).toBe("briefs/foo.md");
    expect(j.get(2)).toBe("decisions/bar.md");
  });
  test("one-digit numbers: %%okuda-rhs:5%% → token 5", () => {
    expect(extractJumps("*X* %%okuda-rhs:5%% <!-- x.md -->").get(5)).toBe("x.md");
  });
  test("zero-padded: %%okuda-rhs:05%% → token 5", () => {
    expect(extractJumps("*X* %%okuda-rhs:05%% <!-- x.md -->").get(5)).toBe("x.md");
  });
  test("duplicate tokens: last wins (compositor error surfaces)", () => {
    const j = extractJumps("*A* %%okuda-rhs:01%% <!-- a.md -->\n\n*B* %%okuda-rhs:01%% <!-- b.md -->");
    expect(j.get(1)).toBe("b.md");
    expect(j.size).toBe(1);
  });
  test("a paragraph without an RHS token is not a jump line", () => {
    expect(extractJumps("- [01] a title — no path").size).toBe(0);
    expect(extractJumps("**01** a title, no rhs token").size).toBe(0);
  });
  test("an RHS token without a .md path is not a jump line", () => {
    expect(extractJumps("*X* %%okuda-rhs:01%% a title, no path").size).toBe(0);
  });
  test("empty source → empty map", () => {
    expect(extractJumps("").size).toBe(0);
  });
});

describe("tui — advanceNumBuffer (the digit-run state machine, BRF-PROLONGED-PRESS)", () => {
  // The CONTRACT lives in tests/gesture.test.ts (three gestures, one
  // token, driven opaquely). This block asserts the MECHANISM's shapes:
  // three states — empty, held, spent (the latch) — and every edge.
  const held = (d: string) => ({ keys: d, spent: false });
  const spent = (dd: string) => ({ keys: dd, spent: true });

  test("empty + digit → held: the run's first tap, no token yet", () => {
    expect(advanceNumBuffer(null, "0")).toEqual({ buffer: held("0"), token: null });
    expect(advanceNumBuffer(null, "5")).toEqual({ buffer: held("5"), token: null });
  });
  test("held + same digit → the doubled pair resolves and the run stays held, spent — the latch", () => {
    expect(advanceNumBuffer(held("9"), "9")).toEqual({ buffer: spent("99"), token: 99 });
  });
  test("held + different digit → the mixed pair resolves (a vector) and the buffer EMPTIES — never latched", () => {
    expect(advanceNumBuffer(held("0"), "5")).toEqual({ buffer: null, token: 5 });
    expect(advanceNumBuffer(held("1"), "0")).toEqual({ buffer: null, token: 10 });
  });
  test("spent + same digit → swallowed: the run is returned untouched, nothing fires", () => {
    const latch = spent("99");
    expect(advanceNumBuffer(latch, "9")).toEqual({ buffer: latch, token: null });
  });
  test("spent + different digit → a new run begins (the gesture is over)", () => {
    expect(advanceNumBuffer(spent("99"), "1")).toEqual({ buffer: held("1"), token: null });
  });
  test("zero-pads: '0' then '5' → token 5 (not 50)", () => {
    // The compositor zero-pads; [05] is token 5. Two-digit entry '0'+'5'
    // must resolve to 5, matching extractJumps(…).get(5).
    expect(advanceNumBuffer(held("0"), "5").token).toBe(5);
  });
  test("non-digit clears any state — the abort: a stray keystroke never ambushes a half-typed token", () => {
    expect(advanceNumBuffer(held("0"), null)).toEqual({ buffer: null, token: null });
    expect(advanceNumBuffer(spent("99"), null)).toEqual({ buffer: null, token: null });
  });
  test("non-digit on empty buffer → still empty, no token", () => {
    expect(advanceNumBuffer(null, null)).toEqual({ buffer: null, token: null });
  });
  test("the resolved token round-trips through extractJumps", () => {
    // End-to-end contract: typing '0'+'5' yields token 5, and an RHS
    // paragraph lifts to token 5 → path. The two pure halves agree.
    const jumps = extractJumps("*Title* %%okuda-rhs:05%% <!-- docs/target.md -->");
    const step = advanceNumBuffer(advanceNumBuffer(null, "0").buffer, "5");
    expect(step.token).not.toBeNull();
    expect(jumps.get(step.token!)).toBe("docs/target.md");
  });
  test("typing '0'+'0' → token 0, the run held spent (matches [00] if the compositor emits it)", () => {
    expect(advanceNumBuffer(held("0"), "0")).toEqual({ buffer: spent("00"), token: 0 });
  });
});

describe("tui — resolveJumpTarget (a relative target anchors to the main document)", () => {
  // td-1c8fca: `&speak.md` rows wire `../speak-md/` targets — relative to
  // the page, not to the process. A foreign cwd must not sever the jump;
  // HTML semantics, the document is the base URL.
  const main = resolve(import.meta.dir, "..", "AGENTS.md");
  const home = process.cwd();

  test("a relative target resolves against the main document's directory", () => {
    process.chdir("/tmp"); // a foreign cwd — the anchor is the document
    try {
      // The fixture is a document that does not move when the ledger is swept.
      // It was a brief until 2026-10-27: the brief was archived, its path changed,
      // and this test failed — a fixture taken from the mutable registry is a
      // fixture that breaks on housekeeping (which is not a defect being caught).
      const got = resolveJumpTarget(main, "docs/2026-08-20-origin-doc.md", () => null);
      expect(got).not.toBeNull();
      expect(existsSync(got!)).toBe(true);
      expect(got!.endsWith("docs/2026-08-20-origin-doc.md")).toBe(true);
    } finally {
      process.chdir(home);
    }
  });

  test("the fallback carries what the anchor misses (callsigns, cwd)", () => {
    expect(resolveJumpTarget(main, "BRF-NOT-A-PATH", (t) => `fallback:${t}`)).toBe(
      "fallback:BRF-NOT-A-PATH",
    );
  });

  test("absolute targets pass through to the fallback untouched", () => {
    expect(resolveJumpTarget(main, "/tmp/whatever.md", (t) => `fallback:${t}`)).toBe(
      "fallback:/tmp/whatever.md",
    );
  });
});

describe("tui — resolveJumpTarget containment (BRF-ROOT-CONTAINMENT)", () => {
  // Existence is not permission: a root (ADR-048's silo root, handed
  // down by the launcher/cli) fences the doc-dir anchor and nulls
  // absolute targets outside it. No root: the unrooted reader's
  // semantics, unchanged.
  /** Scratch tree: outer/{silo/docs/{doc,sibling}.md, outside.md}. */
  function containTree(): { outer: string; silo: string; doc: string; cleanup: () => void } {
    const outer = mkdtempSync(join(tmpdir(), "okuda-contain-"));
    const silo = join(outer, "silo");
    mkdirSync(join(silo, "docs"), { recursive: true });
    writeFileSync(join(silo, "docs", "doc.md"), "");
    writeFileSync(join(silo, "docs", "sibling.md"), "");
    writeFileSync(join(outer, "outside.md"), "");
    return {
      outer,
      silo,
      doc: join(silo, "docs", "doc.md"),
      cleanup: () => rmSync(outer, { recursive: true, force: true }),
    };
  }
  const fb = (t: string): string | null => `fallback:${t}`;

  test("doc-dir and cross-dir targets inside the root resolve directly", () => {
    const { silo, doc, cleanup } = containTree();
    try {
      expect(resolveJumpTarget(doc, "sibling.md", fb, silo)).toBe(
        join(silo, "docs", "sibling.md"),
      );
      expect(resolveJumpTarget(doc, "../docs/sibling.md", fb, silo)).toBe(
        join(silo, "docs", "sibling.md"),
      );
    } finally {
      cleanup();
    }
  });

  test("traversal above the root falls to the fallback, not the read", () => {
    // ../../outside.md EXISTS (outer/outside.md) — but existence is
    // not permission: the anchor refuses it; the fallback decides.
    const { silo, doc, cleanup } = containTree();
    try {
      expect(resolveJumpTarget(doc, "../../outside.md", fb, silo)).toBe(
        "fallback:../../outside.md",
      );
    } finally {
      cleanup();
    }
  });

  test("absolute targets outside the root are null before the fallback", () => {
    const { outer, silo, doc, cleanup } = containTree();
    try {
      expect(resolveJumpTarget(doc, join(outer, "outside.md"), fb, silo)).toBeNull();
    } finally {
      cleanup();
    }
  });

  test("absolute targets inside the root reach the fallback's existsSync", () => {
    const { silo, doc, cleanup } = containTree();
    try {
      const real = (t: string): string | null => (existsSync(t) ? t : null);
      expect(resolveJumpTarget(doc, join(silo, "docs", "sibling.md"), real, silo)).toBe(
        join(silo, "docs", "sibling.md"),
      );
    } finally {
      cleanup();
    }
  });

  test("no root: the unrooted reader keeps today's semantics", () => {
    const { outer, doc, cleanup } = containTree();
    try {
      expect(resolveJumpTarget(doc, "../../outside.md", fb)).toBe(join(outer, "outside.md"));
    } finally {
      cleanup();
    }
  });

  test("the first frame renders at the live glass, not the exec-time fallback", async () => {
    // Regression guard for a dogfood find (2026-10-07): the initial frame was
    // rendered at `opts.width` — the non-TTY fallback, sampled once at exec —
    // while every repaint used `dims().cols`. A pane sized after launch therefore
    // opened a column wide and the TERMINAL soft-wrapped the elided code fences,
    // pushing their `…` onto the next line until a SIGWINCH re-rendered at the
    // true width. The fix is one width source; this asserts there is still one,
    // because the bug is invisible from a pipe and only a later frame shows it.
    const src = await Bun.file(new URL("../src/tui.ts", import.meta.url)).text();
    // (1) The first frame takes its width from the live glass, through the one
    //     function that re-takes it if the pane moves underneath the render.
    const first = src.slice(src.indexOf("const initialRender"), src.indexOf("gateFetch(null"));
    expect(first).toContain("renderAtGlass(");
    expect(first).not.toContain("opts.width");
    expect(src.match(/const dims = \(\) => \(\{/g)?.length ?? 0).toBe(1);
    // (2) The frame's stamp describes the RENDER, not the pane. A stamp taken
    //     from the pane claims a frame the glass does not hold, so the next event
    //     at that same width compares equal and skips the repair — which is how a
    //     stale frame becomes self-correcting and unpinnable.
    expect(src).toContain("paintedGeometry = renderCols > 0");
    expect(src).not.toContain("paintedGeometry = geometryOf(rows, cols)");
  });

  test("frameStale: a small widening is chrome, everything else is real", () => {
    const J = CHROME_JITTER;
    // The asymmetry the policy rests on: narrower is a margin, wider is a wrap.
    expect(frameStale("32x75", "32x74", J)).toBe(false); // +1: chrome — hold
    expect(frameStale("32x74", "32x74", J)).toBe(false); // unchanged
    expect(frameStale("32x74", "32x75", J)).toBe(true); // narrowing: adopt now
    expect(frameStale("32x80", "32x74", J)).toBe(true); // a real drag
    expect(frameStale("33x74", "32x74", J)).toBe(true); // height: re-lay the viewport
    expect(frameStale("32x74", "", J)).toBe(true); // nothing rendered yet
  });

  test("the frame trace writes to a file, never the tty, and never throws", async () => {
    // The instrument for the pane-boundary glitches: a width change that moves a
    // couple of words, self-corrects, and cannot be caught by eye. One read of
    // this file settles the direction of the change — and the direction decides
    // whether an honest fix exists (narrowing must be adopted; widening may lag).
    const path = join(tmpdir(), `okuda-frames-${Date.now()}.log`);
    process.env.OKUDA_FRAME_LOG = path;
    try {
      frameTrace("resize cols=80 rows=24");
      frameTrace("paint cols=80 rows=24 render=79 scroll=0");
      const text = await Bun.file(path).text();
      expect(text).toContain("resize cols=80 rows=24");
      expect(text).toContain("render=79");
      // A path that cannot be written must not break the frame it traces.
      process.env.OKUDA_FRAME_LOG = join(tmpdir(), "okuda-no-such-dir", "x.log");
      expect(() => frameTrace("paint cols=1")).not.toThrow();
    } finally {
      delete process.env.OKUDA_FRAME_LOG;
      rmSync(path, { force: true });
    }
  });
});
