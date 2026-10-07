---
type: ADR
callsign: ADR-PROSE-BREAKS-056
date: 2026-10-07
---

# Decision: Prose whitespace is inert — the only break signal is a visible backslash

**Date:** 2026-10-07
**Status:** Accepted
**Diverges from:** CommonMark, deliberately and in one place (see Decision).

## Context

The operator edits documents in Zed and re-renders, and reported that removing
cruft left dodgy formatting that changed the layout — so the edit felt unsafe, and
the conclusion drawn was *"our edit thing is useless"*.

Measured, the cruft was in fact harmless: prose soft line breaks are joined, runs of
spaces collapse, indented code is flattened to prose, and only fenced code keeps its
bytes. One real gap sat underneath, and it was in the opposite direction: **a hard
break is currently collapsed to a space**, so two trailing spaces — CommonMark's
`<br>` — are silently ignored. The author had no way to force a line break at all.

That gap is what makes the complaint structural rather than cosmetic. CommonMark's
hard break is written with an **invisible character**: a residue a delete leaves
behind, a paste drags in, an editor trims or does not depending on a setting the
author may never have considered. A signal that cannot be seen on the glass cannot be
intent — the house already holds that as *state outside the text does not exist*, and
has a name for the other side of it, the unpaid claim: a statement carrying neither
citation nor proposal mark. **A whitespace signal is an unpaid claim.** Honouring it
would make every text edit a layout operation, which is what the operator felt.

## Decision

**In prose, whitespace is editorial and inert. The only break signal okuda honours is
a trailing backslash — visible on the glass, robust to every editor's whitespace
settings, and impossible to produce by accident while deleting text. Two or more
trailing spaces are collapsed like any other run of whitespace.**

The divergence from CommonMark is the point and is stated as such: we take the half of
the rule where intent is legible and refuse the half where intent is invisible. Where
lineation genuinely matters, it is declared by a **block** — a fence, a list, a table —
or by a mark the author can see.

## Alternatives Considered

| Alternative | Why Rejected |
|---|---|
| Honour CommonMark exactly: two trailing spaces are a break | Promotes an invisible character to a control code. Every delete, paste and editor setting becomes a layout input, so an edit stops changing only what it changes. This is the defect the operator reported, one commit before it existed. |
| No break signal at all; prose is pure flow | The author loses all control of a line break, and composed prose does need one occasionally. The reader's two levers — widen, or reflow — do not cover a break that is part of the writing. |
| A block-level construct for lineation (a one-item list, a div) | Fences, lists and tables already declare their lineation, and prose that needs a structural break has stopped being prose. Refuse the escape hatch; the backslash is cheaper and visible. |
| Both signals, with the space form marked in the record as fragile | Two mechanisms for one meaning, and the fragile one is the one an editor will silently produce. Ambiguity about intent is worse than a divergence from the spec. |

## Consequences

**What became easier:**
- Editing is safe by construction, and it is now a *property* rather than a promise:
  **a text edit changes only what it changes.** Re-wrapping a paragraph at a different
  column, doubling its spaces, padding it with blank lines, or deleting a word leaves
  the render identical modulo the deleted word. This is asserted, not asserted-about
  (`tests/prose-breaks.test.ts`).
- The author's control of a break is restored, and it is legible: the mark is on the
  glass, so two parties can see *and audit* the same intent.

**What became harder:**
- We are out of step with CommonMark on one point, and a reader who knows the spec will
  expect two trailing spaces to work. The divergence has to be stated where authors
  look, not only here.
- Trailing whitespace in prose is now guaranteed to be inert, which means a document
  whose rendered form depends on it cannot exist. That is the intent, and it will
  occasionally refuse a habit.

**Constraints this imposes:**
- **The backslash marker is deferred, not scheduled** (operator, 2026-10-07: *"we do
  not need to implement the backslash break, yet, if ever"*). The rule above stands on
  its own — prose whitespace is inert and no invisible mark carries meaning — and the
  edit-safety invariant does not depend on the marker at all. Not building it makes the
  invariant **absolute**: with no character-level channel in prose whatever, *a text
  edit changes only what it changes* holds without exception, which is a stronger
  property than the one this ADR was written to protect. If it is ever built, the
  design is fixed here: the break must be consumed **before wrapping**, as a
  control-character token split in the paragraph handler and turned into real line
  breaks between wrapped segments — and the paths that must consume it are named, so
  the next reader does not have to find them (the paragraph handler's plain, vector,
  mermaid and described exits, plus a sweep at finalize for any path that forgets).
- A hard break is not a paragraph break: it stays inside one block, so it does not
  earn the blank line that separates paragraphs.

## Related
- `docs/2026-10-06-the-shared-artifact.md` — *state outside the text does not exist*;
  the actuator argument this applies to whitespace
- ADR-004 — okuda hard-wraps; the terminal is never asked to reflow what we emit
- ADR-UNIVERSAL-ELISION-050 — the elision marker as the precedent for *the marker names
  the verb*, which is what makes a visible mark a signal and an invisible one a residue
- `tests/prose-breaks.test.ts` — the edit-safety invariant, as the gate
