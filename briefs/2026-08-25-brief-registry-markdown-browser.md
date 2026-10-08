---
type: Brief
callsign: BRF-REGISTRY-MARKDOWN
---

# Brief: Registry-aware markdown browser — the silo dashboard

**Date:** 2026-08-25
**Status:** Open (the next moat move; not started)
**Context:** blue-sky riff during td-96c759 review wait. The strongest moat extension on the table.

## What

`okuda` with no file argument, run from a silo root, becomes a
**registry-aware file browser** — not a generic `.md` list, but a live
dashboard that reads the silo's `INDEX.jsonl` registries and renders
them as navigable lists grouped by the silo's own conventions (status,
date, tier). Select an entry → render the document.

The key: okuda renders the workflow's own index format. It knows about
briefs, decisions, debriefs, playbooks because it knows the knowledge
system (AGENTS.md's table).

## The named standard — superseded by ADR-018

> Originally this section coined "OKW — Okuda Knowledge Workflow" as a
> named standard. Retired 2026-08-28: one letter from Google's Open
> Knowledge Format (OKF), a real standard for this exact shape of thing.
> See ADR-018 (retirement) and ADR-019 (OKF adoption). The contract below
> survives under its plain name.

**The knowledge system is the standard.** The silo's knowledge system
(AGENTS.md's table: briefs / decisions / debriefs / playbooks, each with
an `INDEX.jsonl` registry) is not an ad-hoc structure — it's a
referenceable convention. Any silo that follows it (four tiers, JSONL
registries, date-first filenames, OKF frontmatter per ADR-019) is
navigable by a registry-aware browser. The browser doesn't hardcode
this silo's layout; it reads the registries. The convention is the
contract; the browser is its UI.

This is the category-defining move. glow's browser is generic and knows
nothing. okuda's browser knows the workflow. That's the unclonable
surface — the moat question ("can you name your secrets?") answers
itself: the secret is the workflow, and the browser is its user
interface.

## Why it's the moat

1. **Readability is what we provide.** The browser extends readability
   from the document to the *silo*: not just "this debrief scans calm"
   but "this silo's state is scannable at a glance." The same perceptual
   properties (calming, leading) applied to navigation, not just
   rendering.
2. **The workflow is part of it.** The browser isn't a viewer feature;
   it's a workflow tool. A dashboard that shows what's open, what's
   parked, what reversed — that's td's surface rendered through okuda's
   calm. Two tools, one moat.
3. **Directory specificity is the prize.** Per-directory renderers:
   - `briefs/`: grouped by status (Open / In Progress / Done), date +
     title + td coupling.
   - `decisions/`: number + status (Accepted / Superseded / Reversed);
     reversed struck through.
   - Repo root: the knowledge-tier layout — four columns, counts,
     last-modified, the "what's happening in this silo" overview.

## Scope — the honest part

The origin doc is explicit: "interactive TUIs… are explicitly out of
scope." The `--tui` control plane already crossed that line. A file
browser pushes further — a second interactive mode with directory-listing
logic, selection state, per-directory renderers. This is a scope
reversal; it gets an ADR (the palimpsest protocol).

## Minimal first cut

**Build the registry-aware list first; do not build the dashboard.**
The minimal cut: `okuda` in a directory with an `INDEX.jsonl` renders
the index as a selectable list; `okuda` elsewhere errors or falls back
to `--tui <file>`. The registry-aware path is the product; the generic
path is a fallback.

Do not build per-directory renderers before dogfooding the flat list.
The flat list proves the concept (registry → selectable → render); the
per-directory smarts are the second iteration, informed by what the
operator actually wants to see.

## The trap to avoid

A generic file browser is a trap — it's glow-parity at the interaction
layer with no moat. If you build "list .md files, enter to render,"
you've spent a week reaching glow's baseline. The *only* reason to build
the browser is the directory specificity / registry awareness. Build that
first, or don't build.

## What we provide (the one-line answer)

**Readability.** Of documents (okuda today), of silo state (the browser),
of workflow navigation (the dashboard, later). The house style + the
renderer + the registry conventions = readability at every layer. If
the workflow is part of it, cool — but readability is the through-line.
