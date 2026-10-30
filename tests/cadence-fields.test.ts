import { describe, expect, test } from "bun:test";
import { renderMarkdown, type Report } from "../scripts/cadence";
import { displayWidth } from "../src/width";

/** A minimal report: two tiers that differ only in how many digits they need. */
function report(n: number, rate: number): Report {
  return {
    instrument: ["briefs/INDEX.jsonl"],
    scanned: 1,
    tiers: [
      { tier: "briefs", n, first: "2026-09-18", last: "2026-10-28", rate },
      { tier: "decisions", n, first: "2026-08-20", last: "2026-10-30", rate },
    ],
    latency: { n: 1, min: 0, median: 1, p90: 1, max: 1 },
    coverage: [{ tier: "decisions", hit: 1, total: 1 }],
    flight: { open: 1, parked: 0 },
  };
}

/** The width of every line in a derived table, NBSP included. */
function tableWidths(n: number, rate: number): number[] {
  return renderMarkdown(report(n, rate))
    .split("\n")
    .filter((l) => l.startsWith("|"))
    .map((l) => displayWidth(l));
}

describe("cadence — the derived tables hold their columns", () => {
  test("a digit arriving does not move a neighbour", () => {
    // The failure this pins: `≈ 8.1/wk` beside `≈ 10.4/wk` widened the Rate
    // column, and the renderer derives every column from the frame's content,
    // so everything to the right moved. Same table, one digit apart.
    expect(tableWidths(9, 9.4)).toEqual(tableWidths(10, 10.4));
    expect(tableWidths(8, 1.4)).toEqual(tableWidths(10, 15.7));
  });

  test("the pad is a field, not a hidden value", () => {
    // A no-break space holds the slot; the digits are untouched, so the cell
    // still reads as the measurement it is.
    const rate = renderMarkdown(report(9, 8.1)).split("\n").find((l) => l.includes("≈"));
    expect(rate).toContain("≈ 8.1/wk");
    expect(rate).not.toContain("\u00A0\u00A0\u00A0"); // no runaway padding
  });
});
