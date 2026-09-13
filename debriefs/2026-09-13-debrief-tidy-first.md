---
type: Debrief
callsign: DBF-TIDY-FIRST
---

# Debrief: Tidy-first — the path to a good place

**Date:** 2026-09-13
**Status:** Shipped — all eight merge targets in `main`, 30 local branches
pruned to `main` only, registry reconciled, `just check` green, 416 tests
pass. `origin/main` at `d54f668`.

## Accomplishments

- **Branch topology reconciled.** `main` now sits at the tip of every reviewed,
  unmerged piece of work. The eight merge targets — `feat/keymap-doc` (stack
  tip, lands ADR-035), `feat/audio-discovery` (chain tip, lands ADR-036),
  `docs/tidy-first` (this brief, BRF-TIDY-FIRST), `feat/doc-ref-gold`,
  `fix/vector-check-bold-canon`, `docs/cognition-in-the-wild`,
  `docs/terminal-development`, `feat/related-callsign-nudge` — are merged. **20
  unique commits across eight branches**, exactly as the brief predicted.
- **Hygiene completed.** 30 local branches deleted (`git branch -d`, one forced
  because of a stale upstream ref); `just island` regenerated `NOW.md`; `just
  ship` rebuilt the binary. The local tree is `main` and nothing else.
- **Review queue drained.** Eight tasks reviewed and closed in a mechanically
  independent session (`ses_54f8f0`) before the merges — the canonical order
  (review → approve → close → merge) surfaced the census citation defect *before*
  it reached `main`.
- **The ADR-035/036 collision fixed at the source.** Renumbered
  `035-no-speech-code` → `036`, corrected the census citation, regenerated the
  registry. The collision (a number free on `main` but claimed on a branch) was
  the canonical example of the brief's "registry numbers unique across every
  branch" property.

## Problems

- **`reg-sync-fix` does not repair `INDEX.jsonl` — and `just check` does not
  catch the gap.** This is the incident worth keeping. During the
  `feat/audio-discovery` merge, both `decisions/INDEX.jsonl` and
  `briefs/INDEX.jsonl` took 3-way conflict markers (ADR-035 vs ADR-036 on
  `decisions/`; the four chain briefs vs BRF-TIDY-FIRST on `briefs/`). The brief
  prescribed resolving registry conflicts with `just reg-sync-fix`, and that is
  what ran — but `reg-sync-fix` **only regenerates `index.md`** and *silently
  skips* unparseable JSONL lines (WARN, no fail). So the markers were committed
  into `main` at `f86463d` and again at `388e66c`, and `just check` reported
  `decisions: OK` the whole time. Invalid JSONL shipped to `origin/main`.
  - **Resolution:** the reader chose *push now, reconcile after*. The markers
    were published (`50cf4bc..388e66c`), then a follow-up commit `d54f668`
    hand-edited both `INDEX.jsonl` files (keeping both sides' entries as valid
    JSON) and re-ran `reg-sync-fix` to refresh the views. `just check` now
    reports zero WARN; both `INDEX.jsonl` parse clean.
  - **Root cause, still open:** `reg-sync-fix` should rewrite the JSONL (or at
    least FAIL on unparseable lines) so a conflict hunk can never be committed.
    Recorded in `MEMORY.md` under Registries. Flagged, not fixed this session.
- **The fast-forward trap bit twice.** `--ff-only` worked for the stack tip, but
  `feat/doc-ref-gold` and `feat/related-callsign-nudge` were forked from the
  *old* `main`; once Phase 1 advanced `main`, they diverged and had to become
  true merges. Same for the chain tip after Phase 2 advanced `main`. Re-verifying
  each target against the *current* `main` after every advance is what caught
  these — the "all 8 CLEAN" measurement against the stale `main` had hidden them.
