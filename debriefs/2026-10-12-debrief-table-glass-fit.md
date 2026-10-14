---
type: Debrief
callsign: DBF-TABLE-GLASS
date: 2026-10-12
tags: [rendering, tables, elision]
agent: pi
environment: local
briefs: [BRF-TABLE-GLASS-FIT]
---

# Debrief: Table fit — wrap to the glass, elide only the floor

## Accomplishments

- **The fit width:** `renderTable` now wraps to `target = min(glass, cap)` instead
  of composing to the cap and cutting at the glass (`src/render.ts`). Hidden
  content is monotone non-increasing in glass width and zero at the table's
  natural width.
- **The floor is a segment:** `longestWord` and the hard-split in `wrapANSI` treat
  `/ . _ @ -` as break opportunities, so a URL or path slips at a delimiter and is
  never treated as atomic.
- **The instrument matches the renderer:** `scripts/tables-check.ts` measures
  segments, skips source-literal `…`, gates `hidden` on the target reaching the
  cap, and gates `starved` on the table having been wrappable at the fit width.
- **The record:** ADR-TABLE-EDGE-CUT-055 carries the 2026-10-12 in-place
  amendment (the *Alternatives* rejection of wrap-at-glass is overturned); the
  brief is `briefs/2026-10-12-brief-table-glass-fit.md`.
- **The fixture moved** from `docs/` to `tests/fixtures/contracts-contact-map.md`
  — a regression input, not a silo record, and out of the date-lint scan set.

## Problems

- **`just check` failed on the brief's own `**TD:**` line:** it cited a td ID, and
  the One-Way Valve forbids the ephemeral in a persisted document. Fixed by citing
  the callsign instead. The valve caught the executor, not the author.
- **The instrument was stale, in four places:** `elided` read a mid-cell literal
  `…` in prose as a cut; `hidden` flagged below-cap elision as loss despite the
  reader's widen lever; `starved` assumed other columns could shrink to 3; `word`
  measured whitespace tokens. Each was a modelled disagreement with the renderer,
  and each showed up as a false failure before it was fixed. This is ADR-055's own
  warning — *the instrument must measure what the renderer draws* — demonstrated
  again.
- **Three tests encoded repealed law** (ADR-UNIVERSAL-ELISION-050's single-line
  elision) and failed by design. Updated to assert the wrap. The pre-existing
  `launcher` entry-path failure is unrelated: it fails on a clean tree (verified
  by stashing `src/render.ts` and `src/wrap.ts`).

## Lessons Learned

- **A cap-bounded wrap and a glass-bounded cut cannot share a width.** The bug
  was not a bad allocation; it was two different widths in one function. When a
  renderer composes at one width and cuts at another, the difference is always
  taken from the last column, and the last column is always the prose.
- **Rejection reasons age.** *"It reflows on every resize"* and *"the reader has a
  lever"* were true statements about a different reader. Re-reading an ADR's
  *Alternatives* is cheaper than re-deriving it, and it tells you exactly which
  sentence the new evidence contradicts.
- **Declaring "monotone" makes the failure a line of test code.** The invariant
  ("more width never reveals less, zero at natural") was the whole brief; a width
  sweep in `tests/table-fit.test.ts` now holds it.

## Observations

### Rendering
- The wrap-to-target change is four lines; the word-floor and delimiter change is
  a handful more. The wrapped-row machinery from BRF-WRAP-AT-CAP was already
  built and correct — it was pointed at the wrong width.
- The header "never elide" invariant holds in the wrap state but not in the
  too-narrow state: at 40 columns the fixture reports 5 header labels cut. That is
  the named irreducible state, not a wrap failure; the acceptance criterion was
  corrected to the design width rather than left aspirational.
- `wrapANSI`'s delimiter preference applies to every wrapped block, not only
  tables. No existing wrap test moved; the preference only fires where a token
  does not fit.

### Knowledge system
- The fixture lived in `docs/` with a filename date that its own `**Date:**`
  contradicted, and `date-lint` caught it the moment it was created. Moving it to
  `tests/fixtures/` resolved the mismatch and the scan-set question at once.
- `reg-sync-fix` follows the brief's `Status:` automatically; the executor only
  has to keep the file honest.

## Metrics

- `bun scripts/tables-check.ts --width 80` (silo corpus): starved tables 127 → 0;
  `--width 120`: hidden 6 → 0 and starved 4 → 0. `--strict --strict-starved`
  exits 0 at 74, 80 and 120.
- `bun test`: 719 pass, 1 fail (the pre-existing launcher entry-path test,
  unrelated — verified against a stashed tree).
- `just check`: exit 0.

## Related

- Brief: `briefs/2026-10-12-brief-table-glass-fit.md`
- Decision: `decisions/055-table-edge-cut.md` (the 2026-10-12 amendment)
- Fixture: `tests/fixtures/contracts-contact-map.md`
- Instrument: `scripts/tables-check.ts`
- Prior art: Zed markdown preview PRs #42674, #46834, #50839, #61773
