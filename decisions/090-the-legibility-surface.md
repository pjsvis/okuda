---
type: ADR
callsign: ADR-LEGIBILITY-SURFACE-090
date: 2026-11-05
---

# Decision: The legibility surface — headroom is a reading, the pin is verified, the light card is derived

**Date:** 2026-11-05
**Status:** Accepted
**Enforced by:** `tests/legibility.test.ts` (all three instruments, each with its
control) and two gate rows: `bash scripts/gates.sh ground` and
`bash scripts/gates.sh lightcard`

## Context

`ADR-GLASS-INK-073` closed the brightness family by splitting the surface: the
glass owns absolute luminance, okuda owns the relations among its roles. That
decision was right and it left three holes, all of them observed rather than
argued:

1. **"Too dim" is a position in a list, and we printed no list.** WCAG's ratio
   carries a `0.05` flare allowance in both terms, so any change in the light
   reaching the glass moves the number: the reference rung reads 10.6:1 as
   measured, 16.8:1 at twice the light, 26.6:1 at five times. A palette therefore
   has an *order of failure* as the light drops, and nothing printed it.
2. **The pin was advice.** `scripts/omarchy-theme.ts` writes okuda's four neutrals
   into the re-themer's own override, which Omarchy re-applies on every theme
   switch. Nothing read the file back, so a fresh box — or a deleted override —
   silently handed the surface back to the theme. Measured on Omarchy's light
   pairs: **16 of 21** on-ground roles under 3:1 on flexoki-light, **19 of 21** on
   catppuccin-latte, with `state-todo` at 1.27:1 and 1.15:1 — the alarm lamp at
   the ground's own luminance. Prose still reads (it inherits), so the failure is
   invisible: **the annotation layer vanishes and the page looks fine.**
3. **The light case had an answer that was never tested.** The print rung's
   `paperInk` mirrors lightness for a surface with no glass. It was proposed as
   the screen light card and refused on measurement: it clamps each role
   independently until it clears 4.5:1 on white, and a per-role floor is not a
   rank. Twelve of twenty-one roles land in two buckets of ÷ ink — legible, and
   every accent the same weight.

## Decision

**Three instruments, no renderer change.** The boundary in `ADR-GLASS-INK-073`
stands: headroom is a *reading*, the pin is a *declaration read back*, and the
light card is a *prover* that nothing consumes until someone decides to spend a
second identity.

| what | instrument | the control |
|---|---|---|
| the order of failure as the light drops | `just headroom` (`atLight`, `headroom()`) | at 1× the model must return the measured ratio |
| whether the pin is in force | `just ground --omarchy --verify` (`verifyPin`) | a freshly installed template must read HELD |
| a light-ground card with its rank intact | `just lightcard` (`deriveLightCard`) | the *source* palette's own crowd; and `paperInk`, which must fail |

Three rules the instruments carry, each earned by a failure during the work:

- **A ratio is only true of one room.** Every ratio in the record describes a pair
  at the illuminance it was measured in, and `atLight` names the canary rather
  than leaving it to be inferred: `state-parked` (`#a06fa8`) is 4.16:1 as
  shipped and **2.78:1 at half light** — the thinnest headroom in the palette,
  and the one role whose hue was chosen by a *safety* argument (deuteranopia ΔE),
  which is a hue argument and says nothing about luminance.
- **A pass that is never read back is a claim, not a pin.** Three verdicts, and
  they are different facts: `HELD`, `STALE` (installed, values moved), `UNREADABLE`
  (the template stopped carrying a token — Omarchy changed shape). A host with no
  Omarchy template exits 0 and *names the skip*: undeclared scope is the defect
  class, not non-blocking scope.
- **The derivation must not invent a distinction, nor lose one.** The test is
  equality of the crowd signature with the source palette — not a fixed threshold,
  because the house palette has deliberate twins (one amber is `emphasis`,
  `table-key` and `blockquote`) and a transform that separated them would be
  authoring roles. The exempt list is load-bearing for the same reason: clamping
  `muted` to the floor pulled it 0.20 → 0.28 of ink, which is an order rewrite
  dressed as a preservation.

**The measurements are the argument, and they are printed, not typed:** the
minutes in the prose of a document are what get misread, the alarm is what
disappears first on a light ground, and the amber is the role nearest halation on
a dark one (`state-todo` at 1.19 × ink, the loudest role on the reference rung).

## Alternatives Considered

| Alternative | Why Rejected |
|---|---|
| Print a low/medium/high brightness knob | `ADR-GLASS-INK-073`'s constraint, unchanged: no renderer-side absolute-luminance control. The ladder is a U, not a ramp (comfort band ground L 0.24–0.26 at 10–11:1), so three rungs would be a coarsening that loses the finding. |
| Gate on headroom | The floor is the verdict; headroom is a reading (`ADR-GATE-TWO-RENDERS-085`). A role may sit near the floor on purpose — `muted` is *supposed* to be quiet — and a gate that failed it would demand the palette stop being a ranking. |
| Ship `paperInk` as `--palette light` | Measured failure: floor passes, order fails. It is the calibration that proves the detector can see what it reports, and it lives in the tests as that. |
| Have `--verify` fail on a Mac too | A pin has no meaning where there is no re-themer. A skip that names itself is a signal; a failure there would teach the operator to ignore the gate. |
| Add a light preset now | The ruling of 2026-11-03 refuses a second set of role meanings. This decision makes that refusal *cheap to revisit* by deriving the card and pricing it — it does not spend the second identity. |

## Consequences

**What became easier:**

- **"It's too dim"** has an answer with a name: the canary, its headroom, and the
  light level at which it goes. One command, no experiment on the glass.
- **A fresh Omarchy box fails the build**, not the reader: `just check` reads the
  pin back and says `NOT INSTALLED` with the one-line fix.
- **The light question is priced.** `just lightcard` prints a card that holds the
  floor and the order, so the remaining decision is a product one (do we spend a
  second identity?) rather than an engineering one.

**What became harder:**

- **A Mac cannot judge the pin**, and the gate says so rather than passing
  silently. The verification is real only on the host that has the re-themer.
- **The card is a prover.** It is maintained by its own gate and consumed by
  nothing, which is a standing cost: if the palette moves, the derived card moves
  and no user sees it. That is the price of not spending an identity.
- **Two crowd signatures must stay equal**, so a future palette change that
  deliberately separates twins will fail `lightcard` until the derivation is told
  which twins are intended.

**Constraints this imposes:**

- **`atLight` and `headroom()` are readings.** Neither may become a gate threshold
  without a measurement that shows the terminal's own instruments cannot reach the
  case (`ADR-GLASS-INK-073`'s price of admission).
- **`paperInk` stays a print transform.** Its contract is legibility on white, and
  a screen card needs order; the test asserts the difference so the substitution
  cannot be made twice.
- **`--verify` reads the installed file, never writes it.** A gate that repairs
  what it measures cannot report a broken install.
