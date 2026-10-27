---
type: Brief
callsign: BRF-DOCS-LEDGER
---

# Brief: The docs/ ledger — a prune ledger, not a registry

**Date:** 2026-10-09
**Status:** Rejected — 2026-10-27, the operator's call: too old, and the corpus has moved on. Archived rather than deleted — replunder if the need returns. The idea is not judged, only its queue position.
**TD:** (to create when claimed)
**Context:** Phase 4's prune ran with its precondition unmet. `BRF-DOCUMENT-LIFECYCLE`
carries it as a checkbox — *"`docs/` is enumerated (the census). You cannot
prune what you cannot list."* — and the artefact offered as the census
(`docs/2026-10-08-docs-census.md`, `aec6c02`) does not enumerate: its
Classification table is a bucket estimate of five approximations summing to
**175 against 196 documents**, its only complete list (the 85 cited) is
delegated on line 39 to **`/tmp/citations.txt`** — the ephemeral register — and
its 111 uncited documents are four prose bullets. So the phase's acceptance
criterion *"every `docs/` document is enumerated and classified"* was never
satisfiable, and five batches pruned by reading from a summary. That is why they
cost five sessions for nine documents, and why the task could not be closed by
either of the two hands that held it.

**What the artefact is not.** `BRF-REGISTRY-DISCOVERY:47` defers *"the `docs/`
registry itself (a separate piece)"*, and `playbooks/registry-playbook.md:260`
is explicit: `docs/` is **not a registered tier**, a new document there needs no
JSONL entry. `ADR-DOCUMENT-LIFECYCLE-057:158` goes further: the record register
is *"explicitly allowed to be untidy — kept, dated, uncoded."* An index over
`docs/` with callsigns would repeal all three.

## The decision — ledger, not registry

| | registry | ledger |
|---|---|---|
| **grants** | identity (a callsign, an address) | nothing — it reports |
| **authority** | binding; membership is structural | advisory; a class is a hypothesis |
| **membership** | a tier by construction | any document, by path, no code |
| **derived data** | mirrored on write, drifts silently | recomputed on read, cannot drift |
| **the register** | is the tier | leaves the register untouched |

The census is a **ledger**: a *view* of the record register plus a durable
*judgement* column, and nothing else.

**This needs no ADR amendment.** The untidy-record clause is not in tension with
a ledger, and the distinction is the reason: no callsigns are minted, no path
changes, no order is imposed, and a class is never cited as identity. What would
violate it — a JSONL that makes `docs/` a tier — is the registry this brief
refuses. Recording that refusal *here* is what keeps the next reader from
"completing" the ledger into one.

## The rules

1. **Judgement only, in the file.** The durable artefact stores what cannot be
   recomputed: `class`, `disposition`, and a one-line `note`, keyed by path.
   Dates, cited-by counts and citing sources are **derived at read** and never
   committed. Staleness becomes impossible by construction rather than by
   discipline — the phase-2 defect closed structurally. (Precedent: the work plan
   already says *"Derive, do not judge."*)
2. **No identity.** No callsigns minted, no renames, no moves, no reordering.
   The ledger reports on the register; the register stays uncoded.
3. **A class is a hypothesis.** Revisable by reading, never binding, never cited
   as identity. The **disposition** is the operative field: `retired` /
   `archived` / `kept-as-record` / `keep-class` / `uncited-unassessed`.
4. **A missing row is a finding, not a default.** An unlisted document reports as
   `uncited-unassessed` and *shows up in the view*. No silent default — the
   failure this house keeps finding in its own instruments.
5. **The view is disposable, the judgement is not.** The derived table may be
   printed to `tmp/` — the ephemeral register is the correct home for a
   derivable view, which is precisely what the old census got backwards.

## Shape (proposed)

- `scripts/docs-ledger.ts` — enumerate `docs/*.md`, count citations across the
  addressed tiers, join the judgement, print the table; `--check` for the gate
  and `--json` for machines. Mirrors `reg-sync`'s read/derive shape.
- The judgement file wherever it is decided the register is best left alone —
  **proposed `MEMORY/WORK/docs-ledger.jsonl`** (`ADR-DOCUMENT-LIFECYCLE-057:41`
  names it a record location; it is tracked, durable and *outside* `docs/`, which
  enacts rule 2). `docs/LEDGER.jsonl` is the alternative if discoverability wins
  at implementation; decide once, record why.
- One `just ledger` recipe; one line added to
  `playbooks/registry-playbook.md` §*Enumerate* pointing at it, since that
  section already tells the pruner they cannot prune what they cannot list.

## Work plan

1. [ ] The script: enumeration + reference graph (derived), joined to the
       judgement file; `--check`, `--json`.
2. [ ] **Backfill the judgement** for the nine documents the prune already
       dispositioned (five retirements, four archived briefs) from the batch
       debriefs — the ledger's first rows, and a test that the record and the
       ledger agree.
3. [ ] The first full view: every `docs/` document listed, with the unassessed
       residue visible as `uncited-unassessed` rather than as a category.
4. [ ] Wire `--check` into `just check` with a stated behaviour: a *missing*
       row is a finding, not a failure — the ledger reports, it does not gate
       deletions.
5. [ ] Close Phase 4's precondition: `BRF-DOCUMENT-LIFECYCLE`'s checkbox and
       criterion 2(a) both become true by this artefact, or are explicitly
       amended to say why not.

## Acceptance criteria

- Every document in `docs/` appears in the view — the enumeration is complete by
  construction (a new file appears without an edit).
- No derived value is committed anywhere; a hand-edited date or citation count
  cannot exist to drift.
- No callsign is minted, no path renamed, no `docs/` JSONL index created.
- The five retirements and four archived briefs reconcile against the ledger's
  disposition column, and a test pins that agreement.
- Unassessed documents are *counted and visible*, not summarised.
- `just check` green; `bun test` passes; no new dependency.

## Out of scope

- **The classification pass itself.** This brief builds the ledger and backfills
  the nine known rows; deciding the class of the remaining ~180 documents is the
  prune's work, at the rate a reading can afford. The ledger's job is to make
  that queue visible and durable, not to empty it.
- **The `docs/` registry** (deferred by `BRF-REGISTRY-DISCOVERY`) and any
  callsign minting for record-register documents.
- **The `-05`/`-06` registration question.** They are two documents with two
  dispositions, not a sequence; that call belongs to the registration work, and
  this ledger only makes it answerable.
- **Renaming or reorganising `docs/`.** A ledger reports; it does not tidy.

## Related

- `BRF-DOCUMENT-LIFECYCLE` — the precondition ("you cannot prune what you cannot
  list") and the criterion this brief makes satisfiable
- `BRF-REGISTRY-DISCOVERY:47` — the deferred `docs/` registry this brief declines
  to build
- `ADR-DOCUMENT-LIFECYCLE-057` — the registers, the predicates, and the
  untidy-record clause the ledger must not breach
- `playbooks/registry-playbook.md` — *"`docs/` is not a registered tier"*, and the
  enumerate-first rule the recipe joins
- `docs/2026-10-08-docs-census.md` — the artefact this replaces, kept as the
  record of how a summary came to stand in for an enumeration
- `DBF-PRUNE-BATCH-1` … `DBF-PRUNE-BATCH-5` — the nine dispositions to backfill
