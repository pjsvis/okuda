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

### Ordering — the view is recency-first, the store is append-order

`renderIndexDoc` sorts `b.date.localeCompare(a.date)`, so **the generated
`index.md` views are newest-first** and the oldest row sits at the bottom.
`INDEX.jsonl` is the opposite — append order, chronological ascending. Do not
"align" them: the store has no reading order, the view does.

This is not cosmetic. Reading order is what assigns silcrow numbers (ADR-031),
so it decides which pointers the address cap truncates, and **it is what makes
the loss acceptable**: measured 2026-10-07, `briefs/index.md` at 82 rows
assigns 77 addresses and the six rows left without one are exactly the six
oldest (2026-08-25 and 2026-08-27). Newest-first is a guarantee about *which*
pointers die first — never reorder a view without knowing that.

### Silcrow address pressure

The cap applies twice, and discovery binds first. `scanReferences` slices its
hits at `MAX_REFS` (80), then `buildJumpMap` dedupes by target (three briefs
appear a second time inside another row's summary, so 80 occurrences become 77
addresses). The address space — 12–98 minus the reserved repeated-digit class,
80 addresses — is not the binding limit yet (highest assigned: 95). Both will
bind within a handful of documents at the current rate.

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

### Across silos — the seam

The rule above holds *inside* a boundary. Across one it has a harder form: a
silo's gates are exactly as wide as its boundary, so **a cross-boundary write is
unverifiable by construction** — no gate spans a seam.

**Silos communicate by message, never by shared file** (the actor model):

- the **sender** owns the content and publishes it — a copy, a stamp, a message;
- the **receiver** owns its copy, its derived state (registers, manifests) and
  **the commit**;
- the sender **never reaches in**, and never does the receiver's commit.

An inbox — `msgs/from-*/` in a sibling silo — is the mechanism: unregistered, so
a message moves no derived state, and the receiver files it on its own terms. A
**symlink across a seam is shared memory**, not a message: neither side owns the
file, and the receiver inherits the sender's path. A copy is the message.

A crossing **declares itself**. `scripts/protocol-install.sh` is the worked
example: it publishes a copy of `system.md` into `cool-pi-extensions`'s inbox
(`msgs/from-*`) and names the receiver and the commit that is the receiver's —
replacing an earlier version that wrote silently through a two-hop symlink into
another silo and left it dirty.

**Undeclared scope is the defect class, not non-blocking scope.** A gate that
states its limit is not a false signal; one that does not is. (Measured: a
register's drifted content hashes were reported as a gap, and the gate's own
header had declared that check informational in v1.)

See **the seam rule** in `system.md` and `docs/2026-10-10-the-seam.md`.

---

## Admission — the entrance

A document written outside the silo — an agent's reply, an operator's paste, a
foreign export — is written without the context that would make it fit: the
tiers, the playbook, the renderer's actual behaviour. The fit is not a property of
the author, it is a pass somebody runs. The exit has its checklist; the entrance
has four questions, asked in order, and a document can answer 2 to 4 and still be
refused by 1.

| question | checkable | asks |
| --- | --- | --- |
| **1. Tier** | no | Which tier's question does it answer? |
| **2. Register** | partly | Record, addressed, ephemeral? |
| **3. Claims** | yes | Does each claim name its instrument? |
| **4. Carriers** | no | Is it already said by something read? |

The tiers are owned by `playbooks/playbooks-playbook.md`; the registers and their
obligations by `ADR-DOCUMENT-LIFECYCLE-057`.

**A failed tier question is a refusal, not a placement.** A document that answers
no tier's question has not arrived at the wrong address, it has not arrived: a
playbook-shaped essay in `docs/` is an idea or a message wearing a date. Renaming
it into a tier is how the silo acquires a fourth authoring guide.

**The claims question has teeth.** `scripts/date-lint.ts` (name and date agree),
`just prose-check --leaks` (emphasis that survived the render), `just
tables-check` (a table that shatters at 80), `scripts/citation-census.ts`. These
are the built half of the question and none of them reads for *meaning*: a
sentence asserting how the renderer behaves passes every gate and can still be
false, so the trial reads the claims and re-derives them from `src/`.

**The instrument we do not have.** Question 4 is answered by reading, and reading
misses duplicates. Measured 2026-11-24 on one pasted "agent authoring guidelines":
three of its rules were already owned by `playbooks/authoring-playbook.md`, four of
its claims about the renderer were contradicted by `src/`, and it answered no
tier's question. A containment meter — n-gram overlap against the corpus — is
*proposed*, not built; it would find a duplicate's sentences, and no meter finds a
duplicate's claims.

### Imported documents: the original lands first

An imported artefact — signed, official, or merely written by someone without the
silo — is evidence before it is content. Land it **unmodified**, with its landed
date and its `Source:`, then make the edits in a second commit. The diff is the
trial's record: it shows what the silo changed, and therefore what the author
could not have known. Editing in place first destroys the only evidence of the
gap, and *"we tidied it"* is not a claim a stranger can check.

Our own agent, writing in this silo, is edited directly: there is no original
worth preserving, and a two-commit ritual on our own prose is ceremony.

### Where an imported document lands: `docs/new/`

An imported original is committed **as it arrived**, in `docs/new/`
(`ADR-INTAKE-QUARANTINE-094`). The folder is the quarantine register: the path says
*not yet trialled*, so no reader is told a staged file is ours, and the trial has a
queue that can be listed rather than remembered.

