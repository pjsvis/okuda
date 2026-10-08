---
type: Brief
callsign: BRF-SPEECH-STRIDE
date: 2026-09-14
---

# Brief: The speech stride — the arrows given to the ear, the unit heard

**Created:** 2026-09-14
**Status:** Open
**TD:** td-2ba093

## Lineage

the reader's 2026-09-14 session, in four moves. The skip — *when they leave one para we stop the speech and start at the next para*. The direction — *forwards and backwards*, and the second round's verdict: *the navigation back is cool*. The arrows — *up and down are for paras and items, left and right are for sections*. And the gap — *all it needs is a gap, like a speaker stopping and then picking up at the next para helpfully rather than rushed*. The skim rode in from the first round: *first sentence and last sentence — a bit dodgy, but if the doc is rubbish it's a quick scan*. The third round found the reverse channel: *cast onto the projector and start speaking, and we see the okudagram framing the text that is being read — the voice can drive the UI* — and the pair it is for: *one sighted and another unsighted user, both with navigation actuators, and they can talk about a document; the spoken okudagram takes longer to speak than to read, so there is no rushing.*

## Extends

**BRF-OKUDAGRAM-STEP** owns the strides and their units — this brief rebinds keys, it does not invent units. **BRF-AUDIO-DISCOVERY** owns the cue seam — the handle, the patience, the abandonment; this brief consumes it and adds one event, the position. **BRF-JUMP-LIST** owns the stream-settle regime; the gap is its recital twin. **BRF-PAGED-OKUDAGRAM** owns the okudaframe — this brief drives it with a voice. Nothing here forks any of the four.

## Objective

Give the arrow keys to the ear. Navigation by structural unit — paragraph and
list item on the vertical, section on the horizontal — with the voice
following: **cut on leaving, gap, pickup at the settled unit**, forwards and
backwards, plus the skim projection, labelled. One gesture, two projections —
the screen scrolls, the voice follows — and in the cast, the reverse: the
voice progresses, the glass re-frames. The position is the shared thing;
either channel can move it when a human acts, both follow when it moves —
the speech-driven-design doc's own move: *one canonical text, N bounded
projections.*

## The invariant and the variable

The silo's method, applied:

- **The invariant** — the position: the unit the reading is in, and where
  the reader settled.
- **The variable** — which channel consumes it: the screen's scroll, the
  voice's pickup — and, in the cast, which channel writes it.

The two channels stop being two machines. They are one gesture over one unit
definition — and `src/frames.ts` already declares that definition shared: *the
unit the voice interface steps by — the shared definition speak-md must honour
or the screen and the voice desync.*

## The ear's stride — the arrow contract

| Key | Today | The brief |
|---|---|---|
| ↑/↓ | line stride — slippy, always | the unit: para/item (aliases `}/{`) |
| ←/→ | dead — `decodeKey` returns null | the section: frame (aliases `]]/[[`) |
| j/k | the step, the mode's unit | unchanged — the eye keeps its line |

Three claims in that table, one per row:

1. **The repurposing is a correction, not a loss.** A wrapped line is a visual
   artifact — the glass's width dressed up as structure. To the ear the line
   does not exist; the paragraph is the atom. Up/down as line stride serves an
   eye that already has j/k, and the trained hand loses nothing.
2. **←/→ are free.** The lexer already keeps `ESC [ C/D` whole
   (`src/keygrammar.ts`, the `0x41`–`0x44` window); `decodeKey` never maps
   them. The section stride they take is `]]/[[`'s, which stays for the
   trained hand.
3. **Aliases are honest.** Arrows and vim pairs bind the same units, exactly
   as j/k and arrows both do line stride today. Two bindings, one meaning.

## What is measured, not argued

The probe is `tmp/stride-probe.ts` — a source doc with a **tight** list, fed
through `renderDocument` at width 80, into `paragraphStarts`.

| finding | evidence |
|---|---|
| items are already units | indices 5, 7, 9 — one per item, tight source |
| no new unit function needed | `paragraphStarts` suffices for paras and items |
| the unit set includes chrome | index 13 — the status bar, `█ ───` |

The first finding is the good surprise: a tight-list source renders loose, so
*"up and down are for paras and items"* is already true of the existing unit
definition. The third is a defect of today's stride, not a new one — `}/{`
already steps onto the status bar — and this brief fixes it at the stride
level: **chrome is not a unit.**

## The cut, the gap, the pickup

