---
date: 2026-10-08
kind: response — nine pre-okuda workflow essays (written 2026-08-03, landed 2026-10-08) measured against two months of the workspace they proposed
lineage: docs/2026-10-08-ai-human-development-workflow-01.md (the ancestor corpus, 01–09); ADR-DATE-FIRST-002 (date-first naming); system.md (the Edinburgh Protocol and its lexicon); docs/2026-08-23-why-okuda-derrida-gate-foxtrot-oscar.md (the Derrida Question); scripts/callsign-lint.ts (the checksum that survived); scripts/facade-lint.sh (the drift detector that replaced the README); playbooks/authoring-playbook.md
status: adopted in part — the naming argument holds, the misnamed question is corrected, two doctrines are refused
---

# The filename is a record

> On 2026-08-03, a fortnight before this repository existed, nine essays set out
> a workspace: four folders, ISO-dated files, the repo as the only memory, the
> artifact as the proof. Two months later the repo is that workspace — mostly.
> This is the ledger: what survived contact, what did not, and the one question
> the essays misnamed.

## The ancestors, and why they carry today's date

Nine documents written on 2026-08-03 (`git log --reverse` puts this repo's first
commit at 2026-08-20). They are not commentary on okuda; they are its ancestors.
`briefs/`, `debriefs/`, `decisions/`, `playbooks/`, `.archive/`, the Justfile,
`td`, the ISO prefix, "artifact as proof" — all of it is here, argued from first
principles before there was a repository to argue about.

They landed on 2026-10-08 and are dated accordingly. The source date is
provenance, not the filename: a copied file is a copied filename, and nine files
stamped August would reproduce another context's timeline inside this one. The
record's date is the date the record entered the silo; where it came from goes
in `Source:`.

## A date is not part of a name. It is part of the record.

The essays' first claim is right, and the usual argument for it is the weak one.

The weak argument is "it sorts". True, and insufficient. The strong argument is
that the filename date is the **only date that survives the copy**. `mtime` lies
the moment you clone, rsync, or restore; a date in the front matter is inside the
file and invisible to `ls`. If provenance is going to travel, it has to travel in
the name.

The objection is that the prefix makes a list hard to read, because you must
"figure out when, then what". Half true, and misdiagnosed. An ISO date is
fixed-width: the eye does not decode it, it skips eleven characters, and the
*what* begins at a predictable column. That scans **better** than a free-form
list, not worse, once the convention is learned.

What actually hurts is that the prefix makes **time the primary key** — and time
is the least useful dimension for *lookup*. A filename carries one axis. Deleting
the date fixes the lookup and breaks the timeline; that is a bad trade, and an
unnecessary one.

The remedy for lookup is not a rename. It is an index. This repo's own rule is
already explicit: a directory that accumulates documents gets a registry. `docs/`
is some two hundred files and has not got one yet. The date is the sort key; the
index is the lookup key. Different questions, different artifacts.

## Two questions at the door

The essays run every proposal through two operational questions. They got one
exactly right, and misnamed the other twice.

**The James Watt Question** — *what is the thermodynamic efficiency of this
mechanism?* — is this project's own, from the Edinburgh Protocol, and the essays
apply it as the project does: a custom MCP server over an index of eighty-nine
files fails it; a `YYYY-MM-DD` prefix passes it at zero token cost.

**The other question** the essays call "the Derrida Question" — *where is the
difference between the signifier and the reality?* Two faults, both worth
correcting:

1. **The man.** The text writes "Jaques Derrida" once and "Daniel Derrida" three
   times. The philosopher is **Jacques**. A term you cannot spell is a term you
   are using as decoration — which is precisely what the question is meant to
   catch.
2. **The meaning.** The contract-versus-reality check is already a named thing
   here: **Map vs. Territory** (the output is a map, not the territory), and
   concretely the **facade** — the honesty line, *a name must not lie*, enforced
   by `scripts/facade-lint.sh`. The essay set even carries its own *"Territory
   vs. the Map"* section, so its Derrida Question is a second name for a thing it
   had already named.

Meanwhile this project's **Derrida Question** means something else entirely:
*should this even be in our consideration set?* — the gate asked before the
eval, paired with the Foxtrot Oscar that ejects what fails
(`docs/2026-08-23-why-okuda-derrida-gate-foxtrot-oscar.md`).

One token, two meanings is the entropy the lexicon exists to prevent. So the
lexicon keeps its meaning: the essays' question is the **facade** check, and the
name is spelled correctly or not used.

## The ledger, two months on

**Adopted.**

- The four-folder pipeline — briefs (intent), debriefs (reality), decisions
  (rationale), playbooks (heuristics) — is the repo's spine.
- Repo memory over agent memory: a session starts by reading files, not by
  trusting a context window.
- "Artifact as proof" is the gate on every claim in `docs/`, `decisions/` and
  `debriefs/`; `.archive/` keeps the active view fast.
- The pre-execution assertions survive as the orient step: a date-sorted listing
  gives the tempo, the task board gives the focus, the decisions say what not to
  re-litigate.

**Refused.**

- The co-located `README.md` as a continuous checksum against implementation
  drift. Drift here is caught by the registries and the lints (`reg-sync`,
  `facade-lint`, `callsign-lint`, `signature-check`), which run in `just check`
  and either pass or fail. The essays' checksum asks a human to notice a
  divergence; the repo's asks a command.
- The branding. "Sovereign agentic workspace" and "zero-effort OKF" name a
  feeling, not a mechanism. This repo has OKF, and it means frontmatter type plus
  a JSONL registry — not a vibe.

**Changed.**

- "Portfolio telemetry across repos" stayed out of scope: okuda renders
  documents, it does not roam a filesystem counting commits.
- The checksum that survived is narrower than the essays hoped and sharper than
  they imagined — `scripts/callsign-lint.ts` takes a Shannon checksum over the
  citation namespace, so a pointer to a document that no longer resolves fails the
  gate.
- The naming rule gained two clauses the essays could not have written, because
  they had no imports and no distributed copies: **landing date for imports**
  (`playbooks/authoring-playbook.md`), and a grade — not *recommended* but
  **conditional**: a document that has a date carries it in the name, and the name
  agrees with the content (`docs/2026-10-08-time-is-a-claim.md`).

## What this does not fix

Nothing here makes `docs/` findable. The naming argument explains why the date
belongs; the index argument explains what is still missing. Two hundred
date-prefixed files and no registry is a pile, not a library. The nine ancestors
are as good a first tenant for that index as any.

## Related

- `docs/2026-10-08-ai-human-development-workflow-01.md` — the ancestors (01–09)
- `ADR-DATE-FIRST-002` — briefs are named `YYYY-MM-DD-brief-slug.md`
- `ADR-SESSION-HANDOFFS-017` — handoffs live in `td`, never in a brief
- `system.md` — the Edinburgh Protocol and its lexicon (Map vs. Territory; the Derrida Question)
- `docs/2026-08-23-why-okuda-derrida-gate-foxtrot-oscar.md` — the Derrida gate and the Foxtrot Oscar
- `docs/2026-10-08-time-is-a-claim.md` — the time taxonomy and the conditional rule
- `scripts/callsign-lint.ts`, `scripts/facade-lint.sh` — the drift detectors that replaced the README checksum
- `playbooks/authoring-playbook.md` — where the landing-date rule lives
