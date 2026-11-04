# Colour — a ranking, not a set of swatches

> Status: **findings and proposals**, 2026-11-03. Human-facing. The claim of
> this page: almost every colour argument goes wrong because it treats a palette
> as a set of colours when it is a **ranking**, and the ranking is expressed as
> ratios against the *ink* — which a document renderer inherits and cannot see.
> Four words carry the argument — **ground**, **ink**, **role**, **rank** — and
> they are defined in [concepts and terms](concepts-and-terms.md), under *Colour*.
> Four tools come out of it: `scripts/contrast.ts` (the reading, `just surface` /
> `just ranking`), `scripts/herdr-theme.ts` (the fix for the app),
> `scripts/omarchy-theme.ts` (the same pair delivered into a re-theming desktop's
> own override, `just ground --omarchy`), and `just surface-probe` (the receipt).
> Measurements are printed by those scripts, not typed here.

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

## Prior art — three layers, three owners

The finding is not a discovery, and saying so first is the honest form. It was
solved at three layers, decades apart, and each solution is correct *at its own
layer* — which is why the defect survives between them.

**Solarized (Ethan Schoonover, 2011) — the ranking, bought by owning both ends.**
From the design page (`ethanschoonover.com/solarized`), the construction is
lightness *deltas*, not colours:

> The monotones have symmetric CIELAB lightness differences, so switching from
> dark to light mode retains the same perceived contrast in brightness between
> each value.

and the role rule that exists to protect the order:

> the normal relationship for background and body text is `base03:base0` (please
> note body text is **not** `base00`) … The L\*a\*b lightness difference between
> `base03:base0` and `base02:base1` is identical by design, resulting in identical
> readability against both normal and highlighted backgrounds.

That is a palette defined as an **order with prescribed deltas**, plus a role
assignment chosen so the order survives a change of ground. It is also why the
solution is not available to us as written: Solarized owns the ink as well as the
roles, and it can flip modes because the *deltas* are symmetric. okuda's hexes are
single-mode, so its light-mode equivalent does not exist — a second palette would
be a second set of role meanings, which is the tax this page is about.

**base16 / tinted-theming (Chris Kempson, 2012→) — the slots, and silence on the
rank.** The spec (v0.4.2, `tinted-theming/home/styling.md`) assigns a construct to
each of sixteen slots and asks only that the monotones span the right direction:

> In order to create a dark scheme, colors `base00` to `base07` should span from
> dark to light. For a light scheme, these color should span from light to dark.

That is a contract about *within-scheme* ordering. It says nothing about a foreign
palette arriving with fixed accents and inheriting `base05` — and One Dark's
`base05` is `#abb2bf`, the exact hex that inverted this page. A perfectly
conformant scheme, and the defect walks straight through the contract.

**The accessibility line — text against its own background** (recollection,
unverified here): WCAG 2's contrast ratio, and APCA as drafted for WCAG 3, measure
legibility of text on the surface immediately behind it. Correct for reading.
Blind to the ordering *between roles*, which is what "everything shouts at once"
actually is.

Three layers, three owners, no invariant spanning them: the palette owner cannot
see the glass, the theme owner knows nothing of the roles, and the standard
measures a single pair. Each is right in isolation. The gap is in the between,
which is where this page lives.

## The correction — there is no "web" case, only terminals we cannot configure

This page originally imagined a *web* mode that could assert its own surface. That
was a category error worth recording: **the modern web is a terminal.** A
browser-hosted okuda runs in an xterm.js-class emulator, and Herdr's app renders
into a terminal like any other. So there is no second renderer to parameterise —
there is one renderer, and a class of host whose pair we cannot set. The missing
capability is not surface assertion; it is *the ability to fix the pair*, and it is
missing in exactly one place: an instance with no settings file the person knows
about.

## The base requirement, as three tests

Everything above is instrument. The requirement is narrower than the reasoning, and
worth stating in the form it would be judged in:

| Property | What it means | Measured |
|---|---|---|
| **Readable** | every role painted on the ground clears a floor | `just surface` — the floor reading |
| **Navigable** | the marks that carry navigation out-rank the prose | `just surface` — the ranking reading |
| **Recognisable** | the page reads as okuda from across the room | follows from fixed roles plus an intact order; not separately measured, deliberately |

Navigability is why this is not a matter of taste. Navigation in okuda is **painted**
— addresses, states and structure are colour — so if the prose rises above them the
page stops being navigable in the same way a removed underline stops a link being a
link.

Two roles are **exempt from the floor** and are printed as exempt rather than hidden,
because the control found them: `badge-fg` is painted on `badge-bg` and never on the
ground, and `muted` is the structural ink whose quietness the ground page treats as
the binding constraint (2.0–2.3 on a good ground). Lowering the floor for everything
to accommodate those two would have been the wrong repair.

## The reading — `just ranking`

```
just surface --theme <a host theme.json>     # both readings, one verdict
just surface --rung 8                        # a dogfooded pair
just surface --bg '#21252b' --fg '#abb2bf'
just ranking --theme <theme.json>            # the order alone, role by role
just surface --gate                          # exit 1 unless the recommended pair passes
```

