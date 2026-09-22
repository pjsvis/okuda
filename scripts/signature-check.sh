#!/usr/bin/env bash
# signature-check.sh — the compiled binary must carry a valid code signature.
#
# Why this gate exists
# --------------------
# `bun build --compile` emits a Mach-O whose adhoc, linker-signed CodeDirectory
# carries ONE stale page hash — the last slot, which is the only partial page
# (672 bytes at the tail of the __LINKEDIT symbol string table). `codesign` calls
# the result invalid, and macOS arm64 requires a VALID signature: the process is
# SIGKILLed on exec — exit 137, zero bytes, no message. `zsh: killed` is that.
#
# macOS 26.6.2 tolerated it; macOS 27.0 does not. The same bytes ran twenty times
# on 2026-09-19 and were killed on 2026-09-21. The defect was latent for four
# days because nothing verified the signature.
#
# See docs/2026-09-21-the-page-the-signature-got-wrong.md and ADR-BUILD-SIGNS-040.
#
# An absent binary is not a failure: `okuda` is gitignored, so a fresh clone has
# none and nothing has been built to verify.
#
# Run directly:  bash scripts/signature-check.sh [path-to-binary]
set -euo pipefail

BIN="${1:-okuda}"

if [ ! -f "$BIN" ]; then
  echo "signature-check: skipped — $BIN not built (run 'just build')"
  exit 0
fi

# `--strict` is the reading that matters: it also rejects a signature whose
# codeLimit does not reach the end of the signed region, which plain `--verify`
# accepts. Neither is the fatal condition (that is `invalid signature`), but a
# strict-valid binary is the stronger promise and costs nothing to demand.
if codesign --verify --strict "$BIN" 2>/dev/null; then
  echo "signature-check: OK — $BIN verifies"
  exit 0
fi

echo "signature-check: FAIL — $BIN does not carry a valid code signature" >&2
codesign -vvv "$BIN" 2>&1 | sed 's/^/  /' >&2
echo "  macOS will SIGKILL this binary on exec (exit 137, no message)." >&2
echo "  Remedy: codesign --force --sign - $BIN" >&2
echo "  If this fires after a build, the re-sign step in the 'build' recipe is gone." >&2
exit 1
