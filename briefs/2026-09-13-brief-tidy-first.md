---
type: Brief
callsign: BRF-TIDY-FIRST
---

# Brief: Tidy-first — the path to a good place

**Created:** 2026-09-13
**TD:** td-8969cf
**Status:** Done
**Phases:** 0–5 done — merged, reconciled, and debriefed (DBF-TIDY-FIRST).
**Lineage:** moved here on 2026-09-13 from `docs/2026-09-13-tidy-first.md` per the
reader's instruction — *"create the brief and we will debrief after the merge."*
The original brief answered *"lets tidy-first and get ourselves to a good place;
check the branches and the reviews and figure out a path to the good place."*

## Objective

Reconcile the repository's branch and review state so that `main` sits at the tip of
every reviewed, unmerged piece of work, and no stale branch or dead pointer remains.
This is reconciliation, not construction: nothing new is built. The work to land is
already written; what is missing is the ordering and the merges.

## Scope

**In:** branch topology analysis, the review queue, the merge plan, the hygiene pass
(delete dead branches, regenerate `NOW.md`, rebuild the binary, push).

**Out:** any new feature, any change to okuda's rendering, any new ADR content beyond
the renumber already done in Phase 0. The brief itself is prose and a plan; it authors
no code.

## Preconditions

- The eight merge-target branches exist and are local-only (nothing is pushed).
- The review queue for those branches is empty (Phase 5 closed it 2026-09-13).
- `just check` passes on every merge target at its own commit (verified 2026-09-13).
- `git merge-tree --write-tree main <branch>` reports no conflict for all eight
  targets (verified 2026-09-13: all CLEAN).

## The finding, in one line

**Thirty-six local branches is not thirty-six pieces of work.** Twenty-three are
already merged into `main` and are dead pointers. Thirteen carry commits `main` does
not have, but only **eight are merge targets** — because five of the thirteen are
**absorbed**: their tips are already reachable from another carry branch, so merging
them would be a no-op with a branch name attached. So the work to land is **twenty
unique commits across eight branches**, and it is already written.

```mermaid
title: Thirteen carry work, eight merge targets
flowchart LR
    B[36 local] --> M[23 dead]
    B --> W[13 carry commits]
    W --> T[8 merge targets]
    W --> A[5 absorbed]
```

## The stack — and it forks

```mermaid
title: The stack forks at the base
flowchart TB
    M[main 50cf4bc] --> A[vector-min-12]
    A --> B[vector-check]
    A --> C[keyboard-dogfood]
    C --> D[ADR-035 dogfoods]
    D --> E[keymap-doc - the tip]
```

`vector-min-12` is the base and its parent **is `main`** (`50cf4bc`). From it the
work **forks in two**: `vector-check` is a sibling of the `keyboard-dogfood` line,
not a descendant of it.

**That fork is easy to miss.** Testing each branch against `main` individually reports
all four as clean — true and useless, because it hides the shape. The check that
answers the question is `git merge-base --is-ancestor <commit> <branch>`: `074ecd1`
is **not** in `keymap-doc` (verified 2026-09-13). So the tip does not subsume the
whole stack, and landing it is **two merges, not one**.

```mermaid
title: Two independents, and the chain's base
flowchart TD
    M[main] --> A[doc-ref-gold]
    M --> B[related-callsign]
    M --> C[census-mode]
    C --> D[references-section]
    D --> E[prolonged-press]
    E --> F[audio-discovery - the tip]
```

`census-mode` is off `main` like the other two, but it is **the base of the registry
chain**, not an independent — and it must not land on its own. See Phase 4.

## The branches, and what each one closes

Thirteen local branches carry commits `main` does not have. **Eight are merge targets;
five are absorbed** — they point at commits another branch already contains, so
merging them would be a no-op with a branch name attached.

