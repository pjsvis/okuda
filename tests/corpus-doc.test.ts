import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  STANDING_MARK,
  luminance,
  oklch,
  ratio,
  standing,
  type Row,
} from "../scripts/contrast";

// The corpus page's central table is **self-checking**: every hex is in the row,
// and every derived cell is recomputed here from the row's own hexes. So the page
// cannot drift from its arithmetic, and it does not need a second store of the
// corpus to be verifiable — a reader who disputes a number has the hex beside it.
//
// What this file deliberately does *not* pin: the quantile census. Those figures
// depend on the 819 files an installed app happens to ship, which is not in the
// repo and must not be — the page names the path, the date and the command, and
// `just corpus` reproduces them. A gate that pinned them would fail on a machine
// without Ghostty and call that a defect in the prose.

const DOC = join(import.meta.dir, "..", "docs", "2026-11-15-the-corpus-prior.md");
const page = (): string => readFileSync(DOC, "utf8");

/** The table rows, as data: the cells split, so each derived cell can be
 *  compared with the hexes in its own row — positionally, not by "somewhere on
 *  this line a number like this appears". */
const rows = (): { cells: string[]; bg: string; fg: string }[] =>
  page()
    .split("\n")
    .filter((l) => /^\| [^|]+ \| #[0-9a-f]{6} \/ #[0-9a-f]{6} \|/.test(l))
    .map((line) => {
      const cells = line.split("|").map((c) => c.trim());
      const [bg, fg] = cells[2]!.split(" / ");
      return { cells, bg: bg!, fg: fg! };
    });

describe("the corpus page — every derived cell is its own row's arithmetic", () => {
  test("the pair table is present and not empty", () => {
    expect(rows().length).toBeGreaterThanOrEqual(10);
  });

  test("L, Y, prose and lift recompute from the hexes printed beside them", () => {
    // A number split from its row is a measurement split from its referent, so
    // the cells are compared positionally: cell 3 is the pair's lightnesses or
    // it is wrong, and no amount of a matching number elsewhere rescues it.
    for (const { cells, bg, fg } of rows()) {
      const lb = oklch(bg).L;
      const lf = oklch(fg).L;
      expect(cells[3]).toBe(`${lb.toFixed(3)} / ${lf.toFixed(3)}`);
      expect(cells[4]).toBe(luminance(bg).toFixed(3));
      expect(cells[5]).toBe(`${ratio(fg, bg).toFixed(1)}:1`);
      expect(cells[6]).toBe((lf - lb).toFixed(3));
    }
  });

  test("each row's tier is `standing()` on that row's own pair", () => {
    // The page's most contestable column. Checked against the intervals in code,
    // so a row cannot claim a band the instrument would not give it — including
    // the light-ground row, which must read `outside` and say so in prose.
    for (const { cells, bg, fg } of rows()) {
      const mark = STANDING_MARK[standing({ lBg: oklch(bg).L, ratio: ratio(fg, bg) } as Row)];
      expect(cells[7]).toBe(mark);
    }
  });

  test("our control is Ghostty's default pair — the page's sharpest claim", () => {
    // If the two ever part company, the sentence that rests on them is false and
    // this fails rather than quietly reading as a coincidence that stopped being
    // one.
    const ghostty = rows().find((r) => r.cells[1]?.includes("Ghostty default"))!;
    expect(page()).toContain(`PAIRS[0]`);
    expect(ghostty.bg).toBe("#282c34");
    expect(ghostty.fg).toBe("#ffffff");
  });

  test("the page names its instrument, its corpora and its date", () => {
    expect(page()).toContain("just corpus");
    expect(page()).toContain("scripts/contrast.ts --corpus");
    expect(page()).toContain("Ghostty 819 shipped themes");
    expect(page()).toContain("tests/corpus-doc.test.ts");
  });

  test("recited sources are marked as recited", () => {
    // The house rule: a cited work credits the silo that made it, and a claim
    // that was not fetched says so. Three names here were not fetched on
    // 2026-11-15 and the page says it rather than borrowing their authority.
    expect(page()).toContain("Recited, unfetched, do not quote without the fetch");
  });
});
