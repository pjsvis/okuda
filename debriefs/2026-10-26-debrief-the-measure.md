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
**Status:** Done, and then **reversed** — `PROSE_MEASURE` shipped, `ADR-PROSE-MEASURE-070`
recorded, the fence receipt refused on the operator's word, `just check` green at
**852 tests**; and within the hour the operator dogfooded it and the measure was
reverted (`ADR-PROSE-MEASURE-071`). The parts of this session that stand are the
conception below, the explainer and the census; the measure does not. Read the
reversal addendum at the end for what the failed decision cost, and for the one
finding worth more than it: **the control was never run.**

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

> **Reversed 2026-10-26 — this reading should have been red, and was read as a
> prize.** The invariant *is* the defect: a render that cannot tell 120 from 1000
> columns is a renderer that has stopped reading the glass. The numbers were in
> hand, at the right width, in this session — the instrument was built and pointed
> the wrong way. That is the costliest sentence in the file. (`ADR-PROSE-MEASURE-071`)

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

## Addendum 2026-10-26 — the explainer, and the census

Written after the record above, in the same sitting: the session kept going
because a book was open on the table, and the doctrine it produced was worth
more than the width rule it followed. Annotated here rather than rewritten, per
the rule this section is about to describe.

**What landed after the debrief's first write.** `c4dc5d6` — `explainers/causation.md`,
*Causation, indoors*: the ladder in our own work, three diagrams that each decide
something, the boundary where the confounder lives, and the conventions —
solid is a writer, dotted is a refusal, a diagram is dated, supersede by
annotation, declare every omission. `63085e6` — the ladder, cut → control → lag
→ declare, with *adjust* at the bottom and each rung carrying its instance from
our own history. `b373391` — `scripts/seams.ts`: every inbound crossing in `src/`
must name its rung, gated in `just check`, with `tests/seams.test.ts` pinning both
of the detector's failure directions.

**The finding that mattered most.** The top rung is invisible to a census. A cut
crossing is not in the code, so a list of what exists can never show it; the
strongest move in the ladder is the one the ladder cannot count. So cuts live in
the census as **refused arrows with verifiers** — a pattern that must not appear in
`src/`, failing the day the arrow comes back. `$COLUMNS` is held that way, and so
is "the render never reads the clock or randomness", which is the real reason a
document renders byte-identically: not discipline, but no arrow.

**Building an instrument about instruments found three defects in itself.** A naive
comment stripper desyncs on a regex literal containing a quote (`/['"]/`), stops
reading the file and reports *nothing* — silently. `cli.ts` is the file that
watches the filesystem, not `tui.ts`, and it binds `watch` by destructuring a
dynamic import. And `$COLUMNS` is cut in the only form the census can see it: an
override handed to a child, not an absent read. Three instruments, three errors,
all found by using the thing rather than describing it.

**Owed, with owners.** The explainers register — nine documents, the README's own
~8 trigger fired, filed in td rather than decided as a side effect of a commit.
A fifth instance of the ladder, ideally from a case not already solved, which is
the only honest test of whether it is a law or a nice sentence. The lexicon stays
alone until one of us breaks the claim.

## Addendum 2026-10-26 (second) — the reversal, and the control that was never run

The measure is gone. `ADR-PROSE-MEASURE-071` reverses `ADR-PROSE-MEASURE-070`; the
code, the test file and the style-guide passages are reverted, and prose wraps at
the glass again. The debrief keeps its conception section because the reasoning was
sound *and wrong*, which is the more useful record of the two.

**The dogfood line.** *"I have dogfooded this and it's like a return to Glow."* A
paragraph stopped at 76 columns in a 200-column pane, and the rest of the frame was
margin. That is what glamour does, and the shape had been imported with the number.

**Why 862 green tests said nothing.** Nine of them were written to the cap and
pinned it. An instrument that encodes a decision can only confirm it — and the
suite grew exactly as fast as the decision needed. This is not a test-coverage gap;
it is the wrong kind of instrument, and the reversal ships the right one
(`tests/prose-glass.test.ts`: prose follows the glass, measured as width, not as
bytes; verified by reinstating the cap and watching all three fail).

**The control was one command away and was never run.** The protocol already says a
detector needs a control and the control passes first. The control here was *the
tool this one replaced*, installed on the same machine, renderable in the same
session. The rule the next session should carry: **before an ADR about how the
product reads, render the same document in the predecessor.** The probe is a
finder; dogfood is the judge; the predecessor is the control.

**Two claims the record made that were not true.** `ADR-070` §3 said the dial was
*"parked (td, under `BRF-PROSE-MEASURE`)"* and this file counted "two parked
siblings and one filed finding". `td list --all | grep -i measure` returns **zero**
— the park was prose-only, which is the wish-versus-ticket failure rule 7 names,
found in the document that elsewhere warned about unpaid claims. And the finding
that *was* filed died with the measure: the conspicuous table slack was caused by
the cap, so there is nothing left to open.

**What the session still owns.** The explainer (`explainers/causation.md`) and the
census (`scripts/seams.ts`) are untouched by the reversal and keep their debt: a
fifth rung instance from a case not already solved. `ADR-071` also hands the tooling
one finding it did not fix — `citation-census --strict` passes over a dangling
`Enforced by:` target, which is how an ADR can cite a test that no longer exists.

**The cost, plainly.** Half a session, three documents, nine tests and one style
guide, written and withdrawn inside an hour. Cheap at the price: it bought a
reversed decision recorded as a reversal, a guard test that catches the next person
who reaches for a constant, and one sentence in the style guide that teaches the
boundary (*a wide paragraph's remedy is the pane or the fence, never a cap*).
