---
type: Brief
callsign: BRF-REG-CLI
---

# Brief: `reg` — the silo maintenance CLI, one entry point, one artifact

**Date:** 2026-10-08
**Status:** Rejected — 2026-10-27, the operator's call: too old, and the corpus has moved on.

## Lineage

The 2026-10-08 session — the operator's two questions: *is bm25s an enhancement
or a step too far?* (answered elsewhere: a scaling option, `BRF-BM25-EVALUATION`),
and *what are the options for turning the registry scripts into a CLI wrapped in
a Bun exe?* The second produced a design discussion whose conclusion this brief
records: the tool is worth building, its boundary is mechanical-only, and its
generality comes from the convention being the interface — never from a config.

## Objective

Consolidate the registry and lifecycle scripts into one entry point, `reg`, with a
small verb set, uniform flags, one machine-readable output mode, and **one exit
code for the quality gate** — without adding a config file, a daemon, a cache, or
any state outside the silo.

`reg` is the mechanical half of `ADR-DOCUMENT-LIFECYCLE-057` made a tool.

## The boundary — the design rule

`reg` computes and enforces. It surfaces candidates and **records a reading a
human made**. It never makes the reading.

| mechanical — `reg` owns | editorial — the human owns |
|---|---|
| sync / fix drift, regenerate `index.md` views | **classification** (duplicate / built / refused / never-noticed) |
| census, derive the reference graph | the keep-class reading |
| date, callsign, archive, prose, td-id lint | whether a warrant is carried |
| citation census, promotion/demotion candidates | the disposition, and the record of the reading |
| archive **resolution** (status ↔ flag ↔ scope) | the retire *decision* |
| the **move** once a human has decided | — |

`ADR-DOCUMENT-LIFECYCLE-057` is emphatic: the prune is *editorial, not
mechanical*, keep-class is *read for the reversal*, and an unexamined disposition
is taste. A maintenance tool that classifies is the muppet's version of this idea.
The rule above is the whole design; nothing in the work plan may cross it.

## Discipline — what must stay true

1. **Pure function of `cwd` and the tree.** No config file, no daemon, no cache,
   no state, no socket, nothing outside the silo.
