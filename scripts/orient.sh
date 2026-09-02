#!/usr/bin/env bash
# orient.sh — one glance answers "are both machines looking at the same
# thing?" The two-machine protocol (2026-09-02): origin is the single
# source of truth, merges go through PRs, builds happen only from clean
# refs that are not behind. This report surfaces every way that protocol
# can silently fail:
#
#   1. branch sync — fetch + ahead/behind vs upstream (local-only
#      branches and diverged mains are the failure class).
#   2. tree state — changed files (clean-tree is the build precondition).
#   3. binary stamp — the compiled binary's SHA vs HEAD (fresh.sh is the
#      gate; this is the glance. The stale-binary trap: a checkout that
#      predates what you believe you shipped).
#   4. docs counts — registry presence at a glance.
#
# Run by `just orient` at session start. Read-only: no writes, no builds.

REPO="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO"

# ── 1. fetch, then branch sync ─────────────────────────────────────────
# Quiet and non-fatal: offline means the report is local-view-only, and
# saying so beats pretending the network answered.
if git fetch --quiet 2>/dev/null; then
  fetched=""
else
  fetched="  (fetch failed — offline? local view only)"
fi

branch="$(git branch --show-current || true)"
if [[ -z "$branch" ]]; then
  branch="$(git rev-parse --short HEAD) (detached)"
fi

upstream="$(git rev-parse --abbrev-ref --symbolic-full-name '@{upstream}' 2>/dev/null || true)"
if [[ -n "$upstream" ]]; then
  read -r behind ahead <<<"$(git rev-list --left-right --count "$upstream"...HEAD)"
  if (( behind == 0 && ahead == 0 )); then
    sync=" — in sync with ${upstream#origin/}"
  else
    sync=" — ahead $ahead, behind $behind vs ${upstream#origin/}"
    [[ $behind -gt 0 ]] && sync+="  ← PULL FIRST"
    [[ $ahead  -gt 0 ]] && sync+="  ← UNPUSHED"
  fi
else
  sync=" — no upstream  ← UNPUSHED BRANCH"
fi
echo "branch:  $branch$sync$fetched"

# ── 2. tree state ───────────────────────────────────────────────────────
changed="$(git status --short | wc -l | tr -d ' ')"
echo "status:  $changed changed file(s)"
[[ "$changed" != "0" ]] && git status --short
echo "last:    $(git log -1 --oneline)"

# ── 3. binary stamp vs HEAD ────────────────────────────────────────────
# fresh.sh is the gate (exit codes, PATH resolution too); this is the
# glance. Same stamp extraction, one line, no exit.
head_sha="$(git rev-parse --short=7 HEAD)"
if [[ -x "$REPO/okuda" ]]; then
  stamp="$("$REPO/okuda" --version | grep -oE '\([0-9a-f]{7,}\)' | tr -d '()' || true)"
  if [[ -n "$stamp" && "$stamp" == "$head_sha" ]]; then
    echo "binary:  fresh ($stamp = HEAD)"
  elif [[ -z "$stamp" ]]; then
    echo "binary:  unstamped (dev build) — just build"
  else
    echo "binary:  STALE ($stamp ≠ $head_sha) — just build"
  fi
else
  echo "binary:  absent — just build"
fi

# ── 4. docs counts ──────────────────────────────────────────────────────
echo "docs:    $(cat briefs/INDEX.jsonl 2>/dev/null | grep -c .) briefs, $(cat decisions/INDEX.jsonl 2>/dev/null | grep -c .) decisions, $(cat debriefs/INDEX.jsonl 2>/dev/null | grep -c .) debriefs, $(cat playbooks/REGISTRY.jsonl 2>/dev/null | grep -c .) playbooks"
