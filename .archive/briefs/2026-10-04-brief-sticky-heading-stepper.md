---
type: Brief
callsign: BRF-STICKY-HEADING-STEPPER
---

# Brief: The sticky-heading stepper — walk a document frame by frame, heading as anchor

**Date:** 2026-10-04
**Status:** Rejected — 2026-10-27, the operator's call: too old, and the corpus has moved on. Archived rather than deleted, so it can be **replundered** if the need returns; the idea is not being judged, only the queue position.
**TD:** (to create)

## Lineage

frame mode (BRF-PAGED-OKUDAGRAM, `01` actuator) — the existing heading-to-heading stepper; the okudagram step (BRF-OKUDAGRAM-STEP) — the one-contiguous-page contract; the reader's report — "stepping through a document header by header"; the scroll-vs-frame distinction — a document on a computer is a scroll, and scrolls scroll at the wrong time; an okudagram is a frame on a wall, stable and discussable.

## Objective

A document navigation mode where the reader steps through the document as a
gallery of frames, one heading at a time. The current heading stays pinned at
the top of the viewport — the structural anchor. Content steps beneath it.
Short sections share a frame; long sections span multiple frames. No section
is ever truncated at the bottom of the glass. The document is not a scroll to
be managed but a gallery to be walked through.

## Problem

A document on a computer is a scroll. Scrolls are unstable — one twitch of
the trackpad and you're three paragraphs away from where you were. You don't
read a scroll; you manage it. Frame mode (`01`) already steps heading to
heading, giving the reader discrete frames instead of continuous scroll. But
two gaps remain:

1. **Long sections are clipped.** A section taller than the viewport shows
   only the first screenful. The reader sees a heading and a fragment, with
   no way to see the rest without switching to slide mode and losing the
   structural anchor. The frame is too small for its content.

2. **Short sections waste glass.** Three two-line sections fill perhaps six
   lines of a sixty-line viewport. Stepping through them one at a time is
   forty keystrokes for eighteen lines of content — the mechanism is louder
   than the material. The glass has room for more frames.

The sticky-heading stepper addresses both: the heading is the constant, the
content steps beneath it, and multiple complete sections share the glass
when they fit.

## Design

### The stepping contract

A document is a gallery of frames. Each heading is a frame label. The reader
steps between frames. The contract:

1. **At a heading:** show the heading + the largest prefix of complete
   sections that fit in the viewport. The heading is sticky — it stays at
   the top of the glass, the frame's label.
2. **Section overflows:** if the current section is taller than the
   remaining viewport, show the heading + the next screenful of that
   section. The heading stays. Next step shows more of the same section —
   one section, multiple frames.
3. **Section exhausted:** advance to the next heading. Repeat from rule 1.
4. **Never truncate at the bottom:** a section that doesn't fit entirely
   within the remaining viewport is deferred to the next step. The bottom
   of the glass is always a section boundary or a soft continuation of an
   overflowing section — never a partial section without its heading.

### What it looks like

```
Step 1:                    Step 2:                    Step 3:
┌──────────────────────┐   ┌──────────────────────┐   ┌──────────────────────┐
│ ## Section One       │   │ ## Section Two       │   │ ## Section Two       │
│ (sticky heading)     │   │ (sticky heading)     │   │ (sticky heading)     │
│                      │   │                      │   │                      │
│ Content of section   │   │ This section is      │   │ ...more content...   │
│ one. Short — fits    │   │ very long. First     │   │ ...still section     │
│ entirely.            │   │ screenful shown.     │   │ two. Last frame.     │
│                      │   │                      │   │                      │
│ ## Section Two       │   │ (content continues   │   │ █ end of section     │
│ (also fits, so it    │   │  beyond glass —      │   │                      │
│  shares the frame)   │   │  next step shows     │   └──────────────────────┘
└──────────────────────┘   │  the next frame)     │
                           └──────────────────────┘
```

### Relationship to frame mode

Frame mode (`01`) partitions the document into heading-delimited sections
(`src/frames.ts`). The sticky-heading stepper adds sub-frame granularity:
within a frame, if the content overflows, additional steps advance within
it before moving to the next heading. A new actuator (e.g., `02`) or a mode
toggle within frame mode.

The okudagram step contract (BRF-OKUDAGRAM-STEP) already guarantees no gaps
in coverage — every line of the document is reachable in at least one step.
The stepper preserves this: no line is skipped, no section is orphaned.

### What it is NOT

- **Not a scroll replacement.** Slide mode (`j`/`k`, arrows) remains for
  free navigation. The stepper is for structured reading — the reader walks
  through the document's argument, not its pixels. Scrolls are continuous
  and boundary-oblivious; steps are discrete and boundary-respecting.
- **Not a TTS mode.** The stepper is visual — the heading stays on screen as
  a persistent structural cue. Audio navigation (the ear) has different
  needs (the heading should be spoken, not pinned).

## Rationale

The heading is the frame's label — the structural promise. When the reader
steps through content, losing sight of the heading is losing the argument's
scaffolding. The sticky heading keeps the label visible — the reader always
knows *which* frame they're looking at, even as the content beneath it
changes.

The "no truncation at bottom" rule is the same principle applied downward:
a section that starts but doesn't finish is a broken frame. Either show it
complete or defer it to the next step.

A document is not a scroll to be managed but a gallery to be walked through.
Each step is a fermata — a deliberate pause at a structural boundary. The
reader sets the tempo; the stepper honours the structure.

## Costs & trade-offs

- **One new actuator** in the reserved block (00–10). `02` is available.
- **Sub-frame state.** The stepper needs to track: current heading index +
  scroll offset within that section. Two integers, no new data structures.
- **Resize behaviour.** On SIGWINCH, recompute: more (or fewer) sections
  may fit in the viewport. The current heading stays pinned; the content
  reflows beneath it.

## Conflicts / Dependencies

- Frame mode (`src/frames.ts`, `01` actuator) — the partition function is
  shared; the stepper is a viewport projection over the same frames.
- BRF-OKUDAGRAM-STEP — the no-gaps contract applies to both modes.
- The dogfood task should exercise this mode once implemented.