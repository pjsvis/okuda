import { describe, expect, test } from "bun:test";
import { composeMenu, statusGlyph } from "../scripts/reg-menu";
import { extractJumps } from "../src/tui";

describe("reg-menu — statusGlyph (registry status → glyph)", () => {
  test("deviations wear theirs; the default is bare", () => {
    expect(statusGlyph("rejected")).toBe("\u2717");
    expect(statusGlyph("Parked")).toBe("\u22ee");
    expect(statusGlyph("Accepted")).toBe("\u2713");
    expect(statusGlyph("open")).toBe("");
    expect(statusGlyph("done")).toBe("");
    expect(statusGlyph("Proposed")).toBe("");
  });
});

describe("reg-menu — composeMenu (registry → wired table)", () => {
  const entries = [
    { file: "old.md", date: "2026-08-28", status: "open", summary: "Older doc", callsign: "BRF-OLD" },
    { file: "new.md", date: "2026-08-29", status: "rejected", summary: "Newer | piped" },
  ];

  test("newest first; header + rows; absent callsign renders an empty cell", () => {
    const doc = composeMenu("briefs", entries);
    expect(doc).toContain("# Menu — briefs");
    expect(doc).toContain("| Document | Callsign | # |");
    const rows = doc.split("\n").filter((l) => l.startsWith("| *"));
    expect(rows[0]).toContain("| *Newer \\| piped* \u2717 |  | **11**"); // newest, rejected glyph, empty callsign, pipe escaped
    expect(rows[1]).toContain("| *Older doc* | BRF-OLD | **12**");
  });

  test("the menu resolves: every row's wiring lands in extractJumps", () => {
    const doc = composeMenu("decisions", entries);
    const jumps = extractJumps(doc);
    expect(jumps.size).toBe(2);
    expect(jumps.get(11)).toBe("decisions/new.md"); // newest → token 11
    expect(jumps.get(12)).toBe("decisions/old.md");
  });

  test("long slugs cap at 50 chars with an ellipsis (a menu row is for scanning)", () => {
    const long = [{ file: "x.md", date: "2026-08-29", status: "open", summary: "x".repeat(215), callsign: "BRF-X" }];
    const doc = composeMenu("briefs", long);
    const row = doc.split("\n").find((l) => l.startsWith("| *"))!;
    expect(row).toContain("*" + "x".repeat(49) + "\u2026*"); // 49 xs + ellipsis = 50
    expect(row).not.toContain("x".repeat(50));
  });
});
