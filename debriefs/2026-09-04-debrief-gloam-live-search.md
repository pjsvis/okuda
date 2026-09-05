---
type: Debrief
callsign: DBF-GLOAM-LIVE-SEARCH
---

# Debrief: the gloam live search — one day, three UX failures, one ADR

**Date:** 2026-09-04
**Status:** Shipped (tagged `v0.1.0-gloam-search`, merged to `main` @ `fd1b1cc`)

## What was built

Full-text search for the gloam picker, ending as the **default**: plain
`gloam` recomputes a ranked merge (orientation `&files` → registry
callsigns → body evidence → filename remainder) on every keystroke via
fzf `change:reload` → `--entries {q}` self-spawn. Evidence rows are
`path` + first matching line, highlighted in the okuda amber, revealed
by glass-edge truncation. Conformance harness: `just search-smoke`
(headless) and `just search-replay` (the exact picker instance,
standalone). 343 tests. ADR-030 carries the decision.

## The arc — each failure taught the next fix

1. **No content search at all** — the panel matched filenames only.
2. **Latent ranker** — rg pre-narrowed correctly, but fzf matched only
   paths: the evidence was invisible to the matcher, so typing the query
   returned zero. A ranker whose evidence is invisible is not a search.
3. **Mode-boundary failures ×3** — `-g` behind a flag; `just gloam`
   silently swallowing args; the operator typing content queries into a
   filename-only picker while the smoke stayed green.
4. **Phrase intolerance** — "load bearing" vs a corpus full of
   "load-bearing".
5. **Layout** — hscroll clipped paths mid-name; a capped alignment pass
   split its own table; the operator's single-column design (natural
   paths, evidence same line, widening = reveal) replaced it.

## Lessons (the reusable ones)

- **A conformance test that doesn't start where the operator starts is
  a unit test with ambition.** The smoke drove the pipe; the operator
  drove the recipe. The bug lived in the space between. Test the entry
  path (`just recipe → argv → dispatch`), not just the engine.
- **When smoke is green and the operator is red, find the seam, don't
  argue.** `just search-replay` exists because "we must be looking at
  the same thing" is a mechanism, not a hope: dump the entries, print
  the argv, run the identical instance standalone.
- **Prioritisation is feed order, not a scorer.** `--tiebreak=index`
  makes the pipe the ranker. Every scoring pass we didn't write is a
  test we didn't need.
- **A flag is a negotiation; a default is a decision.** The brief chose
  `-g` for honesty; the operator's actual usage reversed it in one
  afternoon. Reversals get ADRs (ADR-030), and the reversal evidence was
  dogfood, not debate.
- **"Capped alignment" was incoherent** — paths are identity and cannot
  truncate to a column; a capped width splits the table into two
  misaligned halves. The operator's simpler design (single column, glass
  truncation as reveal) removed the machinery instead of tuning it.
- **The guest brings no furniture:** `fzfEnv()` strips the whole
  `FZF_*` namespace, not just one variable — a one-door fix in a
  hallway of doors is not ownership.
- **`Bun.spawnSync`'s `input` option is a silent no-op** (bun 1.4.0) —
  fzf received empty stdin and matched nothing, a false negative that
  looked like a broken search inside the test itself. Use async spawn
  with piped stdin.

## What's left

- Remote dogfood on the Omarchy box (`ssh … gloam load bearing`) — the
  one acceptance item this Mac cannot exercise.
- Evidence-grammar refinements (inner table pipes) if narrow-glass
  dogfood says so.
- The picker-as-okuda-overlay endgame (three-concerns negotiation,
  ADR-016's guest line) — named, not scheduled.

## Addendum — the afternoon (the same day, continued)

The morning shipped the search; the afternoon gave it a philosophy and
a shape:

- **The silcrow** — bracketless `§NN` badges in the reserved vector
  paint (LCARS gold, distinct from every author-addressable role); the
  glyph inherited, not invented.
- **The shelf and the dive** — no text lands on the root shelf; filter
  text dives the corpus with root files excluded. The &-family floats
  at the landing and steps aside when you consult.
- **One-to-many vectors** — every reference occurrence gets its own
  vector; several vectors may translate to one filename. The map is the
  translation table; the paint is a projection.
- **The shared channel** — the agent audits references through the same
  derivation the human reads through (`--entries`); the audit caught
  its own decoration on first run.
- **The vocabulary and the filter model** — the house words pinned
  (reference, dereference, unwind, promote, consult); the reserve list
  filed (shelf scale, folder-listing suppression, the agent's tour,
  state filters); and one challenge declined: the sqlite browser, whose
  deliverable was the invariant the system refuses.

The arc: **history abolished, context bounded to declared relevance,
and the whole thing composed out of machinery a millennium old.** The
session closed with the seniority test passed in writing: the sqlite
temptation, declined with reasons, filed beside the ideas it almost
displaced.

## Numbers

- 15 commits on `feat/content-shortlist-amendment`, ff-merged to `main`.
- Tests: 336 → 343 over the day; `just check` green throughout.
- Briefs: BRF-CONTENT-SHORTLIST (implemented, closed). ADRs: 030. New
  recipes: `search-smoke`, `search-replay`. Help page now carries the
  search contract.
