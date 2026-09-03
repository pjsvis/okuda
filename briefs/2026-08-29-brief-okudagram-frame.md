---
type: Brief
callsign: BRF-PAGED-OKUDAGRAM
---

# Brief: The okudagram frame — a portioning rule

**Date:** 2026-08-29 (rewritten 2026-09-03 — the rule, superseding the
constraint-space exploration and its fold-in clauses)
**Status:** Rule fully specified; pending walk validation against
EC1–EC9 (confirmation, not exploration)
**Branch:** feat/gloam-launcher (parked; no code yet)

> **Rewrite (2026-09-03).** The brief was an aspiration with a mapped
> constraint space and two folded-in clauses (stepping, frame-numbering).
> A session working from the *operational* direction — walk the frame,
> resize constantly, fill what's there — re-derived the synthesis as a
> simple rule and superseded the elaboration. The constraint space
> closed: the unit is header-to-next-header; the seam is the renderer's
> existing structure; slippy is the normal oversized case, not a
> fallback. What remained was the rule. The old thinking is removed;
> the rule is stated and put on the pedestal. The walk confirms it.

## The problem

The current TUI is slippy: a flat line array, a continuous viewport
sliced through it, an eye-proxy anchor pinning the nearest non-blank
line to the middle on resize. Elegant for flow. But a document is
also landing — reading a headered block whole, studying it. The
slippy seam serves landing badly. The scratchpad named both failure
modes long before this brief:

- **Hopscotch on ice.** Discrete intent on a continuous surface — you
  want to *land*; the floor won't hold still.
- **Ice dancing on concrete.** Continuous intent on a discrete surface
  — you want to *flow*; the floor won't slide.

## The rule

**A frame is a header and its content, from the header to the next
header (or EOF).**

The frame fills the terminal from the top.

- **Content shorter than the terminal:** the space below is blank. The
  blank is the frame's boundary — the signal to shrink the glass or
  step on.
- **Content taller than the terminal:** the frame is slippy within. The
  signal is to grow the glass, or accept the scroll.

The system measures the glass and fills it. **The system never sizes.**
The human resizes — constantly, purposefully: narrow to read prose,
wide for tables and diagrams, tall to land, short to scan. The system
makes no assumption about the document's size, the screen's size, or
the user's intent. It fills what's there.

Step forward/back moves the anchor to the next/previous header; the
viewport recomposes. On resize, re-anchor to the same header — the
render is a pure function (`okudagram = f(source, width, palette)`,
deterministic), so the frame is recomputed, never stored. The
backstack stores position, not pixels — a path and a scroll integer —
exactly as today (`docs/2026-08-31-the-same-okudagram.md`). Framing
inherits the determinism for free.

## Vocabulary — step, scroll, vector

The frame rule defines three motions. Each has a scope, an act, and a
target. **Paging is not among them** — it was a fourth thing that did
not exist, a screen-sized leap to an arbitrary position, which is
neither a reference nor a structural progression. The callsign
`BRF-PAGED-OKUDAGRAM` stays to remind us it didn't.

| Motion | Scope | Act | Target |
|---|---|---|---|
| **vector** | cross-document | dereference a reference | another document |
| **step** | within-document | progress along structure | the next header/frame |
| **scroll** | within-frame | translate through lines | every line, continuously |

A **vector** is transcendent — it leaves this document for that one.
The reference is the condition of possibility; the act is the
dereference; the destination is another place. A **step** is immanent —
it never leaves the document; it moves *along* it. The structure is
the condition of possibility; the act is the progression; the
destination is the next structural position in the same document.
A **scroll** is continuous — it sees every line, crosses frame
boundaries without recomposing, skips nothing.

