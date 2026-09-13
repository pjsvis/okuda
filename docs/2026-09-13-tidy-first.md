---
date: 2026-09-13
kind: tidy-first pass — branch and review reconciliation
lineage: the reader's instruction — *"lets tidy-first and get ourselves to a good place; check the branches and the reviews and figure out a path to the good place."*
---

# Tidy-first — the path to a good place

**Date:** 2026-09-13
**Status:** Phases 0 and 3 done; 1, 2, 4 and 5 open.
**Scope:** the repository's branch and review state. Not a brief, not a plan to
build anything — a plan to *reconcile* what already exists.

## The finding, in one line

**Thirty-one local branches is not thirty-one pieces of work.** Twenty-three are
already merged into `main` and are dead pointers. Seven carry commits, but only
**five are merge targets** — because four of the seven are a **stack that forks at
its base**, and the tip subsumes three of them. So the work to land is **nine
unique commits across five branches**, and it is already written.

```mermaid
title: Thirty-one branches, five merge targets
flowchart LR
    B[31 local] --> M[23 dead]
    B --> W[7 carry work]
    W --> T[5 merge targets]
    W --> A[2 absorbed]
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

**That fork is easy to miss, and I missed it once.** Testing each branch against
`main` individually reports all four as clean — which is true and useless, because
it hides the shape. The check that actually answers the question is
`git merge-base --is-ancestor <commit> <branch>`: `074ecd1` is **not** in
`keymap-doc`. So the tip does not subsume the whole stack, and landing it is
**two merges, not one**.

```mermaid
title: The three independents
flowchart LR
    M[main] --> A[doc-ref-gold]
    M --> B[related-callsign]
    M --> C[census-mode]
```

## The five branches, and what each one closes

| Branch | Commits | Closes |
|---|---|---|
| `feat/keymap-doc` — the tip | 5 (`aeb0e0b` → `750cd21`) | td-50c289, td-b6d849, td-101a0f, **ADR-035** |
| `fix/vector-check-bold-canon` | 1 (`074ecd1`) + the shared base | td-daf894 |
| `feat/doc-ref-gold` | 1 (`690eec9`) | td-38bec6 |
| `feat/related-callsign-nudge` | 1 (`f33138c`) | td-19f7b9 |
| `feat/census-mode-brief` | 1 (`d6a60e1`) | td-39ce31 |

Nine unique commits: five in the tip, one more on the sibling, and one each on
the three independents.

**The reviews are not waiting on a reviewer — they are waiting on a merge.** Six
tasks sit in `in_review` with their implementation committed on an unpushed
branch. The work is done; nobody has landed it. That is the whole of the
"good place" problem in one sentence.

## Defects found while looking

1. **The ADR-035 collision — mine, now fixed.** `decisions/035-no-speech-code.md`
   (written earlier today) collided with **`035-dogfoods-are-single-modality`**,
   dated 2026-09-12 and committed as `e225bf0` on `feat/keyboard-dogfood` — an
   **unmerged branch**. That is also why BRF-CENSUS-MODE's citation looked
   "dangling": the number was claimed on a branch, so `main` genuinely ended at
   034. Renumbered to **036**, citation updated, registry regenerated. Recorded
   as a lesson in ADR-036's Context: **a number that looks free on `main` may be
   claimed on a branch.**
2. **Two stale silcrow counts.** `playbooks/authoring-playbook.md` said "Cap at
   88" (fixed → 80) and `&next.md` said "83 addresses" (fixed → 80, with the
   derivation). Both predate `11` joining the actuator pocket.
3. **`NOW.md` is five days stale** — generated 2026-09-08, claiming 52 briefs and
   32 decisions on branch `docs/read-the-code-or-not-tidy`. Actual: 58 and 35.
4. **`td-39ce31` is a state mismatch** — the census brief is committed (`d6a60e1`)
   and its own log says *"awaiting review"*, but the task is still `open`.
5. **ADR-035 has no task.** An Accepted ADR has been sitting unmerged since
   2026-09-12 with nothing tracking it.
6. **The binary is stale** — built from `690eec9` (`feat/doc-ref-gold`), not from
   the current HEAD.

## The path

Ordered. Each phase leaves the repo in a working state.

### Phase 0 — the ADR collision  ✓ done

Renumber 035 → 036, fix the census citation, regenerate the registry.
`just check` clean.

### Phase 1 — the stack lands, in two moves

```sh
git checkout main
git merge --ff-only feat/keymap-doc            # fast-forward: five commits
git merge fix/vector-check-bold-canon          # the sibling: one commit, clean
just check && bun test
git branch -d feat/keymap-doc feat/keyboard-dogfood \
               fix/vector-check-bold-canon feat/vector-min-12
