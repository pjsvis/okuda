---
type: Brief
callsign: BRF-DOCUMENT-LIFECYCLE
---

# Brief: The document lifecycle — ephemeral, record, addressed, retired

**Date:** 2026-10-08
**Status:** Open

## Context

The silo is monotonic: documents accumulate, and nothing retires. `docs/` holds around two hundred files with no registry, and a growing tail of deliberation whose verdicts already landed.

The registers and their predicates were settled in discussion on 2026-10-08 —
audit is not address, dates are broad and codes narrow, and git is a backup rather
than a memory. This brief turns that into policy, gives the silo its **exit**, and
enforces it.

## Evidence — measured 2026-10-08

| reading | value |
|---|---|
| documents in `docs/` | ~200, with no registry |
| prefixed names uncorroborated (no declared date, no registry row) | 100 |

## Objective

Define the document lifecycle — what exists in the silo, what each register owes,
when a document is promoted to an address, when it is retired, and what may never
be deleted — and enforce it with the existing lint family.

## The lifecycle (the decision this brief records as an ADR)

| register | lives in | owes | cost |
|---|---|---|---|
| **ephemeral** | `tmp/` (gitignored) | nothing — un-audited by design | none |
| **record** | `docs/`, `MEMORY/WORK/` | committed, dated; auditable by path and date | the date prefix |
| **addressed** | briefs, decisions, debriefs, playbooks, advisories | a callsign: citable, movable, resolvable | curated, earned |
| **retired** | the archive scope (`.archive/…`) | still resolves by callsign; out of the work queue | a move |

**Predicates.**

- The **date prefix** applies to every dated document (mechanical, cheap) —
  `BRF-DATE-INVARIANT` already enforces the agreement half.
- A **callsign** is earned when something will cite the document by name, or the
  document *is* a tier's unit by construction. A document nothing will cite needs
  its date, not its name.
- **Retirement** is for an *addressed* document that has also settled: cited, and
  done. Filing is not archiving.
- **Zero-effort metadata, curated codes.** A script may date a document; only a
  decision may name it.

**The keep-class — never deleted.** Rejections and reversals: what was tried and
refused, what was decided and undone. Because the expensive failure of a knowledge
silo is re-deciding.

**The operation is a move, not a deletion.** Extract-then-delete: a discussion
whose verdict landed is retired only once the Thing it fed carries the decisive
warrant, not merely the alternative's name.

## Scope

**In:** the lifecycle policy (as an ADR); the register obligations and predicates;
promotion and retirement; the keep-class; the `docs/` census and reference graph;
the enforcement (a citation census and an archive-scope consistency check); the
prune, in batches.

**Out:** agent chat sessions and any other substrate outside the silo — the
harness's concern, not the documents' (`docs/2026-10-08-the-filename-is-a-record.md`
draws the same boundary for compositing); the code lifecycle (code is disposable,
rationale is not — already true); renaming or reorganising content (its own pass);
the tier mechanics (`BRF-REGISTRY-DISCOVERY`).

## Preconditions

- [ ] `ADR-ARCHIVE-RESOLUTION` read — the archive is a scope, not a tier, and the
      lifecycle must keep that split.
- [ ] The enforcement family exists and is used: `scripts/date-lint.ts`,
      `scripts/callsign-lint.ts`, `scripts/reg-sync.ts`. Reuse, do not invent.
- [ ] `docs/` is enumerated (the census). You cannot prune what you cannot list.

## Work Plan

**Phase 1 — the policy.**

1. [x] Record the lifecycle as an ADR (registers, obligations, predicates,
       keep-class). The operational how goes in `playbooks/registry-playbook.md`
       (it owns date semantics, status, ordering, and no-parallel-stores already),
       with a pointer from `playbooks/playbooks-playbook.md`. —
       `ADR-DOCUMENT-LIFECYCLE-057`; the playbook carries *The lifecycle — the
       exit*; the pointer sits under the tier table.

**Phase 2 — the census and the classification.**

2. [ ] Enumerate every `docs/` document; derive the **reference graph** (which
       documents are cited by addressed documents; which are cited by nothing).
       Derive, do not judge.
3. [ ] Classify each: derivative/duplicative · rationale-bearing · superseded ·
       imported stuff · scratch. The classification is the prune's work queue.

**Phase 3 — enforcement.**

4. [ ] A **citation census**: a minted callsign with no citation and no tier
       relation is reported as a demotion candidate. Map↔territory (codes against
       citations), ratchet-style: at-count passes.
5. [ ] **Archive-scope consistency**: the folder, the registry `archive` flag, and
       the status must agree. One authority — the status is the claim, the move is
       the action, the flag is derived — and a disagreement is a lint.

**Phase 4 — the prune.**

6. [ ] Retire the derivative set in batches, smallest and most obviously
       derivative first; extract into the Thing first, then move or delete. A
       debrief per batch.
7. [ ] Confirm the keep-class is intact: no rejection, reversal, or post-mortem
       lost.

## Acceptance Criteria

- The lifecycle is written in one place (ADR + playbook), with the four registers,
  the predicates, and the keep-class.
- Every `docs/` document is enumerated and classified; each retirement names its
  disposition (extracted into X → moved to the archive / deleted).
- No document in an addressed tier is deleted; rejection-bearing documents survive
  by a named rule that a later reader can find.
- A lint reports minted-but-uncited callsigns; archive-scope disagreement fails
  `just check`.
- The prune lands in batches, each with a debrief; `just check` green after each.
- `bun test` passes; no new dependency.

## Notes

- **This is the sink.** The silo already has the intent→implementation spine —
  brief (intent), build, debrief (reality), decision (rationale). What it lacked
  was the exit. A pipeline with no sink is additive by construction, and additive
  is how a corpus becomes a ventilator.
- **Git is a backup, not a memory.** The bar for deletion is not *can I recover
  it* but *would a reader ever recover it*. `git show` is cheap when you know the
  symbol; excavation is not recovery for someone who arrives without the thread.
- **Documents fail silently.** Code deletion has an oracle (the tests). Document
  deletion has the citation graph, and nothing else screams — which is why the
  census precedes the prune and the keep-class is absolute.
- **Multi-user clause.** A name is minted once, by the first to land it; the
  shared history is "our context", not the individual clone. Derived artifacts
  are gated by regeneration (`BRF-REGISTRY-DISCOVERY`), never hand-merged.
- **Rough size.** The derivative set is expected to be the largest single
  category; the scratch set should mostly move to the ephemeral register rather
  than be deleted.

## Related

- `BRF-REGISTRY-DISCOVERY` — the tier mechanics this lifecycle sits on
- `ADR-ARCHIVE-RESOLUTION` — the archive as a resolution scope
- `docs/2026-10-08-time-is-a-claim.md` — the date rule; git is not a memory
- `docs/2026-10-08-the-filename-is-a-record.md` — the register framing and the provenance boundary
- `playbooks/registry-playbook.md` — where the operational how lands
- `playbooks/playbooks-playbook.md` — owns the tiers; points at the lifecycle
