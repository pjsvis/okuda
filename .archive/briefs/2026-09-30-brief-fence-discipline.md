---
type: Brief
callsign: BRF-FENCE-DISCIPLINE
date: 2026-09-30
---

# Brief: One fence rule — five scanners, four disciplines, one of them fixed

**Created:** 2026-09-30
**Status:** Rejected — 2026-10-27, the operator's call: too old, and the corpus has moved on.
**TD:** td-da237f (epic) — td-a9de44 the scanner, td-81faf8 the seams, td-1b2d25 the tests and records
**Branch:** feat/fence-discipline

## Lineage

a question to the renderer's owner — *are there trusted sources for regexes for parsing markdown* — asked on 2026-09-30, after the Warp assessment. The answer for markdown itself is no, and it is a theorem rather than a gap: the language is not regular (`spec.txt:9689`, the delimiter stack). So the question moved to the regexes okuda owns, and the fence scan is the largest of them. A probe then found a line going missing.

## Extends

`BRF-FENCE-COLOUR` — its `interceptCode` close discipline is the rule this brief generalises to every seam. The chroma spawn, the lexer-alias map, the pinned monokai style, the elision interaction and P2's whole-file path all stay that brief's.

## Grounding

`src/render.ts`, `src/vectors.ts`, CommonMark §4.5 (fenced code blocks), `briefs/2026-08-28-brief-elision-primitive.md` (the one-primitive precedent), `docs/2026-09-19-the-tag-the-renderer-eats.md`

## Objective

Give the render path one fence rule — the close is its own line, and at least
as long as the opener — so okuda stops disagreeing with itself about where a
code fence ends.

## The finding

Commit `13a952d` (td-c8b190, 2026-09-30) fixed a real defect: `interceptCode`'s
lazy close matched a ``` anywhere, mid-line included, so a source file
containing a fence-shaped regex truncated the whole-file fence at its own
detector and the tail fell into prose. The fix added the whole-line rule,
`[ \t]*(?=\n|$)`.

The fix is correct and it is one of five. The same question — *where does this
fence end* — is answered independently at five seams, with four different
rules:

```
1  src/vectors.ts:88   /^\s*(```|~~~)/                        document
2  src/render.ts:169   /```text\n([\s\S]*?)\n?```/            mermaid binary
3  src/render.ts:466   /^( {0,3})(`{3,}|~{3,})/               document
4  src/render.ts:494   /(^|\n)```mermaid\n([\s\S]*?)\n?```/g  document
5  src/render.ts:640   /(^|\n)```([^\n`]*)\n([\s\S]*?)\n?```[ \t]*(?=\n|$)/g
                                                              document
```

Against CommonMark §4.5, each diverges somewhere:

| Requirement | Diverges at |
|---|---|
| the close is a whole line | 2, 4, 5 |
| the close is at least as long as the opener | 3, 5 |
| the close uses the opener's fence character | 1 |
| the opener is indented at most 3 spaces | 1 |

### The fix is half a rule, and this brief is the document that proves it

Seam 5's new close is `` ```[ \t]*(?=\n|$) ``. It anchors the close's **end** —
the marker runs to end-of-line — and not its **start**. The `\n?` before it
permits exactly one optional newline, and `[\s\S]*?` before that swallows
anything else, so a content line that merely *ends* in backticks closes the
fence. The comment says *a closing fence is its own line*; the pattern says a
closing fence is a line's *last* token.

Measured 2026-09-30 on this brief, before its own fixture block was widened to
four backticks. Seam 5 matched lines **69..72**, closing at
`` rendered:     ``` ``, instead of 69..76. The token replaced only that span,
so the leftover closing marker on line 76 became an *opening* fence with no
partner — and everything from Acceptance Criteria to the end of the document
rendered as code: literal asterisks, no wrapping, elided at the cut with `…`,
and every backtick shown. A brief whose acceptance criteria render as a
different document is the failure mode
`docs/2026-09-19-the-tag-the-renderer-eats.md` records, reached by another road.

So the census above gains a fifth column's worth of meaning: seam 5 is the
*least* divergent of the five and it still fails a rule the commit message
claims. The two rules are independent, and this is why the acceptance criteria
below name them separately.

## What it costs, measured

Seam 3 is a toggle: it flips on any fence-shaped line regardless of length.
Wrap a 3-backtick fence inside a 4-backtick fence and the inner marker turns
the state off, so everything between the inner markers is treated as prose and
`neutraliseSetext` runs over it. `tmp/regex-fence-closer-probe.ts`, fixture D —
shown here inside a **four**-backtick fence, because a three-backtick one is
truncated by seam 5 on the line `rendered:     ``` `, which is the second
finding below:

