---
date: 2026-08-27
tags: [ssh, forcecommand, transport, deploy, cadence, fps-reframe, muppet-exclusion, dogfood]
agent: pi (ses_15ce67)
environment: local
td: td-f3e0b9
branch: feat/tui-live-documents
---

# Debrief: SSH ForceCommand feasibility — the transport, and the "fps" reframe

## Context

The operator asked to (a) survey SSH server options, (b) run and test serving
rendered markdown over SSH "at fps speeds," and (c) opinion. Two briefs were
already on file: `2026-08-26-brief-ssh-served-markdown.md` (Option 1,
ForceCommand — status Open) and `2026-08-27-brief-ssh-tui-integration.md`
(DEC 2026 sync layer — draft). A third, `2026-08-26-brief-tui-live-documents.md`
(the `--tui --watch` work this branch is *on*), was the load-bearing gap nobody
had closed. This debrief records what was tested, what was deliberately *not*
tested, and a reframe the operator's framing forced. The decision is captured
in ADR-013.

## Accomplishments

- **Option 1 proven over a real SSH transport.** A sandboxed, unprivileged
  sshd on 127.0.0.1:2222 (`scripts/sshd-test.sh`) with its own host key,
  authorized_keys, and a `ForceCommand` pointing at the repo's `okuda --tui`
  binary. 7/7 transport assertions pass against a 2106-byte capture:
  alternate-screen enter/restore (`?1049h`/`?1049l`), truecolor SGR over the
  wire (`38;2;…`), the `Gloam` footer badge, the served-doc title, and cursor
  restore on teardown (`?25h`). The sshd log records
  `Starting session: forced-command (config) '… okuda --tui …' on ttys083`.
  This is the transport layer, verified by assertion, not by vibe.
- **Reproducible just recipes.** `just ssh-test` (automated smoke, exits 0/1),
  `just ssh-serve` (starts the sshd, prints the connect command for interactive
  driving), `just ssh-stop` (teardown). The script is hermetic: nothing outside
  `~/okuda-sshd-test/` is touched; no system SSH config; fully reversible.
- **ADR-013 accepted** — ForceCommand as the serving shape; Options 2 and 3
  deferred behind explicit gates; the fixed-frame "fps" loop FO'd from the
  consideration set.

## Problems (the deploy frictions — honest, because the record is the runbook)

- **`Subsystem none` is invalid `sshd_config` syntax.** First sshd launch died
  with `line 17: Missing subsystem command`. Resolution: delete the line. A
  silent trap for anyone copying a "disable sftp" snippet from memory.
- **OpenSSH `StrictModes` rejects `/tmp`.** The first sandbox under `/tmp`
  failed auth with `bad ownership or modes for directory /private/tmp`
  (`/tmp` → `/private/tmp` is world-writable). Resolution: place the sandbox
  under `$HOME` with `chmod 700`. This is why `scripts/sshd-test.sh` defaults
  to `~/okuda-sshd-test`, not `$(mktemp -d)`.
- **SIGPIPE aborts the smoke test under `set -o pipefail`.** The stdin
  subshell `( sleep; printf 'q'; sleep )` receives SIGPIPE when `ssh` closes
  after `q` — expected, not an error — but `pipefail` promotes it to a script
  abort before the ssh exit code is captured. Resolution: `set +e +o pipefail`
  around the ssh call, restored after. A genuine trap: the pipe *should* break
  there.
- **`grep` regex vs escape sequences.** `grep -q $'\x1b[?1049h'` treats `[` as
  a character class; the assertion fails even when the bytes are present.
  Resolution: `grep -F` (fixed-string) for every escape-sequence assertion.

None of these are okuda defects. All four are runbook seeds — the kind of
friction that a deploy doc must carry because it will cost the next operator
an hour each if it lives only in this session's memory.

## Lessons Learned

- **"fps" was the wrong yardstick, and the reframe held under challenge.** The
  operator's framing — "at fps speeds" — bundles two things: transport quality
  (tear-free delivery) and cadence (how often frames are produced). The
  architecture already on file (`brief-tui-live-documents`) is explicit that a
  fixed frame clock is the *anti-pattern*: it repaints on a schedule regardless
  of change, which is the slot-machine / alarm-fatigue failure mode. The right
  metric is *latency from meaningful change to screen* — content-gated,
  event-driven, zero when nothing changed. The disagreement was logged and
  sustained (Edinburgh Protocol: dismantle the entropy, rebuild a better
  argument); ADR-013 FO's the frame clock from the consideration set. "fps" is
  exam technique applied to a feed; "ms-from-change, zero-at-rest" is the
  subject.
