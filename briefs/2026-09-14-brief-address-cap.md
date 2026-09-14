---
type: Brief
callsign: BRF-ADDRESS-CAP
date: 2026-09-14
---

# Brief: The address cap — the invariant is the destination

**Created:** 2026-09-14
**Status:** Open
**TD:** td-26b140 (epic) — td-7517cc the cap, td-a9822c the name,
td-ca8c1f the spec correction, td-66deec the drift, td-0545b2 the gates
**Lineage:** found while reading `src/vectors.ts` for a bounded-context review
(2026-09-14). The reader's words: *"the invariant is the destination, and we have
messed with an invariant."* The probes are `tmp/cap-probe.ts` (the defect) and
`tmp/corpus-cap-probe.ts` (its reach in this silo).
**Extends:** **BRF-WORKING-COPY** owns the vector system — discovery, the map, the
paint, the actuator, the depth-one stack, the `99` clone. This brief changes one
constant's *meaning* and corrects that brief's criterion, which specifies the
defect. It forks neither the paint nor the actuator.

## Objective

Cap the vector map by **destination**, not by **occurrence**, so that a document
citing one target many times never starves the destinations that follow it.

## Scope

**In:**

- `MAX_REFS` (`src/vectors.ts:46`) and its two consumers: the slice in
  `scanReferences` (`:111`) and the stop in `buildJumpMap` (`:126–133`).
- The name `MAX_REFS`, which agrees with the wrong quantity — the value is an
  address count, the name says occurrences.
- The doc comments that restate the rule in the abolished vector form
  (`src/vectors.ts:5`, `:10`; `src/tui.ts:675`).
- `BRF-WORKING-COPY`'s `## What` item 1 and its Acceptance criterion, which both
  specify "capped at 88" — the defect, written into the brief that built it.

**Out:**

- **Widening the address space.** 12–98 is the two-digit grammar; a three-digit
  space is a different decision and needs its own ADR. The cap stays 80.
- **The paint, the actuator, the depth-one stack, the `99` clone.** Unchanged.
- **The silence when the space is full.** Overflow is a separate decision — it
  adds bytes to the main render and is therefore a wire-budget question (ADR-028).
  Named in Notes, decided elsewhere.
- **The index notation `[NN]`.** The jump-list rows and keyboard tokens are a
  different vocabulary from the main document's vectors; this brief does not
  touch them.
- **The advisories omission in `TIER_REGISTRIES`.** Its own brief.

## Preconditions

- [x] `MAX_REFS` is derived from the address space, not chosen:
      `VECTOR_MAX - VECTOR_MIN + 1 - RESERVED_VECTORS.size` = `98 - 12 + 1 - 7`
      = **80**. **Verified 2026-09-14** (`src/vectors.ts:26–46`).
- [x] The cap is applied to **occurrences**: `hits.slice(0, MAX_REFS)` in
      `scanReferences`. **Verified 2026-09-14** (`src/vectors.ts:111`).
- [x] `buildJumpMap` already de-duplicates by target and already stops at
      `VECTOR_MAX`. **Verified 2026-09-14** (`src/vectors.ts:121–136`).
- [x] The defect reproduces: 80 occurrences of `ADR-031` followed by five distinct
      targets yields `map.size === 1` — `[[12,"ADR-031"]]` — and
      `ADR-030/029/028/027/026` receive no silcrow. **Verified 2026-09-14**
      (`tmp/cap-probe.ts`).
- [x] The defect is **latent, not live**: across 171 tracked documents carrying
      references, the busiest is 63 occurrences (`briefs/index.md`), no document
      reaches the cap, and no destination has lost a silcrow. Headroom is **17
      occurrences**. **Verified 2026-09-14** (`tmp/corpus-cap-probe.ts`).
- [x] The corpus already contains the shape that bites: **43 occurrences, 13
      destinations** in `briefs/2026-09-13-brief-audio-discovery.md`. **Verified
      2026-09-14** (same probe).
- [x] `BRF-WORKING-COPY` is Open and specifies the defect. **Verified 2026-09-14**
      (`briefs/2026-09-04-brief-working-copy.md:23`, `:110–111`).
- [ ] `just check` and `just test` green before starting.

## Work Plan

1. [ ] **Separate the two quantities.** `scanReferences` returns every
       reference-shaped occurrence. The occurrence bound becomes its own constant,
       chosen as a performance guard, and is not the address count.
2. [ ] **Name the quantity.** `MAX_REFS` becomes the address count under a name
       that says so; the occurrence guard takes its own name. One constant, one
       meaning.
3. [ ] **Correct `BRF-WORKING-COPY`.** `## What` item 1 and the Acceptance
       criterion state the destination rule: a document with N distinct
       destinations carries N vectors, however often each is cited.
4. [ ] **Correct the drift.** `src/vectors.ts:5`, `src/vectors.ts:10` and
       `src/tui.ts:675` render `§NN` — two digits, section sign.
5. [ ] **Pin it.** `tests/vectors.test.ts` gains the starved-target case and the
       many-occurrences case.
6. [ ] `just check` green; `just test` green.

## Acceptance

- A source citing one target 80 times and then five distinct targets yields a map
  of **six** entries; all six destinations carry a silcrow.
- A source with N distinct destinations (N ≤ 80) yields exactly N map entries,
  independent of how many times each destination is cited.
- A source with 81 distinct destinations yields 80 entries, and the first 80 are
  unchanged — the address space is the cap.
- `scanReferences` carries no slice keyed on the address count. (Inspection.)
- `rg -n '\[[0-9]{2}\]' src/vectors.ts src/tui.ts` returns exactly one hit: the
  `[07]`-is-text example at `src/vectors.ts:16`. (Command.)
- `BRF-WORKING-COPY`'s `## What` item 1 and Acceptance criterion state the
  destination rule. (Inspection.)
- `just check` green; `just test` green.

## Notes

- **The invariant was specified wrong, not coded wrong.** `BRF-WORKING-COPY` says
  "capped at 88" and "a document with >88 references renders the first 88 as
  vectors and the rest as text". The code implements exactly that. The defect
  entered at the brief, which is why step 3 corrects a live brief rather than a
  comment.
- **88 and 80 disagree, and the code is right.** `MAX_REFS` computes to 80; the
  brief that specified it says 88 (`11–98` was 88 before ADR-032 reserved the
  doubled pairs). The number is right; the quantity is wrong.
- **Why the bug hid — measured.** 80 addresses and an 80-occurrence slice agree
  whenever no destination repeats, and the busiest documents are the *generated*
  indexes (`briefs/index.md` 63/63, `&briefs.md` 58/58), which cite each
  destination exactly once. Repetition lives in the hand-written briefs, and none
  of them is long enough yet.
- **The degradation under repetition, from the corpus's own worst ratio.** At
  43 occurrences to 13 destinations, the slice would fill the map after roughly
  **24 addresses** — a 70% loss of the address space, silent. The 17-occurrence
  headroom is measured against the *busiest* document, not against that ratio.
- **The full-space case stays silent, and that is an open decision.** Past 80
  distinct destinations the 81st renders as text with no marker. Painting an
  overflow notice adds bytes to the main render and belongs to ADR-028's
  conversation.
- **Measured, not argued.** Every number above came from running the code path.

## Related

- **BRF-WORKING-COPY** — owns the vector system; its criterion is corrected here
- ADR-031 — the main document and the vector map
- ADR-032 — the reserved doubled pairs, which moved the space from 88 to 80
- ADR-028 — the wire budget; the overflow notice is its conversation
- `playbooks/registry-playbook.md` — the index this brief lands in
