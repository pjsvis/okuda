#!/usr/bin/env bun
// ── contrast.ts — the ground the reader reads on ─────────────────────
//
//  ADR-GLASS-INK-073 puts absolute luminance with the terminal. This script
//  does not argue with that; it is what a principal needs to *set* it well:
//  a short list of foreground/background pairs, and the two numbers that make
//  the choice checkable rather than a matter of taste.
//
//  Why these pairs and not a thousand: okuda's role hexes are fixed, so a
//  ground is admissible only if they all survive on it. The `muted` role
//  (#445566 — horizontal rules, table pipes) is the binding constraint: it is
//  the darkest structural ink in the palette, so a ground that is too light
//  erases the rules while prose stays perfectly legible. That is the failure
//  this instrument exists to catch, and it is why the list deepens rather than
//  lifts.
//
//  The two measures:
//    ratio  — WCAG 2.0 contrast, the shared currency (1–21)
//    L      — OKLCH lightness of the ink, the perceptual scale
//  A ratio is a poor proxy for halation; L is not. Read both.
//
//  Usage: `just contrast` (or `bun scripts/contrast.ts`, `--json`).
//  The doc's numbers are pinned against this file by tests/contrast.test.ts.

import { DRACULA_PALETTE, type Palette } from "../src/palette";
import { readFileSync } from "node:fs";
import { join } from "node:path";

export interface Pair {
  /** The rung's number. `0` is the control: the terminal's shipped default. */
  n: number;
  /** What the rung is for, in three or four words. */
  name: string;
  bg: string;
  fg: string;
  /** A rung the reader should skip, with the reason stated in the doc. */
  refused?: string;
}

/** The set, in the order a reader should try them. */
export const PAIRS: Pair[] = [
  { n: 0, name: "control — Ghostty's default", bg: "#282c34", fg: "#ffffff" },
  { n: 1, name: "ink off-white", bg: "#282c34", fg: "#dcdfe4" },
  { n: 2, name: "ink softer", bg: "#282c34", fg: "#cfd3d8" },
  { n: 3, name: "ink grey, evening only", bg: "#282c34", fg: "#b8bcc2" },
  { n: 4, name: "ground deeper", bg: "#23272e", fg: "#c8ccd4" },
  { n: 5, name: "deep and dim, night or OLED", bg: "#1b1e24", fg: "#a9aeb8" },
  { n: 6, name: "warm ground, cream ink", bg: "#262320", fg: "#d6cfc4" },
  {
    n: 7,
    name: "lifted ground — do not use",
    bg: "#343a45",
    fg: "#d4d8de",
    // Refused on a report from the glass, not from this script: the ground
    // reads as an *emitted light* — "glowing background sitting over the
    // viewport like a glare reflection". On an emissive display a large area of
    // grey is a lit rectangle, not an absence of light, and lifting it toward
    // the surround makes it figure instead of ground. The rules measurement is
    // the corroboration, not the cause: this is also the weakest structure in
    // the set (`muted` 1.49, the ground-to-muted gap the smallest of any rung).
    refused: "the ground reads as emitted light — a lit rectangle over the viewport; its rules are also the weakest in the set (1.49)",
  },
  { n: 8, name: "ground deeper still — best so far", bg: "#221f1c", fg: "#d6cfc4" },
  { n: 9, name: "deeper again — the floor test", bg: "#1c1a17", fg: "#d6cfc4" },
];

const hex2rgb = (h: string): [number, number, number] => {
  const s = h.replace("#", "");
  return [
    parseInt(s.slice(0, 2), 16),
    parseInt(s.slice(2, 4), 16),
    parseInt(s.slice(4, 6), 16),
  ];
};

/** Linear-light relative luminance, WCAG 2.0. */
const lin = (c: number): number => {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
};

