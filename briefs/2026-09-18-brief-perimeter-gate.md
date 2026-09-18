---
type: Brief
callsign: BRF-PERIMETER-GATE
date: 2026-09-18
---

# Brief: The perimeter gate — the moira group holds only recipes that invoke okuda

**Created:** 2026-09-18
**Status:** Open
**Lineage:** ADR-PERIMETER-039, *the voice reads okuda and does not live in it*, resting on the measurement in `docs/2026-09-18-a-perimeter-not-a-project.md` — 22 of the 28 `[moira]` recipes touch nothing of okuda's
**Extends:** nothing. This is the enforcement half of a perimeter that has been stated three times and tested none.

## Objective

Add a check that names every recipe in okuda's `[moira]` group which does not invoke
the okuda binary, shipping as a **report** and becoming a gate when the count reaches
zero.

## Scope

**In:** the check — a script in `scripts/`, a `just` recipe, its place in `just check`,
and the shape of what it prints. The 25 recipes it names, as the report's content.

**Out:** moving any recipe (that is `BRF-PERIMETER-RUNNER`); renaming or regrouping the
`[moira]` group; the three recipes that stay — `tts`, `tts-rate`, `speech`; and the flip
to a hard gate, which is `BRF-PERIMETER-RUNNER`'s final acceptance criterion, not this
brief's. Also out: any check on `docs/`, `briefs/` or `playbooks/`. A prose perimeter
is not mechanically testable, and pretending otherwise is how a check earns a waiver.

## Preconditions

- [x] `docs/2026-09-18-a-perimeter-not-a-project.md` exists and `ADR-PERIMETER-039` is
      Accepted. **Verified 2026-09-18.**
- [x] The `justfile` carries a `[moira]` group of 28 recipes, exactly 3 of which name
      `./okuda`. **Verified 2026-09-18** — `tmp/speech-census.py`, 21 controls passing.
- [x] `scripts/tables-check.ts` exists as the report-first precedent, and
      `just tables-check` is wired into `just check`. **Verified 2026-09-18.**
- [x] `playbooks/justfile-playbook.md` carries the comment house style the facade-lint
      enforces. **Verified 2026-09-18.**

## Work Plan

1. [ ] Write `scripts/moira-check.ts`: parse the `justfile`, group recipes by their
       `[group('…')]` line, and list every recipe in `moira` whose body does not match
       `./okuda`. Exit 0 always — this ships as a report.
2. [ ] Print the count in a form the flip can test, and name every offending recipe.
       The count is the number the runner brief drives to zero.
3. [ ] Add the `just` recipe, with a comment of **three words or fewer** and no
       multi-line comment — `facade-lint` asserts the comment column sits in a 20–30
       band. The explanation belongs in `playbooks/justfile-playbook.md`.
4. [ ] Wire it into `just check` beside `tables-check`.
5. [ ] Assert the control: `tts`, `tts-rate` and `speech` are **not** listed, and the
       report's total is 25. A report that lists a recipe okuda owns is worse than no
       report — it teaches the reader to ignore the list.
6. [ ] Confirm `just check` stays green, and that `just tables-check`'s own count is
       unchanged.
7. [ ] Write the trap into `playbooks/justfile-playbook.md`: a report whose count is
       non-zero on arrival is not the current commit's regression.

## Acceptance Criteria

- `just moira-check` exits 0 and prints a count of **25**.
- The report names all 25 recipes, and none of `tts`, `tts-rate`, `speech`.
- The report names no recipe outside the `[moira]` group.
- `just check` is green with the new step wired in.
- `just tables-check`'s count is unchanged by this brief.
- `facade-lint` passes — the new recipe comment is three words or fewer.

## Notes

**Why a report first.** A gate that fails on arrival is a gate that gets waived, and
`just check` would go red on 25 recipes that are nobody's regression. `tables-check`
already established the pattern in this silo — *a report until the count reaches the
nine, then a gate* — and this is the same shape with a different count.

**Why the check is TypeScript.** It lives in `scripts/`, which is the release path, and
the release path is TypeScript (`PLY-SILO`, *the scratch tier*). A probe that answers
the same question would be scratch and would not run in `just check`.

**The classifier is the trap, not the parse.** The measurement that produced the 25
counted a recipe as okuda's only if its body named `./okuda`. A first attempt also
counted `tmp/` as okuda's content and failed five controls — `tmp/` is gitignored, so
by the silo principle it is not in okuda at all, and a recipe that writes there reads
nothing of okuda's. **The check tests for the binary, not for a path under the repo
root.**

**What this does not enforce.** Prose. `docs/2026-09-10-moira-prosody-probe.md` would
pass any mechanical test this brief could write. The perimeter holds for documents
because `BRF-PERIMETER-SILO` moves them, not because a script watches them.

## Related

- ADR: `ADR-PERIMETER-039` — the perimeter this enforces
- Survey: `docs/2026-09-18-a-perimeter-not-a-project.md` — the measurement
- Brief: `BRF-PERIMETER-RUNNER` — drives the count to zero and flips the report
- Brief: `BRF-PERIMETER-SILO` — the doctrine and the records
- Playbook: `PLY-JUSTFILE` — the comment house style the gate enforces
