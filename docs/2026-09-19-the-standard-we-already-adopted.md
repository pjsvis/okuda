---
date: 2026-09-19
kind: design note — the standard the silo already adopted, the tier it does not reach, and why a td id is not a citation
lineage: ADR-019 (OKF v0.2 adopted 2026-08-28) and its migration brief (shipped 2026-08-29); the reader's two questions, 2026-09-19 — *"our td database is wholly local and any references in td will not be relevant when another party clones the repo"* and *"is there scope for using Google's Open Knowledge Format here to classify the files, or do we have that under control with our registers"*; docs/2026-09-19-the-tidy-has-no-criterion.md, whose fork B proposed inventing a status vocabulary the adopted spec already enumerates
status: open — measured; nothing changed in frontmatter, in reg-sync, or in any document outside this one
---

# The standard we already adopted, and the tier it does not reach

> ◆ ADR-019 adopted OKF v0.2 a month ago and the registered tiers conform — 152
> documents, every one typed. The tier that does not is `docs/`: **155 of 157**.
> And the one field the spec enumerates that the tidy actually needs — `status` —
> is the one field the silo writes as prose. Separately, **288 `td-` citations
> across 79 documents** point at a database `.gitignore` excludes by design.

## What we are deciding

Two questions the reader asked, and they turn out to be one question:

1. Is a wholly local `td` database a defect in the documents that cite it?
2. Is there scope for OKF to classify these files, or do the registers have it
   covered?

## The answer in one line

**The registers are the adoption boundary.** Classification is under control
exactly where a register reaches — and `docs/`, the largest tier at 157 files, has
no register, which is also why it is the tier where `status` drifted into prose.

## What OKF v0.2 actually offers

Four surfaces, and it is worth being exact about which are required, because the
silo uses one and a half of them:

- **`type`** — the only always-required key. *"`type` is the only always-required
  key; a concept carrying just `type` is fully conformant (§11)."* The vocabulary
  is **open**: *"Type values are not registered centrally"*, and consumers *"MUST
  NOT reject"* a bundle for an unknown type.
- **`tags`** — *"A YAML list of short strings for cross-cutting
  categorization."* OKF declines a tag-file format: a consumer *"can synthesize
  one at consumption time by scanning frontmatter."*
- **`status`** — the one **enumerated** vocabulary in the spec:
  `draft | stable | deprecated`. *"Absent `status` ⇒ `stable`."*
- **`sources`** — provenance, each entry requiring a `resource`, *"A URI that
  uniquely identifies the underlying asset"*, with `id` *"SHOULD be present when
  the body cites the source."*

