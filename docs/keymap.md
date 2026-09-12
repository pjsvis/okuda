# The keymap — the whole keyboard, one reference

The canonical human reference for every key the control plane
listens to. The territory is code: the numbered actuators live in
`src/keygrammar.ts` (bindings as data) and `src/vectors.ts` (the
address space); the motions live in `src/tui.ts` (`decodeKey`). This
page is the map — and it is *refereed*:
`tests/keymap-doc.test.ts` asserts every binding row and every
pocket row against the code, in both directions. A binding that
moves without its row here is a red test, not a stale page.

The other surfaces, by role: the footer hints are the in-app
compression; `&alpha.md` is the orientation prose; this page is the
reference. One concept, one structure per surface.

## The two-digit grammar — the numbered actuators

The surface is 00–99, partitioned by actuator type — one shape rule,
zero exceptions (ADR-032): doubled pairs, the system talks; mixed
digits, the document moves. Two digits complete a token; there is no
timeout, and any non-digit cancels a pending token (the buffer is a
low-pass filter over actuator noise — see
`docs/keyboard-dogfood.md`).

Three kinds of numbered keys, told apart by who owns them. Verbs
and modes are the machine's — bound in the grammar, the same in
every document, forever. The vectors are the document's — derived
from its references at render time, different in every document.
The pockets are the future's — reserved by key shape, silent until
bound.

### Bound verbs and modes

The command set: what the instance DOES. A verb acts once — exit,
edit, clone; one keystroke, one effect, done. A mode changes the
meaning of the keys that follow — frame, slide, and freeze re-map
the stride of j/k and space/b. That is the whole difference between
the two words in this heading.

| Token | Verb | Actuation |
| ----- | ---- | --------- |
| **01** | frame | frame mode — j/k and space/b step one glass page |
| **02** | slide | sliding mode — the continuous surface, the default |
| **03** | freeze | the document stays still; r re-renders on demand |
| **09** | editNew | a blank note in the editor, a second terminal |
| **10** | edit | edit the current document — not wired yet, flashes honestly |
| **99** | clone | this document becomes main of a new instance, via the host |
| **00** | exit | quit the control plane — the screen releases — the last press |

### The reserved pockets

The same zones, held unbound. Two pockets by key shape: 04–08, the
single-key verbs; 11 and 22–88, the doubled pairs — the lowest-effort
inputs on the number row, reserved precisely because they are easy
(ADR-032). A doubled pair is never an address; a mixed-digit pair is
never a verb.

| Token | State | Note |
| ----- | ----- | ---- |
| **04** | reserved | unassigned single-key verb |
| **05** | reserved | unassigned single-key verb |
| **06** | reserved | unassigned single-key verb |
| **07** | reserved | unassigned single-key verb |
| **08** | reserved | unassigned single-key verb |
| **11** | reserved | doubled pair — the actuator pocket, never a jump |
| **22** | reserved | doubled pair — the actuator pocket, never a jump |
| **33** | reserved | doubled pair — the actuator pocket, never a jump |
| **44** | reserved | doubled pair — the actuator pocket, never a jump |
| **55** | reserved | doubled pair — the actuator pocket, never a jump |
| **66** | reserved | doubled pair — the actuator pocket, never a jump |
| **77** | reserved | doubled pair — the actuator pocket, never a jump |
| **88** | reserved | doubled pair — the actuator pocket, never a jump |

Reserved means the press is acknowledged and does nothing —
reserved, not missing.

### The vectors

What the instance SHOWS — the only numbered keys that belong to the
document rather than the grammar.

Mixed digits 12–98 are the jump vectors — 80 addresses, silcrow 12
always first, the numbers dynamic and never authored. The paint
badge beside each reference states the number; the jump renders the
target clean and `u` unwinds. A dead reference fails honestly:
`§NN — no document to render`. The silcrow itself is explained in
`docs/2026-09-04-the-silcrow.md`.

## The motions — single keys

Mirrored by hand from `decodeKey` (`src/tui.ts`), unrefereed: the
motions are mode dispatch, stable, and not assignments under
discussion. They differ from the numbered keys in kind, not just
count — no buffer, no token; one key, one stride. The stride
belongs to the mode, not the key: j/k steps a line in slide mode,
a page in frame mode. That is what makes frame and slide modes
rather than verbs — they add no actions, they change what the
motion keys mean.

| Key | Motion |
| --- | ----- |
| j / k | down / up — the step |
| space / b | page down / up — the less convention |
| Ctrl-D / Ctrl-U | half page down / up — the vim convention |
| ↑ / ↓ | line down / up — slippy within, in every mode |
| PgDn / PgUp | page down / up |
| } / { | paragraph down / up — the VI stride |
| ]] / [[ | frame down / up — the declared header-to-header jump |
| g / G | top / bottom |
| r | reload — re-render from source, re-anchored |
| u | back — pop the backstack (Backspace too) |
| q | quit — also Ctrl-C |
| ? | toggle the verbose hints row |
| ESC | cancel a pending token |

## The pocket ledger — where assignments are discussed

Candidates for the pockets, with their sources. Binding is a one-line
edit in the `KEYBINDINGS` table; a candidate graduates by being
wired, not by being agreed:

- **audio toggle** — from the TTS dogfood
  (briefs/2026-09-06-brief-tts-dogfood.md); natural for a doubled
  pair. Its own voice-binding questions are td-b4bae8's.
- **clutter-strip** — same brief; a render-mode variant, likely a
  single-key verb.
- **brightness** — the luminance scalar, sequenced behind
  state-glyph tuning (td-b4bae8); binding arrives with the feature.
- **speak** — resisted as a test instrument (ADR-035); if it ever
  exists it is a bound actuator, never an ambient hook.

## Binding discipline

- **To bind** an unassigned token: one line in `src/keygrammar.ts`,
  move the row from pocket to bound here, `just test` referees. No
  ADR — binding is data.
- **To recycle** a reserved token back into the address pool: an
  ADR. ADR-032's discipline, non-negotiable — per-document recycling
  is ambiguity, and ambiguity is entropy.
- **To change a zone or the canon**: an ADR. The shape rule is the
  grammar's constitution (ADR-032, amended).

## Related

- ADR-031 — the main document; 00-10 verbs, 99 clone, the vectors
- ADR-032 — the doubled-pair canon; the pockets and their discipline
- ADR-021 — the numbering offset and its amendment history
- ADR-035 — why this page has no spoken shadow
- `docs/keyboard-dogfood.md` — the instrument that confirms these
  actuations, live
- `docs/2026-08-31-actuator-inputs.md` — the buffer state machine
- `docs/2026-09-04-the-silcrow.md` — the address, explained
