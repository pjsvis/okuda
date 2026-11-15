#!/usr/bin/env bun
// ── probe-surface.ts — what pair is this machine actually using? ───────
//
//  The instrument so far judges a pair you hand it. On an unknown machine you do
//  not know which pair to hand it, or where it came from, or whether the ground
//  is even flat. This probe answers that, and it answers it the only way that
//  keeps one derivation: **the machine supplies its files, the instrument here
//  judges them.**
//
//  Nothing is executed remotely and nothing is written anywhere. The remote side
//  is `cat`; parsing, ranking and verdicts happen locally, in `contrast.ts`, which
//  is already gated. A probe that reimplemented the reading on the far side would
//  be a second derivation, and the two would drift.
//
//  What it reports, per config file found:
//    the pair it sets, and both readings — readable (the floor) and navigable (the order)
//  and, per file, whether the ground is FLAT: opacity, blur, or a background image
//  make the effective ground a range rather than a value, so the pair becomes a bound
//  (docs/ideas.md, `translucent-ground`).
//
//  **Rex for Mac states its pair in no config file.** It names a theme in two
//  preferences (`Workspace.darkThemeID`, `Workspace.lightThemeID`), and the theme
//  is either shipped inside the app bundle or carried in `Workspace.customThemes`
//  as NSData-wrapped JSON. So the pair is two dereferences away and both are
//  supplied by the machine — the prefs plist and the app's own theme catalogue
//  (`rexClues`). Two further preferences re-rank whatever it names: an
//  inactive-pane fade makes the ground a range, and Display P3 changes the colour
//  the hex is read as. Both are reported, neither is judged here.
//
//  Rex's per-block `com.superlogical.terminal.set_theme` is **not read here**
//  because it cannot be read anywhere: the method is accepted and inert in
//  Rex Beta 0.1.0, and the terminal answers no OSC 10/11 query (`td-855e0d`).
//  A theme named in the preferences is the only pair Rex can be asked for.
//
//  Usage:
//    bun scripts/probe-surface.ts                  # this machine
//    bun scripts/probe-surface.ts host             # over ssh, read-only
//    bun scripts/probe-surface.ts host --json
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { PAIR, surfaceText, surfaceVerdict, FLOOR, floor } from "./contrast";

/** The config files terminals actually read. Extensionless ones are config
 *  syntax; `.toml` is alacritty's. Unknown terminals get their own line here. */
export const CANDIDATES = [
  ".config/ghostty/config",
  ".config/alacritty/alacritty.toml",
  ".config/alacritty/alacritty.yml",
  ".config/kitty/kitty.conf",
  ".config/wezterm/wezterm.lua",
  // macOS puts Ghostty's config under Application Support, not XDG — and names
  // the file `config.ghostty`, which is the one a Mac install actually has.
  "Library/Application Support/com.mitchellh.ghostty/config",
  "Library/Application Support/com.mitchellh.ghostty/config.ghostty",
  // Herdr's themes are a directory; `just themes` audits those.
];

/** Rex for Mac keeps its pair in the app's preferences, not in a dotfile: two
 *  theme IDs, and the themes themselves in the bundle or in `customThemes`. */
export const REX_PREFS = "Library/Preferences/com.superlogical.rex.plist";

/** Herdr's themes are a directory of JSON files, and its selection is a key in
 *  `settings.json` — the one host on this desk whose pair is a file readable
 *  without asking the app anything. */
export const HERDR_THEMES = ".config/herdr-app/themes";
export const HERDR_SETTINGS = ".config/herdr-app/settings.json";
/** The selection, and it is neither `settings.json` nor the picker: each shown
 *  layout carries its own look — `{"theme": {"light": ..., "dark": ...}}` — and
 *  the name resolves to `themes/<name>.json`. Found 2026-11-13 after a picker
 *  search came up empty; the earlier hint (settings.json) was a claim, not a
 *  reading. */
export const HERDR_LAYOUT_STATE = ".config/herdr-app/layouts/.state";

/** The app bundles that ship a theme catalogue, in the order to try them. Rex is
 *  in beta, so the bundle is named for the channel; both are read for the same
 *  reason the terminal list above is a list. */
