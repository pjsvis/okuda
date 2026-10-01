---
type: ADR
callsign: ADR-LEGIBILITY-GATE-049
---

# Decision: The legibility gate — existence is necessary, legibility is the promise

**Date:** 2026-10-01
**Status:** Accepted (amends ADR-045 — the gate grows a criterion, not a
substrate; rides the same commit as Ring B, BRF-SILCROW-PATHS step 3)

## Context

ADR-044 taught the silcrow honesty: a painted vector that jumps nowhere
must fail honestly. ADR-045 gave the path gate its substrate — filesystem
existence. The Ring B entry review (with the operator, 2026-10-01) found
the criterion the substrate cannot see: a path can exist and still not be
worth the reader's keystroke. The operator's own note app listed its
grader data (`data/graded_matrix.jsonl`) alongside its readable documents
— and the exiled-by-intuition answer was already in the note: *horizontal
data that we likely cannot read properly, so do not link them*. A
`.jsonl` deref lands in `wrapWholeFile` word-wrapping multi-kilobyte
records: all the bytes, none of the reading. The render exists; the
promise is still broken — kept to the letter, broken in spirit.

## Decision

**The path-silcrow gate has two criteria: the destination must exist
(ADR-045), and its render must be legible (this ADR). Legibility is an
extension denylist at discovery — `EXILED_EXTS` in `src/vectors.ts` —
first exile `.jsonl`. The exile is a token class, not a gate: an exiled
target can never enter the map, so body paint, actuator, and the
References section (ADR-047's pure projection) retract in one move. No
second filter anywhere.**

Sub-rulings, each load-bearing:

- **`.json` stays.** Pretty-printed JSON is indented text; a config or
  manifest is a thing a reader might genuinely open. Exile on evidence,
  not suspicion (Hume) — until the glass says otherwise.
- **The denylist is the policy's home.** Each future exile (`.csv`?
  `.log`? we don't know yet) is one measured line, not a new decision
  round-trip. Enumerated exiles only — never an allowlist of the
  renderable; an allowlist is ceremony that must be maintained against
  every extension the corpus invents.
- **Explicit author links are untouched** — `RE_MD_LINK` matches `.md`
  only, so an author who wants to link a `.jsonl` has no vector today and
  gains none; the authoring question (if it ever arises) is a grammar
  change, not this gate's business.
- **The References section needs no structural change** — reviewed
  2026-10-01. It is a pure projection of the map, which is precisely why
  the exile flows through with zero drift. The one discipline this
  imposes: the denylist lives at discovery, never bolted onto the section
  (two lists is the disease ADR-044 was written against).

## Alternatives Considered

| Alternative | Why Rejected |
|-------------|--------------|
| Existence only (ADR-045 unchanged) | A silcrow that jumps into a wall of wrapped JSON: honest about *where*, dishonest about *whether it was worth going* |
| An allowlist of renderable extensions | Must anticipate every extension; the corpus invents faster than lists update — deny by evidence, don't bless by guess |
| Refuse at actuation, keep the paint | Paint/actuator disagreement — the exact contract ADR-044 exists to forbid |
| Filter the References section separately | Two filters, one map — the drift disease; the section is a projection and stays one |
| Authoring rule: never cite `.jsonl` | 22 corpus mentions today; conventions drift, code doesn't — and the renderer's job is to render the corpus as written, not to police it |

## Consequences

**What became easier:**
- Every vector now promises a readable render — the §NN badge is a
  promise about the destination's *quality*, not just its existence.
- `.jsonl` mentions cost nothing: 22 mentions corpus-wide exiled (the W3
  probe's measurement), 9 `.json` mentions kept.

**What became harder:**
- Legibility is a judgement, existence is a fact — the denylist is where
  judgement lives, and each addition is a small act of taste that must
  argue its case at the glass.

**Constraints this imposes:**
- The exile applies ungated — even the pure scan (no predicate) never
  discovers an exiled path; an exiled target can never enter the map.
- Ring C (bare basenames) stays parked; this ADR says nothing about it.
- Cross-silo paths (`../sibling/x.md`) resolve and jump by design
  (td-1c8fca's anchor ruling); Ring B paints bare ones when they exist,
  exactly as explicit links already do — observed, accepted, watched at
  the glass.

## Related

- ADR-045 `decisions/045-silcrow-paths.md` — the gate this amends; its
  substrate (fs existence) unchanged, one criterion added
- ADR-044 `decisions/044-validated-silcrows.md` — the honesty principle
  this extends: no promise kept to the letter and broken in spirit
- ADR-047 `decisions/047-references-section.md` — the receipt that retracts
  with the map, by construction
- BRF-SILCROW-PATHS `briefs/2026-09-29-brief-silcrow-paths.md` — W6
  (legibility), measured and decided 2026-10-01
- docs/2026-09-04-the-silcrow.md — the explainer, updated in the same
  commit
