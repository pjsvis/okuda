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
epic's logs are empty); amended 2026-10-04 (the diagram-describe row —
assessed `· open`, its render-path design refused); amended 2026-10-10
(the ledger reconciliation — the row set is derived: `just amp-regen`
appends any live brief the table is missing to its status's section, and
`just amp` fails while one is unfiled).
Editorial surface: the **sections and notes** are the editor's; the
**membership** is the registry's — ADR-DERIVED-AMP-TABLE-058.

## Landed — debrief on file

| Brief | State | Narrative | Debrief |
|---|---|---|---|
| BRF-ELISION-PRIMITIVE | ✓ done | elision primitive; [ADR-TABLE-ELISION-014](decisions/014-table-elision-over-shrink-wrap.md) closed | [debrief](debriefs/2026-08-30-debrief-elision-primitive.md) |
| BRF-INDEX-JUMP | ✓ done | ephemeral index + numeric jump | [debrief](debriefs/2026-08-29-debrief-index-and-jump.md) |
| BRF-OKF-CALLSIGN | ✓ done | OKF conformance + callsign layer | [debrief](debriefs/2026-08-29-debrief-okf-callsign-migration.md) |
| BRF-CONTENT-SHORTLIST | ✓ landed 2026-09-04 | the live search, as default; ADR-030 | [debrief](debriefs/2026-09-04-debrief-gloam-live-search.md) |
| BRF-SYNC-OUTPUT | ✓ landed | DECSET 2026 atomicity; one frame, one write; ADR-028's first rung | — |
| BRF-PAPER-RUNG | ✓ done | one render, two artefacts — the paper rung | [debrief](debriefs/2026-10-09-debrief-paper-rung.md) |
| BRF-STREAM-IDENTITY-HEADER | ✓ done | the render names the document for the unknown destination; awaiting the archive move | — |
| BRF-PROTOCOL-UPDATE | ✓ done | the file is the state; the deploy is a message into the sibling's inbox | [debrief](debriefs/2026-10-10-debrief-protocol-update.md) |
| BRF-CODE-SILCROWS | ✓ done | Code-comment silcrows — a rendered code file is a document for its prose | [debrief](debriefs/2026-10-12-debrief-code-silcrows.md) |
| BRF-TABLE-GLASS-FIT | ✓ done | Table fit — wrap to the glass, elide only the floor | [debrief](debriefs/2026-10-12-debrief-table-glass-fit.md) |
| BRF-IDEA-LEDGER | ✓ landed 2026-10-14 | the intake gate — ideas stage, promises are promoted; and a debrief declares its briefs | [debrief](debriefs/2026-10-14-debrief-the-funnel.md) |
| BRF-RETIRE-OKUDAGRAM | ✓ landed 2026-10-14 | the fan-word term retired — the render, the frame, and a diagram; a gate holds the line | [debrief](debriefs/2026-10-14-debrief-the-barnacle.md) |

## Landed today — ADR-031, the working copy

| Brief | State | Narrative | Debrief |
|---|---|---|---|
| BRF-WORKING-COPY | ✓ implemented | vector render mode; 99 clone; honest actuator | — |

## Open — fresh

| Brief | State | Narrative | Debrief |
|---|---|---|---|
| BRF-PORCH-MATRIX | · open | click a URL, land in a terminal; per-glass matrix | — |
| BRF-DIAGRAM-DESCRIBE | · open | prose descriptions of mermaid diagrams — the render-path design refused 2026-10-04; the residue is the lint | — |
| BRF-STEP-INVENTORY | · open | the stride inventory — the stepper shipped, the record drifted, one unit missing (landed 2026-09-30; epic td-91bf51) | — |

## Closed by other means — registry status is stale on all three

| Brief | State | Narrative | Debrief |
|---|---|---|---|
| BRF-FZF-OWNS-LOOP | ✗ aborted | experiment reverted; passive stdin restored | [debrief](debriefs/2026-08-30-debrief-fzf-owns-the-loop-aborted.md) |
| BRF-MERMAID-SOURCE-OMITTED | ✓ landed 2026-08-30 | ⋮ indicator; checksum dropped; td approved | — |
| BRF-VIEWPORT-PADDING | ✗ rejected | resize-anchor debrief covers the boundary work | [debrief](debriefs/2026-08-26-debrief-resize-anchor-boundary-conditions.md) |
| BRF-TABLE-GUTTER | ✗ rejected | The table's gutter — the separator is chrome, and the cap pays for it | — |

## Ready — specced, next up

