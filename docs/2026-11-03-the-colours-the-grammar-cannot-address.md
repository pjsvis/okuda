---
type: Reference
---

# The colours the grammar cannot address

**Date:** 2026-11-03
**Provenance:** preserved from `cool-pi-extensions` when its okuda-theme playbook
was removed (`cool-pi-extensions/decisions/026-the-palette-belongs-to-okuda.md`).
**Status:** reference — the palette's second layer, and the residue of a second
source of truth.

---

## Why this record exists

The palette has been expressed in two silos. `src/palettes/okuda.json` names the
colours the **markdown grammar can address** — headings, links, table roles,
diagram channels, the state lamps. `cool-pi-extensions/themes/okuda.json` carried
the same structural hues *plus* the colours a **host UI** needs and a document
never does: panels, hover surfaces, a second receding slate, an alert pair.

That sibling repo's playbook declared its own `vars` the *operational source of
truth* and this repo's preset the *aesthetic origin* — authority pointed the wrong
way. The playbook is gone; the colours it held are here, because a colour is
palette knowledge and this is the palette's owner.

**The token mappings are deliberately not copied.** Which Pi token or herdr token
consumes which colour is host knowledge and lives with the artefacts —
`cool-pi-extensions/themes/okuda.json` and `cool-pi-extensions/herdr/okuda-theme.toml`.
Duplicating them here would recreate exactly the second store this record exists to
retire.

## The two layers

From `cool-pi-extensions/decisions/024-okuda-pi-theme-alert-trio.md`, which stands
unchanged:

| layer | colours | rule |
|---|---|---|
| **structural chrome** | the six Okuda hues, the indigo panel, the receding slates | few colours; this is where the LCARS look comes from |
| **semantic state** | the LCARS alert trio — red alert, green secure, amber caution | never folded into the amber family, or tool outcomes become a glance-indistinguishable wash |

**This repo's palette has no alert trio, and that is not a drift to close.** The
renderer never signals tool state; a host UI does. The asymmetry is the correct
consequence of two different surfaces.

## The colours, with this repo's role names where they exist

| var | hex | in `okuda.json`? | role in the host UI |
|---|---|---|---|
| `slateBlue` | `#99ccff` | **yes** — `heading` | headings, section markers, workspace names |
| `amber` | `#ffaa00` | **yes** — `badge-bg`, `diagram-arrow` | primary accent, LCARS label fill |
| `yellow` | `#ffcc66` | — | warm data |
| `cream` | `#ffcc99` | **yes** — `code-text` | readouts, code text |
| `cyan` | `#66ddff` | **yes** — `link` | navigation, links, unseen notifications |
| `peach` | `#ff9966` | **yes** — `link-text` | secondary navigation, interrupted/warning |
| `indigo` | `#1a1530` | — | panels — the LCARS code-panel affordance |
| `indigoLift` | `#2a2540` | — | selected / hover surfaces |
| `slateDark` | `#445566` | **yes** — `muted` | receding — separators, dim |
| `slateMid` | `#7788aa` | — | receding — muted text |
| `slateBlueBorder` | `#5e8bbf` | **yes** — `diagram-border` | borders |
| `lcarsGreen` | `#5fd9a0` | — | success, idle/done |
| `lcarsRed` | `#ff6b6b` | — | error, needs attention |
| `lcarsGreenBg` | `#1a2a20` | — | success panel ground |
| `lcarsRedBg` | `#2a1a1a` | — | error panel ground |
| `black` | `#000000` | **yes** — `badge-fg` | on-amber label fill only |

Two of the eight colours this repo does not carry are **retired roles, not new
inventions**:

