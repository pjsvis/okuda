---
type: Brief
callsign: BRF-CALLSIGN-EVERY-DOC
date: 2026-09-15
---

# Brief: A callsign for every document — the name and the address are orthogonal

**Created:** 2026-09-15
**Status:** Open

## TD

td-ec6bb0 (epic) — td-6613b3 the Map · td-86432c one tier list · td-32e679 the prefix lint · td-30b1d5 the shorthand reaches the picker · td-070a26 the bootstrap, then `docs/` · td-e9ccd2 name the rest · td-6d25bd the spoken form, auditioned · td-8e71ef the stability rule

## Lineage

the reader's 2026-09-15 session, in moves. The proposal — *for our registered folders we maintain a silo-unique call-sign for each document; what if we give all documents in the silo a silo-unique call-sign*. The payoff — *now we can note the callsign and recover the document quickly; and we can keep concise notes about which documents are required for our argument*. The handover — *as far as document memory is concerned lets hand it of to the user*. The naming test — *the call-sign tells you what the documnt is, roughly*. The orthogonality — *the vectors and the call signs are orthogonal concerns*. The bound — *when we require vectors we have 80 available, more than enough*. The single job — *the call sign does one thing, it names the document, thats it*. The spoken form — *we can speak the slug then the doc type: eg the slug brief and the slug doc*. The method — *we have a lot to think about and we should do some smoke tests*. The licence — *we have the documents and we can reinitialise without pain*. The requirement, and it is the whole requirement — ***we are looking for a cool way to remember shit***.

## Extends

**BRF-ADDRESS-CAP** owns the vector and its bound; nothing here touches it. `docs/2026-09-15-the-search-panel-speech-first.md` owns the panel that will consume these names; this brief supplies them and nothing else. **`docs/2026-09-15-the-scaling-profile.md`** owns the cost curve of the store around them, and amended this brief on the day it landed — the point lookup is O(N), and the bootstrap that mints the names is unsound. **ADR-036** owns the division of labour — okuda owns the cue, the silo owns the voice — and the spoken form below is a cue, not speech. **ADR-025** owns resolution: exactly-one-or-null, never the silent first-wins. **ADR-CHUNK-SEQUENCE-038** owns the trailing ordinal: a `slug.md` / `slug-02.md` sequence is one document, the head is unnumbered, and a part takes no key. Step 5 is the change that runs its reversal.

## Objective

Give every document in the silo a **silo-unique callsign** — a name that is
spoken, written in a note, and resolved back to a document — so that document
memory can be handed to the reader as a list of handles. The requirement is not
completeness for its own sake: it is that a note reading *the address cap brief*
recovers a document, and that the handle itself says roughly what the document
is.

The proposal is not a new mechanism. It is the mechanism the silo already has,
extended to the documents it has so far left unnamed, and repaired where the
smoke tests found it lying.

## The orthogonality — two namespaces, measured

The reader's claim is that the vector and the callsign are different concerns.
They are, and the difference is not philosophical — it is arithmetic.

| | the vector | the callsign |
|---|---|---|
| what it is | a position | a name |
| bound | 80 | unbounded |
| lifetime | one render | the document's |
| who derives it | the renderer | the registry |
| spoken? | never — a gesture | yes: slug then type |
| names | where in *this* document | *which* document |
| docs/ alone needs | 131 — over by 51 | 131 names, no bound |

The vector cannot carry the silo: 131 documents in `docs/` against 80 addresses
is over by 51, and that is one tier of five. The callsign cannot carry a
citation: a citation is a position inside one document, and a name is not a
position. Each is the right instrument for exactly one job, and neither
substitutes for the other. The callsign's one job is to name the document.

## What is already true — the smoke tests

`tmp/callsign-smoke.ts`, `tmp/callsign-reach-probe.ts`,
`tmp/shorthand-probe.ts`, `tmp/callsign-census-probe.py`,
`tmp/prefix-probe.py` — run 2026-09-15 against the working tree.

**The callsign already works, and better than the brief expected.** An exact
callsign query puts the document it names at **rank 1** — for a brief, for a
decision, for a playbook, and for the three `docs/` callsigns the resolver
cannot reach. The body channel matches the frontmatter line and carries it as
evidence. The reach problem this brief first assumed does not exist.

**The spoken form is already the best query.** *"address cap"* → the brief at
rank 1. *"speech stride"* → the brief at rank 1. *"live search picker"* → the
live-search brief at rank 1. The slug is the word the reader says and the word
the search matches; the type word is the disambiguator, and the ear needs it
only when two documents share a slug.

