# Decision: Table elision over in-cell shrink-wrap

**Date:** 2026-08-27
**Status:** Accepted

## Context

okuda has, since early development, handled wide tables by **in-cell
shrink-wrap**: a table that would overflow the terminal is shrunk
proportionally and wrapped in-cell so it stays on-screen. The behaviour
was documented in `docs/showcase.md` as the "containment" channel — the
table's job was to fit, at the cost of its columns.

That cost was hidden because shrink-wrap *works*: it renders something
that fits the pane. But what it renders is a lie about the author's
table. Proportional shrink compresses columns until the vertical scan
the table existed to enable is destroyed — a wide decision matrix
becomes a tall narrow column of wrapped cells, and the eye can no longer
compare a row's state across the columns. The affordance (column-scan)
died so the containment (on-screen) could live. This is the same trade
the no-reflow brutalism already refuses for fences and diagrams: a
wrapped diagram is a broken diagram pretending to be whole; a
shrink-wrapped table is a broken table pretending to be whole. Tables
were the exception to a principle the rest of the renderer holds.

## Decision

**Reverse the exception.** Wide tables elide, not shrink-wrap: render to
the matrix width, and where columns run off the right edge, mark the
elision with `…` — an invitation (widen the matrix, or page within the
panel), not a truncation. The table keeps its columns and its scan; the
reader keeps the truth that the table is wider than the view.

This brings tables under the same no-reflow brutalism as fences and
diagrams: raw blocks render verbatim, overflow elides and invites
widening, nothing is mangled to fit.

## Consequences

- A wide table on a narrow terminal now shows *less* but *truthfully*.
  The "containment" channel concept is retired for tables.
- Readers wanting the full table widen the matrix (resize the terminal,
  a tmux pane, the fzf preview) or page within the panel — the `…`
  marker names the verb.
- Authoring guidance the renderer's fit now rewards: vertical is the
  cheap dimension (paginated, scrollable); a wide table that could be a
  long table should be reoriented.
- Implementation reverses the proportional-fit + in-cell-wrap path in
  the table renderer (`src/render.ts`); belongs to the panel-library
  build, not this ADR.

## Palimpsest record

No prior ADR existed for the shrink-wrap approach — it was implemented
behaviour, not a recorded decision. This ADR captures the superseded
rationale so it is not lost: shrink-wrap was chosen for Glow parity and
on-screen containment, at a cost (column distortion) that only became
visible once the panel-library work made "the matrix fits the activity"
a first-class principle. The showcase paragraph that taught shrink-wrap
is updated in the same change to teach elision, citing this ADR — no
orphaned instruction left active.