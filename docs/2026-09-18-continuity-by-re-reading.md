---
date: 2026-09-18
kind: design note — an identity proposal, the census that tests it, and the two rituals it retires
lineage: system.md v1.1.0 → v1.2.0; docs/2026-09-14-edinburgh-protocol-discussion.md §4 (rules → stance); playbooks/registry-playbook.md:116-127 (no parallel stores); decisions/027; docs/2026-08-30-naming-like-nasa.md
status: landed — the Base Epistemic Attitude is in `system.md` v1.2.0. The retirement of the harness rituals is proposed, not done: the store is still on disk and still cited.
---

# Continuity is re-reading, not recall

> ◆ Of the 28 bullets in the agent's private store, 25 name a silo artifact the
> ledger already holds. The 3 that do not name no fact at all. They name an
> attitude — and an attitude is the one thing a path cannot regenerate.

## What we are deciding

Whether the agent's continuity should be carried by two rituals the harness
offers — a **private memory store** and a **personal designation** — or by a
single base-level epistemic attitude written into the protocol.

The proposal is the second. The argument for it is not aesthetic. The silo has
already legislated against the first, and the store has already started
dismantling itself.

## The store, measured

| Dimension | `.workbuddy-ai/memory/` | the silo's own record |
|---|---|---|
| Files | 9 | 350 |
| Bytes | 273,935 | — |
| Tracked by git | **0** | **350** |
| Regenerable from the silo | yes — per its own header | it *is* the silo |

`git ls-files .workbuddy-ai` returns nothing. `.gitignore:17` excludes the whole
directory. So the store is 268 KB of prose that git has never seen, sitting
beside a repo that tracks 350 markdown documents.

## The defect in one example

`debriefs/2026-09-13-debrief-tidy-first.md:54`:

```
Recorded in `MEMORY.md` under Registries. Flagged, not fixed this session.
```

Line `:128` repeats it. A **tracked** document names an **untracked** file as the
record of an open root cause. The playbook says of exactly this move:

> A principle that lives only in an agent's private memory file, a chat, or a
> skill outside the tree cannot be searched, cited from a brief, reviewed in a
> PR, or read aloud — so it is not a record.
> — `playbooks/registry-playbook.md:120-124`

The prohibition has been broken, in the ledger, by a debrief, for two weeks.
ADR-027 has a name for it: a **phantom referent**.

## The law the silo already has

The registry playbook supplies the test that settles this without any new
argument:

> The test that separates a cache from a shadow store: **can it be deleted and
> regenerated from the silo?** If yes it is a cache and may be lossy; if no it is
> a shadow store and the knowledge belongs in a document.
> — `playbooks/registry-playbook.md:125-127`

Apply it. The store's own header answers for it — *"The records live in the repo
— cite ADRs and briefs by path."* Deletable and regenerable: **it is a cache.**

A cache is permitted. A cache **read as authoritative** is the failure, and it is
the failure ADR-027 already named: *an out-of-date ledger misleads confidently,
which is the one failure worse than yapping.* The store is loaded
unconditionally and read first. It is the worst possible place for a stale fact.

## The finding

- **The store is already migrating itself out.** Its header records it:
  *"Deduplicated 2026-09-18: eight traps moved to the skill that loads when each
  one bites."* That is the correct direction — a skill loads *conditionally*, on
  the context that needs it; a memory file charges every session for facts
  relevant to a few.
- **What the migration leaves behind is the attitude.** Measured: 25 of 28
  bullets name something greppable — a symbol, a path, a callsign — and are
  therefore pointers into a ledger that already holds them. The 3 that name
  nothing are: *a detector needs a control*, *the probe is a finder not the
  judge*, *where it overlaps an external rule the house derived it better*. Not
  one of the three is a fact. Each is a disposition.
- **So the end state is not a better memory file.** It is: pointers → the silo
  (where they already are), dispositions → `system.md` (where they now are), and
  the store → nothing that either does not already hold.
- **And the designation answers itself.** The house's naming veto — *a name must
  not lie about its referent*, the LEM → LM rename of 1966
  (`docs/2026-08-30-naming-like-nasa.md`) — applied to the agent, asks what the
  referent is. It is a procedure. A procedure is genuinely re-instantiated
  identically from a file, which is the one kind of continuity this substrate
  actually has. So the protocol is the only thing here that can honestly bear a
  name, and it already bears one.

