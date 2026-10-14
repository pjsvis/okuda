---
type: Debrief
callsign: DBF-REFERENCES-SECTION
briefs: [BRF-REFERENCES-SECTION]
---

# Debrief: The References section — the renderer's receipt for its own map

**Date:** 2026-09-30
**Status:** Shipped — five commits on `feat/references-section` (`3889a6f..cc88556`): ADR-047 + the ADR-031 pointer, the generator with seven unit tests, the stream path, the TUI's three main-render sites, deprecations + dogfood. 498 tests pass / 0 fail (490 at the day's open — the chroma-remap review session's baseline); `just check` green; smoke-test green; binary fresh at HEAD (`f65a800`). td ledger: td-e45bda + its five buildable children shipped (td-45f5d1, td-5e51ec, td-e473c2, td-eab6c6, td-3562fe); the URL channel (td-9eb7a4) stays open, out of scope by the brief's own non-goals.

The thesis: the brief was right where it mattered, and wrong in two
measurable ways that the work itself corrected — both worth keeping.

## What was right

**The loop's guard held without new machinery.** The feared map-feeding
loop is dead by construction: the section joins the render input
downstream of `annotateSource`, so `scanReferences` never sees its text.
And the deeper guard was already on the books — repeats dedupe by target,
and the section's `.md` targets are bare paths, which are *mentions*, not
uses. The map-identity invariant (a sectioned doc derives the same map as
the same doc without one) is now a unit test and holds as a fixed point.

**The call-site append dissolved the test-churn risk.** The brief
budgeted `tests/render.test.ts` line-index churn (BRF-STREAM-IDENTITY-
HEADER's flagged risk). None came: the append lives in `cli.ts draw()` and
the TUI's render sites, not inside `renderDocument`, so every
renderDocument-level test is untouched. The risk was real for the other
design; choosing the junction over the core retired it.

## What the corpus corrected

**The brief's "nine references" is now ten.** Ring A (ADR-045, merged
after the brief was written) minted the fixture's own generator path —
`scripts/references-demo.ts` is §12 now, ahead of the brief-era nine. The
dogfood therefore asserts the *invariant* — every destination listed —
not the count, and the count is printed, not hardcoded. A brief's numbers
age; its invariants shouldn't.

**The cap arithmetic was already fixed.** td-eab6c6 still listed
"Cap at 88 → 80" as work; the brief's own deprecation table records it
done 2026-09-13 at brief-writing time. Verified in the playbook (the rule
names the derivation), not re-done. Retiring a convention is not a bulk
edit; neither is re-fixing a fixed fix.

## What was left unverified, honestly

The dereferenced render's bareness (no section, two-render contract) is
enforced by construction — `jumpTo`'s render path is the one without
`appendReferences` — and covered by the tui tests, but it was not
visually confirmed at a glass: no pty dogfood harness exists, and
`script`-based probes proved flaky (digits arriving, actuation not
observed). The next pty dogfood that touches the TUI should look at the
deref frame's foot. The § silcrows under `NO_COLOR` render bold-plain —
attributes survive `NO_COLOR` by the pre-existing convention, matching
headers; "plain numbers" means no colour, not no weight.

## Related

- ADR-REFERENCES-SECTION-047 — the decision, its sub-rulings, its
  alternatives table
- BRF-REFERENCES-SECTION — the brief (now Done); `tmp/section-diff.ts`,
  the instrument that settled it
- ADR-MAIN-DOCUMENT-031 — amended by pointer; discovery unchanged
- td-9eb7a4 — the URL channel question, still open by design
