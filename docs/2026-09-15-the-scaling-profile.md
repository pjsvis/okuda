---
date: 2026-09-15
kind: design note — the store's cost curve, its boundary conditions, and the order they bite
lineage: the reader's reframing, *"the silo holds as many documents as are contained
  in it; the docs all have unique call-signs associated with their filepath; to view a
  document we just need to dereference the file path; so its really just a key value
  store"* — and the question under it, *"what is the scaling profile given the above"*.
  Written after the callsign brief landed (BRF-CALLSIGN-EVERY-DOC), whose phase 4
  derives 131 keys, and after the cap note was corrected by the same measurement.
status: open — nothing is built. Four defects are live; one of them is in the fast path.
---

# The store scales. The interface doesn't.

> ◆ The silo is a key-value store, and that settles the profile: **flat for point
> operations, linear for enumerations** — and the second half is information-theoretic,
> not an implementation choice. Measured, our point lookup is **O(N) against the O(1)
> the design promises** (10.6 ms at 20,224 keys, against 0.12 µs for the same Map held),
> and our search **enumerates the whole corpus on every keystroke** (4.3 ms per MB,
> linear, crossing the 100 ms keystroke threshold at roughly 3,000 documents). The store
> has no scaling problem. The interface refuses to use it as a store.

## What we are deciding

Whether the scaling work is a **search** problem or a **naming** problem — and in what
order. The two are usually run together, and this note separates them because the
measurement says they creak at different sizes, by a factor of four, and the one that
creaks first is not the one being optimised.

## The store, stated

Four invariants, from the reframing. Each is testable, and three hold.

- **I1 — N is unbounded and is the only growing quantity.** Holds. Nothing else in the
  silo grows on its own; a document is bounded by human writing.
- **I2 — callsign → path is a bijection onto the documents.** Holds by construction.
  **Fails in fact, twice**: 137 keys for 293 visible documents (156 unnamed), and the
  lookup is not O(1). Below.
- **I3 — view = dereference(path), which is O(document), not O(N).** **Holds, measured.**
  This is the invariant the whole design rests on.
- **I4 — the path is the truth; the index is a rebuildable cache.** Holds. No operation
  can lose data, only time.

## The two axes

◆ The render path has **no corpus term at all** — the three-concerns split gives it the
document and nothing else. The search path re-derives everything, per keystroke, from
the corpus. They scale against different quantities, and only one of those quantities
grows without bound.

| Corpus | Files | MB | Search | ms/MB |
| --- | --- | --- | --- | --- |
| 1× | 317 | 1.1 | 33 ms | 30.0 |
| 4× | 1,264 | 4.4 | 41 ms | 9.3 |
| 16× | 5,056 | 17.7 | 85 ms | 4.8 |
| 64× | 20,224 | 70.7 | 302 ms | 4.3 |

The fall from 30 to 4.3 ms/MB is fixed cost being amortised — six process spawns per
one-word query, twenty for three alternatives with two excludes. From 16× to 64× —
4.0× the bytes, 3.55× the time — the law is **linear at ~4.3 ms per MB**. The render,
measured separately: **0.38–0.40 ms/KB of the document, flat**, so the silo's largest
document (36.9 KB) renders in about 14 ms and a 2 MB one in 803 ms. The corpus never
enters.

**And fzf is not the bottleneck**, which is worth stating because it looks like one. It
reads and filters 20,224 rows — a 1 MB stream — in **3–5 ms**. The pipe volume that
looks like the problem is two orders of magnitude cheaper than producing it. The cost is
ours.

## The boundary conditions, in the order they bite

- **~700 documents — the two-token key space starts colliding.** 519 distinct slug
  tokens, 72% of them used exactly once; two-token keys give ~269k slots, so the
  birthday floor for the first collision is around 730 documents, earlier under the
  observed skew. This is the **first** boundary, and it is in the naming layer.
- **Now — a document series collapses to one key.** Systematic, not statistical.
  `bootstrapCallsign` keeps the first ≤2 significant tokens and strips only a *leading*
  ordinal, so `docs/2026-08-29-from-intent-to-task-01..06.md` — six documents in the
  silo today — all bootstrap to **`DOC-INTENT-TASK`**, then `-2` … `-6`.
- **~3,000 documents — the per-keystroke enumeration crosses 100 ms.** At 4.3 ms/MB the
  perceptual threshold for a keystroke lands at roughly 20–25 MB of corpus. That is
  **ten times this silo, not a hundred.**
