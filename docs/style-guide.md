# okuda — Style Guide

The inverse of the [grammar showcase](showcase.md). The showcase answers *"what does okuda do with my markdown?"* — the renderer's reference. This answers *"what markdown do I write to get the okuda look?"* — the author's guide. One read, the vocabulary internalised; the patterns reachable. Not a spec; a palette of moves.

The okuda look is **structured colour the eye scans before reading**. A wall of white text is what an agent emits when it treats markdown as a plain-text dump. A cool sophisticate treats it as a *layout brief* — the renderer supplies the colour, the author supplies the structure that earns it. Ephemeral docs — a menu, an index, a status page — are the canonical test: they have no content depth to hide behind, so their look *is* their legibility. Render this with `just style-guide` and read it as the demo of itself.


## The house move: the bold-lead list

The single pattern that most separates an okuda document from a wall of white. Each item opens with a bolded key followed by prose; the keys render as an amber column the eye scans without reading — the table's first column, rotated vertical:

- **Count.** The eye sees how many items there are before reading any.
- **Keys.** The bold leads scan like a table's first column; each key promises what its item covers.
- **Detail on demand.** Drop into the items that interest you; skip the rest, unread.

The bold lead does the work a colon or a heading would, without the ceremony. Reach for it whenever a list's items each have a name and a payload.


## State glyphs: assess before you read

The closed lexicon carries document-state the bullet cannot. **One glyph, one job** — a mark that duplicates an existing structure is noise; a mark that distinguishes what structure alone cannot is perception for free. The lexicon, coloured by the renderer:

- ☐ **Open.** Pending, draft, ready to start — not yet landed.
- ✓ **Done.** Accepted, shipped, verified — closed.
- ⋮ **Parked.** Gated, deferred, elided into a further question.
- ✗ **Rejected.** Out of scope, declined, failed — closed negative.

A glyph only earns its place where there is real variance. A column where every row is ✓ is decoration, not signal — leave it off. Declare the legend once, trust it after. The glyphs colour in prose, lists, and tables alike — the lexicon is consistent everywhere.


## The ◆ diamond: the load-bearing line

◆ marks the one sentence that changes how you read everything after it. The eye catches a diamond at three times the distance of italic — a priority flag, not a flourish. Use it once, at most twice, per section; a diamond on every line is a diamond on none.

> ◆ Inside a quote, the diamond marks the sentence that matters, so the skim finds it before the read does.

◆ is **not** a state glyph — it has no colour role of its own, riding the strong channel. Priority is a separate axis from lifecycle.


## Tables: the structured glance

Tables earn their place when the eye needs to compare across rows. The key column is bold amber (the bold lead, tabulated); the header is cyan; alignment is honoured per-column. Overflow splits by surface kind (ADR-022): jump-wired menus lay out right-anchored by role — number at the far edge, callsign its stable home, slug truncates with `…` then suppresses; prose tables wrap in-cell and the operator widens.

| Pattern | Channel | When |
| --- | :--- | :--- |
| Bold-lead list | amber key | items each have a name + payload |
| State glyph | traffic-lamp | rows carry lifecycle variance |
| ◆ diamond | strong | one line changes the read |
| Muted path | far | an index or menu line — provenance, not content |


## Near and far: the gloaming register

The colour register has one principle: *is this near or far?* **Near** is the content you're reading — bold, bright, the core. **Far** is provenance and chrome — muted, receding, like the status bar's folder/file text. The gloaming is the gradient between, and the okuda palette *is* the gloaming: blues (heading), browns (strong), yellows (emphasis, state-todo) — near dark when still light. Every colour decision asks one question: is this near or far?

A bare `.md` path in prose — `decisions/010-bounded-anchor-proportional-fallback.md` — lifts to the doc-ref gold (amended 2026-09-12: it receded to muted for one day too many — 2026-08-28 wired the gold, 2026-08-28 dimmed it, both same afternoon). The recession was by location, and location is the wrong test. The path is an affordance before it is provenance: in a silo where the filesystem is the message bus, a filename is an act — type it in the search and it resolves. So the near/far question gains its third term, answered by *what the text does*, not where it sits: content is near, provenance is far, and affordances — actable paths, keybinding hints — lift out of the gloaming into a register of their own: visible, subordinate to the rose vector paint (the silcrow is the actuation point; the path is the address). Put it last on a line, where the eye lands after the title has done its work. **An address may carry its line** — `src/render.ts:274`, `a.rs:1123-1142` — and the suffix lifts with it, as one token, because half an address in the register and half in plain prose is neither actable nor visibly wrong. The line is dereferenced, never rendered: there are no gutters on code, in any mode (`ADR-ADDRESS-NOT-COORDINATE-074`). The renderer cannot resolve the line for you and does not pretend to; it makes the address one thing you can select, search, or hand to the host. If the gold shouts against the emphasis register, dim by lightness (OKLCH L down, hue and chroma held) — never by guessing a new hue.


## The frame that wraps

Information is framed by a shoulder or an elbow, not by a box.

A box closes. It draws a perimeter and declares the contents complete — a claim
about the material that the author is rarely entitled to make. A shoulder turns
one corner and a rule runs from it; an elbow turns and the information sits
under the turn. Either way the frame **wraps**: it gathers the block and holds
it as one thing while leaving it open at the far end. Extensible, not sealed.

The distinction is the one the guide makes everywhere else. A frame that wraps
is a gesture; a box is furniture. It costs a glyph and a rule instead of a
perimeter, so it survives narrowing — which is what makes it compatible with
**progressive engagement** rather than merely cheaper than a box.

