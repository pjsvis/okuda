# The shared channel — ingress, egress, and two readers

**Date:** 2026-09-04
**Type:** explainer

The unit of work is the instance: a terminal as document with actuable
references — stateless, composable, cloneable, and rendering restricted
grammar markdown nice and fast. This page is about the property that
makes that unit more than a viewer: **the same channel serves two kinds
of readers.**

## Two readers, one channel

The **human** reads the frame: rendered markdown, gold silcrows on the
references, `§14` actuable, `u` unwinding, `99` promoting to a fresh
instance. The **agent** reads the channel underneath: the source
document, the derived entry stream, the resolution of every target.

```bash
okuda --entries "load bearing"   # the exact rows the picker paints
okuda --tui &next.md             # the exact frame the human reads
```

There is no second API and no parallel representation to keep in sync.
The entry stream is the same derivation the paint is a projection of —
so when the agent verifies a reference, it is checking *precisely what
the human will experience when they actuate it.*

## Ingress and egress

- **Ingress** — documents arrive: an agent writes a brief into the
  tree; a file lands over ssh; a `okuda://` link opens a target from a
  web page; stdin pipes a stream. The grammar restricts what is
  accepted; the filesystem is the message bus.
- **Egress** — the silo answers: rendered frames for the human; entry
  streams, exit codes, and the `--entries` printer for the agent.

Both directions speak the same restricted grammar. Nothing is sent
elsewhere to be rendered; the silo renders in place, on whatever glass
is attached.

## The audit: references must be kosher, not decoration

Because the vectors are painted **optimistically** — what looks like a
reference gets a silcrow, without validation — the system *needs* a
reader who checks. That reader is the agent, and the check is trivial
because the derivation is deterministic:

1. `okuda --entries` — the exact rows, with their `§NN` targets.
2. Resolve each target: file exists, or callsign in the registry.
3. Report: `§13 → briefs/2026-08-30-brief-content-shortlist.md ✓` ·
   `§14 → &next.md ✗ not a document` (a wiring comment is not a
   document). The stale-shorthand case was found exactly this way
   during the 2026-09-04 tidy: `&briefs` carried a mention that looked
   like a callsign but wasn't — the audit flagged the vector, and the
   prose was corrected to the real callsign,
   [ADR-TABLE-ELISION-014](decisions/014-table-elision-over-shrink-wrap.md).

This is the enforcement half of the optimism contract: the human paints
freely; the agent audits cheaply; decoration is *detectable*, and
detected decoration is corrected editorially. A reference that fails
was still a correct description of an intention — and the audit is what
turns the intention into a task.

## Why this leverages the ideas immediately

The shared channel means human and agent collaborate **in the same
document, at the same time, through the same grammar**:

- The human reads the brief and actuates a silcrow to check a claim.
- The agent dereferences the same references programmatically and
  confirms they resolve — kosher, not decoration.
- Neither needs a special tool: the human's interface (the frame) and
  the agent's interface (the entry stream) are two projections of one
  derived map.

The collaboration is not metaphorical. It is the same file, the same
map, two projections.

## The working set

The channel bounds the context to a **restricted document set with
declared relevance to the current context** — Denning's working set,
applied to documents. The main document declares its relevance by
referencing; the vectors make the declaration addressable; the shelf
bootstraps it (the root is the initial working set); the dive extends
it only as far as the query and the references reach. Thrashing is
bounded by the same rules that bound the tour: one dereference deep,
88 vectors, each level a deliberate keystroke.

This is why declared relevance beats inferred relevance for a curated
corpus: a link carries intent, which no similarity score recovers; a
stale link is auditable, which no embedding is; and the agent's context
window mirrors the human's working set exactly, because both are
projections of the same derived map.

## The self-description

This explainer describes the system to others, potentially — and to
ourselves, now. That second reader is the discipline: a self-description
that cannot be checked against the implementation is a manifesto; one
that can is a **specification written in prose**. Read it against the
code. Where the words and the behavior drift, the behavior is wrong or
this page is wrong, and either way the drift is the work item.

The channel is shared. The derivation is deterministic. The references
are auditable. The reader — human or agent — arrives and finds the
silcrow already meaning what it says.
