# Colour — a ranking, not a set of swatches

> Status: **findings and proposals**, 2026-11-01. Human-facing. The claim of
> this page: almost every colour argument goes wrong because it treats a palette
> as a set of colours when it is a **ranking**, and the ranking is expressed as
> ratios against the *ink* — which a document renderer inherits and cannot see.
> Two tools come out of it: `scripts/contrast.ts --theme` (the reading) and
> `scripts/herdr-theme.ts` (the fix). Measurements are printed by those scripts,
> not typed here.

## The finding, in one table

A mark landed in okuda's footer — a bare rose `§` beside the file name, meaning
*you are inside an address* (`ADR-DEREFERENCE-MARK-075`). On the tuned pair of
colours it read correctly. In Herdr's new **UI**, the same document, the same
hexes, read *blown out*. Nothing in okuda had changed.

| pair | ink | heading | vector | heading ÷ ink |
|---|---|---|---|---|
| tuned — `#221f1c` / `#d6cfc4` | 11.2 | 10.3 | 6.5 | **0.92** |
| Herdr UI default — `#21252b` / `#abb2bf` | 7.2 | 9.1 | 5.7 | **1.26** |

The coloured roles barely moved (heading 10.3 → 9.1 against a changed ground).
The **ink** moved: OKLCH L 0.857 → 0.762, one rung down the ladder. Every accent
then sat *above* the prose it annotates. Nothing got brighter. **The order
inverted**, and an inverted order is what the eye calls blown out.

That is the whole mechanism, and it is a property of the design rather than a bug
in it: prose ships as an empty role so the renderer emits no colour and inherits
the terminal's foreground (`src/palette.ts:17-20`), because the renderer cannot
see the glass's background (`ADR-GLASS-INK-073`). The palette's hexes are fixed;
the ink is the one variable a host supplies. So a host can re-rank the entire
corpus by changing one value, and nothing anywhere objects.

## Why the ground is the less interesting variable

On the tuned ink, swapping the ground from `#221f1c` to atom-one-dark's `#21252b`
crosses **no** role's rank and moves the ranking by less than a seventh. Swapping
the *ink* crosses twelve. The ground sets the page's loudness; the ink sets its
**order**. Almost every colour complaint — "too bright", "washed out", "harsh" —
is a loudness complaint and gets fixed by the ground. The one that is not,
"everything shouts at once", is an order complaint and is fixed by the ink.

That is why the earlier reading in `DBF-DEREFERENCE-MARK` blamed the ground and
was wrong: chroma on a loud ground explains *vibration*, and it does not explain
an inversion. The instrument settles it in one command.

## The principle

> **A palette is a ranking, not a set of colours.** A role's meaning is its
> position relative to the prose: quieter than the ink, or louder, and by how
> much. Change the ink and you have rewritten every role's meaning at once.

This is the same rule the instrument already carried in miniature: `share =
muted ÷ ink`, *"above 1.00 a rule out-shouts prose: refused"*
(`docs/2026-10-28-the-ground-you-read-on.md`). The ranking is that rule applied
to the whole palette instead of one member of it.

It is also **TFS** in its most literal form (`conceptual-lexicon.md`): a theme is
a tax when it changes the mapping from role to meaning. A theme that supplies the
ink does exactly that, and it does it silently, to every document the person
owns.

## The reading — `just ranking`

```
bun scripts/contrast.ts --theme <a host theme.json>     # judge a theme's pair
bun scripts/contrast.ts --ranking --rung 4              # judge a dogfooded pair
bun scripts/contrast.ts --ranking --bg '#21252b' --fg '#abb2bf'
```

Output is the palette in rank order, each role's `÷ ink`, and the crossings named.
The reference is the dogfooded pair (rung 8, `--ref-rung` to change it), because
*"louder than prose"* is a design choice nobody has to defend — a **change in
order** is the defect, and it needs no argument about taste.

The control runs first, in `tests/ranking.test.ts`: the reference against itself
reports zero crossings and zero movement. Only then is the detector believed about
the defect — atom-one-dark's default pair crossing twelve roles, `heading` first
among them. A detector whose control fails is measuring itself.

One honest boundary: `link` sits at **0.98** on the reference — literally on the
ink line. So `link` tips across on a half-step that tips nothing else. That is not
fragility in the finding; it is a role that lives at the threshold, and the test
says so by name.

## The fix — `just herdr-theme`

```
bun scripts/herdr-theme.ts --explain            # the ranking, before and after
bun scripts/herdr-theme.ts --install            # write themes/gloam.json, and say where
```

The tool **pins the surface, not the palette**: it copies the theme already in use
and rewrites `background`, `foreground` and `cursor`, leaving the sixteen ANSI
slots alone — those belong to every other program in the pane, and nothing here
has evidence about them. The default pair is the dogfooded reference; `--rung`,
`--bg` and `--fg` override it.

`--install` writes a copy into `~/.config/herdr-app/themes/gloam.json`. That is a
crossing, so it declares itself: what it wrote, where it landed, that the file is
the receiver's now, and the one line of `settings.json` that selects it. It does
not select it, because selecting it is the person's act.

## The proposals

1. **Pin the pair once, above the themes.** `settings.json` accepts a theme name
   or `{light, dark}` plus colour overrides whose precedence matches fonts
   (`~/.config/herdr-app/AGENTS.md:608-616`). One edit, every theme, if the
   overrides accept `background`/`foreground`. Otherwise own one theme file
   (`--install`) and never sweep the shipped ones.
2. **Never use the theme picker while it carries the terminal pair.** A control
   whose blast radius is every document the person owns is not a cosmetic
   control. This is the architectural inversion: in the terminal the pair is
   pinned once in the host's config; in the app it is a property of a *theme*.
3. **Press the host to separate the two.** One sentence: *a theme must not decide
   the surface a document renders on, because the document's ink was chosen
   against that surface.* Herdr is Apache-2.0 and the argument is structural, with
   a measurement behind it — the only kind likely to land.
4. **Leave `minimum_contrast` at 1.** Above 1 the app **replaces** sub-threshold
   text with near-white or near-black (`~/.config/herdr-app/AGENTS.md:658-662`) —
   a flattening switch. Measured: on atom-one-dark's ground only `badge-fg` sits
   below 1.6:1, so it is not the current cause; but it would destroy the quiet
   rungs on purpose (`muted` at 2.0:1 draws every rule in the page). Same mistake
   in a different shape: a number rewriting the ink instead of respecting the
   ranking.
5. **Measure the glass, not the impression.** `herdr-app shot /tmp/ui.png`
   captures the app at physical pixels, no screen-recording permission needed
   (`~/.config/herdr-app/AGENTS.md:65-68`). Sample the pixel behind a document,
   compare with the theme's declared pair, apply, re-measure. The loop that fixed
   the terminal, with a number attached.

## What is deliberately not proposed

**Teaching okuda to paint its own background.** It would make the renderer wear
the host's coat (`ADR-GLASS-INK-073`), and it would put the ground in a repository
that cannot see the glass. The defence against a host that moves the ink is a
pinned pair in the host's own configuration — and a reading that says, in one
command, that the order just changed.

## Related

- `explainers/the-render-as-context.md` — why the renderer owns ink and not ground.
- `docs/2026-10-28-the-ground-you-read-on.md` — the grounds, measured as pairs.
- `conceptual-lexicon.md` — **TFS**, the tax this page is an instance of.
- `debriefs/2026-11-01-debrief-the-mark-that-was-already-decided.md` — the mark,
  and the first reading of the same evening, which blamed the ground.