**Step** is the word because it is the only motion that is
simultaneously discrete (one frame at a time), landing (on a
structural marker), immanent (within the same document), and
non-leaping (the content between here and the next header is the next
frame's content; nothing is skipped). The space is the document
itself, portioned into a 1D sequence of frames bounded by two fixed
points (the start-anchor and the terminator). You move *along* the
sequence — ordinal, next/previous. Not a grid, not a deck, not a
graph. A strand with a head and a tail.

Actuation: **step forward / step back** — shorthand **next / previous**
(`n`/`p`). The command is relative (next/previous), never absolute
(no "go to frame N" — that is the numbering we demolished).

## Frame-0 — the document's top

**The top of the document is the first anchor, on the solid grounds
that it does not move.** Every other anchor is a header that could be
edited, inserted, or deleted; the top is the document's existence
condition. Anchoring frame-0 on the start is not a heuristic among
options — it is the one anchor logically prior to the frame system
itself. Without cognizance of the start, no position claim is
verifiable (the Derrida gate: the start is the epistemic coordinate
origin). The progress fraction — the only valid number, dealt with
once the rig is deployed — is defined as distance-from-start ÷
total-length; the start is its origin, and accepting the fraction
committed us to the start-anchor before EC1 was ever asked.

Frame-0 contains whatever is there — title, front matter, intro —
before the first structural header. Front matter is not our concern:
okuda doesn't special-case it; it is content in frame-0, rendered
as-is. The anchor is the top, not any particular line within it.

**The H1 is frame-0's content, not a section anchor.** The H1 is the
document's title — the document's name for itself, not one of its
sections. Frame-0 = the H1 plus whatever preamble sits before the
first `##`. The first `##` is frame-1's anchor, as the rule states.
This is the one exception to "headers are anchors," and it is
singular by markdown convention (one H1 per document). A document
that breaks convention and has multiple H1s degrades cleanly: the
first H1 is frame-0's title; subsequent H1s are section anchors,
treated as frame boundaries, same as H2. No special machinery; the
convention-breaker falls back to the general rule.

**The floor is one line.** A document that exists has at least one
line to show. If frame-0 is empty (no preamble, first header on line
1), the anchor still holds and the frame shows one line — the H1
itself, which is content. A lone H1 with blank below is a one-line
frame-0; the blank is the signal to shrink the glass or step on.
Same rule, same signal; no special case.

**Quality gate.** Render markdown pretty and fast; if it is not
pretty and/or not fast under typical conditions, look at it. The H1
exception passes: a title above its document is the correct shape,
and one exception with no scan cost is fast. The pizza-shop doctrine
as a gate — predictably adequate, judged by survival under typical
conditions.

## Backward traversal

The mirror of the forward case: step backward moves the anchor to the
previous header; the frame recomposes from there. Resize during or
after the step re-anchors on the same header — the same determinism,
the same fraction update. Symmetric by construction; no asymmetry to
resolve.

**Two motions, both refusing to leap over content.**

- **Scroll (up/down):** continuous translation through lines. Crosses
  frame boundaries without recomposing — every line is seen, nothing
  is skipped. The document is continuous; frames are anchors, not
  walls. Scroll is translation.
- **Step (forward/back):** compose the target frame — anchor on its
  header at the top, fill down. Moves the structural anchor;
  recomposes. Step is composition per step.

**Page-up is a category error, not a concept.** Page-up assumed the
screen-height was the step unit — leap back by one viewport of lines,
landing structurally arbitrary, mid-frame. That is ice-dancing-on-
concrete applied backward: a leap over the header boundary you should
have landed on. The model replaces it with the two motions above,
both of which refuse to leap: scroll sees every line (continuous),
step lands on every header (structural). No third motion exists; the
space between translate and compose is empty. The content between
frame N's header and frame N-1's header is frame N-1's content;
stepping backward renders it fully. Nothing is skipped; every line
belongs to a frame and is reachable.

If backward traversal feels awkward, the remedy is the same as ever:
resize the terminal — bigger to fit the content, smaller to scan it.
The human is the sizer; the system fills what's there.

## What the rule does not do

- **No assumptions about size.** Not the document's, not the screen's,
  not the user's. The system fills what's there.
- **No system-side sizing intelligence.** The human is the sizer; the
  system is the filler. The system never decides a frame is "too big"
  or "too small" — that's the human's call, made by resizing.
- **No per-frame numbering.** The frame is a viewport property, computed
  at render time; numbering a viewport property is wrong. Cross-document
  dereferencing keeps the shipped pre-render vector list — stable for
  the document, not per-frame.
- **No continuation.** A short frame is a short frame; the blank below
  is the signal, not a defect to fill. This harmonizes with
  `BRF-VIEWPORT-PADDING`'s precedent — "blank only signals at a
  boundary" — the end of a section is a boundary. (The section-snap
  clause over-extended the precedent into "no blank at all"; the
  precedent permits blank at a boundary, and the frame's blank is at
  one.)

