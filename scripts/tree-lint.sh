#!/usr/bin/env bash
# tree-lint.sh — the tree's own integrity: no tracked symlinks, no node_modules.
#
# Why this gate exists
# --------------------
# On 2026-10-09 a `git add -A` ran in a worktree that carried a convenience
# symlink to the shared tree's node_modules. It committed as mode 120000 with an
# ABSOLUTE target — pointing at the very path it occupied, a self-loop in the
# shared tree — and .gitignore did not stop it, because `node_modules/` (with the
# trailing slash) matches a DIRECTORY and not a symlink. It then rode a push to
# origin (07d3be9) and was repaired in two commits (97924b0 removes it, 9a85bbf
# matches node_modules by name).
#
# A tracked symlink is almost always a worktree convenience artefact: it carries
# a host-local absolute path that does not survive a clone, and it is exactly the
# shape a directory-only gitignore is blind to. This gate makes the class loud,
# both in `just check` (at commit time) and in the pre-push hook (at push time).
#
# Run directly:  bash scripts/tree-lint.sh
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

fail=0

# 1. Tracked symlinks (mode 120000). `git ls-files -s` is
#    `<mode> <sha> <stage>\t<path>` — cut on the tab keeps paths with spaces.
syms=$(git ls-files -s | grep '^120000' | cut -f2 || true)
if [ -n "$syms" ]; then
  echo "tree-lint: FAIL — tracked symlink(s) in the index:"
  printf '%s\n' "$syms" | sed 's/^/  /'
  echo "  a tracked symlink carries a host-local path; usually a worktree artefact — remove it"
  fail=1
fi

# 2. node_modules, by name or underneath — the belt to the .gitignore braces.
nm=$(git ls-files | grep -E '(^|/)node_modules(/|$)' || true)
if [ -n "$nm" ]; then
  echo "tree-lint: FAIL — node_modules tracked in the index:"
  printf '%s\n' "$nm" | sed 's/^/  /'
  fail=1
fi

if [ "$fail" -eq 0 ]; then
  echo "tree-lint: OK (no tracked symlinks, no node_modules)"
fi
exit "$fail"
