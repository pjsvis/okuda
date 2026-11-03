import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { changedLines, DEFAULT_SOURCE, PINNED, pinTemplate, pinValues } from "../scripts/omarchy-theme";
import { FLOOR, okudaPalette, PAIR, ratio } from "../scripts/contrast";

/** BRF-PAIR-DELIVERED: the pair, delivered where it lands.
 *
 *  The control runs first — the reference pair on a template of the real shape
 *  pins the four neutral tokens and touches nothing else — because a detector
 *  whose control fails is measuring itself. Then the two defects the neutrals
 *  exist for, which fail on different axes: `{{ bright_foreground }}` by going
 *  **dark** (unreadable), and `{{ muted }}` by staying **loud** (unquiet). The
 *  second was found by review, 2026-11-03: the first cut tested muted's contrast
 *  and passed it, which is the wrong instrument for a rank channel.
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
  // Named `(dawn)`, because there is a dark rose-pine too and the two are 4× apart
  // under the same theme name: 0.95 here, 0.30 there (review, 2026-11-03). A reader
  // meeting both will otherwise assume a bug. The difference is the ground's, not
  // the theme's — which is the whole finding.
  { theme: "rose-pine (dawn)", background: "#faf4ed", foreground: "#575279", bright_foreground: "#575279", muted: "#cecacd" },
];

/** The dark themes used in actual use, for the same measurement. Their own
 *  `muted` is already in band, which is why the pin is a *uniformisation* there
 *  and a repair only on the light class — the correction to the review. */
const DARK = [
  { theme: "ristretto", background: "#2c2525", foreground: "#e6d9db", bright_foreground: "#e6d9db", muted: "#72696a" },
  { theme: "tokyo-night", background: "#1a1b26", foreground: "#a9b1d6", bright_foreground: "#c0caf5", muted: "#414868" },
  { theme: "nord", background: "#2e3440", foreground: "#d8dee9", bright_foreground: "#d8dee9", muted: "#4c566a" },
];

/** `muted ÷ ink` — the quiet channel's rank, and the number every shipped theme
 *  holds at 0.11–0.26 on its own ground (read from the six themes' `colors.toml`
 *  on the box, 2026-11-03). The band is the reference grounds' own range
 *  (`docs/2026-10-28-the-ground-you-read-on.md`, the `share` column). */
const share = (muted: string, bg: string, ink: string): number => ratio(muted, bg) / ratio(ink, bg);
const QUIET: [number, number] = [0.13, 0.29];
const inBand = (s: number): boolean => s >= QUIET[0] && s <= QUIET[1];

describe("the pin — the control passes first", () => {
  test("the reference pair pins four neutral tokens, seven occurrences, and nothing else", () => {
    const res = pinTemplate(SHAPE, PAIR);
    expect(res.missing).toEqual([]);
    expect(res.pins.map((p) => [p.token, p.count])).toEqual([
      ["background", 2],
      ["foreground", 2],
      ["muted", 1],
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

  test("seven lines differ between the built-in and the pinned template", () => {
    const res = pinTemplate(SHAPE, PAIR);
    expect(changedLines(SHAPE, res.text).map((l) => l.n)).toEqual([1, 2, 3, 7, 14, 15, 22]);
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

describe("the fourth neutral — the defect that is loudness, not illegibility", () => {
  test("the control has a defect to catch: on a pinned ground, a light theme's muted leaves the band", () => {
    // Before the pin. Every one of these themes holds the rank on its *own*
    // ground; it is the pinned ground that breaks it. If this ever stops failing,
    // the third neutral stops earning its place and the header's rule is wrong.
    for (const t of LIGHT) {
      const before = share(t.muted, PAIR.bg, PAIR.fg);
      expect(inBand(before)).toBe(false);
      expect(before).toBeGreaterThan(0.7);
    }
    // rose-pine is the near-miss that names the failure: at 0.95 the dim text is
    // the prose's own loudness, and the page's rule is that above 1.00 a rule
    // out-shouts what it divides.
    const rosePine = LIGHT.find((t) => t.theme === "rose-pine (dawn)")!;
    expect(share(rosePine.muted, PAIR.bg, PAIR.fg)).toBeGreaterThan(0.9);
  });

  test("after the pin the quiet register is the palette's own, and inside the band", () => {
    const pinnedMuted = okudaPalette().muted;
    expect(pinTemplate(SHAPE, PAIR).pins.find((p) => p.token === "muted")?.value).toBe(pinnedMuted);
    const after = share(pinnedMuted, PAIR.bg, PAIR.fg);
    expect(inBand(after)).toBe(true);
    // 0.20 on the reference ground: `docs/2026-10-28-the-ground-you-read-on.md`.
    expect(after).toBeGreaterThan(0.18);
    expect(after).toBeLessThan(0.22);
    // And it is not a legibility minimum: it is *darker* than a shipped theme's
    // own dim ink (tokyo-night 1.84:1), which is why contrast was the wrong test.
    expect(ratio(pinnedMuted, PAIR.bg)).toBeLessThan(3);
  });

  test("on a dark theme the pin is a uniformisation, not a repair — stated so it is not oversold", () => {
    // Measured on the pinned ground: ristretto 0.29 (the band's own top edge),
    // tokyo-night 0.17, nord 0.21. All already quiet, so this is not a repair;
    // the pin moves each of them to the palette's 0.20, which is the point — one
    // page, whichever theme is cycling. The dark rose-pine cross-checks it at
    // 0.30, a hair over the edge, against its dawn twin's 0.95 — the same theme,
    // the same muted, a different ground.
    const seen = DARK.map((t) => share(t.muted, PAIR.bg, PAIR.fg));
    for (const s of seen) expect(s).toBeLessThanOrEqual(0.30);
    expect(Math.max(...seen)).toBeGreaterThanOrEqual(0.28); // the edge is real
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

  test("the values are the pair plus the palette's quiet ink, and nothing is invented", () => {
    expect(pinValues({ bg: "#221f1c", fg: "#d6cfc4" })).toEqual({
      background: "#221f1c",
      foreground: "#d6cfc4",
      muted: okudaPalette().muted,
      bright_foreground: "#d6cfc4",
    });
    // The bright neutral takes the ink rather than a brighter hex: on a ground
    // this dark the ink already is the brightest text.
    expect(pinValues({ bg: "#221f1c", fg: "#d6cfc4" }).bright_foreground).toBe("#d6cfc4");
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
