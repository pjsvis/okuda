---
date: 2026-11-01
kind: discussion — a position on figure and ground, and the gap it falls through
lineage: the operator's observation that after every discipline had said its piece, a page could still be unreadable before a single word was read. The measurements are `just surface`'s; the finding is the evening's.
status: position taken — falsifiers named in the last section, not disclaimers
---

# The gap before the first word

> A hosted terminal can be told its font, its cursor, its padding, its opacity, its
> palette, its theme — and not its ink and its ground. Those two values decide
> whether a document is readable at all. That is not a missing feature; it is a
> hole in the division of labour, and it is old.

## The gap

Stated as an inventory, so it can be checked instead of believed.

| settable in a hosted terminal | not settable |
|---|---|
| font, font size, fallbacks, features | **the ink** |
| cursor style, colour, blink | **the ground** |
| padding, opacity, blur, background image | |
| the sixteen ANSI slots, the palette | |
| the theme itself, and the picker | |

Every value in the surface can be set except the two that decide whether any of the
rest can be read. The renderer cannot set them — it does not see the glass. The host
can, and in an app the host has put them inside an object with a picker, so changing
the paper under someone else's document is a side effect of choosing a look.

## The stack

Three layers. The rule is that each may use the layer below it and may not redefine
it.

| layer | kind | what it decides | owner |
|---|---|---|---|
| **the pair** — ink and ground | **required** | whether anything can be read at all | everyone, which is to say nobody |
| **the roles** — the document's colours | **fixed** | what a mark on the page means | the renderer |
| **the theme** — chrome, ANSI slots, everything the first two do not need | **optional** | what it looks like | the host, then the person |

Read upwards: an option may decorate a requirement, and may not set it. Both defects
found this week are one inversion of that order — in one app the *theme* owns the
pair, so a cosmetic choice sets a requirement as a side effect of picking a look; in
one terminal the pair sits correctly at the bottom and nothing reports whether any of
its 819 shipped pairs satisfies the layer above.

The rule that follows is checkable, which is the only reason to state it:

> **An option must not consume a requirement.** Adding a choice may not subtract a
> capability that existed without it.

Test it by enumerating the preconditions — the pair is settable, the roles are not
remapped, the text is the text — then enabling each option and checking the list
survives. Every regression of this class fails the same test: an app's terminal losing
the pair it had as a program; a minimum contrast replacing the program's colours with
black and white; a picker changing the paper under someone else's document.

## The claim

**Legibility is not a feature of the interface. It is the precondition for there
being an interface.**

Every other consideration — hierarchy, affordance, density, motion, brand — is
work done *above* the floor. If the floor is missing, the work above it is not
degraded; it is unread. And the floor is not taste: it is a relation between two
values, and it can be measured, declared, and gated. We have built the measurement
and the gate. This document states the position the measurement obliges.

The two values are the **ink** and the **ground**. What a renderer controls is the
*contrast between them*, never either alone. The figures on a page are its roles;
the page is the ground; and when that relation inverts, the accents become the
figures, the prose recedes, and nothing anywhere reports an error.

**If it cannot be read, it does not matter what colour it is.** That is the whole
doctrine in one line, and it is a slogan unless it carries a test — so it carries
this one: a page that clears the floor and keeps its order is a page whose colours
matter; a page that does not is a page whose colours someone is paying for with their
own attention. The falsifiers at the end of this document are the line's falsifiers.

## What we measured

Three pairs, two readings, no taste required. `readable` asks whether every role
painted on the ground clears a floor; `navigable` asks whether any role that
annotates prose out-ranks the ink.

| pair | readable | navigable | where it comes from |
|---|---|---|---|
| the recommended pair (`#221f1c` / `#d6cfc4`) | **yes** | **yes** | dogfooded on the glass |
| a UI default (`#21252b` / `#abb2bf`) | yes | **no** — 12 roles out-rank the prose | shipped with an app on this machine |
| another shipped theme (`#ffffff` / `#c0c0c0`) | **no** — 16 of 23 roles under 3:1 | **no** — 18 out-rank the prose | shipped with the same app |

The third is the one to sit with: its terminal pair is **1.8:1**. That is not a
pair chosen for a bad palette; it is a pair no program could read comfortably. It
shipped. The document that shipped it renders perfectly.

Nor is it a sample of two. The same reading over a terminal's own bundled catalogue
(`Ghostty.app/Contents/Resources/ghostty/themes`, 819 themes in this build):

| reading | count |
|---|---|
| cannot be read at 3:1 | 227 / 819 |
| invert a foreign palette | 366 / 819 |
| both | 165 / 819 |
| cannot read anything — own ink under 3:1 against own ground | 10 / 819 |

