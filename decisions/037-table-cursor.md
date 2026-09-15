---
type: ADR
callsign: ADR-TABLE-CURSOR-037
---

# Decision: The table cursor — position within the render, spoken through two registers

**Date:** 2026-09-15
**Status:** Accepted (implementation pending — BRF-SPOKEN-BLOCK-GRAMMAR)

## Context

okuda's vectors have always been document-to-document: jumps between files,
strides between units, never position *inside* a rendered block. Speech has no
re-glance (the speech-driven design, force #3), so a spoken table either says
its headers once and then abandons them — *it counts on you remembering which
row you're in* (Watson) — or repeats every label at O(rows × columns) words.
The survey in `docs/2026-09-15-tables-for-unsighted-listeners.md` found that
the one affordance missing from every CLI in the wild is the ability to
**re-hear the headers**. The 2026-09-15 riff converged on the answer: not a
better flattening, and not a playback controller — a cursor. Navigation
restores re-glance as movement. The reader specified the interaction as a
hold-modifier (*hold it down and the key value pairs are spoken, lift and the
values only*) plus an up/down/left/right grammar inside the table.

## Decision

okuda gains a cursor: **render-relative position state, held as conversation
state, first instantiated at tables** — (row, column) plus a register boolean.
One position, two projections: the glass highlights the cell; the voice speaks
the slice, through the sibling silo over the filesystem bus (ADR-036 holds —
okuda owns the cue, never the voice). The register semantics are realized as a
**chord** — Ctrl+Arrow speaks labels + values (tool-held), bare Arrow speaks
values only (listener-held, the default) — because TTYs emit no key-up events.
From entering a table to leaving it, the table context owns the arrows; exit
releases them to the document stride (BRF-SPEECH-STRIDE). Cell steps always
speak the column label; nothing ever speaks a coordinate. A repeated direction
at the boundary speaks *"edge of table."* On Refresh the cursor resets to
entry — the file is truth.

## Alternatives Considered

| Alternative | Why Rejected |
|-------------|--------------|
| Hold/lift modifier as specified | Terminals do not report key-up; "hold" is unimplementable in the TTY medium — the semantics survive only as a chord |
| Sticky toggle register | A mode — needs announcement, can be left on, misleads on exit; the chord is stateless |
| Two renders of the table for speech | One parse, two emitters: two renders double the parse and fork the third register; the register is conversation state, not channel encoding |
| Spoken coordinates ("Row 5, Column 4") | Taylor: it offloads the map to the listener's memory — labels with values instead |
| Playback controller with skip-past | Deferred: navigation restores re-glance as movement; the static case is elide-announced; do not model transitions you have not heard fail |

## Consequences

**What became easier:**

- Re-glance, restored as movement — the highest-value loss of the spoken medium
  returns without a playback controller.
- The memory boundary between listener and tool becomes negotiable per move —
  Watson's split, made adjustable.
- The cell label rides the changed dimension for free — cell steps get labels
  without paying for a register.

**What became harder:**

- A new state class: render-relative position. It is invalid across re-renders
  by construction (the file is truth), so Refresh must reset it honestly.
- `keygrammar` must learn CSI modifier sequences (`ESC [ 1;5 A`…) — today it
  parses four bare arrow forms and translates scroll wheels.
- Two owners, one key: the arrows are stride-owned outside the table and
  cursor-owned inside. The ownership handoff must be announced at the seam,
  or the trained hand desyncs from the ear.

**Constraints this imposes:**

- No speech code in this repo (ADR-036): the cursor emits position cues; the
  silo utters the slice.
- Elisions and edges are announced, never silent — the mode doctrine (ADR-030)
  generalized to navigation.

## Related

- Brief: `briefs/2026-09-15-brief-spoken-block-grammar.md` (BRF-SPOKEN-BLOCK-GRAMMAR)
- ADR: `decisions/036-no-speech-code.md` (the cue/voice split this cursor lives inside)
- Research: `docs/2026-09-15-tables-for-unsighted-listeners.md` (the survey and its filter)
- Brief: `briefs/2026-09-14-brief-speech-stride.md` (BRF-SPEECH-STRIDE — the arrows seized and released)
- Doc: `docs/2026-09-14-speech-driven-design.md` (force #3, the no-re-glance problem this decides)
