---
type: Debrief
callsign: DBF-CODE-SILCROWS
date: 2026-10-12
tags: [rendering, silcrows, vectors, code]
agent: pi
environment: local
---

# Debrief: Code-comment silcrows

## Accomplishments

- **A rendered code file is a document for its comment prose:** discovery runs
  over the comment regions of a whole-file code render, callsign-only, gated by
  the registry. `src/cli.ts` now renders a 10-entry `## References` receipt where
  it had none; `src/tui.ts` 16.
- **The mechanism:** `commentRegions` (`src/render.ts`) builds a `regions`
  predicate; `scanReferences`/`jumpMapFor`/`annotateSource` take it and skip the
  markdown-fence exclusion in code mode; `readSource` returns the raw text and
  `draw` annotates → wraps → appends the receipt.
- **The record:** ADR-MAIN-DOCUMENT-031 amended in place (a code render is a main
  document for its comments; the fence exclusion's reason corrected);
  `tests/code-silcrows.test.ts` (6 tests).

## Problems

- **The paint was never the obstacle.** The brief opened expecting a renderer
  change — "a badge injected inside a fence never renders". It renders: an
  isolated `%okuda-vector:12%` inside a code fence prints `§12`. The exclusion is
  discovery-side, and the stated reason in `src/vectors.ts` was false. Corrected.
- **The comment cited no ADR.** The brief's plan said "amend the ADR it cites";
  the fence comment cites nothing. The parent by subject is ADR-031
  (*the main document*), so that is where the amendment landed.
- **`callsign-lint` caught the brief quoting junk.** The Evidence section named
  the unresolved tokens (an unwritten ADR ordinal, a fixture sentinel) as literal
  examples, and the linter reads any callsign-shaped token as a citation.
  Rewritten to name the classes; the probe holds the list. The gate did its job —
  on the document describing the gate — and caught the same mistake again in this
  debrief's first draft.

## Lessons Learned

- **Resolution is not reference.** ADR-044's gate drains tokens that do not
  resolve; it cannot drain a resolvable token *quoted as data*. The probe's 192
  "resolved outside comments" are test fixtures (`tests/vectors.test.ts` is
  `scanReferences("see ADR-030…")`) — which is why the comment region is
  load-bearing, not tidy.
- **A wrong reason hides a case.** The fence exclusion was right (a sample is
  verbatim) and its mechanism-warrant was wrong. The wrong warrant is what made
  the code-file case invisible for weeks.
- **The feature dogfoods immediately.** `src/cli.ts` cites `BRF-CODE-SILCROWS` in
  the comment that describes the change, so the receipt lists the brief that
  caused it.

## Observations

### Rendering / vectors
- The change is a discovery change plus one ordering fix (`annotate → wrap →
  receipt`); the fence paint already worked. The `regions` predicate implies code
  mode and skips the markdown-fence check — a code file's backticks are not
  fences.
- `commentRegions` is line-based and over-approximates (`#` in a string counts,
  `//` after a scheme colon does not) — the conservative direction, since extra
  candidates reach the gate, which drains junk.

### Knowledge system
- The probe lives in `tmp/` (gitignored), as the earlier silcrow probes do; the
  ADR and brief carry the numbers, and a later session on another clone would
  need it promoted to `scripts/` to re-measure. Noted, not done — precedent is
  `tmp/`.
- `reg-sync-fix` follows the brief's `Status:`; the brief moved Open → Done with
  the work.

## Metrics

- `bun test`: 727 pass, 0 fail.
- `just check`, `just ship`: exit 0.
- Probe (`tmp/code-silcrow-probe.ts`): 381 callsigns in comments, 344 resolve,
  37 gated; 192 resolvable outside comments (fixtures/demo strings), excluded.
- Receipts: `src/cli.ts` 10 entries (0 before), `src/tui.ts` 16.

## Related

- Brief: `briefs/2026-10-12-brief-code-silcrows.md`
- Decision: `decisions/031-main-document.md` (2026-10-12 amendment)
- Probe: `tmp/code-silcrow-probe.ts`
- Prior: ADR-044 (the gate), ADR-045 (paths), ADR-047 (the receipt)
