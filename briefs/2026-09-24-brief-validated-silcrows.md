---
type: Brief
callsign: BRF-VALIDATED-SILCROWS
date: 2026-09-24
---

# Brief: Validated silcrows — the shape scan consults the registry it stands on

**Created:** 2026-09-24
**Status:** Done — shipped 2026-09-24 (P-0 commit 9712702; gate commit follows it). ADR-044 accepted; td-8394c0.
**TD:** td-8394c0 (created 2026-09-24 as the operator's todo item; this brief is that item's scope). The P-0 tier fix is separable and ships first, its own commit.
**Lineage:** the operator, verbatim: *"we want to avoid applying a silcrow to UTF-8 and the like"* — and *"we should be able to maintain a map of call-signs and file-paths and use that to disambiguate prospective call signs."* The probe commissioned before this brief (`tmp/silcrow-junk-probe.ts`) found the map already exists and found something better besides: a resolver blind to an entire tier.
**Extends:** ADR-031 (supersession of the *optimism* clause — one clause, not the ADR; dynamism, one-destination-one-silcrow, the citation convention, the doubled-pair reservations all hold). ADR-024 (callsigns are data — the shape regex was only ever the discovery heuristic; the registry is the semantic anchor). ADR-025 (exactly-one resolution — the gate reuses it, no new resolution semantics). ADR-020 (the render-path boundary — holds by parameter, not violation).
**Sibling:** BRF-SRC-LINE-LEDGER — its brief claims ADR-043, and its three `ADR-043` mentions are the corpus's entire population of forward references to it. This brief's gate suppresses exactly those three until the ADR exists: the corpus wrote our test case for us, one hour before the gate.

## Objective

A callsign-shaped token gets a silcrow **only if the registry resolves it**. Discovery stays pure; the registry map enters as a parameter, loaded launcher-side; the actuator is unchanged (it already resolves through the same registry — after this, the paint and the actuator finally agree).

## Why — measured, not asserted

`tmp/silcrow-junk-probe.ts`, 2026-09-24, over the silo corpus (333 documents, six directories), discovery logic identical to `scanReferences` (callsign shape, fences excluded, frontmatter excluded), resolution via `resolveByCallsign` — the same function the jump actuator uses:

| Measure | Value |
|---|---|
| Genuine (registry-resolving) callsign occurrences | **1,155** |
| Junk — painted today, resolves to nothing | **117** (46 documents affected, 80 unique targets) |

The 117 decompose into classes, and the classes matter, because **only one is the acronyms the operator named**:

| Class | Count | Examples | The failure |
|---|---|---|---|
| (a) Resolver tier gap | **51** | `ADV-READER-SIDE-FILTER` ×17, `ADV-SEARCH-TWO-FILTERS` ×10 | **Not the heuristic's fault.** `TIER_REGISTRIES` (src/root.ts) lists briefs/decisions/debriefs/playbooks — `advisories` was added later (`69122be`) and never joined the list. The files exist, `INDEX.jsonl` carries them, reg-sync validates the tier, and the resolver cannot see it. Two registry lists that must agree; one drifted. |
| (b) Acronym coincidence | ~10 | `OSC-8` ×5, `UTF-8` ×3 | The operator's original complaint. Shape-match, not a reference: `OSC-8` is the hyperlink escape sequence's standard name and will never be a callsign. |
| (c) Stale callsigns | ~20 | `BRF-SEARCH-SURFACE` ×7, `BRF-RESTRICTED-GRAMMAR` ×4 | Deliberate references to documents that have died or were renamed. Broken promises — the prose layer's drift, surfaced. |
| (d) Malformed shorthand | ~7 | `ADR-BOUNDED-ANCHOR-010` ×4, `ADR-NO-SPEECH-CODE-036` ×3 | Deliberate references in broken form — the ordinal-shorthand grammar (`^([A-Z]{2,})-(\d{2,3})$`) can't parse a hyphenated prefix. Authoring-layer defect. |
| (e) Forward references | 3 | `ADR-043` ×3 — all in BRF-SRC-LINE-LEDGER | Deliberate references to not-yet-written documents. |

**Every class resolves to nothing at actuation today.** The gate removes zero working jumps; it removes promises that were never keepable. And class (a) is the argument *for* the gate wearing a disguise: a resolver gap this size (51 of 117) hid inside "optimism" for weeks because a painted §NN that fails on press looks the same as a working one until you press it.

**Why a registry gate, not a blacklist.** Enumerating `UTF-8`, `SHA-256`, `OSC-8`… is whack-a-mole; the next acronym games it. ADR-024 already declared callsigns are *data* — the shape scan was the heuristic; the registry is the anchor. Gate on the property (the registry says so), not the shape.

## Design sketch

**Explicit references stay optimistic; inferred references get validated.** A markdown link `[label](path.md)` is a deliberate authorial claim — keep the promise (the target may be pending or external; the actuator fails honestly). A bare shape-match in prose made no claim — the scanner invented one; the registry check is the retraction. `UTF-8` owes no apology.

**The boundary holds by parameter (ADR-020).** No render-path code reads ambient directories. `loadCallsigns` runs launcher/TUI-side — the layer that already reads the registries for the footer badge — and discovery receives a resolver predicate:

```
scanReferences(source, opts?: { resolves?: (target: string) => boolean })
```

