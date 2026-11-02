#!/usr/bin/env bash
# release.sh — the publish path, in one place, so it is not remembered.
#
# Two packages ship from this repo: `okuda` (the viewer) and `@polyvis/testcard`
# (the surface card, generated from scripts/tty-card.sh at pack time). They have
# independent versions and independent dist-tags — the card is stable at 0.1.0
# while okuda is an alpha — so the tag is always derived from each package's own
# version, never passed in.
#
# The two orders, and when each applies:
#
#   NORMAL     merge → tag → push          CI gates and publishes (OIDC, no token)
#   BOOTSTRAP  merge → publish → tag → push  a human publishes; CI then finds the
#                                            version already present and skips
#
# BOOTSTRAP exists for exactly one reason: trusted publishing is configured per
# package, on the package's own settings page, so a package must exist before an
# OIDC relationship can point at it. The first ever publish therefore cannot be
# CI's. After that, NORMAL is the only path anyone should use — there is no
# credential to hold.
#
# Usage: scripts/release.sh <preflight|publish|tag|status>
# Exit:  0 ok, 1 a named failure, 2 the instrument could not run.
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

PACKAGES=(. packages/testcard)   # roots, in publish order (card first: it is the dependency nobody has)

die() { echo "release: $*" >&2; exit 1; }
say() { printf '%s\n' "$*"; }

# Each package's own version, and the dist-tag implied by it. A prerelease
# published without --tag lands on `latest`, which would let `npx okuda` resolve
# to an alpha; deriving the tag is what stops that being a remembered flag.
pkg_version() { bun -e "console.log(require('./$1/package.json').version)"; }
pkg_name()    { bun -e "console.log(require('./$1/package.json').name)"; }
dist_tag()    { case "$1" in *-*) echo alpha ;; *) echo latest ;; esac; }

# The registry probe. `npm view` exits non-zero for a version that is not there,
# which is the whole test; the output is discarded on purpose.
published() { npm view "$1@$2" version >/dev/null 2>&1; }

cmd_status() {
  for root in "${PACKAGES[@]}"; do
    local name v
    name=$(pkg_name "$root"); v=$(pkg_version "$root")
    say ""
    say "$name  local $v  →  --tag $(dist_tag "$v")"
    if published "$name" "$v"; then say "  registry: $v is published"; else say "  registry: $v is NOT published"; fi
    local tags
    if tags=$(npm view "$name" dist-tags --json 2>/dev/null); then
      say "  dist-tags: $(printf '%s' "$tags" | tr -d '\n' | sed 's/  */ /g')"
    else
      say "  dist-tags: (the package does not exist yet)"
    fi
  done
}

cmd_preflight() {
  local fail=0
  check() { if eval "$1"; then say "  ok   $2"; else say "  FAIL $2"; fail=1; fi; }

  say "preflight"

  local branch
  branch=$(git rev-parse --abbrev-ref HEAD)
  check "[ '$branch' = main ]" "on main (currently $branch)"
  check "[ -z \"\$(git status --porcelain)\" ]" "working tree clean"

  git fetch --quiet origin 2>/dev/null || true
  if git rev-parse --verify --quiet origin/main >/dev/null; then
    check "[ \"\$(git rev-parse HEAD)\" = \"\$(git rev-parse origin/main)\" ]" "HEAD is what origin/main has (push first)"
  fi

  local v
  v=$(pkg_version .)
  check "echo '$v' | grep -qE '^[0-9]+\.[0-9]+\.[0-9]+(-[0-9A-Za-z.-]+)?$'" "okuda version parses: $v"
  check "! git rev-parse --verify --quiet refs/tags/v$v >/dev/null" "tag v$v does not exist yet"

  # The artefact, not the repo: this is the one thing the published card is.
  check "sh scripts/tty-card.sh --assert >/dev/null" "the card passes its own control"

  # Both tarballs must be producible. `prepack` generates the card's bin/, so a
  # broken prepack is invisible until publish without this.
  check "npm pack --dry-run --silent >/dev/null 2>&1" "okuda packs"
  check "( cd packages/testcard && npm pack --dry-run --silent >/dev/null 2>&1 )" "testcard packs"

  say ""
  if [ "$fail" -eq 0 ]; then
    say "preflight PASS — 'scripts/release.sh tag' is the normal path"
  else
    say "preflight FAIL — fix the lines above; nothing was published" >&2
    exit 1
  fi
}

cmd_publish() {
  say "publish (bootstrap — a human holds the credential here, and only here)"
  npm whoami >/dev/null 2>&1 || die "not logged in to npm; run 'npm login' first (2FA)"
  say "  publishing as $(npm whoami)"

  for root in "${PACKAGES[@]}"; do
    local name v tag
    name=$(pkg_name "$root"); v=$(pkg_version "$root"); tag=$(dist_tag "$v")
    if published "$name" "$v"; then
      say "  skip $name@$v — already published"
      continue
    fi
    say "  publishing $name@$v → --tag $tag"
    ( cd "$root" && npm publish --access public --tag "$tag" )
  done
  say ""
  say "done. Now 'scripts/release.sh tag' — CI will gate, find the versions present, and skip."
}

cmd_tag() {
  local v
  v=$(pkg_version .)
  git rev-parse --verify --quiet "refs/tags/v$v" >/dev/null && die "tag v$v already exists"

  local branch
  branch=$(git rev-parse --abbrev-ref HEAD)
  [ "$branch" = main ] || die "on '$branch', not main — merge first"

  say "tagging v${v}"
  git tag -a "v${v}" -m "okuda ${v}"
  git push origin main
  git push origin "v${v}"
  say ""
  if published "okuda" "$v"; then
    say "okuda@$v is already on the registry — CI will gate and skip the publish."
  else
    say "CI will gate, then publish okuda@$v (OIDC, no token) — watch the run."
  fi
}

case "${1:-}" in
  preflight) cmd_preflight ;;
  publish)   cmd_publish ;;
  tag)       cmd_tag ;;
  status)    cmd_status ;;
  *) sed -n '3,25p' "$0" | sed 's/^# \{0,1\}//' ; exit 2 ;;
esac
