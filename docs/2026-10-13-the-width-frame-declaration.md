---
date: 2026-10-13
kind: frame declaration — the width convention this renderer assumes, and the reader it excludes
lineage: the operator's observation, 2026-10-13 — *"we are still not rendering our special characters… we should ensure that we are writing stuff we can also render"* — and the measurement it produced (tmp/special-chars-probe.ts), which reproduced no dropped character and found this instead
status: recorded — the deviation is stated, and a test pins it so it cannot change silently
---

# The width frame declaration

> ◆ **143** codepoints the corpus uses are East-Asian **ambiguous**. okuda measures every
> one of them as **1 column**. A terminal in a CJK locale draws them as **2**.

## The deviation, stated

`graphemeWidth` (`src/width.ts`) treats East-Asian *Ambiguous* as one column, and falls
back to one for anything outside its wide and emoji tables. That is a choice, not a
neutral default, and until now **it was undeclared** — so it read as a fact rather than a
position. In the house's own term (`AGENTS.md`, **frame declaration**), this is the
statement of the deviation, written down so it can be re-read rather than recalled:

1. **Ambiguous = 1 column.**
2. **We assume the reader's terminal is not in a CJK locale.** Under that assumption the
   choice is correct; under the other it is wrong by one column *per ambiguous character*.
3. **The decorative vocabulary is irreducibly ambiguous.** The characters this house
   writes most — `—` ×11,305, `─` ×4,459, `→` ×1,078, and `│ … · § × ◆ ├ └ ┌` — are all in
   the class. There is no unambiguous substitute set: the box-drawing and block blocks are
   ambiguous *by definition*, and Braille (which is unambiguous) would be a category error.
   So the answer is **declare**, not *rewrite* — see below.
4. **Nothing in okuda can detect the mismatch.** The renderer emits bytes; the terminal
   owns presentation. The reading path's whole demand on a host is colour, bold and
   strikethrough — **zero bytes of cursor control** across 521 documents — so a locale
   difference is invisible from inside the byte stream.

## The failure this names

A CJK-locale reader sees **every rail, table and terminator misaligned** — the okudagram's
own frame, one column out per glyph. That is exactly the felt report *"the document does
not render properly"*, and it is not reproducible on the development machine, which is why
it stayed undeclared: the default frame is the modal frame, and the modal terminal here is
not CJK.

**Test:** the assertion in `tests/width.test.ts` (*ambiguous is one column*) pins the
convention. If that test needs changing, the declaration above needs re-reading first — the
pair is the point. If a CJK-locale reader is ever a target rather than an accident, this
document is the thing to change, and the change is a per-glyph substitution pass, not a
table edit.

## What the measurement did NOT find

**No character is dropped.** 0 of 514 distinct non-ASCII codepoints were lost in prose, in
code spans, or in headings, across 21,702 occurrences — with the detector shown able to
fire (a raw HTML block loses 512 of 514; the two that survive are chrome glyphs the
renderer emits itself, which is the instrument's own limit). A mermaid node label was
suspected of being lossy and is **not**: 46 candidates across twelve scripts — Devanagari,
Tamil, CJK, braille, block elements, emoji — all survive, so that suspicion is withdrawn.

So the report *"we are still not rendering our special characters"* has one measured cause,
and it is this declaration: **we render them; we do not agree with every terminal about how
wide they are.**

## Related

- `docs/2026-10-13-the-mechanism-is-the-fallible-half.md` — the scoreboard this exchange grew
- `docs/2026-10-08-frame-defaulting.md` — the failure this declaration is the remedy for
- `docs/2026-10-06-the-eink-frame-is-a-second-host.md` — the host contract, and why a
  presentation difference is invisible from here
- `AGENTS.md` — **frame declaration**, and *every claimed fact names its instrument*
- `src/width.ts` — `graphemeWidth`, `EAW_WIDE`, `ZERO_MARK`
