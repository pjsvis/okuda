---
type: Brief
callsign: BRF-HTML-PACKAGE
date: 2026-11-05
---

# Brief: The package — a document and its one-hop closure, in one file

**Date:** 2026-11-05
**Status:** Done — 2026-11-05. `just html-verify` measures twelve checks in
Chrome; `just check` rc=0. The mechanism decision is `ADR-PANEL-NOT-DOOR-081`.
One defect deferred with an owner in the task ledger: the close control scrolls
away inside an open panel.

---

## Context

okuda renders markdown to coloured bytes for a terminal, and its silcrow
dereference is a swap-and-return that HTML does not provide. The operator's
proposal — a panel that takes the viewport and slides back — was measured
against Chrome 156 and holds, with one trap. This brief builds the artefact: a
single self-contained HTML file holding a main document and its one-hop
references, dereferenceable without losing the reader's place.

## Objective

Publish a markdown document as one HTML file that a reader can read,
dereference one level, and return from to the same place.

## Evidence

Measured 2026-11-05, Chrome 156.0.8078.73, driven over CDP. The spike is
`/tmp/spike/` and is **not committed** — it is a measurement, not a fixture.
Document height 1054px, maximum scroll 585px.

**The scroll return, and the trap.**

| step | `scrollY` | `:target` | verdict |
| --- | --- | --- | --- |
| scroll to y=1200 | 585 | — | clamped to the document's maximum |
| open `#dec-027` | 585 | true | opening does not scroll |
| close via `#_` (unmatched) | 585 | false | **the return to place holds** |
| close via `#` (empty) | **0** | false | **the trap: the empty fragment scrolls to top** |
| open, then `scrollBy(0,400)` | 585 | true | the body does not move behind the panel |

**The bound, the history, and the panel's own scroll.**

| step | result |
| --- | --- |
| open panel A | A is `:target`, B is not |
| open panel B from inside A | **A closes, B opens** — `:target` is singular |
| `history.back()` | returns to A |
| `history.back()` again | closes; `scrollY` 585 preserved |
| `history.forward()` | reopens A |
| `scrollTop = 200` inside A | 76 (clamped; `scrollHeight` 545 > `clientHeight` 469) |

Five findings, and the third is the one that shapes the design:

1. **The return to place holds, and it holds for a reason.** The panel is
   `position: fixed`, and a fixed element has no scroll position — so the
   fragment resolves without moving the page. This is not luck; it is the
   mechanism.
2. **The close control must use an unmatched fragment.** `#` scrolls to the
   top. This is the one trap, and it is silent: the panel closes correctly and
   the reader is simply somewhere else.
3. **`:target` is singular, so the one-level bound is enforced by the selector,
   not by our code.** Only one element can be the target; opening a second
   panel closes the first. The invariant `jumpTo` enforces with an early return
   (`ADR-DEREFERENCE-MARK-075`) is enforced in HTML by CSS selector semantics.
4. **`history.back()` is the terminal's `back` key**, and it preserves the
   scroll position. The reader gets the affordance they already have.
5. **The body does not scroll behind the panel.** `overflow: hidden` on the
   body is not needed; the fixed panel captures the scroll.

**Finding 3 has a consequence that must be built, not assumed.** Because a
panel's silcrow *would* work — it would replace the panel — the panel's
silcrows must be rendered **inert**. If they were live, the bound would be a
lie and `back` would walk a stack: the N-level hypertext this design refuses.

**The emitter already exists.** `Bun.markdown.html()` handles paragraphs,
lists, tables, links, inline styles and code. Three gaps, each with an exported
fix already in the tree:

| block | what `html()` emits | the fix | exported at |
| --- | --- | --- | --- |
| diagrams | `<pre><code class="language-mermaid">` | run `mermaid-to-md`, emit `<figure>` | `extractDiagramArt`, `src/render.ts:444` |
| maths | literal `$\vec{g}$` | the glyph pre-pass | `applyMathGlyphs`, `src/render.ts:2051` |
| state glyphs | plain `☐ ✓ ⋮ ✗` | wrap in `<span class="state-…">` | `STATE_GLYPH_ROLE`, `src/render.ts:122` |

Two shortcuts were measured and are closed: `html()` **ignores** a handlers
argument, and `render()` with partial handlers falls back to **plain text**,
not HTML. It is `html()` plus post-passes, or a full second emitter.

## Scope

**In:**

- A CSS stylesheet transcribing the 25 palette roles as custom properties, plus
  the type scale and the block vocabulary (`docs/style-guide.md` is the spec).
- A build script: `applyMathGlyphs` → `Bun.markdown.html()` → mermaid post-pass
  → state-glyph post-pass → template. Invoked as `just html <file>`.
