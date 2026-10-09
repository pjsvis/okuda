---
date: 2026-10-08
kind: principle — the mechanism behind two observations made the same day: that AI-generated products converge on their predecessors, and that models reason in the wrong frame about zero-gravity construction unless reminded of the boundary condition
lineage: the operator's two turns, 2026-10-08 — on Markdific, *"good point about ai generated products: they will be similar to previous products"*, and then *"ai is not very good at reasoning about stuff like zero-gravity construction, unless it is constantly reminded that gravity is effectively zero in freefall or interplanetary transits"*
status: recorded — the phenomenon named and the remedy stated; the terms entered in `system.md`'s lexicon
---

# Frame defaulting — the prior is the mean, and the boundary condition is not in it

> A model does not stand in the situation. It stands in the **modal case of its
> reading** — and when the situation's boundary conditions depart from that mean,
> the departure is not in the text, so it is not in the answer. The failure is
> **binding, not ignorance**, and it is checkable: ask the work to name the
> deviation it is using.

## The occasion

Two observations on one day, believed to be unrelated at first:

1. **AI-generated products resemble prior products.** A competent GUI markdown
   tool built now will converge on themes, fonts, split view and PDF export —
   the shape of every markdown tool in its training data. (See
   `docs/2026-10-08-prior-art-the-ai-markdown-wave.md`.)
2. **Models reason poorly about zero-gravity construction** unless reminded
   that gravity is effectively zero. The reminder has to be *constant*, not once.

They are one phenomenon. This note names it.

## The mechanism

The vocabulary of a domain carries its physics. *Support*, *span*, *load*,
*stack*, *foundation*, *stability*, *above*, *underneath* — in the text an
engineering model learned from, these terms are overwhelmingly gravity-laden.
So a task stated in the domain's vocabulary retrieves the domain's **linguistic
frame** and applies it to the physical situation.

The knowledge is not missing. Orbital mechanics, freefall, momentum
conservation, radiative-only thermal management — all of it is in the training
data. It is simply **not bound** to the problem, because the binding is supplied
by whatever frame the text implies. The model can reason about zero gravity; it
does not *stand in* zero gravity.

This is **the schema is the argument** one level up
(`docs/2026-09-14-derrida-and-the-decomposed-pdf.md`): the inherited schema
decides what can be held, and the zero-gravity clause was never in it.

## One law

> **The prior is the mean over the training frame, and it is applied
> regardless of the actual boundary conditions.**

AI-generated tools regress to the mean of prior tools. Engineering reasoning
regresses to the mean of prior engineering. Neither failure is ignorance; both
are the **unexamined frame**.

## Why "constantly reminded" is exactly right

Within a long context, a constraint decays. Attention is a recency-weighted
field, not a memory, so a boundary condition stated once is lost by the time it
matters. Re-injection is the remedy — and that is a law this silo already holds,
in two places:

- *continuity is re-reading, not recall* (`docs/2026-10-06-the-shared-artifact.md`);
- *the variable is an input, not state* (`docs/2026-09-03-the-variable-is-the-invariant.md`).

The zero-gravity case is the same claim pointed at physics.

**And reasoning can make it worse before better.** More steps inside the wrong
frame yield more elaborate wrong detail plus a post-hoc justification. That is
CSN mechanised: the narrative fills the gap and the trace launders it. A long
chain of thought with no explicit frame check raises *confidence*, not
correctness.

## Where it bites

The failure is largest where the deviation from the default is large **and** the
text is heavily weighted toward the default:

- **Physical extremes:** zero-gravity, deep sea, high vacuum, cryogenic,
  high-radiation, relativistic, planetary or microscopic scale.
- **Institutional extremes:** non-default jurisdictions, accounting standards,
  non-Western contexts, historical periods.
- **New domains with no text yet,** where the mean is not merely unhelpful but
  actively misleading.
- **Post-cutoff facts.**
- **Meta, and nearest to home:** product design, organisation design — *"how a
  thing like this is done"* is itself an inherited frame.

## The remedy — two moves, both already in the house

1. **A frame declaration.** State the domain's **deviations from the default**,
   not the whole frame — for zero gravity: no gravity, no drag, no "up", thermal
   dissipation by radiation only, momentum conservation dominant, stability by
   tether or rotation rather than stacking. Short, because only the departures
   are stated.
2. **A frame citation.** Require the derivation to **name which deviation it is
   using** — the analogue of *every claimed fact names its instrument*. If the
   reasoning never references the frame, it is defaulting, and that is checkable.

The declaration is the brief; the citation is the lint. That is the same
division this silo already runs: a constraint stated in a document, and a gate
that fails when the work does not honour it.

## Three caveats, because the frame must be true

1. **The declaration must be warranted, not merely asserted.** A wrong deviation
   is worse than the default; it carries the same obligation as any other claim —
   cite or mark.
2. **Reminding is expensive.** Re-pasting the frame crowds the context. The
   efficient form is deviations-only plus a citation, never the whole frame
   restated.
3. **This is a default, not a ceiling.** Under an explicit frame with a
   derivation check, the model does fine. Building a story of AI incapability
   would be CSN *about* AI — the same sin, one level up.

## The close

The remedy for frame defaulting is not a better model; it is a persistent frame
plus a citation check. That device already exists here and has a name — the
**Edinburgh Protocol**. `system.md` is the frame declaration; *"every claimed
fact names its instrument"*, the gates, and the Impartial Spectator are the
frame citation. The zero-gravity problem is that device pointed at physics
instead of at a codebase.

## Related

- `docs/2026-09-21-the-model-beside-the-loop.md` — the model as a finder, never a judge; off the clocks; the excerpt pair
- `docs/2026-09-14-derrida-and-the-decomposed-pdf.md` — the schema is the argument
- `docs/2026-10-06-the-shared-artifact.md` — continuity is re-reading, not recall
- `docs/2026-09-03-the-variable-is-the-invariant.md` — the variable is an input, not state
- `docs/2026-10-08-prior-art-the-ai-markdown-wave.md` — the product-convergence half
- `system.md` — the frame declaration itself; the lexicon entries **frame defaulting**, **frame declaration**, **frame citation**
