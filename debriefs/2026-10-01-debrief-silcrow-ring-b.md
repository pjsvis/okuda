---
type: Debrief
callsign: DBF-SILCROW-RING-B
---

# Debrief: Ring B and the legibility gate — the silcrow grows a conscience

**Date:** 2026-10-01
**Status:** Shipped — three commits on `feat/silcrow-ring-b` (`8ef9f24`, the W3/brief commit; then the Ring B implementation): the brief unblocked (P-4 satisfied, W3 probe passed), `RE_MD_PATH` + `EXILED_EXTS` in `src/vectors.ts` with nine tests, ADR-049, the explainer's legibility paragraph, registries in sync. 512/512 pass (503 at the day's open, 512 after — 9 new tests, one rewritten contract); `just check` green; binary fresh at HEAD. td ledger: td-696449 (Ring A) reviewed and closed on main; td-02e4a3 (Ring B) shipped. The epic td-89d085 stays open — Ring C parked with its census, W5's authoring drift list out of scope.

The thesis: the step the brief parked was the step the operator's own
notes demanded — and the parking is what made the landing clean.

## What was right

**The gate dates.** P-4 (a day at the glass with Ring A) was satisfied
by the calendar, not by argument — Ring A shipped 2026-09-29, the review
opened 2026-10-01 — and the W3 probe ran *before* any code, exactly as
the brief demanded. The measurement: Ring B adds **zero** docs over the
80 cap (worst Ring-B-inflated document 34/80); the only cap-saturating
document, `briefs/index.md`, saturates today, +0 from Ring B. The probe
composed the *real* gates (`makeCallsignValidator`, `makePathValidator`)
— the measurement cannot drift from the mechanism it measures.

**One predicate, three retracts.** The operator's case arrived as a
note-app list: grader data beside readable documents, all repo-local.
Reading it against the rings split it exactly — four data files Ring A
already painted, two markdown files Ring B had not. The analysis wrote
the decision before the operator said it: wire Ring B, and the two
*unreadable* entries (`.jsonl`) should never have been paintable in the
first place. The exile lives at discovery as a token class, so body
paint, actuator, and the References section retract in one move — the
ADR-047 review needed no structural change, which is the projection
architecture paying for itself: the receipt cannot disagree with the map
because it *is* the map.

**The probe caught the probe.** My W3 script claimed
`briefs/index.md` at 90 "today," contradicting the Ring A record's
"0/344 over cap." Cross-check against the real pipeline
(`jumpMapFor`, `tmp/w3-verify.ts`): map size exactly 80 — the cap doing
its designed work, reading order winning, ten targets unaddressable.
The discrepancy was the probe counting unique targets where the map
counts addresses after the cap. The instrument was wrong in the
direction that mattered; the pipeline was the truth. Trust the
pipeline, calibrate the probe.

## What was learned

**The honesty principle has a second half.** ADR-044/045 made the
silcrow honest about *existence* — no paint without a destination.
The Gaia case exposed the unasked question: a destination that exists
and isn't worth the keystroke. `.jsonl` is horizontal data; a deref
into `wrapWholeFile` is a wall of wrapped JSON — a render kept to the
letter, broken in spirit. ADR-049 names the criterion (legibility),
gives it a home (`EXILED_EXTS`, one line per future exile), and resists
the allowlist temptation: exile on evidence, never bless by guess.
`.json` stays until the glass says otherwise.

**A retired test is a record, not a deletion.** Ring A's test "named
.md paths are NOT Ring A — Ring B's own step, unwired" asserted the
parked state; Ring B's commit rewrote it into the new contract block,
and the legacy `okuda-rhs` test gained a sharper claim: the authored
number stays dead, the path now mints. Both edits are the tests telling
the story of the change — the contract moved, and the suite moved with
it, nothing silently inverted.

**Cross-silo is precedent, not problem.** Ring B paints bare
`../sibling/x.md` mentions when they resolve — and jumps, because
`resolveJumpTarget`'s document-relative anchor (td-1c8fca) was designed
for exactly `&speak.md`'s sibling-silo links. Paint and actuator share
the predicate; ADR-044's invariant holds across the silo boundary.
Observed in ADR-049's constraints; watched at the glass.

## What's left

- **The operator's glass pass** — Ring B at the keyboard: a bare
  `docs/x.md` mention painted rose inside the backticks, one keystroke
  to jump, `u` back; a `.jsonl` mention silent; the receipt's ascent
  unbroken. W1/W2 were decided at the glass for Ring A; Ring B's
  wrinkles were decided by parity — the glass owes the step a look.
- **Ring C** — parked with its census (1,698 mentions, 187 uniquely
  resolvable, 3 ambiguous). No evidence has asked for it.
- **W5** — the 97 stale and sibling-silo mentions: prose repair, out
  of scope exactly as scoped.
- **The `.json` watch** — the first exile was evidence-driven; the
  next one, if any, will be too.

## Related

- BRF-SILCROW-PATHS `briefs/2026-09-29-brief-silcrow-paths.md` — the
  brief, its step 3 shipped
- ADR-049 `decisions/049-legibility-gate.md` — the criterion this step
  added to the gate
- ADR-045 `decisions/045-silcrow-paths.md` — the substrate both rings
  gate on
- docs/2026-09-04-the-silcrow.md — the explainer, honest twice now
