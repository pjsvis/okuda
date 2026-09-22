---
date: 2026-09-15
kind: design note — three claimed invariants, the one that holds, and what a database may be for
lineage: the reader's 2026-09-15 session — *the ISO-date-string, the call-sign, and
  the file path are all invariants … we do not need a database yet but if we were to
  consider one it would be sqlite … the sqlite database would be regenerated from the
  file system and the call signs, it would be ephemeral and solely there to make the
  search fast* — and then, *let us consider the DuckDB columnar database schema and
  whether it is of interest to us*. Written against
  `docs/2026-09-15-the-scaling-profile.md`, whose step 5 this sharpens: the tail is a
  constant, and here is what an index on top of it may and may not do.
status: open — nothing is built. One live defect, one reserved decision, and a
  tokenizer finding that would otherwise be a silent loss of results.
---

# An index may cache the invariants. It may not invent one.

> ◆ The surface area is being reduced to three things — the path, the callsign, the
> date — and **the tree has one of them**. The path is universal (318/318); the
> callsign covers 143 of 318; the date is in the file for 167 and comes from **file
> mtime** for the other 151, of which **95 carry an ISO date in their own filename
> that the derivation never reads**. None of that is database work — it is one branch
> in `deriveDate` and one undecided rule. And the index those three would carry is
> the **fourth** fix, not the first: measured, the body scan is **30% of a keystroke
> today and 85% at 64×**, and the tokenizer that makes an index correct is not the
> default one.

## What we are deciding

Whether a database belongs in this silo at all, and if so what it is *for*. The
position on the table: no database yet; SQLite if ever; ephemeral, regenerated from
the filesystem and the callsigns; solely to make search fast. And a second candidate,
DuckDB, raised as a columnar alternative.

Two questions decide it, and neither is settled by preference. **Can the index be
built cheaply enough to be thrown away?** And **does it return the same results as
the thing it replaces?** The second one has a surprising answer.

## The three claimed invariants, measured

`tmp/invariants-probe.ts`, 318 tracked documents.

| key | the claim | measured |
|---|---|---|
| **path** | invariant | 318 / 318 |
| **callsign** | invariant | 143 / 318 |
| **date** | invariant | 167 / 318 |

Three footnotes, all load-bearing.

**The path is authoritative, not immutable.** A rename changes it and the registry
survives — a callsign keys on the registry *record*, never the filename stem. So
`invariant` here means *the truth*, which is I4 from the scaling note, not *frozen*.

**The callsign's stability rule does not exist yet.** BRF-CALLSIGN-EVERY-DOC step 8
is the open question: freeze the name (and accept it describes an old title) or
re-mint it (and break every note citing it). Until that is an ADR, the callsign is a
convenience rather than an invariant, and nothing should key on it. 175 documents
have no name at all.

**The date is the one that is not merely incomplete but wrong.** 151 of 318 take
their registry date from a value `git` does not preserve. Below.

## The defect — the derivation omits the branch that is already there

`deriveDate` (`scripts/reg-sync.ts:190`) reads frontmatter `date:`, then a
`**Date:**` line, then **file mtime**. It never reads the filename.

```ts
const fm = content.match(/^---\n[\s\S]*?date:\s*(\d{4}-\d{2}-\d{2})/m);
if (fm) return fm[1]!;
const bold = content.match(/\*\*Date:\*\*\s*(\d{4}-\d{2}-\d{2})/);
if (bold) return bold[1]!;
return statSync(path).mtime.toISOString().slice(0, 10);   // ← the checkout's date
```

`git` does not preserve mtimes, so a date from mtime is the date of the *checkout*.
It is stored in the registry, and nothing re-derives it. So the stored date for those
151 documents is an artefact of when the tree was cloned.

And **95 of those 151 carry an ISO date in their own filename** — `docs/2026-08-29-…`,
`briefs/2026-09-13-…` — which the derivation never looks at. The invariant is already
in the corpus; the code just does not read it.

Adding the filename as the last branch before mtime converts those 95 from *dated by
the checkout* to *dated by the name*. One line, no dependency, and a precondition for
the date ever being a column.

## Where one keystroke goes

`tmp/keystroke-decomposition.ts` — warmed, median of five to seven runs. The channels
sum to the end-to-end figure, which is the check that they mean anything.

| corpus | documents | MB | walk | registry | body scan | total |
|---|---|---|---|---|---|---|
| 1× | 317 | 2 | 5.9 | 14.8 | 9.6 | **32** |
| 4× | 1,264 | 7 | 7.5 | 15.2 | 17.7 | **39** |
| 16× | 5,056 | 27 | 9.9 | 14.3 | 52.7 | **76** |
| 64× | 20,224 | 108 | 25.0 | 20.2 | **199.2** | **235** |

◆ The walk and the registry are the **fixed half** — 21 ms at 1×, 45 ms at 64×, and
the registry channel is flat at 14–20 ms across a 64× change in corpus size. The body
scan is the only term that grows, linear at ~1.8 ms/MB.

