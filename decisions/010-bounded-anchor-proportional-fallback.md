# Decision: Bounded anchor search + proportional fallback for resize scroll-preservation

**Date:** 2026-08-26
**Status:** Accepted

## Context

The TUI's horizontal-resize handler (`onWinch` in `src/tui.ts`) must
preserve the reader's vertical position across reflow. okuda owns its
wrap (`wrapANSI` in `render.ts`), so unlike a terminal-owned-wrap viewer
(Ghostty), width change is a reflow *event*: physical lines are created
and destroyed, and a physical-line index is no longer a stable coordinate
for "where am I in the document."

The first implementation preserved scroll by physical-line index and
clamped to `maxScroll` — a lie when reflow shifts content between
indices. The brief (`2026-08-26-brief-resize-content-anchor.md`) scoped
a text-match anchor: fingerprint the first visible non-blank line's
stripped text, re-find it after re-render. Three iterations followed
(see debrief `2026-08-26-debrief-resize-anchor-boundary-conditions.md`),
each exposing a different boundary failure, converging on the decision
recorded here.

## Decision

**Bounded text-match anchor with proportional fallback.** On resize:
capture the stripped text of the non-blank line nearest the viewport
middle (the eye proxy) plus its screen-row offset; re-render; search
for the anchor **bounded to one viewport radius** around the old scroll;
if found, pin it back to its original screen row (`scroll = idx -
offset`); if not found, fall back to **proportional scroll** (`scroll ≈
oldScroll / oldMax × newMax`).

One sentence: precise text-match where reflow is small (the common
case), proportional robustness where reflow is large (the edge case),
and never an unbounded grab that jumps to the top.

## Alternatives Considered

| Alternative | Why Rejected |
|-------------|--------------|
| **Unbounded text-match (the first implementation)** | Grabbed distant duplicates on big reflow — a repeated list marker or code line near the top matched the anchor, returned a low index, `scroll` clamped to 0, reader jumped to the top of the document. The catastrophic failure mode. |
| **Unbounded text-match, return stale hint on miss** | The physical index meaning changed across reflow, so the stale hint pointed at unrelated content — a sideways jump. Same class of catastrophe. |
| **Proportional scroll as the primary strategy** | The muppet the brief rejected: always imprecise, behaves badly on uneven documents (a 3-line heading followed by a 60-line code block is not 1/63th content). Looks like place-keeping, isn't. Rejected as *primary*; accepted as *fallback*. |
| **Logical-line tagging through the render plane** | The "correct" solution: thread source-line identity through every `Bun.markdown` handler, `wrapANSI`, and `finalize`; `renderDocument` emits a parallel `srcLine[]`. Render-plane refactor sized between "small" and "unblocks a lot." Marginal benefit is imperceptible (the cheap anchor's failure mode is invisible — a wrong match only happens on identical content, and identical content means the eye lands on the same words). No second consumer on the board → heavy prerequisite not justified. Parked. |
| **Character-offset calculation in the rendered output** | The stable coordinate is a *source* position, but `Bun.markdown` handlers receive `children: string` with no source positions — the render plane can't emit a source-line map without okuda re-parsing (defeating Bun.markdown) or post-hoc correlation (a heuristic with its own failure modes). Character offsets in the rendered text aren't stable either: `wrapANSI`'s `flushLine` trims trailing spaces and `appendWord` only adds separator spaces when the word fits, so the de-newlined character content differs across widths. Not a cheap win. |
| **Drop scroll-preservation entirely, clamp on resize** | Simpler still, no lie. But loses the reader's place on every horizontal resize — the feature the brief scoped and the dogfood validated as worth keeping. Rejected only if the bounded + proportional approach proves worse than nothing; the dogfood confirmed it doesn't. |

## Consequences

**What became easier:**
- The common case (small-moderate resize) is precise: the anchor hits a near match within one viewport and the eye line holds its screen row. The reader does not lose their place.
- The edge case (big resize, every line split) degrades gracefully: proportional fallback lands roughly where you were (same reading fraction), never at the top. The failure is honest ("we lost the exact place, here's the rough place"), not a lie.
- The code is simpler than the unbounded search it replaced — the bounded radius is less logic than the outward-to-infinity loop.

**What became harder:**
- Two code paths to reason about (match-found vs fallback) instead of one. Mitigated by both being pure functions with clear contracts (`findAnchor` returns `-1` on miss; `proportionalScroll` is the fallback).
- The proportional fallback is imprecise on uneven documents — but only in the rare big-reflow case, and imprecision is strictly better than a jump to top.

**Constraints this imposes:**
- The anchor is a *stripped-text* fingerprint, not a source position. It is stable across width *only when the line isn't split by reflow*. The bounded radius assumes small-moderate reflow; a big resize correctly misses and falls back. Any future change to `wrapANSI` that makes line text more or less stable across widths should re-test the anchor.
- `stripForAnchor` must mirror `finalize`'s margin application (2-char leading margin on non-empty lines, none on blanks) and the ANSI SGR format. If `finalize` changes its margin or `ansi.ts` changes its escape format, `stripForAnchor` must update in lockstep. Both are in the codebase; the coupling is local and named in the function's doc comment.
- The proportional fallback divides by `oldMax`; the helper guards `oldMax <= 0 → 0` (doc shorter than viewport). Any caller must pass the *pre-rerender* maxScroll, not the post-rerender one — `onWinch` captures it before re-rendering.

## Palimpsest protocol

The reversal (unbounded → bounded search) happened within a single task
(`td-d06352`), before any ADR existed for the old approach. The
abandonment surface was clean: the old `findAnchor(lines, anchor, hint)`
and the new `findAnchor(lines, anchor, hint, maxRadius)` share the same
function name and call site — a full replacement, not a partial removal.
No orphans, no stubs, no conditional code paths. The old signature is
gone (the test file updated in the same commit). No palimpsest risk;
this ADR is the record the playbook asks for when "no ADR exists for the
superseded approach."

## Related

- Brief: `briefs/2026-08-26-brief-resize-content-anchor.md`
- Debrief: `debriefs/2026-08-26-debrief-resize-anchor-boundary-conditions.md`
- ADR-007: `decisions/007-glow-visual-reference.md` (the divergence-table discipline this ADR follows for logging the proportional-fallback decision)
- td: `td-d06352`
