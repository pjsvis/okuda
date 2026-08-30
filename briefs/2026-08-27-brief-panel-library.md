---
type: Brief
callsign: BRF-PANEL-LIBRARY
---

# Brief: The Panel Library — Chunk-Addressable Okudagrams

**Date:** 2026-08-27
**Status:** Open

---

## Objective

Promote the renderer from a linear stream to a **library of panels**: the
document's heading semantics split it into addressable chunks (okudagrams),
any of which can be squirted onto a variable text matrix, complete, framed,
and fit — "on screen, now". The linear render remains the degenerate case:
all panels, in order, on one tall matrix.

We are not reinterpreting the document. We are assessing its chunkability
and its fit — the semantics come from the author; the framing, fit, and
freeze come from the viewer.

## The two views

Not one view with a lock — two views with different controls. The
document is static, located, and structural; **slipperiness is induced by
the input, not a property of the document**. So the views differ by
input contract:

- **The Scroll (default).** Continuous, pixel-addressed, fluid under
  touch, trackpad, and wheel. For assessment, scanning, exploration.
  Displacement is a feature here — the reader is surveying.
- **The Panel (on-screen-now).** Entered by intent, not by accident:
  a terse command, a share request, a launcher pick. Chunk-addressed,
  pixel-perfect, and **solid as a rock by architecture** — the panel
  view wires up no displacement channel at all. A scroll event is not
  an instruction; it is noise. The only admitted input is the terse
  verb set — keys, buttons, or voice are all just transports for the
  same verbs (`n`/`p` next and previous panel, `top`, `bottom`,
  `refresh`, `release`). Kindle-like readability: the panel is a
  settled page, and it stays until dismissed — no timeout, no
  auto-advance, no live-reload jitter; even a changed file waits for
  the `refresh` verb.

Not every document wants to be on-screen-now — promotion to the panel
view is deliberate, which is why the scroll stays the default and the
panel is a commitment.

A long panel that overflows its matrix is traversed by the same discrete
verbs (panel-scroll), never by continuous input — and within it, a
**freeze** sub-state pins a slice for discussion (the static part of a
long diagram or table), released to continue. **Make the surface fit the
activity:** continuous survey → the Scroll; discrete traverse → the
Panel; study a fixed region → freeze within the Panel. The mismatches are
the tells — hopscotch on ice (discrete intent on a continuous surface)
and ice dancing on concrete (continuous intent on a discrete surface).

- **Chunk assessment.** Headings split the document into subtrees; every
  subtree is a complete unit (frame opener = the heading, frame closer =
  the block terminator). No new parsing, no interpretation — the tree
  already exists in the source.
- **Matrix fit.** A panel renders to the requesting matrix (`cols` and
  `rows`). A unit that fits renders whole; one that does not renders to
  the edge with an elision **fringe** — not a single discrete glyph but
  a block of nine dots that runs along the exceeded edge: three stacked
  `…` at the right edge where width runs off (the harder remedy — widen
  the matrix), three side-by-side `⋮` along the bottom where lines run
  off (the easier remedy — scroll or page). The fringe runs along the
  edge; the dots point in the direction the content continues. No
  reflow of raw blocks (fences, diagrams) — pleasantly brutal; a diagram
  too wide elides and invites widening, never wraps. The same brutalism
  extends to tables: a table too wide does not shrink-wrap; it elides
  (reverses the prior in-cell shrink-wrap — `decisions/014-table-elision-over-shrink-wrap.md`). Authoring guidance the
  renderer's fit behaviour rewards: long content goes vertical (the
  cheap, paginated dimension) — a long diagram is `flowchart TD`,
  scrollable; `LR` is for cycles bounded in width.
- **On-screen-now.** `okuda doc.md --section <anchor>` renders one chunk,
  framed, sized to the matrix, on the panel view's contract: there, and
  there until released. This is the sharing primitive: the unit of
  "look at this" — for a colleague, a launcher preview pane, a tmux pane,
  or a network selector (gopher/gemini face: each selector a panel).

## The cadence protocol (writer/reader)

The panel's stability is not just spatial — it is a protocol between a
writer (an agent, a build, a colleague) and a reader (the operator):

- **Notify, never disturb.** The writer edits the file; the reader's
  panel does not move. The change is announced in the margin — the
  fetch-state stamp (checked-time + changed/same/failed in the footer,
  td-a27b86) — while the view holds the version the reader sat down
  with.
