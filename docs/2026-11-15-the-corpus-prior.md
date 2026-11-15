# The corpus prior — what the field ships, on our axes

**Created:** 2026-11-15
**Instrument:** `just corpus <dir>` (`scripts/contrast.ts --corpus`) · one reader per host spelling, `themeVariants` · tiers from `standing()`
**Corpora:** Ghostty 819 shipped themes (635 dark / 184 light), read from `/Applications/Ghostty.app/Contents/Resources/ghostty/themes` on 2026-11-15 · Zed's `gruvbox.json` (6 variants) fetched from `zed-industries/zed` the same day · okuda's own 10 rungs (`PAIRS`)
**Checked by:** `tests/theme-readers.test.ts` (the readers, the census) and `tests/corpus-doc.test.ts` (every derived cell below, recomputed from the hexes in its own row)
**Companion:** [`docs/2026-11-15-rung-panel.md`](2026-11-15-rung-panel.md) (the band and the walk) · [`docs/2026-10-28-the-ground-you-read-on.md`](2026-10-28-the-ground-you-read-on.md) (the arithmetic)

The question was *"Ghostty gets a palette right from the get go — what is their secret, and is there a recipe?"* The answer turned out to be measurable, and it costs our own band something.

> ◆ **There is no Ghostty palette. There is a prior: the field converges on two lightness numbers and disagrees about everything else.** Our band sits inside that prior, not on it.

## The corpus, by quantile

`just corpus` over the 819 files the app ships. Quantiles are nearest-rank, so every figure printed is a theme somebody actually wrote.

```
── DARK (n=635) · ours: ✓ band 3 · ○ region 467 · ✗ outside 165
                min     p10     p25     med     p75     p90     max
ground L      0.000   0.123   0.176   0.222   0.270   0.319   0.484
ink L         0.366   0.748   0.830   0.912   0.959   0.988   1.000
prose           1.9     6.8     9.4    12.0    15.1    17.3    21.0
lift          0.189   0.501   0.589   0.666   0.750   0.811   1.000
Y ground      0.000   0.002   0.005   0.010   0.020   0.032   0.118
C ground      0.000   0.000   0.000   0.015   0.032   0.063   0.225
ground hue  warm 116 · cool 345 · neutral 174
```

**Read this as a prior, not a standard.** The middle half of shipping dark themes lives in `ground L` 0.176–0.270 — a span of 0.094. Our comfortable band is 0.24–0.26: **0.02 wide, a fifth of the field's middle half**, and it contains **3 of those 635 themes**. The 467 in `○ region` are the field's own body. So the band is a *taste with a boundary*, and the boundary is ours.

The shapes worth naming:

- **Tight where it is arithmetic.** `prose` has a median of 12.0 and a p25 of 9.4; `ground L` clusters around 0.22. Designers who never met agree on the two numbers a formula can compute.
- **Loose where it is taste.** Ground hue splits 345 cool · 116 warm · 174 neutral. Our warm walk (`h` 67–78) is a **minority taste** — which is exactly why it read as a discovery rather than a default.
- **The ink is brighter than ours.** Median ink `L` 0.912 against our held 0.857. The band's prose interval (10–11:1) sits *below* the corpus median (12.0): we are the dim ones.
- **Light grounds are a different language.** All 184 light themes are `✗ outside` by construction — the ceiling is a claim about emitted light, and a light ground is all emitted light. Reported, never adjudicated.

## Ten pairs, one set of axes

The same reading, on named pairs, plus our own rungs for scale. Every hex is in the row, so every number in the row can be recomputed from it.

Columns: **pair** · **bg / fg** the two hexes · **L_bg / L_fg** OKLCH lightness of each · **Y_bg** the light the ground emits · **prose** WCAG ratio · **lift** `L_fg − L_bg` · **ours** the tier `standing()` gives that pair.

| pair | bg / fg | L_bg / L_fg | Y_bg | prose | lift | ours |
|---|---|---|---|---|---|---|
| Ghostty default | #282c34 / #ffffff | 0.293 / 1.000 | 0.025 | 14.0:1 | 0.707 | ✗ outside |
| Tomorrow Night | #1d1f21 / #c5c8c6 | 0.238 / 0.830 | 0.014 | 9.8:1 | 0.592 | ○ region |
| Atom One Dark | #21252b / #abb2bf | 0.263 / 0.762 | 0.018 | 7.2:1 | 0.499 | ○ region |
| Gruvbox Dark Hard | #1d2021 / #ebdbb2 | 0.241 / 0.894 | 0.014 | 12.0:1 | 0.653 | ○ region |
| Gruvbox Dark | #282828 / #ebdbb2 | 0.277 / 0.894 | 0.021 | 10.7:1 | 0.617 | ○ region |
| Gruvbox Dark Soft | #32302f / #ebdbb2 | 0.311 / 0.894 | 0.030 | 9.6:1 | 0.583 | ✗ outside |
| Gruvbox Light | #fbf1c7 / #282828 | 0.956 / 0.277 | 0.875 | 13.0:1 | -0.679 | ✗ outside |
| okuda rung 6 | #262320 / #d6cfc4 | 0.258 / 0.857 | 0.017 | 10.1:1 | 0.599 | ✓ band |
| okuda rung 8 | #221f1c / #d6cfc4 | 0.242 / 0.857 | 0.014 | 10.6:1 | 0.616 | ✓ band |
| okuda rung 9 | #1c1a17 / #d6cfc4 | 0.219 / 0.857 | 0.010 | 11.2:1 | 0.638 | ○ region |

Three things in that table are worth the ink:

