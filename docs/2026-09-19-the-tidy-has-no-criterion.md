---
date: 2026-09-19
kind: design note — a census that finds the tidy has no criterion, and prices the move
lineage: the reader's instruction, 2026-09-19 — *"a tidy-first run would be a good idea … we have a lot of briefs and debriefs that are completed or abandoned … lets get them moved to the .archive"*; playbooks/briefs-playbook.md §Archiving; playbooks/silo-playbook.md §Scaling. **Amended 2026-09-19** — fork B proposed inventing a status vocabulary; ADR-019 had adopted OKF v0.2, whose `status` is enumerated, a month earlier. See docs/2026-09-19-the-standard-we-already-adopted.md.
status: open — nothing has moved. The criterion, the layout and the citation form are all unresolved, and each blocks the other two.
---

# The tidy has no criterion — three records disagree, and the move has a price

> ◆ Ask the silo which of its 73 briefs are settled and it gives three answers:
> the index says 7, the files say 35 distinct things, and `td` says 5. Meanwhile
> 29 live citations already point at the 17 briefs that were archived.

> **Amended 2026-09-19.** Two things changed after this was written, both in
> `docs/2026-09-19-the-standard-we-already-adopted.md`. **Fork B was an unpaid
> claim** — it offered to invent `open / ready / parked / settled / abandoned`
> without checking whether a standard already existed. It did: `ADR-019` adopted
> OKF v0.2 on 2026-08-28, and OKF §5.4 enumerates `draft | stable | deprecated`,
> which answers the tidy's question directly. **Criterion A is weaker than
> priced** — a `td` id is a row in a gitignored local database, so a move decided
> on it is unverifiable for anyone who clones the tree. Both corrections are
> marked below; the original text is left standing.

## What we are deciding

Whether to move completed and abandoned briefs and debriefs into `.archive/`. The
goal is right and the playbooks already sanction it — *"the archive is the
permanent record; the live list is the work queue"*
(`playbooks/briefs-playbook.md:110`). What does not exist is a way to tell which
documents those are.

## Three sources, three answers

| Source | Coverage | Verdict |
|---|---|---|
| `briefs/INDEX.jsonl` `status` | 73 of 73 | **7** not open |
| the file's `**Status:**` line | 73 of 73 | **35 distinct strings** |
| the `td` issue the brief names | **31 of 73** | **5 settled** |

**The index is frozen at creation.** `deriveStatus`
(`scripts/reg-sync.ts:202`) runs only for *missing* entries, so an existing row
keeps its stored status indefinitely
(`playbooks/registry-playbook.md` §Traps). A status change never propagates. That
is why **35 of 73 file/index pairs disagree — 48%** — and why the index's *"66
open"* is a count of rows, not of work. The seven rows it does not call open read
4 `done`, 2 `parked`, 1 `rejected`.

**The file's status is prose, not an enum.** The 73 briefs carry 35 distinct
`**Status:**` strings: `Ready (small; contracts, not code)`,
`Parked — gated on a real cross-terminal brightness itch`,
`Rule fully specified; v1 LANDED 2026-09-05 as the`, `Open[cite: 1]`, and one
file with no status line at all. Six begin `draft`/`Draft`, seven `Ready`, five
`Parked`, four `Done`, and forty `Open`. There is no vocabulary to query.

**`td` is the only structured source and it covers less than half the tier.** 42
briefs name no `td` issue at all — and the silo's own rule is *"work not in td
isn't tracked"* (`AGENTS.md:9`). Of the 31 that do, **five** have every named
issue closed.

## The price of a move

The silo cites briefs by **path** — `briefs/<name>.md` — and the archive moves the
file. So every archived brief breaks its inbound citations, and **`just check`
cannot see it**: the registry validates rows against files, not prose against
paths.

Measured today, the 17 briefs already in `.archive/briefs/`:

- **11 of 17 are still cited** by live documents.
- **29 references** point at `briefs/…` for a file that lives at
  `.archive/briefs/…`.

The example that prompted this note: `decisions/004`, `005`, `006` and `007` each
cite `briefs/2026-08-22-brief-ansi-emission-and-closed-grammar.md`, which moved to
`.archive/` at some point and was never re-cited. The move was correct and the
citations rotted silently.

**The five briefs `td` calls settled carry 10 more.**

## Two playbooks, two layouts

And the target is not agreed:

- `playbooks/briefs-playbook.md:105` — flat: *"Completed briefs move to
  `.archive/briefs/` — same filename"*, INDEX entry removed, debrief unmentioned.
- `playbooks/silo-playbook.md:122-124` — nested: *"`mkdir .archive/<brief-name>` …
  Move the brief (and its debrief, once written) into it."*

**Practice follows the first.** `.archive/briefs/` holds 17 files and there is no
`.archive/debriefs/`; briefs and their debriefs sit in different places — e.g.
`2026-08-22-brief-implementation-renderer.md` is archived while
`debriefs/2026-08-24-debrief-renderer-implementation.md` is live.

## The debrief half of the premise does not hold

**All 19 debriefs are `done`, and `done` is the only legal status a debrief may
carry** (`playbooks/registry-playbook.md` §Status values). So `status` cannot be
the archival criterion for debriefs — applied literally it empties the tier. The
archive has never held a debrief, and no rule in either playbook says where one
would go.

