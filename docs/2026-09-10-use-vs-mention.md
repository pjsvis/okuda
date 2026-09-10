# Use vs. mention: why callsigns rubricate and paths don't

**Date:** 2026-09-10
**Type:** design note (the reference grammar's use/mention distinction, the dogfood appetite, and the promotion rule)
**Status:** Decided in dogfood talk, recorded here. No grammar change; the promotion rule (below) is the escape valve.

---

## The mechanics

`scanReferences` (`src/vectors.ts`) recognises exactly two channels: a markdown link ending in `.md` (`RE_MD_LINK`), and a callsign-shaped token (`RE_CALLSIGN`, ADR-024's vocabulary). `ADV-READER-SIDE-FILTER` hits the second; `docs/2026-09-05-search-as-shite-filter.md` in backticks hits neither: not a link, not callsign-shaped. The asymmetry isn't a rendering choice; it's the grammar's shape.

## Use vs. mention

A callsign is a **use** by shape: the shape is reserved house vocabulary, certified by a registry, resolving exactly-one (ADR-025 clause 4). Nothing shaped `ADV-FOO` is ever anything but a reference: the shape is a certificate of intent issued at authoring time. 

A bare path is a **mention**: this corpus discusses paths constantly as *examples*: search-result rows, evidence lines, folder-listing detectors. Paint every `.md`-shaped string rose and the examples get rubricated along with the references; the jump map inflates past Occam's addendum ("don't use too many links") and the 83-address cap stops being a bound and starts being a buffer. 

Rubricating every mention is **maximizing the jump map**: every "go look" becomes an invitation, and invitation-soup is the i811 pattern wearing a § glyph. The scarce silcrow is satisficing navigation: controls among information, earning their paint. (External support: the satisficing clip — the comparison engine itself is what poisons choice; scarcity of invitations is the design consequence.)

## The accident, and its convergence with the principle

The registries cover briefs, decisions, debriefs, playbooks, advisories: the *citable* tiers, referenced by number from other documents in the flow of work. `docs/` is the one tier that outgrew the registry principle without triggering it: 100+ files, no index, no callsigns. So citing an advisory finds a use; citing a design note finds only a mention. 

That is tier history, not a designed exclusion — but it converges with the design, which is why it hasn't itched. Registered tiers are **navigational**: cited like law cites §12, by number, repeatedly, from everywhere. `docs/` is the **prose** tier — design notes, explainers, clips — and prose is cited by title-phrase, not call number. The corpus's own dogfood says so: the `foucault car park` lesson: *one distinctive word beats a three-theme phrase every time*. 

A docs/ title like `search-as-shite-filter` is its callsign; the dive is its actuator. The depth tier is found by typing, which is the shite filter's own front door. Call-number chrome on ephemeral thinking would be ceremony on Stuff that gets read once and cited by name thereafter.

## The dogfood appetite is the maximizer

We came up with the grammar, and now we are dogfooding it — and dogfooding it, we just want more and more. More channels, more shapes, more paint. That appetite is the comparison engine at the grammar-development scale: every want-more is the maximizer's "something better might be out there." **Enough: we decided previously what we need.** 

The guard is already on the books: the ladder rule (build when the dogfood shows the *same* manual workaround recurring, not from appetite), and the satisficing clip's lesson turned on ourselves. 

The grammar satisfices; dogfooding it will always surface wants; the wants are not the evidence.

## The promotion rule (operative)

**If an unregistered document needs to be a formal reference, promote it to an appropriate register.**

The declared-intent channel for an unregistered doc is not new grammar: it is the registry. 

Want the doc to be a use, actuable by silcrow from another document's frame? Promote it: move it into a registered tier (or register its tier) and it gains a callsign by the existing machinery. 

The promotion is the deliberate act that declares the intent; the mention stays the default; the dive stays the recall path for everything not promoted. 

This closes the honest gap (an author previously had no grammar for "I want this docs/ reference actuable") without adding a channel, without md-links in Related sections, without `DOC-` chrome on the whole prose tier. 

Promotion on demand, not wholesale: the same ladder discipline, applied to the registry instead of the grammar.

## The one line

Callsigns are uses, paths are mentions; the silcrow is earned by declared intent, not by the shape of a string; the promotion is the declared intent for the unregistered; and the appetite for more grammar is the maximizer: we decided what we need.

## Related

- `docs/2026-09-10-benchmaxxing-considered-harmful.md` + `-review.md`: the satisficing clip and its review; the maximizing/jump-map-inflation link, and the dogfood-appetite lesson.
- `docs/2026-09-04-the-silcrow.md`: the notation; the two-render contract; the vocabulary this note reads.
- `docs/2026-09-04-nae-links-either.md`: why the md-link channel stays declined.
- `docs/2026-09-04-filter-model.md`: the ladder rule; the house vocabulary (callsign = call number).
- `src/vectors.ts`: `CALLSIGN_SHAPE`, `scanReferences`: the grammar under discussion.
