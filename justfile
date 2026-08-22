# okuda — terminal markdown viewer (origin: docs/2026-08-20-origin-doc.md)
# Silo facade: recipes are one-line delegations; logic lives in scripts/.

# Default: list all available recipes
@default:
    just --list

# ── Navigation ───────────────────────────────────────────────

# Workflow guide — state-aware, user-facing commands only
help:
    @echo "okuda — silo workflow"
    @echo ""
    @echo "Current state: $(git branch --show-current), $(git status --short | wc -l | tr -d ' ') changed file(s)"
    @echo "Pending:       $(grep -c '\"status\":\"pending\"' briefs/INDEX.jsonl 2>/dev/null) briefs, $(grep -c '\"status\":\"pending\"' decisions/INDEX.jsonl 2>/dev/null) decisions"
    @echo "Last commit:   $(git log -1 --oneline)"
    @echo ""
    @echo "User commands:"
    @echo "  just info      what is this project?"
    @echo "  just orient    full state: branch, files, registries, last commit"
    @echo "  just --list    all available recipes (including operator tools)"
    @echo ""
    @echo "Work cycle:  brief → branch → implement → check → review → debrief"
    @echo ""
    @echo "Operator commands (see just --list for full inventory):"
    @echo "  just check        quality gate (registry sync) — run before every commit"
    @echo "  just reg-sync     check registries for drift"
    @echo "  just reg-sync-fix regenerate indexes from filesystem"

# Project rationale and origin
info:
    @echo "okuda — a terminal markdown viewer built on Bun.markdown,"
    @echo "rendering mermaid fences via the mermaid-to-md Rust CLI."
    @echo "Named for Michael Okuda: high-contrast, functional, uncluttered."
    @echo ""
    @echo "Origin and design: docs/2026-08-20-origin-doc.md"
    @echo "Dependencies:       DEPENDENCIES.md"

# Current state: branch, status, last commit, registry counts
orient:
    @echo "branch:  $(git branch --show-current)"
    @echo "status:  $(git status --short | wc -l | tr -d ' ') changed file(s)"
    @-git status --short
    @echo "last:    $(git log -1 --oneline)"
    @echo "docs:    $(cat briefs/INDEX.jsonl 2>/dev/null | grep -c .) briefs, $(cat decisions/INDEX.jsonl 2>/dev/null | grep -c .) decisions, $(cat debriefs/INDEX.jsonl 2>/dev/null | grep -c .) debriefs, $(cat playbooks/REGISTRY.jsonl 2>/dev/null | grep -c .) playbooks"

# ── Quality gate ─────────────────────────────────────────────

# Registry sync check — fails (exit 1) on MISSING or STALE entries
check:
    @bun scripts/reg-sync.ts --all

# ── Registries ───────────────────────────────────────────────

reg-sync:
    @bun scripts/reg-sync.ts --all

reg-sync-fix:
    @bun scripts/reg-sync.ts --all --fix

reg-briefs:
    @bun scripts/reg-list.ts briefs

reg-debriefs:
    @bun scripts/reg-list.ts debriefs

reg-decisions:
    @bun scripts/reg-list.ts decisions

reg-playbooks:
    @bun scripts/reg-list.ts playbooks
