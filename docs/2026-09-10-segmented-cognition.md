# Segmented cognition — the grammar's anatomy

**Date:** 2026-09-10
**Type:** design note (the keyboard grammar read as motor segmentation; born from dogfood, not from the design rationale)
**Status:** The operator's insight, recorded with the analysis it prompted.

---

## The insight, and where it came from

Realised in the dogfood, independent of every prior keyboard discussion: **you cannot rush and overshoot using these keys.** There is always a buffer that stops an inadvertent state or mode change. Speed is safe here — the machine refuses to convert haste into state error.

The provenance matters. The keyboard-controls doc (`docs/2026-09-05-keyboard-controls.md`) records the rationale for the keys; the insight is not in it. It surfaced in use: hands moving fast, stray presses landing, and nothing ever going anywhere the reader did not intend. Design notes describe; dogfood reveals — properties the rationale never contained. The system taught its operator through the hands.

## The phase clusters

The picker phase and the document phase are different processes — fzf owns the keys in the dive, okuda owns them in the frame. Each phase's controls form a cluster, the clusters do not overlap, and a phase error is anatomically impossible: no keystroke means "dereference" while the query is live, and none means "narrow the list" while the document is on the glass. Modal editors teach their modality with grammar and pinky-punishment. This silo's modality is compiled onto the hands.

## The lateral line — with the honest correction

The strict left-hand/right-hand allocation does not survive inspection: the arrow cluster sits bottom-right, and two-digit addresses span the number row across both hands. The line that *does* hold is cleaner:

- **The left hand dismisses.** ESC clears the query, stands down a half-typed vector, backs out. Every left-side verb is a negation: *take it back.*
- **The right hand commits.** ENTER reads, the digits dereference, Backspace unwinds the committed read, `00` exits, `99` promotes. Every right-side verb is a commitment or a traversal of one.

The query takes both hands, because language is not a phase — it is the raw material both phases act on.

## Verbs are doubles, addresses are pairs

The reserved repeated digits (`00`, `99`, the spaced menu doubles) are verbs — same key, twice, one motor act repeated, deliberately slow. The addresses (`12`…`98`) exclude doubles, so every address is two *different* keys, two distinct motor acts. Semantic class is encoded in motor class: the hand feels the difference between a meta-command and a pointer before the brain has read the digits. The radiotelephony discipline (*"one fiver"*) — error correction in the actuation channel itself.

## The three buffers

The overshoot impossibility has structure — three distinct buffers, each absorbing a different class of haste:

1. **The sequence buffer.** A stray single digit does not fire: it waits for its partner, and ESC stands it down. No instant-fire on ambiguity — the two-digit space is a debounce built from grammar, not timers.
2. **The mode buffer.** A key pressed out of phase is inert. Backspace at the main document is a no-op by construction (the depth-one stack); digits in the picker are just query text. Out-of-phase intent is absorbed, not executed.
3. **The no-op as position report.** Inertness is legible state. *Backspace did nothing → I am at the main document → I am done with this document, not one of its references → `00`.* The no-op is a probe: poke the system and it tells you where you are, at zero cost, spending nothing of the reading state. The boundary is not a wall; it is a signpost.

## Fails inert, never open

The shite filter never fails open — it fails to the reader's declared intent (`docs/2026-09-05-frame-as-shite-filter.md`). The keyboard grammar has the same property one level down: it never fails open into an unintended state; it fails *inert*. The mouse offers no such guarantee — one ambidextrous pointer flattens every phase into one gesture space, and a mis-click lands anywhere. The keyboard preserves the phases by refusing to act outside them.

This is Watt's governor in miniature: a flyball system absorbs overspeed mechanically, self-limiting by construction, no intelligence required in the moment. The buffers are the grammar's governor. Rush all you like; the machine declines to convert it into error.

## The pause between the clusters

Every phase boundary costs a deliberate keystroke; a keystroke costs a hand-relocation; the relocation *is* the pause. The system cannot rush the reader: it must wait for a hand to move. That pause is where the shite filter actually lives — not in the query, not in the frame, but in the judgement between them. Continue, refine (left), commit (right), or Ctrl-C. The exit is always one keystroke and never discouraged.

## The one line

The grammar is the state machine; the keyboard is its anatomy; the left hand negates and the right hand commits; verbs are doubles and addresses are pairs; the buffers absorb the rush; and the pause between the clusters is the reader's own time, which the system spends none of and waits for entirely.

## Related

- `docs/2026-09-05-keyboard-controls.md` — the key grammar's zones and verbs; the Backspace-RHS note this note generalises. The insight came from the dogfood, not from this doc — which is the point.
- `docs/2026-09-04-the-silcrow.md` — "each level costs a deliberate keystroke"; the two-render contract.
- `docs/2026-09-04-nae-links-either.md` — the two-digit space as zero-ambiguity instant fire; the mouse refusal this note grounds more deeply.
- `docs/2026-09-08-unnecesary-abstractions-considered-harmful.md` — the tacit knowledge the hands hold before the docs do.
- `docs/2026-08-31-vector-resource-locators.md` — the radiotelephony lineage of the digit cadence.
