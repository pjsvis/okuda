---
type: Brief
callsign: BRF-STEP-INVENTORY
date: 2026-09-30
---

# Brief: The stride inventory — what steps, what compounds, what is missing

**Created:** 2026-09-30
**Status:** Rejected — 2026-10-26, the operator's call. The work it described landed on 2026-09-30 (the stepper shipped); the *record* it wanted drifted, and reconstructing a stride inventory from a drifted record is the archaeology this silo declines. Nothing cites the brief, which is the evidence that it stopped being an intent and became a wish.

## TD

td-91bf51 (epic) — td-0ea3c5 the record, td-4eb101 the census, td-8ca3f6 the reference stride, td-a7ef73 the ledger
**Branch:** `feat/step-inventory`

## Lineage

the operator's question, 2026-09-29/30 — *"we are missing a structural stepper for heading to heading… are there any other stepping modes we may have overlooked"* — carrying two objectives (*"review and gate first, then consume"*) and one complaint (*the location "keeps getting accidentally swiped or wiped by a gravity mouse sweep"*).

## Extends

`BRF-OKUDAGRAM-STEP` — the stride contract (*one semantic, the stride is the mode*) stands unchanged; this brief adds the inventory of units and one new stride under it. `BRF-REFERENCES-SECTION` — that brief makes the jump map **visible** at the foot of the document; this one makes the same map **walkable**. Different artifact, one map.

## Objective

Settle the stride inventory: which units ship, which of them re-derive
position and which compound, which candidate units the corpus justifies,
and which it refuses. Then fix the record that misdescribes the shipped
binding, and specify the one missing unit the two objectives actually need.

The question that started this — *is there a structural stepper for
heading to heading?* — has one honest answer, and it is not the expected
one.

## The finding

### 1. The stepper exists, and has since 2026-09-12

`headingLines` and `snapFrame` implement it (`src/frames.ts:25`, `:54`),
`src/tui.ts:845-850` wires `]]`/`[[` to them, `splitKeyEvents` keeps the
pair whole as one key event (`src/keygrammar.ts:89`), and `HINTS`
(`src/tui.ts:224`) plus the frame-mode flash (`:749`) both advertise it.
`BRF-OKUDAGRAM-STEP:9-11` records it **LANDED 2026-09-12**: *"`]]`/`[[`
inherit the header jump as the declared skip."*

The viewer's compound — step the headings and read the first paragraph of
each — is already available as `]]` then `}`. A heading **is** a paragraph
start (`tests/frames.test.ts:80`, `:90`), and `}` from a block start lands
on the next one (`:98`). It composes because both strides are absolute.

### 2. The record drifts, and the drift is what hid it

`&next.md:24-26`, under *Landed today*, says frame mode's **"j/k step
frames."** The code says frame-mode `j`/`k` is `pageStep` — *"one
contiguous glass page… never a header-to-header leap"* (`src/tui.ts:806-818`)
— and the header jump lives on `]]`/`[[`. The docstring at
`src/tui.ts:572-579` states this correctly; the drift is isolated to
`&next.md`, which is tracked (not gitignored), so the correction is one
line and durable.

Second-order, same seam: `HINTS` names the binding `]]/[[ frame` — the
container word, not the motion word. A reader looking for *step headings*
reads *frame* and concludes the motion is absent.

### 3. The split that matters is not the unit, it is the arithmetic

Every stride in the dispatch (`src/tui.ts:804-856`) falls into one of two
classes:

| Class | Units | How position moves |
|---|---|---|
| Incremental | line, half page, page | `scroll ± n` — compounds |
| Absolute | paragraph, heading, top/bottom | re-derived from the document |

`snapFrame` returns a line index recomputed from the *current* scroll
(`src/frames.ts:54-65`), so a structural step **recovers** position after a
stray move. The incremental strides are the only ones that compound. This
distinction is load-bearing for the sweep complaint, and it is not written
down anywhere.

### 4. The ◆ stride is refused — measured

A load-bearing-mark stride was the obvious candidate for the *gate*
objective, and it does not survive its own census. `tmp/step-stride-census.ts`
over all 383 tracked `.md`:

| Quantity | Count |
|---|---|
| documents carrying any ◆ | 31 |
| documents with a leading ◆ | 24 |
| raw ◆ occurrences | 84 |
| leading ◆ lines | 35 |
| mention gap (raw − leading) | 49 |
| documents with ≥ 2 leading ◆ | 8 |

**49 of 84 occurrences — 58% — are mentions, not uses.** And the leading
filter is necessary but not sufficient: `docs/style-guide.md`'s three
leading ◆ are the definition of the mark and two examples of it, not
places where a reader triages. The style guide caps ◆ at *"once, at most
twice, per section"*, so two is the intended maximum and 8 documents reach
it. A stride with two stops in 2% of the corpus is decoration, and the
style guide's own rule applies: *"A glyph only earns its place where there
is real variance."*

The refusal is recorded as a finding, not deferred as a wish.

### 5. The reference stride is justified — measured

