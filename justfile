# okuda — terminal markdown viewer (origin: docs/2026-08-20-origin-doc.md)
# Silo facade: recipes are one-line delegations; logic lives in scripts/.

# Default: list all recipes
[group('navigation')]
@default:
    just --list

# ── Navigation ───────────────────────────────────────────────

# Workflow guide — rendered through okuda itself (dogfood flip)
[group('navigation')]
help:
    @./okuda docs/help.md

# Project rationale
[group('navigation')]
info:
    @echo "okuda — a terminal markdown viewer built on Bun.markdown,"
    @echo "rendering mermaid fences via the mermaid-to-md Rust CLI."
    @echo "Named for Michael Okuda: high-contrast, functional, uncluttered."
    @echo ""
    @echo "Origin and design: docs/2026-08-20-origin-doc.md"
    @echo "Dependencies:       DEPENDENCIES.md"

# Current state
[group('navigation')]
orient:
    @echo "branch:  $(git branch --show-current)"
    @echo "status:  $(git status --short | wc -l | tr -d ' ') changed file(s)"
    @-git status --short
    @echo "last:    $(git log -1 --oneline)"
    @echo "docs:    $(cat briefs/INDEX.jsonl 2>/dev/null | grep -c .) briefs, $(cat decisions/INDEX.jsonl 2>/dev/null | grep -c .) decisions, $(cat debriefs/INDEX.jsonl 2>/dev/null | grep -c .) debriefs, $(cat playbooks/REGISTRY.jsonl 2>/dev/null | grep -c .) playbooks"

# ── Quality gate ─────────────────────────────────────────────

# Registry sync gate
[group('quality gate')]
check:
    @bun scripts/reg-sync.ts --all

# ── Build ────────────────────────────────────────────────────

# Run the viewer from source
[group('build')]
dev file:
    @bun run src/cli.ts {{file}}

# Compile the single-binary viewer
[group('build')]
build:
    @bun build --compile src/cli.ts --outfile okuda

# Install/refresh the `okuda` shortcut (symlink to ~/.local/bin)
[group('build')]
install:
    @mkdir -p ~/.local/bin
    @ln -sf $(pwd)/okuda ~/.local/bin/okuda
    @echo "okuda → ~/.local/bin/okuda  (run `just build` to refresh after edits)"

# Run the test suite
[group('build')]
test:
    @bun test

# Render the grammar showcase in the TUI (every closed-grammar element)
# Falls back to streaming under NO_COLOR / TERM=dumb / non-TTY.
[group('build')]
showcase:
    @./okuda docs/showcase.md --tui

# Render the showcase in the Okuda palette (LCARS identity layer)
[group('build')]
okuda:
    @./okuda docs/showcase.md --tui --palette okuda

# Render the manifesto in the Okuda palette (the dogfood is the argument)
[group('build')]
manifesto-okuda:
    @./okuda docs/glow-vs-okuda.md --tui --palette okuda

# Render any file in the TUI (default palette): just view docs/foo.md
[group('build')]
view file:
    @./okuda {{file}} --tui

# Render any file in the TUI (Okuda palette): just view-ok docs/foo.md
[group('build')]
view-ok file:
    @./okuda {{file}} --tui --palette okuda

# Render the blog post (the common control surface) in the Okuda palette
[group('build')]
post:
    @./okuda docs/2026-08-25-the-common-control-surface.md --tui --palette okuda

# Render the formatting & colour audit (stated expectations vs live output)
[group('build')]
audit:
    @./okuda docs/audit.md --tui

# Render the table audit (sparse -> crowded; run at ~80 and ~140 widths)
[group('build')]
tables:
    @./okuda docs/tables.md --tui

# Render the RHS-chip dogfood in the Okuda palette TUI
[group('build')]
chip:
    @./okuda docs/chip-dogfood.md --tui --palette okuda

# Render the manifesto (glow vs okuda; the dogfood is the argument)
[group('build')]
manifesto:
    @./okuda docs/glow-vs-okuda.md --tui

# ── Registries ───────────────────────────────────────────────

# Check registries for drift
[group('registries')]
reg-sync:
    @bun scripts/reg-sync.ts --all

# Regenerate registry indexes
[group('registries')]
reg-sync-fix:
    @bun scripts/reg-sync.ts --all --fix

# List briefs registry
[group('registries')]
reg-briefs:
    @bun scripts/reg-list.ts briefs

# List debriefs registry
[group('registries')]
reg-debriefs:
    @bun scripts/reg-list.ts debriefs

# List decisions registry
[group('registries')]
reg-decisions:
    @bun scripts/reg-list.ts decisions

# List playbooks registry
[group('registries')]
reg-playbooks:
    @bun scripts/reg-list.ts playbooks
