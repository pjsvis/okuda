---
type: Brief
callsign: BRF-WORKING-COPY
---

# Brief: The working copy — vector render mode, 99 clone, honest actuator

**Date:** 2026-09-04
**Status:** Open

## Context

ADR-031 is the decision; this brief is the build. The model: the main document renders with its references annotated as optimistic vectors `[12]–[98]`; actuating one renders the target clean in the same instance; `u` unwinds; `99` clones the current render into a new terminal via the host, where it becomes main — annotated. The jump map is in-memory, derived from the main source per render; the paint is illustrative; the source is never mutated; legacy wiring (`okuda-rhs`, authored numbering) is retired, not honored.

## What

1. **Reference discovery — `discoverReferences(source: string): Ref[]`.**
   Scan the main document's source in reading order; return the
   reference-shaped targets, capped at 88:
   - callsign-shaped tokens (`CALLSIGN_SHAPE`, moved to a shared module)
   - markdown inline links to local `.md` paths — `[text](target.md)`
   - **never**: zero-padded or single-digit bracketed numbers (`[07]`
     is text, always); `okuda-rhs` tokens (retired, ignored); anything
     a user authored as a bracketed number.
2. **The map — `buildJumpMap(refs): Map<number, string>`.** 12–98 in
   reading order. In-memory, per render, rebuilt on `r` reload.
   Deterministic per (document, content).
3. **The paint.** The main document's render projects the map: the
   reserved vector paint after each reference — dedicated palette slot
   (new entry, e.g. `vector`, in `okuda.json`/palette loading; the
   markdown grammar cannot address it), two digits always. Dereferenced
   targets render clean: annotation runs only for the main document.
4. **Clean render below main.** When the rendered document is not the
   main one, skip discovery/paint. The instance knows its main
   document; everything dereferenced renders as territory.
5. **The actuator.** `NN` looks up the map → target string → resolve
   (file exists / callsign through the registry) → render in place,
   clean, pushing the previous render for `u` to unwind. Resolution
   failure → **footer flash**: `[14] — no document to render`. The
   wording belongs to the vector, not the vocabulary: the user actuated
   a painted vector and there is nothing there — the flash never says
   "unknown callsign" (that is the shaped-arg dispatch's error, a
   different surface). Uniform regardless of why the target is absent:
   the vector was optimistic; the document does not exist; stay put.
   The old `%%okuda-rhs%%` extraction and `[NN](path)`-token wiring
   retire (tests updated or deleted).
6. **The clone verb — `99`.** Spin up another terminal running
   `gloam <current-doc>`. The integration is DECLARED via
   `OKUDA_CLONE` — a restricted grammar, closed set: `terminal`
   (macOS Terminal via osascript; the default), `tmux` (new window in
   the current session — a guest capability, not a runtime dep),
   `cmd` (`OKUDA_CLONE_CMD`, $1 = the doc), `herdr` (specced, not
   built). Default: `terminal`, or `tmux` when already inside tmux.
   Unknown integrations and missing configuration refuse with the
   known set named. The clone renders the same file as main →
   annotated by rule 3.
7. **The hints.** Footer becomes:
   `q quit · NN deref · 99 clone · u unwind · /search? · r reload` —
   final wording at implementation.

## Preconditions

- [ ] ADR-031 accepted (it is — this brief implements it).
- [ ] `just check` green before starting.

## Work plan

1. [ ] Move `CALLSIGN_SHAPE` to a shared module; write
       `discoverReferences` + `buildJumpMap` (pure; unit-tested).
2. [ ] Reserve the palette slot (`vector`); thread it through the
       paint; verify it is unreachable from markdown.
3. [ ] Main-render annotation pass; clean render for dereferenced
       targets; the depth-one render stack with `u`.
4. [ ] Actuator with footer flash; retire `okuda-rhs` extraction and
       authored-numbering tests.
5. [ ] The 99 clone verb + host contract (tmux first; env fallback).
6. [ ] `docs/help.md` — the main/referenced vocabulary and the three
       verbs (search dereferences too; ADR-030 composes).
7. [ ] `just check` green; dogfood on this corpus (the brief's own
       Related section is the first test case).

## Non-goals

- **No back-stack beyond depth one.** `u` unwinds the single
  dereference; there is no history. Re-land instead.
- **No registry validation at render time.** Optimistic means
  optimistic; the actuator is the only validator.
- **No editor.** The document is never mutated by the vector system —
  the map is in-memory and the paint is illustrative, full stop.
- **No scheme/ssh work** — that is BRF-PORCH-MATRIX's lane.

## Acceptance

- Viewing any silo document: its callsigns and local `.md` links carry
  amber two-digit vectors `[12]…`, in reading order, deterministic
  across reloads.
- Actuating a vector renders the target clean; `u` returns to the
  annotated main; the map re-derives correctly after `u` and after
  `r` reload.
- A document containing `[07]`, `[14]`-as-user-text, or `okuda-rhs`
  tokens shows text — never legacy wiring, never user-number vectors.
- A vector whose target doesn't exist paints anyway; actuating it
  flashes the honest error and stays put.
- `99` inside tmux opens a new window with the current document as
  main (annotated); `99` outside tmux flashes the honest host message.
- A document with >88 references renders the first 88 as vectors and
  the rest as text.
- `just check` green; the retired-wiring tests are gone, the new ones
  pin discovery, map, paint, actuator, clone.

## Open questions

- **Search's place in the footer** — ADR-030's live search is invoked
  by leaving to the picker (Esc) today; whether a same-instance search
  overlay belongs here is a separate negotiation (it touches the
  in-document-search deferral in BRF-CONTENT-SHORTLIST).
- **Blink/phone clone story** — the host contract on non-tmux glasses
  may be scheme-based (BRF-PORCH-MATRIX); deferred to that brief.

## Sequencing

Small, standalone, high-value: it touches the render path and the TUI
keymap, not the launcher or the wire. Lands independently of
BRF-PORCH-MATRIX (which lands after — its deep links target documents
that this brief makes properly navigable).

## Related

- ADR-031 — the decision; this brief is the build
- ADR-022 — reversed (palimpsest there); `okuda-rhs` grammar retires
- ADR-030 — search dereferences; 99 promotes; the two compose
- ADR-028 — the wire: annotations add bytes to the main render; the
  reserved paint and two-digit badges are the budget conversation
- BRF-PORCH-MATRIX — the scheme matrix this unblocks
