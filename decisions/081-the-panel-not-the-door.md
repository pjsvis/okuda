---
type: ADR
callsign: ADR-PANEL-NOT-DOOR-081
date: 2026-11-05
---

# Decision: The panel, not the door — `:target` over `<details>` and `<dialog>`, and the accessibility gap declared

**Date:** 2026-11-05
**Status:** Accepted — measured before it was chosen (Chrome 156, CDP, 2026-11-05),
and built the same day. **Amended 2026-11-05, same day:** *no JavaScript* was too
strong. The base document still needs none; a small progressive-enhancement script
is added for the history model alone, and the reasoning is below.
**Enforced by:** `just html-verify` (`scripts/html-package-verify.ts`) — twenty-one
checks in a real browser, including the one that matters: *closing returns to the
same `scrollY`*, and the amended one: *opening a panel adds no history entry*. A
regression in the mechanism fails the gate.

## Context

The HTML package publishes a document with its one-hop references dereferenceable.
The terminal's dereference is a swap-and-return: `jumpTo` replaces the live
document and pushes the previous onto `backstack`; `back` pops it. HTML has no
such stack, so the question was what replaces it.

Three native shapes were available, and they do not overlap:

| Shape | Keeps the address | Keeps the a11y semantics |
| --- | --- | --- |
| `:target` + a fixed panel | ✓ URL, history, deep links | ✗ not a dialog to the tree |
| `<details>` inline | ✗ the open state is not in the URL | ✓ native disclosure |
| `<dialog>` + `showModal()` | ✗ needs `pushState` | ✓ top layer, focus trap, ESC |

The requirement that decided it was not in that table: **the reader must return to
the place they left.** A silcrow is an address's actuation point
(`ADR-DEREFERENCE-MARK-075`), and an address you cannot return to is a door, not a
map — the lexicon's *references, not hypertext*.

## Decision

**A `:target` panel: always in the DOM, parked off-screen by `transform`, revealed
by the fragment, closed by an unmatched fragment. No JavaScript in the base
document — the hrefs work with scripts off. A single progressive-enhancement
script moves the address with `history.replaceState` so a dereference does not
become a history entry. The accessibility gap is declared rather than solved.**

## Alternatives Considered

| Alternative | Why Rejected |
| --- | --- |
| `<details>` inline | Destroys the address: the open state lives nowhere the reader can copy, bookmark, or return to. A silcrow *is* an address, so this loses the thing being modelled. It also cannot sit inside a `<p>`, so an inline reference could not use it at all. |
| `<dialog>` + `showModal()` | Has the semantics and loses the address, and needs JavaScript to put it back. A document that requires a runtime to be a document is a different artefact. |
| A plain `<a href>` to a separate file | A door. The reader leaves the document, and the map is no longer held. |
| JavaScript + `pushState` | **Adopted as an enhancement on 2026-11-05, not as a requirement.** The operator's report: *"the back button is a bit weird, as it goes back to the dereferenced document — we should keep the referenced documents out of history as they are not valid as history."* A package's state is *the main document, or one of its references*; a panel open is a view of the same document, not a new page. Native fragment navigation cannot express that — every open and close mints an entry — and `replaceState` does not re-fire `:target`, so a class carries the state alongside it. What is refused is a *runtime dependency*: with the script absent, every href still works and `:target` still opens the panel. |

## Consequences

**What became easier:**

- **The return to place is free, and it is free for a reason.** The panel is
  `position: fixed`, and a fixed element has no scroll position, so the fragment
  resolves without moving the page. Measured: 3,145 → 3,145.
- **The one-level bound is enforced by the selector, not by our code.** `:target`
  is singular: opening a second panel closes the first. The invariant `jumpTo`
  enforces with an early return is enforced here by CSS selector semantics — which
  is why a panel's own silcrows must be rendered **inert**. If they were live, the
  bound would be a lie and `back` would walk a stack.
- **`history.back()` is the terminal's `back` key**, and it preserves the scroll
  position. The reader gets the affordance they already have.
- **Deep links work.** `package.html#ref-27` opens the panel on load — measured —
  so a blog post can link to a specific dereference.
- **The panel carries its own identity.** The terminal's footer names the
  document — `silo · callsign · § filename` — and a scrolled panel had nothing:
  the browser tab still names the MAIN document, so the reader was inside a
  document that nothing on screen named. The panel now has a sticky chrome
  carrying the mark, the callsign and the path. Found by the operator returning
  to a scrolled reference and finding the H1 gone.
- **Each reference keeps its own place.** Every panel is in the DOM and is only
  translated, so its `scrollTop` survives being closed and reopened, and two
  references hold two different positions at once. Found by the operator scrolling
  one panel, closing it, scrolling another, and returning: *"they both keep their
  place — awesome."* That is a capability the terminal's swap-and-return does not
  have, and it is a consequence of the panel never being destroyed.

**What became harder:**

- **The close control must use an unmatched fragment.** `#` scrolls to the top, so
  the panel closes correctly and the reader is silently somewhere else. This is the
  one trap, and it is silent; the gate now checks it.
- **The accessibility gap is real and unpaid.** A `:target` panel is not a dialog
  to the accessibility tree: no focus trap, no `aria-modal`, no ESC. The mitigation
  is a visible close control and a declared limit — *a gate that states its limit
  is not a false signal* — not a claim that the gap is absent.
- **Print is the inverse problem.** A `:target` panel prints only the panel, so
  `@media print` must show the main document and hide every panel. The opposite of
  the `<details>` wart, and worth writing once.
- **`content-visibility: auto` on the panel creates a containing block**, which
  makes a `position: fixed` descendant position against the panel rather than the
  viewport — so the close control scrolled away. Found by the operator reading the
  artefact twice, the second time after it had been diagnosed and deferred. The fix
  is `position: sticky`, which is relative to the scroll container and therefore
  survives the containment. The lesson is that a CSS smoke test would have caught it
  and a screenshot did.
- **The heading was too wide, and the cause was the scale.** The terminal renders
  every heading level at one size, encoding the level in the badge's width; a
  heading scaled to 1.5em at the same `ch` measure is a line 50% wider than the
  body. Headings are now 1em, and the badge carries the hierarchy.

## Related

- `ADR-DEREFERENCE-MARK-075` — the silcrow, and the binary state this maps onto
  `:target`
- `ADR-GLASS-INK-073` — the glass owns its ink; the same ruling gives it its glyph
  coverage
- `briefs/2026-11-05-brief-html-package.md` — the brief, and the spike's ten
  measurements
