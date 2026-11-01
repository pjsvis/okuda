---
type: Debrief
callsign: DBF-SURFACE-PAIR
date: 2026-11-01
tags: [colour, contrast, instruments, control, herdr, decisions]
agent: pi (ses_099037)
environment: local
briefs: [BRF-SURFACE-PAIR]
---

# Debrief: Two readings, one verdict, and the control that corrected the brief

**Date:** 2026-11-01
**Status:** Done — 989 tests, `just check` rc=0, `just surface` dogfooded against
two live host themes. `BRF-SURFACE-PAIR` landed with one acceptance criterion
amended, by its own control.

## What was asked

Make "readable, navigable, recognisable" checkable by one command, and declare the
one pair the silo recommends. The brief was deliberately small because the operator
had narrowed it: *what is missing in the app instance is the ability to set the
pair* — not a web renderer, since the app renders into a terminal and a
browser-hosted okuda is a terminal in an xterm.js-class emulator.

## The control corrected the brief, which is the whole point of a control

The floor was 3:1, flat, over the palette. The reference pair — the dogfooded one,
the pair the whole page is designed on — **failed it on two roles**: `badge-fg`
1.28 and `muted` 2.14.

The wrong repair was available and tempting: lower the floor until the control
passed. That is how a detector becomes decoration. The right repair was to notice
that both roles are **not painted on the ground**:

- `badge-fg` is black ink on `badge-bg`. Its partner is in the palette; the ground
  is irrelevant to it.
- `muted` draws rules and pipes, and its quietness is the **binding constraint** that
  chose every ground the page recommends (2.0–2.3 on a good ground,
  `docs/2026-10-28-the-ground-you-read-on.md`). A 3:1 floor there would refuse every
  admissible ground.

So the exemptions are a declared map with reasons (`NOT_ON_GROUND`), printed in the
reading rather than hidden, and the brief's acceptance criterion 2 was **annotated in
place** to say what "readable" means: *every role painted on the ground*. A rule with
its exceptions named is a rule; a rule quietly relaxed is a wish.

## The dogfood, on real host themes

Three pairs, three answers, and the two failure axes are genuinely disjoint:

| pair | readable | navigable |
|---|---|---|
| the reference (`#221f1c` / `#d6cfc4`) | **YES** — 21 on-ground roles clear 3:1 | **YES** — nothing crossed |
| Herdr UI default (`#21252b` / `#abb2bf`) | YES | **NO** — 12 roles out-rank the prose |
| `themes/win98.json` (`#ffffff` / `#c0c0c0`) | **NO** — 16 below floor | **NO** — 18 out-rank the prose |

The third is the most instructive and was not invented for the test: it is a theme
shipped in the app on this machine. Its terminal pair is `#ffffff` ground with
`#c0c0c0` ink — **1.8:1** — so the theme is not merely wrong for okuda, it is wrong
for *any* program: a 1.8:1 terminal is a terminal you cannot comfortably read. Which is
the strongest available evidence for the whole position: the pair is not a
cosmetic preference that some people get wrong, it is a number that host authors
have demonstrably not checked.

## The numbers

| reading | value |
|---|---|
| tests before / after | 982 → 989 (+7) |
| new pure functions | 3 (`floor`, `surfaceVerdict`, `surfaceText`) |
| new constants | 2 (`FLOOR`, `NOT_ON_GROUND`) |
| commands | 1 (`just surface`) |
| acceptance criteria amended | 1 (by its own control) |
| host themes dogfooded | 2 (`atom-one-dark`, `win98`) |

## What is deliberately not built, and stays that way

No web export, no `--surface` flag, no light palette, no terminal probe, no contract
for third parties, no recognition/distance test. The brief's *Out* section was
written before the work and survived it — which is the test of an *Out* section: if
it needs amending at the end, it was a hope, not a boundary.

The one boundary that did move is the honest one: "readable" is now defined
precisely, in a place a future reader can argue with.

## The habit this leaves

Any future role hex or pair change runs `just surface` before it lands. If it does
not, the instrument and the palette drift apart and the reading becomes folklore —
which is the failure the ground page already suffered once (a derived doc nobody
regenerated claiming a hex for weeks).
