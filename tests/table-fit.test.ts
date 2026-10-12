import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { renderDocument } from "../src/render";
import { displayWidth, stripANSI } from "../src/width";

/** Table unit vectors. The ladder is retired (ADR-TABLE-EDGE-CUT-055), so the
 *  old branches are the below-cap edge cut and the cap; BRF-WRAP-AT-CAP adds the
 *  third branch. The corpus instrument (`scripts/tables-check.ts`) is the
 *  integration test — these are the branches it cannot isolate. */

const visible = (out: string) =>
  stripANSI(out).split("\n").filter((l) => l.trim().length > 0);

/** A wrappable over-cap table: naturals [51, 62, 55, 45] = 222 against the
 *  cap of 116, every column with somewhere to break (the surfaced table in
 *  docs/2026-08-30-naming-like-nasa.md, *Lessons, attributed*). */
const SURFACED =
  "| Lesson | Evidence | Source | okuda mapping |\n" +
  "|---|---|---|---|\n" +
  "| Two codes, one referent | MJS77 / Voyager; AS-506 / Apollo; COSPAR IDs | Kohlhase interview (2002); Butrica (1998) | BRF-SILO-MNEMONICS \"two codes\"; ADR-024 |\n" +
  "| Machine code unique by construction, ugly by design | COSPAR 1977-084A; VGR 77-1 | Butrica (1998); Wikipedia (Voyager program) | filenames + frontmatter |\n";

/** Below-cap goldens, captured before BRF-WRAP-AT-CAP — the fit path and the
 *  narrow-glass cut must be byte-identical, asserted not assumed. */
const GOLDEN_A30 =
  "\n  \u001b[1mElement\u001b[0m  │ \u001b[1mChannel\u001b[0m    │ \u001b[1mR\u001b[0m…\n  ──────────────────────────\n\n  \u001b[1mheading\u001b[0m    structural   p…\n\n  \u001b[1memphasis\u001b[0m   emphasis     y…\n\n  ──────────────────────────\n\n  █ ────────────────────── █\n";
const GOLDEN_B120 =
  "\n  \u001b[1ma\u001b[0m       │ \u001b[1mb\u001b[0m\n  ────────────────────\n\n  \u001b[1mone two\u001b[0m   three four\n\n  ────────────────────\n\n  █ ──────────────────────────────────────────────────────────────────────────────────────────────────────────────── █\n";
const BELOW_A =
  "| Element | Channel | Role |\n|---|---|---|\n" +
  "| heading | structural | purple bold |\n| emphasis | emphasis | yellow italic |\n";
const BELOW_B = "| a | b |\n|---|---|\n| one two | three four |\n";

const PILOT =
  "| Element | Channel | Role | Hex | Notes |\n" +
  "|---|---|---|---|---|\n" +
  "| heading | structural | purple bold | #bd93f9 | the top-level heading in the document, always purple |\n" +
  "| emphasis | emphasis | yellow italic | #f1fa8c | italic |\n";

describe("the table at the cap (BRF-WRAP-AT-CAP)", () => {
  test("below the cap is byte-identical — the fit path is untouched", async () => {
    // A table that fits whole at 120, and one cut at a narrow glass: both are
    // the pre-wrap bytes, so the branch did not disturb the two old ones.
    expect(await renderDocument(BELOW_B, { width: 120, color: "none" })).toBe(GOLDEN_B120);
    expect(await renderDocument(BELOW_A, { width: 30, color: "none" })).toBe(GOLDEN_A30);
  });

  test("above the cap every word fits — the columns wrap; nothing is hidden", async () => {
    const lines = visible(await renderDocument(SURFACED, { width: 120, color: "none" }));
    // No `…` anywhere: the cut marker only appears where a word cannot fit.
    expect(lines.every((l) => !l.includes("…"))).toBe(true);
    // Evidence and Source are readable, whole, across their wrapped lines.
    for (const word of ["Lesson", "Evidence", "Source", "okuda", "mapping",
      "referent", "Voyager", "COSPAR", "Kohlhase", "Butrica", "MNEMONICS",
      "construction", "frontmatter"]) {
      expect(lines.some((l) => l.includes(word))).toBe(true);
    }
    // Two source rows became blocks: the body is more than one line per row.
    expect(lines.length).toBeGreaterThan(6);
  });

  test("a wrapped cell breaks at spaces — no word is broken", async () => {
    const lines = visible(await renderDocument(SURFACED, { width: 120, color: "none" }));
    // Each multi-character word survives intact on one line; a hard split would
    // leave two fragments and neither line carrying the whole word.
    const words = ["construction", "Voyager", "Kohlhase", "Wikipedia",
      "filenames", "frontmatter", "referent"];
    for (const w of words) expect(lines.some((l) => l.includes(w))).toBe(true);
  });

  test("a word that cannot fit its share stays irreducible — the cut stands", async () => {
    const token = "unbreakabletoken".repeat(8); // 128 columns, no space
    const src = `| id | caveat |\n|---|---|\n| 01 | ${token} |\n`;
    const lines = visible(await renderDocument(src, { width: 120, color: "none" }));
    // The document is named by the instrument; the render fails honestly.
    expect(lines.some((l) => l.includes("…"))).toBe(true);
    expect(lines.some((l) => l.includes(token))).toBe(false);
    for (const l of lines) expect(displayWidth(l)).toBeLessThanOrEqual(120);
  });

  test("height is stable: two renders at one width are identical", async () => {
    const a = await renderDocument(SURFACED, { width: 120, color: "none" });
    const b = await renderDocument(SURFACED, { width: 120, color: "none" });
    expect(a).toBe(b);
  });
});