*"Exhaustively consume a document and its references"* is the half the
shipped units cannot serve, because references are the one structure the
reader must currently hold as a number in their head. The same census,
through the shipped code path (`scanReferences`, `buildJumpMap`):

| Quantity | Count |
|---|---|
| documents with any reference | 236 |
| documents with ≥ 2 stops | 167 |
| reference occurrences | 1655 |
| unique stops (the map) | 972 |
| documents at the 80-address cap | 1 |

**167 of 383 documents — 44% — have somewhere for a stride to go.** The
two hubs are exactly the pages a reader walks by reference: `&briefs.md`
(61 stops) and `&next.md` (26). The map is already the paint's source of
truth — *"the paint is a projection of the map"* (`src/vectors.ts:175`) —
so the stride and the paint share one derivation by construction.

Honest bound: the stride's stops are the map's entries, so `MAX_ADDRESSES` (= 80)
is the ceiling, and one document already reaches it. The stride is bounded
by the map's invariant, not the document's.

### 6. The wheel is a documented gift, and its granularity is not recorded

`\x1b[?1007h` (alt-scroll) is armed by the launcher (`src/launcher.ts:432`,
re-armed per round `:463`) and by the TUI (`src/tui.ts:510`). Under 1007 the
terminal translates wheel events into **arrow sequences**, which
`decodeKey` reads as `line-down`/`line-up` (`src/tui.ts:120-122`) — `scroll
± 1`, unconditionally, in every mode (`:833-834`).

