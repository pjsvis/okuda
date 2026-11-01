# okuda — terminal markdown viewer (origin: docs/2026-08-20-origin-doc.md)
# Silo facade: recipes are one-line delegations; logic lives in scripts/.

# Args unparsed
set positional-arguments

# List recipes
[group('navigation')]
@default:
    just --list

# ── Navigation ───────────────────────────────────────────────

# Guide
[group('navigation')]
help:
    @./okuda docs/help.md

# Open a page
[group('navigation')]
open:
    #!/bin/bash
    set -euo pipefail
    f="$(ls '&'*.md | gum choose --header 'open — a silo page' || true)"
    [ -n "$f" ] || exit 0
    exec ./okuda --tui "$f"

# Ephemeral status island
[group('navigation')]
island:
    @bun scripts/status-doc.ts > NOW.md
    @./okuda NOW.md --tui

# Jump demo
[group('navigation')]
jump-demo:
    @mkdir -p tmp
    @bun scripts/jump-demo.ts > tmp/okuda-jump-demo.md
    @./okuda tmp/okuda-jump-demo.md --tui

# References demo
[group('navigation')]
references-demo:
    @mkdir -p tmp
    @bun scripts/references-demo.ts > tmp/okuda-references-demo.md
    @./okuda tmp/okuda-references-demo.md --tui

# Menu
[group('navigation')]
menu tier:
    @mkdir -p tmp
    @bun scripts/reg-menu.ts {{tier}} > tmp/okuda-menu-{{tier}}.md
    @./okuda tmp/okuda-menu-{{tier}}.md --tui

# Rationale
[group('navigation')]
info:
    @echo "okuda — a terminal markdown viewer built on Bun.markdown,"
    @echo "rendering mermaid fences via the mermaid-to-md Rust CLI."
    @echo "Named for Michael Okuda: high-contrast, functional, uncluttered."
    @echo ""
    @echo "Origin and design: docs/2026-08-20-origin-doc.md"
    @echo "Dependencies:       DEPENDENCIES.md"

# Protocol install
[group('navigation')]
protocol-install:
    @bash scripts/protocol-install.sh

# Protocol roster
[group('navigation')]
protocol-check:
    @bash scripts/protocol-check.sh

# ── td (task identity) ───────────────────────────────────────

# Task last
[group('td')]
td-last:
    @td last

[group('td')]
td-history n:
    @td last -n {{n}}

# Task undo
[group('td')]
td-undo:
    @td undo

# Hooks install
[group('quality gate')]
hooks-install:
    @git config core.hooksPath .githooks
    @echo "hooks installed: core.hooksPath -> .githooks"

# AMPER drift
[group('navigation')]
amp:
    @bun scripts/amp-check.ts
    @bun scripts/amp-briefs.ts --check

# AMPER regen
[group('navigation')]
amp-regen:
    @bun scripts/amp-briefs.ts --write

# State
[group('navigation')]
orient:
    @bash scripts/orient.sh

# Status line
[group('navigation')]
silo-status:
    @bun scripts/silo-status.ts --text

# The idea ledger
[group('navigation')]
ideas:
    @bun scripts/idea-lint.ts

# ── Quality gate ─────────────────────────────────────────────

# Sync gate
[group('quality gate')]
check:
    @bash scripts/signature-check.sh && bash scripts/tree-lint.sh && bun scripts/ref-census.ts --gate && bun scripts/reg-sync.ts --all && bash scripts/facade-lint.sh && bun scripts/amp-check.ts && bun scripts/amp-briefs.ts --check && bun scripts/td-id-lint.ts && bun scripts/callsign-lint.ts && bun scripts/date-lint.ts && bun scripts/archive-lint.ts && bun scripts/idea-lint.ts --gate && bun scripts/debrief-link-lint.ts --gate && bun scripts/retired-terms-lint.ts --gate && bun scripts/citation-census.ts --strict && bun scripts/lexicon-lint.ts && bun scripts/prose-check.ts --strict-leaks && bun scripts/elision-monotone.ts --gate --strict && bun scripts/seams.ts --gate && bun scripts/brief-queue.ts --gate && bun scripts/contrast.ts --surface --gate

# The seam census
[group('quality gate')]
seams:
    @bun scripts/seams.ts

# Citation drift finder
[group('quality gate')]
citation-drift:
    @bun scripts/citation-drift.ts

# Frame classes, measured
[group('quality gate')]
frame-classes:
    @bun scripts/frame-classes.ts

