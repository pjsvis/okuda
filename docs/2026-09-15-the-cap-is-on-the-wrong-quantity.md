---
date: 2026-09-15
kind: design note — a defect, its measured reach, and a fork in the plan that fixes it
lineage: BRF-ADDRESS-CAP, landed 2026-09-14 and still unbuilt; the reader's words,
  *"the invariant is the destination, and we have messed with an invariant"*. Written
  before any of that brief's five tasks were started, because its step 1 rests on a
  performance claim that the measurement does not support.
status: open — nothing is built. One step of the brief is the open question.
---

# The cap is on the wrong quantity

> ◆ The occurrence bound in `scanReferences` guards nothing. Measured, the whole
> annotate path costs **0.34 ms** at 4,096 occurrences on a document the size of the
> largest in the silo. So step 1 of the brief — *"the occurrence bound becomes its own
> constant, chosen as a performance guard"* — is a guard invented after the fact, and
> the smaller change is to **delete** the bound rather than rename it.

## What we are deciding

BRF-ADDRESS-CAP is landed and unbuilt — five tasks, none started, all open
(`briefs/2026-09-14-brief-address-cap.md`).

Four of its steps are uncontroversial. Rename the constant. Correct the drift. Pin the
starved-target case. Run the gates. The fifth is not:

> "**Separate the two quantities.** `scanReferences` returns every reference-shaped
> occurrence. The occurrence bound becomes its own constant, chosen as a performance
> guard, and is not the address count."

That is a claim about cost, and it is testable. This note tests it. The answer decides
which of two changes we make — and it turns out to decide *which one is smaller*.

## What the code does

Three pure functions, and one bound sitting in the wrong place:

```mermaid
title: The cap lands before the de-duplication
flowchart TD
    S[Source] --> D[Discovery]
    D -->|every occurrence| C[Slice at 80]
    C --> M[The map]
```

- **Discovery** — `scanReferences` returns every reference-shaped span, in reading
  order, **with repeats**: two mentions of one ADR are two occurrences.
- **The slice** — `hits.slice(0, MAX_REFS)`. This is the defect. `MAX_REFS` is the
  *address* count (80), applied to the *occurrence* stream, which is longer than the
  address stream whenever any destination repeats.
- **The map** — `buildJumpMap` de-duplicates by target and assigns 12…98. It already
  stops at `VECTOR_MAX`, so it already carries the correct bound. One destination, one
  silcrow; the cap is its invariant.

So the cap is applied one step too early. Repeats spend the budget before
de-duplication can reclaim it.

## The defect in one example

A source citing `ADR-031` eighty times and then five distinct targets:

```
occurrences returned by scanReferences : 80
map entries                            : 1
map                                    : [[12,"ADR-031"]]
```

The five destinations that follow — `ADR-030`, `ADR-029`, `ADR-028`, `ADR-027`,
`ADR-026` — receive no silcrow at all. They are not elided, not flagged, not
degraded: they simply have no address. The correct map has six entries.

## How far it reaches

Latent, and measured: **0 of 174** documents carrying references reach the cap. The
busiest five:

| Occ | Dest | Document |
| --- | --- | --- |
| 65 | 65 | `briefs/index.md` |
| 58 | 58 | `&briefs.md` |
| 43 | 13 | `briefs/2026-09-13-brief-audio-discovery.md` |
| 37 | 37 | `decisions/index.md` |
| 24 | 4 | `briefs/2026-09-10-brief-tts-stepper.md` |

- **The shape that bites already exists.** `brief-audio-discovery` is 43 occurrences
  to 13 destinations. At that ratio the slice would fill the map after roughly 24
  addresses — a silent 70% loss of the address space. It survives only because 43 is
  under 80.
- **The margin is not static.** Between 2026-09-14 and 2026-09-15 the corpus grew
  from 171 to 174 documents and the busiest document from 63 occurrences to 65.
  Headroom fell from 17 to **15** in a day.
- **The generated indexes hide the problem.** `briefs/index.md` is 65 occurrences to
  65 destinations — every citation distinct. Repetition lives in the hand-written
  prose, and no hand-written document is long enough yet.

