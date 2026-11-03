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
//  Usage:
//    bun scripts/probe-surface.ts                  # this machine
//    bun scripts/probe-surface.ts host             # over ssh, read-only
//    bun scripts/probe-surface.ts host --json
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
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

/** The flatness keys: any of these and the ground is a range, not a value. */
const NOT_FLAT = /(background[-_]opacity|background[-_]blur|background[-_]image|opacity\s*=|blur\s*=)/i;

export interface Clue {
  path: string;
  pair: { bg: string; fg: string } | null;
  /** Keys that make the effective ground a range. Empty means flat. */
  nonFlat: string[];
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
    if (!v.readable || !v.navigable) console.log(surfaceText(v, PAIR).split("\n").filter((l) => l.startsWith("  ")).join("\n"));
  }
  return 0;
}

if (import.meta.main) process.exit(main(process.argv.slice(2)));
