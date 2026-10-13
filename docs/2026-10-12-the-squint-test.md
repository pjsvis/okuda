---
date: 2026-10-12
kind: measurement — progressive engagement, and the two probes that make it falsifiable
lineage: the operator's riff on the viewport, 2026-10-12 — *"a document is a vertical thing as we visualise it… it could just as well be a horizontal thing… the apparent physical direction does not matter, rather it is the content of the viewport that matters"*, then *"we can see the okudagram from across the room through a television screen and it still makes sense and has a place and can be consulted — progressive engagement or something"*. The term is the operator's; the ladder is the receipt.
status: measured — the controls pass, the corpus is sampled twice, and the numbers below are re-derivable in fifteen seconds
---

# The squint test — progressive engagement, measured

> ◆ Across **515 tracked documents**, **515** open on a renderer-emitted identity
> header and **515** close on the renderer's terminator, with no blank line above
> the head or below the foot. At **31 columns** — 39% of the default glass — every
> document still carries headings, rules and prose, **90%** still carry diagram
> glyphs, and the mark of the cut rises from **92 documents to 287**. **Every one
> of those cuts is recoverable** — the ladder confirms the law per document, and
> only **3 documents in 516** lose anything that widening cannot restore.

## The claim

**Progressive engagement**: one artifact yields a truthful reading at each of
several viewing distances, and each reading is complete *at its distance* — the
far read is not a truncated near read, and the near read is not a decoration of
the far one.

The requirement is not graceful degradation. It is that the distant read be a
**map**, and that the descent into the detail be the reader's own act. The
ancestor is Okuda's own brief, and it is closer to the point than anything
written since:

> The two audiences were one artefact — atmosphere for the casual viewer at
> broadcast speed, real content for the interested reader who paused the tape.
> **The pauser was the design target, not an afterthought.**
> — `docs/2026-08-26-the-okuda-net.md:120-124`

## The test

The house rule is that a term must name its own failure, or it is a slogan
(`AGENTS.md`, **test-bearing**). So:

**The squint test**: render the same document on a geometric ladder of widths and
ask, at each rung, which *element classes* still read as themselves. Progressive
engagement holds when **class survival stays flat while damage is marked**.

Three things make it checkable rather than impressionistic:

- **The renderer states its own losses.** Because elision is the universal
  overflow policy (`ADR-UNIVERSAL-ELISION-050`), a cut is a character in the
  stream — a trailing `…` on the cut line, and the words `· art elided` on the
  diagram's indicator. Nothing here infers a width; the renderer reports it.
- **The ladder is prime.** 79 / 61 / 43 / 31. No rung shares a residue with the
  2-column document margin or the 4-column wrap budget, so a rung cannot coincide
  with the arithmetic it is meant to disturb.
- **The controls pass first, and the run halts if they do not.** A detector whose
  control has not been shown to fire is a claim about the detector.

## The instruments

| Probe | Question | Path |
|---|---|---|
| Frame contract | Do the brackets hold, and where is blank allowed? | `scripts/okudagram-probe.ts` |
| Squint ladder | Which classes survive the narrowing, and what is lost? | `scripts/squint-probe.ts` |
| Recoverability | Does widening restore, and what can it not restore? | `scripts/elision-monotone.ts` |

Both take the whole tracked corpus (`git ls-files '*.md'` — **515 documents on
2026-10-12**; the count is a reading, not an invariant, and every number below
moves with it), render with `color: "none"` so the measurement is of layout
rather than paint, and print numbers rather than conclusions. Both run in about
fifteen seconds.

## Result one — the brackets are total

At the default width, with an identity supplied:

| | count |
|---|---|
| Documents opening on the identity header (line 0) | **515 / 515** |
| Documents closing on the terminator (last line) | **515 / 515** |
| Both | **515 / 515** |
| Blank lines above the header | 0 |
| Blank lines below the foot | 0 |
| Longest interior blank run | **5 lines** |
| Documents with an interior run ≥ 3 | **4 of 515** |

So the start and the end of the document are **not viewport properties**. They are
facts at fixed offsets in the byte stream, emitted by the renderer
(`src/render.ts:423`, `src/render.ts:433`), and the glass merely clips them. That
is the difference between a mark that survives a pipe and a mark that reports
where the window happens to be — and it is why the terminator is legitimate in
the render plane and a continuation indicator is not.

The blank is at a boundary or it is not there: the longest interior run across
the corpus is five lines, and a one-line run is a paragraph gap, which is
content structure rather than slack.

