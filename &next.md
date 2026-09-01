# &next — the decision table

Not the state table (`&briefs` has all 41; this one argues). Each entry
is an **action block**: one line, one action — *name, verdict, cost* —
with the jump number as its address. Type the digits; `u` comes back.
Built 2026-08-31, after ADR-025/026 and the day's amendments.

## Recommended — start these next

- **Duplicate-callsign lint** (td-040450) — ADR-025's exactly-one contract is prose until this ships; the resolver is still silent-first-wins. Freshest debt, smallest fix · **S** %%okuda-rhs:11%% <!-- decisions/025-mnemonic-namespace-model.md -->
- **BRF-CONTENT-SHORTLIST — ranked merge** — the discovery gap is the oldest standing complaint; ranked sources amended and specced; unblocks agents and humans alike. The spout · **M** %%okuda-rhs:12%% <!-- briefs/2026-08-30-brief-content-shortlist.md -->
- **Bracket paint** (ADR-026 paint direction) — small render change, `[11]` in OKLCH accent; makes the wire layer visible and dogfoods the cadence argument · **S** %%okuda-rhs:13%% <!-- decisions/026-wire-format.md -->

## Ready — when the pain flares

- **BRF-REFRESH-OFF-DISK** — real bug (resize race, R placebo), td ready; bites on mobile SSH only. Batch with the next mobile dogfood · **M** %%okuda-rhs:14%% <!-- briefs/2026-08-30-brief-refresh-off-disk.md -->
- **BRF-DOCUMENT-LINKS** — gopher links, keyspace unified and specced; pairs naturally after the shortlist (both feed `pickFile` sources) · **M** %%okuda-rhs:15%% <!-- briefs/2026-08-26-brief-document-links.md -->

## Exploration — read-and-think, no code

- **BRF-PAGED-OKUDAGRAM — unit definition** — unpark condition halved (fzf epic aborted, seam clear); needs one defender for "header → next header" against the real corpus · **S** %%okuda-rhs:16%% <!-- briefs/2026-08-29-brief-paged-okudagram.md -->

## Hygiene — small, owed

- **Status flips + debrief** — registry says open for an aborted brief (FZF-OWNS-LOOP) and a landed one (MERMAID-SOURCE-OMITTED); do both by hand and note the habit · **S** %%okuda-rhs:17%% <!-- briefs/2026-09-01-brief-mermaid-source-omitted.md -->
- **BRF-SILO-MNEMONICS — close or scope** — resolution shipped, badge shipped, bootstrap deferred, namespace modelled: what *remains* is likely a debrief and a close · **S** %%okuda-rhs:18%% <!-- briefs/2026-08-28-silo-mnemonics.md -->

## Not next — deliberately

- **BRF-FLOW-WRAP** (fresh) · **BRF-MERMAID-HARD** (waits on a paged-view
  world) · **the SSH family** (feasibility done; build waits on a served-
  content reason) · **the speech set** (research landed; no pipeline brief
  yet) · **everything parked** (still parked).
