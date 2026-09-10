---
type: Brief
callsign: BRF-TTS-STEPPER
---

# Brief: The TTS channel — a configuration of the render/egress pipeline

**Date:** 2026-09-10
**Status:** Open
**Lineage:** dialog session (TTS voice riff → comma-as-prosody →
render-time injection → the stepper question → the pipeline correction).
Three prior briefs establish the ground: `BRF-TTS-TEMPORAL` (the
extractor — the comma-injection transform), `BRF-TTS-DOGFOOD` (the
degraded preview — `okuda --no-color | tee /dev/tty | say`, the desync
measurement), and `BRF-OKUDAGRAM-STEP` (the no-gaps stepping invariant
and the declared header-jump primitive). An earlier draft of this brief
specced a frame list, a stateful iterator, and a separate TTS key
grammar — a second pipeline bolted alongside the first. That draft was
the `--dunt` error at the design level: building outbound where none is
needed. The correction: the TTS channel is a *configuration* of the
existing render/egress pipeline, not a new pipeline. This brief is the
thin version.

---

## Objective

Define the TTS channel as a configuration of the existing render/egress
pipeline: the sink set to `say`, the position increment set to para,
the render-time transform set to comma injection, and the dimensions
read as breath/frame. No new pipeline, no frame list, no separate key
grammar. The re-render pipeline does the heavy lifting; the TTS channel
inherits it.

## The pipeline, restated

```
source → annotate/transform(source, dims) → render(position, dims) → text stream → egress(sink)
                    │                                   ▲                    │
                    │                                   │                    ▼
              silcrow injection                     actuator            screen / speaker
              (visual) or comma                     (changes             (stdout route)
              injection (TTS)                       position)
```

The pipeline is one machine. The actuator changes position. The render
produces the frame from that position, given the dimensions, after the
channel's transform is applied. The egress sends the bytes to the sink.
Rerender, proceed. There is no frame list — the frame is what the
render emits on demand from position + dimensions. There is no separate
TTS loop — the TUI's actuator loop is the loop, with the egress routed
to `say`.

## The leverage the pipeline gives us for free

1. **Position state → step.** The TUI already tracks scroll position
   (`scroll` in `src/tui.ts`). A para-step is a position increment; a
   section-step is a larger position increment to the next heading
   boundary. Arrow keys already change position. The actuator loop is
   the actuator loop.
2. **Dimensions → breath/frame.** The render already takes width/height
   (`terminalCols`, `terminalRows`; `renderDocument(source, {width,
   palette, color})` in `src/render.ts`). SIGWINCH already triggers
   rerender. TTS reads width as the breath interval (words per breath)
   and height as frame capacity (breaths per frame). Same dimensions,
   different interpretation, same resize gesture. The coupled-frame
   idea from BRF-TTS-DOGFOOD wasn't a special TTS thing; it was the
   existing resize-driven rerender.
3. **Watch → re-speak.** `--watch` already re-renders on file change
   (`src/cli.ts`). In TTS, re-render = re-speak the current position.
   The file-change notification becomes "something changed, hear it
   again."
4. **The `annotateSource` slot → comma injection.** The render already
   has a pre-render transform that decorates a copy (`annotateSource`
   in `src/vectors.ts` inserts `%okuda-vector:NN%` markers; the
   renderer paints them). Comma injection is the same slot, different
   transform, channel-gated. The extractor (BRF-TTS-TEMPORAL) is a
   render-time projection, exactly like silcrow injection — not a
   pre-pass producing a frame list. Prosody is to audio what colour is
   to visual: a channel-specific decoration applied at render time,
   never a source mutation.
5. **Egress routing.** The render already writes to stdout
   (`process.stdout.write` in `src/tui.ts`). stdout → terminal (visual)
   or stdout → `say` (TTS) is an egress route, not a pipeline fork. The
   `tee /dev/tty | say` from the dogfood is the degenerate case;
   production is a route parameter on the egress.
6. **The keygrammar.** Already defined (`src/keygrammar.ts`: two-digit
   modes `01` frame / `02` slide / `03` freeze / `04` size (sketched);
   arrows in `src/tui.ts:95–98`). Same keys, both channels. No
   TTS-specific grammar to invent.

Six free. The ratio is the tell: the TTS channel is a *mode of the
existing pipeline*, not a new machine.

## The directional grammar (the reconciliation)

The arrows are directional primitives; the axes they navigate are
channel-specific projections of the same structural dimensions. The
grammar is directional; the semantics are dimensional. Close your eyes
and the directions still traverse the same structure.

