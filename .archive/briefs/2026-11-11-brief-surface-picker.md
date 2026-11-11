---
type: Brief
callsign: BRF-SURFACE-PICKER
---

# Brief: The surface picker — calibrate the figure-ground pair interactively, commit it to the pin

**Date:** 2026-11-11
**Status:** Rejected (2026-11-11, split: the invariant landed as BRF-SURFACE-PLAN, the TUI refused for want of a warrant)

---

## Why it was refused

The invariant in this brief is real and now lives in **BRF-SURFACE-PLAN**; the
instrument it was written to justify does not. Four reasons, in the order they
were decisive:

1. **The commit path could write a pair the gate refuses.** Of the ten rungs, three
   have inverted orders on the machine's own reading (3, 1 and 12 crossings) and
   one is refused outright (`scripts/contrast.ts`, *reads as emitted light*).
   `Enter` would call the pin's install path, and `--verify` would then report
   `HELD` — a refused pair, faithfully pinned.
2. **The warrant was missing, and the host at hand fails it.** The brief's own
   precondition rejects it without a pasted receipt, and the pane in which the
   brief was reviewed answers no `OSC 10`/`OSC 11` query at all (measured
   2026-11-11). The Notes' fallback — a display of numbers with a commit on
   `Enter` — concedes the Objective, which is the instant flip.
3. **It would have been the fourth writer of the same value**: the ladder's own
   comments, `scripts/omarchy-theme.ts`, `scripts/herdr-theme.ts`, and a TUI. Two
   places that write one pin drift, and that is arithmetic rather than taste
   (`explainers/colours.md`, *the test for a host that calls itself a terminal*).
4. **Craft in safety's clothes.** Every invariant this brief names needs no TUI —
   the enter order, the fail-closed `inherit`, the exact give-back string, the
   exit order. The footer readout, the two corpora and the five key bindings were
   craft, and nothing in the gate could hold them.

**The trigger that would reopen it:** a named person who must *choose* a pair and
cannot edit a config file. "A second person, a third machine" is not that trigger —
a second person needs the pin, and `just ground` already prints it.

---

## Context

