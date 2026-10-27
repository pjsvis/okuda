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

_Order: **decisions first, history last**. The queue is the top of the file
because a table you have to scroll to the bottom of is a table you stop
deciding from. Membership is the registry's; the sections and notes are the
editor's (`ADR-DERIVED-AMP-TABLE-058`)._

<!-- decide:begin (derived — do not hand-edit) -->

*Derived by `scripts/brief-queue.ts --write`; do not hand-edit. Regenerate: `just decide`.*

**72 live · 85 archived · 120 tabled** — 0 to move · 0 disagreeing · 0 phantom · 5 editorial · 35 silent · 1 ticketed. *Converged: nothing to reconcile, only decisions left.*

### Editorial glyphs — the editor's own marks, not comparable to a status

Listed, never gated: the glyph cell is the editor's surface. If a mark here is meant to *mean* a status, map it in `amp-briefs.ts` so the reconciliation can read it.

BRF-MERMAID-HARD `◆` (open) · BRF-JUMP-DEMO `◆` (open) · BRF-STATE-GLYPH-2 `◆` (open) · BRF-OKLCH-TUNING `◆` (open) · BRF-SSH-SERVED `◆` (parked)

### Silent — no ticket, no citation, live

Nothing waits on these and no Thing records them. The question per row is **what would tell us this mattered?** — a citation, a ticket, or a date. Silence is a judgement, so nothing here is gated.