- **The reader decides.** When the writer is done, the reader is told
  (intercom, footer stamp); reading the update is the reader's verb
  (`r` refresh), not the writer's push.
- **Diff on arrival.** After refresh, the reader wants "what changed?" —
  not "read it all again." The refresh verb should orient toward the
  differences (delta markers, or a split old/new) — the update is news,
  and news is read against memory.

The cadence establishes agreed places and states: where things currently
are, in what orientation, held stable until the reader says otherwise.
Spatial stability, provided on Voyager by the screens.

## The surface hierarchy

Voyager's displays stratify from world-facing to hand-facing, and the
components map onto the same ladder:

| Surface | Voyager | Ours |
| --- | --- | --- |
| Window | the viewport to space | the terminal window itself (the world; not ours) |
| Astrogation | the navigational map | the TUI scroll view — survey, locate, orient |
| Okudagram screens | semantic panels | the panel view — on-screen-now, pinned |
| Control panels | verb surfaces | the Gloam footer — state stamp, verb hints |
| PADDs | tactile, immediate | keys, buttons, voice — the verb transports |

Biggest and most passive at the top; smallest and most active at the
bottom. The hierarchy is a legend for placement decisions: new features
land on a surface, and the surface determines the interaction contract.

## The semantic pager

The panel view's navigation: vertical movement by chunk rather than by
pixel row. The pager moves between panel boundaries on terse verbs
(`n`/`p`). The document's shape is visible in the headings — the
pager moves between them; no second copy of the shape is drawn (a
chip-stack "minimap" was prototyped and dropped 2026-08-27: busy,
editorializing, redundant with the headings).

## Consumers

- **Launcher** (feat/gloam-launcher): preview and jump to sections, not
  just files; composes with `briefs/2026-08-26-brief-in-document-search-and-outlining.md`.
- **TUI (Gloam):** viewport becomes panel-paged; freeze mode guards
  careful reading and screen sharing; footer reflects frozen state.
- **Network face** (`docs/ssh-and-gemini.md`, `docs/ssh-and-gopher.md`):
  each selector serves one panel, framed, fit to the requesting terminal —
  Janeway's bridge panel over 1970s plumbing.

## Work Plan

1. [ ] Land the per-section frame decision (sculpt variants A–E probed
       2026-08-27; eye test pending — current lean: E, chip on major
       sections, document terminator as shipped).
2. [ ] Chunk extractor: heading-delimited subtree slicer over the source
       (reuses the outline extractor's heading scan).
3. [ ] `--section <anchor>` CLI: render one subtree, framed (heading +
       terminator), fit to `terminalCols()`/`terminalRows()`, `⋮` marker
       on truncation, `--no-color` parity.
4. [ ] Panel view in the TUI: entered on intent (verb `pin` or a section
       jump), no displacement channel wired (wheel/swipe/touch ignored
       by contract, not by filter), terse verb set (`n`/`p`/`top`/
       `bottom`/`refresh`/`release`), Gloam footer shows panel state,
       viewport anchored to the panel's heading — a semantic anchor, not
       a pixel row. A `refresh` verb is required before a changed file
       disturbs the screen.
5. [ ] Semantic pager keys in the TUI (`n`/`p` between panel
       boundaries).
6. [ ] Consumers (launcher section-mode, gopher/gemini serving) — each
      gets its own brief when it gets real.

## Non-goals

- No reinterpretation of content — decoration in the flow, never edits to it.
- No reflow of raw blocks — fences and diagrams stay verbatim; a panel
  too small for art elides (fringe along the exceeded edge) and invites
  widening, never mangles art or shrink-wraps a table.
- No shadow task system — panel states (`☐ ✓ ✗ ⋮`) remain document-state.

## Preconditions

- [ ] Block terminator shipped (td-5cdf42; tests green).
- [ ] Freeze-state footer glyph joins the audit working set before use
      (`docs/audit.md` coverage discipline).

## References

- Session artifacts: glyph doctrine + status lists + decision matrix
  (`docs/showcase.md`, `playbooks/authoring-playbook.md`); terminator
  probe (four-way, 2026-08-27); sculpt variants (five-way, 2026-08-27).
- `src/width.ts` — `FZF_PREVIEW_COLUMNS` precedent for matrix sizing.
