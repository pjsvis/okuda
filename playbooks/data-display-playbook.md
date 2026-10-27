---
type: Playbook
callsign: PLY-DATA-DISPLAY
---

# The Data Display Playbook

Dense telemetry in text: bars, sparklines, textures, status marks. Written after
`BRF-ARTPACK-AESTHETICS` and `BRF-DENSE-DYNAMIC` were extracted and archived — two
draft briefs, 71 lines between them, proposing roughly the same thing in different
vocabulary. What follows is the part of them that is true of this silo, and the part
that was already built while they sat open.

## When to use this

When something needs to *show a quantity* in a terminal: a magnitude, a trend, a
proportion, a texture, a state. Not when something needs to show text — prose is
prose, and this playbook is about the other thing.

## The rules, each with its reason

1. **Dark only, and say so.** There is no light theme and no OS-theme detection.
   `PRESETS` carries `okuda` and `dracula` (`src/palette.ts:137-140`) and both are
   dark by construction. A second polarity doubles every colour decision to serve a
   case the product does not have; if that changes, it is an ADR, not a setting.

2. **Colour degrades to plain text, not to mud.** `NO_COLOR` (any value) or
   `TERM=dumb` yields no SGR at all (`src/ansi.ts:54-55`), and a pipe is a
   first-class reader. The floor is *7-bit ASCII that parses*: gauges become
   `[###---]`, sparklines become comma-separated values, dithering collapses to
   spaces. A pipe is a machine, and a machine reading escape soup is a failure the
   human never sees.

3. **Every glyph is one column, and that is a contract, not a hope.** Eighth-blocks
   (`U+2580–U+259F`) and every Braille pattern (`U+2800–U+28FF`) measure one column,
   asserted in `tests/width.test.ts:213-247` — a band, not a spot-check, because
   *a bar that measures two columns silently shears every row it appears in*. That
   test exists for a party outside this silo: a generator that emits these strings
   cannot see our measurer, so the measurer must publish its arithmetic. (This is how
   the regional-indicator bug was found: the table is a hand-maintained subset, and a
   missing range measures 1 column instead of 2.)

4. **Resolution is bought with geometry, not with glyphs the font might not have.**
   Sub-cell precision comes from quadrant blocks (`U+2596–U+259F`), eighth-blocks and
   Braille matrices — all inside the BMP, all in the fonts that matter. No Nerd Font
   requirement, no font-installed icon set, no private-use area. The renderer cannot
   see the reader's font (see `docs/style-guide.md`, *the font is the one input the
   renderer cannot see*), so anything that needs a specific font is not a primitive —
   it is a dependency on someone else's install.

5. **One frame, one write.** A dense display repaints more often than a document, so
   atomicity matters more: `SYNC_BEGIN`/`SYNC_END` bracket every paint
   (`src/tui.ts:375-376`, DECSET 2026). Without the bracket, a dense frame tears, and
   a torn bar chart reads as a *value*, not as a glitch.

6. **No pixel protocols.** No Sixel, no Kitty image protocol, no inline images, no
   server-side rasterisation. Text is the medium; a protocol that smuggles a raster
   through it is a different product with a different failure surface (and a
   different emulator compatibility matrix).

7. **Status marks are semantic, then dyed.** `✓ ☐ ⸮ ✗` (`src/render.ts:123-126`),
   one cell each, colour carried by the role and never by the glyph alone — so a
   glyph that fails to render as a box still reports its state through colour. That
   redundancy is the whole reason a sparse glyph like `⸮` is permitted
   (`BRF-IRONY-MARK` explains the width, mirroring and colour checks).

8. **A new glyph enters through the width table.** Add the codepoint's range to
   `src/width.ts`, then pin it beside the telemetry bands. A glyph whose width is
   assumed rather than measured is a column shift waiting for a release.

## The failure this playbook names

**Assuming fidelity you have not measured.** A dense display looks correct on the
author's terminal and shears on the reader's: one glyph measuring two columns, one
font substituting a wider face, one emulator ignoring a sync bracket. All three are
invisible locally and obvious remotely, and all three are caught by an assertion
rather than by an eye — which is why the rules above are tests wherever a test is
possible, and prohibitions wherever it is not.

## Prior art

- `BRF-ARTPACK-AESTHETICS`, `BRF-DENSE-DYNAMIC` — the two briefs this replaces, both
  in `.archive/briefs/` and replunderable
- `tests/width.test.ts:213` — the telemetry glyph bands, and the out-of-silo consumer
  they were pinned for
- `ADR-WIRE-BUDGET-028` — one frame, one write
- `docs/style-guide.md` — the font rule, and *labels ASCII, prose free*
- `BRF-IRONY-MARK` — the sparse-glyph case: width, `Bidi_Mirrored`, colour redundancy
