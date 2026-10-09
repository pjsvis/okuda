---
type: Brief
callsign: BRF-COMPLETE-BLOCKS
---

# Brief: The viewport holds complete blocks — cut at boundaries, in the printer and the frame

**Date:** 2026-10-09
**Status:** Open
**TD:** (to create when claimed)

## The rule, in one line

**A viewport shows complete blocks — or a single block that must scroll.** Nothing
is deleted; the tail is *deferred* (`docs/2026-09-05-frame-as-shite-filter.md`,
cut-and-defer: the tail waits for the viewport to grow).

## Where it comes from

The operator, reading paper, as a **prescription** — marked as one, which is the
right discipline for a design idea (clause 1 applied to a proposal):

> *"all we have left to do is to remove the incomplete paragraph/list/table/diagram
> etc items … I am aiming to separate blocks into the viewport for sequential
> inspection; the viewport only contains complete things or one thing that needs
> scrolling."*

Two observations preceded it, and they are the *why*: the blank line between blocks
is a **focus ring** (the parergon — neither inside nor outside the work, and what
makes the work appear as a work), and the bold gold lead is an **invitation whose
decline must be as cheap as its acceptance**. The ring is what makes the decline
cheap: you can see where "done" is. **An invitation whose decline is expensive is
a trap** — which is exactly why the frame doctrine already refuses slippy-within.

## The evidence

1. **The defect exists.** `docs/2026-10-06-the-eink-frame-is-a-second-host.md`
   printed today: page 2 opens with *"is ours, the glass is the host's, and the
   wire carries text."* — the tail of a paragraph whose head is on page 1.
2. **It is not rare.** Simulating breaks at four plausible page heights (62, 66,
   70, 74 lines) across four documents: showcase 0–1 mid-block breaks of 5–6;
   **the e-ink assessment 2 of 3; the lessons doc 1–2 of 3**; `time-is-a-claim`
   0–1 of 2–3. Prose-heavy documents split a block at a third to a half of their
   page breaks. `showcase.md` is the *lucky* case, because its blocks are short.
3. **A page holds 66 lines here and 68 there** — the number is a paginator
   detail, and different page heights give different break positions. **The
   renderer cannot know it**, which is the whole design constraint below.

## The constraint that places the fix

**The break position belongs to the paginator.** No render-time rule can respect
block boundaries, because the renderer does not know how long a page is. So the
rule must be enforced by whoever owns the viewport — and in each medium that is a
different component, which is the fourth instance of a pattern now worth naming:
*for every rule, name the component that owns the viewport, because only that
component can enforce it.*

| medium | the viewport owner | how the rule lands |
|---|---|---|
| paper | the printer | one element per block, `break-inside: avoid` |
| the TUI | okuda's frame mode (`src/frames.ts`) | the frame step lands on the last complete block; scroll only inside a single oversized block |

## Milestone 1 — the printer (this brief implements it)

The converter already has everything it needs: okuda separates every block with a
blank line (the loose-layout rule), so **the blank line is the layout's own block
separator** — a *shape* rule, like "a background equal to its foreground is a
fill". No markdown parsing, no renderer change, no structure invented.