This is deliberate. `playbooks/chrome-playbook.md:170-179` records it as a
gift — *"mouse-wheel scroll without owning the mouse"* — and the mouse
refusal at `:157` is about **reporting** (*"DECSET 1000/1002/1006 never
emitted"*), not about the wheel. So the wheel is not a contradiction of the
doctrine; it is the doctrine's own trade, taken knowingly.

What is **not** recorded is the consequence: the wheel is the one input
that **bypasses the mode's unit**. In frame mode `j`/`k` steps a page; the
wheel steps a line. And it cannot be given the mode's unit, because under
1007 the terminal destroys the wheel/arrow distinction — okuda cannot tell
them apart. That is a medium constraint, not a missed design choice.

## Scope

**In:**

- The `&next.md` drift fix — name `]]`/`[[` as the frame jump and `j`/`k` as
  the page step.
- The census, landed so the counts are re-derivable rather than quoted.
- The reference stride: a pure stops function beside the map, plus the bind.
- The `playbooks/chrome-playbook.md` ledger entry for the wheel's
  granularity and the 1007 constraint.

**Out:**

- **The ◆ stride.** Refused on measurement (§4). A later reader who wants it
  re-opens it with a corpus that has variance.
- **The outline / TOC pane.** Refused: *"the viewer refuses the tree and the
  outline so you see the content"* (`docs/2026-09-05-no-tree-no-outline.md:27`).
  A heading *motion* is legitimate precisely because it leaves no chrome and
  no persistent list.
- **The percentage meter / scrollbar.** Refused: *"the percentage was
  over-specified; the edges are right-specified"*
  (`docs/2026-09-05-frame-as-shite-filter.md:70`).
- **Turning alt-scroll off.** It reverses a documented gift (§6) and costs
  the reader wheel scrolling. The parked `reader-mouse-wheel` brief stays
  parked.
- **The `## References` section itself.** `BRF-REFERENCES-SECTION` owns it.
- **The intra-table cursor.** `ADR-TABLE-CURSOR-037` owns it; the outer
  *next table* motion is not this brief.
- **The edges-as-progress-indicator.** Designed at
  `docs/2026-09-05-frame-as-shite-filter.md:57-72` and unbuilt; a separate
  instrument with its own brief.

## Preconditions

- [x] The stride contract is landed and names its binds.
      **Verified 2026-09-30** — `BRF-OKUDAGRAM-STEP:9-11`, `:95-102`.
- [x] `]]`/`[[` reach `snapFrame(headingLines(...))` in the dispatch.
      **Verified 2026-09-30** — `src/tui.ts:845-850`; `src/frames.ts:25`,
      `:54`; `src/keygrammar.ts:89`.
- [x] The reference map is derived per render and is the paint's source.
      **Verified 2026-09-30** — `src/vectors.ts:104`, `:136`, `:175`.
- [x] The wheel's mechanism is identified end to end.
      **Verified 2026-09-30** — `src/launcher.ts:432`, `:463`;
      `src/tui.ts:510`, `:120-122`, `:833-834`.
- [x] `&next.md` is tracked, so the drift fix is durable.
      **Verified 2026-09-30** — `git check-ignore` exits 1; `git ls-files`
      matches.

## Work Plan

1. [ ] **The record.** Correct `&next.md:24-26`: `j`/`k` step a page in frame
      mode, `]]`/`[[` is the header-to-header jump. One line; no behaviour
      change.
2. [ ] **The census.** Land `tmp/step-stride-census.ts` as a script or a test
      so the four counts the refusal rests on are re-derivable. It imports
      `scanReferences` and `buildJumpMap` from `src/vectors.ts`, so it
      measures the shipped code path and not an approximation.
3. [ ] **The reference stride.** A pure stops function in `src/vectors.ts`
      beside the map, plus the bind in `src/keygrammar.ts` and the dispatch
      in `src/tui.ts`. The stops are the map's entries in map order.
4. [ ] **The ledger.** Add the wheel's granularity and the 1007 constraint to
      `playbooks/chrome-playbook.md`'s restraint ledger, beside the gift it
      qualifies.
5. [ ] **The refusal.** Record the ◆ refusal where the next reader looks —
      the census script's header and this brief's §4. No new document.

## Acceptance Criteria

* `&next.md` names `]]`/`[[` as the frame jump and `j`/`k` as the page step;
  the line no longer reads *"j/k step frames."*
* `]]` from any line lands on a heading line's index; `[[` from mid-frame
  lands on the current frame's header first — the shipped behaviour,
  restated as the criterion it never had.
* From the document top, repeated reference-stride presses visit every
  unique destination in map order and stop at the last.
* The stride's stops equal the map's entries: a document at the 80-address
  cap yields 80 stops and no more.
* A document with no references yields no stops, and the stride is inert
  rather than jumping to the top.
* One command prints the four census counts — 31/24, 84/35, 8, 167 — and
  agrees with this brief.
* `playbooks/chrome-playbook.md` states the wheel's granularity and why the
  mode's unit does not apply to it.
* `just check` passes and `bun test` is green.

## Notes

1. **The census excludes this brief.** It was taken at `8c61337` against
   `git ls-files '*.md'` — 383 documents — before this file existed. The
   brief is under its own rule, and the count moves by one when it lands.
   Re-measure against the committed set and correct the totals.
2. **The ◆ refusal is a refusal, not a deferral.** The mark keeps its job —
   priority, on the strong channel — and gains no navigation role. The
   style guide already refuses to colour it (*"consistency would be the
   leak"*), and this brief refuses to stride it, for the same reason: the
   axis is not a position.
3. **A correction is recorded here.** An earlier reading of
   `docs/2026-09-10-segmented-cognition.md:42,74,86` took *"no gravity-mice"*
   to cover alt-scroll, and concluded the wheel contradicted the doctrine.
   `playbooks/chrome-playbook.md:170-179` is the authoritative record on
   terminal-gifted input and it embraces alt-scroll as a gift. The doctrine's
   mouse refusal is about **reporting**. The wheel is the doctrine's trade,
   taken knowingly; only its *granularity* was unrecorded.
4. **The chrome playbook names a brief that does not exist.**
   `playbooks/chrome-playbook.md:178` rests its ledger on *"the parked
   `reader-mouse-wheel` brief"*; there is no such file, no row in
   `briefs/INDEX.jsonl`, and no td item. Measured 2026-09-30. Either the
   brief lands or the sentence stops citing it.
5. **`&briefs.md`'s facade is not part of the gate.** `just check` is
   signature-check + registry + facade-lint; the facade's staleness is
   `just amp`'s business and is already red by design
   (`&next.md:107-112`). This brief adds no facade row.
6. **The two objectives map to two classes, and only one was missing.** The
   gate is served by *absolute* strides — the opening frame is already the
   glance-confirm (`docs/2026-09-05-frame-as-shite-filter.md:31`), and the
   heading stride walks the structure. The consume half needed the reference
   stride, which did not exist. That asymmetry is the finding: the gate was
   already instrumented; the consume was not.
7. **`§NN` is derived, so the stride and the paint cannot disagree.**
   `ADR-031` retires authoring numbers; the stride reads the same map the
   paint reads (`src/vectors.ts:175`). No second numbering.

## Related

- `briefs/2026-09-07-brief-okudagram-step.md` — the stride contract this
  extends; `]]`/`[[` named as the declared skip
- `briefs/2026-09-13-brief-references-section.md` — the map made visible;
  this brief makes it walkable
- `decisions/037-table-cursor.md` — the intra-table cursor, pending; the
  outer table motion stays out of scope here
- `src/frames.ts` — `headingLines`, `snapFrame`, `paragraphStarts`,
  `pageStep`
- `src/vectors.ts` — `scanReferences`, `buildJumpMap`, `MAX_ADDRESSES`
- `src/tui.ts` — the dispatch (`:804-856`), the wheel path (`:120-122`,
  `:833-834`), `HINTS` (`:224`)
- `playbooks/chrome-playbook.md` — the restraint ledger; the gift this brief
  qualifies
- `docs/2026-09-05-frame-as-shite-filter.md` — the gate posture and the
  unbuilt edges
- `docs/2026-09-05-no-tree-no-outline.md` — why a motion is not an outline
- `docs/2026-09-10-segmented-cognition.md` — the phase buffers; the note
  this brief's §6 corrects the reading of
- `tmp/step-stride-census.ts` — the census instrument
