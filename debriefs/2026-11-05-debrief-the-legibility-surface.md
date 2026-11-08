---
type: Debrief
callsign: DBF-LEGIBILITY-SURFACE
date: 2026-11-05
briefs: []
---

# Debrief: The probe found the canary, and the control found the probe

**Status:** Done — `feat/legibility-surface`, two commits, `just check` 26/26 green,
17 new tests. Not merged: the branch is the delivery, and the fast-forward is the
operator's.

## What was asked

Three questions in one sitting, arriving from a perceptual complaint rather than a
spec: *if we do not control fg/bg we are at the mercy of the theme; if we do, we
could ship low/medium/high values; and the bits that matter in a cooking packet are
the minutes — 20 or 25 — while at the other end the characters halate.*

Then, when the answer to "why do we not own the pair" came back as a boundary
rather than a defect: *do the probes, all three, in a branch.*

## What was found

**The premise was half true, and the true half was not the half it named.**
Unpinned, an Omarchy light theme puts **16 of 21** on-ground roles under 3:1 on
flexoki-light and **19 of 21** on catppuccin-latte, with `state-todo` at **1.15:1**
— the alarm lamp at the ground's own luminance. The prose still reads, because
prose inherits. So the failure is not illegibility: **it is an annotation layer
that vanishes while the page looks fine**, which for a viewer whose job is
orientation is the worse shape. The repair already existed
(`~/.config/omarchy/themed/ghostty.conf.tpl`, re-applied by the re-themer); what
was missing was any read-back, so the pin was advice.

**The torch is an arithmetic argument, not a metaphor, and it explains the
numbers.** WCAG's ratio carries a `0.05` flare allowance in both terms; scaling
both luminances by *k* moves the ratio toward the reflectance ratio. The reference
rung is 10.6:1 as shipped, 16.8:1 at twice the light, 26.6:1 at five. Two rungs the
first reader could not rank by number (7.3 and 7.5, rejected and kept) are 10.5 and
11.8 at 2× — the same page, a different room. A ratio is therefore a claim about
one room, and `atLight` makes the order of failure computable rather than felt.

**The canary is the aubergine.** `state-parked` holds 4.16:1 as shipped — the
thinnest headroom in the palette — and **2.78:1 at half light**. It is also the one
role whose hue was chosen by a *safety* argument (deuteranopia ΔE 16.3). That is a
hue argument, and it says nothing about luminance; the two were never checked
against each other, and this is the first instrument that stands them side by side.

## What the controls caught — twice

Both detectors were wrong on first draft, and both were caught by the control the
protocol asks for before the finding:

1. **`verifyPin` read the first occurrence of a token.** The template spends each
   neutral twice (`palette = 0/7/8/15`, `cursor-color`), so a half-substituted
   template — `palette = 7` edited, everything else intact — read as **HELD**. The
   stale control found it; every occurrence is checked now.
2. **`deriveLightCard` clamped `muted` to the floor**, pulling it 0.20 → 0.28 of
   ink: an order rewrite dressed as a rank preservation. The exempt list
   (`NOT_ON_GROUND`) is load-bearing, and the test that asserts `muted` stays quiet
   is the regression line.

A third thing the discipline found: the first crowd threshold flagged the *house*
palette. Eight amber-family roles sit at 0.78–0.81 of ink on the reference rung **by
design** — one amber is `emphasis`, `table-key` and `blockquote`. So the test is not
a threshold; it is **equality with the source palette's crowd signature**, because a
transform that separated deliberate twins would be authoring roles.

## The refusal that survived, and the one that did not

`paperInk` was my own proposal for the light card and it lost on measurement: it
clamps each role to 4.5:1 on white, and a per-role floor is not a rank. Twelve of
twenty-one roles land in two buckets of ÷ ink — legible, every accent the same
weight. It is now the *failing control* the card is calibrated against, asserted in
the tests so the substitution cannot be made twice.

What survived is the seam: `ADR-GLASS-INK-073`'s boundary is untouched. No
renderer-side luminance knob, no OSC emission, no second palette. The pair is
**declared** into the host's own override and **read back**; the card is derived and
consumed by nothing, so the second identity stays unspent until someone decides to
pay for it — and now that decision has a price tag printed on it.

## What is left

1. **The pin has not been verified on the Omarchy box.** The gate says
   `not this host` on a Mac, by design. Someone must run
   `just ground --omarchy --install` then `--verify` and switch a theme — the
   delivery was verified live on 2026-11-04, but not through *this* reading.
2. **`state-parked`'s headroom is a standing tension**, not a defect to fix today:
   nudging it up in lightness trades deuteranopia separation for the canary
   position. Whoever touches it has both numbers now.
3. **The light card is a prover with no consumer.** If nobody spends the identity,
   the honest move is to keep it gated and unread — or to delete it and keep only
   the measurement in the ADR. A prover nobody reads is a document that runs.
4. **`just headroom` has not been compared against a live "too dim" complaint.**
   The test predicts the canary; a field report is what would cash it.
