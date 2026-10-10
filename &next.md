# &next — the decision table

Each entry is an **action block**: one line, one action — *name,
verdict, cost* — with its reference in plain sight. 

Actuate the rose vectors §11-§98 to render the referenced documents:
- `u` unwinds and returns to main document; 
- `99` promotes the referenced document to its own terminal. 

## Landed today — the debt this table was tracking

- **The amp reconciliation** (2026-10-10) — the `&briefs` state table is back in
  agreement with the registry: 46 briefs added, the coverage check reads live
  *and* archive (a landed brief is not a phantom), and the `&alpha` fixture wire
  is gone. `just amp` is green.
- **&stack — the map** (2026-10-10) — the silo, the seam and the reader as one
  walkable document: a root AMPER page with four expansions, each carrying its
  diagram and its named failure. The render found four defects, now briefed and
  issued; the reference list is self-tabling, so the receipt is suppressed.
- **BRF-KINDLE-PORCH** (2026-10-06) — the silo on an e-ink glass. Device
  known: **Paperwhite 11th gen (PW5)**. The next move is five minutes and
  cannot wait: **Airplane Mode on, then read the firmware version** — the
  community jailbreak for this generation (Nosebleed) covers 5.16.4–5.18.6,
  and 5.18.1.1.1 / 5.19.x are closed, with the patch arriving as an ordinary
  update. Then it is host-driven: `okuda <file> --no-color` paginated on the
  host, painted by FBInk over ssh, nothing of ours on the device. Assessment:
  `docs/2026-10-06-the-eink-frame-is-a-second-host.md` — the reading path
  emits **zero bytes of cursor control across 427 documents**.
- **BRF-DIAGRAM-DESCRIBE** (2026-10-03) — the `diagram-describe` binary reads
  mermaid source on stdin and writes prose markdown on stdout via the local
  LLM (ollama + gemma4). okuda's ` ```mermaid describe ` fence tag routes to
  it; the prose renders as a muted panel with a left border.
- **Ghostty clone/edit integration** — the `99` (clone) and `88` (edit)
  verbs spawn fresh Ghostty windows with the full interactive
  environment (zsh -i -c). Seven iterations to get the spawn boundary
  right. Lesson persisted in `src/clone.ts`.
- **The edit verb is 88, and the editor is Zed** — `09` (a blank note)
  and the never-wired `10` retired; `88` binds the *current document* to
  the editor, the doubled pair beside `99` clone (ADR-032 amended,
  keymap page moved with the table). The editor is a declaration:
  `OKUDA_EDITOR`, then `EDITOR`, then the first of `zed`, `code`,
  `cursor`, `subl` on PATH, then `vi`. A GUI editor is spawned
  directly — no terminal spun up to host it; a terminal editor rides
  `ghostty-edit`, where a login shell can find it. Cue seam speaks
  "edit" automatically (it speaks as it binds).
- **BRF-MATH-GLYPHS** — `$\Delta t$` renders as `Δt`. A closed
  vocabulary of 17 entries, an all-or-nothing gate, and a source-level
  pass with structural fence and code-span exemption (the brief's
  handler-level placement failed a probe — fences *do* reach the `text`
  handler on bun 1.4.0). Brief carries the landing record and both
  deviations.
- **BRF-HEADING-ANSI-STRIP** (2026-10-03) — heading colour leak fixed: inline
  `**strong**` inside a heading no longer bleeds gold into blue. **Done**.
- **BRF-DOC-SEARCH-FERMATA** (2026-10-03) — brief written for the doc→search
  held-frame pause. Open. · **S**
- **Dogfood crashes fixed** — Bun.spawn stdio compat, appleScript arg
  count, path doubling in resolve(cwd,doc).
