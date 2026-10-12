---
type: Playbook
callsign: PLY-AUTHORING
---

# Authoring Playbook

## What this is

A playbook for the markdown **authoring style** okuda is tuned to render. Most markdown documents in this silo are created by AI agents; a playbook gives them a house style to write to instead of the CommonMark default. The renderer is tuned to this style; the style is tuned to the renderer; the calming effect lives in the coupling. Neither half works alone.

This is not a style guide for general markdown. It is the house style for this workflow's output: briefs, debriefs, ADRs, playbooks, docs. Add to it as operational heuristics emerge.

## The thesis

We are not embracing the CommonMark standard. We are plundering it for the benefit of the interested reader. Every convention here is justified by a perceptual property — a stress it removes or a scan it enables. If a convention stops earning its place, it goes (foxtrot oscar).

## The comprehension surface — match the intent to the medium

Every pattern below is an affordance of one medium; this is the law that says
which to reach for. The medium's defining property is not the inventory — tables,
lists, gold, diagrams — but the **predictable comprehension surface**: rendering
is deterministic and the grammar is closed (`src/render.ts`, the string-tag
protocol), so the author can predict what the reader will see, and the reader sees
what the author predicted. Structure carries meaning only because of that — a bold
lead scans because `strong` renders gold, a table aligns because its columns are
computed, a silcrow resolves because the vector is derived. Strip the determinism
and every pattern is decoration.

**The affordances carry different shapes of content.** Match the shape of what you
know to the shape that carries it:

| the content is… | the affordance | where |
|---|---|---|
| relations, states, a sequence | a diagram (text source, re-rendered) | *The muted source echo* |
| a comparison across fixed axes | a loose table | *The decision matrix*, *Tables have a width contract* |
| named items, each with a payload | a bold-lead list | *The bold-lead list pattern* |
| one load-bearing assertion | bold + gold, in the body | the bold-lead pattern, promoted |
| claims that qualify at an address | a reference (path / callsign) | *References are text* |
| a state per item | a status glyph | *The status-led list* |
| a remembered aside | the pipe blockquote | *The vertical-pipe blockquote* |

**The state-diagram discussion is the marquee case.** A diagram's source is text,
so a state machine is a *conversational object*: two parties propose, re-render,
and disagree on one edge at a time (`playbooks/mermaid-diagrams-playbook.md`). The
disagreement is localised to an edge, where prose would thread it through a
paragraph and grow the wall around it. That is why this medium can hold a
*discussion*, not only a record.

**The failure is a mismatch, and it runs both ways.** Prose carrying content that
already has a shape — a comparison, a list of named things, a relation — is the
**wall**: the shape was available and the author enumerated in sentences instead
(the meter that reports it is `just prose-check`). A table or a diagram carrying
shapeless content is **decorated Stuff**: structure with no referent. Reach for
the shape the content already has; do not impose one.

**The artifact is the document; the okudagram is its diagram — and the
inspiration.** "Okudagram" names the ASCII art a mermaid fence renders
(`playbooks/mermaid-diagrams-playbook.md`). It is the clearest instance of this
law, not a name widened to cover the whole artifact — a designation must not
exceed its referent. The structured artifact is the *document*.

**Test.** After a glance, can the reader state the document's shape in one
sentence — *"it's a comparison"*, *"it's a state machine"*, *"it's six
decisions"*? If not, the intent was not matched to the medium, and the wall is what
fills the gap.

## The bold-lead list pattern

The house-style signature. A loose list where each item opens with a **bold lead** (the key), followed by prose (the value):

```markdown
- **Record reconciliation (tweak-phase items 1–3).** The code had
  converged to glow-CLI Dracula across Passes A/B/C, but the ADRs still
  taught the wrong sourcing…
- **H6 grounded (item 6).** H6 uniform-bold-purple, previously "flagged
  for revisit," grounded in ADR-007's divergence table…
```

**Why it earns its place — the three-pass scan:**