Output is the palette in rank order, each role's `÷ ink`, and the crossings named.
The reference is the dogfooded pair (rung 8, `--ref-rung` to change it), because
*"louder than prose"* is a design choice nobody has to defend — a **change in
order** is the defect, and it needs no argument about taste.

`just check` runs `--gate` on the recommended pair, so a role hex that breaks the
page fails the build rather than a habit. The control runs first, in
`tests/ranking.test.ts`: the reference against itself
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

## Delivery — where the pair lands, per host

A pinned pair only helps if the thing that moves the surface *re-applies* it.
That is the difference between a paste and a delivery:

| host | where the pair lands | survives a theme switch? |
|---|---|---|
| Ghostty, hand-edited | `~/.config/ghostty/config` → `background` / `foreground` | yes — nothing rewrites it |
| Ghostty, re-themed desktop | `~/.config/omarchy/themed/ghostty.conf.tpl`, `just ground --omarchy --install` | **yes — re-applied by the very thing that changes the surface** |
| Herdr UI | `~/.config/herdr-app/themes/gloam.json`, `just herdr-theme --install`, selected by hand | only while the picker is not carrying the pair |
| anything else | nothing | `just surface-probe` says so, which is the point |

The re-themed case is the one the paste fails. Omarchy regenerates
`~/.local/state/omarchy/current/theme/ghostty.conf` on every switch from a
template, so a pair pasted into the terminal's own config wins until the next
keystroke and then loses **silently** — the ground page's own warning, *two pairs
do not compare: the later key wins*. The override template is the host's own
extension point, and it is re-applied by the theme switch, so there is nothing to
out-run.

**What moves is the neutral rank — four tokens, seven lines.** ANSI slots 0, 7, 8
and 15: the ground, the ink, the quiet ink and the bright ink. Slots 1–6 and 9–14
are the theme's identity and stay; the selection pair stays too, because it is a
self-consistent ground+ink pair whose extra loudness is the mark's job. **A
surface, not a palette** — and the line is drawn by role, not by taste.

Two of the four fail in *opposite* directions, which is why the first cut of this
delivery was wrong:

- `{{ bright_foreground }}` fails by going **dark**. The template spends it twice
  — `cursor-color` and `palette = 15` — and a light theme's bright foreground *is*
  a dark ink (flexoki-light `#100F0F` 1.17:1 on the reference ground;
  catppuccin-latte `#4c4f69` 2.05:1). Pinning only the pair leaves an invisible
  cursor on a pinned dark ground.
- `{{ muted }}` fails by staying **loud**. Its requirement is not legibility but
  rank — `muted ÷ ink`, which every shipped theme holds at **0.11–0.26** on its
  own ground. Pinned to a dark ground, flexoki-light's muted goes to 0.75,
  catppuccin-latte's to 0.71, rose-pine's to **0.95**: dim text at the prose's own
  loudness, the quiet register erased *by* the pin. A contrast test passes all
  three, which is exactly the wrong instrument — the ground page's own warning,
  that a ratio ranks nothing and this palette is a ranking.

So `muted` takes okuda's own quiet ink (`#445566`, share 0.20 on the reference
ground, 2.14:1 — inside every shipped theme's range and darker than tokyo-night's
1.84:1), and on a dark theme the change is a uniformisation rather than a repair.

**Measured on Omarchy, 2026-11-03.** The active dark theme (ristretto
`#2c2525` / `#e6d9db`) is already *readable and navigable* — the page is fine on a
dark desktop, which is why the complaint only arrives with a light one. Against
flexoki-light, **16 of 21** on-ground roles fall under 3:1; against
catppuccin-latte, **19**. That is the class a pin removes, and it is why the pin is
offered rather than argued.

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
5. **A light palette is out, and the question has been asked and answered.**
   This page said *"if a light class ever arrives in the wild, the instrument
   generates the palette to hit symmetric deltas."* It arrived on 2026-11-03, on
   a light Omarchy theme: **16 of 21** on-ground roles under 3:1 against
   flexoki-light, 19 against catppuccin-latte (`:239`). The answer was **not** a
   second palette — it was to pin the ground dark, into the host's own override
   point. The principal's ruling the same day: *the light preset is out.*

   The reasoning is the tax, paid in full: a light palette is a second set of
   role meanings, and the order would have to be re-authored rather than
   re-tuned (`conceptual-lexicon.md`, **TFS**). `ADR-GLASS-INK-073` closes the
   lightness family and keeps `body` empty by default; `BRF-PAIR-DELIVERED`
   puts *no light palette, and no second set of role meanings* out of scope. If
   the class returns, the answer stays the same: pin the ground, not the palette.
6. **Measure the glass, not the impression.** `herdr-app shot /tmp/ui.png`
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
- Solarized — `ethanschoonover.com/solarized`; base16 — `tinted-theming/home` (the
  prior art above, cited as ancestry rather than as ancestry's equal).
- `debriefs/2026-11-01-debrief-the-mark-that-was-already-decided.md` — the mark,
  and the first reading of the same evening, which blamed the ground.
