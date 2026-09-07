# &next — the decision table

Each entry is an **action block**: one line, one action — *name,
verdict, cost* — with its reference in plain sight. 

Actuate the amber vector [##] to render the referenced document:
- `u` unwinds and returns to main document; 
- `99` promotes the referenced document to its own terminal. 

## Landed today — the debt this table was tracking

- **BRF-CONTENT-SHORTLIST** — the discovery gap, the oldest standing
  complaint: closed. The live search shipped as the default (ADR-030),
  ranked and evidence-carrying; the picker is the index now.
- **The keyboard grammar** — 00-10 verbs and modes, 11-98 addresses, 99
  promotion: the two-digit space is a language with a bindings table
  (src/keygrammar.ts); renumbering is a one-line edit.
- **Frame mode (BRF-PAGED-OKUDAGRAM, v1)** — `01` actuates: a frame is
  a header and its content to the next header; j/k step frames, arrows
  slippy within, ␣/b page. The brief's EC walk remains.

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

- **BRF-PAGED-OKUDAGRAM — the EC walk** — frame mode v1 shipped; the
  brief's EC1–EC9 edge cases need a validation walk against real
  documents (tall frames, blank frames, nested headers) · **S**

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
