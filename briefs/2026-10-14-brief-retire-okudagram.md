---
type: Brief
callsign: BRF-RETIRE-OKUDAGRAM
---

# Brief: Retire the okudagram term — the render, the frame, and the diagram

**Date:** 2026-10-14
**Status:** In Progress
**Context:** The word names our own artifacts with someone else's work, and it
carries **three referents at once**: the composed screen
(`explainers/concepts-and-terms.md`), the diagrams and the frame (the head
comment of `src/frames.ts`), and `okudaframe` separately. Two definitions of one
word, and no way to tell which is canon.

## Objective

Retire `okudagram` and `okudaframe` from the living surface, name the three
things they were collapsing — **the render**, **the frame**, **a diagram** — and
cite Okuda's work as inspiration rather than wearing it as a prefix.

## Evidence

Measured 2026-10-14 over the tree (`grep -ri okudagram`, `node_modules` and
`.git` excluded):

| area | occurrences | read as |
|---|---|---|
| `docs/` | 95 | **24 dated records** (history, keep) + 4 undated living docs |
| `.archive/` | 38 | permanent record — never touched |
| `briefs/` | 36 | date-prefixed records — keep |
| `debriefs/` | 17 | frozen on completion — keep |
| `playbooks/` | 14 | living — rename |
| `src/`, `tests/`, `scripts/` | 25 | living code and comments — rename |
| `decisions/` | 9 | palimpsest — annotate, never rewrite |
| `explainers/`, `conceptual-lexicon.md`, `&*.md` | 8 | living — rename |

The two-definitions finding, which is the trigger:
`explainers/concepts-and-terms.md` — *"An okudagram is a composed screen"*;
`src/frames.ts` head comment — *"okudagram (the diagrams)"*.

## Scope

**In:** the living surface — `src/`, `tests/`, `scripts/`, `playbooks/`,
`explainers/`, the undated `docs/` references, `conceptual-lexicon.md`, the `&`
panels; the fourth row of `ADR-RENDERER-READER-029`; one ADR.

**Out:** date-prefixed documents (`briefs/`, `debriefs/`, `decisions/` prose,
dated `docs/`, `.archive/`) — history keeps its words, and the ADR is the grave
marker (the rule `ADR-RETIRE-OKW-018` already set). **Callsigns are data**
(`ADR-CALLSIGN-DATA-024`) and are never renamed: `BRF-PAGED-OKUDAGRAM` and
`BRF-OKUDAGRAM-STEP` are cited across the corpus, and a rename breaks the
checksum.

## Preconditions

- [x] `ADR-RETIRE-OKW-018` establishes the protocol for this class.
- [x] `ADR-RENDERER-READER-029` left the composite unnamed, so the replacement is
      a fourth role and not an invention.
- [ ] No file rename may orphan a reference that cannot be reached — every
      renamed path is recorded in the ADR.

## Work Plan

1. [ ] The ledger entry, promoted (the first promotion the ledger records).
2. [ ] `ADR-RETIRE-OKUDAGRAM-066`, plus the in-place annotation on
       `ADR-RENDERER-READER-029` (the decisions playbook's checklist item).
3. [ ] The code surface: comments in `src/`, `tests/`, `scripts/`, and the
       `frame-probe` rename.
4. [ ] The living prose: five playbooks, the explainers, the lexicon candidate
       list, the `&` panels, the four undated `docs/` references.
5. [ ] `just check` green; `bun test` green.

## Acceptance Criteria

- No occurrence of the term survives outside a date-prefixed path, an `.archive/`
  path, a callsign, or the ADR that retires it — and that is checkable:
  `grep -ri okudagram` minus those sets is empty.
- The three referents have three plain names, and the composite's name completes
  `ADR-RENDERER-READER-029` rather than appearing from nowhere.
- Every renamed path is named in the ADR, so a dated record's pointer to the old
  name is explained where it is not rewritten.
- `README.md` still attributes the inspiration, in prose, without a prefix.
- `just check` and `bun test` pass.

## Notes

- **The tidy is structural: no behaviour changes**, except one tool message
  (the `facade-lint` failure line), which is called out in the commit body.
- **Not a `sed`.** The three referents were being collapsed by one word, so a
  blind substitution would write claims that are not there — an unpaid claim in
  every line. Each occurrence is read and given the referent it has.
- The word appears in this brief's own callsign, which is correct and precedented
  (`ADR-RETIRE-OKW-018` names OKW the same way): a retirement must be able to
  name what it retires.
