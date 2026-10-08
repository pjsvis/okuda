---
type: Brief
callsign: BRF-DATE-INVARIANT
---

# Brief: The date is a claim — the invariant, the lint, and the time document

**Date:** 2026-10-08
**Status:** Done
**Context:** The filename's ISO prefix (`ADR-DATE-FIRST-002`) is the only date that
survives a copy — `mtime` is host-local and lost on transport, frontmatter is
invisible to `ls`. But an unverified assertion can lie: nothing in the repo
reconciles the name's date with the document's or the registry's. Meanwhile
`reg-sync` falls back to `mtime` when a document declares no date, so a persisted
index row can depend on *where the check ran* — the exact distributed variance the
name exists to escape. Measured 2026-10-08: name↔content disagreements 0 (the
document date is `**Date:**`/frontmatter; `**Created:**` is a creation stamp, not
the document date); name↔registry 4 (`briefs/2026-08-27-brief-artpack-aesthetics`,
`-ssh-tui-integration`, `-dense-dynamic-displays`, and
`debriefs/2026-08-31-debrief-the-ledger-day`).

## Objective

Make the filename date a **checkable claim**: where the name carries an ISO date,
the document's declared date and the registry row must agree, and `mtime` is never
persisted as a claim. Record the time taxonomy that warrants this.

## Scope

**In:** the corpus date lint and its baseline, wired into `just check`;
`reg-sync`'s fallback order (content → name, no `mtime`) and its claim/drift
logic; the time document; the nine ancestors' machine-readable landing date; the
conditional rule in the naming doc and the authoring playbook.

**Out:** the `docs/` registry (a separate piece — the lint reports uncorroborated
names rather than gating on them); renaming existing files to satisfy the
invariant (a rename is a rebaptism, not a tidy-up); changing `**Created:**`
semantics.

## Preconditions

- [x] The shared scan set (`scannedFiles()`, `scripts/td-id-lint.ts`) exists and is
      used by two gates already.
- [x] Blast radius measured: 0 name↔content violations (document date only), 4
      name↔registry, all four resolvable by the name claim.

## Work Plan

1. [ ] `reg-sync`: `deriveDate` falls back content → name → `""` (no `mtime`); a
       `dateClaimed` flag replaces `dateAuthored` in drift; `NO DATE CLAIM` reported.
2. [ ] `scripts/date-lint.ts` + `scripts/date-baseline.json` (empty — the corpus is
       clean), wired into `just check`; uncorroborated prefixed names reported.
3. [ ] `tests/date-lint.test.ts`.
4. [ ] `docs/2026-10-08-time-is-a-claim.md` — the taxonomy, the law, mtime-as-cache,
       where mtime stays legitimate, the conditional rule.
5. [ ] The nine ancestors: `**Date:** 2026-10-08` (landing) + `**Written:** 2026-08-03`.
6. [ ] The conditional rule in the naming doc and the authoring playbook.

## Acceptance Criteria

- `just check` passes; a date-prefixed file whose declared date disagrees fails the
  lint.
- `reg-sync` writes no `mtime`-derived date; the four registry mismatches settle to
  the name's date.
- `docs/2026-10-08-time-is-a-claim.md` exists, cross-linked with
  `docs/2026-10-08-the-filename-is-a-record.md`.
- The nine ancestors carry a machine-readable `**Date:**` (landing) and their source
  date.
- `bun test` passes; no new dependency.

## Notes

- The name's claim is corroborated by the content date or the registry row; a
  prefixed name with neither is **uncorroborated** — reported, not gated, until the
  `docs/` registry exists to date it.
- `**Created:**` is when the author started; the name's date is the record's. They
  may differ, and that is not a lie.

## Related

- `docs/2026-10-08-the-filename-is-a-record.md` — the naming argument this enforces
- `docs/2026-10-08-time-is-a-claim.md` — the time taxonomy (work plan 4)
- `ADR-DATE-FIRST-002` — date-first naming
- `scripts/reg-sync.ts`, `scripts/td-id-lint.ts` — the fallback and the scan set
