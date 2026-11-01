#!/usr/bin/env bash
# orient.sh — the shim, kept so the address survives the port.
#
# The derivation moved to scripts/orient.ts (BRF-SILO-STATUS) so one reading
# could have several renders: the text `just orient` has always printed, JSON
# for a host, and the status line a suite reports. The shell keeps the name and
# delegates — `bash scripts/orient.sh` and `just orient` behave as before, and
# `--json` / `--no-fetch` pass through.
#
# Read-only: no writes, no builds.
set -euo pipefail
exec bun "$(cd "$(dirname "$0")" && pwd)/orient.ts" "$@"
