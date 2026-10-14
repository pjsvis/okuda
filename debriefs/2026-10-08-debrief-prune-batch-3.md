---
type: Debrief
callsign: DBF-PRUNE-BATCH-3
date: 2026-10-08
briefs: [BRF-DOCUMENT-LIFECYCLE]
---

# Debrief: Prune batch 3 — containment, and a grep that cannot read

**Date:** 2026-10-08
**Status:** Done
**Briefs:** `BRF-DOCUMENT-LIFECYCLE` (Phase 4)
**ADR:** `ADR-DOCUMENT-LIFECYCLE-057`
**Commit:** `196e76c`

## What happened

Two deletions, both proved by **containment** rather than resemblance:

| deleted | survives in | evidence |
|---|---|---|
| `…from-intent-to-task-02.md` | `…-task-03.md` | 145 words ⊆ 443 — a bare comparison table inside 03's narrative |
| `…operational-heuristic-repo-sovereignty.md` | `…-sovereignty-v2.md` | 233 ⊆ 318, and stronger: v1 is a **byte-for-byte prefix** of v2, which appends only section 6, *The Still Zone* |

The second resolved a hold. It was queued as *read for the reversal* — if `v2`
reversed `v1`, `v1` would be keep-class. Containment answers it, because **a
reversal cannot contain what it reverses.** That is now the strongest form of the
question's answer: not "does v2 refine it" but "is v1 inside v2".

## The doctrine this batch produced

The proposal named five candidates by hand; the tests eliminated three —
`stuf.md` and `history-is-bunk.md` are **cited** (by the porch-matrix brief and
`ADR-031`), and `nae-links-either.md` is **cited** too. All three were out.

But the *reason* recorded for the third was wrong, and the reviewing hand caught
it. `nae-links-either.md` greps for `abandoned` — and that is a rhetorical use
(*"the author has abandoned communication in favor of dumping a dictionary on
your head"*), not a disposition. It is the same class as batch 1's `wrap-at-cap`
matching `/refus/`, which we both waved through. The citation alone retires it.

> **A keyword grep flags CANDIDATES for keep-class. It cannot settle one.**
> Keep-class is *read for the reversal*, not matched for the resemblance — and
> that needs the surrounding sentence, not the token.

Had the record said "nae-links was keep-class", the next prune would have learned
that grep is the test. It is not. The rule now sits in the registry playbook's
keep-class section, beside the duplicate-is-not-superseded rule from batch 2.

## The pattern across three batches

Each batch was corrected in the *reading*, never in the artifact:

1. **Batch 1** — `wrap-at-cap` matched `/refus/`; the reviewer read it and saw the table model's principle.
2. **Batch 2** — the disposition borrowed `superseded`, a keep-class word; refused, because the record would have taught the precedent.
3. **Batch 3** — the keep-class claim for `nae-links-either` rested on a token; corrected to the citation, and the doctrine written down.

Three for three, a second model caught something the first had already
rationalised. The artifacts were never at risk; the *vocabulary* was.

## What is next

- `from-intent-to-task-01/03/06` are **unique fragments** (max 43% overlap,
  nothing contained). Not duplicates. They need the **extract check**: is the
  lesson they carry already in a Thing? That is a read, not a script — the first
  batch where no mechanical test decides.
- The census still cannot seed a prune; the working instrument is containment for
  duplicates plus the citation graph for the survivor.
- The 232 prose walls remain.

## Related

- `ADR-DOCUMENT-LIFECYCLE-057` — the policy
- `playbooks/registry-playbook.md` — the lifecycle checklist, and both word rules
- `DBF-PRUNE-BATCH-1`, `DBF-PRUNE-BATCH-2` — the move, and the first deletion
