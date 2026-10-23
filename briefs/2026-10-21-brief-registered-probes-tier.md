---
type: Brief
callsign: BRF-PROBES-TIER
---

# Brief: Establish Registered `probes/` Tier for Exploratory Python Scripts

**Date:** 2026-10-21
**Status:** Open

---

## Context

We treated `.gitignored` `tmp/` as the sole destination for exploratory agent code, assuming all non-deliverable scripts were disposable. In practice, agents write reusable Python forensic probes in `tmp/` to verify system invariants before touching TypeScript/Bun deliverables, and valuable harnesses now accumulate in an untracked directory alongside scratch junk. Leaving proven probes in `tmp/` risks accidental deletion and hides the executable evidence behind our briefs and debriefs from version control.

## Warrant

Operator call (`ADR-IDEA-LEDGER-064`) — establishes the structural boundary between ephemeral scratch work (`tmp/`), registered forensic probes (`probes/`), and production TypeScript/Bun deliverables (`src/`).

## Objective

Create a tracked `probes/` directory for standalone `uv` Python scripts and wire `justfile` recipes to execute probes and purge `tmp/` so verified behavioral harnesses persist in git without polluting the TypeScript/Bun deliverable tree.

## Evidence

| Observation | Measurement / State |
| :--- | :--- |
| Unregistered scratch folder (`tmp/`) | `.gitignored`; mixes disposable dumps with reusable Python probes |
| Prior emergent work in `tmp/` | 1 full silo previously spun out from accumulated `tmp/` scripts |
| Tracked location for executable behavioral proofs | 0 directories currently registered in repo |

## Scope

**In:**
- Creating the tracked `probes/` directory and `probes/README.md` contract (enforcing PEP 723 inline `uv` script metadata and header links to briefs/debriefs).
- Adding `just probe` and `just clean-tmp` recipes to the root `justfile`.
- Auditing current `tmp/*.py` files and promoting reusable behavioral probes into `probes/`.
- Registering this brief in `briefs/INDEX.jsonl`.

**Out:**
- TypeScript or Bun production deliverables in `src/` (deliverables remain strictly TypeScript/Bun).
- Repo-root Python environment files (`pyproject.toml`, `requirements.txt`, `.venv`) — all probes run as self-contained `uv` scripts.
- Automated registry indexing (`INDEX.jsonl`) inside `probes/`.
- Spinning out new silos from existing `tmp/` contents.

## Preconditions

- [ ] `uv` is installed and resolves on `PATH` (`uv --version` exits `0`).
- [ ] `just` is installed and the root `justfile` is present (`just --list` exits `0`).
- [ ] `.gitignore` lists `tmp/` and does not exclude `probes/`.
- [ ] `tmp/` directory exists and is accessible for audit before any cleanup recipe is run.

## Work Plan

1. [ ] Verify all preconditions; halt and report if any check fails.
2. [ ] Create `probes/` and `probes/README.md` defining the three-tier code boundary (`src/` deliverable TypeScript/Bun, `probes/` tracked PEP 723 Python scripts, `tmp/` untracked scratch) and the required script header format (`# /// script` metadata + `Linked Brief:` / `Linked Debrief:` docstring fields).
3. [ ] Add `probe name *args` (`uv run probes/{{name}}.py {{args}}`) and `clean-tmp` (`rm -rf tmp/*`) recipes to the root `justfile`.
4. [ ] Audit existing `.py` files in `tmp/`; convert reusable behavioral probes to PEP 723 inline-metadata format and move them to `probes/`, leaving disposable artifacts in `tmp/`.
5. [ ] Smoke-test the boundary by executing at least one promoted script via `just probe <name>`.
6. [ ] Sync `briefs/INDEX.jsonl` (`open` → `in_progress` → `done`) via `just reg-sync-fix`.

## Acceptance Criteria

* `test -f probes/README.md` exits `0`.
* `git check-ignore -q probes/` exits `1` (confirming `probes/` is tracked) and `git check-ignore -q tmp/` exits `0` (confirming `tmp/` remains ignored).
* `fd -e py . probes/ -x head -n 5 {}` shows `#!/usr/bin/env -S uv run --script` and `# /// script` on every Python file in `probes/`.
* `ls pyproject.toml requirements.txt .venv` fails for all three paths in the repository root (zero Python config pollution).
* `just --list` outputs both `probe` and `clean-tmp` recipes.
* Running `just probe <promoted-probe-name>` executes via `uv` and exits `0`.
* `briefs/INDEX.jsonl` contains the entry for `2026-10-21-brief-registered-probes-tier.md` with status matching the brief header.

## Notes

- **Hard language firewall:** Production deliverables in `src/` are strictly TypeScript/Bun; `probes/` is strictly standalone Python executed via `uv run --script`. Never import across the two tiers.
- **Data loss hazard:** Do not run `just clean-tmp` until Step 4 (the `tmp/` audit and promotion pass) is complete and verified.
- **Spinoff threshold:** When a topic inside `probes/` accumulates multiple scripts and persistent state, open a separate brief or `td` session to evaluate spinning it into a standalone silo rather than building an application inside `probes/`.