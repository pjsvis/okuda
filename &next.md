# &next — the decision table

Each entry is an **action block**: one line, one action — *name,
verdict, cost* — with its reference in plain sight. 

Actuate the rose vectors §11-§98 to render the referenced documents:
- `u` unwinds and returns to main document; 
- `99` promotes the referenced document to its own terminal. 

## Landed today — the debt this table was tracking

- **BRF-CONTENT-SHORTLIST** — the discovery gap, the oldest standing
  complaint: closed. The live search shipped as the default (ADR-030),
  ranked and evidence-carrying; the picker is the index now.
- **The keyboard grammar** — 00-10 verbs and modes, 12-98 addresses, 99
  promotion: the two-digit space is a language with a bindings table
  (src/keygrammar.ts); renumbering is a one-line edit. **Amended
  2026-09-06 (ADR-032):** repeated-digit actuators {00,11,22,…,99} — one
  class, never jumps — reserved; shape rule (repeated = actuator, mixed =
  address) supersedes the range split. **Corrected 2026-09-13:** the
  vectors are 12–98 *minus* the doubled-pair class = **80 addresses**, not
  88 (and not the 83 this line said in between, which predates 11 joining
  the pocket). Canon: `src/vectors.ts` `MAX_REFS`, ADR-032:81.
- **Frame mode (BRF-PAGED-OKUDAGRAM, v1)** — `01` actuates: a frame is
  a header and its content to the next header; j/k step frames, arrows
  slippy within, ␣/b page. The brief's EC walk remains.
- **Protocol-free TTS identity** (2026-09-06) — the dunt demolition's
  positive form: gloam is a text receiver and a restricted-grammar text
  emitter, protocol-free on both ends (`docs/2026-09-06-protocol-free-text-identity.md`).
  The dogfood (`just tts`) runs; Run 1 found the `--no-color` escape leak.
  ADR-032 reserved the actuator pocket. Debrief:
  `debriefs/2026-09-06-debrief-protocol-free-tts.md`.

## Recommended — start these next

- **The perimeter** (ADR-PERIMETER-039, 2026-09-18) — the speech work
  leaves okuda, and a check keeps it out. Three briefs, independently
  closable: the tuning recipes and their artifacts go
  (BRF-PERIMETER-RUNNER), the doctrine and the records go
  (BRF-PERIMETER-SILO), and the report that becomes a gate lands first
  (BRF-PERIMETER-GATE). The measurement is
  `docs/2026-09-18-a-perimeter-not-a-project.md`: **22 of the 28
  `[moira]` recipes touch nothing of okuda's**, and every `.txt` the
  silo tracks is a rendered TTS artifact · **M**
- **The frame thing, two objectives** (2026-09-07) — (1) figure out how
  to best do the frame thing (the semantic pager, chunk = heading-subtree
  vs sub-heading/paragraph for the ear); (2) determine if the frame
  thing serves the two modes (visual scroll, audio TTS). The coupled-
  frame dogfood is the test rig. External test: Nate B Jones + wife,
  read-and-listen to the same document, discuss with references. Maybe
  add writing new docs and passing callsigns around. · **M**
- **Duplicate-callsign lint** (td-040450) — ADR-025's exactly-one
  contract is prose until this ships; the resolver is still
  silent-first-wins. Freshest debt, smallest fix · **S**
- **The conceptual lexicon extraction** (BRF-CONCEPTUAL-LEXICON) —
  brief drafted, awaiting TD decomposition; a fresh oriented agent
  reviews and builds the workflow. The `briefs/evals` barnacle
  resolves or removes with it · **M**

## Ready — when the pain flares

- **`--no-color` escape leak** — Run 1 of the TTS dogfood found
  `--no-color` leaves 28 bold ANSI escapes; `say` reads them as noise.
  Either strip bold too (a future `--plain` render dial), or accept the
  audio path skips okuda. The clean audio input today is `cat doc.md`.
  · **S**

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
  paged-view world) · **the speech set** (leaves this table —
  ADR-PERIMETER-039: the tuning loop is `../speak-md/`'s, and the ear
  owes its own corpus the auditions. **BRF-SPOKEN-BLOCK-GRAMMAR stays**,
  because ADR-037 cites it and moving it breaks the record) · **the docs
  candidates** (speech-driven design, the intention loop — landed,
  unregistered, awaiting the Derrida and Foxtrot-Oscar gates) ·
  **everything parked** (still parked).