1. **Count.** The eye sees how many items there are before reading any. This is the table-scan equivalent — the reader knows the scope of the list before committing.
2. **Keys.** The bold leads render in a high-contrast hue (amber under Okuda, orange under default). The reader scans the keys alone, as if reading a table's first column. Each key is a promise of what the item covers.
3. **Detail on demand.** The reader drops into the items that interest them and reads the trailing prose. The uninteresting items are skipped, not skimmed.

**Dogfood confirmation (2026-08-26).** Reading the okuda-net post, the
operator found themselves reading *critically* — the structure invited
challenge rather than asking to be believed. A slab demands sequential
faith; a scannable document gives criticism somewhere to stand. The
pattern is therefore epistemically load-bearing, not decorative: errors
are findable only in documents that afford the search.

**The trade is explicit.** You give up column alignment (the eye can't vertical-scan a column of values), you gain vertical rhythm and wrap freedom. The author chose breathing room over alignment, and the bold lead preserves the scan path that alignment would have given. The trade is not a loss; it's a redirection of the scan from horizontal (column) to vertical (item).

**Coupling rule.** The bold lead only scans if the renderer colours `strong` in a high-contrast hue. Plain bold on plain text doesn't scan — it's slightly heavier prose. The renderer enables the pattern; the author creates it. Write the lead bold; trust the renderer to make it visible.

## Loose lists, always

Lists are loose — a blank line between items regardless of source tightness. The renderer enforces this; the author should write tight source (`- a\n- b`) and let the renderer breathe it. Do not insert blank lines between list items in the source; that fights the renderer and produces double-spaced output.

Rationale: loose rows reduce scan tension (the "calming" property). Tight lists read as a slab; loose lists read as discrete blocks with a beat between them.

## Hash headers, never setext

Headers use `#` markers, exclusively. Never `===` under text (setext h1) or `---` under text (setext h2). The renderer neutralises setext anyway — `---` becomes a thematic break, `===` is stripped — so setext source won't render as you might expect.

Rationale: `#` is unambiguous; `---` is context-dependent (rule or h2?). Context-dependence is stress. The hashes are rendered as LCARS tabs (bg-coloured blocks), so the marker is a visual signal, not countable text.

## Front matter

YAML front matter (`---\n…\n---` at document start) is **elided** by the renderer. It is for tools (date, tags, agent, session, td-id), not readers. Put provenance there; do not expect the reader to see it.

If a reader needs provenance inline, put it in the body — front matter is invisible in the rendered output.

## The trade-off appendix: "left as an exercise for the interested reader"

This playbook is a twisted pun on the textbook line. The textbooks said "this should be easy to prove" and hid an amazing discovery in the margin (Fermat: "I have discovered a truly marvelous proof of this, which this margin is too narrow to contain" — 1637, proved 1994, 358 years later). The line was a polite refusal to do the work.

Our version inverts it. The bold-lead pattern is the opposite of a margin note: it surfaces the discovery, makes it scannable, lets the interested reader find it without reading everything. The trade is explicit, and the trade is the point — we give the reader the keys and let them choose the doors. Nothing is left as an exercise; everything is either a key or a door, and the reader picks.

## The vertical-pipe blockquote

A blockquote renders as a single muted `│` pipe down the left edge, with
the quoted text wrapped to content width beside it. It is a *pull-aside*, not
a flow element:

```markdown
> Named for Michael Okuda: high-contrast, functional, uncluttered. The
> terminal is the display, not a browser in denial.
```

renders as:

```
  │ Named for Michael Okuda: high-contrast, functional, uncluttered. The
  │ terminal is the display, not a browser in denial.
```

**Why it earns its place.** The pipe sets the block apart from the through-line.
It signals: *this is worth remembering, but it is not part of the argument's
flow — read it, hold it, then return to the thread.* An aphorism, a definition,
a memorable statement the reader should carry forward. Glow's version (a `|` on
every line, tightly wrapped) reads as quoted prose; okuda's reads as a
pull-quote. The pipe recedes (muted gray) so the *content* pops; the pipe's
*presence* is the signal, its colour the silence.

