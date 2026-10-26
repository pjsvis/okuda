import { describe, expect, test } from "bun:test";
import { renderDocument } from "../src/render";
import { anchorFor, findAnchor, reanchoredScroll, stripForAnchor } from "../src/tui";
import { headingLines } from "../src/frames";
import { stripANSI } from "../src/width";

/** The anchor's *experience*, measured: when the glass moves, how far does the
 *  line the reader was looking at move on screen?
 *
 *  The existing tests pin `reanchoredScroll`'s behaviour on three hand-built
 *  documents (insert, remove, rewrite). What they cannot say is which *policy* is
 *  right, and a policy is what this file pins — because the argument for the
 *  middle-of-viewport anchor (`anchorFor`, `src/tui.ts:187`) is an argument about
 *  displacement, and displacement needs a corpus and a ladder of widths.
 *
 *  The instrument: a synthetic document of uniquely-tokened words (`w0001`…), so
 *  a *word* can be followed across a reflow — a line cannot. That distinction is
 *  the finding. At a new width the lines are re-cut objects; measured, the
 *  rendered-line anchor misses in **88%** of width changes, and the policy still
 *  holds, because `reanchoredScroll` falls back to `proportionalScroll` — a
 *  *position*. The guarantee is positional; the text match is a bonus that
 *  occasionally sharpens it. A heading is a content landmark twice over: it is
 *  far above the eye (corpus median 13 lines, p90 38, max 85) and, because its
 *  rendered line carries width-dependent chrome — padding plus the right-edge `█`
 *  — it cannot be matched at all after a resize (`findAnchor` returns -1).
 *
 *  Measured on this document, 227 reading positions across four width steps:
 *
 *  | policy | median | p90 | max | ≤ 2 rows |
 *  |---|---|---|---|---|
 *  | middle (shipped) | 1 | 2 | **2** | **100%** |
 *  | heading pinned to row 2 | 4 | 7 | **13** | 29% |
 *  | top row pinned | 1 | 3 | 3 | 90% |
 *
 *  So the ruling is: **anchor on position, not on content** — and the companion
 *  ruling, which keeps `snapFrame` legitimate: **landing may snap; reflow may
 *  not.** A jump is a verb the reader chose, so landing on a heading is a
 *  courtesy; a resize is involuntary, so it may only preserve.
 *
 *  **What this probe does not decide, and the control that says so.** Swapping
 *  `anchorFor`'s middle row for the top row was run as a control and the suite
 *  stayed green: at these width steps, a reflow that moves the top by N moves the
 *  middle by about N, so a top-row pin displaces the reading row by 1–3 as well.
 *  Displacement alone therefore does not distinguish top-pin from middle-pin, and
 *  a green run here is not proof that the middle is the only workable row. What
 *  it does distinguish, sharply, is a *content* anchor: a heading pin displaces
 *  the reading row several times more, and a heading cannot be matched at all.
 *  The remaining argument for the middle over the top is not measured here — it
 *  is that the top row is frequently blank (12% of positions below) or a line
 *  the reflow re-cut, while "first non-blank at/after the middle" always yields a
 *  row with text in it. Recorded because a probe reports a ceiling, not a
 *  verdict, and the next person will want to know which claim the green covers. */

/** A document whose every word is a unique token, so the *content* at a screen
 *  row can be found again after the lines are re-cut. */
let seq = 0;
const words = (n: number): string =>
  Array.from({ length: n }, () => `w${String(++seq).padStart(4, "0")}`).join(" ");

const DOC = [
  "# A synthetic document",
  "",
  `Opening paragraph, long enough to wrap at every width in the ladder: ${words(70)}.`,
  "",
  "## First section",
  "",
  `${words(210)}.`,
  "",
  `${words(12)}.`,
  "",
  `- ${words(14)}.`,
  `- ${words(9)}.`,
  "",
  "## Second section",
  "",
  `${words(150)}.`,
  "",
  "```",
  "a fence line that never reflows",
  "another fence line",
  "```",
  "",
  "## Third section",
  "",
  `${words(45)}.`,
  "",
  `${words(240)}.`,
  "",
  "## Fourth section",
  "",
  `${words(20)}.`,
  "",
  `> a quoted line, ${words(30)}.`,
  "",
  "## Fifth section",
  "",
  `${words(80)}.`,
  "",
].join("\n");

const WIDTHS = [80, 100, 120, 160, 200];
const HEIGHT = 20;

const rendered = new Map<number, string[]>();
for (const w of WIDTHS) {
  rendered.set(w, stripANSI(await renderDocument(DOC, { width: w, color: "none" })).split("\n"));
}

const tokenOf = (line: string): string | null => stripANSI(line).match(/w\d{4}/)?.[0] ?? null;
const rowOfToken = (lines: string[], token: string): number =>
  lines.findIndex((l) => stripANSI(l).includes(token));

/** The reading row: the first non-blank line at or after the screen middle —
 *  the same rule `anchorFor` uses, so the measurement is of what ships. */
function readingRow(lines: string[], scroll: number): number {
  const mid = scroll + (HEIGHT >> 1);
  for (let i = mid; i < Math.min(lines.length, scroll + HEIGHT); i++) {
    if (stripANSI(lines[i] ?? "").trim()) return i;
  }
  return -1;
}

/** Horizontal-rule-free heading identity: an art glyph count is width-dependent
 *  and a heading's *rendered* line is not (see the second test). */
