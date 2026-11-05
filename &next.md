# &next — the decision table

Each entry is an **action block**: one line, one action — *name,
verdict, cost* — with its reference in plain sight. 

Actuate the rose vectors §11-§98 to render the referenced documents:
- `u` unwinds and returns to main document; 
- `99` promotes the referenced document to its own terminal. 

## This sweep found the table pointing at a closed queue — read this first

Every task ID this table carried pointed at nothing live. Checked 2026-11-05:
eleven were **closed**, and one was not on the board at all — the ephemeral
store had pruned a row this table still cited. The recommendations
were three weeks old and the queue underneath them had emptied.

**And "closed" carried four different verdicts, plus one that was simply
wrong** — which is the part that matters:

- **decided**: the remote speech seam closed because `ADR-036` gave it a
  verdict the day it was written.
- **refused**: `BRF-RENDER-DEFECTS` and `BRF-CAPABILITIES-DOC` closed rejected
  2026-10-27, the operator's call — too old, the corpus moved on. Both archived
  rather than deleted, so they can be replundered.
- **parked**: the capabilities task closed 2026-10-02 having never started.
- **swept**: the rest closed 2026-10-27 by a sweep that recorded its own reason
  as *"closed as cleanup, not as work judged."*
- **and one recorded a reason that is false**: the cut cell was swept with *"its
  brief was refused"* — but `BRF-TABLE-WIDTH` is **Done**, shipped 2026-10-02
  on `866f1fc` under `ADR-UNIVERSAL-ELISION-050`, three weeks before the sweep.

An ID survives all five. Only the callsign carries the verdict, and only the
registry can still tell you which one it was.

So the rule for this document, from now: **an action block cites a callsign or
a path, never a task ID.** A task is a pointer into an ephemeral store whose
closure is unreadable from the pointer — the One-Way Valve, applied to the one
document that had been ignoring it. Where an action has no brief yet, this table
says so and *writing that brief is the first hour of the work.*

This table is hand-edited by design (ADR-DERIVED-AMP-TABLE-058: the grouping
and the verdicts are the editor's, and only `&briefs` is derived). That is why
it rotted: nothing derivable can notice a hand-written judgement going out of
date. The mechanism is now filed — see **Hygiene**.

## Landed since the last sweep — 2026-11-05

- **Per-token baselines, both citation gates** (`ADR-ALLOWANCE-NAMES-REFERENT-084`,
  `BRF-COUNT-BASELINE-TOKENS`, `DBF-ALLOWANCE-REFERENT`) — a count cannot say
  *which* citation it permits, so a file could drop one grandfathered citation
  and gain a different one at equal count and read `ok`. Both gates now judge
  `{file: {token: count}}`; the swap fails and names the intruder. The migration
  found two things: the td-ID gate had been counting **citation-bearing lines**
  (31 citations invisible), and 32 stale baseline entries had been printing
  `can shrink` unread for weeks.
- **The gate names itself** (`ADR-GATE-TWO-RENDERS-085`, `BRF-FIRST-CONTACT`,
  `DBF-FIRST-CONTACT`) — `justfile`'s 860-character `&&` line is now a named
  table (`scripts/gates.sh`), fail-fast, with the failure printed *below* the
  evidence and a one-command re-run. `--gate` is the verdict render: a passing
  check is **24 lines, each a gate's own answer** (was 127, ~100 carrying no
  verdict), and every reading moved behind its own address (`just seams`,
  `ideas`, `census`, `amp`, `dates`, `ref-census`).
- **The ready queue is derived** — `just next` reads `td list --json`, separates
  claimed from startable work, and prints its own depth. Two instrument defects
  fell out: `td list` caps at 50 rows and announces the cap **on stdout** (three
  readers were exposed; all now pass `--limit 0`), and the contrast ladder had
  no reading door at all — the gate was the only way to see the evidence it
  judged.
