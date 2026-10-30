---
type: ADR
callsign: ADR-ARRIVAL-AT-LINE-077
date: 2026-10-30
---

# Decision: The arrival at the line — an address includes its coordinate, and the jump is a render

**Date:** 2026-10-30
**Status:** Accepted — amends one clause of `ADR-ADDRESS-NOT-COORDINATE-074`'s
successor work, and ADR-031's *one destination, one silcrow* from the path to the
address
**Enforced by:** `tests/vectors.test.ts` — *two lines of one file are two addresses,
two silcrows*; *the gate is asked about the path, never the coordinate*; *a hundred
addresses in one file is not one destination*. `tests/tui.test.ts` — `scrollForLine`
against a real `renderDocument` frame, the arrival at a `.md` target, and the
end-to-end jump (discovery → map → resolve → render → arrival) with no terminal.

## Context

`ADR-ADDRESS-NOT-COORDINATE-074` made a citation one `doc-ref` token and then
recorded, hours later, that **nothing dereferences it**: Ghostty's `link` regex is
`error.NotImplemented`, so `cmd+click` on a gold citation does nothing. The verb was
filed as `BRF-CITED-JUMP`, and the brief's own first draft got the mechanism wrong —
an editor spawn, an `editArgs` line argument, and a rule for "which citation the
gesture acts on". The operator deleted all three:

> **"no cursors"** · **"our current silcrow is actuated by a two digit number which
> dereferences a document"** · **"if the document is a code file and a line number is
> specified then set the top of the render at that line number"**

The insight that made the brief small: **okuda already renders code files.**
`wrapWholeFile` (`src/render.ts:1164`) turns `okuda src/render.ts` into a single
fence and the fence *is* the file, so a coordinate is entered by a **render that
starts there**, not by a hand-off to something that edits. The editor's verb is
`88`, and it is the editor's.

The offset was measured before it was written down, and the measurement is the
reason this ADR exists at all: rendering a three-line `.ts` file through
`renderDocument` at widths 40, 80 and 100 puts **file line 1 at row 1** — one leading
blank from the fence block — and does so for a file whose own first line is blank.
The streaming render's numbers are not these (it carries the identity header at 0 and
the body from 2); the TUI carries no header (`ADR-020`), so the offsets differ and the
constant is the TUI's.

## Decision

**A jump target is an address, and the address includes its line.** Discovery keeps
`:NN` (and `:NN-MM` as one span) in the target instead of stripping it; the map's
dedupe key is the address — path *and* line — and actuating a code address renders
the path with the cited line at the top of the viewport. A range arrives at its
opening line, because the span is the citation's and the arrival is the reader's. A
`.md` address drops its line at discovery and arrives at the top, because prose wraps
and its rendered rows are the renderer's invention.

Three rules fall out, and they are the durable part:

- **The gate is asked about the path, never the coordinate.** `resolves` (ADR-045) is
  a filesystem question, and `src/vectors.ts:133` is not a filename. One split —
  `parseAddress` (`src/vectors.ts:133`) — so the gate, the actuator and the dedupe
  cannot disagree about what an address is.
- **The dedupe key is the address, and the receipt counts addresses.** Both sites,
  one rule: `buildJumpMap` (the map) and `deriveReferences` (the truncation fact). A
  document of a hundred addresses in one file used to read as *one destination*, and
  the References receipt would then state a fullness that was not there.
- **The offset is measured, and the measurement is a test.** `CODE_FRAME_LEAD`
  (`src/tui.ts:629`) is a claim about the frame; `tests/tui.test.ts` renders a real
  fixture and asserts line 1 is where the constant says. A future vertical elision
  budget would break the mapping, and that test is what would catch it.

## Alternatives Considered

