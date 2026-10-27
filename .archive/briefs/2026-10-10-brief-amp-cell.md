---
type: Brief
callsign: BRF-AMP-CELL
---

# Brief: The state cell derives — a status change reaches the table

**Date:** 2026-10-10
**Status:** Rejected — 2026-10-27, the operator's call: too old, and the corpus has moved on. Archived rather than deleted, so it can be **replundered** if the need returns; the idea is not being judged, only the queue position.
**TD:** (to create)

## Context

ADR-058 derived `&briefs` **membership**: `amp-briefs.ts` appends a new brief
automatically, so none goes missing. It does not derive the **state cell**, and it
never edits an existing row — so a status change leaves the row lying. Hit twice
on 2026-10-10: BRF-SEAM-AUDIT landed and kept `· open`; BRF-PROTOCOL-UPDATE's
note kept its pre-edit title.

## Objective

Reconcile the row's **state cell** — the glyph — from the registry status, leaving
the grouping, the note and the verdict the editor's; and flag a row whose state
disagrees with the registry.

## Evidence

- `scripts/amp-briefs.ts` reconciles membership only (append-only, per ADR-058).
- Two live instances, 2026-10-10: the SEAM-AUDIT row (`· open` against a `done`
  registry) and the PROTOCOL-UPDATE note (a stale title).
- `amp-briefs: OK — 99 tabled, 94 live, 42 archived` — the check passes while a
  row's state lies.

## Scope

**In:** `scripts/amp-briefs.ts` — a status→glyph reconciliation of existing rows
(the derived cell), and a `just amp` report naming any row whose glyph disagrees
with the registry. **Amends ADR-058's "never edits an existing row"** to "never
edits an *editorial* cell": the glyph joins membership on the derived side.

**Out:** the **note** (editorial — hand-written or hand-chosen) and the
**grouping** (the section). Both stay the editor's.

## Preconditions

- [ ] ADR-058 is accepted — the derive-membership decision this extends.

## Work Plan

1. [ ] Define the status→glyph map as the one home (`· open`, `✓ done`,
      `↓ parked`, `✗ rejected`).
2. [ ] `amp-briefs.ts --write`: rewrite a row's glyph to match its registry
      status; leave the note and the section untouched.
3. [ ] `--check`: report a row whose glyph disagrees — the gate.
4. [ ] Amend ADR-058: derived vs editorial cells.

## Acceptance Criteria

- A status change (`open → done`) is reflected in `&briefs` by `just amp-regen`,
  with the note and the section untouched.
- A hand-written note survives a regen.
- `just amp` fails while a row's glyph disagrees with the registry.

## Notes

The line is **derived vs editorial**, not "new vs existing". ADR-058 drew it at
"new rows only" for safety; the right line is by *cell*: membership and glyph are
the registry's; grouping, note and verdict are the editor's. A note that is
*exactly* the registry summary is a third case — derive it or mark it
hand-written; not decided here.

## Related

- `decisions/058-derived-amp-table.md` — the decision this amends
- `scripts/amp-briefs.ts` — the reconciler
- `&briefs.md` — the table
