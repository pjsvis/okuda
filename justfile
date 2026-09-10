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

# Ephemeral status island
[group('navigation')]
island:
    @bun scripts/status-doc.ts > NOW.md
    @./okuda NOW.md --tui

# Jump demo
[group('navigation')]
jump-demo:
    @bun scripts/jump-demo.ts > /tmp/okuda-jump-demo.md
    @./okuda /tmp/okuda-jump-demo.md --tui

# Menu
[group('navigation')]
menu tier:
    @bun scripts/reg-menu.ts {{tier}} > /tmp/okuda-menu-{{tier}}.md
    @./okuda /tmp/okuda-menu-{{tier}}.md --tui

# Rationale
[group('navigation')]
info:
    @echo "okuda — a terminal markdown viewer built on Bun.markdown,"
    @echo "rendering mermaid fences via the mermaid-to-md Rust CLI."
    @echo "Named for Michael Okuda: high-contrast, functional, uncluttered."
    @echo ""
    @echo "Origin and design: docs/2026-08-20-origin-doc.md"
    @echo "Dependencies:       DEPENDENCIES.md"

# AMPER drift
[group('navigation')]
amp:
    @bun scripts/amp-check.ts

# State
[group('navigation')]
orient:
    @bash scripts/orient.sh

# ── Quality gate ─────────────────────────────────────────────

# Sync gate
[group('quality gate')]
check:
    @bun scripts/reg-sync.ts --all && bash scripts/facade-lint.sh

# Tests gate build
[group('quality gate')]
ship:
    @bun test && just check && just build && just install && just fresh

# Search conformance smoke
[group('quality gate')]
search-smoke:
    @bash scripts/search-smoke.sh

# Picker instance replay
[group('quality gate')]
search-replay *args:
    @bash scripts/search-replay.sh {{args}}

# Vector contract dogfood
[group('quality gate')]
smoke-test:
    @bun scripts/vector-check.ts
    @bun test tests/keygrammar.test.ts tests/frames.test.ts tests/clone.test.ts tests/vectors.test.ts

dogfood: smoke-test
    @./okuda --tui '&alpha.md'

# TTS dogfood (rendered)
[group('quality gate')]
tts file:
    @./okuda {{file}} --no-color | tee /dev/tty | say

# TTS dogfood, rate
[group('quality gate')]
tts-rate file rate:
    @./okuda {{file}} --no-color | tee /dev/tty | say -r {{rate}}

# Moira prosody probe
[group('quality gate')]
moira:
    say -v Moira -r 160 -f docs/2026-09-10-moira-prosody-probe.md

# Freshness check
[group('quality gate')]
fresh:
    @bash scripts/fresh.sh

# ── Search comparison dogfood (regular vs ours) ──────────────

[group('search')]
search-regular query:
    @echo "REGULAR (rg -n — the wall): every matching line, no ranking"
    @rg -i -n "$(echo '{{query}}' | sed 's/ | /|/g')" --type md

[group('search')]
search-ours query:
    @echo "OURS (gloam --entries — the dive): ranked, deduped, evidence"
    @./okuda gloam --entries '{{query}}' | awk -F'\t' 'NF>1 && $2 != ""'

# ── Build ────────────────────────────────────────────────────

[group('build')]
dev file:
    @bun run src/cli.ts {{file}}

# Compile (stamped)
[group('build')]
build:
    @bun build --compile --define "BUILD_SHA=\"$(git rev-parse --short=7 HEAD)\"" src/cli.ts --outfile okuda

# Install
[group('build')]
install:
    @mkdir -p ~/.local/bin
    @ln -sf $(pwd)/okuda ~/.local/bin/okuda
    @ln -sf $(pwd)/okuda ~/.local/bin/gloam

# Gloam launcher
[group('build')]
gloam *args:
    @just build >/dev/null
    @bash -c 'exec -a gloam ./okuda "$@"' -- {{args}}
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

# Style guide
[group('build')]
style-guide:
    @./okuda docs/style-guide.md --tui

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

# Build, render, view
[group('build')]
run file:
    @just build >/dev/null
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

# Monster tables
[group('build')]
tables-monster:
    @./okuda docs/tables-monster.md --tui

# Monster diagrams
[group('build')]
diagram-monster:
    @./okuda docs/diagram-monster.md --tui

# State glyphs
[group('build')]
state-glyphs:
    @./okuda docs/state-glyphs.md --tui

# State colours showcase
[group('build')]
state-colours-doc:
    @./okuda docs/state-colours.md --tui

# State colours A/B
[group('build')]
state-colours:
    @bun scripts/state-colours.ts

# Palette swatch doc
[group('build')]
palette-swatch:
    @bun scripts/palette-swatch.ts > docs/2026-09-05-palette-swatch.md

# Palette swatch viewer
[group('build')]
palette-swatch-doc:
    @./okuda docs/2026-09-05-palette-swatch.md --tui

# Chip dogfood
[group('build')]
chip:
    @just build >/dev/null
    @./okuda docs/chip-dogfood.md --tui

# Stamp state diagram
[group('build')]
stamp:
    @just build >/dev/null
    @./okuda docs/2026-08-27-fetch-state-stamp-states.md --tui

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
