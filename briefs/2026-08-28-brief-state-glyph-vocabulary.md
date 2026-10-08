---
type: Brief
callsign: BRF-STATE-GLYPH-2
---

# Brief: State-glyph vocabulary — colour + bold, the closed lexicon

**Date:** 2026-08-28
**Status:** Open (dogfood-fired; the glyphs are plain text today, colourless)
**Branch:** feat/gloam-launcher

## Context

the state glyphs (`☐ ✓ ✗ ⋮ ◆`) are in use across the showcase, the monster docs, and the lexicon — but they render as plain document-coloured text. At glyph size they're hard to scan at distance; the showcase's own claim ("each row is assessed before it is read") overstates what a colourless `✓` delivers. The dogfood finding: a traffic-lamp colour mapping (green/yellow/orange/red) + bold would give the glyphs the impact their job demands. The lexicon is the moat, but only if the glyphs *read* at a glance — otherwise they're a vocabulary list, not a moat.

## What

A **closed state-glyph vocabulary** with a fixed colour + bold mapping,
applied by the renderer to the glyphs the lexicon defines. The glyphs
are the author's semantic mark; the colour + bold is the renderer
honouring the lexicon — the same shape as `alert` (ADR-015), not an
author colourbrush.

**The vocabulary** (five glyphs, four states + priority):

| Glyph | State | Role | Colour (okuda / dracula) | Channel |
|-------|-------|------|--------------------------|---------|
| `✓` | done / shipped | `state-ok` | green | success |
| `☐` | todo / pending | `state-todo` | yellow | waiting |
| `⋮` | parked / elided | `state-parked` | orange | caution |
| `✗` | rejected / failed | `state-failed` | red | alarm |
| `◆` | load-bearing | — (heading/strong) | priority, not state | — |

`◆` stays on the heading/strong channel — it's a priority mark, not a
lifecycle state, and giving it a state colour would collapse the
priority axis into the state axis (the lexicon leak the monster docs
test for).

**Bold:** all four state glyphs render **bold** (`\x1b[1m` via
`roleBold`). Bold is the cheap second channel — costs nothing, survives
NO_COLOR (attribute, not colour), and at glyph size it's the difference
between "scan-column" and "miss-it." The scratchpad's "one glyph one
job" rule permits the second channel when it aids perception at
distance; bold+colour is exactly that.

## The justification (ADR-006 discipline)

ADR-006 point 84 (extended to chrome by ADR-015): *a future channel
needing a distinct hue must justify why every existing channel fails.*
Run the test for each state colour:

### green (`state-ok` — success)

| Candidate | Hex (okuda / dracula) | Why it fails |
| --- | --- | --- |
| `link` | `#66ddff` / `#00af5f` | navigational; "go somewhere," not "done" |
| `code-text` | `#ffcc99` / `#50fa7b` | Dracula's is green but it's the *code* channel — success-as-code collapses "the thing works" into "the thing is code" |
| `diagram-arrow` | `#ffaa00` / `#00af5f` | amber/green flow — structural, not state |

No existing role carries success semantics; the closest greens are
navigational or code. A named `state-ok` is justified.

### yellow (`state-todo` — waiting)

| Candidate | Hex (okuda / dracula) | Why it fails |
| --- | --- | --- |
| `emphasis` | `#e0b45c` / `#f1fa8c` | the *italic asides* channel — "waiting" as an aside collapses a state into a tonal note |
| `table-key` | `#e0b45c` / `#ffff87` | the amber key column — reusing it fuses the state into the table's identity column |
| `strong` | `#dfa21a` / `#ffb86c` | orange-bold — that's `state-parked`'s channel (below); yellow-as-orange collides the two waiting states |

`emphasis` is yellow-adjacent but it's the aside channel. A named
`state-todo` is justified.

### orange (`state-parked` — caution)

| Candidate | Hex (okuda / dracula) | Why it fails |
| --- | --- | --- |
| `strong` | `#dfa21a` / `#ffb86c` | the *bold emphasis* channel — parked-as-emphasis reads as "important," not "deferred" |
| `badge-bg` | `#ffaa00` / `#ff79c6` | the footer badge's own bg — fuses the state into the badge (ADR-015's "contamination") |
| `emphasis` | `#e0b45c` / `#f1fa8c` | too close to `state-todo`'s yellow at glyph size |

`strong` is the orange channel but it's emphasis. A named `state-parked`
is justified.

### red (`state-failed` — alarm)

Already justified by ADR-015 as `alert`. **`state-failed` converges with
`alert` by deliberate coincidence** — same principle as ADR-015's
alarm-universality: a red alarm reads as a red alarm on every bridge.
`state-failed` reuses `alert`'s hex (`#ff5555` in both presets); the
two names exist for clarity of intent (one is a state-glyph, one is a
chrome channel) but the bytes converge. The test asserts both.

## Scope

