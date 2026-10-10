---
type: Playbook
callsign: PLY-EAR
---

# Ear Playbook — getting a document spoken

## What this is

How a document in this silo reaches a voice. Three stages, three owners:

| Stage | Owner | Artefact |
|---|---|---|
| Render | okuda | coloured bytes for the glass |
| Flatten | `speak-md` (a separate silo) | prose plus breath markers |
| Speak | the environment (`say`) | sound |

**okuda emits text and stops.** There is no speech code in this repo (ADR-036) —
no voice name, no rate, no pause constant, no prosody parameter. The seam, when it
lands, maps `class → (text, patience)` and nothing more (ADR-033). The voice and
the pause are not ours to tune.

## The pipeline

```bash
just recite <file>              # the prosody render: speak-md --dry | say — Moira's cue card
just tts <file>                 # render --no-color | tee /dev/tty | say (see-and-hear)
just tts-rate <file> <rate>     # the same, at a given rate
just moira-*                    # the audition recipes (probe, drill, recital, …)
speak-md --dry <file>           # flatten and print, speak nothing
```

`--dry` is the workhorse: it is the only way to read what the voice *will* receive
without spending the time to hear it.

## Two flattening paths, and they disagree

`speak-md --dry` and `speak-md probe` are **different code paths**. `--dry` emits
per-line `[[slnc]]`, strips emphasis, and drops a bare `*` scene break. `probe`
numbers list items, keeps `\*` literally, and does **not** strip emphasis. Never
assume one tells you about the other. The silcrow numbering (`silcrow one one` …)
is the comparison key across voices.

## The rewrite rules — shapes, not intent

`speak-md` rewrites the text through a numbered rule list before `say` sees it.
The rules fire on *shapes*, so an invented token reaches the voice unrewritten:

- **Rule 4 — `BRF-*`, and standalone `BRF`.** `BRF-AUDIO-DISCOVERY` → "brief audio
  discovery". This rule exists for `BRF` only.
- **Rule 5 — an ALL-CAPS word of 2–5 letters.** `ADR` → `A D R`. It skips hyphen
  compounds, so `DBF-*`, `ADR-*`, `ADV-*` and `PLY-*` reach the voice as raw
  ALL-CAPS tokens — neither expanded nor letter-split.
- **Rule 6 — `YYYY-MM-DD`.** `2026-09-13` → "the thirteenth of September". The
  current year goes unspoken — deliberate: speech is ephemeral, so the ear is
  assumed to know the year. A past year keeps its own.

Three traps follow, all verified:

- **A date-prefixed stem glues.** Rule 6 rewrites the date in place and leaves the
  hyphen: `2026-08-30-gloam-seams` → "the thirtieth of August-gloam-seams". **Emit
  fields comma-separated, never hyphen-joined.**
- **An invented abbreviation is not a shortcut.** `13Sep` passes through untouched;
  only the ISO shape triggers rule 6, so "shortening" a date bypasses the rule that
  would have spoken it properly.
- **A one-off respelling is earned, not invented.** `speak-md learn` adds to
  `lexicon.json`; entries are earned by hearing a mangle, never guessed.

**Test the composed line, not the fields.** The question is never "is this field
right" but "what does the whole line become after the rules".

## Strip the escapes before you judge

`okuda --no-color` does **not** mean "no escapes". `roleBold` emits `\x1b[1m` in
`none` mode deliberately (`src/ansi.ts:100-104` — *"NO_COLOR strips colour, not
attributes"*), and `speak-md` passes it through byte-for-byte. **`say` speaks it.**

Measured on a real document: 65 escape sequences cost **34.5 s of dead air** in a
13-minute read (822.3 s against 787.8 s with them stripped) — about 0.53 s per
sequence. Three consequences:

- **Strip before measuring or listening**, or you are auditioning the residue.
- **A leading escape silences the line.** `\x1b[1mvector` → 0.0116 s against
  0.545 s for `vector`. `speak-md` strips leading indentation, which promotes an
  escape to position 0 — so an indented bold block is the configuration that goes
  silent.
- **The count is width-dependent** (86 sequences at 40 columns, 65 at 80, ~55 at
  120+), because a wrapped continuation row re-applies bold.

## The voice reads at 80 columns

`terminalSize()` returns `null` for a non-TTY (`src/width.ts:286`), so the piped
voice path falls back to `terminalCols(80)`. The rendered bytes are **byte-identical
to an 80-column render** whatever the reader's window is.

This matters because a table is layout, computed *for* the glass: below its natural
width the cells wrap mid-word, and **`say` treats a line break as a word boundary**
(`vec\ntor` = `vec tor`, not `vector`). A table that needs more than 80 columns is
therefore broken for the ear always — silently, with no elision notice. Full
guidance: `playbooks/authoring-playbook.md`.

## The specimen tier

A copyrighted passage **never enters the tree**. `tmp/` is gitignored
(`.gitignore:25`) — that is the whole reason the scratch tier is safe. *Titus
Groan* cannot graduate to `docs/` (Peake died 1968).

**Normalise display conventions before flattening.** A specimen carries
house-conventions the voice reads literally: title-case caps headings, use `---`
for scene breaks (`*` and `\*` leak into the stream, and no spelling makes a break
*audible* — all reduce to the 900 ms paragraph gap), and remember that all-caps
words of ≤5 letters are spelled out (`OF` → `O F`), with no word check — right for
acronyms, wrong for words.

## The probe is a finder, not the judge

A probe reports a **ceiling** — where the voice breaks, with hazards back to back
and no recovery. A recital reports a **floor** — whether the voice wears over an
hour, at which point idiosyncrasies stop being events and become texture.

**The long listen wins.** So "interesting" is evidence *against* a cast candidate:
a speaker for okuda must be legible enough to dismiss and dull enough to forget.

**A census cannot detect a voice.** The roof sequence in *Titus Groan* (ch 17–21)
is 7,410 words, 78 paragraphs, **zero** opening with a quotation mark — and ch 20
still holds a poet speaking eight unquoted stanzas. Count nothing; read it.

## The cast

**Moira narrates the document; Moir speaks for okuda** (`&ear.md`) — a *different
speaker*, not a lower Moira. Pitch is the non-portable axis (ADR-033) **and** it
collides with the document's own voices. Reservation: **Moir is never a character
in the document** — a rule not enforceable by voice name.

Casting is the consequence of ADR-033, not a violation of it.

## Related

- `decisions/032-repeated-digit-actuators.md` — *doubled = the system talks, mixed =
  the document moves*
- `decisions/033-punctuation-over-speech-tags.md` — the voice and the pause are not
  ours to tune
- `decisions/036-no-speech-code.md` — no speech code in this repo
- `briefs/2026-09-13-brief-audio-discovery.md` — the cue seam (Open; no seam in
  `src/` yet)
- `briefs/2026-09-14-brief-search-surface.md` — the glass as a voice control surface
- `explainers/accessibility.md` — the ladder and the first law of time
- `&ear.md` — the ear queue
- External: `~/Dev/GitHub/speak-md` (the flattener; its `breaths.json` and
  `lexicon.json` are the silo's tuning state)
