---
type: Brief
callsign: BRF-RENDER-DEFECTS
---

# Brief: Render defects — the stack map's four findings, and how they stop recurring

**Date:** 2026-10-10
**Status:** Open
**TD:** (epic tracked by callsign)

## Context

Authoring `&stack` and its four expansions rendered five mermaid diagrams and
surfaced four defects, three of them **silent** — a diagram that renders is not a
diagram that is right. Two live in the renderer (`mermaid-to-md`, a sibling silo),
one is an authoring hazard, and one is a headless/glass map divergence; the
corrections split by owner, and the renderer half crosses the seam.

## Objective

Correct the four defects the stack-map render exposed: add the authoring hazards
and the okuda-side parity fix here, and commission the two renderer defects to the
sibling silo as a message.

## Evidence

`tmp/stack-probe.ts` renders the map and each expansion headlessly and printed all
four. The rendered signatures, measured 2026-10-10:

| # | defect | rendered signature | owner |
|---|---|---|---|
| 1 | parallel edges on one ordered pair collapse | `Sender --> Receiver` and `Sender -.-> Receiver` → the dotted edge vanishes; the diagram renders and reads as complete | `mermaid-to-md` |
| 2 | two labelled back-edges into one node collide | `Drift -->\|failed to pursue\| Brief` + `Drift -->\|pursued a refusal\| Brief` → `\| Founding brief: aim \| pfailed to pursue`, second label dropped | `mermaid-to-md` |
| 3 | a wide `flowchart LR` falls back to source | 5 nodes with ~25-char labels at width 100 → *"This diagram is too wide"* + source block | authoring / upstream width estimate |
| 4 | the headless map is optimistic | `jumpMapFor(source)` without `resolves` painted a lookalike token as §12; the glass (launcher, resolver-gated) would not | okuda tooling |

Defect 4 is the one that misled a tool: the probe reported `referencesCovered=false`
until the lookalike token was removed, while the glass map was already correct.

## Scope

**In:** the four hazard signatures in `playbooks/mermaid-diagrams-playbook.md`;
`scripts/mermaid-lint.ts` (report first, then gate) flagging defects 1 and 2;
`scripts/vector-check.ts` and any headless renderer passing the `resolves`
predicate; a fixture proving the glass and headless maps agree; a message to the
`mermaid-to-md` silo with one minimal reproduction per renderer defect.

**Out:** editing the sibling silo's source (a seam crossing — a message, and the
receiver owns its commit); the renderer's layout engine; ADR-031's discovery
contract.

## Preconditions

- [ ] `&stack.md` and its four expansions are on a branch (`feat/stack-map`,
      commit `486b54d`).
- [ ] `tmp/stack-probe.ts` reproduces the four defects (it does; the table above is
      its output).
- [ ] `mermaid-to-md` is on PATH at `~/.local/bin/`, and its source repo is
      reachable across the seam.

## Work Plan

1. [ ] Add the four signatures to the mermaid playbook: parallel-edge collapse,
      back-edge label collision, the LR width fallback, and the headless/glass map
      divergence.
2. [ ] Write `scripts/mermaid-lint.ts`: flag two edges on the same ordered pair,
      and two or more labelled edges into one node. Ship as a **report** first; a
      gate when the corpus is clean (the perimeter pattern, ADR-PERIMETER-039).
3. [ ] Pass `resolves` in `vector-check.ts`; add a lookalike-token fixture and
      assert the headless map equals the resolver-gated map.
4. [ ] File the upstream report in the sibling silo's inbox: per defect, a minimal
      mermaid source, the observed render, and the expected render.

## Acceptance Criteria

- The playbook names each of the four hazards with its rendered signature.
- `scripts/mermaid-lint.ts` flags defects 1 and 2 on a fixture, and reports zero on
  the corrected corpus.
- `vector-check` passes the resolver, and the fixture proves the glass and headless
  maps agree.
- The upstream report exists at the seam, with one minimal reproduction per
  renderer defect.

## Notes

The renderer defects are **the seam rule's worked case**: a message declares what
wrote it, where it landed, and who commits; the receiver owns its commit. Do not
edit the sibling's tree.

The class is the **silent lie**: a collapsed edge and a dropped label both render
as a complete diagram, and neither the glass nor the eye reports the loss. The
lint exists because the renderer cannot be trusted to say when it has drawn less
than it was given.

`scripts/mermaid-lint.ts` is a report on arrival, not a gate: the corpus predates
the rule, and a gate that fails on arrival is a gate that gets waived.

## Related

- `&stack.md` — the map whose render found the defects
- `playbooks/mermaid-diagrams-playbook.md` — the authoring rules that gain the hazards
- `docs/2026-10-10-the-seam.md` — the crossing rule the upstream report follows
- `tmp/stack-probe.ts` — the scratch probe that reproduced all four
