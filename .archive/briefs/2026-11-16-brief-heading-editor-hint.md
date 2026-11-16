---
type: Brief
callsign: BRF-HEADING-EDITOR-HINT
---

# Brief: The heading hint — `88` opens a markdown file at the section you're reading

**Date:** 2026-11-16
**Status:** Done
**Warrant:** operator call, 2026-11-16 — smoke tested in-session before writing

---

## Context

`88` on a markdown file opens the editor at line 1. `BRF-CODE-EDITOR-HINT` closes that gap for code files (1:1 render/source map, `scroll - 2`) and refuses markdown because wrapped prose has no constant offset — deriving a line would need the map `ADR-LINE-IS-PROSE-078` measured and refused. A smoke test on 2026-11-16 found a third case: markdown headings are structurally marked in **both** spaces, so the Nth rendered heading is the Nth source heading exactly. No map, no authored coordinate, no fuzzy match on prose fragments.

## Objective

`88` on a markdown file opens the editor at the source line of the heading whose section holds the viewport's middle row.

## Evidence

**Ordinal correspondence — smoke test, 2026-11-16.** Six documents × four widths (60/80/100/120), grouped rendered headings vs source `^#{1,6} ` headings:

| document | src / rendered | counts match | text match |
| :--- | ---: | :---: | :---: |
| `AGENTS.md` | 6 / 7 | 4/4 widths | exact |
| `decisions/078-the-line-is-prose.md` | 7 / 8 | 4/4 | exact |
| `briefs/2026-11-12-brief-editor-hint.md` | 13 / 14 | 4/4 | exact |
| `docs/style-guide.md` | 14 / 15 | 4/4 | exact |
| `system.md` | 7 / 8 | 4/4 | exact |
| `playbooks/playbooks-playbook.md` | 11 / 12 | 4/4 | exact |

Every real heading resolves to its own source line at every width. Every viewport position has a frame heading; the ~10–15% that resolve to the synthetic `References` are the document tail.

**The rejected alternative — prose anchor.** Take the viewport-middle line's text and find it in the source. On a 60-paragraph ground-truth fixture: **1/9 exact (11%), 8/9 far misses**. The anchor lands on wrapped tails (`"thicket quartz."`) whose words recur, so the match jumps to the first occurrence. Headings are the one content type that does not have this failure.

**Three structural signatures, not one:**

| signature | source | render | why it matters |
| :--- | :--- | :--- | :--- |
| hash prefix | `^#{1,6} ` | badge `#`×level | identifies a heading in each space |
| right-edge chip | — | `█` at line end | excludes a table row whose first cell is `#` (`briefs/2026-10-16-brief-search-row.md:40` renders `# │ Field │ Cells │ Role`) |
| wrap grouping | — | badge repainted on every continuation (`src/render.ts:1267-1270`) | N consecutive badge rows are **one** heading; `headingLines()` alone over-counts |
| fence exclusion | `fenceRanges`/`inFence` (`src/vectors.ts:157,175`, private) | renderer already excludes fenced headings | a shell `# comment` in a fence is not a source heading (`docs/2026-11-14-osc-scripts.md:8`) |

**The synthetic receipt.** `referencesSection` returns `""` for an empty map (`src/vectors.ts:410`), `appendReferences` suppresses the section when the final section covers every destination (`src/vectors.ts:504`), and when present the label is always `## References` (`src/vectors.ts:420`). Source headings are therefore **S or S+1** rendered headings, with the extra one last. Verified: 581 documents at delta 1, 120 at delta 0 under a fence-aware scan. Four documents (`decisions/TEMPLATE.md`, `docs/ssh-and-gemini.md`, `docs/2026-10-08-ai-human-development-workflow-06.md`, `.archive/briefs/2026-09-30-brief-fence-discipline.md`) disagreed under the probe's simplified fence parser and must be re-run against the real helper before this brief is built.

**Destination grammar.** `zed --help` (2026-11-16) confirms `path:line:column`. The other editor shapes are already specified by `BRF-CODE-EDITOR-HINT`.

## Scope

**In:** `88` on a markdown file only; enumerate source headings with a fence-aware `^#{1,6} ` scan; group rendered headings by badge + chip; require `rendered − source ∈ {0, 1}`; drop the last rendered heading when the delta is 1; resolve the viewport's middle row to its frame heading; forward that heading's source line as the `hint` already specified by `BRF-CODE-EDITOR-HINT`; the tail fallback; tests; the `docs/keymap.md` row.

**Out, deliberately:**

- **Code files** — `BRF-CODE-EDITOR-HINT`'s `scroll - 2` is unchanged. Same `hint` parameter, different derivation.
- **The prose anchor** — measured at 11% and rejected above.
- **An authored `:NNN`** — prose, not a coordinate (`ADR-LINE-IS-PROSE-078`, unamended).
- **A line map in `vectors.ts`** — nothing is stored; the ordinal is computed at the keypress.
- **A custom editor** — Zed / `$EDITOR` already accepts the hint.
- **`§` (the jump) and `99` (clone)** — unchanged.
- **`AGENTS.md`** — no clause change. The line is derived from the glass's structure, not authored on the page.

## Preconditions

