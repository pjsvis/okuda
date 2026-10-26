---
type: Debrief
callsign: DBF-PROSE-MEASURE
date: 2026-10-26
tags: [render, width, prose, tables, style-guide, measurement]
agent: pi (ses_225872)
environment: local
briefs: [BRF-PROSE-MEASURE]
---

# Debrief: The measure — the renderer had an opinion about everything but the text

**Date:** 2026-10-26
**Status:** Done — `PROSE_MEASURE` shipped, `ADR-PROSE-MEASURE-070` recorded, the
fence receipt refused on the operator's word, `just check` green at **852 tests**.
Two parked siblings and one filed finding remain; none of them blocks.

## What was asked

Not a feature. An audit: *"let's consider our system invariants — how wide can we
go, and how high, and what is our biggest terminal size and can we support it with
zero lag?"* Then the observation that did the work: text is consumed at 40–80
columns, the floor is 20, and *"if we had a controller for the text width we could
keep text readable on the same terminal as a wide diagram"* — with the alternative
offered in the same breath: *"or do we just say two terminals?"*

The answer was in the file already. `BAND_CONTENT`'s comment says a table is
*"authored to fit 80 columns (content 76)"*. The hints row is budget-bound to the
same 80. The renderer had a width opinion for tables, diagrams, and chrome, and was
silent for prose — the one class where readline length is the whole question.

## What the measurement said before any code

| question | answer | how |
|---|---|---|
| how wide can we go? | the glass invariant held to **8000** columns, `over = 0` at every rung | four documents rendered at 21/40/80/120/240/480/960/1920/3840/8000 |
| is it laggy? | **no cliff:** 33.9 / 30.3 / 29.2 / 30.2 / 32.5 ms at 20 / 80 / 120 / 1920 / 8000 | warm, mean of five |
| what does a frame cost? | 2.3 KB at 80×24 → 65.5 KB at 1920×120, one full repaint | pty, byte count |
| what is *not* banded? | prose — 7 996 content columns at `--width 8000`, while table rules stopped at 101 and only thematic breaks reached the glass | display width, ANSI stripped |

That last row is the brief. The renderer already believed width is a property of
the thing drawn; prose was the exception nobody had named.

## The decision shape: one constant, two classes, no dial

`PROSE_MEASURE = 76` content, `Ctx.measure = min(width, 76)`. Text reads the
measure (prose, headings, list text, blockquotes, diagram descriptions, the badge
that rides prose, the thematic rule, the H1 rail); art keeps the glass.

The dial was refused for a reason that is only visible if you know the gate: a live
measure is a *third geometry input*, and `needsRepaint(content, geometry,
paintedGeometry)` is deliberately two (`ADR-RESIZE-GEOMETRY-046`). It buys what a
pane resize already buys, and it imports the bug shape that ADR was written to fix.

**The safety argument was structural, not tested-into-existence:** at and below 80
columns, content width *is* 76, so `min` returns it unchanged. The change could not
touch any pane that works today. The suite agreed — 842 of 843 passed on the first
run, and the one golden that moved was the H1 rail at `--width 120`, from 112
dashes to 72.

## My own proposal, refused inside the session

