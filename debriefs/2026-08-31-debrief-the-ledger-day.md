---
type: Debrief
callsign: DBF-LEDGER-DAY-2026-08-31
---

# Debrief: the ledger day — 2026-08-30/31

## What happened

A question about whether mnemonics deserve to exist became two days of
governance, four ADRs, two reconciled foreign drafts, a human onboarding
layer, and one renderer fix. No feature code beyond the paint.

**Landed:**

- **ADR-024** callsigns are data, not machinery — resolver/ bootstrap
  deferred; resolution is the shipped dispatch plus content search.
- **ADR-025** the mnemonic namespace model — register-scoped, header-
  only, exactly-one, silo-qualified, archive lifecycle.
- **ADR-026** the vector format declared — one grammar, two forms, paint
  decoupled; the competing parser fork declined with reasons.
- **ADR-027** temperament is downstream of discipline — the anti-drift
  principle, unpacked into five operational clauses.
- **`&briefs`** (state table, 41 briefs grouped by assessed state) and
  **`&next`** (the decision table — action blocks, list format).
- **explainers/** — the human onboarding layer: terminal, concepts and
  terms, the diagram tool, SSH; jump-wired; the roll defined.
- **The seams paper, search conventions, naming-like-NASA, the mangle
  demo, the ledger audit** — options, idioms, precedents, proofs.
- **Two foreign drafts reconciled** (vector resource locators, actuator
  inputs/voice) — fresh → aligned, provenance stamped, routed.
- **Vector paint fix** — tolerant inline accent bracket; the RHS layout
  retired; the list-item token leak closed; binary shipped.
- **`scripts/cast.ts` + PLY-HERDR-CAST** — casting documents to Herdr
  panes, verified.
- **PLY-MERMAID-DIAGRAMS** — five families, the bounded-context limits,
  the fallback smoke test.

## Gap analysis (git verbs)

- Push closed a 3-day, **192-commit** gap: `e5e78f0..main`.
- Ledger delta: **200 files, ~17.8K insertions** (markdown + source).
- Today's session alone: **24 new artifacts**, 7 merges to `main`,
  308/0 tests at every landing.

## Lessons learned (persisted, attributed)

1. **Temperament is downstream of discipline** — ADR-027; the VRL and
   actuator reconciliations are the worked examples.
2. **Adjacency is the delivery mechanism** — no help system; the
   explainers surface beside what they explain.
3. **Tables for records, lists for arguments** — `&next` reverted; the
   action block (name — verdict · cost) is the `&now` unit.
4. **The frame is the numbering scope** — paged-okudagram's
   frame-numbering clause; ergonomics for free.
5. **Observed behaviour without declaration is drift** — the Esc bridge,
   the wire format, the two-keymap seam: each codified the day it was
   noticed.
6. **The scraper can be the barnacle** — one "fix" normalised the
   author's voice; corrections check ownership first.
7. **Tolerance where guest, contracts where landlord** — the paint is
   written against the parser's observed behaviour; the source format
   stays canonical.

## What's next

- **`&next` rows 11–13**: the callsign lint (td-040450 — ADR-025's owed
  enforcement), the content shortlist (the spout), bracket paint is
  *done* (this debrief's own render proves it).
- **The unit definition** — one defended paragraph unlocks the
  paged-okudagram brief (paging + numbering scopes).
- **Two one-line keymap codifications** (keymap owner): the Esc bridge;
  the `Ctrl-L` desk-clear bind.
- **Hygiene, row 17**: registry status flips (FZF-OWNS-LOOP aborted,
  MERMAID-SOURCE-OMITTED landed) and the missing mermaid debrief.
- **explainers/ spice** — the operator's narrative layer, slots ready.

## Verdict

The question that opened the day was "should mnemonics exist." The
answer is now a namespace model, a declared format, a rolled glossary,
and a decision table — and the day's own record is the strongest
argument it produced. *Roger your Roger.*