Two in five of a terminal's own themes cannot carry a foreign document palette
correctly, and ten cannot read plain text. No one was careless; nobody had been told
the property existed.

## Why this is a gap, and not a defect

A defect has an owner. This has a shape instead:

- **Three layers, three owners, no invariant spanning them.** The palette owner
  cannot see the glass. The theme owner knows nothing of the roles. The standard
  measures text against its own background and is blind to the ordering *between*
  roles. Each layer is correct in isolation; the hole is in the between.
- **Absences do not throw.** The bytes are right, the document renders, the exit
  codes are zero. There is no error to file, so nothing is filed — for years.
- **The parameter is unowned.** Everything else in a page's appearance belongs to
  someone: the roles to the renderer, the pixels to the host. The figure–ground pair
  belongs to nobody in particular, is chosen by whoever last opened a settings file,
  and is observed by no one who knows what it does.
- **The exclusion hid it.** A doctrine that refuses a cosmetic choice refuses the
  *choice*, not the environment the choice would have controlled. That environment
  arrives anyway, supplied by a party who was never told what it must supply. So
  every exclusion carries a delegation, and every delegation an unstated
  precondition. "Respect the palette the terminal is already running" presumes that
  palette is well set. Measured above: it was 1.8:1.

## Why the literature is silent

Because interface literature is written by **owners**. A toolkit author owns its
widget colours; an application author owns its chrome; a scheme author owns its
palette. Each can write about what it owns and can observe. The pair belongs to none
of them, so it has no author — and what has no author has no chapter.

The one tradition that got it wrote from the opposite position: a scheme author who
owned **both ends**, defining the ink and the ground together as a set of lightness
relationships. That solution is available to whoever designs a whole scheme and
unavailable to anyone writing a renderer that must survive on someone else's ground.
The silence is the space between those two positions, and it has stayed empty
because each side believes the other holds the ground.

There is also a name the discipline has never used for its own failure. The
perception literature has had it for a century: **figure–ground reversal**. What we
call "blown out" is an inversion of figures and ground, and it has been studied
since 1915. Speaking the old name is not decoration — it removes the need to invent
a phenomenon, and leaves only a measurement to produce.

## How it got this way

Not through negligence. Through the exhaustion of a constraint.

| era | who owns figure and ground | what it produces |
|---|---|---|
| fixed-palette micros, text-mode PCs | the machine, in ROM; or the program, painting its own surface | legible **by construction** |
| early GUI systems | the machine, for chrome; applications for content | legible **by accident**, usually |
| the modern desktop | delegated: system appearance → applications → users → themes | legible **by luck** |

The early Macintosh is the instructive case, and the operator's phrase for it is
exact: a *grayscale render*, one bit, no user colour, the machine owning both ends.
Its celebrated readability was not a triumph of taste over constraint — it was the
**consequence** of the constraint. Hierarchy had to come from weight, pattern,
spacing and position because nothing else was available.

Every step out of that world was individually an improvement: accessibility, user
preference, per-app design, dark mode. None was wrong. Together they removed the
owner, and the discipline that had been invisible while the constraint held went
with it.

## What it costs

The reader does not fail; the reader **compensates**. They lean in, narrow attention,
and reach for the brightness keys — which cannot work, because a uniform scale
multiplies both values and leaves the damaged ratio untouched. But it produces
*relief*: the accents stop blooming, the glare recedes for a moment. Relief
uncorrelated with the cause is the most expensive repair available, because it
teaches the wrong cause, and a habit forms around it.

Gombrich called the viewer's contribution to what is seen the **beholder's share**.
Here it is an unbilled debt: continuous, invisible, and — after enough years —
invisible *to the person paying it*, which is how a defect becomes a matter of
taste.

## Options, parameters, and the range they are allowed

The rule at the stack is that an option may not **set** the requirement. There is a
second rule, and it is the one that stops the first being read as permission:

> **An option may not set the requirement, but an option can move the measurement.**
> And if a value makes the page unreadable or unranked, it is not an eccentric choice —
> it is outside the range in which the layer above survives. As the operator put it:
> *"if it makes things look like shite then it's not a good option, is it."*

That distinction sorts every setting into three kinds, and only the first is a matter
of taste:

| kind | example | any value admissible? | what it owes |
|---|---|---|---|
| **free option** | the hue of a palette; the serif of a face | yes | nothing |
| **bounded parameter** | background opacity; cell size; stroke weight; **the pair itself** | **no** — there is a failing band | its range, stated |
| **requirement** | that figures be distinguishable from ground | not applicable | an owner |

The middle row is where the industry's trouble lives. A bounded parameter presented as
a free option is a trap wearing a preference's clothes: the person believes they are
choosing a look and is in fact choosing whether the app can be read at all. And the
cost is not private — a bad value in one settings file damages every document that
person will ever read in that app.