````
source body:  Heading / === / (blank) / ---
rendered:     ```
              Heading
              ---
              ```
````

**The `===` line is deleted.** `neutraliseSetext`'s setext-H1 branch
(`src/render.ts:479`, `lines.splice(i, 1)`) takes it. The control fixture, whose
inner content is `ls -la`, renders verbatim — which is why nobody has seen this.
Reachability, measured 2026-09-30 over the 353 tracked `.md` in the seven
registered tiers: **one** document carries a 4-plus-backtick fence line
(`docs/2026-08-29-okudagram-frame-edge-cases.md:233`) and its inner content is
inert. **Latent in the corpus, live in the renderer.** Zero documents carry a
4-plus-space indented fence line, so seam 1's indent divergence is unreachable
today.

## Scope

**In:** the five fence-span decisions, one shared scanner behind them, the
whole-line and closer-length rules applied at every seam, and the tests that
pin both.

**Out:**
- **Colour.** The chroma spawn, the lexer map, the style pin and the degrade
  path are `BRF-FENCE-COLOUR`'s and do not move.
- **Elision.** `elideToWidth` and the `…` at the cut are ADR-004's
  (td-b81597). This brief changes where a fence ends, not what happens at
  the pane edge.
- **Mermaid's grammar.** The diagram source is the binary's; okuda intercepts
  the fence, not the language.
- **Fence-shaped content that is not a fence.** Four-space indented code blocks
  are a separate construct with a separate rule, and are not in this census.
- **The renderer's tag-eating.** Bracket pairs vanish at render
  (`docs/2026-09-19-the-tag-the-renderer-eats.md`). It is a live defect with
  its own owner, and this brief works around it rather than fixing it.

## Preconditions

- [x] The defect reproduces on the branch point. **Verified 2026-09-30** —
      `tmp/regex-fence-closer-probe.ts` fixture D deletes the `===` on
      `e2ea449`; fixture E renders byte-identical.
- [x] The seams are enumerated from the source, not from memory.
      **Verified 2026-09-30** — five patterns, the census above, by reading
      `src/render.ts` and `src/vectors.ts`.
- [x] The tree is clean at the branch point. **Verified 2026-09-30** —
      `git status --short` printed nothing before
      `git checkout -b docs/brief-fence-discipline main`.
- [x] The gate is green at the branch point. **Verified 2026-09-30** —
      `just check` on `e2ea449`.
- [x] Reachability is measured, not asserted. **Verified 2026-09-30** — 1 of
      353 documents carries the closer-length trigger; 0 carry the indent one.

## Work Plan

1. [ ] `src/render.ts` — extract one fence scanner that yields spans plus the
       info string, applying the whole-line rule (both ends) and the
       closer-length rule.
2. [ ] `src/render.ts` — `neutraliseSetext` consumes it for the inside/outside
       boolean; the toggle and its length-blindness go.
3. [ ] `src/render.ts` — `interceptMermaid` consumes it, so its lazy close
       stops matching mid-line.
4. [ ] `src/render.ts` — the mermaid `text` extraction at `:169` consumes it,
       or is marked as pinned to the binary's own output.
5. [ ] `src/vectors.ts` — the reference-masking scan consumes it, so its fence
       character and its indent both become the shared rule's.
6. [ ] `tests/` — the fixture D case, the close-is-a-whole-line case (a content
       line ending in backticks), the mid-line case, and the control, each
       pinned at the byte level.
