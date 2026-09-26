---
type: ADR
callsign: ADR-VALIDATED-SILCROWS-044
---

# Decision: Validated silcrows — inferred references gate on the registry; explicit references stay optimistic

**Date:** 2026-09-24
**Status:** Accepted
**Supersedes:** ADR-031's *optimism* clause — "discovery never validates,
the actuator fails honestly." One clause, not the ADR: dynamism, the
one-destination-one-silcrow citation convention, the doubled-pair
reservations, and re-derivation-replaces-invalidation all stand.

## Context

ADR-031 founded the main document's jump map on an **optimism contract**:
the shape scan (`CALLSIGN_SHAPE`, ADR-024's vocabulary) paints a silcrow
for every callsign-shaped token, nothing is validated, and a dead target
"fails honestly" at the keypress. The clause carried a stated dependency
—"the render path needs no registry at all under optimism" (its ADR-020
reference).

The probe commissioned 2026-09-24 (`tmp/silcrow-junk-probe.ts`, measured
in BRF-VALIDATED-SILCROWS) counted what optimism was painting: **117
occurrences across 46 documents** resolve to nothing at actuation —
acronym coincidences (`UTF-8`, `OSC-8`), stale callsigns (documents dead
or renamed), malformed shorthands (`ADR-BOUND-010`), forward references
(`ADR-043`), and — the majority, 51 — a resolver blind to the advisories
tier (repaired same day as P-0, this decision's precondition). Every
one of those silcrows was a promise the actuator could not keep. And
junk tokens consumed reading-order budget from the 80-address cap,
evicting genuine references.

The actuator resolves callsign targets through `resolveByCallsign` —
the same registry. Validation at discovery therefore removes **zero
working jumps**; it removes promises that were never keepable.

## Decision

**A callsign-shaped token gets a silcrow only if the tier registries
resolve it.** Inferred references (bare shape-matches in prose) gate on
the registry; **explicit references (markdown links to `.md` paths) stay
optimistic** — the author's bracketed link is a deliberate claim, and
the shape scan's match was never the author's.

The boundary holds by parameter (ADR-020): no render-path code reads
ambient directories. The registries load launcher/TUI-side
(`makeCallsignValidator`, one read per document open) and the pure
discovery (`scanReferences`) receives the resolver as an optional
predicate — default optimism keeps `vectors.ts` pure and the tests
shape-only. The gate and the actuator share one resolution semantics
(`resolveAmongCallsigns`, ADR-025's exactly-one + the ordinal
shorthand), so the paint and the actuator cannot disagree.

**Non-silo documents lose callsign silcrows entirely** — no registry,
nothing validates. Honest: outside a silo there was nothing to jump to;
the actuator flashed before. The `.md`-link vectors keep working
everywhere.

**Forward references self-heal.** A suppressed silcrow appears the
moment its document lands and the registry syncs — re-derivation
replaces invalidation (ADR-031's own invariant). The promise is painted
when it becomes keepable; under optimism it was painted when it became
imaginable.

## Alternatives Considered

| Alternative | Why Rejected |
|-------------|--------------|
| Keep optimism; fix the corpus instead | The acronyms are not corpus defects — `OSC-8` is a standard's name. Optimism's paint is a lie precisely where prose is technical. |
| A blacklist (`UTF-8`, `SHA-256`, `OSC-8`, …) | Whack-a-mole; gamed by the next acronym. Gates on the property (the registry says so), not the shape. |
| Gate explicit `.md` links on the filesystem too | The author's link is a deliberate claim; the target may be pending or external. Optimism's one honest domain. |
| The render path loads the registry itself | Violates ADR-020 (ambient reads mutating the frame). By parameter, the crossing lives at the edge, visibly. |
| Dedup the registry reads per token (resolver per call) | One load per open, not per token — `loadCallsigns` once, the predicate closes over the records. |

## Consequences

**What became easier:**
- The glass stops lying: every painted `§NN` resolves. The 80 addresses
  budget only genuine destinations.
- The ear/speak system stops reading dead vectors aloud.
- The gate doubles as a drift surface: stale callsigns stop painting
  *before* anyone fixes the prose — and the probe remains the loud list.

**What became harder:**
- A second resolution-adjacent path to keep honest (the predicate must
  share `resolveAmongCallsigns` with the actuator, or the paint and the
  keypress disagree — the failure this decision exists to remove).

**Constraints this imposes:**
- `vectors.ts` stays fs-free; the predicate is a parameter. A future
  consumer wanting validation must receive it the same way.
- Outside a silo, callsign vectors are gone by design — document this
  wherever the silcrow is explained (`docs/2026-09-04-the-silcrow.md`
  reads "illustrative"; it now reads *true*).

## Related

- Brief: `briefs/2026-09-24-brief-validated-silcrows.md` (BRF-VALIDATED-SILCROWS; the measured probe table)
- Superseded clause: `decisions/031-main-document.md` (ADR-031)
- ADR-024 (callsigns are data — the registry is the semantic anchor)
- ADR-025 (exactly-one resolution; shared by gate and actuator)
- ADR-020 (the ambient-directory boundary, held by parameter)
- td-8394c0; the P-0 tier repair that preceded this decision (advisories
  joined `TIER_REGISTRIES` — validation before the gate, or the gate
  would have hidden 51 real jumps behind a resolver bug)