The figure-ground pair (FGP) — the terminal's `foreground` and `background` —
determines legibility. okuda's role hexes are tuned for one ground
(`ADR-GLASS-INK-073`), and the renderer ships `body: ""` (no ink, inherits the
glass's foreground) because a body hex is right or catastrophic depending on a
background the renderer cannot query. The pair is the terminal's value, and
`ADR-GLASS-INK-073` closed the brightness family on that boundary: no
renderer-side luminance knob, no `OSC 10`/`OSC 11` from the stdout path.

What is missing is not a measurement — the silo has three instruments
(`ADR-LEGIBILITY-SURFACE-090`): `just headroom` (the order of failure as light
drops), `just ground --verify` (the pin read back), and `just lightcard` (the
derived light card). And it has the ladder (`docs/2026-10-28-the-ground-you-read-on.md`):
ten pairs, each measured for ratio, OKLCH lightness, `muted` contrast, and
`share` (muted ÷ ink), with verdicts from a live reader.

What is missing is **a picker**: an interactive instrument that enters the
alt-screen, renders okuda's actual output against a chosen pair, lets the user
flip between pairs with a keystroke, and commits the chosen pair to the pin on
exit. The ladder's method — "uncomment two lines, reload, look" — is a manual
picker made of comments and a reload key. It works for one person who already
knows the answer. It does not work for a second person, a third machine, or a
different room.

## Objective

Build a TUI that calibrates the FGP: the user sees okuda's rendered output
against each candidate pair, flips between them live, and commits the choice to
the pin file — all within the alt-screen, leaving the terminal however it wants
until the user closes it.

## Evidence

The instruments and their measurements that gate this work:

| instrument | what it measures | finding |
|---|---|---|
| `scripts/contrast.ts` (`just contrast`) | ratio, L, rules, share per pair | ten pairs; rung 8 (`#221f1c` / `#d6cfc4`) is "best so far" at 10.6:1 |
| `scripts/probe-osc.ts` (`just probe-osc`) | can the ground be read and written? | `OWNED-ABLE` — the pair can be taken and given back byte-for-byte |
| `scripts/omarchy-theme.ts` (`--install`) | the pin, written to the re-themer's override | writes the override; `--verify` reads it back: `HELD`, `STALE`, or `UNREADABLE` |
| `docs/2026-10-28-the-ground-you-read-on.md` | the ladder, with live verdicts | the ground is the lever, not the ink; comfort band is ground L 0.24–0.26 at 10–11:1 |

The probe's receipt is the warrant: `OSC 11;?` / `OSC 10;?` are answered on the
hosts we run on, and the set takes effect and the restore returns the host's own
value. Without that, the picker could not flip pairs live — it would be the
ladder with a paint job.

## Scope

**In:**

- A TUI program (`scripts/surface-picker.ts`, recipe `just pick`) that:
  - Enters the alt-screen, takes raw mode, owns the terminal state.
  - Reads the host's current pair at entry (`OSC 11;?` / `OSC 10;?`) — the
    give-back.
  - Renders okuda's output against the current pair — two corpora:
    `docs/style-guide.md` (prose, the demo of itself) and `&briefs.md` (tables,
    amber keys, rules), the two the ground doc already names.
  - Flips between the ladder's ten pairs with `j`/`k` (or arrow keys), writing
    `OSC 11;<bg>` and `OSC 10;<fg>` per flip. The change is instant — `OSC`
    changes the paper, not the cells.
  - Paints a footer readout per pair: the rung number, the pair's hex values,
    and the four numbers from `contrast.ts` (ratio, L, rules, share).
  - On `Enter`, commits the chosen pair to the pin via
    `scripts/omarchy-theme.ts` (the same `--install` path the gate reads back).
  - On `q` / Ctrl-C / Esc, restores the host's original pair and exits the
    alt-screen. No residue.

- The `surfacePlan` module (`src/surface-plan.ts`) — the pure lifecycle bytes:
  `surfacePlan(host, pair) → { enter: string[]; leave: string[] }` and
  `surfaceCommand(host, pair) → "own" | "inherit"`. This is the module
  `BRF-OWN-SURFACE` Phase 1 specifies, exercised first in the picker where every
  pair change is visible to the user.

- Tests for `surfacePlan`: the enter order (read → trust → set fg → set bg), the
  leave order (restore fg → restore bg → `EXIT_ALT`), the refusal cases (no
  read, a multiplexer marker, no tty), and that `surfacePlan` emits nothing when
  the verdict is `inherit`.

**Out, deliberately:**

- **The stdout renderer.** `okuda <file>` inherits, as today. The picker is a
  program that takes the surface; the renderer is a pure function.
- **Session enforcement.** That is `BRF-OWN-SURFACE` (Phase 2), which uses the
  same `surfacePlan` to hold the pair during a reading session. This brief builds
  the calibration instrument; `BRF-OWN-SURFACE` builds the runtime. Both use the
  same probe, the same lifecycle, the same give-back discipline.
- **Cell-level backgrounds.** `OSC 11` changes the paper; it does not paint
  cells. `code-background` stays empty.
- **Multiplexer passthrough.** Under `$TMUX`, `$STY`, Herdr's pane env, or
  `$ZELLIJ`, the picker refuses and inherits: the blast radius is panes we do
  not own.
- **A light-theme picker.** The dark palette is what ships. The light card
  (`scripts/lightcard.ts`) is a prover with no consumer. When a second identity
  is spent, the picker gains a `--light` mode. Not before.
- **Ambient-light detection or auto-selection.** The ground doc's finding is
  that the comfort band is narrow and the only honest method is comparison
  against a fixed reference. A picker that auto-selected would guess at a
  perceptual question the user answers in ten seconds by looking.
- **`OSC 4` (palette entries), `OSC 12` (cursor), `OSC 110/111`
  (reset-to-initial).** Only the two defaults, so the pair is exactly what the
  gates measure.

## Preconditions

1. `bun scripts/probe-osc.ts --set` run **in a real pane** on at least one
   host, reporting `OWNED-ABLE`. Paste the receipt into this brief when it
   lands. If the probe says `NO REPLY` or `NOT OWNED-ABLE`, this brief is
   rejected — not parked — and the pin remains the only mechanism.
2. `scripts/contrast.ts` and its `PAIRS` array are current — the picker renders
   the same ladder the ground doc measures.
3. `scripts/omarchy-theme.ts --install` writes the pin and `--verify` reads it
   back on the target host (Omarchy). On a host without Omarchy, the picker
   writes `~/.config/ghostty/config` or prints the paste block.

## Work Plan

**Phase 1 — the lifecycle, as bytes.** `src/surface-plan.ts` exports
`surfacePlan(host, pair) → { enter: string[]; leave: string[] }` and
`surfaceCommand(host, pair) → "own" | "inherit"`. Tests assert: the enter order
(read → trust → set fg → set bg), the leave order (restore fg → restore bg →
`EXIT_ALT`), the refusal cases (no read, a multiplexer marker, no tty), and that
`surfacePlan` emits no byte when the verdict is `inherit`. This is
`BRF-OWN-SURFACE` Phase 1, lifted into its own module so the picker and the
session enforcement share one lifecycle.

**Phase 2 — the picker TUI.** `scripts/surface-picker.ts` enters the alt-screen,
reads the host's pair (the give-back), renders the two corpora through
`renderDocument` (the renderer is called, not duplicated), and listens for
keystrokes:

- `j` / `↓` — next pair down the ladder
- `k` / `↑` — previous pair up the ladder
- `g` — pair 0 (the control, the terminal's default)
- `G` — last pair (the floor test)
- `Enter` — commit the current pair to the pin and exit
- `q` / `Ctrl-C` / `Esc` — restore the host's original pair and exit

Each pair change writes `OSC 11;<bg>` + `OSC 10;<fg>` (from `surfacePlan`'s
enter bytes, minus the initial read), and the re-render is instant because the
paper changed, not the cells. The footer readout shows the rung number, hex
values, and the four numbers from `contrast.ts`.

**Phase 3 — the commit, the recipe, the registry.** On `Enter`, the picker
calls `omarchy-theme.ts`'s install function with the chosen rung's pair. On a
host without Omarchy, it writes the Ghostty config directly or prints the paste
block. A `just pick` recipe is added to the justfile. The picker is registered
in the briefs INDEX. A debrief records the first reader's verdicts and whether
the picker's choice matched the ladder's.

## Acceptance Criteria

1. `gates.sh` green, including a new `surface` gate running the Phase 1 pure
   tests.
2. `surfacePlan` emits **no byte** when the verdict is `inherit` — asserted, not
   assumed. A fail-closed path that emits a read is still a state change.
3. The exit order is exactly: restore fg → restore bg → `EXIT_ALT`. A test pins
   the sequence, because the FOUT fix is one level down and this is the same bug.
4. The pair restored is the **string** the host sent (`rgb:…`), not a
   re-serialised hex; a test covers the `rgb:` and `#rrggbb` spellings.
5. `Esc` / `q` / Ctrl-C all restore the host's original pair and exit the
   alt-screen — no residue, no lingering alt-screen, no raw mode left on.
6. On `Enter`, the chosen pair is written to the pin file (Omarchy override on
   Omarchy; Ghostty config elsewhere), and `just ground --verify` reads `HELD`
   on the next run.
7. On a host that answers nothing, the picker is indistinguishable from
   `okuda docs/style-guide.md --tui` — no set, no restore, no residue, one debug
   line naming the skip.
8. Under a multiplexer (`$TMUX`, `$STY`, Herdr, Zellij), the picker refuses and
   inherits — one line naming the refusal, no set attempted.
9. The footer readout's numbers match `just contrast` for the current rung —
   asserted by a test that feeds the picker's `pairFor(n)` to `contrast.ts`'s
   `surfaceText`.

## Notes

- **The picker is the shakedown for `BRF-OWN-SURFACE`.** The `surfacePlan`
  module is shared. Building the picker first exercises the OSC read/write/
  restore path in a context where every pair change is visible to the user —
  the safest possible shakedown for the session enforcement that follows.
- **The renderer is called, not duplicated.** The picker renders through
  `renderDocument` (`src/render.ts`), the same function `okuda <file>` uses. The
  test document is okuda's actual output — headings in blue, code in amber,
  rules in muted, state glyphs — against the ground the user is choosing. The
  user sees what their reading will look like, not a synthetic card.
- **The read is the seam, and its cost is real.** `OSC 11;?` is async, needs a
  timeout (the probe's default is 150ms; the picker should be tighter), and can
  be answered by the wrong party (a multiplexer that proxies silently). The
  multiplexer check is an environment test, not a fact about the reply — so the
  picker refuses under a multiplexer rather than trusting the answer.
- **Do not pick the pair from the read out of politeness.** The read tells us
  what the host had; the *card* is chosen from the ladder, because those are the
  pairs the gates measure. Using the host's own pair would be inheriting with
  extra steps.
- **`SIGKILL` residue is a wash.** It leaves the alt-screen up and raw mode on,
  exactly as it would leave the pair set, and the remedy is the same: `reset`.
  The picker's `finally` block restores on every path it controls; what it
  cannot control is the one the alt-screen already carries.
- **The one-line fix if the probe fails.** If `probe-osc.ts` says `NO REPLY` or
  `NOT OWNED-ABLE`, the picker cannot flip pairs live. The fallback is the
  ladder's existing method: print the paste block, let the user uncomment and
  reload manually. The picker becomes a display of the ladder's numbers and a
  commit-on-Enter that writes the chosen pair to the pin — still useful, still
  better than the manual walk, just not instant.

## Related

- `decisions/073-the-glass-owns-its-ink.md` — the boundary this picker operates
  within: the pair is the terminal's; the picker takes it for the duration of
  calibration and gives it back
- `decisions/090-the-legibility-surface.md` — the three instruments; the picker
  is the fourth: the one that turns measurement into choice
- `briefs/2026-11-05-brief-own-surface.md` — the session enforcement this
  picker is the shakedown for; shares `surfacePlan` and the probe
- `briefs/2026-11-03-brief-pair-delivered.md` — the pin; the picker's commit
  target
- `scripts/contrast.ts` — the ladder; the picker's data source
- `scripts/probe-osc.ts` — the warrant; the picker's precondition
- `scripts/tty-card.sh` — the surface card; the picker's sibling (shows
  invariants; the picker shows pairs)
- `docs/2026-10-28-the-ground-you-read-on.md` — the ladder, with verdicts; the
  picker's method made interactive