**Authoring rule.** Use blockquotes for statements the reader should remember,
not for long quoted passages. If the quote is more than ~3 lines of argument,
it belongs in the body prose. The pipe is for the aphorism, the maxim, the
definition — the thing you'd underline.

## The muted source echo

A mermaid fence renders as two layers: the ASCII art (borders recede,
arrows lead, text foregrounds), then the mermaid source beneath it, muted.
The art is the offer; the source is the invitation.

**Why it earns its place — availability without insistence.** The muted
source does not ask to be read; it waits to be needed. A reader who wants
the diagram takes the diagram; a reader who wants to *change* the diagram
takes the source — copy it, edit it, give it a go yourself. Nothing is
hidden. And because the echo is the renderer's own receipt (the binary's
`mmd` fence — what it understood, not what you hoped), art and source can
be compared on sight: a diagram that disagrees with its source is caught
in one glance. Restraint is the register: the coolness of the feature is
expressed by the completeness of the presentation, not the volume.

**Authoring rule.** Never strip the source from a document because "the
diagram already shows it" — the source is the reader's on-ramp. The
corollary: if the art needs to shout to be understood, the structure it
draws is weak.

---

## The status-led list

A loose list whose items open with a status glyph, then the bold lead,
then prose: ☐ to do, ✓ done, ✗ rejected, ⋮ elided — parked pending a
question, elided into it rather than vanished.

**Why it earns its place.** The GFM checkbox is binary — `[ ]` or `[x]` —
and okuda renders it literally anyway (the grammar is closed; the
markup stays text). Real documents accumulate a third and fourth state
that binary cannot hold: *rejected* (considered, refused) and *parked*
(neither planned nor done nor rejected — waiting on a question). The
operator knows the state from the parked brief; the glyph gives the
document the same honesty.

**Authoring rules.**

- **Declare the legend.** One line, first use, in the document. House readers skip it; strangers cannot — a private dialect must be taught once.
- **Keep the set small.** Four states. A fifth and the eye stops scanning and starts decoding.
- **Document state only.** If the item has an owner, a date, or a handoff, it belongs in the tracker, not the document. Glyphs travel with the prose; the tracker tracks.
- **Width honesty.** ☐ U+2610, ✓ U+2713, ✗ U+2717, ⋮ U+22EE — one cell each, none emoji-presentation-default. Any new glyph joins the audit doc's working set before it is relied on.

---

## The decision matrix

When a document's payload is "things to decide", the shape is known
before the captain asks: a table.

| Decision | State | The reasoning |
| --- | --- | --- |
| Wrap engine | ✓ | grapheme-true; verified on CJK and emoji |
| OSC 8 | ⋮ | parked; reopen on terminal evidence |

Key: ☐ open · ✓ decided · ✗ rejected · ⋮ parked.

**Why it earns its place.** Decidability is a scan, not a read. The table
puts state in its own column, so the eye counts the ☐ before reading a
word — the open decisions are found in one fixation, which is the whole
point of a decision list. A prose list buries state inside sentences;
the reader re-derives it per item. The matrix also forces the third
column — the reasoning — to justify itself in one cell, which is exactly
as much as a decision log needs.

**Authoring rule — the canon, not improvisation.** Reach for this shape
by default when decisions are the payload: column one the decision
(renders in the key channel), column two the state glyph, column three
the constraint or reason, key line beneath. "On screen, now" is the
test: the best format arrives without being specified, because the
house already knows it.

---

## Tables have a width contract

A table is **layout**, not art: okuda computes the column widths from the content
and the glass. That makes a table the one structure whose *content changes* when the
window does. A diagram is pre-baked and never re-wrapped, so its bytes are identical
at 40 columns and at 200 — a table's are not.

**Below its natural width a table shatters.** The cells wrap *mid-word*, with no
elision notice and no marker:

```text
  Motio │ Scope          │ Act                     │ Target
  n     │                │                         │
  vecto   cross-document   dereference a reference   another document
  r
```

