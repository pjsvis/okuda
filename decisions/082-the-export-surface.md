---
type: ADR
callsign: ADR-EXPORT-SURFACE-082
---

# Decision: The export surface is the contract — observed, not declared

**Date:** 2026-11-05
**Status:** Accepted

## Context

Until `BRF-CAHIER-BINARY`, `src/` had one consumer: the CLI. Its exports could be
renamed, reshaped, or removed freely, because nothing else imported them. A single
consumer makes an export *private* by fact — nothing outside the entry point can
observe it.

`scripts/html-package.ts` is now a second product built from the same core, compiled
and shipped as `cahier`. It imports `src/render.ts` and `src/root.ts` wholesale
(`scripts/html-package.ts:39-41`). Whether or not anyone said so, **those exports are
now an API**: a silo depends on the binary, the binary depends on the exports, and a
refactor that renames one silently breaks a product that no test in this tree runs.

The port lessons already named the failure (*one classifier, one palette, one
resolver — every defect came from a place where one of those four was implemented
twice*). This ADR names the *reader* of that rule: once a core has more than one
consumer, the coupling is a contract and must be written where the next refactor will
read it.

## Decision

**The core's public surface is the union of what product entry points import. It is
observed, never declared.**

- `src/` is private. An export becomes public the moment a product entry imports it.
- A product entry is any file the family builds: derived from the justfile's compile
  recipes, and recorded in `FAMILY.md`.
- **Adding** an import is additive — a product may depend on more of the core freely.
- **Removing or changing** an export that a product imports is a **breaking change**:
  it needs an ADR, and the product must move with it in the same change.

**Why observed and not declared.** A hand-written export list is a *second list to
drift* — the defect this house refuses everywhere else (one palette, one classifier,
one resolver). An observed surface cannot drift from the truth, because the imports
*are* the truth; it is the same move as the citation census (derived, never judged).
The manifest carries the observed set, so a breaking change is visible as a row that
moved.

## Alternatives Considered

| Alternative | Why Rejected |
|---|---|
| Keep `src/` private; declare `cahier` an unsupported side-output | Contradicts the capability. A silo cannot be told to depend on a binary whose source is private — the first refactor breaks them silently, which is worse than a stated contract. |
| Extract the core into its own package | The heavier, eventually-correct move, deferred. A package is a distribution commitment (version, registry, dist-tag) and a second build the release path must own. Reach for it when a *third* product appears, or when a consumer outside this repo needs the core; the seam rule makes the same point — a copy across a boundary is a message, and a package is the largest message. |
| Hand-maintain the list of public exports | A second list to drift. The one thing the manifest is designed not to be. |
| A `src/public.ts` barrel that re-exports the contract | A third structure between the core and the products, maintained by hand, and it would lie the moment an entry imported around it. The observed surface needs no barrel. |

## Consequences

**What became easier:**

- *May I rename this export?* has a one-line answer — did a product entry import it? —
  instead of an appeal to caution.
- `FAMILY.md` is a derived, gated record of the surface; a product with no row fails
  `just check`.

**What became harder:**

- The core is no longer freely refactorable. A change to an imported export is a
  cross-product change, and the ADR obligation is real.
- The observed surface is only as good as the entries the family knows about. A
  product built outside the justfile's compile recipes is invisible to the manifest —
  which is why the manifest is gated and the gate names an unbuildable product.

**Constraints this imposes:**

- `scripts/family.ts` derives the family (compiled binaries from the justfile, packages
  from their manifests, each binary's core imports) and writes `FAMILY.md`; `--gate`
  fails on drift.
- A new compiled product is a new manifest row: add the recipe, run `just family
  --write`.
- The core is `src/`. A file outside `src/` is a product's own business, not the
  contract.

## Related

- `briefs/2026-11-05-brief-cahier-binary.md` — the second product that made this a question
- `ADR-PANEL-NOT-DOOR-081` — the mechanic the product speaks
- `docs/2026-11-05-lessons-from-the-port.md` — one classifier, one palette, one resolver
- `FAMILY.md` — the derived manifest this decision is checked against
- `DEPENDENCIES.md` — the *external* tools; this is the internal family
