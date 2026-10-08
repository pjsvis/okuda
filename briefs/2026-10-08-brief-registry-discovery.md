---
type: Brief
callsign: BRF-REGISTRY-DISCOVERY
---

# Brief: One map from the territory — the registry discovers its own tiers

**Date:** 2026-10-08
**Status:** Open
**Context:** Seven places hardcode the tier folder names. Two are already stale
(`scripts/reg-list.ts`, `scripts/reg-menu.ts` never learned about advisories or
the archive). One drift test (`tests/reg-callsign.test.ts`, from
`ADR-VALIDATED-SILCROWS-044`'s P-0) keeps two of the seven in step — a
map↔map checksum, and the loudest evidence that the arrangement is wrong: the
repo pays interest to keep copies of one map agreeing. Map↔territory checksums
are assurance (`docs/2026-10-08-time-is-a-claim.md`); map↔map checksums are debt.
This is debt. The repo's own rule — derivation replaces invalidation — says the
territory should be read, not copied.

## Objective

One map, derived from the territory: document roots are discovered, registry
tiers are self-describing, and no script or source file holds a tier's folder
name. Then a user may rename, move, or add a tier without editing code.

## Scope

**In:** a single shared tier definition, imported by every consumer; discovery of
document roots; a per-tier manifest (the marker *and* the policy); the resolver
(`src/root.ts`) reading discovery; the registry playbook's mappings becoming the
manifest spec; tests.

**Out:** the renderer (`src/render.ts`) — TFS is a reading-surface law, and
discovery must never reach the glass; the `docs/` registry itself (a separate
piece); renaming any existing folder (the capability permits it, the brief does
not do it); a persisted census of discovered tiers (see Notes).

## Preconditions

- [ ] `ADR-ARCHIVE-RESOLUTION` read. The archive is a *lifecycle state*, not a
      name — the live/archive scope split must survive discovery.
- [ ] Every consumer enumerated: `scripts/reg-sync.ts`, `scripts/reg-list.ts`,
      `scripts/reg-menu.ts`, `scripts/td-id-lint.ts` (scan set),
      `scripts/date-lint.ts` (index set), `scripts/jump-demo.ts` (`briefs/`),
      `src/root.ts` (`TIER_REGISTRIES` + `ARCHIVE_REGISTRIES`).
- [ ] The manifest shape agreed, and it covers what `REGISTRIES` holds today:
      index filename, `fmType`, `csPrefix`, default status, status vocabulary,
      archive flag, exclusions.

## Work Plan

**Phase 1 — dedup. Small, safe, ship first: one map, still hardcoded.**

1. [ ] A shared tier definition (the existing `REGISTRIES` shape) in one module;
       every consumer imports it. `reg-list` and `reg-menu` stop holding their
       stale four-entry copies.
2. [ ] Split the two concepts the lists conflate: **document roots** (where
       documents live — `docs/` is one, and is not a tier) and **registry tiers**
       (which have an index). `td-id-lint`/`date-lint` read roots; `reg-sync` and
       the resolver read tiers.
3. [ ] Delete the drift test. There is no second map to drift; keep
       `tests/reg-callsign.test.ts`'s resolution coverage.
4. [ ] `just check` green, no behaviour change.

**Phase 2 — discovery. The capability.**

5. [ ] A **tier manifest** at each registry root: the marker (a directory *is* a
       tier because it declares itself) and the policy, co-located with the
       territory. The code holds the schema; the tier holds the values.
6. [ ] Document roots discovered from the territory — `git ls-files '*.md'` (or a
       `readdir`) minus a *declared* exclusion (`.archive/`), replacing the
       `mdDirs` list in `td-id-lint`/`date-lint`.
7. [ ] `src/root.ts` reads discovery: one list with a scope filter (`archive`),
       replacing `TIER_REGISTRIES` + `ARCHIVE_REGISTRIES`.
8. [ ] Tests: in a scratch silo, a renamed tier and a newly added tier both
       resolve their callsigns; `just check` stays green.
9. [ ] `playbooks/registry-playbook.md`: the hardcoded mappings become the
       manifest spec.

## Acceptance Criteria

- No tier folder name appears as a string in `scripts/` or `src/` — the manifest
  and the discovery code are the only places a name can be written.
- Renaming a tier directory and updating its manifest leaves `just check` green
  and every existing citation resolvable.
- `reg-list` and `reg-menu` cannot go stale, because they hold no list.
- The map↔map drift test is deleted, and no new drift test replaces it.
- Discovery is live: no persisted census, deterministic, offline.
- The renderer is byte-identical for a renamed tier — discovery does not reach the
  glass.
- `bun test` passes; no new dependency.

## Notes

- **This is not a bug; it is entropy at the edge.** The hardcoded list is a map
  that outlived the number of hands editing it; the two stale copies are the
  measurement, not the complaint. The capability it asks for is a registry of
  registries, and the repo already believes the principle — *derivation replaces
  invalidation* — it just has not applied it to folders.
- **"A bit of state" is the trap.** A persisted list of discovered tiers is a new
  map, and it owes a map↔territory checksum to stay honest. Discovery is a
  `readdir`; derive it every run. The durable state is the *manifest convention*
  (what a tier declares about itself), not a cached census. If a census is ever
  added, it is a map and the rule applies to it.
- **Free the names, not the contracts.** A tier still needs an index, frontmatter,
  unique callsigns. The manifest makes the contract *more* explicit by moving it
  from seven files into the tier — localised law, not licence.
- **Sequencing is load-bearing.** Phase 1 first. Discovery while seven copies
  exist is how a fourth stale list is born.
- **The resolver is on Gloam's path.** Discovery must be exact and cheap (one
  `readdir` or one `git ls-files`), and its result must be a finished list — no
  walking, no guessing.
- Absorbs the open task *one tier list* (the resolver reads the registry's tiers).
  The date half of the *deriveDate reads the filename* task is already fixed by
  `BRF-DATE-INVARIANT`.

## Related

- `src/root.ts` — `TIER_REGISTRIES`, `ARCHIVE_REGISTRIES`
- `scripts/reg-sync.ts` — `REGISTRIES`, the richest definition
- `tests/reg-callsign.test.ts` — the tier-drift map↔map checksum
- `ADR-ARCHIVE-RESOLUTION` — the lifecycle scope split discovery must keep
- `playbooks/registry-playbook.md` — the mappings that become the manifest spec
- `docs/2026-10-08-time-is-a-claim.md` — map↔territory vs map↔map
- `docs/2026-08-29-tfs-exclusion-principle.md` — why TFS bounds the renderer, not the registry
