# keyboard controls discussion document

## on/off and modes

- **[00] switch off/exit:** easy to reach and double tap
- **[01] frame/okudagram mode:** 01 is binary ON, frame mode is the default
- **[02] sliding mode:** 02 is sliding mode, ie regular scrolling
- **[03] frozen mode:** 03 is frozen mode when you want the document to stay still
- **ESC** should be confined to moving backwards in the app and stops short of exiting the app

## other keys

- new gloam instance
- edit current document

---

## The grammar this gives us (2026-09-04, mapped to ADR-031)

The reserved block was unassigned; this draft assigns it. The two-digit
space becomes a closed keyboard language with three zones:

| Zone | Keys | Meaning |
|---|---|---|
| Verbs & modes | `00`–`10` | what the instance *does* |
| Addresses | `11`–`98` | what the instance *shows* (the silcrows) |
| Promotion | `99` | clone the rendered document to a new instance |

Every two-digit press is exactly one of the three. No mode toggles,
no modifier keys, no state beyond the render stack — the grammar is
the state machine.

## Mapping to what exists

- **[00] exit** — cheap: the cleanup path exists; `00` completes the
  buffer and calls it. Replaces `q` as the *only* exit (the doc's ESC
  rule then holds everywhere).
- **[02] sliding mode** — today's behaviour, named. No code; the
  default until [01] lands.
- **[03] frozen mode** — cheap: suppress the fs.watch/rerender path
  (`r` stays manual). For reading while an agent edits.
- **[01] frame mode — LANDED (v1, 2026-09-05)**: j/k step header to
  header (k from mid-frame snaps to the current frame's header first),
  arrows slippy within, ␣/b page within. The brief's EC1–EC9 walk
  remains the residue.
- **[10] edit** — the retired edit-dispatch idea returns as a verb:
  `$EDITOR` (or the declared agent channel) on the current document,
  in a separate terminal. File is the contract; no state.
- **99** — landed (the clone verb).
- **ESC** — currently unbound in the document view (`?` toggles hints)
  and *cancels/exits* in the picker. Re-bind per the doc: ESC unwinds
  (dereference → main; picker → shelf) and never exits.

## Sequencing proposal

1. `00` exit + ESC re-bind + ESC-never-exits (one small pass).
2. `03` frozen (one flag on the render gate).
3. `02` named default (a comment and a footer hint — the behaviour
   already exists).
4. `01` frame mode — BRF-PAGED-OKUDAGRAM implementation.
5. `10` edit — a small brief (the old edit-dispatch design, revived:
   separate terminal, file is the contract).

## Open questions

- **`00` confirmation?** Exit is destructive-ish (the instance dies)
  but nothing is lost under the no-state model — the document is on
  disk and the shelf re-derives. Proposal: no confirmation; 00 twice
  is deliberate enough.
- **Picker ESC vs `esc:cancel`** - fzf's bind currently exits the
  picker round. Re-bind: ESC clears the query (back to the shelf)
  instead; only `00` exits the loop. A grammar change in the fzf
  binds — pinned by the contract test.
- **ESC cancels partial vector** - if a user presses a single key they can escape the sequence by pressing ESC  
- **Mode is per-instance** - no global state (constitution). A new
  instance opens in the default mode; there is deliberately no
  "mode memory" across instances.
- **The footer must advertise the grammar** — the hints row carries
  the verbs, as it carries `§` and `99` today.
