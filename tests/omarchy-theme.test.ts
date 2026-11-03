import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { changedLines, DEFAULT_SOURCE, PINNED, pinTemplate, pinValues } from "../scripts/omarchy-theme";
import { FLOOR, PAIR, ratio } from "../scripts/contrast";

/** BRF-PAIR-DELIVERED: the pair, delivered where it lands.
 *
 *  The control runs first — the reference pair on a template of the real shape
 *  pins three tokens and touches nothing else — because a detector whose control
 *  fails is measuring itself. Then the defect that made the third token necessary
 *  (a light theme's bright foreground is a *dark* ink, and it is both the cursor
 *  and ANSI slot 15), and the near-miss that did *not* earn a pin (`{{ muted }}`),
 *  asserted so the omission is evidence rather than an oversight.
 *
 *  The template below is **the shape, transcribed from the built-in on
 *  2026-11-03, not the source**. The source is the source: `--from` reads it, and
 *  the emitter refuses to write if a pinned token is absent. A fixture that
 *  claimed to be the source would be the parallel store the brief forbids. */

const SHAPE = `background = {{ background }}
foreground = {{ foreground }}
cursor-color = {{ bright_foreground }}
selection-background = {{ selection_background }}
selection-foreground = {{ selection_foreground }}

palette = 0={{ background }}
palette = 1={{ red }}
palette = 2={{ green }}
palette = 3={{ yellow }}
palette = 4={{ blue }}
palette = 5={{ magenta }}
palette = 6={{ cyan }}
palette = 7={{ foreground }}
palette = 8={{ muted }}
palette = 9={{ bright_red }}
palette = 10={{ bright_green }}
palette = 11={{ bright_yellow }}
palette = 12={{ bright_blue }}
palette = 13={{ bright_magenta }}
palette = 14={{ bright_cyan }}
palette = 15={{ bright_foreground }}
`;

/** Two light Omarchy themes' own values, read from their `colors.toml` on the box
 *  (2026-11-03). These are the numbers the third token exists for. */
const LIGHT = [
  { theme: "flexoki-light", background: "#FFFCF0", foreground: "#100F0F", bright_foreground: "#100F0F", muted: "#B7B5AC" },
  { theme: "catppuccin-latte", background: "#eff1f5", foreground: "#4c4f69", bright_foreground: "#4c4f69", muted: "#acb0be" },
];

describe("the pin — the control passes first", () => {
  test("the reference pair pins three tokens, six occurrences, and nothing else", () => {
    const res = pinTemplate(SHAPE, PAIR);
    expect(res.missing).toEqual([]);
    expect(res.pins.map((p) => [p.token, p.count])).toEqual([
      ["background", 2],
      ["foreground", 2],
      ["bright_foreground", 2],
    ]);
    // The hues and the selection pair are the theme's: untouched, byte-identical.
    const untouched = [...res.text.matchAll(/\{\{\s*([a-z_]+)\s*\}\}/g)].map((m) => m[1]!);
    expect(untouched).toEqual([
      "selection_background",
      "selection_foreground",
      "red",
      "green",
      "yellow",
      "blue",
      "magenta",
      "cyan",
      "muted",
      "bright_red",
      "bright_green",
      "bright_yellow",
      "bright_blue",
      "bright_magenta",
      "bright_cyan",
    ]);
  });

  test("the template's own invariant survives: palette 0 is the ground, palette 7 the ink", () => {
    // The reason substitution is at token level and not at line level: the same
    // token grounds a palette slot and a key, so one replacement keeps them equal.
    // A line rewrite would leave a fence's ANSI-0 background off the page's ground.
    const res = pinTemplate(SHAPE, PAIR);
    expect(res.text).toContain(`background = ${PAIR.bg}`);
    expect(res.text).toContain(`palette = 0=${PAIR.bg}`);
    expect(res.text).toContain(`foreground = ${PAIR.fg}`);
    expect(res.text).toContain(`palette = 7=${PAIR.fg}`);
  });

  test("six lines differ between the built-in and the pinned template", () => {
    const res = pinTemplate(SHAPE, PAIR);
    expect(changedLines(SHAPE, res.text).map((l) => l.n)).toEqual([1, 2, 3, 7, 14, 22]);
  });
});

describe("the third token — the defect it exists for", () => {
  test("a light theme's bright foreground is unreadable on the reference ground", () => {
    // Before the pin: cursor-color and ANSI 15 both carry this value.
    for (const t of LIGHT) {
      expect(ratio(t.bright_foreground, PAIR.bg)).toBeLessThan(FLOOR);
    }
    // flexoki-light's is the near-black extreme; the report names it as 1.17:1.
    expect(ratio("#100F0F", PAIR.bg)).toBeLessThan(1.3);
  });

  test("after the pin, the cursor and slot 15 carry ink that clears the floor", () => {
    for (const t of LIGHT) {
      const res = pinTemplate(SHAPE, { bg: PAIR.bg, fg: PAIR.fg });
      expect(res.text).toContain(`cursor-color = ${PAIR.fg}`);
      expect(res.text).toContain(`palette = 15=${PAIR.fg}`);
      expect(ratio(PAIR.fg, PAIR.bg)).toBeGreaterThanOrEqual(FLOOR);
    }
  });
});

describe("the omission — why {{ muted }} is not pinned", () => {
  test("a light theme's muted stays legible on a dark ground, so pinning it would be taste", () => {
    // The control for the decision to leave it alone. If this ever fails, `muted`
    // earns a place in PINNED and the header's rule is wrong, not this test.
    for (const t of LIGHT) {
      expect(ratio(t.muted, PAIR.bg)).toBeGreaterThanOrEqual(FLOOR);
    }
    expect(PINNED).not.toContain("muted" as never);
  });
});

describe("a template that changed shape is refused, not patched", () => {
  test("a renamed pinned token is reported by name", () => {
    // Every occurrence, or the one left behind would still satisfy the token.
    const renamed = SHAPE.replaceAll("{{ bright_foreground }}", "{{ bright_fg }}");
    const res = pinTemplate(renamed, PAIR);
    expect(res.missing).toEqual(["bright_foreground"]);
    // And it did not substitute the impostor: an unknown token is left as written.
    expect(res.text).toContain("{{ bright_fg }}");
  });

  test("the values are the pair, and the bright token takes the ink rather than inventing one", () => {
    expect(pinValues({ bg: "#221f1c", fg: "#d6cfc4" })).toEqual({
      background: "#221f1c",
      foreground: "#d6cfc4",
      bright_foreground: "#d6cfc4",
    });
  });
});

describe("drift against the real built-in, when this machine has one", () => {
  const present = existsSync(DEFAULT_SOURCE);
  test.skipIf(!present)("every pinned token is still a variable in Omarchy's template", () => {
    const real = readFileSync(DEFAULT_SOURCE, "utf8");
    const res = pinTemplate(real, PAIR);
    expect(res.missing).toEqual([]);
    expect(res.pins.length).toBe(PINNED.length);
  });
});