describe("the table at the glass (BRF-TABLE-GLASS-FIT)", () => {
  test("every column wraps at the glass — the prose column is not elided", async () => {
    const lines = visible(await renderDocument(PILOT, { width: 80, color: "none" }));
    // Every cell survives whole, the prose column included: the floor test runs
    // at the glass, and the slack is spent on wrapped lines, not a cut.
    for (const key of ["Element", "heading", "structural", "purple", "#bd93f9",
      "yellow", "italic", "document"]) {
      expect(lines.some((l) => l.includes(key))).toBe(true);
    }
    expect(lines.every((l) => !l.includes("…"))).toBe(true);
  });

  test("the contact map keeps its prose column at 80 (the fixture)", async () => {
    const src = readFileSync("tests/fixtures/contracts-contact-map.md", "utf8");
    const lines = visible(await renderDocument(src, { width: 80, color: "none" }));
    // The Notes column is present and read, not elided.
    expect(lines.some((l) => l.includes("Notes"))).toBe(true);
    expect(lines.some((l) => l.includes("Consultancy"))).toBe(true);
    expect(lines.some((l) => l.includes("architecture"))).toBe(true);
    expect(lines.every((l) => !l.includes("…"))).toBe(true);
  });

  test("elision is monotone in the glass — more width never reveals less", async () => {
    const src = readFileSync("tests/fixtures/contracts-contact-map.md", "utf8");
    const elided = async (w: number) =>
      stripANSI(await renderDocument(src, { width: w, color: "none" }))
        .split("\n")
        .filter((l) => l.includes("…")).length;
    let prev = Infinity;
    for (let w = 40; w <= 200; w += 2) {
      const n = await elided(w);
      expect(n).toBeLessThanOrEqual(prev);
      prev = n;
    }
    // zero at and above the natural width — the whole document visible
    for (const w of [120, 160, 200]) expect(await elided(w)).toBe(0);
  });

  test("a URL wraps at its delimiters — never elided at 80, never cut mid-segment", async () => {
    const src = "| Name | Blog URL |\n|---|---|\n| Colin | blog.scottlogic.com/ceberhardt |\n";
    const lines = visible(await renderDocument(src, { width: 80, color: "none" }));
    expect(lines.every((l) => !l.includes("…"))).toBe(true);
    expect(lines.some((l) => l.includes("blog.scottlogic.com/ceberhardt"))).toBe(true);
  });

  test("the floor buys the leading word whole, not a word-boundary cut", async () => {
    const src =
      "| a | b | c |\n|---|---|---|\n" +
      "| x | yy | alongwordhere plus more text that will not fit |\n";
    const out = stripANSI(await renderDocument(src, { width: 30, color: "none" }));
    // `alongwordhere` is the column's longest word, so the slot is at least that
    // wide and the cut happens after it rather than inside it.
    expect(out).toContain("alongwordhere");
  });

  test("irreducible: floors that cannot fit fall back rather than crash", async () => {
    const src =
      "| a | b |\n|---|---|\n" +
      "| averyverylongunbreakableword | anotherlongunbreakableword |\n";
    const lines = visible(await renderDocument(src, { width: 24, color: "none" }));
    // The document is at fault and the table still renders, eliding, within the
    // glass — the fallback's job is to fail honestly, not to fit.
    expect(lines.length).toBeGreaterThan(0);
    for (const l of lines) expect(displayWidth(l)).toBeLessThanOrEqual(24);
  });

  test("headers wrap and never elide", async () => {
    const src =
      "| lines over 80 by the reference ruler | Superseded by |\n|---|---|\n" +
      "| 1024 | 1 |\n";
    const lines = visible(await renderDocument(src, { width: 80, color: "none" }));
    // no elision anywhere: the label wraps rather than losing its tail
    expect(lines.every((l) => !l.includes("…"))).toBe(true);
    // and it is still there, whole, across its lines
    for (const word of ["lines", "reference", "ruler", "Superseded"]) {
      expect(lines.some((l) => l.includes(word))).toBe(true);
    }
  });

  test("a label does not hold a column open for its own length", async () => {
    const src = "| lines over 80 by the reference ruler | x |\n|---|---|\n| 1 | 2 |\n";
    const lines = visible(await renderDocument(src, { width: 120, color: "none" }))
      .filter((l) => !l.trimEnd().endsWith("█"));
    const widest = Math.max(...lines.map(displayWidth));
    // The label is 35 columns; the column is floored at its longest word (9)
    // plus the 3-column gutter and the 2-column document margin.
    expect(widest).toBeLessThan(20);
  });

  test("the band cap: never wider than 120 columns, whatever the glass", async () => {
    const wide =
      "| a | b | c | d | e | f |\n|---|---|---|---|---|---|\n" +
      "| " + Array.from({ length: 6 }, () => "x".repeat(30)).join(" | ") + " |\n";
    for (const glass of [120, 200, 400]) {
      const lines = visible(await renderDocument(wide, { width: glass, color: "none" }))
        // the document's status rail spans the glass by design; it is not the table
        .filter((l) => !l.trimEnd().endsWith("█"));
      const widest = Math.max(...lines.map(displayWidth));
      // 2-char left margin + the table's own 116 content columns
      expect(widest).toBeLessThanOrEqual(120);
    }
  });
});