- The dereference layer: address-line detection, a receipt in the flow, a
  `:target` panel holding the full render, inert silcrows inside panels,
  `@media print`, and a declared accessibility limit.
- One file out, no external references.

**Out:**

- **N-level dereference.** The bound is the design.
- **JavaScript.** The artefact is a document, not an application.
- **Webfonts.** Typography is the reader's, per `ADR-GLASS-INK-073` — the same
  ruling that gives the glass its ink gives it its glyph coverage.
- **An `--html` flag on the binary.** An HTML pipeline is a compositor, and
  compositing belongs to the environment (`AGENTS.md`, three concerns). The
  script lives in `scripts/` and may import okuda's exports; the binary's
  contract is unchanged.
- **Editing, the TUI, and the terminal renderer.** Untouched.

## Preconditions

- [ ] `Bun.markdown.html()` emits the block roster — **verified 2026-11-05**.
- [ ] The four exported functions exist at the cited lines — **verified**.
- [ ] Chrome is available for verification — **verified**, 156.0.8078.73.
- [ ] `just check` is green before the first commit.

## Work Plan

1. [ ] **The stylesheet.** 25 roles as custom properties, the type scale, the
       bold-lead list, the state-glyph lexicon, the diagram block
       (`white-space: pre; overflow-x: auto` — a diagram never wraps).
2. [ ] **The pipeline.** `scripts/html-package.ts` plus a `just html` recipe.
       Maths as a pre-pass on the source; state glyphs as a post-pass that
       skips `<pre>` and `<code>` regions.
3. [ ] **The dereference layer.** Detect address lines (`RE_ADDRESS_LINE`,
       `src/render.ts:78`), resolve with `resolveAmongCallsigns`
       (`src/root.ts:215`), emit a receipt in the flow and a panel holding the
       full render. The close control uses an **unmatched** fragment.
4. [ ] **Render `docs/style-guide.md` through it** and read it as the demo of
       itself — the honest test of whether the look survives the move.
5. [ ] **Verify** against the acceptance criteria, including a re-run of the
       spike harness against the generated file.

## Acceptance Criteria

- `just html docs/style-guide.md` writes exactly one file, and that file
  contains no external reference: no `src=`, no `href="http`, no `@import`, no
  `url(` pointing off-file.
- The file opens offline and renders the full block roster: paragraphs, loose
  lists, tables, a mermaid diagram as ASCII, and maths glyphs.
- An address line opens a panel; the close control returns to the **same
  `scrollY`** — measured by the spike harness, not by eye.
- A silcrow inside a panel is **not** a link.
- `@media print` shows the main document and hides every panel.
- `okuda --help` is unchanged: no `--html`.
- `just check` passes.

## Notes

**The accessibility limit is declared, not solved.** A `:target` panel is not a
dialog to the accessibility tree: no focus trap, no `aria-modal`, no ESC. The
alternative — `<dialog>` with `showModal()` — has all three and loses the
address, because its open state is not in the URL. Nothing native gives both.
This brief takes the address and declares the gap, on the rule that *a gate
that states its limit is not a false signal*. If the gap is judged
unacceptable, the fallback is ~15 lines of JavaScript and `history.pushState`,
and the trade flips cleanly.

**The receipt is the default, not the full inline.** The lexicon's test is
*can the reader see the whole dependency set without visiting any of it* — a
receipt satisfies it. Full inline satisfies it too, at a cost that buries the
main document. The panel dissolves the dilemma: receipt in the flow, territory
in the panel, no navigation between them.

**The file will be fat.** Mitigate with `content-visibility: auto` on the
off-screen panels, and dedupe a document referenced twice into one panel with
two summaries. Verify `content-visibility` support at build time rather than
trusting recollection.

**The ADR is written at build time, not now.** The mechanism decision
(`:target` over `<details>` over `<dialog>`) is recorded here with its
measurement; it becomes an ADR when it is enforced by a test. `ADR-075`'s
lesson is that a decided mark sat unbuilt for a month — an ADR for unbuilt work
is the same trap in a different register.

**The line hint stays prose.** A `path:NN` address keeps its line in the
summary text; the `href` goes to the file, not to a `#L12` anchor
(`ADR-LINE-IS-PROSE-078`: pass-through, not map).

## Related

- `ADR-DEREFERENCE-MARK-075` — the silcrow, and the binary state this brief
  maps onto `:target`
- `ADR-GLASS-INK-073` — the glass owns its ink; the same ruling gives it its
  glyph coverage
- `ADR-LINE-IS-PROSE-078` — the line is prose, not a coordinate
- `docs/style-guide.md` — the author's spec for the look
- `docs/2026-08-20-origin-doc.md:47` — HTML pipelines out of scope, which is
  why this is a script and not a flag
