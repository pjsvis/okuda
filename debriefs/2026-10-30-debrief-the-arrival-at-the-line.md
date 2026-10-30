---
type: Debrief
callsign: DBF-ARRIVAL-AT-LINE
date: 2026-10-30
tags: [navigation, citations, vectors, measurement, decisions]
agent: pi (ses_95331b)
environment: local
briefs: [BRF-CITED-JUMP]
---

# Debrief: The arrival at the line — the brief named the wrong function, and that was the work

**Date:** 2026-10-30
**Status:** Done — 952 tests, `just check` rc=0, one decision landed
(`ADR-ARRIVAL-AT-LINE-077`) and two earlier ones annotated in place. The verb is
built; the compositor still owes the wiring.

## What was asked

`ADR-ADDRESS-NOT-COORDINATE-074` painted a citation as one address and then
recorded that nothing dereferences it — Ghostty's `link` regex is
`error.NotImplemented`, so `cmd+click` on the gold does nothing. `BRF-CITED-JUMP`
carried the repair, amended twice the same day until the operator's spec had
deleted its first draft's editor hand-off and its cursor: **"no cursors"**, the
silcrow is the actuator, and *"if the document is a code file and a line number is
specified then set the top of the render at that line number"*.

The insight the amendment bought is the whole of the design: okuda already renders
code (`wrapWholeFile`), so a coordinate is entered by a render that starts there.
No editor, no gesture, no second process.

## The correction the brief needed

The brief's Scope line says *"`extractJumps` accepts a code target with an optional
line"*, and its Evidence table says the target regex is `/\S+\.md/g` (`src/tui.ts`).
Both true of `extractJumps` — and **`extractJumps` is not what the TUI dereferences
with.** The TUI's jump table is `deriveReferences` → `buildJumpMap`
(`src/tui.ts:870`), and `extractJumps` is the compositor-facing scan used by the
menu scripts. A patch to `extractJumps` alone would have satisfied the brief's
wording and changed nothing on the glass.

So the work happened at both ends, and the discovery end was the load-bearing one:
`scanReferences` stripped the `:NNN` suffix from the target (`ADR-SILCROW-PATHS-045`
§3 called the line *"unclaimed here"*). Keeping it is what makes a **prose**
citation — `src/tui.ts:634` in a sentence — mint an address with a line at all, so
no compositor wiring is needed for the common case.

## The measurement, and why it is a constant

The brief asked for `scrollForLine(lines, n)` and was explicit: *"Assume nothing;
the function is the instrument."* Measured before it was written, through
`renderDocument` on a wrapped three-line `.ts` at widths 40, 80 and 100: **file line
1 is row 1** — one leading blank from the fence block — and the same for a file
whose own first line is blank. The streaming render is a different number (header at
0, body from 2) because the TUI carries no identity header (`ADR-020`).

So `CODE_FRAME_LEAD = 1` (`src/tui.ts:629`) is the claim and `tests/tui.test.ts` is
the instrument that cashes it: a real fixture, a real render, the third line on the
top row. A vertical elision budget would break the mapping, and that test is what
would catch it. A first draft of the test asserted the arrival at height 20 of a
three-line file and failed — correctly: `maxScroll` was 0, so the line *could not*
reach the top without blanking the pane. The clamp was right and the test was
wrong, which is the useful direction for that to go.

## The rule that fell out for free

The brief's item 4, *"one ADDRESS, one silcrow"*, needs the dedupe key changed in
two places — `buildJumpMap` and `deriveReferences`' truncation count. Because the
target now **is** the address, both became right on their own: `seen` is a `Set` of
targets, and `distinct` counts targets. One change, two sites, one rule, and the
second site needed no edit at all — a good sign that the representation was the
decision rather than a symptom of it.

The cost, named in the ADR: a document that cites one file at ten lines now spends
ten of its eighty addresses where it spent one. That is the address space working
(the arrivals really are ten), but finely cited documents will meet the boundary
mark sooner.

## The numbers

| reading | value |
|---|---|
| tests before / after | 939 → 952 (+13) |
| tests the change falsified | 2 (`W2: stripped from the target`, `suffixed and plain share the vector`) |
| source files touched | 3 (`vectors.ts`, `tui.ts`, `render.ts`) |
| new pure functions | 3 (`parseAddress`, `scrollForLine`, `arrivalScroll`) |
| measured constants | 1 (`CODE_FRAME_LEAD`) |
| addresses in a real 2 KB ADR | 12, of which 2 are the same file (`src/render.ts:1164`, `src/render.ts`) — the amended rule, visible |

## Dogfood, headless

`decisions/077-the-arrival-at-the-line.md` cites its own subject matter, so it was
the instrument: derive the map from the document, take `§20`, resolve, render,
arrive.

```
§20 src/tui.ts:634 → scroll 634
  |    export function scrollForLine(lines: string[], fileLine: number, height: number): number {
```

The function's signature on the top row, from a silcrow printed in a document two
directories away. That is the verb.

## What is left, and it is not a defect in this work

- **The compositor must write the address** for a *wired* row to name a
  coordinate (`extractJumps` now accepts one). Nothing in the renderer can
  manufacture wiring; if it turns out to exist nowhere, the finding is about the
  compositor.
- **A wrapped citation still cannot be jumped** — the codespan and mid-token wrap
  defects are filed separately, and a silcrow whose address is split across rows
  has no single span to paint.
- **The interleaved form still fails silently**: `path:1123 §14-1142` gilds the
  first half and leaves ` §14-1142` as prose. Nothing in the renderer can fix a
  compositor that writes two halves in that order; the style guide states the form
  so an author does not.
- **A stale line is now checkable in two keystrokes**, which is new. Two of the
  guide's own examples were stale when this landed (`src/render.ts:274` pointed at
  the end of a function, not the text handler); they were corrected, and the
  guide now says an example shown for its shape is written `path:NN`.

## Related

- `BRF-CITED-JUMP` — the brief this measures
- `ADR-ARRIVAL-AT-LINE-077` — the decision
- `ADR-ADDRESS-NOT-COORDINATE-074` — the mark, untouched
- `ADR-MAIN-DOCUMENT-031`, `ADR-SILCROW-PATHS-045` — annotated in place where the
  line was declared unclaimed