- **Our control is Ghostty's default, to the hex.** `PAIRS[0]` is `#282c34` / `#ffffff` — `scripts/contrast.ts:41`. So the first reader's verdict, *"too bright"*, was a verdict on the most-praised default in the terminal world, and it was delivered by the corpus's own p85.
- **Rung 8 is Tomorrow Night within 0.004 `L` and 0.8 of a ratio point.** We walked to it from a different direction, with different instruments, and landed on a 2012 scheme that came out of a builder. That is corroboration, not coincidence — it is what a prior looks like when you re-derive it.
- **Our band's two members are both warmer and dimmer than the corpus median.** The median pair is deeper ground (0.222) *and* brighter ink (0.912) — higher prose, more separation.

## What Ghostty's default actually is

Not a palette: an inheritance with a derived half. Diffed against the corpus's own `Tomorrow Night` port:

| slots | difference |
|---|---|
| 3, 5, 6 | **identical** (`#f0c674`, `#b294bb`, `#8abeb7`) |
| 1, 2, 4 | nudged one unit (`cc6666→cc6566`, `b5bd68→b6bd68`, `81a2be→82a2be`) |
| 0 | Tomorrow Night's *ground* (`#1d1f21`) as black |
| 7 | `#c4c8c6` — Tomorrow Night's ink, nudged, not white |
| 8–15 | **derived** — Tomorrow Night repeats 1–7 here; Ghostty builds a bright half |
| pair | ground lifted `#1d1f21 → #282c34`, ink `#c5c8c6 → #ffffff` |

So: **inherit the eight hues — the part that is taste and expensive to test — and derive the two parts that are arithmetic** (the bright ladder, and the pair). The default is brighter than the scheme it came from, on both axes.

## The recipe in the wild

Two are verified from source here; the rest are named so a reader can fetch them rather than take the list on trust.

- **Base16** (Chris Kempson, since **August 2012**) — verified from the repository: *"a framework for building Tomorrow styled themes using a base of sixteen colours … how to build"*, with `builder.md` and `styling.md` separate, and the stated constraint *"8 shades and 8 accents"*. Tomorrow Night is one of its children, so Ghostty's default is a **base16 descendant with a derived bright half**.
- **Solarized** (Ethan Schoonover) — verified from the site: *"designed … with both precise CIELAB lightness relationships and a refined set of hues based on fixed color wheel relationships"*. A stated derivation, and deliberately low contrast — the anti-corpus.
- **Recited, unfetched, do not quote without the fetch:** Radix Colors' 12-step scale with a documented contrast guarantee per step; Material 3's tonal palettes in HCT; APCA as the standing critique of the WCAG2 ratio this instrument uses as a floor.

The pattern is not in the literature's essays but in its **builders**: the people who wrote a script are the ones with a recipe. A palette is a taste; a builder is a constraint.

## The opinion

1. **The secret is a prior and a corpus, not a palette.** Ghostty inherited hues somebody else had exercised for a decade and spent its own effort on the checkable parts. It also shipped 819 alternatives — a prior *and* an exit, which is the luxury most apps do not have and the reason their defaults are either a framework's modal guess or one designer's afternoon.
2. **"Derived, not specified" holds at the palette level too.** A spec of sixteen hexes must be authored by someone who already knows them; a builder derives them from eight shades and eight accents under a stated constraint. Our own instrument now does the same job for the *pair*: it derives a standing from intervals instead of asserting a taste.
3. **The residue of the recipe is two numbers, and that is good news here.** `L_ground` ≈ 0.22 and prose ≈ 12:1. Those are exactly the axes `standing()` reads. The sixteen hues are not a recipe — the corpus proves it by disagreeing on hue while agreeing on lightness.
4. **The uncomfortable part stands.** Our band holds 3 of 635 shipping dark themes; the field's own body is the region we call "kept but not comfortable". A band that is a percentile must be *stated* as one. What we have is a reader's taste with a measured boundary — which is more than most bands have, but less than a rule.
5. **It closes our open question.** Three corpora now point the same way: the ladder says the ground is exhausted at rung 9, Gruvbox ships ink at `L` 0.894, and the corpus median ink is 0.912 against our 0.857. **Raise the ink; stop deepening the ground.** That is the one knob on the panel page with a corpus behind it.

## Boundaries — where this map stops

- **Shipped is not chosen.** 819 themes are what people *ported*, not what people *use*. The distribution of supply is a proxy for the distribution of taste, and the proxy is weakest exactly where it matters: a default.
- **Duplicates are counted.** Six Tomorrow variants, three Gruvbox variants, hundreds of iTerm2 ports. The percentiles are robust to that (they are order statistics, not means), the counts are not.
- **A terminal's pair is not a document's.** The ANSI sixteen are syntax: short tokens, high variance, never a long prose measure. okuda paints body text and hairline structure. The corpus reads the *same axis* as our instrument and no other — which is why the ceiling keeps its document qualifier.
- **One reader per spelling is still a guess at the fourth.** A host that names its surface in a fifth way gets a fifth branch, and the census will silently report zero pairs rather than refuse — `--corpus` exits non-zero on an empty reading, which is the smallest honest guard available.

## What it changes here

- **The band stays, and gains a percentile.** It is stated as a preference inside the region on the panel page; this page is the defence of that wording, with 635 themes behind it.
- **One direction gains a corpus:** raise the ink (`L` 0.857 → 0.89–0.91) before deepening the ground further. It is the open knob on `docs/2026-11-15-rung-panel.md`, and it is the only one where the field and our ladder agree.
- **The instrument gained three readers and a census:** `themeVariants` (`scripts/contrast.ts`), the Zed JSONC branch, and `just corpus <dir>`. The work item lives in td; this page cites the callsign it is filed under, per the valve — a persisted document does not carry an ephemeral id.
