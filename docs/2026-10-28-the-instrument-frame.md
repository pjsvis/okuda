# The instrument frame — a deployment the design already admits

**Created:** 2026-10-28
**Status:** position, not a plan. Nothing here is scheduled; the point is that it
needs nothing.
**For:** anyone deploying okuda at the end of a pipe.

## The shape

A pipe collates a frame and hands it to a terminal that runs okuda on it. No file,
no session, no references. Push frames as slowly or as quickly as the data allows.

**Silcrows are excluded — the `§NN` addresses — and that is the class change, not a
restriction.** A document is somewhere you can go; an instrument is something you
look at. Remove the address and what remains is a state — which is what makes the
frame stateless, and a stateless frame is why there is no backlog to fall behind,
nothing to drift, and nothing to move under the reader. There is no `back` because
there is no history to pop.

## Why it is free — the count, not the claim

| what it needs | where it already is |
|---|---|
| reading a stream with no file | `src/cli.ts:144` — stdin is rendered when it is not a TTY |
| naming nothing, honestly | `src/cli.ts:305` — *stdin is anonymous: no name, no header*; absent segments collapse, no placeholder |
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
  columns is not an instrument.**

  Adopt the gate verbatim, and declare the boundary of the numbers: those classes are
  *heading, rule, diagram, prose* (ladder rungs, `docs/2026-10-12-the-squint-test.md:102-116`),
  and an instrument frame has prose deleted and no headings. The **ladder** transfers
  as a method; the **figures** do not transfer as a prediction.

  named before the gate means anything — and it has now been measured below.

The one requirement that is new, and it is new because a document never had a second
frame:

> **Column stability across frames.** A value that grows by a digit must not shift
> its neighbours. In a document that costs nothing; in an instrument it turns a
> glance into a search.

Right-anchoring is half of it, and it is not the half the renderer can supply.
`colWidth` is derived *per frame* from that frame's own body (`src/render.ts:2153`
takes each column's widest cell, `src/render.ts:2157` folds in the header's longest
word), and the table is then summed left-anchored (`src/render.ts:2173`). A slot
width is therefore a function of the current content: `9 → 10` widens its column and
everything to its right moves by one. Nothing holds a slot open across frames, and
nothing can — the renderer holds no previous frame, which is refusal #1 applied to
geometry rather than prose.

So the field width belongs to the pipe: emit fixed-width fields (`printf "%4d"`) and
`bodyNat` stops varying, `colWidth` stops varying, and the neighbours never move.
`ADR-022` then supplies what it does own — the anchoring and the order of the slots.
The requirement is new to the **compositor**, never to the renderer, which makes the
count below stronger rather than weaker: the one thing that looked like new renderer
work turns out to be the frame's.

## The frame's own classes, measured

The squint gate was adopted as a method and its numbers were not, because a document's
classes are not a frame's. Measured 2026-10-30 (`just frame-classes` — a fixture frame
on the same 79/61/43/31 ladder, positive control first): the frame's classes are
**value, glyph, slug, texture, history**, each with a predicate, because a class without
one is a slogan.

| class | predicate |
|---|---|
| value | a numeric measurement, with its unit |
| glyph | a state glyph, one column |
| slug | the row's name, left of its state |
| texture | a Braille density run (U+2800–28FF) |
| history | a block run — one cell, one time step |

| rung | classes surviving | damage marked | note column visible |
|---|---|---|---|
| 79 | 5 / 5 | no | 3 / 3 |
| 61 | 5 / 5 | no | 3 / 3 |
| 43 | 5 / 5 | no | 3 / 3 |
| 31 | **5 / 5** | **yes** | **0 / 3** |

The frame passes its own gate at 31 columns, and what it loses is the **note column** —
prose, which is what a frame deletes. Every cut line carries its `…`, so the damage is
marked rather than inferred. That is the difference between this ladder and the document
one: **a document loses classes at the narrowest rung; a frame loses its prose and keeps
its data.**

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

## The second channel — texture, and two datasets in one cell

The silo already owns the vocabulary for a figure. The artpack primitives were
**extracted rather than discarded** — they live in `playbooks/data-display-playbook.md`
(`PLY-DATA-DISPLAY`): dither blocks, eighth-bars, and the whole Braille band, each
**one column by contract**, asserted across the range rather than spot-checked
(`tests/width.test.ts:229-247`). A compositor outside this silo has already counted
what they buy: **81 magnitude states** from eighth-blocks and **256 texture states**
from a 2×4 dot matrix (`docs/2026-10-23-brief-omarchy-dual-dataset-lut-engine.md:26-32`).
Nothing in okuda draws those glyphs, and nothing needs to: they are text, and text is
the one thing the renderer already handles.