| Alternative | Why Rejected |
|---|---|
| An editor spawn — `vim +N`, `zed path:N`, `code -g path:N` | The brief's first draft. Refused because okuda **renders** code and the editor **edits** it (`88`): a line argument in `editArgs` puts an editor's name and invocation grammar inside the viewer, and makes navigation depend on a thing being installed. |
| OSC 8 with an editor URL scheme (`vscode://file/…:274`) | Works in Ghostty 1.4 today via `link-osc8`, and was refused in `ADR-074`: one scheme per editor, a document unportable between machines, and an environment opinion in the byte stream. It is also the route that *looks* finished the fastest. |
| Keep the path-level dedupe (status quo) | `buildJumpMap`'s `if (seen.has(ref.target)) continue` (`src/vectors.ts:299`) collapses two lines of one file into one silcrow, so the second address has no actuator at all — the feature would land on exactly one line per file. Its mirror defect is in the receipt: counting paths lets a hundred addresses read as one destination. |
| A `.md` line — jump prose to a rendered row | Prose wraps, so a rendered row is the renderer's invention; the line would be a coordinate nobody wrote and nobody can verify. Ignored rather than flashed: a flash about a coordinate no reader will consult is noise. |
| A cursor, or a click target on a citation | There is no cursor in this TUI and nothing to select; both would need the "which citation does the gesture act on" rule the brief deleted. The two-digit number is already the actuator, and the compositor already writes addresses where the wiring goes. |
| Number prose citations so they enter the jump table | Enumeration-order numbers silently retarget when a document reorders, and authored numbers collide with the reserved vector paint (ADR-031). Out of scope in the brief, and the wiring is the compositor's job. |
| A second extension list for the jump | The paint would gild one set and the actuator accept another, which is the half-actable failure `ADR-074` was written to end. The renderer's list is exported (`RE_CITED_PATH`, `src/render.ts:996`) and read through `matchAll`, which clones the regex. |

## Consequences

**What became easier:**

- **The citation resolves where it points.** A wired `src/tui.ts:634` arrives at
  the line that was cited, and a reader verifying a claim stops scrolling. The
  affordance now has its verb.
- **The receipt is honest about what it counts.** Two lines of one file are two rows
  and two silcrows, so the address space fills with destinations rather than with
  files.
- **The paint and the actuator cannot disagree.** One extension list, one split of
  path from line, one arrival function.

**What became harder:**

- **Fine citation spends the address space faster.** A document that cites one file
  at ten lines now spends ten of its eighty addresses where it used to spend one.
  That is the address space doing its job — ten arrivals are ten destinations — but
  a finely cited document will meet the boundary mark (`BRF-BOUNDARY-MARK`) sooner,
  and the editorial answer is the same one that mark already implies.
- **The frame's margin is now a contract.** The jump depends on where the fence
  block puts line 1; that is a renderer detail the TUI never had to care about
  before. It is asserted rather than remembered, which is the whole of the
  mitigation.
- **`scanReferences`' target is no longer a filename.** Every consumer that treats
  it as one must go through `parseAddress`; the two that existed (`resolves`,
  `resolveJumpTarget`) do.

**Constraints this imposes:**

- **No gutter, in any mode** — unchanged from `ADR-074`, and the line is dereferenced
  rather than rendered.
- **Vertical elision stays at none in a code path.** Horizontal elision keeps one row
  per line, so the count is exact; a vertical budget would break the mapping between
  file line and frame row.
- **The line applies to code only.** A `.md` address has no line, at discovery and at
  the actuator, and both say so in one place.
- **A line past EOF clamps to the last screenful.** An address that resolved to a
  blank pane would be a jump that lost the reader.
- **A range is written whole, with its token last** (`path:NN-MM §TT`). The
  interleaved form (`path:1123 §14-1142`) leaves the range's tail as prose, probed
  2026-10-28; the compositor never writes it, and the style guide states the form so
  an author does not.

## Related

- Brief: `briefs/2026-10-28-brief-cited-jump.md` (`BRF-CITED-JUMP`)
- ADR: `ADR-ADDRESS-NOT-COORDINATE-074` — the mark, untouched by this decision
- ADR: `ADR-MAIN-DOCUMENT-031` — *one destination, one silcrow*, now keyed on the
  address
- ADR: `ADR-GLASS-INK-073` — the boundary this stays on the right side of: the
  renderer asserts, the host actuates
- Code: `src/vectors.ts` (`parseAddress`, `scanReferences`, `buildJumpMap`),
  `src/tui.ts` (`scrollForLine`, `arrivalScroll`, `extractJumps`, `jumpTo`),
  `src/render.ts` (`RE_CITED_PATH`, `wrapWholeFile`)