## The finding: there is nothing to guard

◆ The brief's step 1 assumes the paint's cost is a function of the occurrence count.
It is not. `annotateSource` replaces from the end — `out.slice(0, end) + marker +
out.slice(end)` per occurrence — which *reads* as O(k·L) and measures as O(k) with a
small constant, because the engine builds a rope rather than copying the string.

Occurrences varied, document length pinned at 37,759 bytes:

| Occurrences | Scan | Map | Paint |
| --- | --- | --- | --- |
| 80 | 0.010 ms | 0.016 ms | 0.129 ms |
| 400 | 0.023 ms | 0.026 ms | 0.146 ms |
| 1,600 | 0.084 ms | 0.079 ms | 0.199 ms |
| 4,096 | 0.166 ms | 0.180 ms | 0.335 ms |

Fifty-one times the occurrences buys 2.6× the time, and 0.21 ms of it. Length varied
at 4,096 occurrences:

| Document | Paint |
| --- | --- |
| 38 KB | 0.34 ms |
| 160 KB | 0.89 ms |
| 640 KB | 2.07 ms |

Sixteen times the length buys 6.1× — sub-linear, so the quadratic term is not there.
A 640 KB document is 17× the largest document in the silo and would still paint in
about 2 ms.

**The conclusion is not that the bound is harmless. It is that the bound has no job.**
It was not chosen for a measured cost; it was the address count, reused because a
bound was already in the hand. Removing it cannot regress anything measurable, because
nothing measurable depends on it.

## The fork

**A — keep a guard, as the brief says.**

- Adds `MAX_OCCURRENCES`, a second constant beside `MAX_ADDRESSES`, with a comment
  explaining that it is a runaway guard and not a document limit.
- The guard has no measured justification, so its value is a guess. Any value is
  either reachable — in which case the defect survives at a greater distance — or
  unreachable, in which case it is a constant that cannot fire.
- The brief's own acceptance criterion hedges here: *"`scanReferences` carries no
  slice keyed on the address count."* A slice keyed on a new count is a different
  slice with the same shape.
- Cost: one more concept in the smallest file in the silo.

**B — delete the bound.**

- `scanReferences` returns every occurrence, which is what its own doc comment
  already promises: *"every reference-shaped span in the document, in reading order,
  **with repeats**."* The comment contradicts itself two lines later — *"Capped at
  `MAX_REFS`."* B makes the code agree with the first sentence and deletes the second.
- The only bound left is the map's 80 addresses, which is the one that is actually an
  invariant.
- No new constant, no unreachable value, no second shape of the same defect.
- `annotateSource` is untouched. Its behaviour does not change; only the length of the
  list it is handed.

B is smaller than A in every dimension that matters — one fewer concept, one fewer
line, no invented number — and it is the version that matches the doc comment.

## What is not in question

- **The rename.** `MAX_REFS` holds an address count and says occurrences. Whatever we
  decide about the bound, the name goes.
- **The address space stays 80.** 12–98 minus the seven reserved doubled pairs. A
  three-digit space is a different decision and needs its own ADR.
- **The drift.** Four sites describe current behaviour in the abolished `[NN]` form.
- **The overflow case.** Past 80 distinct destinations the 81st renders as text with
  no marker. Painting a notice adds bytes to the main render, which makes it a
  wire-budget question (ADR-028). Out of scope here, and unchanged by the fork.

## Naming

`MAX_REFS` → `MAX_ADDRESSES`. The silo already says *address* in the two places the
value is spoken aloud: `tests/keymap-doc.test.ts` asserts the keymap page contains
`80 addresses`, and `scripts/vector-check.ts` prints `80 addressable`. The rename
agrees with the vocabulary that is already in the tree, rather than introducing one.

## The drift, and the one that is not drift

| Site | Today |
| --- | --- |
| `src/vectors.ts:5` | ``vectors: `[12]` … `[98]` `` |
| `src/vectors.ts:10` | `("[14] — no document to render")` |
| `src/vectors.ts:13` | `Discovery (reading order, unique targets, capped)` |
| `src/tui.ts:675` | `"[14] — no document to render"` |