| Merge target | Commits | Absorbs | Closes |
|---|---|---|---|
| `feat/keymap-doc` — the stack tip | 5 (`aeb0e0b` → `750cd21`) | `feat/vector-min-12`, `feat/keyboard-dogfood` | td-50c289, td-b6d849, td-101a0f, **ADR-035** |
| `feat/audio-discovery` — the chain tip | 4 (`d6a60e1` → `e7dee51`) | `feat/census-mode-brief`, `feat/references-section`, `feat/prolonged-press` | td-39ce31, td-fc17e9 |
| `docs/tidy-first` — this brief | 5 (`9a7d3d5` → `fd3ae4a`) | — | td-8969cf (BRF-TIDY-FIRST) |
| `feat/doc-ref-gold` | 2 (`690eec9`, `1255f40`) | — | td-38bec6 |
| `fix/vector-check-bold-canon` | 2 (`aeb0e0b` + `074ecd1`) | — | td-daf894 |
| `docs/cognition-in-the-wild` | 1 (`a20496d`) | — | — |
| `docs/terminal-development` | 1 (`c17caf0`) | — | — |
| `feat/related-callsign-nudge` | 1 (`f33138c`) | — | td-19f7b9 |

Twenty unique commits across all of them (deduplicated: `aeb0e0b` is shared by the
stack tip and the sibling fix). **The absorbed five are the point of the count** —
`feat/vector-min-12` and `feat/keyboard-dogfood` exist only because they had to be
built somewhere, and once the tip lands they are stale pointers, exactly like the 23
dead ones Phase 4 deletes.

**The reviews were not waiting on a reviewer — they were waiting on a merge.** Eight
tasks sat in `in_review` with their implementation committed on an unpushed branch.
The work was done; nobody had landed it. That was the whole of the "good place" problem
in one sentence. (The reviews are now closed — Phase 5 — without a merge having
happened. See item 2 under *What needs a decision*.)

## Defects found while looking

1. **The ADR-035 collision — mine, now fixed.** `decisions/035-no-speech-code.md`
   (written earlier today) collided with **`035-dogfoods-are-single-modality`**,
   dated 2026-09-12 and committed as `e225bf0` on `feat/keyboard-dogfood` — an
   unmerged branch. Renumbered to **036**, citation updated, registry regenerated.
   Lesson (ADR-036 Context): a number that looks free on `main` may be claimed on a
   branch.
2. **Two stale silcrow counts.** `playbooks/authoring-playbook.md` said "Cap at 88"
   (fixed → 80) and `&next.md` said "83 addresses" (fixed → 80, with the derivation).
   Both predate `11` joining the actuator pocket.
3. **`NOW.md` is stale** — generated 2026-09-08, claiming 52 briefs and 32 decisions.
   Corrected during the review to measured counts: `main` carries 54 briefs and 34
   decisions; the chain tip (`feat/audio-discovery`) carries 58 and 35. Regenerated
   properly in Phase 4 via `just island`.
4. ~~**`td-39ce31` is a state mismatch**~~ **Fixed 2026-09-13** — the census brief was
   committed with its own log saying *"awaiting review"* while the task sat `open`.
   Moved to `in_review`, reviewed and closed with the rest.
5. **ADR-035 has no standalone task.** An Accepted ADR (dogfoods are single-modality)
   sits unmerged on `feat/keyboard-dogfood` with nothing tracking it directly — it
   rides in on the stack landing (Phase 1) under td-50c289/td-b6d849/td-101a0f. Noted
   so a future reader does not go looking for a td that does not exist.
6. **The binary is stale** — built from `690eec9` (`feat/doc-ref-gold`), not from the
   current HEAD. Rebuilt in Phase 4 via `just ship`.

## The path

Ordered. Each phase leaves the repo in a working state.

### Phase 0 — the ADR collision  ✓ done

Renumber 035 → 036, fix the census citation, regenerate the registry. `just check`
clean.

### Phase 1 — the stack lands, in two moves

```sh
git checkout main
git merge --ff-only feat/keymap-doc            # fast-forward: five commits
git merge fix/vector-check-bold-canon          # the sibling: one new commit (074ecd1), clean
just check && bun test
git branch -d feat/keymap-doc feat/keyboard-dogfood \
               fix/vector-check-bold-canon feat/vector-min-12
```

The first is a **fast-forward** — `keymap-doc` is a linear descendant of `main`, so
five commits land with no merge commit and no conflict. The second is a real merge
(the sibling is not a descendant of the tip) but a clean one: its only new commit
(`074ecd1`) sits on the shared base `aeb0e0b`, which `main` already has after the
fast-forward.