| Brief | State | Narrative | Debrief |
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

| Brief | State | Narrative | Debrief |
|---|---|---|---|
| BRF-MERMAID-HARD | ◆ partial | CSN diagnostics landed; boundary machine pending | — |
| BRF-JUMP-DEMO | ◆ partial | demo + honesty pass | — |
| BRF-STATE-GLYPH | ◆ partial | render path + showcase environment | — |
| BRF-STATE-GLYPH-2 | ◆ partial | vocabulary — closed lexicon | — |
| BRF-OKLCH-TUNING | ◆ partial | td-b4bae8 ready-to-start | — |
| BRF-PAGED-OKUDAGRAM | · open | the frame — a portioning rule | — |
| BRF-TTY-REVERSE | · open | land at the top | — |

## SSH family — feasibility debriefed, build pending

| Brief | State | Narrative | Debrief |
|---|---|---|---|
| BRF-SSH-SERVED | ◆ feasibility ✓ | ForceCommand feasibility on file | [debrief](debriefs/2026-08-27-debrief-ssh-forcecommand-feasibility.md) |
| BRF-SSH-BLOG | · open | gopher-serve v1 | — |
| BRF-SSH-SERVED-2 | · open | dynamic portal | — |
| BRF-SSH-TUI | · open | escape protocol integration | — |
| BRF-SSH-HOST | · open | landing the ADR-013 reading room where SSH gives a shell | — |

## Open queue

| Brief | State | Narrative | Debrief |
|---|---|---|---|
| BRF-REGISTRY-MARKDOWN | · open | silo dashboard | — |
| BRF-PANEL-LIBRARY | · open | chunk-addressable renders | — |
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
| BRF-SCROLL-REPAINT | · open | one line per scroll — scroll-region repaint for the TUI | — |
| BRF-CONCORDANCE-PREFILTER | · open | the concordance pre-filter — the pipe, the bang, and case at the seam | — |
| BRF-TTS-DOGFOOD | · open | coupled-frame TTS dogfood (mac say) | — |
| BRF-DIAGRAM-INGESTION | · open | mermaid-to-md as the show/elide/hide gate | — |
| BRF-TTS-TEMPORAL | · open | temporal punctuation — markdown prosody for say | — |
| BRF-TTS-STEPPER | · open | the TTS stepper — frame-as-para, prosody-as-colour | — |
| BRF-CENSUS-MODE | · open | the mentions-inclusive map, as a reader's opt-in | — |
| BRF-AUDIO-DISCOVERY | · open | the actuator grammar, heard (epic) | — |
| BRF-PROLONGED-PRESS | · open | three gestures, one actuation, no leak (epic) | — |
| BRF-ADDRESS-CAP | · open | the invariant is the destination | — |
| BRF-CONCEPTUAL-LEXICON | · open | extract the lexicon from system.md | — |
| BRF-JUMP-LIST | · open | the jump list — the search screen as its projection | — |
| BRF-SPEECH-STRIDE | · open | the arrows given to the ear, the unit heard | — |
| BRF-CALLSIGN-EVERY-DOC | · open | the name and the address are orthogonal | — |
| BRF-SPOKEN-BLOCK-GRAMMAR | · open | announce the kind, enumerate, never elide silently; stays for ADR-037 | — |
| BRF-GLYPH-LEAD | · open | the state glyph is emitted twice on a list lead | — |
| BRF-CAPABILITIES-DOC | · open | a snapshot inventory, not a changelog | — |
| BRF-GLOAM-OWNS-LOOP | · open | the search TUI retires the fzf dependency | — |
| BRF-PALETTE-AUDIT | · open | review the colours before the brightness controller scales them | — |
| BRF-SRC-LINE-LEDGER | · open | the 10 edit lands the editor at the eye | — |
| BRF-SILCROW-PATHS | · open | the gate grows a second substrate | — |
| BRF-FENCE-DISCIPLINE | · open | one fence rule — five scanners | — |
| BRF-READING-FRACTION | · open | a meter for the glass, from state the glass already holds | — |
| BRF-DEMO-SANDBOX | · open | the public demo room — two access modes, one grammar | — |
| BRF-DOC-SEARCH-FERMATA | · open | a held frame at the reading/searching boundary | — |
| BRF-STICKY-HEADING-STEPPER | · open | step by section, heading as anchor, never truncate | — |
| BRF-AST-PROSODY | · open | AST to prosody — the intermediate representation | — |
| BRF-KINDLE-PORCH | · open | the silo on an e-ink glass, over ssh, nothing on the device | — |
| BRF-FRAME-INDEX | · open | an address two parties can both name | — |
| BRF-TABLE-LADDER | · open | the band and the ladder — table fit from a design width of 80 | — |
| BRF-DOCUMENT-LIFECYCLE | · open | ephemeral, record, addressed, retired (in review) | — |
| BRF-REG-CLI | · open | the silo maintenance CLI, one entry point | — |
| BRF-REGISTRY-DISCOVERY | · open | one map from the territory — the registry discovers its tiers | — |
| BRF-SILO-LEXICON | · open | gather the silo's terms of art | — |
| BRF-COMPLETE-BLOCKS | · open | the viewport holds complete blocks — cut at boundaries | — |
| BRF-DOCS-LEDGER | · open | a prune ledger, not a registry | — |
| BRF-COMMISSION-BLANDINGS | · open | commission the Blandings silo, and the procedure | — |
| BRF-READ-ACTUATOR | · open | 77 calls the speech function (epic) | — |
| BRF-RENDER-DEFECTS | · open | the stack map's four findings (epic) | — |
| BRF-BOUNDARY-MARK | · open | The boundary mark — the receipt elides the addresses the cap never realised | — |
| BRF-SEAM-AUDIT | ✓ done | the seam audit — the run buffer generalised, `]]`/`[[` fire across reads, the read-boundary test added (landed same day) | — |
| BRF-AMP-CELL | · open | The state cell derives — a status change reaches the table | — |
| BRF-HISTORY-PREFACE | · open | the header is Date + Status — the history preface and the `TD` field out, with a lint for both | — |
| BRF-LEAK-FENCE | · open | The leak gate's fence exemption — anchor on the source, not a rendered match | — |
| BRF-TABLE-SLOT-INSTRUMENT | · open | The table's columns are unobservable — a slot instrument, and a header/body alignment test | — |
| BRF-ALIGN-ACROSS-TABLES | · open | The align meta is misattributed across tables — a later table un-aligns an earlier one | — |
| BRF-PRINCIPAL-CLERK | · open | The principal and the clerk — the three-way triage | — |
| BRF-SEARCH-ROW | · open | The search row — the contract, frozen by the probe | — |
| BRF-PLATFORM-GATE | · open | The gate names its format — building okuda on Omarchy | — |
| BRF-TOOLCHAIN-TRUTH | · open | Four claims that could not prove themselves | — |
| BRF-DARWIN-CLOSE-OUT | · open | The darwin close-out — turn one promise into a measurement, and stop two paths guessing | — |
| BRF-AUTHORING-CONVENTION | · open | Authoring Convention — Route Agents to the Style Guide | — |
| BRF-PROBES-TIER | · open | Establish Registered `probes/` Tier for Exploratory Python Scripts | — |
| BRF-DIAGRAM-WIDTH-HANDOFF | · open | One width, or two? — the diagram pipe's second opinion | — |
| BRF-PROSE-MEASURE | · open | Text takes the measure, art takes the glass — prose gets a band, and a fence states its requirement | — |