So a full-text index targets the right thing and buys **less than a third of today's
cost**. It is the fourth fix, after the Map, the constant tail, and the mermaid cache
— all three of which are free and none of which adds a dependency.

And the largest single cost *today* is the registry channel, 14.8 ms of 32, which is
143 rows of structured data. Holding the parsed rows beats any database there, and
costs nothing.

## The index, measured — and the tokenizer is the whole decision

Bun ships SQLite in-process with **FTS5 compiled in**, so the dependency cost is zero
and is not the question. The question is the two above, and the first measurement is
disqualifying.

**A token index does not find substrings.** The body channel is `rg -F -i`, a
case-insensitive fixed-string match. FTS5's default `unicode61` tokenizer matches
whole tokens, so `cap` finds `capacity` in one and not the other:

| query | `rg -F -i` | `unicode61` | `trigram` | trigram misses |
|---|---|---|---|---|
| cap | 145 | 29 | 156 | **0** |
| splic | 2 | 0 | 2 | **0** |
| vector | 83 | 74 | 83 | **0** |
| address cap | 5 | 7 | 5 | **0** |
| **99** | 70 | 38 | **0** | **70** |
| no-speech | 9 | 16 | 9 | **0** |
| callsign | 188 | 184 | 188 | **0** |

◆ `unicode61` **under-approximates** — for `cap` it finds 29 of 145, silently losing
80% of the answer. A candidate-narrowing index may return *more* than `rg` and let
`rg` confirm; it may not return *less*, because those documents are simply gone. So
the default tokenizer is disqualifying, and the failure is silent: the search would
have looked fast and been wrong.

**`trigram` is the tokenizer that works.** It indexes three-character sequences and
matches inside words. It over-approximates (`cap` → 156 against `rg`'s 145, which
`rg` then confirms) or matches exactly, on six of seven queries.

**And it has a hard floor: three characters.** `99` returns **zero** — a two-character
query has no trigram. That is not a corner case in this silo. The concordance search
is *progressive*: the reader's first keystrokes are one and two characters, and the
two-digit gesture space — `12`–`98`, `99` — is built entirely from two-character
addresses. So the design is necessarily a hybrid: the index narrows at three
characters and above, and the scan serves below it.

**The build is the other constraint.**

| variant | build | index size | vs corpus |
|---|---|---|---|
| `unicode61` | 20.1 ms | 3.57 MB | 170% |
| `trigram` | **125.8 ms** | **9.92 MB** | **471%** |
| `trigram`, contentless | 137.7 ms | 7.59 MB | 361% |

The trigram build is **13× the body scan it replaces**, and the index is 4.7× the
corpus. So it cannot be rebuilt per keystroke — that is a catastrophic loss. It is
built **once per session and held**, invalidated against the walk, which is 6 ms and
therefore cheap enough to run every time.

Per query it is decisive: `rg` over the corpus is 13.2 ms and FTS5 trigram is
**0.1 ms**. The build pays for itself after roughly ten queries, and a session types
far more than ten.

## DuckDB — columnar is the wrong model, and the real use is elsewhere

DuckDB is an in-process, dependency-free, MIT-licensed analytical database with a
**columnar-vectorized** execution engine. It is explicitly built for OLAP: *"complex,
relatively long-running queries that process significant portions of the stored
dataset"*, where *"changes to the data are expected to be rather large-scale."*

**That is not our query.** Ours is a needle: which of 318 files contain this
substring, returning rows. Columnar storage pays when you scan a few columns of many
rows; for a text lookup you read the whole column either way. And **DuckDB has no
full-text index in core**, so its answer to "find text" is `LIKE` or a regexp over a
column — a full scan. Which is exactly what `rg` already does, but in-process and
vectorised, at the cost of a large native dependency and RE2 in place of Rust's regex
engine — while the concordance grammar (`|` OR, `!term`, `@date`, `dir/`) is built on
`rg`'s own flags.

**Where DuckDB is genuinely interesting: the probes, not the runtime.** It reads the
silo in place with no import step:

```sql
select filename, content from read_text('**/*.md');
select * from read_json_auto('decisions/INDEX.jsonl');
```

`read_text` globs, returns `filename` / `content` / `size` / `last_modified`, and uses
projection pushdown so omitting `content` avoids reading the data at all. So the
entire silo — 318 documents and five JSONL registries — is a query away, with no
schema, no import, and no staleness. That is the *ephemeral, regenerated from the
filesystem* property with **zero code**.

And this silo generates a whole genre of ad-hoc analysis scripts in `tmp/`: the
census, the key space, the prefix namespace, the bootstrap collisions, the diagram
policy, the invariants, the scale curve. Each re-derives the same corpus facts in
TypeScript. Those are OLAP queries wearing the costume of bespoke probes.

**DuckDB never touches the byte stream**, so the three-concerns test is satisfied
trivially: it is a maintainer's tool, like `rg` and `jq`, and not a dependency of
okuda at all. That is the honest scope of its interest.

