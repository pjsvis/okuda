# Accessibility — the hit list, and what the architecture already gives

> Status: **aligned**. Human-facing explainer. The claim of this page:
> accessibility in this silo is mostly a *property of the design*, not a
> checklist bolted on afterwards — and where the checklist outruns the
> design, that is stated too. The architecture decisions read here are
> from `docs/2026-08-20-origin-doc.md`, `decisions/004-hard-wrap-
> mandate.md`, and the speech briefs.

## The principle: one ingress rule

**Any input is accepted as long as it is translated to keystrokes.**
Keyboard, voice (via OS Voice Control), switch access, sip-and-puff,
gaze-to-key adapters, a dunt on the desk, Morse over a channel — the
silo never knows and never cares. The terminal sees keystrokes; that is
the only interface. This single rule is why the accessibility list
below is short: every assistive technology that can emit keystrokes is
already integrated, by construction.

## The hit list

### Motor

- **Keyboard-only operation** — the whole silo is drivable without a
  mouse: two-digit jumps, single-letter motion, one-word search. No
  aiming, no precision, no drag targets.
- **The vector density profile is biased low.** The most likely actions
  carry the lowest numbers — 11, 12, 13 — because numbering follows
  visible order, and visible order follows likelihood. For someone
  with limited reach or fatiguing hands, the common case is always the
  shortest press, always in the same place. Motor ergonomics for free.
- **The dunt needs no precision.** A slap grades its own urgency;
  a switch, a foot pedal, or a caregiver's hand can emit one. Force is
  urgency, not accuracy.
- Mouse support exists and is optional — never required.

### Vision

Terminology first, because it matters to the readers of this page: the
accepted terms are **blind and low-vision readers** (identity-first,
the blind community's own preference), **vision impairment** in medical
and statistical registers, and — most useful in engineering —
*functional* names: **screen reader users, magnification users,
braille readers, keyboard-only users**. Name the technology or the
need, not the deficit; and note the social model underneath: the
glass was the barrier, and the design removes it.

- **Brightness is a knob, not a compromise.** The palette scales its
  lightness on demand (keys, CLI, per-pane) — low vision, glare,
  fatigue, and dark rooms are all the same dial.
- **The host's zoom is honoured.** Terminal zoom changes the cell
  metrics; okuda detects it and re-renders the composition to the new
  glass. No pixel loss, no stale layout.
- **Screen readers get clean text.** The pipe mode emits the document
  with escapes strippable to plain UTF-8 — the same content, in the
  order a reader needs. Links expose real URLs through the terminal's
  own hyperlink channel.
- **Colour never carries meaning alone.** Every state flag has a glyph
  *and* a word (`☐ to do · ✓ done · ✗ rejected · ⋮ parked`), and the
  key is printed in the document it decorates.
- **No horizontal scrolling.** The renderer owns wrapping; wide content
  is trimmed neatly rather than pushed off-screen. What fits is what
  you read.

### Hearing

- **Everything is text-first** — the primary channel is visual and
  typed. Deaf and hard-of-hearing users lose nothing, because nothing
  essential was ever audio-only.
- The TTS egress (the `s` key, the voice-rendering template) is an
  *addition*, not a dependency — and its script is plain text with
  pause directives, readable before it is spoken.

### Speech

- Voice ingress is optional and phrase-based; the grammar never assumes
  speech. Every voice command has a keystroke equivalent, and every
  keystroke path works in silence.

### Cognitive

- **The vocabulary fits on one screen** — and is documented in the
  reading path. Bounded grammar, bounded keyspace (11–99), bounded
  states. The same restriction that makes ASCII diagrams deterministic
  makes the interface learnable in an afternoon.
- **No hidden state.** The three breadcrumbs (query, backstack,
  document) are inspectable at any moment; the reader can always ask
  *why am I here* and get an answer from the screen.
- **The format itself is accessible.** Plain markdown on disk: the
  corpus is readable with any editor, any device, any decade — no
  proprietary format to outlive.

### Language direction

Content is plain UTF-8, and the width primitives are grapheme-correct —
right-to-left scripts (Arabic, Hebrew) flow through the same pipeline
as left-to-right, shaped by the terminal's own font and bidi engine.
The honest bound: terminal *layout* remains left-anchored everywhere —
a limit of the medium, shared by every terminal application, not a
choice of this one. Content renders; the frame is what it is.

## The remote dunt — accessibility over the channel

The dunt generalises from a knock to a **message**. One gloam instance
connects to another and *sends a dunt over the channel* — a signal that
says "open your listening gate, Morse input follows." This is the
accessibility bridge:

- **Switch access**: a single-switch user emits dunts; the Morse
  decoder turns rhythm into navigation. One switch, one skill, the
  whole silo.
- **Carers and assistants**: a helper on a remote machine dunts the
  user's gloam and drives the session with them — the attention signal
  travels over the same SSH channel as everything else.
- **Adaptive hardware**: sip-puff, gaze trackers, head pointers — any
  device that can emit a pulse or a keystroke is already inside the
  one-ingress rule.

The remote dunt is the script-writer scenario from the production
brief, taken seriously: the same signal, the same decoder, the same
chain — `[DUNT] → [Lead-In] → [Coordinate] → [Actuation]` — now serving
the user who cannot knock on the desk themselves.

## The honest bounds

- TTS egress is per-section, not whole-document streaming.
- Screen-reader integration is *compatible* (plain text, real URLs),
  not yet *deep* (no structured roles beyond what the terminal offers).
- Terminal bidi layout is left-anchored medium-wide; content flows,
  frames don't mirror.
- The Morse decoder, the remote dunt, and the voice phrases are ruled
  and routed — they wait on their named consumers, like everything in
  the blue-sky pile.

## Related

- `briefs/2026-08-29-brief-terminal-speech.md` — the egress template and
  the dunt
- `docs/2026-08-30-voice-actuator-testing.md` — the M4 ingress pipeline
- `docs/2026-08-30-search-conventions.md` — the two keymaps and the
  three breadcrumbs
- `explainers/concepts-and-terms.md` — the vocabulary, in the same
  register as this page
