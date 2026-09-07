# The frame is a shite filter — the document-level instance

**Date:** 2026-09-05
**Type:** design note (the shite-filter posture applied to the okudaframe; companion to `docs/2026-09-05-search-as-shite-filter.md`)
**Status:** The posture the frame brief should be read in. Does not supersede `briefs/`2026-08-26-brief-paged-okudagram.md`; refines its "slippy-within" clause.

---

## The symmetry

At the search level, the shite filter assumes the corpus is shite until you type; the shelf is the inspected minimum, the dive is opt-in intent. At the document level, the frame assumes the section's tail is shite until the glass confirms it; the header + what fits is the inspected minimum, the dangly tail is deferred to the glass. Same shape, two scales. The shite filter isn't a feature of the search; it's the silo's posture, and the frame is its second instance.

| | Search | Frame |
|---|---|---|
| Default | nothing (the shelf) | header + what fits |
| Opt-in intent | type words | resize / zoom the glass |
| Inspected minimum | root files | the current frame's content |
| Deferred shite | the dive's corpus | the dangly tail |
| Honesty of exit | Ctrl-C, always | `u` / `q`, always |

The cheap action should not be the intent-declaration. In the search, scrolling is not typing; in the frame, scrolling-within is not resizing. Slippy-within breaks the shite filter at the document level for the same reason auto-loading results would break it at the search level: it spends the reader's attention on un-inspected content without a declared intent. Resizing the terminal or zooming out is the declared intent — the glass-side equivalent of typing a query. Both say "I want more of this."

## The policy: cut and defer

If there is any dangly distracting stuff, cut it off and defer rendering it until there is more room. A frame is a header and its content, from the header to the next header (or EOF); the frame fills the glass from the top; content shorter than the glass leaves blank below (the boundary — step on); content taller is **cut**, not slippy-within. The tail waits for the glass to grow.

This replaces the frame brief's "content taller is slippy within." Slippy-within let the reader scroll into un-inspected content — the filter failing open, the exact failure mode the search avoids by not auto-loading. Cut-and-defer restores the filter: the frame shows the inspected minimum, the rest waits for the glass to ask. The reader who wants the tail commits a glass; the reader who doesn't, doesn't. The first is intent; the second is the default.

## The opening frame is the glance-confirm

The first thing you see is whatever is at the top of the document — so you can confirm with a glance that you are in the document you think you are in. That is already the behaviour (scroll = 0 on open), but naming the *function* makes it a design invariant: the opening frame is the document's ID card, the minimum that lets you decide whether to stay before you commit to reading. It is the document-level equivalent of the shelf's "case for the silo." Same posture: the first glass is the case for not leaving; if it doesn't make the case, `u` (or `q`) is the correct response and the frame has done its job. The opening frame must be the glance-confirm — never a splash, never a TOC, never a "recently viewed" list.

## The anchor is the mast

The only requirement is to make sure you are anchored to the mast at that particular point in the document. That is `reanchoredScroll` + the eye-proxy, already shipping: the non-blank line nearest the viewport middle is re-matched after every re-render and pinned to its screen row. Resize, zoom, reload, back-from-dereference — the anchor holds. The frame can elide, the glass can grow, the text can shrink — the anchor is the one invariant that survives every glass change. Everything else (frame content, glass size, what's elided) is negotiable around it. The anchor is the time-independent affordance; the frame is the time-dependent composition around it.

## The honest bound (and the opt-in escape hatch)

If you cut and defer, a reader who cannot resize (fixed terminal, no zoom) cannot read over-tall sections *in frame mode*. That is not the same shape as excluding the omniscient from the search, because frame mode is not the only mode: actuator `[02]` switches to **sliding mode** (the default, regular scrolling), which lets the reader slide the document under a fixed glass without resizing anything. The over-tall tail is readable two ways — grow the glass (resize/zoom, the frame-default intent), or switch to slippy and slide under the fixed glass (the `[02]` opt-in). The honest bound is softer than it first looks: the reader who can't resize isn't excluded from the tail; they're one keystroke away from it, at the cost of leaving frame mode.

So the shite filter at the document level is not *frame mode or nothing*; it's *frame mode by default, sliding mode on opt-in*. The frame is the filter; sliding mode is the escape hatch the reader takes when they want the un-inspected content enough to leave the filter for it. That's the same shape as the search: the shelf is the filter, the dive is the opt-in the reader takes when they want the un-inspected corpus enough to type for it. The reader's intent is what opens the filter in both cases — a query at the search, a `[02]` at the document. The filter never fails open; it always fails *to the reader's declared intent*.

The one residual that *is* honest: a reader who cannot resize and does not know about `[02]` (undiscoverable affordance) is stuck. That's the real bound, and it's the same one the whole silo guards against — hidden state. The vocabulary fits on one screen and is documented in the reading path; `[02]` is in the hints, not buried. The bound is *undiscoverability*, not *capability*, and the cure is documentation, not architecture.

## The mermaid elision is the first instance, not a special case

`td-3f5fa1` (mermaid diagram elision: "too narrow / too complex") is the shite filter applied to *diagrams* — assume the diagram is shite (too big) until the glass confirms it is not (wide enough). This note generalises that from diagrams to all frame content: the whole over-tall tail is elided, not just the diagrams. The mermaid elision is not a special case; it is the first instance of the document-level shite filter, and the frame policy here is the general rule it falls under. Landing this makes the mermaid elision a specific application of a stated principle, not a one-off.

## Vertical elision — start minimal

The horizontal elision marker (`…`, the `elideToWidth` primitive) went through revisions before it acquired its current form: scratchpad → ADR-014 → ADR-022 reframe → primitive shipped, with the single-cell `…` settling as the glyph. Vertical elision will do the same, so start with as little as we need to do.

A glyph already exists if we want it: `⋮` (vertical ellipsis) is already the elision glyph in the silo — it leads the "mermaid source elided" indicator, borrowing the state-parked lexicon ("elided into a further question"). So the *glyph* for vertical elision may already be settled. What is not settled is the *policy*: when to show it, where to place it, what it competes with for the glass's edges. Start with the policy, not the glyph.

The minimal start: **empty lines at the frame's edges**, not glyphs. An empty line above the header signals "content above (deferred)"; an empty line (or elision) below the content signals "content below (deferred)." Promote to `⋮` only if the empty line reads as ambiguous in dogfood (a paragraph break vs a filter edge). The empty line is the cheaper hypothesis; `⋮` is the ready replacement if the hypothesis fails. Same ladder the horizontal marker climbed — start minimal, let the glass teach.

## The progress indicator is the filter's edges

You know you are at the start (no content above). You know you are at the end (no content below). All you need is an indicator that says you are in the middle, rather than having to infer or prove it.

The edges *are* the indicator. Two optional markers — top and bottom — encode position by their presence:

| Top marker | Bottom marker | Position |
|---|---|---|
| absent | absent | single-frame document (start and end) |
| absent | present | first frame (the start) |
| present | absent | last frame (the end) |
| present | present | the middle |

Three states of position from two booleans of presence. Not a dial; not a percentage; not a continuous fraction. The percentage meter tried to tell you *where* in the middle (42%); the edges tell you *that* you are in the middle. That is the information content a reader actually asks for: "am I done, or is there more?" — and the answer is three states, not a continuum. The percentage was over-specified; the edges are right-specified.

And the collapse is the thing: the progress indicator is not a separate feature bolted onto the frame; it is the frame's own edges, repurposed. The filter and the indicator are the same thing. The marker that says "shite above (deferred)" is the marker that says "you are not at the start." The marker that says "shite below (deferred)" is the marker that says "you are not at the end." Same as the minimap/progress-indicator collapse from `docs/2026-09-04-minimap-reversal.md`: the thing that shows where you are is the thing that filters what you see. One primitive, two jobs, zero added chrome.

## The one line

Search is a shite filter over the corpus; the frame is a shite filter over the document; the edges are the progress indicator; the anchor is the mast both hold you to.

## Related

- `docs/2026-09-05-search-as-shite-filter.md` — the search-level instance. This note is its document-level twin.
- `docs/2026-08-31-the-same-okudagram.md` — the anchor (the mast) as the invariant that survives every glass change.
- `briefs/2026-08-28-brief-elision-primitive.md` + `debriefs/2026-08-30-debrief-elision-primitive.md` — the horizontal elision's revision history, the ladder vertical elision should expect to climb.
- `src/frames.ts` — `headingLines`, `frameBounds`, `snapFrame`; the frame is already a pure function of structure.
- `td-3f5fa1` — mermaid diagram elision; the first instance of the document-level shite filter, now generalised by this note.