| Key | Visual | TTS | Structural role |
|-----|--------|-----|------------------|
| up/down | para steps (line today → para) | para steps | between leaves (DFS reading order) |
| left/right | section jumps (header-to-header) | section jumps | between branches (sibling) |
| space/b | page steps (viewport-full) | — (category error) | page/para step |
| `j`/`k` | line (fine, visual only) | — | fine (no line concept in TTS) |

**up/down = para (the leaves).** Generalises today's line-step to
para-step — the contiguous, no-gaps step from BRF-OKUDAGRAM-STEP. You
cross section boundaries naturally (para A2 → para B1) because reading
order is linear even when structure is branching.

**left/right = section (the branches).** Sibling-to-sibling, lateral
across the document's structure. This is the declared header-jump
primitive BRF-OKUDAGRAM-STEP named but never bound. The slot is
currently empty (`0x43`/`0x44` have no case in `src/tui.ts:95–98`) —
nothing to displace. The proposal is the binding.

**space/b = page (visual only).** A page is a viewport-full — a
spatial unit bounded by the glass. In audio there is no viewport; the
ear has no glass to fill. "Hear a page" is a category error, at least
within the bounded context of a document in a silo: the page is a
visual/spatial concept, and audio has no spatial region to bound a
unit. The para (up/down) is the step in TTS; space/b has no distinct
TTS role because the unit it steps (a viewport-full) doesn't exist in
the audio channel. If the listener wants a coarser step than para,
that's left/right (section) — the next-larger structural unit. The
coarse axis in TTS is section, not page; in visual it's page, not
section. Same axis (coarse), different unit, by channel.

The tree-walk model: up/down walks the leaves in reading order;
left/right steps the branches laterally. Same tree, same directions,
same structural roles, different sink. Close your eyes, switch to TTS,
press up — next para, same as visual. The unit is different, the sink
is different, the *verb* is the same.

**Line-level (`j`/`k`) stays visual-only.** Arrows take the structural
axis (para); `j`/`k` keep the fine axis (line) — vim-style. In TTS
there is no line concept, so `j`/`k` are simply absent; the arrows are
the whole grammar. The granularity ladder is channel-asymmetric: TTS
has para (up/down) and section (left/right) — two granularities, both
structural; visual adds line (`j`/`k`) below para and page (space/b)
above para — four granularities, two of them spatial (line, page) and
unavailable in audio. No collision, because the spatial units don't
claim a TTS counterpart.

## Breath = width

Breath is a **rendering parameter**, the same class as line width — not
a navigation axis. A human reader breathes when they run out of air,
not when they reach a structural boundary. The breath is physiological
rhythm under the prosodic structure; it happens *within* a paragraph,
at clause ends, but also just when the lungs are full. The terminal
width sets "when the lungs are full" — wider terminal, longer breaths,
more flowing speech; narrower terminal, shorter breaths, more frequent
pauses. The operator resizes and the prosody shifts, the same way
resize changes visual wrapping.

| Dimension | Visual | TTS | Role |
|-----------|--------|-----|------|
| width | chars per line | words per breath | flow parameter |
| height | lines per viewport | breaths per frame | frame parameter |

The comma-injection transform (BRF-TTS-TEMPORAL) reads the width to set
breath density. The transform already takes the source; it takes the
dimensions too — the same parameters the render already receives. The
structural boundaries (heading end, para break, list item) determine
the *pause type*; the width determines the *breath interval*. Two
inputs to the prosody, both already in the render's parameter set.

**Rate is not ours.** `say --rate` is a sink parameter — the audio
equivalent of font size. Not navigation, not prosody structure, not a
directional key. Sink-side, by the three-concerns test.

## Mode 04 — the sizing control surface (sketched)

The terminal dimensions control breath (width) and frame (height),
but resizing the actual terminal requires seeing the glass — dragging
a corner, eyes open. In TTS that's not available. The sizing control
surface is the keyboard-accessible version of the resize gesture: the
same dimensions, adjusted from the keys, eyes-closed.

`04` is currently unbound (`04`–`08` are reserved-unassigned in
`src/keygrammar.ts`; `verbFor(4)` returns `null`). The binding is
one line — add `4: "size"` to `KEYBINDINGS`. The mode repurposes the
arrows from navigation to dimension adjustment:

| Key (in mode 04) | Dimension | Visual effect | TTS effect |
|---|---|---|---|
| up | height ↑ | more lines per viewport | more breaths per frame |
| down | height ↓ | fewer lines per viewport | fewer breaths per frame |
| right | width ↑ | wider wrap | more words per breath |
| left | width ↓ | narrower wrap | fewer words per breath |

