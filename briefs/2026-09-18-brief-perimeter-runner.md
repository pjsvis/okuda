---
type: Brief
callsign: BRF-PERIMETER-RUNNER
date: 2026-09-18
---

# Brief: The perimeter runner — the tuning recipes and their artifacts leave the task runner

**Created:** 2026-09-18
**Status:** Open
**Lineage:** ADR-PERIMETER-039 and the measurement in `docs/2026-09-18-a-perimeter-not-a-project.md` — `[moira]` is the largest group in okuda's task runner at 28 recipes, and 22 of them touch nothing of okuda's
**Extends:** `BRF-PERIMETER-GATE` — that brief ships the report; this one drives its count to zero and flips it.

## Objective

Move the 25 `[moira]` recipes that do not invoke the okuda binary, and the artifacts they
read, into the sibling silo `../speak-md/`, leaving okuda's task runner carrying only its
own render→speak seam.

## Scope

**In:** the 25 recipes, the `tmp/` artifacts they read and write, the `[moira]` group's
name, and the flip of `just moira-check` from report to gate.

**Out:** any document, playbook, brief or ADR — those are `BRF-PERIMETER-SILO`. Also out:
the three recipes that stay (`tts`, `tts-rate`, `speech`), and the report's own
implementation, which `BRF-PERIMETER-GATE` lands.

## Preconditions

- [x] `BRF-PERIMETER-GATE` has landed and `just moira-check` prints 25. **Verified
      2026-09-18** by the census that sized this brief; re-verify at execution.
- [x] `../speak-md/` exists as a sibling silo with its own `justfile`, `just check` and
      `tmp/`. **Verified 2026-09-18.**
- [x] `../speak-md/justfile`'s `demo` recipe already invokes across the silo boundary
      from inside okuda (`just -f ~/Dev/GitHub/speak-md/justfile demo NOW.md`) and lands
      its artifacts in the sibling's `tmp/`. **Verified 2026-09-18** — this is the
      pattern the moved recipes adopt.
- [x] The `justfile` carries no uncommitted hunk from another session. **Verified
      2026-09-18** — `git status --short` shows the registry pair only.

## Work Plan

1. [ ] Inventory the 25 recipes and, for each, the files it reads. Most read a passage
       from `tmp/` (`tmp/roofscape-probe.md`, `tmp/aunt-passage.md`,
       `tmp/register-passage.md`, `tmp/poet-probe.md`, `tmp/brf-probe.md`,
       `tmp/rev-probe.md`, `tmp/he-fix.md`, `tmp/latin-probe.md`); three read a document
       that is okuda's today (`docs/2026-09-10-moira-prosody-probe-rendered.txt`,
       `docs/2026-09-10-moira-showcase.md`, `docs/2026-09-10-user-commendations.md`).
2. [ ] Move the recipes into `../speak-md/justfile`. Keep the recipe names — they are the
       silo's tuning lexicon and they are already referenced by ear, not by path.
3. [ ] Move the passages and the flat artifacts into `../speak-md/tmp/`. Run
       `../speak-md/just check` and confirm the golden and probe goldens still pass —
       `speak-md`'s rule 4 puts every run artifact in its own `tmp/`, never `/tmp`.
4. [ ] Re-point the three recipes that read an okuda document at the copy that now lives
       in the sibling's `tmp/`. `moira-commendation` reads
       `docs/2026-09-10-user-commendations.md`; that document is a patron wall about the
       corpus, so it moves too, and the recipe's path follows.
5. [ ] Rename the group. `[group('moira')]` names a cast; what remains is okuda's
       render→speak seam. Name it for the seam.
6. [ ] Flip `just moira-check` from report to gate: a non-zero count fails `just check`.
       Record the flip in the script's header, because the script's exit code is the
       whole difference between the two modes.
7. [ ] Sweep okuda's silo for references to the moved paths. `playbooks/ear-playbook.md`
       names `just moira-*` in its pipeline section — that line is
       `BRF-PERIMETER-SILO`'s, and this brief reports it rather than editing it.
8. [ ] Confirm the removal leaves no orphan: `just --list` shows no recipe whose target
       is missing.

## Acceptance Criteria

- `just moira-check` prints a count of **0**.
- `just moira-check` is a **gate**: a non-zero count exits non-zero and fails `just check`.
- okuda's `[moira]`-equivalent group holds exactly three recipes: `tts`, `tts-rate`,
  `speech`.
- Every moved recipe runs from `../speak-md/justfile`, and `../speak-md/just check` is
  green after the move.
- okuda's `tmp/` holds no speech artifact — no `audition-*`, `aunt-*`, `roofscape-*`,
  `*-flat.txt` or probe passage.
- `just check` is green in okuda, and `just test` passes.
- No recipe in okuda's `justfile` reads a path under `../speak-md/` other than the
  explicit cross-silo invocation form.

## Notes

**The recipes are not deleted, they are relocated.** `../speak-md/` is a sibling silo,
not a subordinate, and its `justfile` is where the tuning loop belongs. The cross-silo
invocation pattern is already proven by `speak-md`'s `demo` recipe, which is written to
be called from inside okuda and to leave its artifacts in its own `tmp/`.

**The artifacts are the half that gets forgotten.** A recipe moved without its passage
fails on first run, and a passage left behind keeps okuda's `tmp/` looking like a shared
scratch tier. Both halves move in the same commit.

**Do not move `playbooks/herdr-cast-playbook.md`.** *Cast* is two different words: this
one is the windowing playbook and it is okuda's. A name-based sweep takes it, and taking
it breaks the host bridge.

**A moved recipe is a deleted recipe until proven otherwise.** `just` resolves recipe
names at invocation, so a half-finished move reports success on the recipes that stayed
and fails only when someone asks for a moved one. Check by listing and invoking, not by
reading the file.

## Related

- ADR: `ADR-PERIMETER-039` — the perimeter this enforces
- Brief: `BRF-PERIMETER-GATE` — the report this brief flips
- Brief: `BRF-PERIMETER-SILO` — the doctrine and the records, which this brief does not
  touch
- Survey: `docs/2026-09-18-a-perimeter-not-a-project.md` — the measurement
- Playbook: `PLY-SILO` — the scratch tier, and the release/probe language split