| brief | age | asks |
|---|---|---|
| BRF-REGISTRY-MARKDOWN | 62d | Registry-aware markdown browser — the silo dashboard |
| BRF-HERDR-DASHBOARD | 61d | Herdr Dashboard — the Build's Exhaust, Composed |
| BRF-DOCUMENT-SEARCH | 61d | In-Document Search and Outlining — Fast Navigation in Gloa |
| BRF-TELEMETRY-CONVENTIONS | 61d | Telemetry Conventions — Markdown as Message Bus |
| BRF-TTY-REVERSE | 61d | TTY Reverse-Print — Land at the Top |
| BRF-ARTPACK-AESTHETICS | 60d | Plundered artpack aesthetics & high-SNR dark terminal rend |
| BRF-DENSE-DYNAMIC | 60d | Dense terminal visual primitives for dynamic telemetry |
| BRF-JUMP-DEMO | 59d | jump-demo honesty — slug derivation + state-glyph signal |
| BRF-STATE-GLYPH-2 | 59d | State-glyph vocabulary — colour + bold, the closed lexicon |
| BRF-RESTICTED-GRAMMAR | 58d | Okuda Markdown AST to W3C SSML Mapping Investigation |
| BRF-TERMINAL-SPEECH | 58d | Terminal Speech Pipeline Easter Egg |
| BRF-MERMAID-HARD | 58d | Mermaid Rendering Hard Boundary State Machine (CSN Diagnos |
| BRF-IPAD-MINI | 57d | 2026-08-30-ipad-mini-demo |
| BRF-DIAGRAM-INGESTION | 49d | The diagram ingestion pipeline — mermaid-to-md as the show |
| BRF-CONCEPTUAL-LEXICON | 42d | Extract the Conceptual Lexicon from system.md |
| BRF-CAPABILITIES-DOC | 37d | The capabilities doc — a snapshot inventory, not a changel |
| BRF-PALETTE-AUDIT | 37d | The palette audit — review the colours before the brightne |
| BRF-FENCE-DISCIPLINE | 26d | One fence rule — five scanners, four disciplines, one of t |
| BRF-DOC-SEARCH-FERMATA | 23d | The doc→search fermata — a held frame at the reading/searc |
| BRF-STICKY-HEADING-STEPPER | 22d | The sticky-heading pager — step through a document section |
| BRF-AST-PROSODY | 21d | AST-to-Prosody Intermediate Representation for Speech Rend |
| BRF-KINDLE-PORCH | 20d | The Kindle porch — the silo on an e-ink glass, over ssh, n |
| BRF-FRAME-INDEX | 19d | The frame index — an address two parties can both name |
| BRF-REG-CLI | 18d | `reg` — the silo maintenance CLI, one entry point, one art |
| BRF-REGISTRY-DISCOVERY | 18d | One map from the territory — the registry discovers its ow |
| BRF-SILO-LEXICON | 18d | Gather the silo's terms of art into `conceptual-lexicon.md |
| BRF-COMPLETE-BLOCKS | 17d | The viewport holds complete blocks — cut at boundaries, in |
| BRF-AMP-CELL | 16d | The state cell derives — a status change reaches the table |
| BRF-LEAK-FENCE | 16d | The leak gate's fence exemption — anchor on the source, no |
| BRF-READ-ACTUATOR | 16d | Read actuator — the current document, handed to the voice |
| BRF-RENDER-DEFECTS | 16d | Render defects — the stack map's four findings, and how th |
| BRF-ALIGN-ACROSS-TABLES | 13d | The align meta is misattributed across tables — a later ta |
| BRF-SEARCH-ROW | 10d | The search row — the contract, frozen by the probe |
| BRF-PROBES-TIER | 5d | Establish Registered `probes/` Tier for Exploratory Python |
| BRF-IRONY-MARK | 0d | The irony mark takes the parked state, and the vertical el |

### Ticketed, live — the load-bearing set

BRF-CONCORDANCE-PREFILTER


<!-- decide:end -->

## Open queue

| Brief | State | Narrative | Debrief |
|---|---|---|---|
| BRF-REGISTRY-MARKDOWN | · open | silo dashboard | — |
| BRF-DENSE-DYNAMIC | · open | telemetry visual primitives | — |
| BRF-FETCH-STATE | · open | fetch stamp; fixes the empty-doc lie | — |
| BRF-HERDR-DASHBOARD | ▸ ready | the build's exhaust, composed | — |
| BRF-LAUNCHER-FUT | ✓ landed | session-scoped alt-screen — registry: done, archived | — |
| BRF-IPAD-MINI | · open | demo brief | — |
| BRF-TELEMETRY-CONVENTIONS | ▸ ready | markdown as message bus | — |
| BRF-NOTIFICATION-STYLE | ✓ landed | ADR-020 landed; impl pending — registry: done, archived | — |
| BRF-AI-DOC | ↓ parked | inline ask-the-doc, local SSH | — |
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
| BRF-ADDRESS-CAP | ✓ landed | the invariant is the destination — registry: done, archived | — |
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
| BRF-DEMO-SANDBOX | ↓ parked | the public demo room — two access modes, one grammar | — |
| BRF-DOC-SEARCH-FERMATA | · open | a held frame at the reading/searching boundary | — |
| BRF-STICKY-HEADING-STEPPER | · open | step by section, heading as anchor, never truncate | — |
| BRF-AST-PROSODY | · open | AST to prosody — the intermediate representation | — |
| BRF-KINDLE-PORCH | · open | the silo on an e-ink glass, over ssh, nothing on the device | — |
| BRF-FRAME-INDEX | · open | an address two parties can both name | — |
| BRF-DOCUMENT-LIFECYCLE | ✓ landed | ephemeral, record, addressed, retired (in review) — registry: done, archived | — |
| BRF-REG-CLI | · open | the silo maintenance CLI, one entry point | — |
| BRF-REGISTRY-DISCOVERY | · open | one map from the territory — the registry discovers its tiers | — |
| BRF-SILO-LEXICON | · open | gather the silo's terms of art | — |
| BRF-COMPLETE-BLOCKS | · open | the viewport holds complete blocks — cut at boundaries | — |
| BRF-DOCS-LEDGER | · open | a prune ledger, not a registry | — |
| BRF-COMMISSION-BLANDINGS | · open | commission the Blandings silo, and the procedure | — |
| BRF-READ-ACTUATOR | · open | 77 calls the speech function (epic) | — |
| BRF-RENDER-DEFECTS | · open | the stack map's four findings (epic) | — |
| BRF-BOUNDARY-MARK | ✓ landed | The boundary mark — the receipt elides the addresses the cap never realised — registry: done, archived | — |
| BRF-AMP-CELL | · open | The state cell derives — a status change reaches the table | — |
| BRF-HISTORY-PREFACE | ✓ landed | the header is Date + Status — the history preface and the `TD` field out, with a lint for both — registry: done, archived | — |
| BRF-LEAK-FENCE | · open | The leak gate's fence exemption — anchor on the source, not a rendered match | — |
| BRF-ALIGN-ACROSS-TABLES | · open | The align meta is misattributed across tables — a later table un-aligns an earlier one | — |
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
| BRF-MERMAID-HARD | ◆ partial | CSN diagnostics landed; boundary machine pending | — |
| BRF-JUMP-DEMO | ◆ partial | demo + honesty pass | — |
| BRF-STATE-GLYPH | ✓ landed | render path + showcase environment — registry: done, archived | — |
| BRF-STATE-GLYPH-2 | ◆ partial | vocabulary — closed lexicon | — |
| BRF-OKLCH-TUNING | ◆ partial | td-b4bae8 ready-to-start | — |
| BRF-PAGED-OKUDAGRAM | ✓ landed | the frame — a portioning rule — registry: done, archived | — |
| BRF-TTY-REVERSE | ▸ ready | land at the top | — |

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
| BRF-DOCUMENT-SEARCH | · open | deferred by the live search; host owns ctrl+f | — |
| BRF-TELEVISION-PREVIEW | ↓ parked | okuda as the renderer, OKUDA_WIDTH as the knob | — |
| BRF-DIAGRAM-HEIGHT-AXIS | ↓ parked | The height axis has no policy at all | — |

## Landed — debrief on file

| Brief | State | Narrative | Debrief |
|---|---|---|---|
| BRF-PROSE-MEASURE | ✓ done | text takes the measure (76), art takes the glass; the fence receipt refused — ADR-070 | [debrief](debriefs/2026-10-26-debrief-the-measure.md) |
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
| BRF-SEAM-AUDIT | ✓ landed | the seam audit — the run buffer generalised, `]]`/`[[` fire across reads, the read-boundary test added (landed same day) — archived 2026-10-26 | — |
| BRF-TABLE-SLOT-INSTRUMENT | ✓ landed | The table's columns are unobservable — a slot instrument, and a header/body alignment test — archived 2026-10-26 | — |
| BRF-PLATFORM-GATE | ✓ landed | The gate names its format — building okuda on Omarchy — archived 2026-10-26 | — |
| BRF-TOOLCHAIN-TRUTH | ✓ landed | Four claims that could not prove themselves — archived 2026-10-26 | — |
| BRF-DIAGRAM-WIDTH-HANDOFF | ✓ landed | One width, or two? — the diagram pipe's second opinion — archived 2026-10-26 | — |

## Landed today — ADR-031, the working copy

| Brief | State | Narrative | Debrief |
|---|---|---|---|
| BRF-WORKING-COPY | ✓ implemented | vector render mode; 99 clone; honest actuator | — |

## Closed by other means — refusals and closures

| Brief | State | Narrative | Debrief |
|---|---|---|---|
| BRF-FZF-OWNS-LOOP | ✗ aborted | experiment reverted; passive stdin restored | [debrief](debriefs/2026-08-30-debrief-fzf-owns-the-loop-aborted.md) |
| BRF-MERMAID-SOURCE-OMITTED | ✓ landed 2026-08-30 | ⋮ indicator; checksum dropped; td approved | — |
| BRF-PANEL-LIBRARY | ✗ rejected | chunk-addressable renders — registry: rejected, archived | — |
| BRF-TUI-LIVE | ✗ rejected | fs.watch → anchored re-render — registry: rejected, archived | — |
| BRF-TABLE-LADDER | ✗ rejected | the band and the ladder — table fit from a design width of 80 — registry: rejected, archived | — |
| BRF-DOCUMENT-LINKS | ✗ rejected | gopher links; keyspace unified 11–99 — registry: rejected, archived | — |
| BRF-REFRESH-OFF-DISK | ✗ rejected | resize race + R placebo; td-2df019 — registry: rejected, archived | — |
| BRF-SILO-MNEMONICS | ✗ rejected | amended: data not machinery; small remainder — registry: rejected, archived | — |
| BRF-FLOW-WRAP | ✗ rejected | break opportunities so paths flow — registry: rejected, archived | — |
| BRF-CITTY-CLI | ✗ rejected | citty parses; stateless stance; three gates — registry: rejected, archived | — |
| BRF-PORCH-MATRIX | ✗ rejected | click a URL, land in a terminal; per-glass matrix — registry: rejected, archived | — |
| BRF-DIAGRAM-DESCRIBE | ✗ rejected | prose descriptions of mermaid diagrams — the render-path design refused 2026-10-04; the residue is the lint — registry: rejected, archived | — |
| BRF-STEP-INVENTORY | ✗ rejected | the stride inventory — the stepper shipped, the record drifted, one unit missing (landed 2026-09-30; epic td-91bf51) — registry: rejected, archived | — |
| BRF-PALETTE-LIGHTNESS | ✗ rejected | global brightness knob — registry: rejected, archived | — |
| BRF-PI-MARKDOWN | ✗ rejected | Pi's rendering issue — registry: rejected, archived | — |
| BRF-MENU-TEMPLATES | ✗ rejected | fires on the second menu kind — registry: rejected, archived | — |
| BRF-BM25-EVALUATION | ✗ rejected | benchmark local BM25 against ripgrep and AST traversal — registry: rejected, archived | — |
| BRF-SEARCH-SURFACE | ✗ rejected | the search state machine and the invariant audit — registry: rejected, archived | — |
| BRF-TERMINAL-CELL-GRID | ✗ rejected | 2D terminal cell grid architecture — registry: rejected, archived | — |
| BRF-VIEWPORT-PADDING | ✗ rejected | resize-anchor debrief covers the boundary work | [debrief](debriefs/2026-08-26-debrief-resize-anchor-boundary-conditions.md) |
| BRF-TABLE-GUTTER | ✗ rejected | The table's gutter — the separator is chrome, and the cap pays for it | — |

## Debriefs without briefs

`playbook-generalisation` · `justfile-facade` · `renderer-implementation` ·
`tweak-phase-and-moat` · `launcher-loop-runTui-blocks` · `okuda-pi-theme-sweep` ·
`the-ledger-day` · `gloam-live-search` — infra, methodology, and theme work;
never briefed, or briefed and landed in a day.
