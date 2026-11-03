---
type: Brief
callsign: BRF-STATED-GROUND
---

# Brief: The stated ground — okuda supplies the surface its palette was drawn for

**Date:** 2026-11-03
**Status:** rejected — withdrawn the same day it was written

---

## Why this is withdrawn

Superseded by `BRF-SURFACE-PAIR` (Done, 2026-11-01), whose brief and instrument
were already on `main` and invisible to a working tree 45 commits stale.

It answers every part of this brief, in most cases with the same numbers:

| what this brief proposed | what already exists |
|---|---|
| "a census test with per-surface floors" | `scripts/contrast.ts` — `FLOOR`, `floor(ground)`, `surfaceVerdict(pair)`, `just surface --gate` |
| `badge-fg` is not a page-ground role | `NOT_ON_GROUND`, with the reason, found by the control |
| `muted` is a deliberately quiet exception | `NOT_ON_GROUND`, same table |
| the light-ground census | measured there: 16 of 23 roles under 3:1, `state-todo` 1.30:1, `heading` 1.69:1 |
| no light mode | refused in `explainers/colours.md`; `color-scheme: dark` is the position |
| no OSC | refused in `BRF-SURFACE-PAIR` (*no terminal interrogation*) |
| **assert the ground** | **refused**: *"one pair, asserted nowhere, recommended everywhere"* |

The one live question this brief raised that `BRF-SURFACE-PAIR` does not answer is
the **application** of the recommended pair — whether a generated host artefact
(`just ground`, `docs/2026-10-28-ghostty-ground.conf`) actually reaches a desktop
that re-themes itself, as Omarchy does. That is a question about delivery, not
about the renderer painting an SGR ground, and it is a fraction of this brief's
size. It reopens from that question or not at all.

The evidence below is kept because it is sound and independently reproduced the
settled instrument's readings. It is not a warrant; the work is already done.

## Context

`ADR-GLASS-INK-073` divided the palette by owner: the ground and the default ink
belong to the glass, and okuda owns only the relations among its own roles. That
division is false as shipped. `src/palettes/okuda.json` carries **21 absolute
hexes, every one tuned for a dark ground**, and abstains on exactly two (`body`,
`code-background`). Okuda already depends on the ground; it has never named the
dependency.

The cost is measured. Against a light ground, 16 of 23 roles fall below 3:1 and
21 below 4.5:1 — and the single survivor is `muted` (7.67:1), the role designed
to recede. The census does not dim on a light ground; it **inverts**. On a light
desktop theme (Omarchy, Rose Pine) okuda renders as readable prose plus ghosts:
`heading #99ccff` at 1.69:1, `state-todo #ffe066` at 1.30:1, `code-text` at
1.46:1. That is the plain-text dump `docs/style-guide.md` exists to refuse,
reached by accident and reported by nobody.

## Warrant

Principal's call, 2026-11-03: *"we should default to our stated ground and figure
colours."* The measurement below is the evidence, and it meets the gate
`ADR-GLASS-INK-073` set for reopening: the terminal's own instrument
(`minimum-contrast`) reaches the case only by forcing text to black or white —
it saves the page by collapsing twenty-three roles into two.

## Objective

Okuda supplies and declares the ground it renders on, together with the body ink
and the code panel that ground implies, so the palette's census becomes
verifiable against a surface the program owns. The light ladder stays unauthored
and is refused **by name**.

## Evidence

Measured 2026-11-03, WCAG 2 contrast ratios (sRGB).

**The light-ground census.** Twenty-three roles against `#ffffff`: sixteen below
3:1, twenty-one below 4.5:1. The only role above the text floor is `muted`, at
7.67:1.

**Half-owning the ground is a bug, not a compromise.** `body` inherited while the
ground is ours:

| inherited terminal fg on an owned `#0e1116` ground | prose |
|---|---|
| `#101010` | 1.01:1 — invisible |
| `#333333` | 1.50:1 — invisible |
| `#888888` | 5.33:1 |

So `body` and `ground` are one decision, not two: both declared, or both
inherited. Anything else fails in one of the two directions.

**The legal ground band.** Holding a 4.5:1 text floor, the binding role is
`state-parked` (`#a06fa8`): the ground may not exceed linear luminance 0.0093,
about `#181818`. `#0e1116` yields a 4.80:1 minimum and `#141414` gives 4.68:1.
The ground hex is a measured choice over a narrow range, not an aesthetic one.

**`muted` is deliberately sub-threshold.** 2.74:1 against `#000000` — below even
a 3:1 graphic floor, and below 3:1 against *any* non-black ground. It is
structural ink (rules, table pipes, the `` `20 cols · 8 here` `` note) whose job
is to be barely there. Any census with a flat floor fails on day one and then
"fixes" the recession.

**`badge-fg` is not a page-ground role.** `#000000` on `badge-bg #ffaa00` is
**11.00:1 against its own surface**. A global test reports it as 1.00:1, which is
nonsense. The palette has more than one surface; the receipt must be per-surface.

**A proposed default closes.** Ground `#0e1116`, body `#c9ced6` (11.96:1), code
panel `#161b22`:

| surface | worst role | ratio |
|---|---|---|
| page ground, 22 roles | `state-parked` | 4.80:1 |
| `body` | — | 11.96:1 |
| `code-text` on `code-background` | — | 11.82:1 |
| `badge-fg` on `badge-bg` | — | 11.00:1 |
| page ground | `muted` (declared exception) | 2.46:1 |

