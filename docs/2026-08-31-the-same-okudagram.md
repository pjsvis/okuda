# The same okudagram? — back navigation and what "same" means

> Logged 2026-08-31. Status: **discussion** — the question is answered by
> code that already ships; the interesting part is *why* the answer is
> clean, and what it obligates. Citations are file:line against
> `src/tui.ts` on `main`.

> **Terminology (2026-10-14).** The word *okudagram* is retired — the composite is **the render**, one portion is **the frame**, a drawing is **a diagram** (`ADR-RETIRE-OKUDAGRAM-066`). This record keeps its words; the ADR is the map.

## The question

Render an okudagram. It has vector links. Follow one to another
document. Press `u`. Do you end up back on the same okudagram you
started from?

## The answer: yes — where "same" means *same composition state*

The backstack records `{ file, scroll }` — the **position, not the
pixels** (`src/tui.ts:463`). On `u`, `back()` re-reads the source,
re-renders it, and calls `present(fetch, next, prev.scroll)` — which
runs the returned view through `reanchoredScroll` (tui.ts:512, 200):
the **eye-proxy anchor** — the non-blank line nearest the viewport
middle — is re-matched in the fresh layout (bounded text-match first,
proportional fallback), and the viewport re-anchors to it.

So the okudagram you return to is the same *composition state*: same
document, same content position, re-composed. Not a screenshot — a
re-render. The distinction is the design.

## Why it's clean: the render is a pure function

`okudagram = f(source, width, palette)`. Deterministic. Which means the
backstack never needs to store rendered bytes, screenshots, or buffers —
just the return address and a scroll integer. **Because the render is
deterministic, back navigation stores position, not pixels.** This is
the hot-potato rule at the memory level (ADR-027): the state held is
exactly as large as the question requires — a path and a number — and
no larger.

If the render were *not* deterministic — if styling depended on
history, if layout cached ambient state — the backstack would need
snapshots, and back navigation would become a state-restoration system.
The determinism is what makes `u` cheap, and the cheapness is why the
vocabulary is comfortable.

## The three ways "same" could drift — and how each resolves

1. **The source changed while you were away** (fs.watch, or someone on
   another pane): the re-render differs, and `reanchoredScroll`
   re-matches the anchor *by content* — you return to the same logical
   position in the updated composition. Correct: the okudagram is about
   the document, not about a moment.
2. **The width changed** (resize in the other document's lifetime, or
   the host zoomed): same re-anchor, proportional fallback — the
   okudagram re-composes for the new glass. You return to the same
   *reading state*, redrawn.
3. **The target vanished** (file deleted while away): `back()` stays
   put and drops the entry — silent, honest degradation
   (tui.ts:548). The same rule as a dead jump token: the map is
   source-derived, and sources can die.

## The boundary condition that keeps it honest

The backstack is a **chain**, not a pair: jump from A to B to C, and
`u` walks C → B → A, each hop with its scroll re-anchored. This is
deeper than the desk's "two levels" — and that's consistent, because
the desk rule governs *panes and prompts*, while the backstack governs
*the reading path within a pane*. The desk-clear (`Esc-Esc`, a future
`Ctrl-L`) resets the whole chain in one gesture: recursion in cycles,
reset at will.

## Open question (for the links brief)

`BRF-DOCUMENT-LINKS` specifies cross-document links pushing onto the
same backstack — *at the previous scroll*, reusing this machinery. The
machinery is ready (`jumpTo`/`back` are source-agnostic); the open
question is whether link-follows and jump-tokens share one stack or
keep separate ones. One stack is simpler; two stacks would let a link
walk and a jump walk be unwound independently. Nothing here forces the
answer — flag for the brief's implementation.

## Related

- `src/tui.ts` — `backstack` (463), `jumpTo` (535), `back` (544),
  `reanchoredScroll` (200)
- Brief: `briefs/2026-08-26-brief-document-links.md` (the backstack
  reuse, "at the previous scroll")
- Doc: `docs/2026-08-30-search-conventions.md` — the three breadcrumbs
  (the backstack is the *path* breadcrumb)
- ADR: `decisions/004-hard-wrap-mandate.md` — the determinism ancestor:
  okuda owns every newline, which is why the same inputs give the same
  bytes