- **reg-sync reconciles derived fields** — a brief flipped to Done used
  to keep its stale row forever: membership was checked, the derived
  fields were not, and the map was only consulted when an entry was
  rebuilt. Check mode now compares status, an *authored* date and the
  callsign (never the summary — the playbooks carry hand-written ones),
  reports a status word outside the tier vocabulary loudly instead of
  mapping it to `open`, and refuses the lossy traps the first run
  exposed: `parked`/`rejected`/`draft`/`proposed` are now declared
  words, the archive's statuses are fixed by *location* (ADR-052), and
  an mtime is not a date claim. It found and repaired ADR-023's row
  (`Accepted` → `Aborted`) on its first real run.
- **The dogfood ritual is complete** — the scripted six-case probe
  (`tmp/dogfood-probe.py`) ran green twice, and the operator's by-hand
  pass covered the physical holds, the one-shot slot, the abort, and
  the exit fermata; by-hand findings #1 and #2 (the FOUT, and the beat's
  positive verdict) shipped inside it. It fed `td-51d5f4` (pending digit
  indicator) and `td-e81b92` (grammar ADR), both still open.
- **TD hygiene** — closed stale td-fa0454 (quiet period, design went
  clock-free), reviewed td-3da242 (archive sweep).

## Recommended — start these next

- **BRF-READ-ACTUATOR** (td-166367, 2026-10-10) — the speech actuator: **77
  calls a function that does the speech thing**, and what it does is the epic's
  to find. Three issues — bind the token, find the function, dogfood by ear. The
  definition is deliberately empty so the speech work is *pressable* before it is
  decided. · **S**
- **BRF-RENDER-DEFECTS** (td-51ea5e, 2026-10-10) — the stack map's four render
  findings: parallel-edge collapse, back-edge label collision, the LR width
  fallback, and the headless map's optimism. The okuda correction is the hazard
  rules plus a lint (report first); the two renderer defects are a **message
  across the seam** to `mermaid-to-md`. · **S**
- **BRF-AST-PROSODY** (2026-10-05) — intermediate representation for speech
  rendering. Open, awaiting the perimeter verdict and the seam decision.
  · **S**
- **BRF-STICKY-HEADING-STEPPER** (2026-10-04) — step through a document
  section by section, heading as anchor, never truncate. Open. · **S**
- **The cut cell** (BRF-TABLE-WIDTH, td-b78642) — 104 tables in the
  corpus, 106 cuts, 97 with room already on the glass; the allocator
  spends the columns wrong. Highest dogfood leverage per hour · **M**
- **BRF-PALETTE-AUDIT** (td-bb44ca, 2026-09-19) — per-role verdict at
  α = 0.2 and 1.2, the precondition; then **BRF-OKLCH-TUNING** wires the
  brightness keys to a palette that has already passed review · **M**
- **BRF-CAPABILITIES-DOC** (td-8f49bd, 2026-09-19) — `docs/capabilities.md`,
  the paid-claim inventory: what okuda can do right now, every entry
  citing its landing record. The reader asked for a changelog; this is
  the snapshot that doesn't rot · **S**
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
  Routed 2026-09-19: the `--plain` dial is the one okuda-side artifact
  of **BRF-REMOTE-SPEECH-SEAM** — build it when the verdict confirms.
  **Second consumer named 2026-10-05 (BRF-KINDLE-PORCH):** an e-ink sink
  painting with FBInk renders `\x1b[1m` as literal characters, so the panel
  wants the same "no escapes at all" dial the voice wants. Two consumers,
  one artefact — read that gate again with both in hand.
  · **S**

- **BRF-REFRESH-OFF-DISK** — real bugs in the repaint path: the resize
  race, the R placebo, and the **height-only resize** (fixed 2026-09-30 on
  `fix/resize-height`, ADR-RESIZE-GEOMETRY-046). **Corrected 2026-09-30:**
  this read *"bites on mobile SSH only"* — it bites on the desktop,
  deterministically, for a height change. Faults 1 and 2 remain · **M**
- **BRF-DOCUMENT-LINKS** — gopher links, keyspace unified and specced;
  the vector render supersedes part of it, the served-content half
  waits on a reason · **M**

## Exploration — read-and-think, no code

