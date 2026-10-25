---
type: Brief
callsign: BRF-DIAGRAM-HEIGHT-AXIS
---

# Brief: The height axis has no policy at all

**Date:** 2026-10-25
**Status:** Parked — the defect is measured and real, and **nothing in the silo
is currently hurt by it**. Parked deliberately, with the numbers below, so that
the next session does not rediscover it as a surprise or invent a policy for it
without them.

## Context

`ADR-PANE-NOT-CANVAS-069` settled the horizontal question: a preformatted block
is laid out at its own canvas and elided at the glass, so its **width** never
changes what exists and the document's rhythm survives a resize.

The vertical axis has no such policy, and never has had one. `src/render.ts`
emits a diagram block's art at full height, whatever that height is. There is no
cap, no fold, no receipt — `diagramBlock` reads `art.split("\n")` and emits every
line it finds.

Measured, at the generous canvas (`mermaid-tui -w 2048`, so these are the
layouts' own heights):

| `flowchart TB` chain | art lines |
|---|---|
| 10 nodes | 54 |
| 20 nodes | 104 |
| 30 nodes | 154 |
| 40 nodes | 204 |
| 61 nodes (legal: `MAX_NODES` is 128) | 309 |

Roughly **five lines per node**, and the parser's own ceiling permits a diagram
four times taller than the worst one above. A single fence can therefore occupy
more vertical space than the rest of the document put together.

**Exposure today: one document.** Sweeping every `.md` in the silo for a diagram
block of 40 lines or more returns exactly one hit — `docs/2026-10-25-test-diagrams.md`,
the instrument built to find width defects. No real document is currently
suffering. That is the whole reason this is parked rather than solved: the width
defect was costing the operator a visible annoyance every session, and this one
costs nothing yet.

## Why this is not just "elision, upwards"

The width cut loses a **contiguous tail**: the right-hand end of every line. The
loss is one-sided, it is marked once per line, and `needs N cols` tells the
reader exactly what would restore it.

The structural reason that is *acceptable* is **scoped doubt**: a marker
disclaims the row it sits on and thereby licenses belief in the rows it does
not. A right-hand cut preserves a contiguous, readable prefix on every row, so
the marker scopes exactly the doubt and the remainder is whole.

**A vertical fold cannot do that.** It removes a band, leaving two pieces
neither of which is a readable diagram — the top half of a flowchart is not
half a flowchart, it is a set of boxes whose arrows leave the frame. The marker
would have to disclaim both remainders at once, which is the same licence
failure as marking rows with nothing to mark: doubt spread over everything
means the artefact earns trust for nothing. This is a sharper objection than
"the middle is usually the point", and it is the one that makes the two axes
different problems wearing similar clothes:

| policy | what the reader gets | what is lost | marker's licence |
|---|---|---|---|
| **fold** (head … tail, `⋮ N lines elided ⋮`) | both ends, one gap | the body — and the legibility of both remainders | **none**: neither piece stands alone |
| **cap and refuse** | a one-line receipt | everything — exactly the mistake `2a11837` made on the *other* axis, reversed the same day | n/a: nothing to trust, nothing to doubt |
| **no policy** (today) | all of it | nothing, but the document's rhythm | n/a |
| **scroll is the answer** | all of it | nothing — but 309 lines of art between two paragraphs is a structural failure of the *document*, not of the renderer | n/a |

So the constraint any answer must satisfy is not "keep it short" but **leave a
remainder that can be believed on its own terms**.

## The question the brief poses, and refuses to answer

**Is an over-tall diagram the renderer's problem or the author's?**

The style guide already says *split by view, not by scissors*, and the diagram
playbook already says the sweet spot is under ~30 nodes. If those hold, the
renderer's job is only to make the failure **visible**, which it already does: a
309-line diagram is not subtle. A renderer cap would then be a second opinion
about a document's shape — the error `2a11837`'s sibling made about width, where
the renderer decided what should exist.

The counter-argument is the one that won on width: the *reader* of a document is
not its author, and a reader who must scroll three screens to reach the next
paragraph has been handed the author's problem.

## What would decide it

Any one of these settles the question; none exists yet:

1. **A real document hits it.** Not the fixture. One fence occupying more than a
   screen in something someone reads.
2. **The operator wants to author one.** A genuinely tall diagram — a long
   pipeline, a deep state machine — with a stated preference about what it should
   look like when it does not fit.
3. **A probe of reader behaviour.** The TUI knows the pane height
   (`terminalRows()`, `src/width.ts`); nothing currently measures how often a
   diagram block exceeds it. That measurement is cheap and would turn this from
   an argument into a reading — it is the obvious first instrument, and the
   obvious reason to park rather than legislate.

## Out of scope

- Width. Settled. `ADR-PANE-NOT-CANVAS-069`.
- Table height. A wrapped row block is already bounded by its content and by
  `ADR-TABLE-EDGE-CUT-055`; it is not the same animal.
- Scroll behaviour in the TUI, which is a host concern — *window where the text
  appears belongs to Herdr*, per the three concerns.
