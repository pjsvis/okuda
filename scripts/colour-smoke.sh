#!/usr/bin/env bash
# colour-smoke.sh — BRF-FENCE-COLOUR's proof in one run, no TTY.
#
# The chain, each link loud:
#   1. fresh — the binary on PATH is this checkout's HEAD. A stale
#              binary renders exactly like yesterday, and a long-lived
#              --watch pane carries the code it was born with: the
#              version line is the tell.
#   2. .md   — the corpus: tagged fences carry chroma bytes (typescript
#              and python both), mermaid still owns its glyph, and no
#              protocol tag leaks into glass output.
#   3. .ts   — a whole source file is one coloured fence (P2).
#   4. .py   — a fixture: another lexer, same rule.
#
# Exit 0 = the three input classes render; any failure names the class.
set -euo pipefail

REPO="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO"

fail() { echo "smoke: FAIL — $*" >&2; exit 1; }

# chroma 2.27.0, --formatter terminal16 --style monokai: keyword =
# SGR 96 (bright cyan); identifiers are 97 (full white).
# grep -F wherever an ANSI pattern appears — ESC[96m is a literal
# byte sequence, not a regex (BRE reads [96m] as a bracket expression).
KW=$'\x1b[96m'

MD="$(mktemp "${TMPDIR:-/tmp}/okuda-smoke-md.XXXXXX")"
TS="$(mktemp "${TMPDIR:-/tmp}/okuda-smoke-ts.XXXXXX")"
PY_OUT="$(mktemp "${TMPDIR:-/tmp}/okuda-smoke-py.XXXXXX")"
trap 'rm -f "$MD" "$TS" "$PY_OUT"' EXIT

# ── 1. binary freshness ────────────────────────────────────────────────
bash scripts/fresh.sh

# ── 2. .md — the showcase carries the two tagged fences ────────────────
./okuda docs/showcase.md > "$MD" || fail "showcase.md: render exited non-zero"
grep -Fq "$KW" "$MD" || fail "showcase.md: no chroma keyword colour — tagged fences render untagged"
grep -Fq $'\x1b[96mdef\x1b[0m' "$MD" || fail "showcase.md: the python fence is uncoloured"
grep -q "⋮" "$MD" || fail "showcase.md: mermaid lost its glyph"
od -An -c "$MD" | grep -q '\\0' && fail "showcase.md: a NUL protocol tag leaked into glass output"

# ── 3. .ts — a whole source file is one coloured fence ─────────────────
./okuda src/cli.ts > "$TS" || fail "src/cli.ts: render exited non-zero"
grep -Fq $'\x1b[96mimport\x1b[0m' "$TS" || fail "src/cli.ts: no keyword colour — the file parsed as something other than a ts fence"
grep -q "wrapWholeFile" "$TS" || fail "src/cli.ts: expected content absent"

# ── 4. .py — the fixture, another lexer ────────────────────────────────
mkdir -p tmp
cat > tmp/colour-smoke.py <<'PY'
def elide(line: str, width: int) -> str:
    if len(line) <= width:
        return line
    return line[: width - 1] + "…"
PY
./okuda tmp/colour-smoke.py > "$PY_OUT" || fail "tmp/colour-smoke.py: render exited non-zero"
grep -Fq $'\x1b[96mdef\x1b[0m' "$PY_OUT" || fail "tmp/colour-smoke.py: the extension did not colour the file"

echo "smoke: colour OK — .md corpus (chroma + mermaid + no tag leak), .ts whole file, .py fixture: 3/3 classes painted"
