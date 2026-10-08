---
type: Brief
callsign: BRF-SSH-HOST
date: 2026-09-29
---

# Brief: SSH host — landing the ADR-013 reading room where SSH gives a shell

**Created:** 2026-09-29
**Status:** Proposed — awaiting operator review
**TD:** td-83cc47 (epic; P1 is the only in-silo code, P0/P2/P3 are ops tracked here for lineage)
**Branch:** feat/ssh-reading-room

## Lineage

the operator, verbatim: *"we should get our ssh game sorted on the Ionos end point, then we should look for a host that will support ssh serving — is hostinger the answer here?"*

## Grounding

ADR-013 (ForceCommand adopted, localhost-proven), BRF-SSH-BLOG (v1 consumer, ready), BRF-SSH-SERVED-2 (Option-2 gate, parked — untouched by this brief), and the polyvis.net spike of 2026-09-29 (pv-gloam, askpass helper, authorized_keys upload).

## What

A host for the SSH reading room. The shape has been settled since
2026-08-27 — ADR-013's OpenSSH `ForceCommand`, proven end-to-end on
127.0.0.1:2222 (`scripts/sshd-test.sh`, 7/7 assertions) — but every test
of it has been local. No brief owns the question the operator asked:
*where does the room actually live?*

This brief owns it, in four phases:

- **P0 (ops, outside the silo) — Ionos interim, mostly done.**
  polyvis.net's webspace is SFTP-only: exec and PTY channels both
  refused (verified 2026-09-29, twice, two channels). Nothing runs
  there, ever. The interim reading path is sync-then-render: the askpass
  helper (`~/.config/polyvis/askpass.sh`, backed by skate's
  `polyvis_sftp_password`), `pv-gloam` (`~/.local/bin`: SFTP pull →
  cache → local gloam render; 25 files pulled from
  `/ssh/okuda/docs`), cache at `~/.cache/polyvis/ssh-okuda-docs`.
  Remaining: an `ssh` config alias, and the disposition of the uploaded
  `authorized_keys` (recommend: keep — inert, documented, one SFTP `rm`
  away; the host accepts the key but still demands the password).
- **P1 (in-silo code) — the linux-x64 build target.** `just build`
  emits a darwin-arm64 binary; the host is linux-x64. Bun cross-compiles
  natively: `--target=bun-linux-x64` (glibc; a musl variant exists if
  the trial lands on Alpine). One recipe, `just build-linux`, `BUILD_SHA`
  defined, output `dist/okuda-linux-x64`. The one build friction is
  external: `mermaid-to-md` is a Rust CLI and must ride along (musl
  cross-build or on-host cargo — see Open questions).
- **P2 (ops, outside the silo) — the host trial.** Below.
- **P3 (in-silo docs) — the vendor ADR + debrief.** Evidence over
  vibes: the ADR cites trial measurements, not marketing.

## Why — measured, not asserted

| Question | Finding | Source |
|---|---|---|
| Can anything run on Ionos webspace? | No. `exec request failed on channel 0`; PTY allocation refused. SFTP is the only channel. | Observed 2026-09-29, spike session |
| Does Hostinger *shared* answer SSH serving? | No. The vendor's own capability doc: *"installing any compilers, compiling scripts or running compiled programs is not supported on our Web and Cloud hosting plans."* `sudo` disabled; port 65002; jailed bash. A compiled gloam there is unsupported-by-vendor — a lottery ticket, not infrastructure. | hostinger.com/support capability article, retrieved 2026-09-29 |
| What does a real shell cost? | Ionos VPS Linux XS: $2/mo, 1 vCore, 1 GB RAM, 10 GB NVMe, full root, unlimited traffic, 30-day money-back. | ionos.com, retrieved 2026-09-29 |
| Does Bun cross-compile to it? | Yes — `--target=bun-linux-x64`, standalone executable, glibc. | Bun docs (bundler/executables), retrieved 2026-09-29 |
| DNS lock-in? | None. polyvis.net's DNS stays at Ionos regardless of where the room lives; an A record (`ssh.polyvis.net` → any VPS) points wherever we like. | — |

## The Hostinger question, answered

**Shared: no.** It answers "SSH *access*," not "SSH *serving*" — access
gets you into a jail you cannot install anything into, where the
vendor's own documentation says compiled programs are unsupported. The
moat question settles it in one line: there are no secrets in that
tier, only constraints.

