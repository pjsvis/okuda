import { describe, expect, test } from "bun:test";
import { renderDocument, tableSlots, BAND_CONTENT } from "../src/render";
import { displayWidth, stripANSI } from "../src/width";
import { DRACULA_PALETTE } from "../src/palette";

/** The slot instrument, and the test the silo did not have (BRF-TABLE-SLOT-
 *  INSTRUMENT). `scripts/tables-check.ts` measures FIT — hidden, starved,
 *  elided. It never measures ALIGNMENT, so a header that disagreed with its
 *  body by a column or two was invisible to every gate. These tests pin the
 *  two properties the instrument exists for:
 *
 *    1. `tableSlots` is the renderer's own layout, and it obeys its contract;
 *    2. the header and the body share ONE grid — the header's pipes and the
 *       body's gutters fall on the same slot boundaries, in the fitted AND the
 *       wrapped states. (For a default-left column the cell content also starts
 *       on that boundary; for a centred or right-aligned column it does NOT,
 *       and should not. The grid is the invariant; the content start is not.)
 *
 *  `tableSlots` takes the CONTENT width the renderer receives — the glass
 *  minus the 2+2 document margin (`renderDocument`), never the terminal width.
 *  The margin is what made the original numbers untrustworthy: two people
 *  computing slots from different widths will disagree about a table's
 *  geometry while looking at the same bytes.
 */

const GUTTER = 3;
/** renderDocument reserves a 2-char left + 2-char right margin. */
const MARGIN = 4;
const contentWidth = (glass: number) => Math.max(10, glass - MARGIN);

const visible = (out: string) => stripANSI(out).split("\n").filter((l) => l.trim().length > 0);

/** The start column of each column's content, derived only from the rendered
 *  markers — never from `tableSlots`. Each marker is a cell's first token, so
 *  it lands at the column's content start on the first line of the header and
 *  on the first line of a body block. `indexOf` is exact: the markers are
 *  unique and do not prefix one another. */
function markerStarts(line: string, markers: string[]): (number | null)[] {
  let cursor = 0;
  return markers.map((m) => {
    const at = line.indexOf(m, cursor);
    if (at >= 0) cursor = at + m.length;
    return at < 0 ? null : at;
  });
}

/** A nine-column table that WRAPS: natural > 116, every word short enough that
 *  the floors' sum fits the band. Nine columns is the monster table's shape
 *  (BRF-TABLE-SLOT-INSTRUMENT's subject) and the common path for the corpus. */
const wrapFixture = (() => {
  const header = Array.from({ length: 9 }, (_, i) => `hdr${i + 1}`);
  const firstTokens = Array.from({ length: 9 }, (_, i) => `bdy${i + 1}`);
  const rows = Array.from({ length: 3 }, (_, r) =>
    firstTokens.map((tok) => `${tok}${r} alpha beta gamma delta`),
  );
  const src = [
    "| " + header.join(" | ") + " |",
    "| " + header.map(() => "---").join(" | ") + " |",
    ...rows.map((r) => "| " + r.join(" | ") + " |"),
  ].join("\n");
  return { header, firstTokens, rows, src };
})();

/** The aligned table — `docs/tables.md` §3, left / centre / right. It is the
 *  counterexample that makes the invariant precise: the header's `C` and `R`
 *  sit away from their slot starts by design, so "cell starts agree" is false
 *  here while the GRID still agrees. */
const alignedFixture = (() => {
  const header = ["L", "C", "R"];
  const aligns = ["left", "center", "right"] as const;
  const rows = [
    ["left", "centre", "right"],
    ["a", "bb", "ccc"],
    ["1", "2", "3"],
  ];
  const src = [
    "| " + header.join(" | ") + " |",
    "| :--- | :---: | ---: |",
    ...rows.map((r) => "| " + r.join(" | ") + " |"),
  ].join("\n");
  return { header, aligns, rows, src };
})();

/** A table that FITS: natural <= target, drawn at the author's widths. */
const fitFixture = (() => {
  const header = ["one", "two", "three"];
  const rows = [["aaa1", "bbb1", "ccc1"], ["dddd", "eeee", "ffff"]];
  const src = [
    "| " + header.join(" | ") + " |",
    "| " + header.map(() => "---").join(" | ") + " |",
    ...rows.map((r) => "| " + r.join(" | ") + " |"),
  ].join("\n");
  return { header, rows, src };
})();

async function render(src: string, glass: number): Promise<string[]> {
  return visible(await renderDocument(src, { width: glass, color: "none", palette: DRACULA_PALETTE }));
}

