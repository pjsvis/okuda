---
type: Brief
callsign: BRF-JUMP-LIST
---

# Brief: The jump list — the search screen as its projection

**Created:** 2026-09-14
**Status:** Open
**TD:** td-34479f (epic) — td-c43257 the remainder filter, td-975a6e the rank,
td-191918 the extraction, td-9617f1 the address space, td-b276c4 the render,
td-747ca0 the focus machine, td-cb8be0 the return-protocol, td-5114f6 the dogfood
**Lineage:** the reader's 2026-09-14 session — *"we own the render of the search
screen · we have the technology of the rubricated silcrows · take over the render
of the text input box and the tabulated results"* — and the four riff rounds that
followed: the fzf inventory, the unsighted machine, the TAB focus model, and the
jump list.
**Extends:** **BRF-SEARCH-SURFACE** owns the surface — the `Row[]` array with its
channel, the register reader, the invariant audit, the state machine. It measures
the **voice width** and scopes it out. **BRF-AUDIO-DISCOVERY** owns the cue seam —
the classes, the patience, the abandonment handle, the binding, the cast. This
brief owns the **jump list** and the **render**, and forks neither.

## Objective

Make the derived, ordered, ephemeral, addressable list one artifact — **the jump
list** — so that a document's references and a query's results are the same thing,
and the search screen is a projection of it rather than a separate machine.

## The invariant and the variable

The method is the silo's own: *name the invariant, bound the variable, let the
boundary do the work.*

- **The invariant** — the jump list: derived per render, ordered, ephemeral,
  capped, addressable.
- **The variable** — what it maps: a document's references, or a query's results.

The document reader and the search screen stop being two machines. They are one
gesture over one artifact, and the reader already knows the gesture: two digits.

## What is measured, not argued

**The stream is a constant, and the count is a lie.** `--entries <q>` returns the
whole non-root corpus for *any* non-empty query.

| query | stream rows | evidence-bearing | fzf matches |
|---|---|---|---|
| `silcrow` | 273 | 38 | 33 |
| `zzzznomatch` | 273 | 0 | 0 |

**Defect 1 — the second filter discards answering rows.** Five rows that matched a
channel, and therefore answer the query, are removed by fzf's `--exact` because the
literal string is not in `path + snippet`:

- `advisories/ADV-GRAVEYARD-RM-R.md`
- `advisories/ADV-SEARCH-TWO-FILTERS.md`
- `docs/2026-09-05-i811-dual-layer-output.md`
- `docs/2026-09-05-poverty-of-ui-design.md`
- `docs/style-guide.md`

The reader is told nothing. `ADV-SEARCH-TWO-FILTERS` — the advisory that declares
the silo's two-filter composition — is one of the rows the undeclared third filter
eats.

**Defect 2 — the rank is not authoritative.** `--tiebreak=index` breaks score ties
only; fzf's score dominates. Our #2 lands at fzf's #5 and our #7 is dropped. The
ranked merge's precision order is true of the stream and false of the screen.

**The address space is 80, and the naive offset breaks at row 11.** From
`src/vectors.ts`: `VECTOR_MIN=12`, `VECTOR_MAX=98`,
`RESERVED_VECTORS={22,33,44,55,66,77,88}`, so `MAX_REFS = 87 − 7 = 80`.
`buildJumpMap` skips the reserved pairs as it ascends.

| row | address | naive `row + 11` |
|---|---|---|
| 10 | 21 | 21 |
| 11 | **23** | 22 — reserved |
| 21 | **34** | 32 |
| 80 | **98** | 91 |

The map is `row + 11 + floor((row-1)/10)` — eight blocks of ten, with the doubled
pairs as the gaps. **The cap is the bisect trigger**: the speech doctrine bounds
addressing at *≤90, bisect down*, and the vector space arrives at 80 independently.
Over 80 addressable rows the machine says *narrow the query*, not *here are 273*.

## The search screen as a state machine

States are the system's; the cue column is the reader's. `INPUT` and `LIST` are the
two regions of one screen. `TAB` toggles: with two regions a reverse binding is dead
code. `TAB` is `0x09` and absent from `decodeKey` (`src/tui.ts`), so it is free.

