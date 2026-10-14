---
type: Brief
callsign: BRF-PRINCIPAL-CLERK
---

# Brief: The principal and the clerk — the three-way triage

**Date:** 2026-10-14
**Status:** Open
**Context:** `ADR-PRINCIPAL-CLERK-067` names the two parties — the human is **the
principal**, the agent in its duty to the record is **the clerk** — and retires
*the reader* as a name for the party. This brief applies it. It is not a
substitution: the word carries three referents, and only one of them is ours.

## Objective

Apply the triage to the living surface, one occurrence at a time, so that *the
principal* names the party, *a stranger* names whoever reads with no standing,
and *the software's reading role* keeps its own name.

## Evidence

Measured 2026-10-14:

| word | in the tree | on the living surface |
|---|---|---|
| `reader` | ~1400 | **220** |
| `operator` | 509 | ~80 (incl. 7 in `system.md`) |
| `principle(s)` | 276 | — (28 in the ambiguous bare form) |

The senses, each with its own evidence:

- **the party** — `src/tui.ts:512` (*"the reader's tempo is not an input"*),
  `system.md:199` (Mercury tempo), `playbooks/authoring-playbook.md`
  (*can the reader state the document's shape*). → **the principal**.
- **whoever reads, no standing** — `explainers/accessibility.md`,
  `README.md`'s audience, the authoring playbook's prose rules. → **a stranger**
  (`docs/2026-08-20-origin-doc.md`), or a plain phrase.
- **the software's reading role** — `src/cue.ts:70` declares
  `surface: "reader" | "launcher"`; `src/launcher.ts:7` *"the reader's key set"*;
  `decisions/016:81` *"the launcher inherits the reader's verb grammar"*.
  → **okuda** (argv0), the launcher being **gloam**.
- **the device** — `docs/2026-09-15-tables-for-unsighted-listeners.md` calls for
  a *declared screen-reader mode*. External, cited, **not ours to rename**.
- **the code sense of `operator`** — `src/render.ts:672` (97 operators),
  `src/render.ts:1201`, `tests/launcher.test.ts:587`. A carve-out, not a rename.

## Scope

**In:** the living surface — `src/`, `tests/`, `scripts/`, `playbooks/`,
`explainers/`, undated `docs/`, the `&` panels, `conceptual-lexicon.md`, and
`system.md` (as a **protocol cut**, below).

**Out:** records keep their words (`briefs/`, `debriefs/`, `decisions/` prose,
dated `docs/`, `.archive/`) per the residual rule of `ADR-RETIRE-OKUDAGRAM-066`;
callsigns are data and are untouched; `README.md`'s attribution line stands.

## Preconditions

- [x] `ADR-PRINCIPAL-CLERK-067` is accepted and the human row of
      `ADR-RENDERER-READER-029` is annotated in place.
- [ ] The triage table above is the only sanctioned method. **A find-and-replace
      is forbidden on this change** — it would address every stranger as a
      principal, which is the failure the decision exists to prevent.

## Work Plan

1. [ ] **`system.md` as a protocol cut.** Its 12 occurrences are the human sense
      in the lexicon entries (Fermata, Mercury tempo, audit surface, attributable
      structure, references). Bump the cut, land it, and treat the deploy as a
      **message** into the siblings' inbox, not a side effect of a rename
      (`docs/2026-10-10-the-seam.md`).
2. [ ] **The prose surface**: `playbooks/` (54), `explainers/` (34), undated
      `docs/` (19), the `&` panels (15), `conceptual-lexicon.md` (1) — triaged, not
      substituted.
3. [ ] **The code surface**: `src/` (42) and `tests/` (24) — comments and
      identifiers, triaged. The one **behaviour** change is the cue's type:
      `surface: "reader" | "launcher"` → the reading role's real name, with the
      tests and any emitted value updated in their own commit.
4. [ ] **`operator` (~80)**: the human sense → the principal; the code sense
      carved out; `src/` and `tests/` comments triaged the same way.
5. [ ] **A census, not a gate.** Extend `scripts/retired-terms-lint.ts` with a
      report-only mode over the retired role-words, printing each surviving
      occurrence and what the triage says it is — because the honest sentence and
      the dishonest one cannot be told apart by a grep, and
      `ADR-PRINCIPAL-CLERK-067` names `nothing — advice` rather than pretending
      otherwise.
6. [ ] `just check` green; `bun test` green.

## Acceptance Criteria

- Every living-surface occurrence of the party-sense reads **the principal**, and
  every occurrence of the software-sense names **okuda** (or is a callsign).
- **No stranger is called a principal** — the explainers and the README still
  address an unknown party, and the words used there pass the test: *read it
  back; is this person deciding anything?*
- The cue's `surface` value is no longer `"reader"`, and the type is the
  instrument: the compiler refuses the old value.
- `system.md` carries the new cut, and the deploy is a recorded message, not an
  implied act.
- A census run reports the residual, and the report is honest about what a grep
  cannot tell.

## Notes

- **The pun is deliberate** (`ADR-PRINCIPAL-CLERK-067`): *the principal* and *the
  principle* differ by a letter and not at all in the ear. The test is in the
  ADR and the lexicon entry; record any occurrence the test cannot settle.
- **Second-order risk, named:** replacing the party-sense everywhere makes "the
  principal" the most-used role word in the corpus, and a role word used that
  often stops being read. If a sentence is clearer with *"the person"*, use it —
  the pair disciplines the protocol, it does not need to appear in every line.
