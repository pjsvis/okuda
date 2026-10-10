#!/usr/bin/env bash
# new-silo.sh — stamp a new silo from the canonical source.
#
# Usage:
#   scripts/new-silo.sh <target-dir> "<Silo Name>" "<one-line description>"
#
# Stamps the silo-specific skeleton (templates/silo/) with placeholders
# substituted, then copies the CANONICAL items — the Protocol and the registry
# tooling — from THIS silo's live files. Stamp, don't mirror: there is one
# authority, and the stamped copies are outputs, not stores. A checked-in mirror
# drifts; this cannot.
#
# The remote is deliberately NOT created here. Finish with the checklist in
# playbooks/commissioning-playbook.md (git init, GitHub repo, visibility, push,
# visitor test).
#
# macOS: uses BSD `sed -i ''`.
set -euo pipefail

HERE="$(cd "$(dirname "$0")/.." && pwd)"
TEMPLATE="$HERE/templates/silo"

TARGET="${1:-}"
NAME="${2:-}"
DESC="${3:-A silo in the Edinburgh Protocol family.}"
if [ -z "$TARGET" ] || [ -z "$NAME" ]; then
  echo "usage: new-silo.sh <target-dir> \"<Silo Name>\" \"<description>\"" >&2
  exit 2
fi

SLUG="$(basename "$TARGET")"
DATE="$(date +%F)"

[ -e "$TARGET" ] && { echo "refusing: $TARGET already exists" >&2; exit 1; }
[ -d "$TEMPLATE" ] || { echo "refusing: template missing at $TEMPLATE" >&2; exit 1; }

mkdir -p "$TARGET"
cp -R "$TEMPLATE/." "$TARGET/"

# Substitute placeholders across the stamped text files.
find "$TARGET" -type f \
  \( -name '*.md' -o -name '.gitignore' -o -name 'justfile' -o -name '*.sh' \) -print0 |
while IFS= read -r -d '' f; do
  sed -i '' \
    -e "s|__SILO__|$NAME|g" \
    -e "s|__SLUG__|$SLUG|g" \
    -e "s|__DESC__|$DESC|g" \
    -e "s|__DATE__|$DATE|g" "$f"
done

# Canonical items — copied from the live source, never a checked-in mirror.
mkdir -p "$TARGET/scripts"
cp "$HERE/system.md"              "$TARGET/system.md"
cp "$HERE/scripts/reg-sync.ts"    "$TARGET/scripts/reg-sync.ts"
cp "$HERE/scripts/reg-list.ts"    "$TARGET/scripts/reg-list.ts"
chmod +x "$TARGET/scripts/orient.sh" 2>/dev/null || true

# The registers the silo needs at birth (the floor). Briefs and decisions use
# INDEX.jsonl; playbooks use REGISTRY.jsonl (reg-sync's convention).
for d in briefs decisions; do
  mkdir -p "$TARGET/$d"
  [ -e "$TARGET/$d/INDEX.jsonl" ] || : > "$TARGET/$d/INDEX.jsonl"
done
mkdir -p "$TARGET/playbooks"
[ -e "$TARGET/playbooks/REGISTRY.jsonl" ] || : > "$TARGET/playbooks/REGISTRY.jsonl"

# The register contract is the floor: generate the indexes now, so day-1
# `just check` has something true to agree with.
( cd "$TARGET" && bun scripts/reg-sync.ts briefs decisions playbooks --fix )

echo "stamped: $TARGET"
echo "next:    create the remote and run the visitor test — playbooks/commissioning-playbook.md"
