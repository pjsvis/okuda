---
type: Brief
callsign: BRF-IDEA-LEDGER
---

# Brief: Close the funnel — the idea ledger, and the record's linkage

**Date:** 2026-10-14
**Status:** In Progress
**Context:** The briefs backlog is 71 live documents — 59 `open`, 3 `ready`,
8 `parked` — against a lifecycle (`ADR-BRIEF-LIFECYCLE-061`) whose four positions
have one occupant. An idea has nowhere to be written except as a *promise*, so
every idea becomes a brief, and the open list counts documents rather than
decisions. The sitting that compressed 91 to 71 (`DBF-COMPRESSION`) named the
second cost: the linkage was grep-and-hand-verify, and two of six "landed"
briefs were not.

## Objective

Add the missing **intake gate** — an idea ledger in `docs/` where an idea costs
one line and must name its trigger — and close the **closure edge**, so a debrief
declares the briefs it measures.

## Evidence

Measured 2026-10-14, `python3` over `briefs/INDEX.jsonl` and `git log`:

- 71 live briefs: 59 `open`, 3 `ready`, 8 `parked`, 1 `done`; 75 already in
  `.archive/briefs` — ~146 briefs in ~50 days.
- **9 of 71** live briefs have exactly **one commit ever** — written, never
  touched again. (The 2–3 commit mode is registry and panel churn, not work, so
  the count is a floor on "written and abandoned", not a measure of effort.)
- Linkage: 4 of 47 debriefs carry a brief in their registry `meta`; 8 carry a
  `**Briefs:**` line (`grep -l '^\*\*Briefs:\*\*' debriefs/*.md`).
  `DBF-COMPRESSION:58` states two, from the panel's own reading.
- Cluster estimate, a crude regex over live callsigns+summaries: speech/TTS ≈ 19,
  perimeter/silo ≈ 18, render/tables ≈ 15, ssh/porch ≈ 9, palette ≈ 9. Overlapping
  and indicative only — the shape, not the arithmetic: ~8 decisions of sediment.
- **The worked instance.** `BRF-DOCS-LEDGER` is a proposal for a *ledger* written
  as a *promise*: `Status: Open`, `**TD:** (to create when claimed)`, and
  `git log` shows one commit — 2026-10-09, never touched.

## Scope

**In:** the idea ledger (`docs/ideas.md`), `scripts/idea-lint.ts`, the tier row
and the route in `playbooks/playbooks-playbook.md`, the brief-writing rule in
`playbooks/briefs-playbook.md`; the debrief `briefs:` field,
`scripts/debrief-link-lint.ts` and its baseline, the field in
`playbooks/debriefs-playbook.md`; `ADR-IDEA-LEDGER-064` and
`ADR-RECORD-LINKAGE-065`.

**Out:** compressing the existing 59 into clusters (a separate sitting, cluster
by cluster — each demotion is a *rejection*, per `ADR-ARCHIVE-BREADTH-063`, and
the ledger line carries the callsign so the citation survives); a
`**Promoted from:**` field on briefs; renaming 47 debriefs to carry the literal
`debrief` token; any callsign, registry or tier for the ledger.

## Preconditions

- [x] `docs/` is the record register and no registered tier — a new document
      there needs no JSONL entry (`playbooks/registry-playbook.md`,
      `ADR-DOCUMENT-LIFECYCLE-057`).
- [x] An idea line's slug is invisible to the callsign machinery, so a ledger
      entry cannot mint a code (`scripts/callsign-lint.ts`, `CALLSIGN_TOKEN`).
- [x] `docs/*.md` is already in `scannedFiles()` — the lint needs no new scan
      set (`scripts/td-id-lint.ts`).
- [ ] The 59-brief compression is *not* a precondition of this brief and stays
      out of it.

## Work Plan

1. [ ] `ADR-IDEA-LEDGER-064` and `ADR-RECORD-LINKAGE-065`.
2. [ ] `docs/ideas.md` — the format, its own rules at the head, and seeds.
3. [ ] `scripts/idea-lint.ts` — the trigger gate, and the promotion-rate reading.
4. [ ] `scripts/debrief-link-lint.ts` + `scripts/debrief-link-baseline.json`.
5. [ ] Tier row, route, and the `briefs:` field in the three playbooks.
6. [ ] `tests/idea-lint.test.ts`, `tests/debrief-link-lint.test.ts`.
7. [ ] `just check` green; `bun test` green.

## Acceptance Criteria

- An idea requires a **trigger** to pass the gate, and a trigger-less line fails
  `just check` with the offending slug named.
- The ledger reports its own **promotion ratio** (promoted / total) — the
  falsifier, printed rather than asserted.
- A debrief frontmatter `briefs:` naming an unresolvable callsign fails the gate;
  a new debrief with no `briefs:` key fails it; the 47-document debt is
  *baselined and shrink-only*, never silently allowed.
- `playbooks/playbooks-playbook.md` carries the ledger as a row with its
  **Answers** and **Lifetime**, and its route.
- No decision is recorded twice: `ADR-IDEA-LEDGER-064` owns the intake gate,
  `ADR-RECORD-LINKAGE-065` the closure edge, and each names what it does *not*
  cover.
- `just check` and `bun test` pass.

## Notes

- **The ledger is not a tier and not a second td.** No callsign, no JSONL, no
  status vocabulary. `playbooks/registry-playbook.md:139` — no parallel stores:
  if an entry says *we will*, it is a brief or a task; the ledger holds only
  what says *wouldn't it be interesting if*.
- **Not a table.** The house renderer elides a table cell that does not fit
  (`BRF-TABLE-WIDTH`, `bun#45175`), and `playbooks/playbooks-playbook.md`'s own
  route is a list for exactly that reason — at 80 columns the failure column is
  the one that vanishes. The ledger is a list of one-line entries.
- **The falsifier is stated in the ADR, not discovered later:** a ledger whose
  line count only grows and whose promotion count does not is a graveyard, and
  is deleted.
- The valve: this brief names no td id (`playbooks/td-playbook.md`).
