---
type: Brief
callsign: BRF-MATH-GLYPHS
---

# Brief: The Math Glyph Pass — inline LaTeX to Unicode, closed vocabulary, corpus-gated

**Status:** Draft
**Date:** 2026-09-16
**Origin:** Operator observation — `$\Delta t$` and friends render as
literal LaTeX source in the terminal. All examples were recognised on
sight: the corpus has been speaking math okuda never listened to.
**Predecessor:** none

---

## Intention

Inline math spans (`$...$`) in the corpus currently render as their
raw LaTeX source — `$\Delta t$` on screen, backslash and all. okuda
should render them as the Unicode characters they denote: `Δt`.

Not a LaTeX engine. A closed vocabulary of known tokens, translated
to Unicode, applied at render time in the `text` handler. Nothing
new in the dependency tree; no external tool; no vendor grammar.

---

## Background

Bun.markdown has no math handler; `$\Delta t$` arrives in the `text`
handler as literal source and is printed as-is. A full census of the
corpus (docs/, briefs/, debriefs/, root *.md) found ~60 inline spans
using a small command vocabulary:

- Arrows: `\to`, `\rightarrow` (22 uses)
- Greek: `\Delta`, `\alpha`, `\epsilon`
- Relations: `\le`, `\neq`, `\in`
- Operators: `\times`
- Glyphs: `\S`, `\dots`
- Structure: `\text{...}`, `{,}`, `--` (en dash), `\_`, one `\frac`
- Plain spans with no commands: `$O(1)$`, `$W$`, `$11$` — and, in
  code examples, `${rowStr}` inside fences (fences route through
  `code`/`codespan`, never `text` — structurally exempt).

This is Stuff leaking through the render: authored structure the
terminal displays as decoration. The fix is a substitution pass in
the renderer — a rendering concern, okuda's whole job per the
three-owners test.

The precedent is the state-glyph lexicon (ADR-015's successor,
`STATE_GLYPH_ROLE`): a closed vocabulary the renderer owns, applied
by recognition, not by author syntax.

---

## The design

### 1. The vocabulary table

Corpus-derived. Each entry must have evidence in the corpus (grep
before adding) or be a deliberate mirror of an evidenced sibling
(`\ge` mirrors `\le`; symmetry, not scope creep).

| LaTeX | Unicode | Corpus |
|---|---|---|
| `\alpha` | α | ✓ |
| `\Delta` | Δ | ✓ |
| `\epsilon` | ε | ✓ |
| `\in` | ∈ | ✓ |
| `\le` | ≤ | ✓ |
| `\ge` | ≥ | mirror of `\le` |
| `\neq` | ≠ | ✓ |
| `\to`, `\rightarrow` | → | ✓ |
| `\times` | × | ✓ |
| `\S` | § | ✓ |
| `\dots` | … | ✓ |
| `\text{X}` | X | ✓ |
| `\frac{X}{Y}` | X/Y | ✓ (one use) |
| `{,}` | , | ✓ |
| `--` (inside span) | – | ✓ |
| `\_` | _ | ✓ |

`\frac` is included as `X/Y` (inline string splice, no layout) —
one corpus use, `$P = \frac{F}{A}$` → `P = F/A`. It is the one entry
that is a rewrite rather than a glyph; if it grows teeth in
implementation, drop it and let that span stay literal.

### 2. The all-or-nothing gate

A span translates **only if every `\command` in it is in the
vocabulary**. Otherwise the entire span stays literal — visible
degradation, never partial mangling. `$\zeta$` renders as
`$\zeta$`, not `ζ$` or half-translated wreckage.

This is also the currency guard: `costs $5 and $10` either pairs
into a span with no commands (stays literal) or fails to pair at
all. No command, no translation, no false positive.

### 3. Placement

One regex pass in the `text` handler (`render.ts`), after
`stripHtml`. Code fences and code spans route through their own
handlers and never see it. Blockquotes, tables, list items, and
prose all route through `text` — one pass covers them.

### 4. Parity

Plain Unicode in, no SGR added — NO_COLOR parity is automatic.
`displayWidth` already handles these glyphs (§, …, – appear in
prose today); verify the Greek letters and arrows measure as 1 and
add a test asserting it, since table column math depends on it.

---

## Scope

**In scope:**
- The vocabulary table and substitution pass in the `text` handler.
- The all-or-nothing gate and currency guard.
- Tests: translation, unknown-command literal fallthrough, currency
  false-positive, fence/codespan exemption, table-cell math,
  NO_COLOR parity, displayWidth of every glyph in the table.

**Out of scope:**
- Display math (`$$...$$`) — none in the corpus.
- Superscripts/subscripts (`^2`, `_i`) — none in the corpus.
- Any LaTeX engine or external dependency. If the vocabulary ever
  needs one, the correct move is the mermaid-to-md precedent: an
  external CLI owns the parsing, okuda owns the paint.
- Authoring new math. The pass renders what exists; it does not
  invite more.

---

## Acceptance criteria

- `$\Delta t$` renders as `Δt`; `$\rightarrow$` as `→`; `$\le 10$`
  as `≤ 10`; `$\alpha \in [0.2, 1.2]$` as `α ∈ [0.2, 1.2]`;
  `$0.5–2.0\text{ Hz}$` as `0.5–2.0 Hz`; `$3{,}840\text{px}$` as
  `3,840px`.
- A span containing any unknown command renders exactly as
  authored.
- Text with unpaired or currency `$` renders exactly as authored.
- Fenced code and code spans are untouched — the pass never sees
  them.
- NO_COLOR output is byte-identical apart from the substitution
  itself.
- `just check` passes.

---

## Notes for the implementer

- Single pass, single file, one table, one regex. If it grows
  a second file, something has gone wrong.
- The vocabulary is append-only, like the conceptual lexicon:
  usage-first, grep-gated. New entries arrive with corpus evidence,
  not anticipation.
- Do not translate spans inside the mermaid pipe's placeholder
  machinery or the RAW-tagged blocks — the `text` handler placement
  already guarantees this; preserve it.
