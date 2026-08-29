---
type: Brief
callsign: BRF-SSH-SERVED
---

# Brief: SSH-served markdown — option 1 (OpenSSH ForceCommand)

**Date:** 2026-08-26
**Status:** Open
**Branch:** feat/rhs-chip-headers → feat/ssh-deploy
**Context:** riff on the terminal.shop precedent (Promagen et al.).
terminal.shop is cool because commerce-over-SSH is stateful — cart,
identity, payment — so it earns a custom `ssh2` server. A markdown
viewer is **stateless**. The stateless case fits OpenSSH's
`ForceCommand` the way a key fits its lock: zero server code, okuda's
existing PTY fluency does the work. This brief scopes option 1 only;
options 2 (custom ssh2 server + corpus picker) and 3 (in-process TUI)
are named and deferred (see Out of scope).

## What

A single `sshd_config` snippet that, on pubkey auth as a dedicated user,
forces `okuda --tui` against a document from a fixed corpus the operator
controls. No okuda code change. No new dependency. The "SSH server" is
a config file and a dedicated Unix account.

```
# /etc/ssh/sshd_config.d/okuda.conf
Match User okuda
  ForceCommand /usr/local/bin/okuda --tui /srv/okuda/index.md
  PermitTTY yes
  X11Forwarding no
  PermitTunnel no
  AllowTcpForwarding no
  PasswordAuthentication no    # keys only; no shared password to leak
  PubkeyAuthentication yes
  AllowAgentForwarding no
  PermitOpen none
```

Reader connects: `ssh okuda@host`. Gets the doc in the TUI. Scrolls
(j/k, PgUp/Dn, g/G). Disconnects (q / Ctrl-C / Esc). Nothing to install
on the client beyond an SSH client, which every developer machine has.

## Why ForceCommand, not a custom server

The terminal.shop precedent is real but **load-bearing only for
stateful apps.** Its lesson — "SSH-as-app-channel is fast and
frictionless" — is what we borrow. Its *implementation* (a `ssh2`
server) is what we don't, because:

1. **okuda already speaks a PTY.** `setRawMode`, `SIGWINCH`,
   `process.stdout.rows/columns`, color detection via `process.env`.
   OpenSSH allocates a PTY on `PermitTTY yes`, sets `TERM` from the
   client's request, and sends `window-change` as `SIGWINCH`. Every
   branch of okuda's TUI works unchanged. The subprocess is a feature,
   not a limitation: crash isolation, clean teardown, zero coupling.
2. **The state is one file path.** terminal.shop needs to remember a
   cart across keystrokes; okuda needs to know which document to open.
   That's a CLI argument, not server state. A ForceCommand resolves it
   at connect time and the viewer takes over.
3. **No crypto to own.** The SSH protocol — KEX, host keys, channel
   multiplexing — is a chip pan fire to reimplement. OpenSSH has it
   audited. `ssh2` has it tested. Rolling it to learn is benchmaxxing.

## Why it earns its place (the effort-justification gate)

Cost: one config file, one user account, one binary on `PATH`, one
document on disk. No code. Benefit: okuda becomes a deployment, not
just a local viewer — read project docs from any machine with an SSH
key, no clone, no `bun install`, no editor. The cost/benefit ratio is
the best in the okuda feature ledger.

This is the same gate that scoped the resize-anchor brief: the
cheapest adequate thing, with the heavy thing (custom server) named and
deferred until a consumer for it appears.

## How

Operator steps (the whole "implementation"):

1. **Build and install the binary** (already the `just build` target):
   `bun build --compile src/cli.ts --outfile okuda` → place at
   `/usr/local/bin/okuda`. (Or run from source via `bun run` in the
   ForceCommand; the binary is cleaner — no runtime on the host beyond
   the compiled artifact, and matches the origin doc's single-binary
   identity.)
2. **Dedicated user**: `useradd -m okuda` (or the platform equivalent).
   The account owns nothing but the doc corpus; `ForceCommand` means
   the reader never gets a shell.
3. **Corpus**: `/srv/okuda/*.md`, readable by the `okuda` user. Option 1
   serves exactly one doc per destination (the `index.md` in the
   ForceCommand). A corpus picker is option 2's job; here, multiple
   docs = multiple `Match` blocks or multiple host aliases.
4. **Authorize keys**: the reader's public key in
   `~okuda/.ssh/authorized_keys`. Identity is the key — same as
   terminal.shop's anonymous-by-key mode. No passwords, no per-user
   accounts, no identity DB.
