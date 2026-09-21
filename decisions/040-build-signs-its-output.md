---
type: ADR
callsign: ADR-BUILD-SIGNS-040
---

# Decision: The build signs its own output — re-sign after compile, verify in the gate

**Date:** 2026-09-21
**Status:** Accepted

## Context

`bun build --compile` emits a Mach-O whose adhoc, linker-signed `CodeDirectory` carries
**one stale page hash** — the last slot, which is the only *partial* page: 672 bytes at
the tail of the `__LINKEDIT` symbol string table. `codesign -vvv` reports `invalid
signature (code or signature have been modified)`. macOS arm64 requires a **valid**
signature and kills the process on exec: exit 137, zero bytes, no message. `zsh: killed`
is that.

macOS 26.6.2 tolerated it; macOS 27.0 does not. The binary in the tree was built
2026-09-16, ran twenty timed times on 2026-09-19, and was dead on 2026-09-21 — the day
after the upgrade. The compiler did not change (Bun 1.4.0 since 2026-08-20) and the
binary did not change (mtime unchanged), so the OS was the only variable.

The `build` recipe had no signing step. So **every build produced an artifact that could
not exec, and reported success** — for four days, because nothing verified the signature.
The reader found it as `zsh: killed gloam`.

## Decision

The `build` recipe re-signs the binary it produces and then verifies it, and `check`
verifies the binary in the tree.

## Alternatives Considered

| Alternative | Why Rejected |
|-------------|--------------|
| Sign in `install` and `gloam` | `./okuda` is still dead after a bare `just build`; the defect stays at the point of production and is repaired downstream |
| Strip the signature | Unsigned is SIGKILLed too — measured, exit 137. Not a remedy |
| Pin an older Bun | Bun is not the variable: same version since 2026-08-20, and the binary that died was four days old and unchanged |
| Wait for a Bun fix | macOS 27.0 is installed. The defect is live now, and the remedy is one command |
| Leave it to `just ship` | `ship` is a manual, occasional recipe. The failure needs to surface at the build, not at the release |

## Consequences

**What became easier:**

- `just build` means *runnable*. The recipe's success now asserts the artifact can exec,
  which is what the recipe always claimed and never checked.
- `just ship` works again, and its build step cannot pass with a dead binary.
- The class of failure — a signed artifact modified after signing — is caught by a gate
  instead of by an outage.

**What became harder:**

- `codesign` is a build dependency. It ships with macOS, so it is present wherever this
  arm64 binary could run at all — but a Linux or CI build must skip the step, not fail on
  it, which is why `scripts/signature-check.sh` exits 0 for an absent binary.
- The binary **shrinks** on re-sign: 63,976,562 → 63,604,752 bytes, because Apple's
  `codesign` uses 16 KiB pages where the linker used 4 KiB. Anyone comparing artifact
  sizes will see a 372 KB drop and should not read it as a lost feature.

**Constraints this imposes:**

- The re-sign must stay **after** the compile. A future edit that reorders the recipe
  silently reintroduces the defect — which is why the recipe verifies rather than
  trusting the order.
- The verification is macOS-only. `signature-check.sh` must skip, not fail, where
  `codesign` does not exist.

## Notes

- **The defect was latent, not immediate, and that is the lesson.** Nothing verified the
  signature, so an artifact that had been unrunnable since 2026-09-16 was invisible until
  the OS changed underneath it. The decision is not "sign the binary" — it is **verify the
  artifact's precondition in the gate**. Signing is the remedy; the check is the fix.
- **This is not a Bun bug report.** Bun's output is internally consistent: `codeLimit`
  equals the signature offset, and only one page hash is stale. Whether Bun wrote a hash
  before finishing that page, or macOS 27 changed which signatures it validates, is not
  established. The mechanism is recorded as a candidate in the note.
- **The flag is not the discriminator.** `~/.local/bin/mermaid-tui` and `~/.local/bin/uv`
  are both `flags=0x20002(adhoc,linker-signed)` and both verify. A census of
  `~/.local/bin` found twelve locally-built Mach-O binaries, all twelve valid — so this is
  one invalid signature, not an OS-wide breakage.
- **Not fixed here:** the diagram-swallow at `src/render.ts:155-160` (a failed mermaid
  render produces no output and no warning), and `facade-lint.sh`'s silent exit 1 where
  `just` is absent. Both are reported in the note and neither belongs to this decision.
- **Recorded, not yet run:** nothing. This ADR reverses no behaviour — it adds a step to a
  recipe that had none, so there is no abandonment surface and no palimpsest.

## Related

- Note: `docs/2026-09-21-the-page-the-signature-got-wrong.md` — the measurement, the four controls, the falsified first story
- Brief: `BRF-GLOAM-OWNS-LOOP` — the launcher brief whose preconditions assume a binary that runs
- Dependency: `DEPENDENCIES.md` — the `codesign` row, and the `--compile` signature section
- Playbook: `PLY-MERMAID-DIAGRAMS` — cited by the note, not by this decision
- Skill: `macho-signature-triage` — the triage procedure, and `scripts/signature-check.sh` is its instrument in the tree
