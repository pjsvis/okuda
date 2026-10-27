---
type: Brief
callsign: BRF-SPOKEN-BLOCK-GRAMMAR
date: 2026-09-15
---

# Brief: The spoken block grammar — announce the kind, enumerate the elements, never elide silently

**Created:** 2026-09-15
**Status:** Rejected — 2026-10-27, the operator's call: too old, and the corpus has moved on. Archived rather than deleted — replunder if the need returns. The idea is not judged, only its queue position.
**TD:** td-fb5059 (stream A — the silo's flattener) · td-615253 (stream B — the surface's cursor)

## Lineage

the reader's 2026-09-15 session, in moves. The fit — *right now it sounds like Moira is having a fit*. The instinct under it — *prefix each line with "line" or something; maybe read out the column header so that the table sounds like a collection of key value pairs*. The deepening — *we need indicators so that tables can be navigable; either that or we rerender the table for speech; we need to dogfood some options*. The spread to siblings — *list items should be prefixed with item; the list should announce the number of items at the top; sub-lists get a sub-item prefix; we prefer shallow lists with no nesting*. The mechanism — *a modifier key that works inside the table: hold it down and the key value pairs are spoken, lift and the values only are spoken; that along with an up down and maybe left right navigation grammar should be sufficient*. The closure — *are we, in effect, arguing for two renders of the table for speech: a fast and a slow reading available behind some keys* — answered here: **one structure, two registers**. The field evidence and the filter — `docs/2026-09-15-tables-for-unsighted-listeners.md`: *flatten, read row by row, name the columns*, vendor guidelines out, the blind users' statements in — *labels spoken with the value* (Taylor), *it counts on you remembering which row you're in* (Watson).

## Extends

**BRF-SPEECH-STRIDE** owns the arrows and the position event — inside a table, this brief seizes them: a rebind by context, not a fork in the keymap. The research note owns the survey and its filter. **ADR-036** owns the division of labour — the cue is okuda's, the voice is the silo's — and nothing below crosses it. **ADR-037** records the cursor decision this brief needs.

## Objective

Make every block speakable and every table navigable. A uniform grammar for
spoken block structure — every container announces its kind and size, every
element carries a boundary the ear cannot confuse, every elision is spoken —
and, for tables, a cursor inside the render: arrows to walk it, a chord to
re-hear it. The dogfood found the defects; the field research found the one
affordance no CLI in the wild has; this brief builds both.

## The evidence — the ear finds what the eye forgives

Two dry runs against the real corpus, before any design:

| defect | evidence |
|---|---|
| the wire leaks to the ear | `&speak.md` through `--dry`: *"<!— %%okuda-rhs:12%% README —>"* — `flush_table` never calls `strip_inline` on cells |
| row joins and in-cell commas are indistinguishable | *"Geometry (X, Y, zoom, scroll)"* — every comma the same 150 ms breath, so one cell sounds like four |
| all fence content is dropped silently | the probe: code and mermaid alike vanish — *"Code test… After"* with nothing between, not even an announcement |
| header context is spoken once, then gone | by row four the listener is holding three column names in working memory with no re-glance |

The first is a bug, not a design question. The others are design. The blind
users' statements settle the design direction: **labels with values, never
coordinates; less output; linear order.**

## The invariant — a grammar of spoken block structure

One grammar, every block. Kind and size announced (the count is a *commitment
device* — the listener knows the price before paying), elements enumerated with
boundaries punctuation cannot fake, elisions announced, never silent. Three
things a glance gives for free — kind, size, position — are exactly what a
serial medium must be told. This is force #1 of the speech-driven design —
*speech forces naming* — applied at block level.

| Block | Announce | Enumerate | Elide |
|---|---|---|---|
| heading | "Section." / "Subsection." | — | no |
| table | "Table of N rows, M columns." | "Row k." | announced |
| list | "List of N items." | "Item —" / "Item k —" | no |
| code fence | "Code." | — | no — read |
| diagram fence | — | — | "Diagram, elided." |

## Stream A — the flattener (the silo's trade)

**A1 — Two passes, not one scanner.** `flatten()` is a line-scanner with two
boolean flags and ad-hoc lookahead; its complexity budget is spent — the fence
branch already has to remember to call `flush_table()`, and every new block type
adds another reminder. Split it: **parse** (CommonMark block structure — the
block set okuda's own scope line already specifies) → **elocution** (block
type plus options → utterances: the table above *is* the emission rules).
Labels ride the structure as metadata; utterance is a pure function of
(position, register). Each feature below then becomes one entry, testable and
auditionable in isolation.

**A2 — The list grammar.** Count first: *"List of five items."* Then the
boundary word: *"Item —"*. The number is added only when the source list has
one — *if there is a number that gets added, and if not, no* — because a
numbered item's number is content, not a synthetic ordinal, and minting both
pays twice for one address. Nested items get *"Sub-item —"*. The house style
bounds the variable at the authoring side — shallow lists, no nesting — and
the flattener merely forgives the rare offender.

**A3 — The fence policy.** Per info string: `mermaid` → *"Diagram, elided."*;
everything else → *"Code."* + read the content. Today's silent drop of all
fenced content violates the announcement doctrine — an elision you cannot
hear is indistinguishable from a document that ends early.

