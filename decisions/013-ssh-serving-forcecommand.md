---
type: ADR
callsign: ADR-SSH-SERVING-013
---

# Decision: SSH serving shape — OpenSSH ForceCommand (Option 1)

**Date:** 2026-08-27
**Status:** Accepted

## Context

okuda is a terminal markdown viewer that already speaks a PTY (`setRawMode`,
`SIGWINCH`, `process.stdout.rows/columns`, color detection via `process.env`).
The question was how to serve rendered documents over SSH — i.e. make okuda a
deployment, not just a local viewer. Three shapes were on file
(`briefs/2026-08-26-brief-ssh-served-markdown.md`):

- **Option 1** — an OpenSSH `ForceCommand` snippet + a dedicated Unix account.
  No okuda code, no new dependency. OpenSSH allocates the PTY and propagates the
  client's `TERM`; okuda's TUI runs unchanged as a subprocess.
- **Option 2** — a custom `ssh2` server in-process, with a corpus picker and
  per-reader identity.
- **Option 3** — in-process TUI with the SSH channel stream as stdio.

A sandboxed, unprivileged sshd on 127.0.0.1:2222 was used to test Option 1
end-to-end (`scripts/sshd-test.sh`, `just ssh-test`). The test asserts the real
transport properties, not a vibe: alternate-screen entry/restore, truecolor SGR
propagation (color over the wire), the footer badge, and clean teardown. 7/7
assertions pass against a 2106-byte capture; the sshd log records
`Starting session: forced-command (config) '… okuda --tui …' on ttys083`.

## Decision

**Adopt Option 1 (OpenSSH ForceCommand) as the SSH serving shape.** Options 2
and 3 are named and deferred behind explicit gates; neither is built until a
consumer for it appears.

## Alternatives Considered

| Alternative | Why Rejected (for now) |
|-------------|------------------------|
| **Option 2 — custom `ssh2` server + corpus picker** | Earned only when "one doc per destination" is painful, or when per-reader identity / connect-time logging is needed. No such consumer exists. Re-implementing KEX, host keys, and channel multiplexing to learn them is benchmaxxing against an audited OpenSSH. The state okuda needs is one file path — a CLI argument, not server state — so the stateful-app stack that justifies terminal.shop's custom server is not load-bearing here. |
| **Option 3 — in-process channel-as-stdio TUI** | `tui.ts` is hardcoded to `process.stdin`/`stdout`, and ForceCommand hands okuda exactly those for free. The subprocess is a feature here, not a limitation: crash isolation, clean teardown, zero coupling. The I/O-abstraction refactor that Option 3 would force has no second consumer. |
| **A fixed frame-rate ("fps") delivery loop** | A clock that repaints regardless of change is the slot-machine / alarm-fatigue failure mode that `brief-tui-live-documents` names explicitly. The right metric is *latency from meaningful change to screen*, zero when nothing changed — i.e. content-gated, event-driven repaint, not a frame clock. "fps" is the wrong yardstick; it is FO'd from the consideration set. |

## Consequences

**What became easier:**
- okuda is a deployment at the cost of one config snippet, one dedicated user,
  and one binary on `PATH`. No code, no runtime on the host beyond the compiled
  artifact.
- The entire PTY/`TERM`/`SIGWINCH`/color stack is exercised against a real
  second transport (SSH), not just a local terminal — the dogfood surface
  widens for free.
- Crash isolation: a viewer fault tears down one session, not a long-lived
  server process.

**What became harder:**
- One doc per destination. Multiple documents need multiple `Match` blocks,
  host aliases, or users — still config, but unergonomic past a small corpus.
- No per-reader identity. The key authenticates; the operator learns "someone
  with the authorized key," not *who*. This is a constraint, not a feature —
  and the real reason a future move to Option 2 would be earned.
- Deploy frictions the test surfaced: `Subsystem none` is invalid `sshd_config`
  syntax (remove the line); OpenSSH `StrictModes` rejects world-writable
  ancestor dirs (the sandbox must live under `$HOME`, not `/tmp`); a non-root
  sshd cannot write login records (harmless, logged). These are runbook seeds,
  not okuda defects.

**Constraints this imposes:**
- `mermaid-to-md` must be on `PATH` on the host for mermaid fences to render
  (okuda's external dependency, `DEPENDENCIES.md`); otherwise the fence falls
  back to source. Mermaid-over-SSH is **not** covered by the current test (the
  served doc has no mermaid fence) and must be verified before a real deploy.
- The client's `TERM` must propagate to the subprocess env for color detection
  to work. Verified by inspection of `cli.ts`'s `detectColorMode` path and by
  the truecolor assertion in the smoke test; a future refactor that breaks this
  fails *silently* (doc renders, colors off) — worth one line in the deploy
  runbook.

## Related

- Brief: `briefs/2026-08-26-brief-ssh-served-markdown.md` (Option 1 scope)
- Brief: `briefs/2026-08-26-brief-tui-live-documents.md` (the open watch work —
  the cadence layer this decision serves but does not build)
- Brief: `briefs/2026-08-27-brief-ssh-tui-integration.md` (DEC 2026 sync layer
  — deferred until tearing is *observed*, not anticipated)
- Debrief: `debriefs/2026-08-27-debrief-ssh-forcecommand-feasibility.md`
- Runbook: `scripts/sshd-test.sh` (`just ssh-test` / `just ssh-serve` / `just ssh-stop`)
