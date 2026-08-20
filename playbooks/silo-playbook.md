# Silo Playbook

A **silo** is a self-contained project directory with named compartments,
each carrying a single responsibility. The `justfile` is the facade that
wires them together.

## The Principle

Every project is a silo. A silo contains all the "stuff" — content, configs,
playbooks, scripts, indexes — organized so an agent can orient within
seconds of running `just help`.

## blog-posts Silo Structure

```
blog-posts/                          ← Silo root
 ├── _posts/                         ← Published long-form content (Jekyll)
 ├── _drafts/                        ← Works in progress (excluded from build)
 ├── _layouts/                       ← HTML layout templates (Jekyll)
 ├── _config.yml                     ← Jekyll pipeline config
 ├── briefs/                         ← Post briefs and epics
 │   └── INDEX.jsonl
 ├── debriefs/                       ← Post retrospectives
 │   └── INDEX.jsonl
 ├── decisions/                      ← Architecture decision records
 │   └── INDEX.jsonl
 ├── playbooks/                      ← Operational playbooks
 │   ├── REGISTRY.jsonl
 │   └── *.md
 ├── scripts/                        ← Export automation + registry tools
 │   ├── export-all.ts
 │   ├── scrape-and-export.ts
 │   ├── reg-sync.ts
 │   └── reg-list.ts
 ├── assets/                         ← Static CSS and media
 ├── .github/workflows/              ← CI/CD: Jekyll → GitHub Pages
 ├── justfile                        ← Task runner facade
 ├── AGENTS.md                       ← Project identity
 ├── SILO_MANIFEST.md                ← Asset map and quick reference
 └── README.md                       ← Public overview
```

## Compartments

### Document Compartments (with Indexes)

Every directory that accumulates documents gets an `INDEX.jsonl`:

| Directory | Purpose | Index |
|-----------|---------|-------|
| `briefs/` | Post briefs and epics | `INDEX.jsonl` |
| `debriefs/` | Post retrospectives | `INDEX.jsonl` |
| `decisions/` | ADRs: why we chose X over Y | `INDEX.jsonl` |
| `playbooks/` | Operational conventions | `REGISTRY.jsonl` |

Schema: `{ file, date, status, summary, meta? }`

Tools: `scripts/reg-list.ts`, `scripts/reg-sync.ts`

### Jekyll Compartments (special)

These use Jekyll's underscore convention — do not rename:

| Directory | Purpose | Jekyll behaviour |
|-----------|---------|------------------|
| `_posts/` | Published content | Auto permalink by date, output to site |
| `_drafts/` | Works in progress | Excluded from build unless `--drafts` |
| `_layouts/` | HTML templates | Inherited by posts via front-matter |
| `_config.yml` | Pipeline config | Loaded on every Jekyll run |

### Automation Compartment

| Directory | Purpose |
|-----------|---------|
| `scripts/` | Export and registry tooling (Bun/TypeScript) |

## Justfile Facade

The `justfile` is a **facade** — complex logic lives in `scripts/`. Recipes
are one-line delegations.

### Navigation

```bash
just help       # Workflow guide: brief → draft → publish → export → debrief
just info       # Project rationale and origin
just orient     # Current state: branch, status, post count
```

### Quality Gate

```bash
just check      # Front-matter validation + registry sync
```

### Publishing

```bash
just preview    # Local Jekyll at localhost:4000
just build      # Build site locally
just export     # Generate _exported/ for all platforms
just live       # Open GitHub Pages site
```

### Registry Commands

```bash
just reg-sync        # Check all registries for drift
just reg-sync-fix    # Regenerate from filesystem
just reg-briefs      # List briefs
just reg-debriefs    # List debriefs
just reg-decisions   # List decisions
just reg-playbooks   # List playbooks
```

## Conventions

### One logical change per commit

All files that must change together, no more. Run `just check` before
and after every commit.

### Fail-fast protocol

1. Make small change → `just check` → commit or revert
2. If checks fail: revert first, diagnose second
3. If stuck >15 min: stop, revert, ask

### Export before distribute

Run `just export` and review `_exported/` before pasting to Substack,
Medium, HN, or Twitter. Automated output is a first pass.

### Barnacle detection

Run the barnacle inspection at session start. See `playbooks/barnacle-playbook.md`.
Common targets: tradingagents carry-over, missing file references,
wrong tool defaults, stale paths.

### Registry hygiene

Run `reg-sync --all` after adding any brief, debrief, decision, or playbook.
Stale indexes misdirect agents about what exists in the silo.

## Migration Path (For New Silos)

1. Create document compartments (`briefs/`, `debriefs/`, `decisions/`, `playbooks/`)
2. Add `INDEX.jsonl` / `REGISTRY.jsonl` to each
3. Wire `justfile` with navigation + quality gate recipes
4. Create `SILO_MANIFEST.md` as the asset map
5. Run `reg-sync --fix` to populate indexes from filesystem

## Related

- `SILO_MANIFEST.md` — Asset map and quick reference
- `playbooks/blog-posts-playbook.md` — Jekyll pipeline reference
- `playbooks/registry-playbook.md` — Document index system
- `playbooks/barnacle-playbook.md` — Barnacle identification and removal
- `playbooks/conventions-playbook.md` — Active conventions and barnacle removal record