- **CALL Scotland — the outreach option, reserved** (2026-10-05). The
  University of Edinburgh's assistive-technology service (Books for All,
  Adapted Digital Exams, Communication Passports, Symbols for All, WordTalk,
  The Scottish Voice) — the one outside body whose remit overlaps this
  project's *purpose* rather than its mechanism. Their published stance is
  ours one layer upstream: *making the original accessible reduces the need
  to produce accessible formats*. The drafted piece is
  `docs/2026-10-06-the-shared-artifact.md` — shared cognition, the artifact
  discipline, the method stated as it is, limits first. **Reserved, not
  sent:** their public guidance is reference material now; contact is the
  operator's call, and the trigger is a re-read in a week. The two questions
  worth their time: does the unreachable-address idea help a tremor or switch
  user, and what does a shared artifact owe a partner who arrives cold? · **S**
- **BRF-REMOTE-SPEECH-SEAM** (td-9dac3b, proposal) — the verdict before
  any build: confirm okuda's duty ends at a `--plain` dial (the
  perimeter already carries the transport), or veto with the property
  that touches the byte stream · **S**
- **BRF-PAGED-OKUDAGRAM — the EC walk** — frame mode v1 shipped; the
  brief's EC1–EC9 edge cases need a validation walk against real
  documents (tall frames, blank frames, nested headers) · **S**

## Hygiene — small, owed

- **reg-sync does not propagate a brief's status** — *landed 2026-10-05*
  (see the landed list above): check mode now compares the derived
  fields, so this entry is the tombstone.
- **The brief status vocabulary is incomplete** (found 2026-10-05 by the
  new reg-sync drift check, which found it by *refusing* to guess) — ten
  briefs declare statuses the registry map does not know: `ready` (×6),
  `accepted`, `pending`, `aborted`, `rule`. They are reported loudly and
  never silently mapped to `open`, but which words the registry
  *stores* is a corpus decision, not a sync repair: settle it, then
  either widen the map or normalise the documents · **S**
- **The amp-check backlog** — *landed 2026-10-10* (see the landed list
  above): `&briefs` reconciled (46 briefs added), the coverage check now
  reads the live and archive registries, and the `&alpha` fixture wire is
  gone. This entry is the tombstone · **S**
- **BRF-SILO-MNEMONICS — close or scope** — resolution shipped, badge
  shipped, bootstrap deferred: what remains is likely a debrief and a
  close · **S**
- **The porch matrix** (BRF-PORCH-MATRIX) — not built yet: the scheme
  handlers and the per-glass verdicts. The table's newest resident · **M**

## Not next — deliberately

- **The single binary** (2026-10-05) — a vendor proposal to compile the
  helpers to Wasm and ship one artifact, answered and shelved:
  `docs/2026-10-05-the-single-binary-is-a-provisioning-question.md`.
  The measured maximum win is 60 ms on the heaviest document in the
  corpus (four mermaid fences) and 15.0 ms per fence end to end, of
  which the Rust engine is 0.5 ms — the rest is a bash wrapper. Three
  named revival triggers: a host with no provisioning path, a consumer
  wanting the engine as a library, or the per-fence number going
  material (re-run the probe in §5 if a forty-diagram document arrives).

- **BRF-FLOW-WRAP** (fresh) · **BRF-MERMAID-HARD** (waits on a
  paged-view world) · **the search-area redesign session** (td-3ac46b,
  2026-09-19 — deferred behind the rest of the action list by
  dependency: the wire fix, math glyphs, the cut cell, the palette
  audit, the capabilities doc, the seam verdict; it clears when they
  do, not by a date. GLOAM-OWNS-THE-LOOP scoping is the first agenda
  item) · **the speech set** (leaves this table —
  ADR-PERIMETER-039: the tuning loop is `../speak-md/`'s, and the ear
  owes its own corpus the auditions. **BRF-SPOKEN-BLOCK-GRAMMAR stays**,
  because ADR-037 cites it and moving it breaks the record) · **the docs
  candidates** (speech-driven design, the intention loop — landed,
  unregistered, awaiting the Derrida and Foxtrot-Oscar gates) ·
  **everything parked** (still parked).