# Tests gate build
[group('quality gate')]
ship:
    @bun test && just check && just build && just install && just fresh

# Search conformance smoke
[group('quality gate')]
search-smoke:
    @bash scripts/search-smoke.sh

# Colour smoke
[group('quality gate')]
colour-smoke:
    @just build >/dev/null
    @bash scripts/colour-smoke.sh

# Colour dogfood
[group('quality gate')]
dogfood-colour: colour-smoke
    @./okuda docs/showcase.md --tui
    @./okuda src/cli.ts --tui
    @./okuda tmp/colour-smoke.py --tui

# Picker instance replay
[group('quality gate')]
search-replay *args:
    @bash scripts/search-replay.sh {{args}}

# Table cut report
[group('quality gate')]
tables-check *args:
    @bun scripts/tables-check.ts "$@"

# Prose wall meter
[group('quality gate')]
prose-check *args:
    @bun scripts/prose-check.ts "$@"

# Vector contract dogfood
[group('quality gate')]
smoke-test:
    @bun scripts/vector-check.ts
    @bun test tests/keygrammar.test.ts tests/frames.test.ts tests/clone.test.ts tests/vectors.test.ts

dogfood: smoke-test
    @./okuda --tui '&alpha.md'

# TTS dogfood (rendered)
[group('moira')]
tts file:
    @./okuda {{file}} --no-color | tee /dev/tty | say

# TTS dogfood, rate
[group('moira')]
tts-rate file rate:
    @./okuda {{file}} --no-color | tee /dev/tty | say -r {{rate}}

# Recite a document
[group('moira')]
recite file:
    @mkdir -p tmp
    @speak-md --dry {{file}} > tmp/recite-flat.txt
    @say -v Moira -r 140 -f tmp/recite-flat.txt

# Prosody probe
[group('moira')]
moira:
    say -v Moira -r 140 -f docs/2026-09-10-moira-prosody-probe-rendered.txt

# Performance
[group('moira')]
moira-showcase:
    @speak-md --dry docs/2026-09-10-moira-showcase.md > docs/2026-09-10-moira-showcase-rendered.txt && say -v Moira -r 140 -f docs/2026-09-10-moira-showcase-rendered.txt

# Commendation rehearsal
[group('moira')]
moira-commendation:
    @mkdir -p tmp
    @speak-md --dry docs/2026-09-10-user-commendations.md > tmp/commendation-flat.txt
    @say -v Moira -r 140 -f tmp/commendation-flat.txt

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

# ── Pinned search ────────────────────────────────────────────

# Pinned-dialect search
[group('search')]
scan *args:
    @bash scripts/scan.sh "$@"

# ── Dogfood sessions ──────────────────────────────────────

# Palette exhibits
[group('dogfood')]
palette-audit:
    @./okuda docs/state-colours.md --tui
    @./okuda docs/showcase.md --tui
    @./okuda docs/2026-09-05-palette-swatch.md --tui

# Pending tap dogfood
[group('dogfood')]
dogfood-pending:
    @expect scripts/dogfood-pending.exp

# ── Silcrow look gate ──────────────────────────────

[group('dogfood')]
silcrow-freeze query:
    #!/bin/bash
    set -euo pipefail
    mkdir -p tmp
    ./okuda --entries "{{query}}" > tmp/silcrow-look.entries
    {
      printf 'query=%s\n' "{{query}}"
      printf 'rows=%s\n' "$(wc -l < tmp/silcrow-look.entries | tr -d ' ')"
      printf 'frozen=%s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
      printf 'commit=%s\n' "$(git rev-parse --short HEAD 2>/dev/null || echo none)"
      printf 'sha256=%s\n' "$(shasum -a 256 tmp/silcrow-look.entries | cut -d' ' -f1)"
    } | tee tmp/silcrow-look.meta

# The row
[group('dogfood')]
silcrow:
    #!/bin/bash
    set -euo pipefail
    cap=tmp/silcrow-look.entries
    if [ ! -s "$cap" ]; then
      echo "no frozen capture — run: just silcrow-freeze <query>" >&2
      exit 1
    fi
    printf 'sha256=%s  %s\n\n' "$(shasum -a 256 "$cap" | cut -d' ' -f1)" "$(sed -n 's/^frozen=/frozen /p' tmp/silcrow-look.meta)"
    q="$(sed -n 's/^query=//p' tmp/silcrow-look.meta)"
    bun scripts/silcrow-look.ts --from "$cap" "$q" --quiet --focus 15

