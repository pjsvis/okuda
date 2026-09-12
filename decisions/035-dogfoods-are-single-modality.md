---
type: ADR
callsign: ADR-DOGFOODS-ARE-SINGLE-MODALITY-035
---

# Decision: Dogfoods are single-modality — the primary field is the test field

**Date:** 2026-09-12
**Status:** Accepted

## Context

The keyboard dogfood (`docs/keyboard-dogfood.md`, td-b6d849) prompted a
proposed extension: a Moira-spoken variant — `say` announces each token
and the action it actuated, as a standing cross-modality check. The
appeal is structural and will recur: ADR-032's own rationale is
accessibility, the Moira pipeline is mature (`just moira-*` recipes,
ADR-033's punctuation prosody), and "test what you build for" sounds
like rigor. The variant was considered and resisted 2026-09-12; this
ADR is the firewall, so the reasoning does not live only in the td
database — td is the continuity system, ephemeral and confined to the
clone. If a decision is not in the silo, it does not exist.

## Decision

Dogfoods confirm actuation in the primary modality (the visual flash,
for the control plane). No dogfood carries a standing obligation to be
accessible to a second field. The product's accessibility — operable
blind — is a real constraint (ADR-032) and is tested the honest way:
one eyes-free pass, when voice bindings ship as a deliberate feature
(td-b4bae8), as a one-shot audit of the grammar. It is never tested by
duplicating the instrument.

## Alternatives Considered

| Alternative | Why Rejected |
|-------------|--------------|
| Moira-spoken dogfood variant (`say` per actuation) | Conflates product accessibility (operable blind — real) with instrument accessibility (ceremony — the dogfood's audience is the developer, in the primary field); flash and voice reduce from the same `verbFor` dispatch — a second rendering of one truth, not a second truth, whose only failure surface is itself |
| TUI speech hook (env-gated `say` on flash/jump) | A product feature smuggled in as test scaffolding; voice feedback belongs to the actuator bindings (td-b4bae8), built once and deliberately, not ad hoc under a test recipe |
| Recipe-level narration (speak the spec table) | Speaks the specification, not the actuation — no actuation is confirmed; an audio cheat-sheet, not a check |
| Dual-modality as standing policy | A spoken shadow per observable is a second vocabulary, and second vocabularies drift (the defect class ADR-032's tidy removed); as a mandate it taxes every future binding and kills the one-line-table-edit promise in `keygrammar.ts` |

## Consequences

**What became easier:**

- Every future dogfood has one observable channel to maintain; new
  actuation types document in one place.
- The actuator pocket stays cheap to bind — a one-line table edit,
  as promised.

**What became harder:**

- Nothing structural. The flash texts carry a speakability property
  that is unaudited until voice bindings ship.

**Constraints this imposes:**

- Product voice feedback, when it ships, is a bound actuator
  (td-b4bae8's decision), never an ambient test hook.
- An accessibility audit of the grammar is permitted exactly once per
  voice-binding milestone: eyes-free, screen off — audio *instead*
  of the visual field, never alongside it as a parity requirement.

## Salvage (kept, deliberately)

- One-time `say` pass over the flash vocabulary as a copy
  (speakability) audit — a command, not a channel.
- The eyes-free pass, later, as above.

## Related

- `docs/keyboard-dogfood.md` — the instrument this decision shapes
- ADR-032 — the accessibility rationale whose halo makes the
  temptation recur
- ADR-033 — the rejection-ADR precedent (a vocabulary removed from
  the consideration set)
- ADR-017 — ephemeral knowledge routes to td; persistent knowledge
  routes to the silo
