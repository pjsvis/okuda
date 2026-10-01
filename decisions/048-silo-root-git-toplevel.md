---
type: ADR
callsign: ADR-SILO-ROOT-048
---

# Decision: The silo root is the git toplevel

**Date:** 2026-09-30
**Status:** Accepted

## Context

Root detection and the search corpus both trusted the process cwd
(`detectRoot(cwd)`, `rgLines` with an implicit cwd). A launch from any
subfolder — `okuda/src`, `cool-pi-extensions/docs` — produced an empty corpus
and an unrooted badge *inside a silo the launcher was standing in*. The
diagnosis session (BRF-ROOT-CLIMB) measured it: `detectRoot("okuda/src")` →
`null`, zero shortlist entries — in our own repo. ADR-039 made concentration
"a property of the working directory"; the working directory was the wrong
proxy for the thing the perimeter argument meant: the checkout.

## Decision

The silo root is resolved once per session as the git toplevel (`git
rev-parse --show-toplevel`), threaded through every layer that trusted the
cwd. Where git finds no repo, the cwd stands — today's behaviour, byte
identical.

## Alternatives Considered

| Alternative | Why Rejected |
|-------------|--------------|
| Keep cwd scoping | The measured failure: unrooted in our own silo from `src/`, empty corpus from any subfolder. |
| Manual `.git` directory climb | Re-implements git badly at the known edges: worktrees carry `.git` as a *file*, submodules nest. git is already a dependency; spawn it. |
| A root env var / config | One more knob where git already answers; another thing to keep in sync with reality. |

## Consequences

**What became easier:**

- Subfolder launches behave as the silo, everywhere, including the repo
  okuda was born in (cool-pi-extensions — the diagnosis site).
- One invariant instead of many: resolve once, thread the seams (every
  layer already took an explicit `cwd` parameter).

**What became harder:**

- A `git` spawn at launcher entry (one per process, cached — against the
  rg/fzf spawns already on that path).
- The session-static root is now load-bearing: a mid-session `git init`
  above the cwd is not seen until relaunch.

**Constraints this imposes:**

- Never climb above the toplevel; nested repos stop at the first `.git`
  (git's semantics, inherited wholesale).
- Non-git cwds must stay byte-identical to the pre-ADR behaviour (the
  fallback is a guarantee, tested).

## Related

- Brief: `briefs/2026-09-30-brief-root-climb.md` (BRF-ROOT-CLIMB) — the
  implementation.
- ADR-039 (the perimeter) — its working-directory line reads as the
  *checkout* from here on.
- ADR-020 (registry knowledge stays behind closures) — unchanged; the
  resolver hands strings, the root changes where they resolve.
- ADR-045 (silcrow paths) — its cwd anchor becomes the silo root anchor.
