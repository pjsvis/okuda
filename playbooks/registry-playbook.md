# Registry Playbook — Document Index System

## Principle

**If it accumulates files, it gets an index.**

No directory should be a black box where only the author knows what's there and what it means. Every registry directory has a `INDEX.jsonl` (or `REGISTRY.jsonl` for playbooks) that describes its contents in a machine-readable format.

## Unified Schema

All registries use the same JSONL structure — one line per document, one field set:

```json
{"file":"filename.md","date":"YYYY-MM-DD","status":"open","summary":"One-line description","meta":{}}
```

| Field | Required | Description |
|-------|----------|-------------|
| `file` | yes | Filename only (no path), relative to the registry directory |
| `date` | yes | ISO date `YYYY-MM-DD` of creation or last meaningful update |
| `status` | yes | Registry-specific state (see below) |
| `summary` | yes | One-sentence description, no trailing period. Imperative: "Write post on X" not "Wrote post on X" |
| `meta` | no | Registry-specific fields (keep lightweight) |

## Registry-Specific Mappings

| Registry | Index file | `status` values | `meta` fields |
|----------|------------|-----------------|---------------|
| **briefs** | `briefs/INDEX.jsonl` | `open`, `in_progress`, `done` | `epic` |
| **debriefs** | `debriefs/INDEX.jsonl` | `done` | `adr`, `platforms` |
| **decisions** | `decisions/INDEX.jsonl` | `Proposed`, `Accepted`, `Superseded` | `supersedes`, `superseded_by` |
| **playbooks** | `playbooks/REGISTRY.jsonl` | `canonical`, `project` | `source` |

---

## Workflow

### Adding a document

When you create a new brief, debrief, decision, or playbook:
1. Write the document
2. Add entry to the relevant `INDEX.jsonl`:
   - `file`: document filename
   - `date`: today's date
   - `status`: appropriate state
   - `summary`: one-sentence description
   - `meta`: any relevant metadata

### Updating status

When a document's state changes:
- Brief `open` → `in_progress` → `done`
- Decision `Proposed` → `Accepted` → `Superseded`
- Update the `status` field in the index entry

### Syncing the index

Run `reg-sync` to detect drift between the filesystem and the index:

```bash
bun scripts/reg-sync.ts briefs          # check one registry
bun scripts/reg-sync.ts --all           # check all registries
bun scripts/reg-sync.ts --all --fix     # regenerate from filesystem
```

**MISSING** = files on disk not in the index → need to be added
**STALE** = entries in the index for files that no longer exist → need to be removed

Run `reg-sync --all` as part of `just check` before every commit.

---

## Listing documents

Human-readable listing of any registry:

```bash
bun scripts/reg-list.ts briefs
bun scripts/reg-list.ts debriefs
bun scripts/reg-list.ts decisions
bun scripts/reg-list.ts playbooks
```

---

## Conventions

### Date semantics

- New documents: creation date
- Updated documents: date of last meaningful change (not auto-format)
- Use `date -r <file> +%Y-%m-%d` (macOS) or `git log -1 --format=%ad --date=short <file>` to confirm

### Summary style

- Imperative mood: "Write post on conceptual entropy reduction" not "Writing post..."
- Specific enough to distinguish from other entries
- No trailing period

### Status values

| Registry | Values |
|----------|--------|
| briefs | `open`, `in_progress`, `done` |
| debriefs | `done` |
| decisions | `Proposed`, `Accepted`, `Superseded` |
| playbooks | `canonical`, `project` |

### No parallel stores

The index is the single source of truth for directory contents. Do not maintain a separate spreadsheet, Notion doc, or other parallel tracking system. If the index is stale, fix the index — don't create a shadow tracker.

---

## Justfile integration

```bash
just reg-sync       # sync all registries
just reg-list       # list all registries
just reg-briefs     # list briefs registry
just reg-debriefs   # list debriefs registry
just reg-decisions  # list decisions registry
just reg-playbooks  # list playbooks registry
```

`just check` includes `bun scripts/reg-sync.ts --all`.

---

## Related

- `playbooks/briefs-playbook.md` — Brief format and process
- `playbooks/debriefs-playbook.md` — Debrief format and process
- `playbooks/decisions-playbook.md` — ADR format and process
- `playbooks/conventions-playbook.md` — Active conventions and barnacle removal