#!/usr/bin/env bun
// ── herdr-theme.ts — a host theme for Gloam, pinned to the dogfooded pair ──
//
//  The problem it fixes (measured 2026-11-01): okuda's palette is a *ranking*
//  expressed as ratios against the ink, and prose ships empty so the host
//  supplies the ink (`src/palette.ts:17-20`). Herdr's UI takes that ink from
//  `themes/<name>.json`, so a theme's default foreground silently re-ranks every
//  document — atom-one-dark's `#abb2bf` puts twelve roles above the prose they
//  annotate. The renderer cannot fix this: it cannot see the surface
//  (`ADR-GLASS-INK-073`). So the fix belongs here, in the host's own file, and it
//  is one value: the ink.
//
//  **The tool pins the surface, not the palette.** It copies the theme you
//  already have and rewrites only `background`, `foreground` and `cursor`, so the
//  ANSI colours every other program in that pane uses are left alone. A tool
//  that replaced the sixteen slots would be deciding things it has no evidence
//  about.
//
//  Usage:
//    bun scripts/herdr-theme.ts                        # the theme JSON, on stdout
//    bun scripts/herdr-theme.ts --rung 4               # another dogfooded pair
//    bun scripts/herdr-theme.ts --bg '#23272e' --fg '#c8ccd4'
//    bun scripts/herdr-theme.ts --explain              # the ranking before/after
//    bun scripts/herdr-theme.ts --install              # write it, and say where
//
//  `--install` writes a copy into the host's config directory. That is a
//  crossing (`AGENTS.md`, the seam rule): the file prints what it wrote, where,
//  and that the receiver owns it. Nothing selects the theme — picking it is the
//  person's act, and `--install` prints the settings line that does it.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { basename, join } from "node:path";
import { compareRanking, compareText, PAIR, referencePair } from "./contrast";

export interface HostTheme {
  background: string;
  foreground: string;
  cursor?: string;
  selection?: string;
  ansi?: string[];
  colors?: Record<string, string>;
  [k: string]: unknown;
}

/** Herdr's own default, and the one that produced the finding. */
export const THEMES_DIR = join(homedir(), ".config", "herdr-app", "themes");
export const DEFAULT_SOURCE = join(THEMES_DIR, "atom-one-dark.json");
export const DEFAULT_TARGET = join(THEMES_DIR, "gloam.json");

/** Where `--install` writes. A **name** resolves inside `themes/`, so the command
 *  stays short enough not to wrap; a path is taken as given. There is no silent
 *  default: a bare `--install` used to overwrite `gloam.json`, which is how a
 *  wrapped line put a magenta probe into the standing theme (2026-11-13). */
export const resolveTarget = (value: string, dir: string = THEMES_DIR): string =>
  value.includes("/") ? value : join(dir, `${value}.json`);

/** The theme with its surface pinned. Pure: a source theme and a pair in, a
 *  theme out. Only the three surface keys move; everything else is carried
 *  through untouched, which is what makes this a pin and not a redesign. */
export function pinSurface(source: HostTheme, pair: { bg: string; fg: string }): HostTheme {
  return { ...source, background: pair.bg, foreground: pair.fg, cursor: pair.fg };
}

/** Where the selection actually lives. **Not** `settings.json`: each shown layout
 *  carries its own look — `{"theme": {"light": …, "dark": …}}` — and a layout look
 *  wins over `settings.json`, which wins over nothing. Measured 2026-11-13 by
 *  reading `layouts/.state/main.json`; the earlier `settings.json` hint was a
 *  claim and the picker showed nothing for it, which is the same failure twice. */
export const layoutStatePath = (layout: string): string =>
  join(homedir(), ".config", "herdr-app", "layouts", ".state", `${layout}.json`);

export function selectionHint(name: string, layout = "main"): string {
  return `select it: --select ${name} --layout ${layout}   (a layout look beats settings.json, so settings.json alone changes nothing)`;
}

