---
type: ADR
callsign: ADR-INTAKE-QUARANTINE-094
date: 2026-11-24
---

# Decision: New arrives in quarantine — `docs/new/`, and the gates that decline to read it

**Date:** 2026-11-24
**Status:** Accepted
**Enforced by:** `scripts/td-id-lint.ts` — `QUARANTINE` and `inQuarantine()`, applied
at five scan sites (`scannedFiles`, `tables-check`, `elision-monotone`,
`retired-terms-lint`, `html-batch`). Verified 2026-11-24 with a control in both
directions: a document carrying an unclosed emphasis span and a shattering table
fails `prose-check` in `docs/` and passes in `docs/new/`, while the table and
elision censuses count it in one place and not the other (522/523 tables,
681/682 documents).

## Context

A pasted "agent authoring guidelines" arrived untracked and needed a trial before it
could be admitted: no tier's question answered, four claims about the renderer
contradicted by `src/` (`playbooks/registry-playbook.md`, *Admission — the
entrance*). The trial worked, but the document had no landing zone. It could not sit
in `tmp/` — that register is gitignored, and an imported original is **evidence**,
so it must be committed as it arrived for the diff to mean anything. It could not sit
in `docs/` under a record's date prefix, because that prefix is a claim of record
status (`ADR-DOCUMENT-LIFECYCLE-057`) and the document was not one.

Nothing in the silo held *arrived, committed, and not yet trialled*. The intake
queue lived in whoever remembered it, and enumeration is step one of every checklist
here.

## Decision

An imported original lands **unmodified** in `docs/new/`, landed-dated and carrying
its `Source:`; admission moves it out with `git mv`, a refusal deletes it, and every
document gate declines to read the folder on purpose.

## Alternatives Considered

| Alternative | Why Rejected |
|-------------|--------------|
| No folder — trial the untracked file, then delete (the pattern this session began with) | The queue is unenumerable and the original is never committed, so the diff that shows what the author could not know never exists as evidence |
| Stage it in `tmp/` | Gitignored: the ephemeral register cannot carry an artefact whose whole job is to be a committed original |
| A declared branch (`ref-census` declarations) | Holds work awaiting a review, not a document awaiting a trial — and the artefact arrives in the working tree, not on a branch; moving it there is ceremony that buys nothing the diff does not |
| A fifth register in `ADR-DOCUMENT-LIFECYCLE-057` | It owes nothing new: an import already owes its landed date and its `Source:`. `new/` adds a verdict pending, not an obligation — so the register table is untouched and this is the record register at its first step |
| My own recommendation against it, one turn earlier | Two things overturned it: enumeration is the intake's missing instrument, and the cost fell from "nine gates" to one predicate once the enumeration styles were read. The estimate was wrong in both directions and the measurement is above |

## Consequences

**What became easier:**

- The intake queue is a directory listing. A pending trial is visible without
  anyone's memory.
- The original is committed as received, so the trial's diff separates *what they
  claimed* from *what we corrected* — an audit surface a stranger can check.
- The exclusion is declared once. The gates enumerate three different ways — a flat
  walk, `git ls-files`, and a recursive walk — and the folder would otherwise have
  been half-gated: invisible to `prose-check` by accident, published to HTML by
  recursion.

**What became harder:**

- One more place to look, and one more rule to remember at admission: the file must
  *leave* `docs/new/`.
- A staged document is ungated, so its faults are found by reading. That is the
  point, and it is also a responsibility the gates no longer carry.

**Constraints this imposes:**

- The exit is a `git mv`, never a copy: a move cannot leave two copies, which is what
  keeps the quarantine from becoming a parallel store.
- The falsifier: a file in `docs/new/` that has been through two sessions untrialled
  means the folder has failed as a queue — triage it that sitting, or drop the folder.
  A quarantine nobody processes is a skip with better branding.

## Related

- ADR: `ADR-DOCUMENT-LIFECYCLE-057` (the registers; *the operation is a move, not a
  deletion*)
- Playbook: `PLY-REGISTRY` (*Admission — the entrance*) · `PLY-AUTHORING` (the
  date-first rule, landed-dated imports)
- Defect found while landing this: `td-110cf6` — `RE_INLINE_HTML` strips
  tag-shaped prose, so a placeholder in angle brackets is unrepresentable in the
  render, and 47 documents carry one.