```

The first is a **fast-forward** — `keymap-doc` is a linear descendant of `main`,
so five commits land with no merge commit and no conflict. The second is a real
merge (the sibling is not a descendant of the tip) but a clean one: its only new
commit sits on the shared base, which `main` already has.

Closes td-50c289, td-daf894, td-b6d849, td-101a0f. Lands ADR-035. **Deleting the
three absorbed branches is the point** — after the merge they point at commits
`main` already has and only add noise.

### Phase 2 — the two independents

`feat/doc-ref-gold` (td-38bec6) and `feat/related-callsign-nudge` (td-19f7b9),
one commit each, clean against `main`. Merge, `just check`, delete the branches.
Both touch the registries, which are **derived** — if either conflicts there, the
resolution is `just reg-sync-fix` and stage the result, not a hand-merge.

### Phase 3 — split the current branch  ✓ done 2026-09-13

`feat/census-mode-brief` held `d6a60e1` (census mode — legitimately its own
branch) **plus** four unrelated workstreams uncommitted on top. Per AGENTS.md
rule 4, these got their own branches. **Six landed, in two shapes:**

**A registry chain, off `feat/census-mode-brief`** — it must sit on census,
because the audio work edits `briefs/2026-09-12-brief-census-mode.md`, a file
`d6a60e1` created:

| Branch | Commit | Contents |
|---|---|---|
| `feat/references-section` | `f02adeb` | the brief, `scripts/references-demo.ts`, the `just references-demo` recipe, and the Cap-80 fix in `playbooks/authoring-playbook.md` |
| `feat/prolonged-press` | `b33ea1d` | the brief — the three gestures, the swallow, no clock |
| `feat/audio-discovery` | `e7dee51` | the brief, `decisions/036-no-speech-code.md`, the `&ear.md` register addendum, the citation fix |

**Three independents, off `main`** — `docs/` is not a registered tier, so these
touch no registry and stand alone:

| Branch | Commit | Contents |
|---|---|---|
| `docs/cognition-in-the-wild` | `a20496d` | the 184-line Hutchins summary, and retiring the zero-byte `docs/cognition-in-the-wild-md` |
| `docs/tidy-first` | `9a7d3d5` | this document, and the `&next.md` 83 → 80 correction |
| `docs/terminal-development` | `c17caf0` | the four-line note, two typos fixed |

Each branch regenerated its own registry entries with `just reg-sync-fix` and
passed `just check` **at its own commit**, so every commit is self-consistent
rather than carrying entries for files it does not contain. `bun test` on the
tip: 411 pass, 7 skip by design, 0 fail.

`feat/census-mode-brief` now holds only `d6a60e1`, and **`td-39ce31` is in
review** — the brief is committed and the task state has caught up.

### Phase 4 — hygiene

- Delete the 23 fully-merged branches.
- `just island` to regenerate `NOW.md`.
- `just ship` to rebuild the stale binary.
- Push `main` and the four surviving branches.

### Phase 5 — the reviews close

With the branches landed and the tasks in `in_review`, work the review queue:
approve and close each. **The merge is what unblocks them** — the review itself is
a reading, not a build.

## What needs a decision, not a tidy

1. ~~**Two files in the tree are not mine.**~~ **Settled 2026-09-13** — the reader
   asked for both checked in. `docs/cognition-in-the-wild.md` landed with the
   zero-byte `docs/cognition-in-the-wild-md` retired
   (`docs/cognition-in-the-wild`, `a20496d`); the terminal-development note landed
   on its own branch (`c17caf0`), two unambiguous typos fixed and the trailing
   whitespace trimmed, committed as a fragment rather than dressed up as a
   document.
2. **Phase 1 merges to `main` without the reviews having been approved.** The
   order is review → approve → close → merge, and landing first inverts it. The
   honest reading is that the reviews are *readings* and the merges are
   mechanical, so landing first and reviewing after is defensible — but it is a
   choice, not a default.
3. **The three proposed branch names** became six, and are now real. The names in
   Phase 3 above are the ones that landed; rename them if they read wrong.

## The good place, defined

Stated without a branch count, because the count is a symptom and not the goal:

- `main` is at the tip of everything reviewed and merged.
- **No local branch whose work is already merged.** A branch that `main` already
  contains is a stale pointer and nothing else — that is what the 23 dead ones
  are, and deleting them is the whole of Phase 4's first line.
- `NOW.md` is true (regenerated, not five days stale).
- **No task in `in_review` whose work is unmerged.** The review queue and the
  branch list agree with each other.
- **Registry numbers are unique across every branch, not just across `main`** —
  the failure that produced the ADR-035 collision, and the only one on this list
  that `main` alone cannot detect.
