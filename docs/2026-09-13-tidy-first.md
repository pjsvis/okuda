---
date: 2026-09-13
kind: tidy-first pass — branch and review reconciliation
lineage: the reader's instruction — *"lets tidy-first and get ourselves to a good place; check the branches and the reviews and figure out a path to the good place."*
---

# Tidy-first — the path to a good place

**Date:** 2026-09-13
**Scope:** the repository's branch and review state. Not a brief, not a plan to
build anything — a plan to *reconcile* what already exists.

## The finding, in one line

**Twenty-eight local branches is not twenty-eight pieces of work.** Twenty-three
are already merged into `main` and are dead pointers. Of the five that carry
work, **four are a stack that forks at its base** and three are independent. So
the work to land is **nine commits across five branches**, and it is already
written.

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

### Phase 3 — split the current branch

`feat/census-mode-brief` currently holds `d6a60e1` (census mode — legitimately its
own branch) **plus** four unrelated workstreams uncommitted on top. Per AGENTS.md
rule 4, these want their own branches:

| New branch | Contents |
|---|---|
| `feat/references-section` | `briefs/2026-09-13-brief-references-section.md`, `scripts/references-demo.ts`, `justfile` (the demo recipe), `playbooks/authoring-playbook.md` (the Cap-80 fix) |
| `feat/prolonged-press` | `briefs/2026-09-13-brief-prolonged-press.md` |
| `feat/audio-discovery` | `briefs/2026-09-13-brief-audio-discovery.md`, `decisions/036-no-speech-code.md`, `&ear.md`, and the one-line citation fix in `briefs/2026-09-12-brief-census-mode.md` |

Leave `feat/census-mode-brief` holding only `d6a60e1`, and move `td-39ce31` to
`in_review`.

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

1. **Two files in the tree are not mine and I have not touched them.**
   - `docs/2026-09-13-terminal-development.md` (new, 08:24 today) — no brief, no
     task, no callsign.
   - `docs/cognition-in-the-wild.md` (new, Sep 12 18:53) **and** the deletion of
     `docs/cognition-in-the-wild-md` — the latter is a **zero-byte file with a
     typo'd name**, added by `dfbcfa0` and still in `main`. So this pair is a
     clean typo fix (delete the empty mis-named file, add the real doc), but it
     belongs to someone else's session and wants its own branch.
2. **Phase 1 merges to `main` without the reviews having been approved.** The
   order is review → approve → close → merge, and landing first inverts it. The
   honest reading is that the reviews are *readings* and the merges are
   mechanical, so landing first and reviewing after is defensible — but it is a
   choice, not a default.
3. **Branch names for Phase 3.** The three proposed names are guesses.

## The good place, defined

`main` at the tip of everything reviewed · five branches, not twenty-eight ·
`NOW.md` true · no task in `in_review` whose work is unmerged · the registry
numbers unique across every branch, not just across `main`.
