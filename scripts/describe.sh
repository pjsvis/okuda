#!/bin/bash
# describe.sh — extract the first mermaid fence from a file, pipe it
# through diagram-describe, wrap the result in a markdown document, and
# render with okuda. For reading/listening to a diagram as prose.
set -euo pipefail

FILE="${1:?Usage: just describe <file.md>}"

SOURCE="$(awk '
  BEGIN { found = 0 }
  /^```mermaid/ { found = 1; next }
  /^```/        { if (found == 1) exit; found = 0 }
  found         { print }
' "$FILE")"

if [ -z "$SOURCE" ]; then
  echo "No mermaid fence found in $FILE" >&2
  exit 1
fi

PROSE="$(echo "$SOURCE" | diagram-describe)"
TITLE="$(head -1 "$FILE" | sed 's/^#* *//')"

tmp="$(mktemp -d)"
trap "rm -rf '$tmp'" EXIT

cat > "$tmp/described.md" << EOF
# ${TITLE:-Diagram} — described

$(echo "$PROSE")

---
*Described from \`$FILE\` via diagram-describe (BRF-DIAGRAM-DESCRIBE).*
EOF

exec ./okuda "$tmp/described.md"