The answer is not prohibition, which nobody accepts and nobody needs. It is **bounding**:
freedom inside the range, and the range stated where the value is set. A terminal can
let you pick any ink that keeps its own text legible; a theme picker can let you pick
any theme that does not invert someone else's page. Freedom with a floor, and the floor
written down — which is the whole of what this document asks of anyone.

| known coupling | the option | what it moves |
|---|---|---|
| translucent ground | opacity, blur, background image | the ground stops being a value and becomes a range, so the pair becomes a bound |
| cell size, zoom | font size, zoom, cell width | fine structure (rules, joins, stems) degrades before the ratio does, so the effective floor rises |
| stroke weight | font weight, `font-thicken` | apparent contrast at the same measured ratio changes with stem width |
| **zoom, reflow** | zoom implemented as scale rather than as resize | the program is never told the new grid, so a width contract is satisfied on a width that no longer exists |
| theme's own ink | `minimum-contrast` and similar | the reading is computed on colours the program no longer displays |

Each of these is filed with a trigger rather than fixed, because each is measurable and
none is yet measured. Naming them is what stops the next session rediscovering one by
accident and calling it a new finding.

### The geometry sibling

Zoom is the pair's sibling, and the test is the same one:

> **A zoom the program is told about is a resize, and the host owns the mechanism while
> the renderer keeps its contract. A zoom the program is not told about is a
> magnification of someone else's output — a claim about a width that no longer
> exists.**

Figure–ground is a claim about a palette the host was never told about; zoom without
reflow is a claim about a width that no longer exists. One defect class, two
parameters.

Three consequences worth keeping:

- **Delegating to a terminal resolves it.** okuda's own answer to "who owns zoom" is to
  clone out to a terminal, where the cell size drives the grid and the program is
  therefore told. We do not own zoom and do not need to: we own the width contract, and
  a terminal honours it. That is the same move as the pair — declare the requirement,
  let the host hold the mechanism.
- **The app world missed a trick with global zoom.** A global scale could have been a
  *resize broadcast* — recompute every embedded terminal's grid at the new cell size and
  tell each program — instead of a magnification applied to a frame. The mechanism is
  the same cost either way; only one of them keeps the content honest.
- **The web is another ownership loss.** When a terminal is hosted in a browser, the
  page owns zoom, and whether reflow survives becomes a property of that terminal's
  implementation — a fit-on-resize grid reflows, a fixed grid magnifies. That is
  testable in one command on any terminal: **`stty size` at 100% and at 200% page
  zoom.** Same width means magnified; halved width means reflowed. Nobody needs an
  instrument to settle it, which is exactly why there is no excuse for not checking.

## Coherence, stated precisely

A page coheres when every mark on it is **comparable with every other on one scale**.
That scale is the ink: a role's meaning is its ratio to the ink it is painted beside.
Fix the ink and hierarchy is *ranked* — a heading quieter than the prose, a rule
quieter than both, a state glyph louder on purpose and by how much. Remove the fixed
ink and there is no common denominator left, so the only axis remaining is raw
salience: chroma, brightness, size.

That is what "the loudest colour wins" describes, and it is worth being exact about
because the phrase invites the wrong diagnosis. **The problem is not decoration. The
problem is competition without a denominator.** A nursery with a palette is fine; a
nursery in which every object fights for the eye is a market, and markets rank by
loudness because loudness is the only measure they share. A document is the opposite
instrument: an advertisement must win attention against an unknown surround and so
maximises chroma; a document must be **calm** against a known surround, because its
whole job is to let structure be noticed. Hand a document an advert's conditions and it
adopts an advert's grammar.

Two consequences worth keeping, both of which bound the claim:

- **The three readings are three faces of one requirement.** *Readable* asks whether a
  mark can be seen at all; *navigable* asks whether it keeps its rank; *coherent* is
  what the reader experiences when both hold — every mark commensurable with every
  other, so attention can be spent on meaning instead of on finding things.
- **Coherence is local to a surface, not global to a product.** This document does not
  argue that everything should look alike. It argues that everything on **one page** is
  measured against **one ink**. Two documents in two palettes are each coherent; a
  design system that makes them identical has bought coherence by deleting the
  difference. The instrument checks one pair at a time, which is pluralism by
  construction: commensurability, not uniformity.

## The position

Six commitments. Each is a claim with a test, not a preference with an adjective.

1. **Declare the pair.** An unowned parameter must be stated where the other party
   can read it — a pasteable configuration, a generated theme, a printed verdict.
   *Test:* can a stranger set the pair from what we ship, without asking us?
2. **Never compensate.** A renderer that infers a bad surface and adjusts to it
   makes the bad surface invisible, which is worse than the bad surface.
   *Test:* does the diagnosis change anything other than the diagnosis?
