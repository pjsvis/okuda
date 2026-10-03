---
type: Brief
callsign: BRF-STATE-GLYPH
---

# Brief: State-glyph render path — the showcase environment + first cut

**Date:** 2026-08-28
**Status:** Done — P1+P2 landed (docs/state-colours.md showcase + `styleStateGlyph` in render.ts:91, table cells + list leads, 190/190 at ship). P3 perceptual tuning parked — refile when the perceptual itch fires; the showcase doc is the proof-of-fix, unchanged. Found lying-open by the 2026-10-03 audit (td-af9959).
**Branch:** feat/gloam-launcher
**Context:** the state-glyph vocabulary is pinned by contract test
(`td-28a3e6` landed the palette roles + 6 tests, 190/190 green). But
`render.ts` doesn't apply the state colours to glyphs in content — a
rendered document shows plain `✓☐⋮✗`, same as `docs/state-glyphs.md`
does today. The palette contract is a promise the render path doesn't
yet keep. This brief is the application: the code that makes the
renderer emit `roleBold(stateRole, glyph)` for the closed set, and the
showcase document that proves it in the wild — with the okudagram
chrome intact, the system invariant respected.

## Why this earns a td epic with phased new-ups

The work has three phases that don't compose in one commit:

1. **Showcase environment** — a real rendered document with the full
   okudagram chrome (H1 badge + RHS chip, two-chip bookend terminator)
   that exercises the state glyphs in the renderer's actual content
   paths: table cells, list leads, prose. Today it renders the glyphs
   plain (the gap made legible in the wild). After phase 2, it renders
   them coloured — the same document goes from proof-of-gap to
   proof-of-fix without changing. The document is the invariant's
   watchdog: if the render-path change ever disturbs the chrome, the
   terminator stops closing or the chip drifts, and the doc catches it.
2. **Render-path application** — `styleStateGlyph(text)` in `render.ts`,
   called on the leading glyph in table cells and list items, emitting
   `roleBold(stateRole, glyph)` for the closed set. The first cut.
3. **Perceptual tuning** — the colour hexes will change (perceptual
   work in flight; `just state-colours` A/Bs bright vs dim recede/watch/
   alarm tiers). The code shape must make a hex change a one-line palette
   edit the test catches — not a refactor. Phase 3 is the knob-turning,
   not new code.

The phased shape keeps the foxtrot-oscar guard honest: the chrome
invariant is verified *before* the render-path change (phase 1: chrome
intact, glyphs plain) and *after* (phase 2: chrome intact, glyphs
coloured). The showcase doc is the invariant's watchdog at every phase.

## What

### Phase 1 — the showcase environment (`docs/state-colours.md`)

A rendered document, not a script. Full okudagram chrome (the renderer
emits it — every document gets the header badge + chip and the two-chip
terminator; the doc doesn't author chrome, it authors content the chrome
frames). Content exercises every glyph in every content path:

- **Table cells** — a state column with `☐ ✓ ⋮ ✗ ◆` (the monster-tables
  shape, real repo content).