export const REX_CATALOGS = [
  "/Applications/Rex Beta.app/Contents/Resources/SuperUI_SuperDesignTokens.bundle/Contents/Resources/themes.json",
  "/Applications/Rex.app/Contents/Resources/SuperUI_SuperDesignTokens.bundle/Contents/Resources/themes.json",
  join(homedir(), "Applications/Rex Beta.app/Contents/Resources/SuperUI_SuperDesignTokens.bundle/Contents/Resources/themes.json"),
  join(homedir(), "Applications/Rex.app/Contents/Resources/SuperUI_SuperDesignTokens.bundle/Contents/Resources/themes.json"),
];

/** The flatness keys: any of these and the ground is a range, not a value. */
const NOT_FLAT = /(background[-_]opacity|background[-_]blur|background[-_]image|opacity\s*=|blur\s*=)/i;

export interface Clue {
  path: string;
  pair: { bg: string; fg: string } | null;
  /** Keys that make the effective ground a range. Empty means flat. */
  nonFlat: string[];
  /** A fact about the host that changes how the pair should be read without
   *  being a second pair — a colour space, or an appearance slot that moves it.
   *  Printed under the reading; never a verdict of its own. */
  note?: string;
  /** `background`/`foreground` lines present but commented: the menu with nothing
   *  selected. The most common state of a machine somebody has "done something"
   *  to and cannot remember what. */
  commented: number;
}

/** One config file, read for the pair and the flatness. Pure. Handles the three
 *  shorthands the terminals use: `key = "#rrggbb"` (ghostty, alacritty toml),
 *  `key #rrggbb` (kitty), and JSON (a Herdr theme). */