Closes td-50c289, td-daf894, td-b6d849, td-101a0f. Lands ADR-035. **Deleting the
absorbed branches is the point** — after the merge every one of them points at commits
`main` already has and only adds noise.

### Phase 2 — the two true independents

`feat/doc-ref-gold` (td-38bec6, 2 commits) and `feat/related-callsign-nudge`
(td-19f7b9, 1 commit), clean against `main`. Merge, `just check`, delete the branches.
Both touch the registries, which are **derived** — if either conflicts there, the
resolution is `just reg-sync-fix` and stage the result, not a hand-merge.

`feat/doc-ref-gold` carries `1255f40`, a review-found comment fix (the rewrite left a
sentence without a predicate); comment only, the merge is unchanged.

**The third branch the original diagram called independent is not one of these.**
`feat/census-mode-brief` is off `main` like these two, but it is the *base of the
chain*, and landing it by itself puts a wrong ADR number on `main` — it belongs with
the chain, in Phase 4.

### Phase 3 — split the current branch  ✓ done 2026-09-13

`feat/census-mode-brief` held `d6a60e1` (census mode — legitimately its own branch)
**plus** four unrelated workstreams uncommitted on top. Per AGENTS.md rule 4, these got
their own branches. Six landed, in two shapes:

**A registry chain, off `feat/census-mode-brief`** — it must sit on census, because the
audio work edits `briefs/2026-09-12-brief-census-mode.md`, a file `d6a60e1` created:

| Branch | Commit | Contents |
|---|---|---|
| `feat/references-section` | `f02adeb` | the brief, `scripts/references-demo.ts`, the `just references-demo` recipe, and the Cap-80 fix in `playbooks/authoring-playbook.md` |
| `feat/prolonged-press` | `b33ea1d` | the brief — the three gestures, the swallow, no clock |
| `feat/audio-discovery` | `e7dee51` | the brief, `decisions/036-no-speech-code.md`, the `&ear.md` register addendum, the citation fix |

**Three independents, off `main`** — `docs/` is not a registered tier, so these touch no
registry and stand alone:

| Branch | Commit | Contents |
|---|---|---|
| `docs/cognition-in-the-wild` | `a20496d` | the 184-line Hutchins summary, and retiring the zero-byte `docs/cognition-in-the-wild-md` |
| `docs/tidy-first` | `fd3ae4a` | this brief (moved from `docs/` on 2026-09-13), and the `&next.md` 83 → 80 correction |
| `docs/terminal-development` | `c17caf0` | the four-line note, two typos fixed |

Each branch regenerated its own registry entries with `just reg-sync-fix` and passed
`just check` **at its own commit**, so every commit is self-consistent rather than
carrying entries for files it does not contain. `bun test` on the tip: 411 pass, 7 skip
by design, 0 fail.

`feat/census-mode-brief` now holds only `d6a60e1`, and **`td-39ce31` is in review** —
the brief is committed and the task state has caught up.

### Phase 4 — the rest of the landing, then hygiene

**The registry chain lands in one move, not four.** `feat/audio-discovery` is a linear
descendant of `feat/prolonged-press`, which descends from `feat/references-section`,
which descends from `feat/census-mode-brief` — verified: `git rev-list --merges
main..feat/audio-discovery` returns **zero** (2026-09-13). One fast-forward brings all
four commits.

**`feat/census-mode-brief` must not land alone.** BRF-CENSUS-MODE line 85 cites
*ADR-035* for the speech rule, and ADR-035 is the dogfoods decision, on
`feat/keyboard-dogfood`. The corrected citation — *no speech code in okuda, and no
narration (ADR-036)* — exists **only on `feat/audio-discovery`**, a descendant. Merging
census by itself puts a wrong number on `main`: the same defect class Phase 0 fixed, one
branch over. `td-39ce31` was approved on that condition and the review row says so. This
is the concrete cost of the good place's last property — *registry numbers unique across
every branch* — and it is why the chain is a chain.