/** The geometry the renderer draws, in absolute columns (margin included). */
function grid(header: string[], rows: string[][], content: number): number[] {
  const L = tableSlots(header, rows, content);
  const starts: number[] = [];
  let x = 2;
  for (let i = 0; i < L.cols; i++) {
    starts.push(x);
    x += L.slots[i]! + GUTTER;
  }
  return starts;
}

describe("tableSlots — the renderer's own layout, exported (BRF-TABLE-SLOT-INSTRUMENT)", () => {
  test("the header contributes only its longest word, not its width", () => {
    const L = tableSlots(["a very long label indeed"], [["x"]], 120);
    // Longest word: "indeed" (6). Body "x" (1). The label's 26 columns do not
    // hold the column open.
    expect(L.headWord[0]).toBe(6);
    expect(L.bodyNat[0]).toBe(1);
    expect(L.colWidth[0]).toBe(6);
  });

  test("a floor is the longest UNBREAKABLE segment, not the longest whitespace token", () => {
    const L = tableSlots(["p"], [["path/to/thing"]], 120);
    // The body cell is 13 wide; the floor is the longest segment (5), because
    // the wrapper may break after `/`.
    expect(L.bodyNat[0]).toBe(13);
    expect(L.bodyWord[0]).toBe(5);
    expect(L.wordFloor[0]).toBe(5);
  });

  test("the wrapped state gives every column its floor and splits the slack evenly", () => {
    const L = tableSlots(wrapFixture.header, wrapFixture.rows, 96);
    expect(L.wrap).toBe(true);
    expect(L.natural).toBeGreaterThan(L.target);
    expect(L.wordBudget).toBeLessThanOrEqual(L.target);
    for (let i = 0; i < L.cols; i++) expect(L.slots[i]!).toBeGreaterThanOrEqual(L.wordFloor[i]!);
    // The slots fill exactly the available budget: sum + gutters = target.
    const sum = L.slots.reduce((a, w) => a + w, 0) + GUTTER * (L.cols - 1);
    expect(sum).toBe(L.target);
    // Even slack: each column gets its floor plus one base, and the remainder
    // goes to the leftmost columns — no column gets two more than another.
    const base = Math.min(...L.slots.map((s, i) => s - L.wordFloor[i]!));
    for (let i = 0; i < L.cols; i++) expect(L.slots[i]! - L.wordFloor[i]! - base).toBeLessThanOrEqual(1);
  });

  test("the fitted state draws the author's widths, unadjusted", () => {
    const L = tableSlots(fitFixture.header, fitFixture.rows, 120);
    expect(L.wrap).toBe(false);
    expect(L.natural).toBeLessThanOrEqual(L.target);
    expect(L.slots).toEqual(L.colWidth);
  });

  test("a table whose floors cannot fit falls back to the cut, not to squeezing", () => {
    const token = "unbreakabletoken".repeat(8);
    const L = tableSlots(["id", "caveat"], [["01", token]], 120);
    expect(L.wordBudget).toBeGreaterThan(L.target);
    expect(L.wrap).toBe(false);
    expect(L.slots).toEqual(L.colWidth);
  });

  test("the band caps the target however wide the glass", () => {
    expect(tableSlots(fitFixture.header, fitFixture.rows, 100_000).target).toBe(BAND_CONTENT);
  });
});

