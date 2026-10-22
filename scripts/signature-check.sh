#!/usr/bin/env bash
# signature-check.sh — the compiled artifact must satisfy the precondition its
# FORMAT demands, verified before anyone trusts it.
#
# Why this gate exists
# --------------------
# `bun build --compile` emits a Mach-O whose adhoc, linker-signed CodeDirectory
# carried ONE stale page hash — the last slot, the only partial page (672 bytes
# at the tail of the __LINKEDIT symbol string table). `codesign` called the
# result invalid, and macOS arm64 requires a VALID signature: the process is
# SIGKILLed on exec — exit 137, zero bytes, no message. `zsh: killed` is that.
# macOS 26.6.2 tolerated it; macOS 27.0 does not. The defect was latent for
# four days because nothing verified the signature.
#
# The precondition belongs to the artifact's format (ADR-BUILD-SIGNS-040,
# amended 2026-10-22), so this gate dispatches on the file's own magic:
#
#   ELF     no CodeDirectory exists, so a signature is not a concept and its
#           absence is not a defect. The precondition of an ELF is that it
#           EXECUTES. That is what is asserted — the same class of claim the
#           strict signature makes on darwin, and the one whose failure was the
#           original incident.
#   Mach-O  `codesign --verify --strict`. Where `codesign` is absent (a Linux
#           host inspecting a cross-built darwin artifact) the signature cannot
#           be validated at all: exit 2, UNVERIFIED. `rcodesign verify` is not
#           a substitute — it self-declares *"known to be buggy and gives
#           misleading results"* and rejects a valid ad-hoc signature as *"no
#           cryptographic signature present"*.
#   other   exit 2. Unknown is not a pass.
#
# Exit codes (ADR-GATE-NAMES-041): 0 verified or legitimately inapplicable,
# 1 a named violation, 2 the check could not run.
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

# The bytes are the contract; `file`'s wording is not. Hex, not `read -N 4`: in
# a UTF-8 locale `read -N` counts CHARACTERS, and 0xcf is not a valid lead byte,
# so the Mach-O magics never matched. Measured, then fixed.
magic=$(head -c 4 "$BIN" | od -An -tx1 | tr -d ' \n')

case "$magic" in
  7f454c46)   # \x7fELF
    # The ELF precondition: it executes. `--version` is the cheapest honest
    # probe — one line of stdout, no file argument, exit 0 on any working build.
    rc=0
    out=$("$BIN" --version 2>&1) || rc=$?
    if [ "$rc" -eq 0 ]; then
      echo "signature-check: OK — $BIN executes (ELF has no code signature): $out"
      exit 0
    fi
    echo "signature-check: FAIL — $BIN does not execute (exit $rc)" >&2
    echo "  An ELF carries no code signature, so execution is its precondition." >&2
    echo "  A build that compiles and cannot run is the artefact nobody checked." >&2
    if [ -n "$out" ]; then
      printf '%s\n' "$out" | sed 's/^/  /' >&2
    fi
    echo "  Remedy: rebuild — 'just build' — and read the compile output." >&2
    exit 1
    ;;
  cffaedfe | cefaedfe | feedfacf | feedface | cafebabe | bebafeca)
    if ! command -v codesign >/dev/null 2>&1; then
      echo "signature-check: cannot run — $BIN is Mach-O and 'codesign' is not on PATH" >&2
      echo "  This host cannot validate a darwin signature: install a darwin" >&2
      echo "  toolchain, or run the gate where the artifact runs." >&2
      echo "  The artifact is UNVERIFIED — do not read this as a pass (exit 2)." >&2
      exit 2
    fi
    # `--strict` is the reading that matters: it also rejects a signature whose
    # codeLimit does not reach the end of the signed region, which plain
    # `--verify` accepts. Neither is the fatal condition (that is `invalid
    # signature`), but a strict-valid binary is the stronger promise and costs
    # nothing to demand.
    if codesign --verify --strict "$BIN" 2>/dev/null; then
      echo "signature-check: OK — $BIN verifies"
      exit 0
    fi
    echo "signature-check: FAIL — $BIN does not carry a valid code signature" >&2
    codesign -vvv "$BIN" 2>&1 | sed 's/^/  /' >&2
    echo "  macOS will SIGKILL this binary on exec (exit 137, no message)." >&2
    echo "  Remedy: codesign --force --sign - $BIN" >&2
    echo "  If this fires after a build, the sign step in the 'build' recipe is gone." >&2
    exit 1
    ;;
  *)
    printf 'signature-check: cannot run — unrecognised format 0x%s (exit 2, not a verdict)\n' \
      "$magic" >&2
    echo "  Expected an ELF or a Mach-O. Nothing was verified." >&2
    exit 2
    ;;
esac