## The fork

**A — the index narrows, and `rg` confirms.**

- FTS5 with the trigram tokenizer, built once per session, held, invalidated on the
  walk. Below three characters the scan serves directly.
- The concordance grammar, the regex semantics, and the result set stay exactly
  `rg`'s. The index only decides which files to look at.
- Costs an index 4.7× the corpus in a cache directory, and a hybrid with two code
  paths to keep honest.
- Preserves the property that matters: a result is never silently missing.

**B — the index answers, and the grammar moves into SQL.**

- No `rg` in the search path. The channels become queries.
- One engine, one code path, and no spawn at all.
- Gives up `rg`'s regex engine and the grammar built on its flags, and takes on the
  obligation to prove the new one returns the same rows. The `99` case shows how
  quietly that proof can fail.
- Reimplements a component the silo has already measured and trusts.

## What is not in question

- **The trigger.** No database at 318 documents, and the trigger is measurable rather
  than felt: the keystroke crosses 100 ms at roughly **30 MB** of corpus, so this silo
  has an order of magnitude of headroom and `tmp/scale-probe.ts` already measures it.
- **Ephemeral, regenerated, cache-only.** I4 holds and the index is its purest
  instance. It may cache the invariants; it may not become one.
- **SQLite over DuckDB for the runtime.** The runtime wants a needle index, and FTS5
  is one. DuckDB has no equivalent in core.
- **The render path.** Flat, corpus-independent, and it needs none of this.
- **The Map, the constant tail, the mermaid cache.** All three come first, all three
  are free, and none of them is a database.

## Where I would land

**A, on the trigger — and the derivation first, because it is the actual defect.**

The instinct on a storage question is to design the schema, and the schema is the
least interesting part of this. What the measurements say is that the two things the
index would be built on are not yet trustworthy: the date is derived from a value git
does not preserve, and the callsign's stability is an open question. An index over
unstable keys is a cache of a mistake, and it will be *fast* about it.

So the order is:

1. **The `deriveDate` branch.** One line, 95 documents, and it is a precondition for
   the date being a column at all. This is a live defect and it does not wait for a
   database.
2. **The callsign stability ADR.** Step 8 of an already-open brief. Until it lands,
   nothing should key on a callsign.
3. **The Map and the constant tail.** Free, no dependency, and between them they take
   the fixed half down and stop re-enumerating a stream whose membership never
   changes.
4. **Then, at ~30 MB, SQLite as a candidate-narrower** — trigram, built once, hybrid
   below three characters, invalidated on the walk. And the decision written down with
   the tokenizer named, because the default one is wrong in a way that loses results
   silently.

What would change my mind: if the search grammar is judged not worth keeping — if
`rg`'s semantics are incidental rather than the product — then B moves first, and the
question stops being "what indexes the corpus" and becomes "what replaces the
grammar". That is a real position, and it is about how the silo is *used* rather than
how it performs.

And on DuckDB: adopt it as a **maintainer's tool** whenever the next probe is written,
and not as a dependency. It costs nothing to try — it reads the silo where it sits —
and if it makes the census a query instead of a script, that is a real saving that
never touches okuda's byte stream.

## Evidence

Six probes, all in `tmp/` (scratch, gitignored):

- `tmp/invariants-probe.ts` — the three claimed invariants against 318 documents.
- `tmp/keystroke-decomposition.ts` — the warmed channel breakdown; the check that the
  columns sum to the end-to-end figure.
- `tmp/scale-probe.ts` — the synthetic corpora at 1×/4×/16×/64×, re-run 2026-09-15.
- `tmp/sqlite-fts-probe.ts` — the build cost, and `unicode61` against `rg`.
- `tmp/fts5-trigram-probe.ts` — the trigram tokenizer, the coverage table, and the
  three-character floor.
- `tmp/chunk-sequence-probe.ts` — the trailing ordinal, from the same session.

Caveat: the corpora above 4× are generated prose, so the *shape* is measured and the
constants would move on a corpus with longer files. Every figure taken from the real
silo is marked as such. And two probe artefacts were caught by checking the arithmetic
rather than the output — a `registryRows` column measured four times over, and a
file-backed index deleted while its handle was open — so the sums here are quoted
deliberately.

## Related

- `docs/2026-09-15-the-scaling-profile.md` — the cost curve, the four defects, and the
  order this note extends
- `docs/2026-09-15-the-cap-is-on-the-wrong-quantity.md` — the one quadratic
- `docs/2026-09-15-the-search-panel-speech-first.md` — the panel this index would sit
  under
- `docs/2026-09-14-speech-driven-design.md` — *one file, one artifact*, and the ≤90
  bisect
- `briefs/2026-09-15-brief-callsign-every-document.md` — the naming layer, and the
  stability rule this note treats as a precondition
- `decisions/038-the-chunk-sequence.md` — the trailing ordinal, from the same session
- `scripts/reg-sync.ts` — `deriveDate`, and the branch it does not read
