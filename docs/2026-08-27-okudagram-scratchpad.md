# The Okudagram Scratchpad

**Date:** 2026-08-27
**Kind:** scratchpad, not manifesto.

A loose collection of the metaphors, statements, and hypotheses that
came out of the panel-library sessions — and the concrete layouts they
suggest. Not a formal document; a place for the fun ideas to live before
they either earn a brief or get foxtrot-oscar'd. The Edinburgh lexicon
(`system.md`) holds the protocol terms; this holds the *design* terms.

---

## The metaphors

- **On screen, now.** Janeway's demand. Any panel, any matrix, complete,
  framed, fit — the sharing primitive. The unit of "look at this."
- **Tied to the mast.** The freeze: Odysseus didn't plug his ears; he
  wanted to hear the content and be unable to be lured. The panel hears
  the siren voices of dodgy swipes and gravity mice, and is unmoved.
- **Slipperiness is induced, not native.** The document is static,
  located, structural; the input device induces the motion. You don't
  damp a channel you never subscribed to.
- **Hopscotch on ice.** Discrete intent on a continuous surface — you
  want to *land*; the floor won't hold still.
- **Ice dancing on concrete.** Continuous intent on a discrete surface —
  you want to *flow*; the floor won't slide.
- **Book-binding.** The renderer owns the binding (header, closer,
  margins); the author owns the pages. Per-author binding goes scrappy;
  renderer-owned binding is uniform across every document, forever.
- **Soup spilled by an avant-garde artist.** What `ls` looks like. No
  binder. We aim a tad higher.
- **Availability without insistence.** The muted source echo: it does
  not ask to be read; it waits to be needed. Art foreground, structure
  receding, source quiet underneath.
- **One glyph, one job.** A mark that duplicates an existing structure
  is noise; a mark that distinguishes what structure cannot is perception
  for free. The exception: status glyphs beside a bullet carry state the
  bullet cannot.
- **Openings announce, closings release.** The terminator is quieter than
  the header — muted rail for bold title. The correct direction.
- **Pleasantly brutal.** No reflow of raw blocks. A wrapped diagram is a
  broken diagram pretending to be whole; elision is crueller and more
  useful.
- **Elision as invitation.** The mark names the verb that resolves the
  truncation — widen, or page. A limit turned into an affordance.
- **Spark joy, or go (foxtrot oscar).** Kondo by way of the authoring
  playbook: what stops earning its place, goes. Joy is the felt
  experience of a document where everything earned its place.
- **The surface fits the activity.** Not the document to the surface, not
  the surface to the document — the *activity* picks the surface, and
  the surface's input contract matches the verb class of the activity.
- **The content is the content.** The viewer presents, it doesn't
  editorialise, it doesn't retain, it doesn't reward. Three words; the
  viewer's whole constitution. Presence without persuasion.
- **Render for the car radio, not the studio monitor.** The Tamla
  Motown test: mix for the medium you can't control — a car speaker,
  road noise, a distracted driver. If the track survived that, it was
  a track; if it only sounded good on the studio monitors, it was
  production sheen. okuda's closed grammar is the same principle
  applied to rendering. Every element in the grammar is one that
  *degrades gracefully* under hostile conditions: a 30-column
  half-width panel, no OSC8, a font without box-drawing glyphs. The
  constraint isn't a limitation; it's a noise-tolerance design. Judge
  the map by its survival in the territory, not by its fidelity on
  the surveyor's desk.
- **One job; get on with it.** Tawny Madison's job in *Galaxy Quest* —
  repeat what the computer says, in the uniform, and resist every
  invitation to do more. The viewer is the channel, not the content; a
  channel that improvises is a channel that's broken. Shrink-wrapping
  the table was Tawny editing the table; OSC 8 would have been Tawny
  hiding the URL; the dopamine features would be Tawny tap-dancing.
