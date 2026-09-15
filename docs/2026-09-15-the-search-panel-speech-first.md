---
date: 2026-09-15
kind: design note — a speech-first search panel, and the two economies it rests on
lineage: the reader's proposal (2026-09-15) — drop fzf and own the panel, design the
  search speech-first, and make the result list a jump list on the number vector key
  set; the first requirement is how to say the filter string, the second how to elide
  it from the list. Read against `docs/2026-09-15-tables-for-unsighted-listeners.md`
  (the flattening and the missing re-hear), `docs/2026-09-15-the-cap-is-on-the-wrong-quantity.md`
  (the bound on the wrong quantity), `briefs/2026-09-14-brief-jump-list.md`, ADR-030,
  ADR-032/033/036 (the cue doctrine), `docs/2026-08-20-origin-doc.md:39` (the scope
  exclusion).
status: open — nothing built. Two requirements named, one thesis, one bound, and one
  scope question that needs a decision rather than a slide.
---

# The search panel, speech first

> ◆ The row carries only what neither the filter nor the gesture supplies. The filter
> supplies the elided prefix; the gesture supplies the address. So the filter is
> never recited and the number is never announced — and the panel gets shorter by
> saying less, not by painting less.

## What is proposed

Five parts, and they interlock:

1. **Drop fzf and own the search panel.** The presentation is not ours today.
2. **Design the search and filter process speech first.** The ear is the primary
   sink; the eye receives a projection of it, not the other way round.
3. **The list becomes a jump list**, actuated by the number vector key set — the
   same 12–98 the main document already uses for its silcrows.
4. **Requirement 1 — how to say the search/filter string.**
5. **Requirement 2 — how to elide the filter string from the list.**

This note takes the requirements in the order given, because the order is right: the
elision cannot be designed until we know what the filter *is* to the reader.

## What this reverses, and what it does not

**It reverses a mechanism, not a decision.** ADR-030 decided that *plain `gloam` is
the live search* — no flag, no mode, "flags negotiate; defaults decide". That decision
survives untouched. What goes is `--bind=change:reload`, which is fzf's mechanism.
Because it is a reversal, the palimpsest protocol applies
(`playbooks/decisions-playbook.md`): the old ADR keeps its title and its superseded
sections and gains a successor. And ADR-030's doctrine is a *constraint* on whatever
replaces it — the new panel must still be the default, with no mode to be in.

**And the seam already exists.** ADR-030 decision 2 made `--entries <query>` a
headless printer of the ranked entry stream. The model is therefore already separate
from the view: **fzf is the view, `--entries` is the model.** Dropping fzf is
replacing a view. The search, the ranking, the merge and the path predicates are not
in scope and do not need rewriting.

### Why fzf specifically has to go — measured

The reason is not taste. fzf matches the text it *displays*, so its presentation is
its match surface, and the two cannot be designed independently. Verified on fzf
0.73.1 against a three-field entry (`fullpath␉residual␉snippet`):

| Probe | Result |
| --- | --- |
| `--with-nth=2,3`, term in field 1 only | **no match** |
| `--nth=1,3`, the same query | **no match** |
| `--with-nth=2,3`, term in field 2 | match |
| `--accept-nth=1` | the whole path |

So eliding the display silently narrows the search. `--nth` does not rescue the
undisplayed field either — it indexes the *transformed* fields, so it cannot reach
past the transform. Only acceptance is unaffected. For a tool whose next move is to
show *less* of the name while matching *more* of it, that is a hard stop. (Full
detail in the project memory: *fzf matches the text it displays*.)

## The two economies

This is the thesis, and everything below is a consequence of it.

| The row carries | Supplied by | So it is |
| --- | --- | --- |
| the prefix | the filter | elided from the row |
| the address | the gesture | never announced |
| the residual | nothing | shown, and spoken |

Both economies are the same move: **subtract what the context already carries.**
Today's row repeats the path back at the reader and paints an amber match they cannot
hear; the proposal's row says only the part that is new.

## Requirement 1 — how to say the filter string

### The grammar is eye-first

Every sigil is punctuation, and a screen reader spends a token on each one. Priced
against the meaning it carries:

| Filter | Chars | Spoken | Meaning | Tax |
| --- | --- | --- | --- | --- |
| `briefs/ @2026-09 !draft` | 23 | 12 | 6 words | 2.0× |
| `@2026-09-14` | 11 | 11 | 5 words | 2.2× |
| `briefs/ @2026-09` | 16 | 10 | 3 words | 3.3× |

`briefs/ @2026-09` costs ten spoken tokens to express three words. The sigils are the
expensive part: `@`, `/`, `!` are one token each, and the date's six digits are six
more. The grammar is compact for the eye and verbose for the ear, and it was designed
by the eye.

### The answer is not to say it

◆ Echoing the filter back to the reader is the same tautology as a diagram captioned
`mermaid source elided`: it spends the channel on something the reader already has.
They typed it, and it is on the screen. The house rule already says this — *"a
document's text is never spoken; a report on the reader's own input is state"*
(ADR-032/033/036). The filter is the reader's own input. What earns the channel is a
**report on it**:

- **The count.** One token for the whole filter's effect. `25`.
- **The count's change.** `25 → 5` when a term narrows. Two tokens, and it is the
  only feedback that says a keystroke *did* something.
- **Nothing.** Zero is the most useful report there is, and the one a live search
  most needs.
- **The focused row.** Already the browse loop's business.
- **The pending digit.** `1` held, `12` actuated — the input path's own state.

And the filter itself is **available on demand**, never by default: one gesture reads
it back. That gesture is where the sigils need spoken names — and okuda has the
precedent, because the silcrow is already spoken as *section*. `@` has a name, `/`
has a name, `!` has a name; the reading is a **rendering of the filter**, not a second
grammar. One grammar, two projections — the same relationship a table has to its
flattening.

### Composing it, and the chatter problem

Speech-first does not mean dictation. The reader composes with keystrokes — QWERTY or
a braille chord — and every keystroke's *effect* is audible. Eight keystrokes for
`@2026-09` must not produce eight counts. The cue doctrine already answers this:
**a cue is spoken only if its state still holds; superseded cues are dropped, not
queued.** The count is a superseding cue, so fast typing reports once, and the
reader's tempo is not an input — which is the same rule as *one gesture, one token;
no timeouts in the input path*, applied to the output side for the first time.

## Requirement 2 — how to elide the filter from the list

### What it is worth, measured

Residuals computed by subtracting the run the filter fixed, over the real corpus:

| Filter | rows | path chars | elided | saved | spoken | saved |
| --- | --- | --- | --- | --- | --- | --- |
| `@2026-09` | 99 | 4,049 | 3,356 | 17% | 2,046 | 34% |
| `briefs/ @2026-09` | 25 | 1,061 | 686 | 35% | 512 | 49% |
| `@2026-09-14` | 14 | 578 | 438 | 24% | 289 | 48% |
| `briefs/ @2026-09-14` | 5 | 197 | 107 | 46% | 100 | **65%** |

- **Zero collisions** across all four — no two rows become identical. On this corpus
  the elision is safe, and it is a property to test rather than to assume.
- **The speech saving runs ~1.4× the character saving.** What elides is punctuation
  and digits, and those are the characters a screen reader spends a token on. The
  elision is a better deal for the ear than for the eye — which is the argument for
  doing it first in a speech-first design.

### The three traps

- **Elide by position from the matcher, never by text substitution.** A filter term
  that happens to occur inside a slug would punch a hole in the middle of a name.
  The matcher knows what it consumed; a `replace()` afterwards does not. Same shape
  as the callsign rule: *what the scanner drops must never appear in prose.*
- **The residual leads.** It is both the distinguishing part and the matchable part,
  so it belongs at the left edge — where the reader's eye and the reader's ear both
  start.
- **The row now changes as you type.** ADR-030's picker doctrine was that the
  actionable part must never move; elision shortens it leftward. The reconciliation
  is the rule above, not a hope. And the cost is real and asymmetric: for braille a
  fixed row is muscle memory at a fixed cell position, and a shrinking row must be
  re-read.

## The address is a gesture, not an announcement

The list is a jump list on 12–98, so every row has an address. Announcing it per row
is the most expensive mistake available: 99 rows is 99 numbers, all overhead, all
saying what the row's *position* already said.