3. **Measure the requirement, not the taste.** Two readings, floor and rank.
   *Test:* do two people with differently trained eyes get the same verdict?
4. **Refuse the second mode.** A light palette is a second set of role meanings and
   a second set of relationships to keep true. *Test:* can the claim survive being
   made twice? If not, make it once.
5. **Name the phenomenon.** Figure–ground reversal, not "harsh" and not "washed
   out". *Test:* does the name point at a literature and a measurement?
6. **Gate the recommendation.** The pair we recommend is checked on every commit,
   so a role hex cannot quietly break the page. *Test:* does breaking it fail
   something other than a person's patience?

## What we are not claiming

- **Not the room.** Legibility has two halves. The device side — the pair and its
  contrast — is measurable and ours to declare. The room side — the surround and its
  glare — is not observable by any software and belongs to the person's lighting.
  Every claim we make is about the first half, and saying which half is the honest
  form of the claim.
- **Not an accessibility standard.** Those measure text against its own background
  and are right to. We measure the *order between roles*, which is a different
  question and a different instrument.
- **Not other people's negligence.** Two shipped pairs failed our readings because
  nobody owned the value, not because anyone was careless. Systems, not villains.
- **Not that the terminal will obey.** The pair is recommended to a host and
  asserted by nothing. Where the host disagrees, we diagnose and do not argue.

### The banal version, and why this is not it

Stated plainly, the principle is near-tautological: **apps that own their content and
their surface are already coherent, because one hand tunes both ends.** Every product
we would name as well designed does exactly that. Said to such a product, this
document says nothing it does not already do by instinct — and Solarized published the
designer's version of the argument in 2011.

The claim here is narrower, and it is the only version that survives a hostile reader:

> **Where a document carries its own palette onto a surface it does not own, the
> figure–ground requirement has no owner — and it is violated silently.**

Two conditions, together, and neither is sufficient alone:

| case | the document's palette | the surface | result |
|---|---|---|---|
| a browser page | the page's own CSS | the page's own | **fine** — nothing is inherited |
| HTML email in a dark client | the sender's colours | the client's | light-on-light |
| pasted cells in a spreadsheet | the run's colours | the sheet's theme | white-on-white |
| a document in an app-hosted terminal | the renderer's roles | the app's theme ink | figure–ground reversal |

The first row is the tell, and it is the exception that proves the rule: the web looks
fine not because browsers are wise but because a page arrives with its surface
attached, so the requirement is always satisfiable by the party that has it. Every
other row inherits one end, and every other row fails the same way — silently, because
the bytes are correct and nothing throws.

So the honest scope: **the principle is banal for products that own both ends, and
necessary only for the class that cannot.** That class is growing, not because
designers are becoming careless but because terminals are moving inside apps and
documents are moving into viewers. A product that owns its surface does not follow a
principle; it enjoys a condition. The condition is what is changing.

## What would falsify this

A position that cannot be wrong is a mood. Three observations would sink it:

1. **A class of host where the pair is unownable, unmeasurable, and the pages still
   read.** Then the invariant is not needed, and the gap is a gap in our instruments
   rather than in the discipline.
2. **Evidence that inversion costs the reader nothing** — reading speed and
   comprehension flat under figure–ground reversal, across readers and surfaces.
   Then it is taste after all, and the whole apparatus is over-elaborate.
3. **A palette no admissible ink can invert.** If every role sat far below every
   plausible ink, the doctrine would be true in general and unnecessary for us in
   particular. We measured the opposite: one rung of ink crosses twelve roles.

## What it obliges

Every future configurability reopens the question *who owns the pair* — and the
answer must be declared rather than defaulted. Every future role hex runs
`just surface` before it lands. A second palette is a second design, and it must be
generated to hit the same deltas rather than chosen by eye.

The floor does not care about our taste, and it will not be argued with — only
measured. That is the whole advantage of it.

## Ancestry

- **Edgar Rubin (1915)** — figure and ground, one contour, two readings.
- **The Gestalt school** — perception organises into figure against ground.
- **E. H. Gombrich, *Art and Illusion* (1960)** — *schema and correction*; the
  beholder's share.
- **Solarized (2011)** — the one scheme that defined a palette as relationships and
  therefore owned both ends; the precedent for what we cannot borrow.
- **base16 / tinted-theming** — the slots, and the silence on the rank.
- **`conceptual-lexicon.md`** — **figure and ground**, **the exclusion's
  precondition**, **TFS**, **the pair**.
- **`explainers/colours.md`** — the finding, the prior art, the base requirement.
- **`docs/2026-10-28-the-ground-you-read-on.md`** — the grounds, measured as pairs.
- **`debriefs/2026-11-01-debrief-two-readings-one-verdict.md`** — the control that
  corrected the brief.