**A cell has two channels, and an instrument can spend both.** The dot pattern is the
first; the colour behind it is the second. So a Braille texture block over a coloured
ground carries a *figure against a field* — dots for the series that has shape
(density, occupancy, where the mass sits), ground for the series that is slow and
scalar (a band, a load, a proportion). Two measurements in one cell, no new glyph, no
second row.

That is the compositor's construction, and the count stays zero: guest SGR passes
through untouched — a table cell holding `\x1b[48;5;236m⣿⣿⣿\x1b[0m` renders with its
background — so the ground is the pipe's to paint.

Three lines keep it a texture instead of a frame language:

- **One ground.** `src/ansi.ts:203` records the house position — *the rule is the
  user's: one background, no more*. An instrument adds no second one.
- **Foreground invents no state.** `docs/state-colours.md` is the vocabulary; a
  textured frame needing a new colour is a proposal, not a frame.
- **The fallback is the pipe's, and it must be written.** Colour-off strips the
  renderer's own SGR (`src/ansi.ts:54-55`) and, verified today, *not* the guest's — so
  a frame whose second dataset lives in the ground keeps it under `--no-color`. Emit
  the figure so the dots alone still read, and say what the ground meant.

## History as a character

The one history an instrument frame can hold honestly is the one it draws in cells,
because there is no previous frame to diff against: **one character is one time
step**, and the pipe owns the buffer the window came from.

- **A sparkline is the whole idea at minimum cost** — a row of eighth-blocks, one
  sample per cell, no store, no trend beyond the width you gave it. The width *is* the
  retention policy: as many samples as there are columns, and nothing behind the first.
- **Braille buys four steps per cell.** A 2×4 matrix means a Braille row resolves four
  time steps vertically inside a single character cell, without spending a column.
- **The dots are one budget.** Sub-cell resolution and a second dataset come out of the
  same eight dots: spend them on time, or on the overlay, not both. The frame says
  which.

What it refuses: **a trend that remembers.** A moving average carried across frames
is state the frame does not have; a frame that borrows it is a graph wearing an
instrument's clothes.

## Sources already on stdout

The frame is free, and so are most of the producers. Each of these writes text to
stdout today and needs no adapter to become one:

| source | command | what it emits |
|---|---|---|
| vitals | `bash scripts/orient.sh` | branch, drift, last commit, binary freshness, corpus counts — six lines, already a frame |
| the island | `bun scripts/status-doc.ts` | `NOW.md`: derived git/registry/td state plus the hand-written stance — document-shaped, and the prose is what the frame deletes |
| tempo | `bun scripts/cadence.ts` | tier cadence and brief latency — its `Rate` renders `≈ 8.1/wk`, variable width (`scripts/cadence.ts:124`) |
| task state | `td status --json` | what is in flight, what awaits review — the json is the pipe's business, not the renderer's |
| ref namespace | `bun scripts/ref-census.ts` | every branch's staleness against `main` — the reading `just check` had no opinion about |
| frame probe | `bun scripts/frame-probe.ts` | the bracket contract, boundary blanks — an instrument that measures frames |
| squint ladder | `bun scripts/squint-probe.ts` | element-class survival across widths — the gate, monitoring itself |

The pattern worth naming: **the silo already derives its vitals to stdout; what is
missing is a frame that does not scroll away.** And the discipline is already in the
building — `scripts/cadence.ts:156` pads its columns for a terminal while
`scripts/cadence.ts:124` writes the same numbers into a markdown table unpadded. The
two paths differ by exactly the width rule above, inside the file that already knows
it.

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
- **No texture renderer.** Nothing in okuda draws eighth-blocks or Braille; the
  one-column contract is pinned (`tests/width.test.ts:229-247`) and unspent. A frame
  that shows texture is a compositor using text the renderer was already correct about.
- **No flag exists** for framing, clearing or cadence, and none is proposed here.
- **If someone builds this**, the brief comes first, as it does for anything that
  touches the byte stream. This page exists so the brief starts from the conventions
  rather than rediscovering them.

## Related

- `ADR-ROLE-LAYOUT-022`, `ADR-UNIVERSAL-ELISION-050` — the geometry
  and the damage mark an instrument inherits.
- `docs/state-colours.md`, `docs/2026-10-12-the-squint-test.md` — the vocabulary and
  the gate.
- `playbooks/data-display-playbook.md`, `tests/width.test.ts:229-247` — the texture
  vocabulary, its one-column contract, and its degradation floor.
- `docs/2026-10-23-brief-omarchy-dual-dataset-lut-engine.md` — the 81/256 state count,
  filed here as related reading rather than as authority.
- `AGENTS.md` (*three owners*) — compositing, windowing and rendering, which is why
  framing, clearing and cadence are named here as refusals rather than as features.
- `ADR-GLASS-INK-073`, `ADR-ADDRESS-NOT-COORDINATE-074` — the same boundary drawn
  for ink and for addresses.
