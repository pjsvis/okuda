---
type: Reference
callsign: REF-PALETTE-PAGE
---

# The Palette Page

**Created:** 2026-09-05
**Anchors:** `briefs/2026-08-26-brief-palette-lightness-knob.md` (parked),
`briefs/2026-08-28-brief-oklch-tuning.md` (pending), `decisions/011-default-palette-okuda-identity.md`
**Status:** reference — the spec the brightness/colour-mode translation functions derive from

> The okuda preset (`src/palettes/okuda.json`) is the canonical palette. This
> page lays it out in OKLCH so the brightness axis can be reasoned about as a
> *variation of L across our colours* — H and C held fixed as identity, L the
> single dial. What stays the same and what changes is the whole point.

## 1. Why this page exists

Two briefs touch palette brightness and they disagree on ground truth:

| Brief | Ground truth | The dial |
|-------|--------------|----------|
| `BRF-PALETTE-LIGHTNESS` (parked) | hex (authored, hand-tuned) | `k` scales L at load; hex stays truth |
| `BRF-OKLCH-TUNING` (pending) | OKLCH `{l,c,h}` triples | scalar `α` scales L; RGB derived at runtime |

That is a **ground-truth migration** (hex → OKLCH) and it has not been
recorded as a decision. The palimpsest protocol (ADR rule 8) applies the
moment we commit: the parked brief's *"hexes remain the authored ground
truth"* is the reversed position. This page does not decide it — it makes
the decision *visible*, so it can be made in an ADR rather than smuggled in
as an implementation detail of the translation function.

## 2. The canonical palette, in three colour spaces

OKLCH values computed from each hex (Björn/OKLab transform; `L ∈ [0,1]`,
`C ∈ [0,~0.4]`, `H ∈ [0,360)`). Roles grouped by hue family — the family
is what survives the brightness dial; the hex is merely the current `L`
sample of that family.

### Blue/cyan family (H ≈ 220–265°)

| Role | Hex | L | C | H | Note |
|------|-----|---|---|---|------|
| `heading` | `#99ccff` | 0.828 | 0.090 | 249 | pale periwinkle — the H1/H6 channel |
| `link` | `#66ddff` | 0.842 | 0.116 | 220 | sea-cyan, legacy hyperlink role |
| `blockquote` | `#7788aa` | 0.626 | 0.055 | 264 | desaturated blue-grey, recedes |
| `muted` | `#445566` | 0.442 | 0.035 | 249 | dim blue-grey — the floor |
| `diagram-border` | `#5e8bbf` | 0.626 | 0.093 | 253 | box-drawing ink |

### Amber/gold family (H ≈ 73–96°)

| Role | Hex | L | C | H | Note |
|------|-----|---|---|---|------|
| `badge-bg` | `#ffaa00` | 0.802 | 0.171 | 73 | pure amber — LCARS alert body |
| `diagram-arrow` | `#ffaa00` | 0.802 | 0.171 | 73 | reuses badge amber |
| `emphasis` | `#e0b45c` | 0.792 | 0.118 | 83 | muted gold |
| `table-key` | `#e0b45c` | 0.792 | 0.118 | 83 | same as emphasis |
| `strong` | `#dfa21a` | 0.751 | 0.150 | 80 | deeper gold |
| `table-header` | `#c8b878` | 0.788 | 0.085 | 96 | warm parchment |
| `diagram-text` | `#c8b894` | 0.787 | 0.052 | 87 | near-neutral sand |
| `doc-ref` | `#e8c44a` | 0.830 | 0.143 | 92 | .md path token |
| `state-todo` | `#ffe066` | 0.910 | 0.144 | 95 | the brightest role — yellow lamp |

### Orange/coral family (H ≈ 46–60°)

| Role | Hex | L | C | H | Note |
|------|-----|---|---|---|------|
| `link-text` | `#ff9966` | 0.779 | 0.139 | 47 | coral — link anchor text |
| `state-parked` | `#ff9933` | 0.774 | 0.163 | 60 | orange lamp |
| `code-text` | `#ffcc99` | 0.878 | 0.088 | 66 | warm peach — code spans |

### Green family (H ≈ 143–163°)

| Role | Hex | L | C | H | Note |
|------|-----|---|---|---|------|
| `state-ok` | `#5fd35f` | 0.774 | 0.188 | 143 | green lamp — high chroma |
| `link-url` | `#4d9e7a` | 0.638 | 0.097 | 163 | deep sea-green, the URL tail |

