---
type: Playbook
callsign: PLY-OMARCHY
---

# Omarchy playbook — the host that re-themes itself

**Date:** 2026-11-04
**Covers:** Omarchy as a host for okuda. The pair, the font, the override, and the
one environment variable that makes `omarchy-theme-set` lie.

## How the terminal's colours arrive

Omarchy does not let a person edit the terminal's colours. It **generates** them:

```
~/.config/ghostty/config
  config-file = ?"~/.local/state/omarchy/current/theme/ghostty.conf"     ← generated
/usr/share/omarchy/default/themed/ghostty.conf.tpl                       ← the template
~/.config/omarchy/themed/ghostty.conf.tpl                                ← the override
```

The generated file is rewritten from the template **on every theme switch**, so a
pair pasted into `~/.config/ghostty/config` wins until the next switch and then
loses silently — the ground page's own warning, *two pairs do not compare: the
later key wins*.

The override takes priority over the built-in template **and is re-applied by the
very thing that changes the surface**. That is why the delivery goes there
(`ADR-GLASS-INK-073`; `BRF-PAIR-DELIVERED`). The override name keys on the output
**file**, not the theme name: `ghostty.conf.tpl`, not `ristretto.tpl`.

## Delivering the pair

```sh
just ground --omarchy --install      # writes ~/.config/omarchy/themed/ghostty.conf.tpl
```

It substitutes three tokens and leaves every other byte alone — `{{ background }}`,
`{{ foreground }}`, `{{ muted }}`, `{{ bright_foreground }}` — so `palette = 0` is
the ground and `palette = 7` is the ink, in a fence as on the page. The script is
`scripts/omarchy-theme.ts`; its header carries the measurements behind each token
(notably: a light theme's *bright foreground* is a dark ink, so pinning only the
pair leaves an invisible cursor).

**Verified 2026-11-04, on the box:** with the desktop theme set to **flexoki-light**
(`colors.toml`: `background = "#FFFCF0"`), the regenerated
`~/.local/state/omarchy/current/theme/ghostty.conf` still read
`background = #221f1c / foreground = #d6cfc4`. The ground did not move.

**Revert:** delete `~/.config/omarchy/themed/ghostty.conf.tpl` and re-apply the
theme. The surface returns to the theme's own pair on the next switch.

## The trap: `omarchy-theme-set` needs `OMARCHY_PATH`

Over `ssh` (a non-interactive shell) `$OMARCHY_PATH` is unset, so the script
resolves `$OMARCHY_PATH/themes` to `/themes/` and reports:

```
find: '/themes/': No such file or directory
Theme 'ristretto' does not exist
```

The theme exists. Run it with the path:

```sh
ssh omarchy 'OMARCHY_PATH=/usr/share/omarchy omarchy-theme-set ristretto'
```

Cost of not knowing: one wrong diagnosis ("the theme is gone") and a search for a
theme that was never missing.

## Reading it back

```sh
just surface-probe omarchy        # follows the config-file include, reports the pair + verdict
just fonts omarchy                # the machine's font set vs what we emit
```

`probe-surface` reads the `config-file` include on purpose: without it, Omarchy's
ghostty config reports *"inherits its terminal's defaults"*, which is wrong twice —
it does inherit a pair, and that pair moves.

## The font

`~/.config/ghostty/config` currently sets `font-family = "JetBrainsMono Nerd Font"`.
Measured against okuda's emitted set it misses `☐ ⸮ ṁ ₐ ₓ ₘ ∝`
(`docs/2026-11-04-font-coverage.md`). Changing it is the host's act, not okuda's:
`just fonts omarchy --family "…"` is the check, and the recommendation is a named
face with one named alternative — never an assertion in the renderer.

## The rule for crossing into this machine

Read over `ssh`; write only with a declaration — what was written, where it
landed, and that the receiver owns it (`AGENTS.md`, the seam rule). The override
is regenerable in one command, so a copy is a message and never a symlink.
