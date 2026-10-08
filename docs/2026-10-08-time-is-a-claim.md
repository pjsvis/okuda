---
date: 2026-10-08
kind: discussion — the time taxonomy, the invariance law, and why a filename's date is a claim rather than a measurement
lineage: docs/2026-10-08-the-filename-is-a-record.md (the naming argument); ADR-DATE-FIRST-002 (date-first naming); BRF-DATE-INVARIANT (the invariant this warrants); scripts/reg-sync.ts, scripts/date-lint.ts (the two gates)
status: adopted — the conditional rule and the invariant are enforced by `just check`
---

# Time is a claim

> A timestamp feels like a fact. It is an observation, made by one machine, about
> one copy of one file. Copy the file and the observation is left behind; what
> travels is the claim in its name. This is the taxonomy that makes that
> precise, and the rule that follows.

## What we assumed

That a file's creation and modification dates mean something. They do — on one
machine, about one copy. The assumption breaks the moment the bytes move: clone,
checkout, rsync, restore, container, mirror, backup. Nothing announces the
break; the dates just quietly change, and someone downstream reads the wrong
thing with full confidence.

## Four clocks, four invariance domains

| clock | what it records | where it is stable | what happens on transport |
|---|---|---|---|
| `mtime` / `atime` / `ctime` | when a host last wrote / read / changed the inode | that host, that clock, that filesystem lineage | **lost or reset** — `cp` without `-p`, checkout, rsync without `-t`, `unzip`, restore |
| VCS commit date | when a commit was authored and committed | the commit object, content-addressed | travels with the object — **until a rebase, cherry-pick, or amend rewrites the committer date, per replica** |
| content date (`date:`, `**Date:**`) | what the document says about itself | the bytes | travels, but **invisible to `ls`** — you must open the file to read it |
| filename date | what the name says about the record | the name | travels with the name; **the only one that is both portable and visible** |

Only the last row is stable *and* scannable. That is not a happy accident — it is
the reason the prefix exists. The prefix is not the date; it is the only date
that ships.

## The law

> **A signal is only as trustworthy as its invariance domain. Trust it inside the
> domain; when you transport, re-encode it in a carrier that travels.**

`mtime` inside one working copy is fine and useful. `mtime` in a persisted index
is a bug waiting for a copy to happen. The failure is not that a timestamp lies;
it is that we trusted it past the edge of where it was true.

## mtime is a cache

This is the same law the workspace was built on, applied to time. *Repo memory is
primary; agent memory is an ephemeral cache* — the model's context is useful
within a session and wrong the moment another replica writes. A filesystem
timestamp is the host's cache of time, in exactly that sense: local, fast,
disposable, and never the record.

So the ordering is not "trust the clock, distrust the model." It is one rule
twice: **the portable artifact is the record; everything host-local is a cache.**

## Where mtime remains legitimate

The rule is not a ban, and pretending it is would be its own kind of lie:

- **cache invalidation on one host** — did this file change since I read it?
  Same domain, respected.
- **staleness monitors** (`scripts/amp-check.ts`) — a heuristic about age,
  labelled as such, never entering a persisted claim.
- **nothing else.** If a timestamp is going to be read by anyone who did not
  create it on this machine, it is not a fact — it is a claim, and claims go in
  the name.

## The rule

> **A document that has a date carries it in the name, and the name agrees with
> the content. A document with no date carries no prefix — and the absence is
> honest, not an oversight.**

"Recommended" is deliberately not the grade. A recommendation is skipped exactly
when someone is busy — which is exactly when the date is forgotten, and exactly
when the information is lost.

But "mandatory for everything" is also wrong: a playbook, a reference, a template
has no date and should not fake one. The rule is therefore *conditional and
decidable*: does this document have a date? Then the name carries it, and the
content agrees.

And the loss is asymmetric. Keeping the prefix costs eleven characters and one
learned habit. Losing the date costs the event itself: you cannot reconstruct
*when* a document was written from a copy whose metadata is gone, and git will
only tell you what its history says — which a rewrite can change.

## The evidence, from this session

The invariant was not theoretical. Wiring `reg-sync` to the filename as a claim
(after `BRF-DATE-INVARIANT`) immediately surfaced **eleven persisted registry
rows whose date disagreed with their own document's name**:

| where | stored | corrected to | what it was |
|---|---|---|---|
| `briefs/2026-08-27-brief-artpack-aesthetics.md` | 2026-08-26 | 2026-08-27 | a creation stamp seeded as the row |
| `briefs/2026-08-27-brief-dense-dynamic-displays.md` | 2026-08-26 | 2026-08-27 | same |
| `briefs/2026-08-27-brief-ssh-tui-integration.md` | 2026-08-26 | 2026-08-27 | same |
| `debriefs/2026-08-31-debrief-the-ledger-day.md` | 2026-09-01 | 2026-08-31 | an unclaimed date |
| `.archive/briefs/2026-08-24-session-handoff*.md` (×3) | 2026-10-03 | 2026-08-24 | **checkout time** |
| `.archive/briefs/2026-08-27-brief-neckbeard-fzf-assimilation.md` | 2026-10-03 | 2026-08-27 | checkout time |
| `.archive/briefs/2026-08-28-brief-index-and-jump.md` | 2026-08-30 | 2026-08-28 | a copy's clock |
| `.archive/briefs/2026-08-29-brief-okf-callsign-migration.md` | 2026-10-02 | 2026-08-29 | a copy's clock |
| `.archive/briefs/2026-09-14-brief-table-width.md` | 2026-10-02 | 2026-09-14 | a copy's clock |

Seven of the eleven are one archive sweep away from being read as October work.
None of them were lies by anyone; every one was a host's clock persisted as if it
were the document's. That is the failure this rule prevents.

## What enforces it

- `scripts/date-lint.ts` — every scanned document: where the name carries a date,
  the declared `date:`/`**Date:**` must equal it. Wired into `just check`, with an
  empty baseline (the corpus agrees). A prefixed name with no declared date and
  no registry row is **uncorroborated** — reported, not gated, until the `docs/`
  registry exists to sign for it.
- `scripts/reg-sync.ts` — the registry's date falls back content → name, never
  `mtime`; a date is compared only when the document actually claims one.

The name is the claim; the content and the registry are the two signatures. One
signature is legal; none is a rumour.

## Related

- `docs/2026-10-08-the-filename-is-a-record.md` — why the prefix, and the landing-date rule for imports
- `BRF-DATE-INVARIANT` — the brief that wired the invariant
- `ADR-DATE-FIRST-002` — briefs are named `YYYY-MM-DD-brief-slug.md`
- `scripts/date-lint.ts`, `scripts/reg-sync.ts` — the two sides of one rule
