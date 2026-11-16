import { describe, expect, test } from "bun:test";
import { headingSourceLine, renderedHeadings, sourceHeadingLines } from "../src/heading";

/** A heading row carries the chip at the right edge; a wrapped continuation
 *  repaints both the badge and the chip. The `#`-celled table row has the
 *  badge but no chip — the discriminator the brief pins. */
const h = (text: string): string => `  ## ${text.padEnd(20)} █`;
const cont = (text: string): string => `  ## ${text.padEnd(20)} █`;
const tableRow = (): string => "  # │ Field               │ Cells    │ Role";

describe("heading — source side (fence-aware)", () => {
  test("a heading is a `^#{1,6} ` line, 1-based", () => {
    expect(sourceHeadingLines("# Title\n\n## A\ntext\n### B")).toEqual([1, 3, 5]);
  });

  test("a shell comment inside a fence is NOT a heading", () => {
    const src = "# OSC codes\n\n```zsh\n# Only emit when tty\n```\n\n## Next";
    expect(sourceHeadingLines(src)).toEqual([1, 7]);
  });

  test("a tilde fence excludes headings too", () => {
    const src = "# Top\n~~~\n# inner\n~~~\n## End";
    expect(sourceHeadingLines(src)).toEqual([1, 5]);
  });
});

describe("heading — render side (chip + wrap grouping)", () => {
  test("consecutive badge rows are ONE logical heading", () => {
    const lines = [h("A wrapped heading"), cont("continuation"), "", "  text"];
    expect(renderedHeadings(lines)).toEqual([0]);
  });

  test("a `#`-celled table row is excluded — no chip", () => {
    const lines = [h("Table"), tableRow(), "", "  text"];
    expect(renderedHeadings(lines)).toEqual([0]);
  });

  test("the synthetic References is a heading like any other", () => {
    expect(renderedHeadings([h("Intro"), "", h("References")])).toEqual([0, 2]);
  });
});

describe("heading — the ordinal map", () => {
  // source:  1=# Title, 4=## A, 6=## B
  const source = "# Title\n\nintro\n## A\na\n## B";
  const sourceNums = [1, 4, 6];

  test("delta 0: every rendered heading maps to its source line", () => {
    const lines = [h("Title"), "", "  intro", h("A"), "  a", h("B")];
    expect(renderedHeadings(lines).length).toBe(3); // delta 0
    expect(headingSourceLine(source, lines, 0, 3)).toBe(1); // mid 1 -> Title
    expect(headingSourceLine(source, lines, 3, 3)).toBe(4); // mid 4 -> A
    expect(headingSourceLine(source, lines, 5, 3)).toBe(6); // mid 6 -> B
  });

  test("delta 1: the trailing synthetic References is dropped", () => {
    const lines = [h("Title"), "", h("A"), "", h("B"), "", h("References")];
    expect(renderedHeadings(lines).length - sourceNums.length).toBe(1);
    // A viewport in the tail still resolves to the last REAL heading (B),
    // never to the synthetic one and never to line 1.
    expect(headingSourceLine(source, lines, 6, 2)).toBe(6);
  });

  test("a document with its OWN References still maps by count", () => {
    const ownSource = source + "\n\n## References\n\n- a target";
    const ownNums = [...sourceNums, 8];
    // one real References in source, one real + one synthetic in render
    const lines = [
      h("Title"), "", h("A"), "", h("B"), "",
      h("References"), "", h("References"),
    ];
    expect(renderedHeadings(lines).length - ownNums.length).toBe(1);
    expect(headingSourceLine(ownSource, lines, 7, 2)).toBe(8);
  });

  test("delta outside {0,1} returns null — never guess", () => {
    const lines = [h("Title"), "", h("A"), "", h("B"), "", h("C"), "", h("D")];
    expect(headingSourceLine(source, lines, 0, 3)).toBeNull();
  });

  test("a preamble resolves to the first heading — frameBounds clamps", () => {
    const lines = ["  preamble", "", h("Title"), "", h("A"), "", h("B")];
    // A reader above the first heading is in the first section; `§` frame
    // navigation clamps the same way. No null, no jump to line 1 by accident.
    expect(headingSourceLine(source, lines, 0, 2)).toBe(1);
  });

  test("a no-heading document returns null", () => {
    expect(headingSourceLine("just prose", ["  just prose"], 0, 1)).toBeNull();
  });
});