**It is not a fifth register.** It is the record register at its first step — a
committed document that owes its landed date and its `Source:`, which is what an
import already owes (`PLY-AUTHORING`, the date-first rule). What `new/` adds is a
verdict pending, and the path is the only place that says so. The word *quarantine*
is already taken by the branch declaration; that one holds a **commit** awaiting a
review, this one holds a **document** awaiting a trial.

**The exit is a move.** Admission is a `git mv` out of `docs/new/` into `docs/`,
keeping the landed date in the name; a refusal deletes the file instead. A move cannot leave two copies, so the drift
hazard that would have needed a meter never arises, and git keeps the original as
received — `ADR-DOCUMENT-LIFECYCLE-057`'s *the operation is a move, not a deletion*,
applied at the entrance.

**The document gates are blind to it on purpose.** A foreign original's faults are
the trial's findings, not the gate's failures, so `scripts/td-id-lint.ts`
(`QUARANTINE`) excludes the folder from the prose, date, census, table, elision and
retired-term scans, and `scripts/html-batch.ts` declines to publish it. Declared in
one predicate because the gates enumerate three ways — a flat walk, `git ls-files`,
and a recursive walk — and an exclusion living in one of them is an accident
waiting for the next refactor.

**The falsifier.** If `docs/new/` holds a file that has been through two sessions
untrialled, the folder has failed as a queue: triage it that sitting, or drop the
folder. A quarantine nobody processes is a skip with better branding.

### The verdicts

- **Accept** — it answers a tier's question, its register is right, its claims are true.
- **Edit-then-accept** — right tier, wrong claims; edit, and cite what proved each edit.
- **Extract-then-delete** — the tier question fails but a sentence survives. It goes into the container that will be read (a playbook entry, an idea in the ledger) and only then is the document removed: the warrant must be *carried*, not named (`ADR-DOCUMENT-LIFECYCLE-057`).
- **Refuse** — nothing survives the reading, and the refusal says why.

## The lifecycle — the exit

The registers, their obligations and the predicates are owned by
`ADR-DOCUMENT-LIFECYCLE-057`. This is the operational how. A silo without it is
monotonic: documents accumulate, and nothing retires.

### Classifying a document

| register | recognised by | owes |
|---|---|---|
| **ephemeral** | lives in `tmp/` (gitignored) | nothing — un-audited by design |
| **record** | committed, dated, no callsign | the date prefix; auditable by path and date |
| **addressed** | a callsign, or a tier's unit | citable, movable, resolvable |
| **retired** | the archive scope (`.archive/…`) | still resolves; out of the work queue |

Zero-effort metadata, curated codes: a script may date a document; only a
decision may name it.

### The retirement checklist

A document is retired only when all four hold:

1. It is **addressed** — it has a callsign, or it is a tier's unit.
2. It is **settled** — the status is done or frozen; the work landed or was refused.
3. Its **warrant is carried** — the Thing it fed states the decisive reasoning,
   not merely the alternative's name.
4. It is **named by the graph** — something cites it, or the keep-class protects it.

Then move it into the archive scope. Do not rename it (a move changes the path,
not the address) and let the resolver find it. A document with no address is never
"archived": it is deleted, or left as a record.

### The keep-class — check it first

Rejections and reversals are never deleted. Before any batch, list the documents
that carry a refusal — `Reverted`, `Rejected`, `Abandoned`, `Superseded`, a park
with a gate — and remove them from the queue. This is not style: the expensive
failure of a knowledge silo is re-deciding.

**Duplicate is not superseded.** A *duplicate*'s content lives verbatim
elsewhere, so deleting it loses nothing — that is a deletion. A *superseded*
document records a decision that was undone — that is the keep-class word, and a
deletion disposition may never borrow it. The vocabulary is closed: the set above
is the set, and filing a deletion under one of its words licenses deleting a
genuine refusal. (Learned the hard way: batch 2's disposition was proposed as
"duplicate/superseded" and refused in review, 2026-10-08.)

**The words flag candidates; they do not settle the class.** `grep -i` for the
set above finds *candidates* for keep-class. It cannot classify a document: a
rhetorical use of "abandoned" or "refuses" is not a disposition, and both were
found in review (batches 1 and 3, 2026-10-08). Keep-class is **read for the
reversal, not matched for the resemblance**, and that needs the sentence around
the token. A keep-class claim in a batch record that rests on a grep is a claim
to refuse.

### Order of operations

1. **Enumerate.** You cannot prune what you cannot list. (`docs/` has no registry
   yet; the uncorroborated names `date-lint` reports are the standing count.)
2. **Derive the reference graph** — which documents are cited by addressed
   documents, and which by nothing. Derived, never judged.
3. **Classify** each record: derivative · rationale-bearing · superseded ·
   imported · scratch.
4. **Retire in batches**, smallest and most obviously derivative first;
   extract-then-delete; a debrief per batch.

### The teeth, and their order

- `scripts/date-lint.ts` — the name's date and the declared date agree (built).
- **Archive-scope consistency** — folder ↔ the registry `archive` flag ↔ the
  status. One authority: the status is the claim, the move is the action, the
  flag is derived (owed; `BRF-DOCUMENT-LIFECYCLE`).
- **Citation census** — a minted callsign that nothing cites and no tier relation
  explains is a demotion candidate (owed; derived from the graph).

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