## Why it is a candidate invariant

The rule is a per-block policy, not a user setting. A setting would
hand the user exactly the mismatch decision they shouldn't have to
make — that is benchmaxxing the interface axis. If the rule holds
under the walk, it joins the constitution's invariants alongside
*hard-wrap mandate* (`ADR-004`) and *one glyph, one job*. The
scratchpad's landing-mode values — *on screen, now*, *tied to the
mast*, *slipperiness is induced, not native* — become as true as the
flow values already are.

## Superseded (removed, for the record)

- **Frame-numbering clause (folded 2026-08-31).** Parked, no consumer.
  The frame is not a numbering scope; the frame is a viewport property.
  Cross-document vectors stay pre-render and document-scoped.
- **Section-snap continuation clause (folded 2026-08-30).** Rejected.
  It misread the viewport-padding precedent as "no blank at all"; the
  precedent permits blank at a boundary, and the frame's blank is at
  one. The stepping keys (`{`/`}`) survive as the walk mechanism; the
  continuation does not.
- **Container/source reframe (amendment 2026-09-02).** Diagnosis that
  reached the rule structurally. The rule supersedes the diagnosis; the
  ragged-edge attention tax it named is killed by the frame's
  boundary-blank, which is the rule's consequence.
- **The state machine (PAGED/SLIPPY/FROZEN, two axes).** Elaboration
  that the rule subsumes: fits → static, overflows → slippy. Freeze
  (*tied-to-the-mast*) remains a lexicon entry and a possible later
  affordance; it is not part of this rule.

## Validation

Walk EC1–EC9 (`docs/2026-08-29-okudagram-frame-edge-cases.md`) against
the current renderer. The rule holds if the edge cases don't break it.
The unit is header-to-next-header; the cases test the answer, they do
not redefine it. The observation log in that document is the evidence.

## Related

- `docs/2026-08-27-okudagram-scratchpad.md` — the lexicon (*on screen
  now*, *tied to the mast*, *slipperiness is induced, not native*,
  *hopscotch on ice*, *ice dancing on concrete*, *book-binding*)
- `docs/2026-08-29-okudagram-frame-edge-cases.md` — EC1–EC9, the walk
- `docs/2026-09-03-the-anchor.md` — **the anchor as system invariant**
  (the frame's design center, stated as point rather than mechanism;
  seed for a future explainer)
- `docs/2026-08-31-the-same-okudagram.md` — the determinism that makes
  frames free to recompute and `u` cheap
- `briefs/2026-08-25-brief-viewport-padding.md` — `BRF-VIEWPORT-PADDING`,
  the precedent the rule harmonizes with
- `decisions/004-hard-wrap-mandate.md` — the invariant ancestor: okuda
  owns every `\n`
- `decisions/027-temperament-is-downstream-of-discipline.md` — the
  hot-potato rule: the backstack holds exactly as much state as the
  question requires
- `src/tui.ts` — the slippy seam this rule portions: `viewport`,
  `anchorForScroll`, `reanchoredScroll`
- `src/render.ts` — the heading handler (the unit boundary source)