So the address follows the same economy as the filter. It is **derived from position
and spoken on the gesture** — the reader types `1` and the list narrows to the 1x
rows; the feedback is the narrowing, not a recitation. The input path already has the
doctrine: *one gesture, one token; `ESC` aborts a pending digit.* Nothing new is
needed — the address simply joins the filter in being supplied by context rather than
by the row.

## The bound

"Say much with little" has two scales, and they are one number.

- **The row** — elide the filter. Measured above.
- **The list** — fit the address space. The grammar can name **80** addresses
  (12–98, less the seven reserved doubled pairs), and `@2026-09` returns **99 rows**.
  The month query alone overruns it.

And the ear's bound is tighter than the grammar's, because it is working memory and
not arithmetic — the same burden Léonie Watson describes when she says a screen
reader "counts on you remembering which row you're in". So the query narrows the list
until it is holdable, and the elision narrows the row until it is the distinguishing
token. `briefs/ @2026-09-14` is the shape that works: five rows, ~20-character
residuals, and each row carrying only what it does not share.

## The scope question, which needs a decision and not a slide

`docs/2026-08-20-origin-doc.md:39` excludes *"Full interactive TUI navigation, mouse
scrolling, or Bubble Tea-style file tree browsing."* `AGENTS.md:18` summarises that as
*"interactive TUIs … explicitly out of scope."*

A search panel with a keystroke grammar, a two-digit jump space and an on-demand
read-back is not a file tree browser and it is not mouse scrolling — but "full
interactive TUI navigation" is close enough that this cannot be settled by argument
about the wording. `src/tui.ts` exists and is large, so the exclusion has already been
bent at least once; how it was bent should be read before it is bent again.

**Taking over the search panel is therefore an ADR-scale decision**, not an
implementation detail. It should be decided on the record, with the exclusion quoted
and the exception stated, before the first line of panel code is written.

## Where I would land

**The requirements are right and their order is right, but requirement 1 is
mis-stated — and correcting it is the whole design.**

"How to say the search/filter string" reads as *what should the filter sound like*.
The answer is that **the filter is never recited**; the panel reports on it. That
collapses requirement 1 from a grammar problem into two much smaller ones: what the
reports are (count, change, nothing, focus, pending digit), and what the sigils are
called when the reader asks for them by hand. Both are cheap, and both are already
governed by rules the silo has written down.

Requirement 2 is then genuinely the harder one, and the measurement says it is worth
doing — 65% fewer spoken tokens on a day query is not a cosmetic saving.

**And I would not start in the TUI.** The two economies can be tested outside it, at
no architectural cost and with no reversal of ADR-030: a script that takes a filter,
prints the residual list, and speaks the count. That is one sitting's work, it uses
`--entries` as it already is, and it answers the only question that matters before the
architecture moves — **does a residual row plus a count actually read better aloud
than the path plus an amber highlight?** If it does, the panel is justified. If it
does not, we have spent an afternoon instead of an ADR.

There is also a reason to prefer the outside-in order that is not about cost: this is
the third defect today in the same shape — the cap counted the wrong quantity, the
caption carried a tautology, the row carries its evidence in colour. All three are a
projection that dropped what the reader needed. Proving the fix outside the panel
proves the *shape* of the fix before we bet a subsystem on it.

## Evidence

- `tmp/query-elision-probe.py` — the elision table, the collision test, the filter's
  spoken tax. Real corpus, five filters.
- `tmp/braille-cost-probe.py` — the render's cost in 40-cell screens, which is what
  makes "speech first" a width question as well as a wording one.
- fzf 0.73.1, probed directly: `--with-nth` narrows the search; `--nth` does not
  rescue it; `--accept-nth=1` restores the path.

## Related

- ADR-030 — the picker is a live search; its mechanism reverses, its decision stands
- `playbooks/decisions-playbook.md` — the palimpsest protocol, for that reversal
- `briefs/2026-09-14-brief-jump-list.md` — the same list, the same 80 addresses
- `briefs/2026-09-07-brief-onion-search-grammar.md` — the filter grammar under discussion
- `docs/2026-09-15-tables-for-unsighted-listeners.md` — the re-hear actuator, the
  same on-demand-read-back shape as the filter's spoken rendering
- `docs/2026-09-15-the-cap-is-on-the-wrong-quantity.md` — the 80, and a cap applied
  to the wrong quantity
- `docs/2026-08-20-origin-doc.md` — the scope exclusion this proposal has to answer