## Result two — the silhouette survives, the detail is cut

Element-class survival, as a fraction of the documents that held the class at the
widest rung:

| width | heading | rule | diagram glyph | prose | lines vs 79 |
|---|---|---|---|---|---|
| 79 | 100% | 100% | 100% | 100% | 100% |
| 61 | 100% | 100% | 100% | 100% | 124% |
| 43 | 100% | 100% | 99% | 100% | 170% |
| 31 | 100% | 100% | 90% | 100% | **240%** |

Damage — documents showing a loss:

| width | art elided (docs) | cut lines (docs) |
|---|---|---|
| 79 | 9 | 92 |
| 61 | 24 | 145 |
| 43 | 34 | 218 |
| 31 | 36 | **287** |

Four readings, and the fourth is the one that matters:

1. **No element class vanishes.** At 31 columns — 39% of the default glass, and
   half the terminal width — every document still carries headings, rules and
   prose; 90% still carry diagram glyphs. The silhouette is intact.
2. **What degrades is damage, not classes.** The count of documents showing a cut
   rises from 92 to 287 (18% → 56%). The structure survives; the fine print is
   cut away. That is exactly the shape the term predicts: the far read is the
   map, and the detail is the layer the distant reader was not reading.
3. **The loss is marked, not silent.** `ADR-UNIVERSAL-ELISION-050` put a `…` on
   the cut and the words `· art elided` on the indicator. This is the resize
   contract's own standard — *a degradation that is lossless or marked*
   (`docs/2026-10-08-the-resize-contract.md`) — applied to width rather than
   height.
4. **The cut at the default is the model working, not damage.** At 80 columns
   **92 of 515 documents (18%) carry a cut**, and this was first read here as a
   legibility fault at the house's own glass. **Corrected in place, 2026-10-12,
   after reading the decision that owns the class.** `ADR-TABLE-EDGE-CUT-055`
   states the law and it is older than this document: *below the cap the edge cut
   is recoverable — the reader's lever is widen, and widening brings the bytes
   back; past the cap there is no lever, so the cut no longer truncates, it
   **hides**, and hiding is the one thing the model refuses.* A recoverable cut
   is admitted by construction. The open question is therefore not *how many
   cuts* — the third result measures that, and the answer is that they all come
   back — but whether anything is left that widening cannot repair.

**And the inflation is prose.** Halving the width multiplies the line count by
2.4, and the ten worst inflators account for only 187 of the 1,864 net glyph
lines added — a tenth. The growth is ordinary wrapping (the worst single document
adds 1,086 lines and 12 glyph lines). Diagram art does not reflow; it is cut. So
the far read is not *damaged* by narrowing as much as it is **lengthened** — which
is a scroll problem, and therefore the frame's problem, not the viewport's.

## Result three — the cut is recoverable, and the residue is named

Class survival says the map holds. It does not say the cut can be undone, which
is the whole of the cut's defence: *widening brings the bytes back.* Tables are
covered (`tests/table-fit.test.ts` asserts *elision is monotone in the glass*,
and `scripts/tables-check.ts` owns the class). Nothing asserted it for diagram
art, code fences or prose. So: **the number of cut lines must be non-increasing
as the glass widens** — a document that cuts more at a wider rung is a *hide*, and
a hide is the defect class, not the cut.

| width | cut lines | documents | docs losing art |
|---|---|---|---|
| 60 | 1,587 | 137 | 25 |
| 74 | 598 | 100 | 16 |
| 80 | 325 | 70 | 10 |
| 100 | 64 | 24 | 1 |
| 120 | 29 | 5 | 1 |
| 160 | **10** | **2** | **1** |

**The law is universal.** Cut count falls at every rung, and **no document**, at
any step, cuts more at a wider glass. `ADR-TABLE-EDGE-CUT-055`'s recoverability
clause is not a table property; it is a property of the renderer.

**And the residue is named, with its price.** At 160 columns **two documents of
516** still lose content:

| cut lines | columns needed | document |
|---|---|---|
| 6 | ≤ 320 | `docs/2026-10-08-ai-human-development-workflow-08.md` |
| 4 | ≤ 250 | `docs/2026-10-08-ai-human-development-workflow-06.md` |

