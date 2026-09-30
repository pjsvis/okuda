---
type: ADR
callsign: ADR-SILCROW-PATHS-045
---

# Decision: Silcrow paths — the gate's second substrate is the filesystem

**Date:** 2026-09-29
**Status:** Accepted
**Extends:** ADR-044 (the gate on inferred references — this hands the
gate a second substrate); ADR-020 (the render-path boundary holds by
parameter, as before); ADR-024's principle read backwards (callsigns are
data *because a registry holds them* — paths need no registry, the
filesystem is already the index).

## Context

ADR-044 gated the callsign silcrow on the tier registries: a shape match
in prose made no claim, the registry check is the retraction, and the
paint and the keypress share one resolution semantics. The same session
that shipped it measured the corpus for what the gate could not see:
`tmp/silcrow-junk-probe.ts`'s successor (`tmp/silcrow-ext-probe.ts`,
BRF-SILCROW-PATHS) counted **609 code-file mentions** (`src/tui.ts`) —
93% pointing at real files, none of them painted, because no token class
discovered them. Meanwhile the code shelf (BRF-CODE-SHELF) had already
verified the read loop: the actuator resolves path targets (document
directory first, cwd second) and `wrapWholeFile` renders any file. The
defect was inverted from the usual one — landing existed, paint missing.

The same probe found the substrate's own test case before any code
changed: `palettes/okuda.json`, referenced ×9 across five live documents,
never committed — the phantom twin of ADR-044's advisories tier (a real
reference invisible to the resolver, hiding for weeks).

## Decision

1. **For path-shaped mentions, the gate's substrate is filesystem
   existence** — the same disjunction actuation uses: the main
   document's directory first, then the process cwd
   (`makePathValidator`, composed beside `makeCallsignValidator` at the
   one seam). A phantom, a typo, or an illustrative URL paints nothing.
   There is deliberately no path registry: the filesystem is the
   domain's own live index, and a registry mirroring it is
   benchmaxxing (BRF-CODE-SHELF's refusal of a src/ INDEX.jsonl,
   honored from the paint side). A filesystem cannot drift from itself
   — ADR-044's two-lists drift, structurally impossible here.

2. **Discovery admits the code-file ring**: `dir/name.ext`, at least one
   slash, non-md extension, gated by the same `resolves` parameter.
   `.md`-shaped mentions stay out of this ring — named md paths are
   their own step (Ring B), not yet wired. Bare basenames stay out
   entirely (Ring C, parked): no slash, no intent; resolution-is-search,
   not lookup.

3. **The `:NNN` line suffix (`src/tui.ts:756`) is swallowed into the
   occurrence span and stripped from the target** — the badge paints
   after the whole mention, the map carries the file path. The silcrow
   is file-level; line-jump is BRF-SRC-LINE-LEDGER's verb, unclaimed
   here. Suffixed and plain mentions of one file share the vector
   (one destination, one silcrow).

4. **The badge paints inside the codespan** — 98% of code mentions are
   backtick-wrapped, and the glass probe (2026-09-29) confirmed the
   vector marker renders inside a span (the callsign convention,
   inherited rather than invented: `ADR-031 §12` inside backticks
   already painted).

## Consequences

- Paint and actuator still cannot disagree: the predicate is the
  actuation chain minus the render (`existsSync(doc-relative) ||
  existsSync(cwd)`), composed at the seam the TUI already receives.
- The 80-address cap absorbs the new ring's competition (0 of 344
  documents over, measured P-1); re-measured before Ring B (~2× volume).
- Non-silo honesty extends: outside the checkout, `src/…` tokens
  validate against whatever the anchors carry — the same honest
  suppression as the callsign substrate, no regression.
- Re-derivation replaces invalidation, re-worn: the paint appears the
  day the file lands (`palettes/okuda.json` has a ready-made welcome).
- The probe stays as the drift detector — a suppressed typo is quieter
  than a flashing silcrow; `tmp/silcrow-ext-probe.ts` is the list.
