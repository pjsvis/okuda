#!/usr/bin/env bash
# scan.sh — a search whose dialect and coverage are both pinned.
#
# Why this exists. In an agent shell `grep` does not resolve to BSD grep: the
# app puts its own shim first on PATH (cli/vendor/shim/brokered-bin/) and the
# command lands on a bundled toybox 0.8.13, whose regex dialect is neither
# BSD's nor GNU's. `\|` is a literal pipe there and `\s` is not a class, so a
# pattern that is *legal in both dialects* returns a plausible 0 and prints no
# error. The shim's own fallback fires only on "Unknown option" — it bridges
# syntax, not semantics — which is why the failure is silent and survives
# review. Measured 2026-10-05: `grep -c 'it(\|describe('` gives 0 where BSD
# gives 4, on the same file.
#
# ripgrep is not a drop-in either. Its default honours .gitignore, so it
# silently skips tmp/ — where every probe in this silo lives. Measured:
# `rg --files .` sees 473 files where `-uu` sees 33,932.
#
# So this script removes both choices instead of documenting them:
#   * one engine, by absolute path, never the shimmed `grep`;
#   * ignore rules off and hidden files in, so tmp/ is searched;
#   * the coverage stated on stderr, so the number is attributable.
#
# Stdout carries results only; the header goes to stderr and survives a pipe.
#
# Exit 0 on a match, 1 on no match, 2 when the instrument is missing — a
# missing instrument is not a verdict (ADR-GATE-NAMES-041).
set -euo pipefail

RG=/opt/homebrew/bin/rg

if [[ $# -lt 1 ]]; then
  echo "scan: usage: just scan PATTERN [PATH...]" >&2
  exit 2
fi

if [[ ! -x "$RG" ]]; then
  echo "scan: cannot run — no ripgrep at $RG (exit 2, not a verdict)" >&2
  echo "  install ripgrep, or search with /usr/bin/grep -E explicitly" >&2
  exit 2
fi

pattern="$1"
shift
paths=("$@")
[[ ${#paths[@]} -gt 0 ]] || paths=(.)

# node_modules and .git are excluded deliberately rather than by an ignore
# file — and the exclusion is printed, because an unstated exclusion is how
# the tmp/ trap happens in the first place.
excludes=(--glob '!node_modules' --glob '!.git')

rg_version="$("$RG" --version 2>/dev/null | head -n 1 || true)"
echo "scan: ${rg_version:-ripgrep} — ERE dialect, ignore rules OFF, hidden ON" >&2
echo "scan: excluding node_modules/ .git/  ·  paths: ${paths[*]}" >&2

"$RG" -uu --line-number --no-heading "${excludes[@]}" -- "$pattern" "${paths[@]}"