/** The layout state with its look pointed at a theme. Pure: other keys are
 *  carried through, including sizes and the tree. */
export function selectInLayout(
  stateText: string,
  name: string,
  appearance: "dark" | "light" | "both" = "both",
): string {
  const j = JSON.parse(stateText) as Record<string, unknown>;
  const theme = (j.theme as { light?: string; dark?: string } | undefined) ?? {};
  if (appearance === "both") {
    j.theme = { ...theme, light: name, dark: name };
  } else {
    j.theme = { ...theme, [appearance]: name };
  }
  return JSON.stringify(j, null, 2) + "\n";
}

function argAfter(argv: string[], flag: string): string | undefined {
  const i = argv.indexOf(flag);
  return i >= 0 ? argv[i + 1] : undefined;
}

function main(argv: string[]): number {
  const sourcePath = argAfter(argv, "--from") ?? DEFAULT_SOURCE;
  const installAt = argv.indexOf("--install");
  const install = installAt >= 0;
  const targetArg = install ? argv[installAt + 1] : undefined;
  if (install && (!targetArg || targetArg.startsWith("--"))) {
    console.error(
      "herdr-theme: --install needs a target — a name (writes themes/<name>.json) or a path. No default: a bare --install overwrote the standing theme once.",
    );
    return 2;
  }
  const target = install ? resolveTarget(targetArg!) : DEFAULT_TARGET;

  if (!existsSync(sourcePath)) {
    console.error(`${sourcePath}: no theme to pin. Pass --from <theme.json>.`);
    return 1;
  }
  const source = JSON.parse(readFileSync(sourcePath, "utf8")) as HostTheme;

  const selectName = argAfter(argv, "--select");
  if (selectName) {
    const layout = argAfter(argv, "--layout") ?? "main";
    const where = argAfter(argv, "--appearance");
    const path = layoutStatePath(layout);
    if (!existsSync(path)) {
      console.error(`herdr-theme: no layout state at ${path} — is ${layout} a layout this machine has shown?`);
      return 2;
    }
    writeFileSync(
      path,
      selectInLayout(readFileSync(path, "utf8"), selectName, (where as "dark" | "light" | "both") ?? "both"),
    );
    console.log(`selected ${selectName} in the ${layout} layout's look`);
    console.log(`  wrote ${path} — the file is the layout's state; Herdr owns it and rewrites it as the layout moves`);
    console.log(`  if the screen does not follow, switch layout and back, or restart Herdr`);
    return 0;
  }

  const rung = argAfter(argv, "--rung");
  const ref = rung === undefined ? PAIR : referencePair(Number.parseInt(rung, 10));
  const pair = { bg: argAfter(argv, "--bg") ?? ref.bg, fg: argAfter(argv, "--fg") ?? ref.fg };
  const themed = pinSurface(source, pair);

  if (argv.includes("--explain")) {
    const from = { bg: source.background, fg: source.foreground };
    process.stderr.write(compareText(compareRanking(ref, from), ref, from, `before — ${sourcePath}`) + "\n\n");
    process.stderr.write(compareText(compareRanking(ref, pair), ref, pair, "after — the pinned pair") + "\n");
  }

  if (install) {
    writeFileSync(target, JSON.stringify(themed, null, 2) + "\n");
    // The crossing declares itself: what was written, where it landed, who owns
    // it. A copy is a message; the receiver may edit it and `--install` overwrites.
    console.log(`wrote ${target}`);
    console.log(`  from ${sourcePath} — surface pinned to ${pair.bg} / ${pair.fg}`);
    console.log(`  the file is yours now: Herdr never rewrites themes/; re-run --install to replace it`);
    console.log(`  ${selectionHint(basename(target).replace(/\.json$/, ""))}`);
    return 0;
  }

  process.stdout.write(JSON.stringify(themed, null, 2) + "\n");
  return 0;
}

if (import.meta.main) process.exit(main(process.argv.slice(2)));
