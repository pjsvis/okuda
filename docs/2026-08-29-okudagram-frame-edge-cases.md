---
title: Okudagram-frame edge cases — dogfood
brief: briefs/2026-08-29-brief-okudagram-frame.md (BRF-PAGED-OKUDAGRAM)
---

# Okudagram-frame edge cases

**Date:** 2026-08-29
**Purpose:** dogfood every edge case the okudagram-frame rule
has named. Render this document in okuda and walk it. The results are
valid evidence regardless of whether the frame rule ships — every case is a
real document shape okuda already has to handle; the paged layer, if
it comes, must preserve the current renderer's behaviour on each.

Each case has an **observe** line naming what to look for in the
current slippy renderer, and what the paged layer would have to
decide. Cases 1–6 and 8 are embedded (exercised by scrolling this
document); cases 7 and 9 are whole-document properties, documented
here with a fenced source fragment to render separately.

This paragraph is **content before the first header** (EC1, below).
If you are reading this in the paged view of the future, the
question is already live: is this intro a "block 0," and where does
its page boundary fall? In the slippy view of today, it is just lines
above the first `##`.

## EC1 — content before the first header

observe: there is no header above this section's parent — the intro
paragraph and this section's predecessor (the lines between the `#`
title and this `##`) form a header-less prefix. The unit question: is
that prefix a "block 0" (paged as its own unit), appended to the
title block, or unpageable (slippy fallback)? Today: it is slippy
lines, nothing special.

A second paragraph in the prefix, to give it weight. The dogfood is
not whether this renders — it renders fine — but whether a paged view
could land on the first header cleanly without orphaning the intro.

## EC2 — block taller than the viewport (synthesis trigger)

observe: this section is intentionally oversized — more lines than a
24-row viewport. The synthesis says an oversized block scrolls
internally (SLIPPY), not page-jumps. In today's slippy renderer there
is no block concept; you just scroll. The dogfood: does the
oversized-ness feel like one continuous block, or does the eye lose
the section boundary on scroll? This is the case that triggers the
synthesis.

1. line one of a long ordered list inside the section
2. line two
3. line three
4. line four
5. line five
6. line six
7. line seven
8. line eight
9. line nine
10. line ten
11. line eleven
12. line twelve
13. line thirteen
14. line fourteen
15. line fifteen
16. line sixteen
17. line seventeen
18. line eighteen
19. line nineteen
20. line twenty
21. line twenty-one
22. line twenty-two
23. line twenty-three
24. line twenty-four
25. line twenty-five — past a 24-row viewport
26. line twenty-six
27. line twenty-seven
28. line twenty-eight

## EC3 — long code fence inside a section

observe: the fence is longer than the viewport, inside a headered
section. Our lean: the section is the unit; the fence is content
within it; an oversized section scrolls internally (synthesis
holds). The dogfood: does the fence read as *part of* the section, or
does the eye treat the fence as its own block? If the latter, the
"section is the unit" lean is strained.

```text
fence line 01 — the fence is content, not a block
fence line 02
fence line 03
fence line 04
fence line 05
fence line 06
fence line 07
fence line 08
fence line 09
fence line 10
fence line 11
fence line 12
fence line 13
fence line 14
fence line 15
fence line 16
fence line 17
fence line 18
fence line 19
fence line 20
fence line 21
fence line 22
fence line 23
fence line 24
fence line 25 — past a 24-row viewport
fence line 26
fence line 27
fence line 28
```

## EC4 — mixed header levels (nesting)

observe: this section contains sub-headers. Does an `###` break the
`##` unit, or nest within it? Our lean: nesting preserves the outer
unit; the inner header is a nav target, not a page break. The dogfood:
when you scroll past the `###` below, does it feel like a new page or
a sub-region of the same page? The LCARS badge (the `###` marker) is
the visual cue either way.

### EC4a — a sub-section (H3)

A sub-section's content. If the outer `##` is the unit, this H3 is a
nav target within it. If H3 breaks the unit, this is the start of a
new page. The render does not distinguish; the paging policy would.

#### EC4b — a sub-sub-section (H4)

