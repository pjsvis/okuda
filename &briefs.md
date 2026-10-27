# &briefs — the queue

<!-- decide:begin (derived — do not hand-edit) -->

**16 live · 141 archived · 16 tabled** — 0 to move · 0 disagreeing · 0 phantom · 2 editorial · 3 silent · 0 ticketed. *Converged: nothing to reconcile, only decisions left.*

*Derived by `scripts/brief-queue.ts --write`; do not hand-edit. Regenerate: `just decide`.*

### Editorial glyphs — the editor's own marks, not comparable to a status

Listed, never gated: the glyph cell is the editor's surface. If a mark here is meant to *mean* a status, map it in `amp-briefs.ts` so the reconciliation can read it.

- **`◆ partial`** — 1 brief: BRF-OKLCH-TUNING (open)
- **`◆ feasibility ✓`** — 1 brief: BRF-SSH-SERVED (parked)

### Silent — no ticket, no citation, live

Nothing waits on these and no Thing records them. The question per row is **what would tell us this mattered?** — a citation, a ticket, or a date. Silence is a judgement, so nothing here is gated.

| brief | age | asks |
|---|---|---|
| BRF-SEARCH-ROW | 10d | The search row — the contract, frozen by the probe |
| BRF-PROBES-TIER | 5d | Establish Registered `probes/` Tier for Exploratory Python |
| BRF-IRONY-MARK | 0d | The irony mark takes the parked state, and the vertical el |

### Ticketed, live — the load-bearing set

_none_


<!-- decide:end -->

**Live briefs only.** The queue is the top of the file because a table you have to
scroll to the bottom of is a table you stop deciding from. Rows and their states are
the registry's; sections and marks are the editor's (`ADR-DERIVED-AMP-TABLE-058`).
A callsign is its reference: actuate the amber vector to dereference, `u` unwinds,
`99` promotes.

Settled briefs are not here: they live in `.archive/briefs/` with their own index
(`just archive-search <pattern>`). That is the history, and it is replunderable.

## Open queue

| Brief | State | Narrative | Debrief |
|---|---|---|---|
| BRF-PRINCIPAL-CLERK | · open | The principal and the clerk — the three-way triage | — |
| BRF-SEARCH-ROW | · open | The search row — the contract, frozen by the probe | — |
| BRF-AUTHORING-CONVENTION | · open | Authoring Convention — Route Agents to the Style Guide | — |
| BRF-PROBES-TIER | · open | Establish Registered `probes/` Tier for Exploratory Python Scripts | — |

## Ready — specced, next up

| Brief | State | Narrative | Debrief |
|---|---|---|---|
| BRF-PERIMETER-GATE | · ready | the report that becomes a gate; lands first | — |
| BRF-PERIMETER-RUNNER | · ready | the tuning recipes and artifacts leave | — |
| BRF-PERIMETER-SILO | · ready | the doctrine and the records leave | — |
| BRF-IRONY-MARK | ▸ ready | The irony mark takes the parked state, and the vertical ellipsis goes back to elision | — |

## In flight — partially landed, has commits

| Brief | State | Narrative | Debrief |
|---|---|---|---|
| BRF-OKLCH-TUNING | ◆ partial | td-b4bae8 ready-to-start | — |

## SSH family — feasibility debriefed, build pending

| Brief | State | Narrative | Debrief |
|---|---|---|---|
| BRF-SSH-SERVED | ◆ feasibility ✓ | ForceCommand feasibility on file | [debrief](debriefs/2026-08-27-debrief-ssh-forcecommand-feasibility.md) |
| BRF-SSH-BLOG | ↓ parked | gopher-serve v1 | — |
| BRF-SSH-SERVED-2 | ↓ parked | dynamic portal | — |
| BRF-SSH-TUI | ↓ parked | escape protocol integration | — |
| BRF-SSH-HOST | ↓ parked | landing the ADR-013 reading room where SSH gives a shell | — |

## Open — fresh

| Brief | State | Narrative | Debrief |
|---|---|---|---|

## Parked / deferred

| Brief | State | Narrative | Debrief |
|---|---|---|---|
| BRF-TELEVISION-PREVIEW | ↓ parked | okuda as the renderer, OKUDA_WIDTH as the knob | — |
| BRF-DIAGRAM-HEIGHT-AXIS | ↓ parked | The height axis has no policy at all | — |

## Debriefs without briefs

`playbook-generalisation` · `justfile-facade` · `renderer-implementation` ·
`tweak-phase-and-moat` · `launcher-loop-runTui-blocks` · `okuda-pi-theme-sweep` ·
`the-ledger-day` · `gloam-live-search` — infra, methodology, and theme work;
never briefed, or briefed and landed in a day.
