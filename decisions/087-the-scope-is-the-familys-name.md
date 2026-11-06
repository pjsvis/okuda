---
type: ADR
callsign: ADR-SCOPE-FAMILY-087
date: 2026-11-05
---

# Decision: The npm scope is the family's name — `@polyvis`, declared once and checked

**Date:** 2026-11-05
**Status:** Accepted
**Enforced by:** `scripts/platform-packages.ts --check` (in `just check`) — a committed manifest under a foreign scope fails, and the scope is read from `package.json`'s `family.scope`; `tests/platform-scope.test.ts`

## Context

`ADR-FAMILY-DISTRIBUTION-083` chose the npm scope the day before this one:
**`@okuda`**, on the reasoning that the core's name would let the family grow
under it. The reasoning was sound about *racing the world* and wrong about the
referent.

Two facts settled it. First, **six documents already said `@polyvis`**: the
committed manifest `packages/testcard/package.json:2`, `FAMILY.md:19`, both the
commissioning and publishing playbooks, and `ADR-FAMILY-DISTRIBUTION-083`'s own
Context paragraph — which cites `PLY-PUBLISHING` naming
`@polyvis/okuda-<os>-<cpu>`. The new scope was the outlier arguing with the
corpus, and nothing in the gate could see the disagreement, because a name
written by hand in six places is six claims and no check.

Second, **nothing was published.** Registry lookups on 2026-11-05 returned 404
for `okuda`, `@okuda/okuda`, `@polyvis/okuda` and `@polyvis/testcard`. That is
the whole window: npm names are **permanent**, so after the first publish the
choice stops being a decision and becomes a deprecation pointer. The change
costs one branch now and cannot be made at all later.

## Decision

**The scope is `@polyvis` — the family's name — and it is declared in exactly one
place: the root manifest's `family.scope`. Every committed manifest is checked
against it. The products keep their own names.**

- **The scope is the family, the package is the product.** `@polyvis/okuda`,
  `@polyvis/cahier`, `@polyvis/testcard`. This is the ordinary npm shape, and it
  is the honest one: `@okuda/cahier` reads as *the compositor that belongs to
  okuda*, when cahier is a sibling product of a core that both share
  (`ADR-EXPORT-SURFACE-082`).
- **The designation must not lie about its referent** (clause 4). `@okuda` names
  a family of four products after one member. `polyvis` names the thing the four
  have in common: *many ways of seeing one document* — a terminal viewer, a
  compositor, a surface card.
- **Declared once, checked everywhere.** The scope is a fact about the
  *destination*, like the platform matrix: it cannot be derived from the tree,
  so it is declared in `package.json` and enforced by the gate. When the root
  package itself moves under the scope, its own name becomes the second witness
  and the check asserts they agree rather than letting them drift.
- **The products are not renamed.** Renaming `okuda` the binary is a different
  decision with a different bill: the corpus, the recipes, the callsigns, and
  the muscle memory. The scope buys the namespace; it does not spend the
  product's name to do it.

## Alternatives Considered

| Alternative | Why Rejected |
|---|---|
| Keep `@okuda`, the core's name | Sound about the race, wrong about the referent: a family of four under one member's name, and six documents in the repo already disagreed silently |
| Rename the products too — `polyvis` as the viewer | The scope is worth thirty minutes; the product rename is a sitting and irreversible across the corpus. Buy the namespace, keep the names |
| One scope per product (`@okuda`, `@cahier`) | Each new product races the world for its own unscoped name, which is the exact failure a scope exists to prevent — and it spends a permanent claim per product |
| Leave the scope in the script, hand-write the manifests | That is the state this ADR ends: one constant plus eight committed copies, and no check that they agree. It survived one day |
| Drop `family.scope` and derive the scope from the committed manifests | Circular: the manifests are what is being checked, so a tree of consistently-wrong names would pass. The declaration is the witness, the manifests are the claim |

## Consequences

**What became easier:** one name to claim on npm, which matches the domain, the
website, and every playbook that already assumed it; a new product is a manifest
under an owned scope, never a race.

**What became harder:** the scope is now a declaration that must exist before the
first manifest can be generated — a missing `family.scope` is a loud error, not
an empty prefix, because an empty prefix mints `@/okuda-…` and npm says yes.

**Constraints this imposes:** a committed manifest outside `@polyvis/` fails
`just check`. Adding a product under a different scope is not a preference, it is
a leftover, and it will be named with its path.

**Deliberately not done here:** the scope has not been *claimed* on npmjs.com.
That is the operator's act (`PLY-NPM-COMMISSIONING`), it is free and permanent,
and it is now the only thing standing between this decision and a stranger
taking the name this repository tells the world it publishes under.

## Related

- `ADR-FAMILY-DISTRIBUTION-083` — the decision this reverses **in part** (its
  scope clause only; N binaries, the installer, no tap, and the deferred
  multicall all stand, and its original text is kept rather than rewritten)
- Brief: `BRF-PLATFORM-PACKAGES` — the work this unblocks, at step two
- `playbooks/npm-commissioning-playbook.md` — claiming the scope
- `FAMILY.md` — the products, derived
