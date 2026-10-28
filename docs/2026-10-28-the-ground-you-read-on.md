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
- **8 · ground deeper still — best so far** · `#221f1c` / `#d6cfc4` · 10.6:1 · L 0.857 · rules 2.14 · share 0.20
- **9 · deeper again — the floor test** · `#1c1a17` / `#d6cfc4` · 11.2:1 · L 0.857 · rules 2.26 · share 0.20

**A foreground change is surgical; a background change is not.** Rungs 1–3 move
prose and leave every role's contrast against the ground untouched — heading
stays 8.29, amber stays 10.74, on all three. Rungs 4–6, 8 and 9 move the whole
page, accents included: deepening the ground *raises* the loudest accents (amber
reaches 12.8:1 at rung 5) while lowering total emitted light.

## The result, from the first reader

One principal, 2026-10-28, live in Ghostty:

- **1, 2, 3 — "too dim".** Every rung that dimmed the **ink** on an unchanged ground failed. The page emits the same light; only the prose recedes against accents that did not move. Dimming ink is not calming a page, it is demoting the prose on it.
- **4, 5, 6 — good; 6 best at the time.** Every rung that moved the **ground** passed.
- **6 → 8 — "a bit much", and 8 fixed it.** Rung 8 held the ink and deepened the ground; its *contrast went up* (10.1 → 10.6) while the page emitted less light. So the variable was total light, not contrast.
- **7 — "a glowing background effect sitting over the viewport like a glare reflection."** Not the failure this page predicted. On an emissive display a large grey area is a **lit rectangle**, and lifting the ground toward the surround makes it figure rather than ground. The structure measurement (rules 1.49, the weakest here) is the corroboration, not the cause.

Which yields the one rule this set actually earns, and it is not the ratio:

> **The ground is the lever, not the ink** — and never lift it. Ground L below about **0.27** stops reading as a lit panel; above about **0.29** it competes with the room. The control sits at 0.293, which is why it was too bright and why 7 at 0.347 glows. The winners sit at 0.24–0.26.

**And a limit on this instrument.** A contrast ratio is a luminance-only measure, so it could not rank these: rung 2 (9.3:1) was too dim and rung 8 (10.6:1) is the best so far, while rung 3 (7.3:1) and rung 5 (7.5:1) — 0.2 apart — were rejected and kept respectively. What separated them was the ground and its hue. Read the ratio as the **legibility floor** (below ~7 is where prose stops being read as prose) and the `L` column as the **comfort axis**. They are different questions, and this set was ranked by the wrong one first.

## Walking the ladder — the method, recorded before the verdicts

The band this set brackets is narrow, and the ladder is **not a ramp**: every step
deeper raises the prose's contrast (the ink is held, the ground darkens) and raises
the rules and the amber in lockstep. Going past the band does not relax the page,
it rebuilds the glare you started with on a blacker ground.

| rung | `L_bg` | prose | rules | amber |
|---|---|---|---|---|
| 0 | 0.293 | 14.0:1 | 1.82 | 10.7 |
| 6 | 0.258 | 10.1:1 | 2.04 | 12.0 |
| 8 | 0.242 | 10.6:1 | 2.14 | 12.6 |
| 9 | 0.219 | 11.2:1 | 2.26 | 13.3 |

**The stop rule, stated in advance.** Stop when prose ratio re-passes about
**12:1**, or ground L approaches **0.20** — whichever comes first. Below that
band you are not gaining comfort, you are gaining contrast against a darker
ground. The comfort band is **ground L 0.24–0.26 at 10–11:1**; rungs 1–3 miss it
by lowering contrast, rung 9 and beyond miss it by raising it.

**Walk one rung a day, not per sitting.** Consecutive rungs are 0.016–0.023 apart
in ground L, and the eye's reference drifts by more over an evening — the first
reader saw rung 6 "seem a bit much" within minutes and then settle. A fast walk
compares against memory and reports nothing. The alternative that costs nothing:
compare each rung against a **fixed reference** (the control, or the rung you
settled on), never against the step you just came from.

**Watch the amber, not the prose.** `state-todo` crosses 13:1 before anything on
the page *looks* wrong, because deepening raises every role's contrast at once.
When the amber reads hotter than the heading, you are past the band.

**One item is coupled to where you stop.** `muted` is hue **249°** — a cool blue
— against a warm ground (~67°) and a warm ink (~79°). Nothing fails, but as the
ground deepens that role gets *more* conspicuous (1.82 → 2.26 across the set), so
the decision about its hue belongs at whatever ground you settle on, not before.
`#5a4f45` is the same lightness family, warm; it is the one remaining variable
that is okuda's rather than the terminal's.

The verdicts land in **The result** above as they arrive. This section is the
method, not a finding: the record is written for an experiment that has not
finished, and that is the one thing an ADR cannot do (`ADR-PANE-NOT-CANVAS-069`:
a record written first is a proposal wearing a decision's clothes).

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
# The ground is the lever, not the ink. Every ink-only rung (1-3) was
# rejected as the prose receding; every deepened ground was kept. 8 is the
# best so far. Ground L below ~0.27 stops reading as a lit panel; above
# ~0.29 it competes with the room, which is why 7 glows.
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
#   8  #221f1c / #d6cfc4     10.6:1  0.857   2.14    ground deeper still — best so far
#   9  #1c1a17 / #d6cfc4     11.2:1  0.857   2.26    deeper again — the floor test
#
# rules = the `muted` role (#445566 — horizontal rules, table pipes)
# against that ground: structure, and the corroborating measure.
# 7 is refused because the ground *glows* — see the note on its line.
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
#     the ground reads as emitted light — a lit rectangle over the viewport; its rules are also the weakest in the set (1.49)
# background = #343a45
# foreground = #d4d8de

# 8 — ground deeper still — best so far
# background = #221f1c
# foreground = #d6cfc4

# 9 — deeper again — the floor test
# background = #1c1a17
# foreground = #d6cfc4
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
3. **The prose recedes and the accents do all the talking** — the ink went down while the ground stayed put. Not a ratio: rung 3 at 7.3:1 and rung 5 at 7.5:1 produced opposite verdicts, because one dimmed the ink and the other the page.

## What not to do

- **Do not raise `minimum-contrast`.** It is a floor, not a ceiling: when the ratio is *below* the setting it pushes text toward black or white. The default `1` is no enforcement. At any value above it, it will drag your carefully chosen ink back toward white — the exact failure you are fixing.
- **Do not judge with `background-opacity` below 1.0.** The effective ground is then your wallpaper, and every number above is a lie. Set it to `1.0` while choosing, and put it back after.
- **Do not edit okuda's palette for this.** A palette hex is a *relation* between roles; a ground is the terminal's. Mixing them is how a page ends up tuned to one machine.
- **Do not lift the ground** (rung 7). It reads as emitted light: a lit rectangle over the viewport, glare rather than ground. Contrast "improves" while the page becomes an object; the structure decays too, and both are reasons not to.

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