**The three `docs/` branches** are off `main` and touch no registry. `docs/tidy-first`
carries this brief (5 commits); `docs/cognition-in-the-wild` and `docs/terminal-development`
are one commit each. Any order.

Then: delete the 23 fully-merged branches, `just island` to regenerate `NOW.md`, `just ship`
to rebuild the binary (stale — built from `690eec9`), push.

### Phase 5 — the reviews close  ✓ done 2026-09-13

Eight tasks were waiting (census mode and the audio work joined the queue as Phase 3
committed them). All eight reviewed and closed in one pass, by a **new session**
(`ses_54f8f0`): mechanically independent of all eight implementers, which is the
independence the tasks asked for rather than an asserted one.

**The review ran the claims rather than reading them:**
- Reproduced the red before accepting the fix: `just smoke-test` on the stack tip fails
  **22 cases**, the count `td-daf894` claims.
- Ran the dogfood's self-prediction: `docs/keyboard-dogfood.md` states its own map, and
  it is **exact**: §12 ADR-032, §13 ADR-031, §14 the dead link.
- Ran the constants: `VECTOR_MIN` 12, the pocket Set `{22…88}` (size 7), `MAX_REFS` 80.
- Checked the registry on **all ten branches** against their own trees — every entry
  resolves to a file that branch contains. Clean.
- Invoked the `NO_COLOR` guard: one named failure, exit 1, not 22 misleading ones.

**One defect found, fixed rather than waved through.** `td-38bec6`'s rewrite of a comment
in `tests/vectors.test.ts` dropped the clause that carried the test's point and left the
sentence without a predicate. Restored in `1255f40` — comment only.

**The review's most useful output was about this document**, not the branches: the two gaps
below. A plan is a document like any other, and this is the registry principle applied to
prose — the map is refereed against the territory, and the referee found drift. (Those gaps
are why Phases 1 and 2 now name all eight targets, and why `docs/tidy-first` carries 5
commits rather than the 3 the first draft listed.)

## What needs a decision, not a tidy

1. ~~**Two files in the tree are not mine.**~~ **Settled 2026-09-13** — checked in.
   `docs/cognition-in-the-wild.md` landed with the zero-byte `docs/cognition-in-the-wild-md`
   retired; the terminal-development note landed on its own branch, two typos fixed.
2. ~~**Phase 1 merges to `main` without the reviews having been approved.**~~ **Settled
   2026-09-13, in favour of the canonical order** — review → approve → close → merge. The
   reviews turned out not to be blocked on the merge: every task had its work committed on a
   branch, and a review can read a branch as readily as `main`. Doing it in this order
   surfaced the census citation problem *before* it reached `main`.
3. ~~**The three proposed branch names became six.**~~ **Settled 2026-09-13** — the names in
   Phase 3 are the ones that landed.

## The good place, defined

Stated without a branch count, because the count is a symptom and not the goal:

- `main` is at the tip of everything reviewed and merged.
- **No local branch whose work is already merged.** A branch that `main` already contains
  is a stale pointer and nothing else — that is what the 23 dead ones are, and what the five
  absorbed ones become the moment their tips land.
- `NOW.md` is true (regenerated, not five days stale).
- **No task in `in_review` whose work is unmerged.** The review queue and the branch list
  agree with each other. **Met 2026-09-13** — the queue is empty, and the eight tasks closed
  with their work still on branches, the one place this property can hold without the merges.
  It stops holding if a new task opens against unlanded work.
- **Registry numbers are unique across every branch, not just across `main`** — the failure
  that produced the ADR-035 collision, and the only one on this list that `main` alone cannot
  detect.

## Related

- **ADR-017** — session handoffs are not briefs (this document is a brief, not a handoff).
- **ADR-032** — the doubled-pair canon (silcrow actuator class).
- **ADR-035** — dogfoods are single-modality (lands with the stack).
- **ADR-036** — no speech code in this repo (renumbered from 035; lands with the chain).
- **playbooks/briefs-playbook.md** — the brief test this document passes.
- **playbooks/debriefs-playbook.md** — the debrief that follows the merge.
- **playbooks/silo-playbook.md** — the tier compartments (briefs / decisions / debriefs).
