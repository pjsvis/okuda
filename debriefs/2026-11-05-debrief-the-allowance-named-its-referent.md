---
type: Debrief
callsign: DBF-ALLOWANCE-REFERENT
date: 2026-11-05
tags: [scripts, lint, baseline, ratchet, decisions]
agent: pi (ses_d7eb59)
environment: local
briefs: [BRF-COUNT-BASELINE-TOKENS]
---

# Debrief: The allowance named its referent, and the reliever counted lines

**Date:** 2026-11-05
**Status:** Done — 1035 tests, `just check` rc=0.
`ADR-ALLOWANCE-NAMES-REFERENT-084` accepted and enforced by both lints, and by
the test that asserts the swap.

## What was asked

Close the hole `BRF-CALLSIGN-CHECKSUM`'s review deliberately left open: a file
that drops one baselined citation and gains a different one in the same edit
passes both citation gates at count parity. The count was the only witness, and
the count had not moved.

## What the work actually was

The shape, not the verdict. Both gates now judge `{file: {token: count}}`:
a token the baseline never saw fails at any count, a token over its own count
fails, a token under or gone is the prune, and the total is *subsumed* — a
rising total must have raised some token, and the verdict names which. That last
move is why the gate loses nothing: every count verdict survives, and the report
gains the referent.

Two findings came out of the migration that the brief did not expect.

**The callsign gate was a pure re-expression.** 13 files and 17 citations
before, 13 files and 17 tokens after, per file equal. Its own forward reference
demonstrated the documented self-heal on the way through: this brief's callsign
was an unresolvable token until `reg-sync` registered it, then the gate said
`gone — prune with --write-baseline`, and the prune restored the total. The
shrink verdict works, and it works on the thing it was written for.

**The td-ID gate was counting lines, not citations.** `main()` used
`lines[i].match(TD_ID)`, which takes the first match on a line and stops, while
the exported `countIds()` — the function the tests always asserted — counts them
all. So a line citing two IDs counted as one, and 31 citations were invisible to
the gate. The unit change the brief asked for exposed it for free: across the 64
files that remain, 150 citation-bearing lines carry 181 citations. This is the
**comment's referent** one layer out — a test asserting one function while the
gate ran a different one with the same name's promise.

**32 stale entries, printed on every check, never pruned.** 30 named briefs
since archived out of the scan set, 2 were clean files. The old gate said so in
a `baseline can shrink` line and passed anyway; `just check` is not read for
advice. A ratchet decays into an allowance by inattention exactly as quietly as
by verdict, which is why the new report names the token that is gone rather than
a number that differs — the prune now has a target.

## What was hard

The writer could not read the shape it was replacing, so `--write-baseline` had
to stop judging at all rather than guess a token set from a total: the legacy
baseline is refused loudly in read mode, and in write mode the baseline is not
consulted. That left the migration's proof outside the tool, in a table computed
from the corpus — which is the honest place for it, since the tool's claim about
a shape it cannot read is not evidence.

`verdict()` came back after `date-lint` failed to import it: a *quantity*
baseline (how many dates are wrong) legitimately keeps the count, because the
counted things are interchangeable. The ADR records that boundary, and a test
asserts both halves — the count verdict reads `ok` over a swap by design, and
`judge()` reads `violation` over the same swap. A defect that is only *said* is
half a defect; the boundary is the other half.

## What remains

The other four `{file: count}` baselines are deliberately unchanged:
`date-lint`, `lexicon-lint`, `elision-monotone`, `debrief-link-lint` count
quantities, not namespaces. `ADR-ALLOWANCE-NAMES-REFERENT-084` states the test
for the next author — *are the counted things interchangeable?* — so the choice
is made once rather than re-litigated per lint.
