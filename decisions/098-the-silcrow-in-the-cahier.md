---
type: ADR
callsign: ADR-SILCROW-IN-THE-CAHIER-098
date: 2026-11-25
---

# Decision: The cahier's silcrow is `#`, and it takes no keyboard actuator

**Date:** 2026-11-25
**Status:** Accepted
**Enforced by:** three existing checks in `scripts/html-package-verify.ts`
(`just html-verify`): *an inline silcrow is not a link*; *a bare silcrow stays
prose*; *a panel's close control uses an unmatched fragment*. The decision below
is what those three were already asserting; what this ADR adds is the reason, so
the next reader does not re-open it.

## Context

The terminal's silcrow is a genuine instrument: `§` marks a dereference, `12`–`98`
are local anchors, and pressing the digits jumps. It works, and it is used
constantly. The question raised 2026-11-25 was whether the cahier should carry it —
including *"implementing the number actuators via javascript."*

Three findings decided it, and all three were already in the tree.

**The cahier was designed against exactly this.** `docs/2026-11-05-the-cahier.md:45`:

> **A document for an outsider.** The terminal is a silo instrument: it assumes you
> know what `§27` is and can press `12`. A cahier has to earn its reader from its
> own statements, which is why the receipts carry titles and the chrome carries the
> callsign.

**The silcrow is already in the cahier, spelled `#`.** A receipt's `§27` is a link
to its panel (`scripts/html-package.ts:674`, `<a class="receipt" href="#ref-27">`),
and a panel is addressable from outside the file — the guarantee table's
*Addressable* row: *"`cahier.html#ref-27` opens a specific reference. A blog post can
link to one."* The terminal needs a silcrow because it has no addressable surface;
a browser has URLs, fragments and a cursor.

**A bare `§NN` cannot be resolved, and that is a property of the source.**
`scripts/html-package.ts:333` leaves it as text: in the terminal it is a badge the
renderer paints *after* a reference, and in prose it is a section number. Nothing in
the syntax distinguishes them — `ADR-LINE-IS-PROSE-078`'s boundary again: the
distinction lives in the author's intent.

## Decision

**The cahier does not acquire a keyboard actuator.** The silcrow's function stays in
text and in fragments: a receipt's `§NN` links to its panel, a panel is addressable
as `#ref-NN`, and a bare `§NN` in prose stays prose.

Four reasons, in ascending order of weight:

1. **It needs knowledge that is not on the page.** The keystroke is documented
   nowhere a reader will look.
2. **It takes the digit row globally.** In a browser, digits belong to find-as-you-
   type, to extensions and to assistive technology. That is a tax on every cahier to
   serve a silo habit.
3. **It duplicates a better mechanism.** Find works on *words*; a number actuator
   requires the reader to already know the number.
4. **It dies on paper.** The cahier has a paper rung — `just pdf`, headless
   `--print-to-pdf` (`DEPENDENCIES.md`). A reference prints as visible text and a
   resolvable URL; a key handler prints as nothing. Navigation that exists only in
   JavaScript cannot belong to an artefact whose guarantee is *one file, email it,
   open it on a plane*.

## Alternatives Considered

| Alternative | Why Rejected |
|---|---|
| Two-digit keyboard actuator, terminal-faithful | The four reasons above, and it would be a fourth navigation model beside scroll, in-page links and find — the weakest of the four. |
| Make inline `§NN` a link to a local anchor | The source does not say whether it is an address or a decoration (`:333`). Guessing would turn a section number into a broken link, which is worse than plain text — and it is the failure class the cahier already refuses for references that do not resolve. |
| Do nothing, and say nothing | The three checks already encode the behaviour but not the reason, so the question would return every time someone noticed the terminal's silcrow working well. This ADR is the answer for the second asking. |
| Emit local anchors (`id="s12"`) and let `§12` resolve to `#s12` | **Not refused — deferred on the corpus.** It is a *reference* rather than an actuator: it prints, it can be linked, it needs no knowledge. It waits for documents that actually carry local section addresses, and on an authoring convention that marks one. |

## Consequences

**What became easier:**

- **The question has a written answer**, so the next session does not re-derive it
  from the terminal's behaviour.
- **The cahier keeps three navigation models** rather than four, and every one of
  them survives printing.

**What became harder:**

- **A terminal habit does not travel**, and someone will miss it. That is the
  outsider's price and it is paid deliberately.

**Open, and owned:** local anchors are a real gap — the terminal's `12`–`98` jump
targets have no HTML counterpart at all — but they are an authoring problem before
they are a rendering one. Named here so the next reader sees a deferral with a
reason rather than a hole.

## Related

- `briefs/2026-11-25-brief-cahier-math.md` — the session that raised it
- `docs/2026-11-05-the-cahier.md:45` — the outsider rationale
- `scripts/html-package.ts:333`, `:674` — bare silcrow stays text; receipt silcrow links
- `decisions/078-the-line-is-prose.md` — `ADR-LINE-IS-PROSE-078`, the coordinate this
  applies to a keystroke
- `decisions/096-the-export-identifies-more-maths.md`,
  `decisions/097-the-table-window.md` — the same session's decisions