- **BSD `grep` `\|` alternation false-negative, re-hit.** Verifying the
  reconciled `index.md` with `grep -c "A\|B"` returned 0 — a silent empty result
  from BSD `grep`'s unreliable alternation, exactly the trap the project memory
  warns about. The Grep tool found the entries immediately. A silent empty
  `grep` is a tooling suspicion before it is a finding.

## Lessons Learned

- **A "registry conflict" is two different files.** `reg-sync-fix` manages
  `index.md` (bake time); `reg-sync`/`just check` manage `INDEX.jsonl` (read
  time, but silently tolerant). They are not the same regime. Resolution by
  `reg-sync-fix` is correct for `index.md` but leaves `INDEX.jsonl` to be fixed
  by hand. The brief's Phase 2/4 text should say so explicitly.
- **`just check` is a lint, not a validator.** It skips what it can't parse and
  calls the file OK. Anything that can leave a file parseable-but-wrong (or
  unparseable-but-skipped) gets a free pass. Treat its `OK` as "nothing I looked
  at was wrong," not "the file is correct."
- **Re-measure topology after every `main` advance, not once.** Branch shape is
  relative to `main`; a merge changes the reference. The clean-vs-`main` check is
  necessary but not sufficient — `git merge-base --is-ancestor` per target is the
  real answer.
- **Push-then-reconcile is a legitimate reader call, but it publishes the
  defect.** Honouring "after we are all checked in" meant the corrupted JSONL
  lived on `origin/main` for one commit. That is fine *because* the corruption
  was tolerant (skipped, not fatal) and the fix was one commit away — but it
  would not be fine for a corruption `just check` *would* fail on. Reconcile
  before push when the defect is a hard failure.

## Observations

### Branch topology
- The finding held: 36 local branches were 23 dead + 13 carry, and of the 13
  carry only 8 were merge targets (5 absorbed — tips reachable from another carry
  branch). The work to land was 20 unique commits, already written.
- The stack forks at its base (`vector-min-12` off `main`, then two independent
  lines) — easy to miss, and the reason Phase 1 was two merges not one.

### Registries
- `deriveStatus` only re-derives for *missing* entries; an existing entry keeps
  its stored `status`. So flipping BRF-TIDY-FIRST from `in_progress` to `done`
  means editing the `INDEX.jsonl` field by hand, then `reg-sync-fix` for the
  view. A `**Status:**` line with trailing prose fails to map — keep the value
  bare.

### Review workflow
- The independent-session review (mechanical separation from all eight
  implementers) is the real control, not the assertion of independence. It
  reproduced the red (`just smoke-test` 22 failures, the count `td-daf894`
  claims), ran the dogfood's self-prediction (exact), and ran the constants
  (`VECTOR_MIN` 12, pocket size 7, `MAX_REFS` 80).

## Metrics

- **`just ship` gate:** 416 pass / 7 skip / 0 fail.
- **`just check`:** green, zero WARN (post-reconciliation).
- **Branches:** 36 local → 1 (`main`); 8 merge targets, 23 dead, 5 absorbed all
  absorbed into `main`.
- **Commits landed:** 20 unique across the eight targets.

## Related

- Brief: `briefs/2026-09-13-brief-tidy-first.md` (BRF-TIDY-FIRST) — status now
  `done`.
- Decisions: `decisions/035-dogfoods-are-single-modality.md` (ADR-035, lands
  with the stack), `decisions/036-no-speech-code.md` (ADR-036, lands with the
  chain).
- Playbook: `playbooks/debriefs-playbook.md`, `playbooks/briefs-playbook.md`.
- Memory: `MEMORY.md` → Registries — the `reg-sync-fix` JSONL gap.

## Post-Debrief Checklist

- [x] Frontmatter present: `date`, `tags`, `agent`, `environment`
- [x] Registered in `debriefs/INDEX.jsonl` — `status: done`, meta `brief` set
- [x] ADRs written for decisions made during execution (ADR-035, ADR-036 landed)
- [x] Status of the originating brief updated to `done`