- **Never — point reads and dereference.** Resolving a key is O(1) once the Map is held;
  viewing a document is O(document). Neither has an N term, so **no corpus size can make
  reading a document slower.** That is the invariant that makes the design work.

## The four defects

Each is measured, each is live, and the first is on the fast path.

- **`resolveByCallsign` is O(N), not O(1).** It calls `loadCallsigns()` per invocation —
  read every registry, parse every row. `makeCallsignResolver` builds the Map once.

  | Keys | `resolveByCallsign` | `makeCallsignResolver` |
  | --- | --- | --- |
  | 317 | 0.34 ms | 0.14 µs |
  | 1,264 | 0.76 ms | 0.11 µs |
  | 5,056 | 2.61 ms | 0.30 µs |
  | 20,224 | 10.61 ms | 0.12 µs |

  Linear against flat — **24,000× apart at 20k keys**, for the same information.
  `loadCallsigns` itself is a clean 0.49 µs per key, so there is no pathology here, only
  a per-call rebuild of a store whose whole point is that the lookup is a Map.
- **The bootstrap truncates.** `2026-09-15-brief-callsign-every-document.md` →
  `BRF-CALLSIGN-EVERY-DOC`, against the registered `BRF-CALLSIGN-EVERY-DOC`. Two tokens is
  not a name.
- **The bootstrap collapses a series.** Above. Six documents, one key, and the
  disambiguator is a trailing digit — the same eye-only class as `DBF`/`DBR`.
- **The bootstrap can invert a name.** `STOPWORDS` (`scripts/reg-sync.ts:101`) contains
  **`no`** and **`not`**, so `036-no-speech-code.md` bootstraps to
  **`ADR-NO-SPEECH-CODE-036`** — a key asserting the *opposite* of its document. The
  registered key is `ADR-NO-SPEECH-CODE-036`, which a human got right.

Stripping `no` from prose is harmless; stripping it from an *identifier* is a correctness
bug. **The bootstrap is not the source of the silo's keys — it is a fallback that
produces worse ones.** That matters now, because the callsign brief's phase 4 plans to
derive 131 keys with it.

## The one quadratic, and where it is

The cap note (`docs/2026-09-15-the-cap-is-on-the-wrong-quantity.md`) first concluded the
occurrence bound guards nothing, from a probe that varied occurrences and length
**independently** and found sub-linearity on each axis. In a real document the axes are
coupled — reference density across the 220 documents over 2 KB has a median of **0.60
occurrences per KB**, with hand-written prose at 1.1–1.4 — and moving them together is
super-linear. `annotateSource` copies the source once per occurrence, so the paint costs
*occurrences × length*, and **111× the document costs 4,900× the time**.

The cap is therefore load-bearing: the same 1 MB document paints in **3.82 ms capped and
352 ms uncapped**. Deleting the bound before making the splice one pass is a quadratic.
A one-pass splice is byte-identical and **60× faster** on the capped list. The order is
splice, then delete.

## The creak that is already here

Not a scaling projection — a cost the silo pays today, at 1×.

`ctx.mermaid` is a fresh Map per render and `interceptMermaid` re-spawns per fence, so
**every re-render re-runs every fence**, and a fence is two process launches (a bash
script that execs the Rust `mermaid-tui`). The TUI's `rerenderAnchored` is the single
repaint path — watch, resize, reload — and `SIGWINCH` fires it per drag event.

| Fences | Re-render |
| --- | --- |
| 0 | 14 ms |
| 4 | 116 ms |
| 12 | 209 ms |
| 24 | 422 ms |

The worst document in the silo carries **4 fences — 68 ms per resize**. 29 of 316
documents carry fences, 52 in all. No cache anywhere. This is the one cost that grows
with the *document*, which is the axis that does not creak — and it creaks anyway,
because it is paid per re-render rather than per fence.

## The fork

**A — optimise the enumeration.**

- Cache the file list and the registry index between keystrokes; re-scan only the body
  channel, which is the one channel that genuinely depends on the query.
- Recompute only the channels; hold the remainder, which is a pure function of the file
  list and query-independent.
- Keeps the interface as it is. The ceiling stays linear — a fixed constant on a curve
  that still crosses 100 ms at ~3,000 documents, just later.
- Fixes nothing about the naming layer, which creaks first.

**B — stop enumerating on the keystroke.**

- The key is the fast path: a callsign resolves in O(1) and a document opens in
  O(document). Neither has an N term, so neither can creak.
- Search becomes the slow path — opt-in, incremental, or cached — and never the thing
  that runs between two keystrokes.
