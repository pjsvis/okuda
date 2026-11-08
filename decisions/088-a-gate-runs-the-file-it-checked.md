---
type: ADR
callsign: ADR-GATE-RUNS-FILE-088
date: 2026-11-08
---

# Decision: A gate runs the file it checked

**Date:** 2026-11-08
**Status:** Accepted
**Enforced by:** `scripts/signature-check.sh` (the `case` that normalises `$BIN` to a path before any execution) and `scripts/gates.sh` (the `signature` row names both binaries)

## Context

`scripts/signature-check.sh` was given a binary and told the truth about it. On
2026-11-08 it reported

```
signature-check: FAIL — cahier does not execute (exit 127)
  A build that compiles and cannot run is the artefact nobody checked.
  scripts/signature-check.sh: line 59: cahier: command not found
```

about a binary that compiled and ran, and whose own `--version` answered
`cahier (2398aa0)` at `HEAD`.

The script tested a **path** and executed a **name**.
`signature-check.sh:47` asks `[ -f "$BIN" ]`, a filesystem question about
`./cahier`; `signature-check.sh:59` runs `"$BIN" --version`, a **command
position**, so bash searched `$PATH` for `cahier`, found nothing (`just install`
had never linked it), and said so on stderr. The script read bash's `command not
found` as the artifact's own refusal, printed it in the artifact's voice, and
pointed the reader at `just build`. The remedy reproduced the failure.

The gate had been green for `okuda` since `ADR-BUILD-SIGNS-040` because
`~/.local/bin/okuda` symlinks back to `$(pwd)/okuda`, so `$PATH` landed on the
verified bytes. One binary passed on an accident; the other failed on the
accident's absence. Neither verdict was ever a fact about its subject.

`scripts/fresh.sh:27` had the right shape all along — `BIN="$REPO/$name"`, a path,
executed as a path — and its own wording (*"PATH resolves to this repo"*) says the
link question is *its* question, answered separately.

## Decision

**A gate that is given a binary is given a path; it normalises that path to a
named file and executes nothing else. And the runner names every binary it means
to cover.**

- **The subject is the file, and the file is a path.** `signature-check.sh`
  rewrites a bare `BIN` to `./$BIN` immediately after the existence check, so
  every later use — the magic read, the exec probe, the `codesign` call — refers
  to the one file that was tested. No `$PATH` lookup can enter.
- **The verdict names the path it ran.** `OK — ./cahier executes` names the
  bytes. A suffix on the name is the price of the subject being unambiguous, and
  it is the cheapest possible instance of the rule.
- **A gate's default is not coverage.** `gates.sh` ran the row with no argument,
  and the default is `okuda`, so `just check` never verified `cahier` at all. The
  row now names both. Two verdict lines are two claims; one default was a claim
  about a half.
- **The remedy must be the next action.** The failure text keeps its content —
  *a build that compiles and cannot run is the artefact nobody checked* — because
  after the normalisation it is true: a 127 can no longer be manufactured by the
  script's own lookup. A remedy that sends the reader back to a correct component
  is worse than silence; it spends the attention the gate was built to protect.
- **The gate does not grow a second question.** Stamp-versus-`HEAD` belongs to
  `scripts/fresh.sh`. The moment `signature-check` asks it too, the tree holds two
  readings of one fact and they will disagree (`ADR-LINE-IS-PROSE-078`).

## Alternatives Considered

| Alternative | Why Rejected |
|---|---|
| Resolve `BIN` through `command -v` and verify *that* file | It blesses the ambiguity: the gate would verify whatever `$PATH` happened to hold, which is precisely the stale-copy mode. The verdict must be about the file the recipe just built, not the file the operator's shell happens to prefer |
| Require the caller to pass a path and refuse a bare name (`exit 2`) | Honest, but it pushes a one-line normalisation onto every call site — `signature-check.sh`, `build`, `cahier-build`, `gates.sh`, and any future host — and the shell already distinguishes the two forms cheaply and locally. Refusing is the right answer when the meaning is genuinely ambiguous; here `./name` is the only sane reading of a name that passed `[ -f ]` |
| Have `signature-check.sh` loop over all binaries itself | Then the gate owns a roster, and the roster is the release manifest's (`scripts/family.ts`, `scripts/platform-packages.ts`). A second list of binaries in a gate disagrees with the first the day one is added. The runner names its rows; the gate judges one file |
| Add exit-127 special-casing, reporting *"the command was not found"* distinctly | It narrates the bug instead of removing it. After normalisation a 127 can only mean the file is not executable or its interpreter is missing — an artifact defect, which is exactly what the message already says |
| Unit-test the bash gates to catch this class | No bash gate in `tests/` is spawned by a test; introducing that harness is a new pattern owing its own decision. The instrument here is the normalisation, which removes the two-subject state rather than watching for it |

## Consequences

**What became easier:** a signature verdict is a fact about a file — the one the
recipe wrote. `just build` completes on a Linux host without `just install` running
first, which is the order a build should work in. `just check` covers both shipped
binaries, so a `cahier` that stops executing is now caught by the check rather
than by a release.

**What became harder:** nothing operational — one `case` statement. The harder
part is the habit: when a gate takes an argument, decide whether the argument is a
path or a name **before** writing the first line that uses it, because the two
answers look identical until `$PATH` disagrees.

**Constraints this imposes:** a gate given a path executes that path and no other.
A verdict names the file it judged. A gate roster lives in `gates.sh`, where the
rows are visible, never inside a gate. And when a gate's message recommends an
action, the recommendation is part of the message's contract — it must be the
action that follows from the finding.

## Related

- Brief: `BRF-GATE-RUNS-FILE`
- ADR: `ADR-BUILD-SIGNS-040` (the gate, and the format dispatch this touches)
- ADR: `ADR-GATE-NAMES-041` (a gate names its precondition — the same family: the gate's *subject* was unstated)
- ADR: `ADR-GATE-TWO-RENDERS-085` (a gate names itself — the first half of the same family)
- ADR: `ADR-LINE-IS-PROSE-078` (one fact, one instrument)
- Brief: `BRF-CAHIER-BINARY` (whose acceptance line this corrects)