## Scope

**In:**

- `src/palettes/okuda.json`: a `ground` role; a hex for `body`; a hex for
  `code-background`.
- `src/palette.ts`: `ground` added to `Role`. `""` keeps meaning *no ink*, so
  `loadPalette`'s predicate is unchanged.
- `src/render.ts`, `src/ansi.ts`: the ground pass, as SGR `48;2` — no OSC.
- `src/cli.ts`: `--ground dark|inherit`, `OKUDA_GROUND`, and the named refusal.
- `tests/`: the per-surface census receipt.
- The ADR recording the reversal (see Preconditions).
- `briefs/INDEX.jsonl` and `&briefs.md`: this brief's entry and row.

**Out:**

- **Any light ladder.** Deferred; `--ground light` refuses by name
  (`ADR-ENVIRONMENT-ANSWERS-068`, rung 4).
- **OSC of any kind.** No `10`/`11` set, no query. `ADR-GLASS-INK-073`'s refusal
  stands and this brief does not touch it — the ground is painted as ordinary
  SGR, scoped to the bytes.
- Transparency, blur and image backgrounds: not this brief's concern.
- The fate of inherited-ground users. `--ground inherit` is the exit, and it
  returns them, knowingly, to the world where the page is unverifiable.

## Preconditions

- [x] The measurement above — the gate `ADR-GLASS-INK-073` requires.
- [ ] **The ADR lands in the same sitting.** This reverses two rows of
      `ADR-GLASS-INK-073` (the ground; the default ink) and **discharges** its
      rule that no preset may ship a `body` hex — a rule whose stated premise was
      *"the ground is unknowable"*. Owning the ground falsifies the premise, so
      the rule retires with it. The palimpsest protocol applies
      (`playbooks/decisions-playbook.md`).
- [ ] Confirm `NO_COLOR` / `--no-color` output stays **byte-identical** to today.
      `ADR-BODY-INK-072`'s test asserts it, and the ground must not leak in.
- [ ] Confirm the padding pass does not perturb the width and elision tests —
      `finalize` currently leaves the right margin implicit.

## Work Plan

1. [ ] **Palette.** Add `ground`; populate `ground`, `body` and `code-background`
       in `okuda.json`. `Role` grows by one; `loadPalette` is untouched.
2. [ ] **The ground pass**, at `finalize` (`src/render.ts:2707`) — one call site,
       already per-line. Pad each non-empty line to `ctx.width` and wrap it in
       `bg(ground) … RESET`, re-arming the ground after every inner `RESET`: an
       inner role's reset clears the background, so a line-internal `\x1b[0m`
       must become `\x1b[0m` + `bg(ground)`. The re-arm is the one genuinely
       fiddly part, and it is not optional.
3. [ ] **The gate.** The ground is painted only when declared. `inherit` emits
       today's bytes exactly.
4. [ ] **CLI.** `--ground dark|inherit` plus `OKUDA_GROUND` (the `OKUDA_*` family
       of `ADR-ENVIRONMENT-ANSWERS-068`). `--ground light` exits non-zero with the
       named refusal. Non-tty and `NO_COLOR` force `inherit`.
5. [ ] **Receipt.** A census test with per-surface floors: the page ground at
       4.5:1 for text, the composed surfaces (`badge-fg` on `badge-bg`,
       `code-text` on `code-background`), and `muted` as a **declared exception**.
       A failure names the role, the hex and the ratio.
6. [ ] `just check` green; `bun test` green.

## Acceptance Criteria

- Under **any** terminal theme, a declared run renders the same bytes — the
  census holds because the ground is ours.
- `--ground light` **refuses by name**, and the refusal names the absent ladder.
- `--ground inherit` is **byte-identical** to the current output: the escape
  hatch preserves the old contract exactly.
- `NO_COLOR` and non-tty paths emit **no ground**, and their bytes are unchanged.
- The census test fails if a page-ground text role drops below 4.5:1, or if
  `muted`'s exception is removed without a recorded reason.
- **No OSC is emitted** by any path.

## Notes

- The ground band is narrow (`#000000`–`#181818`). Pick inside it with margin;
  pure black is defensible and buys none.
- The code panel sits at **1.09:1** against the ground, which is correct: the fill
  should be felt, not seen. The fence edge carries the cue, and nobody should
  "improve" this by brightening the panel.
- `muted` fails on both grounds for opposite reasons — 2.74:1 dark, 7.67:1
  light. It is the role with the strongest polarity dependency, and the clearest
  beneficiary of any future light ladder.
- The proposed hexes are a demonstration that the constraints close, not a
  prescribed palette. Review may move them inside the band.

## Related

- `ADR-GLASS-INK-073` — the division this reverses, and the gate it meets.
- `ADR-BODY-INK-072` — `body`'s empty default, and the NO_COLOR assertion.
- `ADR-ENVIRONMENT-ANSWERS-068` — the declaration ladder and the named refusal.
- `docs/2026-09-05-palette-page.md` — the OKLCH layout; the *relative* axis stays
  the reference.
- `docs/style-guide.md` — the anti-pattern a light ground produces by accident.
- `DEPENDENCIES.md` — the paper rung stays a printer: non-tty emits no ground.
