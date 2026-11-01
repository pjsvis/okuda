---
date: 2026-11-01
kind: issue draft — outbound, for the Herdr repository
title: "Two things are called zoom: one scales the app, the other maximises a pane"
status: draft — not filed; the operator files it, and may cut anything
---

# Issue draft

**Title**

> Two things are called zoom: one scales the app, the other maximises a pane

**Body**

---

## The naming

`settings.json` has `zoom`, documented as *"scales the whole app: terminals, mods, the
layout's px sizes (0.5 to 3)"*. The pane commands have `pane.zoom {pane?}`, documented
alongside `pane.split`, `pane.close` and `pane.focus`.

One word, two referents, in the same public surface:

| name | what it does | does the program inside learn about it? |
|---|---|---|
| `zoom` / `app.zoom_in` / `app.zoom_out` | **scale** — a unit-size change | **yes** — `font` / `font_size` are px *at zoom 1*, so the cell changes, so cols × rows change, so the pty is resized and the program reflows |
| `pane.zoom {pane?}` | **maximise** — a layout change | only the grid it gets, because the pane's pixel size changed |

The two are orthogonal and they are not the same kind of thing: one changes the unit size,
the other changes the arrangement. Sharing a word makes the settings reference read as
though `pane.zoom` were a per-pane version of `zoom`, which it is not.

Suggested: keep `zoom` for the app scale (it is the common word, and it is the one a
person reaches for) and call the pane operation `pane.maximise` — or, if `zoom` must
move, `app.scale`. Either way the two names should differ, because *one of them tells the
program and the other does not.*

## Why it is worth a fix in a young product

Renaming is free now and expensive later: recipe names, settings keys and docs are all
early. And the distinction being collapsed is not cosmetic — it is the one that decides
whether a terminal inside an app behaves like a terminal or like a picture of one.

## What confirms the scale is the good kind

The documentation already implies it: `font` / `font_size` are described as *px at zoom
1*, and `zoom` scales the layout's px sizes. If the cell grows, the grid shrinks, and the
pty is told — which is reflow, the honest mechanism.

Two checks that would nail it down, and either is a fine outcome for this issue:

- `stty size` inside a terminal, at `zoom` 1 and at `zoom` 1.5: **columns should fall**.
  If they do not, the app is magnifying rather than resizing, and the program is
  rendering for a width it no longer has.
- At `zoom` 1.5, is the 80-column rule still satisfied (a line of 80 columns fits the
  pane) or does content clip?

## What this is not

Not a request to change how zoom works, and not a bug report — the scale appears to be
implemented the right way round. It is a naming request plus two confirmations, and it
exists because the same word is currently doing two jobs in the same settings surface.
