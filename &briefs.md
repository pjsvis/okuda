# &briefs — the state table

Every brief, grouped by *assessed* state (not registry status), each row
jump-wired. Two digits, `11`–`52`; `u` goes back. Debrief paths shown where
a debrief exists — 7 of 13 debriefs have no brief counterpart (infra and
theme work that never briefed; listed at the bottom).

Built 2026-08-30; amended 2026-09-02 (BRF-CITTY-CLI row, debrief count).
Editorial surface — regenerable by reg-menu when grouping stops earning its
keep; `just amp` checks the drift.

## Landed — debrief on file

| # | Brief | State | Debrief | |
|---|---|---|---|---|
| **11** | BRF-ELISION-PRIMITIVE | ✓ done | elision primitive; ADR-014 closed | [debrief](debriefs/2026-08-30-debrief-elision-primitive.md) <!-- %%okuda-rhs:11%% briefs/2026-08-28-brief-elision-primitive.md --> |
| **12** | BRF-INDEX-JUMP | ✓ done | ephemeral index + numeric jump | [debrief](debriefs/2026-08-29-debrief-index-and-jump.md) <!-- %%okuda-rhs:12%% briefs/2026-08-28-brief-index-and-jump.md --> |
| **13** | BRF-OKF-CALLSIGN | ✓ done | OKF conformance + callsign layer | [debrief](debriefs/2026-08-29-debrief-okf-callsign-migration.md) <!-- %%okuda-rhs:13%% briefs/2026-08-29-brief-okf-callsign-migration.md --> |

## Closed by other means — registry status is stale on all three

| # | Brief | State | Debrief | |
|---|---|---|---|---|
| **14** | BRF-FZF-OWNS-LOOP | ✗ aborted | experiment reverted; passive stdin restored | [debrief](debriefs/2026-08-30-debrief-fzf-owns-the-loop-aborted.md) <!-- %%okuda-rhs:14%% briefs/2026-08-29-brief-fzf-owns-the-loop.md --> |
| **15** | BRF-MERMAID-SOURCE-OMITTED | ✓ landed 2026-08-30 | ⋮ indicator; checksum dropped; td approved | — <!-- %%okuda-rhs:15%% briefs/2026-09-01-brief-mermaid-source-omitted.md --> |
| **16** | BRF-VIEWPORT-PADDING | ✗ rejected | resize-anchor debrief covers the boundary work | [debrief](debriefs/2026-08-26-debrief-resize-anchor-boundary-conditions.md) <!-- %%okuda-rhs:16%% briefs/2026-08-25-brief-viewport-padding.md --> |

## Ready — specced, next up

| # | Brief | State | Note | |
|---|---|---|---|---|
| **17** | BRF-CONTENT-SHORTLIST | · ready | rg shortlist; `gloam -g`; small | — <!-- %%okuda-rhs:17%% briefs/2026-08-30-brief-content-shortlist.md --> |
| **18** | BRF-DOCUMENT-LINKS | · ready | gopher links; keyspace unified 11–99 | — <!-- %%okuda-rhs:18%% briefs/2026-08-26-brief-document-links.md --> |
| **19** | BRF-REFRESH-OFF-DISK | · ready | resize race + R placebo; td-2df019 | — <!-- %%okuda-rhs:19%% briefs/2026-08-30-brief-refresh-off-disk.md --> |
| **20** | BRF-SILO-MNEMONICS | · ready | amended: data not machinery; small remainder | — <!-- %%okuda-rhs:20%% briefs/2026-08-28-silo-mnemonics.md --> |
| **21** | BRF-FLOW-WRAP | · ready | break opportunities so paths flow | — <!-- %%okuda-rhs:21%% briefs/2026-09-01-brief-flow-wrap.md --> |
| **52** | BRF-CITTY-CLI | · ready | citty parses; stateless stance; three gates | — <!-- %%okuda-rhs:52%% briefs/2026-08-31-brief-citty-cli.md --> |

## In flight — partially landed, has commits

| # | Brief | State | Note | |
|---|---|---|---|---|
| **22** | BRF-MERMAID-HARD | ◆ partial | CSN diagnostics landed; boundary machine pending | — <!-- %%okuda-rhs:22%% briefs/2026-08-29-mermaid-hard-boundary-CSN.md --> |
| **23** | BRF-JUMP-DEMO | ◆ partial | demo + honesty pass | — <!-- %%okuda-rhs:23%% briefs/2026-08-28-brief-jump-demo-honesty.md --> |
| **24** | BRF-STATE-GLYPH | ◆ partial | render path + showcase environment | — <!-- %%okuda-rhs:24%% briefs/2026-08-28-brief-state-glyph-render-path.md --> |
| **25** | BRF-STATE-GLYPH-2 | ◆ partial | vocabulary — closed lexicon | — <!-- %%okuda-rhs:25%% briefs/2026-08-28-brief-state-glyph-vocabulary.md --> |
| **26** | BRF-OKLCH-TUNING | ◆ partial | td-b4bae8 ready-to-start | — <!-- %%okuda-rhs:26%% briefs/2026-08-28-brief-oklch-tuning.md --> |
| **27** | BRF-PAGED-OKUDAGRAM | · open | block-aware paging, candidate invariant | — <!-- %%okuda-rhs:27%% briefs/2026-08-29-brief-paged-okudagram.md --> |
| **28** | BRF-TTY-REVERSE | · open | land at the top | — <!-- %%okuda-rhs:28%% briefs/2026-08-26-brief-tty-reverse-print.md --> |

