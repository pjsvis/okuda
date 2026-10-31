---
type: ADR
callsign: ADR-LINE-IS-PROSE-078
date: 2026-10-30
---

# Decision: The line is prose — the address is the path

**Date:** 2026-10-30
**Status:** Accepted — reverses the 2026-10-28 amendment to
`ADR-ADDRESS-NOT-COORDINATE-074`, and supersedes `ADR-ARRIVAL-AT-LINE-077`
entirely. **074's core stands**: no gutter, the citation dereferenced rather than rendered, the extension
list closed and evidenced, no OSC 8.
**Enforced by:** `tests/render.test.ts` — the gold stops at the extension and
`:274` is plain; the closed list still refuses `v1.2:3` and `host:8080`.
`tests/vectors.test.ts` — the span covers the whole mention while the target is the
path, two mentions of one file are one destination, a range is one mention.
`tests/tui.test.ts` — the wired path is a path. `tests/citation-drift.test.ts` — the
finder exports no gateable verdict.
**Advice, not enforced:** the style guide's *name the referent before the address*,
and the token direction it points at. Nothing fails if a citation names nothing.

## Context

The reversal has a one-hour history and a decent amount of ink, so it is worth
setting down in order.

`ADR-074` made a citation an address and refused a gutter. Its first version had no
line in the token; hours later the same day it was **amended** to swallow
`path:NN` into one `doc-ref` token, on the argument that *half an address in the
register and half in plain prose is neither actable nor visibly broken*.
`ADR-077` then built the verb — a jump that renders a code file with the cited line
at the top — and the machinery that made it exact: a path/line split, a dedupe key
of path **and** line, an arrival offset measured against a real frame, and a dogfood
page with a test holding seven addresses still.

The same day, the finder (`scripts/citation-drift.ts`) was built to ask how much of
that drift the corpus actually carries, and the answer killed the premise. Over the
documents the lints walk — **327 path-plus-line mentions**:

| reading | n |
| :--- | ---: |
| name a referent on the same line | 46 |
| — of those, still land on it | **5 (11%)** |
| — moved: the ident is elsewhere in the file | 35 |
| — gone: the file no longer holds it | 6 |
| past EOF / blank line / no such path | 7 / 11 / 55 |
| name nothing a machine can check | 208 |

And the sharper measurement, because it is local: **three citations written in a
single session were stale within the hour**, moved by a comment edit above them. A
line number is a copy of a fact that lives in the file, and code is edited far more
than prose is — so the copy's half-life is *one edit above it*. A corpus of them has
two steady states, drift or thrash, and the operator named both.

## Decision

**The address is the path. A line after it is prose.**

`src/render.ts` is the affordance; `:1396` is the author's hint, plainly outside the
gold. The jump a silcrow actuates takes the reader to the **file** — the top of it —
and reading the code from there is `88` (the editor, which has an index, a symbol
search and a language server that this renderer will never have) or plain reading.
Nothing in the tool promises a row, so nothing in the tool can lie about one.

Three boundaries follow, and they are the durable part — each one is a different
question, which is why one string has three ends:

- **The gold ends at the extension.** The address is the file. A line inside the
  affordance register claims the line is actable, which is the claim being reversed.
- **The span covers the whole mention** (`path:NN`), so the silcrow lands after it
  rather than splitting it. `src/render.ts §12:1396` is worse typography than
  `src/render.ts:1396 §12`, and the difference is one boundary.
- **The target is the path.** The map, the dedupe key, the References receipt and
  the actuator all see a file. `path:NN` and `path` are one destination, which is
  `ADR-031`'s rule, restored.

## The abandonment surface

The palimpsest protocol (`playbooks/decisions-playbook.md`), because this reverses a
landed, tested, documented decision inside one day:

| artifact | class | action |
| :--- | :--- | :--- |
| `RE_CITED_PATH`'s line and range groups (`src/render.ts`) | orphaned | removed; the gold is the path |
| `parseAddress` (`src/vectors.ts`) | orphaned | removed; a `pathOf` strip replaces it (the hint is the only suffix) |
| `scrollForLine`, `arrivalScroll`, `CODE_FRAME_LEAD` (`src/tui.ts`) | orphaned | removed; the arrival is 0 |
| `jumpTo`'s arrival scroll | orphaned | reverted to `present(fetch, next, 0)` |
| the line/range groups in `RE_CODE_PATH`, `RE_MD_PATH` | **shared** | kept for the **span** only, stripped from the target — the W2 rule `ADR-045` stated |
| `docs/2026-10-30-dogfood-cited-jump.md` + `tests/cited-jump-dogfood.test.ts` | orphaned | deleted; the page existed to hold arrivals still |
| `just dogfood-jump` | orphaned | removed |
| `scripts/citation-drift.ts` | **shared** | kept, re-scoped: it reads prose hints now, and its gate went with the promise |
| the finder's `GATED` / `--gate` | orphaned | removed — with no promise there is no defect to gate |
| `RE_CITED_PATH`'s extension list, `extractJumps`, `resolveJumpTarget`, root containment, the silcrow paint, the jump verb | **valid** | unchanged: a citation still dereferences, to a file |