**A4 — Tables, one-shot pass.** Announce dimensions and headers once, then
rows in order — values with ordinals. This is the fast register with a
preamble (see below), and it is the research note's own arithmetic: repeating
labels per row costs O(rows × columns) words — *unusable at fifty rows*;
announce-once costs O(columns) + O(rows × columns) values. The
key-value-per-row rerender from the first riff survives where it belongs: in
navigation utterances, not in the one-shot pass.

**A5 — The bug.** Cells pass through `strip_inline`. The wire is invisible to
the eye and audible to the ear; today the ear is right and the code is wrong.

## Stream B — the table cursor (the surface's cue)

**ADR-037** records the decision. The mechanics, as converged:

- **Entry.** The stride settles into a table block — Watson's `t` in okuda's
  terms — and the entry announcement speaks dimensions and headers, once:
  the commitment device that primes the fast register. From entry to exit,
  **the table context owns the arrows**; exit releases them back to
  BRF-SPEECH-STRIDE. Two owners, one key, ownership announced at the seam.
- **↑/↓ — row steps.** The current row is spoken per register.
- **←/→ — cell steps.** The cell is spoken with its **column label, always** —
  the label names the dimension that just changed; this is Taylor's preference
  verbatim, and free at the utterance boundary. Never, anywhere, a coordinate:
  no *"Row 5, Column 4."*
- **The register chord.** Ctrl+Arrow speaks labels + values (the slow
  register); bare Arrow speaks values only (the fast register — the default,
  because *less output* is the blind users' stated preference). **Not a hold:**
  the reader specified hold-and-lift; the TTY cannot deliver it — terminals
  emit no key-up events. The chord is the semantics with the mechanism made
  honest to the medium. `keygrammar` currently parses four bare arrow
  sequences; it must learn the modifier forms (`ESC [ 1;5 A`…).
- **Edge.** A repeated direction at the boundary speaks *"edge of table"* —
  Watson's refusal, announced per the doctrine.
- **Refresh.** The file is truth: on re-render the cursor resets to entry.
  Honest and cheap; re-anchoring can be earned later by a mangle, not by
  speculation.

## The registers — one structure, two emitters

*Are we, in effect, arguing for two renders of the table for speech?* No —
and the noun matters. Nothing about the bulk changes between the two readings;
what changes is the utterance strategy. **One parse, two emitters.** The tell:
a third register (say, values + row ordinal) is one more entry in the
emission table, not a fork.

What actually moves across the chord is **the memory boundary** — Watson's
split, made negotiable. Fast register: the listener holds the axis — fewer
words, quicker traversal. Slow register: the tool holds it — more words, more
meaning. The chord relocates working memory between listener and tool, one
move at a time. Fast/slow is the honest user-facing name (it describes
traversal); the brief's name for what they are is *listener-held* and
*tool-held*.

## Non-goals

- **No playback controller.** Skip-past-the-table was trying to solve
  re-glance; a navigable table *is* re-glance, restored as movement. The
  static case is served by elide-announced. Deferred until the ear proves it
  needed — do not model transitions you have not heard fail.
- **No vendor guidelines.** gcloud spinners, `Format-List`, detection orders
  — platform idioms; they answer *how do Windows screen readers behave*, not
  *what does a human ear need*. The blind users' statements generalize
  because they are about working memory in a serial medium, not software.
- **`ACCESSIBLE=1`:** adopted only on the day a declared mode ever exists.
  Parked, per the research note.
- **No speech code here** (ADR-036). The slice is text on the bus; the silo
  utters it. okuda owns the cue — position, grammar, announcements — and
  nothing else.

## The auditions — acceptance is the ear

The matrix, played through Moira on real corpus tables: `&speak.md`'s own
(narrow, wired), the speech-driven-design §4 table (in-cell commas),
`tmp/table-probe.md` (the render's probe):

| audition | what plays | the question it answers |
|---|---|---|
| A | status quo + "Row k." ordinals | the boundary alone: does the ordinal fix the comma collision? |
| B | full records — key-value per row, one-shot | the slow register as a pass: meaning at what word cost? |
| C | A + the shape preamble — "Table of N rows, M columns." | the commitment device: does knowing the shape before entering change the experience? |
| D | row ordinal spoken on navigation moves, or not | one word, restores the held axis — or edges toward coordinates? (deferred to stream B) |

One variable per audition, or the ear cannot attribute cause. A isolates
the boundary, C isolates the shape announcement on top of A, B isolates
the register. D waits for the cursor.

Acceptance: each audition heard and judged by ear; wording earned, never
invented speculatively — the silo's own doctrine, and the research note's
caution carried forward: *secondhand assumptions about what sounds right are
exactly the kind of mistake this work exists to avoid.* The dogfood is
single-modality (ADR-035): the primary field is the test field.

One document correction rides along, per the research note: the seam document's
escape hatch is wrong for tables — *"cat the file"* trades pipe-noise for
dash-noise. The honest claim: **tables render for the visual sink; the voice
path is speak-md.**
