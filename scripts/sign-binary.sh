#!/usr/bin/env bash
# sign-binary.sh — re-sign the compiled artifact, where its format has a
# signature to re-sign.
#
# The precondition belongs to the artifact's FORMAT, not to the host that
# happened to compile it (ADR-BUILD-SIGNS-040, amended 2026-10-22):
#
#   ELF     no CodeDirectory, no codeLimit, no signed pages. Nothing to sign.
#           Prints why and exits 0 — a no-op is the correct act, not a skip.
#   Mach-O  macOS 27 SIGKILLs a binary whose signature it rejects, so the
#           linker's signature is re-made after the compile. `codesign` where
#           it exists; `rcodesign` (apple-codesign, ad-hoc by default) where it
#           does not — the same act, from a Linux host.
#   other   Cannot be judged. Exit 2 — a missing instrument is not a verdict
#           (ADR-GATE-NAMES-041).
#
# The signature is not verified here. `scripts/signature-check.sh` is the gate;
# this is the remedy that gate's remedy text names.
#
# Run directly:  bash scripts/sign-binary.sh [path-to-binary]
set -euo pipefail

BIN="${1:-okuda}"

if [ ! -f "$BIN" ]; then
  echo "sign-binary: cannot run — $BIN does not exist (exit 2, not a verdict)" >&2
  echo "  Nothing was signed. Build the artifact first: 'just build'." >&2
  exit 2
fi

# Read the file's own magic rather than `file`'s wording: the bytes are the
# contract, the phrasing of a diagnostic tool is not. Hex, not `read -N 4`: in a
# UTF-8 locale `read -N` counts CHARACTERS, and 0xcf is not a valid lead byte,
# so the Mach-O magics never matched. Measured, then fixed.
magic=$(head -c 4 "$BIN" | od -An -tx1 | tr -d ' \n')

case "$magic" in
  7f454c46)   # \x7fELF
    echo "sign-binary: not applicable — ELF carries no code signature"
    exit 0
    ;;
  cffaedfe | cefaedfe | feedfacf | feedface | cafebabe | bebafeca)
    # Mach-O, thin or fat, either endianness.
    if command -v codesign >/dev/null 2>&1; then
      codesign --force --sign - "$BIN"
      echo "sign-binary: re-signed with codesign (ad-hoc)"
      exit 0
    fi
    if command -v rcodesign >/dev/null 2>&1; then
      # Ad-hoc by default: no certificate source, so digests only.
      rcodesign sign "$BIN"
      echo "sign-binary: re-signed with rcodesign (ad-hoc)"
      exit 0
    fi
    echo "sign-binary: cannot sign — no darwin signer on this host (exit 2)" >&2
    echo "  Looked for 'codesign' (macOS) then 'rcodesign' (apple-codesign, Linux)." >&2
    echo "  The linker's signature is what this artifact keeps, and it is UNVERIFIED." >&2
    exit 2
    ;;
  *)
    printf 'sign-binary: cannot run — unrecognised format 0x%s (exit 2, not a verdict)\n' \
      "$magic" >&2
    echo "  Expected an ELF or a Mach-O. Nothing was signed." >&2
    exit 2
    ;;
esac