## Parked / deferred

| Brief | State | Narrative | Debrief |
|---|---|---|---|
| BRF-PALETTE-LIGHTNESS | ↓ parked | global brightness knob | — |
| BRF-PI-MARKDOWN | ↓ parked | Pi's rendering issue | — |
| BRF-MENU-TEMPLATES | ↓ parked | fires on the second menu kind | — |
| BRF-DOCUMENT-SEARCH | ↓ deferred | deferred by the live search; host owns ctrl+f | — |
| BRF-BM25-EVALUATION | ↓ parked | benchmark local BM25 against ripgrep and AST traversal | — |
| BRF-SEARCH-SURFACE | ↓ parked | the search state machine and the invariant audit | — |
| BRF-TELEVISION-PREVIEW | ↓ parked | okuda as the renderer, OKUDA_WIDTH as the knob | — |
| BRF-TERMINAL-CELL-GRID | ↓ parked | 2D terminal cell grid architecture | — |
| BRF-DIAGRAM-HEIGHT-AXIS | ↓ parked | The height axis has no policy at all | — |

## Debriefs without briefs

`playbook-generalisation` · `justfile-facade` · `renderer-implementation` ·
`tweak-phase-and-moat` · `launcher-loop-runTui-blocks` · `okuda-pi-theme-sweep` ·
`the-ledger-day` · `gloam-live-search` — infra, methodology, and theme work;
never briefed, or briefed and landed in a day.
