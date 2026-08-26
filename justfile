# okuda — terminal markdown viewer (origin: docs/2026-08-20-origin-doc.md)
# Silo facade: recipes are one-line delegations; logic lives in scripts/.

# List recipes
[group('navigation')]
@default:
    just --list

# ── Navigation ───────────────────────────────────────────────

# Guide
[group('navigation')]
help:
    @./okuda docs/help.md

# Rationale
[group('navigation')]
info:
    @echo "okuda — a terminal markdown viewer built on Bun.markdown,"
    @echo "rendering mermaid fences via the mermaid-to-md Rust CLI."
    @echo "Named for Michael Okuda: high-contrast, functional, uncluttered."
    @echo ""
    @echo "Origin and design: docs/2026-08-20-origin-doc.md"
    @echo "Dependencies:       DEPENDENCIES.md"

# State
[group('navigation')]
orient:
    @echo "branch:  $(git branch --show-current)"
    @echo "status:  $(git status --short | wc -l | tr -d ' ') changed file(s)"
    @-git status --short
    @echo "last:    $(git log -1 --oneline)"
    @echo "docs:    $(cat briefs/INDEX.jsonl 2>/dev/null | grep -c .) briefs, $(cat decisions/INDEX.jsonl 2>/dev/null | grep -c .) decisions, $(cat debriefs/INDEX.jsonl 2>/dev/null | grep -c .) debriefs, $(cat playbooks/REGISTRY.jsonl 2>/dev/null | grep -c .) playbooks"

# ── Quality gate ─────────────────────────────────────────────

# Sync gate
[group('quality gate')]
check:
    @bun scripts/reg-sync.ts --all && bash scripts/facade-lint.sh

# ── Build ────────────────────────────────────────────────────

[group('build')]
dev file:
    @bun run src/cli.ts {{file}}

# Compile
[group('build')]
build:
    @bun build --compile src/cli.ts --outfile okuda

# Install
[group('build')]
install:
    @mkdir -p ~/.local/bin
    @ln -sf $(pwd)/okuda ~/.local/bin/okuda
    @ln -sf $(pwd)/okuda ~/.local/bin/gloam
    @echo "okuda → ~/.local/bin/okuda  (run `just build` to refresh after edits)"

# Tests
[group('build')]
test:
    @bun test

# Grammar tour
[group('build')]
showcase:
    @./okuda docs/showcase.md --tui

# Showcase
[group('build')]
okuda:
    @./okuda docs/showcase.md --tui

# Manifesto (okuda)
[group('build')]
manifesto-okuda:
    @./okuda docs/glow-vs-okuda.md --tui

[group('build')]
resize-okuda file:
    @./okuda {{file}} --tui

[group('build')]
view file:
    @./okuda {{file}} --tui

[group('build')]
view-glow file:
    @./okuda {{file}} --tui --palette dracula

# Blog post
[group('build')]
post:
    @./okuda docs/2026-08-25-the-common-control-surface.md --tui

# Colour audit
[group('build')]
audit:
    @./okuda docs/audit.md --tui

# Table audit
[group('build')]
tables:
    @./okuda docs/tables.md --tui

# Chip dogfood
[group('build')]
chip:
    @just build >/dev/null
    @./okuda docs/chip-dogfood.md --tui

# Manifesto (glow)
[group('build')]
manifesto:
    @./okuda docs/glow-vs-okuda.md --tui --palette dracula

# ── Registries ───────────────────────────────────────────────

# Check drift
[group('registries')]
reg-sync:
    @bun scripts/reg-sync.ts --all

# Fix drift
[group('registries')]
reg-sync-fix:
    @bun scripts/reg-sync.ts --all --fix

# List briefs
[group('registries')]
reg-briefs:
    @bun scripts/reg-list.ts briefs

# List debriefs
[group('registries')]
reg-debriefs:
    @bun scripts/reg-list.ts debriefs

# List decisions
[group('registries')]
reg-decisions:
    @bun scripts/reg-list.ts decisions

# List playbooks
[group('registries')]
reg-playbooks:
    @bun scripts/reg-list.ts playbooks

# ── SSH serving (sandboxed ForceCommand) ─────────────────────

[group('ssh')]
ssh-test doc:
    @bash scripts/sshd-test.sh smoke {{doc}}

[group('ssh')]
ssh-serve doc:
    @bash scripts/sshd-test.sh serve {{doc}}

[group('ssh')]
ssh-view doc:
    @bash scripts/sshd-test.sh view {{doc}}

# Teardown
[group('ssh')]
ssh-stop:
    @bash scripts/sshd-test.sh stop