Same arrows, same directions, both channels — up = more capacity,
right = wider flow. The dimensions are channel-agnostic; the
interpretation is channel-specific. Consistent with the directional
grammar: the arrows are directional primitives, the axes are
channel-specific projections.

**Why `04` and not SIGWINCH only.** In visual, SIGWINCH already does
this — resize the terminal, the render adapts. `04` is redundant-but-
harmless in visual (a convenience: adjust effective width without
resizing the glass). In TTS it is *essential* — the only way to
adjust breath/frame without opening your eyes. The mode is the
TTS-accessibility feature that happens to work in visual too.

**Why a mode, not a modifier.** The two-digit grammar is mode-based
(`01`/`02`/`03` are persistent modes). `04` follows the pattern: enter
the mode, adjust with arrows, switch back to a nav mode. The mode
switch is the commitment; the arrows do the work. No new grammar — a
new entry in `KEYBINDINGS`, same dispatch.

**Sketch status.** This section is sketched, not specced. The binding
(`4: "size"`) is one line; the dimension-adjustment on the arrows is
a mode-gated branch in the reducer. The exact increment (1 col? 4?
sticky-vs-transient?) is a dogfood question. The shape is clear; the
numbers are by ear.

## Escape is freeze, not skip

Escape is the universal abort — it never doubles as "skip." In the
grammar, escape is the `freeze` verb (`03`): visual = stop re-rendering
(the document stays still, the fetch-state stamp waits for `r`); TTS =
stop speaking, stay on the current frame. Same verb ("hold"), different
manifestation. Skip-ahead is `up` (next para) or `right` (next
section); escape stops and holds. Three verbs, three keys, no
overloading.

## The work that isn't free (and it's small)

1. **Para-level position increment.** The render already parses
   structure (it knows where paras, headings, list items break — that's
   how it renders them). Wiring the para boundary to the position
   increment is the work, but the boundary data already exists.
   `headingLines` (`src/frames.ts`) already identifies heading
   boundaries; para boundaries are the same parse one level finer.
2. **The comma-injection transform.** BRF-TTS-TEMPORAL's boundary
   vocabulary and pause-length table. Real work, already briefed
   correctly — it's the one piece that earns its own brief. It occupies
   the `annotateSource` slot, channel-gated.
3. **Egress routing to `say`.** A route parameter on the egress
   (`process.stdout` → terminal or `say` subprocess), not a new
   subsystem. The `tee` from the dogfood is the degenerate case.
4. **Dimension-aware breath.** The comma transform reads the width
   parameter to set breath density. The transform already takes the
   source; it takes the dimensions too — parameters the render already
   receives.
5. **Mode `04` binding (size).** Add `4: "size"` to `KEYBINDINGS` in
   `src/keygrammar.ts` (currently `04` is reserved-unassigned). Gate
   a dimension-adjustment branch on the arrows in the reducer: in mode
   04, up/down adjust height, left/right adjust width. The
   adjustment triggers a rerender with the new dimensions — the
   existing re-render pipeline, no new path. The exact increment and
   stickiness are dogfood questions; the shape is sketched in the
   Mode 04 section above.

Five small additions. The rest is inherited.

## Scope

**In:**
- The TTS channel as a configuration of the render/egress pipeline:
  sink, position increment, render-time transform, dimension
  interpretation.
- The directional grammar reconciliation: up/down = para, left/right =
  section, both channels; `j`/`k` = line, visual only.
- Breath-as-width: the terminal width sets the breath interval, the
  same way it sets chars-per-line in visual.
- The free-leverage enumeration (position state, dimensions, watch,
  the `annotateSource` slot, egress routing, the keygrammar).

**Out:**
- **A frame list.** The frame is what the render emits from position +
  dimensions, not a pre-stored array. There is no seam between
  extractor and stepper; the extractor is a render-time transform, not
  a pre-pass.
- **A separate TTS key grammar.** The existing directional grammar
  covers both channels. TTS doesn't get its own verbs.
- **A stateful iterator.** The TUI's actuator loop is the loop.
- **Diagrams.** Foxtrot Oscar. A mermaid diagram in audio is noise
  (reading ASCII aloud) or silence (eliding content). Neither is
  solved. Defer until we encounter one in dogfood — reassess then. The
  Derrida Question: should it be in the consideration set? Not yet.
