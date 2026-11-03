---
type: Brief
callsign: BRF-PAIR-DELIVERED
---

# Brief: The pair, delivered where it lands — the re-themer's own override point

**Date:** 2026-11-03
**Status:** Open

---

## Context

`BRF-SURFACE-PAIR` (Done, 2026-11-01) settled the position: the pair is
**recommended, not asserted**. `just ground` prints a paste-me Ghostty `.conf`,
`scripts/herdr-theme.ts --install` writes a host theme, and
`just surface --gate` guards `just check`. Both artefacts need a human to paste
or select them.

That works on a machine whose terminal config is edited by hand. It does not
survive one whose terminal is **re-themed by a desktop**. Omarchy regenerates the
terminal's colours on every theme switch, and `just surface-probe` on this box
reports `~/.config/ghostty/config` present with **no pair stated — it inherits
its terminal's defaults**. The recommended pair is nowhere applied, and the theme
moved twice in a single session (Rose Pine, then Ristretto). Measured 2026-11-03.

## Warrant

The open question the withdrawn `BRF-STATED-GROUND` left behind, and the one
`BRF-SURFACE-PAIR` does not answer: *does a recommendation reach a desktop that
re-themes itself?*

Answering it needs no reversal. The pair stays recommended; it is **delivered
into the host's own extension point** instead of into a file the host overwrites.

## Objective

Deliver the recommended pair into the override mechanism of every host Gloam
actually appears on, and make the delivery checkable by the instrument that
already judges a pair.

## Evidence

| what | where it is | why the recommendation does not stick |
|---|---|---|
| Ghostty (Omarchy) | `~/.config/ghostty/config` sets `config-file = ?"~/.local/state/omarchy/current/theme/ghostty.conf"` | Omarchy rewrites that file on every theme switch |
| the built-in template | `/usr/share/omarchy/default/themed/ghostty.conf.tpl` | `background = {{ background }}`, `foreground = {{ foreground }}` — the placeholders *are* the volatility |
| the override point | `~/.config/omarchy/themed/<name>.tpl` | takes priority over the built-in and is re-applied on every theme switch |
| Herdr UI | `themes/<name>.json` | `herdr-theme.ts --install` writes one; **nothing selects it**, and the picker overrides the pair |
| Herdr, upstream | — | `docs/2026-11-01-issue-herdr-surface.md` — drafted, **not filed** |

The mechanism is verified against Omarchy's own sample
(`~/.config/omarchy/themed/alacritty.toml.tpl.sample`), which documents the
variables, the priority rule, and the re-apply-on-switch behaviour.

`just surface-probe`, this machine, 2026-11-03: ghostty, alacritty and kitty are
each `present, no pair stated`.

## Scope

**In:**

- `scripts/omarchy-theme.ts`, or an extension of `contrast.ts`: emit a pinned user
  template from the built-in one — copy it, replace `{{ background }}` and
  `{{ foreground }}` with the rung's literals, leave every `{{ colorN }}` alone.
  The discipline is `herdr-theme.ts`'s: **pin the surface, not the palette.**
- `just ground --omarchy`: print, or write into `~/.config/omarchy/themed/`, then
  say what was written, where, and that the receiver owns it (the seam rule,
  `AGENTS.md`).
- A receipt: `just surface-probe` already reads the pair a machine is actually
  using. Wire its verdict so drift is *reported* rather than discovered as a
  broken render.
- `explainers/colours.md`: the delivery story, in one paragraph — where the pair
  lands per host, and which of those survive a theme switch.
- Filing `docs/2026-11-01-issue-herdr-surface.md`. The operator files it; it is
  recorded here because it is the highest-leverage item in the list.

**Out:**

- **No surface assertion in the renderer.** No SGR ground pass, no `--ground`
  flag, no change to any role hex. `BRF-STATED-GROUND` was withdrawn for exactly
  this reason (`.archive/briefs/2026-11-03-brief-stated-ground.md`).
