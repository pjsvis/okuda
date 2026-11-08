---
type: ADR
callsign: ADR-GATE-NO-RACE-089
date: 2026-11-08
---

# Decision: A gate does not race its own plumbing

**Date:** 2026-11-08
**Status:** Accepted
**Enforced by:** `scripts/facade-lint.sh` (invariant 1 reads `just --list` with a single `awk` to EOF; no early-exit reader in the pipeline)

## Context

`just check` failed at gate 7/24 — `facade` — with **zero bytes of output** and
exit **141**. Not a facade finding: SIGPIPE, 128+13.

`facade-lint.sh` invariant 1 derived the comment column through

```bash
col=$(just --justfile "$JUSTFILE" --list 2>/dev/null \
  | grep '#' | head -1 | awk '{for(i=1;i<=length($0);i++){…}}')
```

`head -1` reads one line and exits, closing the pipe. `grep` then writes into a
closed pipe, dies of EPIPE, `pipefail` propagates 141, and `set -e` aborts at the
assignment — before any diagnostic, which is the precise signature the script's
own precondition note (lines 26–37) was written to prevent for a *different*
cause. The gate documented one silent abort and then suffered another.

It was not stable, which is worse than being broken. Measured 2026-11-08 on the
same tree, same commit: **12 runs untraced, 12 × 141**; the same command under
`bash -x` passed with `col=29`, because the tracing slowed the producer enough
that `grep` finished writing before `head` closed the read end. The verdict
depended on pipe-buffer occupancy and scheduler timing — not on the facade. The
defect was recorded as *"`facade-lint.sh`'s silent exit 1"* and left unfixed in
the 2026-09-21 debrief; it stayed latent while the justfile was small enough that
`grep`'s output fit the 64 KiB pipe buffer, and surfaced as the facade grew.

## Decision

**A gate's reader never exits early on a pipeline it also gates on. The
derivation is one process reading to EOF.**

```bash
col=$(just --justfile "$JUSTFILE" --list 2>/dev/null | awk '
  !found && index($0, "#") { print index($0, "#"); found = 1 }
')
```

`awk` consumes the whole stream — no EPIPE is possible — and `index($0, "#")` is
the same 1-based column the old character loop computed. Two fewer processes,
no fifo between a quitter and a writer, and the invariant is derived from the
stream rather than from a prefix of it.

## Alternatives Considered

| Alternative | Why Rejected |
|---|---|
| `grep -m1 '#' \| awk '…'` | It works — `grep` still stops early, but its reader (`awk`) reads to EOF, so nothing writes into a closed pipe. Rejected because it keeps a redundant process to select the first line, which `awk` already does while computing the column. The `-m1` flag is a patch on the hazard rather than a removal of it, and the next author to add `\| head` reintroduces the bug |
| Drop `pipefail` around the substitution (`set +o pipefail` … `set -o pipefail`) | It disables the propagation that makes a genuinely failing `just --list` visible. Trading a false abort for a false pass is the worse direction, and it localises the exception to a line that will be copied |
| Keep the pipeline and append `\|\| true` | Masks the abort, and masks every real failure in the same substitution: `col` would silently become empty, which the invariant reads as *"no commented recipes — vacuously in band"*. A gate that silently passes when its derivation fails is the failure `ADR-GATE-NAMES-041` names |
| Assert the exit code and retry the pipeline | A retry around a race is a way of not learning the outcome. It also makes the gate's cost unbounded, and a verdict that changes across retries is not a verdict |

## Consequences

**What became easier:** `just check` is green deterministically — 15/15 untraced
runs at exit 0 — and the gate still catches a real violation (a 8-word recipe
comment appended to the justfile produces the named finding at exit 1). A
verdict about the facade no longer depends on whether a reader lost a race.

**What became harder:** nothing in operation. The discipline is the cost: any
`| head` or `| sed Nq` inside a `set -o pipefail` script is a live abort, and
this tree's gates are shell scripts with `pipefail` on by default.

**Constraints this imposes:** a gate derives from streams it reads to the end, or
closes the writer's input deliberately. An early-exit reader in a gated pipeline
is a defect even when it currently works, because *currently* is a scheduling
property. And a "reported and not fixed" note with no owner is a wish — this one
sat 48 days and cost a session's check run — `AGENTS.md`, Rules of
Engagement 7: a defect recorded as *not fixed here* opens a td task in the same
sitting, because a deferral with no owner is a wish.

## Related

- Brief: `BRF-GATE-RUNS-FILE` (the same sitting's finding; the two are the same class — a verdict that is not a fact about its subject)
- Debrief: `DBF-OS-UPGRADE` (where it was reported and left)
- ADR: `ADR-GATE-NAMES-041` (a gate names its precondition — the silent-abort class)
- ADR: `ADR-GATE-RUNS-FILE-088` (this sitting: the subject is a file)
