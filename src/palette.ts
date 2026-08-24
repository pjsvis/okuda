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

/** Rosé Pine Base defaults — hex per the contract's palette table. */
export const DEFAULT_PALETTE: Palette = {
  heading: "#e0def4",
  "code-text": "#eb6f92",
  "code-background": "#26233a",
  blockquote: "#6e6a86",
  link: "#9ccfd8",
  emphasis: "#f6c177",
  strong: "#ebbcba",
  "table-header": "#31748f",
  "table-key": "#f6c177",
  muted: "#6e6a86",
  "diagram-border": "#6e6a86",
  "diagram-arrow": "#9ccfd8",
  "diagram-text": "#e0def4",
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
