// palette-swatch.ts — emit a markdown swatch doc where each author-
// addressable palette role is shown by writing its name inside the
// markdown construct that paints it, so okuda renders the name in the
// role's own colour. Chrome-only roles (no author path) are listed with
// their hex from the source-of-truth palette and a pointer to where
// they're seen.
//
// Why a generator: the swatch doc is derived from src/palettes/okuda.json
// (the source of truth) so it can't drift from the palette. The
// role→construct mapping is the thing this script encodes; the hexes
// come from the JSON.
//
// Companion to docs/2026-09-05-palette-page.md (the table + OKLCH analysis).
// Run: `just palette-swatch` (or `bun scripts/palette-swatch.ts`).

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const palettePath = join(here, "..", "src", "palettes", "okuda.json");
const palette = JSON.parse(readFileSync(palettePath, "utf8")) as Record<
  string,
  string
>;

const hex = (role: string): string => palette[role] ?? "—";

// Author-addressable roles: one block per role (or per construct), the
// role name + descriptor wrapped in the construct that paints it. The
// whole content renders in that role's colour.
const addressable: string[] = [
  "# heading — pale periwinkle, the H1–H6 channel",
  "",
  "> blockquote — the pipe is this blue-grey; the aside itself is italic (emphasis gold)",
  "",
  "*emphasis — muted gold, the italic channel*",
  "",
  "**strong — deeper gold, the bold channel**",
  "",
  "`code-text — warm peach, the inline code span`",
  "",
  "[link-text — coral, the anchor](https://okuda.terminal/link-url) — "
  + "and `link-url` is the sea-green URL tail above",
  "",
  "see decisions/doc-ref.md — the bare .md path token, painted in prose",
  "",
  "table roles live inside `| ... |` — header row and left column:",
  "",
  "| table-header — warm parchment | value |",
  "|------------------------------|-------|",
  "| table-key — left-column index | value |",
];

// Chrome-only roles: the grammar forbids authors from addressing these,
// so no swatch is possible in markdown. Hex from the palette; "where
// seen" points at the chrome home.
const chrome: [string, string, string][] = [
  // The ground. Not author-addressable by design: no markdown construct paints
  // it, because a body hex is right or unreadable depending on the glass's
  // background — which the renderer cannot query. It ships empty (inherit) and
  // the principal declares it in `~/.config/okuda/palette.json` (ADR-BODY-INK-072).
  ["body", hex("body") || '`""` (empty)', "prose, list text, table cells — no ink shipped; the glass's own foreground, or the principal's override"],
  ["badge-bg", hex("badge-bg"), "TUI footer badge background (chrome)"],
  ["badge-fg", hex("badge-fg"), "TUI footer badge foreground (chrome)"],
  ["state-ok", hex("state-ok"), "state glyph ✓ — done (state-colours.md)"],
  ["state-todo", hex("state-todo"), "state glyph ☐ — todo (state-colours.md)"],
  ["state-parked", hex("state-parked"), "state glyph ⋮ — parked (state-colours.md)"],
  ["state-failed", hex("state-failed"), "state glyph ✗ — failed (state-colours.md)"],
  ["link", hex("link"), "legacy override-compat; not painted — link-text/link-url used instead"],
  ["alert", hex("alert"), "fetch-state `failed` channel (ADR-015); === state-failed"],
  ["vector", hex("vector"), "[NN] jump badges, the rubricator's rose (ADR-031)"],
  ["diagram-border", hex("diagram-border"), "box-drawing ink in mermaid→ASCII frames (diagram-monster.md)"],
  ["diagram-arrow", hex("diagram-arrow"), "arrow ink in mermaid→ASCII frames"],
  ["diagram-text", hex("diagram-text"), "label ink in mermaid→ASCII frames"],
  ["muted", hex("muted"), "horizontal rules + de-emphasised chrome"],
  ["code-background", hex("code-background") || '"" (empty)', "no background emitted (glow parity)"],
];

const chromeRows = chrome
  .map(([r, h, w]) => `| \`${r}\` | ${h} | ${w} |`)
  .join("\n");

const out = `---
type: Reference
---

# Palette Swatches — the colour in context

**Derived from** \`src/palettes/okuda.json\` by \`scripts/palette-swatch.ts\`.
**Companion to** \`docs/2026-09-05-palette-page.md\` (the table + OKLCH analysis).

> The grammar is closed: a role is painted only by its bound markdown
> construct. So below, every *author-addressable* role is shown by writing
> its name and a descriptor inside that construct — okuda renders the
> name in the role's own colour. The *chrome-only* roles (badge, state,
> vector, diagram, alert, muted, code-background) have no author path;
> they're listed with their hex and where to see them, because markdown
> cannot address them.

## Author-addressable roles — the name in its own colour

${addressable.join("\n")}

## Chrome-only roles — not author-addressable

| Role | Hex | Where seen |
|------|-----|------------|
${chromeRows}
`;

process.stdout.write(out);
