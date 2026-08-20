# Brief: Provision the okuda Silo

**Date:** 2026-08-20
**Status:** Done

---

## Objective

Stand up the okuda repository as a functioning silo — git baseline, document compartments, registry indexes, registry tooling, and the `justfile` facade — so that implementation of the terminal markdown viewer (per `docs/2026-08-20-origin-doc.md`) starts on governed ground.

## Scope

**In:** project scaffolding and governance only — no renderer code.
**Out:** the viewer implementation itself (`src/`, `bun build`, mermaid piping). That is the next brief.

## Preconditions

- [x] Origin doc present: `docs/2026-08-20-origin-doc.md`
- [x] Playbooks populated: 7 playbooks imported from the blog-posts silo
- [x] `td` initialised (fresh database, session `ses_61b221`)
- [x] Toolchain verified: `just`, `bun`, `git` on PATH
- [x] External dependency verified: `mermaid-to-md` binary at `~/.local/bin/mermaid-to-md`

## Work Plan

1. [x] `git init -b main`, `.gitignore`, baseline commit of user-supplied files (origin doc + playbooks)
2. [x] Branch `feat/provision-silo` — all provisioning work lands here, never on `main`
3. [x] Create document compartments: `briefs/` (exists), `debriefs/`, `decisions/`
4. [x] Add registry indexes: `briefs/INDEX.jsonl`, `debriefs/INDEX.jsonl`, `decisions/INDEX.jsonl`, `playbooks/REGISTRY.jsonl`
5. [x] Add `decisions/TEMPLATE.md` (per decisions-playbook)
6. [x] Write `scripts/reg-sync.ts` and `scripts/reg-list.ts` (Bun, zero deps)
7. [x] Write `justfile`: `help`, `info`, `orient`, `check`, `reg-sync`, `reg-sync-fix`, `reg-briefs`, `reg-debriefs`, `reg-decisions`, `reg-playbooks`
8. [x] Write `SILO_MANIFEST.md`, `README.md`, project `AGENTS.md`
9. [x] Record ADR-001: adoption of the silo pattern from blog-posts, with adaptation notes
10. [x] Run `reg-sync --fix` to populate indexes from filesystem; `just check` green — indexes hand-authored with meaningful summaries instead of auto-derived; `reg-sync --all` verifies zero drift

## Acceptance Criteria

* `just check` passes end-to-end with zero MISSING / zero STALE entries
* `just help` gives a workflow guide an agent can orient from in seconds
* `just orient` reports branch, git status, registry counts
* Every accumulating directory has a machine-readable index (registry-playbook principle)
* Repository history: baseline on `main`, provisioning on `feat/provision-silo`, one logical change per commit
* The brief you are reading is itself registered in `briefs/INDEX.jsonl`

## Notes — Barnacles Identified (from blog-posts import)

The playbooks were authored for the blog-posts project. Known carry-over:

| Barnacle | Location | Disposition |
|----------|----------|-------------|
| `spacex-mermaid` binary name | origin doc | Superseded: the Rust CLI is `mermaid-to-md` (verified on PATH). Record in implementation brief |
| "blog-posts project" header | `td-playbook.md` | Fix during provisioning (one-line edit) |
| Jekyll `_posts/` tree, Substack/Medium export flows | `silo-playbook.md`, `briefs-playbook.md` | Leave as illustrative examples; okuda briefs use this engineering format instead |
| References to missing playbooks (`conventions-`, `barnacle-`, `export-`, `blog-posts-playbook.md`) | `playbooks-playbook.md`, `silo-playbook.md` Related tables | Flagged; write okuda-specific ones when a real need arises, not before |
| `just preview/build/export/live` (Jekyll facade) | `silo-playbook.md` | Not wired; okuda's build recipes arrive with the implementation brief |

## Next Brief (not this one)

Implementation: `Bun.markdown` renderer → `mermaid-to-md` piping → loose lists/tables → `--watch` → `bun build --compile`. Origin doc is the design source; acceptance criteria live there.
