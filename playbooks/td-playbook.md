---
type: Playbook
callsign: PLY-TD
---

# TD Playbook

> How to work on this project using `td` for task management. Verified against td v0.61.0 — when the binary and docs disagree, the binary wins. Re-verify on version bump.

## Session Startup

At the start of every session:

```bash
just orient              # branch, git status, last commit, registries
td usage --new-session   # new session identity; see current state + open work
```

Name the session if the auto-detected identity is opaque (review independence is session-scoped, and unnamed sessions are hard to read in the audit trail):

```bash
td whoami                # current session identity
td session "feature-work"  # label the current session
td session --new         # force a new session at context start (not mid-work — bypasses review)
```

`td usage` shows focused work, pending reviews, and open issues. Use `--new-session` only at conversation start or after `/clear` — forcing a new session mid-work bypasses the review-separation that gives the audit trail meaning.

## Claiming Work

Before editing a file, claim its task:

```bash
td start td-abc123       # begin work; sets status to in_progress, records this session as implementer
td log "started"         # log progress
```

To track what you're looking at without formally starting (and without claiming implementer status):

```bash
td focus td-abc123       # set current focus; does not change status
```

If the task is already claimed by another session, comment requesting handover:

```bash
td comment td-abc123 "I'd like to work on this — can you handoff?"
```

## Progress Logging

After substantive changes, log progress. **Use the structured flags** — they build the timeline future sessions read to avoid re-litigating decisions and to surface blockers:

```bash
td log "implemented the mermaid piping"                    # plain progress
td log --decision "piping per-fence, not pre-parsing"     # a choice and why
td log --blocker "mermaid-to-md segfaults on empty input" # something is in the way
td log --hypothesis "the segfault is a stdin EOF race"    # a guess to test
td log --tried "in-process parse — too complex, reverted" # an abandoned approach
td log --result "benchmarks show 2ms per fence"           # a measured outcome
```

Logs attach to the focused issue. The decision/blocker/hypothesis/tried/result types are what make the timeline worth reading — plain-text logs alone leave the next session to re-derive your reasoning.

## Handoffs

Handoffs are td's key feature: structured state so the next session resumes without guessing. **All four fields** is the standard, not two:

```bash
td handoff td-abc123 \
  --done "mermaid piping, loose lists" \
  --remaining "loose tables, --watch mode" \
  --decision "pipe per-fence via stdin, not pre-parse" \
  --uncertain "should --watch clear screen or scroll?"
```

Each field serves a purpose:

| Field | Purpose |
|------|---------|
| `--done` | What was completed this session |
| `--remaining` | What still needs to be done |
| `--decision` | Choices made and why (prevents re-litigating) |
| `--uncertain` | Open questions for the next session to resolve |

Each flag is repeatable; stdin and `@file` forms also work (see `td handoff --help`). A handoff with only `--done`/`--remaining` loses decisions and open questions — the exact failure handoffs exist to prevent.

## Pre-Commit Gate

Before every commit:

```bash
just check
```

## Ending Work

Capture context, then submit for review:

```bash
td handoff td-abc123 --done "..." --remaining "..." --decision "..." --uncertain "..."
td review td-abc123      # status -> in_review; records this session as review-requester
```

`td review` auto-creates a minimal handoff if you didn't — but a real handoff is better documentation. For epics/parent issues, review cascades to open/in_progress descendants automatically.

## The Wrap-Up Protocol — the merge ritual ends at closure, not commit

Moving fast makes the tidy-up **more** important, not less: velocity without
closure manufactures false state — done-but-open issues, Open briefs for shipped
code, merged branches wearing live-work costumes. The 2026-10-03 audit
(`debriefs/2026-10-03-debrief-registry-truth.md`) found all three species; this
protocol is the fix. A unit of work is not finished when the commit lands.
Finish it, all in the same sitting, while the facts are still in the head:

