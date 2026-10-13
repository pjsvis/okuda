---
date: 2026-10-13
kind: principle — which half of an idea the corpus can check, and which half only an argument can
lineage: the operator's remark, 2026-10-13 — *"sometimes I give the wrong reasons for an idea"* — offered after a sitting in which every mechanism claim the corpus touched was falsified and every goal it touched survived
status: recorded — the law, one sitting's scoreboard as its receipt, and the convention it implies
---

# The mechanism is the fallible half

> ◆ One sitting. **Nineteen** mechanism claims falsified by measurement; **zero** goals
> falsified. Two goals were revised, and both by an *argument* — never by a check.

## The law

> **The nearer a claim is to a mechanism, the more often it is wrong.**

Instincts are *tested*; mechanisms are *dereferenced*. That is the whole of the difference,
and it is why clause 1 demands an address for every claim: not because people reason
badly, but because **mechanisms are where the world disagrees**.

## The scoreboard, 2026-10-13

Offered as a table so it can be argued with rather than admired.

| mechanism claim | falsified by |
|---|---|
| "the corpus is damaged at 80 columns (18%)" | `ADR-TABLE-EDGE-CUT-055` — older than the claim — states the cut is recoverable, so admitted |
| "the separator is chrome" (the gutter) | one render: the body separates columns with whitespace, so the gutter **is** the boundary |
| "widening cannot repair it" (the residue) | widening: the two documents need ≤250 and ≤320 columns |
| "`⋮` marks an elision" | it leads the *source-omitted* indicator on every fence at every width |
| "`art elided` marks a lost diagram" | it matched this silo's own prose *about* `art elided` |
| "the fourth column is a cost column" | the header: it was a **nameless** debrief column |
| "`statusWord` reads the state" | a Status line that was a *sentence* held a landed rule at `open` for six weeks |
| "`elision-monotone` has a test" | the test asserts the *renderer*, and imports nothing from the gate |
| "the indicator works" | the pty dogfood: the mark could never appear, and the abort never cleared it |
| "the change saved 2.5 s" | six samples of the unchanged command spanned 7.2–12.4 s |
| "an illustrative placeholder is harmless" | `citation-census` read it as a minted code within the minute |
| "`script -q` is the pty harness" | it needs a tty on its own stdin; it dies when the loop drives it |
| "the redundant endpoints are superfluous" | they are the **axis**, not claims — the position has no referent without them |
| "the local delta needs the server" | it needs a cache **key**; the render is already a pure function |
| "we are still not rendering our special characters" | 0 of 514 lost in prose, code spans and headings — but a mermaid label loses **465 of 514**, and the ambiguous-width class is undeclared |
| "a combining mark is one column wide" (my reference) | Unicode says **Mn/Me/Cf own no column** — so this instrument reported okuda's *correct* answers as defects |
| "the survival detector reads zero losses" | it indexed a per-character **map** as a boolean: `not {…}` is always `False`, so every reading was zero and the control could not fire |
| "the property escapes all work" | one unsupported pattern (`\p{East_Asian_Width=…}`) is a **parse error**, which killed the whole probe rather than one row |
| "a mermaid label is a lossy context (465 of 514)" | **withdrawn.** One node label holding all 514 characters is a measurement of the *fixture*: 46 candidates across twelve scripts all survive a real label, and a deliberate NEG control could not be made to fire at all — which is the signal that the *premise* was wrong rather than the detector blind |

Against that: the frame's clean edges; *know where you are*; *a format that assists decision
and allows inspection*; *the vocabulary is the scale*; *the registry is two orthogonal
tasks*; *local does a delta* (goal kept, mechanism replaced); *do not drive toward a ramp*.
**Every one survived.** Two were refined — the redundant endpoints, the marker — and both
refinements came from an argument, not a measurement.

## Why the wrong reason is usually the nearest one

This silo already names it, twice:

- **Frame defaulting** — *"the failure is **binding, not ignorance** — the knowledge exists
  and is not bound to the problem"* (`docs/2026-10-08-frame-defaulting.md`).
- **The default shape** — *"the solution a domain hands you **before** you have asked your
  own question"*, whose conversational form is *there's an app for that*.

*Chrome* was available in the code. *Delta* was available in the architecture. *The edges
are messy* was available in the viewport. **The goal was right every time; the mechanism was
defaulted.** Which is why a wrong reason is not a failure to think — it is the nearest
ready answer arriving first.

## The asymmetry that matters

Mechanisms are falsified by **measurement**: cheap, frequent, conclusive, and automatable —
that is what sixteen gates are. Goals are falsified only by **argument**: rare, slow, and
the only instrument is a person, because no gate can check whether the thing you wanted was
worth wanting.

So *"sometimes I give the wrong reasons"* is the **safe** failure. It is cheap to catch and
it names the right region. The unsafe one is the mirror: **a correct mechanism pursuing an
unexamined goal** — every step checks out, and the ramp leads somewhere nobody chose. That is
the Grand Canyon in its deepest form, and it is the reason an ADR opens with **Context** and
not with Decision.

## What follows

**State the goal separately from the mechanism**, and mark the mechanism as a guess:

```
## Mechanism (a guess — attack this)
```

The goal is then held fixed while the mechanism is fair game — which is what happened here
naturally, and what the brief's existing `## Objective` / `## Context` split can carry with
one label.

## What this does not excuse

A wrong reason still costs. It spends the corpus's time, and — worse — **it can hide the
goal**: the "18% damaged" headline was a mechanism claim *of mine*, and it stood as the
sitting's apparent conclusion until a decision older than the claim demoted it. A wrong
reason with a corpus is a work item; without one it is a disaster. That is the entire return
on the apparatus, and it is not a licence.

## Test

Count, per sitting's record, the mechanism claims the corpus falsified against the goals an
argument revised. **If mechanisms are not the more frequently corrected half, this law is
wrong.** (2026-10-13: 18 to 0, and four of the eighteen were falsified *within the hour* of
writing the first draft of this table.)

## Related

- `docs/2026-10-08-frame-defaulting.md` — the mechanism's own diagnosis
- `docs/2026-09-21-the-model-beside-the-loop.md` — what the model does and does not stand in
- `AGENTS.md` — **test-bearing** (*a heuristic is admissible only when it names its own
  failure*), and clause 1 (*cite or mark*)
- `decisions/027-temperament-is-downstream-of-discipline.md` — the barnacle classes, and
  *barnacles-per-kilobyte* as the metric
- `docs/2026-09-15-the-invariants-and-the-index.md` — *an index may cache the invariants; it
  may not invent one* (the goal, un-inventable, one level down)