```mermaid
title: The focus machine — INPUT and LIST, TAB only
stateDiagram-v2
    [*] --> INPUT
    INPUT --> LIST : TAB
    LIST --> INPUT : TAB
    LIST --> READING : digits
    READING --> LIST : unwind
    INPUT --> INPUT : keystroke
    LIST --> LIST : arrow
```

**The cue contract.**

| From | Event | To | Cue | Class |
|---|---|---|---|---|
| — | open | INPUT | launcher | mode |
| INPUT | TAB | LIST | list | mode |
| LIST | TAB | INPUT | query | mode |
| INPUT | keystroke | INPUT | n answer | count |
| LIST | arrow | LIST | row readout | count |
| LIST | digits | READING | reader | mode |
| READING | unwind | LIST | restatement | requested |
| any | restate | same | restatement | requested |
| any | exit | — | the door | mode |

**Two patience regimes, not three.** In the document reader the classes differ
because the events differ in kind. The search screen has two.

1. **Streams settle.** Typing and arrowing are streams; only the settled state is
   worth speaking. The readout is regenerated per arrow, and a new string supersedes
   the previous inside its own leading pause, so a fast run never gets past the
   pause. One rule covers both regions.
2. **Returns are immediate.** A restatement is a single deliberate act, not a
   stream.

**A mode is acceptable iff it is announced.** ADR-030 killed invisible modes — the
operator typed a content query into the wrong one because nothing said a mode
existed. `TAB`'s mode is visible for the eye and announced for the ear, and the
audio brief's **mode** class was written for exactly this: *"a focus transition is
useless five seconds late."*

## The unsighted screen

For the sighted reader the screen keeps the reader's model in sync for free — every
state is readable off the glass, which is the thesis's own escape hatch. The
unsighted reader has no glass, so the machine carries the reader's *knowledge*, not
only the system's state. Four consequences, each structural.

1. **The shelf→dive transition diverges most.** One keystroke changes the whole set
   and the mode. The eye gets both from one repaint; the ear is told twice, serially.
2. **`unwind`'s cue class is wrong for the ear.** A *mode* cue suffices for the eye
   — the list is already there — and is useless for the ear, which has lost the list.
   The restatement replaces it.
3. **The drop rule is unsound without the restatement.** *"A cue is spoken only if
   its state still holds"* is free for the eye, because the screen is the record. For
   the ear a dropped cue is a state never learned, with no re-glance to recover it.
   **The restatement is the anchor for the ear**, and it is what makes the drop rule
   sound. `explainers/accessibility.md` names the anchor as the silo's one
   known-working accommodation for losing your place; this is that principle on the
   audio channel.
4. **`exit`'s cue is "nothing"** — right for the eye, ambiguous for the ear, where
   silence is indistinguishable from a crash. The exit cue fires **before**
   `cleanup()`. It is the session-boundary mode cue the audio brief already asks
   about, and its criterion *"no cue after the session ends"* does not yet admit it.

**The restatement — mode first, then the region's own state, stable before
volatile.**

| Region | Restatement |
|---|---|
| INPUT | input, \<query\>, \<n\> answers |
| LIST | list, \<position\> of \<n\>, \<slug\> |

The query read-back is **verification, not information**: the reader typed it and
cannot verify it. That is why it belongs here and not in a cue — a cue reports
state, and the restatement answers a question the reader half-knows already.

**The row readout — stable first, volatile last.**

| Field | Volatile | Spoken | Why |
|---|---|---|---|
| slug | no | always | the identity |
| date | no | on change | repeats in runs |
| number | yes | last | dies on next keystroke |

The ear is serial and cannot skip a leading zero-information token — the silcrow's
own landed lesson, *the eye learns to skip the leading numeral*. Dates run in runs
(13,13,13,13,14,5,5,5), so the date is spoken on change. The number goes last
because it is the only field the next keystroke invalidates.

## What fzf does, and what replaces it