**The number that matters is 80, because the voice reads at 80.** `terminalSize()`
returns `null` for a non-TTY (`src/width.ts:286`), so the piped voice path
(`okuda file | say`) falls back to `terminalCols(80)` — the rendered bytes are
byte-identical to an 80-column render whatever the reader's window is. So a table
needing more than 80 columns is broken for the ear *always*, not merely when the
window is narrow. And the failure is audible rather than cosmetic: **`say` treats a
line break as a word boundary** — measured, `vector` 0.545 s against `vec\ntor`
0.755 s, identical to `vec tor`. The fragments are spoken as separate words, so the
reader hears `Motio … n` with three other column names interposed.

**Measure the natural width; do not guess it.** Render the document at increasing
widths and diff the cell text against a wide reference:

```bash
for w in 76 80 88 100; do FZF_PREVIEW_COLUMNS=$w ./okuda doc.md --no-color > /tmp/w$w.txt; done
# then compare the cell text of /tmp/w80.txt against a 240-column render
```

**Relabelling the header does not help; shortening the longest cell does.** A real
case: a boundary-conditions table had a natural width of **88**, and at 80 the header
`Direction` shattered. Renaming it to `Flow` — four characters — broke too
(`Flo` / `w`), because the allocation is dominated by the longest cell in the table,
not by the header. Trimming one content cell (*"the row degrades to the stem"* →
*"the stem remains"*) took the whole table from 88 to **76**. Reach for the longest
cell first; treat a header rename as a non-fix.

**And the word count is not a fidelity metric.** Fragmentation *inflates* it: the
same document measured 1,824 words at 40 columns against 1,787 at 82. The ear is
losing content while the count goes up.

### The state of the tree, measured 2026-09-14

**78 of the 111 documents that contain a table have at least one table that wraps at
80 columns** — 104 of 187 tables. A sweep over `playbooks/`, `briefs/`, `debriefs/`,
`decisions/` and `docs/`, comparing each table's rendered row count at 80 columns
against its row count in the source. The worst offenders are the documents *about*
tables: `docs/2026-09-05-palette-page.md` (7 of 8 tables), `docs/tables-monster.md`
(3 of 5), `docs/tables.md` (3 of 10). `playbooks/mermaid-diagrams-playbook.md`
breaks both of its own.

This is outstanding work, not a defect in this playbook: **the rule is new and the
tree predates it.** The remedy is per-table and mechanical — shorten the longest
cell — and the check is one loop.

**Count correctly, or the number is wrong twice.** Two mistakes were made while
measuring this, and both are easy to repeat:

- **A line containing a literal `│` is not a table row.** Prose that *mentions* the
  pipe, and box-drawing art, both fool a naive scanner. A header is a `│`-bearing
  line whose *next* line is a rule (`─`).
- **Body rows wrap too, and they carry no pipes at all** — okuda renders them
  space-aligned, so a header-only scan misses them. That scan reported 43 documents;
  comparing each table's rows against its source gives 78. **The header is the less
  fragile half.**

---

## Link labels are noun phrases

The renderer paints a link as `text url` on one line. A label that ends
in a verb phrase garden-paths against the URL that follows: *"The
silcrow, explained docs/2026-09-04-the-silcrow.md"* reads as the
silcrow doing the explaining — the reversal is accidental and
unignorable. Label links as **noun phrases**: *"The silcrow
explainer docs/2026-09-04-the-silcrow.md"* — the URL then reads as the
address of the thing named, which it is. (Found in `&alpha`,
2026-09-04, by the irony being too clean to ignore.)

## References are text (ADR-031)

The former jump-token menu pattern — authored `%%okuda-rhs:NN%%` wiring,
assigned numbers, spacing rules — is **retired**. Under ADR-031 the
reference is the text: a callsign-shaped token or a local `.md` link in
prose is discovered at render time, and the main document's vectors
(`§11` … `§98`, gold, in the reserved paint) are derived from it —
reading order, unique, no authoring.

**The References section is generated (ADR-047).** The renderer ends
every main-document render with `## References` — the map's own
receipt, one line per destination, reading order, silcrow first. There
is nothing to author: write the reference, the number takes care of
itself, and the section takes care of the list. A hand-written index
omits by omission (measured: nine in the map, six in the polished
hand-written section); generation cannot. The convention is retired for
new documents; the existing hand-written sections stay as history.

