---
type: ADR
callsign: ADR-DEREFERENCE-MARK-075
date: 2026-10-28
---

# Decision: The dereference mark — a bare silcrow in the chrome

**Date:** 2026-10-28
**Status:** Accepted (**annotated 2026-11-01** — the mark is built; see *Enforced by*)
**Enforced by:** `tests/tui.test.ts` — the four tests under *the dereference mark*
(annotated 2026-11-01): the rose `§` prefixing the filename after the identity
run, no mark and no reserved slot on the main document, the glyph surviving a
colourless styler and never bold, and the mark present at a narrow width with
the corner pad intact. The seam is `footerLine`'s `derefMark` painter — the
absent painter *is* the absent mark — fed from `backstack.length > 0`, the
boolean this decision argued the code already guarantees.

The paragraph this replaces said `nothing — advice`, because the code did not
exist. It does now, and the debt it named is paid rather than restated: the
pre-annotation reading is kept here as the record of how long a decided mark
went unbuilt with an open task behind it (2026-10-28 to 2026-11-01).

## Context

`jumpTo` swaps the live document for a jump target and pushes the previous one onto
`backstack`; `back` pops it. Nothing in the chrome reports which state you are in.
The only signal is **the absence of silcrows** in a dereferenced render — a
*negative* signal, and negative signals fail silently: a main document with no
wiring and a dereferenced document with no wiring are the same screen. That is not
the edge case; with 8 live briefs, 150 archived and 73 decisions cited by number,
it is most documents most of the time.

So the chrome makes the common case ambiguous, and the operator asked for the
smallest thing that fixes it: *a rubricated empty silcrow in the chrome near the
file name.*

Two facts make the proposal well-founded, and both were in the code before the
proposal:

- **The state is provably binary.** `jumpTo` returns early when
  `backstack.length > 0` — *"dereferenced render is clean, nothing to actuate"* — so
  a dereference can never nest. The chrome would report a boolean the code already
  guarantees; a depth counter would be inventing a dimension that cannot occur.
- **The mark's referent is exact.** A silcrow is an address's actuation point; a
  dereferenced render *is* an address that was actuated. A silcrow with no number
  therefore says precisely *you are inside one* — and it does so with an existing
  role rather than a new word.

## Decision

**A bare `§` sits in the footer's identity run, immediately left of the filename,
painted in the `vector` rose, present exactly while the render is dereferenced.**

`silo · callsign · § filename` — and on the main document, nothing: no slot, no
placeholder, no dimmed ghost.

Four constraints, each with a reason:

- **Prefix, not suffix.** A trailing `§` reads as a badge whose number failed to
  render — a *defect* signal. As `§ filename` it reads as a mark on the document.
  Position carries more of this than the glyph does.
- **State, not control.** No bold, no count, no animation, no second channel in the
  footer, and no change to the badge. The mark says *where you are*; the rose says
  *look here*. The moment the footer grows a status segment it has stopped being
  chrome.
- **The glyph carries the state; the colour carries only the glance.** `§` versus
  nothing is the signal and survives a monochrome terminal; the rose is what makes
  it readable at a glance. This is the state-glyph doctrine applied to chrome.
- **TUI only.** The streaming render has no dereference to be inside of.

## The amendment this decision makes, and why it is stated here

`BRF-READING-FRACTION` ruling 2 reserves **rose + bold** for *the control channel,
what is actuable*, and `decisions/062-one-gesture-one-token.md` applies it: the
pending-tap mark is muted *because it is state*.

A rose silcrow therefore crosses a rule written down in this repo. The narrow
amendment: **the rose may carry the ADDRESS channel in chrome, not only the
actuable.** The argument is that the two channels were never really distinct —
the `vector` role is the rubricator's ink, every rose in a document is an address,
and an address is the thing that gets actuated. The rule's purpose was to keep the
loudest channel off mere status; "you are inside an address" is not mere status, it
is the document's own address reported in the document's own glyph.

**The amendment is narrow on purpose:** it licenses this mark and nothing else. It
does not permit rose for fetch state, mode, scroll position, or any other chrome
fact. A future mark painted rose without this argument quoted is a violation, not a
precedent.

## Alternatives Considered

| Alternative | Why Rejected |
|---|---|
| Leave absence as the signal | It works only when the main document has wiring. Most do not, so the signal is missing exactly where it is needed — and a negative signal that fails silently is the class this decision exists to remove. |
| A `muted` silcrow, honouring the ruling as written | Consistent and nearly invisible: `muted` is the rule-and-pipe grey, and a single glyph in a quiet run at that value is a smudge. A mark that has to be hunted is not an orientation cue. |
| Recolour the badge while dereferenced | Spends the badge's identity channel (`badge-bg`/`badge-fg`) on a second meaning, and says *different* without saying *what*. Also fails the glyph-carries-state test. |
| A word — `deref`, `§1`, `target` | A word is a legend the reader must learn; `§` is the glyph they already know from the document they came from. And `§1` invents a depth the code forbids. |
| A status segment in the footer | The footer is chrome; a segment is the first step of a status bar, and a status bar is where a viewer starts believing it is an IDE. |
| Mark the *back* affordance instead ("← §") | Reports the exit rather than the state, and duplicates `u`'s existing affordance. The reader needs to know where they *are*, not how to leave. |

## Consequences

**What became easier:**

- **"Where am I" is answerable at a glance** without counting silcrows, and in the
  monochrome case by the glyph alone.
- **The dereference reads as a *place* rather than a document that happens to lack
  marks.** That is what makes a prose-as-index workflow legible: you can see that
  you are inside an address, not merely that the address has stopped.
- **A negative signal became a positive one**, which is the same repair the state
  vocabulary made for glyphs and the receipt made for references.

**What became harder:**

- **One more conditional in the footer's width math.** The mark occupies a column
  when present; the composer's arithmetic (`footerLine`'s `leftWidth`) must include
  it or the right-hand affordance shifts under the reader when they jump. This is
  the kind of defect that only appears at narrow widths, so the test should assert a
  narrow footer too.
- **An amendment now exists that can be cited badly.** The narrow scope above is the
  guard; it will be enforced by review, and reviewers should ask for the argument,
  not the precedent.

**Constraints this imposes:**

- **Absent on the main document** — no reserved slot, ever. An element's appearance
  reports its condition (`Attributable structure`).
- **Binary, not a count**, while `jumpTo` keeps its single-depth cap. If nesting is
  ever allowed, this mark is wrong and must be revisited in the same change.
- **The rose amendment does not generalise.** Rose in chrome means *address*; any
  other chrome fact needs its own argument.

## Related

- `decisions/062-one-gesture-one-token.md` — the pending-tap mark, whose shape this
  copies (conditional, in the footer, stated as state) and whose ruling this
  narrows.
- `ADR-ADDRESS-NOT-COORDINATE-074` — the address register this mark borrows its
  glyph from.
- `BRF-CITED-JUMP` — the verb whose arrival makes the state worth reporting.
- `ADR-PANE-NOT-CANVAS-069`, `AGENTS.md` (*three owners*) — why the mark is a glyph
  in the render's chrome and not a window title, a tab label, or a status bar.
- Code: `src/tui.ts` (`footerLine`, `backstack`, the `pending` mark's comment).
