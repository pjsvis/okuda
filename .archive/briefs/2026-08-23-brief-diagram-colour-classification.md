---
type: Brief
callsign: BRF-DIAGRAM-COLOUR
---

# Brief: Diagram Colour Classification for Mermaid ASCII Blocks

**Date:** 2026-08-23
**Status:** Open
**Depends on:** 2026-08-22-brief-ansi-emission-and-closed-grammar.md (done — the rendering contract, palette, and Mermaid pipe rule it amends)
**Amends:** the Mermaid row of the grammar table in brief 002 ("Returned ASCII inserted verbatim" → classified and coloured)
**Source doc:** `docs/2026-08-23-diagram-color-filter.md` (captured from a Gemini chat; proposed the filter as a bake post-process — reframed here for the render-time surface and Okuda's palette)

## Objective

Classify the box-drawing and arrow characters in Mermaid ASCII blocks into three semantic channels — **border**, **arrow**, **text** — and colour them per Okuda's palette, so diagrams render as a high-contrast structural canvas rather than undifferentiated monochrome. The classification lives in Okuda's render layer; the `mermaid-to-md` Rust binary stays plain-text.

## Why the classification lives in Okuda, not behind a `--color` flag on the binary

The source doc and an earlier draft proposed a `--color` flag on the `mermaid-tui` Rust binary that emits ANSI TrueColor escapes. That is the wrong place. Okuda owns its palette (brief 002: Rosé Pine base, user-overridable via `~/.config/okuda/palette.json`). A shared binary emitting its own palette colours would clash with every consumer's theme — and `mermaid-tui` is consumed by the bake pipeline, by `cat`, and by Okuda. Imposing a palette from the binary is the same class of error as baking ANSI into the markdown file: presentation imposed where the consumer should own it.

The character classification is trivial in TypeScript — a char-set membership test, ~15 lines — and Okuda already classifies and restyles every other token type (lists, headings, code). A Mermaid block is just another token, coloured in the render layer using the palette Okuda already owns. The "the engine knows what it drew" argument for putting it in Rust is true but irrelevant: the engine doesn't know the consumer's palette, and the consumer is the one with a palette.

## Why colour is structural here, not decorative

Monochrome diagrams force the eye to parse boundary boxes, flow arrows, and node text at identical visual contrast. Colour acts as an orthographic separator: structure vs. flow vs. content. This is the LCARS instinct Okuda already encodes (colour as subsystem signal). Three channels is the minimum semantic palette; per-node-type colouring would tip into decoration.

## Scope

**In:**
- Character classifier for the Mermaid block output (border / arrow / text).
- Three new semantic palette roles: `diagram-border`, `diagram-arrow`, `diagram-text`.
- Default hex values for the new roles, Rosé Pine-aligned (see Palette below).
- Integration into the Mermaid pipe path: classify after the binary returns, before emitting to stdout.
- `NO_COLOR` / `TERM=dumb` parity: classification is skipped, plain text emitted.

**Out:**
- A `--color` flag on the `mermaid-tui` Rust binary. Dropped — palette sovereignty belongs to Okuda.
- Canvas background / padding to viewport width. Dropped — the pane background is the background; a full-bleed canvas detaches the diagram from surrounding prose.
- Per-node-type or per-diagram-type palettes. Three channels is the semantic minimum.
- Run-coalescing / escape-stream optimisation. Okuda re-renders the whole document on each file change; there is no incremental-paint budget to defend.

## Palette

Three new roles added to the Rosé Pine base table in brief 002. Defaults align with existing roles so the diagram reads as part of the document, not a foreign panel:

| Semantic Role | Hex | Rationale |
|---|---|---|
| `diagram-border` | `#6e6a86` (Muted) | Box-drawing rails recede — structure, not content. Reuses the blockquote/rule colour so diagrams share the document's structural tone. |
| `diagram-arrow` | `#9ccfd8` (Link) | Flow connectors stand out without shouting. Reuses the link colour — arrows are the diagram's "links." |
| `diagram-text` | `#e0def4` (Heading text) | Node labels at full contrast — the content the eye should land on. |

User override: same `~/.config/okuda/palette.json` mechanism as the rest of the palette.

## How

1. **Define the character classes** — Unicode-only, matching what the `mermaid-tui` binary actually emits:
   - **Border:** `┌ ┐ └ ┘ ├ ┤ ┬ ┴ ─ │ ┼`
   - **Arrow:** `▲ ▼ ◄ ►` (the Unicode arrows the engine emits — **not** ASCII `^ v > <`, which false-positive on label content like `v2.0` or `x > 5`).
   - **Text:** everything else (alphanumerics, punctuation, whitespace).
2. **Add the three palette roles** to the default palette table and the `palette.json` override schema in brief 002.
3. **In the Mermaid pipe path** (brief 003, `src/render.ts`): after `Bun.spawn` returns the ASCII, classify each character and emit the SGR sequence per its channel. End every line with `\x1b[0m` (escape hygiene rule 4, brief 002).
4. **Width math is unaffected** — ANSI escapes are zero-width (rule 1, brief 002); the hard-wrap engine already accounts for this. Mermaid blocks are never wrapped (brief 002).

## Use cases (two authors, one treatment)

1. **Our agent authors the diagram** → the classification reads as structure: border rails recede, arrows mark flow, node labels land. Looks good.
2. **External diagram** (third-party README with a `​```mermaid` block) → same classification, same palette. If the diagram's intent doesn't match the channels (e.g., arrows used as bullet markers), it may read slightly odd. Not our problem. Predictable beats smart.

Both authors get identical treatment. The classifier does not detect provenance.

## Acceptance criteria

* A Mermaid block rendered through Okuda colours border characters `diagram-border`, `​▼/▲/◄/►` arrows `diagram-arrow`, and node labels `diagram-text`; every line ends `\x1b[0m`.
* `NO_COLOR` set → plain text, byte-identical to the binary's output. Classification skipped.
* No ASCII character (`^ v > <`, alphanumerics) is ever classified as an arrow. A node labelled `v2.0` renders entirely in `diagram-text`.
* `palette.json` overriding `diagram-arrow` to a custom hex takes effect on next render.
* Sequence and state diagrams classify correctly — the engine emits the same box-drawing and arrow vocabulary across diagram types.
* The `mermaid-tui` binary is unchanged — no `--color` flag, no ANSI in its output. The bake pipeline and `cat` consumers are unaffected.

## Out of scope

* Canvas background, padding, viewport-width fill.
* Configurable per-diagram palettes (hard-code the three channels; revisit only if a second consumer wants something different).
* Any change to the `mermaid-to-md` Rust binary or the bake/inject/verify pipeline.

## Iteration note

The exact palette values above are first guesses. We will tune them against real diagrams in real panes once the renderer exists. The architecture (three channels, Unicode-only classifier, classification in Okuda's render layer, palette-overrideable) is the load-bearing decision; the hex values are not.
