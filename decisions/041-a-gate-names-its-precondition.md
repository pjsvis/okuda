---
type: ADR
callsign: ADR-GATE-NAMES-041
---

# Decision: A gate names its own precondition — a missing instrument is not a verdict

**Date:** 2026-09-21
**Status:** Accepted

## Context

`scripts/facade-lint.sh` is half of `just check`. It opens by deriving its first
invariant — the comment column — from `just --list`:

```bash
col=$(just --justfile "$JUSTFILE" --list 2>/dev/null \
  | grep '#' | head -1 \
  | awk '{...}')
```

The script sets `set -euo pipefail` at `:18`. On a machine without `just` on
`PATH`, that pipeline's first stage exits `127`, `pipefail` makes the pipeline's
status `127`, and `set -e` aborts the script **before any diagnostic prints**.

Measured: `bash scripts/facade-lint.sh` exits **1 with zero bytes of output**. And
`1` is the script's *violation* code, whose stated contract is *"1 with a named
violation list"*. The list is empty. Nothing is named.

So the gate's failure mode is indistinguishable from a ragged facade. An agent —
whose non-interactive shell does not source `~/.zshrc`, so `just` is absent even
though it is installed at `/opt/homebrew/bin/just` — reads *"the facade is
ragged"* from a run that never looked at the facade. The defect surfaced twice in
one session, and it is the third instance that day of the same shape: **the
instrument, not the artifact.**

## Decision

A gate checks its own preconditions before it computes anything, names the missing
instrument, and exits **2** — a code distinct from the verdict.

`facade-lint.sh` gains an invariant 0: if `just` is not on `PATH`, it says so and
exits 2. `1` keeps its meaning: a named violation list.

## Alternatives Considered

| Alternative | Why Rejected |
|-------------|--------------|
| Drop `pipefail` for that one pipeline | The script already handles an empty `col` *deliberately* — *"No commented recipes — vacuously in band"* — so removing `pipefail` converts the defect into an **exit 0 false pass**. Measured: the same one-liner without `pipefail` reaches the next line and exits 0. Trading a false failure for a false pass is the worse trade |
| Treat an absent `just` as a skip, exit 0 | `signature-check.sh` does exactly this for an absent binary — but there the absence is a *legitimate state* (nothing built yet). Here the absence means **the facade was never checked**, and the invariants are unverified. A skip would report green over an unrun gate |
| Reuse exit 1, with a message | `1` is contracted as *"a named violation list"*. A missing instrument is not a violation, and conflating the two is the defect being repaired, not the repair |
| Install `just` and document it | Does not fix the gate; it fixes one machine. The gate must be honest wherever it runs, including CI |

## Consequences

**What became easier:**

- A gate run without its instrument now produces a *true* statement. The operator
  learns which thing is missing and what to do, in one run.
- The exit code distinguishes **cannot run** from **found violations**, so a
  caller can branch on it. `just check` chains with `&&`, so 2 still fails the
  gate — correctly, because an unrun gate is not a pass.
- The class is now visible: any gate that probes an external instrument must
  guard it first.

**What became harder:**

- There is a third exit state to know. It is worth it: the two states that
  existed were *pass* and *violation*, and neither was true here.
- A new gate recipe has one more thing to get right, and `facade-lint.sh` is the
  template.

**Constraints this imposes:**

- **The asymmetry is the rule.** Skip (exit 0) where the absence is a legitimate
  state — `signature-check.sh` on an unbuilt binary, `codesign` on a non-macOS
  host. **Halt (exit 2) where the absence means the check did not happen.**
  Choosing the wrong side is either a false pass or a false alarm.
- The guard must stay **before** the probe it protects. A guard placed after it is
  unreachable, because `set -e` has already aborted.

## Notes

- **This was recorded before it was fixed, and that is the point.** ADR-040's
  Notes list it under *"Not fixed here"*, and
  `docs/2026-09-21-the-model-beside-the-loop.md` §*A defect in the gate itself*
  names both readings and defers the choice. Deferring was correct — the choice is
  a decision about what a gate owes the operator, not a bug fix. Landing the
  documentation without the repair would have traded a visible defect for an
  invisible one.
- **The first reading was the tempting one and it was wrong.** *"Do not use
  `pipefail` to guard a probe you can survive"* is a true sentence about
  `pipefail`, and it produces the false pass. The instrument was missing, and no
  rearrangement of the pipeline can make that true.
- **The reader's `just check` was never affected.** For an interactive shell
  `just` is present, so this is an agent-and-CI-facing repair. That does not make
  it cosmetic: the gate exists to be run by whoever is verifying, and the verifier
  was being lied to.

## Related

- Note: `docs/2026-09-21-the-model-beside-the-loop.md` — §*A defect in the gate itself*, the two readings, and the measurement
- ADR: `ADR-BUILD-SIGNS-040` — the sibling decision, which recorded this defect as out of scope
- Instrument: `scripts/signature-check.sh` — the precedent, and the other half of the asymmetry
- Playbook: `PLY-JUSTFILE` — the gate's four invariants, and the absent-`just` trap
- Dependency: `DEPENDENCIES.md` — *"An artifact's precondition is a dependency too"*
