---
type: Debrief
callsign: DBF-THE-QUEUE
date: 2026-10-27
tags: [briefs, ledger, instruments, glyphs, anchor, doctrine]
agent: pi (ses_d22a9f)
environment: local
briefs: [BRF-PROSE-MEASURE, BRF-IRONY-MARK, BRF-ARTPACK-AESTHETICS, BRF-DENSE-DYNAMIC]
---

# Debrief: The queue — forty-two briefs became eight, and the instrument was a command

**Date:** 2026-10-27
**Status:** Done — 41 commits, 883 tests, `just decide` converged at 8 live briefs.
Six snags filed for a follow-up session; none of them blocks.

## What was asked, and what it turned into

It began as an audit of system invariants — *how wide can we go, how high, and can it
hold at zero lag* — and the answer to the first question was a mistake we then spent the
day reversing. What it became was an audit of **the ledger**: the record of what this
silo intends versus what it has done.

The operator's sentence did the work:

> *"it is tempting to keep modifying the design of the &briefs file, but the real problem
> is there are too many briefs."*

That is the whole day. We had been editing the visible artefact for hours; the invisible
rate had no instrument.

## The numbers

| | before | after |
|---|---|---|
| live briefs | 82 | **8** |
| archived | 75 | 149 |
| rows in `&briefs.md` | 120 | 8 + the derived queue |
| tests | 862 | **883** |
| decision coverage (resolved through the archive) | 47% (mis-scoped) | **83%** |
| brief latency | n 75, median 0d, p90 30d | n 182, median 1d, p90 30d, max 49d |
| parked briefs | 9 | 0 — let go of rather than deferred again |

Seventy-six refusals, each carrying its reason on its own `**Status:**` line, all
replunderable. The archive stopped being a graveyard and became a shelf.

## Five findings worth keeping

**1. The file was never the problem; the inflow was.** Nine of the first batch of refusals
were things the operator listed from memory that the registry had *already* refused. Twenty
rows of `&briefs.md` disagreed with the registry in total. Layout was the visible artefact;
9.3 briefs per week against 5.7 debriefs per week was the cause, and nothing printed it.

**2. A derived artefact must be excluded from the set it is derived from** — found four
times in one day, each wearing different clothes: the withheld-frame receipt that replaced
the document; the census that counted its own comments; the queue that counted its own
rows (120 tabled became 38); the table cell truncated to one character so five different
marks read as five identical ones. Every one looked like a rendering bug and every one was
a scope bug.

**3. The anchor's guarantee is positional, not textual.** The reader's row holds because
`reanchoredScroll` falls back to `proportionalScroll` when the anchor text misses — and it
misses in **88%** of width changes, because a reflow re-cuts the lines. Displacement:
median 1 row, max 2, against 13 for a heading pin. The corollary ruling: *landing may snap;
reflow may not.*

**4. The retired glyph was a maths operator.** `⋮` is category `Sm`; the state family is a
checkbox register; a nickname ("vertical silcrow") misnamed it for months. The parked state
is now `⸮` — U+2E2E, the irony mark — in aubergine, chosen because it is off the traffic
lamp by design and because the old orange measured **2.9** from "done" in the plane that
survives red-green deficiency. Both floors are now tests.

**5. Documents are the last copy to be corrected, because nothing checks them.** Eight
documents taught the retired vocabulary for hours after the renderer stopped honouring it —
the showcase, two monsters, two vocabulary pages, the key lines. `tests/doc-vocabulary.test.ts`
now derives its expectations from the renderer's own map, so they cannot drift silently.

## What cost the most, and was worth it

The prose measure: designed, briefed, shipped, dogfooded, reversed, recorded and superseded
**in place**, inside one day. The cost was a session and nine tests. The return was four
instruments (`prose-glass`, `anchor-displacement`, `seams`, `brief-queue`), the scope rule
*a renderer-side page width is compositing*, and ADR-071. A wrong idea that leaves a
detector is worth more than a right one that leaves an opinion.

## What I got wrong

- **I quoted 47%/36% coverage twice.** The instrument resolved citations against the *live*
  registry only, so archiving a settled brief read as lost coverage. The real number is
  83%/84%. I presented a mis-scoped metric as a finding, twice, before the sweep made it
  undeniable.
- **I wrote two ledger claims that were not true.** `ADR-070` said the measure's dial was
  *"parked (td, under BRF-PROSE-MEASURE)"* — no such ticket existed. And an archived
  refusal said *"the gathering continues live under `BRF-SILO-LEXICON`"* — which I then
  refused an hour later.
- **I built the exhibit that could not exhibit.** A code fence labelled *"the on-screen-now
  exhibit"* in a document about colour, where nothing inside a fence is painted. The
  operator went looking for the new mark, found it white, and was right to call it a bug.
- **I called a typo house vocabulary.** *Foxtrot oscura* was a slip; I praised its
  etymology. That is Compulsive Narrative Syndrome with a bow on it.
- **I committed with a `td-` id in the message**, which the callsign lint refuses — caught
  only because the range was still unpushed.

## Left open, with owners

Six snags, all instruments rather than features — filed on the board 2026-10-27, and named
here rather than numbered, because a task id is the ephemeral queue and this file is a
record (the one-way valve):

1. a staleness gate for `cadence`, which the queue has and the tempo reading does not;
2. the `**TD:**` field out of 49 files, with the lint that stops it returning;
3. a guard forbidding registry paths as test fixtures — the rule that bit three times;
4. the debrief-linkage baseline paid down, *read, do not infer*;
5. the `⋮` reservation either used by a fold brief or released;
6. every `N of M` claim in the corpus audited — two were stale today by accident.

And the observation that sets up the next session: **the td board is not 50 issues.** That
figure came from `td list`'s default row cap — 50 of 139 — which is the fourth appearance of
the day's own lesson in the instrument that reports it (*a reading is only as honest as the
part of the source it agrees to look at*). The real board was **139 issues, 136 open, 20
epics**, and nothing reconciled it: the same disease, one ledger over.

Reconciled the same evening, by the same method — derived, then applied, then read back —
and then twice, because the operator's rule was sharper than my first pass:

**Pass one, by derivation (60 closed).** 14 epics whose brief was refused on 2026-10-27,
plus their 46 stories, each closure carrying the reason and the refused callsign. Twelve
orphans that cite only a refused brief were *held back*: a refused-brief mention in a
description does not make the task about that brief — the explainers register cites the
measure's brief and is live work.

**Pass two, by the operator's rule — keep what has a live referent (59 more closed).** *The
td database is ephemeral*; the record is the repository. So: a live brief, a parent epic with
a kept story, or a finding carried from the day. One correction to the rule was needed in
practice — **an epic must be kept when any of its stories is**, or closing the root orphans
live work: the perimeter epic names its briefs by *path*, not callsign, so the referent rule
alone would have closed it out from under three live stories.

**139 → 19 issues. 20 epics → 2.** Seventeen open, two in review: the P1, the perimeter
epic and its three stories, principal-and-clerk, search-row, six snags, four carried
findings, and the two reviews. A board a person can hold, which is the only size at which
it gets read — the same argument as the brief queue, one ledger over, settled by the same
method and in the same evening.

## The line

An instrument you do not run is a tax; an instrument that runs on every commit and exits
non-zero is a colleague. The corpus got one of the second kind today — and the brief queue
shrank by 83% while it looked the other way.
