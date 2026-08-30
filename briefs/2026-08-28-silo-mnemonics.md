---
type: Brief
callsign: BRF-SILO-MNEMONICS
---

# Brief: Rooted Gloam — silo badge and document callsigns

**Created:** 2026-08-28 (rewritten from the first draft: badge placement,
callsign ownership, and the rooted/unrooted axis revised after review)
**TD:** td-okuda-silo-mnemonics
**Status:** open (amended 2026-08-30 — machinery deferred, ADR-024)

> **Amendment (2026-08-30, ADR-024).** `BRF-CONTENT-SHORTLIST` changed the
> calculus two days after this brief was written: callsigns live in
> frontmatter, so content search *is* resolution — `gloam -g <callsign>`
> finds the document through the ordinary content shortlist, no dedicated
> path. The *Why* stands (two codes, one referent; out-of-band handles).
> The machinery is deferred: the dedicated `gloam <callsign>` resolver, the
> reg-sync bootstrap automation, and the index callsign column all wait
> until the pain is loud. Callsigns remain assigned frontmatter data —
> cheap, consistent, already in the corpus. Short and unique are
> constraints (lintable); cool is a quality (earned by the referent,
> never generated). Coolness is not generated; it accrues to referents
> that earn it.

## What

Gloam becomes either **rooted** (launched on a self-describing knowledge tree —
an OKF bundle per ADR-019, with registries present) or **unrooted** (a single
document or pipe, from anywhere). When rooted, gloam passes a silo badge
string to the renderer, which paints it in the footer identity slot; documents
carry durable **callsigns** (e.g. `ADR-BOUND-010`) as registry/frontmatter
data, displayed beside jump tokens in index views and resolvable as
`gloam ADR-BOUND-010`.

## Why

- **N terminals, N silos, identical chrome.** The badge disambiguates which
  frame is anchored to which silo at a glance — evidence: the operator runs
  multiple terminals across silos and the only identity today is the footer's
  folder/file path.
- **Two codes, one referent.** Date-first, long, descriptive filenames
  (ADR-002) are the machine code: sortable, greppable, registry-indexed.
  Callsigns are the human code for low-bandwidth channels — a paper note to
  return to, a colleague's ear over SSH or voice. Neither shortens the other.
- **Resolution, not derivation.** A callsign jotted on Tuesday must resolve on
  Thursday — and after any rename. So callsigns are *assigned data* (assigned
  once, stable thereafter), never re-derived from filenames.

## How

- **Root detection (launcher):** a registry signature at cwd — OKF-native
  `okf_version` in a root `index.md` (ADR-019), falling back to
  `INDEX.jsonl`/`REGISTRY.jsonl` presence. No signature → unrooted: no badge,
  no callsign resolution, today's behaviour unchanged.
- **Badge (renderer):** the bundle-declared name (root declaration, stable
  across directory renames), fallback `basename(cwd)`. Passed on argv; the
  renderer paints it at the head of the footer identity run — muted, the same
  register as folder/file (provenance, not alarm, per the fetch-state grammar).
  The full identity run is **silo · callsign · filename** (ADR-020): when the
  rooted registry knows the active document's callsign, the launcher composes
  it into the run. The renderer learns nothing about trees or registries — it
  paints the strings it is given.
- **Callsigns (registry):** `callsign` key in document frontmatter — an OKF
  extension key, legal per ADR-019 §4.1 — lifted into `INDEX.jsonl` by
  `reg-sync`. Frontmatter is the source of truth (it travels with the file on
  rename); the registry is the fast index.
- **Bootstrap algorithm (deterministic, run once per document):** type prefix
  (`ADR`/`BRF`/`DBF`/`PLY`) + first ≤2 significant slug tokens + sequence for
  ADRs; collision → numeric suffix. Assigned at `reg-sync` time; renames never
  re-derive. The bounded context (one silo) keeps the namespace containable;
  cross-silo references qualify with the silo badge. *(Amended 2026-08-30:
  the automation is deferred — ADR-024; hand-assignment at creation is fine
  at corpus scale, and uniqueness is self-enforcing via `gloam -g` surfacing
  collisions.)*
- **Index views:** jump tokens (`01`–`99`) are owned by
  `briefs/2026-08-28-brief-index-and-jump.md`; this brief adds the callsign
  column — `01: ADR-BOUND-010 — the full descriptive title`. Jump tokens are
  ephemeral (die with the index document, never jotted); callsigns are durable.
- **Resolution:** *(Amended 2026-08-30, ADR-024)* `gloam -g <callsign>` —
  the content shortlist, not a dedicated registry lookup. A callsign not
  written in frontmatter does not exist.

## Acceptance criteria

- Rooted gloam shows the silo name, muted, at the head of the footer
  identity run (`silo · filename` until the callsign slot lands — ADR-020)
  across supported terminal widths — no truncation or wrap bugs (existing
  `footerLine` width math extended); unrooted shows no *silo* badge (the
  Gloam binary badge is unchanged); pipe mode and `okuda <file>` unchanged.
- Footer identity run reads *silo · callsign · filename* when all three are
  known (ADR-020's status-line contract).
- A callsign still resolves after its file is renamed (resolution keyed on
  registry/frontmatter, not filename).
- Index lines carry jump token + callsign + title; jump mechanics per the
  index-and-jump brief.
- Renderer contract test: badge string on argv → footer identity slot, muted
  styling.

## Out of scope

- Top-left header pill / a third frame surface — footer identity slot only.
- Voice navigation grammar — derivable from the registry if a speech layer
  ever exists; no speech in this silo.
- Non-deterministic LLM-generated mnemonics; manual per-file callsigns beyond
  the frontmatter escape hatch.
- Jump-token mechanics (owned by `2026-08-28-brief-index-and-jump.md`).
- Frontmatter migration of the corpus — its own task under ADR-019.