# Attr control
[group('dogfood')]
silcrow-attrs:
    @bun scripts/silcrow-look.ts --attrs

# fzf control
[group('dogfood')]
silcrow-control *flags:
    #!/bin/bash
    set -euo pipefail
    cap=tmp/silcrow-look.entries
    if [ ! -s "$cap" ]; then
      echo "no frozen capture — run: just silcrow-freeze <query>" >&2
      exit 1
    fi
    q="$(sed -n 's/^query=//p' tmp/silcrow-look.meta)"
    bun scripts/silcrow-look.ts --from "$cap" "$q" --control {{flags}}

# ── Writing ──────────────────────────────────────────────

# Two-panel writing
[group('writing')]
write file:
    @gloam-edit {{file}}

# ── Build ───────────────────────────────────────────────────

[group('build')]
dev file:
    @bun run src/cli.ts {{file}}

# Compile, re-sign, verify
[group('build')]
build:
    @bun build --compile --define "BUILD_SHA=\"$(git rev-parse --short=7 HEAD)\"" src/cli.ts --outfile okuda
    @bash scripts/sign-binary.sh okuda
    @bash scripts/signature-check.sh okuda

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

# Consumer-path mermaid probe
probe:
    @scripts/probe-mermaid.sh

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

# Theme audit
[group('build')]
themes *args:
    @bun scripts/contrast.ts --theme-dir {{args}}

# Surface probe
[group('build')]
surface-probe *args:
    @bun scripts/probe-surface.ts {{args}}

# Surface pair
[group('build')]
surface *args:
    @bun scripts/contrast.ts --surface {{args}}

# Palette ranking
[group('build')]
ranking *args:
    @bun scripts/contrast.ts --ranking {{args}}

# Host theme
[group('build')]
herdr-theme *args:
    @bun scripts/herdr-theme.ts {{args}}

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

# Ground pairs, measured
[group('build')]
contrast:
    @bun scripts/contrast.ts

# Ground pairs, pasteable
[group('build')]
ground:
    @cat docs/2026-10-28-ghostty-ground.conf

# Ground page
[group('build')]
contrast-doc:
    @./okuda docs/2026-10-28-the-ground-you-read-on.md --tui

# Palette swatch viewer
[group('build')]
palette-swatch-doc:
    @./okuda docs/2026-09-05-palette-swatch.md --tui

# Chip dogfood
[group('build')]
chip:
    @just build >/dev/null
    @./okuda docs/chip-dogfood.md --tui

# Keyboard dogfood
[group('build')]
keyboard-dogfood:
    @just build >/dev/null
    @./okuda docs/keyboard-dogfood.md --tui

# Stamp state diagram
[group('build')]
stamp:
    @just build >/dev/null
    @./okuda docs/2026-08-27-fetch-state-stamp-states.md --tui

# Manifesto (glow)
[group('build')]
manifesto:
    @./okuda docs/glow-vs-okuda.md --tui --palette dracula

# ── Print (the paper rung) ───────────────────────────────────

# Render to PDF
[group('print')]
pdf *args:
    @bun scripts/paper.ts {{args}}

# ── Registries ───────────────────────────────────────────────

# Check drift
[group('registries')]
reg-sync:
    @bun scripts/reg-sync.ts --all

# Fix drift
[group('registries')]
reg-sync-fix:
    @bun scripts/reg-sync.ts --all --fix

# Stamp a silo
[group('registries')]
new-silo dir name desc:
    @scripts/new-silo.sh "{{dir}}" "{{name}}" "{{desc}}"

# Cadence report
[group('registries')]
cadence:
    @bun scripts/cadence.ts --write

# Tempo reading, printed
[group('registries')]
cadence-read:
    @bun scripts/cadence.ts

# The state table
[group('registries')]
briefs:
    @./okuda '&briefs.md'

# The decision loop
[group('registries')]
decide:
    @just reg-sync-fix
    @bun scripts/amp-briefs.ts --write
    @bun scripts/brief-queue.ts --write
    @bun scripts/brief-queue.ts --gate

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

# Search archive
[group('registries')]
archive-search PATTERN:
    @rg --line-number --no-heading -g '*.md' -g '!index.md' -g '!INDEX.jsonl' '{{PATTERN}}' .archive

# ── Diagram describe smoke (BRF-DIAGRAM-DESCRIBE) ─────────

describe-diagram file:
    @bash scripts/describe.sh {{file}}

described file:
    @bash scripts/read-diagram.sh {{file}}

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
