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
import { join } from "node:path";
import { compareRanking, compareText, referencePair, REFERENCE_RUNG } from "./contrast";

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
export const DEFAULT_SOURCE = join(homedir(), ".config", "herdr-app", "themes", "atom-one-dark.json");
export const DEFAULT_TARGET = join(homedir(), ".config", "herdr-app", "themes", "gloam.json");

/** The theme with its surface pinned. Pure: a source theme and a pair in, a
 *  theme out. Only the three surface keys move; everything else is carried
 *  through untouched, which is what makes this a pin and not a redesign. */
export function pinSurface(source: HostTheme, pair: { bg: string; fg: string }): HostTheme {
  return { ...source, background: pair.bg, foreground: pair.fg, cursor: pair.fg };
}

/** The one line that makes the app use it. Printed, never written: `settings.json`
 *  is the person's file and the picker overrides it. */
export function settingsHint(name: string): string {
  return `settings.json: { "theme": "${name}" }   (the theme picker overrides this — do not use the picker for the pair)`;
}

function argAfter(argv: string[], flag: string): string | undefined {
  const i = argv.indexOf(flag);
  return i >= 0 ? argv[i + 1] : undefined;
}

function main(argv: string[]): number {
  const sourcePath = argAfter("--from") ?? DEFAULT_SOURCE;
  const target = argAfter("--install") ?? DEFAULT_TARGET;
  const install = argv.includes("--install");

  if (!existsSync(sourcePath)) {
    console.error(`${sourcePath}: no theme to pin. Pass --from <theme.json>.`);
    return 1;
  }
  const source = JSON.parse(readFileSync(sourcePath, "utf8")) as HostTheme;

  const rung = argAfter("--rung");
  const ref = referencePair(rung === undefined ? REFERENCE_RUNG : Number.parseInt(rung, 10));
  const pair = { bg: argAfter("--bg") ?? ref.bg, fg: argAfter("--fg") ?? ref.fg };
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
    console.log(`  ${settingsHint("gloam")}`);
    return 0;
  }

  process.stdout.write(JSON.stringify(themed, null, 2) + "\n");
  return 0;
}

if (import.meta.main) process.exit(main(process.argv.slice(2)));
