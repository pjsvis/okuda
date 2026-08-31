---
type: ADR
callsign: ADR-WIRE-FORMAT-026
---

# Decision: The wire format — one grammar, two forms, paint decoupled

**Date:** 2026-08-31
**Status:** Accepted

## Context

The jump-wire token — the invisible machine directive that lets a line of
markdown carry its own navigation — has drifted through proposal space
faster than it has been declared. Today the corpus holds one shipped grammar
(`%%okuda-rhs:NN%%`, consumed by `extractJumps` in `src/tui.ts`, recognised
by `src/grammar.ts`, emitted by `scripts/reg-menu.ts`, pinned by four test
files) and at least two competing proposals in concurrent documents:
`docs/2026-08-31-okuda-precedents.md` proposes a terse parser
(`<!-- #NN -->`, `<!-- vrl:NN -->`) and a bracket-paint visual (`[11]`);
`docs/2026-08-30-from-babylon-to-the-stars.md` illustrates a third shape
(`[NN] ──► path`). Meanwhile the producer count has already crossed the
second-producer threshold flagged in ADR-025's discussion: `&alpha.md` and
`&briefs.md` are hand-authored wires, and assignment-table vectors
(AI-authored, operator-directed) are an imminent third.

An undeclared interface with multiple producers and rival proposals is not
a convention — it is a fork waiting for a compiler. This ADR is the
declaration.

## Decision

**1. The grammar is `%%okuda-rhs:NN%%`.** `NN` is the two-digit token,
11–99 by convention (ADR-021's offset; the `\d{1,2}` regex is retained for
tolerance, the convention is enforced by people and lints). The namespace
prefix `okuda-rhs` is load-bearing: it makes every wire in the corpus
greppable and self-identifying, and it cannot collide with legitimate HTML
comments.

**2. Exactly two source forms.**
- *Paragraph token* — trailing `%%okuda-rhs:NN%%` on a one-line list item;
  the item's slug renders left, the number bold at the right.
- *Table-cell wire* — `<!-- %%okuda-rhs:NN%% path.md -->` in a table cell;
  the path inside the comment is the jump target (the `extractJumps`
  contract: last `.md` on the line wins).

**3. Declared stable public interface.** Producers beyond `reg-menu` —
`&`-family vectors, assignment tables, AI authoring — are legitimate and
expected. The grammar changes only by a deliberate, versioned successor
decision; it never changes by drift. Until such a decision, any document
proposing an alternative parser is a design exploration, not a spec.

**4. Paint is decoupled — and the bracket verdict is adopted as paint.**
What the renderer draws (bold RHS number, bold inline, bracket form
`[11]` in OKLCH accent, BBS/lynx cadence) is renderer policy per surface,
decided by the visual precedents and the palette lexicon — never by the
wire. The precedents document's visual analysis is adopted as paint
direction *credited in full*; its parser proposals are considered and
declined. A paint change requires no producer migration; that separation
is the point.

## Alternatives Considered

| Alternative | Why Rejected |
|---|---|
| `<!-- #NN -->` terse wire | Loses the greppable namespace (`rg okuda-rhs` finds every wire; `rg '#[0-9]'` finds every comment); collides with legitimate HTML comments containing `#`; breaks the installed base for five characters nobody sees |
| `<!-- vrl:NN -->` second namespace | Two wire grammars means two parsers, two test suites, two drift surfaces — the fork this ADR exists to refuse |
| `[NN]` as *source* syntax | Brackets collide with markdown link syntax and render visibly in foreign renderers; brackets are paint, and paint is already free |
| Defer declaration until a fork actually ships | The fork proposal is already in the corpus, dated today; declaration after implementation is an obituary, not a decision |

## Consequences

**What became easier:**
- Producers author with a contract: any tool — compositor, agent, operator
  on a Friday afternoon — may emit the two forms and be rendered correctly,
  forever.
- Paint can evolve freely. The bracket cadence, a future glyph, an OKLCH
  accent — all downstream, none breaking a single wire.
- The audit-vector pattern (assignment tables listing callsigns) inherits
  a stable substrate on day one.

**What became harder:**
- Hand-authors type a verbose token. Accepted deliberately: the verbosity
  is the greppability, and the primary author is increasingly the machine.
- The declaration must be respected in exploration documents — proposals
  to change the grammar must cite this ADR and argue a version bump, not
  silently demonstrate an alternative.

**Constraints this imposes:**
- Consumers keep the NO_COLOR-parity scanability contract (rendered
  headers must remain scannable as content); the paint layer may not
  introduce a second wire channel.
- Tokens stay ephemeral (session codes, never jotted); the durable codes
  remain callsigns per ADR-025. This ADR governs the wire, not the
  namespace model.

## Related

- ADR: `decisions/025-mnemonic-namespace-model.md` (namespace model; the
  second-producer threshold this ADR formalises)
- ADR: `decisions/021-jump-token-numbering-offset.md` (the 11–99 space)
- Doc: `docs/2026-08-31-okuda-precedents.md` (visual precedents — paint
  direction adopted; parser proposals declined with reasons above)
- Doc: `docs/2026-08-30-from-babylon-to-the-stars.md` (the `[NN] ──►`
  illustration; illustrative, not wire)
- Code: `src/tui.ts` (`extractJumps`), `src/grammar.ts` (`RE_RHS_TOKEN`,
  `RE_RHS_WIRE`), `scripts/reg-menu.ts` (the first producer)
- Tests: `render.test.ts`, `tui.test.ts`, `jump-demo.test.ts`,
  `reg-menu.test.ts` (the conformance suite, existing)