```mermaid
title: One stride, heard
flowchart LR
    K[arrow] --> C[cut]
    C --> G[the gap]
    K --> G
    G -->|settled| P[pickup at the unit]
    G -->|another arrow| C
```

- **The cut is correctness.** An utterance that outlives the reader's leaving
  is a lie about where the reader is. Abandonment is BRF-AUDIO-DISCOVERY's
  own rule, applied to recital: the cut is not a nicety, it is the truth.
- **The gap is the silo's.** *A speaker stopping and then picking up at the
  next para helpfully rather than rushed* — the inter-para breath, its duration
  earned by ear, which is the silo's doctrine. **okuda holds a handle, not a
  clock**: the position event carries no pause constant, and none appears
  anywhere in this repo.
- **The gap is the debounce.** One mechanism, two jobs. A fast run of arrows
  is a stream, and streams settle: each new position supersedes the last
  inside the gap, so a run of ↑↑↑ is one cut and one pickup — the settled
  destination, arriving after a breath, never machine-gunned. The reader who
  says "debounce" is right in effect and wrong in mechanism: this is not
  electronics, it is the patience regime — the hesitation detector — applied
  to recital. The pause before pickup *is* the coalescing window.

## Backwards — the jewel

Speech has no re-glance. The back-stride is the explicit return the medium
deleted (`docs/2026-09-14-speech-driven-design.md`, force #3) — which makes it
the highest-value half of this brief, not an afterthought. Its semantics are
not new either: `snapFrame` already settles the mid-unit question — *step −1
from mid-frame snaps to the current frame's header first; the next −1 goes to
the previous* (`src/frames.ts`). The para stride inherits the rule: mid-unit ↑
restarts the current unit (you are inside it); ↑ again goes to the previous.
The screen and the voice share the rule, so they cannot desync.

## The skim — a labelled projection

**04**, on entry and exit. The doubled pairs are the actuator class, and the
canon holds: *doubled = the system talks* (ADR-032) — and the skim is the
system talking differently. The free tokens are `04`–`08`
(`src/keygrammar.ts`); this brief takes the first.

- **A mode is acceptable iff it is announced** (ADR-030). The mode cue —
  *skim* on entry, *full* on exit — fires before the first skimmed unit.
  Without the label the mode commits the cardinal sin: a digest posing as the
  text.
- **The projection is the silo's.** First and last sentence per unit;
  sentence segmentation is flattening, which is the silo's trade and the ear's
  to tune. okuda toggles; it does not split sentences.
- **The honest scope.** In this corpus the projection is unusually faithful —
  the authoring playbook enforces topic-first paragraphs, so the first sentence
  is the claim and the last the wrap. On rubbish prose it inverts —
  throat-clearing first, hedge last — but that is when it is a triage tool:
  skimming to convict, not to read. Either way it earns its cost. The failure
  mode is the listener's own narrative syndrome — the mind narrates the gap
  between the sentences and believes it. The label is the antidote.

## The cast — the voice drives the glass

The stride runs okuda → silo; the cast runs the same wire backwards.
**Unit-progress**: the voice reports *I am now in unit k*, the reader maps
unit → rendered line → containing frame (`frameBounds`, already built for
`]]`/`[[`) and repaints when the frame changes — not per unit. The rebind's
payoff: the okudagram was already the eye's unit; it needed only a driver
that was not a keypress.

- **The frame is the highlight.** Word-level sync — the wild's EPUB Media
  Overlays `active-class` — is rejected, not deferred: it demands word
  timing from the voice, high-frequency and jitter-prone, and an eye across
  a projector cannot use word resolution anyway. The unit-progress event
  arrives at the boundary the gap already provides — the inter-para breath
  is the sync signal. Coarse, cheap, stable.
- **One writer per event.** Both channels are read-only subscribers of the
  position except when a human acts. A progress event re-frames; it never
  emits a stride. The echo is the failure mode of bidirectional wiring, and
  single-writer is the boring, essential fix.
- **The silo owns the reporting.** `speak-md` speaks unit by unit — playback
  chunked at the unit, which the gap architecture already implies — and
  emits progress at each boundary. Cadence is the silo's; okuda listens.
  The contract is reported upstream; nothing lands there.

## Two readers, one position — the dogfood is what we eat

The demo casts the reader to a projector: Moira speaks the document, the
okudagram re-frames as the voice crosses frames. But the demo is not the
point — the pair it rehearses is: **one sighted reader, one unsighted
reader, both with arrow keys, one document.**

Speech forces naming — force #1: you cannot point, so everything
addressable must be utterable. The rebind gives both readers the same
grammar: ↑↓ names the same unit under either thumb. Before it, the sighted
arrows said *line* and the unsighted had no arrows worth the name. After
it, **one grammar, two channels** — and a conversation about the document
acquires a shared referent neither reader can lose. *"Go back one"* means
the same thing in both ears and both thumbs.

**The tempo.** The spoken frame takes longer to speak than to read, so
nobody rushes: the voice is the slower channel and therefore the
tempo-keeper. Reading together at the eye's speed desyncs by whole
screens; unit-locked, desync is bounded by one unit, and the gap is where
the conversation happens. Respect for reading speed is not politeness — it
is what makes the pair a pair.

**The repair is shared.** Either reader can strike the back-stride; the
para that didn't parse is a question they now both stand in. The skim,
too, is a shared verdict — skim to convict, together.

This is the edge case that shows the affordances came free: the position,
the unit, the gap, the rebind, the unwind — all specified for one reader,
and two readers is what they were for. Nothing in this section is new
machinery.

## Scope

**In:**

- The rebinds: ↑/↓ to the unit stride, ←/→ to the section stride. j/k
  untouched.
- The chrome exclusion: the status bar leaves the unit set — a fix today's
  `}/{` also wants, landed once, at the stride level.
- The position event through the cue seam: `{document, unit index, direction}`,
  emitted per settled stride — okuda's whole obligation.
- The skim toggle `04`, its mode cue, and the projection contract upstream.
- The cast: the silo's unit-progress events, consumed — voice-driven
  re-framing through `frameBounds`, repaint on frame change.
- The silo contracts reported upstream: cut, gap-as-debounce, unit
  definition, skim projection, unit-progress emission. **Nothing lands in
  `speak-md`.**
- The hints line, retold: `↑↓ para · ←→ section`.

**Out:**

- The cue seam's mechanism — patience values, abandonment, the binding, the
  cast. BRF-AUDIO-DISCOVERY owns it.
- **The gap's duration.** No constant in this repo; the silo earns it by ear.
- Sentence segmentation — the silo's flattening, not ours.
- **Word-level highlighting and timing** — the frame is the highlight.
  Rejected, not deferred.
- The frame-mode slippy exception — today arrows stay slippy within a frame
  (BRF-OKUDAGRAM-STEP); whether that survives the rebind is a real choice with
  two viable answers. **ADR during the build, not here.**
- Rate, voice, cast selection — the silo's register, tuned by ear.
- Persisting the position. The stride is ephemeral, like the jump list.
- **The silo's playback chunking and progress emission** — the cadence is
  the silo's, tuned by ear; this repo only listens.

## Preconditions

- [x] ←/→ are dead keys: the lexer keeps `ESC [ C/D` whole
      (`src/keygrammar.ts:79–86`), `decodeKey` maps neither CSI nor SS3
      `0x43/0x44` (`src/tui.ts:107–121`). **Verified 2026-09-14.**
- [x] ↑/↓ are line stride today (`src/tui.ts:108–109`, `line-up`,
      `line-down` — *slippy, always*). **Verified 2026-09-14.**
- [x] j/k are the step and survive the rebind (`src/tui.ts:82–83`).
      **Verified 2026-09-14.**
- [x] The unit strides exist: `paragraphStarts`, `headingLines`, `snapFrame`
      (`src/frames.ts:25,54,90`), wired to `}/{` and `]]/[[`
      (`src/tui.ts:812–826`). **Verified 2026-09-14.**
- [x] Items are already units — the tight-list probe renders loose;
      `paragraphStarts` yields one start per item (`tmp/stride-probe.ts`).
      **Verified 2026-09-14.**
- [x] The unit set includes the status bar (probe index 13) — chrome is
      reachable by today's stride. **Verified 2026-09-14.**
- [x] `04`–`08` are reserved-unassigned (`src/keygrammar.ts:39–47` —
      unbound, outside the reserved set, resolve to null).
      **Verified 2026-09-14.**
- [x] The shared-definition seam is already declared: *the unit the voice
      interface steps by — the shared definition speak-md must honour*
      (`src/frames.ts:100–102`). **Verified 2026-09-14.**

## Work Plan

1. [ ] Branch `feat/speech-stride`.
2. [ ] Rebind ←/→: CSI and SS3 `0x43/0x44` → `frame-down`/`frame-up`.
3. [ ] Exclude chrome from the unit set; assert the status bar is unreachable
       by the stride (the probe becomes the fixture).
4. [ ] Rebind ↑/↓ to the unit stride; write the ADR on the frame-mode slippy
       exception — kill it or keep it, one answer, recorded.
5. [ ] Emit the position event through the cue seam — handle, not clock.
6. [ ] Land `04` as the skim toggle with its mode cue, before the first
       skimmed unit.
7. [ ] Report the silo contracts upstream: cut, gap-as-debounce, unit
       definition, skim projection, unit-progress emission.
8. [ ] Subscribe to the silo's unit-progress events; re-frame the okudagram
       on frame change, never per unit.
9. [ ] Retell the hints line.
10. [ ] Dogfood, which is what we eat. By ear: skip forward, skip back
       mid-unit, a fast run, skim on, skim off. By eye: the projector, the
       voice driving the glass. In pairs: one sighted, one unsighted, one
       tempo.

## Acceptance Criteria

* ↑/↓ stride the unit; ←/→ stride the section; j/k still stride the line —
  each asserted by test.
* A tight-list document strides item-by-item — the probe's finding, pinned as
  a fixture so the unit definition cannot silently change.
* The status bar is not a stride destination; no stride lands on chrome.
* Mid-unit ↑ restarts the current unit; the next ↑ goes to the previous —
  `snapFrame`'s rule, asserted for the unit stride.
* The position event carries document, unit index and direction, and nothing
  else; with the cue binding unset, okuda's output is byte-identical to today.
* No pause constant, no timer, no clock enters this repo — the gap is the
  silo's.
* A unit-progress event re-frames the okudagram to the unit's containing
  frame; the repaint fires on frame change, not per unit.
* The loop is bounded: a progress event writes the position and emits no
  stride — no event begets an event.
* `04` toggles the skim; the mode cue fires before the first skimmed unit; no
  doubled pair outside the canon's actuator class gains a meaning.
* The hints line names the new contract.
* `just check` passes and `bun test` is green.

## Notes

- **The line was never the ear's.** The rebind reads as a keybinding change
  and is actually a media correction: the wrapped line is glass furniture, and
  furniture does not survive the projection to voice. What survives is the
  unit — the thing the voice can *say*.
- **The gap is one mechanism doing two jobs** — prosody and coalescing — and
  that is why it will sound good: the reader hears a speaker taking a breath,
  and the machine gets its debounce window for free. Two jobs bolted together
  would be two pauses; one mechanism is one breath.
- **Backwards is not symmetric and should not be.** Forward skip is
  impatience; backward skip is *repair* — the para that didn't parse, the
  reference that went by too fast. The medium makes repair expensive (no
  re-glance), so the repair key is the one worth gold-plating.
- **The dogfood is what we eat** — the reader's own words, and the reason
  the demo is not theatre: the cast is the two-reader case wearing a
  projector, and the two-reader case is what the position invariant was
  for.
- **`speak-md` gaps reported, not fixed:** a recital-control surface that
  accepts unit addresses; the gap-and-supersede behaviour; the skim
  projection (first/last sentence per unit, announced on entry); the
  unit-progress emission. The silo decides all four; this repo reports.
- **The unit definition is load-bearing and shared.** Any change to
  `paragraphStarts` after this lands desyncs screen and voice — the probe
  fixture is the tripwire, and `frames.ts`'s own comment is the treaty.

## Related

- `briefs/2026-08-29-brief-okudagram-frame.md` — the okudaframe the cast
  re-drives; `frameBounds`, the portioning rule
- `briefs/2026-09-07-brief-okudagram-step.md` — the strides this rebinds
- `briefs/2026-09-13-brief-audio-discovery.md` — the seam this consumes: the
  handle, the patience, the abandonment, the cast
- `briefs/2026-09-14-brief-jump-list.md` — the stream-settle regime; the gap
  is its recital twin
- `docs/2026-09-14-speech-driven-design.md` — one text, N projections; force
  #3, speech has no re-glance
- `decisions/032-repeated-digit-actuators.md` — the doubled pairs, the canon
- `decisions/030-live-search-picker.md` — invisible modes die here
- `explainers/accessibility.md` — the anchor; the stride is the anchor on legs
- `src/frames.ts` — `paragraphStarts`, `snapFrame`, the shared definition
- `src/tui.ts` — `decodeKey`, the stride handlers, the hints line
- `src/keygrammar.ts` — the lexer's arrow window, the free tokens