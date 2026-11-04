---
type: Debrief
callsign: DBF-VARIABLES-TO-INVARIANTS
date: 2026-11-04
briefs: [BRF-PAIR-DELIVERED, BRF-FONT-COVERAGE, BRF-SYMBOL-PLAIN]
---

# Debrief: Two variables taken, and the instrument that caught its author three times

**Status:** Done — `main` is `529ec92` (feat/pre-release fast-forwarded, branch
deleted), `just check` rc=0, 1013 tests. The Omarchy delivery was installed and
**verified by a real theme switch on the live machine**, then the theme was put
back.

## What was asked

Two field reports, a week apart, that turned out to be one law.

1. *Omarchy's theme overrides okuda's colours and the whole thing falls apart.*
2. *The parens should include a g with an arrow above it.*

## What was found

**The ground was a variable we had declined to own.** `ADR-GLASS-INK-073` put
luminance with the terminal — correct, on a machine whose terminal config a human
edits. On a desktop that re-themes itself, the terminal's colours are regenerated
on every keystroke, so a pair pasted into `~/.config/ghostty/config` wins until the
next switch and then loses **silently**. The repair was not an assertion: it was
delivery into Omarchy's own override template, which the thing that changes the
surface re-applies. Verified 2026-11-04: with the desktop theme set to
**flexoki-light** (`#FFFCF0` ground), the regenerated terminal config still said
`#221f1c / #d6cfc4`. The ground did not move.

**The repertoire was a variable we had inherited.** `\vec{g}` emitted
`g` + U+20D7 COMBINING RIGHT ARROW ABOVE, which exists in **one of eight**
monospaced faces measured. A fallback cannot position a combining mark — it
positions only over a base in the *same* font — so on every other face the arrow
was drawn beside the `g`, in a cell okuda had counted as zero. ISO 80000-2 sets
vectors in bold: weight costs no codepoint, is one column by construction, and
survives `NO_COLOR` because the weight channel already does.

The split that made the repair one line was **failure mode, not coverage**:
combining marks are unfixable by any host configuration; single-cell glyphs fall
back acceptably. Measured: JuliaMono 64/64, DejaVu Sans Mono 62/64, Menlo 61/64,
JetBrainsMono NF and Noto 57/64, PT Mono 36/64; intersection across all eight,
22/64. Recommendation: DejaVu Sans Mono (and the only candidate with an official
Nerd Font patch); JuliaMono as the maximum-fidelity alternative.

## The lessons, in order of how much they cost

**1. The instrument caught its author three times, and each error looked like a
reading.** `muted` was tested for *legibility* when its requirement is *rank* — a
reviewer caught it, and the correct measure (`muted ÷ ink`, band 0.13–0.29) had
been on the ground page all along. A "fontconfig on macOS does not see
`~/Library/Fonts`" claim was inferred from an empty charset query instead of read:
fontconfig indexes 2852 paths there, and the font simply lacked the glyph. And
Menlo measured 50/64 because the query took its **Bold** face, which has no box
drawing; Regular measures 61/64. **A measurement that agrees with your hypothesis
deserves the control, not the celebration.**

**2. A reject was the most valuable event in the session.** The review's rejection
of claim 2 (muted) was right and changed the design; its own point 3 was wrong and
the measurement said so. Two corrections in one pass, both recorded, both cheap.
That is what the gate is for and it only works when the claim states the number
that would falsify it.

**3. The law, which is the actual output:** *an external variable whose owner has
no stake in our legibility will be set against us; take it at the host's own
extension point and it stops being a variable.* Both fights were the same shape,
and the test generalises — **can the host's own mechanism still change it?** Yes →
an invariant we own; no → we replaced the host and built a ventilator.

**4. The acceptance rule that keeps the law honest: the gain must be a proof, not
a dial.** The pair arrives through a file Omarchy already rewrites; the repertoire
shrank by a character. Neither added a knob. The moment one of these arrives with
a flag, an env var or a new config file, it has re-acquired a variable and the
law has been inverted in a way that will feel like progress.

**5. The receipt required a second fix nobody asked for.** `probe-surface` read
Omarchy's ghostty config as *"inherits its terminal's defaults"* — wrong twice: it
does inherit a pair, and that pair moves. Following `config-file` includes is what
made the delivery checkable. Without it, the install would have been a claim.

## What it cost, and what is still unproven

- Two instrument bugs on first contact (`fonts`): examples sliced out of SGR
  escapes, and a remote scan that built *local* paths and spawned one ssh
  connection per font — the run aborted. Both found by running it, not by reading
  it.
- `just surface --gate` gated the reference rung only — a check covering a tenth of
  the claim. **Closed 2026-11-04:** it reads every admissible rung now, and the
  reading it produced on first contact is a finding of its own — the order is
  inverted on rungs 3, 4 and 5 (3, 1 and 12 roles), so the gate asserts the floor
  everywhere and the *order* on the reference rung, and prints the rest.
- **Windows is unmeasured.** There is no Windows box in this silo, so Consolas and
  Cascadia are knowledge, not measurement.
- **A pinned ground has an aesthetic cost that is now live:** a light desktop gets
  a dark terminal. Chosen deliberately, and visible on the box the moment a light
  theme is selected.
- A concurrently authored half of the tree (choice-list brief, `decisions/079`,
  the perceptual-emphasis page) landed in the same commit because the derived
  registries hold both halves' rows and cannot be split. Carried, not claimed.

## Built afterwards: the plain repertoire

`BRF-SYMBOL-PLAIN`, landed the same day. `--symbols=plain` / `OKUDA_SYMBOLS=plain`
translates the repertoire above Latin-1 into ASCII and keeps everything a face has
carried since before terminals were a product — box drawing, blocks, Braille,
Latin-1, General Punctuation. **The silcrow stays**: a mark rewritten to `S` would
break the grammar the page is navigated by, which is the line between a mode and a
vandal.

Two properties are *tested*, because both would be plausible claims otherwise: rich
is byte-identical by default (the control runs first), and the substitution
demonstrably runs before layout — no table row out-runs the rule its own `>>`
widened. And the table checks itself against the vocabulary both ways: on first run
it found `≥ ≠ π ζ ⟶` unmapped, codepoints in the glyph table but not yet in the
corpus. That is the two-way check earning its keep inside a minute.

`just fonts` now ends with the escape hatch: how many of the machine's undrawable
codepoints plain mode would translate. The instrument names the deficit and the
remedy in the same breath.

## What this leaves behind

`scripts/font-coverage.ts` (`just fonts`, two readings, local and over ssh),
`scripts/omarchy-theme.ts` (`just ground --omarchy`), `BRF-SYMBOL-PLAIN` waiting to
be built, `docs/2026-11-04-font-coverage.md` as the reading, and one lexicon term
that makes the next fight cost an afternoon instead of a week.
