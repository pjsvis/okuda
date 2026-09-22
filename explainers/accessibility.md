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
  carry the lowest numbers — 12, 13, 14 — because numbering follows
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
  reading path. Bounded grammar, bounded keyspace (12–98), bounded
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

## Losing your place is a barrier too

The one perceptual deficit this silo takes seriously is **a low
tolerance for shite**. Prevalence: universal. Onset: the first time a
window was resized and your paragraph vanished. Prognosis without
treatment: the reader re-scans the whole page to find where they were —
the most expensive act in reading, and the one that fatigues low-vision
and magnification users first, screen reader users worst of all, and
everyone else silently.

The accommodation on record — the only one known to work by *removing
the cause* rather than advising patience: **the anchor**. Resize, zoom,
reload, return from a followed link, and the eye-proxy re-matches the
line nearest where you were and re-anchors the composition to it
(`reanchoredScroll`; see `docs/2026-08-31-the-same-okudagram.md`). You
get back the same okudagram, at the same place in the meaning, whatever
shape the container is now.

Accommodating everyone's tolerance deficit simultaneously is only
possible because the deficit is the same in everyone: nobody can
tolerate shite. The design does not ask for patience. It removes the
shite.

## Time — the first law of temporal accessibility

**Time belongs to the reader. The system never spends it, and never
takes it back.**

- **Acquisition has no deadline.** The repo waits: clone today, pull
  next month, catch up next year — the ledger preserves everything, the
  states vocabulary holds documents *fresh* until a human reconciles
  them at their own pace, and no update expires while unread.
- **Inspection has no timeout.** No idle disconnect, no forced page
  turn, no animation to chase, no "are you still there?". The anchor
  holds the reading position *indefinitely* — tied-to-the-mast is a
  time-independent affordance. The reseeded query waits as long as the
  reader does. The backstack dies only when the process does — the one
  designed expiry, on the reader's terms.
- **As few keystrokes as required.** The two-digit grammar puts every
  action two presses away, and the density profile keeps the common
  case shortest. No timed sequences, no hold-and-wait, no
  press-before-the-bar-runs-out.

The honest exception: the two-digit jump buffer has timing — the
spaced double-tap protocol (ADR-021). One timed affordance in the whole
system, designed to be forgiving (visible buffer, cancelled by any
non-digit, no penalty), because two digits must resolve. It is the
exception that proves the law: the timing exists *for* the reader's
fingers, not against their patience.

Contrast with the pattern this law refuses: the session timeout, the
expiring link, the auto-advancing carousel — each one a system spending
the user's time without permission. WCAG's timing guidelines (2.2.1,
2.2.6) ask systems to make timers adjustable; this silo satisfies them
by architecture: **there are no timers to adjust.** Time is the one
dimension the silo does not gate — and the first law says it never
will.

## Braille — the display, the embosser, and the chorded keyboard

Braille is not a font — it is a **character encoding**: Unicode block
U+2800–U+28FF, 256 cells, six dots each (eight in computer braille).
Everything else is a rendering of that encoding, and there are three:

- **Refreshable braille displays** — the primary reading device, and
  the one that matters here: a row of 14–80 cells with pins that pop up
  and down electromechanically, re-rendering *dynamically* as the user
  navigates. A braille display is literally a narrow terminal with
  haptic output — 40 cells is a 40-column glass. The translator that
  feeds them is `liblouis` (used by NVDA, JAWS, Orca, macOS), and
  modern displays connect over a standard USB HID braille protocol —
  no vendor driver needed.
- **Embossers** — the printing process: impact pins embossing paper,
  double-sided, fed by the same translation. This is the `lp` path,
  one layer deeper.
- **Simulated braille fonts** — the visual rendering of cells, used
  for signage, education, and embossing masters. Sighted readers use
  these; blind readers use the first two.

**And yes — braille talks back.** Input is a Perkins-style six-key
keyboard: the six dots as keys, pressed in chords — a 6-bit chording
keyboard with 64 combinations, enough for the alphabet and control.
Braille notetakers ship one; iOS does braille *screen* input (draw the
dots on the glass). Under the one-ingress rule, a Perkins keyboard is
already inside the silo: it emits keystrokes.

Two silo connections worth savouring. First: **a 40-cell display is
the ultimate narrow glass** — the elision primitive, the role-fit
tables, and the one-line action blocks exist precisely for a reader
whose terminal is 40 cells wide and never wider. Second: **braille and
the dunt-stream are the same encoding in different dimensions** —
braille is a 6-bit cell in *space*; dunts with spacing are a cell in
*time*. The tactile and acoustic registers are isomorphic, and a dunt
decoder that grouped dunts into cells would be reading braille by ear.

## Paper — the last resort, and the oldest universal medium

At the very end of the ladder: **the content pipes to paper.**

```bash
okuda docs/x.md | lp
```

Pipe mode's output strips to plain text (the NO_COLOR parity), and
plain text is what every printer has spoken since the beginning. Paper
is the terminal that never changes: no power, no device, no dependency
— the original universal medium, older than the screen by four
thousand years. It is also an accessibility channel in its own right:
**braille embossers accept plain text**; large print is a font size
away; and paper never scrolls away, never times out, and never needs
charging — the final honouring of the first law, in ink.

The one degradation, honestly: colour is lost, and ASCII diagrams
become fixed-width characters — the art survives, the glow doesn't.
The composition was never the point; the content was. Paper proves it:
strip the glass entirely and the silo still delivers.

The ladder, complete: screen → TTS → braille → paper. Each layer
simpler than the last, each one still the whole corpus. Accessibility
is not a mode the system enters — it is the property that the *last*
resort is as complete as the first.

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
