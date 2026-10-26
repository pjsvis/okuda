---
type: ADR
callsign: ADR-PROSE-MEASURE-071
date: 2026-10-26
---

# Decision: Prose takes the glass — the measure is reversed

**Date:** 2026-10-26
**Status:** Accepted — **reverses `ADR-PROSE-MEASURE-070`**, accepted and
implemented earlier the same day and reverted within the hour. The reversal is
recorded rather than quietly reset because the record, not the git log, is what a
future session re-reads.
**Enforced by:** `tests/prose-glass.test.ts` — prose follows the glass at 120,
160 and 200 columns, widens monotonically with it, and the narrow panes (80, 60)
are unchanged. Verified as an instrument, not assumed: reinstating
`min(width - 4, 76)` in the paragraph handler fails all three.

## Context

`ADR-PROSE-MEASURE-070` banded prose at `PROSE_MEASURE = 76` content columns,
with `Ctx.measure = min(width, 76)` read by prose, headings, list text,
blockquotes, diagram descriptions, the thematic rule and the H1 rail. It shipped
with nine tests, a brief, a debrief and a style-guide amendment, at 862 green.

The operator then rendered real documents in it. The report is the finding:

> *"I have dogfooded this and it's like a return to Glow."*

That is an exact description of what the code does. At a 200-column pane a
paragraph stopped at 76 and the remaining 120 columns were margin. `ADR-070` had
listed exactly this as an advantage — *"the document has one shape above the
measure: 852 lines at 120 / 200 / 400 / 1000 columns"* — and it is not one: a
renderer that produces the same output at every glass has stopped responding to
the glass, which is the one thing a renderer is for.

## Decision

**Prose wraps at the glass's content width (glass − 4), as it did before
`189a89a`. There is no renderer-side prose measure.** `PROSE_MEASURE`,
`Ctx.measure` and every consumer are removed, `tests/prose-measure.test.ts` is
deleted, and the 120-column golden's H1 rail is 112 dashes again.

If a measure is ever wanted it is a **boot declaration** beside `--width` — a dial
the reader turns, not a default the renderer applies. It is not wanted now.

## Why — three grounds, in order of force

1. **Scope.** A fixed page width is **compositing**, and compositing belongs to
   the environment (`AGENTS.md`, *Scope Discipline*: three concerns, three
   owners). Deciding where the text sits and how wide the page is inside the
   renderer crosses a boundary the silo already drew — and it crossed it while
   citing the rule that forbids it, since `ADR-070` also named the pane as the
   remedy.
2. **The default shape.** `ADR-070`'s number was local — `BAND_CONTENT`'s comment
   authorises 76 for tables — but the *shape*, prose wrapped to ~80 whatever the
   pane, is glamour's, i.e. the predecessor's. The lexicon's test asks whose
   boundary conditions a default encodes; the answer was Glow, and the operator's
   dogfood word agreed with the test. **The control existed and was never run.**
3. **The asymmetry.** Every other class withholds honestly: a fence says `…`, a
   diagram says `needs N cols`, and the implicit instruction is *widen and the
   bytes return*. The measure withheld text with **no receipt at all** and, per
   `ADR-070` §3, made the cap unvaryable by design — *"must never be derived from
   the pane, the environment, or a file"*. A limitation the reader cannot buy back
   is the one thing this tool's central argument — *widen the glass* — cannot
   contain.

**What the reversal does not retract.** The diagnosis stands: a 296-column
paragraph is as unread as one cut at 40. It is simply not the renderer's to fix.
The remedy is a wider fence for art, a narrower pane for prose, or a boot value
the reader chose — the style guide now says so, in place of the numbers it
carried for a day.

## Alternatives Considered

| Alternative | Why Rejected |
|---|---|
| Keep the measure (`ADR-070` status quo) | It is a clamp with no actuator: the reader sees a margin and no receipt, and the ADR forbids varying it. Dogfood rejected it in one command; the argument was lost on evidence, not taste. |
| A boot flag (`--measure` / `OKUDA_MEASURE`) now | The right *shape* — a declaration, not a cap — but a second width path to maintain for a preference. Deferred as a live question, not as a parked ticket: nothing exists in td, so there is nothing to close. |
| The pane and the host | **Chosen.** Windowing belongs to the host, the pane is already the actuator, and a reader who wants narrow text narrows the pane — the tool's own advice for art, applied to prose. |
| Keep a smaller measure (e.g. 100) | The numbers differ; the shape does not. Any constant applied to prose at every width has the same defect, and the honest version of it is a dial. |
| Centre the measure instead of left-anchoring | Moves the left rail — the one edge the eye scans down. `ADR-070` rejected it for the same reason and the rejection survives the reversal. |

## Consequences

**What became easier:**

- **A wide pane works.** Prose fills the frame again; the margin is gone.
- **One class taxonomy, as before.** *Prose wraps; structure elides.* No third
  width family, so `ADR-070`'s "three width rules and no fourth" ceiling is no
  longer load-bearing and no longer needs defending.
- **A finding dissolved.** `ADR-070` recorded table slack as newly conspicuous
  ("recorded as a finding, not fixed here") — the measure caused it. There is no
  ticket to open, because there is no defect left.

**What became harder:**

- **Long prose on a very wide pane is unowned again.** 296 columns of text is a
  real cost and no one now pays it. The honest position: it is the reader's
  window, and the fix is the window.
- **`ADR-070`'s citations had to be repaired by hand.** Its `Enforced by:` named
  a test that no longer exists, and `citation-census --strict` passed anyway —
  **the gate is blind to a dangling `Enforced by:`**, which is a finding about the
  gate, filed rather than fixed here.

**Constraints this imposes:**

- `PROSE_MEASURE` must not return as a constant. A future measure is a boot value
  or nothing, and `tests/prose-glass.test.ts` is what says so.
- **The three-owner rule is the gate to cite** when anyone proposes a page, a
  column count, or a reading width from inside the renderer. The measure passed
  review *because* it was argued as a typography choice; it fails as a scope one.

## The process finding, which outlives the decision

- **862 passing tests found nothing, and could not have.** Nine of them were
  written to the cap and pinned it. An instrument that encodes a decision can only
  confirm it — which is why the reversal ships with a test that measures *the
  property* (prose follows the glass) rather than the constant.
- **The control was one command away and was never run.** The protocol already
  says a detector needs a control and the control passes first. Here the control
  was *Glow itself*, the tool this one was built to replace, available on the same
  machine. The house habit this should install: **before an ADR about how the
  product reads, render the same document in the predecessor and compare.** The
  probe is a finder, not the judge; dogfood is the judge.
- **The record claimed tickets that never existed.** `ADR-070` §3 said the dial
  was *"parked (td, under `BRF-PROSE-MEASURE`)"* and the debrief counted "two
  parked siblings and one filed finding". `td list --all | grep -i measure`
  returns **zero**. Rule 7's wish-versus-ticket failure, occurring inside the
  document that elsewhere warned about unpaid claims.

## Related

- Reversed: `decisions/070-prose-measure.md` (annotated in place, per the
  palimpsest protocol in `playbooks/decisions-playbook.md`)
- Brief: `briefs/2026-10-26-brief-prose-measure.md` · Debrief:
  `debriefs/2026-10-26-debrief-the-measure.md` — both annotated with the reversal
- `ADR-PANE-NOT-CANVAS-069` — the width policy `ADR-070` claimed to complete; it
  is restored as the operative one
- `ADR-HARD-WRAP-004` — prose wraps; the invariant the reversal restores in full
- Code: `src/render.ts` (`Ctx.width`), `tests/prose-glass.test.ts` (the guard)