**The saving is real and it is in the ear.** Across 142 registered callsigns:

| | path | callsign |
|---|---|---|
| characters | 6,029 | 2,629 (−56%) |
| spoken tokens | 2,515 | 1,137 (−55%) |
| per document | 17.7 | 8.0 |

And the spoken form costs **half the token again**: 4.0 spoken tokens against
8.0, because *the address cap brief* is four words and `BRF-ADDRESS-CAP` is
three letters spelled, a word, and three letters spelled.

## The defects the smoke tests found

Each is measured, each is in the tree today, and each is small. None is a
reason to abandon the proposal; all five are reasons the proposal is not yet
true.

**D1 — Two tier lists, one drift.** `scripts/reg-sync.ts:34–42` names **five**
tiers — briefs, debriefs, decisions, playbooks, **advisories**. `src/root.ts:24–29`
names **four**; advisories is absent. `advisories/INDEX.jsonl` exists and carries
five callsigns. Measured: **142 registered, 137 reachable, 5 orphaned.** The
registry writes a name the resolver can never return. Two lists, two consumers,
drift — and the silo's own principle (`src/root.ts:22–23`, *one list, two
consumers, no drift*) is the rule being broken.

**D2 — A tier with two prefixes.** `debriefs/INDEX.jsonl` carries **17 `DBF-`**
and **2 `DBR-`** (`DBR-FZF-OWNS-LOOP-ABORT`, `DBR-SSH-BRINGUP`). `DBF` and `DBR`
differ at one letter of three — spoken, the pair is a coin-flip. `csPrefix`
(`scripts/reg-sync.ts:253`) is read only to *bootstrap* a new callsign; nothing
asserts that an existing one wears its tier's prefix. So nothing caught it. Two
rows are the proof that a namespace without a lint drifts.

**D3 — The ordinal shorthand is a one-resolver feature.** `resolveByCallsign("ADR-030")`
→ `decisions/030-live-search-picker.md`. **FOUND.** The entry stream cannot
carry it: `rg -F "ADR-030" decisions/INDEX.jsonl` → **0 hits**, because the
registered callsign is `ADR-LIVE-SEARCH-030` and the shorthand is a
resolver-side construct. Measured in the picker: **not carried.** Two resolvers,
one grammar, disagreeing — and the actuator knows a name the picker cannot find.
`ADR-030` is how prose in this silo already abbreviates.

**D4 — The ear-collision is in the noun, and it is the pair with the most
documents.** The spoken form is *slug then type*, so the type word is the last
thing heard and the only thing that distinguishes two tiers. `brief` / `debrief`
— one contains the other; the ending carries the whole signal. `BRF` / `DBF`
differ at one letter of three. The tier pair that collides is the pair holding
**85 of 142** callsigns. The prefix probe finds exactly two one-letter pairs in
the namespace — `ADR`/`ADV` (42 callsigns) and `DBF`/`DBR` (19) — and the noun
map finds exactly one containment pair, `brief`/`debrief`.

**D5 — 174 of 316 documents have no name.** Measured, by tier:

| tier | unnamed |
|---|---|
| docs | 131 |
| .archive | 17 |
| (root) | 10 |
| explainers | 9 |
| advisories | 2 |
| decisions | 2 |
| briefs | 1 |
| debriefs | 1 |

`docs/` is not a registered tier at all — it has **no JSONL index**, against
`AGENTS.md` rule 6 (*if a directory accumulates documents, it gets a JSONL
index*). So the three `docs/` callsigns that do exist — `DOC-FRAME-EDGE-CASES`,
`REF-PALETTE-PAGE`, `REF-PALETTE-SWATCH` — declare a name with nowhere to live.
Measured: `callsignForFile("docs/style-guide.md")` → `null`.

**D6 — The name's stability is undecided, and it is the same trap the registry
already has.** 105 of 142 callsigns (**74%**) are slug-only; 37 carry an ordinal
tail. Resolution survives a retitle — `loadCallsigns` keys on the record, never
the filename stem (`src/root.ts:121–124`). But a slug-only callsign **is** the
document's old title: retitle the document and the name becomes a lie, and every
note citing it cites the lie. The ordinal tail (`-030`) is rename-proof and
meaningless. This is `summary`-derived-once one tier up — a derived field that
nothing re-derives. The decision the proposal needs is not whether to name
documents; it is **what happens to a name when its document is retitled.**