Default `resolves = () => true` keeps `vectors.ts` pure and the tests shape-only; `runTui` passes the `resolveByCallsign`-backed predicate. Callsign tokens go through the gate; `.md`-link tokens never do.

**Non-silo documents lose callsign silcrows entirely** (no registry → nothing validates). That is honesty, not regression: outside a silo there was nothing to jump to — the actuator would have flashed. The `.md`-link vectors keep working everywhere.

**Forward references self-heal.** A suppressed `ADR-043` silcrow appears the moment the ADR lands and the registry syncs — *re-derivation replaces invalidation* (ADR-031's own invariant). The promise is painted when it becomes keepable; under optimism it was painted when it became imaginable. The ear system (`ear-playbook.md`) stops reading dead vectors aloud.

**P-0 ships before the gate: add `["advisories", "INDEX.jsonl"]` to `TIER_REGISTRIES`** (one line) + a `reg-callsign` test covering the tier. Shipping the gate first would suppress 51 real jumps — hiding a resolver bug behind validation. Fix the list, then the gate. The probe file is the drift list for the classes (c)/(d) authoring repairs — out of scope here, named below.

## Ship order

1. **P-0 — the tier fix**: `TIER_REGISTRIES` + advisories; test; its own commit. (Optionally fold the probe into a `just drift` recipe so the next tier gap surfaces loudly, not at the glass — follow-on, not rider.)
2. **ADR-044** — supersession of ADR-031's optimism clause (ADR-043 is claimed by BRF-SRC-LINE-LEDGER). Records: inferred-vs-explicit, boundary-by-parameter, non-silo honesty, self-healing forward refs.
3. **The gate**: `scanReferences` predicate; launcher pass-down; tests — `UTF-8` unpainted, `ADR-031` painted, `ADV-READER-SIDE-FILTER` painted post-P-0, `ADR-043` unpainted-until-landed.

## Scope

**In:** `src/vectors.ts` (the predicate), `src/tui.ts`/`src/cli.ts` (the pass-down), `src/root.ts` P-0 line, vectors/launcher tests, the probe file (already in `tmp/`).

**Out:** prose repair of class (c)/(d) stale references — an authoring pass over the probe's drift list, not a rendering change; shorthand-grammar extension for hyphenated prefixes (ADR-BOUNDED-ANCHOR-010 is an ADR question if it recurs); a `docs/` tier registry (DOC-* callsigns — the unindexed narrative layer; naming it, not settling it); the actuator, unchanged.

## Preconditions

- [x] **P-1 — the probe ran** (`tmp/silcrow-junk-probe.ts`): 117/1,155 junk ratio, class table above. **Verified 2026-09-24.**
- [x] **P-2 — every gate-suppressed token fails at actuation today**: established by construction — the probe and the actuator call the same `resolveByCallsign`. **Verified 2026-09-24.**
- [x] **P-3 — the class-(a) probe re-run is clean**: after P-0, `ADV-*` migrated from junk to genuine (probe: genuine 1155 → 1223+; junk 117 → 98, of which 66 non-tier-gap classes now unpainted under the gate — `UTF-8`, `OSC-8`, stale callsigns, malformed shorthands, forward refs). **Verified 2026-09-24** — live proof: the gated map paints `ADR-031 §12` and `ADV-READER-SIDE-FILTER §13` (the P-0 fix visible in the same map), retracts the acronyms, and leaves the `.md` link ungated.

## Risks

| Risk | Exposure |
|---|---|
| The gate hides resolver gaps (class (a) becomes invisible, not fixed) | P-0 first, and the probe stays as the drift list. The lesson is standing: two registry lists drifted for weeks because nothing compared them. |
| Suppressing deliberate forward refs reads as loss | Self-healing: the silcrow appears on landing (re-derivation). The suppressed state is honest — "no promise yet" — where the optimistic paint was "promise, then flash". |
| Non-silo docs lose all callsign vectors | Documented honesty — the actuator flashed before. `.md` links unaffected. |
| `TIER_REGISTRIES` is a second list again (root.ts vs reg-sync.ts) | The P-0 lesson, hardened: consider exporting one list and importing it in both. In scope for P-0's commit if the seam is one line; an ADR note if it isn't. |

## Related

- td-8394c0 — the todo item this brief scopes
- ADR-031: `decisions/031-main-document.md` — the optimism clause superseded;
  ADR-020 reference therein ("the render path needs no registry at all under optimism")
- ADR-024 (callsigns are data), ADR-025 (exactly-one; the duplicate-callsign lint,
  `e2eb65d`), ADR-020 (`decisions/020-zero-notification-stillness.md` — the ambient-directory constraint)
- `src/vectors.ts` — `scanReferences`, `buildJumpMap` (the invariant "the cap is the map's,
  not discovery's" absorbs the gate: suppressed tokens no longer consume the 80 addresses)
- `src/root.ts` — `TIER_REGISTRIES` (the drift), `loadCallsigns`, `resolveByCallsign`
- `tmp/silcrow-junk-probe.ts` — the measured Why; the drift list for the authoring pass
- `docs/2026-09-04-the-silcrow.md` — the silcrow's own explainer; its `§` paint changes
  from illustrative-optimistic to illustrative-true
- BRF-SRC-LINE-LEDGER (sibling) — claims ADR-043; carries the corpus's three
  `ADR-043` forward references; the gate's first live test