Deeper still. H4 under H3 under H2. The nesting-depth question: does
the unit boundary follow the shallowest header in the chain, the
deepest, or a fixed level? Our lean (shallowest — the outer `##` is
the unit) is an exploration output to defend, not an input to assume.

### EC4c — a second sub-section (H3)

A second H3 under the same H2. If H3 were the unit, this is a new
page. If H2 is the unit, this is a nav target within the same page.
The dogfood: does the visual rhythm read "two sub-pages" or "two
parts of one page"?

## EC5 — code-fence `##` collision

observe: the fence below contains markdown header lines, including
`## Heading 2`. A scan of rendered output cannot tell this `##` from a
real H2 — the NO_COLOR-parity invariant makes them indistinguishable
in the byte stream. This is the first mapped edge case of the
exploration. The dogfood: in today's renderer the fence renders
verbatim (no LCARS badge, no header colour) — so a *human* eye
distinguishes it, but a *scan* cannot. That is the collision.

```markdown
# Heading 1
## Heading 2
### Heading 3
#### Heading 4
```

A real header follows, to show the contrast — the badge and colour
on the next line are the human-eye signal the scan lacks:

## EC5b — a real header after the colliding fence

observe: this is a real `##`. The fence above contained a fake `##`.
In the rendered output, this one has the LCARS badge and header
colour; the fence's `##` does not. A scan keyed on `^## ` in the
byte stream finds both. The dogfood confirms the collision is real,
not theoretical — both are in this document, and only the badge
distinguishes them.

## EC6 — code-fence-heavy unit

observe: this section is mostly code demonstrating markup, in the
shape of `docs/ssh-and-gemini.md`. The reframe: code blocks are
second-class (coloured text, truncate left, could truncate below); a
code-heavy unit is oversized-by-content, and the synthesis handles it
by the same rule — an oversized unit scrolls (SLIPPY). The dogfood:
does this section feel like a page (a unit of study) or a scroll
(a flow)? If the former, freeze is the affordance the reframe names;
if the latter, slippy is already correct.

```ssh
# /etc/ssh/sshd_config.d/okuda.conf
# okuda is the reader, not the shell
Match User reader
  ForceCommand okuda %f
  PermitTTY yes
  X11Forwarding no
```

```markdown
# A markdown document demonstrating headers

## A section
Some prose.

### A sub-section
More prose.

## Another section
End.
```

```text
ssh -p 2222 reader@host docs/showcase.md
# okuda reads the file; the user never gets a shell
```

The section's prose bookends the fences. A paged view would have to
decide: is this whole `##` a unit (with the fences as content), or do
the fences break it? Our lean: the section is the unit.

## EC7 — no-header document (degenerate, whole-document)

observe: this case is a *whole-document* property and cannot be
embedded as a section in a headered document. To dogfood it, render
the fenced fragment below as a standalone file. The question: a
document with no headers has no block boundaries to page to. The
honest answer is the constraint-4 fallback — slippy is the whole
document. The dogfood: does a no-header doc feel broken in slippy, or
correct? (Lean: correct. Slippy is the fallback paged is the
refinement.)

The source of a no-header document:

````markdown
This is a document with no headers at all.

It has paragraphs.

And a list:
- one
- two
- three

And a code fence:

```
ls -la
```

But no `#`, no `##`, nothing for a block scan to key on.
````

## EC8 — single oversized code fence as a unit

observe: this section's content is one long fence and nothing else.
The fence is the unit. `less` scrolls it; the synthesis scrolls it
(SLIPPY). The dogfood: does a fence-as-whole-section read as a block
to land on, or as a flow to scroll through? If the former, a
fitting-but-tall fence (say, 40 lines in a 50-row viewport) would be
PAGED; an oversized one (40 lines in a 24-row viewport) would be
SLIPPY. The measurement decides.

