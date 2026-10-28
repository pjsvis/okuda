# The ground you read on

**Created:** 2026-10-28
**Status:** reference — for a principal setting up the glass, not for the author writing markdown
**Instrument:** `scripts/contrast.ts` (`just contrast`)

The numbers on this page are printed by that script, and `tests/contrast.test.ts`
pins this page against it — so a pair cannot drift and a palette hex cannot quietly
change the arithmetic underneath the prose.

okuda renders your foreground and leaves your background alone. That is not a
gap: absolute luminance is the terminal's, and the renderer asserting it would be
wearing the host's coat (`ADR-GLASS-INK-073`). What this page is for is the other
half of that decision — the terminal's dial has to be *set well*, and "which
foreground?" is a question with measurements behind it.

## The instrument

Two numbers, and they answer different questions:

- **ratio** — WCAG 2.0 contrast, the shared currency. A poor proxy for halation, but the reference everyone shares.
- **L** — OKLCH lightness of the ink. The perceptual scale. A ratio is arithmetic; L is what the eye is doing.

The binding constraint is none of those. It is `muted` (`#445566`): the palette's
darkest structural ink, drawing horizontal rules and table pipes. A ground that is
too *light* erases the rules while prose stays perfectly legible — so the honest
direction for "too bright" is **downward**, which is the opposite of the intuitive
move. The `rules` field below is that role's contrast against each ground, and
`share` is `muted ÷ ink`: above 1.00 a rule starts out-shouting the prose it
divides.

## The range

