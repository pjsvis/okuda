---
type: Debrief
callsign: DBF-ONE-LAW-FOUR-SCALES
briefs: [BRF-DIAGRAM-WIDTH-HANDOFF]
---

# Debrief: one law, four scales

**Date:** 2026-10-25
**Status:** Done — 21 commits, 803 → 843 tests, `just check` green throughout.
Two items parked with numbers, two recorded and not fixed, one policy reversed
twice in a day. The detail lives in `DBF-DIAGRAM-WIDTH-HANDOFF`, `ADR-069`,
`PLY-BABY-EXTRACTION` and `PLY-MERMAID-DIAGRAMS`; this is the arc.

## What the day was actually about

It arrived as a narrow complaint — *some diagrams work, others report too wide
or elided, the results are not consistent* — and it turned out to be one question
asked four times: **where does this renderer get its width from?**

Four answers, one law. **Wrapping is a claim that the break is insignificant.**
True of prose, false of anything the author wrote as a fixed shape. Every fix
today was that law applied at a new scale, and each scale had been getting it
wrong in a different way.

| scale | the defect | the law's verdict |
|---|---|---|
| **the pane vs the engine** | the diagram canvas was the ambient `$COLUMNS`, then okuda's own budget | layout at the diagram's width, cut at the glass — never refuse |
| **the file vs the read** | a corpus lint demanding one trailing newline | top and tail at the boundary; a file's ending is the filesystem's business |
| **the address** | a reference wrapped and split its own extension | an address elides; a wrapped path is a false name |
| **the viewport** | a withheld document left a void under live chrome | fill the viewport with `…`: the pane's edge is not the document's edge |

## The reversal, and why it was cheap

`2a11837` gave the engine okuda's budget, so a diagram that did not fit was
*refused*. It reached determinism and lost the document: 268 / 374 / 431 / 467 /
467 lines at 80–200 columns — five shapes for one document. Reversed the same
afternoon (`ADR-069`), because a line-count table made the cost visible in a way
an argument could not.

The machinery survived; only the constant was wrong. That is the useful shape of
a cheap reversal: **the defect was never that the canvas was given, it was that
it was ambient.**

## What was added, and what was deleted

Added: the glass invariant (no emitted line exceeds the declared width, over a
ladder from the floor to 120); `MIN_RENDER_WIDTH`, one floor at every door; the
engine-art cache (a resize re-render 61 ms → 13–19 ms, because art is a function
of the diagram and not the pane); `heldViewport`; the address predicate; the
`scoped doubt` lexicon entry; the wrap-law entry; the "when the carrier is
fluent" clause in `PLY-BABY-EXTRACTION`.

Deleted: `measureDiagramWidth` and its doubling ladder; `stubEngine`; `tree-lint`
rule 3 and its helper; and the temptation to keep a type whitelist in code at
all. Every deletion was a thing built, measured, and found to be policing a
property with no consumer or searching for a number already in hand.

## The two reversals of my own work, and what they cost

Both were mine, both caught by measurement rather than argument:

- **the marker stripe** — I marked rows that were blank in view, then defended it
  as "honest because there is content to the right". Eight rows of `…` with
  nothing beside them; the mark lost its authority and cast doubt on the rows
  that were whole. `scoped doubt` is the lexicon entry that came out of it.
- **the trailing-newline lint** — built, made 60× cheaper, then deleted, because
  a stopwatch showed every hazard already renders identically to clean input.

The second one is the day's most expensive lesson: **before writing the next
lint, check whether the mechanism already exists.**

## Measured, not argued

`docs/2026-10-25-test-diagrams.md` at a 120-column pane: **five document shapes**
before, one after. Twelve fences, twelve receipts, zero refusals, zero elisions
of engine output, at every width from 60 to 200. The Art of the day is that the
same table proved a *borrowed* document wrong: an LUT engine premise died on a
stopwatch (4.5 ms of arithmetic in a 65 ms render, ~92% subprocess spawn, against
a resize cost this repo had already fixed by coalescing).

## Left open, with owners

- `BRF-DIAGRAM-HEIGHT-AXIS` — parked with numbers. A legal 61-node `flowchart TB`
  is 303 lines and there is no height policy at all. The brief names the
  structural objection to folding (a fold leaves two remainders neither of which
  stands alone) and what would decide it.
- A path **mid-sentence** still breaks at its delimiters. Cutting inside prose
  would lose the sentence to save the path; recorded, not half-fixed (`edcae79`).
- `Oversize::Cells` and "no parser matched" share one upstream fallback, so a
  diagram too *large* reads as "this family is not drawn". Upstream's gap.
- ~120 tracked `.md` end with no final newline. Operator policy, 2026-10-25:
  repaired on encounter, never gated.

## The line worth keeping

**Enforce a property where it is true, not where it is observed.** A file's ending
is the filesystem's business; the renderer's business is the render. The same move
appeared four times today under four different names, which is how a principle
earns its place rather than being quoted.
