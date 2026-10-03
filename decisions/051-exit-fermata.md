---
type: ADR
callsign: ADR-EXIT-FERMATA-051
---

# Decision: The exit fermata — the drain window is over-determined

**Date:** 2026-10-03 · **Status:** Accepted

## Context

The drain window (BRF-PROLONGED-PRESS, layer 3) was argued as a leak
bound: the lift after the restore is a human planning+motor reaction
(~250 ms) plus one repeat interval (~33 ms at 30 Hz), so 300 ms with
margin. The FOUT fix made the window *visible in a good way*: the
frozen document frame now holds the screen for its duration, and the
restore is the session's last byte.

The operator dogfooded the exit and reported the beat as right *in
itself*: reading is reception and the picker is decision, and the
pause between them sets the reader up for the gear change — *"a pause
sets us up for the next thing."* A rest, not a delay. The content of
the transitional frame beats its duration (the launcher-FUT lesson,
`briefs/2026-08-28-brief-launcher-fut.md`, applied to the exit), and
here the content is the last thing read.

## Decision

The drain window is a **fermata** — a deliberate, contentful held
frame at a mode boundary. Its constant is **over-determined**: two
unrelated justifications (a leak bound; a gear-change beat) arrive at
one number, 300 ms. Consequences:

1. **Never optimize the beat away.** Either justification alone
   sustains the window; the fermata adds that shrinking it below
   perception is a *cost*, not only a saving.
2. **Consistency is load-bearing.** Every exit path — `q`, `00`,
   Ctrl-C — carries the same beat, or the pause reads as a glitch
   rather than a hold. A beat that varies is latency.
3. **The held frame must be contentful.** An empty or partial frame
   during the window is a FOUT, not a fermata; the frozen document is
   the point.

## The principle, and its inverse

**The reader's tempo is part of the interface.** okuda's no-clock rule
is the principle applied to input — the reader's tempo is never an
input to the grammar. The fermata is the principle applied to the
boundary — the gear change is given a beat. The operator's report of a
fast diffusion substrate (*Mercury*) is the principle *violated* on
output: responses arrived before the breath was taken, each arrival
was itself a demand for attention, urgency accumulated across the
session, and the result was exhaustion. **Throughput beyond intake
capacity does not read as speed; it reads as pressure** — queue depth
at the human. The fix is not slowness; it is breath built into the
exchange. Speed with fermatas is sustainable; speed without them is
debt.

## Related

- BRF-PROLONGED-PRESS — the drain window this ADR over-determines
- `briefs/2026-08-28-brief-launcher-fut.md` — the transitional-frame
  lesson, entry side
- ADR-UNIVERSAL-ELISION-050 — the sibling "what the terminal feels"
  decision: elision governs overflow, the fermata governs time
