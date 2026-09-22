---
date: 2026-09-16
kind: design note — the documentation layer's own cost curve, and the two boundaries it has
lineage: an outside read of the silo against a sibling repo (pretext, a browser text-layout
  library), and the questions it produced — *does documenting everything justify itself*,
  *is there a scaling limit*, *is there a level of over-complete that is overly over-complete*.
status: open — nothing is built. One boundary is already crossed; the other two are measured
  from the silo's own numbers.
---

# The silo scales. The process is the thing that creaks.

> ◆ The scaling note (`docs/2026-09-15-the-scaling-profile.md`) measured the store and found
> the boundaries at ~700 and ~3,000 documents, with point reads flat forever. That is
> correct, and it is the *technical* profile. It is not the whole profile. Measured on the
> commit history, **documentation's share of commits rose 39% → 50% → 49% → 58% → 77%** over
> four weeks while code commits fell **95 → 69 → 17 → ~12**. The store has ten times of
> headroom. The process does not have ten times of headroom, and it may not have two.

## What was measured

Everything below is taken from the working tree on 2026-09-16, on `feat/callsigns`.

| Quantity | Value |
|---|---|
| TypeScript, excluding `node_modules` and `tmp/` | 10,311 lines across 43 files |
| Markdown across the six registered tiers | 38,635 lines across 297 files |
| Prose : code | 3.75 : 1 |
| Dated documents (all tiers) | 204 |
| Documents with the silo itself as subject | 35 of 245 titled docs (14%) |
| Playbooks describing the process, not the product | 9 of 15 |
| Commits, by week | 33 · 200 · 263 · 110 · 26 (W38 partial) |
| Documentation share of commits | 39.4% · 49.5% · 49.4% · 58.2% · 76.9% |
| Code commits, by week | 16 · 95 · 69 · 17 · 6 |

For comparison, `pretext` — a published browser text-layout library — carries 30,004 lines of
TypeScript against 4,808 lines of markdown: a prose:code ratio of **0.16**. The two repos are
the same genus and opposite metabolisms.

## The inference: doc density is a function of oracle scarcity

Pretext's oracle is external and hostile: three browsers, versioned, undocumented, that
disagree with each other and with their own canvas. It can afford thin prose because every
claim in its `RESEARCH.md` can be re-checked against a browser tomorrow.

The silo has no external oracle. Nothing outside it can say whether
`BRF-CALLSIGN-EVERY-DOC` is still true. So the prose has to police itself — and that is
exactly why the silo needs a registry, callsigns, a prefix lint and a palimpsest protocol,
and why pretext needs none of them.

**Doc density is inversely proportional to oracle strength.** The silo's 38,635 lines of prose
are not a taste; they are the price of having no browser to ask.

## Does it justify itself? Yes — but not for the reason it claims

`docs/2026-08-28-overcomplete-documentation.md` argues the payoff is that *"cruft has nowhere
to hide."* That is the stated rationale. The observable payoff is narrower and stronger:

1. **The callsign brief overturned its own premise before any code was written.** Its Notes
   record *"The brief's own first premise was wrong"* — the reach probe killed the assumption
   the brief was founded on, and the brief says so in its own text.
2. **The scaling note found four live defects and reordered the work.** Two of them
   (`resolveByCallsign` is O(N); the bootstrap can invert a negation) were on the critical path
   of a phase that planned to mint 131 keys with a broken generator.
3. **ADR-CHUNK-SEQUENCE-038 found that the generator does what the lint forbids.**
   `avoidingCollisions` mints the ordinal the same ADR reserves, and `findCallsignCollisions`
   already forbids it. That contradiction existed in the code and nothing had noticed it.

The load-bearing part is **"even new ideas"** — but only because ideas are written as
*claims that can be wrong*. The silo's briefs carry preconditions stamped Verified/Not
verified and acceptance criteria stated "each by command". That is a falsification engine.

A note-taking habit without that is a diary. The difference is not volume; it is whether the
document has a way to fail.

## The two boundaries

**Technical — measured by the silo, in `docs/2026-09-15-the-scaling-profile.md`:**

- ~700 documents: the two-token key space starts colliding. 2× this silo.
- ~3,000 documents: per-keystroke enumeration crosses 100 ms. 10× this silo.
- Never: point reads and dereference. Neither has a corpus term.

**Process — not measured anywhere, and already crossed:**

Documentation is not free at the point of writing; it is expensive at the point of *reading
and discharging*. Each document creates obligations:

- A brief creates preconditions to verify and acceptance criteria to meet.
  `BRF-CALLSIGN-EVERY-DOC` alone generated **nine** work items.
- An ADR creates a reversal to run and a playbook to amend.
- A note creates claims that later notes must correct — the scaling note corrected the cap
  note, which had itself been written to correct a probe.

That fan-out — roughly 1:9 into future work — is the drag. And it compounds: the 35 documents
whose subject is the silo now need the silo's own machinery to stay coherent, which is
precisely what the callsigns work is. When the map needs a linter, the map has become
territory.

The process boundary is therefore **not a document count**. It is the ratio of
decision-recording to decision-executing. At 77% documentation, the silo is a publishing
house that occasionally ships a binary.