- **Build the quality layer against an observed failure, not a telemetry
  aesthetic.** The DEC 2026 synchronized-output layer
  (`brief-ssh-tui-integration`) is the right *answer* to tearing — but tearing
  has not been observed, because the cadence layer that would produce it
  (`--tui --watch`) is not built. Building the sync layer first is benchmaxxing
  against a hypothetical. Defer until the real producer cadence tears.
- **The test proves only what the test asserts.** The smoke test proves the
  transport. It does **not** prove cadence/live-update (`--tui --watch` is
  open), mermaid-over-SSH (the served doc has no mermaid fence; the host's
  `mermaid-to-md` presence is unverified), multi-doc serving, or per-reader
  identity. Recording the boundary is the flense — strip every implication
  that "served over SSH" means "fully shipped."

## Observations

### The three SSH options, gated
- **Option 1 (ForceCommand): proven, accepted.** The state is one file path —
  a CLI argument, not server state — so the stateful-app stack that justifies
  terminal.shop's custom `ssh2` server is not load-bearing here. okuda already
  speaks a PTY; OpenSSH allocates one and propagates `TERM` for free. Cost:
  one config snippet, one user, one binary on `PATH`. Best effort/benefit in
  the feature ledger.
- **Option 2 (custom `ssh2` + corpus picker): deferred.** Gate: "one doc per
  destination is painful" *or* per-reader identity / connect-time logging is
  needed. Neither consumer exists. Re-implementing KEX and channel multiplexing
  to learn them is benchmaxxing against audited OpenSSH.
- **Option 3 (in-process channel-as-stdio): deferred.** `tui.ts` is pinned to
  `process.stdin`/`stdout`; ForceCommand supplies those for free, and the
  subprocess gives crash isolation. The I/O-abstraction refactor has no second
  consumer.

### The cadence model (named, not tuned)
The brief already names the variables: decision latency (floor), volatility,
attention budget (ceiling), production cost. The dial has two asymmetric
failure modes — too fast destroys *trust*, too slow destroys *use*. The viewer
must be event-driven by content change and never throttle (showing known-stale
bytes while fresher ones sit on disk is the specific dishonesty this
architecture exists to avoid). The repaint predicate is *rendered content
changed*, not *N seconds elapsed*. Time belongs to the producer; meaning
belongs to the wire.

## Metrics

- **`just ssh-test`:** 7/7 assertions, ~3s wall (1.2s render wait + ssh
  handshake + teardown). 2106-byte capture.
- **okuda binary:** unchanged — no source modified in this work. The serving
  shape is deploy-only, as the Option 1 brief scoped.

## State at close

- `feat/tui-live-documents`, working tree: `scripts/sshd-test.sh` (new),
  `justfile` (+3 recipes), `decisions/013-ssh-serving-forcecommand.md` (new),
  this debrief (new). Registries to be synced (`just reg-sync-fix`).
- `td-f3e0b9` started; this debrief is its close.
- ADR-013 accepted.

## What's left

- **Implement `brief-tui-live-documents`** — the `--tui --watch` watch
  (directory watch + debounce + content gate + anchored repaint inside
  `runTui`). This is the open brief this branch is *on*, and the cadence layer
  ADR-013 serves but does not build. It is the prerequisite for any honest
  "live document over SSH" test.
- **Verify mermaid-over-SSH** before a real deploy: confirm `mermaid-to-md`
  on the host `PATH` and serve a doc with a mermaid fence through `just
  ssh-test <doc>`.
- **DEC 2026 sync layer** (`brief-ssh-tui-integration`): pull in *only if* the
  real producer cadence tears. Build against observed failure.
- **Option 2** custom server: revisit when a corpus picker or per-reader
  identity is asked for. The gate stands.

## Related

- Brief: `briefs/2026-08-26-brief-ssh-served-markdown.md`
- Brief: `briefs/2026-08-26-brief-tui-live-documents.md`
- Brief: `briefs/2026-08-27-brief-ssh-tui-integration.md`
- Decision: `decisions/013-ssh-serving-forcecommand.md`
- Runbook: `scripts/sshd-test.sh` (`just ssh-test` / `just ssh-serve` / `just ssh-stop`)
