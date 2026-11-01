---
type: Debrief
callsign: DBF-DEREFERENCE-MARK
date: 2026-11-01
tags: [tui, chrome, silcrow, decisions]
agent: pi (ses_099037)
environment: local
briefs: []
---

# Debrief: The mark that was already decided

**Date:** 2026-11-01
**Status:** Done — 974 tests, `just check` rc=0, `just build` re-signed.
`ADR-DEREFERENCE-MARK-075` went from *"the mark is not yet built"* to enforced by
four tests.

## What was asked

A rubricated silcrow in the chrome, beside the file name, so one glance down
resolves *where am I* one way or the other. The requirement was not new: it is
`decisions/075-the-dereference-mark.md`, accepted 2026-10-28, with the operator's
own phrasing quoted in its Context and an open task behind it. Four days of a
decided mark, unbuilt.

## What the work actually was

Three edits and four tests. `footerLine` gained one optional painter
(`derefMark`), the composer gained the two cells it costs (`§` plus a space), and
the call site passes it from `backstack.length > 0` — the boolean the ADR
correctly claimed the code already guarantees, since `jumpTo` returns early once
dereferenced. No nesting, no counter, no new state.

The load-bearing half was the tests, because the ADR said of itself:
`Enforced by: nothing — advice`. A `§` without them would have restated that debt
in rose. Four tests, one per constraint the decision set:

- rose `§` prefixing the filename, after the callsign, with the row still filling
  its width exactly;
- no mark and **no reserved slot** on the main document;
- never bold, and the glyph present under a colourless styler;
- present at a narrow width, corner pad intact.

## The correction a test needed

The "no reserved slot" test was first written as *equality with the dereferenced
footer minus the mark*. It failed, correctly: the two cells come out of the
**gap**, not out of the name, so the difference is trailing spaces. The assertion
now says what the decision meant — the identity run ends and the filename begins,
`okuda · docs/audit.md` — and adds that both renders are the same width. A test
that compared strings would have encoded an implementation detail; the one that
compares *meaning* survives a change in the gap arithmetic.

## The numbers

| reading | value |
|---|---|
| tests before / after | 970 → 974 (+4) |
| source files touched | 2 (`src/tui.ts`, `tests/tui.test.ts`) |
| lines | +83 / −10, of which ~60 are the doc comment and the tests |
| briefs written | 0 — the ADR is the brief, and the acceptance criteria were in it |

## What the mark looks like

```
main    Gloam  okuda · SYS-ARCH-OTH-001 · docs/2026-10-30-server-blades-in-space.md  ? help
deref   Gloam  okuda · SYS-ARCH-OTH-001 · § docs/2026-10-30-server-blades-in-space.md  ? help
```

At 72, 44 and 24 columns the composition holds; below the render width the footer
runs long, which is pre-existing and not this mark's doing.

## Ground sensitivity, measured

The report after the mark landed, in the operator's words: informative, and *"the
rubrication looks a bit bright at the moment but … in our Herdr TUI, with the correct
fg/bg colour pair, it looks fine."* That is a percept, so it gets a measurement
rather than agreement — `scripts/contrast.ts` (`just contrast`), the `vector` role
against the grounds the palette already names:

| ground | `vector` § | ink | muted |
|---|---|---|---|
| `#282c34` — Ghostty default | 5.2:1 | 10.5:1 | 1.8:1 |
| `#23272e` — ground deeper | 5.6:1 | 9.3:1 | 2.0:1 |
| `#1b1e24` — deep and dim | 6.2:1 | 7.5:1 | 2.2:1 |
| `#221f1c` — deeper still | 6.1:1 | 10.6:1 | 2.1:1 |
| `#1c1a17` — the floor test | 6.5:1 | 11.2:1 | 2.3:1 |

The rose sits at **half the ink's contrast** (OKLCH L 0.719 against ink's 0.903 on
the default ground), which is the same rung as `strong` and below `heading`. So it is
not bright in luminance; it is **saturated on a loud ground**. The compass here is
already written down: the prose role ships empty because *"the one role whose right
value is relative to a surface okuda cannot see"* (`src/palette.ts:17-20`), and the
ground page's own instruction is that the honest direction for "too bright" is
*downward* because the binding constraint is `muted`, not the ink
(`docs/2026-10-28-the-ground-you-read-on.md`).

**So: no change, and the reason is measured rather than preferred.** The ADR's
alternative table had already refused the quiet version (§ in `muted` is *"a
smudge"*), and darkening the hue would buy calm on `#282c34` while costing the cue on
the three darker grounds. The mark is in band on every ground the palette names; the
difference the operator saw is the glass, which is the host's.

What the observation left behind is a line worth keeping, and it is now in
`conceptual-lexicon.md` under **TFS**: *a theme is a tax when it changes the mapping
from role to meaning, and free when it only changes the ground the roles paint on.*

If the reading ever needs to be re-derivable rather than remembered, `vector` gains a
row in `scripts/contrast.ts`'s role table and `just contrast` prints it per ground —
deferred, because that page is pinned against the script by
`tests/contrast.test.ts` and prose costs nothing.

## The next temptation, named now

The ADR refused a status segment, and it was right: *"a status bar is where a
viewer starts believing it is an IDE."* With *where am I* closed, the next chrome
request should be judged against that line rather than against this mark's
precedent — which is exactly what the ADR's narrow amendment instructs: a future
rose mark must quote the argument, not cite the mark.