## Where over-complete becomes overly over-complete

The threshold is not length. It is **whether the document can be checked**.

- The scaling note is 254 lines and earns every one: probes, tables, caveats, a named fork, a
  stated position on where the author would land.
- `docs/2026-08-28-overcomplete-documentation.md` is 63 lines of unbroken affirmation. No
  alternatives, no measurements, no preconditions, no way to be false. It is the one document
  in the silo that violates the silo's own epistemics — and it argues for the methodology,
  which is the tell.

Both live in `docs/`. And `docs/` is the tier with **no JSONL index, no callsign requirement,
and 131 unnamed documents** — the one tier that violates `AGENTS.md` rule 6. The ungoverned
prose accumulates in the ungoverned tier. That is not a coincidence; it is the system showing
where its immune response is missing.

So the working test, stated once:

> A document that can be wrong and can be checked is an asset at any length.
> A document that cannot be wrong is decoration, and decoration is what fills the tier with
> no registry.

Leading indicator to watch: the meta-layer. 9 of 15 playbooks describe the process rather
than the product, and 14% of documents have the silo as their subject. Meta-documentation
grows superlinearly — every layer needs a rule, and every rule needs a document.

## Lessons

1. **Doc density tracks oracle scarcity.** Find your oracle first; let it set the prose
   budget. Copying the *form* across repos (pretext adopting a registry, the silo adopting a
   browser-shaped test suite) would be the error. Copy the *function*.
2. **Write ideas down in a form that can be wrong.** Preconditions with a Verified field are
   what make a brief a falsification engine rather than a diary.
3. **Meta-documentation compounds.** Playbooks about playbooks are a leading indicator, not a
   rounding error.
4. **Derived fields rot.** Both repos have one: the silo names it (D6, `summary`-derived-once);
   pretext has the same trap in checked-in snapshots refreshed only when a human remembers.
   Lint them or lose them.
5. **A flat list of open items is a graveyard.** Pretext's `ENGINE_FOLLOWUPS.md` holds 117
   unowned bullets; the silo's briefs carry Status / Preconditions / Acceptance / Related and
   therefore get closed. The per-item shape is the transferable asset.
6. **Identity outlives content.** The naming layer creaks first in both repos — before search,
   before rendering. A path breaks on rename; a key does not.
7. **Structure without a gate is decoration.** `just check` validates the registry, not the
   content. Pretext's `AGENTS.md` states a refresh rule; its CI is a demo-site deploy. Both
   have a gap between *we said to do it* and *it is enforced*.

## Where I would land

1. **Instrument the process, not just the store.** The silo can measure its commit mix in one
   command. It has not, and the trend is four weeks old. Add it to `just island` so the ratio
   is visible beside the board.
2. **Gate the ungoverned tier.** Either register `docs/` (already step 5 of the callsigns
   brief) or declare it the scratch tier explicitly. The current state — a tier that is
   neither registered nor scratch — is where the decoration collects.
3. **Give every document a way to fail.** Not a format requirement for all 297 — a rule for
   the *front door*: a document that argues for a position must carry either a measurement or
   an alternative it rejected.
4. **Then** the technical work, in the order the scaling note already gives: hold the Map,
   demote the bootstrap from generator to lint, cache the mermaid art, make the splice one
   pass, and only then move search off the keystroke.

What would change my mind: if the 77% week is a phase boundary rather than a trend — the
callsigns line is document-heavy by nature, and the silo is mid-flight on a naming layer that
is itself prose. Two more weeks of data settle it. That is worth taking before acting.

## Evidence

- `git log --pretty=format:'%ad|%s' --date=format:'%Y-W%V'` — the commit mix and its weekly
  buckets. Commit type classified by conventional-commit prefix; `Merge` counted as neither.
- `find briefs decisions debriefs docs explainers advisories -name '*.md'` — 204 dated
  documents, bucketed by ISO week from the filename date.
- Title census: 245 documents with an H1, type prefix stripped, 35 matching a silo-subject
  pattern.
- `docs/2026-09-15-the-scaling-profile.md` — the technical boundaries, and the four defects.
- `briefs/2026-09-15-brief-callsign-every-document.md` — D6, the nine work items, the false
  premise, and the two same-day amendments.
- `decisions/038-the-chunk-sequence.md` — the reversal, and the generator/lint contradiction.

Caveat: commits are a crude proxy for effort. A `docs` commit may be one line; a `feat`
commit may be five hundred. W36 contains 64 merge commits, which are counted as neither and
suppress that week's code figure. The direction of the trend is unambiguous; the magnitudes
are indicative, not exact.

## Related

- `docs/2026-09-15-the-scaling-profile.md` — the store's profile, which this note is the
  complement to rather than a correction of
- `docs/2026-08-28-overcomplete-documentation.md` — the stated rationale, and the one
  document that cannot fail
- `briefs/2026-09-15-brief-callsign-every-document.md` — D6, and the tier with no index
- `AGENTS.md` rule 6 — the registry principle, and the directory that has not met it
- `playbooks/silo-playbook.md` — where a process rule for this would be written
