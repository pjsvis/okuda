---
type: ADR
callsign: ADR-BODY-INK-072
date: 2026-10-28
---

# Decision: Prose gets a role — and it ships empty

**Date:** 2026-10-28
**Status:** Accepted
**Enforced by:** `tests/render.test.ts` — *body ink — a role for the ground, empty by
default*: the default emits no escape before prose, a declared hex paints prose,
list text, table cells and menu rows, an inner role hands the ground back, and
`NO_COLOR` output is unchanged.

## Context

`Role` carried a colour for every class in the grammar except the one that covers
most of the pixels. `src/palette.ts` named headings, fences, quotes, links,
emphasis, both table roles, the diagram channels, doc-refs, the vector paint and
four state lamps — and prose, list text and table cells inherited whatever
foreground the glass happened to have (`src/render.ts`, `paragraph` and the cell
loops, before this decision).

That is not a neutral position; it is an unfilled role. Its practical cost
surfaced as a report from the principal — *"the default text colour is too
bright for me"* — arriving attached to a proposal that would have attenuated
prose **per block, by line count** (pasted from a model conversation, deleted
once it had served its purpose). The proposal was refused: it keyed ink on a
measured width, which makes prose brightness a function of the pane, breaks
attributability (two identical paragraphs, two inks, no reason visible from the
page), and manufactures emphasis the author did not write. That refusal is
recorded in the alternatives below, because the same pressure will arrive again.

## Decision

**`body` is a palette role, and it ships empty (`""`), which means "emit
nothing" — prose inherits the glass's own foreground.** A principal who wants
dimmer prose declares a hex in `~/.config/okuda/palette.json`; no preset ships
one. Body ink is applied as the **enclosing** run (prose, list text, table cells,
addresses, a described diagram's sentences) so every inner role keeps its own ink
and hands the ground back after its reset.

## Why empty, and why that is permanent

A body hex is the only colour in the palette whose correctness depends on
something the renderer cannot see: the glass's background. Accents tolerate a
wrong guess; body text is nearly every pixel, so the same hex is either right or
unreadable, and it is unreadable on the operator's own machine at 3am. Querying
the background (OSC 11) is a request the renderer has no business making and no
reliable answer to.

So the default is the *only* defensible one, and the role exists to be
**declared**: the override file is the dial. This is `code-background`'s contract
one role over (`src/palette.ts`), and it generalises it — `loadPalette` now allows
`""` for **any** role rather than special-casing the two that ship empty, so the
next role that wants to say "no ink" needs no code.

## Alternatives Considered

| Alternative | Why Rejected |
|---|---|
| Ship a default hex in the presets | Correct only by accident: the ground is unknowable from inside the byte stream. A grey tuned on a dark terminal is catastrophic on a light one, and body text is where that failure is unreadable rather than merely ugly. |
| Attenuate dense prose per block, keyed on wrapped line count | The proposal that prompted this one. Ink would become a function of the **pane** — the same paragraph brightens as the window widens — which is a *cap the reader cannot buy* in `ADR-PROSE-MEASURE-071`'s sense, arrived at from the other direction. Also non-attributable (length would silently mean weight) and it steals the author's own emphasis. Line count is already the scan channel (`docs/style-guide.md`, *Never tidy the right edge*). |
| A `--body <hex>` flag | A second path to a preference the override file already carries. The dial exists; a flag would be a second dial with its own drift. |
| Paint the whole document at `finalize` | One call site, but it repaints at every reset in every block — fences, art, headings — and leaves the byte stream littered with no-content ink runs. Block-level, at the leaves, keeps the ink where the prose is. |
| Leave it unfilled | The report is real, and the gap means the principal's only remedy is editing their terminal theme, which changes every program they own. |

## Consequences

**What became easier:**

- **The principal can dim their prose** without touching the renderer, the
  terminal theme, or any other program on the machine.
- **The role set is complete**: every class the grammar can produce has a colour
  it can be given, including the ground.
- **One rule, no special cases**: `""` means "no ink" for every role, so
  `loadPalette`'s validation is now a single predicate rather than a branch that
  named `code-background` by hand.

**What became harder:**

- **A nested-list flatten had to learn about escapes.** The depth-cap flatten
  strips a leading marker with `^\s*`, which stopped matching once ink sat in
  front of the indent. It now strips the leading escapes and the marker
  together; the flattened tail is re-inked by the caller so a deeply nested item
  is not the one bright run in a dimmed paragraph.
- **Body ink is a run, not a line.** Every emitter that touches it must apply it
  *around* composed text, never inside the width math — the padding and elision
  primitives are ANSI-aware, so this holds, but a future emitter that forgets
  will emit an escape into a measured slot.

**Constraints this imposes:**

- **No preset may ship a `body` hex** without a background query that does not
  exist. A future "dim palette" is a *named preset* the principal selects —
  never a default.
- **Body ink must stay a document constant.** Moment the weight varies per
  block, by length, density or viewport, the reasoning in
  `ADR-PROSE-MEASURE-071` applies again and the answer is still no.
- **Reference point:** `docs/style-guide.md` gives the method for choosing the
  hex if one is ever wanted in a preset — hold hue and chroma, drop OKLCH L.
  Never guess a new hue.

## Related

- `ADR-DEFAULT-PALETTE-011` — the preset tables are the single source of hex; the
  empty default keeps that true, since `""` is not a hex.
- `ADR-PROSE-MEASURE-071` — the reversal this decision is a consequence of, and
  the source of the *declaration, not a cap* rule.
- `ADR-PRINCIPAL-CLERK-067` — the principal is whoever must read; the dial is
  theirs.
- Code: `src/palette.ts` (`Role`, `loadPalette`), `src/ansi.ts` (`role`'),
  `src/render.ts` (`bodyInk`), `src/palettes/okuda.json`.