Each rung is one line, and the fields are atomic: `bg` / `fg` · contrast · L (the
ink's OKLCH lightness) · `rules` (the `muted` role against that ground) · `share`
(`muted ÷ ink`).

- **0 · control — Ghostty's default** · `#282c34` / `#ffffff` · 14.0:1 · L 1.000 · rules 1.82 · share 0.13
- **1 · ink off-white** · `#282c34` / `#dcdfe4` · 10.5:1 · L 0.903 · rules 1.82 · share 0.17
- **2 · ink softer** · `#282c34` / `#cfd3d8` · 9.3:1 · L 0.865 · rules 1.82 · share 0.20
- **3 · ink grey, evening only** · `#282c34` / `#b8bcc2` · 7.3:1 · L 0.794 · rules 1.82 · share 0.25
- **4 · ground deeper** · `#23272e` / `#c8ccd4` · 9.3:1 · L 0.844 · rules 1.95 · share 0.21
- **5 · deep and dim, night or OLED** · `#1b1e24` / `#a9aeb8` · 7.5:1 · L 0.750 · rules 2.18 · share 0.29
- **6 · warm ground, cream ink** · `#262320` / `#d6cfc4` · 10.1:1 · L 0.857 · rules 2.04 · share 0.20
- **7 · lifted ground — do not use** ✗ · `#343a45` / `#d4d8de` · 8.0:1 · L 0.881 · rules 1.49 · share 0.19

**A foreground change is surgical; a background change is not.** Rungs 1–3 move
prose and leave every role's contrast against the ground untouched — heading
stays 8.29, amber stays 10.74, on all three. Rungs 4–6 move the whole page,
accents included: deepening the ground *raises* the loudest accents (amber reaches
12.8:1 at rung 5) while lowering total emitted light. So:

- If the problem is **contrast** — pure white at 14:1 — rung 1 fixes it and the ground is fine forever.
- If the problem is **brightness** — total light — rungs 4 and 5 are the lever, at the cost of louder accents.

## The paste block

Two ways, one source. Paste the block below into
`~/.config/ghostty/config.ghostty` (or `~/Library/Application Support/com.mitchellh.ghostty/config.ghostty`;
both are loaded, the macOS one last) — or take the file itself, which carries no
markdown fences: `just ground` prints it, and it lives at
`docs/2026-10-28-ghostty-ground.conf`.

Every line is a comment, so pasting is a no-op until you uncomment exactly one
pair. That is the whole dogfood loop: **uncomment two lines, reload, look** —
comment them again, uncomment the next pair, reload.

```ini
# ── okuda · the ground you read on ─────────────────────────────────
# Nothing here is active: every line is a comment. Uncomment exactly ONE
# pair — the two lines `background` and `foreground` — then reload:
#   macOS  cmd+shift+,      Linux  ctrl+shift+,      (action: reload_config)
# Uncommenting two pairs does not compare them: the later key wins silently
# and you will judge the wrong rung. A bare `foreground =` resets to default.
#
# Try 1, then 4, then 5. Stop when it stops bothering you.
#
#   n  bg / fg                ratio    L       rules   what it is
#   0  #282c34 / #ffffff     14.0:1  1.000   1.82    control — Ghostty's default
#   1  #282c34 / #dcdfe4     10.5:1  0.903   1.82    ink off-white
#   2  #282c34 / #cfd3d8     9.3:1   0.865   1.82    ink softer
#   3  #282c34 / #b8bcc2     7.3:1   0.794   1.82    ink grey, evening only
#   4  #23272e / #c8ccd4     9.3:1   0.844   1.95    ground deeper
#   5  #1b1e24 / #a9aeb8     7.5:1   0.750   2.18    deep and dim, night or OLED
#   6  #262320 / #d6cfc4     10.1:1  0.857   2.04    warm ground, cream ink
#   7  #343a45 / #d4d8de     8.0:1   0.881   1.49    lifted ground — do not use ✗
#
# rules = the `muted` role (#445566 — horizontal rules, table pipes)
# against that ground. It is the binding constraint: a lighter ground
# erases the structure while prose stays legible, which is why 7 is out.
# why:   docs/2026-10-28-the-ground-you-read-on.md
# made:  scripts/contrast.ts (`just contrast`) · ADR-GLASS-INK-073
#
# Second dial, and it is okuda's rather than the terminal's: prose weight
# relative to the accents — { "body": "#cfd3d8" } in ~/.config/okuda/palette.json

# 0 — control — Ghostty's default
# background = #282c34
# foreground = #ffffff

# 1 — ink off-white
# background = #282c34
# foreground = #dcdfe4

# 2 — ink softer
# background = #282c34
# foreground = #cfd3d8

# 3 — ink grey, evening only
# background = #282c34
# foreground = #b8bcc2

# 4 — ground deeper
# background = #23272e
# foreground = #c8ccd4

# 5 — deep and dim, night or OLED
# background = #1b1e24
# foreground = #a9aeb8

# 6 — warm ground, cream ink
# background = #262320
# foreground = #d6cfc4

# 7 — lifted ground — do not use ✗
#     the rules erode: `muted` falls to 1.49 against the ground
# background = #343a45
# foreground = #d4d8de
```

No restart. `reload_config` re-reads the file in place, and colours are in the
live-reloadable class — the options that demand a restart or a new surface are the
ones touching the GPU pipeline or the font (`background-opacity` on macOS,
`font-size` for surfaces you have resized by hand, `language`).

## How to judge it

Two corpora, because a ground interacts with each differently:

```bash
okuda docs/style-guide.md --tui    # prose-heavy, and the demo of itself
okuda '&briefs.md'                 # tables, amber keys, state glyphs, rules
```

Three failure signs, in the order they appear:

1. **Rules disappear** — the ground is too light (`share` climbing while `rules` falls).
2. **Headings lose their blue** against the amber — the ground is too warm; the golds keep their luminance and lose their hue separation.
3. **Prose reads grey and the accents do all the talking** — ratio below about 8, and you are reading annotation rather than prose.

## What not to do

- **Do not raise `minimum-contrast`.** It is a floor, not a ceiling: when the ratio is *below* the setting it pushes text toward black or white. The default `1` is no enforcement. At any value above it, it will drag your carefully chosen ink back toward white — the exact failure you are fixing.
- **Do not judge with `background-opacity` below 1.0.** The effective ground is then your wallpaper, and every number above is a lie. Set it to `1.0` while choosing, and put it back after.
- **Do not edit okuda's palette for this.** A palette hex is a *relation* between roles; a ground is the terminal's. Mixing them is how a page ends up tuned to one machine.
- **Do not lift the ground** (rung 7). Contrast improves, structure decays — and structure is the thing prose is read *against*.

## When the pair is not enough

If prose is comfortable but still louder than the accents you want it to sit behind,
that is okuda's own dial and it composes with the terminal's:

```json
{ "body": "#cfd3d8" }
```

in `~/.config/okuda/palette.json`. It dims prose without touching the ground, ships
empty by default (so okuda asserts no absolute ink), and is the one place where
okuda is allowed an opinion about weight — because no terminal can express *"my
prose should be quieter than your amber"*: prose, a heading and an emphasis are all
its foreground.

## Out of scope, stated

**A dark ground only.** okuda's role hexes are tuned for one — heading `#99ccff`,
code `#ffcc99`, table-header `#c8b878` are all near-invisible on white. Light is a
palette nobody ships here, and the terminal's own theme is where it would begin
(`docs/glow-vs-okuda.md`).

**These pairs are okuda-judged.** The ratios apply to any terminal; the *choice* was
made so that okuda's hierarchy survives, and another toolchain's binding constraint
is a different role. The instrument is general — `just contrast` reads the palette
it ships with. Fork the list, not the method.