- **List leads** — a status-led list, glyphs leading each item.
- **Prose** — inline glyphs in sentences ("✓ shipped, ⋮ parked, ✗
  rejected").
- **A legend** declaring the vocabulary once.

The doc's preamble names the gap honestly: the glyphs render plain
today; phase 2 colours them. After phase 2, the doc is the proof of
the fix — same bytes, colours landed. `just state-colours-doc` runs
`okuda docs/state-colours.md --tui`.

**Why a doc, not a script:** `just state-colours` (the palette A/B)
bypasses the render path — it tests bytes, not the renderer. A rendered
document is the only honest test of "does the renderer emit these
colours for these glyphs in content." The chrome comes for free from the
renderer; the glyphs are the content. The two commands stay separate:
`just state-colours` for perceptual tuning (ad-hoc palettes, no
renderer, no chrome); `just state-colours-doc` for the renderer-in-the-
wild check (real palette, real render path, chrome invariant).

### Phase 2 — the render-path application (the first cut)

**One named place for the closed set + the role mapping.** The
vocabulary and its role assignment live in a single lookup — not
scattered across handlers. Change a glyph or a role: one edit. Add a
state: one entry. The renderer's content paths call one helper.

```ts
// The closed state-glyph vocabulary. Lexicon-applied, not author-
// editable: the renderer colours a ✓ green because ✓ is in this set,
// not because an author can tag arbitrary text green. Extends ADR-015's
// alert discipline to the full traffic lamp.
const STATE_GLYPH_ROLE: Record<string, keyof Palette> = {
  "✓": "state-ok",
  "☐": "state-todo",
  "⋮": "state-parked",
  "✗": "state-failed",
  // ◆ is NOT here — priority, not state. Colouring it collapses two axes.
};

/** If `text` is (or leads with) a state glyph, return it coloured + bold
 *  via the lexicon role. Else return `text` unchanged. Pure. */
function styleStateGlyph(text: string, styler: Styler): string
```

- **Table cells:** the state column's cell text passes through
  `styleStateGlyph` on emit. A `✓` becomes `roleBold("state-ok", "✓")`;
  plain text passes through.
- **List leads:** the leading glyph of a list item (the first char if
  it's in the closed set) passes through `styleStateGlyph`.
- **Prose:** inline glyphs in paragraph text. This is the contentious
  one — see Risk. The first cut applies the styling in table cells and
  list leads only; prose glyphs stay plain until phase 2.1 decides
  whether inline-prose glyph colouring earns its place or reads as
  chrome leaking into prose.

### Phase 3 — perceptual tuning (the knob)

No new code. The colour hexes change against the perceptual work:
`just state-colours` A/Bs bright vs dim; the recede/watch/alarm tier
gradient (done + parked dim, todo bright, failed bright = `alert`).
A hex change is a one-line edit in `src/palette.ts` + `okuda.json`; the
contract test fails loudly if the new hex collides with a document
channel (the test that caught the brief's first incoherence — same
guard, replayed). The showcase doc (`just state-colours-doc`) confirms
the change in the wild, chrome intact.

## Scope / non-goals

- **No themes, no palette switcher, no config surface.** The state
  colours are a closed lexicon applied by the renderer; the override
  file remains the escape valve (already works — `loadPalette` iterates
  `key in merged`). This brief doesn't touch the override mechanism.
- **No `◆` colouring.** Priority, not state. The showcase doc uses `◆`
  in the notes column, plain — and the doc's judgement section tests
  that `◆` and the state glyphs read on separate axes.
- **No prose glyph colouring in the first cut.** Phase 2 applies to
  table cells + list leads. Inline-prose glyph colouring is phase 2.1,
  decided after the first cut lands and the showcase doc is judged.
- **No new ADR.** ADR-015 set the precedent (chrome/channel discipline,
  non-confusability, preset-independent alarm). This brief applies it;
  the precedent is already recorded.

## Risk / open questions

- **Inline-prose glyphs.** Colouring a `✓` mid-sentence reads as chrome
  in prose — possibly the viewer editorialising. The first cut avoids
  it (table + list only); phase 2.1 decides. The showcase doc has a
  prose section that will show the contrast: plain inline glyphs vs
  coloured table/list glyphs. Judge whether the inline ones look wrong
  plain (under-served) or would look wrong coloured (over-served).
- **The closed set is closed.** Adding a sixth state (e.g. `state-
  blocked`) is one entry in `STATE_GLYPH_ROLE` + one palette role + one
  test row — but it fires the ADR-006 justification test (name the role,
  show why existing channels fail, add the role). The closed set is
  closed by discipline, not by code; the code makes adding easy, the
  discipline makes adding earned.
- **Chrome invariant.** The render-path change touches the table cell
  emit and the list-item emit. Both are inside the chrome frame (the
  terminator + header are emitted outside, in `renderDocument`). The
  change must not disturb the terminator's two-chip bookend or the
  header's badge + chip. The showcase doc is the watchdog: render it
  before and after phase 2, diff the chrome — if the terminator stops
  closing or the chip drifts, the invariant broke.
- **NOCOLOR parity.** `styleStateGlyph` under `none` returns the glyph
  plain (the styler's none-mode drops colour + bold). The glyph survives
  by shape. The showcase doc's `--no-color` judgement section confirms:
  states still distinguish without colour. The contract test already
  pins this for `roleBold`; the doc confirms it in the wild.

## How to document it (later, not this brief)

The state-glyph vocabulary will need a short doc — not a scratchpad
entry, a `docs/` doc that names the lexicon, the tiers, the
non-confusability discipline, and the ◆-is-not-a-state guard. The
showcase doc (`docs/state-colours.md`) is the exhibit; the lexicon doc
is the reference. Defer the lexicon doc until phase 3 settles the
hexes — documenting colours that are about to change is benchmaxxing
the doc. The brief names the deferral; the doc lands when the hexes do.

## Related

- `td-28a3e6` — the palette contract this brief applies (landed: 4
  roles, 6 tests, 190/190 green).
- `briefs/2026-08-28-brief-state-glyph-vocabulary.md` — the contract
  brief (this is its application).
- ADR-015 (`decisions/015-alert-palette-role.md`) — the precedent this
  extends (alarm-universality → full traffic lamp; chrome discipline).
- `scripts/state-colours.ts` / `just state-colours` — the palette A/B
  (perceptual tuning, phase 3's tool).
- `docs/tables-monster.md`, `docs/diagram-monster.md` — the monster docs
  that exhibit the glyphs under load today (plain); they colour when
  phase 2 lands, same code path.
- `docs/state-glyphs.md` — the current vocabulary exhibit (plain
  glyphs; superseded by `docs/state-colours.md` as the in-the-wild
  showcase, but kept as the byte reference).