1. **Merge/commit — and push** — the change is in `origin/main`, or parked on a
   branch *deliberately*. Unpushed main is a private branch wearing main's costume
   (the containment session's slip, 2026-10-03: committed, gate green, invisible).
2. **td** — implemented work: `td review` → `td approve` (independent session where
   practical). Parked work: `td close --reason "parked — <what landed>, <what
   remains>, refile from <brief>"`. Never leave `in_progress` with no session
   behind it — that state is a lie.
3. **Brief** — flip Status to match reality: `Done — shipped <date> (<sha> …)` or
   `Parked — gated on <gate>`. A brief that lies about its own state is decorated
   Stuff. Cite callsigns and SHAs here, never td IDs — see The One-Way Valve below.
4. **Branch** — merged into main? Prune it, local *and* remote. Parked work keeps
   its branch and says so in the brief.
5. **Debrief** when the work was significant — the debrief is where "this is the
   current state" gets said out loud.

## The One-Way Valve — td is local; callsigns are the citation

td's database (`.todos/`, gitignored as *runtime state*) never leaves this
machine. Everything it holds is ephemeral: today's IDs, this terminal's
sessions, the work-in-flight ledger. The silo's persistent identity lives in
callsigns (`BRF-*`, `DBF-*`, `ADR-*`, `ADV-*`) and commit SHAs — both resolve
from the repo itself, for any clone, any session, any year. Two identity
systems, two buses, one rule (codified 2026-10-02, after an audit found 61
commit messages and ~30 documents citing IDs that nothing outside this
machine can resolve):

> **The ephemeral may cite the persistent; the persistent never cites the
> ephemeral.**

- **td IDs never appear in persisted documents** — briefs, debriefs, ADRs,
  advisories, playbooks, registry entries. A td reference there is a dangling
  pointer for every reader who is not this machine, this week. Cite the
  callsign; if there is no callsign, there is nothing to cite.
- **Commit messages carry callsigns, not td IDs.** Commits are pushed; a
  `(td-XXXXXX)` suffix resolves to nothing on GitHub. `(BRF-DEMO-SANDBOX)` carries
  the same lineage and resolves forever.
- **The valve's direction:** a td issue's body pointing at a brief is correct
  and encouraged — the disposable layer references the durable one freely.
  The reverse is the violation.
- **The residue is inert, not rewritten.** Debriefs are frozen by their own
  playbook, and commit history is never force-pushed for hygiene. The rule
  governs everything written from codification forward.

### The Callsign Checksum — the valve's sibling over the citation namespace

Callsigns are the persistent identity, so they get the persistent gate
(BRF-CALLSIGN-CHECKSUM, sibling of the td-ID lint above, sharing its scan
set and verdicts):

- **Every callsign cited in a persisted document resolves** — through the
  product's own resolver (`resolveByCallsign`: exact-or-ordinal,
  unique-match-or-null), never a second semantics. A lint stricter than the
  product would flag working jumps.
- **The unpushed message range is checked too** (`origin/main..HEAD`):
  both td IDs and unresolvable callsigns in commit messages fail `just
  check` — the range is exactly where amending is still cheap. Three
  self-caught strikes on one day built this.
- **The baseline grandfathers the census residue** (placeholders, dead
  names, documented forward references) and may only shrink: under-count
  prints the prune remedy (`--write-baseline`). A forward reference
  self-heals when its document lands — the ratchet, not an allowance.

## Review Workflow

**td enforces separation: the session that implemented cannot approve its own work.** This is the audit trail's spine — don't defeat it by spinning up a new session merely to look independent; use an genuinely separate context or acknowledge a trusted self-review.

### As reviewer

```bash
td reviewable                       # issues in_review that this session can independently review
td reviewable --include-approved    # also show reviewed issues you can close (delegated/trusted close)
td context td-abc123                # read the handoff and full issue state
td files td-abc123                  # files linked to the issue + change status
```

