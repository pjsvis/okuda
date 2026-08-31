# &next — the decision table

Not the state table (`&briefs` has all 41; this one argues). The
candidates for the next step, ranked by why-now, cost, and what they
unblock. Two digits, `11`–`29`; `u` goes back.

Built 2026-08-31, after ADR-025/026 and the day's amendments.

## Recommended — start these next

| # | Candidate | Why now | Cost | <!-- %%okuda-rhs:11%% decisions/025-mnemonic-namespace-model.md --> |
|---|---|---|---|---|
| **11** | Duplicate-callsign lint (td-040450) | ADR-025's exactly-one contract is prose until this ships; the resolver is still silent-first-wins. Contract debt, small | S | <!-- %%okuda-rhs:11%% decisions/025-mnemonic-namespace-model.md --> |
| **12** | BRF-CONTENT-SHORTLIST — ranked merge | The discovery gap is the oldest open complaint; ranked sources amended in and specced; unblocks agents and humans alike. The spout | M | <!-- %%okuda-rhs:12%% briefs/2026-08-30-brief-content-shortlist.md --> |
| **13** | Bracket paint — ADR-026 paint direction | Adopted today as direction; a small render change (paint `[11]` in OKLCH accent) that makes the wire layer visible-cum-durable and dogfoods the cadence argument | S | <!-- %%okuda-rhs:13%% decisions/026-wire-format.md --> |

## Ready — when the pain flares

| # | Candidate | Why later | Cost | <!-- %%okuda-rhs:14%% briefs/2026-08-30-brief-refresh-off-disk.md --> |
|---|---|---|---|---|
| **14** | BRF-REFRESH-OFF-DISK | Real bug (resize race, R placebo), td ready — but it bites on mobile SSH only; batch with the next mobile dogfood session | M | <!-- %%okuda-rhs:14%% briefs/2026-08-30-brief-refresh-off-disk.md --> |
| **15** | BRF-DOCUMENT-LINKS | Gopher links, keyspace unified and specced — medium; pairs naturally after the shortlist (both feed pickFile sources) | M | <!-- %%okuda-rhs:15%% briefs/2026-08-26-brief-document-links.md --> |

## Exploration — read-and-think, no code

| # | Candidate | What it needs | Cost | <!-- %%okuda-rhs:16%% briefs/2026-08-29-brief-paged-okudagram.md --> |
|---|---|---|---|---|
| **16** | BRF-PAGED-OKUDAGRAM — unit definition | Unpark condition halved (fzf epic aborted, seam clear); needs one defender for "header → next header" against the real corpus. A session of reading, not building | S | <!-- %%okuda-rhs:16%% briefs/2026-08-29-brief-paged-okudagram.md --> |

## Hygiene — small, owed

| # | Candidate | Note | Cost | <!-- %%okuda-rhs:17%% briefs/2026-09-01-brief-mermaid-source-omitted.md --> |
|---|---|---|---|---|
| **17** | Status flips + debrief | Registry says open for an aborted brief (FZF-OWNS-LOOP) and a landed one (MERMAID-SOURCE-OMITTED — no debrief yet). The done ritual lacks the status step; do these two by hand and note the habit | S | <!-- %%okuda-rhs:17%% briefs/2026-09-01-brief-mermaid-source-omitted.md --> |
| **18** | BRF-SILO-MNEMONICS — close or scope | Resolution shipped (d39a414), badge shipped, bootstrap deferred (ADR-024), namespace modelled (ADR-025): what *remains*? Likely a debrief and a close, not work | S | <!-- %%okuda-rhs:18%% briefs/2026-08-28-silo-mnemonics.md --> |

## Not next — deliberately

- **BRF-FLOW-WRAP** (fresh, unspecced enough) · **BRF-MERMAID-HARD**
  (boundary machine; waits on a paged-view world) · **the SSH family**
  (feasibility done; build waits on a served-content reason) ·
  **speech set** (research docs landed; no pipeline brief yet) ·
  **anything parked** (still parked).
