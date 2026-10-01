---
type: Brief
callsign: BRF-READING-FRACTION
date: 2026-10-01
---

# Brief: The reading fraction — a meter for the glass, from the state the glass already holds

**Created:** 2026-10-01
**Status:** Open — brief only; the task is written when the work starts
(the operator's method, unchanged from BRF-SILCROW-PATHS: *"each step has
its own wrinkles, that we have not discerned yet"*).
**Lineage:** the operator, verbatim: *"now that we have code files in our
render, and looking gorgeous, I might add, we should maybe give people a
percentage meter to show how much more gorgeouseness there is"* — *"this
is a moment where we figured we needed an indicator"* — *"and the shape
emerged from the stuff we already have"* — *"thus justifying the one step
at a time, bearing in mind the one after that, principle."*
**Extends:** ADR-007 (Glow is the visual reference — this time it
diverges not at all), BRF-CODE-SHELF (the code renders that made lengths
worth measuring), ADR-047 (the receipt that ends every main render),
ADR-049/BRF-SILCROW-PATHS (Ring B — the step that doubled the documents
worth diving into).
**Grounding:** `docs/2026-09-04-the-silcrow.md` — the main document is
*the expedition instrument*; the meter is the instrument's compass
reading, the last element of the two-render contract's instrument set.

## Objective

The footer carries a muted `NN%` **reading fraction**: how far through
the render on the glass the reader stands. It reads state the renderer
already maintains — `scroll`/`maxScroll` from the viewport slice
(`viewport()`, `src/tui.ts:213`, pure, exported, tested) — one readout,
one substrate, nothing derived twice.

## Why — the need was manufactured by the steps before it

The principle, demonstrated by the record and named by the operator at
the moment of its proof: **one step at a time, bearing in mind the one
after that.** A meter for a 40-line document is noise. Then code files
entered the render (BRF-CODE-SHELF) — and a wrapped `src/tui.ts` is
2,000 lines of glass. Then the References receipt ended every main
render (ADR-047), adding honest length beneath the author's last word.
Then Ring B made the corpus's bare `docs/x.md` citations paintable —
and the expeditions multiplied. No one could have specced this meter
before code files existed; now it is obvious. That is the system
producing its next need — the need is not invented, it is *discovered
by the previous step*, and this brief is the receipt for that
discovery.

**Glow precedent:** Glow puts the percentage beside the Help badge.
ADR-007's divergence test — diverge only for an okuda thing — is
satisfied trivially: this is the reference's own placement, adopted.
The footer's right end already carries `? help`; the meter slots in
beside it, affordance and state sharing the perimeter.

## The rulings (settled in analysis, 2026-10-01, before this brief)

1. **The meter measures the render, never the source.** `scroll` /
   `maxScroll` is the glass's own state: receipt included (ADR-047),
   dereferenced-clean included (the two-render contract), wrapped code
   included. A meter over source *bytes* would say 100% while the
   receipt still stands on screen below — a lie by two definitions. One
   substrate: the state that exists.

2. **Muted paint, never rose and bold.** The channel grammar is
   settled: rose+bold is the control channel, reserved for what is
   actuable ("a control among information"). The meter responds to
   input but is not actuable — it is a state glyph, a speedometer, not a
   steering wheel. Muted, like provenance; `NN%`, the `%` sign keeping
   the number out of the vector space's grammar.

3. **A document that fits hides the slot.** `maxScroll = 0`: nothing
   remains to reveal, and a pinned `100%` is noise answering a question
   nobody asked. Hide the slot; the footer collapses, as it already
   does for absent identity segments.

4. **Resize honesty is already paid.** `proportionalScroll` preserves
   the reading fraction across reflow, and ADR-046's repaint follows
   the glass. The meter cannot lie through a resize — it reads the
   state that reflow preserves. Nothing new to keep true.

## Design sketch

`footerLine` (`src/tui.ts`) gains a fraction slot in the right zone,
beside `? help`. The percentage derives in the same place the viewport
slice is taken — the renderer's one honest seam between the buffer and
the glass. TUI only, like the footer itself; piped renders unchanged.
Under `NO_COLOR` the glyph renders plain, like every muted channel.
Dereferenced renders meter their own glass — the fraction follows
whatever document the glass holds, no map, no contract change.

## Ship order

1. **The footer slot + unit tests** — fraction math (0% at top, 100% at
   the last scroll step), the hide case, deref renders, `NO_COLOR`
   plainness, the receipt-included assertion (a doc with a generated
   section meters further than its source length). Own commit.
2. **The glass pass** — may ride Ring B's already-owed pass
   (DBF-SILCROW-RING-B): one sitting, two features at the keyboard.

## Scope

**In:** `footerLine`, the readout at the viewport seam, tests, this
brief.

**Out:** a scrollbar channel (a block-glyph column — a new paint class
and a width claim on the render; its own argument if ever wanted);
recital progress (`&speak` — the ear's meter is a different sense, and
ADR-036's cast principle applies); the launcher (no reading, no
fraction); time-to-read estimates (a guess dressed as a measurement);
a source-byte percentage (ruling 1 forbids it).

## Preconditions

- [x] **P-1 — the state exists, verified in code:** `viewport()` at
  `src/tui.ts:213` returns exactly `{ visible, maxScroll, scroll }`,
  pure, exported, tested. The shape emerged from the stuff we already
  have — because the stuff was built to be honest first.
- [ ] **P-2 — the glass pass** — shared with Ring B's owed pass, or its
  own; the operator's evening decides.

## Risks

| Risk | Exposure |
|---|---|
| The meter claims precision it lacks (line-fraction, not byte- or word-fraction) | A line is the render's atom — the glass is made of lines. The claim is "how much glass remains," which is exactly true. Word-fraction is a refinement nobody is owed. |
| The receipt inflates the fraction (reading "100%" lands on the receipt, not the author's last word) | Honest by ruling 1: the receipt is part of the render the reader scrolls. The meter meters what is; the document's last word was ADR-047's trade, taken knowingly. |
| Doubled duty with the two-digit space (`NN%` reads like a vector?) | The `%` disambiguates, and vectors are painted rose on the main document — two channels, no collision. Watch at the glass (P-2). |
| A second substrate creeps in later (byte meter for X, line meter for Y) | Ruling 1 names the one substrate; a second meter is a new decision, not a patch. The two-lists disease is already dead twice in this silo. |

## Related

- ADR-007 — the visual reference, honored by adoption this time
- ADR-047, ADR-049, BRF-CODE-SHELF, BRF-SILCROW-PATHS — the steps that
  manufactured the need; this brief is the receipt for the principle
  that ordered them
- DBF-SILCROW-RING-B — the glass pass this may share
- `docs/2026-09-04-the-silcrow.md` — the expedition instrument this
  completes
