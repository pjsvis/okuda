# The anchor — a system invariant

> Logged 2026-09-03. Status: **discussion** — the design center of
> `BRF-PAGED-OKUDAGRAM`, stated as invariant rather than mechanism. Seed
> for a future explainer; expanded from the brief's implicit treatment.
> The frame is the anchor made visible; this doc is the anchor made
> explicit. Citations are file:line against the corpus on `main`.

> **Terminology (2026-10-14).** The word *okudagram* is retired — the composite is **the render**, one portion is **the frame**, a drawing is **a diagram** (`ADR-RETIRE-OKUDAGRAM-066`). This record keeps its words; the ADR is the map.

## The claim

**The anchor is a system invariant.** It will be defended against a
whole car park of assailants — resize, re-render, back-navigation,
source mutation, width change, host restart. Each is an assault on the
reader's position; the anchor is what holds position steady through
each. The frame rule (`briefs/2026-08-29-brief-okudagram-frame.md`)
is the anchor's visible consequence. The determinism
(`docs/2026-08-31-the-same-okudagram.md`) is what makes the anchor
sufficient. This doc names the anchor as the point, not the mechanism.

## What the anchor is

A located, structural, identity-persistent position in a document. Not
a viewport-relative coordinate (ephemeral, glass-dependent, gone on
resize) — a *header*, re-findable across every transformation that
preserves the source. The anchor is the frame's identity: a frame is
its anchor plus the content that flows from it to the next header. On
any change to the glass, re-render the source at the new width, re-find
the same header, the frame is itself again.

The anchor is the answer to "where am I?" that stays true across every
"and then the glass changed." Without it, position is a scroll integer
— a viewport property, perishable. With it, position is a header — a
document property, re-findable as long as the source survives.

## The property few things in contemporary IT have

The anchor delivers **stillness as a structural property**, not just a
concept. The frame sits there. It does not change unless the user
changes it. The user looks into it; it does not look at them. Nothing
pushes, nothing updates, nothing refreshes "for you." The default in
contemporary IT is reactive — feeds update, tabs reload, notifications
push, content shifts under the reader, "live" is the virtue and
stillness is the defect. The anchor inverts the virtue.

This is the electronic FiloFax, the George Costanza wallet — a thing
that holds its state because nothing is trying to update it. The
scratchpad's *slipperiness is induced, not native* is the same claim
from the other direction: the document is static, located, structural;
the input device induces the motion. The anchor makes the stillness
*structural* — re-findable by computation, not merely asserted by
design.

## Why the anchor is sufficient (the determinism)

`okudagram = f(source, width, palette)` — deterministic
(`docs/2026-08-31-the-same-okudagram.md`, ADR-004's *okuda owns every
`\n`* as the ancestor). The render is a pure function. Which means the
anchor never needs the rendered bytes stored, a screenshot kept, a
buffer preserved. It needs only its inputs — a path and a header — and
the pure function restores the frame. The backstack stores position
(a path and a scroll integer, ADR-027's hot-potato rule), not pixels;
back-navigation re-reads, re-renders, re-anchors. The anchor + the pure
function = a thing that stays itself, cheaply.

The car park of assailants, and how each resolves:

1. **Resize** — re-render at new width; re-find header by content
   (bounded text-match first, proportional fallback); re-anchor.
2. **Re-render** (live documents, fs.watch) — same machinery; the
   anchor re-matches in the fresh layout.
3. **Back-navigation** (`u`) — re-read source, re-render, re-anchor at
   the stored scroll's nearest header. The backstack is a chain, each
   hop re-anchored (`src/tui.ts:544`).
4. **Source mutation while away** — re-match by content; return to the
   same logical position in the updated composition. The anchor tracks
   the document, not a moment.
5. **Width change** (host zoom, pane resize) — same as (1).
6. **Host restart** — if the host (Herdr) persists the inputs (path +
   scroll integer), the re-render restores the frame identically. The
   anchor needs only its inputs; the frame needs only the anchor and
   the function. The FiloFax doesn't need batteries; it needs its
   pages. The pages are the source file; the anchor is the bookmark.
   okuda's promise: *if* the host restores the inputs, the frame
   restores. That is the only promise needed, and determinism
   guarantees it.

The seventh assailant — *the anchor's own header was edited or
deleted* — is the honest limit. The anchor re-matches by content; if
the content is gone, the anchor degrades to the proportional fallback
(same as a dead jump token: the map is source-derived, and sources can
die, `docs/2026-08-31-the-same-okudagram.md`). Silent, honest
degradation. The invariant holds until the source itself refuses it;
no mechanism recovers from that, and none is claimed.

## The anchor as the door to casting

The anchor's payoff is not stillness alone — it is **stillness that
survives relocation.** Because the frame is defined by its anchor
(a header) and reconstituted by a pure function from its inputs, the
frame is *portable across screens*. Cast a terminal to another display:
the new glass has different dimensions, the frame recomputes, the
anchor re-finds, the reader is on the same frame. The frame didn't
move; it reconstituted. That is what makes casting honest rather than
brittle — the thing you were looking at is the thing you are looking
at, because the anchor held.

This opens doors the slippy seam keeps closed:

- **Casting terminals around available screens.** A frame on the
  laptop, cast to the monitor, is the same frame at a new width. The
  anchor holds; the content recomposes. No state transfer protocol,
  no screenshot, no "session" — the inputs travel, the function
  re-runs. The frame is location-independent because its identity is a
  header, not a pixel buffer.
- **Booting a control interface in Herdr.** Herdr opens a pane, okuda
  reads the file, the anchor lands on the header. The control
  interface is a frame like any other — static, located, dereferenceable.
  No special "app mode"; the same renderer, the same anchor, the same
  stillness. A control interface that is a document is a document that
  is a control interface; the three-concerns principle (compositing →
  environment, windowing → host, rendering → okuda) keeps it so.

## Windows without the faff

The frame is a window in the original sense — a *framed opening onto
content* — without the faff that contemporary windowing accumulated.
No window manager is required to have a frame; the anchor is the
frame's identity, and the renderer is the frame's content. The faff
is what a window manager adds: focus policies, z-ordering, resize
handles, decoration themes, session persistence protocols. okuda
refuses all of it (windowing belongs to the host, per the
three-concerns principle) — and gets the window's virtue (a static,
located thing you look into) without the faff.