2. **No parallel store.** `reg` must not create an index artifact of its own; the
   registries are the store, and any derived view is regenerable from the
   documents (the registry playbook's cache-vs-shadow test).
3. **Silo data is not tool config.** If a later silo must declare its tiers, the
   declaration lives *in that silo* beside its registries — like `INDEX.jsonl`,
   read from the tree — not in the tool.
4. **Writes are explicit.** Only named verbs write (`fix`, `retire`); every other
   verb is read-only and says so.

## Generality — the convention is the interface

`reg` is the **reference implementation of a convention**, not a framework. Any
silo that follows the convention works; there is no config because the convention
is the config. Generality comes from the tiers being uniform, never from the tool
accommodating differences — the moment generality needs a file, it has
re-introduced the config this design refuses.

- **Canonical tiers, fixed:** `briefs`, `debriefs`, `decisions`, `playbooks`,
  `advisories`, and `.archive/<tier>` (resolution-only). The schema is the
  playbook's: `{file,date,status,summary,meta,callsign}`.
- **The convention is extracted to a spec** the tool implements, and `reg spec`
  prints it. Today the convention lives in `playbooks/registry-playbook.md` — a
  document *inside* okuda; a general tool needs it as its contract.
- **A manifest is deferred** until a second silo actually diverges (different
  tier names, prefixes, or statuses). Over-generalising ahead of a real second
  case is its own failure mode. When it arrives, it is *silo data*, and it also
  collapses defect A below.

## Defect A — the tier declaration is duplicated (claim first)

`scripts/reg-sync.ts` holds `REGISTRIES` (six tiers: dir, index, defaults,
excludes, `fmType`, `csPrefix`, `archive`), and `src/root.ts` holds
`TIER_REGISTRIES`, a second list that must stay 1:1 with it — pinned by a drift
test *because the two drifted once* (advisories, 2026-09-24). One concept, two
sources of truth, a test standing between them. `reg` should hold **one**
declaration that both surfaces read.

## Defect B — the gate is a shell chain (claim first)

`just check` is nine commands joined by `&&` in the justfile: `signature-check.sh`,
`reg-sync --all`, `facade-lint.sh`, `td-id-lint`, `callsign-lint`, `date-lint`,
`archive-lint`, `citation-census --strict`, `prose-check --strict-leaks`. Nothing
owns the order; there is no single place to add the next gate; and running it
requires `just` (and a shell). `reg check` should own the set, the order, and the
exit code — the highest-value consolidation, because it is the thing humans and
agents actually invoke.

## The verb set

| verb | owns | today's instrument |
|---|---|---|
| `reg sync [tier]` | drift check | `scripts/reg-sync.ts` |
| `reg fix` | drift repair, view regen, frontmatter | `scripts/reg-sync.ts --fix` |
| `reg list <tier>` / `reg menu <tier>` | listing / jump-wired menu | `reg-list.ts`, `reg-menu.ts` |
| `reg check` | the gate: set, order, one exit code | the `just check` chain |
| `reg census` | the citation census | `citation-census.ts` |
| `reg graph` | the citation / reference graph | (derived in ADR-057 Phase 2) |
| `reg resolve <key>` | callsign → path, the product's resolver | `src/root.ts` |
| `reg candidates` | uncited / unregistered / refusal-word **candidates** | ad-hoc grep, per batch |
| `reg retire <file> --to <scope>` | the move, after a human decision | by hand |
| `reg lint <name>` | one lint by name | the individual scripts |
| `reg spec` | print the convention the tool implements | (new) |

`reg candidates` is exactly the surface the prune batches built by hand: it lists
*candidates* and decides nothing — the playbook's "a keyword grep flags
candidates; it cannot classify a document."

## Scope

**In:** the dispatcher; the verb set above; the two defects; the `--json` output
mode; the compile step (below) when portability is needed; a spec command.

**Out:** anything that classifies or dispositions a document; a config file; a
daemon; a cache or index artifact of its own; a plugin system; publishing to a
package registry; anything that touches the byte stream or the screen (that is
`okuda`'s job — the repo's own test puts registry bookkeeping outside the viewer).

## Preconditions

- [ ] Agreement on the verb set and the mechanical/editorial boundary (this brief).
- [ ] The current scripts' verdicts captured as the parity oracle, so `reg check`
      can be shown byte-equivalent before the old entry points are retired.

## Work plan

1. [ ] **Dispatcher, no new artifact.** `scripts/reg.ts` with the verb table;
       `just reg <verb>` delegates. Bun stays the runtime.
2. [ ] **Claim defect B** — `reg check` owns the gate chain, order and exit code;
       `just check` becomes a one-line delegation. Prove parity with the old chain.
3. [ ] **Claim defect A** — one tier declaration, read by both `reg` and
       `src/root.ts`; retire or repoint the drift test.
4. [ ] **Add the missing mechanical verbs** — `candidates`, `graph`, `resolve`,
       `retire`, `spec`.
5. [ ] **Compile on demand** — `bun build --compile scripts/reg.ts --outfile reg`
       when `reg` must run without Bun or `just` (CI, a cold agent, another
       machine). One line, same source; the last mile, not the first.

## Acceptance criteria

- `reg check` returns **one exit code** and the same verdicts as the old
  `just check` on the same tree (parity demonstrated, not asserted).
- `reg sync` / `reg fix` produce a byte-identical tree to the current scripts.
- The tier declaration exists in **one** place; root.ts and the tool read the same
  source; the drift test no longer guards a duplication.
- `reg` runs with **no config, no daemon, no cache, no state**; `grep` proves no
  file is written outside the silo on a read verb.
- `reg` never writes a disposition, classification, or keep-class claim.
- A manifest is **not** added until a second silo diverges, and then it is silo
  data.

## Options considered

| option | why taken / rejected |
|---|---|
| **Status quo** — scripts + `just` | not wrong; `just` is a fine facade. Kept as the fallback, but it leaves defects A and B. |
| **Dispatcher + `just reg`** | **taken first** — the actual win, independent of packaging; low risk; scripts stay the source. |
| **Compile the dispatcher → `reg`** | **taken on demand** — one self-contained artifact from the same source; the final mile. |
| **Fold into `okuda` as a verb** | **rejected** — scope bleed. Registry bookkeeping touches neither the byte stream nor the screen; the viewer ships with a janitor attached. |
| **npm bin / publish** | **rejected** — private, single-silo tooling; a package's version surface is config by another name. |
| **A framework with a manifest and plugins** | **deferred** — the moment generality needs a file, the no-config principle is lost. Convention first; manifest only when a second silo demands it. |

## Related

- `decisions/057-document-lifecycle.md` — the lifecycle `reg` is the mechanical half of
- `playbooks/registry-playbook.md` — the convention; the schema, the cache-vs-shadow test
- `briefs/2026-09-17-brief-bm25-evaluation.md` — the search-side scaling note, deferred
- `briefs/2026-09-14-brief-search-surface.md` — the parked search surface, a different concern
- `justfile` — the current façade and the nine-command gate chain
