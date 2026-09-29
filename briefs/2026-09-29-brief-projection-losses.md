---
type: Brief
callsign: BRF-PROJECTION-LOSSES
date: 2026-09-29
---

# Brief: Projection losses — two surfaces that drop content they mean to keep

**Created:** 2026-09-29
**Status:** Open
**TD:** td-4e1aa2 (epic) — td-e03cd7 the emphasis channel, td-3b3f1b the elision notice
**Lineage:** `docs/2026-09-29-text-streams-and-the-typed-action.md` — the survey that found both, from the operator's question about streams of text against UI operation
**Extends:** `BRF-MERMAID-SOURCE-OMITTED` — the elision notice's *coverage*. The notice itself, its glyph and its wording stay that brief's.

## Objective

Two surfaces in the render path drop content they are meant to keep. Both were found by
measurement while writing the survey above, and neither is a decision anybody made.

- **The emphasis channel is silent under `--no-color`.** `src/ansi.ts` states its own rule in a
  comment — *NO_COLOR strips colour, not attributes* — and `roleBold` obeys it. `roleItalic` and
  `roleBoldItalic` do not. The voice path passes `--no-color` (`justfile:110`), so emphasis written
  as italics is invisible to the ear.
- **The source-elision notice reaches only untitled fences.** `diagramBlock`'s ternary gives a titled
  fence the title *instead of* the notice, so 22 of the silo's 58 diagram fences never state that the
  source is not shown.

## Scope

**In:** the two code paths, their tests, and the records that teach the shipped behaviour.

**Out:**
- **The `⋮` glyph's presence.** It fires on every indicator line by design
  (`BRF-MERMAID-SOURCE-OMITTED`: *a 3-line source and a 25-line source both collapse to one
  indicator*), and `docs/2026-09-19-the-ornament-that-pays-rent.md` measured it as ornament doing a
  job. Unchanged.
- **The notice's wording.** `mermaid source elided` stays exactly as `docs/showcase.md` records it.
- **`roleUnderline`, `bold`, `strike`.** Each has a non-attribute cue that survives: a link renders
  as its text plus its address, a heading keeps its `#` markers, a table keeps its pipes. `bold()` is
  also pinned plain by `tests/ansi-palette.test.ts:134`.
- **The table-cell glyph tear** (`✓[38;` — `docs/2026-09-19-the-ornament-that-pays-rent.md`). A
  separate defect with a separate owner.

## Preconditions

- [x] The working tree is clean at the branch point. **Verified 2026-09-29** — `git status --short`
      printed nothing before `git checkout -b fix/projection-losses`.
- [x] The binary matches HEAD, so a render check measures the code under test.
      **Verified 2026-09-29** — `just orient` read `binary: STALE`; `just build` re-signed, and
      `signature-check: OK — okuda verifies`.
- [x] The gate is green at the branch point. **Verified 2026-09-29** — `just check`: signature-check,
      five registries and facade-lint all OK.
- [x] The defects are measured, not asserted. **Verified 2026-09-29** —
      `tmp/projection-scope-probe.py` carries the emphasis bytes and `tmp/caption-coverage-probe.py`
      the coverage split.

## Work Plan

1. [ ] `src/ansi.ts` — under `none`, `roleItalic` emits SGR 3 and `roleBoldItalic` emits SGR 1;3,
       each closed with a full reset the way `roleBold` closes.
2. [ ] `tests/ansi-palette.test.ts` — assert the none-mode bytes for both, beside the existing
       `roleBold` assertions.
3. [ ] `src/render.ts` — `diagramBlock` emits the notice on the titled branch as well.
4. [ ] `tests/table-diagram.test.ts` — assert a titled fence carries both its title and the notice,
       and that the untitled case stays byte-identical to today's line.
5. [ ] `docs/showcase.md` — record the coverage where it teaches the indicator line.
6. [ ] `briefs/2026-09-01-brief-mermaid-source-omitted.md` — amend: extend its doctrine to every
       fence, and name what stays its own.
7. [ ] `docs/2026-09-29-text-streams-and-the-typed-action.md` — correct the claim that a reader
       cannot tell a titled diagram from an untitled one. The caption text does differ; the
       unrecorded thing is the coverage.
8. [ ] `just test` and `just check`.

## Acceptance Criteria

- **The emphasis survives the colourless path.** A fixture carrying `*italic*` and `***both***`
  renders one italic attribute and one bold-italic attribute under `--no-color`. Today it renders
  zero and zero.
- **The notice reaches every fence.** Every indicator line in a silo-wide render states the elision,
  titled or not: 58 of 58, against 36 of 58 today.
- **The untitled case is unchanged.** Its line is byte-identical to today's, so the 36 fences that
  already carry the notice keep their exact bytes.
- **The caption fits the pane.** The longest title in the silo is 53 characters; with the notice
  appended the caption line measures 73 columns against a 78-column budget at width 80.
- **The suite is green.** `just test` and `just check` both pass.

## Notes

**The fork, and why it lives in the brief rather than an ADR.** Three options were live: give
untitled fences no indicator line at all, which makes the glyph informative and drops 36 lines of
machine-speak; put the notice on every fence; or reduce the untitled line to a bare glyph. The
operator chose the second. It extends `BRF-MERMAID-SOURCE-OMITTED`'s doctrine — *render the fact of
the source* — to the fences a ternary excluded, and it reverses nothing recorded, because
`docs/showcase.md`'s position (the indicator is a renderer statement, not a pointer) is preserved.
That follows the precedent the source-omitted brief set for itself: *a refinement of a shipped
surface, not the reversal of a recorded decision.* No ADR is raised. A reader who disagrees has the
option space above to reverse.

**The notice clause is shorter in the titled case, and the reason is measured.** The caption line is
never wrapped, so the notice spends the author's title budget. `mermaid source elided` is 21
characters, and appending it to the longest existing title measures 81 columns — one over the pane.
`source elided` is 13 and measures 73. The two clauses differ in length by design, and the binding
constraint is the title, not the notice.

**One detector is not enough for the coverage number.** A count of `⋮`-led lines reads 67 where the
fences number 58, because 9 of them are a document's own parked ellipsis. The notice side agrees
exactly — 36 notice lines against 36 untitled fences — so the titled side is taken from the
structural scan (22) rather than the render count (31). `tmp/caption-coverage-probe.py` prints both
and names the gap.

**The survey's own claim was too strong, and this brief corrects it.** The survey said the indicator
"distinguishes nothing by itself" and that a reader "cannot tell a titled diagram from an untitled
one". The glyph is constant by design, and the caption text does differ. Work plan step 7 corrects
the document rather than leaving the stronger claim standing.

## Related

- `docs/2026-09-29-text-streams-and-the-typed-action.md` — the survey that found both defects
- `briefs/2026-09-01-brief-mermaid-source-omitted.md` — the notice's decision, extended here
- `docs/showcase.md` — the shipped behaviour, updated here
- `docs/2026-09-19-the-ornament-that-pays-rent.md` — the `⋮` measurement, and the table-cell tear
- `docs/2026-09-15-the-search-panel-speech-first.md` — the objection that the notice spends channel
- `src/ansi.ts`, `src/render.ts` — the two code paths
- `tests/ansi-palette.test.ts`, `tests/table-diagram.test.ts` — the two suites
