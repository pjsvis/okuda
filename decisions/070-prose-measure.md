---
type: ADR
callsign: ADR-PROSE-MEASURE-070
date: 2026-10-26
---

# Decision: Text takes the measure, art takes the glass

**Date:** 2026-10-26
**Status:** Superseded — 2026-10-26, by `ADR-PROSE-MEASURE-071`, within the hour.
This was a **reversal, not a replacement**: the decision was withdrawn, not improved
on. The measure was implemented in `src/render.ts` (`PROSE_MEASURE`, `Ctx.measure`)
and reverted the same day on the operator's dogfood report (*"it's like a return
to Glow"*); `PROSE_MEASURE`, `Ctx.measure` and `tests/prose-measure.test.ts` are
gone, and prose wraps at the glass again. Read this record for the reasoning that
was tried and the scope error it contained — a renderer-side page width is
compositing, which belongs to the host — not for the law.
**Superseded by:** `decisions/071-prose-takes-the-glass.md`
<!-- The `Enforced by:` line below named a test that the reversal deleted, and
     every gate passed over it: `citation-census --strict` does not resolve
     `Enforced by:` targets. Kept as written, with the status line above as the
     correction, because an ADR is a historical record (see the playbook). -->
**Enforced by:** `tests/prose-measure.test.ts` **(deleted 2026-10-26 — see Status;
now `tests/prose-glass.test.ts`, which asserts the opposite property)** — the
measure held and filled at wide glasses, was a **no-op at and below 80 columns**,
art kept its own band, the rule and the H1 rail followed the text, an elided fence
carried `…` and no receipt, and a document's line count was invariant under the
glass.

## Context

Every class of content had answered *"what does too wide mean?"* except the one
that is only a sequence of words:

| class | answer | where |
|---|---|---|
| table | compose at the author's width, band at 116 | `ADR-TABLE-EDGE-CUT-055`, `src/render.ts:509` |
| code fence | elide at the glass — a break is a false line | `ADR-UNIVERSAL-ELISION-050` |
| diagram | lay out at its own canvas, elide at the glass | `ADR-PANE-NOT-CANVAS-069` |
| chrome | a fixed budget (hints ≤ 80) | `src/tui.ts:283` |
| **prose** | *the glass's full content width* | this record |

Measured 2026-10-26: at `--width 8000` a paragraph wrapped to **7 996 columns**;
in the same render table rules stopped at 101 and only thematic breaks reached the
glass (7 992). So the renderer already believed width is a property of the thing
drawn. It said so for every class but the one where the eye's own range
(40–80 columns) is the constraint.

The operator framed the cost in one line: *"if we had a controller for the text
width we could keep text readable on the same terminal as a wide diagram"* — and
the second half of the same conversation refused the controller.

## Decision

> **Reversed 2026-10-26** (`ADR-PROSE-MEASURE-071`). The decision below no longer
> holds; prose takes the glass. The one clause worth carrying forward: if a
> measure is ever wanted it is §3's **boot value**, never a constant.

**Prose is banded at `PROSE_MEASURE = 76` content columns (80 with the 2+2
document margin), and the band is a constant, not a dial.**

`Ctx.measure = min(ctx.width, PROSE_MEASURE)`; the **text** class reads it — prose,
headings, list text, blockquotes, diagram descriptions, the reference badge that
rides prose, the thematic rule, the H1 rail. The **art** class keeps `width`
(glass − 4) or its own band: code fences, diagrams, tables, role surfaces, the
identity header. Frame is left-anchored, never centred.

Five sub-rulings, each load-bearing:

1. **The number is not new.** `BAND_CONTENT`'s own comment authorises it for
   tables (*"authored to fit 80 columns (content 76)"*, `src/render.ts:503-509`),
   and the hints row is budget-bound to the same 80. Three families, one number:
   a house rule, not a preference.
2. **The rule and the H1 rail are text.** Their job is to terminate a passage;
   a rule four times wider than the text it closes is a page edge pretending to
   be a break. The identity header stays on the glass — it is provenance, not
   prose.
3. **No dial, and no flag yet.** A live measure would be a *third* geometry input
   and `needsRepaint(content, geometry, paintedGeometry)` is deliberately two
   (`ADR-RESIZE-GEOMETRY-046`); a boot flag is a second path for a constant that
   is one line. If the 40–80 range proves wrong for a reader, the house shape is
   a boot value beside `--width` (`docs/2026-08-31-actuator-inputs.md:51`).