**Neither is irreducible, and the distinction is the point.**
`ADR-TABLE-EDGE-CUT-055`'s *irreducible set* is a **floor the cap cannot hold** —
no allocation at 116 columns works, so widening genuinely cannot repair it, and
the document owns the problem. A code fence has **no cap**: it elides at the
glass, so any code line is repaired by enough columns. Both documents here are
embedded payloads whose code lines run past 200 characters; they need a wider
glass, and the number says how much wider. So the honest claim is *still loses
content at 160 columns*, never *irreducible* — which is what this probe's first
run said, and why the wording changed. Reported as the columns needed rather than
a verdict, because **widen means the pane or the zoom** and the reader pays in
either currency.

This is `ADR-TABLE-EDGE-CUT-055`'s "Computer says NO: Too ugly" in the wild — an
instrument that names the outlier rather than teaching the renderer to fold it.
For tables the instrument already does it (`scripts/tables-check.ts`, six tables
at the cap); for the cut classes nothing did. Now something does.

**A correction, made the same day.** The first run of this probe listed a third
document — *this* one — as losing diagram art. It lost nothing: this document has
no mermaid fence, and it quotes the words `art elided` in prose while explaining
the mechanism. The detector matched its own subject matter. The pattern is now
anchored on the indicator's leading `⋮`, which is what the renderer emits and
what prose about it does not.

## Two floors, and the recommendation to the author

