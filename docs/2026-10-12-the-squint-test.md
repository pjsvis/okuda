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
> glyphs, and the mark of damage rises from **92 documents to 287**.

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
4. **The corpus is already damaged at its own default.** At 80 columns, **92 of
   515 documents (18%) lose content to a cut, and 9 lose diagram art.** This is
   not a distance problem; it is a legibility fact at the house's default glass,
   and it lives in the render plane beside `ADR-LEGIBILITY-GATE-049`. It is the
   largest open finding here.

**And the inflation is prose.** Halving the width multiplies the line count by
2.4, and the ten worst inflators account for only 187 of the 1,864 net glyph
lines added — a tenth. The growth is ordinary wrapping (the worst single document
adds 1,086 lines and 12 glyph lines). Diagram art does not reflow; it is cut. So
the far read is not *damaged* by narrowing as much as it is **lengthened** — which
is a scroll problem, and therefore the frame's problem, not the viewport's.

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

## Method honesty — four detector defects, all caught by the control

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

## Open edges

- **The gutter.** 315 diagram blocks; 82% sit flush to the 2-column margin. But the
  median right slack is 2 columns — most diagrams fill the glass. Only **12%** are
  the side-pushed case (flush left *and* ≥20 columns unused). A rendered diagram
  is an *element*, so centring it within its own block is admissible where
  centring the document is not — and the measurement says the case is a narrow
  class, not a policy.
- **The 18% already cut at 80.** The largest open item, and it is not about the
  viewport at all.
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
- **The legibility gate** — `decisions/049-legibility-gate.md` (`ADR-LEGIBILITY-GATE-049`)
- **The resize contract** — `docs/2026-10-08-the-resize-contract.md`
- **The ornament that re-encodes** — `docs/2026-09-19-the-ornament-that-pays-rent.md`
- **The ergonomic box** — `docs/2026-09-04-the-ergonomic-box.md`
- **The reading fraction** — `briefs/2026-10-01-brief-reading-fraction.md` (`BRF-READING-FRACTION`)
- **The boundary mark** — `briefs/2026-10-10-brief-boundary-mark.md` (`BRF-BOUNDARY-MARK`)
- **The e-ink frame as a second host** — `docs/2026-10-06-the-eink-frame-is-a-second-host.md`
