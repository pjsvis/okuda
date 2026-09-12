# Keyboard dogfood — the numbered actuators, live

Open with `just keyboard-dogfood`, then press each token in order and
confirm the actuation type. The grammar has three zones and one rule,
zero exceptions (ADR-032): doubled pairs — the system talks; mixed
digits — the document moves.

Toggle `?` first so the hints row is showing. Every observation below
is a flash on that row, a change of mode, or a deliberate silence. A
mismatch is a finding — the dogfood is the instrument.

## The buffer is a low-pass filter

- **Two different keys.** No address can be typed with one key twice:
  the doubled pairs are actuators, never silcrows. A repeated-key
  spasm lands in the reserved pocket, which is silent.

- **No timeout.** Type the first digit, then take as long as you
  like — an hour if the train is rough. The buffer waits; nothing
  actuates until the second digit or a cancel. There is no clock
  anywhere in the machine.

- **Cancel is anything.** ESC deliberately; any motion key
  accidentally. A stray keystroke between the digits cancels the
  token rather than corrupting it.

- **The one leak.** A bump on a number key while a digit is pending
  completes a token. The cost is a wrong jump, and `u` unwinds it —
  noise degrades to silence or a reversible detour, never a
  persistent wrong actuation.

Try it: type 1, wait, press ESC. Nothing happened — that is the
filter working.

## Zone 1 — verbs and modes

| Token | Expected actuation |
| ----- | ------------------ |
| **02** | flash: sliding mode — the default; this confirms the floor |
| **01** | flash: frame mode — j/k now steps a page, not a line |
| **02** | again: the mode verb repeats — back to sliding, freeze lifted |
| **03** | flash: frozen — the document stays still until r or 02 |
| **10** | flash: edit current — the honest not-wired-yet flash |

## Zone 2 — the reserved pockets

Press 11, 22, 33, 44, 55, 66, 77, 88 — then 04, 05, 06, 07, 08.

Expected: nothing at all. No flash, no scroll, no jump. The press is
acknowledged and does nothing — reserved, not missing. If any doubled
pair jumps a document, the canon is broken: one actuator class,
never vectors.

## Zone 3 — the vectors

This document's own references are the test bench. The paint states
each number: §12 beside the ADR-032 citation above, §13 beside the
ADR-031 citation here, §14 beside the dead link below. Confirm the
paint agrees before pressing — a badge that disagrees with this
sentence means something has drifted, and that is a finding too.

| Token | Expected actuation |
| ----- | ------------------ |
| **12** | ADR-032 renders clean — the footer names the file, the paint is gone; u returns here, annotated again |
| **13** | ADR-031 renders clean, the same shape |
| **14** | the honest failure — [the dead link](docs/no-such-document.md) flashes `§14 — no document to render` and you stay put |

## The verbs with side effects

Optional — both spend something outside the reader.

- **09** edit-new: a blank note spawns in your editor, in a second
  terminal; the flash confirms the filename. Delete the note if you
  don't want it.

- **99** clone: inside tmux, a new window opens with this document
  as its main. Outside tmux, the honest flash: no clone host.

## The last press

**00** — exit. The screen releases; the shell returns. The dogfood
ends itself: the one actuation you cannot confirm from inside, so
it goes last.
