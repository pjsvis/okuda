---
type: Brief
callsign: BRF-FETCH-STATE
---

# Brief: Fetch-state stamp — `checked <time>` + changed/same/failed

**Date:** 2026-08-27
**Status:** draft
**TD:** td-a27b86

## Branch

feat/tui-live-documents (same branch as the watch brief — this is the chrome that lands once watch is wired)

## Context

follows `briefs/2026-08-26-brief-tui-live-documents.md` (the watch plumbing), and `briefs/2026-08-23-brief-gloam-tui-footer.md` (the Gloam signature). The live-documents brief put "footer changes (live indicator, mtime display)" in *out of scope* with the note "the document carries its own 'as of'; chrome can come later if dogfood demands." The dogfood has now demanded — not an mtime, not a live indicator, but a *fetch-state stamp*. This brief scopes what that actually is, and the bug it forces us to fix on the way.

## The first temporal directive (load-bearing — do not violate)

**Time belongs to the producer; meaning belongs to the wire.** The
document's temporal provenance is *content* — whatever "as of" the
author put in the body is authoritative, and the viewer never echoes,
contradicts, or supplements it. The viewer is allowed exactly one time:
the moment *we went and looked*. Fetch-time, not doc-time, not mtime
(mtime is the producer's clock; "mtime is not meaning" — the
live-documents brief), and not fused with the Gloam signature (the
signature is a name, not a clock; a dated badge reads as "this document
is from 14:32," which is asserting provenance over content that isn't
ours — contamination).

One line: **we log when we looked; we do not date the work, because the
work already dates itself.**

## What

A footer mark, separate from the Gloam badge, that reports the moment of
the last fetch and the outcome of that fetch as a three-state enum:

- **changed** — fetch succeeded and the rendered content differs from
  the previous fetch (the content gate fired).
- **same** — fetch succeeded and the rendered content is identical to
  the previous fetch (the content gate held).
- **failed** — the fetch threw (file unlinked, permission revoked,
  mount vanished, network gone while the session is alive).

Phrased unambiguously as *our* observation, never the document's:
`checked 14:32 ●` (changed), `checked 14:32 ○` (same), `checked 14:32 ✗`
(failed) — glyph and colour per the LCARS section below. The word
"checked" is load-bearing: it cannot collapse into a bare timestamp,
because a bare timestamp is indistinguishable from the document's own
"as of." Set on every fetch, frozen between fetches. No tick, no decay,
no alerting — a stamp, not a heartbeat.

## Why

The live-documents brief names the cadence tension and resolves it:
the viewer's reactivity is event-driven, the producer owns cadence, and
the repaint predicate is *rendered content changed*. But "content
changed" is only two of the three states a reader over ssh actually
cares about. The third — "we tried and couldn't" — is currently a bug
(see below), and the reader over a flaky transport has no way to tell
"nothing new" from "we lost the source." A doc that says `status: red`
on a dead mount is silently lying, and the reader ejecting the warp
core on that signal has no chrome telling her the terminal is live but
the feed is gone.

