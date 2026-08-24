/**
 * palette.ts — semantic colour roles, Rosé Pine Base defaults, and the
 * ~/.config/okuda/palette.json override loader.
 *
 * Contract: briefs/2026-08-22-brief-ansi-emission-and-closed-grammar.md
 * (palette table, byte-exact ANSI mappings) +
 * briefs/2026-08-23-brief-diagram-colour-classification.md (diagram roles).
 *
 * Diagram roles reuse existing colours so diagrams read as part of the
 * document, not a foreign panel.
 */

import { existsSync, readFileSync } from "node:fs";

export type Role =
  | "heading"
  | "code-text"
  | "code-background"
  | "blockquote"
  | "link"
  | "emphasis"
  | "strong"
  | "table-header"
  | "table-key"
  | "muted"
  | "diagram-border"
  | "diagram-arrow"
  | "diagram-text";

export type Palette = Record<Role, string>;

/** Default palette — aligned to `glow` (the CLI) as dogfooded at the
 *  terminal, which renders the Dracula truecolor palette. NB: this is NOT
 *  glamour's ANSI-256 DarkStyleConfig (ADR-006's original sourcing was
 *  wrong — see its 2026-08-24 amendment); the bytes from `glow <file>`
 *  are the reference, not glamour's styles.go.
 *
 * SGR emission order is colour-then-attribute (\x1b[38;2;R;G;B;3m),
 * matching glow. Hex values:
 *   heading  #00afff  (39, bright blue)   — Glow H2-H6
 *   strong   #ffd700  (gold)             — divergence pending: glow-CLI is #ffb86c orange
 *   emphasis #f1fa8c  (Dracula yellow)  — glow-CLI faithful (converged from #ffff5f, 2026-08-24)
 *   code     #5fd700 / #303030            — divergence pending: glow-CLI code is #50fa7b green
 *   link     #00af5f  (35, sea green)     — Glow linkText, underlined via OSC 8
 *   muted    #585858  (240, dim gray)     — Glow horizontal rule
 *   blockquote #767676 (243, gray)        — quote pipe, recedes
 * Diagram roles have no Glow equivalent; they reuse Glow channels:
 *   border = muted, arrow = link green, text = doc near-white.
 * Table roles keep okuda's semantic layer (brief: table policy), tuned
 * to the Glow palette: header = heading blue, key = Glow H1 pale yellow.
 */
export const DEFAULT_PALETTE: Palette = {
  heading: "#00afff",
  "code-text": "#5fd700",
  "code-background": "#303030",
  blockquote: "#767676",
  link: "#00af5f",
  emphasis: "#f1fa8c",
  strong: "#ffd700",
  "table-header": "#00afff",
  "table-key": "#ffff87",
  muted: "#585858",
  "diagram-border": "#585858",
  "diagram-arrow": "#00af5f",
  "diagram-text": "#d7d7d7",
};

const RE_HEX = /^#[0-9a-fA-F]{6}$/;

function hexToRgb(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

/** Foreground SGR: \x1b[38;2;R;G;Bm */
export function fg(hex: string): string {
  const [r, g, b] = hexToRgb(hex);
  return `\x1b[38;2;${r};${g};${b}m`;
}

/** Background SGR: \x1b[48;2;R;G;Bm */
export function bg(hex: string): string {
  const [r, g, b] = hexToRgb(hex);
  return `\x1b[48;2;${r};${g};${b}m`;
}

export const RESET = "\x1b[0m";

/**
 * Load the user palette override from `path` (default
 * ~/.config/okuda/palette.json). Malformed files and invalid values are
 * ignored — the default palette applies. Unknown roles are ignored.
 */
export function loadPalette(path?: string): Palette {
  const merged: Palette = { ...DEFAULT_PALETTE };
  const file =
    path ?? `${process.env.HOME ?? ""}/.config/okuda/palette.json`;
  if (!file || !existsSync(file)) return merged;
  try {
    const parsed: unknown = JSON.parse(readFileSync(file, "utf8"));
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      for (const [key, value] of Object.entries(
        parsed as Record<string, unknown>,
      )) {
        if (key in merged && typeof value === "string" && RE_HEX.test(value)) {
          merged[key as Role] = value.toLowerCase();
        }
      }
    }
  } catch {
    // Silently fall back to defaults — a broken override must not break the viewer.
  }
  return merged;
}