4. **A fence says *that* it was cut, never *how much*.** The `…` already says
   *more to see here, if you want* (the operator's ruling). Diagrams keep their
   `needs N cols` because a cut structure's remainder cannot otherwise be judged;
   a cut line's marker is the whole of what the reader needs to act. So
   `ADR-PANE-NOT-CANVAS-069` §5 stands **unamended**: no receipt block appears or
   disappears with the glass.
5. **A wall is a fence, and compositing is not ours.** Multi-column layout arrives
   as an authored fence, never a renderer mode: opt-in by construction, because
   someone has to type the columns. Walls are readable, not jumpable — fences
   carry no vectors (`src/vectors.ts:40`) — and navigation at that scale is panes
   (windowing), not walls (rendering).

## Alternatives Considered

| Alternative | Why Rejected |
|---|---|
| Prose keeps the glass (status quo) | A 300-column paragraph is 296 columns of unread text; the renderer would be the only party with no opinion about the thing it renders most of. |
| A live measure actuator (nudge keys) | A third geometry input on a gate designed for two, threading through `watch`, `reload` and `resize` — the exact bug shape ADR-046 exists to prevent, for a setting a pane resize already provides. |
| `--measure` / `OKUDA_MEASURE` now | Parked (td, under `BRF-PROSE-MEASURE`). Boot value is the right shape *if* a per-reader number is needed; the constant is one line and ships without a config surface. |
| Centring the measure | Moves the left rail — the single edge the eye tracks down a document. A moved rail reads as a different document. |
| A measure per block (each block its own natural width) | That is an intrinsic document width, refused in as many words by `docs/2026-09-04-the-ergonomic-box.md:95`. |
| `needs N cols` receipt under an elided fence | Refused by the operator: the marker is sufficient, and a receipt would make a block appear and disappear with the glass. A guard test keeps the refusal honest. |
| Two terminals as the answer | The same configuration minus simultaneity, and an anchor flip per glance forever. Correct for *different documents*; poor for one document at two scales. Kept as the fallback. |

## Consequences

**What became easier:**

- **The document has one shape above the measure.** Measured line counts at
  120 / 200 / 400 / 1000 columns: `2026-08-20-origin-doc.md` 852 / 852 / 852 / 852;
  `showcase.md` 400 / 400 / 400 / 400; `069-the-pane-is-not-a-canvas.md`
  229 / 229 / 229 / 229. <!-- Reversed 2026-10-26: this is the defect written as a
  virtue. A render identical at 120 and at 1000 columns is a renderer that has
  stopped reading the glass — the operator's dogfood report, and the ground of
  ADR-PROSE-MEASURE-071. --> Prose stops re-flowing once the glass passes 80, so only
  art's cut point moves — ADR-069's goal, reached for prose.
- **Wide panes became usable.** At 200 columns a paragraph reads at 78 and a table
  at 118 in the same frame; the margin to the right is the page (`ADR-WIDENING-LAG-054`
  — *a frame narrower than the pane is a margin*).
- **Nothing that worked moved.** The measure equals the content width at and
  below 80 columns, so `--width 80`, a 74-column TUI pane and a 60-column phone
  pane render byte-identically. The whole suite agreed: one golden changed, and it
  changed in the H1 rail at `--width 120` (72 dashes, not 112).
- **A refusal stayed refused, with a test.** An elided fence emits `…` and no
  receipt vocabulary; the next well-meaning addition has to argue with a red test.

**What became harder:**

- **Two measures in one frame**, deliberately: text at 76, tables at up to 116,
  art at the glass. It is legible only as a rule — *text takes the measure, art
  takes the glass* — which is why every consumer names its class in
  `src/render.ts` and why a future third class must state its side.
- **A long URL in prose now hard-splits at 76 on a wide glass**, where it used to
  fit whole. This is what an 80-column pane already did; the measure makes it the
  law at every width. Honest, and the reader can widen the *fence*, not the prose.
- **Table slack is now conspicuous.** With prose no longer 196 columns wide, the
  band's evenly-split air (`ADR-TABLE-EDGE-CUT-055`) shows up as a rank column
  padded to ~30 columns. Pre-existing policy, newly visible; recorded as a
  finding, not fixed here.

**Constraints this imposes:**

- The two class lists in `Ctx.measure`'s comment are the contract. New content
  must be assigned a side, and a class that reads both is a defect, not a
  compromise.
- `PROSE_MEASURE` must never be derived from the pane, the environment, or a file.
  A future width bug will arrive looking like a sensible convenience ("let the
  reader set the measure").
- **Three width rules, and no fourth.** Prose (76), tables (116), art (the glass).
  The operator's ceiling, 2026-10-26: *"three rules is not excessive but is the
  max before a rethink."* A fourth width family is not a missing constant — it is
  evidence the taxonomy is wrong, and it needs a rethink of the classes rather
  than another number. The count is part of the decision, not a remark about it.

## Related

- Brief: `briefs/2026-10-26-brief-prose-measure.md` — the design, the measurements
  and the refusal, with the session's reasoning
- `ADR-PANE-NOT-CANVAS-069` — the width policy this completes; §5 is untouched
- `ADR-HARD-WRAP-004` — the invariant a cap cannot weaken (a cap only narrows)
- `ADR-WIDENING-LAG-054` — the asymmetry that licenses a banded frame
- `ADR-RESIZE-GEOMETRY-046` — why the measure is not a third geometry input
- `src/render.ts:503-509` — the 80 / 76 number, already authorised for tables