- **Terminal surfing.** A document's structure is a waveform — dense at
  headings (crests), sparse in the prose between (troughs), sharp at
  section breaks. You don't navigate a tree, you read a wave; the
  terminal is the board; okuda is the wax that lets you read the wave
  without it throwing you. (The chip-stack "minimap" was a witch's
  house made of candy — chrome that editorialized, busy, and said
  nothing the headings didn't already say. Dropped 2026-08-27.)
- **Pen and paper.** The only tools a human needs to learn and navigate
  the silo: a way to request a word, and a way to record what they
  found. The complexity is in the renderer's bytes; the simplicity is in
  the human's gestures. Dopamine interfaces invert this — they push
  complexity to the human to keep the backend simple. We push complexity
  to the renderer so the human gets pen and paper.
- **The lexicon is the moat.** A body of work that needs a search engine
  to find is a body of work that failed to name its parts. The whole
  architecture dangles off a vocabulary a human can hold in pen-and-paper
  memory — *on screen now*, *tied to the mast*, *hopscotch on ice*,
  *elision as invitation*, *one glyph one job*. The handles ARE the
  access layer.
- **The quiet update.** The renderer assimilates a changed document
  with Vulcan imperturbability and reports nothing except, when asked,
  the current state. It does not grade the author's edits, does not
  rank which change deserves attention, does not highlight the diff.
  Presenting what *is*, not what *changed* — because what changed is a
  question for a change-tracking tool, and okuda is a current-state
  tool. The task is complete; the document was updated; the renderer
  has moved on.
- **The discovery game.** Finding the change is the reader's act, not
  the tool's announcement. The reader who must search for the change
  reads the document; the reader who is shown the change reads only
  the change. The first is review; the second is consumption. We build
  a review surface, so the game is the point — not a friction to remove.
  The difficulty is the feature: elide the change-highlight, and the
  reader's effort to find the change is the effort that makes the
  change *stick* — the elision principle one layer up. Whether the
  changes should be obvious is not our concern.
- **The elision fringe.** The elision marker is not one discrete glyph
  but a *fringe* that runs along the edge it marks — three stacked, a
  block of nine dots, impossible to miss. The fringe runs along the
  exceeded edge; the dots point in the direction the content continues.
  Two cues, one block. Horizontal overflow (the harder remedy — widen
  the matrix) gets a vertical fringe of three stacked `…` at the right
  edge; vertical overflow (the easier remedy — scroll or page) gets a
  horizontal fringe of three side-by-side `⋮` along the bottom. The
  weight matches the remedy: the harder the recovery, the heavier the
  mark.
- **Two axes, two engines.** Cardinality (how many documents) and length
  (how long one document gets) are orthogonal scaling dimensions. Each
  gets its own mechanism, built for its own axis, and refused the other.
  The launcher serves cardinality — bounded by the silo, so a naive
  subsequence matcher is predictably adequate and any ranking is
  benchmaxxing a benchmark the namespace never stresses. The outline
  picker serves length — a document can grow arbitrarily, so abstracting
  its structure and rendering that abstraction as an optional surface
  earns its vectors. The error is the shared engine: a global index to
  solve a local problem, an outline to solve a filing problem.
- **Vectors are rationed.** A vector is any dedicated mechanism — a
  ranking weight, an index, a UI surface, a keystroke, a slot in the
  user's head. All scarce. The discipline: spend a vector only where the
  axis it serves is real and unbounded. Filename fuzziness → cardinality
  → bounded → no ranking vector. Outline and in-doc search → length →
  unbounded → vectors earned. The hard part isn't building the mechanism;
  it's the upstream decision about which axis is real. Get that wrong
  and no cleverness recovers it.
- **Fail at the fence you didn't build.** Commit to one scaling
  dimension per mechanism, reject the other — loudly. The outline picker
  does not scale to "find the right file"; the filename matcher does not
  scale to "find the right line in a long file." Each is allowed to fail
  visibly at the limit it doesn't serve. A tool that fails at its
  boundary is honest; a tool that silently degrades across both axes is
  the chip pan fire.
- **Bounded × mnemonic → perfect recall.** Three characters recover the
  filename only because two conditions stack: a bounded namespace, and
  mnemonic slugs. Strip either and Ariadne's thread snaps. The registry
  and the naming discipline aren't bureaucracy — they're the substrate
  that makes subsequence match approach perfect recall. Lose the slug
  discipline and the launcher's fuzzy box degrades to `doc-001`
  territory overnight. (Sharpens *the lexicon is the moat*: the moat
  works because both conditions hold, not one.)
- **The compass rose.** Four words — `help`, `readme`, `about`, `okuda` —
  orient a stranger without a tutorial: `readme` the front door (what
  this is), `help` the operator's view (what do I do), `about` the why
  (what it's for), `okuda` the identity (the LCARS design language that
  named the project). The same naive fuzzy matcher that finds a brief
  from `state-stamp` finds orientation from these handles — one engine,
  two jobs. The access layer *is* the documentation; no separate
  tutorial survives because the words were chosen to be findable and
  the namespace is bounded. The *discoverability* vocabulary extends the
  lexicon-is-the-moat claim one layer out: the moat isn't just the
  design vocabulary (`on screen now`, `tied to the mast`) — it's the
  handles that get you to the design vocabulary in the first place.
  The handles cost nothing to type; they cost effort to keep honest —
  four words, four times a year — which is the right price for a
  discovery layer that needs no UI, no guide, no session memory. Pen and
  paper aren't required to find the door; they're required to keep the
  door labelled.

---

## Layout sketches

ASCII mockups of the shapes the metaphors suggest. Not "the code would
look like this" — what the *screen* would look like.

### The panel view, framed

A single on-screen-now panel. The frame — header above, terminator
below — is the only chrome; the content sits between, unadorned. The
shape is visible in the headings; no second copy of the shape is drawn.
You are inside one now — this section's heading is the header, the
document's terminator (at the very foot of this file) is the closer,
and the table below is the content, rendered, not mocked.

When a document's payload is "things to decide", the shape is known
before the captain asks: a table.

| Decision | State | The reasoning |
| --- | --- | --- |
| Wrap engine | ✓ | grapheme-true |
| OSC 8 | ⋮ | parked |

### Elision — the fringe

Not one discrete glyph but a *fringe* along the exceeded edge — three
stacked, nine dots, impossible to miss. The fringe runs along the edge;
the dots point in the direction the content continues. Weight matches
remedy: the harder the recovery, the heavier the mark.

```text
Horizontal — width exceeds the matrix (the harder remedy: widen cols).
Fringe runs along the right edge; dots point right (continuation):

  ┌────────┐         ┌────────┐         …
  │ Draft  │────────▶│ Review │────────▶…
  └────────┘         └────────┘         …

Vertical — rows exceed the matrix (the easier remedy: scroll or page).
Fringe runs along the bottom edge; dots point down (continuation):

  ██ A long section                                       █
  Line one.
  Line two.
  ⋮⋮⋮
```

### The verb surface (control panel)

The Gloam footer, on the panel view. State on the left, verbs on the
right — terse, the same verbs keys/buttons/voice all transport.

```text
  ──────────────────────────────────────────────────── █
  ▌ panel 3/7 · frozen                  n p · top bottom · r refresh
```

Frozen: the verbs still show, but displacement inputs (wheel, swipe,
touch) find no handler. `r` is the only thing that disturbs the screen.

### The two-views axis

Activity picks the surface; the surface's contract matches the verb
class. The mismatches are the tells.

| Activity | Surface | Input contract |
| --- | --- | --- |
| survey (continuous) | The Scroll | displacement admitted |
| traverse (discrete) | The Panel | terse verbs only |
| study (still) | freeze-in-panel | no input; refresh on demand |

### The surface hierarchy (Voyager's ladder)

Biggest and most passive at the top; smallest and most active at the
bottom. New features land on a surface; the surface sets the contract.

| Surface | Voyager | Ours |
| --- | --- | --- |
| the window | the viewport to space | the terminal window |
| astrogation | the navigational map | the TUI scroll view |
| okudagram screens | semantic panels | the panel view |
| control panels | verb surfaces | the Gloam footer |
| PADDs | tactile, immediate | keys · buttons · voice |

### The access layer (terminal surfing)

The silo's filesystem spoken honestly. No interface required — just
the words and the wave. Any tool that produces a path hands okuda a
panel; okuda doesn't know where it came from.

| Word | What it finds | When you use it |
| --- | --- | --- |
| `table`, `scratchpad` | the lexicon; fzf | the words you half-know |
| `2026-08-27` | every dated doc; chronology | when you know when |
| `briefs/`, `docs/` | the folder; taxonomy | when you know the kind |
| `panel-library` | the slug; subject | when you know the topic |
| (ventilator) | every file name, brute-force | when you don't know yet |

Too much, too little, or just enough — it's all available, and none of
it is the renderer's business.

### The quiet update, on two surfaces

Noticing and finding are different activities, so they live on different
surfaces. The cheap signal in the margin; the careful search in the
content. The game lives in the gap between them.

| Surface | Activity | What it shows | When it speaks |
| --- | --- | --- | --- |
| footer stamp | noticing | "changed" — warmer/cooler hint | continuously, in the margin |
| content | finding | the updated document, as-is | only on the `refresh` verb |

The stamp tells you to look; the document doesn't tell you where; the
search is the play. Whether you find every change or only the obvious
ones is not our concern.

### The two axes (vector allocation)

The scaling-dimension discipline as a budget. Spend where unbounded;
save where bounded. The launcher stays dumb on purpose; the in-doc
tools earn their vectors because a document can grow without limit.

| Mechanism | Axis served | Axis refused | Vector spent | Vector saved |
| --- | --- | --- | --- | --- |
| filename fuzzy matcher | cardinality (bounded) | length | naive subsequence only | ranking, frecency, embeddings |
| outline picker (`o`) | length (unbounded) | cardinality | a keystroke, an overlay | a global index |
| in-doc search (`/`) | length (unbounded) | cardinality | a keystroke, an overlay | a cross-file index |

The billions-of-documents case is a failure we should have noticed long
before the launcher saw it. The matcher is built for a number that
never arrives — which is the correct way to be under-built.

---

## Hypotheses (open)

- **Freeze-within-panel is the third cell, not a mode of the second.**
  It may need its own verb (`pin`/`release`) distinct from the panel's
  `n`/`p` — or it may fall out of the panel's contract for free. Decide
  at implementation.
- **`…` vs `⋮` orientation is self-evident.** The glyph's shape carries
  the orientation; no legend needed. Test on a reader who hasn't seen
  this doc.
- **Voice as a transport needs a closed verb grammar.** "Next panel" is
  `n` with acoustics only if the verb set is small, closed, and
  unambiguous. A sprawling verb set breaks voice before it breaks keys.