export function clue(path: string, text: string): Clue {
  const nonFlat = [...text.matchAll(new RegExp(NOT_FLAT.source, "gi"))].map((m) => m[1] ?? m[0]);
  let bg: string | null = null;
  let fg: string | null = null;
  if (text.trimStart().startsWith("{")) {
    try {
      const j = JSON.parse(text) as { background?: string; foreground?: string };
      bg = j.background ?? null;
      fg = j.foreground ?? null;
    } catch {
      /* a malformed theme is a reading, not a crash */
    }
  } else {
    for (const line of text.split("\n")) {
      if (/^\s*#/.test(line)) continue;
      const m = line.match(/^\s*[#\w.\-]*(background|foreground)\s*[=: ]\s*"?#([0-9a-fA-F]{6})"?/i);
      if (!m) continue;
      const key = m[1]!.toLowerCase();
      if (key === "background" && bg === null) bg = `#${m[2]!.toLowerCase()}`;
      if (key === "foreground" && fg === null) fg = `#${m[2]!.toLowerCase()}`;
    }
  }
  const commented = text
    .split("\n")
    .filter((l) => /^\s*#\s*(background|foreground)\s*[=: ]/.test(l)).length;
  return { path, pair: bg && fg ? { bg, fg } : null, nonFlat: [...new Set(nonFlat)], commented };
}

/** Read one candidate locally, or over ssh. Absent files are absent, not errors. */
function readOne(target: string | null, rel: string): string | null {
  const home = homedir();
  if (target === null) {
    const p = join(home, rel);
    if (!existsSync(p)) return null;
    // A directory (Herdr's `themes/`) is audited by `just themes`, not here.
    try {
      return readFileSync(p, "utf8");
    } catch {
      return null;
    }
  }
  try {
    return execFileSync("ssh", [target, `cat "$HOME/${rel}" 2>/dev/null`], { encoding: "utf8" }) || null;
  } catch {
    return null;
  }
}

/** A ghostty `config-file` line names another file, and on a theming-first
 *  desktop that is where the pair actually lives: Omarchy's `~/.config/ghostty/config`
 *  states none, and a regenerated theme file behind an include supplies one.
 *  Reads the directive only — expansion and existence are the caller's business,
 *  because a missing optional include is a fact about the host, not an error.
 *  `?"path"` is ghostty's "not an error if absent", so the `?` is dropped and the
 *  quotes with it. */
export function includes(text: string): string[] {
  const out: string[] = [];
  for (const line of text.split("\n")) {
    if (/^\s*#/.test(line)) continue;
    const m = line.match(/^\s*config-file\s*=\s*\??\s*"?([^"]+?)"?\s*$/);
    if (m?.[1]) out.push(m[1]);
  }
  return out;
}

/** Read an absolute or `~/` path locally, or over ssh. Absent is absent. */
function readPath(target: string | null, path: string): string | null {
  if (path.startsWith("~/") && target !== null) {
    try {
      return execFileSync("ssh", [target, `cat "$HOME/${path.slice(2)}" 2>/dev/null`], { encoding: "utf8" }) || null;
    } catch {
      return null;
    }
  }
  const local = path.startsWith("~/") ? join(homedir(), path.slice(2)) : path;
  if (target === null) {
    try {
      return existsSync(local) ? readFileSync(local, "utf8") : null;
    } catch {
      return null;
    }
  }
  try {
    return execFileSync("ssh", [target, `cat "${path}" 2>/dev/null`], { encoding: "utf8" }) || null;
  } catch {
    return null;
  }
}

// ── Rex for Mac: two dereferences to a pair ──────────────────────────────────

/** A theme in either shape Rex stores: shipped (`source.background` is a hex) or
 *  custom (`palette.background` is an sRGB triple, with a Display-P3 sibling). */
export interface RexTheme {
  id?: string;
  name?: string;
  appearance?: string;
  source?: { background?: unknown; foreground?: unknown };
  palette?: { background?: unknown; foreground?: unknown };
}

/** One value out of an XML property list, as text. The four types a preference
 *  here can be: `string`, `data`, `true`/`false`, and `integer`. A `data` value
 *  is base64 with the plist's own line breaks in it, so the whitespace goes.
 *  Pure, so the shapes are unit-tested without a file. */
export function plistValue(xml: string, key: string): string | null {
  const at = xml.indexOf(`<key>${key}</key>`);
  if (at < 0) return null;
  const rest = xml.slice(at + key.length + "<key></key>".length);
  const typed = rest.match(/^\s*<(string|data|integer|real)>([\s\S]*?)<\/\1>/);
  if (typed) return typed[1] === "data" ? typed[2]!.replace(/\s+/g, "") : typed[2]!;
  const bool = rest.match(/^\s*<(true|false)\s*\/>/);
  return bool ? bool[1]! : null;
}

/** A colour as Rex stores it → `#rrggbb`, or null. Accepts a hex string (the
 *  shipped catalogue), an sRGB triple (a custom theme's `palette`), and the
 *  P3-wrapped form whose `srgbFallback` is the honest reading: this instrument
 *  measures sRGB, so the sRGB declaration is what it judges. */
export function hexOf(color: unknown): string | null {
  if (typeof color === "string") {
    const m = color.match(/^#?([0-9a-f]{6})$/i);
    return m ? `#${m[1]!.toLowerCase()}` : null;
  }
  if (color && typeof color === "object") {
    const c = color as { srgbFallback?: unknown; red?: number; green?: number; blue?: number };
    if (c.srgbFallback !== undefined) return hexOf(c.srgbFallback);
    if ([c.red, c.green, c.blue].every((v) => typeof v === "number")) {
      return `#${[c.red!, c.green!, c.blue!]
        .map((v) => Math.round(Math.min(1, Math.max(0, v)) * 255).toString(16).padStart(2, "0"))
        .join("")}`;
    }
  }
  return null;
}

/** A theme's pair, in either shape. Null when it states neither. */
export function rexThemePair(t: RexTheme): { bg: string; fg: string } | null {
  const bg = hexOf(t.source?.background) ?? hexOf(t.palette?.background);
  const fg = hexOf(t.source?.foreground) ?? hexOf(t.palette?.foreground);
  return bg && fg ? { bg, fg } : null;
}

/** One shipped theme, by id, out of the app's catalogue. Null when the catalogue
 *  is absent, malformed, or does not carry the id — an unresolvable theme is not
 *  guessed at. */
export function rexCatalogTheme(catalogJson: string | null, id: string): RexTheme | null {
  if (!catalogJson) return null;
  try {
    const arr = JSON.parse(catalogJson) as RexTheme[];
    return Array.isArray(arr) ? (arr.find((t) => t.id === id) ?? null) : null;
  } catch {
    return null;
  }
}

/** The custom themes, out of the prefs. Rex stores them as NSData, which the XML
 *  plist shows as base64-wrapped JSON — the same array shape as the catalogue,
 *  with `palette` instead of `source`. */
export function rexCustomThemes(prefsXml: string): RexTheme[] {
  const b64 = plistValue(prefsXml, "Workspace.customThemes");
  if (!b64) return [];
  try {
    const arr = JSON.parse(Buffer.from(b64, "base64").toString("utf8")) as RexTheme[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

/** Rex's pair, per appearance slot, as clues the same reading judges. Two slots
 *  and not one, because they are two pairs and the difference between them is a
 *  finding: an appearance switch moves the ink with no document having changed.
 *  Pure — the plist text and the catalogue text in, clues out. */
export function rexClues(prefsXml: string, catalogJson: string | null): Clue[] {
  const custom = rexCustomThemes(prefsXml);
  const fade = plistValue(prefsXml, "Workspace.inactivePaneFadeMode");
  const p3 = plistValue(prefsXml, "Workspace.terminalUsesDisplayP3") === "true";
  const slots: [string, string][] = [
    ["Workspace.darkThemeID", "dark"],
    ["Workspace.lightThemeID", "light"],
  ];

  const resolved = slots.map(([key, appearance]) => {
    const id = plistValue(prefsXml, key);
    if (!id) return null;
    const shipped = rexCatalogTheme(catalogJson, id);
    const own = custom.find((t) => t.id === id) ?? null;
    const theme = shipped ?? own;
    return { key, appearance, id, theme, pair: theme ? rexThemePair(theme) : null };
  });
  const pairs = resolved.filter((r) => r?.pair).map((r) => r!.pair!);
  const moved = pairs.length > 1 && pairs.some((p) => p.bg !== pairs[0]!.bg || p.fg !== pairs[0]!.fg);

  const out: Clue[] = [];
  for (const r of resolved) {
    if (!r) continue;
    const notes: string[] = [];
    if (!r.theme) {
      notes.push(
        `theme \"${r.id}\" resolves in neither the app catalogue nor Workspace.customThemes — not guessed`,
      );
    }
    if (moved) {
      notes.push(
        `the two appearance slots name different pairs (dark ${pairs[0]!.bg} / light ${pairs[pairs.length - 1]!.bg}) — an appearance switch re-ranks the page`,
      );
    }
    if (p3) {
      notes.push(
        "hexes are read as Display P3 (terminalUsesDisplayP3) — this judges the sRGB declaration, not the painted colour",
      );
    }
    out.push({
      path: `rex · ${r.appearance} appearance · ${r.theme?.name ?? r.id} (${r.key.replace("Workspace.", "")})`,
      pair: r.pair,
      nonFlat: fade && fade !== "none" ? [`inactive panes faded (${fade})`] : [],
      commented: 0,
      ...(notes.length > 0 ? { note: notes.join("; ") } : {}),
    });
  }
  return out;
}

/** The prefs, as XML, by asking `plutil` to convert them. Not read directly: the
 *  file is binary and carries NSData, which no JSON conversion will take. Absent
 *  on any machine without Rex, which is absent, not an error. */
/** Herdr's themes, as the same reading. Two facts per theme that the pair alone
 *  does not carry: whether it is *selected* (a key in `settings.json`, absent
 *  when the picker was used), and whether it carries the 16 ANSI slots. A pin
 *  carries three keys and sixteen slots — the slots are what Rex's own entry
 *  lacked when its selection was dropped, so the count is printed, not inferred.
 *  Pure: the settings text and the theme files in, clues out. */
export function herdrLayoutLook(
  layout: string,
  text: string,
): { layout: string; light: string | null; dark: string | null } {
  try {
    const j = JSON.parse(text) as { theme?: { light?: string; dark?: string } };
    return { layout, light: j.theme?.light ?? null, dark: j.theme?.dark ?? null };
  } catch {
    return { layout, light: null, dark: null };
  }
}

export function herdrClues(
  settings: string | null,
  themes: { path: string; text: string }[],
  looks: { layout: string; light: string | null; dark: string | null }[] = [],
): Clue[] {
  let selected: string | null = null;
  if (settings) {
    try {
      const j = JSON.parse(settings) as { theme?: string };
      selected = typeof j.theme === "string" ? j.theme : null;
    } catch {
      /* a malformed settings file is a reading, not a crash */
    }
  }
  const out: Clue[] = [];
  for (const t of themes) {
    const c = clue(t.path, t.text);
    let ansi = 0;
    try {
      const j = JSON.parse(t.text) as { ansi?: unknown[] };
      ansi = Array.isArray(j.ansi) ? j.ansi.length : 0;
    } catch {
      /* counted as zero */
    }
    const notes: string[] = [];
    const named = t.path.split("/").pop()!.replace(/\.json$/, "");
    const selectedBy = looks.flatMap((l) =>
      [
        l.dark === named ? `${l.layout} (dark)` : null,
        l.light === named ? `${l.layout} (light)` : null,
      ].filter((x): x is string => x !== null),
    );
    // Three sources, in the order they win: the layout's look, then
    // `settings.json`, then nothing. Reported in that order so a reader cannot
    // mistake the weakest for the strongest.
    if (selectedBy.length > 0) notes.push(`in force: layout look ${selectedBy.join(", ")}`);
    if (selected === named) notes.push("settings.json names it (a layout look still wins)");
    if (selectedBy.length === 0 && selected !== named) {
      notes.push(
        selected === null && looks.length === 0
          ? "no `theme` key in settings.json and no layout state to read — nothing names it"
          : "nothing names it: not a layout look, not settings.json",
      );
    }
    notes.push(
      ansi === 16
        ? "16 ANSI slots, so the palette is carried, not derived"
        : `${ansi} ANSI slot(s) — a pin carries 16; the host may refuse to derive a palette from three keys`,
    );
    out.push({ ...c, note: notes.join("; ") });
  }
  return out;
}

/** Herdr's theme files, read locally or over ssh. A directory, not a file —
 *  which is why it is not in `CANDIDATES`. */
function readHerdrThemes(target: string | null): { path: string; text: string }[] {
  const home = homedir();
  const list = (): string[] => {
    try {
      if (target === null) {
        const dir = join(home, HERDR_THEMES);
        if (!existsSync(dir)) return [];
        return readdirSync(dir).filter((f) => f.endsWith(".json"));
      }
      const raw = execFileSync("ssh", [target, `ls "$HOME/${HERDR_THEMES}" 2>/dev/null`], {
        encoding: "utf8",
      });
      return raw.split("\n").filter((f) => f.endsWith(".json"));
    } catch {
      return [];
    }
  };
  return list()
    .map((name) => ({ path: `${HERDR_THEMES}/${name}`, text: readOne(target, `${HERDR_THEMES}/${name}`) }))
    .filter((t): t is { path: string; text: string } => typeof t.text === "string" && t.text !== "");
}

/** Each shown layout's look, read from `layouts/.state/*.json`. */
function readHerdrLooks(
  target: string | null,
): { layout: string; light: string | null; dark: string | null }[] {
  const home = homedir();
  const list = (): string[] => {
    try {
      if (target === null) {
        const dir = join(home, HERDR_LAYOUT_STATE);
        if (!existsSync(dir)) return [];
        return readdirSync(dir).filter((f) => f.endsWith(".json"));
      }
      const raw = execFileSync("ssh", [target, `ls "$HOME/${HERDR_LAYOUT_STATE}" 2>/dev/null`], {
        encoding: "utf8",
      });
      return raw.split("\n").filter((f) => f.endsWith(".json"));
    } catch {
      return [];
    }
  };
  return list()
    .map((f) => ({
      name: f.replace(/\.json$/, ""),
      text: readOne(target, `${HERDR_LAYOUT_STATE}/${f}`),
    }))
    .filter((l): l is { name: string; text: string } => typeof l.text === "string" && l.text !== "")
    .map((l) => herdrLayoutLook(l.name, l.text));
}

function readRexPrefs(target: string | null): string | null {
  if (target !== null) return null; // a Mac app's prefs are local to the Mac
  const path = join(homedir(), REX_PREFS);
  if (!existsSync(path)) return null;
  try {
    return execFileSync("plutil", ["-convert", "xml1", "-o", "-", path], { encoding: "utf8" });
  } catch {
    return null;
  }
}

function readRexCatalog(): string | null {
  for (const path of REX_CATALOGS) {
    if (!existsSync(path)) continue;
    try {
      return readFileSync(path, "utf8");
    } catch {
      /* an unreadable bundle is absent for this purpose */
    }
  }
  return null;
}

function main(argv: string[]): number {
  const asJson = argv.includes("--json");
  const target = argv.find((a) => !a.startsWith("--")) ?? null;
  const clues: Clue[] = [];
  for (const rel of CANDIDATES) {
    const text = readOne(target, rel);
    // A file that exists and states no pair is a reading too: that machine inherits
    // its terminal's defaults, which is the most common state in the world.
    if (text === null || text === "") continue;
    clues.push(clue(rel, text));
    // ...and a file that names another file is not stating a pair either. The
    // include is followed **one level only**, which is what bounds a cycle: the
    // included file is never scanned for includes of its own, so a config that
    // names itself is read twice (a duplicate line) and cannot loop.
    // include is followed, because that is where a re-theming desktop puts it;
    // "inherits its terminal's defaults" was wrong on Omarchy for exactly this
    // reason (measured 2026-11-03).
    for (const inc of includes(text)) {
      const child = readPath(target, inc);
      if (child !== null && child !== "") clues.push(clue(`${rel} → ${inc}`, child));
    }
  }

  clues.push(
    ...herdrClues(readOne(target, HERDR_SETTINGS), readHerdrThemes(target), readHerdrLooks(target)),
  );

  const prefs = readRexPrefs(target);
  if (prefs !== null) clues.push(...rexClues(prefs, readRexCatalog()));

  const rows = clues.map((c) => ({
    ...c,
    verdict: c.pair ? surfaceVerdict(c.pair, PAIR) : null,
  }));

  if (asJson) {
    console.log(JSON.stringify({ target: target ?? "this machine", reference: PAIR, clues: rows }, null, 2));
    return 0;
  }

  console.log(`probe — ${target ?? "this machine"}   reference ${PAIR.bg} / ${PAIR.fg}\n`);
  if (rows.length === 0) {
    console.log("no terminal config found in the usual places — nothing to read, which is itself the reading:");
    console.log("a machine with no stated pair is using whatever its terminal ships.");
    return 0;
  }
  for (const r of rows) {
    if (!r.pair || !r.verdict) {
      console.log(
        `${r.path}\n  present, no pair stated — this machine inherits its terminal's defaults` +
          (r.commented > 0 ? `\n  ${r.commented} commented pair line(s): the menu is there, nothing is selected` : ""),
      );
      continue;
    }
    const v = r.verdict;
    const below = floor(r.pair.bg).filter((f) => f.onGround && f.ratio < FLOOR).length;
    console.log(
      `${r.path}\n  pair ${r.pair.bg} / ${r.pair.fg}   ink ${v.ink.toFixed(1)}:1` +
        `   ${v.readable ? "readable" : `NOT readable (${below})`} · ${v.navigable ? "navigable" : `NOT navigable (${v.crossed.length})`}`,
    );
    if (r.nonFlat.length > 0) {
      console.log(`  ground is NOT FLAT: ${r.nonFlat.join(", ")} — the pair is a bound, not a fact`);
    }
    if (r.note) console.log(`  note: ${r.note}`);
    if (!v.readable || !v.navigable) console.log(surfaceText(v, PAIR).split("\n").filter((l) => l.startsWith("  ")).join("\n"));
  }
  return 0;
}

if (import.meta.main) process.exit(main(process.argv.slice(2)));
