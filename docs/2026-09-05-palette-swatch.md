---
type: Reference
callsign: REF-PALETTE-SWATCH
---

# Palette Swatches — the colour in context

**Derived from** `src/palettes/okuda.json` by `scripts/palette-swatch.ts`.
**Companion to** `docs/2026-09-05-palette-page.md` (the table + OKLCH analysis).

> The grammar is closed: a role is painted only by its bound markdown
> construct. So below, every *author-addressable* role is shown by writing
> its name and a descriptor inside that construct — okuda renders the
> name in the role's own colour. The *chrome-only* roles (badge, state,
> vector, diagram, alert, muted, code-background) have no author path;
> they're listed with their hex and where to see them, because markdown
> cannot address them.

## Author-addressable roles — the name in its own colour

# heading — pale periwinkle, the H1–H6 channel

> blockquote — the pipe is this blue-grey; the aside itself is italic (emphasis gold)

*emphasis — muted gold, the italic channel*

**strong — deeper gold, the bold channel**

`code-text — warm peach, the inline code span`

[link-text — coral, the anchor](https://okuda.terminal/link-url) — and `link-url` is the sea-green URL tail above

see decisions/doc-ref.md — the bare .md path token, painted in prose

table roles live inside `| ... |` — header row and left column:

| table-header — warm parchment | value |
|------------------------------|-------|
| table-key — left-column index | value |

## Chrome-only roles — not author-addressable

| Role | Hex | Where seen |
|------|-----|------------|
| `badge-bg` | #ffaa00 | TUI footer badge background (chrome) |
| `badge-fg` | #000000 | TUI footer badge foreground (chrome) |
| `state-ok` | #5fd35f | state glyph ✓ — done (state-colours.md) |
| `state-todo` | #ffe066 | state glyph ☐ — todo (state-colours.md) |
| `state-parked` | #ff9933 | state glyph ⋮ — parked (state-colours.md) |
| `state-failed` | #ff5555 | state glyph ✗ — failed (state-colours.md) |
| `link` | #66ddff | legacy override-compat; not painted — link-text/link-url used instead |
| `alert` | #ff5555 | fetch-state `failed` channel (ADR-015); === state-failed |
| `vector` | #fb7185 | [NN] jump badges, the rubricator's rose (ADR-031) |
| `diagram-border` | #5e8bbf | box-drawing ink in mermaid→ASCII frames (diagram-monster.md) |
| `diagram-arrow` | #ffaa00 | arrow ink in mermaid→ASCII frames |
| `diagram-text` | #c8b894 | label ink in mermaid→ASCII frames |
| `muted` | #445566 | horizontal rules + de-emphasised chrome |
| `code-background` | "" (empty) | no background emitted (glow parity) |