- Matches the reframing. A key-value store whose keystroke enumerates the corpus is not
  being used as a key-value store.
- Requires the naming layer to be trustworthy first, because it makes the key the
  primary way in — which means the bootstrap's four defects are on the critical path.

## What is not in question

- **The render path.** Flat, corpus-independent, and correct. It needs no scaling work.
- **The three-concerns split.** The absence of a corpus term in the renderer is the
  reason one axis cannot creak. It is the design working.
- **fzf.** 3–5 ms at 20,224 rows. Not a participant.
- **The 80-address space.** A three-digit space is a different decision with its own
  ADR. This note is about keys, not vectors.
- **The length boundary, which does not move with N.** 82% of registered keys cost 7–10
  spoken tokens and one costs 16+; derived full-stem keys run to 46 characters. A key
  costing 16+ tokens is a sentence, not a handle — so the *usable* key space is bounded
  by human memory and that bound is fixed while the store's is not. This is the reason
  the naming layer needs a rule for what happens when names run out, and currently has a
  `-2` suffix instead.

## Where I would land

**B, and the naming layer first — because that is where the measurement says it breaks.**

The instinct on a scaling question is to reach for the search path, and the search path
is the more interesting problem. But it is not the one that creaks first. Point reads and
dereference are flat forever and need nothing; the key space starts colliding at ~700
documents, which is 2× this silo; a series collapses *today*; and the keystroke
enumeration has 10× of headroom. So the order is:

1. **Hold the Map in `resolveByCallsign`.** Five lines. O(N) → O(1). This is the fast
   path the reframing is built on, and it is currently not wired in.
2. **Demote the bootstrap from generator to lint.** It truncates, collapses series, and
   can invert a negation. Either fix it — keep the trailing ordinal, drop `no` and `not`
   from `STOPWORDS` — or stop minting with it and use it to *check* authored keys. This
   gates the callsign brief's phase 4, which plans to derive 131 keys with it.
3. **Cache the mermaid art** per (fence source, width). The only creak that exists today,
   and the cheapest: same input, same output, and the TUI re-renders the same fences on
   every resize.
4. **Make `annotateSource` one pass**, then delete the occurrence bound. Correct order;
   the reverse is a quadratic.
5. **Only then** the search path — and the fix there is not to optimise the scan but to
   stop running it on the keystroke. The file list and the registry index are
   query-independent; hold them, and re-scan only the body channel.

What would change my mind: if the naming layer is judged not worth trusting — if keys
stay a convenience and search stays the primary way in — then step 5 moves first and the
naming work is optional. That is a real position, and it is the reader's to take, because
it is about how the silo is *used*, not about how it performs.

## Evidence

Six probes, all in `tmp/` (scratch, gitignored), plus one synthetic corpus set:

- `tmp/real-baseline.ts` — the real silo: 293 visible documents, 2.09 MB, `--entries`
  44–66 ms wall.
- `tmp/scale-probe.ts` — builds `tmp/scale/corpus-{1,4,16,64}x` and times the walk, the
  registry channel, the body channel, and the whole entry stream.
- `tmp/fzf-pipe-probe.ts` — the consumer's half: `fzf --filter` over 20,224 rows.
- `tmp/render-scale-probe.ts` — the render against fence count and against prose size.
- `tmp/kv-profile-probe.ts` — the store's own operations: resolve, resolve-with-Map,
  `callsignForFile`, `loadCallsigns`, priced per key.
- `tmp/key-space-probe.py`, `tmp/bootstrap-collision-probe.py`,
  `tmp/bootstrap-series-probe.ts` — the vocabulary, the birthday bound, and the series.
- `tmp/splice-cliff-probe.ts` — where the paint stops being cheap, at two densities.

Caveat: the corpora above 4× are generated prose. The *shape* is measured; the constants
would move on a corpus with longer files and denser cross-references. Every figure taken
from the real silo is marked as such.

## Related

- `briefs/2026-09-15-brief-callsign-every-document.md` — the brief whose phase 4 this
  gates, and whose preconditions it amends
- `docs/2026-09-15-the-cap-is-on-the-wrong-quantity.md` — the note this corrected, and
  the one quadratic it found
- `docs/2026-09-15-the-search-panel-speech-first.md` — the panel; this note is why the
  enumeration belongs off its keystroke
- `src/root.ts` — the resolver, and the Map it does not hold
- `scripts/reg-sync.ts` — the bootstrap, and the stopword list that inverts a name
- `AGENTS.md` — the three-concerns split, which is the reason the render axis is flat
