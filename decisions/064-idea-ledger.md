---
type: ADR
callsign: ADR-IDEA-LEDGER-064
date: 2026-10-14
---

# Decision: The idea ledger — a pre-brief register with a trigger gate

**Date:** 2026-10-14
**Status:** Accepted
**Enforced by:** `scripts/idea-lint.ts --gate` (the trigger field and the shape), `tests/idea-lint.test.ts`; the falsifier is *reported*, not gated

## Context

The briefs backlog is 71 live documents — 59 `open`, 3 `ready`, 8 `parked` —
against a lifecycle whose four positions have one occupant
(`ADR-BRIEF-LIFECYCLE-061`:58). That is not indiscipline; it is a missing tier.
The tier table (`playbooks/playbooks-playbook.md:21-27`) admits one document for
work: a **brief**, which is a *promise* — intent, preconditions, acceptance
criteria, a review checklist (`playbooks/briefs-playbook.md:10`, `:84`). Writing
one is a commitment and it costs an hour. An idea has nowhere cheaper to be
written, so every idea is written as a promise, and the open list counts
documents instead of decisions: a crude regex over the live callsigns finds ~5
clusters (speech ≈ 19, perimeter/silo ≈ 18, render/tables ≈ 15, ssh/porch ≈ 9,
palette ≈ 9) behind 59 separate briefs.

The mechanism is the one `ADR-SESSION-HANDOFFS-017` already proved: `briefs/` had
become the default landing zone *because the category had no row in the tier
table*, and the drift stopped when the row existed. A named container changes
behaviour; a resolution does not. The worked instance is `BRF-DOCS-LEDGER` — a
proposal for a ledger, written as a promise, `Status: Open` since 2026-10-09
with one commit ever.

## Decision

**An idea ledger: one file, `docs/ideas.md`, one entry per idea, in the record
register and outside every addressed tier — and promotion is its only exit.**

1. **It is not a tier.** No callsign, no JSONL, no status vocabulary, no rename.
   A slug in a list item is invisible to the callsign machinery
   (`scripts/callsign-lint.ts`, `CALLSIGN_TOKEN`), so a ledger entry cannot mint
   a code — the flood `ADR-DOCUMENT-LIFECYCLE-057` forbids. It lives in `docs/`
   because that is the record register, and it is uncoded because a callsign is
   *earned* when something cites the document (predicate 2).
2. **One entry per idea: a slug, a cluster, a date, the idea, and a trigger.**
   An entry is a list item — the head on one line, the idea and the trigger under
   it — because a table's last column is the one the house renderer elides
   (`BRF-TABLE-WIDTH`, `bun#45175`) and this file is a log, so an entry is
   appended and never reorganised. The trigger is the observation that would
   make it worth doing — the
   *test-bearing* rule (`conceptual-lexicon.md`) applied to ideas. This is the
   gate, and it is the distinction the brief format cannot make: a brief demands
   acceptance criteria and never demands a trigger, which is where slogans hide.
3. **Promotion is the only exit.** An idea leaves the ledger when it is promoted
   into a brief or an epic; the line then records the promotion. That decision —
   *is this worth a promise?* — is currently never made explicitly, because the
   ledger does not exist to make it at.
4. **The cluster is the visible unit.** Ideas carry a cluster word; a cluster
   with a name and an owner is an epic. That is what lets the brief count fall by
   construction: a brief is written for a promoted slice, never for an idea.
5. **It records its own outflow.** The ledger is the instrument of its own
   falsifier: the lint prints promoted / total. **If the line count grows and the
   promotion count does not, the ledger is a graveyard and is deleted.** The
   house rule is that a heuristic names its own failure; this one carries the
   date its author reads the number.

## Alternatives Considered

| Alternative | Why Rejected |
|---|---|
| A tier — `ideas/`, callsigns, a JSONL registry | Mints codes for documents nothing cites, which is precisely the flood `ADR-DOCUMENT-LIFECYCLE-057`'s census forbids; and it makes an idea a *unit of record*, which is a weightier commitment than a brief |
| One td epic per idea | The board is the *decided* queue; an idea is undecided. It also inverts the funnel — the pre-decision layer would be the busiest surface in the silo, and the board would stop being readable as "what is next" |
| `status: idea` on a brief in `briefs/` | Refused already, and for the same reason: `ADR-SESSION-HANDOFFS-017` — one index holding two kinds of document makes the work queue cease to be a queue |
| A playbook rule and more discipline | The experiment: the drift happened because the category had no row (`ADR-SESSION-HANDOFFS-017`). Discipline without a named container is the barnacle that was not scraped |
| `IDEAS.md` at the root, beside `NOW.md` | Not in `scannedFiles()` (`scripts/td-id-lint.ts:29-44`), so the trigger gate could not run without widening the scan set; and the root is not the record register |

## Consequences

**What became easier:**
- An idea costs one line, so it is written *before* it is worth a brief — which is
  the whole point: the intake gate exists before the promise.
- The trigger field makes a slogan visible on the page. An entry that cannot name
  its trigger has said so about itself.
- The promotion ratio is a number, monthly, and it falsifies the container rather
  than the author.

**What became harder:**
- One more artefact to maintain, and one more lint in `just check`.
- The ledger will be *empty-ish* and must be resisted as a dumping ground: the
  rule is a trigger per line, and a wall of trigger-less lines is itself the
  finding.

**Constraints this imposes:**
- **The ledger is not a second td.** `playbooks/registry-playbook.md:139` — no
  parallel stores: if an entry says *we will*, it belongs to a brief or a task
  and must not be in the ledger.
- A demotion out of a brief is a *rejection* (`ADR-ARCHIVE-BREADTH-063`):
  `parked` does not settle, so demoting an existing brief means rejecting it,
  archiving it, and carrying its callsign in the ledger line for the citation.
- **The 59-brief compression is not this decision.** It is the ledger's first
  real work, cluster by cluster, in a later sitting.

## Related

- `BRF-IDEA-LEDGER` — the brief this decision is made under
- `playbooks/playbooks-playbook.md` — the tier table and the route, which gain the row
- `playbooks/briefs-playbook.md` — the brief-writing rule gains the intake gate
- `docs/ideas.md` — the ledger itself
- `decisions/017-session-handoffs-are-not-briefs.md` — the named-container precedent
- `decisions/057-document-lifecycle.md` — the registers and the earned callsign
- `decisions/061-brief-lifecycle-vocabulary.md` — the four positions the intake gate feeds
- `debriefs/2026-10-14-debrief-the-compression.md` — the measurement that named the defect
