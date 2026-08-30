---
type: ADR
callsign: ADR-ARGV0-LAUNCHER-016
---

# Decision: argv[0] dispatch — `gloam` is the launcher entry point

**Date:** 2026-08-27
**Status:** Accepted

## Context

The browse → read → browse launcher began as a shell function in
`~/.zshrc` (`playbooks/gloam-launcher-playbook.md`) — the composition
option the promotion brief (`briefs/2026-08-26-brief-gloam-launcher-promotion.md`)
named as "option A, ~8 lines of zsh, zero risk to the binary." That brief
parked promotion to the binary on a gate: *loop friction* or *wanting
Gloam-native chrome in the picker*.

The gate fired — on the fourth clause. The fzf key-grammar parity work
(`e041f4f`) established that the picker is a guest of the reader's key
set: `Ctrl-U`/`Ctrl-D` rebound to page-up/down, `esc:cancel` for
clear/done. Those binds live on the fzf invocation. Owning the picker's
*behaviour* means owning the fzf *invocation*, and a shell function the
user maintains cannot be the chrome — it drifts (observed: the deployed
`~/.zshrc` function lagged the playbook by one commit), it lives outside
the silo, and editing it from the repo is a tool reaching outside its
boundary to fix something inside it. The binds are the chrome; the
binary spawns fzf with them; the user never touches dotfiles. That is
the gate firing on "Gloam-native chrome in the picker," not on loop
friction (the loop was fine).

## Decision

**argv[0] dispatch.** When the binary is invoked with `argv[0]` basename
`gloam` (`process.argv0` in Bun-compiled binaries — verified), no file
argument, and a TTY stdin, it runs the browse → read → browse picker
loop (`src/launcher.ts`). Invoked as `okuda`, it reads one document as
before. Two names, two entry contracts, one binary.

The `gloam` symlink (`just install`) already points at the `okuda`
binary; no second binary is built. `process.argv0`'s basename is the
discriminator — `exec -a gloam ./okuda` and the symlinked `gloam` both
resolve to basename `gloam`.

## Alternatives Considered

| Alternative | Why Rejected |
| --- | --- |
| `okuda pick` subcommand | Makes `okuda pick` compete with `okuda <file>` for the no-arg meaning; muddies the reader's one-document contract. Two names keep two intents separate; a subcommand collapses them |
| Keep the shell function; document the binds, paste once | The paste drifts (observed). The binds are chrome; chrome the user maintains isn't chrome the tool guarantees. Re-paste on every change is a maintenance tax on a non-recurring surface |
| A dotfile-sync script (`just ecrb` → edit `~/.zshrc`) | Reaching outside the silo to fix something inside it; idempotency bugs on day one (duplicated comment lines). A one-time paste dressed as infrastructure — benchmaxxing the deployment axis |
| In-process fuzzy matcher (no fzf) | Out of scope (promotion brief): fzf already exists; rebuilding it is benchmaxxing. fzf stays a soft runtime dep of the no-arg mode |

## Consequences

**What became easier:**
- The picker's key grammar is guaranteed by the binary, not by a
  dotfile the user maintains. The binds ship with the build.
- No dotfile edit, no sync script, no `~/.zshrc` reach. The shell
  function is retired (the playbook keeps the recipe as the record of
  the composition that was; the binary is the resolution).
- `just install` already creates the `gloam` symlink; no new install
  step.

**What became harder:**
- `fzf` (and preferably `fd`) become runtime dependencies of the
  no-arg mode — `DEPENDENCIES.md` records them. `okuda <file>` does
  not require them; the launcher prints a clean error and exits 1 if
  `fzf` is missing.
- Two entry contracts to document: `okuda <file>` reads one doc,
  `gloam` picks. The Gloam footer brief's scope clause ("no second
  binary, no subcommand") is amended: argv[0] makes `gloam` an entry
  point but not a second binary or a subcommand.

**Constraints this imposes:**
- `process.argv0` is the only reliable discriminator in Bun-compiled
  binaries (`process.argv[0]` normalises to `"bun"`). A future Bun
  version that changes this breaks the dispatch — the detection is
  isolated in `invokedAsGloam()` for that reason.
- The launcher inherits the reader's verb grammar (the key-grammar
  parity contract). Any new reader verb that has a picker equivalent
  must be bound on the fzf invocation too, or the two surfaces
  disagree. The binds are exported as `GLOAM_FZF_BINDS` for a contract
  test to pin.
- fzf's stdin is the file list (piped); fzf opens `/dev/tty` for its UI
  — so the launcher requires a real TTY (gated on `process.stdin.isTTY`).
  Under SSH the TTY is present; in a pipe it is not, and `gloam` falls
  through to the streaming path (which errors on no file, correctly).

## Related
- Brief: `briefs/2026-08-26-brief-gloam-launcher-promotion.md` (unparked
  by this decision — the gate fired on Gloam-native chrome in the picker)
- Amends: `briefs/2026-08-23-brief-gloam-tui-footer.md` (scope clause —
  argv[0] is an entry point, not a second binary or subcommand)
- Playbook: `playbooks/gloam-launcher-playbook.md` (the composition that
  was; the binary is the resolution)
- Prior: `e041f4f` (key-grammar parity — the work that fired the gate)
- td: `td-a27b86`