---
type: Debrief
callsign: DBF-CORPUS-PRIOR
date: 2026-11-15
tags: [surface, corpus, instrument, panel]
agent: pi (pjs, quattro session)
environment: local
briefs: []
source: observed
---

# Debrief: the readers and the corpus — the band turned out to be a percentile

## Accomplishments

- **The panel learned to speak in numbers a reader can use.** Every cell's label
  now carries both colours' OKLCH triple, both `Y` values (physical light beside
  perceptual lightness), then `lift`, `rules`, `share`, `gold`, `gold share` and
  `amber`, with a tier mark right-aligned so the grid scans `✗ ✗ ✗ / ✗ ○ ○ / ✓ ✓ ○`
  down its edge. `docs/2026-11-15-rung-panel.md` renders the same strings from
  the same function (`measureLines`), so the picture and the page cannot disagree.
- **The band became data.** `CEILING_L`, `FLOOR_PROSE`, `BAND`, `standing()`,
  `tiers()` — three tiers as intervals instead of a sentence in a footer. The
  page lists them by rung number, generated, so a pair change that moved a rung
  fails a test rather than drifting.
- **Two opposing claims became instruments.** *The ground alone separates every
  rung the reader rejected from every rung they kept* (0.272 < 0.293) and *the
  lift does not* (kept 0.515–0.638 overlapping rejected 0.501–0.610). The second
  is the negative the whole page turns on: a second luminance-only measure cannot
  repair what the ratio could not do.
- **Three readers, one per spelling.** `themeVariants` reads Herdr's flat JSON,
  the terminals' `key = value`, and Zed's one-file-many-themes with dotted keys —
  the last through a JSONC stripper, with `#1d2021ff` normalised to six digits.
- **A corpus census.** `just corpus <dir>`: quantiles over 819 Ghostty themes on
  our own axes. `docs/2026-11-15-the-corpus-prior.md` is the research result.
- **The finding that cost the band its innocence:** of 635 dark themes, **3** fall
  in our band, 467 in our region. Our band is 0.02 wide; the field's middle half
  is 0.094. And our control `#282c34/#ffffff` *is* Ghostty's default — so the
  first reader's "too bright" was a verdict on the most-praised default in the
  terminal world.

## Problems

- **The specimen was clipped, and the picture could not say so (fixed).** `CELL_H`
  was a hardcoded 700 against a 48-line render: 38 lines visible, so the *sciency
  function* — the block the specimen exists to show — was cut at every rung and
  the panel was judged on five sixths of a page. The label strip had the same bug
  one line up (hardcoded 58 → the third line clipped). Both heights are now
  derived (`cellHeight`, `stripHeight`), and the derivation is the fix: a static
  image cannot report its own truncation, so a height must come from what was
  rendered.
- **The panel could not be rebuilt on this machine (fixed).** `magick montage`
  builds an empty label per tile and needs a font — a box whose ImageMagick has
  no font list cannot build the panel at all, while the cells above it render
  fine; and `chromium` is absent on macOS. Grid is now `+append`; the rasterizer
  is `OKUDA_BROWSER`. This is *why* the clipping survived: nobody had rebuilt it.
- **Zed's reading failed silently, and the first probe was a wrong tool.**
  `themePair` returned null on a Zed theme (JSONC + nested `themes[].style`), so
  the comparison could not be run by the instrument that exists. It was run by a
  throwaway script instead — which then had to be re-earned as `themeVariants`
  plus a test.
- **The app's own data was unreadable, and that was information.** `strings` on
  the Zed binary found no palette: assets are compressed into it. The shipped
  *file* index (`themes/gruvbox/gruvbox.json`) is the authority; the binary is
  not. The first approach cost two commands and taught the rule.
- **The valve caught me, correctly (fixed).** Both new pages cited an ephemeral
  td id — the passbook is a persisted document, and persisted documents carry
  callsigns and SHAs, never td ids (`playbooks/td-playbook.md`). The gate failed
  `just check` twice, once per file, and the fix was the rule: the research page
  names the callsign the work is filed under, not its local handle.
- **A recital I nearly shipped was wrong.** I had "#282c34 is One Dark's
  background" ready as an attribution. The corpus's own `Atom One Dark` file is
  `#21252b`, and the corpus's `Tomorrow Night` is `#1d1f21/#c5c8c6` — so the
  honest claim is the one the diff supports: *three ANSI slots identical, three
  nudged, the bright half derived, the pair lifted*. Attribution by memory would
  have been an unpaid claim wearing a measurement's clothes.

## Lessons Learned

- **Adding a role to the specimen adds a measurement obligation.** Bold leads and
  a quote put `strong` and `blockquote` on the page; a role painted and not
  measured is the mirror of a number with no referent. `WATCHED` grew, and
  `gold share` was born — and it immediately found a canary: rung 5 at 0.99,
  where a bold lead is as loud as the paragraph beside it.
- **A band is a claim about a distribution, and only a corpus can say which.**
  Three of 635 is not a rule, it is a percentile — and stating it that way costs
  nothing and buys everything, because the reader can now tell the difference
  between "we like this" and "this is right".
- **Derive the height from what was rendered.** Two hardcoded pixel heights, two
  silent clippings, one class of bug. The derivation is cheaper than the review.
- **The throwaway script is the probe; the flag is the record.** The corpus was
  measured twice — once in `/tmp` to answer a question, once as `--corpus` so the
  answer could be reproduced by someone who does not have this session. The first
  was not waste (it found the shape), but it was not the deliverable either.
- **Read the shipped file, not the binary.** An app is not a data store; the
  resources it names are.

## Observations

### The corpora
- Ghostty ships **819** theme files; 635 have a dark ground. The distribution is
  tight on arithmetic (`prose` median 12.0, `ground L` median 0.222) and loose on
  taste (345 cool / 116 warm / 174 neutral).
- The corpus median pair (`L` 0.222 / ink 0.912) is deeper **and** brighter than
  our band's — three corpora now agree the direction we have not tried is *raise
  the ink*, not deepen the ground.
- `okuda rung 8` is Tomorrow Night (2012, base16 lineage) within 0.004 `L` and
  0.8 of a ratio point. Independent derivation landing on a prior, which is what
  a prior is for.
- `ΔE` was measured and **declined**: it equals `lift` to three decimals on every
  rung, because both colours are near-neutral and share a hue. A column that
  duplicates its neighbour is decoration; the page says so instead.

### The gate
- `just check` 27/27 throughout. `tests/rung-panel.test.ts` (18) and
  `tests/theme-readers.test.ts` (12) and `tests/corpus-doc.test.ts` (6) are new;
  the corpus-doc test parses the page's own table and recomputes each cell from
  the hexes in that row, so the page is self-checking without a second store of
  the corpus in the repo.

## Metrics

- **Panel build:** 9 cells ≈ 9s wall (chromium dominates); grid ≈ 300ms; cells
  now 760×1032 against 760×758 — the specimen is whole.
- **Census:** 819 files, 1224 lines of config, read and measured in **41ms**.
- **Tests:** 36 new expectations across three files; `just check` 27/27.

## Related

- Research result: `docs/2026-11-15-the-corpus-prior.md`
- Panel: `docs/2026-11-15-rung-panel.md` · `scripts/surface-panel.ts`
- Instrument: `scripts/contrast.ts` (`themeVariants`, `corpusRows`, `corpusText`)
- Kin: `docs/2026-10-28-the-ground-you-read-on.md` (the arithmetic the band
  came from), `ADR-LEGIBILITY-SURFACE-090` (the pin)
