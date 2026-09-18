---
type: Playbook
callsign: PLY-REGISTRY
---

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
| `file` | yes | Filename only, relative to the registry directory |
| `date` | yes | ISO date of creation or last meaningful update |
| `status` | yes | Registry-specific state (see below) |
| `summary` | yes | One-sentence description, no trailing period |
| `meta` | no | Registry-specific fields (keep lightweight) |

## Registry-Specific Mappings

| Registry | Index file | `meta` fields |
|----------|------------|---------------|
| **briefs** | `briefs/INDEX.jsonl` | — |
| **debriefs** | `debriefs/INDEX.jsonl` | `adr`, `brief` |
| **decisions** | `decisions/INDEX.jsonl` | `supersedes`, `superseded_by` |
| **playbooks** | `playbooks/REGISTRY.jsonl` | `source` |

Status values per registry: see *Status values* below.

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

- Imperative mood: "Render mermaid fences through the Rust CLI" not "Rendering mermaid fences..."
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

**Read at full strength, this is the silo's knowledge rule too: if it is not in the
silo, it does not exist.** The index is the single source of truth for *contents*;
the silo is the single source of truth for *knowledge*. A principle that lives only
in an agent's private memory file, a chat, or a skill outside the tree cannot be
searched, cited from a brief, reviewed in a PR, or read aloud — so it is not a
record. The test that separates a cache from a shadow store: **can it be deleted and
regenerated from the silo?** If yes it is a cache and may be lossy; if no it is a
shadow store and the knowledge belongs in a document.

---

## Traps

Five ways this machinery misleads. All verified against `scripts/reg-sync.ts`.

- **`summary` is derived once, never re-derived.** It comes from the H1 (title minus
  the `# ` prefix). Retitle a document later and the stored summary goes stale —
  while `just reg-sync` still reports **OK (0 missing, 0 stale)**, because `stale`
  means *the file is gone*, not *the fields changed*. A retitle needs a **hand-edit
  to `INDEX.jsonl`**, then `reg-sync-fix` to regenerate `index.md`.
- **A conflict marker in `INDEX.jsonl` survives the gate.** `reg-sync-fix` *silently
  skips* unparseable lines: the conflicted line is neither reported nor repaired, and
  gets committed. **Fix conflict markers by hand** before running the gate.
- **`deriveStatus` (`scripts/reg-sync.ts:202`) runs only for *missing* entries.** An
  existing entry keeps its stored `status` indefinitely, so a status change in the
  document does not propagate on its own.
- **`**Status:**` must be bare — for briefs only.** `deriveStatus`
  (`scripts/reg-sync.ts:201`) is **tier-specific**, and the difference is the
  branch you are in. For `briefs` it takes the **whole** trimmed remainder of the
  line (`/\*\*Status:\*\*\s*(.+)/`) and looks that string up in a three-key map
  (`open` / `in progress` / `done`), so trailing prose misses the map and falls
  back to **`open`** — a brief written `**Status:** Done (shipped in abc123)` files
  itself as open. For `decisions` the match is **unanchored**
  (`/\*\*Status:\*\*\s*(Proposed|Accepted|Superseded)/i`), so a parenthetical is
  safe: `037-table-cursor` and `038-the-chunk-sequence` both read
  `Accepted (implementation pending — BRF-…)` and both store
  `"status":"Accepted"`. **Read the branch, not the rule.**
- **The key is `file`, not `path`** — filename only, relative to the registry
  directory.

`docs/` is **not a registered tier**. reg-sync covers briefs, debriefs, decisions,
playbooks and advisories; a new document in `docs/` needs no JSONL entry.

---

## Justfile integration

```bash
just reg-sync       # check all registries for drift
just reg-sync-fix   # regenerate indexes from filesystem
just reg-briefs     # list briefs registry
just reg-debriefs   # list debriefs registry
just reg-decisions  # list decisions registry
just reg-playbooks  # list playbooks registry
```

There is no aggregate `just reg-list` recipe — list a specific registry with the `reg-<name>` recipes above (each wraps `bun scripts/reg-list.ts <registry>`).

`just check` includes `bun scripts/reg-sync.ts --all`.

---

## Related

- `playbooks/briefs-playbook.md` — Brief format and process
- `playbooks/debriefs-playbook.md` — Debrief format and process
- `playbooks/decisions-playbook.md` — ADR format and process