**We make the cut — the browser only honours it** (operator's ruling, second
pass: *"we know the viewport we are targeting, all we are doing is trimming the
fat."*). The first attempt delegated the decision to CSS (`break-inside: avoid`)
and it worked, but it cost a page, did not say where the breaks fell, and could
not look ahead. Since the viewport is *known* — 80 columns, 66 lines at 10pt —
the cut is arithmetic:

- `splitBlocks` slices the render at blank lines, **losslessly**: the blocks are
  slices of the source, so `join("")` is the source. Nothing is inserted, nothing
  is dropped, and a block keeps its ring verbatim.
- `paginate(blocks, linesPerPage)` takes blocks while they fit and *stops* when
  the next would not: the fat is trimmed, no block is ever cut open, and the
  emitted pages are the blocks — in order, exactly once.
- The browser is told only `break-before: page` between pages. No
  `break-inside: avoid`, no delegation, no heuristics: deterministic, inspectable,
  and **the same algorithm the frame will use** (Milestone 2), which is the prize.
- A block taller than a page is not our problem: it takes a page and overflows —
  *"if the paper is not big enough then they need to get bigger paper."*

**Measured:** the same document is **3 pages** on this rule, against 4 under
`break-inside: avoid` — a greedy pack beats a lookahead-free browser heuristic on
both determinism and paper.

**Known limit, stated rather than hidden:** a fence containing a blank line is
split into two blocks, so a break opportunity can land inside a code listing. It
still breaks between lines (never mid-line), so the damage is an early page break,
not corruption. Fixing it properly needs the renderer to speak structure — the
second backend this silo refuses for print. The test pins this behaviour.

**Verification, on the artefact**: page 2 of a prose-heavy document, before and
after (`pdftoppm -f 2 -l 2 -png`).

- **Before:** page 2 opened with *"is ours, the glass is the host's, and the wire
  carries text."* — a paragraph's tail.
- **After:** page 2 opens with a complete paragraph; page 1 ends with a complete
  paragraph and the deferred block's absence is visible as white at the foot.

**What it cost, measured:** that document went from **3 pages to 4**. Completeness
costs paper — the same trade as any widow/orphan control, larger because the unit
is a whole block. It is the price the rule names, and it is paid where the block
cannot fit. A smarter rule (*cut only when the gap would waste more than N lines*)
is not expressible in CSS — and the TUI's Milestone 2 **can** do it, because there
okuda owns the glass and can measure the gap. Print takes the simple rule; the
frame can take the better one.

## Milestone 2 — the frame (a separate brief or a follow-on commit)

In the TUI, okuda *is* the paginator: it knows the glass height, so the rule can
be absolute. The frame step should land on the last **complete** block that fits,
and slippy-within should be permitted only when a *single* block exceeds the
glass.

**That amends doctrine, so it is not a drive-by.** The frame note says *cut*, full
stop, and refuses slippy-within categorically (the shite filter: do not let the
reader slide into un-inspected content). "One thing that needs scrolling" is a
deliberate, bounded exception and needs an ADR sentence beside
`docs/2026-09-05-frame-as-shite-filter.md` and the paged-okudagram brief.

Not in this brief's scope: touching the frame between printing works and when
Milestone 1 has shown the blank-line rule to be reliable. The printer is the
cheap probe — a mistake there costs an early page break; the same mistake in the
frame costs a scrolling bug.

## Acceptance criteria

- Every block prints whole: no page break inside a paragraph, list item, table,
  or diagram — verified on the page images, not asserted.
- Nothing is deleted: the content lines survive in order, and a run of blank lines
  collapses to one ring (uniform air, no double gaps) — pinned by test.
- The split is by blank line only — no markdown parsing, no renderer change, no
  new dependency.
- The fence-with-blank-line limit is pinned by a test.
- The page count changes only where a block was deferred; `just check` green;
  `bun test` passes.

## Out of scope

- **Renderer structure.** No `--html` rung, no semantic block emission. If
  code-fence splitting ever matters, that is a separate decision with its own
  cost, and it is not this brief's.
- **Widow/orphan control inside a block.** A block is atomic; its interior is the
  renderer's business.
- **Elision versus wrapping — closed by ruling** (2026-10-09): *"with regard to
  elision on paper, just elide … if the paper is not big enough then they need to
  get bigger paper, not our concern."* So paper keeps okuda's elision exactly, and
  the sameness rule holds with no exception to maintain. The open question retires.
- **Deleting or truncating content.** Defer, never drop.
- **Page geometry.** The page box stays A4, 80 columns, 10pt (BRF-PAPER-RUNG).

## Related

- `BRF-PAPER-RUNG`, `DBF-PAPER-RUNG`, `docs/2026-10-09-paper-the-exclusion-principle-printed.md`
- `docs/2026-09-05-frame-as-shite-filter.md` — cut and defer, and the slippy-within refusal this refines
- `docs/2026-09-14-derrida-and-the-decomposed-pdf.md` — the parergon: the frame is the work
- `src/frames.ts` — the frame step that Milestone 2 would change
