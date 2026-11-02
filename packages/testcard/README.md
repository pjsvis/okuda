# @polyvis/testcard

A card you read, not a suite you run.

A terminal's **surface** has invariants a byte stream cannot test. The glyph
atlas either registers a block or a braille cell to integer pixels or it does
not; the shader either clamps low-contrast ink away from the ground or it does
not. Both are properties of bytes → pixels, so a renderer cannot verify them and
a card is what is left: something a human sights down.

```sh
npx @polyvis/testcard          # print the card
npx @polyvis/testcard --assert  # check the card's own arithmetic
npx @polyvis/testcard -w 100    # a wider card
```

## What to look for

Sight down the spine. Every row's `|` should land on the same column the `MARKS`
row points at with `^`. The card prints the column it used, so a mismatch is
arithmetic rather than a matter of your judgement.

Then flip your terminal between dark and light polarity. Two truecolor traps are
emitted below the geometry — `#242424` and `#EBEBEB` — each invisible on the
ground it matches. A host that enforces a minimum contrast clamps both into
legibility. A host that does not makes exactly one disappear.

## Two rules this card obeys

**The ruler is not built from the family under test.** A grid drawn in
box-drawing and block characters cannot measure box-drawing and block
characters, because a systematic atlas error cancels against itself. Every
measuring element here is ASCII; every measured element is Unicode.

**The control passes first.** The `ASCII` row sits above every Unicode row. If
its spine is not the column the marks point at, the card's own arithmetic is
broken and every reading below it is void.

`--assert` checks that arithmetic and nothing else. It cannot assert your
terminal, because asserting the `wcwidth` you are testing is circular.

## Out of scope

Escape-sequence compliance (`vttest`, `esctest` own that), colour correctness
beyond a luminance floor, and any claim about your terminal. The card shows; it
does not assert.

## Provenance

Published from [okuda](https://github.com/pjsvis/okuda); the source is
`scripts/tty-card.sh` in that repository, copied into `bin/` at pack time so
that git remains the only copy anyone edits. The account of what the card is
for, and what it replaced, is
`docs/2026-11-02-the-instrument-card.md`.
