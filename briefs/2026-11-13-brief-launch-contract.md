---
type: Brief
callsign: BRF-LAUNCH-CONTRACT
---

# Brief: The launch contract — the pair pinned in the host, and the clone hands over document and cwd

**Date:** 2026-11-13
**Status:** Open
**Revised in part, 2026-11-13** — `ADR-PAIR-HAS-A-HOME-092`. The pair leaves
argv and moves into the host's theme slot. Reasons, both measured the same day:
(1) a stored theme carries **both colour spaces** per colour (`display-p3` values
plus an `srgbFallback`) and `Workspace.terminalUsesDisplayP3 = 1`, so an argv
pair is blind to the space it will be read in; (2) `set_theme` was retested as
the *owning client* — still `{}` and inert, and still no readback. Consequences
here: **phase 2 keeps `--pair` as a comparison override only**, and **phase 3
loses the pair crossing**. A clone no longer needs the pair, because the pair is
no longer in a process. The measurement move (phase 1) and the clone's document
and cwd work stand untouched. What replaces the pair crossing is phase 4, below.

## Context

The requirement, in the operator's words: *"in a terminal I want to be able to
control the figure-ground thing … my requirements may change so I require
control"* — plus *"clone a dereferenced document into a new terminal with all the
CWD and stuff"* — plus *"no themes, no fonts, no state, and no shite."*

Three channels exist for the pair, and all three are now measured rather than
argued:

1. **Live, via the host's API.** `com.superlogical.terminal.set_theme` describes
   itself as applying at once *"if the caller owns the block or no client does"*,
   so the earlier inert reading could have been an ownership failure. Retested
   2026-11-13 plain **and** as the owning client (`rex api call -C
   client:01a1d5b3…`): both `{}`, screen colour census unmoved (`#0E1117` at
   2.93–2.99M px of a 5.6M px frame; `screencapture` + `magick histogram`).
   No readback exists: `format` with `format=vt, extra_palette=true` returns
   plain text with no escapes; `rex config` has no theme keys; `rex actions`
   offers one theme action.
2. **At startup, in argv** (`OKUDA_PAIR`). Paints okuda's cells and only those,
   at the cost of bytes inheritance would supply free (`ADR-GLASS-INK-073`);
   unnameable in a sentence; blind to the colour space; one copy per process, so
   two panes can disagree about what "the ground" is.
3. **At startup, in the host's theme slot** (`Workspace.customThemes` +
   `darkThemeID`/`lightThemeID`). The only artifact that can carry the pair *and
   the space it is read in*, and the only lever that reaches every program in
   the pane. `ADR-PAIR-HAS-A-HOME-092` chooses it.

So "control, live or parameterised at startup" resolves to **startup, in the
host** — and okuda's job is to *generate* that declaration from the ladder it
already measures, not to hand-author a palette.

## Objective

1. **The pin** — `just pin <rung>` emits a custom theme carrying the ladder's
   pair (background, foreground, cursor), both colour spaces derived, and the 16
   ANSI slots taken from a declared snapshot rather than authored. It installs
   only through a declared quit → write → relaunch sequence, and refuses while
   Rex is running.
2. **The receipt** — `--pair '#bg/#fg'` and `OKUDA_PAIR` survive as the
   *comparison override*: the card's instrument (`just fgp`), useful when two
   grounds need to be seen side by side in one frame. Not the operating control.
3. **The launch line** — `99` (clone) hands the child the document (absolute)
   and the cwd, in every integration. Two fields, not three.

## The insight this is built on

**`body` is exactly the role that inherits the glass** — `src/palette.ts:80-82`:
*"body "" (no ink) — prose inherits the glass's own … body hex is correct or
catastrophic depending on a background."* The pin does not add anything to
okuda: it fills the role the palette deliberately leaves empty, on the side of
the seam where the glass can read it.

**And the colour space is a property of the artifact, not of the hex.** Every
stored colour carries `display-p3` values and an `srgbFallback`; which one is
read depends on `Workspace.terminalUsesDisplayP3`. A pair that is only two hexes
is therefore an *incomplete* declaration of the figure-ground ratio — and the
theme slot is the only place in the system where the missing half can be stated.

## Evidence

- **The theme format, decoded** (`Workspace.customThemes[0]`, read 2026-11-13):
  `{name, id: "custom-<UUID>", appearance, createdAt, source: {manual:{}},
  palette: {background, foreground, cursor, cursorText, selectionBackground,
  selectionForeground, ansi[16], paletteGenerate: true, paletteHarmonious: true,
  paletteBase: {}, paletteOverrides: {}}}`; every colour
  `{colorSpace: "display-p3", r, g, b, alpha, srgbFallback: {colorSpace: "srgb", …}}`.
  `Workspace.darkThemeID` / `lightThemeID` point at the entry's `id`.