const headingKey = (line: string): string =>
  stripANSI(line).replace(/[█─▔▁]/g, "").replace(/\s+/g, " ").trim().toLowerCase();

type Sample = { middle: number; heading: number | null; top: number | null };
const samples: Sample[] = [];

for (let i = 1; i < WIDTHS.length; i++) {
  const oldLines = rendered.get(WIDTHS[i - 1]!)!;
  const newLines = rendered.get(WIDTHS[i]!)!;
  const headings = headingLines(oldLines);
  for (let scroll = 0; scroll + HEIGHT <= oldLines.length; scroll++) {
    const idxOld = readingRow(oldLines, scroll);
    if (idxOld < 0) continue;
    const token = tokenOf(oldLines[idxOld] ?? "");
    if (!token) continue;
    const idxNew = rowOfToken(newLines, token);
    if (idxNew < 0) continue;
    const rowOld = idxOld - scroll;
    const middle = Math.abs(idxNew - reanchoredScroll(oldLines, newLines, scroll, HEIGHT) - rowOld);

    const above = headings.filter((h) => h <= idxOld);
    const hOld = above[above.length - 1];
    let heading: number | null = null;
    if (hOld !== undefined) {
      const key = headingKey(oldLines[hOld] ?? "");
      const hNew = newLines.findIndex((l) => headingKey(l) === key);
      if (hNew >= 0) heading = Math.abs(idxNew - (hNew - 2) - rowOld);
    }

    const topToken = tokenOf(oldLines[scroll] ?? "");
    const topIdx = topToken ? rowOfToken(newLines, topToken) : -1;
    samples.push({ middle, heading, top: topIdx >= 0 ? Math.abs(idxNew - topIdx - rowOld) : null });
  }
}

const median = (xs: number[]): number => {
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)] ?? 0;
};

describe("the anchor's experience — displacement across a reflow", () => {
  test("the middle anchor holds the reading row still — every position, every step", () => {
    expect(samples.length).toBeGreaterThan(150); // the sample is not a rumour
    const worst = Math.max(...samples.map((s) => s.middle));
    // Measured 2; the bound is 3 so a legitimate wrap change has room while a
    // policy regression (top-pin: 3, heading-pin: 13) still fails.
    expect(worst).toBeLessThanOrEqual(3);
    expect(median(samples.map((s) => s.middle))).toBeLessThanOrEqual(1);
  });

  test("a heading pin moves the reading row — the jump the design avoided", () => {
    const heading = samples.map((s) => s.heading).filter((n): n is number => n !== null);
    const middle = samples.map((s) => s.middle);
    expect(heading.length).toBeGreaterThan(100);
    // Measured: median 4, max 13 — several times the middle anchor's worst case.
    expect(median(heading)).toBeGreaterThan(median(middle));
    expect(Math.max(...heading)).toBeGreaterThan(Math.max(...middle) + 4);
  });

  test("a heading cannot even be matched as rendered — its line carries width-dependent chrome", () => {
    // The padding and the right-edge `█` are laid out to the glass, so the same
    // heading is a different string at 120 than at 80. A content anchor that
    // cannot be found is not a degraded anchor; it is not an anchor.
    const narrow = rendered.get(80)!;
    const wide = rendered.get(120)!;
    const h = headingLines(narrow)[1]!;
    expect(findAnchor(wide, stripForAnchor(narrow[h] ?? ""), h, HEIGHT)).toBe(-1);
  });

  test("the guarantee is positional, not textual — the line match mostly misses", () => {
    // A reflow re-cuts the lines, so `findAnchor` on a rendered line fails in the
    // large majority of width changes and `reanchoredScroll` falls through to
    // `proportionalScroll`. The position survives the text; that is the whole
    // mechanism, and the test above shows it holds anyway.
    let tries = 0;
    let misses = 0;
    for (let i = 1; i < WIDTHS.length; i++) {
      const oldLines = rendered.get(WIDTHS[i - 1]!)!;
      const newLines = rendered.get(WIDTHS[i]!)!;
      for (let scroll = 0; scroll + HEIGHT <= oldLines.length; scroll += 3) {
        const a = anchorFor(oldLines, scroll, HEIGHT);
        if (!a) continue;
        tries++;
        if (findAnchor(newLines, a.text, scroll, HEIGHT) < 0) misses++;
      }
    }
    expect(tries).toBeGreaterThan(60);
    expect(misses / tries).toBeGreaterThan(0.5); // measured 0.88
  });

  test("the top row sometimes has nothing to hold", () => {
    // A blank row has no text, so a top-row anchor has no anchor — and the
    // middle rule, which skips blanks by construction, always finds one. This is
    // the part of the middle's case that displacement cannot make.
    let blank = 0;
    let total = 0;
    for (const lines of rendered.values()) {
      for (let scroll = 0; scroll + HEIGHT <= lines.length; scroll++) {
        total++;
        if (!stripForAnchor(lines[scroll] ?? "")) blank++;
      }
    }
    expect(blank).toBeGreaterThan(0); // measured 12%
    expect(blank / total).toBeLessThan(0.25); // …but not so often that the pin is useless
  });

  test("the worst case is bounded in the low single digits — the reader's tolerance budget", () => {
    // The middle policy spends none of the budget on itself, which leaves the
    // motion the reader sees to be the document's own reflow.
    const rows = samples.map((s) => s.middle).filter((d) => d <= 2).length;
    expect(rows / samples.length).toBe(1); // measured 100% within two rows
  });
});
