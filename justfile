# okuda — terminal markdown viewer (origin: docs/2026-08-20-origin-doc.md)
# Silo facade: recipes are one-line delegations; logic lives in scripts/.

default: help

# ── Navigation ───────────────────────────────────────────────

# Workflow guide
help:
    @echo "okuda — silo workflow"
    @echo ""
    @echo "  just orient          current state: branch, git status, last commit, registries"
    @echo "  just info            project rationale and origin"
    @echo ""
    @echo "  Work:  brief → branch → implement → check → review → debrief"
    @echo ""
    @echo "  just check           quality gate (registry sync) — run before every commit"
    @echo "  just reg-sync        check all registries for drift"
    @echo "  just reg-sync-fix    regenerate indexes from filesystem"
    @echo "  just reg-briefs      list briefs registry"
    @echo "  just reg-debriefs    list debriefs registry"
    @echo "  just reg-decisions   list decisions registry"
    @echo "  just reg-playbooks   list playbooks registry"

# Project rationale and origin
info:
    @echo "okuda — a terminal markdown viewer built on Bun.markdown,"
    @echo "rendering mermaid fences via the mermaid-to-md Rust CLI."
    @echo "Named for Michael Okuda: high-contrast, functional, uncluttered."
    @echo ""
    @echo "Origin and design: docs/2026-08-20-origin-doc.md"
    @echo "Silo map:           SILO_MANIFEST.md"

# Current state: branch, status, last commit, registry counts
orient:
    @echo "branch:  $(git branch --show-current)"
    @echo "status:  $(git status --short | wc -l | tr -d ' ') changed file(s)"
    @-git status --short
    @echo "last:    $(git log -1 --oneline)"
    @echo "docs:    $(grep -c . briefs/INDEX.jsonl 2>/dev/null || echo 0) briefs, $(grep -c . decisions/INDEX.jsonl 2>/dev/null || echo 0) decisions, $(wc -l < debriefs/INDEX.jsonl 2>/dev/null | tr -d ' ') debriefs, $(grep -c . playbooks/REGISTRY.jsonl 2>/dev/null || echo 0) playbooks"

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
