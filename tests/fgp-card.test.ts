import { describe, expect, test } from "bun:test";
import { displayWidth } from "../src/width";
import { PAIR, PAIRS, surfaceVerdict } from "../scripts/contrast";
import { SPECIMEN, defaultPairs, fgpPatches, header, paintLine } from "../scripts/fgp-card";

/** ── The card for pairs, held by the two things a picture can get wrong ──
 *
 *  The control runs first: a patch's header must be `contrast.ts`'s own reading,
 *  so a card can never become a second derivation in a nicer font. Then the two
 *  byte-level traps: the ground must survive every internal reset, and the plain
 *  card must be the coloured card minus its *colour* — not minus everything,
 *  because NO_COLOR strips colour and keeps attributes (`src/ansi.ts:100-104`).
 */

const ESC = "\x1b";
const G = (hex: string): string => {
  const s = hex.replace("#", "");
  const [r, g, b] = [s.slice(0, 2), s.slice(2, 4), s.slice(4, 6)].map((x) => parseInt(x, 16));
  return `${ESC}[48;2;${r};${g};${b}m`;
};

/** A source with no fences: the pure path, no chroma or mermaid subprocess. */
const SMALL = "# Title\n\nProse with **strong** and *emphasis*, and `code`.\n\n| key | value |\n|---|---|\n| a | b |\n\n---\n";

describe("fgp-card — the control passes first", () => {
  test("a header is contrast.ts's reading, not a second calculation", () => {
    const v = surfaceVerdict(PAIR);
    const h = header(8, PAIR, "ground deeper still");
    expect(h).toContain(`${PAIR.bg} / ${PAIR.fg}`);
    expect(h).toContain(`${v.ink.toFixed(1)}:1`);
    expect(h).toContain("readable");
    expect(h).toContain(v.navigable ? "navigable" : "NOT navigable");
  });

  test("the inverted rungs say so in their own headers", () => {
    // The defect the card exists to show: three crossings at rung 3, twelve at 5.
    expect(header(3, { bg: "#282c34", fg: "#b8bcc2" })).toContain("NOT navigable (3)");
    expect(header(5, { bg: "#1b1e24", fg: "#a9aeb8" })).toContain("NOT navigable (12)");
  });

  test("the default card is every admissible rung — the refused one is not offered", () => {
    const shown = defaultPairs().map((p) => p.rung);
    expect(shown).toEqual(PAIRS.filter((p) => !p.refused).map((p) => p.n));
    expect(shown).not.toContain(7);
  });
});

describe("fgp-card — the ground survives every internal reset", () => {
  test("every reset but the last re-applies the pair's ground", async () => {
    const pair = { bg: "#221f1c", fg: "#d6cfc4" };
    const [patch] = await fgpPatches(SMALL, [{ rung: 8, pair }], 40, "truecolor");
    const painted = patch!.lines.filter((l) => l.includes(`${ESC}[0m`));
    expect(painted.length).toBeGreaterThan(3);
    for (const line of painted) {
      expect(line.startsWith(G(pair.bg))).toBe(true);
      const segments = line.split(`${ESC}[0m`);
      // The last reset closes the line, so it is the one without a re-apply.
      for (const seg of segments.slice(1, -1)) expect(seg.startsWith(G(pair.bg))).toBe(true);
    }
  });

  test("a patch is a rectangle: every painted line is exactly the width", async () => {
    const [patch] = await fgpPatches(SMALL, [{ rung: 8, pair: { bg: "#221f1c", fg: "#d6cfc4" } }], 37, "truecolor");
    for (const line of patch!.lines) expect(displayWidth(line)).toBe(37);
  });

  test("the ink is the pair's, not the glass's — the one role a principal declares", async () => {
    const pair = { bg: "#ffffff", fg: "#1f2328" };
    const [patch] = await fgpPatches(SMALL, [{ rung: null, pair }], 40, "truecolor");
    expect(patch!.lines[0]).toContain(`${ESC}[38;2;31;35;40m`);
  });
});

describe("fgp-card — the plain card is the coloured card minus its colour", () => {
  test("parity: same line count, same headers, no colour escapes", async () => {
    const pairs = [{ rung: 8, pair: { bg: "#221f1c", fg: "#d6cfc4" } }];
    const [loud] = await fgpPatches(SMALL, pairs, 40, "truecolor");
    const [plain] = await fgpPatches(SMALL, pairs, 40, "none");
    expect(plain!.lines.length).toBe(loud!.lines.length);
    expect(plain!.header).toBe(loud!.header);
    for (const line of plain!.lines) {
      expect(line).not.toContain("38;2");
      expect(line).not.toContain("48;2");
    // ...and the attributes are *not* stripped: NO_COLOR is about colour.
    expect(plain!.lines.some((l) => l.includes(`${ESC}[1m`) || l.includes(`${ESC}[3m`))).toBe(true);
    }
  });
});

describe("fgp-card — the specimen earns its coverage", () => {
  test("it carries every construct whose role can die on a ground", () => {
    // A specimen that quietly loses a construct stops covering the role it was
    // chosen for, and the card would look complete while measuring less.
    for (const mark of ["# ", "## ", "**", "*", "`", "|", "---", "> ", "- ", "✓", "☐", "✗", "```"]) {
      expect(SPECIMEN).toContain(mark);
    }
  });

  test("paintLine pads to the width and closes the line", () => {
    const painted = paintLine("abc", { bg: "#000000", fg: "#ffffff" }, 10);
    expect(displayWidth(painted)).toBe(10);
    expect(painted.endsWith(`${ESC}[0m`)).toBe(true);
  });
});
