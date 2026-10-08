---
type: Debrief
callsign: DBF-ORNAMENT
---

# Debrief: The ornament that pays rent — the branch landed, and a close-out found unclosed

**Date:** 2026-09-22
**Status:** Shipped — `docs/ornament-that-pays-rent` merged to `main` at `1da8ac4` (`--no-ff`, 106 files, +12,691/−58), pushed to `origin/main`, seven merged local branches pruned, `just check` green, `bun test` 421 pass / 7 skip / 0 fail across 17 files. The branch's own debrief, `DBF-OS-UPGRADE`, was frozen mid-flight and is **corrected here rather than edited** (`playbooks/debriefs-playbook.md`: *"Once written it is never edited for content"*). Open: `src/render.ts:149-160`, and `td-8969cf`.

## Accomplishments

- **The merge.** 49 commits, 2026-09-14..2026-09-22, landed `--no-ff`. Fast-forward was
  available and declined, matching every prior merge in `main`'s history. `main` was a
  strict ancestor of the branch, so there were no conflicts and no `INDEX.jsonl` to
  reconcile by hand — the failure mode `DBF-TIDY-FIRST` recorded.
- **What the branch carried.** Six decisions (ADR-037 through ADR-042), fourteen briefs,
  forty-seven documents, `system.md` v1.2.0, and `bunfig.toml`. By commit subject the
  branch is 37 docs-family commits of 49.