- **The loaded protocol states the term, not the history**
  (`ADR-GLOBAL-TERM-086`) — 490 lines / 33 KB → 385 / 25.9 KB, 13 callsigns that
  resolved inside exactly one silo → 0. Every term and every **Test** kept; the
  narration dropped, because it already lives here.

## Recommended — start these next

- **BRF-PLATFORM-PACKAGES, step two** — the shim, the name migration, the
  publish. The matrix is green in the gate (`platform-packages: OK — 8
  manifest(s) match the matrix`), so this is the step where the silo starts
  shipping a binary rather than a source tree. · **M**
- **The map cap fails silently** — `briefs/index.md` mints 77 of 80. This is the
  third instance of one class found in a single day (the td list cap, the count
  baseline, this): *an instrument reporting a ceiling as a fact*. Cheapest class
  in the silo to close and the one it keeps re-finding. No brief yet. · **S**
- **BRF-SEARCH-ROW** — the search row as a pure renderer over `Row[]`, with
  tests. The brief is written and the contract is frozen by the probe, so the
  work is defined rather than to be discovered. · **M**
- **A pipe inside a code span breaks a table cell — in both renderers,
  silently** — silent corruption of a document's own content, in the one place
  the restricted grammar cannot escape. Two renderers, one test. No brief yet.
  · **S**
- **The ladder's verdicts vs the ranking reading** — rungs 3, 4 and 5 are
  order-inverted. Observed today in the ladder's own reading while the verdict
  render was being cut: the inversion is a *reading*, not a failure, and the
  task exists because nobody has decided what a rung may cost. This one needs a
  decision before code, so the brief comes first. · **S-M**

## Ready — when the pain flares

- **The citation web's blind spots** — three filed, all the same shape (a lint
  that cannot see what it is looking at): `citation-drift` cannot see a hint
  that names no identity, **221 of 330 are that shape**; the citation census is
  blind to a dangling `Enforced by:` — the one line `decisions/TEMPLATE.md`
  calls load-bearing; a path citation to an **archived** brief goes quiet in the
  terminal, though the callsign resolves (today's archived `BRF-COUNT-BASELINE-TOKENS`
  is the live instance: the callsign still lands, the path would not). Each is
  a day's work once the shape is chosen. · **S** each
- **`--no-color` escape leak** — 28 bold escapes survive into a sink that cannot
  read them. Two consumers now named (the voice, and the e-ink panel that draws
  `\x1b[1m` literally), one artefact: a `--plain` dial. Build it when the second
  consumer is real, which it now is. · **S**
- **The perimeter's stale measurement** — `BRF-PERIMETER-GATE`'s 22-of-28 was
  taken before the eviction. Retake it before writing any report on it, because
  a stale measurement is a claim with a live referent that no longer agrees.
  · **S**
- **Tidy-first: the palimpsest sweep** — two sittings of gate surgery have left
  the corpus with new documents and old residue. The four invariants drive it;
  it wants the backlog's quiet spot, not its head. No brief yet. · **M**

## Exploration — read-and-think, no code

- **CALL Scotland — the outreach option, reserved** (2026-10-05). The
  University of Edinburgh's assistive-technology service — the one outside body
  whose remit overlaps this project's *purpose* rather than its mechanism.
  Their published stance is ours one layer upstream: *making the original
  accessible reduces the need to produce accessible formats*. The drafted piece
  is `docs/2026-10-06-the-shared-artifact.md`. **Reserved, not sent:** contact
  is the operator's call, and the trigger is a re-read in a week. The two
  questions worth their time: does the unreachable-address idea help a tremor or
  switch user, and what does a shared artifact owe a partner who arrives cold?
  · **S**
- **The frame thing, two objectives** (2026-09-07) — (1) how best to do the
  frame thing (the semantic pager: chunk = heading-subtree vs
  sub-heading/paragraph for the ear); (2) whether the frame thing serves the two
  modes (visual scroll, audio TTS). The coupled-frame dogfood is the test rig.
  External test: two readers, one document, references passed between them.
  · **M**
