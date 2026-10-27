---
type: Brief
callsign: BRF-DOC-SEARCH-FERMATA
---

# Brief: The doc→search fermata — a held frame at the reading/searching boundary

**Date:** 2026-10-03
**Status:** Rejected — 2026-10-27, the operator's call: too old, and the corpus has moved on. Archived rather than deleted, so it can be **replundered** if the need returns; the idea is not being judged, only the queue position.
**TD:** (to create)

## Lineage

ADR-EXIT-FERMATA-051 (the exit fermata — frozen document frame, 300ms, over-determined: leak bound + gear-change beat); the operator's dogfood report (the doc→search transition needs a beat); Mercury tempo (the protocol registry — throughput beyond intake reads as urgency, not speed; fermatas are breath built into the exchange).

## Objective

Insert a deliberate held frame between the document view and the search view —
a fermata. When the reader signals "return to search," the document freezes on
screen. Any keypress dismisses the fermata and hands off to the search view.
No clock. The reader's tempo controls the beat.

## Problem

The current doc→search transition is a hard cut: document vanishes, search
query box appears. The reader is yanked from intake (reading mode) to
intent-formation (search mode) with no beat between them. This is the same
class of failure the exit fermata fixed — a mode boundary without a held frame
reads as a gear-grind, not a transition.

Reading and searching are different cognitive acts. Intake is passive;
query-formation is active. The moment between them — "I've finished reading;
what do I want to find next?" — is where the reader's intent forms. A hard
cut denies that moment. A fermata honours it.

The operator's dogfood report confirms the beat works: a pause before the
decision surface. The exit fermata proved the principle; this extends it to
the other major mode boundary in the system.

## Design

### What it looks like

1. Reader presses the return-to-search key while viewing a document
2. The document frame freezes — the last rendered view stays on screen, exactly
   as it was, no animation, no dimming
3. Any keypress dismisses the fermata
4. The search view appears

### What it is NOT

- **Not a clock.** No timeout, no minimum duration. The reader dismisses it.
  A timed fermata would punish the fast reader (latency) and rush the slow one
  (pressure). This is consistent with the clock-free design: the fermata is a
  state that waits for input, not a timer that expires.
- **Not a modal.** No "press any key to continue" banner, no overlay, no
  instructional text. The frozen frame is the signal. The reader learns the
  gesture once and it becomes invisible.
- **Not a new view.** The fermata is the document view, frozen — not a
  separate screen, not a dimmed version, not a transition animation.

### Scope boundary

The fermata itself is **rendering** — okuda's domain. okuda holds the frozen
frame and waits for the dismissal keypress. The handoff to the search view is
**windowing** — Herdr's domain. The protocol: okuda signals "fermata dismissed"
to the host, and the host opens the search pane.

This is the same boundary contract as the exit fermata: okuda owns the held
frame; the environment owns what happens after.

### The key that enters the fermata

The existing "return to search" keypress triggers the fermata instead of the
immediate cut. The fermata's dismissal keypress is *any key* — the reader
presses their next search key and it both dismisses the fermata AND lands as
the first character in the query box. (Alternative: the dismissal key is
consumed and the query box opens empty. The difference is whether the first
search keystroke doubles as the dismissal gesture. Both are defensible; the
dogfood should decide.)

## Rationale

The exit fermata (ADR-051) established the pattern: a mode boundary without a
held frame is a gear-grind. The exit boundary (document → shell) and the
search boundary (document → query) are the same class of transition — the
reader leaves the document for a decision surface. If one deserves a fermata,
both do.

The Mercury tempo principle names why: throughput beyond intake reads as
urgency, not speed. Speed with fermatas is sustainable; speed without them is
debt — the reader's cognitive queue backs up with no beat to process.

## Costs & trade-offs

**One extra keypress per search return.** The reader who wants to search
immediately must press their search key *then* any key to dismiss. This is
one keystroke more than today. The justification: that keystroke IS the beat —
the fermata costs exactly what it provides, and the reader who skips the beat
(instant double-tap) is not delayed in any measurable sense.

**The dismissal key as first search character** eliminates the extra
keystroke but couples the fermata dismissal to the search input. The coupling
is elegant (one gesture, two effects) but fragile (the reader must understand
the first key goes to the query box). The dogfood should compare both modes.

**A pending search key during the fermata** — if the reader presses `s` to
dismiss, and `s` is consumed by the search box, the fermata was invisible.
If `s` is NOT consumed, the reader pressed a key that vanished. The choice
affects whether the fermata feels like a beat or a barrier.

## Conflicts / Dependencies

- ADR-EXIT-FERMATA-051: the precedent — same mechanism, different boundary
- Herdr/launcher handoff: the fermata dismissal signal must reach the host
- The dogfood task should exercise this transition once implemented

## Open questions

1. **Dismissal key consumed or forwarded?** To the search box or swallowed?
2. **Does the fermata fire on every doc→search return, or only after a
   minimum read duration?** (A 2-second document view might not earn a beat.)
3. **Visual distinction:** should the frozen frame carry any subtle indicator
   that it is not the live document view? (e.g., the RHS chip changes colour,
   or the terminator line gains a glyph.) The current proposal is "none" —
   the frozen frame is identical, and the absence of scroll response is the
   only signal beyond the first encounter.