- **The slot the pin must not write:** `Workspace.darkThemeID = merino-dark`
  (a stock theme, so its palette is not in the plist — this is why the ANSI
  slots need a decision, see below); `Workspace.lightThemeID` = a custom entry
  named "Alpine Milk (Duplicated)"; `darkUsesExtendedThemePalette = 1`.
- **The live ground, measured from the screen:** `#0e1117` — merino-dark's
  `#0d1117` as the glass actually emitted it — at 3.11M of 5.62M pixels in a
  `screencapture` of this workspace; ink sampled at `#e4eaf0` against `#e6edf3`
  authored. The difference is the raster and the space, not a different pair.
- **The painting machinery, if the override is used:** `paintLine`
  (`scripts/fgp-card.ts:85`), the reset invariant (`:83`), pinned by
  `tests/fgp-card.test.ts:48-66`; SGR primitives in the library (`bg()`/`fg()`,
  `src/palette.ts:171-181`).
- **The measurement already exists, once:** `ratio`, `luminance`, `oklchL`,
  `PAIRS` (`scripts/contrast.ts:41`, `:97-120`), and the line this whole
  decision turns on: *"A ratio is a poor proxy for halation; L is not. Read
  both."* (`:22-24`).
- **A startup parameter has a precedent, and it is env-shaped:**
  `OKUDA_SYMBOLS=plain`, "the set-once form" (`src/cli.ts:12`, read at `:91`),
  with `--symbols=plain` (`:111`).
- **The crosser threads a cwd, and one third of it is asymmetric.** `cloneArgs`
  (`src/clone.ts:225`) → tmux `-c cwd` (`:258`); `appleScript` does `cd … &&`
  (`:160-168`); **ghostty does not** (`:249-252`); the `cmd` template receives
  `$1` = document only (`:260`).
- **The clone target is already the dereferenced document.** `jumpTo` sets
  `currentFile = path` (`src/tui.ts:1195`); `clone()` clones `currentFile`
  (`:963`). So the clone requirement is *already* met; what it lacks is an
  honest cwd for two integrations.
- **Referees that will move:** `tests/keymap-doc.test.ts` pins `docs/keymap.md`;
  `tests/render.test.ts` pins the `okuda · path` header; `tests/contrast.test.ts`
  pins the ladder's numbers.

## Scope

**In:**

- `scripts/rex-theme.ts`, recipe `just pin [rung] [--variant snapshot|generate]
  [--plan]`: read `PAIRS`, derive both colour spaces, emit the theme entry, and
  print the install sequence. `--plan` never writes; `--install` refuses while
  Rex runs.
- `src/pair.ts`: the measurement (`luminance`, `ratio`, `oklchL`) moves out of
  `scripts/contrast.ts` and is re-exported there, so the ladder's numbers have
  one home and the pin is generated from the same derivation the docs quote.
- `--pair '#bg/#fg'` + `OKUDA_PAIR`, documented as the comparison override.
- Clone: absolute document and cwd in every integration; `$2` = cwd for the
  `cmd` template; the ghostty `cd … &&` it is missing.
- The pin installed in **both** appearance slots, or the appearance switch hands
  the page to a stranger.

**Out, deliberately:**

- **Live control.** Measured inert, ownership path included (see Context). Not
  attempted, not claimed.
- **Fonts.** Never, in any form, in any file.
- **Authored ANSI.** The 16 slots belong to other programs; okuda is truecolor
  (`src/ansi.ts:7`) and never emits them. `--variant snapshot` copies the slots
  from a named theme in force and declares the source and date;
  `--variant generate` leaves the host's own `paletteGenerate` to derive them —
  **unverified**, and the first relaunch is the control.
- **Persistence in okuda.** No `~/.config/okuda/pair`, no last-used, no state
  file. The pin is a document in the host's plist; argv dies with the process.
- **Role remapping.** The pin authors three colours. Headings, lamps and rules
  keep their palette hexes.
- **Cloning a reference you have not opened.** No cursor exists in this reader —
  `jumpTo` takes digits (`src/tui.ts:1185`) and `ADR-LINE-IS-PROSE-078` keeps the
  address at the file. A boundary, not a gap.
- **A compositor.** The gate at `AGENTS.md:27` stands: pane layout is the host's.

## Preconditions

1. `scripts/contrast.ts` may import from `src/` without moving a printed number:
   `just surface`, `just contrast`, `just lightcard`, `just headroom` must be
   byte-identical across the move. **The diff must be empty**; a non-empty diff
   stops the phase.
2. The pin's id is deterministic (`custom-okuda-rung-<n>`) so re-running
   replaces rather than appends. **Unverified:** that the host accepts an id that
   is not a UUID; the first relaunch is the control, and the readback says so if
   it does not resolve.
3. `cfprefsd` owns the domain while Rex runs. A blind `defaults write` is
   therefore refused by the tool, not merely discouraged.

