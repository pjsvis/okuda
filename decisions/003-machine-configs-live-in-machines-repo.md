---
type: ADR
callsign: ADR-MACHINE-CONFIGS-003
---

# Decision: Machine configuration lives in a dedicated machines repository

**Date:** 2026-08-22
**Status:** Accepted

## Context
`docs/starship-mac.toml` (commit 7c139b3) placed a personal shell-prompt config in okuda's docs — a markdown viewer's design folder hosting a machine dotfile. Independently, the fleet grew to two machines with the arrival of the Omarchy Quattro box, which arrives *as* a standard (opinionated, reproducible). Machine configuration is now a fleet problem: TailScale solved reachability, never configuration. A config file parked in a project's docs folder is neither a standard nor enforceable.

## Decision
Okuda hosts no machine configuration; a dedicated private repo (`pjsvis/machines`) is the single source, with per-machine subtrees, Omarchy as reference and the Mac converging, an enumerated deviations ledger, and a `just check` that enforces policy and parity.

## Alternatives Considered
| Alternative | Why Rejected |
|-------------|--------------|
| Keep it in okuda `docs/` | Scope creep; no consistency enforcement; violates the registry principle (docs/ accumulating unindexed files) |
| chezmoi / stow / bare-repo frameworks | Tool dependency exceeds need at fleet size 2; revisit above ~3 machines or ~5 configs |
| The existing `pjsvis/dotfiles` repo | Accretion-era artifact with no standard; machines starts as the standard — migrating useful bits is separate follow-up work |

## Consequences

**What became easier:**
- Fleet consistency becomes checkable rather than hoped-for
- Machine rebuilds survive (config is in git, not folklore)
- okuda's scope stays clean: it renders markdown, it does not house shell prompts

**What became harder:**
- Two repositories to touch when a machine config changes
- Each machine owes an initial import before parity checks are meaningful

**Constraints this imposes:**
- Every value-level parity diff must be documented in the machines repo's `DEVIATIONS.md` or `just check` fails
- New machines require a `machines/<name>/` subtree plus a fleet-table row
- Glyphs stay Unicode BMP in live values; palette stays hex (foam `#9ccfd8` identity, rose `#eb6f92` error-only)

## Related
- Supersedes the placement choice in commit 7c139b3 (`docs/starship-mac.toml`, since deleted — the file moved to `machines/machines/mac/starship.toml` with six defects fixed at extraction)
- Kindred: `decisions/001-silo-pattern-adoption.md` (scope discipline — what this silo carries)