**D7 — The stream is the corpus, not the answer.** `./okuda --entries <query>`
returns **283 rows for any query** — the same 283 for `BRF-ADDRESS-CAP` and for
`zzzznotathing`. **280 of 283 (99%)** are bare path with no evidence. The
callsign is at rank 1, so the *reach* is solved; the *list* is the whole silo.
That cost belongs to the search-panel brief, not to this one — recorded here
because it is what the reader will hear after the name resolves.

## Scope

**In:**

- **One tier list.** The registry's five tiers and the resolver's four become
  one list, read by both.
- **A validated prefix.** Every registered callsign wears its tier's prefix,
  asserted by a lint; the two `DBR-` rows repaired.
- **The shorthand, visible to the picker.** `ADR-030` reaches its document
  through the entry stream, not only through the actuator.
- **Names for the unnamed.** A callsign for every tracked markdown document
  outside `.archive`, or an explicit exclusion recorded in this brief's
  out-of-scope table with the reason.
- **The spoken form.** The prefix→noun map defined, and the nouns auditioned —
  `brief`/`debrief` is the pair at risk.
- **The stability rule.** What a name does when its document is retitled,
  recorded as an ADR.
- **`docs/` registered** — the tier list grows to include it, per the registry
  principle.

**Out:**

- **The vector and its bound.** `BRF-ADDRESS-CAP` owns that work, and its
  document `docs/2026-09-15-the-cap-is-on-the-wrong-quantity.md` is the record.
  The two concerns are orthogonal; this brief does not enter that one.
- **The search panel's UI.** `docs/2026-09-15-the-search-panel-speech-first.md`
  owns the panel, the jump list, and the elision. This brief supplies names to
  it.
- **Speech code.** ADR-036: the cue is okuda's, the voice is the silo's. The
  spoken form is a cue.
- **Renaming existing documents.** The registry survives a rename; the brief
  does not perform one. Repairing `DBR-` edits a callsign, not a filename.
- **`.archive`.** Seventeen documents are the permanent record, excluded from
  Gloam search by construction (dot-prefixed; `walkMarkdown` and `fd` both skip
  it). They are out of scope and stay unnamed.
- **The stream's length.** D7 is recorded, not solved here.

## Preconditions

- [x] Both tier lists are readable and disagree. **Verified 2026-09-15** —
      `src/root.ts:24–29` (four tiers) against `scripts/reg-sync.ts:34–42`
      (five, including `advisories`).
- [x] The callsign census is measured. **Verified 2026-09-15** — 142 registered,
      137 reachable, 174 unnamed of 316 tracked, 55% spoken saving.
- [x] The reach of an exact callsign query is measured. **Verified 2026-09-15** —
      rank 1 of 283 in nine of ten cases; the tenth is the ordinal shorthand.
- [x] The prefix namespace is measured. **Verified 2026-09-15** — six prefixes,
      two one-letter pairs, `DBR` ×2.
- [x] **The cost of resolving a key is measured.** **Verified 2026-09-15** —
      `resolveByCallsign` is **O(N)**: 0.34 ms at 317 keys, **10.61 ms at
      20,224**, because it calls `loadCallsigns()` per invocation.
      `makeCallsignResolver` holds the Map and stays flat at 0.12 µs. The
      store's point lookup is the fast path this brief depends on, and it is
      not wired in. `docs/2026-09-15-the-scaling-profile.md`.
- [x] **The bootstrap is measured as a generator, and it is unsound.**
      **Verified 2026-09-15** — `bootstrapCallsign` keeps only the first ≤2
      tokens (`2026-09-15-brief-callsign-every-document` → `BRF-CALLSIGN-EVERY-DOC`);
      it strips only a *leading* ordinal, so `from-intent-to-task-01..06`
      collapses to **one key**; and `STOPWORDS` holds `no`, so
      `036-no-speech-code` → **`ADR-NO-SPEECH-CODE-036`**, asserting the opposite
      of its document. Step 5 derives 131 keys with this function.
- [x] Full-stem derivation is collision-free. **Verified 2026-09-15** — 131
      documents, 131 distinct `DOC-<FULL-STEM>` candidates, 0 collisions. **This
      is not what the code does**: `bootstrapCallsign` truncates to two tokens,
      so the measured figure belongs to a derivation that does not exist yet.
      The sound generator is step 5's work, not a precondition already met.