## Work Plan

**Built so far (2026-11-13):** phase 4, the pin — out of order on purpose. It
reads `PAIRS` in place, so it does not wait on the move that phases 1–3 need.
`scripts/rex-theme.ts` emits the entry and the *complete* write (existing themes
merged, not replaced), and `tests/rex-theme.test.ts` pins the conversion, the rung
lookup, the merge, and three fail-closed refusals. `just check` 27/27. What is
**not** yet proved: that the host accepts an id that is not a UUID, and that
`paletteGenerate` fills the 16 slots from a pair. Both need one relaunch.

**Phase 0 — capture the controls.** `just surface`, `just contrast`,
`just lightcard`, `just headroom`, and `okuda docs/help.md --no-color` to `tmp/`,
plus a `screencapture` + histogram of the current ground. Every later phase is
read against these.

**Phase 1 — `src/pair.ts`.** Move the three functions; re-export from
`scripts/contrast.ts`. Add `parsePair` (fail-closed, naming the accepted shape)
and `pairLine`. Referee: phase 0's outputs byte-identical.

**Phase 2 — the override.** `--pair` / `OKUDA_PAIR` paint the ground per line and
set `body`; the header carries the receipt only when a pair is declared;
`--no-color` outranks. Documented as the *comparison* instrument, not the
control.

**Phase 3 — the launch line.** `cloneArgs` passes an absolute document and the
cwd in every integration; ghostty gains `cd … &&`; `cmd` gains `$2` = cwd.
`clone()` supplies `process.cwd()`. Tests assert each spec's argv.

**Phase 4 — the pin.** `scripts/rex-theme.ts`: `PAIRS` → entry (both spaces,
three authored colours, ANSI per variant) → `--plan` prints the sequence. Tests
pin the conversion, the rung lookup, the entry's shape, and the fail-closed
refusals. `just pin-install` does the install: it stages a **detached** installer, asks
Rex to quit, and the installer waits for the exit, writes, reads the pair back
(`just surface-probe`) and relaunches — logging to `/tmp/rex-pin.log`. Detached
because the caller runs in a pane, and the pane dies with the host.

## Acceptance Criteria

1. `just check` green.
2. **Undeclared, byte-identical.** No pair → today's output, byte for byte.
3. **The override survives every reset** when used: one `48;2` per line plus the
   re-application after each internal reset.
4. **The measurement did not fork:** phase 0's four outputs identical;
   `tests/contrast.test.ts` unamended.
5. **The pin derives, it does not type.** For rung 8, the emitted background and
   foreground are `PAIRS[8]`'s, and each colour carries both spaces, with the P3
   triple the sRGB triple converts to — asserted against a hand-computed value.
6. **The pin refuses:** Rex running → refuse and name why; unknown rung → refuse;
   unreadable plist → refuse. No partial write.
7. **The launch line:** for `tmux`, `ghostty`, `cmd` — an absolute document, the
   cwd, and no pair (it lives in the host now).
8. **No state:** no file written by okuda at runtime; the only artifact is the
   plist the operator installs.

## Notes

- **Live is not coming.** The API's own description promised an owner-scoped
  application; the owner-scoped call is a no-op too. Whatever Rex is doing, it
  is not what its documentation says, and reporting that to the beta is worth
  more than another attempt to force it.
- **Why the ANSI slots are the only hard part.** A stock theme's palette lives
  in the app, not the plist, so "inherit" is unavailable: the pin either copies
  a snapshot (a declared shadow) or asks the host to generate (an unverified
  hope). Both are honest; neither is silent.
- **What the pin does not fix:** `terminalUsesDisplayP3` is still a host
  preference nobody can read back, so the *screen* remains the only instrument
  that says which space won. That is why the acceptance test is a screencapture
  histogram, not a number in a document.

## What changed from the first draft of this brief

| part | first draft (same day) | now |
|---|---|---|
| the pair's home | argv (`OKUDA_PAIR`) | the host's theme slot, generated |
| `--pair` | the operating control | the comparison override |
| the clone | document + cwd + pair | document + cwd |
| the measurement move | phase 1 | phase 1, unchanged |
| the new work | — | `scripts/rex-theme.ts` (phase 4) |

## Related

- `decisions/092-the-pair-has-a-home.md` — the decision this brief now serves
- `decisions/073-the-glass-inks.md`, `decisions/090-the-legibility-surface.md`
- `briefs/2026-11-11-brief-fgp-card.md` — the many-pair instrument
- `briefs/2026-11-11-brief-surface-plan.md` — the pair's lifecycle as bytes
- `scripts/contrast.ts:41`, `:169` — `PAIRS` and `configFile`, the generator
  precedent
- `src/palette.ts:80-82`, `:171-181` — `body`, `fg()`, `bg()`
- `src/clone.ts:225-262`, `src/tui.ts:957-981` — the crosser and its caller
