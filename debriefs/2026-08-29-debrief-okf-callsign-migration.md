---
type: Debrief
callsign: DBF-OKF-CALLSIGN
date: 2026-08-29
tags: [okf, adr-019, callsigns, reg-sync, launcher, footer, jump-demo, table, adr-020, adr-021]
agent: pi (ses_9e4b52)
environment: local
td: td-bdfce0 · td-a87bfd (review)
branch: feat/gloam-launcher
---

# Debrief: the OKF migration and callsign layer — one movement, four slices

## Context

Continuation session on `feat/gloam-launcher`. It opened with two jobs: close
out the index-and-jump brief (bookkeeping), then pick up `td-bdfce0` — the
task ADR-019 and the silo-mnemonics brief had scoped and deliberately
deferred: OKF frontmatter across the corpus, generated tier `index.md`
exports, the launcher's callsign layer, and the three-column menu table the
index-and-jump close-out had sequenced to land here ("a two-column table
that becomes three is churn").

## Accomplishments

- **Phase 1 — index-and-jump closed honestly.** `td-a87bfd` (demo honesty)
  reviewed as an independent session — by rendering the compositor output
  and checking the claims against it, not by reading code. Closing the brief
  surfaced one residual lie in the *opposite* direction: the style guide's
  menu examples still taught `**01**` numbering after ADR-021 retired it —
  the dogfooded guide lagged the ADR it must honour. Synced (`9506f1d`);
  brief → Done, debriefed (`e69eb3d`).
- **Brief before build, probe before brief.** The table row shape
  (`| *slug* [glyph] | CALLSIGN | **NN** <!-- wiring --> |`) was verified
  empirically *before* the implementation brief committed to it: comment-
  in-cell strips cleanly, bare `%%…%%` tokens leak — so the wiring lives
  inside the comment and the table slice needed **zero `render.ts`
  changes**. The probe also caught that the digits-only-strong rule already
  gives any cell the white-bold number.
- **Four slices, seven commits (`769e6b9`…`5908ae3`).** (1) reg-sync as
  frontmatter engine: `--fix` ensures `type` + bootstrapped `callsign`
  (deterministic: tier prefix + ≤2 significant slug tokens, ADR sequence;
  assigned once, never re-derived), lifts callsigns into the registries;
  70 docs migrated, 70 unique callsigns, zero collisions. (2) Generated
  tier `index.md` exports + the root bundle declaration — root detection
  now fires **via okf**. (3) The callsign layer: `gloam <callsign>`
  resolution, `makeCallsignResolver` (index loads once, resolves per
  paint), and the completed footer identity run `silo · callsign ·
  filename` — the TUI still learns nothing of registries (ADR-020); the
  resolver follows jumps because it reads `currentFile` per paint. (4) The
  three-column table in jump-demo + `extractJumps` switched to
  line-scanning (subsumes the paragraph form — a one-line paragraph is a
  line) + the style guide's table form documented.
- **The rename acceptance proven empirically, not just unit-tested:**
  `git mv` a brief, `reg-sync --fix`, resolve the callsign — frontmatter
  travels with the file, the re-derived registry entry carries the same
  callsign, resolution returns the new path. Restored clean.
- 257 → 291 tests; `just check` green at every commit.

## The methodological notes

- **Check mode must be side-effect-free — and its drift counts are the
  audit trail that proves it.** The first cut staged frontmatter writes
  even in check mode, which populated the callsign map and produced
  phantom "29 callsign(s) drifting" lines for docs that had no frontmatter
  yet. The impossible numbers were the tell. Fixed: check mode counts,
  never stages.
- **Registry truth has two owners and the split is deliberate.** Status is
  hand-set in the INDEX (membership sync never rewrites it); callsign is
  frontmatter-truth lifted by `--fix`. This surfaced a pre-existing caveat:
  a rename resets a hand-set status to the derived one (the old entry is
  removed, the new derived). Harmless today; status-from-frontmatter is
  the long-term fix if it ever itches.
- **80-column wrap is honest behaviour, not a bug.** The loose-table
  policy wraps wide rows at narrow widths; the number never leaves its
  column. Narrow-width *elision* is td-b81597's parked scope — refusing to
  fix it here kept the slice boundary clean.

## What was deliberately not done

- **reg-menu compositor** — tier registry → jump-wired menu as a one-liner
  (`just menu briefs`). Design concurred at wrap-up; captured as
  `td-012c5d`, not built — session scope held. jq was declined as a
  committed mechanism (new dependency, untested blob, third-generator
  drift); the durable tier exports stay token-free because jump tokens are
  ephemeral by principle.
- **Silo-mnemonics brief not closed.** Its acceptance is now largely met
  (badge, callsign resolution, footer run, index lines with token +
  callsign + title); closing it is the next session's call, made against
  its full criteria rather than in a wrap-up sweep.
- **`log.md`** (OKF optional surface), cross-silo qualification, and any
  speech layer — no consumer, no build.

## Handoff

- `td-bdfce0` approved (operator in-session review at wrap-up).
- `td-012c5d` — reg-menu compositor, design captured, ready to start.
- Parked findings: rename/status caveat (above); 80-col table wrap →
  td-b81597.

## References

- Brief: `briefs/2026-08-29-brief-okf-callsign-migration.md` (Done)
- ADR-019 `decisions/019-okf-v02-conformance.md` · ADR-020
  `decisions/020-zero-notification-stillness.md` · ADR-021
  `decisions/021-jump-token-numbering-offset.md`
- Commits: `9506f1d` `e69eb3d` (phase 1) · `769e6b9` `722319e` `37978b8`
  `d39a414` `5908ae3` (phase 2)
