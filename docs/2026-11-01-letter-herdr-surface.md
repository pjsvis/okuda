---
date: 2026-11-01
kind: letter — outbound, to the maintainers of Herdr
status: draft — not sent; the operator sends, and may cut anything
---

# To Herdr: the terminal inside the app lost a setting

Hello —

I run a markdown renderer (`okuda`) inside Herdr. This letter is about one gap in the
app's config surface, and the gap is small enough to state in a sentence.

## The gap

**A terminal in Herdr can be told its font, its cursor, its padding, its opacity, its
palette, its theme — and not its ink and its ground.** Those two values are the ones
that decide whether a document is readable at all, and in the app they belong to the
theme: the only way to change them is to change the theme, and the theme picker
changes them as a side effect.

Every other value in the surface is settable. Two are not. That is the whole claim,
and it needs nobody to agree with my taste to be true.

## What it costs, measured

My renderer emits fixed colour roles and leaves its body text to inherit the
terminal's default foreground. That means the terminal's ink is *half of my palette's
design*, and I cannot see it. On the two themes present in a stock config directory
on my machine (`themes/atom-one-dark.json` and `themes/win98.json`, both dated at
install time):

| theme | its ink / ground | effect on my pages |
|---|---|---|
| `atom-one-dark` | `#abb2bf` / `#21252b` | 12 of my roles climb above my body text: the headings become the loudest thing on the page and the prose recedes |
| `win98` | `#c0c0c0` / `#ffffff` | the pair is **1.8:1** — unreadable for *any* program — and 18 of my roles out-rank the prose |

Neither theme is badly made. Both are perfectly good *for their own palettes*. The
problem is that a document arriving with its own palette is ranked against an ink
the theme chose for a different purpose. If either of those two themes is not yours,
delete that row and the ask still stands.

## The ask, in one sentence

**Let the terminal's ink and ground be set independently of the theme, in the app.**

Three specific shapes, smallest first:

1. **If `colors` already accepts `background` and `foreground`, say so in the theme
   docs** and I will never mention it again — your docs describe `colors` as *theme
   colour overrides* with the same precedence as fonts, which is exactly the right
   place for this, above the themes and below the picker. I have not been able to
   confirm whether those two keys are accepted there; that sentence is the whole
   request.
2. **If they are not accepted, accept them.** One pair, set once, above every theme.
3. **Document the picker as carrying the surface.** It overrides the layout, so
   switching theme changes the paper under someone else's document. A control with
   that blast radius should be described as what it is.

A fourth, if you are feeling generous: name the two values in the docs as a
*terminal surface* — the ink and the ground of the pane — so the next app that hosts
a terminal has a word for the thing it must expose.

## What I am not asking for

- **Not a doctrine.** I am not asking Herdr to know what a role is, to adopt a colour
  theory, or to change your themes.
- **Not a sweep of the twenty-two themes.** One pair, set once, above them.
- **Not a protocol.** No escape sequences, no cooperation from the programs.
- **Not `minimum_contrast` as the answer.** It is a real attempt at a real problem and
  I am glad it is there — but it works by *replacing* the program's colours with
  near-white or near-black, so it repairs legibility by erasing the palette it is
  protecting, and the program is never told. It cannot answer the question above: it
  is a floor on one pair, and the failure is an ordering between roles.

The gap is ours too — my renderer inherits the ink because it cannot see the glass,
and that was my design choice, not your bug. But an inheritable parameter has to be
settable somewhere. In a standalone terminal it is; inside an app it currently is not.

## What I can offer

A command, if useful: I have a 30-line reading that takes any theme file, extracts
its pair, and reports which of a foreign palette's roles cross its ink and which fall
under a 3:1 floor. It walks a directory. If you want numbers on every theme you ship,
or a PR against the theme documentation, say the word and it is yours.

— an operator who reads a lot of markdown in your app
