---
type: ADR
callsign: ADR-SILCROW-PATHS-045
---

# Decision: Silcrow paths — the gate's second substrate is the filesystem

**Date:** 2026-09-29
**Status:** Accepted (**annotated 2026-10-07** — Ring B landed 2026-10-01)
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
   their own step (Ring B — **landed 2026-10-01**, see the annotation
   below). Bare basenames stay out
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

## Annotation (2026-10-07)

**Ring B landed 2026-10-01** (DBF-SILCROW-RING-B). The parenthetical
in point 2 — *"not yet wired"* — had been false for six days, and the decision
text is annotated in place rather than left to teach a state of the world that
had changed. Ring C (bare basenames) remains parked by decision, and its
reasoning still holds: no slash, no intent, resolution-is-search.

Verified by `jumpMapFor` on 2026-10-07: a backticked path mints in prose, in a
list item and in a table cell, and a bare basename mints nothing. A local `.md`
link also mints, but renders its target a second time as text — so the path is
the form to write (`playbooks/authoring-playbook.md`, "References are text").

**Cap re-measurement (the one the Consequences section asked for).** "0 of 344
documents over" held when written. With the whole gate composed — callsign ‖ path,
as `src/cli.ts` composes it — `briefs/index.md` mints **77 of 80** addresses on 82
rows, and the other index views sit at 53, 32 and 18. The briefs index grows one
row per brief, and the cap fails silently (`hits.slice(0, MAX_REFS)` in
`src/vectors.ts`, no indicator, and `annotateSource` simply skips unpainted
targets), so the oldest rows lose their references without a mark. The index is
an artifact by the launcher's own Layer-0 exclusion — the case for not minting in
it at all is now the stronger one.
