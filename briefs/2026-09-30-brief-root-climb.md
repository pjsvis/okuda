---
type: Brief
callsign: BRF-ROOT-CLIMB
---

# Brief: The root climb — the silo is the repo, not the cwd

**Date:** 2026-09-30
**Status:** Done — implemented same-day; ADR-048 accepted, `td-8c1650`

---

## Objective

Resolve the silo root once per session as the **git toplevel** (`git rev-parse
--show-toplevel`), and thread it through every layer that currently trusts the
process cwd. A gloam launched from a subfolder behaves as the silo: full corpus,
badge, callsigns. No git repo in reach → cwd, byte-identical to today.

## Background — the diagnosis that opened this

The live confusion (2026-09-30 session): gloam in cool-pi-extensions showed no
`briefs/` behaviour — because the launch cwd was `docs/`, and the corpus is
cwd-scoped. Verified empirically:

| Launch cwd | Corpus (`briefs/`) | Rooted? |
|---|---|---|
| cool-pi-extensions (root) | 71 entries | no (no registry signature — correct) |
| cool-pi-extensions/docs | 0 entries | no |
| okuda/src | 0 entries | **null** — unrooted in our own silo |

Folder routing, search, and the loop all work from any *root* — the defect is
subfolder launches. Git answered this decades ago: the repo is discovered by
climbing to `.git`, not by trusting the cwd. okuda was born in
cool-pi-extensions (provenance note: the shared vocabulary is ancestral, not
borrowed) — this feature pays where the project was born.

ADR-039 made concentration "a property of the working directory"; the climb
makes the perimeter the *checkout*, which is the perimeter that perimeter
argument meant. ADR-048 records the decision; this brief implements it.

## Scope

**In:**

* `siloRoot(cwd): string` in `root.ts` — one `git rev-parse --show-toplevel`
  spawn, cached per process; failure/absent repo → cwd (today's behaviour).
* Thread the resolved root through the existing `cwd` seams: `detectRoot`,
  the launcher corpus functions (`listMarkdownFiles`, `listAllFiles`,
  `rankedShortlistEntries`, `registryRows`), the callsign resolver/validators,
  the silcrow path validator (ADR-045's cwd anchor).
* Audit every `process.cwd()` call site: each takes the resolved root, or
  carries a stated reason not to (e.g. an already-resolved path).
* Unit tests: rooted from a subfolder (tmp git repo fixture), non-git cwd
  fallback, resolution cached (one spawn).

**Out:**

* Climbing above the toplevel, ever. Nested repos stop at the first `.git`
  (git's semantics, inherited wholesale).
* Cross-silo resolution (declined 2026-09-30: namespace arbitration, ADR-020
  boundary). Silos reference each other in prose, as `herdr/okuda-theme.toml`
  already does.
* Auto-registering unrooted silos (their format, their brief).
* Re-deriving the root mid-session (it is static — the launcher comment
  already holds this; now it is load-bearing).

## Work Plan

1. [x] `siloRoot()` + unit tests (tmp git repo via `git init`, subfolder launch,
   non-git cwd, `.git`-file worktree if cheap to fixture).
2. [x] Resolve once at `runLauncher`/cli entry; thread the root through the
   existing `cwd` parameters (the seams exist — no layer surgery).
3. [x] Thread the silcrow path validator's cwd anchor (ADR-045).
4. [x] The `process.cwd()` audit — every call site assigned or excused, in-code.
5. [x] Dogfood: `gloam` from `okuda/src` (badge + corpus), from
   `cool-pi-extensions/docs` (their corpus, honest unrooted), from `/tmp`
   (cwd fallback).
6. [x] Debrief.

## Acceptance Criteria

* From `okuda/src`: gloam finds `briefs/`, the badge reads `okuda` (via `okf`),
  silcrow callsigns resolve.
* From `cool-pi-extensions/docs`: `briefs/` finds their corpus; no badge, no
  registry channel (unrooted — honest).
* From a non-git cwd: output byte-identical to today (fallback, zero change).
* One git spawn per process, not per query (cached).
* `just check` green; full suite green.

## Notes

* **Mechanism — spawn vs manual climb.** Spawn `git rev-parse
  --show-toplevel`: git is already a dependency (DEPENDENCIES.md, 2.54.0),
  the launcher already spawns rg/fzf, and git alone answers worktrees
  (`.git` as a *file*) and submodule edges correctly. A manual `.git`
  directory walk re-implements git badly at exactly those edges.
* **The dotfiles edge.** `$HOME` as a git repo (dotfiles checkouts) makes
  `$HOME` the toplevel — git's semantics, accepted; `gloam` from `$HOME`
  sees the dotfiles corpus, which is what the user's checkout is.
* **ADR-048** (`decisions/048-silo-root-git-toplevel.md`) lands with this
  brief — two viable options existed (cwd scoping vs git climb), and the cwd
  line in ADR-039 gets its precision amendment there.
