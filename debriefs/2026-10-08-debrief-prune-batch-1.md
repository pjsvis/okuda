---
type: Debrief
callsign: DBF-PRUNE-BATCH-1
date: 2026-10-08
---

# Debrief: Prune batch 1 — four settled briefs into the archive scope

**Date:** 2026-10-08
**Status:** Done
**Briefs:** `BRF-DOCUMENT-LIFECYCLE` (Phase 4)
**ADR:** `ADR-DOCUMENT-LIFECYCLE-057` — the policy this batch is the first move under
**Commit:** `d02f4b1`

## What happened

The first Phase 4 batch, and the smallest possible one: the move queue
`archive-lint` already names. Four briefs whose status had settled — `done` — were
moved from `briefs/` into the archive scope:

- `BRF-MATH-GLYPHS`, `BRF-HEADING-ANSI-STRIP`, `BRF-DATE-INVARIANT`, `BRF-WRAP-AT-CAP`

A **move**, not a deletion: `git mv`, so history follows and the batch is fully
reversible. It is the policy's own action — *the status is the claim, the move is
the action, the flag is derived* — so no judgement was required, which is exactly
why it is batch one.

## The evidence

| reading | value |
|---|---|
| rename similarity | 100% — zero content change, four files |
| content sha1 vs the pre-batch tree | byte-identical for all four |
| index rows | moved, not edited: four out of `briefs/`, four into `.archive/briefs/` |
| callsigns resolving after the move | 4/4 (the resolver reads the archive scope) |
| `archive-lint` move queue after | empty |
| `just check` | green, nine gates |

## The review

A different model verified it independently, four checks in order — keep-class,
settled, resolution, diff shape. The verdict was approve, and the review earned
its keep on the first check: `brief-wrap-at-cap` matches `/refus/` on a naive
grep, and the reviewer read enough of the document to see that it is the *table
model's* principle — *we never hide table content* — not a refusal of the work.
The keep-class is a class of documents, not a keyword.

That is the two-hander's value in one line: the check that a single session would
have waved through was the one that needed a reader.

## What it proves

The policy's move queue works end to end: a settled status is read, the move
preserves resolution, and the indexes are regenerated rather than hand-edited.
Nothing in the batch depended on either session's context — the branch, the
review request and the verdict all travelled through files and `td`.

## What is next

Batch 2 — the census's **derivative** set — is the first batch that *deletes*, so
it needs the keep-class pass repeated on its own list, and it wants an
independent read before it lands. Then the remaining two axes: the census's
rationale-bearing and superseded sets, and the 232 prose walls.

## Related

- `ADR-DOCUMENT-LIFECYCLE-057` — the policy
- `docs/2026-10-08-docs-census.md` — the work queue batch 2 draws from
- `scripts/archive-lint.ts`, `scripts/citation-census.ts` — the policy's two teeth
