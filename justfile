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
    @bash scripts/signature-check.sh && bun scripts/reg-sync.ts --all && bash scripts/facade-lint.sh && bun scripts/td-id-lint.ts && bun scripts/callsign-lint.ts && bun scripts/date-lint.ts && bun scripts/prose-check.ts --strict-leaks

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

# Prosody probe
[group('moira')]
moira:
    say -v Moira -r 140 -f docs/2026-09-10-moira-prosody-probe-rendered.txt

# Performance
[group('moira')]
moira-showcase:
    @speak-md --dry docs/2026-09-10-moira-showcase.md > docs/2026-09-10-moira-showcase-rendered.txt && say -v Moira -r 140 -f docs/2026-09-10-moira-showcase-rendered.txt

# Pick, then hear
[group('moira')]
moira-pick:
    #!/bin/bash
    set -euo pipefail
    f="$(gum file . --file)"
    [ -n "$f" ] && speak-md "$f"

# Ent probe
[group('moira')]
moira-ent:
    @mkdir -p tmp
    @speak-md --dry tmp/ent-probe.md > tmp/ent-flat.txt
    @say -v Moira -r 140 -f tmp/ent-flat.txt

# March ride
[group('moira')]
moira-ride:
    @mkdir -p tmp
    @speak-md ride --dry > tmp/ride.txt
    @say -v Moira -r 140 -f tmp/ride.txt

# The audition book
[group('moira')]
moira-auditions:
    @speak-md ../speak-md/auditions.md

# Literature stress test
[group('moira')]
moira-story:
    #!/bin/bash
    set -euo pipefail
    f="$(gum file ../speak-md/narratives --file)"
    [ -n "$f" ] && speak-md --style narrative "$f"

# Repertoire audit
[group('moira')]
moira-recital:
    @speak-md recite

# Avionics test bed
[group('moira')]
moira-drill:
    @speak-md drill

# Register bisection
[group('moira')]
moira-register:
    #!/bin/bash
    set -euo pipefail
    say -v Moira -r 140 "Register A. Plain Moira."
    speak-md --style narrative tmp/register-passage.md
    say -v Moira -r 140 "Register B. Five below."
    speak-md --style narrative --pitch -5 tmp/register-passage.md
    say -v Moira -r 140 "Register C. Ten below."
    speak-md --style narrative --pitch -10 tmp/register-passage.md
    say -v Moira -r 140 "Register D. Fifteen below."
    speak-md --style narrative --pitch -15 tmp/register-passage.md

# The aunt probe
[group('moira')]
moira-aunt:
    #!/bin/bash
    set -euo pipefail
    mkdir -p tmp
    say -v Moira -r 140 "The aunt probe. Pitch down is casting, not attitude. Silcrow one one. The control. All Moira, no pitch anywhere."
    speak-md --style narrative tmp/aunt-passage.md
    say -v Moira -r 140 "Silcrow one two. The interleave. The reverend's lines at pitch base minus ten. Freddie's first answers carry no restore; his last one carries an explicit restore. Two speakers, or one in a mood. Does the base come back."
    say -v Moira -r 140 -f tmp/aunt-interleave.txt
    say -v Moira -r 140 "Silcrow one tree. The recital. The reverend's turns in sequence, all at minus ten. Does the auntie hold to the end, or slide into the husk."
    say -v Moira -r 140 -f tmp/aunt-recital.txt

# Epilogue audition
[group('moira')]
moira-epilogue:
    #!/bin/bash
    set -euo pipefail
    say -v Moira -r 140 "The epilogue audition. Candidate zero, the incumbent. Document complete. The exit is two zeros."
    say -v Moira -r 140 "Candidate one, at an end. This document is at an end. There are others. The exit is two zeros."
    say -v Moira -r 140 "Candidate two, concluded, the vernacular. This document is concluded. Others exist, and some of them might not be shite.[[slnc 500]] The exit is two zeros."
    say -v Moira -r 140 "Candidate three, finished. This document is finished. Further documents are available. The exit is two zeros."
    say -v Moira -r 140 "Candidate fower, zero zero. This document is at an end. There are others. The exit is zero zero."

