#!/bin/zsh
# gloam-edit — two-panel markdown writing: editor left, Gloam right.
#
# Herdr owns the windowing (okuda's three concerns: okuda renders,
# gloam selects, Herdr places). Creates a herdr tab rooted at the
# file's directory: the editor ($EDITOR, or vim if it doesn't resolve)
# runs in the root pane; `okuda --watch` renders in a right-hand split.
# Every editor save re-renders the preview.
#
# Because Herdr is the host, the pair follows the session: local panes
# today, remote panes (`herdr --remote`) tomorrow — the script neither
# knows nor cares where the tab lands.
#
# Shape: okuda/playbooks/gloam-preview-playbook.md

set -euo pipefail

f="${1:-}"
[[ -n "$f" ]] || { echo "usage: gloam-edit <file.md>" >&2; exit 2 }
[[ -f "$f" ]] || { echo "gloam-edit: no such file: $f" >&2; exit 1 }
f=$(realpath "$f")

# Resolve binaries to absolute paths — spawned shells get a minimal env,
# a bare name like `micro` dies with 'No such file or directory'.
editor_cmd=$(command -v "${EDITOR:-micro}" || true)
[[ -n "$editor_cmd" ]] || { editor_cmd=$(command -v vim); echo "gloam-edit: EDITOR '${EDITOR:-micro}' not found — falling back to vim" >&2; }
okuda_bin=$(command -v okuda || true)
[[ -n "$okuda_bin" ]] || okuda_bin=$HOME/.local/bin/okuda
[[ -x "$okuda_bin" ]] || { echo "gloam-edit: okuda not found" >&2; exit 1; }

# 1. Tab rooted in the file's directory. Capture ids from JSON —
#    herdr ids are workspace-qualified and never guessable.
created=$(herdr tab create --cwd "$(dirname "$f")" --label "write ▸ ${f:t}" --focus)
root=$(printf '%s' "$created" | jq -r '.result.root_pane.pane_id')
[[ -n "$root" && "$root" != "null" ]] || { echo "gloam-edit: no root pane in herdr response" >&2; exit 1; }

# 2. Editor: the root pane (left).
herdr pane run "$root" "$editor_cmd" "$f"

# 3. Preview: split the root pane right, render with file watch.
split=$(herdr pane split "$root" --direction right --ratio 0.5)
preview=$(printf '%s' "$split" | jq -r '.result.pane_id // .result.new_pane.pane_id // .result.pane.pane_id')
[[ -n "$preview" && "$preview" != "null" ]] || { echo "gloam-edit: pane split failed: $split" >&2; exit 1; }
herdr pane run "$preview" "$okuda_bin" "$f" --watch

# 4. Verify before claiming: wait for the render's first heading — the
#    shell's command echo contains the filename too, so matching the name
#    alone proves nothing about the render. The heading text appears only
#    once okuda has actually painted it. Then hand focus to the editor pane.
heading=$(grep -m1 '^# ' "$f" | sed 's/^# *//' | head -c 40)
[[ -n "$heading" ]] && herdr pane wait-output "$preview" --match "$heading" --timeout 15000
herdr pane focus --pane "$preview" --direction left >/dev/null 2>&1 || true

echo "gloam-edit: ${f:t} — editor pane $root, preview pane $preview"