## The finding

**The tidy is the right second step, and the silo is asking for a first one.** What
blocks it is not effort but a missing vocabulary: the tier has no queryable answer
to *is this settled?* Two of the three records that could answer it are unreliable
by construction, and the third covers 31 of 73 documents.

**And the move is destructive in a way that leaves no trace.** Archiving is a
rename; the citations that break are in other tiers' prose; the gate does not
check them. 29 are already broken and nobody noticed. A bulk tidy would multiply a
defect that is currently invisible.

## The fork

### As written

**A — Tidy on `td`'s verdict.** Five briefs, all named issues closed. Small,
structured, defensible today. Cost: 10 citations to repair, and it leaves 68
briefs in place, so the *"clean set"* the reader asked for does not arrive.

**B — Normalise the status vocabulary first.** Give `briefs/` a small closed set
(one proposal: `open` / `ready` / `parked` / `settled` / `abandoned`), rewrite the
73 `**Status:**` lines into it, fix `deriveStatus` so the index follows the file,
and *then* archive by query. Cost: a 73-file sweep and a change to the sync
script — real work, and it is what makes every future tidy cheap.

**C — Archive on the index's verdict.** Eight briefs. Cost: the index is 48% wrong
against the files, so this archives documents the files call open and leaves
documents the files call Done. The cheapest and the least defensible.

### The correction, later the same day

**A moves from "cheapest defensible" to "not a criterion."** A `td` id is a row in
`.todos/`, which `.gitignore` excludes as *"td task database (runtime state)"* —
measured, 288 such citations across 79 documents. The five briefs are still the
right five; the *reason* cannot be the criterion, because a criterion has to be
legible to whoever clones the tree. Available as an interim move, not as the rule.

**B keeps its shape and loses its invention.** I offered five values without
checking whether a standard already existed. It did: `ADR-019` adopted OKF v0.2 on
2026-08-28, and §5.4 enumerates three — `draft` (not yet current, stays in
`briefs/`), `stable` (shipped, archive), `deprecated` (*"kept for links and
history; no longer current"*, archive). The silo's richer state rides an extension
key, which §4.1 makes legal. One vocabulary, publicly specified, instead of one
private to this repository — and the same 73-file sweep.

**C is unaffected.**

## What is not in question

- **The goal.** 66 rows in a work queue is not a queue. `briefs-playbook.md:109`
  is right that keeping shipped work in `briefs/` *"makes the open list a
  graveyard."*
- **That the archive is the permanent record.** Nothing is deleted; git keeps it.
- **That the existing archive is correct.** The 17 moved briefs were settled. The
  layout practice is consistent. What failed is the citation form, not the move.
- **That a citation to a moved document should still resolve.** The silo already
  says so: *"`ADR-FOO-031` is the silo's record, durable and rename-proof"* — the
  callsign is the designed answer, and these 29 citations use paths instead.

## Where I would land

**B, with A as the interim move if the reader wants files moved today.** The
durable fix is not the tidy; it is making the archive cheap. Two changes do that,
and neither is a tidy:

1. **Cite by callsign, not by path.** The resolver already exists
   (`ADR-024` callsigns are data). A sweep from `briefs/<name>.md` to the callsign
   repairs the 29 existing rots and makes every future archive free.
2. **Make the status a vocabulary.** Until *is this settled?* has one answer, every
   tidy is a judgement call repeated 73 times. **Amended:** the vocabulary is not
   mine to choose — OKF §5.4 enumerates it, and the silo adopted OKF a month before
   this note was written.

Do those two and the tidy becomes a query. Skip them and the tidy is a guess that
breaks 10–29 citations and calls it clean.

**What would change my mind:** a fourth source of truth I have not found — a
closed `td` epic per brief that I missed because the brief does not name it. 42
briefs naming no `td` issue is the largest gap in this census, and it is a gap in
the *links*, not necessarily in the work. **Amended:** a fourth source would have
to be legible outside this machine to count as a source of truth, which `td`
structurally is not.

## Evidence

- `tmp/tidy-census-probe.py` — the census: file statuses, file-vs-index
  disagreement, `td` coverage and settlement, and inbound citations per candidate.
- `tmp/okf-conformance-census.py` — added with the amendment: the OKF §11
  conformance gap per tier, and the 288-citation `td` count.
- `git grep -l -- '<brief>.md' -- '*.md'` over each of the 17 archived briefs —
  11 cited, 29 references, none of them resolving.
- `playbooks/briefs-playbook.md:103-110`; `playbooks/silo-playbook.md:117-130` —
  the two layouts.

## Related

- `docs/2026-09-19-the-standard-we-already-adopted.md` — the amendment: the
  standard for fork B, and why criterion A is not a criterion
- `playbooks/briefs-playbook.md` — §Archiving, the flat layout, practice
- `playbooks/silo-playbook.md` — §Scaling, the nested layout, unexecuted
- `playbooks/registry-playbook.md` — the `deriveStatus` trap and the status values
- `decisions/004-hard-wrap-mandate.md`, `005`, `006`, `007` — the rotted citations
- `decisions/019-okf-v02-conformance.md` — the adoption this note failed to check
- `decisions/024-callsigns-are-data.md` — the resolver that would make this free
- `AGENTS.md` — *"work not in td isn't tracked"*, the basis of the `td` criterion