Widening is not only the pane. A host that **zooms out** buys columns too, so the
lever is better read as *the reader's lever is columns* — the pane and the font
size are two actuators on one quantity, and both belong to the host (windowing is
the host's, `okuda/AGENTS.md`). Which means zoom-out is a legitimate repair for
every recoverable cut this document measured, and the ladder's rungs are the same
currency in either direction.

But zoom-out has a floor, and that gives the law its second half. Two floors
bound every document:

| floor | what it is | where it lives |
|---|---|---|
| the **word floor** | the widest unbreakable segment, in columns | `ADR-TABLE-EDGE-CUT-055` |
| the **legibility gate** | the narrowest glass whose text still reads | `ADR-LEGIBILITY-GATE-049` |

Where the word floor needs more columns than the legibility gate allows, **no
rendering is both complete and legible** — and the document, not the renderer,
owns the problem. That is the whole of the recommendation this owes an author,
and it is not a warning: it is a named set, stating the document and the columns
it would need, produced by an instrument at authoring time and **never by chrome
at read time** (the argument `BRF-BOUNDARY-MARK` makes against a warning that
fires on every render of a growing view). `scripts/tables-check.ts` already
speaks this verdict; `--strict` is the same verdict for the other three classes,
and it currently names two documents — both embedded payloads whose code lines run
past 200 characters, both repaired by a wider glass (≤ 250 and ≤ 320 columns), so
both an authoring call and not a renderer one.

The contract, then, in one line: **okuda makes the author's work look good as
long as the document's floor fits the glass's.** Below that line the honest output
is the recommendation, and the renderer still refuses to fold, squeeze or hide.

## The term

**Progressive engagement**: one artifact yields a truthful reading at each of
several viewing distances, each complete *at its distance*.

- **Test:** the squint ladder — class survival flat, damage marked, controls
  passing first.
- **Failure observed:** a class that vanishes as the glass narrows (none in this
  corpus), or a loss that is not stated (none — recovery is universal as of
  `ADR-UNIVERSAL-ELISION-050`).
- **What it is not:** a licence for new furniture. A terminal has one type size,
  so distance-legibility is bought with glyph density and colour block, never with
  added chrome. Okuda's look is the error-correction scheme — *form following
  channel capacity* (`docs/2026-08-26-the-okuda-net.md:121`) — and the frame rule
  already refuses system-side sizing (`briefs/2026-08-29-brief-okudagram-frame.md`).

It closes a triad the house was already keeping, at the third level down:

| Level | Term | Question |
|---|---|---|
| claim | **audit surface** | can a stranger dereference it? |
| structure | **attributable structure** | can the reader explain each element from the page? |
| perception | **progressive engagement** | is each distance's read complete? |

## Method honesty — six detector defects, all caught by the control

A probe's first number is a claim about the probe. Each of these was found before
any corpus number was read:

1. **Run one reported 0 of 515 headers.** The detector required a three-segment
   header (`silo · callsign · file`) while the probe supplied only `file`; every
   single-segment header read as absent.
2. **Run two halted at the positive control.** `│` was folded into the diagram
   class, so table rows never counted and the fixture appeared to lack them. The
   control did its job and the corpus numbers were withheld.
3. **A counting artifact.** `split("\n")` on a string ending in `\n` yields a
   trailing `""`; the probe read 515 trailing blank lines that were one line
   terminator each.
4. **The elision glyph is not a tell.** `⋮` leads the *source-omitted* indicator on
   every fence at every width, so a `⋮`-based detector would have reported damage
   where there was none. The fix was to read the renderer's own words — `art
   elided` — which is what `ADR-UNIVERSAL-ELISION-050` was for.
5. **A detector can match its own subject matter.** The `art elided` pattern then
   matched this document's *prose about* `art elided`, listing a document with no
   diagram as losing one. The pattern is now anchored on the indicator's leading
   `⋮`; the general lesson is that a probe reading a corpus that documents the
   probe is reading itself.
6. **And the label lied about its referent.** The residue was first printed as
   *widening cannot repair*, which is `ADR-TABLE-EDGE-CUT-055`'s *irreducible* — a
   claim about a floor the **cap** cannot hold. A code fence has no cap, so the
   claim was false for both documents it named. It now prints the **columns
   needed**: the actionable form, since widen is the pane or the zoom.

## Open edges

The 18%-at-80 edge this document opened with is **closed**: the cuts are
recoverable by construction and measured so, and the irreducible residue is three
documents named above, each a document problem rather than a renderer one.

- **The residue.** Two documents lose content at 160 columns; both are repaired by
  a wider glass and the columns needed are reported. Neither is irreducible in
  `ADR-TABLE-EDGE-CUT-055`'s sense. The instrument is settled —
  **`elision-monotone.ts` is the non-table sibling of `scripts/tables-check.ts`**:
  `--gate` (the invariant) and `--strict` (the residue) both run on `just check`.
  The residue is held in **`scripts/elision-baseline.json`, which may only
  shrink** — the house idiom, three baselines deep already
  (`callsign`, `date`, `lexicon`). Reshaping the two documents is an authoring
  call and would mean editing an embedded payload, so the baseline is the honest
  form: the set cannot grow, and a document that stops losing content names its
  own prune.
- **The gutter.** 315 diagram blocks; 82% sit flush to the 2-column margin. But the
  median right slack is 2 columns — most diagrams fill the glass. Only **12%** are
  the side-pushed case (flush left *and* ≥20 columns unused). A rendered diagram
  is an *element*, so centring it within its own block is admissible where
  centring the document is not — and the measurement says the case is a narrow
  class, not a policy.
- **The 18% already cut at 80.** The largest open item, and it is not about the
  viewport at all. **Closed 2026-10-12** — see *Open edges* and Result three.
- **The cap mark** (`BRF-BOUNDARY-MARK`). The receipt's truncation and the cut are
  one family, separated by the same rule: a mark is legitimate when it reports a
  **fixed fact about the artifact** (this line was cut; the receipt was truncated)
  and illegitimate when it reports **the window's position** (there is more
  below).
- **The three benches.** Television's pane, the browser terminal, and the e-ink
  frame are the natural second hosts for the ladder
  (`docs/2026-10-06-the-eink-frame-is-a-second-host.md`); only the last is
  literally "across the room."

## References

- **The two audiences** — `docs/2026-08-26-the-okuda-net.md`
- **The frame rule** — `briefs/2026-08-29-brief-okudagram-frame.md` (`BRF-PAGED-OKUDAGRAM`)
- **Elision as the universal policy** — `decisions/050-universal-elision.md` (`ADR-UNIVERSAL-ELISION-050`)
- **The table edge cut, and recoverability as the test** — `decisions/055-table-edge-cut.md` (`ADR-TABLE-EDGE-CUT-055`)
- **Table fit to the glass** — `briefs/2026-10-12-brief-table-glass-fit.md` (`BRF-TABLE-GLASS-FIT`)
- **The legibility gate** — `decisions/049-legibility-gate.md` (`ADR-LEGIBILITY-GATE-049`)
- **The resize contract** — `docs/2026-10-08-the-resize-contract.md`
- **The ornament that re-encodes** — `docs/2026-09-19-the-ornament-that-pays-rent.md`
- **The ergonomic box** — `docs/2026-09-04-the-ergonomic-box.md`
- **The reading fraction** — `briefs/2026-10-01-brief-reading-fraction.md` (`BRF-READING-FRACTION`)
- **The boundary mark** — `briefs/2026-10-10-brief-boundary-mark.md` (`BRF-BOUNDARY-MARK`)
- **The e-ink frame as a second host** — `docs/2026-10-06-the-eink-frame-is-a-second-host.md`