Two records needed more than a cleanup: the amendment's *argument* (074) and the
arrival's *construction* (077) are annotated rather than deleted, because the next
person to propose a coordinate deserves to know it was tried, measured and refused.

## Alternatives Considered

| Alternative | Why Rejected |
|---|---|
| Keep the arrival and live with the drift | The finder's numbers: 11% of checkable hints still land. The only remedy is a fixer pass, which is either a treadmill of re-anchoring (**thrash**) or a slow decay (**drift**) — the two steady states the corpus would have, and neither is a product. |
| Keep the line in the map but drop the arrival | A destination you cannot reach spends an address from the eighty and promises a row. That is the half-actable case `ADR-074` was written to end, arrived at from the other direction. |
| Re-anchor citations by symbol — `path#token` | The direction the drift points, and **deferred, not refused**: a token survives the move a coordinate does not, but the renderer resolves no token, 208 of 327 mentions name nothing a machine can read, and the shape (a hint beside the file? a second address form? a resolved-at-jump step?) is not clear enough to choose. Recorded as the next decision, with the finder's numbers as its evidence. |
| Remove the line hint from prose entirely | A hint costs the author four characters and saves a reader scrolling a 2,000-line file. The rule was never *never write a line*; it was *never promise a row*. The style guide permits the hint and the gold ignores it. |
| A fixer pass over the corpus, as the operator first imagined | Re-anchoring is a claim about intent, and a script that rewrites lines converts *wrong* into *plausible* — `ADR-027`'s misleading ledger with a citation as the ledger. The finder prints proposals; a human takes the diff. |
| Rename the whole thing and keep both forms behind a flag | Two grammars, one of them unexercised and rotting. The silo has one list of extensions for exactly this reason. |

## Consequences

**What became easier:**

- **The map is addresses again.** One file, one silcrow, however often and however
  finely it is cited; the dedupe key is a `Set` of paths, and the receipt's fullness
  counts files.
- **Nothing to keep exact.** No frame offset, no clamp, no arrival test, no dogfood
  page, no measured constant — and no finder gate, because there is no promise.
- **The finder became cheap and honest.** A stale hint is the author's problem, and
  the tool reports it as hygiene rather than failing a build on a judgement.
- **The precedent is the useful part.** The feature was built, measured and reversed
  in a session, and the cost of that is two annotated ADRs and a deletion — which is
  what it should cost to be wrong quickly.

**What became harder:**

- **A citation no longer takes you to the row.** For a 2,700-line file that is a
  real loss: the reader lands at the top and must search or switch to the editor.
  Accepted, because the alternative was a promise the corpus could not keep.
- **The corpus still holds 327 line hints**, now pure prose. They will rot exactly as
  before; the difference is that nothing on the glass says they will not.
- **The record carries two same-day reversals** — this and 074's amendment — which
  reads as thrash in the decision log. It is not: it is a premise tested the cheapest
  way available, with the instrument that now makes the argument on its own.

**Constraints this imposes:**

- **No gutter, no arrival, no line in the map** — the coordinate is prose, in every
  mode, on every flag.
- **Three boundaries, pinned by tests.** The gold ends at the extension, the span
  covers the mention, the target is the path. Changing one needs the other two read.
- **The finder may not gate a judgement.** Its subject is a hint; a hint past EOF is
  a hint about a file that shrank.
- **A token address is a future decision**, and it must arrive with measurements
  against the numbers above — not with an intuition that tokens are tidier.

## Related

- ADR: `ADR-ADDRESS-NOT-COORDINATE-074` — core stands; its 2026-10-28 amendment is
  the thing reversed here
- ADR: `ADR-ARRIVAL-AT-LINE-077` — superseded; kept as the construction record
- ADR: `ADR-MAIN-DOCUMENT-031` — *one destination, one silcrow*, back to the path
- ADR: `ADR-SILCROW-PATHS-045` — the W2 rule (suffix swallowed, target stripped),
  restored
- Brief: `.archive/briefs/2026-10-28-brief-cited-jump.md` — the attempt, archived
- Code: `src/render.ts` (`RE_CITED_PATH`), `src/vectors.ts` (`pathOf`,
  `scanReferences`), `src/tui.ts` (`extractJumps`, `jumpTo`),
  `scripts/citation-drift.ts` (the finder, now a reading)