*Although you might also want a window manager.* The honest addendum:
okuda does not provide one, and does not need to, because Herdr is the
host. The anchor makes frames portable; the host decides where they
appear. Casting a frame to another screen is a host action; okuda's
job is to reconstitute the frame at the new glass when the host puts
it there. The window manager — if you want one — lives in the host,
and the anchor is what makes it possible to want one without needing
okuda to be it. The division is clean: okuda anchors and renders;
Herdr windows and hosts.

## The terminator — the second immovable anchor

The start is the first anchor (the existence condition, frame-0). The
document terminator — the attractive, informative, ever-so-discrete
badge-line-badge structural element — is the second. It is the start's
mirror: a position that does not move while the document exists.

A frame system anchored on headers has two positions that are not
*header*-anchored but are *structural*-anchored — the document's
boundaries. Frame-0 is the start; the terminator is the last frame's
natural close. The anchor's car park of assailants already covers
them both implicitly: resize, re-render, restart — the terminator
survives all three for the same reason the start does. It is
source-derived, recomputed, never stored. Nothing new to defend; the
invariant already covers it.

Between the two fixed points, the document is a thing you can be in.
You start; you read; you are in the document. If you reach the
terminator, you have arrived — you started and finished. If you do
not, you started and did not finish. Whatever you did, you can do
again or not; it is all still there and not going anywhere. The
FiloFax holds its pages; the pages do not change when you close the
cover. The anchor says *you are here*; the terminator says *you have
arrived*; the document is the territory between them.

## The moat

The anchor + the determinism together produce a property very few
things in contemporary IT have: a *located thing* that holds its state
without batteries, persists across relocation without a session
protocol, and restores identically from its inputs alone. The moat is
that the promise is cheap to keep — a path and a header, a pure
function — and the competition's promise (live, reactive, synced,
cloud-backed) is expensive to keep and brittle under the same
assailants. The FiloFax wins on the day the wifi drops, because it
never needed the wifi. The anchor wins on the day the glass changes,
because it never needed the glass.

The frame rule is the anchor's visible form. The anchor is the design's
center. This doc is the seed; the explainer will grow from it.

## Related

- `briefs/2026-08-29-brief-okudagram-frame.md` — `BRF-PAGED-OKUDAGRAM`,
  the frame rule (the anchor's visible consequence)
- `docs/2026-08-31-the-same-okudagram.md` — the determinism that makes
  the anchor sufficient; position, not pixels
- `docs/2026-08-27-okudagram-scratchpad.md` — the lexicon: *slipperiness
  is induced, not native*; *on screen, now*; *tied to the mast*; *three
  concerns, three owners*
- `decisions/004-hard-wrap-mandate.md` — the determinism ancestor: okuda
  owns every `\n`
- `decisions/027-temperament-is-downstream-of-discipline.md` — the
  hot-potato rule: the state held is exactly as large as the question
  requires
- `src/tui.ts` — `reanchoredScroll` (200), `back` (544): the anchor's
  implementation, on file