export const luminance = (hex: string): number => {
  const [r, g, b] = hex2rgb(hex).map(lin) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/** WCAG 2.0 contrast ratio, 1–21. Order-free. */
export const ratio = (a: string, b: string): number => {
  const ya = luminance(a);
  const yb = luminance(b);
  const [hi, lo] = ya > yb ? [ya, yb] : [yb, ya];
  return (hi + 0.05) / (lo + 0.05);
};

/** OKLCH lightness (the L of `oklch(L C H)`), via sRGB → linear → LMS → Lab. */
export const oklchL = (hex: string): number => {
  const [r, g, b] = hex2rgb(hex).map(lin) as [number, number, number];
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
};

/** The okuda preset's own roles, read from the shipped palette file so the
 *  instrument cannot drift from the thing it is judging. */
export const okudaPalette = (): Palette =>
  JSON.parse(
    readFileSync(join(import.meta.dir, "..", "src", "palettes", "okuda.json"), "utf8"),
  ) as Palette;

/** The roles whose survival a ground must not cost: structure, then the two
 *  loudest declarative roles. */
export const WATCHED = ["muted", "diagram-border", "heading", "state-todo"] as const;

export interface Row {
  n: number;
  name: string;
  bg: string;
  fg: string;
  ratio: number;
  lBg: number;
  lFg: number;
  /** Each watched role's ratio against this ground. */
  watched: Record<string, number>;
  /** `muted` as a fraction of the ink's contrast: below 1 the hierarchy holds
   *  (a rule never out-shouts prose). */
  ruleShare: number;
  refused?: string;
}

export function rows(): Row[] {
  const p = okudaPalette();
  return PAIRS.map((pair) => {
    const watched = Object.fromEntries(
      WATCHED.map((r) => [r, ratio(p[r] ?? "#000000", pair.bg)]),
    );
    const ink = ratio(pair.fg, pair.bg);
    return {
      n: pair.n,
      name: pair.name,
      bg: pair.bg,
      fg: pair.fg,
      ratio: ink,
      lBg: oklchL(pair.bg),
      lFg: oklchL(pair.fg),
      watched,
      ruleShare: (watched["muted"] ?? 0) / ink,
      refused: pair.refused,
    };
  });
}

/** One rung, as the page states it — a single line whose fields are atomic, so
 *  it wraps at a separator and never inside a number. Rendered here and
 *  asserted verbatim by the test: the page cannot drift from the measurement. */
export function rungLine(r: Row): string {
  const mark = r.refused ? " ✗" : "";
  return (
    `**${r.n} · ${r.name}**${mark} · \`${r.bg}\` / \`${r.fg}\` · ` +
    `${r.ratio.toFixed(1)}:1 · L ${r.lFg.toFixed(3)} · ` +
    `rules ${(r.watched["muted"] ?? 0).toFixed(2)} · share ${r.ruleShare.toFixed(2)}`
  );
}

/** The paste block: a whole Ghostty fragment, every line commented, so pasting
 *  it is a no-op until the reader uncomments exactly one pair. Rendered from
 *  PAIRS — the page and the `.conf` are both checked against this, so there is
 *  one source and two renderings, never two hand-typed copies. */
export function configFile(pairs: Pair[] = PAIRS): string {
  const pad = (s: string, n: number): string => s.padEnd(n);
  const rs = rows();
  const out: string[] = [];
  out.push("# ── okuda · the ground you read on ─────────────────────────────────");
  out.push("# Nothing here is active: every line is a comment. Uncomment exactly ONE");
  out.push("# pair — the two lines `background` and `foreground` — then reload:");
  out.push("#   macOS  cmd+shift+,      Linux  ctrl+shift+,      (action: reload_config)");
  out.push("# Uncommenting two pairs does not compare them: the later key wins silently");
  out.push("# and you will judge the wrong rung. A bare `foreground =` resets to default.");
  out.push("#");
  out.push("# The ground is the lever, not the ink. Every ink-only rung (1-3) was");
  out.push("# rejected as the prose receding; every deepened ground was kept. 8 is the");
  out.push("# best so far. Ground L below ~0.27 stops reading as a lit panel; above");
  out.push("# ~0.29 it competes with the room, which is why 7 glows.");
  out.push("#");
  out.push("#   n  bg / fg                ratio    L       rules   what it is");
  for (const r of rs) {
    out.push(
      `#   ${pad(String(r.n), 3)}${pad(`${r.bg} / ${r.fg}`, 22)}` +
        `${pad(`${r.ratio.toFixed(1)}:1`, 8)}${pad(r.lFg.toFixed(3), 8)}` +
        `${pad((r.watched["muted"] ?? 0).toFixed(2), 8)}${r.name}` +
        (r.refused ? " ✗" : ""),
    );
  }
  out.push("#");
  out.push("# rules = the `muted` role (#445566 — horizontal rules, table pipes)");
  out.push("# against that ground: structure, and the corroborating measure.");
  out.push("# 7 is refused because the ground *glows* — see the note on its line.");
  out.push("# why:   docs/2026-10-28-the-ground-you-read-on.md");
  out.push("# made:  scripts/contrast.ts (`just contrast`) · ADR-GLASS-INK-073");
  out.push("#");
  out.push("# Second dial, and it is okuda's rather than the terminal's: prose weight");
  out.push('# relative to the accents — { "body": "#cfd3d8" } in ~/.config/okuda/palette.json');
  for (const p of pairs) {
    out.push("");
    out.push(`# ${p.n} — ${p.name}${p.refused ? " ✗" : ""}`);
    if (p.refused) out.push(`#     ${p.refused}`);
    out.push(`# background = ${p.bg}`);
    out.push(`# foreground = ${p.fg}`);
  }
  return out.join("\n");
}

function main(): void {
  const json = process.argv.includes("--json");
  const rs = rows();
  if (json) {
    console.log(JSON.stringify(rs, null, 2));
    return;
  }
  const pad = (s: string, n: number): string => s.padEnd(n);
  // L_bg is the comfort axis (the ground's own lightness) and amber is the
  // early-warning channel: deepening the ground raises every role's contrast in
  // lockstep, and amber crosses 13:1 before anything on the page *looks* wrong.
  console.log(
    pad("", 3), pad("pair", 30), pad("bg", 9), pad("fg", 9),
    pad("ratio", 7), pad("L_bg", 6), pad("L_fg", 6),
    pad("rules", 6), pad("amber", 6), "share",
  );
  for (const r of rs) {
    console.log(
      pad(String(r.n), 3), pad(r.name, 30), pad(r.bg, 9), pad(r.fg, 9),
      pad(`${r.ratio.toFixed(1)}:1`, 7), pad(r.lBg.toFixed(3), 6),
      pad(r.lFg.toFixed(3), 6),
      pad((r.watched["muted"] ?? 0).toFixed(2), 6),
      pad((r.watched["state-todo"] ?? 0).toFixed(1), 6),
      r.ruleShare.toFixed(2),
    );
  }
  console.log("\nshare = muted ÷ ink. Above 1.00 a rule out-shouts prose: refused.");
  console.log("comfort band: ground L 0.24–0.26 at 10–11:1. Below it, or above it, the");
  console.log("page is high-contrast again — the ladder is a U, not a ramp.");
}

if (import.meta.main) main();
