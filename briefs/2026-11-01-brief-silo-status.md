---
type: Brief
callsign: BRF-SILO-STATUS
date: 2026-11-01
---

# Brief: Silo status — the vitals get a machine face, and a suite gets a status line

**Date:** 2026-11-01
**Status:** In Progress
**TD:** td-ab59c0

---

## Context

The silo already derives its vitals to stdout, and one document says exactly
what is missing: *"the silo already derives its vitals to stdout; what is
missing is a frame that does not scroll away"*
(`docs/2026-10-28-the-instrument-frame.md:196-197`), where `bash scripts/orient.sh`
is listed as the first source, *"six lines, already a frame"*
(`docs/2026-10-28-the-instrument-frame.md:188`). A host can now be that frame.

Herdr keeps its agents in `herdr-core` and derives each tab's state from one
line of OSC 7501 — `state=blocked` is the state that means *this one needs you*
(herdr.dev, and the app's own `herdr.d.ts:79`, where `Status` is
`working | blocked | done | idle`). Nothing in the silo emits it, so the host
cannot say which silo is waiting on a person: the one fact the loop's owner
needs most is the one the repository already holds and does not publish.

## Warrant

Operator call — the riff recorded 2026-11-01 (this session): exploit the host,
refuse the bootstrapper, and start with the reading rather than the view. A
brief without a ledger entry is a choice, and this is the choice: the warrant is
the operator's, not a staged idea (`ADR-IDEA-LEDGER-064`).

## Objective

Give the orient derivation a second render (JSON) and give the suite a
status line built from it — emitting only the three states a repository can
evidence, and never `working`.

## Evidence

Measured 2026-11-01, in this silo.

| What | Reading | Why it gates the design |
|---|---|---|
| `scripts/orient.sh` | 83 lines, read-only by contract — *"no writes, no builds"* (`scripts/orient.sh:22`) | one derivation, so `--json` is a render and not a second implementation |
| text output vs port | `diff` of the shell and the TS render, same state | byte-identical: the frame is not retrained |
| `td status --json` | `in_review.total` present, `0` today; no in-progress bucket | the one reviewable signal that means *a person must decide* |
| `herdr.d.ts:79` | `Status = working \| blocked \| done \| idle` | the vocabulary the host reads; four states, three payable here |
| `scripts/brief-queue.ts:9-10` | the table disagreed with the registries in 20 rows | the standing example of a status line that lies |

## Scope

**In:**
- `scripts/orient.ts` — the derivation, with `renderOrientText` and a JSON render.
- `scripts/orient.sh` — reduced to a shim, so `bash scripts/orient.sh` and
  `just orient` behave exactly as before.
- `scripts/silo-status.ts` — `siloState` (pure), `statusLine` (the OSC sequence),
  and the CLI.
- `tests/silo-status.test.ts` — the mapping table, the wire, the render.
- `justfile` — one `silo-status` recipe.
- The registry entry for this brief.

**Out:**
- **The host view.** A mod-only tab, the install recipe and the seam
  declaration are a separate deliverable with its own brief. The app's config
  directory (`~/.config/herdr-app`) is not written by this work at all.
- `templates/silo/scripts/orient.sh` — the day-1 edition is deliberately a
  different file (it counts `*.md`, not registry rows, so a stamped silo with
  no corpus reports zeros instead of dying). It is not a mirror of this one.
- A second signal source. `brief-queue`'s decide-queue defects are the obvious
  next input; they are noted, not wired.

## Preconditions

- [x] `git pull --ff-only` — the branch is not behind (it was 2 behind on
      arrival; reconciled before branching, per ADR-DOCS-DIRECT-060).
- [x] `bun` present and the test suite green (958 pass before the change).
- [x] The pre-port text render captured, so the port can be diffed rather than
      trusted.

## Work Plan

1. [x] `scripts/orient.ts`: the derivation and the text render, ported from the
       shell line by line.
2. [x] `scripts/orient.sh`: the shim; diff the two renders on the same state.
3. [x] `scripts/silo-status.ts`: the pure mapping, the wire, the CLI.
4. [x] `tests/silo-status.test.ts`: the table, the prohibition, the wire.
5. [x] `justfile`: the `silo-status` recipe.
6. [x] Registry entry, `just check`, debrief.

## Acceptance Criteria

1. `bun scripts/orient.ts` prints output **byte-identical** to the pre-port
   `scripts/orient.sh` for the same repository state — verified by `diff`.
2. `bash scripts/orient.sh` still works, and `bash scripts/orient.sh --json`
   prints one JSON object carrying `branch, detached, upstream, fetch, ahead,
   behind, changed, head, binary, docs`.
3. `bun scripts/silo-status.ts` writes exactly one OSC 7501 sequence —
   `ESC ] 7501 ; state=<s> : app=silo ESC \` — with no trailing newline.
4. `siloState` is pure, and its table test covers `blocked` (detached, behind,
   reviews), `done`, and `idle`.
5. **No input yields `working`** — asserted over the full grid of the fields the
   mapping reads, with a control that the grid exercises all three payable
   states.
6. An unreadable `td` yields `inReview: null`, and `null` never produces `done`.
7. `just silo-status` prints the reading as one line, with no escape sequence.
8. `just check` passes; `just --list` shows `silo-status` under navigation.

## Notes

- **`working` is not derivable, and the design says so rather than guessing.** A
  dirty tree is evidence of an edit, not of an agent at work; unpushed commits
  are evidence of a chore. An agent that is working emits its own line — it is
  the only observer holding the fact. Claiming `working` from a clean-looking
  repository would be an unpaid claim in the host's sidebar, which is the worst
  place for one: the sidebar is what saves you from opening the tab.
- **The decision the brief does not take: what a chore is worth.** `ahead`,
  `changed` and `binary stale` are chores — they put the suite at `idle`, not
  `blocked`, because nobody's judgement is needed to do them. If the operator
  wants unpushed work to shout, that is a one-line change in `siloState` and a
  row in the table test; it is not a change to the derivation.
- **The next input.** `bun scripts/brief-queue.ts --gate` already exits 1 on a
  decide-queue defect (MOVE / DISAGREE / PHANTOM). That is a second source of
  `blocked`, and it costs one subprocess. Deferred, because the emitter is meant
  to fit inside a host's short exec budget and one signal is enough to prove the
  shape.
- **Why the wire is the default and the reading is the flag.** A pipe must carry
  the sequence and nothing else; a person has `just silo-status`, which is the
  reading without the escape. The inverse — text by default — would make the
  host parse prose, which is how a status line becomes a small parser nobody
  tests.
