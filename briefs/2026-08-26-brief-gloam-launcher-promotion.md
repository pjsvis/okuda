# Brief: Gloam Launcher Promotion — argv[0] No-Arg Mode (parked)

**Date:** 2026-08-26
**Status:** Parked — gated on dogfooding
**Gate:** the shell-function launcher (`playbooks/gloam-launcher-playbook.md`)
used for ≥ 1 week, and the browse→read→back gap (no return-to-picker after
quitting a document) demonstrated to actually itch. If one up-arrow + Enter
keeps being fine, this brief stays parked forever — correctly.

## What (when unparked)

`okuda` invoked with **no arguments**, both streams TTYs, reads its own
`argv[0]`; when it is `gloam`, it runs the picker itself:

1. Spawn `fd -e md` (or an in-process recursive walk if fd is missing).
2. Pipe through `fzf` in a PTY with `--preview='okuda {}'` (the preview
   child re-enters the binary by its `okuda` name — streaming path).
3. On selection, `runTui` on the chosen file — top of document, footer,
   the lot. On Esc, exit 0 silently.

## Why park it

The composition (option A) is ~8 lines of zsh, zero risk to the binary, and
does 90% of the job. The in-binary version buys exactly one thing — the
browse→read→back loop — at the cost of a soft dependency (`fzf`) inside the
binary and a second entry contract. That trade is only worth making if the
loop's absence is *observed* to hurt, not anticipated.

## Constraints when unparked

- **First non-flag fix observed (2026-08-26):** killing the wheel's fourth
  incarnation required a DECSET 1007 disable/restore dance around fzf —
  raw terminal-state management from the shell function. The launcher now
  owns terminal state, not just flags; a binary picker would save/restore
  it robustly (query + restore). Still config-not-code, so the gate holds,
  but the environment-config accretion is the thing to watch: reopen the
  gate if it keeps growing.

- **Amend the Gloam brief, don't bend it silently.**
  `briefs/2026-08-23-brief-gloam-tui-footer.md` scopes Gloam as "a footer,
  not a product name; no second binary, no subcommand." argv[0] dispatch is
  neither a second binary nor a subcommand, but it *does* make `gloam` an
  entry point. The scope clause gets amended in the same commit, with a
  pointer to this brief.
- **ADR required** (rule 7): argv[0]-dispatch vs `okuda pick` subcommand is
  two viable options — the decision gets written down either way.
- **Graceful absence:** if `fzf` is not on PATH, print one clear line
  (`gloam: fzf not found — see DEPENDENCIES.md`) and exit 1. Never a stack
  trace.
- **DEPENDENCIES.md** gains `fzf` as a runtime (not dev) dependency of the
  no-arg mode, verified date and all.

## Out of scope (permanently)

- An in-process fuzzy matcher. fzf already exists; rebuilding it is
  benchmaxxing.
- Any cloud/stash/recents. The silo stays local.
- A picker in the SSH ForceCommand sandbox — the boundary pins one document
  by design.