## SSH family — feasibility debriefed, build pending

| # | Brief | State | Debrief | |
|---|---|---|---|---|
| **29** | BRF-SSH-SERVED | ◆ feasibility ✓ | ForceCommand feasibility on file | [debrief](debriefs/2026-08-27-debrief-ssh-forcecommand-feasibility.md) <!-- %%okuda-rhs:29%% briefs/2026-08-26-brief-ssh-served-markdown.md --> |
| **30** | BRF-SSH-BLOG | · open | gopher-serve v1 | — <!-- %%okuda-rhs:30%% briefs/2026-08-26-brief-ssh-blog-feed.md --> |
| **31** | BRF-SSH-SERVED-2 | · open | dynamic portal | — <!-- %%okuda-rhs:31%% briefs/2026-08-28-brief-ssh-served-dynamic-markdown-portal.md --> |
| **32** | BRF-SSH-TUI | · open | escape protocol integration | — <!-- %%okuda-rhs:32%% briefs/2026-08-27-brief-ssh-tui-integration.md --> |

## Open queue

| # | Brief | State | Note | |
|---|---|---|---|---|
| **33** | BRF-REGISTRY-MARKDOWN | · open | silo dashboard | — <!-- %%okuda-rhs:33%% briefs/2026-08-25-brief-registry-markdown-browser.md --> |
| **34** | BRF-PANEL-LIBRARY | · open | chunk-addressable okudagrams | — <!-- %%okuda-rhs:34%% briefs/2026-08-27-brief-panel-library.md --> |
| **35** | BRF-DENSE-DYNAMIC | · open | telemetry visual primitives | — <!-- %%okuda-rhs:35%% briefs/2026-08-27-brief-dense-dynamic-displays.md --> |
| **36** | BRF-FETCH-STATE | · open | fetch stamp; fixes the empty-doc lie | — <!-- %%okuda-rhs:36%% briefs/2026-08-27-brief-fetch-state-stamp.md --> |
| **37** | BRF-HERDR-DASHBOARD | · open | the build's exhaust, composed | — <!-- %%okuda-rhs:37%% briefs/2026-08-26-brief-herdr-dashboard.md --> |
| **38** | BRF-TUI-LIVE | · open | fs.watch → anchored re-render | — <!-- %%okuda-rhs:38%% briefs/2026-08-26-brief-tui-live-documents.md --> |
| **39** | BRF-LAUNCHER-FUT | · open | session-scoped alt-screen | — <!-- %%okuda-rhs:39%% briefs/2026-08-28-brief-launcher-fut.md --> |
| **40** | BRF-IPAD-MINI | · open | demo brief | — <!-- %%okuda-rhs:40%% briefs/2026-08-30-ipad-mini-demo.md --> |
| **41** | BRF-TELEMETRY-CONVENTIONS | · open | markdown as message bus | — <!-- %%okuda-rhs:41%% briefs/2026-08-26-brief-telemetry-conventions.md --> |
| **42** | BRF-NOTIFICATION-STYLE | · open | ADR-020 landed; impl pending | — <!-- %%okuda-rhs:42%% briefs/2026-08-28-brief-notification-style.md --> |
| **43** | BRF-AI-DOC | · open | inline ask-the-doc, local SSH | — <!-- %%okuda-rhs:43%% briefs/2026-08-28-brief-ai-and-in-doc-ask-local-ssh.md --> |
| **44** | BRF-ARTPACK-AESTHETICS | · open | high-SNR dark rendering | — <!-- %%okuda-rhs:44%% briefs/2026-08-27-brief-artpack-aesthetics.md --> |
| **45** | BRF-AUDIO-STYLE | · open | audio-first style guide + lint | — <!-- %%okuda-rhs:45%% briefs/2026-08-29-audio-style-guide.md --> |
| **46** | BRF-RESTICTED-GRAMMAR | · open | AST → SSML mapping | — <!-- %%okuda-rhs:46%% briefs/2026-08-29-brief-resticted-grammar-speech.md --> |
| **47** | BRF-TERMINAL-SPEECH | · open | speech pipeline easter egg | — <!-- %%okuda-rhs:47%% briefs/2026-08-29-brief-terminal-speech.md --> |

## Parked / deferred

| # | Brief | State | Note | |
|---|---|---|---|---|
| **48** | BRF-PALETTE-LIGHTNESS | ↓ parked | global brightness knob | — <!-- %%okuda-rhs:48%% briefs/2026-08-26-brief-palette-lightness-knob.md --> |
| **49** | BRF-PI-MARKDOWN | ↓ parked | Pi's rendering issue | — <!-- %%okuda-rhs:49%% briefs/2026-08-25-brief-pi-markdown-rendering-via-okuda.md --> |
| **50** | BRF-MENU-TEMPLATES | ↓ parked | fires on the second menu kind | — <!-- %%okuda-rhs:50%% briefs/2026-08-29-brief-menu-templates-deferred.md --> |
| **51** | BRF-DOCUMENT-SEARCH | ↓ deferred | deferred by BRF-CONTENT-SHORTLIST; host owns ctrl+f | — <!-- %%okuda-rhs:51%% briefs/2026-08-26-brief-in-document-search-and-outlining.md --> |

## Debriefs without briefs

`playbook-generalisation` · `justfile-facade` · `renderer-implementation` ·
`tweak-phase-and-moat` · `launcher-loop-runTui-blocks` · `okuda-pi-theme-sweep` ·
`the-ledger-day` — infra, methodology, and theme work; never briefed, correctly.
