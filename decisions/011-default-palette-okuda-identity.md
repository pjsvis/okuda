# Decision: The default palette is the okuda preset — identity over parity

**Date:** 2026-08-25
**Status:** Accepted (recorded retrospectively 2026-08-25; the flip landed
unrecorded and was surfaced by the `DRACULA_PALETTE` rename)

## Context

ADR-006 made the Dracula/glow palette the default — a deliberate
convergence phase: okuda's colours were tuned until byte-identical to
`glow`'s rendering, so parity could be verified against the reference
CLI. ADR-006's amendment named its own supersession trigger: "a future
okuda-identity palette supersedes this ADR." Convergence achieved, the
identity phase began: the okuda preset (LCARS-style, with the
code-panel affordance — `code-background` as a real hex) exists and is
the viewer's own voice. Dracula remained the default in name while the
project's identity diverged in fact.

## Decision

`loadPalette()` with no `name` returns the **okuda preset**; the
Dracula/glow palette is retained as the named preset `--palette
dracula` for parity comparison. The identifier holding the Dracula
bytes is renamed `DEFAULT_PALETTE` → `DRACULA_PALETTE` so no exported
name claims a default it no longer is.

## Alternatives Considered

| Alternative | Why Rejected |
|-------------|--------------|
| Keep Dracula as default | Parity phase is complete; the default should carry the project's identity, not glow's |
| Keep the `DEFAULT_PALETTE` name holding Dracula bytes | A name that lies about its role; every future reader pays the disorientation tax (the hazard flagged in the test-fix review) |
| Export both `DEFAULT_PALETTE` (alias) and `DRACULA_PALETTE` | Aliases double the vocabulary for zero behaviour; the ghost stays alive |

## Consequences

**What became easier:**
- The default needs no flag: `okuda file.md` is the identity, `--palette dracula` is the comparison
- `DRACULA_PALETTE` reads as what it is — the glow-parity anchor for contract tests and the parity test itself

**What became harder:**
- Dracula parity claims now require the explicit flag in repro steps
- Tests asserting Dracula bytes must pass the palette explicitly (done, `292f6f7`)

**Constraints this imposes:**
- ADR-006's contract machinery survives: byte-exact contract tests, single-source-of-truth hex (now: the preset tables in `src/palette.ts` + `src/palettes/okuda.json`), no hex outside them
- The NO_COLOR parity invariant is palette-independent and unchanged

## Related
- Supersedes: `decisions/006-glow-dark-palette.md` (its named trigger fired)
- Brief: `briefs/2026-08-25-brief-fix-tests-after-default-flip.md`