**VPS: yes, but undistinguished.** Hostinger VPS (~$5+/mo) runs the
room fine — so does every VPS on earth. Ionos VPS XS does it for $2
under the same vendor, same invoice, same DNS panel as polyvis.net,
with a 30-day refund that makes the trial free to run. A reading room
will not outgrow 1 vCore; the box is *predictably adequate* — the floor
rises, the ceiling is never touched. There is no reason to pay for a
second vendor relationship to reach the same floor.

The final vendor call is P3's ADR, made on trial evidence — not on this
brief's opinion.

## How (P2 — the trial)

1. Ionos VPS Linux XS, Debian, nearest datacenter. The 30-day refund
   makes the trial free; that is the whole risk model.
2. Harden sshd: keys only, no root login, no password auth.
   `sshd_config.d/okuda.conf` lifted verbatim from ADR-013 /
   BRF-SSH-SERVED.
3. Dedicated `reader` user; ForceCommand per BRF-SSH-BLOG
   (`scripts/gloam-serve.sh` — the fd/fzf loop, promoted by that brief;
   not re-specced here).
4. Ship `dist/okuda-linux-x64` (+ a `gloam` alias) and `mermaid-to-md`
   to `/usr/local/bin`; corpus to `/srv/okuda-docs` (the operator's
   staged `/ssh/okuda/docs` corpus).
5. A record: `ssh.polyvis.net` → VPS. DNS stays at Ionos.
6. Smoke: the ssh-test assertion set (alternate-screen entry/restore,
   truecolor propagation, footer badge, clean teardown) run against the
   *public* endpoint — not localhost — plus one mermaid spot-check
   (`diagram-monster.md`).

## Acceptance criteria

- [ ] P1: `just build-linux` emits `dist/okuda-linux-x64` whose
  `--version` prints the BUILD_SHA; `just check` green on the branch.
- [ ] P2: `ssh reader@ssh.polyvis.net` from a clean laptop lands in the
  gloam loop; the ssh-test assertions pass against the public endpoint;
  a mermaid fence renders.
- [ ] P3: vendor ADR accepted with trial evidence; debrief written;
  registries synced in the same commit.
- [ ] P0: `Host polyvis-sftp` alias in `~/.ssh/config`; the
  `authorized_keys` disposition documented (kept: inert).

## Out of scope

- **Option 2** (custom ssh2 daemon). BRF-SSH-SERVED-2's gate is
  untouched: a public anonymous room is still one corpus, one
  ForceCommand, no per-reader identity. When a named consumer appears,
  that brief reopens through its own front door.
- **Windowing, compositing, any rendering change.** The three-concerns
  test holds: hosting is the host's job; okuda gains only a build
  target. We don't care where the text comes from — we care that the
  room runs.

## Open questions

1. **Anonymous access.** Keys-only (publish a `reader` pubkey on
   polyvis.net) vs a fixed public password (possible on our own sshd;
   impossible on host-managed sshd — one more nail in shared hosting).
   v1 recommendation: keys-only, publish the key. Gopher holes have no
   passwords; neither should the room.
2. **Port.** 22 (frictionless, well-scanned) vs 2222 (the sandbox
   convention). Trial on 22; measure the noise; decide in the ADR.
3. **mermaid-to-md provisioning.** A cargo release build may not fit
   the XS's 1 GB RAM; musl cross-build on macOS (cargo-zigbuild) is the
   leading candidate. Decide in P1.
4. **Corpus for v1.** BRF-SSH-BLOG says blog-posts; the operator staged
   okuda's own docs (`/ssh/okuda/docs`). Cheap to serve both —
   `gloam-serve.sh` takes a root.

## References

- ADR-013 — SSH serving shape: ForceCommand (accepted 2026-08-27)
- BRF-SSH-SERVED / BRF-SSH-SERVED-2 / BRF-SSH-BLOG / BRF-SSH-TUI —
  the serving lineage
- `scripts/sshd-test.sh` — the sandbox that proved Option 1
- `docs/ssh-and-gopher.md`, `docs/ssh-and-gemini.md` — the protocol
  surveys behind the room
- Ionos webspace behaviour: observed 2026-09-29 — exec/PTY refused,
  SFTP-only, key accepted but password still required