- **BRF-PRINCIPAL-CLERK / BRF-CHOICE-LIST / BRF-PAIR-DELIVERED /
  BRF-TEMPORAL-WINDOW** — four briefs at the design edge of the rendering
  contract: the three-way triage, a document that is a setting, the re-themer's
  own override point, and the date the reader already types. All open, none
  scheduled; read them together before promoting one, because they share the
  question of what the document is allowed to *be*. · **M**

## Hygiene — small, owed

- **Mechanism for this table's rot** — an `&` document that cites a task ID
  should fail the gate when that task is no longer open, so a hand-written
  action block cannot go out of date silently. `amp-check` already reads these
  documents and already fails on a wire that resolves to nothing; this is the
  same rule pointed at the ephemeral store. Ticket filed 2026-11-05. · **S**
- **A stale-open task on the board** — `briefs` status vocabulary is filed as
  open work, but `ADR-BRIEF-LIFECYCLE-061` landed it on 2026-10-13 and
  `reg-sync` reports zero unrecognised words today. Either the task's acceptance
  is wider than its title, or it is done and the board is carrying a finished
  thing. **The operator's call, and the first one in the morning** — closing
  another session's task without walking its acceptance would be a claim, not a
  decision.
- **The porch matrix** (BRF-PORCH-MATRIX) — not built yet: the scheme handlers
  and the per-glass verdicts. · **M**
- **Two dating debts** — 19 playbooks declare no date (the tier's dating rule is
  undecided: first commit as a derived date, or no date at all), and 113
  date-prefixed documents have no declared date and no registry row. Both
  ticketed 2026-11-05 rather than guessed at, because a date nobody verified is
  a claim. · **S-M**

## Not next — deliberately

- **The single binary** (2026-10-05) — a vendor proposal to compile the helpers
  to Wasm and ship one artifact, answered and shelved:
  `docs/2026-10-05-the-single-binary-is-a-provisioning-question.md`. The
  measured maximum win is 60 ms on the heaviest document in the corpus (four
  mermaid fences) and 15.0 ms per fence end to end, of which the Rust engine is
  0.5 ms — the rest is a bash wrapper. Three named revival triggers: a host with
  no provisioning path, a consumer wanting the engine as a library, or the
  per-fence number going material.
- **BRF-FLOW-WRAP** (fresh) · **BRF-MERMAID-HARD** (waits on a paged-view
  world) · **the speech set** (leaves this table — `ADR-PERIMETER-039`: the
  tuning loop is Blandings', and the ear owes its own corpus the auditions.
  **BRF-SPOKEN-BLOCK-GRAMMAR stays**, because `ADR-037` cites it and moving it
  breaks the record) · **the docs candidates** (speech-driven design, the
  intention loop — landed, unregistered, awaiting the Derrida and Foxtrot-Oscar
  gates) · **everything parked** (still parked).

## Closed, and what closed it

Kept for one sweep so the morning review can see what this table used to say;
then this section goes — git has it.

| Was recommended | How it closed | The record that carries the verdict |
|---|---|---|
| The cut cell (the allocator spends columns wrong) | swept as *"brief refused"* — **the reason is false** | `BRF-TABLE-WIDTH`: Done, shipped 2026-10-02 (`866f1fc`, `ADR-UNIVERSAL-ELISION-050`) |
| Render defects — the stack map's four findings | rejected 2026-10-27, operator's call | `BRF-RENDER-DEFECTS` (archived, replunderable) |
| Capabilities doc — the paid-claim inventory | parked 2026-10-02, later rejected | `BRF-CAPABILITIES-DOC` (archived) |
| Remote speech seam verdict | **decided** | `ADR-036` — no speech code; duty ends at the plain-text channel |
| The search-area redesign session | epic closed; the scoping it deferred is unrecorded here | — |
| Duplicate-callsign lint | closed, and the lint is in place: `reg-sync` names every collision and fails on it | `scripts/reg-sync.ts` (collision path) |
