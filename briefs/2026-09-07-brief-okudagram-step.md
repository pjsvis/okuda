---
type: Brief
callsign: BRF-OKUDAGRAM-STEP
---

# Brief: The okudagram step — no gaps in coverage

**Date:** 2026-09-07
**Status:** Open
**Lineage:** dialog session (okudagram framing riff → over-engineered
sticky-header plan → FO'd → the kernel extracted). The correction that
produced this brief: the frame's job is coverage, not context. An
earlier turn spec'd a sticky header, a continuation marker, a two-case
page-1-vs-page-2 rule, and a named supersession of two prior docs. All
of that was decoration the reader didn't ask for. This brief is what
remained after the bathwater was thrown out and the baby was dried off.

## The one invariant

**We do not make gaps in our coverage of the document, however shite it
may be.**

The reader steps through the document and never misses anything. The
step is the discrete actuator (the spacebar, or whatever the keygrammar
binds); the reader goes as fast as they can press it. No content is
jumped on the reader's behalf; no line is skipped; the tail of a
long section is one step away, not cut-and-deferred behind a resize.

This replaces the frame brief's `snapFrame` step semantics, which jump
header-to-header and *gap* — the tail of the current section vanishes
the instant you step to the next heading. Snap lies by omission; the
step never lies. Every line is reachable; none is skipped for you.

## The one affordance

**Context is the reader's to fetch, not the frame's to manufacture.**

If the reader needs the section heading or the surrounding context,
the actuators for that are available at all times. The frame does not
pre-emptively stick the header to the top of every page; it does not
add a continuation marker; it does not split into page-1-vs-page-2
cases. Context maintenance is something we *facilitate* (the actuators
work, the anchor holds), not something we *manufacture* out of nothing.

The distinction is load-bearing: a frame that manufactures context is
the ventilator at the frame layer — full flow of something the reader
didn't ask for. A frame that facilitates context lets the reader ask,
and answers.

## What this brief does NOT spec (the decoration that was FO'd)

- **No sticky header.** The header is not pinned to the top of
  continuation pages. The frame brief's identity ("a frame is a header
  and its content") stands unchanged.
- **No continuation marker glyph.** The `…`/`⋮`-on-the-header idea is
  not specced. It was solving a problem the actuators already solve.
- **No two-case page-1-vs-page-2 rule.** The opening frame's
  glance-confirm (the shite-filter doc: "the opening frame is the
  document's ID card") is preserved by not making the header sticky at
  all.
- **No supersession of the frame brief or the shite-filter doc.** This
  brief adds the no-gaps stepping invariant; it does not reverse
  cut-and-defer (the over-tail is still deferred — it's now reachable
  by stepping, an addition not a reversal) or the frame's identity.

## How

1. **Replace `snapFrame`'s jump with contiguous paging.** The step
   actuator moves the viewport by (glass height − overlap) lines, not
   by header-to-header leaps. Overlap, not gap — the seam lines are
   shown twice rather than hidden twice. (`src/frames.ts`,
   `src/tui.ts` — the `j`/`k` binds at `launcher.ts:704`/`:768`.)
2. **Keep the header jump as a separate, declared actuator.** The
   structural jump (header-to-header, may gap) stays available as a
   *different* actuator — the reader's declared "skip this tail," not
   the default. Two motion primitives, two semantics, both honest.
3. **No new glyphs, no new state.** The implementation is a step
   semantics change, not a render or state change. If dogfood asks for
   a dangly-bit indicator, climb the elision ladder (empty line → `⋮`)
   — but don't spec it now; let the glass teach.

## Why it earns its place

1. **Closes the gap the snap-to-header step creates.** Today's `snapFrame`
   jumps header-to-header and skips every section's tail. The no-gaps
   invariant makes the step reader-honest: you stepped "forward," nothing
   vanished.
2. **One invariant, one affordance, no decoration.** The brief is short
   because the correction was to *remove* abstractions, not add them.
   The frame's job is coverage; context is on demand.
3. **Preserves the prior docs, doesn't reverse them.** No palimpsest,
   no ADR, no supersession — the no-gaps step is an addition to the
   frame's stepping semantics, not a reversal of the frame's identity
   or the shite-filter's cut-and-defer.

## Related

- `briefs/2026-08-29-brief-okudagram-frame.md` — the frame rule this
  brief's step refines. Stands unchanged.
- `docs/2026-09-05-frame-as-shite-filter.md` — cut-and-defer; the
  over-tail is still deferred, now reachable by stepping (addition,
  not reversal).
- `playbooks/baby-extraction-playbook.md` — the meta-pattern that
  produced this brief: over-engineer → FO → extract the baby.
- `src/frames.ts` — `snapFrame` (the jump to replace with contiguous
  paging).
