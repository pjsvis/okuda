---
date: 2026-08-26
tags: [tui, resize, anchor, boundary-conditions, reflow, dogfood, proportional-fallback, muppet-exclusion]
agent: pi (ses_cd5d7b)
environment: local
td: td-d06352
branch: feat/resize-content-anchor
---

# Debrief: the resize anchor and the three boundary conditions

## Context

The TUI's horizontal-resize handler preserved scroll by physical-line
index and clamped to `maxScroll`. This is a lie when `wrapANSI` reflows:
a logical line that was 3 physical lines at 80 cols becomes 2 at 100,
so physical index 50 names different content before and after. The
brief (`2026-08-26-brief-resize-content-anchor.md`) scoped a text-match
anchor as the simplest adequate fix. This debrief records the three
iterations the implementation went through — each exposed by dogfood,
each a boundary condition the previous missed — and the synthesis that
resolved them. The decision is captured in ADR-010.

## Accomplishments

- **Iteration 1 — top-anchor (commit `7b950e7`).** `anchorFor` captured
  the stripped text of the first visible non-blank line; `onWinch`
  re-found it after re-render and set `scroll = idx` (pinned to the top
  of the new viewport). Three pure helpers: `stripForAnchor`,
  `anchorFor`, `findAnchor` (outward-biased, unbounded). 10 unit tests.
  The code worked for the case it was written for (small resize); the
  boundary it missed was the *eye*.
- **Iteration 2 — middle-anchor (commit `1a6a820`).** Dogfood
  (`just manifesto-okuda`, narrowing the terminal) showed the eye
  drifting down on width-reduce and up on widen: the top was a fixed
  point, but the eye reads in the middle, so the lines between moved.
  `anchorFor` rewritten to return `{ text, offset }` for the non-blank
  line nearest the viewport middle (the eye proxy); `onWinch` pinned it
  back to its original screen row (`scroll = idx - offset`). Brief
  updated to log the decision (ADR-007 discipline: the top-anchor was a
  decision, the middle-anchor a correction — logged, not smuggled). The
  boundary it missed was the *unbounded search*.
- **Iteration 3 — bounded + proportional (commit `6471146`).** The
  boundary analysis (below) found the unbounded `findAnchor` grabbed
  distant duplicates on big reflow — a repeated line near the top
  matched, returned a low index, `scroll` clamped to 0, reader jumped to
  the top. `findAnchor` rewritten to take a `maxRadius` (one viewport)
  and return `-1` on miss; `proportionalScroll` added as the fallback
  (preserve the reading fraction). The synthesis: precise text-match
  where reflow is small, proportional robustness where reflow is large.
  Less code than the unbounded search it replaced. 12 new tests.

## The three boundary conditions

Each iteration was honest about the boundary the previous one exposed.
The boundary-condition analysis — the thing the operator asked for and
said was worth the record — is the spine of this debrief.

### 1. The eye boundary (iteration 1 → 2)

**Failure:** the top-anchor kept the top stable, but the eye reads in
the middle. On width-reduce, content below the anchor reflowed to more
physical lines, pushing mid-viewport content down. On widen, fewer
physical lines, mid-viewport floated up. "Down and vice versa," exactly
as the operator reported.

**Root cause:** anchoring the wrong line. The brief's north star was
"the line under the eye stays under the eye"; the code met the letter
(top stable) and missed the spirit (eye stable).

**Fix:** anchor the non-blank line nearest the viewport middle, pin it
to its original screen row. The lines above and below reflow around a
stable eye.

**The lesson:** "the line under the eye stays under the eye" names a
*feeling*. "Minimise apparent vertical movement" names a *quantity* —
the total vertical displacement of visible lines. The reformulation
(operatorese) turned a vibe into a metric and is the better requirement
formulation. It generalises: it tells you what to optimise for the next
case (vertical resize, font zoom, reload), not just this one.

### 2. The unbounded-search boundary (iteration 2 → 3)

**Failure:** the unbounded `findAnchor` searched outward to infinity.
When the anchor line got *split* by reflow (its exact text no longer
exists as a single line), there was no near match. The search expanded
until it hit a *distant duplicate* — a repeated list marker, code line,
or heading pattern near the top. Returned a low index. `scroll = idx -
offset` clamped to 0. Jump to top of document.

**Root cause:** a physical line's stripped text is **not stable across
reflow**. Lines split and merge. The text-match assumed stability that
doesn't exist, and the unbounded search amplified the assumption's
failure into a catastrophe.

**Fix:** bound the search to one viewport radius. Small-moderate reflow
hits a near match precisely; a big resize correctly misses (`-1`) and
the caller falls back. Never grabs a distant duplicate.

**The lesson:** an "always find a match" strategy is fragile when the
match target is unstable. Bounded search + explicit fallback is more
robust *and* simpler than unbounded search + implicit fallback.

