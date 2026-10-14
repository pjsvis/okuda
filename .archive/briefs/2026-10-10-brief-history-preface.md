---
type: Brief
callsign: BRF-HISTORY-PREFACE
---

# Brief: The header is Date and Status — the history preface and the TD field, out

**Date:** 2026-10-10
**Status:** done — landed (no document carries a history preface; date-lint and td-id-lint hold the header); swept 2026-10-14.

## Context

A document's header should answer two **present-state** questions — *when is this
from?* and *what state is it in?* — and nothing else. Today the header block
(between the H1 and the first H2) collects two other things: a **history
preface** (`Supersedes …`, `amended …`, `Built …; amended …`), a recital of a
past the reader does not have, and a **`TD` field**, a pointer into an ephemeral
local database. Both are references that cannot travel. This brief removes them
and standardises the header so the failure is detectable.

## Objective

Standardise the document header to **Date and Status only**; remove the history
prefaces and the `TD` fields; add a lint that reports any tier document whose
header block carries anything else.

## Evidence

- **History prefaces**: 22 documents carry one (measured 2026-10-10), and they sit
  **wedged between the H1 and the first H2** — read as an introduction.
- **`TD` fields**: 32 briefs carry `**TD:**`; 34 cite a `td-xxxxxx` ID — the
  One-Way Valve's baseline.
- The header standard is today **emergent**: `briefs-playbook.md`'s Format block
  lists only Date and Status; the `TD` field grew in practice, unwritten in the
  template.

## The standard

The header is the title, then two bold field lines, then the body — and
nothing else between them:

```markdown
# <Title>

Date: YYYY-MM-DD
Status: <word>

<body — first ##, or prose>
```

**Nothing else in the header block.** Date and Status survive because they are
**present-state facts**: *this is current as of X; this is where it stands* — the
two reassurances a reader needs to know they are where they think they are. A
history preface is the **past-state** form of the same field shape, and it is
unverifiable from the file and already kept by git.

## Scope

**In:** the header block of every tier document (briefs, decisions, debriefs,
playbooks, docs); the 22 history prefaces; the 32 `TD` fields; a **header lint**.

**Out:** YAML frontmatter (invisible, tool-facing); Date and Status themselves; a
*reversal that cites a decision by reference* — kept, because it is a reference,
not a chain.

## Preconditions

- [ ] The **references, not recitals** entry is in `system.md`
      (BRF-PROTOCOL-UPDATE), so the sweep cites a written criterion.

## Work Plan

1. [ ] Cut the history prefaces; keep any **live constraint** a history sentence
      carries, and reference the rest.
2. [ ] Drop the `TD` fields; the linkage runs **td → callsign** (the issue names
      the brief), never brief → td.
3. [ ] Standardise the surviving headers to Date + Status.
4. [ ] The **lint**: report any tier document whose header block is not exactly
      Date and Status. Ship as a **report first**, then a gate.

## Acceptance Criteria

- No header block carries a history preface or a `TD` field.
- Every tier document's header is Date + Status only.
- The lint reports every header that fails, and zero on the corrected corpus.
- The census is reported before and after (22 prefaces, 32 TD fields → 0).

## Notes

**The lint's region is the reason this works**: it checks the block between the
**H1 and the first H2** (or the first body content) — where the preface hides,
*almost like an introduction*. A `grep` for `Supersedes` misses the
`Built …; amended …` form; the block test catches every shape.

The One-Way Valve (`playbooks/td-playbook.md`) already forbids citing a td ID in
a persisted document; this brief removes the field that invites it.

## Related

- `system.md` — the entry this sweeps for
- BRF-PROTOCOL-UPDATE — the rule and the deploy that carries it
- `playbooks/briefs-playbook.md` — the Format block the standard makes explicit
- `&briefs.md` — the largest single history preface
