---
type: Brief
callsign: BRF-CODE-SILCROWS
---

# Brief: Code-comment silcrows — a rendered code file is a document for its prose

**Date:** 2026-10-12
**Status:** Done
**TD:** BRF-CODE-SILCROWS

## Context

A non-`.md` file is wrapped whole in a fence (`src/render.ts` `wrapWholeFile:772`)
and fenced content is excluded from reference discovery (`src/vectors.ts`
`fenceRanges:127`), so a comment citing `ADR-030` or `BRF-ROOT-CONTAINMENT` paints
nothing. The asymmetry: a document citing `src/tui.ts` earns a silcrow (ADR-045
Ring A) while the rendered file citing a document earns none. Measured 2026-10-12
(`scripts/code-silcrow-probe.ts`): 381 callsigns in code comments, 344 resolve (90.3%).
The exclusion is discovery-side, not a paint limit — but a prose
`%okuda-vector:12%` marker is not consumed by the chromed fence path either
(chroma colours the content before any handler sees it), so the code render needs
a distinct marker painted after colour. (The first draft missed this: a
plain-mode check painted while truecolor leaked the raw marker — found in
review.)

## Objective

Run reference discovery over the **comment regions** of a rendered code file,
restricted to **callsigns** (the auditable documents) and gated by the registry,
so a code comment's document reference earns the same silcrow a document's does.

## Evidence

**The probe** (`bun scripts/code-silcrow-probe.ts`, 92 code files):

| population | tokens | resolve | junk |
|---|---|---|---|
| callsigns in comments | 381 | 344 (90.3%) | 37 (9.7%) |
| callsigns outside comments | — | 192 | 95 |

The 192 "resolved" outside comments are the trap, and the reason the comment
filter is load-bearing rather than tidy: they are **test fixtures and
generated-demo strings** — `tests/vectors.test.ts:21` is
`scanReferences("see ADR-030 and ADR-028…")`, `scripts/references-demo.ts:60`
builds a demo document inside a string. Resolvable, and not references.

**The paint needed a code marker.** `%okuda-vector:NN%` inside a code fence is
consumed in plain mode but **leaks in truecolor** (chroma colours the fence
before the handler sees it) — verified 2026-10-12. So code mode emits
`%okuda-codevec:NN%`, painted after colour and before elision; a bare `ADR-030`
in a fence still mints nothing (discovery is fenced).

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

- [x] `scripts/code-silcrow-probe.ts` reproduces the numbers (it does; the table above
      is its output).
- [x] ADR-031, ADR-044, ADR-045 read; the fence-exclusion reason examined —
      discovery, not a paint limit, and the paint needed its own code marker.
- [x] The read/wrap seam named: `readSource` (`src/cli.ts:131`) wrapped **before**
      discovery; split.

## Work Plan

1. [x] Baseline: recorded the probe output and the current render (`map 0`).
2. [x] Failing-then-passing tests in `tests/code-silcrows.test.ts`: a comment
       callsign paints, its string-literal twin does not, an authored markdown
       fence still paints nothing.
3. [x] `scanReferences` / `jumpMapFor` / `annotateSource` take a `regions`
       predicate (code mode: the markdown fence check is skipped);
       `commentRegions` in `src/render.ts` builds it.
4. [x] `readSource` returns the raw text; `draw` annotates, then wraps, then
       appends the receipt.
5. [x] Receipt confirmed: `src/cli.ts` 10 entries, `src/tui.ts` 16; none when the
       map is empty.
6. [x] Fence-exclusion comment corrected (`src/vectors.ts`); ADR-MAIN-DOCUMENT-031
       amended in place (the comment cited no ADR, so the parent by subject was
       ADR-031).
7. [x] `just check` and `just ship` pass; probe re-run; code renders eyeballed.

## Acceptance Criteria

- A code file whose comment cites `ADR-031` renders `§NN` on that mention; the
  same callsign in a string literal in the same file does not.
- An authored markdown fence containing a callsign still paints nothing (the
  exclusion stands for samples).
- A code file renders with a `## References` receipt listing its comment callsigns,
  and no receipt when the map is empty.
- `scripts/code-silcrow-probe.ts`'s resolved-in-comments count (344) is the set the
  change admits — no more.
- No `okuda-vector` or `okuda-codevec` marker leaks in any code render, in
either colour mode.
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

- `scripts/code-silcrow-probe.ts` — the measurement
- `decisions/031-main-document.md` — what a main document's map is
- `decisions/044-validated-silcrows.md` — the gate, and the 117-junk precedent
- `decisions/045-silcrow-paths.md` — Ring A, the document→code direction
- `src/render.ts` `wrapWholeFile:772`; `src/vectors.ts` `fenceRanges:127`
- `playbooks/craft-playbook.md` — a comment whose referent had moved