| fzf's job | what it does | verdict |
|---|---|---|
| input line | keys, echo, cursor | build |
| the filter | `--exact` on the line | replace |
| the order | score, then index | take back |
| the render | window, cursor, highlight | build |
| scrolling | page, auto-scroll | reuse |
| terminal | raw, alt-screen, resize | reuse |
| reload child | spawns this binary | delete |
| exit protocol | `--print-query` | delete |

The input line is the one component with no precedent in this repository. The two
`delete` rows are the largest win: the query never leaves the process, so
`selfEntriesCmd`, the `{q}` escaping and the execPath/argv[1] dev-versus-compiled
seam all evaporate.

## Scope

**In:**

- The jump list: one derivation serving a document's references and a query's rows.
- The remainder filter, so the stream is honest and the empty state is empty.
- The rank as authoritative: the merge's order is the screen's order.
- The address space: floor 12, skip the reserved pairs, cap 80, and the mapping test.
- The render: the input and the list, with no header, no info line and no prompt
  chrome. The row renders as a **line**, not a grid cell.
- The focus machine, expressed as the cue table in the source.
- The return-protocol: automatic on return, and an actuator on demand.
- The two patience regimes, and the exit cue.
- The `speak-md` gaps reported upstream. Nothing lands there.

**Out:**

- The cue seam's mechanism — patience values, abandonment, the binding, the cast.
  BRF-AUDIO-DISCOVERY owns it.
- **Persisting the jump list.** The silcrow doc forbids it: a stable number *"would
  fight the trained eye and lose."* Durability is the **callsign's** job, which is
  why the row renders the callsign; the copy is the **host's** act, not okuda's.
- The **voice width** — measured and recorded in BRF-SEARCH-SURFACE; nothing lands.
- The table allocator (BRF-TABLE-WIDTH). The row is a line, so the grid's cut does
  not apply.
- SSH. Nothing lands. A binding is a command, and a command can be `ssh`.
- The vector **actuators** are settled rather than deferred: `LIST` plus digits
  dereferences, exactly as a document's jump list does.

## Preconditions

- [x] `MAX_REFS = 80`, floor 12, reserved `{22,33,44,55,66,77,88}` — read from
      `src/vectors.ts:26–46` and confirmed by computation. **Verified 2026-09-14.**
- [x] `TAB` (`0x09`) is absent from `decodeKey` and resolves to `null`.
      **Verified 2026-09-14.**
- [x] fzf is 0.73.1 and is a named runtime dependency (`DEPENDENCIES.md:14`).
      **Verified 2026-09-14.**
- [x] The four measurements above reproduce. **Verified 2026-09-14.**
- [x] `just check` reports no drift other than the pre-existing
      `briefs/2026-09-14-brief-conceptual-lexicon.md` — foreign work, unregistered
      and without frontmatter, outside this brief's scope. **Verified 2026-09-14.**

## Work Plan

1. [ ] Branch `feat/jump-list`, off `feat/search-surface`.
2. [ ] Filter the remainder so the stream stops being a constant; assert an empty
       state for a query that matches nothing.
3. [ ] Make the rank authoritative, and assert the screen order against the stream.
4. [ ] Extract the jump list: one derivation, two sources, one type.
5. [ ] The address space, with the mapping asserted — row 11 to 23, row 21 to 34,
       row 80 to 98, and `row + 11` asserted wrong at row 11.
6. [ ] The render: input and list, no chrome, the row as a line.
7. [ ] The focus machine as the cue table in the source, not as stored state.
8. [ ] The return-protocol, automatic and on demand.
9. [ ] The exit cue, before `cleanup()`.
10. [ ] Dogfood by ear: one query, one restatement, one row.

## Acceptance Criteria

* `--entries <q>` returns the rows the render will show; a query matching nothing
  returns none.
* The rank is the order: for a fixture query the stream order equals the screen
  order.
* fzf appears in neither the spawn path nor `DEPENDENCIES.md`.
* The address mapping is asserted by test, including that `row + 11` is wrong at
  row 11 and that no reserved pair is ever issued.
