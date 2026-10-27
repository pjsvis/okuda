---
type: Brief
callsign: BRF-SRC-LINE-LEDGER
date: 2026-09-24
---

# Brief: The source-line ledger — `10` edit lands the editor at the eye

**Created:** 2026-09-24
**Status:** Rejected — 2026-10-27, the operator's call: too old, and the corpus has moved on. Archived rather than deleted — replunder if the need returns. The idea is not judged, only its queue position.

## TD

none — the ledger's mechanism has an unprobed assumption (call order == block order); `td epic create` after the P-1 probes confirm or kill it. Writing the task list before the probe is an invented plan.

## Lineage

the leaf teardown, 2026-09-24 (RivoLink/leaf — a feature-maximalist newcomer whose one clean feature is the `{$line}` editor jump). Verbatim, the operator, on seeing it: *"lets not think of lines, we use an anchor"* — then *"concur"* on the lookup-not-search verdict. The wire: `src/tui.ts:756` already carries this brief's name — `edit: () => flash("edit current — the edit brief is not wired yet")`. The verb `10` is bound; only its actuator is missing.

## Extends

`decisions/010-bounded-anchor-proportional-fallback.md` (ADR-BOUNDED-ANCHOR-010) — un-parks its parked alternative row, whose gate was *"no second consumer on the board."* This brief is that consumer arriving.

## Objective

Wire the `10` verb: open the current document in the declared editor at the
reader's **eye line** — the anchor's source line, computed at handoff time by
**lookup**, never by search, never stored. Deliver the prerequisite as its own
artifact: a **source-line ledger** (`srcLine[]` parallel to the rendered
`lines[]`), emitted by `renderDocument`, testable standalone.

## Why — reasoned, not asserted

**The line number is editor currency, not okuda currency.** okuda's reader
state is anchor-native: scroll survives resize because the anchor (ADR-010) is
rendered text, not a row index. An editor wants a *source* line. The handoff
is therefore a **currency conversion at the boundary**: anchor in,
`nvim +{$line}` out, computed against the current render at the moment of the
keypress. The line number exists for one millisecond between lookup and
substitution. Laminate it into state and it is wrong the moment the file
breathes (wrap, resize, watch-mode save).

