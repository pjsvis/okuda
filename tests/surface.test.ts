import { describe, expect, test } from "bun:test";
import { mkdtempSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { configFile, FLOOR, floor, gateFails, gateRows, gateText, NOT_ON_GROUND, PAIR, PAIRS, REFERENCE_RUNG, referencePair, surfaceDir, surfaceDirText, surfaceFails, surfaceVerdict, themePair } from "../scripts/contrast";
import { pinSurface, resolveTarget, selectInLayout, selectionHint } from "../scripts/herdr-theme";
import { herdrClues, herdrLayoutLook, hexOf, plistValue, rexClues } from "../scripts/probe-surface";

/** BRF-SURFACE-PAIR: two readings, one answer. The control runs first — the
 *  reference pair must clear both — because a detector whose control fails is
 *  measuring itself. Then the two defects, which are deliberately on different
 *  axes so the tests cannot pass by accident: a dimmed ink breaks the order and
 *  leaves legibility alone; a light ground breaks legibility and leaves the
 *  order alone. */

const REF = referencePair();
const ATOM_ONE_DARK = { bg: "#21252b", fg: "#abb2bf" }; // a Herdr UI theme, in use
const WHITE = { bg: "#ffffff", fg: "#000000" }; // a light ground, the class we refuse

describe("the surface — the control passes first", () => {
  test("the reference pair is readable and navigable", () => {
    const v = surfaceVerdict(REF);
    expect(v.readable).toBe(true);
    expect(v.navigable).toBe(true);
    expect(v.crossed).toEqual([]);
    expect(v.belowFloor).toEqual([]);
    expect(v.ink).toBeGreaterThan(10);
  });

  test("the exemptions are marked on the rows, not hidden from the reading", () => {
    // The control is what found them: the reference pair failed a flat 3:1 floor
    // on exactly badge-fg and muted, and the answer was to exempt with a reason
    // rather than to lower the floor for everything.
    const rows = floor(REF.bg);
    const exempt = rows.filter((r) => !r.onGround).map((r) => r.role).sort();
    expect(exempt).toEqual(["badge-fg", "muted"]);
    for (const role of exempt) expect(NOT_ON_GROUND[role]).toBeTruthy();
    // Everything else is measured, and the floor is a named constant.
    expect(rows.filter((r) => r.onGround).length).toBe(rows.length - 2);
    expect(FLOOR).toBe(3);
  });
});

describe("the surface — the defects, on two disjoint axes", () => {
  test("a dimmed ink breaks the order and leaves legibility alone", () => {
    const v = surfaceVerdict(ATOM_ONE_DARK);
    expect(v.navigable).toBe(false);
    expect(v.crossed.map((r) => r.role)).toContain("heading");
    // The same pair is perfectly legible: this is the whole reason two readings
    // exist instead of one.
    expect(v.readable).toBe(true);
  });

  test("a light ground breaks legibility and leaves the order alone", () => {
    const v = surfaceVerdict(WHITE);
    expect(v.readable).toBe(false);
    expect(v.belowFloor.length).toBeGreaterThan(10);
    expect(v.belowFloor.map((r) => r.role)).toContain("heading");
    // And here is the false negative the brief was written for: nothing crosses,
    // so a crossing-only instrument would call this page fine.
    expect(v.navigable).toBe(true);
  });

  test("the verdict is a verdict: one pair, both flags, no partial answer", () => {
    for (const pair of [REF, ATOM_ONE_DARK, WHITE]) {
      const v = surfaceVerdict(pair);
      expect(typeof v.readable).toBe("boolean");
      expect(typeof v.navigable).toBe("boolean");
      expect(v.pair).toEqual(pair);
    }
  });
});

describe("the surface — the artefacts agree about the pair", () => {
  test("the Ghostty pasteable names the reference pair", () => {
    const conf = configFile();
    expect(conf).toContain(`${REF.bg} / ${REF.fg}`);
    expect(conf).toContain(REF.name.split(" — ")[0]!);
  });

  test("the Herdr theme emitter pins the same pair — two hosts, one value", () => {
    const themed = pinSurface({ background: "#21252b", foreground: "#abb2bf" }, { bg: REF.bg, fg: REF.fg });
    expect(themed.background).toBe(REF.bg);
    expect(themed.foreground).toBe(REF.fg);
    // And the pinned pair is the one the reading calls OK.
    expect(surfaceVerdict({ bg: themed.background, fg: themed.foreground! }).readable).toBe(true);
  });
});

describe("the surface — the pair is named, and the gate asks one question", () => {
  test("THE PAIR is the reference, so a reader does not need the rung table", () => {
    expect(PAIR).toEqual(referencePair());
    expect(referencePair(8)).toEqual(PAIR);
    // Another rung is a different judgement, not a different recommendation.
    expect(referencePair(4)).not.toEqual(PAIR);
  });

  test("surfaceFails is the gate: the recommended pair passes, the two defects do not", () => {
    expect(surfaceFails(surfaceVerdict(PAIR))).toBe(false);
    expect(surfaceFails(surfaceVerdict(ATOM_ONE_DARK))).toBe(true);
    expect(surfaceFails(surfaceVerdict(WHITE))).toBe(true);
  });
});

describe("the theme directory — two syntaxes, one reading", () => {
  const tmp = mkdtempSync(join(process.env.TMPDIR ?? "/tmp", "okuda-themes-"));

  test("a config-syntax theme (Ghostty) and a JSON theme (Herdr) read the same way", () => {
    const conf = join(tmp, "ghostty-style");
    const json = join(tmp, "herdr-style.json");
    writeFileSync(conf, [
      "# a comment",
      "palette = 0=#262427",
      "background = #1b1e24   # trailing comment",
      "foreground = #a9aeb8",
    ].join("\n"));
    writeFileSync(json, JSON.stringify({ background: "#1b1e24", foreground: "#a9aeb8", ansi: [] }));
    expect(themePair(conf)).toEqual({ bg: "#1b1e24", fg: "#a9aeb8" });
    expect(themePair(conf)).toEqual(themePair(json));
  });

  test("the directory census: worst ink first, unreadable reported not dropped", () => {
    const dir = mkdtempSync(join(tmp, "set-"));
    writeFileSync(join(dir, "good"), "background = #221f1c\nforeground = #d6cfc4\n");
    writeFileSync(join(dir, "broken"), "background = #ffffff\nforeground = #c0c0c0\n");
    writeFileSync(join(dir, "no-pair"), "accent = #ff0000\n");
    writeFileSync(join(dir, ".hidden"), "background = #000000\nforeground = #000000\n");
    const res = surfaceDir(dir);
    expect(res.rows.map((r) => r.name)).toEqual(["broken", "good"]); // worst ink first
    expect(res.noPair).toEqual(["no-pair"]);
    expect(res.rows[0]!.readable).toBe(false);
    expect(res.rows[1]!.readable).toBe(true);
    const text = surfaceDirText(res, referencePair());
    expect(text).toContain("1/2 cannot be read");
    expect(text).toContain("1/2 invert");
    // The 1.8:1 pair is broken before any foreign palette is in play.
    expect(res.rows[0]!.selfBroken).toBe(true);
    expect(res.rows[1]!.selfBroken).toBe(false);
    expect(text).toContain("1/2 cannot read anything");
  });
});

describe("the probe — what a machine's config actually states", () => {
  const { clue, includes } = require("../scripts/probe-surface") as typeof import("../scripts/probe-surface");

  test("three shorthands, one reader: ghostty, alacritty toml, kitty conf", () => {
    expect(clue("g", "background = #1d2021\nforeground = #d5c4a1\n").pair).toEqual({ bg: "#1d2021", fg: "#d5c4a1" });
    expect(clue("a", '[colors.primary]\nbackground = "#1d2021"\nforeground = "#d5c4a1"\n').pair).toEqual({
      bg: "#1d2021",
      fg: "#d5c4a1",
    });
    expect(clue("k", "background #1d2021\nforeground #d5c4a1\n").pair).toEqual({ bg: "#1d2021", fg: "#d5c4a1" });
  });

  test("a commented default states nothing — the kitty-template case", () => {
    const c = clue("k", "# background #000000\n# foreground #ffffff\n");
    expect(c.pair).toBeNull();
    expect(c.commented).toBe(2); // the menu is there; nothing is selected
  });

  test("an indented, uncommented pair is the real thing — the pasted-config case", () => {
    const c = clue("g", "   # background = #282c34\n   background = #221f1c\n   foreground = #d6cfc4\n");
    expect(c.pair).toEqual({ bg: "#221f1c", fg: "#d6cfc4" });
    expect(c.commented).toBe(1);
  });

  test("a JSON theme reads like the others", () => {
    expect(clue("h", JSON.stringify({ background: "#21252b", foreground: "#abb2bf" })).pair).toEqual({
      bg: "#21252b",
      fg: "#abb2bf",
    });
  });

  test("flatness is reported, because a non-flat ground makes the pair a bound", () => {
    const flat = clue("g", "background = #1d2021\nforeground = #d5c4a1\n");
    expect(flat.nonFlat).toEqual([]);
    const lucent = clue("g", "background = #1d2021\nforeground = #d5c4a1\nbackground-opacity = 0.9\n");
    expect(lucent.nonFlat.length).toBeGreaterThan(0);
  });

  test("a config that names another file is followed, because that is where the pair lives", () => {
    // Omarchy's `~/.config/ghostty/config` states no pair at all and includes a
    // file it regenerates on every theme switch. Reading only the config said
    // "inherits its terminal's defaults", which was wrong twice over: it does
    // inherit a pair, and that pair moves. Measured 2026-11-03.
    const ghostty = [
      '# Dynamic theme colors',
      'config-file = ?"~/.local/state/omarchy/current/theme/ghostty.conf"',
      "font-size = 12",
      '# config-file = "~/not-this-one"',
    ].join("\n");
    expect(includes(ghostty)).toEqual(["~/.local/state/omarchy/current/theme/ghostty.conf"]);
    // The `?"` is ghostty's "not an error if absent", not part of the path.
    expect(includes(ghostty)[0]!.startsWith("?")).toBe(false);
    // A bare quoted include reads the same way.
    expect(includes('config-file = "/etc/ghostty/theme"\n')).toEqual(["/etc/ghostty/theme"]);
    // And a config with no include has nothing to follow.
    expect(includes("background = #1d2021\n")).toEqual([]);
  });
});

describe("the surface gate — every admissible rung, not the recommended one", () => {
  const rows = gateRows(PAIRS, referencePair());

  test("the control passes first: the floor holds on every admissible rung", () => {
    // Nine admissible rungs, one refused (rung 7, glare — refused by its own
    // ground and corroborated by its rules). The gate fails on a rung whose floor
    // breaks, which is the drift this exists to catch.
    expect(rows.filter((r) => r.refused)).toHaveLength(1);
    expect(rows.filter((r) => !r.refused)).toHaveLength(9);
    expect(rows.every((r) => r.refused || r.verdict.readable)).toBe(true);
    expect(gateFails(rows)).toBe(false);
  });

  test("the inverted rungs are reported, not hidden and not gated", () => {
    // Measured 2026-11-04: the dimmer inks put accents above the prose. Those
    // inks are chosen and their cost is written into the ground page, so a red
    // build would be noise — but silence would be the confident wrong answer.
    const inverted = rows.filter((r) => !r.refused && !r.verdict.navigable).map((r) => r.n);
    expect(inverted).toEqual([3, 4, 5]);
    const text = gateText(rows, referencePair());
    expect(text).toContain("the order is inverted on rung(s) 3 (3), 4 (1), 5 (12)");
    expect(text).toContain("OK — the 3:1 floor holds on all 9 admissible rung(s)");
    // ...and the reference rung's order is still asserted.
    expect(rows.find((r) => r.n === REFERENCE_RUNG)!.verdict.navigable).toBe(true);
  });

  test("the report never contradicts its own verdict: no FAILS over a rung it passes", () => {
    // A sibling session read "3 · ink grey, evening only — FAILS" above an "OK"
    // line and nearly called the tree broken (2026-11-04). The heading now belongs
    // only to the failures the gate acts on.
    const text = gateText(rows, referencePair());
    expect(text).not.toContain("FAILS");
    expect(text).toContain("the order is inverted on rung(s) 3 (3), 4 (1), 5 (12)");
    // The floor failure names itself...
    const broken = gateRows([...PAIRS, { n: 99, name: "invented", bg: "#ffffff", fg: "#000000" }], referencePair());
    expect(gateText(broken, referencePair())).toContain("99 · invented — FAILS THE FLOOR");
    // ...and so does an inversion on the rung the gate does assert.
    const forged = rows.map((r) => (r.n === REFERENCE_RUNG ? { ...r, verdict: { ...r.verdict, navigable: false } } : r));
    expect(gateText(forged, referencePair())).toContain("FAILS THE ORDER (the recommended rung)");
  });

  test("the defect: a ground where the roles cannot be read fails the gate", () => {
    // The control had to pass before this. A light ground is the measured failure
    // (`just surface --bg '#ffffff'`: 16 of 21 roles under the floor), and it is a
    // rung that is NOT the reference one — which is the whole point of covering all
    // of them. Dimming the *ink* does not fail the floor: the floor is roles
    // against the ground, and the ink's cost is the order, tested separately.
    const broken = gateRows([...PAIRS, { n: 99, name: "invented", bg: "#ffffff", fg: "#000000" }], referencePair());
    expect(broken.find((r) => r.n === 99)!.verdict.readable).toBe(false);
    expect(gateFails(broken)).toBe(true);
  });

  test("the defect: an inverted order on the reference rung fails the gate", () => {
    // The other half of the requirement — the blown-out page on the ground okuda
    // actually recommends. Forged so the test does not depend on the palette.
    const forged = rows.map((r) =>
      r.n === REFERENCE_RUNG
        ? { ...r, verdict: { ...r.verdict, navigable: false } }
        : r,
    );
    expect(gateFails(forged)).toBe(true);
  });
});

/** ── Rex for Mac: the pair is two dereferences away ────────────────────────
 *  The control runs first here too: a theme in the app's own catalogue that
 *  states the reference pair must clear both readings before the resolver is
 *  believed about the light slot, which is the measured defect (`#fafafa` /
 *  `#333940`: 16 roles under the floor, `just surface`). The resolver is given
 *  text, never the machine's files, so these tests cannot pass by reading this
 *  Mac. */
const REX_CATALOG = JSON.stringify([
  { id: "control", name: "Control", appearance: "dark", source: { background: "#221f1c", foreground: "#d6cfc4" } },
  { id: "other", name: "Other", appearance: "dark", source: { background: "#0d1117", foreground: "#e6edf3" } },
]);

/** An XML property list with the keys Rex actually writes. `data` is wrapped the
 *  way a plist wraps it, so the whitespace stripping is exercised. */
function prefs(o: {
  darkThemeID?: string;
  lightThemeID?: string;
  customThemes?: unknown[];
  fade?: string;
  p3?: boolean;
}): string {
  const lines: string[] = [];
  const add = (k: string, v: string) => lines.push(`\t<key>${k}</key>\n\t${v}`);
  if (o.darkThemeID) add("Workspace.darkThemeID", `<string>${o.darkThemeID}</string>`);
  if (o.lightThemeID) add("Workspace.lightThemeID", `<string>${o.lightThemeID}</string>`);
  if (o.customThemes) {
    const b64 = Buffer.from(JSON.stringify(o.customThemes)).toString("base64").replace(/(.{60})/g, "$1\n\t");
    add("Workspace.customThemes", `<data>\n\t${b64}\n\t</data>`);
  }
  if (o.fade) add("Workspace.inactivePaneFadeMode", `<string>${o.fade}</string>`);
  if (o.p3 !== undefined) add("Workspace.terminalUsesDisplayP3", o.p3 ? "<true/>" : "<false/>");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<plist version="1.0">\n<dict>\n${lines.join("\n")}\n</dict>\n</plist>\n`;
}

/** A custom theme as Rex stores one: sRGB triples behind a P3 wrapper. */
function customTheme(id: string, name: string, bg: [number, number, number], fg: [number, number, number]) {
  const color = ([r, g, b]: [number, number, number]) => ({
    colorSpace: "display-p3",
    red: r,
    green: g,
    blue: b,
    alpha: 1,
    srgbFallback: { colorSpace: "srgb", red: r, green: g, blue: b, alpha: 1 },
  });
  return { id, name, appearance: "light", source: { manual: {} }, palette: { background: color(bg), foreground: color(fg) } };
}

describe("Rex for Mac — the pair is in the preferences, twice", () => {
  test("the control passes first: a catalogue theme stating the reference pair clears both readings", () => {
    const clues = rexClues(prefs({ darkThemeID: "control" }), REX_CATALOG);
    expect(clues.length).toBe(1);
    expect(clues[0]!.pair).toEqual({ bg: REF.bg, fg: REF.fg });
    const v = surfaceVerdict(clues[0]!.pair!);
    expect(v.readable).toBe(true);
    expect(v.navigable).toBe(true);
  });

  test("the defect: the light slot names a light pair, and that class fails", () => {
    const clues = rexClues(
      prefs({ darkThemeID: "other", lightThemeID: "custom-1", customThemes: [customTheme("custom-1", "Light one", [0.98, 0.98, 0.98], [0.2, 0.223529, 0.25098])] }),
      REX_CATALOG,
    );
    const light = clues.find((c) => c.path.includes("light appearance"))!;
    // srgbFallback is what the instrument judges: the hex, not the P3 components.
    expect(light.pair).toEqual({ bg: "#fafafa", fg: "#333940" });
    const v = surfaceVerdict(light.pair!);
    expect(v.readable).toBe(false);
    expect(v.navigable).toBe(false);
    // ...and the difference between the two slots is reported, not left to be discovered.
    expect(light.note).toContain("re-ranks");
  });

  test("an unresolvable theme is refused, not guessed", () => {
    const clues = rexClues(prefs({ darkThemeID: "not-installed" }), REX_CATALOG);
    expect(clues[0]!.pair).toBeNull();
    expect(clues[0]!.note).toContain("not guessed");
  });

  test("an absent catalogue does not read as an absent theme", () => {
    // A custom theme is resolvable without the bundle; a shipped id is not, and the
    // two must not be confused when the app is not installed.
    const own = customTheme("custom-2", "Mine", [0.13, 0.12, 0.11], [0.84, 0.81, 0.77]);
    expect(rexClues(prefs({ darkThemeID: "custom-2", customThemes: [own] }), null)[0]!.pair).toEqual({
      bg: "#211f1c",
      fg: "#d6cfc4",
    });
    expect(rexClues(prefs({ darkThemeID: "control" }), null)[0]!.pair).toBeNull();
  });

  test("the fade and the colour space are reported as facts about the host", () => {
    const faded = rexClues(prefs({ darkThemeID: "control", fade: "both", p3: true }), REX_CATALOG)[0]!;
    expect(faded.nonFlat.join()).toContain("inactive panes faded (both)");
    expect(faded.note).toContain("Display P3");
    const clean = rexClues(prefs({ darkThemeID: "control", fade: "none", p3: false }), REX_CATALOG)[0]!;
    expect(clean.nonFlat).toEqual([]);
    expect(clean.note).toBeUndefined();
  });

  test("plistValue reads the four types a preference here can be", () => {
    expect(plistValue(prefs({ darkThemeID: "merino-dark" }), "Workspace.darkThemeID")).toBe("merino-dark");
    expect(plistValue(prefs({ p3: true }), "Workspace.terminalUsesDisplayP3")).toBe("true");
    expect(plistValue('<key>k</key>\n<integer>0</integer>', "k")).toBe("0");
    expect(plistValue('<key>k</key>\n<data>\nYWJj\nZGVm\n</data>', "k")).toBe("YWJjZGVm");
    expect(plistValue("<dict></dict>", "k")).toBeNull();
  });

  test("hexOf prefers the sRGB declaration, which is the space the instrument measures", () => {
    expect(hexOf("#0d1117")).toBe("#0d1117");
    expect(hexOf("0D1117")).toBe("#0d1117");
    expect(hexOf({ red: 1, green: 1, blue: 1 })).toBe("#ffffff");
    expect(hexOf({ red: 0.9804, green: 0.2, blue: 0.2235, srgbFallback: { red: 1, green: 1, blue: 1 } })).toBe("#ffffff");
    expect(hexOf("not a colour")).toBeNull();
    expect(hexOf(undefined)).toBeNull();
  });
});

describe("probe-surface — Herdr's pair is a file, so the probe dereferences it", () => {
  const theme = (bg: string, fg: string, slots = 16) =>
    JSON.stringify({ background: bg, foreground: fg, cursor: fg, ansi: Array(slots).fill("#000000") });

  test("a theme with 16 slots is read as carried, not derived", () => {
    const [c] = herdrClues(null, [{ path: ".config/herdr-app/themes/gloam.json", text: theme("#221f1c", "#d6cfc4") }]);
    expect(c!.pair).toEqual({ bg: "#221f1c", fg: "#d6cfc4" });
    expect(c!.note).toContain("16 ANSI slots");
    expect(c!.note).toContain("no `theme` key in settings.json");
  });

  test("a three-key pin says so: the slot count is the Rex failure made visible", () => {
    const [c] = herdrClues(null, [{ path: ".config/herdr-app/themes/probe.json", text: theme("#f000c8", "#7cfc00", 0) }]);
    expect(c!.note).toContain("0 ANSI slot(s)");
    expect(c!.note).toContain("may refuse to derive a palette");
  });

  test("the note says which source names a theme, strongest first", () => {
    const settings = JSON.stringify({ theme: "gloam", appearance: "dark" });
    const clues = herdrClues(
      settings,
      [
        { path: ".config/herdr-app/themes/gloam.json", text: theme("#221f1c", "#d6cfc4") },
        { path: ".config/herdr-app/themes/win98.json", text: theme("#ffffff", "#c0c0c0") },
      ],
      // a layout look wins over settings.json, so it is named first and by name
      [herdrLayoutLook("main", JSON.stringify({ theme: { light: "paper", dark: "gloam" } }))],
    );
    const gloam = clues.find((c) => c.path.endsWith("gloam.json"))!;
    const win98 = clues.find((c) => c.path.endsWith("win98.json"))!;
    expect(gloam.note).toContain("in force: layout look main (dark)");
    expect(gloam.note).toContain("settings.json names it (a layout look still wins)");
    expect(win98.note).toContain("nothing names it");
  });

  test("a malformed settings file is a reading, not a crash", () => {
    const [c] = herdrClues("{ not json", [{ path: ".config/herdr-app/themes/gloam.json", text: theme("#221f1c", "#d6cfc4") }]);
    expect(c!.pair).toEqual({ bg: "#221f1c", fg: "#d6cfc4" });
    expect(c!.note).toContain("no `theme` key");
  });
});

describe("herdr-theme — every flag reaches the script", () => {
  // Found 2026-11-13: `argAfter` was defined as (argv, flag) and called as
  // `argAfter("--rung")`, so every flag was silently ignored — the tool always
  // pinned the reference rung. `--install` still worked, because it is a boolean
  // read from `argv.includes`. A flag that is accepted and ignored is a knob
  // that lies, so the test runs the script rather than the parser.
  const run = (args: string[]) =>
    JSON.parse(
      Bun.spawnSync(["bun", "scripts/herdr-theme.ts", ...args], {
        stdout: "pipe",
        stderr: "pipe",
      }).stdout.toString(),
    ) as { background: string; foreground: string };

  test("--rung 4 pins rung 4's pair, not the reference pair", () => {
    const t = run(["--rung", "4"]);
    expect(t.background).toBe(PAIRS[4]!.bg);
    expect(t.foreground).toBe(PAIRS[4]!.fg);
  });

  test("--bg/--fg override the rung, hex and hash intact through the shell", () => {
    const t = run(["--bg", "#F000C8", "--fg", "#7CFC00"]);
    expect(t.background).toBe("#F000C8");
    expect(t.foreground).toBe("#7CFC00");
  });
});

describe("herdr-theme — --install names its target, and never guesses one", () => {
  test("a name resolves inside themes/, a path is taken as given", () => {
    expect(resolveTarget("probe-loud", "/themes")).toBe(join("/themes", "probe-loud.json"));
    expect(resolveTarget("/tmp/x.json", "/themes")).toBe("/tmp/x.json");
  });

  test("a bare --install refuses instead of overwriting the standing theme", () => {
    const r = Bun.spawnSync(["bun", "scripts/herdr-theme.ts", "--install"], {
      stdout: "pipe",
      stderr: "pipe",
    });
    expect(r.exitCode).toBe(2);
    expect(r.stderr.toString()).toContain("--install needs a target");
  });
});

describe("herdr-theme — the selection is the layout's look, not settings.json", () => {
  const state = JSON.stringify({ theme: { light: "paper", dark: "gloam" }, nodes: { sidebar: 1 } });

  test("--select both sets both slots and carries every other key through", () => {
    const out = JSON.parse(selectInLayout(state, "probe-loud", "both"));
    expect(out.theme).toEqual({ light: "probe-loud", dark: "probe-loud" });
    expect(out.nodes).toEqual({ sidebar: 1 });
  });

  test("--select dark leaves the light look alone", () => {
    const out = JSON.parse(selectInLayout(state, "probe-loud", "dark"));
    expect(out.theme).toEqual({ light: "paper", dark: "probe-loud" });
  });

  test("the hint names the layout, because settings.json is overridden by it", () => {
    expect(selectionHint("gloam")).toContain("--select gloam --layout main");
    expect(selectionHint("gloam")).toContain("beats settings.json");
  });
});
