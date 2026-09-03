# The mental map — traversals and persistence

> Logged 2026-09-03. Status: **discussion** — a felt analogy and an open
> question. The native Canadian mental map is the okudagram's cousin;
> the gap it surfaces is the persistence of traversal knowledge. Seed
> for a future thread, not a plan.

## The exhibition

An exhibition of native Canadian paintings, in Ottawa (the reference is
with the keeper's sister). The paintings were of **mental maps of
landscapes annotated with semantic tokens of various types and weights.**
That is it. The spatial geometry was topological *and* geographical at
the same time — *when you are here you will see this, and given the
conditions you should do this.* A frame with an anchor and an actuation,
rendered to a surface. A bounded semantic field you can scan and
assimilate, from which you form a position and decide.

The okudagram is the same shape, one register over: a bounded portion
of a document, anchored on a header, annotated with actuable tokens
(the jump vectors), rendered to a terminal. *When you are here you will
see this* — the frame. *Given the conditions you should do this* — the
vector you dereference, the step you take, the opinion you form. The
mental map and the okudagram are both conjugates to a decision process:
bounded, semantic, shareable in a moment, the legitimate starting point
for a position.

## The thing these environments do not give themselves to

These environments do not give themselves to "the same old thing." The
landscape is topological and geographical at once — the same anchor can
present differently given the conditions (the weather, the season, the
glass, the width). The frame recomputes; the anchor re-finds; what you
see depends on what the glass is *right now*. There is no "the same
old thing" because the render is a pure function of inputs that vary,
and the variation is the point, not the defect (the variable is the
invariant). A mental map that held a single fixed rendering would be a
*photograph*, not a map; an okudagram that held a single fixed frame
would be a *screenshot*, not a render. The map and the render live by
recomputing.

## The open question — persistence of traversal knowledge

But a traversal of such a landscape could benefit from knowledge gained
in previous traversals. The mental map has this: the keeper who has
walked the land before knows *when you are here, given the conditions,
you should do this* — and the "given the conditions" is the accumulated
weight of prior traversals. The token's *weight* (the exhibition's
various types and weights) is the persisted knowledge. The map is not
just a rendering; it is a rendering *annotated by experience*.

The okudagram, today, has no such persistence. The backstack stores
position (a path and a scroll integer) — where you were — but not
*what you learned there*. The frame recomputes freshly every time; the
anchor re-finds; the render is pure. The purity is the invariant, and
it is correct: the render must not carry history, or it stops being a
pure function and becomes a state-restoration system (the argument from
`docs/2026-08-31-the-same-okudagram.md`). But the *traversal* — the
path you took, the frames you spent time on, the decisions you made at
each — is knowledge that currently dies with the session.

> If only there were some way of persisting the knowledge.

That is the open question. Not a plan, not a brief — a seed. The
tension is honest: the render must stay pure (the invariant), and the
traversal knowledge must live *somewhere* (the gap). The three-concerns
principle suggests where: the render is okuda's; the persistence is
the environment's (the filesystem is the message bus; any tool that
writes to a file is a compositor). The traversal log might be a
document the environment writes and the reader consults — a mental map
of where you have been, annotated with the weight of prior attention,
read by the same viewer that rendered the landscape it maps. The
okudagram conjugates with its own traversal history the way it
conjugates with any decision process: by presenting bounded context
that lets you form a position. The mental map of your prior traversals
is bounded context too.

But that is for later. For now: the analogy is on the record, the gap
is named, and the shape is right — a bounded semantic field, anchored,
actuable, recomputed, and someday annotated with the weight of having
been walked before. That's just the way it is; some things never
change. Until they do.

## Related

- `explainers/the-okudagram-as-context.md` — the okudagram as the
  shared context that makes decisions possible (the mental map's
  cousin)
- `docs/2026-09-03-the-anchor.md` — the anchor (the "when you are
  here")
- `docs/2026-09-03-the-variable-is-the-invariant.md` — the recomputation
  (the "given the conditions")
- `docs/2026-09-03-content-over-menu.md` — content over menu (the
  tokens are content, not chrome)
- `docs/2026-08-31-the-same-okudagram.md` — why the render must stay
  pure (the constraint the persistence must respect)
- `docs/2026-08-27-okudagram-scratchpad.md` — *bounded × mnemonic →
  perfect recall*; *the Heath Robinson machine* (the filesystem is the
  message bus)