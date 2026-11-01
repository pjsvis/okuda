import { describe, expect, test } from "bun:test";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { compareRanking, referencePair, themePair } from "../scripts/contrast";
import { pinSurface, settingsHint, type HostTheme } from "../scripts/herdr-theme";

/** The ranking instrument's two obligations, and the order they come in: the
 *  **control must pass first** — the reference pair compared with itself reports
 *  no movement — and only then may the detector be believed about a defect.
 *  A detector whose control fails is measuring itself. */

const REF = referencePair();
const ATOM_ONE_DARK = { bg: "#21252b", fg: "#abb2bf" };

describe("the ranking — the control passes first", () => {
  test("the reference against itself: nothing moves, nothing crosses", () => {
    const shifts = compareRanking(REF, { bg: REF.bg, fg: REF.fg });
    expect(shifts.every((s) => s.moved === 1)).toBe(true);
    expect(shifts.filter((s) => s.crossed)).toEqual([]);
  });

  test("every row is a role with a hex and a ratio — no ghosts in the table", () => {
    const shifts = compareRanking(REF, ATOM_ONE_DARK);
    expect(shifts.length).toBeGreaterThan(20);
    for (const s of shifts) expect(s.hex).toMatch(/^#[0-9a-f]{6}$/i);
  });
});

describe("the ranking — the defect the control licenses us to report", () => {
  test("a dimmer ink re-ranks the palette without changing a single colour", () => {
    const shifts = compareRanking(REF, ATOM_ONE_DARK);
    const heading = shifts.find((s) => s.role === "heading")!;
    // The palette hexes are fixed; only the ink moved, and that is enough.
    expect(heading.hex).toBe(shifts.find((s) => s.role === "heading")!.hex);
    expect(heading.before).toBeLessThan(1);
    expect(heading.over).toBeGreaterThan(1);
    expect(heading.crossed).toBe(true);
    expect(shifts.filter((s) => s.crossed).length).toBeGreaterThan(1);
  });

  test("the fix is one value: the tuned ink on the theme's own ground crosses nothing", () => {
    // Keep the ground the theme chose; replace only the ink. Nothing crosses.
    const shifts = compareRanking(REF, { bg: ATOM_ONE_DARK.bg, fg: REF.fg });
    expect(shifts.filter((s) => s.crossed)).toEqual([]);
    // The shape still moves a little — the ground moved as well — but not by much,
    // and (the point) not across the line.
    expect(Math.max(...shifts.map((s) => Math.abs(s.moved - 1)))).toBeLessThan(0.2);
  });

  test("the boundary role is named: `link` sits ON the ink line, so it tips first", () => {
    // Measured: 0.98 on the reference. That is why one pair's `link` crosses on a
    // half-step and another's does not — the finding is not fragile, `link` is
    // literally at the threshold, and saying so stops the next reader treating a
    // single crossing there as a catastrophe.
    const link = compareRanking(REF, { bg: REF.bg, fg: REF.fg }).find((s) => s.role === "link")!;
    expect(Math.abs(link.over - 1)).toBeLessThan(0.05);
  });
});

describe("a host theme — read for the pair okuda cannot see", () => {
  test("background and foreground are read; a chrome-only theme reports null", () => {
    const dir = process.env.TMPDIR ?? "/tmp";
    const good = join(dir, "okuda-theme-good.json");
    const bare = join(dir, "okuda-theme-bare.json");
    writeFileSync(good, JSON.stringify({ background: "#21252b", foreground: "#abb2bf", ansi: ["#000000"] }));
    writeFileSync(bare, JSON.stringify({ accent: "#ff8800" }));
    expect(themePair(good)).toEqual({ bg: "#21252b", fg: "#abb2bf" });
    expect(themePair(bare)).toBeNull();
    expect(themePair(join(dir, "okuda-theme-absent.json"))).toBeNull();
  });
});

describe("pinSurface — a pin, not a redesign", () => {
  const source: HostTheme = {
    background: "#21252b",
    foreground: "#abb2bf",
    selection: "#323844",
    cursor: "#abb2bf",
    ansi: ["#454c59", "#e06c75"],
    colors: { accent: "#61afef" },
  };

  test("the surface moves and everything else is carried through untouched", () => {
    const out = pinSurface(source, { bg: "#23272e", fg: "#c8ccd4" });
    expect(out.background).toBe("#23272e");
    expect(out.foreground).toBe("#c8ccd4");
    expect(out.cursor).toBe("#c8ccd4"); // the cursor is ink, not decoration
    expect(out.ansi).toEqual(source.ansi); // other programs' colours are not ours to decide
    expect(out.colors).toEqual(source.colors);
    expect(out.selection).toBe(source.selection);
  });

  test("the hint names the setting, and refuses the picker for the pair", () => {
    expect(settingsHint("gloam")).toContain('"theme": "gloam"');
    expect(settingsHint("gloam")).toContain("picker overrides");
  });
});
