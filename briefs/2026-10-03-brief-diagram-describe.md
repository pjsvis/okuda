---
type: Brief
callsign: BRF-DIAGRAM-DESCRIBE
---

# Brief: Prose descriptions of mermaid diagrams via an external binary

**Date:** 2026-10-03
**Amended:** 2026-10-04 — the render-path design is refused; the description
belongs to authoring, and the accessibility half to the flattener (§Finding)
**Status:** Open — the residue is the lint and the flattener's fence policy
**TD:** (to create — the lint; the flattener half is `BRF-SPOKEN-BLOCK-GRAMMAR`)
**Lineage:** `mermaid-to-md` (the existing external binary — mermaid fence → ASCII
art, classified and coloured by okuda); the three-concerns principle
(compositing belongs to the environment, not the viewer); the process-boundary
crossing lesson (external binaries carry their own environment).
**Extends:** `BRF-SPOKEN-BLOCK-GRAMMAR` (the flattener's fence policy, A3) ·
`ADR-PERIMETER-039` (flattening is not okuda's work) ·
`docs/2026-09-21-the-model-beside-the-loop.md` (the clock rule)

> **Amendment (2026-10-04).** The design below is **refused**. A model in the
> render path shares the reader's clock, and the accessibility work this brief
> was aimed at is already owned and in flight. The argument is at §Finding —
> read it before §Design. What survives is the *authored* description: prose
> written beside the diagram, which needs no new binary, no new fence tag and
> no new render path. **What stays this brief's:** the accessibility
> observation (diagrams exclude unsighted readers), and the one open question
> of whether an authored description earns a visual mark beyond the blockquote
> it already has.

## Objective

Add an external CLI tool `diagram-describe` that reads mermaid source on stdin
and writes a prose markdown description on stdout. okuda intercepts tagged
mermaid fences (` ```mermaid describe `) and pipes them to this binary,
rendering the prose output as a styled block. The mermaid source becomes
accessible as text — screen-reader native, searchable, version-controllable.

## Problem

Diagrams exclude blind readers and anyone who needs a textual summary. ASCII
art (the current `mermaid-to-md` path) is visual — it draws boxes and arrows
in a character grid, which a screen reader reads as a spray of line-drawing
glyphs. A mermaid diagram's logic is already structured in its source; what's
missing is a prose rendering of that logic.

## Design

> **Refused 2026-10-04 — read §Finding first.** The binary and the fence tag
> are refused: a model in the render path shares the reader's clock, and
> flattening is the environment's work (`ADR-PERIMETER-039`). The surviving
> form of this brief's intent is *authored* prose beside the diagram — no
> binary, no tag, no new render path. The design is kept as the record of what
> was proposed.

### The binary

```
diagram-describe < diagram.mermaid > description.md
```

- **Input:** mermaid source on stdin (the content between the fence backticks)
- **Output:** markdown prose on stdout — a concise, structured description of
  the diagram's logic
- **Implementation:** wraps an LLM call. A shell script, Rust binary, or Bun
  script. The LLM prompt is a closed template: "Describe this mermaid diagram
  in prose markdown. Be concise. Preserve the logical structure."
- **Location:** `~/.local/bin/diagram-describe` (same pattern as
  `mermaid-to-md`)
- **Optional:** absent binary → tagged fence falls through to the ASCII path

### okuda integration

The existing mermaid intercept path (`src/render.ts:interceptMermaid`) gains a
tag check:

```
    ```mermaid describe
    sequenceDiagram
        A->>B: request
    ```
```

- Tag `describe` → pipe to `diagram-describe`
- No tag (or unknown tag) → pipe to `mermaid-to-md` (today's behaviour)
- Missing binary → fall through to ASCII (graceful degradation)

The prose output is rendered as a styled block — distinct from body text but
not a code fence. A muted left border (like blockquote) with the diagram's
title above, keeping the same structural role the ASCII art occupies today.

### What it looks like

Given:

    ```mermaid describe
    sequenceDiagram
        User->>API: POST /login
        API->>DB: SELECT user
        DB-->>API: user row
        API-->>User: JWT token
    ```

The rendered output:

```
┃ The User sends a POST /login request to the API. The API queries
┃ the database with SELECT user. The database returns the user row.
┃ The API responds to the User with a JWT token.
```

### What it is NOT

- **Not an okuda feature.** The binary is a compositor — markdown in, markdown
  out. okuda renders the result; it does not generate it. The three-concerns
  principle holds.
- **Not a replacement for ASCII art.** Both paths coexist. The ASCII art is
  visual; the prose is textual. A document can carry both — one fence for the
  diagram, one for the description.
- **Not real-time.** The LLM call lives in the pre-render intercept path.
  okuda waits for the pipe to close before rendering. For large documents with
  many diagrams, this adds latency. A cache (hash of mermaid source → cached
  description) lives in the binary, not in okuda.

## Rationale

The `mermaid-to-md` pattern proved that external binaries are the right
abstraction for content transformation. okuda declares the dependency, pipes
the source, renders the output. Zero rendering code changes. `diagram-describe`
follows the same pattern — one new binary, one new fence tag, zero new
rendering paths.

Accessibility is the primary motivation, but prose descriptions serve sighted
readers too: a textual summary is skimmable in a way ASCII art is not, and it
survives search, grep, and screen-reader navigation.

## Costs & trade-offs

- **LLM dependency.** The binary requires an LLM (local or API). The quality
  of the description depends on the model. A bad description is worse than no
  description — it misleads. The binary should validate output (is it prose?
  does it mention the diagram's nodes?) before writing.
- **Latency.** Each diagram adds an LLM round-trip to render time. Caching
  mitigates this for repeated renders. For cold renders, the cost is one API
  call per described diagram.
- **Binary maintenance.** Like `mermaid-to-md`, the binary is a separate
  project with its own dependencies, versioning, and drift risk.

## Conflicts / Dependencies

- `mermaid-to-md`: the precedent — same intercept pattern, different pipe
- **External dependency — refused 2026-10-04.** An LLM wrapper is not a POSIX
  CLI, and `DEPENDENCIES.md:196` halts the brief on a missing dependency rather
  than working around it silently (§Finding). `mermaid-to-md` stays the only
  binary on this path.
- The process-boundary crossing lesson (`clone.ts`): the binary carries its
  own environment; okuda's spawn contract is stdin→stdout, nothing more

## Finding

*Added 2026-10-04. The capability occupies two slots and they are not the same
slot; each one refuses it, and the brief's own §What it is NOT contains the
design that dissolves it.*

**1. The render path is closed to a model.** The renderer is a pure function of
file content, in sub-millisecond time (`docs/2026-08-20-origin-doc.md:147`), and
`decisions/020-zero-notification-stillness.md:34` refuses layout ingress into a
pure, deterministic renderer. The rule that governs models is
`docs/2026-09-21-the-model-beside-the-loop.md:35`: *a model is a finder, never a
judge, and it may not share a clock with the reader's hands.* Rendering fires on
a gesture — open, resize, `SIGWINCH` re-render — so an LLM call here shares the
reader's clock. The design concedes the latency itself: *"okuda waits for the
pipe to close before rendering."* The same construct already ruled —
`briefs/2026-08-29-mermaid-hard-boundary-CSN.md:82-84` requires the diagram
path's fallback text to be **deterministic and plain ASCII** so screen readers
and speech pipelines digest it. A generated description is the opposite of that
requirement.

**2. The flatten slot is owned, and it is in flight.** `BRF-SPOKEN-BLOCK-GRAMMAR`
(in progress on the board) already sets the fence policy — **A3**: `mermaid` →
*"Diagram, elided."*; every other info string → *"Code."* plus the content read
aloud (`briefs/2026-09-15-brief-spoken-block-grammar.md:97-100`). Its evidence
table already records this brief's defect: *"all fence content is dropped
silently — code and mermaid alike vanish."* The doctrine there is **never elide
silently**, and the remedy is an announcement, not a generated description.
`playbooks/ear-playbook.md:12-16` fixes the three stages — Render = okuda,
Flatten = `speak-md`, Speak = the environment — and `ADR-PERIMETER-039` drew that
line on 2026-09-18, before this brief was filed. Its test is *whose work is it?*
A binary that reads a fence and emits prose for the ear is the environment's.

**3. The accessibility premise is already answered, for mermaid specifically.**
`docs/2026-09-15-tables-for-unsighted-listeners.md:136-137` draws the
distinction: the `cat` escape hatch is wrong for tables but sound for mermaid,
*"because the source genuinely is more readable than ASCII art."* The source is
already the accessible text, so the Objective's claim that the prose makes it
*"accessible as text"* describes a state that already holds.

**4. The brief dissolves itself.** §What it is NOT: *"A document can carry both
— one fence for the diagram, one for the description."* Authored prose in the
document needs no new binary, no new fence tag and no render-path model — and it
is version-controlled, greppable, `cat`-able, speakable and printable. The render
side then needs nothing: the design's own visual spec is *"a muted left border
(like blockquote)"* — that is a blockquote — and the `title:` first-line
convention already exists at `src/render.ts:502-509`. The design's claim of *"zero
rendering code changes"* and its specification of a new styled block cannot both
hold: either it is a blockquote, and there is no code, or it is a new block type,
and there is not zero.

**5. The dependency verdict.** A wrapper around an LLM call is not a POSIX CLI.
`DEPENDENCIES.md:196` — *a missing dependency halts the brief; it does not get
worked around silently.* The design's *"missing binary → fall through to ASCII"*
is that silent workaround inverted, and the CSN precedent says absence is
**announced**, not degraded. Verdict: optional, off the path, never on the gate.

**The tell.** The design's own validation clause — *"validate output (is it prose?
does it mention the diagram's nodes?)"* — is a model judging a model. Nothing
deterministic disposes, so the design is not ready.

### What survives

- **The authored description.** Prose written beside the diagram and rendered as
  ordinary markdown. No binary, no tag, no new path.
- **A lint, not a model.** *"A mermaid fence with no adjacent description"* is
  mechanical and testable — the residue the house rule calls a lint already owed.
- **The flattener's fence policy.** Whether the ear hears *"Diagram, elided."* or
  the fence's source read aloud is an audition, and it belongs to
  `BRF-SPOKEN-BLOCK-GRAMMAR`.
- **A model's honest lane.** At authoring time, as a finder drafting a description
  the author disposes. The authoring clock is the model's only lane, and it never
  touches the render path.

### Not verified

- The silent drop of fence content is `BRF-SPOKEN-BLOCK-GRAMMAR`'s evidence
  table, not a measurement taken here (`speak-md` is the sibling silo, off this
  PATH).
- The LLM round-trip latency is the design's own claim, cited and not measured.
- `diagram-describe` is absent from PATH (probed 2026-10-04). A fence tagged
  `mermaid describe` matches neither `interceptMermaid`'s bare-`mermaid` pattern
  (`src/render.ts:494`) nor chroma's single-word tag regex (`src/render.ts:534`),
  so it renders today as an uncoloured code fence.

## Open questions

- Does an authored description earn a visual mark beyond the blockquote it
  already has? The current reading is no.
- Is *"Diagram, elided."* sufficient for the ear, or does the fence's source get
  read aloud? An audition, and `BRF-SPOKEN-BLOCK-GRAMMAR` owns it.
- Does the lint ship as a `just` recipe or a registry check? `tables-check` is
  the precedent for a report-first instrument.

## Related

- `briefs/2026-09-15-brief-spoken-block-grammar.md` — A3, the fence policy; the
  accessibility half of this brief's intent
- `decisions/039-the-perimeter.md` — *whose work is it?* Flattening is the
  environment's
- `docs/2026-09-21-the-model-beside-the-loop.md` — the clock rule: a model is a
  finder, never a judge, and off the reader's clock
- `docs/2026-09-15-tables-for-unsighted-listeners.md` — the flatten convention,
  and the mermaid-specific `cat` ruling
- `briefs/2026-08-29-mermaid-hard-boundary-CSN.md` — the diagram path's own
  deterministic-text requirement
- `docs/2026-09-05-i811-dual-layer-output.md` — the house position on
  accessibility-shaped proposals
- `docs/2026-08-20-origin-doc.md` — the renderer as a pure function
- `playbooks/ear-playbook.md` — the three stages and their owners