**Write the reference; the number takes care of itself.** The rules
that survive:

**Three forms, three behaviours.** Measured 2026-10-07 by running `jumpMapFor`
over the corpus's own shapes, in prose, in a list and in a table cell:

| form | in the jump map | piped text |
|---|---|---|
| `` `playbooks/td-playbook.md` `` — a path | yes | clean |
| `[text](playbooks/td-playbook.md)` — a link | yes | `text playbooks/td-playbook.md` — doubles |
| `` `td-playbook.md` `` — a bare basename | **no** | clean, and inert |

**Write the path.** A link buys nothing the path does not already mint, and it
prints its target twice. A basename is the one form that mints nothing at all —
Ring C is parked by decision (no slash, no intent; resolution-is-search, not
lookup), and **281 backticked basenames** sit silently in the corpus (measured
2026-10-07, generated `index.md` views and naming patterns excluded). Root-level
files (`AGENTS.md`, `DEPENDENCIES.md`, `system.md`) are silent for a different
reason: the ring needs a slash and they have nowhere to put one.

- **References are plain text.** A callsign in prose, a link to a local
  document. No wiring, no tokens, no HTML comments.
- **Numbering is structural, not authored.** Reading order, unique by
  target — the compositor's ordering is the only ordering, and it
  cannot read as ranking because it is not chosen.
- **Cap at 80.** Past `§98` the map stops — the vectors are 12–98 minus
  the doubled-pair class, which is 80 addresses, not 88 (ADR-032's
  amendment). The remedy is editorial: split the document, or clone and
  search.
- **Optimistic.** A reference to a document that does not exist yet
  renders as a vector and fails honestly on actuation. Intentions are
  navigable; the flash says so when they are premature.

## Heuristics, emerging

Add here as they surface from dogfooding. Each entry: the pattern, why it earns its place, the perceptual property it serves.

- **Bold leads in lists.** Table-scan affordance via house style + colour. Calming + leading.
- **Date-first names carry the record's date, not the source's.** The ISO prefix
  is provenance that survives the copy — `mtime` does not, and a frontmatter date
  is invisible to `ls`. So an imported artifact is **landed-dated** (the date it
  entered the silo) and carries `Source:` in the front matter; a copied file is a
  copied filename, and a source date would reproduce another context's timeline
  inside this one. Adopted 2026-10-08; the argument is in
  `docs/2026-10-08-the-filename-is-a-record.md`. Leading (the record's date is the
  date the record was made here).
- **The rule is conditional, not recommended.** A document that has a date carries
  it in the name, and the name agrees with the declared `date:`/`**Date:**`; a
  document with no date carries no prefix, and the absence is honest. "Recommended"
  is a third state that only hides a forgotten date. Enforced by
  `scripts/date-lint.ts` in `just check`; the warrant (four clocks, four invariance
  domains) is `docs/2026-10-08-time-is-a-claim.md`.
- **A preface is three sentences; the evidence is a block.** A `Context` (or any
  lead paragraph) states the warrant — what we assumed, what is wrong, what it
  costs — and stops. The argument is the body; the measurement is its own list or
  table. A paragraph carrying three jobs is a wall by definition. Measured
  2026-10-08: five of six documents opened with a Context of six to nine rendered
  lines. Calming + leading.
- **Render the document before shipping it.** Code is dogfooded; prose was not,
  and two defects shipped in one brief on 2026-10-08 because nobody opened it — a
  hard-wrapped `Context` that rendered as an eight-line wall, and strong spans that
  failed to parse (`**Date:**/frontmatter` prints its asterisks). Open every
  document once before it lands. Leading.
