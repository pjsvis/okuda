---
type: Brief
callsign: BRF-CALLSIGN-CHECKSUM
date: 2026-10-02
---

# Brief: The callsign checksum — citations that resolve nowhere fail the gate

**Created:** 2026-10-02
**Status:** Done — shipped same sitting (861095a + reviewer fix 8ece77a): both surfaces live in `just check`, census residue baselined at 42/18, 17 species-A strings corrected. The review's live catch: stale zero-hit entries were silent and rideable — the shared verdict now reports them as shrink; acceptance criterion 3 holds for full cleanups. Follow-up filed: per-token baselines (the same-edit count-parity swap).
**Lineage:** the operator, verbatim: *"follow up on the dodgy call sign
thing — its another useful Shannon style checksum thang."*
**Extends:** BRF-VALVE-LINT (the td-ID gate — this is its sibling over the
citation namespace), the One-Way Valve (playbooks/td-playbook.md).
**Grounding:** three strikes on one day, all self-caught, zero mechanical
backstop: two unregistered callsigns in commit messages (both amended
before anything saw them), plus the census's own catches — persisted
prose citing callsigns that never existed.

## Objective

A gate over the citation namespace, sibling to the td-ID valve lint:
**every callsign cited in a persisted document — and in the unpushed
commit-message range — must resolve through the product's own
resolver.** The checksum detects namespace corruption the way a checksum
detects message corruption: cheaply, mechanically, at every gate run.

## The census (2026-10-02, the checksum's first run)

1,889 callsign citations across the persisted corpus; **49 unresolvable
across 24 files** — four species, four dispositions:

| Species | Examples | Disposition |
|---|---|---|
| (A) Misremembered strings for real entries | `ADR-BOUND-010` → `ADR-BOUNDED-ANCHOR-010` ×7; `ADR-SPEECH-CODE-036` → `ADR-NO-SPEECH-CODE-036` ×5; `BRF-CALLSIGN-EVERY` → `-DOC` ×3; `ADR-CALLSIGN-EVERY-DOC` (wrong prefix) ×1 | **Fix in living tiers** (17 strings); the frozen debrief's one stays — the freeze is the freeze |
| (B) Deliberate placeholders | `ADR-NNN` (the template), `ADR-RETIRE-OK` (a fault example), the AI-HR manual's fictional reader `ADV-*`s | Baseline |
| (C) Documented forward references | `ADR-043` ×11 — BRF-VALIDATED-SILCROWS records the tolerance: suppressed until written, self-healing when it lands | Baseline; the ratchet prunes when the ADR lands |
| (D) Dead names | `BRF-RESTRICTED-GRAMMAR` ×7, `BRF-GLYPH-STRESS` ×2, `BRF-ANSI-EMISSION` | Baseline |

**Sequencing ruling:** the species-A fixes land BEFORE the baseline
freeze — the baseline grandfathers the truthful corpus, not the lies.

## Design rulings

1. **The product's own resolver, never a second semantics.**
   `resolveByCallsign` (the silcrow gate's own engine) is the lint's
   oracle: exact-or-ordinal, unique-match-or-null. A lint stricter than
   the product would flag working jumps; a union-set exact match would
   false-positive prose's ordinal forms. Collision honesty comes free.
2. **The registries are pinned to the repo root** — resolved from the
   script's own location, never the process cwd. Outside a silo the
   registries come up empty; a lint with an empty oracle passes or fails
   everything and means nothing.
3. **Two surfaces:** the corpus scan (same file set as the td-ID lint —
   one `scannedFiles`, two consumers, no drift) and the **unpushed
   message range** (`origin/main..HEAD`) — both td IDs and unresolvable
   callsigns in commit messages fail the gate. The unpushed range is
   exactly where amending is still cheap; pushed history is never
   rewritten for hygiene (the valve's residue clause).
4. **The baseline ratchets one way.** At-count passes; over-count or a
   new unbaselined file fails; under-count prints the shrink note and
   names the remedy (`--write-baseline` prunes) — the ratchet stays a
   ratchet, never an allowance.

## Acceptance criteria

- [ ] Census disposition landed: 17 species-A strings corrected; re-run
  census shows the residue, and only the residue, in the baseline.
- [ ] `just check` fails on a new unresolvable callsign in a persisted
  doc; fails on a td ID or unresolvable callsign in an unpushed commit
  message; passes at baseline.
- [ ] The shrink note fires and names the prune remedy.
- [ ] `just check` green on the branch; registries synced in the same
  commit as the brief.

## Out of scope

- **Pushed history** — never rewritten for hygiene.
- **src/ code comments** — the v2 boundary, same as the td-ID lint;
  widen only if code-comment drift ever bites.
- **Registering the dead names** — a baseline entry is an honest
  tombstone; a registry stub would be a lie with a callsign.

## References

- BRF-VALVE-LINT — the sibling gate; verdict and scan-set shared
- playbooks/td-playbook.md — the One-Way Valve, amended with this
  checksum
- src/root.ts `resolveAmongCallsigns` — the oracle (unique-match-or-null)