- **Voice/rate/device selection.** `say`'s CLI surface (`-v`,
  `--rate`, `-a`). Sink parameters, not channel concerns.
- **SSML or non-`say` engines.** The output is plain text with commas.
  A different engine wants a different pipeline, not a flag on this one
  (per BRF-TTS-TEMPORAL's scope).
- **The coupled-frame desync.** BRF-TTS-DOGFOOD measured the 2s-vs-30s
  gap. The channel does not couple the ear to the eye; it lets the ear
  step at its own pace. Coupling was the dogfood's test property; the
  channel is the decoupled production shape.

## Preconditions

- [ ] `say` is available on the host (macOS built-in — verified
      BRF-TTS-DOGFOOD, 2026-09-06).
- [ ] The comma-injection transform (BRF-TTS-TEMPORAL) is defined and
      dogfooded — the boundary vocabulary and pause-length table, with
      the width parameter read as breath density. This is the one real
      prerequisite; the channel's prosody is the transform's output.
- [ ] A markdown document with known structure to dogfood against
      (`docs/2026-09-09-say-tts-tips-and-tricks.md` — already manually
      comma-marked, so the channel can be tested against both manual
      markup and the transform's automated output).
- [ ] The `Ctrl-C + pbcopy | say` manual sequence has been used and the
      prosody confirmed superior to default `say -f` (the operator's
      dogfood — the channel automates this proven workflow at the right
      layer: position increment, not document-level reading).

## Work Plan

1. [ ] **Wire the para position increment.** The render already parses
       structure; wire the para boundary to the up/down position
       increment (one level finer than `headingLines`). left/right
       jumps to the next heading boundary (the declared header-jump
       from BRF-OKUDAGRAM-STEP, bound to the currently-empty
       `0x43`/`0x44` slot).
2. [ ] **Gate the comma-injection transform on the TTS channel.** The
       transform occupies the `annotateSource` slot, channel-gated:
       visual gets silcrow injection, TTS gets comma injection. The
       transform reads the width parameter for breath density.
3. [ ] **Add the egress route parameter.** stdout → terminal (visual)
       or stdout → `say` (TTS). The `tee` from the dogfood is the
       degenerate case; production is a route flag on the egress.
4. [ ] **Dogfood against the tips-and-tricks doc.** Run the channel on
       `docs/2026-09-09-say-tts-tips-and-tricks.md`. Listen. Tune:
       - Are paras the right step size, or do long paras need
         sub-splitting?
       - Is the breath interval (width-derived) natural, or does the
         pause table need retuning?
       - Is up/down-to-advance natural, or does the ear want continuous
         reading (slide mode, `02`) with up = pause?
5. [ ] **Compare transform output to manual markup.** The dogfood doc
       has manual `,,,,` comma clusters. Run the channel on both: the
       manually-marked source and the transform's automated output.
       The prosody should be comparable; if the transform's is worse,
       the boundary-to-pause table (BRF-TTS-TEMPORAL) needs tuning,
       not the channel.
6. [ ] **Encounter a diagram.** When a mermaid fence appears in the
       dogfood doc, note the behaviour. FO for now — skip it, log it,
       reassess. The channel skips mermaid frames silently (or with a
       brief "diagram elided" marker — decide by ear).

## Acceptance Criteria

- [ ] The channel renders a markdown file through the existing
      render/egress pipeline with the sink routed to `say`, walking
      para by para via up/down and section by section via left/right.
- [ ] up/down steps paras (no gaps, the BRF-OKUDAGRAM-STEP invariant);
      left/right jumps sections (the declared header-jump, bound to the
      previously-empty arrow slot); escape freezes (stops speaking,
      stays on the current frame); `r` refreshes (re-speaks the current
      position).
- [ ] The terminal width sets the breath interval — resize changes
      prosody, the same gesture that changes visual wrapping.
- [ ] The comma-injection transform's automated prosody is comparable
      to the manual markup on the dogfood doc (judged by ear — the same
      acceptance as BRF-TTS-TEMPORAL).
- [ ] The markdown source is unchanged — no commas, no pauses, no audio
      artefacts in the visual render. The transform is the only path
      that inserts temporal punctuation; the channel is the only path
      that routes to `say`.
- [ ] Mermaid diagrams are skipped without crashing; the skip is
      logged; the behaviour is noted for reassessment.
- [ ] No frame list, no stateful iterator, no separate TTS key grammar
      exists in the codebase. The channel is a configuration of the
      existing pipeline, verifiable by inspection.

## Notes

- **Prosody is the audio channel's colour.** `annotateSource` (silcrow
  injection) and the comma-injection transform are the same pipeline
  shape — a render-time projection that decorates a copy, never the
  source. Colour and layout are the visual channel's projections;
  prosody is the audio channel's. Both respect the ingress/egress
  invariant (text in, text out); both are channel-specific transforms,
  not source-level mutations.
- **Silcrow announcement — the same marker, both channels.** The
  silcrow (`%okuda-vector:NN%`, injected by `annotateSource`) is the
  same marker in both channels. The visual renderer paints it as
  `§NN` in rose bold; the TTS transform renders it as spoken text —
  "silcrow one three" for §13 — followed by a pregnant pause (the
  `vector-after` entry in BRF-TTS-TEMPORAL's pause table). No
  pre-pause: the word "silcrow" is the affordance — the audio
  equivalent of the rose bold. The actuation is the
  existing two-digit grammar — press `13`, jump to §13's target,
  both channels. In visual you see §13 and press 13; in TTS you
  hear "silcrow one three" and press 13. Digit-by-digit (not
  whole-number) because what you hear is what you press. See
  BRF-TTS-TEMPORAL's Silcrow announcement note for the full
  vocabulary, including the digit-pronunciation sub-table (aviation
  phonetic: `niner`, `tree`, `fife`).
- **The directional grammar is channel-agnostic.** Arrows navigate
  structure (para up/down, section left/right); the structure is the
  same in both channels. The sink differs; the verbs don't. Close your
  eyes, switch to TTS, and the same arrows move the same position
  through the same structure — the unit differs (screenful vs. para),
  the sink differs (screen vs. speaker), the cognitive operation is
  identical.
- **The `Ctrl-C + pbcopy | say` manual sequence is the prototype.**
  The operator has already dogfooded this: copy a paragraph, pipe to
  `say`, listen, repeat. The prosody works better than `say -f` on the
  full document because the paragraph boundary is the natural breathing
  point. The channel automates this proven workflow — it is the
  production version of the manual insight, at the right layer
  (position increment in the existing loop), not the wrong one (a
  separate document-level reader).
- **The earlier draft was over-built.** It specced a frame list, a
  stateful iterator, and a separate key grammar — a second pipeline
  alongside the first. That was the `--dunt` error at the design level:
  building outbound where the existing pipeline already does the work.
  This thin version inherits the pipeline; the retired machinery is
  named here so it stays retired.
- **Diagrams are FO'd.** A mermaid diagram in audio is unsolved —
  reading ASCII aloud is noise, eliding the diagram is silence,
  narrating the structure is a different prosody. None is built. The
  Derrida Question: should it be in the consideration set? Not yet.
  Reassess on encounter.
- **The desync is the data, not the bug.** The ear is ~15–30× slower
  than the eye per frame (BRF-TTS-DOGFOOD measured ~235× on a full
  document). The channel does not couple them; the ear steps at its
  own pace. Coupling was the dogfood's test property; the channel is
  the decoupled production shape — the ear walks alone, the eye is not
  invited.

## Related

- `briefs/2026-09-09-brief-tts-temporal-punctuation.md`
  (BRF-TTS-TEMPORAL) — the comma-injection transform. This brief's one
  real prerequisite; the transform occupies the `annotateSource` slot.
- `briefs/2026-09-06-brief-tts-dogfood.md` (BRF-TTS-DOGFOOD) — the
  degraded preview. Measured the desync; confirmed the degradation;
  this brief is the production shape that follows.
- `briefs/2026-09-07-brief-okudagram-step.md` (BRF-OKUDAGRAM-STEP) —
  the no-gaps stepping invariant and the declared header-jump primitive
  that left/right binds.
- `briefs/2026-08-27-brief-panel-library.md` (BRF-PANEL-LIBRARY) —
  the panel library and chunk-addressable framing. The TTS channel
  extends the same "frame = chunk" principle to a different sink.
- `src/vectors.ts` (`annotateSource`) — the silcrow injection pipeline
  the comma transform mirrors. The architectural precedent: render-
  time projection, never source mutation.
- `src/keygrammar.ts` — the two-digit mode grammar (`01` frame / `02`
  slide / `03` freeze). Channel-agnostic.
- `src/tui.ts:95–98` — the arrow key handler where `0x43`/`0x44`
  (left/right) are currently unbound, waiting for the section-jump.
- `docs/2026-09-09-say-tts-tips-and-tricks.md` — the dogfood fixture
  (manually comma-marked; the channel's test document).
