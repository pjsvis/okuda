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

## Addendum: the trusted negative

When the dive returns nothing, the reader does not retry — they look down. The footer's identity line (`silo · callsign · filename`, muted, ADR-020) answers the only question a trusted miss leaves open: *am I in the right room?* Usually not; walk to the correct silo.

The miss is true because the instrument is honest: exact grammar, real files, three channels, re-derived per keystroke, bounded corpus. A reliable instrument localises faults — and the fault was never in the search, it was in the navigation. An unreliable engine produces diffuse doubt (retry-refine, keyword soup: maximizing born of distrust); a trusted one produces precise doubt, settled by one glance. Zero results is the filter succeeding (`docs/2026-09-05-search-as-shite-filter.md`): the miss routes the reader to the correct corpus. The stopping rule is Simon's again, one scale down — a few tries, then conclude, then act.

## Addendum: mirror symmetry — the boundary, not its direction

The lateral line is convention, not anatomy. A right-to-left setup by key remap works, because the load-bearing property was never *which hand dismisses*: it is that the two motor clusters are distinct and do not overlap. The grammar is abstract over the keymap (verbs `00`–`10`, addresses `11`–`98`, promotion `99`); swap the bindings and the buffers, the no-op probes, the pauses, and the phase-impossibility all survive.

The invariant a mirror must not break: dismissal and commitment must never collapse onto the same key or the same motor act. Distinctness is the contract; direction is a projection — the same posture as the i811 refusal. The system does not hard-code a body.

## Addendum: the mention is a dormant address

A path mentioned but not rubricated (`docs/2026-09-10-use-vs-mention.md`) is not a dead end — it is a self-contained locator with no paint. If the interest is real, open another Gloam instance and type the distinctive characters of the filename: the dive finds it, the reading context is never spent, and both windows live — window A is document A, window B is document B (`docs/2026-09-04-nae-links-either.md`).

Best of both worlds, and the price is the point. A link click costs nothing, which is why the web drowns in them; spawn-and-type costs just enough to make the reader decide. The friction is the filter, at the affordance scale — and the mention stays inert in-instance, live inter-instance: the address sleeps until a new context is opened for it.

## Addendum: the excursion contract

Go off mid-document, and the instance waits: no updates, no lazy-loads, nothing shifts the furniture while you are not looking. The static stream sits until told to do something else. On return, the place is not *restored* — it was never surrendered. The web's back button prays the stack remembered; this one never let go, so there is nothing to pray for.

The mechanism beneath the stillness: the stream has no autonomous dynamics. The render is a pure function of file and glass, and the only actors are the reader's keystrokes and the file itself. No reflow-on-injection, no sticky headers, no scroll-jacking, no resize-observer rearranging the room. Even the one legitimate actor — the file, the message bus — has a suspender: `03` frozen is the shipped verb for *not even the file's gravity while I read* (`src/tui.ts` — watch re-renders suppressed, `r` stays manual).

The pause, extended: from between keystrokes to between visits. Time belongs to the reader, including the time spent elsewhere — and the anchor, already named the time-independent affordance, is what the excursion was for.

## Addendum: the canvas serves the document

On the web the viewport is sovereign and the document must fit it — and when it does not, the document is abridged into the chrome's shapes: scrollbars, accordions, "read more", truncated cards. The document becomes second-class in its own rendering, edited by the UI's convenience without the author's consent.

Here the sovereignty is inverted: the paint is a projection of the map (`docs/2026-09-04-filter-model.md`, lesson 4) — the UI derives from the document, never the reverse. The glass is honest about being a glass: the frame cuts and defers, and the edges say *there is more below* (`docs/2026-09-05-frame-as-shite-filter.md`) — not the scrollbar's promise of infinite slide, but an honest bound with a priced door.

The reveal — a bigger canvas without falling off the table — is what the anchor-as-mast buys: zoom out or resize, the canvas grows while the eye stays pinned. Wrap re-derives, the frame re-derives, the mast holds. The document is never abridged to fit; it is framed, and the frame's growth costs a declared intent.

The pair, compressed: time — the stream waits, no gravity-mice, `03` for even the file; space — the glass serves, no abridgement, the anchor for the reveal. The reader owns both clocks and both axes, and the document is first-class in each.

## The one line

The grammar is the state machine; the keyboard is its anatomy; the left hand negates and the right hand commits; verbs are doubles and addresses are pairs; the buffers absorb the rush; and the pause between the clusters is the reader's own time, which the system spends none of and waits for entirely.

## Related

- `docs/2026-09-05-keyboard-controls.md` — the key grammar's zones and verbs; the Backspace-RHS note this note generalises. The insight came from the dogfood, not from this doc — which is the point.
- `docs/2026-09-04-the-silcrow.md` — "each level costs a deliberate keystroke"; the two-render contract.
- `docs/2026-09-04-nae-links-either.md` — the two-digit space as zero-ambiguity instant fire; the mouse refusal this note grounds more deeply.
- `docs/2026-09-08-unnecesary-abstractions-considered-harmful.md` — the tacit knowledge the hands hold before the docs do.
- `docs/2026-08-31-vector-resource-locators.md` — the radiotelephony lineage of the digit cadence.
- `docs/2026-09-10-use-vs-mention.md` — why mentions don't rubricate; the promotion rule this note's spawn-and-type addendum completes on the reader's side.
- `briefs/2026-09-05-brief-stream-identity-header.md` — the identity line the trusted negative glances at.
- `docs/2026-09-05-frame-as-shite-filter.md` — cut and defer; the edges as the honest bound the canvas addendum reads.
- `src/tui.ts` — frozen mode, shipped: the excursion contract's suspender for the file's gravity.
