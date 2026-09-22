---
type: Brief
callsign: BRF-GLYPH-LEAD
date: 2026-09-18
---

# Brief: The state glyph is emitted twice on a list lead

**Created:** 2026-09-18
**Status:** Open
**TD:** td-59e161 (epic) — td-d4420d the failing tests · td-075ae8 the repair · td-5928c9 the corpus pass
**Lineage:** found while verifying `docs/2026-09-18-simplified-technical-english.md` — the doubled glyph was visible in the render and absent from the source, which is the house's own way of catching a rendering defect
**Extends:** `briefs/2026-08-28-brief-state-glyph-render-path.md` (BRF-STATE-GLYPH) — the list-lead call this brief repairs

## Objective

Make a status-led list item render its leading state glyph exactly once, and stop the SGR
sequence that follows the glyph from losing its escape byte.

## Scope

**In:** the list-lead call site (`src/render.ts:927`) and the replace-not-append contract of
`styleStateGlyph` (`src/render.ts:89–122`); a regression test that counts glyphs in the rendered
bytes; the false NOCOLOR parity claim in BRF-STATE-GLYPH's Risk section.

**Out:** the table-cell call site (`src/render.ts:1061`) — measured correct on the glyph count,
and the nested bold it produces is an ADR-034 question of its own; prose glyph colouring, which
landed and is correct; the palette hexes (BRF-STATE-GLYPH phase 3); `◆`, which is priority and
not a state role.

## Preconditions

- [x] The doubling reproduces on a minimal file: `tmp/glyph-list.md` carries 2 glyphs in source
      and renders 4. **Verified 2026-09-18.**
- [x] The prose path is the control and it passes: `tmp/glyph-prose.md` carries 1 glyph and
      renders 1. **Verified 2026-09-18.**
- [x] The mechanism is isolated: `tmp/glyph-lead-probe.ts` shows the function appending a styled
      copy rather than replacing the original. **Verified 2026-09-18.**
- [x] The table-cell path does not double: `tmp/glyph-table.md` carries 1 glyph and renders 1.
      **Verified 2026-09-18.**
- [x] The escape truncation is in the real output and not a harness artefact: a `--no-color`
      render of `tmp/glyph-list.md` holds 18 intact SGR sequences against 3 truncated ones, one
      per list item. **Verified 2026-09-18** by writing the render to a file, removing the intact
      sequences with `sed`, and counting what is left.
- [x] `just test` runs `bun test`. **Verified 2026-09-18.**

## Work Plan

1. [ ] Add the failing test: a status-led list item renders its leading glyph once, asserted on
       the rendered bytes and not on the source.
2. [ ] Add the escape test: no SGR-shaped text survives a render once the intact sequences are
       removed.
3. [ ] Repair `styleStateGlyph`: `visStart` becomes the glyph's offset in the original text, and
       the slice after the splice steps over the glyph rather than over `prefixLen`.
4. [ ] Confirm the three controls: `tmp/glyph-list.md` renders 2, `tmp/glyph-prose.md` renders 1,
       `tmp/glyph-table.md` renders 1.
5. [ ] Render the four status-led documents in the silo — `docs/state-colours.md`,
       `docs/state-glyphs.md`, `docs/style-guide.md`, `docs/showcase.md` — and confirm each
       glyph count matches its source with the okudagram chrome intact.
6. [ ] Correct BRF-STATE-GLYPH's NOCOLOR parity claim.
7. [ ] `just check`, then commit.

## Acceptance Criteria

* A status-led list item renders its leading glyph exactly once, for each of the four glyphs in
  the closed set.
* A `--no-color` render of `tmp/glyph-list.md` holds **0** truncated SGR sequences.
* The prose control is unchanged: `tmp/glyph-prose.md` renders 1 glyph.
* The table control is unchanged: `tmp/glyph-table.md` renders 1 glyph.
* `just test` is green.
* BRF-STATE-GLYPH's Risk section states that `--no-color` keeps bold.
* For each of the four status-led documents, the rendered glyph count equals the source count.

## Notes

**The mechanism, pinned.** `styleStateGlyph` (`src/render.ts:89–122`) receives a wrapped line
whose first visible character is the glyph. The loop at `:106–118` sets `visStart = ansiStart` on
its first pass, and when the item carries no leading escape `m` is null so
`ansiStart = text.length`. `visStart` therefore lands at the **end** of the string, and the splice
at `:121` reads `text.slice(0, visStart)` — the whole text — before appending the styled glyph.
The original glyph is never removed.

**The second defect is the same expression.** `prefixLen` is the width of the *stripped prefix*,
not the glyph's width, so `text.slice(visStart + prefixLen)` is an arbitrary offset. When the
glyph is followed by an SGR sequence, `visStart` points at the escape and `visStart + prefixLen`
steps one byte into it, dropping the `\x1b` and leaking `[38;2;…m` into the render as literal
text. Isolated in `tmp/glyph-lead-probe.ts`: an input of the glyph, a space, and the bold-lead
colour sequence returns that sequence truncated.

**The harness cannot see this class of defect, which is why it survived.** The shell capture
strips `\x1b` from SGR sequences, so an intact escape and a truncated one read alike on stdout.
The measurement that separates them writes the render to a file, removes the intact sequences with
`sed`, and counts what is left. Any fix is verified the same way.

**The affordance was the point.** The status-led list is the house's count-scan pattern: *the eye
sees how many items there are before reading any* (`playbooks/authoring-playbook.md`). A doubled
glyph corrupts the count. A second signal on top of a signal that already carries the affordance
is the error ADR-034 names: no unnecessary rubrication.

**Adjacent, out of scope.** The table-cell call at `:1061` wraps the glyph in a second bold,
because the cell already carries table-key styling — `[1m[1m☐[0m[0m`. Harmless, and the same
ADR-034 question at a smaller scale.

**A correction this brief carries.** BRF-STATE-GLYPH's Risk section claims `styleStateGlyph`
"under `none` returns the glyph plain (the styler's none-mode drops colour + bold)". The code
comment at `:88` states the opposite — *the colour drops but the weight survives (roleBold emits
SGR 1)* — and the render agrees with the comment. The brief's claim is false.

## Related

- `briefs/2026-08-28-brief-state-glyph-render-path.md` — the brief this repairs (BRF-STATE-GLYPH)
- `briefs/2026-08-28-brief-state-glyph-vocabulary.md` — the palette contract behind it
- `decisions/034-no-unnecessary-rubrication.md` — the rule the doubled signal breaks
- `playbooks/authoring-playbook.md` — the status-led list and the count-scan it promises
- `docs/state-glyphs.md` and `docs/state-colours.md` — the exhibits that carry the defect today
