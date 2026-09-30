# &briefs — the state table

Every brief, grouped by *assessed* state (not registry status). Each
row's callsign is its reference — actuate the amber vector to
dereference, `u` unwinds, `99` promotes to a new terminal. Debrief
paths linked where a debrief exists — 7 of 16 debriefs have no brief
counterpart (infra and theme work that never briefed; listed at the
bottom).

Built 2026-08-30; amended 2026-09-04 (the wiring retired — references
are text; the shortlist landed; the porch and working-copy rows added);
amended 2026-09-30 (the step-inventory row — assessed `· open`, the
epic's logs are empty).
Editorial surface; `just amp` checks the drift against the registry.

## Landed — debrief on file

| Brief | State | Debrief | |
|---|---|---|---|
| BRF-ELISION-PRIMITIVE | ✓ done | elision primitive; [ADR-TABLE-ELISION-014](decisions/014-table-elision-over-shrink-wrap.md) closed | [debrief](debriefs/2026-08-30-debrief-elision-primitive.md) |
| BRF-INDEX-JUMP | ✓ done | ephemeral index + numeric jump | [debrief](debriefs/2026-08-29-debrief-index-and-jump.md) |
| BRF-OKF-CALLSIGN | ✓ done | OKF conformance + callsign layer | [debrief](debriefs/2026-08-29-debrief-okf-callsign-migration.md) |
| BRF-CONTENT-SHORTLIST | ✓ landed 2026-09-04 | the live search, as default; ADR-030 | [debrief](debriefs/2026-09-04-debrief-gloam-live-search.md) |
| BRF-SYNC-OUTPUT | ✓ landed | DECSET 2026 atomicity; one frame, one write; ADR-028's first rung | — |

## Landed today — ADR-031, the working copy

| Brief | State | Note | |
|---|---|---|---|
| BRF-WORKING-COPY | ✓ implemented | vector render mode; 99 clone; honest actuator | — |

## Open — fresh

| Brief | State | Note | |
|---|---|---|---|
| BRF-PORCH-MATRIX | · open | click a URL, land in a terminal; per-glass matrix | — |
| BRF-STEP-INVENTORY | · open | the stride inventory — the stepper shipped, the record drifted, one unit missing (landed 2026-09-30; epic td-91bf51) | — |

## Closed by other means — registry status is stale on all three

| Brief | State | Debrief | |
|---|---|---|---|
| BRF-FZF-OWNS-LOOP | ✗ aborted | experiment reverted; passive stdin restored | [debrief](debriefs/2026-08-30-debrief-fzf-owns-the-loop-aborted.md) |
| BRF-MERMAID-SOURCE-OMITTED | ✓ landed 2026-08-30 | ⋮ indicator; checksum dropped; td approved | — |
| BRF-VIEWPORT-PADDING | ✗ rejected | resize-anchor debrief covers the boundary work | [debrief](debriefs/2026-08-26-debrief-resize-anchor-boundary-conditions.md) |

## Ready — specced, next up

| Brief | State | Note | |
|---|---|---|---|
| BRF-DOCUMENT-LINKS | · ready | gopher links; keyspace unified 11–99 | — |
| BRF-REFRESH-OFF-DISK | · ready | resize race + R placebo; td-2df019 | — |
| BRF-SILO-MNEMONICS | · ready | amended: data not machinery; small remainder | — |
| BRF-FLOW-WRAP | · ready | break opportunities so paths flow | — |
| BRF-CITTY-CLI | · ready | citty parses; stateless stance; three gates | — |
| BRF-PERIMETER-GATE | · ready | the report that becomes a gate; lands first | — |
| BRF-PERIMETER-RUNNER | · ready | the tuning recipes and artifacts leave | — |
| BRF-PERIMETER-SILO | · ready | the doctrine and the records leave | — |

## In flight — partially landed, has commits

| Brief | State | Note | |
|---|---|---|---|
| BRF-MERMAID-HARD | ◆ partial | CSN diagnostics landed; boundary machine pending | — |
| BRF-JUMP-DEMO | ◆ partial | demo + honesty pass | — |
| BRF-STATE-GLYPH | ◆ partial | render path + showcase environment | — |
| BRF-STATE-GLYPH-2 | ◆ partial | vocabulary — closed lexicon | — |
| BRF-OKLCH-TUNING | ◆ partial | td-b4bae8 ready-to-start | — |
| BRF-PAGED-OKUDAGRAM | · open | the okudagram frame — a portioning rule | — |
| BRF-TTY-REVERSE | · open | land at the top | — |

## SSH family — feasibility debriefed, build pending

| Brief | State | Debrief | |
|---|---|---|---|
| BRF-SSH-SERVED | ◆ feasibility ✓ | ForceCommand feasibility on file | [debrief](debriefs/2026-08-27-debrief-ssh-forcecommand-feasibility.md) |
| BRF-SSH-BLOG | · open | gopher-serve v1 | — |
| BRF-SSH-SERVED-2 | · open | dynamic portal | — |
| BRF-SSH-TUI | · open | escape protocol integration | — |

## Open queue

| Brief | State | Note | |
|---|---|---|---|
| BRF-REGISTRY-MARKDOWN | · open | silo dashboard | — |
| BRF-PANEL-LIBRARY | · open | chunk-addressable okudagrams | — |
| BRF-DENSE-DYNAMIC | · open | telemetry visual primitives | — |
| BRF-FETCH-STATE | · open | fetch stamp; fixes the empty-doc lie | — |
| BRF-HERDR-DASHBOARD | · open | the build's exhaust, composed | — |
| BRF-TUI-LIVE | · open | fs.watch → anchored re-render | — |
| BRF-LAUNCHER-FUT | · open | session-scoped alt-screen | — |
| BRF-IPAD-MINI | · open | demo brief | — |
| BRF-TELEMETRY-CONVENTIONS | · open | markdown as message bus | — |
| BRF-NOTIFICATION-STYLE | · open | ADR-020 landed; impl pending | — |
| BRF-AI-DOC | · open | inline ask-the-doc, local SSH | — |
| BRF-ARTPACK-AESTHETICS | · open | high-SNR dark rendering | — |
| BRF-AUDIO-STYLE | · open | audio-first style guide + lint | — |
| BRF-RESTICTED-GRAMMAR | · open | AST → SSML mapping | — |
| BRF-TERMINAL-SPEECH | · open | speech pipeline easter egg | — |

## Parked / deferred

| Brief | State | Note | |
|---|---|---|---|
| BRF-PALETTE-LIGHTNESS | ↓ parked | global brightness knob | — |
| BRF-PI-MARKDOWN | ↓ parked | Pi's rendering issue | — |
| BRF-MENU-TEMPLATES | ↓ parked | fires on the second menu kind | — |
| BRF-DOCUMENT-SEARCH | ↓ deferred | deferred by the live search; host owns ctrl+f | — |

## Debriefs without briefs

`playbook-generalisation` · `justfile-facade` · `renderer-implementation` ·
`tweak-phase-and-moat` · `launcher-loop-runTui-blocks` · `okuda-pi-theme-sweep` ·
`the-ledger-day` · `gloam-live-search` — infra, methodology, and theme work;
never briefed, or briefed and landed in a day.
