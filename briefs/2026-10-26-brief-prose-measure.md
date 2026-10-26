---
type: Brief
callsign: BRF-PROSE-MEASURE
date: 2026-10-26
---

# Brief: Text takes the measure, art takes the glass — prose gets a band, and a fence states its requirement

**Date:** 2026-10-26
**Status:** Open — design agreed in session; staged P1 (the measure), P2 (the fence
receipt), P3 (the authoring note)
**Amends:** `ADR-PANE-NOT-CANVAS-069` §5, narrowly — see *The one guarantee this
narrows*
**Lineage:** the operator's question on the renderer's invariants — *how wide can we
go, and how high, and can it hold at zero lag* — and the two-shapes-in-one-pane case
(*"text is most easily consumed at 40–80 columns … a controller for the text width
would keep text readable on the same terminal as a wide diagram"*). The answers
below are measured, not asserted; the rejections are the operator's as much as
mine.

## The question

Two symptoms, one cause:

- at 300 columns a paragraph wraps to 296, which no one reads — the renderer has no
  opinion about readline length, so the pane's opinion is the only one;
- at 300 columns a table stops at 116 (`BAND_CONTENT`, `src/render.ts:509`;
  applied `:2096`) — the renderer **already** has an opinion about how wide a
  dataset should be drawn, and it declines to stretch it.

So the renderer already believes that width is a property of the *thing being
drawn*, not of the glass. It says so for tables and for diagrams and for chrome,
and is silent for the one class where the belief is oldest: prose.

## What is already true, measured

| # | invariant | where |
|---|---|---|
| 1 | okuda owns every `\n`; no emitted line exceeds the glass | `ADR-HARD-WRAP-004` |
| 2 | the glass is the only *width input*; nothing has a "natural" document width | `src/render.ts:618`, `docs/2026-09-04-the-ergonomic-box.md:95` |
| 3 | caps are **per class, derived from the artifact** | tables 116 (`src/render.ts:509`), diagram canvas 2048 (`:363`), floor 20 (`:383`), hints 80 (`src/tui.ts:283`) |
| 4 | a frame narrower than the pane is a margin; wider is a lie | `ADR-WIDENING-LAG-054` |
| 5 | a resize moves the cut point, not the document's blocks | `ADR-PANE-NOT-CANVAS-069` §5 |

Measurements taken this session (`docs/2026-08-20-origin-doc.md`, `docs/showcase.md`,
`decisions/027-*`, `src/render.ts` as source text):

- **The glass invariant holds to 8000 columns.** Every emitted line ≤ width at
  21, 40, 80, 120, 240, 480, 960, 1920, 3840 and 8000; `over = 0` at every rung.
- **Render cost is flat in width.** 33.9 / 30.3 / 29.2 / 30.2 / 32.5 ms at
  20 / 80 / 120 / 1920 / 8000 (warm, mean of 5). Mildly U-shaped: narrow costs
  wrapping, wide costs emission. There is no width cliff.
- **A paint is not free but is not the problem either.** One full frame measured
  through a pty: 2 330 B at 80×24, 65 493 B at 1920×120. `paint()` clears and
  re-emits the whole frame (`src/tui.ts:917`), so cost ≈ rows × cols; the
  unmeasured part is the terminal's own cell work, not ours.
- **What is *not* capped is prose.** At `--width 8000` a paragraph wraps to
  7 996 content columns. In the same render, table rules stayed ≤ 101 and the only
  rules to reach the glass were thematic breaks (7 992 columns, one of them).

That last line is the whole brief: the renderer bands everything except the text.

## The answer

**Two classes, one number.**

| class | width | members | why |
|---|---|---|---|
| **text** | `min(content, 76)` | paragraphs, headings, list text, blockquotes, diagram descriptions, thematic rules, the H1 rail | a break inside a sentence is insignificant, so the width is a *reading* parameter |
| **art** | the glass, capped by its own band | code fences, diagrams, tables (116), role surfaces | a break inside a code line, a box edge or a rank is a lie, so the width is the *thing's* own |

```
  prose wraps here, at the measure ─────────────┐
  and continues …                               │ 76 content
  ┌──────────────┬───────────────┬─────────────┐│
  │ a table keeps its own band: 116             ││
  └──────────────┴───────────────┴─────────────┘│
  ▛▀▀▀▀ a diagram takes the glass ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
```

**The number is not new.** `BAND_CONTENT`'s own comment authorises it — *"a table is
authored to fit 80 columns (content 76)"* (`src/render.ts:503-509`) — and the hints
row is budget-bound to the same 80 (`src/tui.ts:283`). Three families, one number,
already in the file. `PROSE_MEASURE = 76` content (80 with the document margin).

**And it is a no-op at and below 80 columns**, because content width *is* 76 there:
`--width 80`, a default TUI pane at 74, a 60-column phone pane all render
byte-identically to today. The change is provably confined to glasses wider than
80, which is exactly where the defect lives. That is also the reason it needs no
flag to ship: nothing that works today changes.

**Above 80 the change *improves* invariant 5.** Today prose reflows on every
resize; under the measure, once the glass passes 80 the prose stops reflowing
entirely and only the art's cut point moves — ADR-069's goal, reached for prose as
well.

## Change 1 — the measure (P1)

Add `PROSE_MEASURE = 76` and `measure: Math.min(width, PROSE_MEASURE)` to `Ctx`
beside `width`/`fullWidth` (`src/render.ts:604-624`). No new input: `measure` is
derived from what the renderer already has, so `renderDocument`'s signature,
`needsRepaint`, `geometryOf` and `paintedGeometry` are untouched.

| site | today | after | why |
|---|---|---|---|
| `wrapBlock` — the handler choke point (`:1170`) | `width` | `measure` | prose |
| list item text (`:1965`) | `avail` from `width` | `min(avail, measure - indent)` | prose, nested |
| blockquote (`:1866`) | `width - 2` | `measure - 2` | prose |
| diagram description (`:1668`) | `width - 2` | `measure - 2` | prose *about* art |
| reference badge fit (`:103`, `:107`) | `width` | `measure` | a badge rides prose |
| `hr()` (`:1403`) | `styler.rule(width)` | `styler.rule(measure)` | a break terminates text |
| H1 rail (`:714-715`) | `width - 4` | `measure - 4` | the rail bracketed the title, not the page |
| code fence elide (`:1416`) | `width - 2` | **unchanged** | art |
| diagram budget (`:1701`) | `ctx.width` | **unchanged** | art |
| table target (`:2096`) | `min(width, 116)` | **unchanged** | art, and still the widest band |
| role surfaces (`:714`, footer, hints) | `width`/`fullWidth` | **unchanged** | chrome |
| identity header (`:736`) | `ctx.width` | **unchanged** | generated chrome, one line, elides |

**The two judgement calls, named.** The thematic rule and the H1 rail take the
measure: their job is to *terminate a passage of text*, and a rule four times wider
than the text it closes reads as a page edge pretending to be a break — at 8000
columns, a single `---` became 7 992 dashes. The margin to its right is not lost
space; it is the page (ADR-054's asymmetry, applied per block). The identity header
stays on the glass because it is provenance, not prose.

**Left-anchored, not centred.** The left edge is the rail the eye scans down; a
centred column moves the rail, and a moved rail is read as a different document.

## Change 2 — a fence states its requirement (P2)

Diagrams already state theirs: `⋮ … · art elided · needs 241 cols`
(`src/render.ts:1741`). Code fences mark each cut line with `…` (`:1420-1428`) and
say nothing about how much was lost — right for a long URL, wrong for a wall of
laid-out documents, where the elided right edge is *whole documents* and the
reader has no number telling them so.

**The receipt: `⋮ … · code elided · needs N cols`, one muted line after the block,
emitted only when a line was cut. N is the fence's own widest line.**

- **Outside the fence, not inside.** Copy-paste from a fence must reproduce the
  source exactly (ADR-004's stated consequence). A receipt inside the block would
  corrupt the one thing a fence promises.
- **Only when elided.** A permanent `code fits` line under every fence is
  decoration; the conditional element is the signal (the References receipt's own
  lesson). The *number* is glass-independent — it is measured from the fence, so
  its content never jitters; only its presence tracks the glass.
- **The number survives the cut.** Same fit ladder as the diagram receipt: drop
  the clause before the number (`needs 200 cols` is the last rung), because on a
  36-column pane the number is the only thing that can still be read.

### The one guarantee this narrows

ADR-069 §5 promises the **block sequence** is identical at every width, and it is
enforced by `tests/table-diagram.test.ts:535` (*"the vertical rhythm is invariant
under pane width"*). A fence receipt changes that sequence by one block, at exactly
one event: the frame in which a resize crosses that fence's requirement.

The amendment is narrow and the reasoning is the ADR's own: **a receipt is the
block whose job is to report the glass's shortfall, so it exists exactly when there
is a shortfall to report.** Everything else holds — prose-run lengths become
*more* invariant above 80, art-run lengths are unchanged, and the receipt fires on
a resize (the reader's declared intent, `docs/2026-09-05-frame-as-shite-filter.md`),
never on ambient chrome jitter, which is the failure ADR-054 was written against.

The alternative that would keep §5 literally — a number folded into the `…` marker —
is rejected below: it costs columns at the cut, needs decoding, and dies at the
exact width where the information matters.

## Rejections

| Alternative | Why Rejected |
|---|---|
| **A live measure dial** (nudge keys, `[`/`]`) | It is a *third* geometry input. `needsRepaint(content, geometry, paintedGeometry)` is deliberately two (`ADR-RESIZE-GEOMETRY-046`), and a measure changes the lines without changing the glass — the exact shape of the bug that ADR was written to fix, on all three repaint paths (`watch`, `reload`, `resize`). It buys what a pane resize already buys. |
| **`--measure` / `OKUDA_MEASURE` now** | Parked, not refused. Boot value beside `--width` is the house shape (`docs/2026-08-31-actuator-inputs.md:51`), but the constant is one line to change and a flag is a second path. Ship the constant; add the dial when the 40–80 range is measurably wrong for a reader. |
| **Two terminals as the answer** | Same configuration minus simultaneity, and it costs an anchor flip per glance forever. It is the right answer for *different documents*; it is a poor answer for *one document at two scales*, which is the case. Kept as the fallback. |
| **Multi-column prose in the renderer** | One rail becomes two, the anchor becomes ambiguous, and resize turns into a reflow across a column boundary — the minimap trap. A wall is a *fence*: opt-in by construction, because someone has to type the columns. |
| **Walls as a renderer mode** | Compositing belongs to the environment (`AGENTS.md`, three concerns). A `just wall` compositor is parked; `src/` stays out of it. |
| **Receipt inside the fence** | Corrupts copy-paste — the fence's one promise (ADR-004). |
| **Receipt always present** | A muted line under every fence, for the 99% of fences that fit. Decoration, and it dilutes the marker that means "cut". |
| **Number folded into `…`** (e.g. `…+80`) | Costs the columns at the cut, is a glyph to learn, and elides itself at the width where the number matters most. |
| **Centring the measure** | Moves the left rail, the one thing the eye tracks down a document. |
| **Filling the right margin** (progress gauge, reference rail) | UI furniture in the one place the house has always refused it. The margin is the page. |
| **Capping prose per-block at each block's natural length** | That is an intrinsic document width, which `docs/2026-09-04-the-ergonomic-box.md:95` refuses in as many words. |

## Out of scope, owned

| thing | why it is not here | owner |
|---|---|---|
| the wall compositor (`just wall`, N documents in one fence) | compositing, not rendering; and it needs the receipt from Change 2 to declare its width | parked in td under this brief's callsign |
| a declared measure (`--measure`, `OKUDA_MEASURE`) | a second path for a constant that is one line; sequencing per `docs/2026-08-31-actuator-inputs.md` | parked in td under this brief's callsign |
| the height axis (a tall diagram's vertical policy) | orthogonal, already parked with its own numbers | `BRF-DIAGRAM-HEIGHT-AXIS` |
| vectors inside fences | refused by design — *"Never vectors: … fenced"* (`src/vectors.ts:40`), *a sample's paths are illustrative, not citations* (`ADR-MAIN-DOCUMENT-031`). A wall is readable, not jumpable; navigation at that scale is panes | no task — this is a refusal |

## Tests

- **The measure holds**: a long paragraph at `--width 300` emits no line wider than
  80 display columns, and every line still ≤ 300 (the glass invariant is not
  weakened). Property test across 100–400 columns.
- **The measure never widens**: at `--width 60` and `--width 40` the output is
  byte-identical to the current build. This is the regression gate that makes the
  change safe: *nothing below 81 columns may move.*
- **Class separation**: at `--width 300` a 160-column table and a 200-column fence
  still reach 116 and 200 respectively — the measure is text-only.
- **The rail and the rule follow the text**: the H1 chip sits at `measure - 2`, and
  an `hr` is `measure` columns, at `--width 300`.
- **The receipt**: a fence with a 200-column line at `--width 80` emits
  `needs 200 cols`; the same fence at `--width 240` emits nothing; the receipt line
  is ≤ the glass; at `--width 36` the number survives and the clause does not.
- **The receipt is not in the block**: stripping the receipt line from the render
  reproduces the fence's source lines exactly (the copy-paste contract).
- **ADR-069 §5, as amended**: block sequence identical at 60/80/120/160/200 for
  documents whose fences fit; for the elision document the *only* delta is the
  receipt block, asserted positively rather than tolerated.
- `just check` green, `bun test` green, `scripts/elision-monotone.ts --strict`
  unchanged (the measure reflows prose and cuts nothing; any baseline movement gets
  a stated reason or the change is wrong).

## Done when

| step | done means |
|---|---|
| P1 | the table above implemented; output below 81 columns byte-identical; new tests green |
| P2 | the receipt shipped with its tests; ADR-069 §5 amended in place with the reasoning |
| P3 | `docs/style-guide.md` states the two classes and the number, and renders as the demo of itself |
| record | **proposal:** an ADR for the measure (number 070, the next free), written after the code and citing the measurements above — the callsign is coined when the file lands, so this brief names a number rather than citing a document |

## Related

- `ADR-PANE-NOT-CANVAS-069` — the width policy this completes, and §5 which it amends
- `ADR-HARD-WRAP-004` — the invariant the measure must not weaken
- `ADR-WIDENING-LAG-054` — *a frame narrower than the pane is a margin*; the licence for a banded frame
- `ADR-TABLE-EDGE-CUT-055`, `ADR-UNIVERSAL-ELISION-050` — the art class's existing law
- `docs/2026-09-04-the-ergonomic-box.md:93-95` — the refusal of an intrinsic document width
- `docs/2026-08-31-actuator-inputs.md:51` — *the host is the config system* (the parked flag's shape)
- `src/render.ts:503-509` — the 80/76 number, already authorised for tables