- [x] Resolution is exactly-one-or-null and survives a rename. **Verified
      2026-09-15** — `resolveByCallsign` returns `null` on collision
      (`src/root.ts:163–165`); `loadCallsigns` keys on the registry record.
- [x] The key space has a measured ceiling. **Verified 2026-09-15** — 519
      distinct slug tokens, 72% used once; two-token keys give ~269k slots, so
      the birthday floor for the first collision is **~730 documents**, earlier
      under the observed skew. And the *usable* space is smaller again: 82% of
      registered keys cost 7–10 spoken tokens, one costs 16+, and a key that
      costs 16+ tokens is a sentence rather than a handle.
- [x] **The trailing ordinal is reserved, and the bootstrap cannot see one.**
      **Verified 2026-09-15** — ADR-CHUNK-SEQUENCE-038 names the chunk sequence
      (`slug.md`, `slug-02.md`): the head is unnumbered and a part takes no key.
      `tmp/chunk-sequence-probe.ts` measures the ground it stands on: a trailing
      ordinal is dropped at **every** slug length — six files, two names — while
      a *leading* ordinal survives (`030-live-search-picker` →
      `ADR-LIVE-SEARCH-030`). So the ordinal survives in the position a document
      never chunks from and is lost in the position it always does, and
      `avoidingCollisions` then mints a name indistinguishable from a chunk's.
- [ ] The reader has chosen the tier nouns. **Not verified** — this is the
      audition's output, and `brief`/`debrief` is the pair that decides it.

## Work Plan

1. [ ] **The Map.** Hold the registry index in `resolveByCallsign` and
       `callsignForFile` — build it once, as `makeCallsignResolver` already
       does. O(N) → O(1) on the path a callsign is *resolved* by. Acceptance is
       a test asserting the lookup does not re-read the registries, and a
       measured curve flat against key count where it is currently linear.
2. [ ] **One tier list.** Choose the direction — the resolver reads the
       registry's list, or the registry reads the resolver's — and record the
       choice as an ADR. Add the test that asserts the two are equal, so the
       drift cannot return silently. Advisories becomes reachable as a
       consequence: 142 registered, 142 reachable.
3. [ ] **The prefix lint.** Assert `callsign.startsWith(csPrefix + "-")` for
       every registered row in `reg-sync`'s gate. Repair the two `DBR-` rows to
       `DBF-` and confirm `resolveByCallsign("DBR-SSH-BRINGUP")` returns `null`
       — the honest failure, per ADR-025.
4. [ ] **The shorthand reaches the picker.** Measure both candidate mechanisms
       before choosing: (a) the registry row carries the tier+ordinal as a
       searchable alias, or (b) the entry builder calls `resolveByCallsign`
       first and pins the hit at rank 1 with the registry row as its evidence.
       The acceptance is the same either way — `./okuda --entries "ADR-030"`
       carries `decisions/030-live-search-picker.md` at rank 1 with evidence.
5. [ ] **Make the bootstrap sound, then register `docs/`.** The bootstrap is the
       generator for every key this brief mints, and it truncates, collapses
       series, and can invert a negation. Fix all three: drop `no` and `not`
       from `STOPWORDS`, stop truncating at two tokens where the slug has more,
       and **see the chunk sequence before it truncates** — a trailing `-NN`
       names a part of the head's document and takes no key of its own
       (ADR-CHUNK-SEQUENCE-038). Delete `avoidingCollisions`'s suffix in the
       same change: the trailing ordinal is now reserved, so the assignment loop
       refuses on collision and reports it. Then derive the 131 `docs/` keys,
       review the derived rows by hand, and add the `DOC-` prefix to the tier
       list. The acceptance is a bootstrap that round-trips: for every existing
       registered key, the bootstrap of its filename either reproduces it or is
       refused, never silently differs.
6. [ ] **Name the rest.** `explainers/` (9) and the root documents (10) take
       prefixes; `advisories/`'s two unnamed take `ADV-`. The three existing
       `docs/` callsigns (`DOC-`, `REF-`) are reconciled against the `DOC-`
       prefix decision — `REF-` is a second prefix in one tier, the D2 defect
       again, and it is settled here rather than later.
7. [ ] **The spoken form.** Pin the prefix→noun map. Audition the nouns through
       Moira on the real corpus — the pair at risk is `brief`/`debrief`, and the
       question is whether the ear survives the ending. If it does not, the
       debrief tier takes a distinct noun and the map is amended. One variable
       per audition or the ear cannot attribute cause.
