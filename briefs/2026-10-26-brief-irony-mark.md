---
type: Brief
callsign: BRF-IRONY-MARK
date: 2026-10-26
---

# Brief: The irony mark takes the parked state, and the vertical ellipsis goes back to elision

**Date:** 2026-10-26
**Status:** Ready — specified, not started. The glyph choice is the operator's (*"its got
to be U+2E2E"*); the colour choice is measured below. Nothing in `src/` has changed.
**Refuses:** a fifth state and a "doubted" state — the renderer's state set stays
four, and the `⸮ → ‽ → !` sequence is a **presentation device**, not machine state.
Also refuses re-rendering the two receipt uses of `⋮`: they are elision, which is
what `⋮` is for.
**Lineage:** the operator's observation that `⋮` already carries three jobs while
`…` means elision, and that a vertical elision indicator is coming (the lexicon's
fold note; `BRF-DIAGRAM-HEIGHT-AXIS`). The candidate list and the colour
measurement come from the same afternoon's riff, recorded here because a glyph is a
claim and this one owes its evidence.

## The question

`⋮` (U+22EE **vertical ellipsis** — called the *vertical silcrow* in conversation,
which is retired here too: the silcrow is `§`, and a nickname that misnames its
referent is the defect the name rule forbids) is doing three jobs:

| where | what it means | line |
|---|---|---|
| state glyph map | parked | `src/render.ts:125` |
| held-width receipt | content withheld, requirement stated | `src/render.ts:591` |
| diagram receipt | art elided, `needs N cols` | `src/render.ts:1683-1732` |

and a fourth is coming: a **vertical elision** indicator for the fold. Meanwhile the
state family it sits in — `✓ ☐ ⋮ ✗` (`src/render.ts:123-126`) — is a **checkbox
register**: filled, empty, crossed. `⋮` never belonged to it. An ellipsis means
*continues*; vertical means *continues below*. The glyph's etymology is **elision**,
which is where two of its three current uses already point.

So the collision is not a shortage of glyphs. It is one glyph standing in for a
state it does not mean, in the one position where the state vocabulary is read at a
glance on every row.

## The decision

1. **`⋮` is the elision mark.** Both receipt uses keep it, unamended — they *are*
   elision. It is reserved for the fold's vertical elision indicator when that
   lands.
2. **`state-parked` becomes `⸮`** (U+2E2E REVERSED QUESTION MARK, the irony mark)
   painted **aubergine `#a06fa8`**.

The state becomes the only one in the set that is a **comment rather than a
verdict**: a note written in the margin while the text continues without it. Irony
is a remark on the system from outside it, and `⸮` says exactly that.

**Why the glyph earns its place beyond the joke:** `⸮` rotated is `!`. One visual
operation converts an ironic question into a verdict, so the mark carries a
*decision* rather than a label. That is why the three-mark sequence is worth
presenting even though the renderer knows only one of the three states:
`⸮` asked-and-parked → `‽` asked-and-doubted (U+203D, the interrobang, BMP) → `!`
rejected. An idea that survives both questions and evades the kill is an *emergent*
decision — left standing rather than chosen — and its receipt is that the mark
**disappears**: it re-enters the list as ordinary work. Marks can only ever leave.

## Why the colour — measured, not chosen by taste

OKLab distance to the state family plus the two nearest document channels
(`vector` rose, `table-header` lavender), and then again in the plane that survives
red-green deficiency — because a state glyph is read in peripheral vision, and the
current family is entirely on that axis:

| candidate | min ΔE vs family | deuteranopia-safe min (L, b) |
|---|---|---|
| parked today `#ff9933` | 14.3 (rose) | **2.9** — vs `state-ok` |
| **aubergine `#a06fa8`** | **14.5** (table-header) | **16.3** |
| plum `#8f5a6e` | 10.3 (muted) | 17.5 |
| chartreuse `#b8e62e` | 11.1 (ok) | 5.3 |
| avocado `#8a9a5b` | **16.1** (ok) | **2.6** |
| dead salmon `#c9a89d` | 13.8 (rose) | 8.7 |
| teal `#4fb3a5` | 14.8 (ok) | 9.3 |

**Avocado wins the raw metric and is rejected anyway** — green-category says
*nearly done*, which is a lie about a parked item, and it is the worst candidate on
the axis that matters for ~8% of men. **Chartreuse loses both** because it sits
inside the ramp (11.2 from todo, 11.1 from ok): it implies progress parked does not
have. **Today's orange is a quiet accessibility defect**: under deuteranopia it is
2.9 from the colour meaning *done*.

Four grounds for aubergine: it is off the traffic ramp, which is what irony is; in
this palette the violet family already means *commentary, not text* (table headers,
links); its measured distinctness is no worse than the bar the palette already
tolerates (14.5 vs 14.3 today); and it improves the surviving axis by 5.6×.

## What must change with it

1. **`src/render.ts:125`** — the map entry, and its comment splits in two:
   `⸮` parked; `⋮` elided-elsewhere.
2. **`src/render.ts:119` (palette comment)** — *"State-glyph vocabulary — traffic-lamp
   colours"* becomes false the moment one state is off the lamp. Amend to: the
   ladder's three, plus one that is off the ladder by design. A comment asserting a
   system the code has left is the defect this silo keeps meeting.
3. **`src/render.ts:1683`** — the receipt comment that says `⋮` *"borrows the
   state-parked lexicon"* must be rewritten: after this it borrows the **elision**
   lexicon, which is what it always meant.
4. **Tests** — `displayWidth("⸮") === 1` beside the telemetry glyph bands and the
   flag pair; a palette assertion that `state-parked` clears a ΔE floor against the
   other states and the control channel; a render test that a parked row paints
   aubergine, not orange.

## Risks, stated

- **Font coverage is the real risk.** U+2E2E lives in Supplemental Punctuation and
  is absent from most monospace faces; the realistic outcomes are "falls back
  beautifully" and "tofu". Therefore **the colour is the contract and the glyph is
  the flourish** — the state must remain readable as colour when the mark is a box.
  Explicit non-goal: no font detection, no fallback glyph. The font is the one input
  the renderer cannot see (`docs/style-guide.md:139`).
- **`Bidi_Mirrored` is unverified.** If U+2E2E mirrors, an RTL frame may present it
  as an ordinary `?`. Check before landing; accept or refuse on the record, do not
  assume.
- **The joke has a floor.** At 9pt in a font that lacks the glyph, `⸮` is a box in
  aubergine. That is acceptable only because the box is still *orange-free* and
  still in the right column — which is the whole argument for redundancy.

## Out of scope

- The fold / vertical-elision design itself: its own brief, and `⋮` is merely its
  reserve.
- Any fifth state, and any renderer support for `‽`. The trinity is spoken, not
  painted.
- Spelling the state ("parked") on the row — a row budget question, not this one.

## Acceptance

`just check` green; the four tests above; the two comments amended in the same
commit as the code (a comment left asserting the old system is the palimpsest the
decisions playbook warns about); and one visual check at a real 9pt terminal —
because the last word on a glyph belongs to the eye, not to `displayWidth`.
