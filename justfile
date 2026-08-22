# okuda — terminal markdown viewer (origin: docs/2026-08-20-origin-doc.md)
# Silo facade: recipes are one-line delegations; logic lives in scripts/.

# Default: list all recipes
@default:
    just --list

# ── Navigation ───────────────────────────────────────────────

# Workflow guide
help:
    @cat docs/help.md

# Project rationale
info:
    @echo "okuda — a terminal markdown viewer built on Bun.markdown,"
    @echo "rendering mermaid fences via the mermaid-to-md Rust CLI."
    @echo "Named for Michael Okuda: high-contrast, functional, uncluttered."
    @echo ""
    @echo "Origin and design: docs/2026-08-20-origin-doc.md"
    @echo "Dependencies:       DEPENDENCIES.md"

# Current state
orient:
    @echo "branch:  $(git branch --show-current)"
    @echo "status:  $(git status --short | wc -l | tr -d ' ') changed file(s)"
    @-git status --short
    @echo "last:    $(git log -1 --oneline)"
    @echo "docs:    $(cat briefs/INDEX.jsonl 2>/dev/null | grep -c .) briefs, $(cat decisions/INDEX.jsonl 2>/dev/null | grep -c .) decisions, $(cat debriefs/INDEX.jsonl 2>/dev/null | grep -c .) debriefs, $(cat playbooks/REGISTRY.jsonl 2>/dev/null | grep -c .) playbooks"

# ── Quality gate ─────────────────────────────────────────────

# Registry sync gate
check:
    @bun scripts/reg-sync.ts --all

# ── Registries ───────────────────────────────────────────────

# Check registries for drift
reg-sync:
    @bun scripts/reg-sync.ts --all

# Regenerate registry indexes
reg-sync-fix:
    @bun scripts/reg-sync.ts --all --fix

# List briefs registry
reg-briefs:
    @bun scripts/reg-list.ts briefs

# List debriefs registry
reg-debriefs:
    @bun scripts/reg-list.ts debriefs

# List decisions registry
reg-decisions:
    @bun scripts/reg-list.ts decisions

# List playbooks registry
reg-playbooks:
    @bun scripts/reg-list.ts playbooks