### Red/rose family (H ≈ 13–24°)

| Role | Hex | L | C | H | Note |
|------|-----|---|---|---|------|
| `alert` / `state-failed` | `#ff5555` | 0.682 | 0.206 | 24 | **highest chroma in the palette** |
| `vector` | `#fb7185` | 0.719 | 0.169 | 13 | rose — the rubricator's ink (ADR-031) |

### Neutral

| Role | Hex | L | C | H | Note |
|------|-----|---|---|---|------|
| `badge-fg` | `#000000` | 0.000 | 0.000 | — | black on amber badge |
| `code-background` | `""` | — | — | — | no background emitted (glow parity) |

## 3. What stays the same, what changes

This is the axis the translation function lives on.

- **Stays (identity):** `H` and `C` per role. The hue family *is* the okuda
  look — periwinkle headings, amber badges, coral links, rose vectors.
  Touch these and you have a different palette, not a brighter one.
- **Changes (mode):** `L` per role — but as a **structured variation**, not
  free per-role anarchy. Two shapes are viable:
  1. **Global scalar** (`BRF-OKLCH-TUNING`): `L' = clamp(L · α)`, one α
     for all roles. Honest for terminal-gamma compensation (the same hex
     reading differently on iPad OLED vs a datacenter LCD). Dishonest at
     the α extremes for high-chroma roles (§4).
  2. **Per-family L ceiling** (this page's contribution): each hue family
     carries a max-L the gamut allows; α scales toward the ceiling, not
     past it. The dim blues (`muted`, `blockquote`) can climb far; the
     reds (`alert`, `vector`) hit the wall early and hold. This is *not*
     the "places" hex-surgery the parked brief rejected — it's a
     per-family gamut constraint derived from the fixed `{C,H}`, applied
     uniformly. It is the shape the table below implies.

The choice between (1) and (2) is the ADR. The page does not pick; it
supplies the data either decision needs.

## 4. The gamut ceiling — where the brief overpromises

`BRF-OKLCH-TUNING` acceptance: *"no pink blowout of alert reds."* Physics
disagrees. A point `(L, C, H)` is only renderable in sRGB if it lies inside
the sRGB gamut; raising L at fixed high-C eventually exits it, and the
clamping the brief mandates ("safely clamps RGB outputs") is *exactly* the
hue drift it forbids. Computed per-role ceilings (approximate, sRGB):

| Role | C | Max safe L (current H) | Headroom at α=1.0 | Survives α=1.2? |
|------|---|------------------------|-------------------|-----------------|
| `alert` / `state-failed` | 0.206 | ~0.64 | **none — already over** | no — clips pink |
| `state-ok` | 0.188 | ~0.70 | ~0.02 | no |
| `vector` | 0.169 | ~0.66 | **none** | no — drifts crimson |
| `badge-bg` / `diagram-arrow` | 0.171 | ~0.78 | ~0.02 | borderline |
| `state-parked` | 0.163 | ~0.80 | ~0.03 | borderline |
| `doc-ref` | 0.143 | ~0.84 | ~0.01 | no |
| `link-text` | 0.139 | ~0.85 | ~0.07 | yes |
| `state-todo` | 0.144 | ~0.90 | ~0.01 | **already at ceiling** |
| `muted` | 0.035 | ~0.97 | ~0.53 | yes — huge headroom |
| `blockquote` | 0.055 | ~0.95 | ~0.32 | yes |

Read: the brightest, most saturated roles (`state-todo` yellow,
`alert`/`state-failed` red, `vector` rose) are **already at or past their
gamut ceiling at α=1.0**. A global α that dims (α<1) is safe everywhere; a
global α that brightens (α>1) only helps the dim blues and quietly
destroys the lamps. **The honest α range is asymmetric: dim freely, brighten
per-family.** This is the single most important thing the page finds, and
it is why the translation function cannot be a one-liner `L·α`.

## 5. Example texts — the swatches, dogfooded

Each role shown by the markdown construct the grammar paints with it. The
lorem is ancient maxims (the "ancient language" the page asked for). Roles
not addressable by markdown grammar (chrome-only: `badge-*`, `state-*`,
`vector`, `diagram-*`) are noted, not faked.

### Blue/cyan family

- **`heading`** — painted by `#`–`######`:
  > # Cogito, ergo sum.
- **`link` / `link-text` / `link-url`** — painted by `[text](url)`:
  > [γνῶθι σεαυτόν](https://en.wikipedia.org/wiki/Know_thyself) —
  > know thyself, inscribed at Delphi.
- **`blockquote`** — painted by `>`:
  > > Nosce te ipsum. The same injunction, in Latin, receding into the
  > > margin where quotes belong.
- **`muted`** — the floor; horizontal rules and de-emphasised chrome:
  > tempus fugit — and the rule beneath it fades.
- **`diagram-border`** — box ink inside mermaid→ASCII frames (see
  `diagram-monster.md`); not paintable in prose.

### Amber/gold family

- **`emphasis`** — painted by `_..._`:
  > *Aurea mediocritas* — the golden mean, Horace's counsel against
  > extremes. (Fitting, given §4.)
- **`strong`** — painted by `**...**`:
  > **Festina lente.** Make haste slowly — the only honest speed.
- **`code-text`** — painted by `` `...` ``:
  > `Μηδὲν ἄγαν` — "nothing in excess", carved at Delphi.
- **`table-header` / `table-key`** — painted inside `| ... |` tables (see
  `tables.md`); `table-key` is the left-column index glyph.
- **`doc-ref`** — the bare `.md` path token in prose:
  > See `decisions/011-default-palette-okuda-identity.md` for why this
  > palette exists at all.
- **`state-todo`** — chrome-only lamp (the `[ ]` glyph); see
  `state-colours.md`.
- **`badge-bg` / `diagram-arrow`** — pure amber; chrome and diagram ink,
  not author-addressable.

### Orange/coral family

- **`link-text`** — the anchor text half of a link (above); coral against
  the cyan URL tail.
- **`state-parked`** — chrome-only lamp (the `[~]` glyph).
- **`code-text`** — also warm peach; the `Μηδὲν ἄγαν` line above is it.

### Green family

- **`state-ok`** — chrome-only lamp (the `[x]` glyph); the highest-chroma
  green — first to clip when brightened.
- **`link-url`** — the URL tail of a link; deep sea-green that recedes
  behind the coral text.

### Red/rose family

- **`alert` / `state-failed`** — chrome-only; the fetch-state `failed`
  channel and the `[!]` glyph. The most chromatic role in the palette —
  the one a naive `L·α` breaks first.
- **`vector`** — chrome-only; the `[NN]` jump badges (ADR-031), the
  rubricator's rose ink. Author text can never imitate it.

### Neutral

- **`badge-fg`** — black on amber; chrome only.
- **`code-background`** — empty; nothing is emitted. The terminal's own
  background is the only background (glow parity, retired 2026-09-02).

## 6. What this page implies for the translation function

Given the §4 ceiling, the function is not `L' = L · α`. It is closer to:

```
L' = L · α                              // dim path, α ≤ 1: always safe
L' = min(L · α, ceiling(role))          // brighten path, α > 1: per-family cap
// H, C untouched on both paths.
```

with `ceiling(role)` derived from the fixed `{C, H}` and the sRGB gamut —
the column from §4. The dim path is the parked brief's `k` and the pending
brief's `α` agreeing; the brighten path is where the pending brief needs
the per-family cap the page supplies. The hex round-trip
(OKLCH → linear sRGB → sRGB → ANSI `\x1b[38;2;R;G;Bm`) is the pending
brief's pipeline, unchanged.

## 7. Next

1. **ADR — hex → OKLCH ground truth.** Records the reversal of
   `BRF-PALETTE-LIGHTNESS`'s "hex stays ground truth" position. The page
   is the evidence; the ADR is the decision.
2. **Translation function** in `src/palette.ts` (extend, don't add
   `colors.ts` — per `td-b4bae8`): `oklchScale(palette, α)` returning a
   derived `Palette` of hexes, with the §4 per-family ceiling.
3. **Wire the dial** — `[`/`]` or `+`/`-`, 5% steps, `OKUDA_BRIGHTNESS`
   env override — per the pending brief.
4. **Test the no-op:** `α=1.0` must be byte-identical to today's hex output
   (the parked brief's invariant, carried forward).

The page is the spec; the ADR is the gate; the function is the work.