## The relocation — a flag, not a finding

`MEMORY.md` records its own deduplication: *"eight traps moved to the skill that
loads when each one bites."* The direction is right — a skill loads
conditionally, on the context that needs it. The **location** is not.

`/Users/petersmith/.workbuddy-ai/skills/` is outside the repo, and `git ls-files`
in the silo returns **0** paths under `skills/`. Four skills carry okuda content.
The playbook's sentence — *"a principle that lives only in an agent's private
memory file, a chat, or a skill outside the tree … is not a record"* — names this
exact address, in that order.

So the eight traps did not leave the class. They changed address. That is not an
argument against skills: a skill is *machinery*, and the playbook's rule is about
*knowledge*. It is an argument against putting **knowledge** in one. The
`irreducible` / `allocator fault` split is knowledge — two different owners, and a
brief needs to cite it.

**Flag, not finding.** The location and the count are verified. I did not read all
four skills end to end and classify each of the eight traps; that classification
is the work, and it is not done here.

## The fork

**A — Retire the store; keep the ledger and the attitude.** Pointers resolve
against the silo by path. Dispositions live in `system.md`. Nothing is written
that the silo cannot see. The cost is that a session loses its warm start on
cross-cutting facts — and the answer to that is `just orient`, which reads the
ledger the facts came from.

**B — Keep the store, wired to the ledger.** Declare it a cache, load it as one,
and make it fail loudly when it disagrees with the silo — a `just` target that
re-resolves every pointer and reports the dead ones. The cost is a second store
to maintain, and a class of failure (drift) that the ledger does not have.

## What is not in question

- The silo principle. This note is an application of it, not a challenge.
- That the record must be versioned, reviewable, and citable. That is the whole
  argument *for* the ledger.
- That a person may keep private notes. This is a rule about what the **agent**
  treats as a record, not about what the operator may write down.
- That `system.md` should stay small. The attitude is four clauses; it replaced a
  store that was 268 KB and growing.
- That daily logs have value. See below — that is the part I would not rush.

## Where I would land

**A**, with one honest caveat and one caution.

The caveat: a memory store has one advantage the ledger does not. It is loaded
**unconditionally**, so it catches the thing you did not know to look for. The
ledger is queried and a skill is triggered, and both require knowing what you
want. The reply is that the thing you did not know to look for is precisely what
a *disposition* catches better than a fact — a fact you must know in order to
use, an attitude you cannot help applying. That is the whole reason the house's
own trajectory has been *rules → stance*
(`docs/2026-09-14-edinburgh-protocol-discussion.md` §4) and not *rules → more
rules*.

The caution: **do not delete the store to implement this.** The eight daily logs
are 268 KB of session history with no silo home, and the salvage question — what
in them belongs in a debrief, what in them is nothing — is unanswered. Retiring
the store is a decision about *authority*, not an instruction to run `rm`.
Salvage first, then delete, and delete only what the salvage leaves.

## Evidence

- `tmp/memory-census-probe.py` — the census: file sizes, the `git ls-files`
  count, the phantom-referent scan, and the pointer/orphan classification.
  Its first version tested for paths and callsigns only and reported 23 orphans
  of 28; the detector was the defect, not the store. Folded to whole bullets and
  widened to any backticked token, it reports 3. The note quotes the second
  number and keeps the first visible, because the error is the interesting part.
- `git ls-files | grep -c 'skills/'` → **0**, and
  `ls -d ~/.workbuddy-ai/skills/okuda-*` → four skills. The relocation flag.
- `./okuda system.md | cat -v` → `^[[38;2;223;162;26;1m`. A `--no-color` render
  legitimately carries SGR 1 for bold, and the capture strips `\x1b[` — so a
  render reading `[1munpaid claim` is a capture artifact, not a renderer defect.
  Checked before reporting it.

## Related

- `system.md` — v1.2.0, the Base Epistemic Attitude
- `playbooks/registry-playbook.md` — no parallel stores, and the cache test
- `decisions/027-temperament-is-downstream-of-discipline.md` — the ledger governs
  drift, not temperament; barnacles, phantom referents, cite-or-mark
- `docs/2026-08-30-naming-like-nasa.md` — the veto: a name must not lie
- `docs/2026-09-14-edinburgh-protocol-discussion.md` — rules → stance, §4
- `debriefs/2026-09-13-debrief-tidy-first.md` — the phantom referent, `:54`, `:128`
