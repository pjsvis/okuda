---
type: ADR
callsign: ADR-DERIVED-AMP-TABLE-058
---

# Decision: The state table derives its rows — the registry is the membership, the editor keeps the grouping

**Date:** 2026-10-10
**Status:** Accepted

## Context

`&briefs.md` is a hand-written mirror of `briefs/INDEX.jsonl`, and `amp-check`
enforced that the two agree in both directions. It drifted: on 2026-10-10, 46 of
91 live briefs were absent from the table — and the table's own drift note
claimed 28, so the record of the drift had drifted too. The reconciliation
restored it, but the class recurs by construction: **two stores must agree, one
is generated, and nothing makes the hand copy pull.**

The house already names this: *no parallel stores* (`playbooks/registry-playbook.md`),
and `reg-sync` already reconciles derived fields for exactly this reason.

The pass also found the checker at fault twice, which is the sharper lesson:

- five "phantoms" were **correct** rows — landed briefs the archive registry
  holds, while the checker read only the live registry (the resolver reads both);
- one was a deliberate dogfood fixture, a fake wire in `&alpha.md`.

A mirror check that misreads a correct row as drift is the same failure as a
stale table: **the instrument, not the artefact.** Undeclared scope is the defect
class, one layer up the toolchain.

## Decision

**The table's membership is derived; the grouping is editorial.**

- **Membership is the registry's.** Every live brief appears in `&briefs.md`
  because a tool puts it there, not because an editor remembered. A new brief
  cannot go missing silently.
- **Grouping is the editor's.** Which section a brief sits in, its state glyph,
  its note, and its debrief link are editorial, and the tool never rewrites them.
  A new brief lands in its status's default section, and the editor moves it when
  it matters.
- **`just amp-regen` reconciles; `just amp` checks.** The regen appends missing
  rows to their default sections; the check fails while any live brief is unfiled
  or any tabled callsign resolves nowhere.

```mermaid
title: One direction, one owner
flowchart TD
  R[briefs registry] -->|membership| T[amp-regen]
  E[editor] -->|grouping| T
  T --> D[the state table]
  D -->|check| G[amp]
```

## Alternatives Considered

| Alternative | Why Rejected |
|-------------|--------------|
| Keep the hand mirror and the two-way check | The class that produced this pass: a generated set and a hand copy cannot stay equal without a pull |
| Fully generate the table (status-derived sections only) | Loses the grouping, which is the whole reason the table exists beside the registry |
| Drop the completeness check and keep the table curated | The registry is the membership; a curated table that no longer claims completeness is a different document, and the drift returns unobserved |
| Carry the grouping in the registry's `meta` | Couples the registry to one presentation and needs an entry rewritten per brief; the section is a property of the *view*, not the *record* |

## Consequences

**What became easier.** A new brief is never forgotten; the regen is one command;
the check has one meaning — *filed or not*.

**What became harder.** The tool owns the row shape, so the note and glyph
conventions become a code-level contract; changing them is a generator change,
not a prose edit.

**Constraints this imposes.**

- The generator **never edits an existing row** — it only appends missing ones.
- **Phantoms are errors, never deletions.** A callsign absent from the live
  registry may be archived; the tool reports and refuses to write, and the editor
  decides.
- The default section for a new row is its registry status's section; the status
  map is the generator's, not a second list in prose.

## Related

- `&briefs.md` — the table this governs
- `scripts/amp-briefs.ts` — the reconciler
- `scripts/amp-check.ts` — the wire, target and staleness check
- `decisions/052-archive-resolution-tier.md` — a landed brief resolves against the archive registry
- `docs/2026-10-10-the-seam.md` — undeclared scope is the defect class, at the toolchain layer
- `playbooks/registry-playbook.md` — *no parallel stores*