I designed a requirement receipt for elided fences — `⋮ … · code elided · needs N
cols` — mirroring the diagram's, and wrote a brief that **amended ADR-069 §5** to
allow it (the block sequence would change by one block when a resize crossed a
fence's width). The operator's reply:

> *concur on no number, the elision sign says it all: more to see here, if you want*

And the refusal is better on every axis, which is why it is worth recording:

| the receipt would have | the refusal |
|---|---|
| added a block that appears and disappears with the glass | §5 stands **unamended** — block sequence *and* line count invariant |
| put a second claim on a marker that was already sufficient | `…` is an invitation, not a truncated measurement |
| needed a fit ladder, a vocabulary, and a test amendment | one guard test: an elided fence carries `…` and **no** receipt vocabulary |
| answered "how much" — which changes no reader action | answers "more", which is the whole of the reader's decision |

Diagrams keep `needs 241 cols`, and the distinction is stated: a cut *structure*
cannot be judged without its number; a cut *line* can. Two classes, two
vocabularies, each justified by what the reader can act on — not by symmetry.

## Two wrong instruments, both caught by asking again

Recorded because the silo's whole posture is *every claimed fact names its
instrument*, and both errors were mine in one hour:

1. **I dogfooded the stale binary.** After the implementation I ran `./okuda` and
   concluded the measure had done nothing — prose still 196 wide at `--width 200`.
   The tests were green and the binary predated the change: `./okuda` is
   `bun build --compile` output, so it is stale until `just build`. A dogfood that
   skips the build measures the last session.
2. **I measured bytes and read columns.** `awk '{print length($0)}'` on a coloured
   render returned 350 for a line that is 78 columns wide — ANSI escapes are bytes,
   not cells. The second reading used `displayWidth` and answered instantly.

Both are the same failure: the instrument was chosen by convenience rather than by
the quantity claimed. Neither survived a second measurement, which is the only
reason they are in this debrief rather than in a bug report.

## Dogfood, and the measurement I did not aim at

At `--width 200` on the brief: 411 lines, widest 118, and **every line over 80
columns is a table** — prose stops at 78. At `--width 80`: 465 lines, nothing over
78. TUI at 200×40 through a pty: chip and prose at the measure, frame 3.9 KB.

Then the prize, found by accident:

| document | 120 | 200 | 400 | 1000 |
|---|---|---|---|---|
| `docs/2026-08-20-origin-doc.md` | 852 | 852 | 852 | 852 |
| `docs/showcase.md` | 400 | 400 | 400 | 400 |
| `decisions/069-the-pane-is-not-a-canvas.md` | 229 | 229 | 229 | 229 |

**A document's line count is now invariant above the measure.** Prose stops
re-flowing once the glass passes 80, so only art's cut point moves. ADR-069 bought
that for *blocks*; the measure bought it for *lines*, and nobody was aiming at it.
That is the argument for banding the last unbanded class: the invariant generalised
itself.

## The gates that bit, and were right

- **The One-Way Valve** — I put six td IDs in a persisted brief. *The ephemeral may
  cite the persistent; the persistent never cites the ephemeral.* Removed; the brief
  names callsigns.
- **Callsign lint** — I forward-cited `ADR-PROSE-MEASURE-070` before the file
  existed. A brief that cites its own future is a dangling pointer; it now names a
  number and marks the record a proposal.
- **My own operator error** — `reg-sync --fix` without a registry argument is *check
  mode*. The brief sat unregistered while the tool reported "in sync".

## What was declined

| thing | why |
|---|---|
| a live measure actuator | a third geometry input on a gate built for two |
| `--measure` / `OKUDA_MEASURE` | parked, not refused — the constant is one line; a boot value is the right shape *if* a per-reader number ever proves necessary |
| multi-column prose in the renderer | two rails, an ambiguous anchor, reflow across a column boundary |
| walls as a renderer mode | compositing is the environment's; a wall is an authored fence, opt-in by construction |
| centring the measure | moves the left rail, the one edge the eye tracks down a document |
| a receipt on every fence | decoration under the 99% that fit, and it dilutes the marker that means "cut" |

## Left open, with owners

- **Table slack** — with prose no longer 196 wide, the band's evenly-split air now
  reads as a one-character rank column padded to ~30. Pre-existing (`ADR-055`),
  newly conspicuous, filed as its own task to be measured against
  `docs/tables-monster.md`.
- **The wall compositor** — parked in td: a `just` recipe emitting a fenced wall,
  declaring its own width in its own prose. Fences carry no vectors, so a wall is
  readable, not jumpable; navigation at that scale stays panes.
- **`--measure` as a boot value** — parked in td, behind the same reasoning as the
  dial's refusal.
- **The height axis** — untouched here; it already has its own parked brief with
  its own numbers.

## The lines worth keeping

**Three width rules is the ceiling** — the operator's amendment to ADR-070, added
when the record was already written: *"three rules is not excessive but is the max
before a rethink."* A fourth width family is not a missing constant. It is evidence
the taxonomy is wrong. The count is part of the decision, not a remark about it.

**A cap only narrows.** The change most likely to break the glass invariant was a
cap, and the reason it could not is arithmetic, not care. When the safety argument
is arithmetic, `just check` is a confirmation rather than a hope.

**The renderer had an opinion about every class but the one it renders most of.**
That is the shape of most of this silo's findings: not a missing capability, but an
exception nobody had named, discovered by asking where the rule *didn't* apply.
