---
type: Brief
callsign: BRF-HISTORY-PREFACE
---

# Brief: References, not recitals — the history preface out of the visible body

**Date:** 2026-10-10
**Status:** Open
**TD:** (to create)

## Context

The rule lands in `system.md` under BRF-PROTOCOL-UPDATE: a document states its
current state and **references** what it needs; it does not recite a history.
Twenty-two documents carry a visible history preface today — so this is a corpus
job, not a one-file edit.

## Objective

Remove the visible history prefaces from the corpus, keeping each document's
state and replacing any *needed* history with a reference.

## Evidence

Measured 2026-10-10 (`grep -rl 'Supersedes|amended 2026'`): **22 files** — among
them `system.md` (the v2.6.0→v1.0.0 chain), `&briefs.md` (*"Built 2026-08-30;
amended 2026-09-04; amended 2026-09-30; amended 2026-10-04 …"*),
`docs/style-guide.md`, ten-plus decisions, and several briefs.

The class, split by the rule's test (*does the document stand if the reader knows
nothing before it?*):

| occurrence | verdict |
|---|---|
| `Supersedes v2.5.0 …, v2.4.0 …` — a chain of cuts | **recital** — cut |
| `amended 2026-09-04 (…); amended 2026-09-30 (…)` | **recital** — cut, or compress to the clause that still governs |
| `supersedes ADR-031` — a single pointer | **reference** — keep |

## Scope

**In:** the visible body of the 22 documents (and any sibling the same test
catches) — the mechanical strip and the per-file judgment.

**Out:** YAML frontmatter (`lineage:`, `date:` — tool-facing, elided, not
visible); a decision record that cites a superseded decision **by reference**.

## Preconditions

- [ ] The **references, not recitals** entry is in `system.md`
      (BRF-PROTOCOL-UPDATE), so the sweep cites a written criterion.

## Work Plan

1. [ ] Re-run the census; list each file with each occurrence tagged
      recital/reference.
2. [ ] Clear the recitals: leave the state, reference the rest. A *"supersedes
      X"* sentence survives as a reference; a chain does not.
3. [ ] Where a history sentence carries a **live constraint**, keep the
      constraint and cut only the timeline. Never lose a live rule to the sweep.
4. [ ] Re-run the census; the remainder is references only, each justified.

## Acceptance Criteria

- No document's visible body opens with a version, supersession, or amendment
  chain.
- Every remaining `supersedes` / `amended` occurrence is a single reference, or
  is justified in its commit message.
- The census is re-run and reported — the number before and after.

## Notes

The mechanical rule and the judgment rule are different, and the sweep must not
confuse them: a `grep` finds the candidates; **only the test clears them.** A
live constraint written as a history sentence (*"we reverted X because of Y"*)
is a recital with a live half — keep the half, reference the rest.

## Related

- `system.md` — the entry this sweeps for
- BRF-PROTOCOL-UPDATE — the rule and the deploy that carries it
- `&briefs.md` — the largest single recital
