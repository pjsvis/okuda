---
type: ADR
callsign: ADR-TEMPERAMENT-DISCIPLINE-027
---

# Decision: Temperament is downstream of discipline

**Date:** 2026-08-31
**Status:** Accepted

## Context

Two events, one morning. A foreign-context draft (a Gemini conversation,
landed as `docs/2026-08-31-vector-resource-locators.md`) carried three
classes of barnacle — contract contradictors, phantom referents,
provenance gaps — and was reconciled in one pass against the ledger: the
wire grammar (ADR-026), the timing protocol (ADR-021), the file-only
contract. Same day, an observation that a model update had made the
model "more reserved, less yappy" was greeted as progress.

Both events press the same temptation: solve drift by choosing a *politer*
model. This ADR refuses it, and states what actually governs.

## Decision

**Model temperament is a downstream variable. Drift is governed by the
ledger.** Whatever a model's verbosity, confidence, or reserve profile,
the corpus's recorded contracts — decisions, lints, reviews, citation
norms — are what constrain its output. We invest in the ledger, not in
model selection.

Unpacked, operationally:

1. **The metric is barnacles-per-kilobyte, not words-per-minute.** A
   dense draft with phantoms (`register[15]`) and a terse draft with
   phantoms fail identically. Reserve is a virtue only when it is the
   silence of verification, not of vagueness — a reserved model invents
   more quietly, and quiet invention hides below the waterline.
2. **Cite or mark.** Every claim about the system carries a `file:line`
   citation, or is explicitly marked *proposal*. No third voice.
3. **Reconcile before landing.** Foreign-context drafts — other models,
   other sessions, other silos — are reconciled against the ledger before
   they merge, with provenance recorded in the document itself (the VRL
   pattern: what was scraped, what was kept, what was routed elsewhere).
4. **Contract debt is paid first.** A contract the ledger declares but
   nothing enforces (ADR-025's lint, at this writing) is the loudest
   drift risk in the silo — louder than any model's temperament.
5. **Reserve without the ledger is worse than yappy with it.** The
   muppet-with-a-ledger beats the genie-without. (The "no muppets"
   criterion selects models; the ledger is what makes selection matter
   less.)

## Alternatives Considered

| Alternative | Why Rejected |
|---|---|
| Solve drift by model selection (pick politer models) | Selection doesn't compose across sessions and silos; temperament is a per-model accident, the ledger is per-corpus law; and the eval criterion ("no muppets") already gates models — gating is not governing |
| Solve drift by prompting (ask nicely for caution) | Prompts are wishes; registers are contracts. A prompt survives one context; an ADR survives all of them |
| Accept drift as the cost of foreign drafts | Drift compounds — one undeclared grammar fork (nearly shipped, 2026-08-31) would have cost more than every reconciliation this silo has ever performed |

## Consequences

**What became easier:** model churn becomes irrelevant at the contract
level; drafts from any source land through the same gate; the review
discipline is teachable to any agent, because it reads the ledger, not
the model.

**What became harder:** the ledger must stay current — an out-of-date
ledger misleads *confidently*, which is the one failure worse than
yapping. Reconciliation is now a required step, not a courtesy.

**Constraints:** every foreign-context document lands with a provenance
note; every system claim carries a citation or a *proposal* mark; the
barnacle count is watched as a metric (three classes in one document was
the case that set this rule).

## Provenance

Forged 2026-08-31, reconciling `docs/2026-08-31-vector-resource-locators.md`
— the phrase itself is the operator's compression of the review debrief;
the unpacking is this ADR's whole job.

## Related

- Doc: `docs/2026-08-31-vector-resource-locators.md` (the reconciliation
  that forged the phrase)
- ADR: `decisions/026-wire-format.md` (the contract the draft would have
  forked)
- ADR: `decisions/020-zero-notification-stillness.md` (the precedent for
  recording dispositions as decisions)
- Doc: `docs/2026-08-30-naming-like-nasa.md` (the veto — a name must not
  lie about its referent; Hume's Razor in typographic form)
- Conceptual Lexicon (system.md): *no muppets*, *Mentational Humility*,
  *Compulsive Narrative Syndrome* — the temperament-side vocabulary this
  ADR subordinates to the ledger side
