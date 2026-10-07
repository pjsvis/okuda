import { describe, expect, test } from "bun:test";
import { renderDocument } from "../src/render";
import { displayWidth, stripANSI } from "../src/width";

/** The ladder's unit vectors (BRF-TABLE-LADDER, increment 2). Each test aims at
 *  one branch: the band cap, the word floor, the irreducible fallback. The
 *  corpus instrument (`scripts/tables-check.ts`) is the integration test — these
 *  are the branches it cannot isolate. */

const visible = (out: string) =>
  stripANSI(out).split("\n").filter((l) => l.trim().length > 0);

const PILOT =
  "| Element | Channel | Role | Hex | Notes |\n" +
  "|---|---|---|---|---|\n" +
  "| heading | structural | purple bold | #bd93f9 | the top-level heading in the document, always purple |\n" +
  "| emphasis | emphasis | yellow italic | #f1fa8c | italic |\n";

describe("the table ladder", () => {
  test("keys render whole and the remainder goes to the prose column", async () => {
    const lines = visible(await renderDocument(PILOT, { width: 80, color: "none" }));
    // Every key cell survives intact — this is what the floor plus completion buys.
    for (const key of ["Element", "heading", "structural", "purple bold", "#bd93f9"]) {
      expect(lines.some((l) => l.includes(key))).toBe(true);
    }
    // The prose column is the one that pays for it.
    expect(lines.some((l) => l.includes("…"))).toBe(true);
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