- [ ] `editArgs` accepts an optional `hint: { line: number } | null` (`BRF-CODE-EDITOR-HINT` Phase 1). Verify, do not assume. If that brief has not landed, this brief lands the shared plumbing and `BRF-CODE-EDITOR-HINT` consumes it — one signature, not two.
- [ ] `fenceRanges` / `inFence` are exported from `src/vectors.ts` (currently private at `:157`/`:175`) or an equivalent fence-aware scan is lifted into a shared module. The four probe-disagreeing documents above are the acceptance fixture.
- [ ] A rendered heading is distinguishable from a `#`-celled table row by the right-edge chip. A test pins both cases.
- [ ] Consecutive badge rows group into one logical heading. A test at width 60 pins a wrapped heading.

## Work Plan

1. [ ] Export the fence helpers; add a `sourceHeadingLines(file)` that returns 1-based lines of `^#{1,6} ` outside fences, in order.
2. [ ] Add `renderedHeadings(lines)` to `src/frames.ts` (or a sibling): group runs of `^#{1,6} ` rows carrying an edge chip into logical headings; return their start indices and text. Keep `headingLines()` unchanged — `§` navigation relies on its current shape.
3. [ ] Add `headingSourceLine(file, renderedLines, scroll, height)`: compute source and rendered heading lists; require `delta ∈ {0, 1}`; if 1, drop the last rendered heading; find the frame heading containing `scroll + (height >> 1)`; return its source line. On delta outside `{0, 1}` or no frame heading, return `null` — never guess.
4. [ ] Wire into `edit()` (`src/tui.ts:940`): for `!isWholeFileFence(currentFile)`, pass the hint from step 3; for code files, keep `BRF-CODE-EDITOR-HINT`'s offset. Both degrade to plain path when the hint is `null` or the editor is unknown.
5. [ ] Tail fallback: when the frame heading is the synthetic `References`, forward the **last real source heading's** line. It is the section the references belong to.
6. [ ] Tests: delta 0 and 1; the four fence documents; a wrapped heading at width 60; the `#`-celled table row at `briefs/2026-10-16-brief-search-row.md:40`; a document with its own real `## References`; no headings → `null`; argv shape for each editor; `§`/`99` unchanged.
7. [ ] `docs/keymap.md:45` gains "for markdown files, at the heading you're reading"; `tests/keymap-doc.test.ts` pins it.
8. [ ] `just reg-sync-fix`; reviewer checks the derived index entry.

## Acceptance Criteria

1. `just check` green, including the keymap referee.
2. For a markdown file, the `hint` line is the source line of the heading whose frame holds the viewport middle — asserted against a fixed fixture at widths 60/80/100/120.
3. For a code file, the argv is byte-identical to `BRF-CODE-EDITOR-HINT`'s — a test pins the comparison.
4. `rendered − source` is 0 or 1 for every document in the corpus; a delta outside that range returns `null` and flashes nothing unusual.
5. The synthetic `References` is excluded by the delta, **never by name** — a document with its own real `## References` still maps every heading correctly.
6. The tail resolves to the last real heading, never to line 1 and never to a synthetic line.
7. No authored coordinate crosses the seam; no `AGENTS.md` change; `ADR-LINE-IS-PROSE-078` unamended.
8. `§` and `99` behaviour is unchanged — no test in `tests/vectors.test.ts` moves.

## Notes

- **The hint is live, not authored.** It is correct at the keypress and gone the moment after. This is the same exception `ADR-COMPOSE-DONT-BUILD-091` already grants the scroll-position hint: a viewer-side actuator enhancement, not an editor-side brief.
- **Silent, always.** No flash names the line. The flash says "editing: file.md (zed)" — unchanged.
- **Nothing is stored.** The ordinal is computed from two lists held for one call. `ADR-LINE-IS-PROSE-078`'s objection was a *copy of a fact* that rots; there is no copy here.
- **The chip is load-bearing.** Drop the chip test and a table row becomes a heading. Drop the fence test and a shell comment becomes one. Both failure modes were measured, not imagined.
- **Probes are in `tmp/`**, gitignored: `heading-anchor-probe.ts`, `heading-anchor-probe2.ts`, `heading-ordinal-probe.ts`, `anchor-groundtruth.ts`, `heading-delta-final.ts`. They are evidence, not deliverables; the acceptance tests are the durable form.
- **Measured at delivery (2026-11-16):** 706 documents × a width of 80 — delta 0 in 120, delta 1 in 582, delta outside `{0,1}` in **4** (`decisions/TEMPLATE.md`, `docs/ssh-and-gemini.md`, `docs/2026-10-08-ai-human-development-workflow-06.md`, `.archive/briefs/2026-09-30-brief-fence-discipline.md`). In all four the source holds headings inside a fence that the renderer still paints as headings — the two subsystems disagree about what is a fence. AC4's guard does its job: those documents return `null`, so `88` opens at the top, today's behaviour, never at a guessed line. Closing the renderer/`fenceRanges` divergence belongs to a separate brief; this one refuses rather than guesses.

## Related

- `briefs/2026-11-12-brief-editor-hint.md` — `BRF-CODE-EDITOR-HINT`, the code-file sibling; shared `editArgs` hint
- `decisions/091-compose-dont-build.md` — `ADR-COMPOSE-DONT-BUILD-091`, amended 2026-11-16 to record this second viewer-side actuator enhancement
- `decisions/078-the-line-is-prose.md` — `ADR-LINE-IS-PROSE-078`, unamended; no authored coordinate and no map
- `src/vectors.ts` — `referencesSection` (`:409`), `appendReferences` (`:491`), `fenceRanges` (`:157`)
- `src/frames.ts` — `headingLines` (`:26`), `frameBounds` (`:36`)
- `src/tui.ts:940` — `edit()`, where the hint joins `currentFile`
