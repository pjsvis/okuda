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

import palette from "../src/palettes/okuda.json" with { type: "json" };
import css from "./html-package.css" with { type: "text" };

export function paletteVars(): string {
  const lines: string[] = [];
  for (const [role, hex] of Object.entries(palette as Record<string, string>)) {
    if (!hex) continue; // empty = no ink; the glass supplies it
    lines.push(`  --okuda-${role}: ${hex};`);
  }
  return `:root {\n${lines.join("\n")}\n}`;
}

/** The structural sheet. Bundled at build time, not read at runtime: a
 *  compiled binary (`cahier`, BRF-CAHIER-BINARY) has no filesystem beside
 *  it — `import.meta.url` resolves into the virtual `/$bunfs` root, where
 *  the .css does not exist. The text import carries it into the artifact. */
export function readCss(): string {
  return css;
}

/** The whole `<style>` payload: derived roles first, then the relations. */
export function styleBlock(): string {
  return `${paletteVars()}\n\n${readCss()}`;
}
