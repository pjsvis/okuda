# &briefs — the queue

<!-- decide:begin (derived — do not hand-edit) -->

**42 live · 115 archived · 42 tabled** — 0 to move · 0 disagreeing · 0 phantom · 2 editorial · 5 silent · 1 ticketed. *Converged: nothing to reconcile, only decisions left.*

*Derived by `scripts/brief-queue.ts --write`; do not hand-edit. Regenerate: `just decide`.*

### Editorial glyphs — the editor's own marks, not comparable to a status

Listed, never gated: the glyph cell is the editor's surface. If a mark here is meant to *mean* a status, map it in `amp-briefs.ts` so the reconciliation can read it.

- **`◆ partial`** — 1 brief: BRF-OKLCH-TUNING (open)
- **`◆ feasibility ✓`** — 1 brief: BRF-SSH-SERVED (parked)

### Silent — no ticket, no citation, live

Nothing waits on these and no Thing records them. The question per row is **what would tell us this mattered?** — a citation, a ticket, or a date. Silence is a judgement, so nothing here is gated.

| brief | age | asks |
|---|---|---|
| BRF-ARTPACK-AESTHETICS | 60d | Plundered artpack aesthetics & high-SNR dark terminal rend |
| BRF-DENSE-DYNAMIC | 60d | Dense terminal visual primitives for dynamic telemetry |
| BRF-SEARCH-ROW | 10d | The search row — the contract, frozen by the probe |
| BRF-PROBES-TIER | 5d | Establish Registered `probes/` Tier for Exploratory Python |
| BRF-IRONY-MARK | 0d | The irony mark takes the parked state, and the vertical el |

### Ticketed, live — the load-bearing set

A row here is the only kind with an owner already: something outside
this table is waiting on it.

| brief | age | asks |
|---|---|---|
| BRF-CONCORDANCE-PREFILTER | 50d | The concordance pre-filter — `\|`, `!`, and case at the sil |


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
| BRF-DENSE-DYNAMIC | · open | telemetry visual primitives | — |
| BRF-FETCH-STATE | · open | fetch stamp; fixes the empty-doc lie | — |
| BRF-AI-DOC | ↓ parked | inline ask-the-doc, local SSH | — |
| BRF-ARTPACK-AESTHETICS | · open | high-SNR dark rendering | — |
| BRF-AUDIO-STYLE | · open | audio-first style guide + lint | — |
| BRF-SCROLL-REPAINT | · open | one line per scroll — scroll-region repaint for the TUI | — |
| BRF-CONCORDANCE-PREFILTER | · open | the concordance pre-filter — the pipe, the bang, and case at the seam | — |
| BRF-TTS-DOGFOOD | · open | coupled-frame TTS dogfood (mac say) | — |
| BRF-TTS-TEMPORAL | · open | temporal punctuation — markdown prosody for say | — |
| BRF-TTS-STEPPER | · open | the TTS stepper — frame-as-para, prosody-as-colour | — |
| BRF-CENSUS-MODE | · open | the mentions-inclusive map, as a reader's opt-in | — |
| BRF-AUDIO-DISCOVERY | · open | the actuator grammar, heard (epic) | — |
| BRF-PROLONGED-PRESS | · open | three gestures, one actuation, no leak (epic) | — |
| BRF-JUMP-LIST | · open | the jump list — the search screen as its projection | — |
| BRF-SPEECH-STRIDE | · open | the arrows given to the ear, the unit heard | — |
| BRF-CALLSIGN-EVERY-DOC | · open | the name and the address are orthogonal | — |
| BRF-SPOKEN-BLOCK-GRAMMAR | · open | announce the kind, enumerate, never elide silently; stays for ADR-037 | — |
| BRF-GLYPH-LEAD | · open | the state glyph is emitted twice on a list lead | — |
| BRF-GLOAM-OWNS-LOOP | · open | the search TUI retires the fzf dependency | — |
| BRF-SRC-LINE-LEDGER | · open | the 10 edit lands the editor at the eye | — |
| BRF-SILCROW-PATHS | · open | the gate grows a second substrate | — |
| BRF-READING-FRACTION | · open | a meter for the glass, from state the glass already holds | — |
| BRF-DEMO-SANDBOX | ↓ parked | the public demo room — two access modes, one grammar | — |
| BRF-DOCS-LEDGER | · open | a prune ledger, not a registry | — |
| BRF-COMMISSION-BLANDINGS | · open | commission the Blandings silo, and the procedure | — |
| BRF-PRINCIPAL-CLERK | · open | The principal and the clerk — the three-way triage | — |
| BRF-SEARCH-ROW | · open | The search row — the contract, frozen by the probe | — |
| BRF-DARWIN-CLOSE-OUT | · open | The darwin close-out — turn one promise into a measurement, and stop two paths guessing | — |
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