Reach for it when a block is one thing but not a finished thing: a section that
continues, a set of items that will grow, a group whose boundary is the point
and whose closure is not.


## Wrap is for prose

Wrapping is a claim that the break is insignificant. In prose the claim is
true — a paragraph is a flow, and where its lines stop is the renderer's
business. In a code line, a box edge, a table row or a diagram rank it is
false: the newline **is** structure, so a break asserts a shape the author
never wrote. A wrapped code line reads as two lines. A wrapped state machine
reads as a different topology.

So the renderer does one or the other and never both. **Prose wraps;
structure elides.** A preformatted block that outruns the glass is cut at the
right edge, marked `…`, and — where the block can say how wide it wanted to
be — the receipt carries the number (`art elided · needs 241 cols`). Nothing
is re-flowed into a shape it did not have.

**A cap is not the remedy.** A paragraph running 296 columns is as unread as one
cut at 40, and the renderer is not the party to fix it. Where the text sits and
how wide the page is belongs to the host's pane, or to a boot value the reader
chose — a width the renderer imposes on prose is compositing inside the
renderer, which the three-owner rule forbids (`ADR-PROSE-MEASURE-071`).

The test for any new block type: *does the output contain a line break the
source did not?* For prose, that is the point. For anything else, the block
is wrong. (`ADR-PANE-NOT-CANVAS-069`.)


## Diagrams: shape the eye can trace

A diagram is not a one-off ornament — it earns column space wherever prose would otherwise be describing a shape. The fence is intercepted pre-render, piped to `mermaid-to-md`, and the ASCII is coloured by channel: borders recede, arrows lead, text sits in the foreground. The diagram never wraps — a wrapped state machine is a lie about the topology. It elides instead: past the glass the art is cut with `…`, and the receipt names the columns it would need. Widening the pane shows more of the *same* diagram; it never changes the diagram. That is the difference between resizing a window and rewriting a file.

```mermaid
flowchart LR
  Stuff --> Things --> Things
```

Orientation is a semantic choice. A cycle reads across; a pipeline reads down. Same renderer, two shapes — pick the one that matches the system.


## The closing bookends

The header opens the render — badge left, title, chip right, spanning the width. The closer mirrors it: a muted chip at the badge's column, a muted chip at the heading chip's column, a rule between. Openings announce; closings release. A document that doesn't know it's done reads as a broken frame.


## Authoring contract

> **Free in prose, careful in art, never lying in a state.** Three clauses, three
> readers: the human reading for meaning, the human reading for shape, and both of
> them plus the machine reading the codepoint. Every rule below is one of these
> three, and each states its own failure — which is the only reason it is a rule
> rather than a preference.

The numbers and rules the guide states nowhere else — the ones an author, human
or agent, gets wrong by default.

- **Width.** Author to **79 columns**, the top rung of the squint ladder
  (`docs/2026-10-12-the-squint-test.md`). The ceiling above which the operator
  stops widening is a policy number and is currently unstated; 120 is the
  proposal, not a measurement. Past the ceiling the diagram stops being read as
  a whole, and a diagram read in halves has lost the thing it was for.
  **What you will see if you exceed it:** not a refusal and not a wrapped
  shape, but a cut one — `…` at the glass and `needs N cols` on the receipt.
  That receipt is the diagram telling you its size; believe it and reshape, or
  widen and read the rest.
- **Split by view, not by scissors.** Two halves of one graph contradict each
  other within a month. A context view and a sequence view of the same system
  do not, because they answer different questions.
- **Labels ASCII, prose free.** Diagram and table labels stay in ASCII; prose
  takes any script. Column alignment depends on the reader's font covering the
  glyphs, and the font is the one input the renderer cannot see. Prose needs no
  alignment, so prose is free.
- **BiDi is the second input the renderer cannot see.** okuda emits *logical*
  order and never reorders; the terminal's UAX #9 pass decides the visual result.
  That is not a gap — a renderer that reordered would be reversed a second time by
  every bidi-capable emulator. The consequence for an author: a right-to-left
  paragraph mirrors its inset and ragged edge on its own, so write it plainly; but
  **a right-to-left label inside art is not safe**, because art is laid out by
  visual column and a bidi terminal reorders the run while the box stays put —
  which is the rule above, with the reason stated.
- **Never tidy the right edge.** In a wide pane the ragged edge and the line
  count are the *scan channel*: one-line blocks read short, three-line blocks read
  long, and the eye runs down the left rail instead of along the text. Anything
  that equalises line lengths destroys the signal — justification, uniform
  padding, a fixed measure, a reflowed table that pads every cell to the longest.
  A ragged right edge is the document telling you how long each thing is.
- **Never fake a fit.** No hand-wrapping, no hand-padding to simulate a width
  the renderer would have elided. Elision is marked with `…`; a faked fit is
  marked with nothing, which is the difference between a reader who widens and
  a reader who is misled.


## The anti-pattern

Everything above is a refusal of the wall of white — the undifferentiated paragraph dump that signals "I had thoughts and no layout." The okuda author asks, before each block: *what is this block's structure, and which pattern earns it?* A list with a name on each item is a bold-lead list. A list with state on each item is a status-led list. A comparison across rows is a table. A shape is a diagram. A menu is the menu pattern. Prose with no structure is prose — and prose is fine, where prose is what's earned. The wall of white is prose where structure was available and refused.