7. [ ] `docs/` — record the rule where the render path is taught, and cite this
       brief.

## Acceptance Criteria

- **The measured line survives.** A 4-backtick fence wrapping a 3-backtick
  fence whose content carries a setext pair renders all four content lines;
  today the `===` is deleted.
- **The control is unchanged.** The same shape with inert inner content renders
  byte-identical to today, so no document that is already correct moves.
- **A close is a whole line, at both ends.** A fence whose content carries a
  line ending in backticks renders whole, and nothing after it falls into
  code. Measured 2026-09-30 on this brief before its fixture block was widened:
  seam 5 closed at such a line and the tail of the document rendered as code.
- **A mid-line fence cannot close a fence, at any seam.** A document carrying a
  fence-shaped string mid-line inside a fence renders the fence whole.
- **One implementation.** Every fence-span decision in `src/` resolves through
  one exported scanner; a source scan finds no second fence-shaped pattern
  outside it and its tests.
- **The suite and the gate are green.** `just test` and `just check` both pass.

## Notes

**The precedent is already in the silo.** `elideToWidth` is one primitive with
two consumers — code fences and the menu role fit — and the brief that made it
that way is `briefs/2026-08-28-brief-elision-primitive.md`. Fence spans are the
same shape: one question, several projections. Seam 3 wants a boolean, seam 4
wants the content, seam 5 wants the content and the info string. One scanner
yielding spans and the info string serves all three; the toggle is what happens
when a boolean consumer grows its own answer instead of projecting one.

**Two of the five read input okuda controls, and that distinction scopes the
risk.** Seam 2 reads the mermaid binary's own `text` fence — a contract okuda
pins in `DEPENDENCIES.md`, so its lazy close is a smaller problem in kind. Seams
1, 3, 4 and 5 read author-controlled documents. Those are where the divergence
bites, and the census says one document reaches it.

**A whole-line close is not a closer-length close, and today's fix delivers
half of the first.** Seam 5 anchors the close's end and not its start, and it
matches exactly three backticks, so a 4-backtick fence is not intercepted at
all — a silent degradation rather than a corruption. Three rules, not two, and
the acceptance criteria name them separately for that reason.

**The census is taken before the commit, so it excludes this brief.** The silo
is what git tracks and this file is untracked while it is being written. It
carries no fence at all beyond the one census block, so the correction is one
document at most — but the number above is the pre-commit number, and a
follow-up commit corrects it if the count moves.

**This brief carries no angle brackets in its criteria, deliberately.** A
bracket pair does not survive the render — `--entries` with an argument renders
as `--entries `, the argument deleted, in code spans and fences as well as
prose. A criterion that renders as a different criterion is a live defect, and
the source does not show it. `docs/2026-09-19-the-tag-the-renderer-eats.md` is
the record.

**A brief about fence scanning that trips its own subject is the cleanest
possible evidence, and this one did.** Not through the toggle — the census
block's lines begin with a digit, so neither seam 1 nor seam 3 fires on them,
and the toggle traces four balanced flips across the document. It was seam 5,
on the fixture block, and it was found by rendering the brief rather than by
reasoning about it: the criteria came back as literal text with every backtick
shown and every line elided at the cut. The fixture block is now a
four-backtick fence, which seam 5 skips entirely. The lesson is the one this
brief exists to make — the rule that matters is the one that survives the
glass, not the one the pattern appears to state.

## Related

- `briefs/2026-09-29-brief-fence-colour.md` — the seam whose close discipline
  this generalises; its colour work stays its own
- `briefs/2026-08-28-brief-elision-primitive.md` — the one-primitive precedent
- `decisions/004-hard-wrap-mandate.md` — the fence elision half (td-b81597)
- `docs/2026-09-19-the-tag-the-renderer-eats.md` — the renderer defect this
  brief works around
- `docs/2026-08-29-okudagram-frame-edge-cases.md` — the corpus's one
  4-backtick fence, at `:233`
- `src/render.ts`, `src/vectors.ts` — the five seams
- `tmp/regex-fence-closer-probe.ts` — the probe behind the measurement