- **Loose lists.** Discrete blocks, reduced scan tension. Calming.
- **Hash headers only.** Unambiguous structure, LCARS-tab rendering. Calming.
- **Front matter elided.** Provenance is not content. Calming.
- **Vertical-pipe blockquote.** Pull-aside signal — worth remembering, not in the flow. Leading (sets the block apart).
- **Short paragraphs — no walls of text.** One move of the argument per
  paragraph, split at the natural seams. The justification is procedural: the FO
  verdict must be informed, and a wall forces a blind exit — a surrender, not a
  judgement. Calming + leading. Dogfooded 2026-09-10: splitting the walls in the
  use-vs-mention note gained the scan.
  - **The split caveat.** Breaks can harm three ways: the *severed argument* (the
    seam destroys the inferential chain), the *false topic sentence* (an arbitrary
    break manufactures a fake one, and the scanned document lies), and the
    *staccato chop* (split to list-granularity and you've built a worse list).
    Where to split is editorial judgement, not a measurable.
  - **The boundary.** The gate is on the house register — documents written to be
    consulted. Clips are preserved as-clipped and literature is exempt: we FO
    walls we wrote; we do not reformat the world.
  - **The Saramago Barrier.** A gate, not a loophole: a slab is admissible only on
    demonstrated mastery, where the wall is the instrument rather than the
    failure. The burden sits with the proposer — below the barrier a slab is
    decorated Stuff, above it the slab is the Thing.
  - **In reserve, not decided.** A hard para-length rule. The only threshold with
    a perceptual warrant is glass-bound: a paragraph taller than the glass breaks
    the glance-confirm. Hold until the dogfood shows it; a line-count threshold
    would be benchmaxxing prose. The meter that would show it exists:
    `just prose-check` reports the tallest units by rendered height (the
    renderer's own wrapper, so the number is the render's) and any markdown
    emphasis that survived the render. The **wall** reading never gates —
    paragraph length is editorial. The **leak** reading does: a raw `**` reaching
    the reader is a failure, not a taste, so `--strict-leaks` runs in `just check`
    as a ratchet at zero.
- **Colons over em-dashes.** Prefer the colon; it is the house's native connective
  and it declares the relationship: *this, and here is what it means* — the reader
  predicts expansion before reading it. The em-dash is context-dependent
  punctuation (parenthetical? connective? a break?) and context-dependence is
  stress, by the hash-header rule's own logic.
  - **The boundary.** The colon misreads in exactly two shapes — paired
    parentheticals (*the prose tier — design notes, clips — and…*) and before
    conjunctions (*history — but it converges*) — where the dash is doing
    connective work a colon cannot. There the dash survives. Found in the
    2026-09-10 dash-to-colon sweep on the use-vs-mention note: four misreads, four
    dashes restored, the rest of the conversions kept. Calming.
- **Mermaid diagrams must fit the medium.** The binary renders ASCII art into a character grid; a wide `flowchart LR` with long labels overflows and degrades to a "too wide" notice plus source. Prefer `flowchart TD`, short node labels, short edge labels — the diagram earns its place only as art, not as a fenced slab of source. (Found persisting the okuda-stack riff doc: the LR version degraded; the TD version rendered.)
- **Reflow prose, never fences.** When reflowing soft returns in a doc (joining
  single `\n` to spaces so prose wraps to width), **skip fenced code blocks** —
  fences and mermaid blocks are verbatim, load-bearing input. The renderer already
  treats fences as verbatim (`src/wrap.ts`); a *manual* doc-edit that reflows the
  whole file sweeps the fence into the reflow.
  - **The signature failure.** A mermaid `flowchart` with each edge on its own line
    becomes one space-joined line, `mermaid-to-md` cannot parse it, and the ASCII
    diagram degrades to a boxed echo of the source. Found in `docs/showcase.md`: a
    "reflowed soft returns" sweep collapsed the six-line mermaid fence; the diagram
    silently disappeared, and it was only noticed weeks later when someone ran
    `just showcase`. **The fence is not prose.**
- **Jump-token spacing — RETIRED 2026-09-12.** The spaced double-tap form (`11, 22, 33`) is dead: [11] joined the ADR-032 actuator pocket and 44–88 were already reserved, so the pattern cannot express even a three-item menu (ADR-021 amendment). Sequential numbering from 12 is the one form — machine-generated menus renumber automatically, and the anti-precedence motive survives as top-to-bottom order, which is structural, not semantic.