8. [ ] **The stability rule.** Decide what a retitle does to a name: freeze it
       (and accept that a name describes an old title), or re-mint it (and break
       every note citing it). Record as an ADR. Whichever is chosen, the rule is
       written where the author meets it — `playbooks/briefs-playbook.md` and
       `playbooks/registry-playbook.md` are the two doors. The key-space ceiling
       above is what makes this urgent rather than theoretical: the naming
       scheme needs a rule for when names run out. The `-2` suffix that stood in
       for one is retired by ADR-CHUNK-SEQUENCE-038, which reserves the trailing
       ordinal for a chunk and turns a collision into a refusal.
9. [ ] **Re-measure and correct.** Re-run the census against the committed set
       at every phase boundary. A silo-wide measurement excludes the document
       taking it, so the totals move by the measuring document's own weight —
       this brief's own figures are post-commit for that reason (Notes), and
       they move again with every brief that lands beside it.

## Acceptance Criteria

* The brief is Done when all of these hold, each by command.

- `just check` passes, and a test asserts the resolver's tier list equals the
  registry's tier list.
- **Resolving a callsign does not re-read the registries.** A test asserts
  `resolveByCallsign` builds the index once; a measured curve against key count
  is flat where it is currently linear (0.34 ms at 317 keys, 10.61 ms at
  20,224).
- **The bootstrap round-trips.** For every registered key, bootstrapping its
  filename either reproduces the key or is refused with a reason — never
  silently differs. Today it differs on truncation
  (`BRF-CALLSIGN-EVERY-DOC` against `BRF-CALLSIGN-EVERY-DOC`), collapses a series
  (`from-intent-to-task-01..06` → one key), and inverts a negation
  (`036-no-speech-code` → `ADR-NO-SPEECH-CODE-036`).
- **A chunk sequence resolves to one name.** Given `slug.md`, `slug-02.md`,
  `slug-03.md`, the registry holds **one** row — for the head — and
  bootstrapping any part yields the head's key. A sequence with a gap is
  reported as a broken document. The assignment path mints **no** trailing
  ordinal: a collision is refused and reported, per ADR-025 and
  ADR-CHUNK-SEQUENCE-038.
- Every registered callsign resolves: a script walks the registries through
  `resolveByCallsign` and reports **0 orphans** (today: 5).
- No registered callsign wears a prefix outside its tier: a script asserts
  `callsign.startsWith(csPrefix + "-")` and reports **0 violations** (today: 2).
- `./okuda --entries "ADR-030"` carries `decisions/030-live-search-picker.md` at
  rank 1 with non-empty evidence.
- Every tracked markdown document outside `.archive` resolves to a callsign, or
  is listed in this brief's exclusion table with a reason. The census reports
  **0 unnamed** against a declared exclusion set (today: 174).
- The spoken form is auditioned: each tier's noun heard through Moira on real
  corpus titles, judged by ear, and the map pinned in the document that owns it.
  A noun invented without an audition fails this criterion.
- `docs/` is a registered tier with a JSONL index, and
  `callsignForFile("docs/style-guide.md")` returns a callsign rather than `null`.
- The stability rule is an ADR, and the rule appears in the playbook an author
  reads before retitling a document.

## Notes

- **Amended 2026-09-15, the day it landed.** The scaling measurement
  (`docs/2026-09-15-the-scaling-profile.md`) found two things this brief's
  subject owns and the brief did not know: the point lookup it depends on is
  **O(N)**, and the generator it plans to mint 131 keys with is **unsound**. Both
  became preconditions; the Map became step 1, and the bootstrap became the first
  half of step 5. The brief grew a step and lost a false claim — the `docs/`
  derivation was measured collision-free on the *full stem*, which is not the
  derivation the code performs.
- **The census probe had a bug, and it was a tier-name bug.** The first run read
  `INDEX.jsonl` in every tier and reported 126 callsigns; playbooks uses
  `REGISTRY.jsonl`, so 15 rows were invisible. The corrected census reports 142.
  A tier's registry filename is not uniform — a census that assumes it is
  under-counts by a whole tier, silently. Fixed in
  `tmp/callsign-census-probe.py` and recorded here because the same assumption
  is easy to make again.
- **This brief is under its own rule.** Every count above is taken against the
  committed set, after this brief landed — 316 tracked documents, 142 of them
  named. Taken before the commit it is 315 and 141, because a silo-wide
  measurement excludes the document taking it. The figures here are the
  post-commit ones; the brief that measures the silo is part of the silo.
