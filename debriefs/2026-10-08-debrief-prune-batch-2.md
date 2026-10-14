---
type: Debrief
callsign: DBF-PRUNE-BATCH-2
date: 2026-10-08
briefs: [BRF-DOCUMENT-LIFECYCLE]
---

# Debrief: Prune batch 2 — the first deletion, and a word that must not be borrowed

**Date:** 2026-10-08
**Status:** Done
**Briefs:** `BRF-DOCUMENT-LIFECYCLE` (Phase 4)
**ADR:** `ADR-DOCUMENT-LIFECYCLE-057`
**Commit:** `b445b1d`

## What happened

The first batch that deletes, and the smallest possible: one file.

```
deleted: docs/2026-08-29-from-intent-to-task-04.md
disposition: DUPLICATE — the content survives verbatim in
             docs/2026-08-29-from-intent-to-task-05.md
```

It was the strongest case in the corpus, and the reviewer made it stronger than
the proposer had: **containment, not resemblance.** Every word of `-04` is a word
of `-05` (`|∩| = |−04|`), and with code fences stripped the prose is
byte-identical. The only difference is the diagram — an ASCII box in `-04`, a
mermaid flowchart in `-05`, which adds a second one. `-05` is a strict superset.
Nothing unique was lost, and nothing in the repo cites `-04`.

## The correction that matters

The batch was proposed with the disposition "duplicate/superseded". The reviewing
hand rejected that wording, and it was right: **`Superseded` is a keep-class word**
(`playbooks/registry-playbook.md`: *Reverted, Rejected, Abandoned, Superseded, a
park with a gate*). Filing a deletion under a keep-class word sets the precedent
that later licenses deleting a genuine refusal — the re-deciding the policy exists
to prevent.

> **Duplicate** means the content lives elsewhere. **Superseded** means a decision
> was undone. They are not synonyms, and a deletion disposition may never borrow
> the second.

The rule is now in the registry playbook's lifecycle section, where the next prune
reads the checklist.

## What the two-hander produced

Three things a single hand would have shipped wrong:

1. **A stronger proof than proposed** — containment instead of a similarity score.
2. **A word that had to be refused** — the keep-class vocabulary is closed, and
   "superseded" was being spent on a duplicate.
3. **The precedent guard** — the correction was about the *record*, not the file:
   the file was safe to delete either way, but the disposition would have taught
   the wrong lesson to the next batch.

## What is next

- The sibling fragments (`-stuf`, `-history-is-bunk`, the remaining
  `from-intent-to-task` set) as their own batch, same three tests.
- The `repo-sovereignty` v1 hold — read for the **reversal**, not the resemblance:
  if `v2` reverses `v1`, `v1` is keep-class and must not be queued.
- The census still cannot seed a prune (category estimates, and a keep-class over
  the wrong tier); the working instrument is similarity for the derivatives plus
  the citation graph for the survivor.

## Related

- `ADR-DOCUMENT-LIFECYCLE-057` — the policy
- `docs/2026-10-08-docs-census.md` — the census, and its limitation
- `DBF-PRUNE-BATCH-1` — the move
- `playbooks/registry-playbook.md` — the lifecycle checklist, and the word rule
