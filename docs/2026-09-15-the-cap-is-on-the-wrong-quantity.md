---
date: 2026-09-15
kind: design note — a defect, its measured reach, and a fork in the plan that fixes it
lineage: BRF-ADDRESS-CAP, landed 2026-09-14 and still unbuilt; the reader's words,
  *"the invariant is the destination, and we have messed with an invariant"*. Written
  before any of that brief's five tasks were started, because its step 1 rests on a
  performance claim that the measurement does not support. **Corrected 2026-09-15**,
  the day it landed — the first version measured the wrong regime; see *The finding*.
status: open — nothing is built. One step of the brief is the open question, and it
  now has a step in front of it.
---

# The cap is on the wrong quantity

> ◆ The occurrence bound in `scanReferences` guards the **paint**, and it bounds the
> wrong half of the cost. The paint is *occurrences × f(length)* — the cap bounds the
> occurrences, and length is whatever document the reader opens. So step 1 of the
> brief — *"the occurrence bound becomes its own constant, chosen as a performance
> guard"* — is a guard on the wrong quantity, and the change is to **delete** the bound
> — **after** the splice is made one pass, because deleting it first is a quadratic.
>
> **Corrected 2026-09-15.** This note first concluded the bound *guards nothing*, from a
> probe that varied occurrences and length **independently** and found sub-linearity on
> each axis. In a real document the axes are coupled — reference density is roughly
> constant in prose — and moving them together is super-linear. Both measurements were
> correct; only one of them was the regime a reader is in. The error is kept and named
> under *The finding*, and the measurement that found it is
> `docs/2026-09-15-the-scaling-profile.md`.

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

## The finding: the cost is occurrences × f(length), and the cap bounds the occurrences

◆ The first version of this section was wrong, and the way it was wrong is worth
keeping, because it is the error this whole note is about — *a bound chosen from the
quantity in the hand rather than the quantity in the cost*.

It varied **occurrences** at fixed length (80 → 4,096: 0.129 → 0.335 ms) and **length**
at fixed occurrences (38 → 640 KB: 0.34 → 2.07 ms), found sub-linearity on both axes,
and concluded the paint carries no quadratic term — *"the engine builds a rope rather
than copying the string."* That conclusion does not survive coupling the axes. And the
axes are coupled in every real document: reference density across the 220 documents
over 2 KB has a **median of 0.60 occurrences per KB**, with hand-written prose at
1.1–1.4. A longer document carries more references. The two move together.

At realistic density — one reference per ~146 bytes:

| Document | Occurrences | Paint | ms per occ×MB |
| --- | --- | --- | --- |
| 37 KB | 259 | 0.7 ms | 74.9 |
| 128 KB | 897 | 4.8 ms | 42.5 |
| 512 KB | 3,591 | 77.2 ms | 43.0 |
| 1 MB | 7,182 | 352.0 ms | 49.0 |
| 2 MB | 14,364 | 1,055.4 ms | 36.7 |
| 4 MB | 28,728 | 3,440.9 ms | 29.9 |

The last column is flat from 128 KB up, and a flat cost per *occurrences × MB* is the
signature of **copying**: the paint is *k × L*. Because occurrences grow with length,
the cost then grows with length squared — **111× the document costs 4,900× the time**,
an exponent near 1.8.

At a fixed 80 occurrences — the cap doing its job — the same probe stays sub-linear in
length, and cheap:

| Document | Occurrences | Paint |
| --- | --- | --- |
| 37 KB | 80 | 0.41 ms |
| 1 MB | 80 | 3.82 ms |
| 8 MB | 80 | 21.58 ms |

So **the cap is load-bearing.** The same 1 MB document paints in **3.82 ms capped and
352 ms uncapped — a 92× difference.** The first version of this note missed it by
measuring the uncapped case at 37 KB, where occurrences and length are both small
enough to hide the product. Both probes were honest; one of them was in a regime no
reader is ever in.

