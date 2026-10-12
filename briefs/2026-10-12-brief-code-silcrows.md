---
type: Brief
callsign: BRF-CODE-SILCROWS
---

# Brief: Code-comment silcrows — a rendered code file is a document for its prose

**Date:** 2026-10-12
**Status:** Open
**TD:** BRF-CODE-SILCROWS

## Context

A non-`.md` file is wrapped whole in a fence (`src/render.ts` `wrapWholeFile:772`)
and fenced content is excluded from reference discovery (`src/vectors.ts`
`fenceRanges:127`), so a comment citing `ADR-030` or `BRF-ROOT-CONTAINMENT` paints
nothing. The asymmetry: a document citing `src/tui.ts` earns a silcrow (ADR-045
Ring A) while the rendered file citing a document earns none. Measured 2026-10-12
(`tmp/code-silcrow-probe.ts`): 381 callsigns in code comments, 344 resolve (90.3%).
And the paint is not the obstacle — a `%okuda-vector:12%` token inside a code
fence renders as `§12`, so the exclusion is discovery-side, and its stated reason
(*"a badge injected inside a fence never renders"*) is false for code fences.

## Objective

Run reference discovery over the **comment regions** of a rendered code file,
restricted to **callsigns** (the auditable documents) and gated by the registry,
so a code comment's document reference earns the same silcrow a document's does.

## Evidence

**The probe** (`bun tmp/code-silcrow-probe.ts`, 92 code files):

| population | tokens | resolve | junk |
|---|---|---|---|
| callsigns in comments | 381 | 344 (90.3%) | 37 (9.7%) |
| callsigns outside comments | — | 192 | 95 |

The 192 "resolved" outside comments are the trap, and the reason the comment
filter is load-bearing rather than tidy: they are **test fixtures and
generated-demo strings** — `tests/vectors.test.ts:21` is
`scanReferences("see ADR-030 and ADR-028…")`, `scripts/references-demo.ts:60`
builds a demo document inside a string. Resolvable, and not references.

**The paint already works inside a fence.** Isolated render, 2026-10-12:

| source | rendered |
|---|---|
| ` ```ts` / `// see %okuda-vector:12% ADR-030` / ` ``` ` | `// see  §12 ADR-030` |
| the same fence with a bare `ADR-030` | `// see ADR-030` (nothing) |

**Top files** by comment callsigns: `src/tui.ts` 50 (45 ok), `src/render.ts` 44
(43), `src/vectors.ts` 42 (37), `src/launcher.ts` 30 (29). The 37 junk are the
ADR-044 class — `UTF-8` ×7, an unwritten ADR ordinal ×7, a fixture sentinel ×5,
a date placeholder, a couple of forward references — and the gate drops them all;
the probe holds the token list.

## Scope

**In:** a comment-region extractor at the discovery seam (line-based; `//`, `#`,
`/* */`, block state carried); a callsign-only scan for a whole-file code render;
the read/wrap split in `src/cli.ts` so the map is built from the raw source and
the wrap applied after annotation; the References receipt for a code file; tests;
a correction to the fence exclusion's stated reason and the ADR amendment it
implies.

**Out:** `.md` paths and `dir/name.ext` code paths in comments (deferred — the
narrowest first, and callsigns are the auditable set); whole-file scanning;
changing the exclusion for **authored** markdown fences (a sample's paths stay
verbatim); non-callsign tokens; syntax highlighting.

## Preconditions

- [ ] `tmp/code-silcrow-probe.ts` reproduces the numbers (it does; the table above
      is its output).
- [ ] ADR-031, ADR-044, ADR-045 read; the fence-exclusion reason confirmed false
      for code fences.
- [ ] The read/wrap seam named: `readSource` (`src/cli.ts:131`) wraps **before**
      discovery, so the raw text is not available to the map.

## Work Plan

1. [ ] Baseline: record the probe output and the current render (`map 0`) for a
       code file.
2. [ ] Write the failing test: a code comment citing a resolvable callsign paints
       `§NN`; a fixture string in the same file does not; an authored markdown
       fence still paints nothing.
3. [ ] Add the comment-region predicate to discovery (a parameter on
       `scanReferences`/`jumpMapFor`, not a fork), callsign-only for code files.
4. [ ] Split `readSource`/`wrapWholeFile` so the map and annotation run on the raw
       source; wrap after.
5. [ ] Confirm the References receipt appears for a code file and renders after
       the block.
6. [ ] Correct the fence-exclusion comment (`src/vectors.ts:127`) and amend the ADR
       it cites (palimpsest).
7. [ ] `just check`; re-run the probe on the corpus; render `src/cli.ts`,
       `src/tui.ts`, `src/vectors.ts` and eyeball.

## Acceptance Criteria

- A code file whose comment cites `ADR-031` renders `§NN` on that mention; the
  same callsign in a string literal in the same file does not.
- An authored markdown fence containing a callsign still paints nothing (the
  exclusion stands for samples).
- A code file renders with a `## References` receipt listing its comment callsigns,
  and no receipt when the map is empty.
- `tmp/code-silcrow-probe.ts`'s resolved-in-comments count (344) is the set the
  change admits — no more.
- No `%okuda-vector` token leaks in any code render.
- `just check` and `just ship` pass.

## Notes

- **Resolution ≠ reference.** ADR-044's gate drains tokens that do not resolve; it
  cannot drain a resolvable token *quoted as data*. That is why the comment region
  is required and not merely tidy — and it is the distinction this brief turns on.
- **The fence-exclusion reason is a barnacle.** `src/vectors.ts:127` says a badge
  inside a fence never renders; a token inside a code fence does. The exclusion is
  sound in intent (a sample is verbatim) and wrong in mechanism — and the wrong
  mechanism is what hid the possibility of painting a rendered file at all.
- **The extractor is an over-approximation.** Language-agnostic and line-based; a
  `#` in a string counts as a comment, `//` after a scheme colon does not. Errors
  run toward admitting more candidates to the gate, which drains junk — the
  conservative direction for this decision.
- **The narrowing is the operator's.** Callsigns are the auditable documents, so
  restricting to them is both defensible and cheap; `.md` paths and code paths in
  comments are deliberately left for a later step if this one earns it.

## Related

- `tmp/code-silcrow-probe.ts` — the measurement
- `decisions/031-main-document.md` — what a main document's map is
- `decisions/044-validated-silcrows.md` — the gate, and the 117-junk precedent
- `decisions/045-silcrow-paths.md` — Ring A, the document→code direction
- `src/render.ts` `wrapWholeFile:772`; `src/vectors.ts` `fenceRanges:127`
- `playbooks/craft-playbook.md` — a comment whose referent had moved
