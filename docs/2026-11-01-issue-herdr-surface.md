---
date: 2026-11-01
kind: issue draft — outbound, for the Herdr repository
title: "Terminal: let the ink and ground be set independently of the theme"
status: draft — not filed; the operator files it, and may cut anything
---

# Issue draft

**Title**

> Terminal: let the ink and ground be set independently of the theme

**Body**

---

## The gap

A terminal in Herdr can be told its font, its cursor, its padding, its opacity, its
palette, its theme — and **not its ink and ground**. Those two values live in
`themes/<name>.json` (`foreground` / `background`), so the only way to change them is
to change the theme, and the theme picker changes them as a side effect of picking a
look.

Every other value in the terminal surface is settable. Two are not.

## Why those two matter more than the rest

A program that renders documents emits its own colours for *roles* — headings, table
headers, state marks — and leaves its body text to inherit the terminal's default
foreground. So the terminal's ink is half of that program's palette, and the program
cannot see it.

Consequence, measured on the two themes in a stock config directory on my machine
(`atom-one-dark.json`, `win98.json`, both dated at install time) with a markdown
renderer whose role hexes are fixed:

| theme | its bg / fg | what happens to a rendered document |
|---|---|---|
| `atom-one-dark` | `#21252b` / `#abb2bf` | 12 roles climb above the body text — headings become the loudest thing on the page and the prose recedes |
| `win98` | `#ffffff` / `#c0c0c0` | the pair is **1.8:1**, i.e. hard to read for *any* program; 18 roles out-rank the prose |

Nothing errors in either case. The bytes are correct; the page is not. If either theme
is not Herdr's, delete that row — the request stands on the first paragraph alone.

## The ask, in order of preference

1. **If `settings.json`'s `colors` override map already accepts `background` and
   `foreground`, document it in the themes section and close this issue.** The docs
   describe `colors` as theme colour overrides with the same precedence as fonts,
   which is exactly the right slot — above the themes, below the picker. A sentence is
   the whole fix for this case.
2. **If it does not, accept them.** Two keys, applied to the terminal's default
   fg/bg, overriding whatever the theme supplies.
3. **Document the picker as carrying the surface.** It overrides the layout, so
   switching theme repaints the paper under someone else's document. Worth saying
   plainly, since a control with that blast radius reads as cosmetic.
4. *(Optional, unrelated to the ask)* If `win98.json` ships as-is, its terminal pair is
   1.8:1 — worth a hex change whether or not the above lands.

## Acceptance

```json
{
  "theme": "gloam",
  "colors": { "background": "#221f1c", "foreground": "#d6cfc4" }
}
```

- A new terminal opened with that `settings.json` uses `#221f1c` / `#d6cfc4`.
- Switching theme afterwards does **not** change the pair.
- The two keys are documented alongside `theme` in the settings and theme reference,
  with the note that they override the theme.

## What this is not

Not a request for a theme editor, a new UI, a doctrine about colour, changes to the
shipped theme set beyond the hex above, or any protocol work. Two values, one file,
documented.

## Background, if useful

The general form of this: a document that carries its own palette onto a surface it
does not own has a figure–ground requirement with no owner, and it fails silently.
Discussion and measurements: `docs/2026-11-01-the-gap-before-the-first-word.md` and
`explainers/colours.md` in `pjsvis/okuda`. The reading I used is 30 lines and can be
sent as a PR if it would help — but I would rather you built it properly than merged
mine.
