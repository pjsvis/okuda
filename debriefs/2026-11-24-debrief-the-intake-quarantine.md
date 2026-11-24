---
type: Debrief
callsign: DBF-INTAKE-QUARANTINE
date: 2026-11-24
tags: [process, documents, gates, render, prose]
agent: pi (pjs, subagent-chat session)
environment: local
briefs: []
source: observed
---

# Debrief: the intake quarantine — a document on trial, and the folder that holds the next one

## Accomplishments

- **The trial:** a pasted "agent authoring guidelines" was refused admission after
  reading, not after taste. It answered no tier's question and made four claims about
  the renderer that `src/` contradicts — soft returns (`src/wrap.ts:12`), the table
  contract (`ADR-TABLE-EDGE-CUT-055`), the paragraph ceiling the playbook holds in
  reserve, and list depth. Extract-then-delete: three sentences survived into
  `PLY-AUTHORING`, `PLY-EAR` and the idea ledger, and the document was removed.
- **The instrument the trial was missing:** `ADR-INTAKE-QUARANTINE-094` — an imported
  original lands **unmodified** in `docs/new/`, landed-dated and carrying its
  `Source:`; admission is a `git mv` out, a refusal deletes. `PLY-REGISTRY` gains
  *Admission — the entrance*: four questions, the imported-original rule, four
  verdicts, the folder's falsifier.
- **Scope:** the document gates decline to read `docs/new/` **on purpose**, through one
  predicate (`QUARANTINE` in `scripts/td-id-lint.ts`) applied at five scan sites. Not
  delivered: the containment meter the fourth question wants — it is an idea in the
  ledger with its trigger fired once, not a build.

## Problems

- **A cost estimate that was wrong by 2.5×.** I told the operator the exclusion would
  be "two lines"; it was five call sites, because the gates enumerate three different
  ways — a flat `scannedFiles` walk, `git ls-files`, and a recursive walk in
  `html-batch`. The operator decided partly on the wrong number. Measured, it is
  still cheap, but the number they bought was mine and it was not the tree's.
- **A declaration that was right in substance and wrong in fact.** The
  `docs-reflow-quarantine` declaration claimed "the four code commits are already in
  main". `git cherry` says only one of the four is patch-identical: the ADR and the
  debrief landed renumbered (088 → 090, `the-legibility-surface`), so the claim was
  true of *content* and false of *commits*. Resolved by reading the branch rather than
  the claim: tagged `archive/docs-reflow-quarantine`, branch deleted, declaration
  dropped, `ADR-LEGIBILITY-SURFACE-090` annotated with the disposition.
- **A gate I did not know existed.** The `callsign` gate also reads the **unpushed
  commit-message range**, and any `td-` token in a message fails it. Found by running
  `just check` after the work was already committed; amended while cheap, as the gate
  itself advises.
- **The operator's own document was the last thing in the way.** Three table cells
  closed their bold *inside* a code span — `` `9P**` `` — so the emphasis never
  closed. Fixed by moving each `**` outside the backticks.

## Lessons Learned

- **A refusal needs a container, or it needs a decision.** The pasted guide had a
  sentence worth keeping and no legal landing zone: `tmp/` is gitignored, so it cannot
  hold evidence; `docs/` under a date prefix claims record status the document has not
  earned. That gap is a property of the corpus, not of the document, and it will meet
  every future import.
- **Read the enumeration before estimating the exclusion.** Every "one small change"
  in this silo should first ask *how many places enumerate this?* — three here, and
  the third one published the folder to HTML.
- **A healed specimen is not a healed class.** The authoring playbook's ship-blocking
  example (a strong span in a frontmatter label) had quietly started parsing; the
  class it named — the unclosed span — still leaks. An example that stops failing
  teaches nothing until someone annotates it.
- **A control that cannot fail is not a control.** The first control document used an
  emphasis leak that no longer leaks and a table that merely wraps, so it passed in
  `docs/` *and* in `docs/new/`. The gate-side count (523/522 tables, 682/681
  documents) was the only thing proving inclusion, and the leak had to be re-shaped
  before the detector was demonstrated to work.

## Observations

### Rendering — the loss nobody could see

- **A placeholder in angle brackets is unrepresentable.** `RE_INLINE_HTML`
  (`src/grammar.ts:33`) is `/<\/?[A-Za-z][^<>\n]*>/`, so it strips any letter-initial
  tag shape — inside code spans too, and the HTML entity escapes nothing. Measured:
  258 tag-shaped occurrences, ~200 of them placeholders across **47 documents**, and
  `git mv <file>` renders as *git mv ,*. Filed as its own defect; not fixed here.
- **A quote is a text container, not a layout container.** `src/render.ts:2260` re-wraps
  the quote's inner text, so paragraphs merge, lists collapse to inline bullets, tables
  become pipe text, and a mermaid fence is echoed rather than drawn. Found on a worked
  example that quoted its own table — the proof vanished.
- **Decorative marks are silent, and `say` proves it.** `say -o` + `afinfo`: 2.252 s
  with `◆` and `███`, 2.252 s without. Art in prose costs the ear nothing and carries
  it nothing.

### Knowledge system — the entrance had no door

- **The exit had a checklist and the entrance had a habit.** `PLY-REGISTRY` could
  enumerate retirements; admissions were whoever remembered. A queue in memory is the
  same defect the exit fixed years ago.
- **One derived row closed three gates.** `PLY-YAYE` had been missing since `1ebb45e`,
  and `callsign` + `census` were red purely in its shadow. The row reg-sync derives is
  its title and carries no date — thin, and now the weakest row in the playbook
  registry.
- **`reg-sync --fix` is safe to run when the drift is understood.** It repaired four
  items and rewrote two generated indexes; nothing unexplained appeared, because the
  expected set was named before running it.
