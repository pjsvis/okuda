---
type: Brief
callsign: BRF-GATE-RUNS-FILE
date: 2026-11-08
---

# Brief: The gate runs the file it checked

**Created:** 2026-11-08
**Status:** Open

## Lineage

The observation, 2026-11-08: `just build` failed at `cahier-build` with

```
signature-check: FAIL — cahier does not execute (exit 127)
  scripts/signature-check.sh: line 59: cahier: command not found
```

against a binary that compiled and ran. `./cahier --version` → `cahier (2398aa0)`,
exit 0. The artifact was innocent and the instrument accused it — in the same
breath recommending *"rebuild and read the compile output"*, which is advice to
re-examine the one component that was already correct.

## Objective

Make `scripts/signature-check.sh` execute the file it verified, so its verdict is
about the bytes it read; and make `just check` exercise it for both shipped
binaries rather than one.

## The defect, precisely

The script takes a `PATH` and executes a `NAME`:

| Line | Statement | Resolves as |
|---|---|---|
| `signature-check.sh:47` | `[ -f "$BIN" ]` | a path — the file `./cahier` |
| `signature-check.sh:59` | `out=$("$BIN" --version 2>&1)` | a command — bash searches `$PATH` |

The header at `signature-check.sh:39` documents `[path-to-binary]`; the exec
behaves as `[command-name]`. `$PATH` holds `~/.local/bin`, and
`~/.local/bin/cahier` does not exist — `just install` was never run for it — so
bash found nothing and returned 127. Bash's `command not found` on stderr was
then read by the script as the artifact refusing to execute, and reported in the
artifact's voice.

## Why it stayed latent

`okuda` passes by coincidence: `~/.local/bin/okuda` is a symlink to
`$(pwd)/okuda`, so `$PATH` happens to land on the bytes just verified. Neither
binary's verdict has ever depended on that — one of them silently depended on
*not* having been installed.

The coincidence hides the worse mode. Were `~/.local/bin/okuda` a **copy**
rather than a symlink, the gate would verify the fresh `./okuda`, execute the
stale copy, and print

```
signature-check: OK — okuda executes (ELF has no code signature): okuda (5f59b8c)
```

— a green verdict over a file it never touched, with the contradicting SHA
printed inside its own success line and read by nobody. That is the failure this
brief exists to prevent, and it is invisible from a green run.

## Scope

**In:** the one-line normalisation in `signature-check.sh`; the caveat recorded
beside it; `scripts/gates.sh` running the signature gate over `okuda` **and**
`cahier`; the correction of `BRF-CAHIER-BINARY`'s acceptance line, which recorded
an unsatisfiable criterion as met.

**Out:** teaching the gate to compare stamps against `HEAD` — `scripts/fresh.sh:42`
already owns *"is this the commit"* via `BIN="$REPO/$name"`, and a second copy of a
fact another instrument keeps exact is what `ADR-LINE-IS-PROSE-078` refuses. Also
out: a unit-test harness for the bash gates. None exists (`tests/` holds no test
that spawns a shell gate) and introducing one is a new pattern owing its own
decision, not a rider on a defect fix.

## The two things this must not do

- **Not a test of the artifact.** The gate's precondition — an ELF executes — is
  correct and was correct throughout. The repair leaves that branch untouched. A
  repair that softened the exec probe would trade a false negative for a false
  positive, which is worse: it would let a genuinely unrunnable binary through.
- **Not a change in what the gate asserts.** The message keeps saying *"a build
  that compiles and cannot run is the artefact nobody checked"*, because after the
  normalisation that sentence is finally true — a 127 can no longer be produced by
  the script's own lookup.

## Work Plan

1. [ ] `scripts/signature-check.sh`: normalise `BIN` to a path after the
       existence check (`case` on `/*|*/*`), with the reason in the comment.
2. [ ] `scripts/gates.sh`: the `signature` row runs both binaries.
3. [ ] `briefs/2026-11-05-brief-cahier-binary.md`: acceptance line 62 corrected
       to the invocation that actually works, with the reason it read green.
4. [ ] ADR: `ADR-GATE-RUNS-FILE-088` — a gate's subject is a file, not a name.
5. [ ] Prove it: `bash scripts/signature-check.sh cahier` from the repo root, with
       `cahier` absent from `$PATH`, exits 0 and names the path it ran.

## Acceptance Criteria

- `bash scripts/signature-check.sh cahier` — bare name, no `just install` — exits
  0 and prints the path it executed.
- The verdict line names the file that was run: `OK — ./cahier executes`.
- `just check` verifies both binaries (two verdict lines, or two skips on a fresh
  clone — an absent binary remains a legitimate state, exit 0).
- `just build` completes and `just fresh` follows once `just install` runs.
- `just check` green.

## Notes

**The class, not the instance.** This is the third gate whose *subject* was
ambiguous, after `ADR-GATE-NAMES-041` (a gate names its precondition) and
`ADR-GATE-TWO-RENDERS-085` (a gate names itself). The first two fixed what the
gate said; this one fixes what it acted on. A gate is a claim about a file, and a
file is a path — anything that takes a path in its tests and a name in its
effects has two subjects, and reports on the wrong one.
