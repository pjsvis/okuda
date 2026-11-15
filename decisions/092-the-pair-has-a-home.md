---
type: ADR
callsign: ADR-PAIR-HAS-A-HOME-092
date: 2026-11-13
---

# Decision: The pair lives with the glass — a generated pin, not a process parameter

**Date:** 2026-11-13
**Status:** Accepted
**Enforced by:** nothing yet — the gate is built with the generator
(`scripts/rex-theme.ts`, `BRF-LAUNCH-CONTRACT` phase 3). Until it exists this ADR
is **advice**, said plainly.

## Context

The operator's requirement: *control of the figure-ground pair in the terminal,
live or parameterised at startup, no themes, no fonts, no state* — plus *clone a
dereferenced document into a new terminal with all the CWD*.

Three channels were candidates, and two of them are now measured rather than
argued:

1. **Live, via the host's API.** `com.superlogical.terminal.set_theme` describes
   itself as applying at once *"if the caller owns the block or no client does,
   and otherwise when the caller becomes the owner"* — so the earlier "inert"
   reading could have been an ownership failure. **Tested 2026-11-13 and
   excluded**: called plain and called as the owning client (`rex api call -C
   client:01a1d5b3…`), both returned `{}`, and the screen colour census did not
   move (`#0E1117` held at 2.93–2.99M px of a 5.6M px frame; `screencapture` +
   `magick histogram`). There is also **no readback**: `format` with
   `format=vt, extra_palette=true` returns plain text with no escapes and no
   palette, `rex config` has no theme keys, and `rex actions` exposes one theme
   action.
2. **At startup, as a process parameter** (`OKUDA_PAIR`, argv). Works for
   okuda's own bytes, and only those: the ground is repainted per cell, which is
   bytes that inheritance would have supplied free (`ADR-GLASS-INK-073`). It is
   blind to the colour space (argv has no such field), it is unnameable in a
   sentence or a screenshot, and every process carries its own copy, so two
   panes can disagree about what "the ground" means.
3. **At startup, in the host's theme slot.** `Workspace.customThemes` +
   `darkThemeID`/`lightThemeID`.

The third looked like the thing the requirement forbade ("no themes") until the
format was decoded. **Every colour in a stored theme carries both spaces** —
`colorSpace: "display-p3"` values *and* an `srgbFallback` — and
`Workspace.terminalUsesDisplayP3 = 1` is live. So the sRGB hexes every ratio in
this silo is computed from are not, alone, what reaches the screen. A theme is
the only artifact in the system that can declare which space the pair is read
in. That is not decoration; it is the referent.

## Decision

**The pair is declared in the host, as a *generated* custom theme carrying both
colour spaces, and argv carries only a comparison override.**

A "pin" is a theme in which okuda authors exactly three colours — background,
foreground, cursor — and nothing else. The name is earned by content: no roles,
no taste, no font, no ANSI authorship.

## Alternatives Considered

| Alternative | Why rejected |
|---|---|
| Live `set_theme` | Measured inert twice, with the ownership hypothesis tested and excluded; no readback exists, so a lever that did work could not be verified working |
| `OKUDA_PAIR` as the operating control | Process-local: invisible to shells, editors and `less` in the same pane; blind to the colour space; unnamed, so "the ground" cannot be referred to without reciting hex |
| Hand-authored theme | ~20 colours × 2 spaces is taste, and taste in a stored file drifts from `PAIRS` with nothing to catch it |
| A full theme with authored ANSI slots | Those 16 slots belong to other programs. okuda is truecolor (`src/ansi.ts:7`) and never emits them: authoring them is picking colours for tools we do not own |
| Keeping both setters live | Two sources wearing matching values is a latency, not a property — the failure `src/cli.ts` already names for the version stamp |

## Consequences

**What became easier:**

- One name with a referent on the machine: the plist holds the theme, the theme
  holds the pair and both spaces, and `just surface-probe` can dereference it.
  The thing we say and the thing on screen become one object.
- The pair reaches every program in the pane, because it lives in the host
  rather than in a process. A clone needs no pair plumbing at all: the
  inheritance problem disappears when the value is not in a process.
- The colour space is stated once, in the artifact, instead of being assumed.

**What became harder:**

- Selection costs a **quit and relaunch**. `cfprefsd` will overwrite a blind
  write to a running app, so the install is a declared sequence, not a call.
- The pin must be regenerated when `PAIRS` moves, or it becomes a stale copy of
  a ladder that changed — the exact failure `ADR-LEGIBILITY-SURFACE-090` found
  in the Omarchy override.
- Two appearance slots mean two artifacts: a dark pin and a light pin. The light
  one has no rung yet (`deriveLightCard` is the candidate, unexercised here), and
  the slot currently holds a duplicated stock theme.
- Anything the host gets wrong is invisible until someone looks at the screen,
  because the host answers no query about its own palette.

## Constraints

- **Generated from `PAIRS`**, never typed. The precedent is `configFile(pairs)`
  (`scripts/contrast.ts:169`), which already emits a config from the ladder.
- **Both spaces emitted for every colour**, derived (sRGB → linear sRGB → XYZ →
  linear P3 → display P3), because the host stores both and reads one of them
  depending on a preference we do not control.
- **Three colours authored.** Background, foreground, cursor. The 16 ANSI slots
  are either inherited from a snapshot of the theme in force (declared, dated) or
  derived by the host's own `paletteGenerate` — the second is **unverified** and
  must be tested by a relaunch, not assumed.
- **No font, no state file, no daemon.** The pin is a document in a plist; it is
  read at launch and never written by okuda at runtime.
- **Refuse rather than guess.** If the theme id does not resolve, or the plist
  cannot be read, or the rung is not in `PAIRS`, the generator fails closed.

## Related

- `decisions/073-the-glass-inks.md` — absolute luminance is the glass's, the
  relations among roles are okuda's. This ADR names the third case that decision
  left open: the *pair itself* is declared, and it is declared where the glass
  reads it.
- `decisions/090-the-legibility-surface.md` — the ratio is a reading, the pin is
  a declaration read back. Unamended; this ADR is the screen case of that pin.
- `briefs/2026-11-13-brief-launch-contract.md` — amended by this decision: the
  pair leaves argv, the clone keeps document and cwd.
- `scripts/contrast.ts:41` — `PAIRS`, the ladder the pin is generated from.
- `scripts/contrast.ts:22-24` — *"A ratio is a poor proxy for halation; L is
  not."* The pin carries both numbers, so the reader can choose with either.
- The Rex receipt (2026-11-10, Rex Beta 0.1.0, server 0.0.1793981048-g01d6c4;
  extended 2026-11-13): `set_theme` inert with the ownership path excluded, no
  palette readback, one theme action, the custom-theme format as decoded above.