```text
sole-content line 01 — the fence IS the section
sole-content line 02
sole-content line 03
sole-content line 04
sole-content line 05
sole-content line 06
sole-content line 07
sole-content line 08
sole-content line 09
sole-content line 10
sole-content line 11
sole-content line 12
sole-content line 13
sole-content line 14
sole-content line 15
sole-content line 16
sole-content line 17
sole-content line 18
sole-content line 19
sole-content line 20
sole-content line 21
sole-content line 22
sole-content line 23
sole-content line 24
sole-content line 25 — past a 24-row viewport
sole-content line 26
sole-content line 27
sole-content line 28
sole-content line 29
sole-content line 30
```

## EC9 — very short document (whole-document, fits one viewport)

observe: this case is a whole-document property — a document short
enough to fit one viewport. Everything is PAGED; nothing to scroll.
Cannot be embedded as a section (a section in a longer document is,
by construction, not a one-viewport document). Documented here for
completeness; the dogfood is rendering any short file (e.g. a brief's
front matter alone). The dogfood confirms the trivial case: a fitting
document holds, no movement is induced. Slipperiness is induced, not
native.

## Observation log

Dogfooding results are recorded here as the document is walked. Each
entry: the case, the render behaviour, and the implication for the
paged layer. Results are valid regardless of the experiment's outcome
— they are evidence about the current renderer's behaviour on real
document shapes.

- *(empty — to be filled by walking the document in okuda)*

**Zoom dogfood (2026-09-03, in-session):** a zoom to counter perceptual
blur hit both panes. RHS (okuda, rendering the anchor doc in Gloam):
the frame recomputed, the eye-proxy anchor re-found, the reader
landed on "The thesis, restated" and knew where they were — the
stillness property held under zoom, exactly as the zoom-is-resize
note predicted. LHS (Pi, the chat/agent surface): the text jumped,
forcing a hunt for the input, a scroll-bottom confirm, and a
scroll-back to check for missed content — hopscotch-on-ice, paid in
real time. The contrast is the evidence: the surface with an anchor
held the reader's place; the surface without one didn't. The anchor's
value, demonstrated by its absence. The LHS reflow is not okuda's to
fix (three-concerns: windowing belongs to the host); it is the frame
rule's advertisement — the surface that anchors holds your place,
the surface that doesn't, doesn't. Valid regardless of the frame
rule's outcome; the slippy eye-proxy already approximates the
property the frame rule will make structural. (Herdr's refresh quirks
observed during the same session are host-side and not our concern.)

**Sizing and zoom (no separate case):** terminal zoom (Cmd±) changes
the character-cell size, which changes rows and columns available,
which is the *same signal* the frame rule already handles — a resize.
There is no zoom case; there is only resize, and zoom is one of its
causes. The frame recomputes for the new glass and re-anchors on the
same header. Readability concerns that follow from it — too small to
read, too dim, too big — belong to the host (terminal emulator, the
*window* surface) or to palette (a render setting, not a frame
concern). okuda renders bytes; the host decides the cell size. The
three-concerns principle assigns sizing and zoom to windowing, which
okuda refuses to fold. The rule inherits the refusal: it never sizes,
never zooms, never adjusts brightness; it fills.

**Pre-walk finding (authoring-time):** EC7's nested fence — a
markdown fragment demonstrating a code fence *inside* a code fence —
broke the outer fence on first render. CommonMark: a fenced code
block cannot contain a same-length fence; the outer fence must use
more backticks (```` ``` ```` → `` ```` ``). Fixed with a 4-backtick
outer fence. *Valid regardless of the paged experiment's outcome:*
this is a real rendering behaviour any document demonstrating nested
fences must honour, and a small authoring hazard worth a playbook
note one day.

## Related

- `briefs/2026-08-29-brief-okudagram-frame.md` — `BRF-PAGED-OKUDAGRAM`,
  the aspirational brief this document dogfoods
- `docs/2026-08-27-okudagram-scratchpad.md` — the lexicon
  (*hopscotch-on-ice*, *ice-dancing-on-concrete*, *tied-to-the-mast*,
  *slipperiness is induced, not native*)
- `docs/ssh-and-gemini.md` — the real document whose code-fence
  `##`-collision (lines 49-51) is EC5/EC6
- `docs/showcase.md` — the okudagram header/closer (the unit's visual
  anchors)