**Prove every acceptance criterion at the bite — the negative ones
first.** A claim true of the design can be false of the code path, and the
box gets checked anyway (2026-10-02, three in one day: a parent ADR
teaching repealed law, a comment claiming a handback only headings
implement, an acceptance box saying the shrink note fires while an
early-`continue` skipped it — *asserted, not enacted*). Violations get
proved by everyone; silence, decay, and absence get proved by no one
unless the reviewer does. Reproduce the failure mode, watch the gate
catch it, watch it pass when the condition clears — the day's every
review found one true thing, and each one was found at the glass, not in
the handoff.

### Approve (close) or reject

```bash
td approve td-abc123                # approve + close in one step (independent reviewer)
td reject td-abc123 --reason "missing error handling on empty input"   # back to open
```

Rejection returns the issue to `open` (re-pickable) with the reason attached, so the implementer knows what to fix.

### Trusted mode (okuda's default — `review_policy_mode=trusted`)

When you implemented the work yourself and cannot get an independent review, trusted mode asks you to say who reviewed it. Both forms are audited; naming a reviewer who did not review is worse than an honest self-review because it reads as independent in the trail.

```bash
# A different session/sub-agent reviewed it — credit them (no --reason required)
td approve td-abc123 --reviewed-by "code-reviewer sub-agent"

# You reviewed your own work — say so (requires --reason)
td approve td-abc123 --self-review --reason "reviewed own diff; just check green"
```

### Record-only (orchestrator pattern)

For orchestrator flows where a reviewer sub-agent attests and the orchestrator closes later — two steps:

```bash
td approve td-abc123 --record-only --reason "diff reviewed, tests pass"   # reviewer records
td approve td-abc123 --reason "closing after recorded independent approval" # any session closes
```

A reviewer can also record a non-approving decision:

```bash
td approve td-abc123 --record-only --decision changes_requested --reason "fix X"
```

### Other review policy modes

td exposes four modes via `review_policy_mode` (`trusted` default, `delegated`, `strict`, `balanced`). okuda runs `trusted`. See the core-workflow docs for switching; the legacy `balanced_review_policy` flag is deprecated — use `review_policy_mode=balanced` instead.

## Branch Hygiene

- **Never commit directly to `main`** — branch `feat/<name>` first
- **One logical change per commit** — all files that must change together, no more
- **Run `just check`** before every commit
- **Fail-fast** — small change → `just check` → commit or revert; stuck >15 min: stop, revert, ask

## Issue Lifecycle

```
open --> in_progress --> in_review --> closed
              |              |
              v              | (reject)
          blocked -----------+
```

- **open** — created, not yet started
- **in_progress** — actively being worked (`td start`)
- **blocked** — waiting on a dependency (`td block`; auto-unblocks when deps close)
- **in_review** — implementation complete, awaiting review (`td review`)
- **closed** — approved and done (`td approve`)

Rejection sends an issue back to `open` with a reason attached.

## Common Commands

```bash
td current              # what you're working on
td list                 # all open issues
td list --status in_review   # in-flight review queue
td next                 # highest priority open issue
td context td-abc123    # full context for an issue (handoff + state)
td focus td-abc123      # set focus without starting
td reviewable           # issues you can independently review
td ready                # open issues by priority
td blocked              # blocked issues
td critical-path        # sequence that unblocks the most work
```

### Multi-issue work sessions

Group related issues under one work session — shared logging, shared handoff, cross-session continuity:

```bash
td ws start "Auth refactor"   # start a named work session
td ws tag td-abc123 td-def456 # tag issues (auto-starts open ones)
td ws log "shared migration"  # log to all tagged issues
td ws handoff                 # handoff all tagged issues, end session
td ws current                 # current work-session state
td ws end                     # end without handoff
```

### Epics (hierarchy, not continuity)

`td epic create` models a parent/child hierarchy for reporting and tree visualization — *not* session continuity. For phased work that spans sessions, prefer `td ws` (above); use epics when you need a reporting umbrella over issues that may be worked independently.

## Related

- `AGENTS.md` — project identity and rules of engagement
- `playbooks/briefs-playbook.md` — how work is proposed
- `playbooks/decisions-playbook.md` — where mid-execution choices go (ADR + palimpsest protocol)