# BRF probe
[group('moira')]
moira-brf:
    @mkdir -p tmp
    @speak-md probe --dry tmp/brf-probe.md > tmp/brf-flat.txt
    @say -v Moira -r 140 -f tmp/brf-flat.txt

# Reverend probe
[group('moira')]
moira-rev:
    @mkdir -p tmp
    @speak-md probe --dry tmp/rev-probe.md > tmp/rev-flat.txt
    @say -v Moira -r 140 -f tmp/rev-flat.txt

# He probe
[group('moira')]
moira-he:
    @mkdir -p tmp
    @speak-md probe --dry tmp/he-fix.md > tmp/he-flat.txt
    @say -v Moira -r 140 -f tmp/he-flat.txt

# Latin audition
[group('moira')]
moira-latin:
    @mkdir -p tmp
    @speak-md probe --dry tmp/latin-probe.md > tmp/latin-flat.txt
    @say -v Moira -r 140 -f tmp/latin-flat.txt

# House terms
[group('moira')]
moira-house:
    @mkdir -p tmp
    @speak-md --dry ../speak-md/house-terms.md > tmp/house-flat.txt
    @say -v Moira -r 140 -f tmp/house-flat.txt

# Commendation rehearsal
[group('moira')]
moira-commendation:
    @mkdir -p tmp
    @speak-md --dry docs/2026-09-10-user-commendations.md > tmp/commendation-flat.txt
    @say -v Moira -r 140 -f tmp/commendation-flat.txt

# Table auditions, Moira
[group('moira')]
moira-audition file:
    #!/bin/bash
    set -euo pipefail
    mkdir -p tmp
    for v in speak ordinals records shape; do
        speak-md --tables "$v" --dry "{{file}}" > "tmp/audition-$v.txt"
        echo "— audition $v ({{file}})"
        say -v Moira -r 140 -f "tmp/audition-$v.txt"
    done

# Roofscape, Moira
[group('moira')]
moira-roofs:
    @mkdir -p tmp
    @speak-md probe --dry tmp/roofscape-probe.md > tmp/roofs-flat.txt
    @say -v Moira -r 140 -f tmp/roofs-flat.txt

# Roofscape, Moir
[group('moira')]
moir-roofs voice:
    @mkdir -p tmp
    @speak-md probe --dry tmp/roofscape-probe.md > tmp/roofs-moir-flat.txt
    @say -v {{voice}} -r 140 -f tmp/roofs-moir-flat.txt

# Roofscape, long listen
[group('moira')]
moira-roofs-long:
    @mkdir -p tmp
    @speak-md --style narrative --dry tmp/roofscape-long.md > tmp/roofs-long-flat.txt
    @say -v Moira -r 140 -f tmp/roofs-long-flat.txt

# Roofscape, recital
[group('moira')]
moira-roofs-recital:
    @mkdir -p tmp
    @speak-md --style narrative --dry tmp/roofscape-recital.md > tmp/recital-flat.txt
    @say -v Moira -r 140 -f tmp/recital-flat.txt

# Poet, Moira
[group('moira')]
moira-poet:
    @mkdir -p tmp
    @speak-md probe --dry tmp/poet-probe.md > tmp/poet-flat.txt
    @say -v Moira -r 140 -f tmp/poet-flat.txt

# Poet, Moir
[group('moira')]
moir-poet voice:
    @mkdir -p tmp
    @speak-md probe --dry tmp/poet-probe.md > tmp/poet-moir-flat.txt
    @say -v {{voice}} -r 140 -f tmp/poet-moir-flat.txt

# Speech vector
[group('moira')]
speech:
    @./okuda --tui '&speak.md'

# March map
[group('moira')]
census:
    @mkdir -p tmp
    @speak-md census > tmp/census.md

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

# Decision table
[group('dogfood')]
next:
    @./okuda --tui '&next.md'

# State table
[group('dogfood')]
briefs:
    @./okuda --tui '&briefs.md'

# Listening queue
[group('dogfood')]
ear:
    @./okuda --tui '&ear.md'

# Palette exhibits
[group('dogfood')]
palette-audit:
    @./okuda docs/state-colours.md --tui
    @./okuda docs/showcase.md --tui
    @./okuda docs/2026-09-05-palette-swatch.md --tui

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
    @codesign --force --sign - okuda
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