**Leaf got the wire format right and everything else wrong.** Its `{$line}`
template is stateless substitution — the environment does the rest, okuda's
own compositing-outside rule. What it substitutes is derivation; the value's
lifetime is the spawn call. We adopt the convention, not the feature-list
around it: no TOC sidebar, no mouse capture, no digit-buffer misfires
(leaf's `01, 02` sidebar labels afford two-digit addressing its single-keystroke
`1-9` map doesn't implement — a map whose territory never shipped).

**Why lookup, not search — the rejected alternative, with its teeth.** The
obvious cheap version: take the ADR-010 anchor fingerprint (stripped text of
the eye line) and text-match it against the **source file**. This is wrong on
okuda's three headline features, each a place where the rendered plane and the
source plane have diverged:

| Rendered plane | Source plane | Text-match result |
|---|---|---|
| Wrapped fragment: half a sentence | The full source line | No match — fragment ≠ line |
| Mermaid fence → 30 lines of ASCII art | Six lines of `graph TD` text | No match — the bytes exist nowhere in source |
| Frontmatter → rendered table | YAML keys | No match — elided pre-parse (render.ts pre-pass 1) |

And ADR-010 already documented what unbounded text-match does when it grabs
distant duplicates: jump to top. The bounded radius saves the *resize* case
only because reflow is small; a handoff match would be cross-plane and
unbounded. **No text-match interim.** If the ledger isn't built, `10` stays a
stub — an honest flash beats a guess wearing a lookup's clothes.

**The parked row's premise has changed, not its verdict.** ADR-010 sized
logical-line tagging "between *small* and *unblocks a lot*" and parked it for
want of a second consumer: the resize anchor's failure mode was invisible
(wrong match on identical content = the eye lands on the same words). The
editor handoff has no such forgiveness — the cursor landing on the wrong line
is visible to the operator and to the editor. Per the palimpsest protocol:
not a reversal (the bounded anchor keeps its resize job), but the parked row
gets its supersession ADR — **ADR-043** — recording the ledger's mechanism.

## Design sketch

**The ledger (phase 1).** `renderDocument` emits `{ lines, srcLine[] }` (or a
type widening at the two call sites). Mechanism, in three owned layers and one
borrowed assumption:

1. **Pre-pass offset map** (ours, deterministic): `stripFrontMatter`,
   `neutraliseSetext`, `interceptMermaid` already rewrite the source before
   Bun.markdown sees it — line numbers drift *before parsing*. Each pre-pass
   records its line-delta map; the mermaid placeholder block maps to its
   original fence's start line.
2. **Structural scan** (ours): one pass over the rewritten source in block
   order — heading, list, table, fence, rule, paragraph — assigning each block
   its start line. The closed grammar bounds the vocabulary; this is not
   CommonMark re-parsing, it is enumerating the seven things okuda renders.
3. **Tag protocol through the render plane** (ours, with precedent): the
   block-id rides the existing string-tag machinery (grammar.ts, decisions/005
   — RAW and PB tags already survive `wrapANSI` and are swept at `finalize`);
   a `ctx` call-order cursor (the `ctx.listSeq` pattern) draws block start
   lines in identical call order. `finalize` consumes the tags and emits
   `srcLine[]`, one entry per physical line — wrapped fragments share their
   origin line.
4. **The borrowed assumption** (probed, not free): Bun.markdown handlers are
   post-order, string-in/string-out, no source positions (ADR-010's
   alternatives table), but call order is deterministic and `probeListDepths`
   *already relies on it being source order for lists* (render.ts: "same
   source, same parser — deterministic sequence"). The ledger generalises
   that reliance from lists to every block. P-2 tests it against the corpus.

**The handoff (phase 2).** The `10` actuator: compute the eye line's physical
index (`anchorFor`'s index, current render, current scroll — nothing stored),
look up `srcLine[idx]`, build the editor spec from the clone grammar's
existing integration matrix (`src/clone.ts`: `OKUDA_EDITOR ?? EDITOR ?? vi`;
`OKUDA_CLONE` ∈ {edit-terminal, tmux, cmd}) with the `{$line}` substitution —
`nvim +{$line} +"normal! zz"`, `code -g {$path}:{$line}`, the operator's
declared template. The handoff is a **launcher-genus action** (fzf, clone,
editNew precedent — the boundary-crossers live at the edge, visibly), not a
rendering feature. The reader keeps its own glass; the editor opens beside it
(watch mode re-renders as saves land — BRF-TUI-LIVE); nothing transfers.

**Contract separation — do not stretch the anchor.** ADR-010's anchor promises
*reflow-stability* (same bytes, new width). Watch-mode save promises
*content-drift-stability* (same words, new position) — a different contract
the text anchor serves today and keeps. The ledger promises *position-identity*
(same line, any width) — which is exactly what an editor spawn needs. Three
contracts, three mechanisms, no quiet merging.

## Ship order

1. **ADR-043** — the ledger's decision, supersession of ADR-010's parked row
   (premise: second consumer exists; verdict: lookup not search).
2. **Phase 1 — the ledger**, gated by P-1/P-2 probes below. Standalone tests;
   no consumer forced (resize keeps ADR-010's mechanism — migration is a
   separate ADR, see Deferred).
3. **Phase 2 — wire `10`**: actuator, editor spec with `{$line}`/`{$path}`,
   flash feedback, tests.

## Scope

**In:** `renderDocument`'s return type (ledger emission); the pre-pass delta
maps; the structural scan; the block-id tag through `wrapANSI`/`finalize`;
the `10` actuator + editor spec template; `src/clone.ts` extension for
`{$line}`; tests (ledger properties + handoff).

**Out:** migrating the resize re-anchor to source coordinates (follow-on
candidate, own ADR — until then two coordinate systems coexist: ledger for
handoff, text anchor for resize; ADR-010's `stripForAnchor`/`finalize`
lockstep coupling stays); watch-mode re-anchor changes; a TOC sidebar (leaf's
misfiring numbered navigator is the cautionary exhibit); any mouse work.

## Preconditions

- [ ] **P-1 — parser probe** (`tmp/handler-meta-probe.ts`): does any handler
      `meta` carry source positions in current Bun (ADR-010's finding was
      bun 1.3.8)? Expected: no. If yes, the structural scan shrinks to a
      lookup and the ADR records the cheaper mechanism.
- [ ] **P-2 — order-correlation probe** (`tmp/block-order-probe.ts`): on the
      repo corpus (~42 decisions, 76 briefs), tag every handler call with
      sequence number; structural scan tags every block; assert the two
      sequences agree on block order. Tables with inline code and loose-list
      continuations are the expected stress cases.
- [ ] **P-3 — wrap propagation probe** (`tmp/src-line-wrap-probe.ts`): a
      long wrapped paragraph and a mermaid diagram — every physical line
      carries its origin line; the diagram's 30 rendered lines all name the
      fence's start line.

## Risks

| Risk | Exposure |
|---|---|
| Call order ≠ block order on some structure (lazy continuation, nested blockquote) | The ledger lies for that structure; P-2 surfaces it. Mitigation: the ledger's failure is per-block, and the handoff clamps to the nearest honest line rather than guessing — bounded, not catastrophic. |
| Pre-pass drift: a fourth pre-pass is added later without a delta map | Ledger entries silently shift. Mitigation: the delta map is part of the pre-pass contract, tested; `renderDocument` is the single seam. |
| Correlation is post-hoc — the thing ADR-010's alternatives table distrusted | The rejected row was *character-offset* correlation in the *rendered* plane (unstable across widths). This is *structural* correlation over the *source* bytes (width-independent) with an existing precedent (`probeListDepths`). ADR-043 must say this in as many words. |
| Two coordinate systems coexist (deferred migration) | The doubled lockstep cost: `stripForAnchor` stays ADR-010's, `srcLine` is the ledger's. Bounded by the Deferred gate — migration is a candidate consumer, not a rider on this brief. |

## Deferred (named, not slipped)

**Resize re-anchor migration.** Once `srcLine[]` exists, the resize anchor can
become source-coordinate lookup (remember `srcLine[eye]`, re-render, pin the
physical line that names it) — no text match, no bounded radius, no
proportional fallback for the same-bytes case. That is a supersession of
ADR-010's *decision*, not this brief's rider. It ships as its own ADR when the
ledger's cost curve is known from phase 1. Deferring it is the honest option
until then; deferring it *forever* is the doubled coupling the risk table
names.

## Related

- ADR-010: `decisions/010-bounded-anchor-proportional-fallback.md` — the parked
  row this un-parks; the anchor contract this must not stretch
- `src/tui.ts:756` — the `edit` stub this brief wires; `anchorFor` (src/tui.ts)
  is the eye line's definition
- `src/clone.ts` — the integration matrix the editor spec extends
  (`OKUDA_EDITOR ?? EDITOR ?? vi`; the clone grammar's boundary-crossers)
- `src/grammar.ts`, decisions/005 — the string-tag protocol the block-id rides
- `probeListDepths` (src/render.ts) — the call-order-reliance precedent
- `briefs/2026-08-26-brief-tui-live-documents.md` (BRF-TUI-LIVE) — watch mode;
  saves from the editor flow back through it, no new work here
- leaf (RivoLink/leaf) — the `{$line}` wire format's origin; the numbered-
  navigator misfire as the standing cautionary exhibit for affordance/grammar
  drift
