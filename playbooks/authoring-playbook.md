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

**43 of 250 documents in the silo have a table header that breaks at 80 columns.**
A sweep over `playbooks/`, `briefs/`, `debriefs/`, `decisions/` and `docs/`,
comparing header cells at 80 against a 240-column reference. The worst offenders
are the documents *about* tables: `docs/tables-monster.md` loses all 23 of its
header cells, `docs/tables.md` loses 3 of 31, and `docs/2026-08-28-brief-state-glyph-vocabulary.md`
loses all 18. `playbooks/registry-playbook.md` and `playbooks/playbooks-playbook.md`
lose 4 each.

This is outstanding work, not a defect in this playbook: **the rule is new and the
tree predates it.** The remedy is per-table and mechanical — shorten the longest
cell — and the check is one loop. It is recorded here so the next author inherits
the number rather than rediscovering the problem.

**A caution on measuring it.** A line containing a literal `│` is not a table row:
prose that *mentions* the pipe character, and box-drawing art, both fool a naive
scanner. Count only a `│`-bearing line whose next line is a rule (`─`), which is how
okuda marks a header. A sweep without that filter reported 46 documents; the honest
number is 43.

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

**Write the reference; the number takes care of itself.** The rules
that survive:

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
- **Loose lists.** Discrete blocks, reduced scan tension. Calming.
- **Hash headers only.** Unambiguous structure, LCARS-tab rendering. Calming.
- **Front matter elided.** Provenance is not content. Calming.
- **Vertical-pipe blockquote.** Pull-aside signal — worth remembering, not in the flow. Leading (sets the block apart).
- **Short paragraphs — no walls of text.** One move of the argument per
  paragraph, split at the natural seams. The justification is procedural,
  not cosmetic: **the FO verdict must be informed, and a wall makes an
  informed verdict impossible.** A wall forces a blind exit; a blind exit
  is a surrender, not a judgement. The paragraph is the unit of inspection,
  and an uninspectable unit denies the verdict its evidence. The target is
  *excessive* length in the house register: walls get FO'd on presentation,
  which is legitimate — it's our silo, and the door is held open for
  readers, not for walls. Confirmed by dogfood: the 2026-09-10 readability
  pass on the use-vs-mention note split its walls and the doc gained the
  scan. Calming + leading.
  - **The split caveat.** Bunging in breaks can do more harm than good,
    three ways: the *severed argument* (fragments read as separate claims;
    the seam destroys the inferential chain), the *false topic sentence*
    (a break says "a new move starts here" — arbitrary breaks manufacture
    fake topic sentences, and the scanned document lies), and the *staccato
    chop* (split to list-granularity and you've built a worse list instead
    of a better paragraph). Where to split is editorial judgement, not a
    measurable — the reflow rule is the precedent.
  - **The boundary.** The gate is on the house register: documents written
    to be consulted. Clips are preserved as-clipped, and literature is
    exempt — we FO walls we wrote; we do not reformat the world.
  - **The Saramago Barrier.** The exemption is a gate, not a loophole. A
    slab is admissible only if its author clears the barrier: demonstrated
    mastery where the wall is the instrument, not the failure (in
    *Blindness* the unpunctuated flow enacts its subject; every harm-mode
    bounces). The burden of proof sits with the proposer of the slabby
    document — if you think you're up to José's level, try it on. Below
    the barrier, a slab is decorated Stuff; above it, the slab is the
    Thing.
  - **In reserve, not decided.** A hard para-length rule. The only
    threshold that would carry a perceptual justification is glass-bound:
    a paragraph taller than the glass breaks the glance-confirm, because
    start and end cannot be seen together. Hold until the dogfood shows
    it; a line-count threshold would be benchmaxxing prose (the measurable
    proxy over the real property).
- **Colons over em-dashes.** Prefer the colon; it is the house's native connective and it declares the relationship: *this, and here is what it means* — the reader predicts expansion before reading it. The em-dash is context-dependent punctuation (parenthetical? connective? a break?) and context-dependence is stress, by the hash-header rule's own logic. The boundary, learned the day the rule was written: the colon misreads in exactly two shapes — paired parentheticals (*the prose tier — design notes, clips — and…*) and before conjunctions (*history — but it converges*) — where the dash is doing connective work a colon cannot. There the dash survives. Found in the 2026-09-10 mechanical dash-to-colon sweep on the use-vs-mention note: four misreads, four dashes restored, the rest of the conversions kept. Calming.
- **Mermaid diagrams must fit the medium.** The binary renders ASCII art into a character grid; a wide `flowchart LR` with long labels overflows and degrades to a "too wide" notice plus source. Prefer `flowchart TD`, short node labels, short edge labels — the diagram earns its place only as art, not as a fenced slab of source. (Found persisting the okuda-stack riff doc: the LR version degraded; the TD version rendered.)
- **Reflow prose, never fences.** When reflowing soft returns in a doc (joining single `\n` to spaces so prose wraps to width), **skip fenced code blocks** — ``` ... ``` and mermaid fences are verbatim, load-bearing input. The renderer already treats fences as verbatim (`src/wrap.ts`, commit 24c50ff), but a *manual* doc-edit that reflows the whole file sweeps the fence into the reflow and collapses multi-line source onto one line. The signature failure: a mermaid `flowchart` with each edge on its own line becomes one space-joined line, `mermaid-to-md` can't parse it, and the ASCII diagram degrades to a boxed echo of the source. Found in `docs/showcase.md`: commit 24c50ff's "reflowed soft returns in showcase.md" collapsed the six-line mermaid fence; the diagram silently disappeared and was only noticed when someone ran `just showcase` weeks later. **The fence is not prose. Reflow stops at ``` .**
- **Jump-token spacing — RETIRED 2026-09-12.** The spaced double-tap form (`11, 22, 33`) is dead: [11] joined the ADR-032 actuator pocket and 44–88 were already reserved, so the pattern cannot express even a three-item menu (ADR-021 amendment). Sequential numbering from 12 is the one form — machine-generated menus renumber automatically, and the anti-precedence motive survives as top-to-bottom order, which is structural, not semantic.