describe("header and body share one grid (BRF-TABLE-SLOT-INSTRUMENT)", () => {
  test("wrapped: the body's cell starts equal the header's, column for column", async () => {
    const glass = 100;
    const L = tableSlots(wrapFixture.header, wrapFixture.rows, contentWidth(glass));
    expect(L.wrap).toBe(true); // the fixture must exercise the wrapped path
    const lines = await render(wrapFixture.src, glass);
    const headerLine = lines.find((l) => l.includes("│"))!;
    const block = lines.slice(lines.findIndex((l) => /^─+$/.test(l.trim())) + 1)
      .find((l) => l.includes(wrapFixture.firstTokens[0]!))!;
    const head = markerStarts(headerLine, wrapFixture.header);
    const body = markerStarts(block, wrapFixture.firstTokens);
    expect(head).not.toContain(null);
    expect(body).not.toContain(null);
    expect(body).toEqual(head);
  });

  test("wrapped: no body cell overhangs its slot — the gutter survives every row", async () => {
    const glass = 100;
    const content = contentWidth(glass);
    const starts = grid(wrapFixture.header, wrapFixture.rows, content);
    const out = await renderDocument(wrapFixture.src, { width: glass, color: "none", palette: DRACULA_PALETTE });
    const lines = stripANSI(out).split("\n");
    const rule = lines.findIndex((l) => /^─+$/.test(l.trim()));
    const bodyLines = lines.slice(rule + 1).filter((l) => l.includes(wrapFixture.firstTokens[0]!));
    expect(bodyLines.length).toBeGreaterThan(0);
    for (const l of bodyLines) {
      for (let i = 1; i < starts.length; i++) {
        // The 3-space gutter before column i is ours, never content: an
        // overhang eats into it, and that is the drift.
        expect(l.slice(starts[i]! - GUTTER, starts[i]!)).toBe(" ".repeat(GUTTER));
      }
      expect(displayWidth(l)).toBeLessThanOrEqual(content);
    }
  });

  test("the header pipe sits exactly the gutter left of its column's body start", async () => {
    const glass = 100;
    const starts = grid(wrapFixture.header, wrapFixture.rows, contentWidth(glass));
    const out = await renderDocument(wrapFixture.src, { width: glass, color: "none", palette: DRACULA_PALETTE });
    const headerLine = stripANSI(out).split("\n").find((l) => l.includes("│"))!;
    for (let i = 1; i < starts.length; i++) expect(headerLine[starts[i]! - 2]).toBe("│");
  });

  test("fitted: the body's cell starts equal the header's, column for column (default-left)", async () => {
    const glass = 120;
    const lines = await render(fitFixture.src, glass);
    const headerLine = lines.find((l) => l.includes("│"))!;
    const block = lines.slice(lines.findIndex((l) => /^─+$/.test(l.trim())) + 1).find((l) => l.includes("aaa1"))!;
    expect(markerStarts(block, fitFixture.rows[0]!)).toEqual(markerStarts(headerLine, fitFixture.header));
  });

  test("aligned: the grid holds, but content starts do NOT (the invariant is the grid)", async () => {
    const glass = 80;
    const content = contentWidth(glass);
    const L = tableSlots(alignedFixture.header, alignedFixture.rows, content);
    const lines = await render(alignedFixture.src, glass);
    const headerLine = lines.find((l) => l.includes("│"))!;

    // The grid: pipes and gutters on the same boundaries as the instrument says.
    const starts = grid(alignedFixture.header, alignedFixture.rows, content);
    for (let i = 1; i < L.cols; i++) expect(headerLine[starts[i]! - 2]).toBe("│");
    const bodyLine = lines.slice(lines.findIndex((l) => /^─+$/.test(l.trim())) + 1).find((l) => l.includes("centre"))!;
    for (let i = 1; i < L.cols; i++) expect(bodyLine.slice(starts[i]! - GUTTER, starts[i]!)).toBe(" ".repeat(GUTTER));

    // …and yet the header's content starts do not equal the body's: `C` is
    // centred and `R` right-aligned within their slots. This is why the
    // brief's "cell starts agree" was the wrong instrument.
    const head = markerStarts(headerLine, alignedFixture.header);
    const body = markerStarts(bodyLine, alignedFixture.rows[0]!);
    expect(body[0]).toBe(head[0]);           // left: on the boundary
    expect(body[1]).not.toBe(head[1]);        // centre: off it
    expect(head[1]!).toBeGreaterThan(starts[1]!);
    expect(head[2]!).toBeGreaterThan(starts[2]!);
  });

  test("aligned: each cell is padded per its declared align — left, centre, right", async () => {
    const glass = 80;
    const content = contentWidth(glass);
    const L = tableSlots(alignedFixture.header, alignedFixture.rows, content);
    const starts = grid(alignedFixture.header, alignedFixture.rows, content);
    const region = (line: string, i: number) => line.slice(starts[i]!, starts[i]! + L.slots[i]!);
    const expectAligned = (cell: string, i: number, shown: string) => {
      const w = displayWidth(cell);
      const lead = alignedFixture.aligns[i] === "center"
        ? Math.floor((L.slots[i]! - w) / 2)
        : alignedFixture.aligns[i] === "right" ? L.slots[i]! - w : 0;
      expect(shown).toBe(" ".repeat(lead) + cell + " ".repeat(L.slots[i]! - w - lead));
    };
    const lines = stripANSI(await renderDocument(alignedFixture.src, { width: glass, color: "none", palette: DRACULA_PALETTE })).split("\n");
    const headerLine = lines.find((l) => l.includes("│"))!;
    alignedFixture.header.forEach((cell, i) => expectAligned(cell, i, region(headerLine, i)));
    const rule = lines.findIndex((l) => /^─+$/.test(l.trim()));
    const bodyLines = lines.slice(rule + 1).filter((l) => l.trim() && !/^─+$/.test(l.trim()) && !l.includes("█"));
    expect(bodyLines.length).toBe(3);
    bodyLines.forEach((l, r) => alignedFixture.rows[r]!.forEach((cell, i) => expectAligned(cell, i, region(l, i))));
  });
});