**What survives is the thesis, with the reason corrected.** The cap bounds occurrences;
the cost is occurrences × length; and length is unbounded — it is whatever document the
reader opens. **A bound on one half of a product is not a bound.** And the bound is
currently guarding a cost nothing in the silo can incur: the largest document is
36.9 KB and carries 44 references, so the paint is about **0.4 ms** — two orders of
magnitude below anything a reader could feel. The cap will not fire, and it is not what
keeps this silo fast.

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
- **`annotateSource` is made one pass first.** Its *behaviour* does not change — verified
  byte-for-byte against the current splice — but its *cost* does: it copies the source
  once per occurrence today, so handing it an unbounded list is a quadratic. That is a
  prerequisite, not an extra, and it makes the paint 60× faster on the way past.

B is smaller than A in every dimension that matters — one fewer concept, no invented
number — and it is the version that matches the doc comment. It costs one step, in
`annotateSource`, taken **before** the deletion rather than after.

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

**Take B, and amend the brief's step 1 — in two parts, in this order.**

The reasoning is not that the guard is too small or too large — it is that the guard
bounds **one half of a product**. The whole point of BRF-ADDRESS-CAP is that the cap
belongs on destinations. Adding a differently-named cap on occurrences keeps the wrong
quantity bounded, which is the defect wearing a better label. Measurement says we can
stop bounding it — but only once the splice is linear, because the bound is currently
the only thing keeping it so.

**First — make the splice one pass.** `annotateSource` emits the segments between
occurrences and joins them, instead of slicing the whole source per occurrence.
Byte-identical output, verified; **60× faster** on the capped list (0.15 ms against
9.16 ms at 1 MB) and 13–24× faster uncapped.

**Second — delete the occurrence bound.** Rename the constant to `MAX_ADDRESSES`,
correct the four comment sites, add the two tests.

The change is one step larger than the brief predicted and one constant smaller: no new
number to justify, and the paint gets *faster* rather than slower. The first version of
this note said the deletion was free. It is not free — it is worth paying for, which is
a better reason.

If you would rather keep a guard for reasons the measurement cannot see — a document
you expect to arrive, a cost model I have not modelled — say so and we take A, and I
would want the guard's comment to admit that it is prophylactic rather than
performance-driven. That is an honest constant. "Chosen as a performance guard" is
not, now that we have looked: the guard that would matter is on the product, not on
one factor of it.

## Evidence

Four probes, all in `tmp/` (scratch, gitignored):

- `tmp/guard-cost-probe.ts` — the first cost table, the length table, and the
  starved-target case. **This is the probe whose regime was wrong**: it varied the two
  axes independently, at 37 KB.
- `tmp/corpus-cap-probe.ts` — the reach: 174 documents, 0 at the cap, 15 occurrences of
  headroom.
- `tmp/annotate-cost-probe.ts` — the splice loop isolated, capped against uncapped, at
  three or four lengths. This is where the ratio doubling per 4× of length showed up.
- `tmp/splice-cliff-probe.ts` — the same splice at realistic density and at a fixed 80
  occurrences, across 37 KB → 8 MB. The `ms per occ×MB` column is the verdict: flat
  means copying.
- `tmp/splice-fix-probe.ts` — the one-pass splice against the current one, with a
  byte-for-byte output comparison in the same run.

## Related

- `briefs/2026-09-14-brief-address-cap.md` — the brief this reopens, one step of it
- `docs/2026-09-15-the-scaling-profile.md` — the measurement that corrected this note,
  and the cost curves of the store around it
- `src/vectors.ts` — the defect, and a doc comment that already states the fix
- ADR-031 — the main document and the vector map
- ADR-032 — the reserved doubled pairs, which moved the space from 88 to 80
- ADR-028 — the wire budget; the overflow notice is its conversation
- `docs/2026-09-14-derrida-and-the-decomposed-pdf.md` — the same habit: a schema
  decides what survives, and this one decides before the de-duplication
