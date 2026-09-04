# &next — the decision table

Not the state table (`&briefs` has the full ledger; this one argues).
Each entry is an **action block**: one line, one action — *name,
verdict, cost* — with its reference in plain sight. Actuate the amber
vector to dereference; `u` unwinds; `99` promotes the document to its
own terminal. Amended 2026-09-04: ADR-030 and ADR-031 landed (the live
search and the working copy); the hidden wiring retired — references
are text now.

## Landed today — the debt this table was tracking

- **BRF-CONTENT-SHORTLIST** — the discovery gap, the oldest standing
  complaint: closed. The live search shipped as the default (ADR-030),
  ranked and evidence-carrying; the picker is the index now.

## Recommended — start these next

- **Duplicate-callsign lint** (td-040450) — ADR-025's exactly-one
  contract is prose until this ships; the resolver is still
  silent-first-wins. Freshest debt, smallest fix · **S**

## Ready — when the pain flares

- **BRF-REFRESH-OFF-DISK** — real bug (resize race, R placebo), td
  ready; bites on mobile SSH only. Batch with the porch-matrix
  dogfood · **M**
- **BRF-DOCUMENT-LINKS** — gopher links, keyspace unified and specced;
  the vector render supersedes part of it, the served-content half
  waits on a reason · **M**

## Exploration — read-and-think, no code

- **BRF-PAGED-OKUDAGRAM — the okudagram frame** — rule fully specified:
  a frame is a header + content to the next header; pending walk
  validation against EC1–EC9 · **S**

## Hygiene — small, owed

- **BRF-SILO-MNEMONICS — close or scope** — resolution shipped, badge
  shipped, bootstrap deferred: what remains is likely a debrief and a
  close · **S**
- **The porch matrix** (BRF-PORCH-MATRIX) — not built yet: the scheme
  handlers and the per-glass verdicts. The table's newest resident · **M**

## Not next — deliberately

- **BRF-FLOW-WRAP** (fresh) · **BRF-MERMAID-HARD** (waits on a
  paged-view world) · **the speech set** (research landed; no pipeline
  brief yet) · **everything parked** (still parked).