Plus two conventions that matter here: extension keys are explicitly legal
(*"Producers MAY include any additional keys"* — this is what carries `callsign`),
and **broken cross-links are tolerated by design** (*"a link whose target does not
exist in the bundle is not malformed; it may simply represent not-yet-written
knowledge"*).

## The measurement

`tmp/okf-conformance-census.py`, over every tracked markdown file, `.archive/`
excluded. §11 requires three things; condition 1 is *"every non-reserved `.md`
file in the tree contains a parseable YAML frontmatter block"* and condition 2 is
a non-empty `type`.

| tier | files | typed | gap |
|---|---|---|---|
| `docs/` | 157 | 2 | **155** |
| `briefs/` | 72 | 72 | 0 |
| `decisions/` | 40 | 39 | 1 |
| `debriefs/` | 19 | 19 | 0 |
| `playbooks/` | 15 | 15 | 0 |
| root | 9 | 0 | **9** |
| `explainers/` | 9 | 0 | **9** |
| `advisories/` | 6 | 5 | 1 |

**152 of 327.** The verdict is not "the silo is unconformant" — it is sharper than
that. Every registered tier conforms; the two apparent stragglers are not
documents (`decisions/TEMPLATE.md` and `advisories/AI-HR-MANUAL.md`). What is
outside is everything the registers do not index: `docs/`, root, `explainers/`.
The bundle root does declare `okf_version: '0.2'` correctly, and no `log.md` exists
— which is optional, so it costs nothing.

## Three surfaces, three states of repair

**`type` is in good order.** Six values in practice — `Brief` 72, `ADR` 39,
`Debrief` 19, `Playbook` 15, `Advisory` 5, `Reference` 2 — 153 documents
callsigned, and the registries green. The open vocabulary was the right call: the
silo's types are its tiers, and they did not have to be negotiated with anyone.

**`tags` is dormant.** Eleven documents declare one, all of them debriefs. So an
OKF consumer that opens this bundle sees six kinds and almost no cross-cutting
structure — it cannot find "everything about speech" without our tooling. That is
not a defect, because OKF treats `tags` as optional and the registers carry the
cross-cutting index privately. It is a *choice*, and it is worth knowing it was
made by omission rather than on purpose.

**`status` is the broken one, and it is the one the spec enumerates.** Seventeen
tracked documents carry a frontmatter `status`, every one of them a `docs/` note,
and every value is a prose sentence:

```yaml
status: awaiting players and script — a sketch, not a brief.
status: closed — a reading, not a plan. One principle carried forward:
```

§5.4 gives three values and §5.2–§5.5 are a family producers *"SHOULD follow"*
when they use it. A consumer keying on the enumeration reads nothing usable, and
the default rule (*absent ⇒ `stable`*) would silently mark every open note as
settled. This is not an imported fault — the prose values are the `docs/` house
style. **And the count understates it by exactly the newest documents:** the
census walks `git ls-files`, so the five notes written in this session, all
carrying the same prose form, are invisible to it. The tier's own convention is
the defect, and the most recent practice is the most conformant-looking and the
least conformant.

## `td` is not a citation

The reader is right, and it is worse than *"not relevant"*. `.gitignore` carries
`.todos/` under the comment **"td task database (runtime state)"** — the database
is local by design. Meanwhile `AGENTS.md` rule 3 makes it the continuity system:
*"td is the continuity system … Work not in td isn't tracked."*

Measured: **79 documents cite a `td` id — 115 distinct ids, 288 citations.** For
anyone who clones this repository, all 288 are phantom referents, and
`playbooks/td-playbook.md` — which is about *using* td — says nothing about it.

**OKF draws the line for us.** A `sources` entry requires a `resource`: a URI
identifying the asset. A row in a gitignored local database has no URI, so a `td`
id cannot be a `sources` entry — not as a matter of taste but of the field's
definition. The spec is telling us what a citation is, and a td id is not one.

What it *is*: a local handle for the work queue. That is legitimate and useful.
What breaks is a document whose **rationale** exists only behind that handle —
which is `ADR-027`'s phantom referent, arriving from a new direction. The silo
already owns the citation form that travels: the **callsign** (`ADR-024`),
*"durable and rename-proof"*. The rule this suggests is narrow and cheap:

**A document may name a `td` id; it may not depend on one.** Where the id is the
only pointer to a decision, the decision belongs in the document.

## What this does to the tidy

`docs/2026-09-19-the-tidy-has-no-criterion.md` asked which briefs are settled and
got three answers. Two things change:

**Criterion A is weaker than I priced it.** *"Tidy on `td`'s verdict"* — the five
briefs whose named issues are closed — reads a local database. The move would be
correct here and unverifiable anywhere else. It stays available as an interim
move, but it cannot be the criterion, because the criterion has to be legible to
whoever clones the tree.

**Fork B gets a standard instead of an invention.** I proposed
`open / ready / parked / settled / abandoned` — five values, chosen by me, needing
a decision of their own. OKF already enumerates three, and they happen to answer
the tidy's question exactly:

- `draft` — not yet current — **stays in `briefs/`**
- `stable` — shipped, ready for consumption — **archive**
- `deprecated` — *"kept for links and history; no longer current"* — **archive**

So the tidy becomes `status: stable | deprecated` → `.archive/`, and the silo's
richer state (`ready`, `parked`, `rejected`, the 35 distinct strings) rides an
extension key, which §4.1 makes legal. That is one vocabulary, publicly
specified, instead of one private to this repository.

**The difficulty the fork did not have.** `**Status:**` already exists as a bold
prose line, and the registry reads it. Adding a frontmatter `status` would put two
fields of the same name in one document with different values — the drift
`ADR-019` rejected an alternative over (*"two sources of truth, drift
guaranteed"*). The registry playbook's test settles it: **can it be deleted and
regenerated from the silo?** A `draft | stable | deprecated` enum cannot be
derived from 35 free-text strings, so the enum must be the record and the prose
must stop restating it.

## The fork

**A — Leave it. `docs/` is not a registered tier and OKF asks nothing of it.**
Nothing is required: OKF §11 governs the bundle, and a consumer browsing it gets
152 typed documents and the generated indexes. Cost: `docs/` is 157 documents —
the largest tier, and the one holding most of the reasoning — and an OKF consumer
sees none of it. Also: the prose `status` stays, so the tidy still has no query.

**B — Finish the adoption in the two places it stopped.** Frontmatter `type` on
`docs/` (157 files, mechanical — a `docs` type, or an honest type per document),
and `status` as the OKF enum on every tier document that carries a lifecycle at
all, with the prose demoted to an extension key or deleted. Cost: a `docs/` sweep
and a `reg-sync` change, plus a decision about the `**Status:**` line. This is the
same 73-file sweep the tidy note priced, and it is still the thing that makes
every future tidy cheap.

**C — Adopt `tags` for the cross-cutting index.** Make the registers' private
grouping visible to a consumer. Cost: a second place to keep a fact the registers
already hold, for a consumer that does not exist yet. The registry playbook's test
says no — the tags would be derivable, so they are a shadow store, not a record.

## What is not in question

- **That ADR-019 was right.** Conformance cost one key per document, it is
  additive, and the exit is deleting frontmatter. The registered tiers prove it:
  152 documents, zero drift, `just check` green.
- **That the registers stay canonical.** `INDEX.jsonl` is not markdown, so OKF
  consumers never see it, and it remains the private fast index. That is
  deliberate and it works.
- **That the `td` database should stay local.** A task database is runtime state;
  committing it would be the defect. The problem is the *citations*, not the file.
- **That a cloner losing `td` loses nothing irreplaceable.** What they lose is the
  work queue, which is genuinely local. What they must not lose is the *reasoning*
  — and that is in the documents, except where a td id stands in for it.

## Where I would land

**B, and I would start with `status`, not with `docs/`.** The `docs/` gap is large
but inert — a consumer gets no type, which is a shrug. The `status` gap is small
but load-bearing: it is the field the spec enumerates, the field the tidy needs,
and the field currently holding a sentence where an enum belongs. Fix it on the
seventy-odd documents that already declare a lifecycle, then sweep `docs/` for
`type` as the mechanical follow-up.

**On td, the rule I would write down is the narrow one:** name it, do not depend
on it. And I would put one line in `playbooks/td-playbook.md` saying so, because
the playbook that teaches td teaches nothing about what a `td` id means to a
reader who does not have the database.

**What would change my mind:** evidence that `docs/` is deliberately outside the
bundle — a decision I have not found saying so. If it is deliberate, A becomes
correct and the only work left is `status`. `ADR-019`'s scope line is *"every tier
document"*, which reads as a deliberate restriction; it does not say what a
non-tier document is for, and nothing else does either.

## Evidence

- `tmp/okf-conformance-census.py` — §11 conditions per file, the `type`
  histogram, the per-tier gap, `tags`/`status`/`callsign` counts, and the `td`
  citation census. Run with `python3`; imports nothing.
- OKF v0.2 spec, `GoogleCloudPlatform/knowledge-catalog/okf/SPEC.md` — §4.1
  (optional keys, extensions), §5.1 (`sources[].resource`), §5.4 (`status`), §8
  (`index.md`), §11 (conformance, tolerance), §12 (`okf_version`).
- `.gitignore` — `.todos/`, *"td task database (runtime state)"*.
- `AGENTS.md:9` — rule 3, *"Work not in td isn't tracked."*
- `just check` — green, and it does not look at any of this.

## Related

- `decisions/019-okf-v02-conformance.md` — the adoption, and the alternative it
  rejected on drift grounds
- `decisions/024-callsigns-are-data.md` — the citation form that survives a clone
- `decisions/027-temperament-is-downstream-of-discipline.md` — the phantom
  referent, which 288 local citations are instances of
- `briefs/2026-08-29-brief-okf-callsign-migration.md` — the migration, shipped
- `docs/2026-09-19-the-tidy-has-no-criterion.md` — the fork this revises
- `playbooks/td-playbook.md` — teaches td, says nothing about its locality
- `playbooks/registry-playbook.md` — the cache-vs-shadow-store test, applied above