* The render carries no header, no info line and no prompt chrome.
* Every transition in the focus machine's table is walked by a test asserting the
  cue class it emits.
* The restatement for each region flattens to its golden through `speak-md --dry`.
* The row readout is slug, date, number, and a repeated date is suppressed.
* The exit cue is emitted before `cleanup()`.
* With the cue binding unset, okuda's output is byte-identical to today — no new
  writes, no process spawns.
* `just check` passes and `bun test` is green.

## Notes

- **This brief is read by ear, so its own tables are under the rule it records.**
  The voice renders at 80 columns and a table needing more shatters silently. Every
  table here is verified by rendering at 80, not by reading source.
- **The failure mode is re-implementing fzf in our own colours.** By
  `docs/2026-09-05-poverty-of-ui-design.md`, fzf is a *specified interface at the
  screen layer* — it divides the glass into real estate. Taking over the render is
  **removing** a specified interface, not building one. A search *widget* — box,
  table, header, status line — is the box-drawer's drawing of boxes. The screen at
  the search moment is the query and its answer.
- **`ADR-034` caps the row paint at one mark.** *The affordance is the affordance.*
  The row's address is the affordance: not address plus glyph plus border plus
  highlight.
- **The silcrow's flip does not transfer.** In a document a low silcrow deep in the
  text means *back-reference* — the number carries novelty. A row's number carries
  **rank**. Rank is the better signal in a list, and it is a different semantic: the
  mechanism transfers, and the word does not mean two things at once.
- **The name.** A *map* centres the number; a *list* centres the entries, and the
  silcrow's lesson is *the number is furniture, the name is the content*. The type
  stays `Map<number, string>`; the name names the reader-facing artifact. The rename
  lands in `docs/2026-09-04-the-silcrow.md`, BRF-SEARCH-SURFACE and ADR-029/031, or
  by the silo principle it does not exist.
- **The i811 question, answered here rather than deferred.**
  `advisories/ADV-GRAVEYARD-RM-R.md` asks whether building a picker is protocol
  theatre. It is not: i811 inserts an abstraction *between reader and content*, and
  this removes one.
- **The counter-risk.** The reader's time is spent when a memorised number dies on
  the next keystroke. The window in which the list is addressable is the window in
  which the reader has stopped typing — the same condition as the count's patience.
  Announcement and addressability are one event, not two.
- **`speak-md` defects reported, not fixed:** `probe` and `--dry` are different
  flattening paths; the BRF-only callsign expansion, where `ADR-030` reaches the
  voice as spelled letters while `DBF-`/`PLY-`/`ADV-` pass through raw; and the
  date-hyphen glue.

## Related

- `briefs/2026-09-14-brief-search-surface.md` — the surface this brief extends: the
  `Row[]` array, the register reader, the state machine, the invariant audit
- `briefs/2026-09-13-brief-audio-discovery.md` — the cue seam: the mode class, the
  patience contract, the abandonment handle
- `docs/2026-09-04-the-silcrow.md` — the jump list's doctrine; *names for
  recognition, numbers for actuation*
- `docs/2026-09-05-poverty-of-ui-design.md` — design the actuator, the screen and
  the channel; let the interface emerge
- `docs/2026-09-14-speech-driven-design.md` — one canonical text, N bounded
  projections; the addressing bound at ≤90
- `docs/2026-09-03-the-variable-is-the-invariant.md` — the thesis the audit applies
- `decisions/034-no-unnecessary-rubrication.md` — one signal per affordance
- `decisions/030-live-search-picker.md` — the invisible modes this must not
  reintroduce
- `decisions/032-repeated-digit-actuators.md` — the reserved pairs and the canon
- `explainers/accessibility.md` — the anchor, the first law, the dunt-stream
- `src/vectors.ts` — `VECTOR_MIN`, `MAX_REFS`, `RESERVED_VECTORS`, `buildJumpMap`
- `src/launcher.ts` — `rankedShortlistEntries`, `dedupeEntries`, the fzf argv
- `src/tui.ts` — `decodeKey`, `advanceNumBuffer`, `viewport`, `footerLine`
