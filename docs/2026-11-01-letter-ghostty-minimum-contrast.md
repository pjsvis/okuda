---
date: 2026-11-01
kind: letter — outbound, to the maintainers of Ghostty
status: draft — not sent; the operator sends, and may cut anything
---

# To Ghostty: `minimum-contrast` is the right instinct and the wrong lever

Hello —

I write a markdown renderer that runs in Ghostty, and this letter is about one gap —
not in the engine, which is fine, and not in the feature set, which already has the
lever. It is a gap in what the catalogue knows about itself.

## The gap, stated as arithmetic

Two values decide whether a document on this terminal can be read: the ink and the
ground. Ghostty lets both be set, which is why this is not a feature request. What no
part of the toolchain reports is the **arithmetic those two values imply** — for the
theme's own text, and for a palette that arrives with its own hierarchy and inherits
your ink. Eight hundred and nineteen themes ship; nothing prints what their pairs
mean.

That absence is the gap, and it is one a terminal is the right party to close, because
the terminal is the only party that holds both values.

A second observation, offered because it is earned: `minimum-contrast` exists, and its
documentation says the honest thing about itself — *"the higher the value, the more
likely that text will become black or white."* Almost nothing in this space admits its
own cost in the same sentence that offers the feature.

## What the measurement found

I read every theme in the bundled catalogue (`Ghostty.app/Contents/Resources/ghostty/themes`,
819 files in this build) and asked each one two questions: does my body text remain
readable on your ground, and do my headings and table headers still sit *under* the
prose rather than above it.

| reading | count |
|---|---|
| cannot be read at 3:1 | **227 / 819** |
| invert a foreign palette (roles climb above the prose) | **366 / 819** |
| both | 165 / 819 |
| cannot read *anything* — the theme's own ink under 3:1 against its own ground | **10 / 819** |

The fourth row is the one I would act on first, because it is nobody's fault but
arithmetic: those ten themes cannot display plain white text comfortably, and nobody
has to know what my palette is to see it. The second row is not a defect in those
themes either — each is fine for its own palette. It is what happens when a document
with a designed hierarchy arrives on a ground whose ink was chosen for someone else's.

## The three asks, smallest first

1. **One paragraph on `minimum-contrast`.** Say what it does to the program's output:
   it replaces colours, and the program is not told. And say what it cannot do: it is
   a floor on one pair, so it cannot detect that a foreign palette's headings have
   climbed above its body text. The documentation is the natural home, because the
   feature already tells the truth about becoming black and white — this is the other
   half of that truth.
2. **A self-consistency reading over the bundled catalogue.** Ten themes fail their
   own ink-against-its-own-ground arithmetic. A check in the spirit of
   `+list-themes` that printed each theme's own contrast ratio would find those ten,
   and would give theme contributors a number to hit. This is a lint for your own
   files, not a change to the engine.
3. **Nothing else.** Specifically: no new escape sequence, no renderer cooperation,
   no change to how `background`/`foreground` work. The engine is not the problem, and
   a terminal cannot be asked to know a foreign palette's semantics — the ordering is
   a property of a palette you were never told about. Asking the terminal to own it
   would be asking for a guess.

## What I am not asking for

Not a doctrine, not a standard, not a redesign, and not a defence of my palette. I am
not asking Ghostty to know what a "heading" is. I am asking for one documentation
paragraph and one arithmetic check on your own files.

The gap is shared: my renderer inherits the ink because it cannot see the glass, and
that is mine. But you are the party holding the other half, and you are the party
whose catalogue can be measured tonight.

## What I can offer

The reading itself, if you want it: it takes a theme file, extracts the pair, and
reports which roles cross the ink and which fall under a floor. It walks a directory,
so pointing it at your themes is one command, and the numbers above are what it
prints. Yours to use, rewrite, or ignore — I would rather you built it properly than
merged mine.

— an operator who reads a lot of markdown in your terminal