5. **sshd snippet** above. `systemctl reload sshd`.
6. **Mermaid**: `mermaid-to-md` must be on `PATH` on the host (okuda's
   external dependency, `DEPENDENCIES.md`). The doc renders mermaid only
   if the binary is present; otherwise the fence falls back to source.
   Worth a preflight in the deploy notes.

## Scope

- **Operator/deploy only.** No okuda source change. The brief lives in
  `briefs/` because it defines a deployment shape; the "code" is a
  config snippet and a runbook.
- **One doc per destination.** The reader connects to
   `okuda@host` and gets `index.md`. Multiple destinations (per-project
   docs) = multiple users, aliases, or `Match` blocks — still config,
   still no code.
- **Pubkey auth, anonymous.** The key authenticates; the operator
  doesn't learn *who* beyond "someone with the authorized key." Adding
  per-reader identity is option 2's scope (and a real reason to move
  there).
- **Read-only.** No upload, no edit, no collaborative mode. okuda is a
  viewer; the corpus is operator-controlled on disk.

## Client-capability gotcha (the one real risk)

okuda's color detection reads `NO_COLOR` and `TERM` from
`process.env`. Over OpenSSH ForceCommand with `PermitTTY yes`, the
client's `TERM` is set in the PTY request and propagated to the
subprocess env — this works out of the box, verified by inspection of
`cli.ts`'s `detectColorMode(process.env)` path. The failure mode if a
future refactor breaks this is **silent**: the doc renders, colors look
off (server's `TERM=dumb` → no color, or a mis-set `COLORTERM`). No
crash, just a worse experience. Worth one line in the deploy runbook:
"connect and confirm color; if missing, check `echo $TERM` inside the
session."

This is the only thing that distinguishes "okuda over SSH" from "okuda
in a local terminal," and OpenSSH handles it for us. No code, no flag.

## Divergence from terminal.shop

terminal.shop owns the whole stack (KEX, channel, app) for stateful
commerce. okuda at option 1 owns only the viewer; OpenSSH owns the
transport. Log as a deliberate divergence in the deploy notes, not a
deficiency — the stateless case doesn't need the stateful stack.

## Out of scope

- **Option 2 — custom `ssh2` server + corpus picker.** Earned when the
  corpus is large enough that "one doc per destination" is painful, or
  when per-reader identity / custom auth UX / connect-time logging is
  needed. Named here so the upgrade path is visible; not built until a
  consumer appears (the same gate as the render-plane logical-tagging
  prerequisite in the resize-anchor brief).
- **Option 3 — in-process TUI (channel stream as stdio).** Earned only
  if deep integration the subprocess boundary blocks appears. For a
  read-only viewer, nothing blocks. Would force the `tui.ts` I/O
  abstraction refactor (hardcoded to `process.stdin`/`stdout`); that
  refactor's second consumer doesn't exist yet. Parked.
- **Arbitrary user-uploaded markdown.** Different product — storage,
  sanitization, quotas, abuse. A collaborative editor, not a viewer.
- **A file-picker / browser TUI inside okuda.** Scope creep against
  the origin doc (okuda renders; it doesn't browse). A corpus picker,
  if needed, is a shell menu in option 2, not an okuda feature.
- **SSH app-framework generalization.** okuda is a markdown viewer that
  happens to work over any PTY. The SSH-ness is a deployment shape,
  not a product identity.

## The adoption question (why build it anyway)

"Will markdown-over-SSH become a thing?" — the wrong yardstick. It
won't be a mass phenomenon: people read markdown in editors (VS Code)
and browsers (GitHub renders). SSH-served markdown competes with "clone
the repo and run `glow`," which is fine for developers and nobody
else. The niche is narrow: project docs for readers who shouldn't need
a toolchain, internal docs behind a key, a "read this without cloning"
share.

The reason to build it isn't adoption; it's that **the cost is a config
file and the dogfood value is real.** Option 1 turns okuda into a
deployment at near-zero cost, exercises okuda's PTY fluency against a
real second transport (not just a local terminal), and gives a
deployment shape for the narrow audience it does serve. The Derrida
question — "should this even be in the consideration set?" — answers
yes at this cost. If option 1 cost a custom server, the answer would be
no. It doesn't. Build it because it's nearly free, not because it'll be
popular.