The mark is the label that lets **retained stale content stay on screen
without lying about it** — the exact valve the live-documents brief
names ("showing known-stale bytes while fresher ones sit on disk is the
specific dishonesty this architecture exists to avoid"). Retaining the
last-known-good on a failed fetch is honest *only if labelled*; the
stamp is the label.

## Perceptual property — permitting, not demanding

The stamp is a **pull-model** signal: present when the reader glances
down, silent when they don't. A notification is push-model — it
interrupts to say "something happened, go look *here*." The stamp
never decides *that* the reader should look, and never decides *where*.
It confirms the world is still there and still consistent; that
confirmation is the entire payload. Reassuring and relaxing is the
vibe, and it's the intended one: the stamp's job is to *reduce
uncertainty about whether to bother*, not to create urgency about
bothering. We give a F when we give a F.

This is the temporal analogue of the loose layout. The 2026-08-24 moat
debrief named a spatial triad — calming (lower stress), leading (the
structure directs the eye), bear-trap (density repels before reading
begins) — all about how the layout treats the eye. **Permitting, not
demanding** is the same doctrine on the temporal axis: the loose layout
gives each block room to be *found* rather than forcing the eye; the
stamp gives each change room to be *noticed* rather than forcing the
attention. The calming the operator felt watching an update pop into
place was the spatial and temporal calming arriving together — the
project's whole bet working in real time.

The three reader modes, named in operator language (the dogfood that
founded this property — the operator watched a live update land and
described what the stamp felt like):

- **Nothing changed → nothing changed.** The `○` recedes; the eye
  passes over it; calm confirmed by not stopping. The anti-slot-machine
  property, lived.
- **Something changed, the reader wasn't looking → they can look if
  they want.** The `●` is there for the glance, not a summons. No "go
  to line 47" nag — *where* the change is is the reader's problem to
  find by reading, because finding it by reading is the act of reading,
  which is what they came to do.
- **Something changed, the reader was looking → it pops into place.**
  The anchor holds the position; the change materialises under the eye.
  This is the satisfying case — the content-gate + anchor existing to
  make it seamless. The reader sees it *because they were already
  looking*, not because they were summoned.

The thing this explicitly refuses is the *queue* instinct: "something
changed so you have to go and look in this place and this place..." A
stamp that directed the reader would convert the footer from a **log**
into a **to-do list**, and a to-do list is the opposite of relaxing.
The stamp stays a log: it records, it does not assign. This is the
deep root of the diff/navigation double veto in the section below —
both requests would convert the log into a queue, and the answer is
the same no for the same reason.

## The bug this forces (the empty-doc-on-fetch-failure lie)

The current read path in `src/tui.ts` coerces failure to empty-success:

```typescript
const readSource = async (): Promise<string> => {
  const f = Bun.file(opts.file);
  return await f.exists() ? await f.text() : "";
};
```

A failed read returns `""`, renders an empty document, and the content
gate sees `changed` (empty != last real content) → repaints a blank
screen. So today, state **failed** is silently misreported as state
**changed**, and the last-known-good is discarded. This is the
inversion of the brief's valve: showing known-nothing while known-good
bytes sat on disk one fetch ago. The stamp cannot be honest until the
read path stops lying.

## How

1. **Fetch outcome as a discriminated union** (the fix for the bug
   above). Replace the coercing `readSource` with a path that surfaces
   failure as a distinct state:
   ```typescript
   type Fetch = { ok: true; text: string } | { ok: false; reason: string };
   ```
   `try/catch` the `f.text()` (IO error, file unlinked mid-session,
   permission revoked, network mount gone); on throw, return
   `{ok: false}`. `f.exists()` returning false is also `{ok: false}`,
   not `""`. The fetch-state is now a three-way value the engine must
   already distinguish to decide whether to repaint at all.
2. **On failed fetch: retain the last-known-good lines and flip the
   stamp to `failed`.** Do not blank, do not repaint an empty document.
   The screen keeps showing what we had; the mark says we couldn't get
   fresher. This is honest-stale-with-label, not dishonest-blank.
3. **Content gate stays the source of truth for changed/same.** The
   live-documents brief already scopes it (step 4: compare rendered
   output or its hash). `changed` and `same` fall out of the gate for
   free; `failed` is the new branch the gate previously coerced away.
   One enum, three values, no overlap.
4. **The stamp cell, placed between Gloam and the filename.** The footer
   reads left-to-right as the reader's four questions in the order they ask
   them: *who rendered this* → *when did you last look* → *what did you find*
   → *of what* → *and how do I drive it*:
   ```
   Gloam  checked 14:32 ●  folder/file  .......  ? help
   ↑         ↑         ↑      ↑                        ↑
   identity  when     what   subject              affordance
   ```
   The state glyph sits in the high-attention left third, beside the
   identity plate where a bridge console puts its status readout — not
   exiled to the right gutter where glow parks its chrome and the eye
   never lands. The Gloam badge keeps its brief-defined role (the screen's
   name, muted); the stamp is a separate cell, never fused into the badge
   (a dated badge reads as the document's time, which is the
   contamination the first temporal directive forbids). Two roles, two
   cells: the name and the log.

   **Colouring discipline: glyph-only carries the state.** Mute the text
   of the stamp (`checked 14:32` — provenance, like the filename) and let
   only the single state glyph carry the state colour — amber `●`
   (changed), muted `○` (same), red `✗` (failed). A full-cell red-on-failure
   floods a wide strip and reads as decoration ("the bar went red"); a
   single coloured glyph is a one-cell alarm that says *exactly* "this
   fetch failed" — the LCARS attribute (status, not mood). The `same` glyph
   in muted recedes by design: nominal shouldn't compete for attention,
   so the eye confirms it by *not* stopping. Only `changed` and `failed`
   draw the eye. That is the anti-slot-machine property the
   live-documents brief wants, made visible in one cell.

   Footer composition (in `footerLine`):
   ```typescript
   badge("Gloam") + " " + muted("checked HH:MM") + " " + stateGlyph + " " + muted(name)
     + gap + muted(rightText)
   ```
   The glyph is the only state-coloured element; everything else stays
   muted per the Gloam brief's palette discipline.
5. **LCARS colouring for the states** (the attribute, not decoration).
   See the section below.

## LCARS state colouring — B'Elanna's warp core

This is the LCARS attribute the origin doc names: colour signals
status, not mood. The stamp's three states are operational, and each
maps to an LCARS channel the eye already knows from the bridge:

| State | Meaning | LCARS channel | Palette role |
|-------|---------|---------------|--------------|
| changed | state transition, new data | engineering / activity (amber) | `strong` / `badge-bg` `#ffaa00` |
| same | nominal, steady | the calm invariant (recedes) | `muted` `#445566` |
| failed | alert, source lost | **red alert** | **`alert` — role does not exist yet** |

The `changed` state draws the eye (amber, activity — "something
happened"); `same` recedes (muted, "all quiet"); `failed` **must read
as alarm, not as another amber.** B'Elanna ejecting the warp core on a
`status: red` she can't tell from a dead feed needs the chrome to say
*unambiguously* that the terminal is live but the source is gone — and
that signal is red, not a third shade of orange.

**Decision needed (palette):** the okuda preset has no red role. A
failed fetch colouring reusing amber would collide with `changed` and
read as "more activity," which is the opposite of the alarm semantics.
This brief proposes a new palette role `alert` (a high-contrast red,
candidate `#ff5555` matching Dracula's red for parity-comparison
consistency). Adding a palette role is a decision under ADR-007's
discipline ("a future diagram channel needs a distinct hue, it must
justify why the existing channels fail first" — extend that principle
to the chrome layer). The justification: `failed` is a safety-critical
signal that must not be confusable with `changed`; no existing channel
is red; therefore a new role. → companion ADR or a divergence-table row
should record this; the brief does not decide it.

**NO_COLOR / `TERM=dumb` fallback:** the three states degrade to ASCII
glyphs, not colour — `*` (changed), `.` (same), `!` (failed) — so the
alarm survives the loss of colour (the `!` carries the urgency the red
carried). Plain output is the coloured output minus escapes, identical
line breaks — the NO_COLOR parity invariant holds for the stamp as for
everything else.

## Scope

- `src/tui.ts`: the read path (discriminated union), the stamp cell in
  `footerLine`, the retain-on-failure branch in `rerenderAnchored`.
- `src/palette.ts` + `src/palettes/okuda.json`: the new `alert` role
  (gated on the palette decision above; stub it if the ADR isn't landed
  yet, but don't ship `failed` colouring as amber).
- Tests: failed-fetch retains last-known-good and sets `failed`; same
  content produces `same` and no repaint; changed content produces
  `changed` and repaints; NO_COLOR stamp is the coloured stamp minus
  escapes.

## Out of scope

- **Decay / heartbeat / staleness opinion.** The stamp is frozen on
  fetch; no tick ages it. Decay is an alert; we do not alert. (See the
  conversation that founded this brief — the decay version was rejected
  as the phone-notification idiom.)
- **Document temporal provenance.** We never echo the doc's "as of";
  the first temporal directive forbids it.
- **mtime display.** Explicitly out of scope per the live-documents
  brief; mtime is the producer's clock.
- **ssh-transport-dead.** When the transport dies the TUI process is
  gone — there's no observer to stamp to. `failed` means "session live,
  fetch failed," not "transport dead." The latter has no chrome by
  construction.
- **Alerting / push / paging.** The feed says `status: red`; the pager
  is a different channel. The stamp labels our fetch; it does not raise
  alarms the doc didn't raise.
- **Shipping before `fs.watch` lands in the TUI.** The stamp is quiet
  but honest with only `r`/resize to trigger it (the reader is the
  clock, so they know when they checked); it becomes *useful* once the
  doc changes on its own and the reader needs to tell "nothing new"
  from "we lost the source." Sequence: finish the watch brief, then
  this. A fetch-stamp on a dead feed is the thing actually worth
  shipping; a fetch-stamp with only manual reload is a signature
  without a producer.

## The inevitable requests, and the two gates they hit

Two requests will come — soon, possibly before the stamp ships — and
both get the same answer from the same two gates. The stamp says *that*
the document changed and *when* we last looked; it does not say *what*
moved, and it does not help you find your place in a document that has
outgrown the screen. Both follow-up requests are anticipated here so
the answer is pre-positioned, not improvised under pressure.

### Request 1 — *"can you show a diff of where it changed?"*

The stamp says *that* the document changed; the request wants *what*
changed. Two gates apply, in order:

1. **The Foxtrot Oscar Principle (does it earn its place?).** A diff
   view is a second render mode, a second pane, a diff engine, a way to
   hold two document versions in memory and align them. That is real
   machinery. The evidence for it is: a reader, on seeing `changed`,
   routinely wanting to know what moved and being unable to find out
   by reading the document. No such evidence exists yet — the stamp
   hasn't shipped, so nobody has been irritated by it. A diff feature
   built now is a thing with no evidence, which is the Foxtrot Oscar
   test failed in advance. The principle says: build the stamp, watch
   whether the irritation surfaces, and only then consider the diff.
   The thing that had evidence once and has none now, goes; the thing
   that has no evidence yet, waits.

2. **The Derrida Question (should it even be in the consideration set?).**
   *Should this be in our consideration set at all?* A diff viewer is a
   different tool — `git diff`, `delta`, a side-by-side pager. The
   producer writes the document; the reader who wants provenance of
   change already has it (the file is in git, or the producer's
   pipeline versions it). okuda renders markdown over ssh at fps; it is
   not a version-control browser. Building a diff mode in okuda is the
   viewer absorbing a job that belongs to a different tool and to the
   producer's own pipeline — exactly the external-constraint question
   the Derrida gate asks before the quality gate. The likely answer is
   *no*: point the reader at `git log -p <file>` (or the producer's
   equivalent), and keep okuda rendering the present state. The stamp
   tells the reader *something changed*; *what changed* is one
   `git diff` away and was never our problem to render.

### Request 2 — *"can you help me navigate this big document?"*

The document is longer than the viewport; the reader wants search,
outline, jump-to-heading, a minimap, fuzzy-find — some navigation aid
beyond the basic `j`/`k`/`g`/`G`/`Ctrl-D`/`Ctrl-U` scroll the TUI
already ships. The same two gates, the same order:

1. **The Foxtrot Oscar Principle.** If your document is too big, it is
too big. That is not a problem we deal with, sorry. Basic scroll is
   sufficient for a document of reasonable size — the size the agent
   workflow actually produces (briefs, decisions, handoffs; pages, not
   chapters). The evidence for a navigation feature would be: the
   workflow's own documents routinely outgrowing the screen and the
   reader unable to reach the relevant section by scrolling. No such
   evidence exists; the documents are the size they are because the
   producer sized them. A viewer that grows navigation aids to
   compensate for document bloat is treating a symptom and licensing
   the disease — the producer who sees the viewer absorb the cost has
   no pressure to split the document. The principle cuts the other way:
   keep the viewer simple, and the document stays honest about its own
   length.

2. **The Derrida Question.** *Should this be in our consideration set
   at all?* Document navigation is a different tool's job — `less` has
   search and jump; `fzf` finds; `grep -n` locates; a dedicated reader
   out outlines. okuda renders markdown over ssh at fps; it is not a
   document navigator. Building search/outline/minimap into the viewer
   is the same absorption as the diff: a job that belongs to a
different tool, reached for when the reader needs it, not built into
   the renderer. The reader with a too-big document has the terminal's
   whole toolset around okuda; we are one pane of many, not the pane
   that swallows the others.

### The double veto, stated once for both

The two gates reinforce each other on both requests: no evidence
(Foxtrot Oscar) *and* not our job (Derrida) is a double veto. The
requests are anticipated and the answer is pre-positioned — the stamp
is the whole feature; the diff is `git`'s job, the navigation is
`less`/`fzf`/`grep`'s job, and both are reached for when the reader's
own pipeline fails them, not built into the viewer. okuda renders the
present state of the document, dated by the last fetch; everything
else is someone else's tool.

## Related

- Depends on: `briefs/2026-08-26-brief-tui-live-documents.md` (the
  watch plumbing + content gate this builds on)
- Sibling: `briefs/2026-08-23-brief-gloam-tui-footer.md` (the Gloam
  signature — keep separate from the stamp)
- Constraint: `decisions/006-glow-dark-palette.md` (NO_COLOR parity
  invariant — the stamp must obey it)
- Decision needed: ADR for the `alert` palette role (red, the
  failed-state channel) — new role justified by non-confusability with
  `changed`
- td: `td-a27b86`
