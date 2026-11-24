---
type: ADR
callsign: ADR-MARKUP-VOCABULARY-095
date: 2026-11-24
---

# Decision: Markup is a vocabulary, not a shape — and a code span is verbatim

**Date:** 2026-11-24
**Status:** Accepted
**Enforced by:** the `markup` gate — `bash scripts/gates.sh markup`, which runs
`tests/render.test.ts`: four cases (a placeholder survives in prose, a code span keeps
its tags, a real element is stripped in prose and kept in code, an unlisted tag renders
as text) beside the pre-existing rejections (an HTML block is discarded whole, a
comment is swept). The gate row was added with this decision: these tests were run by
hand only, and a rule whose control is a habit is not enforced.

## Context

The closed grammar refuses raw HTML, and it enforced that with one matcher:
`/<\/?[A-Za-z][^<>\n]*>/` — *any* letter-initial tag shape. Two kinds of author text
are shaped like a tag and are not markup, and both were deleted silently:

- **Placeholders.** `<file>`, `<callsign>`, `<query>`, `<path>`. Measured 2026-11-24:
  258 tag-shaped tokens in the corpus, roughly 200 of them placeholders across 47
  documents. A command example reads `git mv <file> <dir>` in the source and
  `git mv ,` on the glass.
- **Real HTML in a code span.** CommonMark makes a code span verbatim, and the strip
  ran over code anyway — Bun delivers codespan content to `text` before the
  `codespan` handler sees it. So `decisions/081-the-panel-not-the-door.md` rendered its
  own title as *"`:target` over and , and the accessibility gap declared"*: a decision
  record could not print the two tags it was about.

The line between markup and text was drawn by *shape*, which cannot tell `<em>` from
`<file>`, and by *position nowhere*, which ignored the one place the grammar promises
verbatim bytes. Both are the same fault: the renderer guessed.

## Decision

Strip what names an element the platform would have parsed, in prose only; leave every
other tag-shaped token to the author, and never touch code.

## Alternatives Considered

| Alternative | Why Rejected |
|-------------|--------------|
| Keep the shape matcher, fix the corpus | 200 placeholders cannot be made to render, only removed; the defect returns the next time someone writes `<file>`, and the ADR about `<details>` still cannot say so |
| Exempt code spans only | Fixes the ADR title and the command examples, leaves prose placeholders vanishing — half the census |
| Suppress the strip entirely | Raw HTML blocks would render as noise, which is the one thing the closed grammar exists to prevent |
| Strip by a known *shape list* of placeholders | Inverts the problem: an unbounded list of forgettable exceptions against a bounded list of HTML elements |

## Consequences

**What became easier:**

- A document can name a file, a call sign, a query, or an HTML tag. The corpus's 200
  placeholders and one SSML document render as their authors wrote them.
- The rule is stateable in one line: *a tag shape renders as text unless it names an
  element the platform would have parsed.* The previous rule could only be stated as
  the regex.

**What became harder:**

- The vocabulary is a list, and a tag missing from it now renders as text instead of
  vanishing. That is the safe direction — visible, not deleted — but it is a list
  somebody must extend rather than a shape that holds for free.
- Two pre-passes now share the same structural receipts: a fence state machine and a
  backtick split (`src/render.ts`), because the parser will not say which `text` events
  are code. Both must stay in step, and both cite this ADR.

**Constraints this imposes:**

- A **block-level** tag opening a line is left for the parser: stripping it first would
  turn a discarded HTML block into a paragraph of its own text, which is a different
  behaviour and a worse one. The block-start list is CommonMark's, not a taste.
- **Comments** stay in the handler pass, not the pre-pass, because the table menu
  wiring must be recognised before it is swept (`ADR-ROLE-LAYOUT-022`).

## Related

- Playbook: `PLY-DEFECT` — the kind is *forced*; the fix changes documented behaviour,
  so `docs/showcase.md` is amended in the same change, the superseded claim left
  standing beside the new one.
- ADR: `ADR-ROLE-LAYOUT-022` (the wiring comment's path), `ADR-GLOW-VISUAL-007`
  (the closed grammar)
- Defect: the placeholder case was found while landing `ADR-INTAKE-QUARANTINE-094`.
