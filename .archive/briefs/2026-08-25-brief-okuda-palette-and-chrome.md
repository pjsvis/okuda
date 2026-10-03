---
type: Brief
callsign: BRF-OKUDA-PALETTE
---

# Brief: Okuda palette preset + code-panel chrome

**Date:** 2026-08-25
**Status:** Open
**Branch:** feat/tui-control-plane
**Context:** follows the 2026-08-24 debrief (moat named, glow convergence complete).

## What

Two affordances, layered on top of the glow-parity default (which stays):

1. **Okuda palette preset.** A named palette (`--palette okuda`) mapping the
   existing semantic roles to Michael Okuda's actual colour language — warm
   ambers, slate blues, cream readouts — instead of the borrowed Dracula
   colours. The Dracula palette remains the default (glow parity); the Okuda
   palette is the identity layer.

2. **Code-panel chrome.** Emit `code-background` on fenced code blocks. The
   role has been defined since brief 002 but never emitted (dropped in Pass B
   for glow parity — "the bg read as a blurry box"). Re-adding it is the
   deliberate Okuda divergence: a content-sized coloured panel behind code,
   LCARS-style. Tied to the palette's `code-background` value: empty string =
   no bg (glow default), hex = bg emitted (Okuda affordance).

## Why

The homage is in the name and the philosophy, but the colours are someone
else's. The override system exists; no preset ships. One config file converts
the homage from nominal to literal. The code-panel is the second leg: LCARS
uses background blocks as panels — a code block with a dim bg reads as "this
is a unit." Both are the existing infrastructure, finally pulled.

## How

### Palette preset

- `src/palettes/okuda.json` — bundled preset, LCARS-mapped colours.
- `loadPalette(name?)` in `palette.ts` — loads bundled preset by name, then
  applies `~/.config/okuda/palette.json` override on top (user wins).
- `--palette <name>` flag in `cli.ts`. No flag = default (Dracula/glow).

### Code-panel chrome

- Default palette: `code-background: ""` (empty sentinel = no bg, glow parity).
- Okuda palette: `code-background: "#1a1530"` (real bg, panel emitted).
- `codeLine` styler: if `code-background` is non-empty, emit `bg + fg`; else
  `fg` only (current behaviour). NO_COLOR mode unchanged (parity holds).

### LCARS colour mapping (okuda.json)

| Role | Hex | LCARS referent |
|------|-----|----------------|
| heading | #99CCFF | Okuda slate blue (section marker) |
| strong | #FFAA00 | amber (primary accent) |
| emphasis | #FFCC66 | warm yellow (data) |
| code-text | #FFCC99 | cream (readout) |
| code-background | #1a1530 | dark indigo panel |
| blockquote | #7788AA | muted slate (recedes) |
| link | #66DDFF | Okuda cyan-blue |
| link-text | #FF9966 | peach (navigation) |
| link-url | #66DDFF | cyan |
| badge-bg | #FFAA00 | amber label block |
| badge-fg | #000000 | black on amber (LCARS label convention) |
| table-header | #99CCFF | slate blue |
| table-key | #FFCC66 | yellow key anchor |
| muted | #445566 | dark slate |
| diagram-border | #6688AA | muted slate |
| diagram-arrow | #FFAA00 | amber (leads the eye) |
| diagram-text | #FFCC99 | cream readout |

## Scope

- Default (Dracula) palette: code-background changes from `#303030` to `""`.
  This is the only default change; it makes "no bg" explicit (matches the
  Pass B behaviour — glow emits no code bg).
- No new roles. No rendering changes beyond `codeLine` bg emission.
- User override (`palette.json`) can set any role including code-background;
  a hex value there enables the panel regardless of preset.

## Out of scope

- Color-chip heading labels (the third suggestion). Parked — dogfood the
  first two first; chips risk decorated-Stuff territory.
