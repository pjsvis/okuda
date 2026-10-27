import { describe, expect, test } from "bun:test";
import { renderRegion, tabledGlyphs } from "../scripts/brief-queue";

/** The decision loop's two pure halves: what the table says, and what the
 *  reading says about it. The corpus walk is exercised by `just decide` itself
 *  (and its output is the reading); these pin the classification, which is
 *  where a wrong answer is silent. */

describe("brief-queue — the tabled glyphs", () => {
  const doc = [
    "# &briefs — the state table",
    "",
    "| Brief | State | Narrative | Debrief |",
    "|---|---|---|---|",
    "| BRF-ONE | ✓ landed 2026-09-14 | shipped | — |",
    "| BRF-TWO | · open | not started | — |",
    "| BRF-THREE | ✗ rejected | refused | — |",
    "| BRF-FOUR | ◆ mine | the editor's own mark | — |",
  ].join("\n");

  test("a row's state is its first character — words and dates are prose", () => {
    const g = tabledGlyphs(doc);
    expect(g.get("BRF-ONE")).toBe("✓");
    expect(g.get("BRF-TWO")).toBe("·");
    expect(g.get("BRF-THREE")).toBe("✗");
  });

  test("an unmapped glyph is captured, not dropped — it is a dialect, not noise", () => {
    expect(tabledGlyphs(doc).get("BRF-FOUR")).toBe("◆");
  });
});

describe("brief-queue — the reading", () => {
  const row = (callsign: string, status = "open", date = "2026-08-25") =>
    ({ callsign, file: `${callsign}.md`, date, status, summary: "a summary" });
  const base = {
    live: [row("BRF-A"), row("BRF-B")], archived: 3, tabled: 2,
    move: [], disagree: [], editorial: [], phantom: [], silent: [], ticketed: [],
  };

  test("converged says so, and says what is left", () => {
    const out = renderRegion({ ...base, silent: [row("BRF-A")] });
    expect(out).toContain("Converged");
    expect(out).toContain("1 silent");
  });

  test("each defect is named, and the count line leads with the live set", () => {
    const out = renderRegion({ ...base, move: ["briefs/x.md"] });
    expect(out).toContain("Not converged");
    expect(out).toContain("Settled, still in the live tier");
    expect(out).toContain("2 live · 3 archived · 2 tabled");
  });

  test("silence is shown and never called a defect", () => {
    const out = renderRegion({ ...base, silent: [row("BRF-A"), row("BRF-B")] });
    // The word appears exactly once — in the sentence that disclaims gating.
    expect(out.match(/gated/g)?.length).toBe(1);
    expect(out).toContain("Silence is a judgement");
  });

  test("a pipe in prose does not end the row", () => {
    // The corpus writes `|` constantly — a shell grammar, a table, a probe. An
    // unescaped one turns a generated row into two broken cells.
    const b = { ...row("BRF-A"), summary: "the `|`, `!`, and case at the silo" };
    const out = renderRegion({ ...base, silent: [b], ticketed: [b] });
    for (const line of out.split("\n").filter((l) => l.startsWith("| BRF-A"))) {
      const cells = line.split(/(?<!\\)\|/).length - 2; // leading + trailing pipes
      expect(cells).toBe(3);
    }
  });

  test("an editorial glyph is listed apart from a contradiction", () => {
    const out = renderRegion({ ...base, editorial: [{ callsign: "BRF-B", glyph: "◆", status: "open" }] });
    expect(out).toContain("Editorial glyphs");
    expect(out).not.toContain("The table disagrees");
  });
});
