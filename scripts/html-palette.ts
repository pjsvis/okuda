/**
 * html-palette.ts — the palette as CSS custom properties, and the sheet.
 *
 * One function, two consumers: the package builder and the preview server.
 * A second copy of this table would be a second list to drift, and the
 * palette is the one list (src/palettes/okuda.json).
 *
 * An empty value means "emit nothing, inherit the glass's own" — so it
 * becomes no custom property at all, and the stylesheet's
 * `var(--okuda-body, …)` fallback does the inheriting.
 */

import { readFileSync } from "node:fs";
import palette from "../src/palettes/okuda.json" with { type: "json" };

export function paletteVars(): string {
  const lines: string[] = [];
  for (const [role, hex] of Object.entries(palette as Record<string, string>)) {
    if (!hex) continue; // empty = no ink; the glass supplies it
    lines.push(`  --okuda-${role}: ${hex};`);
  }
  return `:root {\n${lines.join("\n")}\n}`;
}

/** The structural sheet, read once. */
export function readCss(): string {
  return readFileSync(new URL("./html-package.css", import.meta.url), "utf8");
}

/** The whole `<style>` payload: derived roles first, then the relations. */
export function styleBlock(): string {
  return `${paletteVars()}\n\n${readCss()}`;
}
