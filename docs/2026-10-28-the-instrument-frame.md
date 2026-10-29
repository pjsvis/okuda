# The instrument frame — a deployment the design already admits

**Created:** 2026-10-28
**Status:** position, not a plan. Nothing here is scheduled; the point is that it
needs nothing.
**For:** anyone deploying okuda at the end of a pipe.

## The shape

A pipe collates a frame and hands it to a terminal that runs okuda on it. No file,
no session, no references. Push frames as slowly or as quickly as the data allows.

**Silcrows are excluded, and that is the class change, not a restriction.** A
document is somewhere you can go; an instrument is something you look at. Remove the
address and what remains is a state — which is what makes the frame stateless, and a
stateless frame is why it cannot lag, cannot drift, and cannot have anything move
under the reader. There is no `back` because there is no history to pop.

## Why it is free — the count, not the claim

| what it needs | where it already is |
|---|---|
| reading a stream with no file | `src/cli.ts:144` — stdin is rendered when it is not a TTY |
| naming nothing, honestly | `src/cli.ts:290` — *stdin is anonymous: no name, no header*; absent segments collapse, no placeholder |
| no filesystem in the render path | `src/render.ts` reads no file: no `existsSync`, no `readFileSync`, no `Bun.file` |
| coloured code and diagrams without a temp file | chroma and mermaid-to-md take their input on `stdin: "pipe"` and answer on stdout |

**Renderer changes required: zero.** That number is the argument, and it is
checkable by anyone who reads the diff.

## What it inherits rather than invents

An instrument frame is a **document with the prose deleted** — and prose is the only
thing okuda does that an instrument does not want. Everything else is already house
style:

- **Stable slots.** `ADR-ROLE-LAYOUT-022`, written for menus: the
  number at the far edge, the callsign in its stable home, the slug truncating
  leftward. That is an instrumentation convention arrived at from another direction.
  `tableSlots` is *the only place the slots exist*, so a checker and the renderer
  cannot disagree about geometry.
- **State in the glyph, colour as the glance** (`docs/state-colours.md`). An
  instrument reads at a distance; the glyph survives where the colour doesn't.
- **Values derived, never judged.** A count is a count. A threshold is an opinion,
  and this vocabulary has no role for one.
- **Damage marked.** Every withheld value carries its receipt (`…`, `needs N cols`).
  An instrument that drops a value silently is lying at the moment it matters most.
- **The squint ladder as the acceptance test.** `progressive engagement`
  (`docs/2026-10-12-the-squint-test.md`): element-class survival across a geometric
  ladder of widths, with damage marked. Measured over 515 documents at
  79/61/43/31 columns — classes survive at 100/100/100/90 per cent while the mark of
  damage rises from 92 to 287 documents. **An instrument that loses a class at 31
  columns is not an instrument.** Adopt the gate verbatim.

The one requirement that is new, and it is new because a document never had a second
frame:

> **Column stability across frames.** A value that grows by a digit must not shift
> its neighbours. In a document that costs nothing; in an instrument it turns a
> glance into a search.

Right-anchored numerics and fixed slots give this for free — which is the reason to
inherit `ADR-022` rather than invent a frame layout.

## What this mode must refuse

- **Holding the last frame to diff it.** The renderer has no previous state by
  construction. The delta is the pipe's data.
- **Framing.** Deciding where one frame ends is compositing, and compositing belongs
  to the environment. okuda does not grow a delimiter.
- **Clearing the glass between frames.** That is windowing. The honest options are
  append-only frames or a host that clears; both are legitimate, neither is ours.
- **Cadence, animation, blink.** The pipe owns the clock.
- **New roles.** The temptation of an instrument is a colour-coded threshold. The
  vocabulary has state glyphs, `alert`, `table-key` and `muted`; an instrument that
  needs a new colour is a proposal, not a frame.

## The thesis, and its test

**A lean design is demonstrated by the deployments it accepts without new code.**

- **Test:** name a deployment, then count the renderer changes it required. Zero is
  the pass. Above zero means either the deployment is wrong for this tool, or the
  tool is carrying something it should not.
- **Failure it names:** the small feature that turns every new deployment into a
  fork — one flag, one mode, one special case, and the second deployment can no
  longer be served without the first.
- **What it is not:** a claim that zero is always achievable, or that the count is
  the only measure. It is a cheap check on whether the abstraction is load-bearing,
  and it is falsifiable by the next deployment.

## What is not claimed

- **No throughput figure.** Not measured. The shape suggests a floor set by process
  spawns — `spawnChroma` runs per fence, and `chroma --list` is parsed once per
  process — but a number would need a benchmark, and there is none.
- **No flag exists** for framing, clearing or cadence, and none is proposed here.
- **If someone builds this**, the brief comes first, as it does for anything that
  touches the byte stream. This page exists so the brief starts from the conventions
  rather than rediscovering them.

## Related

- `ADR-ROLE-LAYOUT-022`, `ADR-UNIVERSAL-ELISION-050` — the geometry
  and the damage mark an instrument inherits.
- `docs/state-colours.md`, `docs/2026-10-12-the-squint-test.md` — the vocabulary and
  the gate.
- `AGENTS.md` (*three owners*) — compositing, windowing and rendering, which is why
  framing, clearing and cadence are named here as refusals rather than as features.
- `ADR-GLASS-INK-073`, `ADR-ADDRESS-NOT-COORDINATE-074` — the same boundary drawn
  for ink and for addresses.