**New palette roles** (`src/palette.ts`, `src/palettes/okuda.json`):
`state-ok`, `state-todo`, `state-parked`, `state-failed`. Four roles;
`state-failed === alert` (same hex, two names — see Consequences).

**Hex values:**

| Role | okuda | dracula | Note |
| --- | --- | --- | --- |
| `state-ok` | `#50fa7b` | `#50fa7b` | Dracula green; okuda adopts (success-universality, like `alert`) |
| `state-todo` | `#f1fa8c` | `#f1fa8c` | Dracula yellow; the waiting channel |
| `state-parked` | `#ffb86c` | `#ffb86c` | Dracula orange; the caution channel |
| `state-failed` | `#ff5555` | `#ff5555` | = `alert` (ADR-015 convergence) |

The state colours **converge across presets** deliberately — same
principle as `alert`: a green check reads as a green check on every
bridge. The document channels (heading, strong, link) diverge by
preset identity; the state channels are preset-independent on purpose.
A future palette that wants its own traffic-lamp may override the four
roles via the user-override file.

**Render path:** the renderer recognises the closed glyph set and emits
`roleBold(stateRole, glyph)`. This is a **lexicon-applied colour**,
not an author colourbrush — the renderer colours a `✓` green because
`✓` is in the state-glyph vocabulary, not because the author can tag
arbitrary text green. An author's `**good**` stays `strong` (orange);
an author's `✓` becomes green-and-bold because the glyph *is* the
semantic mark. This keeps ADR-015's "alarm is the viewer's voice, not
the author's" intact — the state colours are the lexicon's voice,
applied to the lexicon's glyphs.

**NO_COLOR parity:** `roleBold` under `none` returns the glyph plain
(bold is an attribute; in none-mode the styler drops both colour and
attributes — verified in `ansi.ts` none-mode returns text unchanged).
The glyphs survive the loss of colour by shape alone — the same
invariant `alert` holds. The state is in the glyph; the colour + bold
is the glance, not the meaning.

## Test

The test pins the mapping as a contract (the brief's enforcement — same
status as `alert`'s byte-exact test in `tests/ansi-palette.test.ts`):

- Each state role is present in both presets with the expected hex.
- `state-failed === alert` (the convergence).
- The state roles are mutually non-confusable (distinct hexes within a
  preset) and distinct from the document channels (no collision with
  `heading`, `strong`, `emphasis`, `link`, `muted`).
- `roleBold(stateRole, glyph)` emits colour + bold in truecolor; plain
  glyph in none-mode (NO_COLOR parity).
- The state colours are preset-independent (okuda === dracula for all
  four) — the traffic-lamp-universality invariant.

## On-screen-now

`docs/state-glyphs.md` — a live exhibit that renders the full vocabulary
as a table, at a glance. The doc *is* the proof: if the glyphs don't
read at 3× distance with colour+bold, the vocabulary fails its job. The
doc's preamble names the lexicon; its body is the table; its coda is
the NO_COLOR note (render with `--no-color` and the glyphs survive by
shape).

## Risk / open questions

- **The renderer recognising glyphs.** Today the `code` handler and
  table cells emit text verbatim; colouring state glyphs means the
  render path inspects cell content for the closed set. This is a
  lexicon application, not a content rewrite — but it touches the render
  plane, so it earns careful scoping. The cleanest shape: a
  `styleStateGlyph(text)` helper that detects the closed set and emits
  `roleBold`; the table cell and list-item paths call it on the leading
  glyph. (Implementation detail; the brief sets the contract: closed
  set, lexicon-applied, not author-editable.)
- **`◆` stays uncoloured.** Priority, not state. Colouring it would
  collapse two axes; the monster docs test for exactly this leak. Resist
  the temptation to give `◆` a colour "for consistency" — consistency
  would be the leak.
- **Preset convergence.** State colours converge across presets;
  document channels diverge. This is a deliberate asymmetry (state =
  universal, document = identity), but it's a new kind of role —
  worth a line in ADR-006 or a short ADR noting the convergence
  principle extends ADR-015's `alert` precedent to the full traffic
  lamp. (Decision: extend ADR-015's principle, don't mint a new ADR —
  the precedent is already set; this is its application.)

## Related

- ADR-015 (`decisions/015-alert-palette-role.md`) — the precedent: alarm
  colours converge across presets, chrome/channel discipline, the
  non-confusability test. This brief extends the precedent to the full
  traffic-lamp vocabulary.
- ADR-006 (`decisions/006-glow-dark-palette.md`) — point 84: the
  distinct-hue justification test this brief runs for each state colour.
- Showcase (`docs/showcase.md`) — "one glyph, one job"; the glyph
  vocabulary this brief operationalises.
- `briefs/2026-08-28-brief-elision-primitive.md` — independent; the
  monster docs that exhibit these glyphs are the same docs.
- `src/ansi.ts` — `roleBold` already emits colour + bold; no new emitter.