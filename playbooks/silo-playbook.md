---
type: Playbook
callsign: PLY-SILO
---

# Silo Playbook

A **silo** is a self-contained project directory with named compartments,
each carrying a single responsibility. A silo contains all the "stuff" —
content, configs, playbooks, scripts, indexes — organised so an agent can
orient within seconds of running `just help`.

## The Principle

Every project is a silo. The silo is the unit of autonomy: anything the
work needs lives inside the boundary, and everything inside the boundary
is discoverable from the `justfile`.

## Minimum Viable Silo

A silo starts with the playbooks folder and the root files. Nothing else.

```
<silo>/
 ├── playbooks/          ← first folder: operational protocols
 │   ├── REGISTRY.jsonl
 │   └── *.md
 ├── justfile            ← shared operational lexicon (agent ↔ operator)
 ├── system.md           ← The Edinburgh Protocol — the silo's constitution
 ├── .gitignore
 └── README.md
```

**Do not create a folder until you need the folder.** An empty compartment
is a claim about future work, and it carries obligations (an index, sync
discipline) with no content to justify them. A directory is created the
moment the first document that belongs in it is written — not before.

Other root files — an agent-facing `AGENTS.md` for rules of engagement,
a `DEPENDENCIES.md` inventory of external tools — are optional additions
when the silo warrants them. `DEPENDENCIES.md` records versions,
locations, and verification dates; brief preconditions cite it.

## Document Compartments (on demand)

When work begins, compartments appear — each with its index from the
moment it has contents:

| Directory | Purpose | Index |
|-----------|---------|-------|
| `briefs/` | Records of intent — the spine | `INDEX.jsonl` |
| `decisions/` | ADRs: why we chose X over Y | `INDEX.jsonl` |
| `debriefs/` | Retrospectives | `INDEX.jsonl` |

Briefs are the spine: everything else derives from and references them,
never the reverse. Schema and workflow: `registry-playbook.md`.
Format and naming: `briefs-playbook.md`.

## The Scratch Tier

`tmp/` is the one directory that is **not** a compartment. It is gitignored
(`.gitignore:25`), never registered, never indexed, and regenerated at will.
Probes, dogfood artifacts and rendered specimens live there and are expected to be
lost. **A finding that matters does not live in `tmp/`** — the silo is what git
tracks, so a scratch file is not in the silo and cannot be cited. That is the whole
reason the tier is safe: it is the one place a copyrighted specimen may sit
(`ear-playbook.md`).

The tier was **created by an agent, not by a plan**, and it earns its place by being
useful: it is where a measurement is made before a brief is written. The probe-first
habit is the house's (`briefs-playbook.md`, `decisions-playbook.md`), and this is
where the probe goes.

**Language.** TypeScript is the **release** language: everything in `src/`,
`scripts/` and the compiled binary is TypeScript, and nothing in the release path
invokes an interpreter (verified 2026-09-18 — no recipe or script calls `python`).
Probes, smoke tests and dogfooding harnesses are written in **whatever the executing
agent prefers, usually Python** — they are scratch, they are not reviewed as
product, and the release path never depends on them. Both are present today: 58
TypeScript probes and 21 Python ones. A probe that graduates becomes a test in
`tests/` (TypeScript) or a script in `scripts/`, and stops being scratch.

## The justfile Facade

The `justfile` is the **shared operational lexicon** for agent and
operator, whatever the silo is about. Recipes are stable-named,
one-line delegations; complex logic lives in `scripts/`.

The lexicon stays pronounceable even when a target does not exist yet:
`just reg-debriefs` on a silo with no debriefs prints "empty" — it does
not error. Vocabulary survives the state of the filesystem.

Core vocabulary:

```bash
just help       # workflow guide — orient here first
just info       # what this silo is and why
just orient     # current state: branch, status, registries
just check      # quality gate — before every commit
just reg-*      # registry listing and sync
```

## system.md

Each silo carries `system.md` containing **The Edinburgh Protocol** — the
constitution. It travels with the silo so any agent, whatever harness it
arrived in, reads the same operating principles: conceptual entropy
reduction, skepticism before narrative, systems over villains,
practicality over purity.

## Conventions

- **One logical change per commit** — all files that must change together, no more
- **Fail-fast** — small change → `just check` → commit or revert; stuck >15 min: stop, revert, ask
- **Registry hygiene** — `just reg-sync-fix` after adding any document; stale indexes misdirect agents

## Scaling: The Archive

When briefs complete, the active timeline must stay legible. Move settled
work out of the registries:

1. `mkdir .archive/<brief-name>` — a folder with the same name as the brief file
2. Move the brief (and its debrief, once written) into it
3. Drop the corresponding `INDEX.jsonl` entries and run `just reg-sync-fix`
4. Commit the move — git history is the permanent record

`.archive/` is dot-prefixed so it stays out of the default listing; inside
it, date-named folders still sort as a timeline. Cadence and gaps remain
inspectable where they matter — the active set — without the settled past
cluttering it.

## Related

- `playbooks/registry-playbook.md` — index schema and sync workflow
- `playbooks/briefs-playbook.md` — the spine documents
- `playbooks/td-playbook.md` — session and task workflow