- **The brief's own first premise was wrong.** It began from *the callsign is
  not searchable today*. The reach probe overturned that: an exact callsign puts
  its document at rank 1, including for the tiers the resolver cannot reach.
  What is broken is narrower and different — the ordinal shorthand, and the
  list's length. Stated because a brief that carries a false premise carries it
  into the work.
- **Amended again 2026-09-15 — the trailing ordinal is now reserved.** The
  instruction: *the silo implies in several places that a document with too many
  links should be bisected, so provide a `slug.md`, `slug-02.md` sequence that
  allows documents to be chunked.* Recorded as ADR-CHUNK-SEQUENCE-038. It
  corrects this brief rather than extending it: step 5 as written said *keep the
  trailing ordinal as well as the leading one*, and the trailing ordinal is now
  the chunk marker — a part of the head's document, taking no key of its own.
  The step is rewritten, `avoidingCollisions` is reversed with it, and the
  collision the assignment path used to paper over becomes a refusal. The
  brief's step 8 asked for a rule for when names run out and noted that the
  scheme *"currently has a `-2` suffix instead"*; the suffix is retired and the
  step now points at the ADR.
- **The two `DBR-` rows are not a typo to fix quietly.** They are the evidence
  for the prefix lint, and the lint is the deliverable. Repairing them without
  the lint leaves the next one to be found by ear.
- **`REF-PALETTE-PAGE` and `REF-PALETTE-SWATCH` are a second prefix in the
  `docs/` tier** — `DOC-` and `REF-` both naming documents in one directory. That
  is D2 in a new tier, arriving before the tier is registered. Settle it in step
  6, not after.
- **The lookup and the generator are the two defects this brief owns, and both
  arrived late.** The scaling measurement found them after the brief landed: a
  point lookup that rebuilds its index per call, and a bootstrap that produces
  keys the silo would not accept. Neither is a naming *policy* question — both
  are the machinery under the names — and both are now steps. Worth recording
  that the first version of this brief would have shipped step 5 as written and
  minted 131 keys with a generator that truncates, collapses series, and can
  invert a negation.
- **`summary`-derived-once and the name-stability problem are one trap.** Both
  are derived fields that nothing re-derives; both go stale silently; both are
  found by a human reading the document, not by `just check`.
- **The vector and the callsign stay orthogonal in the code.** `MAX_REFS` lives
  in `src/vectors.ts`; `TIER_REGISTRIES` and `loadCallsigns` live in
  `src/root.ts`. No file imports both. That separation is the structural
  guarantee of the reader's claim, and it is worth keeping — a future change
  that puts a callsign into a vector slot is the change to refuse.
- **Nothing here merges to `main`.** This brief and the two documents it cites
  (`docs/2026-09-15-the-cap-is-on-the-wrong-quantity.md`,
  `docs/2026-09-15-the-search-panel-speech-first.md`) live on the
  `feat/address-cap` → `feat/callsigns` line. `main` is untouched.

## Related

- `briefs/2026-09-14-brief-address-cap.md` (BRF-ADDRESS-CAP) — the vector and
  its bound; the orthogonal concern, and the one this brief does not enter.
- `docs/2026-09-15-the-search-panel-speech-first.md` — the panel, the jump list,
  the elision; the consumer of these names.
- `docs/2026-09-15-the-scaling-profile.md` — the store's cost curve, and the two
  defects that amended this brief on the day it landed.
- `docs/2026-09-15-the-cap-is-on-the-wrong-quantity.md` — the vector's record.
- `decisions/025-mnemonic-namespace-model.md` (ADR-MNEMONIC-MODEL-025) —
  resolution, exactly-one-or-null, the mnemonic namespace.
- `decisions/030-live-search-picker.md` (ADR-LIVE-SEARCH-030) — the headless
  entry printer the picker runs on.
- `decisions/038-the-chunk-sequence.md` (ADR-CHUNK-SEQUENCE-038) — the trailing
  ordinal, the chunk sequence, and the reversal step 5 runs.
- `playbooks/registry-playbook.md` — the registry's schema and its traps.
- `playbooks/briefs-playbook.md` — the brief's shape, and one of the two doors
  the stability rule is written into.
- `AGENTS.md` rule 6 — the registry principle: a directory that accumulates
  documents gets a JSONL index. `docs/` is the directory that has not.
