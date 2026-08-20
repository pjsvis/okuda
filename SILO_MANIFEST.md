# SILO_MANIFEST — okuda

Asset map and quick reference. Every compartment, what lives in it, and how to drive it. An agent should orient from this file in under a minute.

## What okuda Is

A high-performance terminal markdown viewer built on `Bun.markdown`, compiled to a single binary. It replaces Glow for this workflow by enforcing loose list spacing, honoring soft returns, terminal-width word wrapping, loose high-contrast tables, and piping `mermaid` code fences into the **`mermaid-to-md`** Rust CLI (at `~/.local/bin/mermaid-to-md`) for ASCII diagram rendering.

* Design source: `docs/2026-08-20-origin-doc.md`
* Status: **pre-implementation** — silo provisioned, no renderer code yet

## Silo Map

```
okuda/
├── docs/                    ← Origin and design documents
│   └── 2026-08-20-origin-doc.md
├── briefs/                  ← Work proposals (INDEX.jsonl)
├── debriefs/                ← Retrospectives (INDEX.jsonl)
├── decisions/               ← ADRs (INDEX.jsonl, TEMPLATE.md)
├── playbooks/               ← Operational protocols (REGISTRY.jsonl)
├── scripts/                 ← Registry tooling (Bun, zero deps)
│   ├── reg-sync.ts
│   └── reg-list.ts
├── justfile                 ← Task runner facade
├── AGENTS.md                ← Project identity and rules
├── SILO_MANIFEST.md         ← This file
└── README.md                ← Public overview
```

## Compartments

| Directory | Purpose | Index | Status values |
|-----------|---------|-------|---------------|
| `briefs/` | Work proposals — what we will build | `INDEX.jsonl` | `open`, `in_progress`, `done` |
| `debriefs/` | Retrospectives — what happened | `INDEX.jsonl` | `done` |
| `decisions/` | ADRs — why we chose X | `INDEX.jsonl` | `Proposed`, `Accepted`, `Superseded` |
| `playbooks/` | Protocols — how we do X | `REGISTRY.jsonl` | `canonical`, `project` |
| `docs/` | Design sources of truth | — (curated, not accumulated) | — |
| `scripts/` | Tooling | — (code, not documents) | — |

## Driving the Silo

```bash
just orient        # where am I: branch, status, registries
just check         # quality gate — before every commit
just reg-list      # via: just reg-briefs | reg-decisions | reg-playbooks
just reg-sync-fix  # after adding any brief/decision/debrief/playbook
```

Adding a document: write it → run `just reg-sync-fix` → review index entry → commit (document + index together, one logical change).

## External Dependencies

| Dependency | Purpose | Verified |
|------------|---------|----------|
| `bun` | Runtime + `Bun.markdown` renderer; runs `scripts/*.ts` | 2026-08-20 |
| `just` | Task facade | 2026-08-20 |
| `mermaid-to-md` | Rust CLI: mermaid source → ASCII diagram (stdin → stdout) | 2026-08-20, `~/.local/bin/` |
| `td` | Task management (see `playbooks/td-playbook.md`) | 2026-08-20 |

## Known Import Barnacles

Playbooks were imported from the blog-posts silo on 2026-08-20. Tracked deviations:

* `spacex-mermaid` (origin doc) → actual binary is `mermaid-to-md`
* Blog-centric brief/export/Jekyll flows in `briefs-playbook.md` / `silo-playbook.md` are templates, not rules — okuda briefs follow the engineering format of `briefs/2026-08-20-brief-project-initialisation.md`
* Topic-first brief filenames (`brief-[topic]-[date].md` in the import) — fixed 2026-08-20: strict date-first `YYYY-MM-DD-brief-slug.md` per ADR-002
* References to non-existent playbooks (`conventions-`, `barnacle-`, `export-`, `blog-posts-playbook.md`) remain in Related tables until real need arises

## History

| Date | Event |
|------|-------|
| 2026-08-20 | Origin doc; playbooks imported; silo provisioned (ADR-001); git baseline on `main` |
| 2026-08-20 | ADR-002: date-first brief naming enforced (`YYYY-MM-DD-brief-slug.md`); provisioning brief renamed |