- **Three repairs `main` needed, inside a branch that is nominally documentation.**
  `ADR-BUILD-SIGNS-040` (macOS 27 invalidated the signature `bun build --compile` wrote,
  so the binary SIGKILLed on exec); `ADR-GATE-NAMES-041` (`facade-lint.sh` exited 1 with
  zero bytes where `just` was absent, indistinguishable from a named violation);
  `ADR-TEST-SCOPED-042` (`bun test`'s default glob walked the gitignored `tmp/` scratch
  tier and reported its flake as the silo's). None of the three is a documentation change,
  and all three arrived on a docs branch.
- **The push.** `4353c33..1da8ac4` to `origin/main`. Nothing on the remote carried the
  three repairs or `system.md` v1.2.0 before this.
- **The prune.** Nine local branches to two. Each of the seven pruned was verified with
  `git merge-base --is-ancestor` **and** a zero count of commits unique to it, then deleted
  with `-d` (not `-D`) so a wrong ancestry claim would have refused rather than deleted.
  `feat/search-surface` carries three unmerged commits and stays.
- **Two state surfaces brought current.** `NOW.md` was thirteen days stale and named a
  branch that no longer exists locally; the binary was built from `d48d96e`, one commit
  behind `HEAD`. Both were repaired and are reported below as findings, because neither
  is checked by anything.

## Problems

- **The previous close-out was never closed.** `td-8969cf` (P1, *"Tidy-first — land the
  stack, split this branch, kill 23 dead branches"*) shipped on 2026-09-13 — `DBF-TIDY-FIRST`
  opens *"Shipped — all eight merge targets in `main`, 30 local branches pruned to `main`
  only"* — and was still `in_progress` nine days later. Its own session log's final line
  reads *"Awaiting the reader's go to run Phases 1, 2, 4 (the merges), then the debrief."*
  The merges ran. The debrief was written. The task did not close.
- **Two of that task's seven acceptance criteria were met by this session, not by the one
  that closed it.** *"NOW.md regenerated and true"* and *"the binary built from HEAD"* were
  both false at the start of this session: `NOW.md` had been generated 2026-09-08 and named
  `docs/read-the-code-or-not-tidy` with 4 dirty files, and `just orient` reported
  `binary: STALE (d48d96e ≠ 1da8ac4)`. A close-out whose criteria are asserted rather than
  run will satisfy the ones that have an instrument and miss the ones that do not.
- **The branch's own debrief measured the runner, not the tree.** `DBF-OS-UPGRADE`'s Metrics
  record *"`bun test` 651 pass / 7 skip / 37 fail"* and *"None of the 37 test failures are
  attributable to this work."* Both sentences are true and both are beside the point: the
  silo is **421 pass / 7 skip / 0 fail** across 17 files. The 651 and the 37 came from
  `tmp/` — a gitignored scratch checkout of an unrelated project with zero tracked files,
  which bun's default test glob walked anyway. `bunfig.toml` landed on this branch as
  `5581a59`. The debrief's *four* PATH-attributable failures were a subset; the other 33
  had no owner because they were never the silo's.
- **`DBF-OS-UPGRADE`'s commit count was wrong the moment the document existed.** It landed in
  `04725cb`, the same commit as the OS-upgrade fix, and its Status reads *"`main..HEAD` is 42
  commits."* `git rev-list --count 4353c33..04725cb` is **43**. A count of the branch cannot
  include the commit that carries the count.
- **Its Post-Debrief Checklist left two boxes unticked, and one is now stale in the other
  direction.** The first, *"Registered in `debriefs/INDEX.jsonl` — pending `reg-sync --fix`"*,
  is done: the row is present and `reg-sync --all` reports zero stale. The second, *"The two
  open defects have owners — not yet"*, splits: `facade-lint.sh`'s silent exit 1 was **fixed
  on this branch** by `ADR-GATE-NAMES-041`, and `src/render.ts:149-160` is **still open and
  still unowned** — verified this session, not assumed.

## Lessons Learned

- **A close-out has three surfaces and only one of them has an instrument.** `just check`
  verifies the registries and the facade. Nothing verifies `NOW.md`, the artifact, or the
  board. So "the close-out is done" is an assertion, and the three items that were wrong —
  a stale island, a stale binary, an open P1 — are exactly the three nothing checks. **Run
  the acceptance criteria; do not restate them.**
- **A count of the branch cannot include the commit that carries the count.** The house
  refuses a count as *justification* (`playbooks/authoring-playbook.md`: a line-count
  threshold would be benchmaxxing prose). Here is the other half: a count can also be wrong
  as *measurement*, and this one was wrong by construction, not by carelessness.
- **A debrief's test numbers measure the runner.** A suite count is only a fact about the
  tree if the walker is scoped. When a count moves, ask what it counted before concluding
  what changed — 651 → 421 was not 230 tests deleted.
- **A docs branch is not inert, and a commit-type histogram cannot tell you what a branch is
  worth.** 37 of 49 commits are documentation; the branch still carried the re-sign, the
  gate precondition, and the test scope, and `main` needed all three.
- **Verify ancestry before pruning, and let `-d` be the control.** A branch listed as merged
  by `git branch --merged` was checked against `merge-base --is-ancestor` *and* a zero unique
  count before deletion. The safe form of the command is the second control: had the
  ancestry claim been wrong, `-d` would have refused.

## Observations

### The merge
- Nineteen prior merges in `main`'s history are all `--no-ff`, all with a bare
  `Merge branch '<name>'` subject and an optional body. This one matched. Where `main` is a
  strict ancestor the merge commit is purely a marker, and the house keeps it anyway: the
  topology, not the diff, is what the marker records.
- `main` was a strict ancestor, so the merge touched no line either side had changed. The
  registry conflicts `DBF-TIDY-FIRST` spent a session on were structurally impossible here.

### The registries
- `reg-sync --all` reported `0 missing, 0 stale` across all five tiers before the merge and
  after it. The two ADRs written during the session (`041`, `042`) were landed with their
  rows in the same commit, which is why the second needed no reconciliation: the sequencing
  trap is only a trap when two trees each add a row.

### The board
- `td list --status in_review` is empty, so the one criterion that is cheap to check was in
  fact satisfied. The two that were not are the two with no instrument.
- `td-8969cf`'s `GIT STATE` block reads `Current: 1da8ac4 (main) +76 commits`, which is this
  session's tip. An open task tracks the repo forward, so a task left open does not go stale
  in a way that announces itself — it keeps reporting the present as if it were progress.

## Metrics

- **The merge:** `1da8ac4`, `--no-ff`, no conflicts, 106 files, +12,691/−58.
- **Commits:** 49 non-merge, 2026-09-14..2026-09-22. By subject: 37 docs-family, 4 `fix`,
  3 `feat`, 3 `chore`, 1 `briefs`, 1 `test`.
- **Landed:** 6 ADRs (037–042), 14 briefs, 47 documents, `system.md` v1.2.0, `bunfig.toml`.
- **Branches:** 9 local → 2 (`main`, `feat/search-surface`); 7 pruned, 0 forced.
- **Gate:** green — `signature-check: OK`; `0 missing, 0 stale` across briefs, debriefs,
  decisions, playbooks, advisories; `facade-lint: OK (column 26, in band, comments terse,
  no defaults)`.
- **Suite:** 421 pass / 7 skip / 0 fail, 428 tests across 17 files, 4,459 `expect()` calls,
  1.75 s.
- **State surfaces:** `NOW.md` generated 2026-09-08 → regenerated 2026-09-22
  (`main · 0 dirty · 1da8ac4`; 52/32/18/14 → 73 briefs / 42 decisions / 20 debriefs /
  15 playbooks). Binary `d48d96e` → `1da8ac4`; `just orient` now reports `binary: fresh`.
- **The board:** `td-8969cf` open 9 days past shipping; 0 issues in `in_review`.
- **Pushed:** `4353c33..1da8ac4`.

## Related

- Branch: `docs/ornament-that-pays-rent` — merged and pruned; `5581a59` was its tip
- Decisions: `decisions/039-the-perimeter.md`, `040-build-signs-its-output.md`,
  `041-a-gate-names-its-precondition.md`, `042-the-test-runner-is-scoped.md`
- Debrief: `debriefs/2026-09-21-debrief-the-os-upgrade.md` — `DBF-OS-UPGRADE`, frozen
  mid-flight; the corrections in §Problems are its sequel, not an edit to it
- Debrief: `debriefs/2026-09-13-debrief-tidy-first.md` — `DBF-TIDY-FIRST`, the close-out
  this session found incomplete
- Note: `docs/2026-09-21-the-model-beside-the-loop.md` — the gate defect, and its fix
- Playbook: `playbooks/debriefs-playbook.md` — the frozen-record rule this follows
- Task: `td-8969cf` — its acceptance criteria, re-run this session

## Post-Debrief Checklist

- [x] Frontmatter present: `type`, `callsign`
- [ ] Registered in `debriefs/INDEX.jsonl` — pending `reg-sync --fix`
- [x] ADRs written for decisions made during execution — none new this session; the
      branch's six landed with it
- [ ] `td-8969cf` closed against its acceptance criteria
- [x] `src/render.ts:149-160` re-verified as still open, and named here as unowned
