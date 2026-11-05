---
type: Debrief
callsign: DBF-PANEL-NOT-DOOR
date: 2026-11-05
briefs: [BRF-HTML-PACKAGE]
---

# Debrief: The package — a document and its one-hop closure, in one file

**Status:** Done — `main` is `6b0f1d4` plus this record, `just check` rc=0,
`just html-verify` twelve checks green. One defect deferred with an owner in the
task ledger, and the mechanism decision recorded as `ADR-PANEL-NOT-DOOR-081`.

## What was asked

A question, not a brief: *could we build a CSS stylesheet that presents our okuda
render in HTML only, without the resize capability?* Then, over one session, a
product: a document published as one self-contained HTML file, linked from a blog
post, opening in its own tab, with its references dereferenceable and the reader
returned to where they left.

## What was found

**The emitter already existed.** `Bun.markdown.html()` covers the block roster —
paragraphs, lists, tables, links, inline styles, code. The three gaps each had an
exported fix already in the tree: `applyMathGlyphs` for maths, `extractDiagramArt`
for the mermaid pipe, `STATE_GLYPH_ROLE` for the glyph spans. The work was three
post-passes, not a second renderer.

**Two shortcuts were measured and closed.** `html()` ignores a handlers argument;
`render()` with partial handlers falls back to plain text, not HTML. Both were
tested rather than assumed, and both would have cost a day if assumed the other
way.

**The return to place is a fixed element, not a stack.** The terminal's `back` pops
a `backstack`; HTML has no such thing. The panel is `position: fixed`, and a fixed
element has no scroll position, so the fragment resolves without moving the page.
Measured: 3,145 → 3,145. The mechanism is the reason, not luck.

**`:target` is singular, so the bound is enforced by the selector.** Opening a
second panel closes the first. The invariant `jumpTo` enforces with an early return
is enforced here by CSS selector semantics — which is why a panel's own silcrows
must be rendered inert. If they were live, the bound would be a lie and `back`
would walk a stack.

**The trap is silent.** The close control must use an *unmatched* fragment. `#`
scrolls to the top, so the panel closes correctly and the reader is silently
somewhere else. The gate now checks it.

## The lessons, in order of how much they cost

**1. The address line was never the rule; it was the case I happened to test.**
I told the operator an inline silcrow must stay a door, because `<section>` cannot
sit inside a `<p>`. That was true of `<details>` and false of the panel, which is a
sibling at the end of the document. The operator's blogging use case exposed it:
a post's references are inline, not address lines. **The rule is that a reference
resolves in place; the address line is one shape of it.**

**2. The signature pattern failed in the style it is named for.** The bold lead —
*"the single thing that most separates an okuda document from a wall of white"* —
was selected as `li > strong:first-child`. A loose list emits
`<li><p><strong>`, and loose is the house form. Measured: 15 loose bold leads in
the style guide, none of them amber. Found by the operator reading a screenshot,
not by a gate.

**3. A record's date is its own.** The first build used the publication date, so an
undated document minted a new artefact every day and one document looked like a
series. The operator's correction: *re-publishing means the same document under the
same name; a different name means a different document.* The date is now derived —
front matter, else the source's first commit, else the mtime.

**4. A terminal's page is the pane; a browser has no pane.** Measured at 1440×900:
24% of the viewport was ink. The fix was not more ink, it was a page — the ground
became the page's surface and the desk behind it darker. Measure 52.8% → 68.4% of
the viewport.

**5. The authoring contract constrains the source, not the display.** 79 columns is
how wide the author writes so the terminal does not wrap it. The display measure is
the glass's, and the browser wraps for free. Two numbers, two owners — conflating
them kept the page at 79ch for a day.

## What it cost, and what is still unproven

**Cost:** one session, eight commits, no new dependency. The binary is untouched —
`okuda --help` has no `--html`, and will not, because an HTML pipeline is a
compositor and compositing belongs to the environment.

**Unproven, in order of risk:**

- **The CSS is the least-tested part.** Twelve checks cover behaviour; almost none
  cover look. The loose-list bug and the close-control bug were both found by a
  human reading a screenshot. That is a structural weakness, and the mitigation is
  computed-style assertions, not screenshot diffs.
- **Scale is untested.** One 35 KB document rendered fine (23,057px, no page-level
  horizontal overflow, four code blocks scrolling internally). The corpus has
  115 KB files. The panel cap (24) and the file size (307 KiB for nine panels) are
  guesses about where the ceiling is, and neither has been hit.
- **The accessibility gap is declared, not solved.** A `:target` panel is not a
  dialog to the tree. `<dialog>` has the semantics and loses the address. Nothing
  native gives both.

## What this leaves behind

**A product, not a feature.** `just html <file>` writes one file to `html/`;
`just serve-html` serves it with a derived listing; `just html-verify` measures the
behaviour in a real browser. The palette is derived from one list, so a palette
change propagates with no second table to drift.

**A boundary that held.** The blog platform is the compositor, the package is the
rendered artefact, okuda is untouched. The seam is one `href`, and it declares
itself — the smallest crossing this silo has had to gate.

**The strongest thing built is not the HTML.** It is that the artefact carries its
own evidence: nine documents behind a claim, offline, in one file, with the
reader's place preserved. That is the silo's reference discipline made portable,
and it is a better object than the post that links to it.

## What is next

1. The close control scrolls away (`content-visibility` creates a containing
   block) — booked in the task ledger, and the first item for the CSS smoke-test
   work.
2. The CSS smoke tests: computed-style assertions for the patterns a screenshot
   currently guards.
3. Scale: a monster document through the pipeline, and the panel cap measured
   rather than guessed.
4. Dogfood: publish a real post and see what the pattern actually wants.