### 3. The not-found boundary (iteration 2 → 3, same fix)

**Failure:** when the unbounded search found *no* match anywhere, it
returned the stale `hint` (the old scroll). But the physical index
meaning changed across reflow — line 200 was now different content. A
sideways jump to unrelated content.

**Root cause:** same as boundary 2 — unstable match target, no fallback
contract.

**Fix:** `findAnchor` returns `-1` on miss; `onWinch` falls back to
`proportionalScroll`. The fallback is the robust floor.

## The proportional-fallback distinction (the muppet gate, twice)

The brief rejected proportional scroll as a *primary* strategy — a
muppet that looks like place-keeping but behaves badly on uneven
documents (a 3-line heading followed by a 60-line code block is not
1/63th content). That rejection was correct.

The proportional *fallback* is a different gate. It is not
"proportional *instead of* anchoring"; it is "proportional *when*
anchoring fails." As a floor for the rare big-reflow case, it is
imprecise but never jumps to top — the failure mode that lost the
reader's place. The muppet distinction (primary vs fallback) is the
thing future maintainers will question, and it is recorded in ADR-010's
alternatives table.

## The calculation approach (the road not taken)

The operator proposed a calculation: pick a point in the middle of the
first visible line, work out where it will end up after reflow, scroll
to there. This is the correct *design* — the stable coordinate is a
source position, and that's what Ghostty effectively does. It was
rejected on inspection, not on principle:

1. **`Bun.markdown` doesn't expose source positions.** The handlers
   receive `children: string` — already-rendered inner text — no line
   numbers, no offsets. The render plane can't emit a `sourceLineOfPhysical[]`
   map without okuda re-parsing the source (defeating Bun.markdown) or
   correlating rendered text back to source post-hoc (a heuristic with
   its own failure modes). This is the heavy prerequisite the brief
   parked — and the dogfood didn't give us a second consumer for it,
   just a first consumer that was buggy.
2. **Character offsets in the rendered output aren't stable either.**
   `wrapANSI`'s `flushLine` trims trailing spaces and `appendWord` only
   adds the separator space when the word fits. So wrapping *drops the
   spaces at break points*. "the quick brown fox jumps" at width 80 is
   one line; at width 20 it's "the quick brown fox" / "jumps" — the
   space between "fox" and "jumps" is gone. De-newlined, the character
   content differs across widths. A character offset shifts by (number
   of wrap points before it) — width-dependent. Not a stable
   coordinate.

The calculation is the right design but requires render-plane work
that's genuinely heavy and possibly blocked on the parser API. Not the
cheap fix. The bounded + proportional approach is the cheapest adequate
thing that handles both regimes without that refactor.

## Lessons Learned

- **"Minimise apparent vertical movement" is the better formulation.**
  It's testable in principle (a quantity), honest about what a pager
  can do (the terminal owns the wrap; okuda can't guarantee zero
  drift at the edges), and generalises to the next case. The brief's
  goal section now reads metric-first, feeling-as-gloss.
- **Dogfood catches boundary conditions the spec can't.** The
  top-anchor drift and the top-jump both surfaced only when the
  terminal was dragged — no amount of reading `tui.ts` would have
  found them, because they exist at the intersection of reflow and a
  search algorithm, and that intersection only manifests when width
  actually changes. The method: build the feature → drag the width →
  the eye finds what the spec couldn't.
- **The unbounded search was the complication.** The "always find a
  match" instinct produced more code *and* more failure modes than the
  bounded + fallback replacement. Simplicity sometimes means accepting
  "not found" as a first-class outcome rather than engineering around
  it. The protocol's "predictably adequate" formulation: the floor
  rose (no top-jump) and the code shrank.
- **The muppet gate runs on the *strategy*, not the *mechanism*.**
  Proportional scroll is a muppet as the primary strategy and a robust
  floor as a fallback. The same mechanism, different gate. The
  rejection in the brief was of "proportional instead of anchoring";
  the acceptance in ADR-010 is of "proportional when anchoring fails."
  Naming the distinction keeps the gate honest.

## State at close

- `feat/resize-content-anchor`, `6471146`, clean, 37/37 TUI tests pass,
  130/136 overall (6 pre-existing palette/table failures, `td-bf594e`,
  unrelated). Registries in sync.
- `td-d06352` submitted for review (session `ses_cd5d7b`).
- ADR-010 accepted; this debrief frozen on completion.

## What's left

- `td-d06352` review/close (`td approve` — independent reviewer or
  self-review with reason).
- Logical-line tagging through the render plane — parked behind a
  second consumer (e.g. a go-to-source-line jump, or diff-style change
  highlight). If that consumer appears, the anchor's stripped-text
  fingerprint can be upgraded to a source-position map; the bounded +
  proportional TUI logic stays.
- `td-bf594e` (palette test fix) — separate, untouched by this work.