`src/frames.ts:3` carries `[01]` and is **not** drift. That is the keyboard-controls
token — a different vocabulary from the main document's vectors, and correctly out of
the brief's scope. Any sweep by pattern will hit it; the acceptance criterion scopes
`rg` to two files, and it should stay scoped.

`src/vectors.ts:13` is drift the brief did not list. Discovery does not return unique
targets — the map does. It is also the line that says "capped", which is the same
error in prose.

## The blast radius

| Site | Holds |
| --- | --- |
| `src/vectors.ts` | the constant, the slice |
| `tests/vectors.test.ts` | four assertions |
| `tests/keymap-doc.test.ts` | the "80 addresses" string |
| `scripts/vector-check.ts` | the summary line |
| `scripts/references-demo.ts` | "cap 80 occurrences" |
| `tmp/*.ts` | three untracked probes |

Two of these are worth a second look.

- **`scripts/references-demo.ts:137` prints `cap ${MAX_REFS} occurrences`.** It
  states the defect as the contract, in a script a reader may run to learn the
  contract. Renaming the constant without touching this line leaves the wrong quantity
  in the demo.
- **Three probes in `tmp/` import `MAX_REFS` and would break silently.** `tmp/` is
  gitignored, so the breakage never shows in a diff or in CI — the probes simply stop
  running, and the brief's own cited evidence becomes unrunnable. Either update them
  with the rename or accept that the evidence is now a record rather than a tool.

## Two hazards that are not the cap

- **`briefs/2026-09-04-brief-working-copy.md` is dirty in the working tree**, carrying
  uncommitted edits from another session, and it is exactly the file task `td-ca8c1f`
  must correct. Every other task in this epic touches clean files; this one does not.
  Editing it now would entangle our correction with someone else's unfinished work,
  and the commit would have to be staged hunk by hunk. That task should wait until the
  file is either committed or discarded.
- **The injected clock ran a day stale.** The session's stated time was 2026-09-14
  04:12 while `date` returned 2026-09-15 08:55 — and the date is a document's
  filename, its frontmatter, and its registry entry. Anything dated from the session
  clock rather than from `date` lands a day wrong, in the past, permanently. Worth
  knowing before the next document is named.

## Where I would land

**Take B, and amend the brief's step 1 to say so.**

The reasoning is not that the guard is too small or too large — it is that the guard
is a *second bound on a quantity that is not the invariant*. The whole point of
BRF-ADDRESS-CAP is that the cap belongs on destinations. Adding a differently-named
cap on occurrences keeps the wrong quantity bounded, which is the defect wearing a
better label. Measurement says we can simply stop bounding it.

That makes the change smaller than the brief predicted: delete one line, rename one
constant, correct four comment sites, add two tests. No new constant, no new number to
justify.

If you would rather keep a guard for reasons the measurement cannot see — a document
you expect to arrive, a cost model I have not modelled — say so and we take A, and I
would want the guard's comment to admit that it is prophylactic rather than
performance-driven. That is an honest constant. "Chosen as a performance guard" is
not, now that we have looked.

## Evidence

Both probes are in `tmp/` (scratch, gitignored):

- `tmp/guard-cost-probe.ts` — the cost table, the length table, and the starved-target
  case reproduced on the current tree.
- `tmp/corpus-cap-probe.ts` — the reach: 174 documents, 0 at the cap, 15 occurrences
  of headroom.

## Related

- `briefs/2026-09-14-brief-address-cap.md` — the brief this reopens, one step of it
- `src/vectors.ts` — the defect, and a doc comment that already states the fix
- ADR-031 — the main document and the vector map
- ADR-032 — the reserved doubled pairs, which moved the space from 88 to 80
- ADR-028 — the wire budget; the overflow notice is its conversation
- `docs/2026-09-14-derrida-and-the-decomposed-pdf.md` — the same habit: a schema
  decides what survives, and this one decides before the de-duplication