- `slateMid #7788aa` was `blockquote` here until 2026-10-09 (`2d23910`, *the quote
  cue takes the aside's own ink*), when the role moved to `#e0b45c`. The host UI
  kept the old value as a second receding step, because a UI has more surface to
  recede across than a document does.
- `lcarsRed #ff6b6b` is **not** this palette's `alert`. This repo's `alert` is
  `#ff5555`, which is Dracula's red. The host pair is a separate, lighter red.

## Provenance: they are not Dracula

The working guess was that the extra colours were Dracula's. Measured 2026-11-03 —
OKLab ΔE from each to its nearest of the eleven Dracula spec hexes:

| var | hex | nearest Dracula | ΔE | verdict |
|---|---|---|---|---|
| `lcarsGreen` | `#5fd9a0` | `green #50FA7B` | **11.4** | not Dracula |
| `indigo` | `#1a1530` | `background #282A36` | **7.7** | not Dracula |
| `slateMid` | `#7788aa` | `comment #6272A4` | **7.1** | not Dracula |
| `lcarsRedBg` | `#2a1a1a` | `background #282A36` | **6.2** | not Dracula |
| `yellow` | `#ffcc66` | `orange #FFB86C` | 5.2 | Dracula-ish |
| `lcarsGreenBg` | `#1a2a20` | `background #282A36` | 4.9 | Dracula-ish |
| `lcarsRed` | `#ff6b6b` | `red #FF5555` | 3.9 | Dracula-ish |
| `indigoLift` | `#2a2540` | `background #282A36` | 2.9 | Dracula-ish |

**They are LCARS-family variants, not Dracula.** The greens and reds are 4–11 ΔE
from Dracula's, and the grounds are related to Dracula's background *in role*, not
in value. Where this repo does hold Dracula, it says so: `--palette dracula` is a
named preset (`DRACULA_PALETTE`), and `alert #ff5555` is Dracula's red verbatim.

The reading worth keeping: the extras are the amber/cream/peach ramp extended, an
indigo panel pair, a second receding slate, and a state pair — which is what a UI
needs and a markdown grammar does not.

## The four grounds pass the instrument

Every ground the host theme introduced is a **legal okuda ground**. Measured with
`just surface`, each paired with the recommended ink `#d6cfc4`:

| ground | ratio | verdict |
|---|---|---|
| `#1a1530` `indigo` | 11.4:1 | readable, navigable |
| `#2a2540` `indigoLift` | 9.5:1 | readable, navigable |
| `#1a2a20` `lcarsGreenBg` | 9.7:1 | readable, navigable |
| `#2a1a1a` `lcarsRedBg` | 10.8:1 | readable, navigable |

`#1a1530` also sits inside the ground band `#000000`–`#181818` measured for the
page. So the Pi theme is not a parallel palette on a different footing — it is a
working precedent for the per-host pair work of `BRF-PAIR-DELIVERED`.

One asymmetry to keep in view: **the Pi theme owns a ground and inherits its ink.**
Its `text` token is `""`, the terminal default — the half-owned pair the same
instrument warns about. It is legal today only because the host's ink happens to
clear the floor on those grounds.

## The thinking ramp

Seven perceptually-ordered steps, cool to warm, all in-family — a *palette* fact,
not a token mapping, and the reason the host theme needed more colours than a
document:

```
off #445566  →  min #7788aa  →  low #66ddff  →  med #ffcc99
             →  high #ffcc66  →  xhigh #ffaa00  →  max #ff9966
```

Note the ends: `off` is this repo's `muted`, and `max` is `link-text`. The ramp is
built from structural hues that already existed; only the two middle steps
(`#ffcc66`, and `#7788aa` as a step) are new.

## Direction of sync

A structural hue change starts in `src/palettes/okuda.json`, then propagates into
the host artefacts in `cool-pi-extensions`. **Never the reverse.** The alert trio
is that repo's invention and has no upstream here.

## Related

- `cool-pi-extensions/decisions/026-the-palette-belongs-to-okuda.md` — the removal and the reason.
- `cool-pi-extensions/decisions/024-okuda-pi-theme-alert-trio.md` — the two-layer rule.
- `docs/2026-09-05-palette-page.md` — the same roles in OKLCH; the relative axis.
- `docs/2026-10-28-the-ground-you-read-on.md`, `explainers/colours.md` — the ranking, and why the ink outranks the ground.
- `briefs/2026-11-03-brief-pair-delivered.md` — the open brief the grounds bear on.
- `.archive/briefs/2026-11-01-brief-surface-pair.md` — the settled position on the pair.
