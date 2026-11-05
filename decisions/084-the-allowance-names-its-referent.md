---
type: ADR
callsign: ADR-ALLOWANCE-NAMES-REFERENT-084
date: 2026-11-05
---

# Decision: The allowance names its referent — baselines are per token, not per count

**Date:** 2026-11-05
**Status:** Accepted
**Enforced by:** `scripts/td-id-lint.ts` and `scripts/callsign-lint.ts` (in `just check`), `tests/td-id-lint.test.ts` and `tests/callsign-lint.test.ts` (the swap case)

## Context

Both citation gates grandfather sediment with a shrink-only baseline, the house
ratchet idiom (`ADR-RECORD-LINKAGE-065`). The baseline said `{file: count}`: a
file might cite this many grandfathered references, and the verdict compared one
number against another.

A number cannot say *which* citation it permits. So a file could **drop** a
grandfathered citation and **gain** a different one in the same edit, and read
`ok` — the count was the only witness, and the count had not moved. The hole was
demonstrated live in the checksum's own review (`DBF-REVIEW-CADENCE:70`) and
filed as deliberate scope; this decision is that scope, taken.

The same shape sits in four other baselines (`date-lint`, `lexicon-lint`,
`elision-monotone`, `debrief-link-lint`). They keep it: their baselined quantity
is a *property of the document* (how many dates are wrong, how many cuts), not a
namespace of identifiers where a swap is a false green. The distinction is what
this decision records — a count baseline is admissible exactly where the counted
things are interchangeable, and a citation is never interchangeable.

## Decision

**A baseline over identifiers is `{file: {token: count}}`, and the gate judges
three deltas: a token the baseline never saw (violation at any count), a token
over its own count (violation), a token under or gone (shrink).**

- **The total is subsumed, never computed.** If the total rises, by pigeonhole
  some token rose, and the token verdict says which. The gate keeps every verdict
  the count gave it and gains the ability to name the referent, which is the whole
  of the change.
- **Tokens normalise per gate.** td IDs lowercase (the pattern is
  case-insensitive, so a case flip is the same citation); callsign families are
  uppercase by construction.
- **One core, two gates.** `judge()`/`tally()` live in `scripts/td-id-lint.ts`
  with the scan set the checksum already imports, so the two cannot drift.
- **A legacy numeric baseline is refused, loudly.** A total cannot be
  decomposed into tokens, and a gate that invents a token set from a total is a
  gate that has stopped meaning anything. The migration is `--write-baseline`,
  reviewed as a diff.
- **The writer judges nothing.** `--write-baseline` records what the corpus
  holds and reports no verdicts, so it neither reads the shape it replaces nor
  pronounces on a baseline it did not read. The migration's proof is equal
  per-file totals in the unit being replaced, recorded in the commit — for
  `BRF-COUNT-BASELINE-TOKENS` that proved the callsign gate a pure re-expression
  and caught the td-ID gate counting *lines*, not citations, by 31.

## Alternatives Considered

| Alternative | Why Rejected |
|---|---|
| Keep the count and hash the token set per file | A hash fails the moment anything changes, including a legitimate prune — it would say *no* without saying *why*, which is the failure mode the gate exists to avoid |
| Record the whole token set without multiplicity | A duplicated citation is then invisible: two references to the same brief read as one. Counts inside the token keep the ratchet exact |
| Baseline the resolved *path* instead of the token | The token is what the document says; the path is what the resolver returns today, and a resolution that changes with a rename would rewrite the baseline as a side effect |
| Store `{token: first_line}`, the way `date-lint` pins a line | A line moves for reasons that are not the citation's fault, and the churn would teach authors to re-baseline — the allowance becoming a habit |

## Consequences

**What became easier:** a swap is now a failing gate that names the intruder; the
td-ID gate counts citations rather than lines, matching the `countIds()` the
tests always asserted; stale entries report the token that is gone, so the prune
has a target instead of a number.

**What became harder:** a baseline is a larger diff, and an author adding a
legitimate new citation to a grandfathered file must *read* which token moved
rather than reach for `--write-baseline` on reflex — which is the point, and the
cost of the referent.

**Constraints this imposes:** a new baseline over a *namespace* (callsigns, IDs,
paths-as-identifiers) takes the token shape. A new baseline over a *quantity*
keeps the count, and says in its header which it is and why the counted things
are interchangeable.

## Related

- Brief: `BRF-COUNT-BASELINE-TOKENS`
- ADR: `ADR-RECORD-LINKAGE-065` (the ratchet idiom this refines)
- Prior art: `BRF-CALLSIGN-CHECKSUM` (filed the hole), `DBF-REVIEW-CADENCE`