- **No light palette**, and no second set of role meanings.
- **No OSC**, set or queried.
- **No theme collection.** One pair, delivered per host we actually use. The line
  is whether a human ever edits a hex by hand; if one does, it is a parallel
  store and it dies.
- No change to `scripts/contrast.ts`'s readings, `FLOOR`, or `NOT_ON_GROUND`.

## Preconditions

- [x] `just check` green at the branch point. It was **red on `origin/main`** when
      this brief was drafted — two inherited failures, both repaired 2026-11-03: a
      retired term in `scripts/invariants-testcard/README.md`, and the
      conformance plate missing from `scripts/elision-baseline.json`.
- [ ] Read the `omarchy` skill before touching `~/.config/omarchy/` — the
      template rule is its subject.
- [ ] Confirm the built-in `ghostty.conf.tpl` still pins `background` and
      `foreground` at lines 1–2, and that no
      `~/.config/omarchy/themed/ghostty.conf.tpl` exists yet. Both hold as of
      2026-11-03.
- [ ] The rung is chosen by `just surface --gate`, not by memory. Rung 8
      (`#221f1c` / `#d6cfc4`, *ground deeper still — best so far*) was the
      dogfooded reference on 2026-11-01.

## Work Plan

1. [ ] `--omarchy` emitter: built-in template in, pinned template out. Pure, with
       the placeholder substitution table-tested.
2. [ ] The install path, carrying the seam sentence — what, where, whose it is.
3. [ ] Verify by switching a theme: the ground must not move. That is the
       acceptance test, and it is the one the paste-me `.conf` fails.
4. [ ] Wire the `just surface-probe` verdict so a drifted machine is reported.
5. [ ] `explainers/colours.md` gains the per-host delivery table.
6. [ ] File the Herdr issue.
7. [ ] `just check` green; `bun test` green.

## Acceptance Criteria

- After `just ground --omarchy` and **a theme switch**, `just surface-probe`
  reports the recommended pair and `just surface` returns **readable and
  navigable**.
- The generated template differs from the built-in in exactly two values, and a
  test asserts that.
- The built-in template is the emitter's source, never a hand-copied file — a
  test fails if the two drift.
- No role hex changes, no renderer colour change, no OSC on any path.
- `just check` passes.

## Notes

- **The trap this brief exists to avoid.** A pinned `.conf` pasted into
  `~/.config/ghostty/config` fights Omarchy's dynamic file, and the ground
  `.conf`'s own comment names the mechanism: *"Two pairs do not compare: the later
  key wins silently."* A silent win is why the drift is invisible.
- **Why the host's override point beats a flag.** The override is re-applied by
  the very thing that changes the surface. Anything okuda asserts competes with
  that thing, and the competitor loses on the next switch.
- **The upstream issue is not the workaround's twin.** If Herdr lets ink and
  ground be set independently of the theme, most of this brief's Herdr half
  retires. File it first.
- **A separate defect, recorded so it is not lost.**
  `scripts/invariants-testcard/2026-11-02-figure-ground-benchmark.md` is a
  *pasted* deliverable — it opens with *"Here are the two deliverables ready to
  drop straight into your working directory"* and nests a fenced markdown block.
  It is an instrument, and it is now baselined for elision, but its envelope
  prose belongs in a `docs/` record, not in the testcard. Not fixed here.

## Related

- `BRF-SURFACE-PAIR` — `.archive/briefs/2026-11-01-brief-surface-pair.md`, the position this delivers, unchanged.
- `ADR-GLASS-INK-073` — the ground is the glass's; this brief does not contest it.
- `docs/2026-11-03-okuda-light-theme-discussion.md` — the observation that prompted it.
- `docs/2026-11-01-issue-herdr-surface.md` — the upstream ask to file.
- `docs/2026-10-28-the-ground-you-read-on.md`, `explainers/colours.md` — the reading and the principle.
- `playbooks/gloam-launcher-playbook.md` — the host integrations; the `omarchy` skill.
