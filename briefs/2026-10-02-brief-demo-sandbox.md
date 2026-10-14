---
type: Brief
callsign: BRF-DEMO-SANDBOX
date: 2026-10-02
---

# Brief: The public demo room — two access modes, one sandbox grammar

**Created:** 2026-10-02
**Status:** parked — remote-shaped (an SSH-hosted demo service); parked with the SSH family pending a decision on what remote is for (2026-10-14).

## Lineage

the operator, verbatim: *"lets say we want to host a range of silos, a bit like our dev/github folder"* — *"we want a service where the user can SSH to the server and Gloam will run there"* — *"and we want Gloam as a client calling the server"* — *"so we demo two approaches"* — *"all we need is a security grammar."*

## Extends

BRF-SSH-HOST (P2 host trial, hardened: one corpus → a silo range, one `reader` → two account shapes), ADR-013 (ForceCommand, adopted), BRF-SSH-BLOG (the serve loop this demo's wrapper reuses).

## Grounding

the silo-audit of 2026-10-02 (this brief's sibling, BRF-ROOT-CONTAINMENT) — Gloam's reads are contained; its jump resolution and spawn verbs are not, so the *host* carries the boundary until the product does.

## What

A public demo of gloam on an Ionos VPS: a **range of silos** (sanitized
mirrors, `Dev/GitHub`-shaped) under `/srv/silos`, browsed two ways —
**remote gloam** (SSH in, gloam runs on the server) and **local gloam**
(gloam runs client-side against the remote silos). Two access modes, two
account shapes, one rule:

> **The account can only do what the demo does.**

The grammar, as productions:

```
access      → remote-gloam | local-gloam

remote-gloam → login-shell = scripts/demo/gloam-demo.sh
              wrapper → env scrub + bwrap + exec gloam, cwd = /srv/silos
              bwrap    → ro-bind /srv/silos, ro /usr, no net, no write
              exit gloam → session ends        (no shell behind it)

local-gloam  → sftp-only, chroot = /srv/silos
              no PTY, no exec, no port-forward
```

This is ADR-013's ForceCommand shape, generalised: `gloam-remote`'s
shell *is* the demo; `gloam-local` never gets a PTY at all.

## Why — the boundary sits with the host today

The 2026-10-02 audit (filed as BRF-ROOT-CONTAINMENT) found Gloam's
corpus and reads properly jailed to `siloRoot()`, but jump targets
resolve on **existence, not containment** — a document link to
`/etc/passwd` or `../../` renders, and the `09`/`99` spawn verbs are
inert on Linux only by platform accident. Until the product enforces
its own root, the wrapper's `bwrap` read-only bind makes outside-root
paths *not exist*, which no link can argue with. Kernel-enforced beats
content-trusted.

The demo also widens BRF-SSH-HOST's P2: that trial serves one corpus to
one anonymous `reader`; this serves *many silos* to *two account
shapes*. The silos are sanitized mirrors pushed from GitHub — the VPS
is a cache, never the ledger; nothing unique, nothing secret, lives on
the box.

## How

1. **VPS:** Ionos VPS (the operator's S+ configuration — sizing in
   Open questions), Ubuntu Server 24.04 LTS, UK datacenter, 1-month
   contract. The 30-day refund from BRF-SSH-HOST's risk model applies.
2. **Users:** `gloam-remote` (shell =
   `/usr/local/bin/gloam-demo.sh`, installed from
   `scripts/demo/gloam-demo.sh` — env scrub: `unset TMUX EDITOR
   OKUDA_CLONE OKUDA_CLONE_CMD`; then `bwrap --ro-bind / / --ro-bind
   /srv/silos /srv/silos --tmpfs /tmp --die-with-parent gloam`) and
   `gloam-local` (SFTP-only, chroot `/srv/silos`, `ForceCommand
   internal-sftp`, `DisableForwarding`). Keys only, no passwords, no
   root; `fail2ban`.
3. **Silos:** `/srv/silos/<silo>` — sanitized mirrors, owned by a
   `mirror` service account, demo users group-read, pushed on a cron
   from GitHub. The moat question per silo: if you can't name what's
   secret in it, it doesn't ship.
4. **Managed from this repo:** wrapper, `sshd_config.d/okuda-demo.conf`,
   mirror-push script, deploy script — all in `scripts/demo/`, tracked
   in td, registries synced with the docs. Hosting stays the host's
   job (three concerns); the silo owns the *scripts and the grammar*.
5. **Disposability:** snapshot the known-good state at deploy; a
   trashed demo is a rollback, not an incident.

## Acceptance criteria

- [ ] `ssh gloam-remote@<host>` lands in gloam, sandboxed: a doc with an
  absolute-path link renders nothing (bwrap: the path does not exist);
  `09`/`99` flash inert (env scrubbed); exiting gloam disconnects.
- [ ] `sftp gloam-local@<host>` sees `/` as `/srv/silos`; SSH PTY and
  port-forward both refused.
- [ ] Mirror push on cron; silos read-only for both demo users.
- [ ] Snapshot exists; `fail2ban` active; keys-only enforced.
- [ ] All scripts + configs versioned in `scripts/demo/`; `just check`
  green on the branch; registries synced in the same commit.

## Out of scope

- **Product-level containment** — BRF-ROOT-CONTAINMENT's whole brief;
  this sandbox is the seatbelt, that brief is the product's own
  seatbelt.
- **Option 2** (custom ssh2 daemon) — BRF-SSH-SERVED-2's gate is
  untouched, as in BRF-SSH-HOST.
- **Windowing, compositing** — the three-concerns test holds.

## Open questions

1. **XS or S+.** BRF-SSH-HOST specced the $2 XS for one reader; this
   demo serves a silo range and two modes. Read-only browsing is nearly
   free either way — the floor is the same — so the honest difference
   is RAM headroom (1 GB vs 2) and disk (10 vs 60 GB). Decide at
   provisioning; the ADR records the evidence.
2. **Anonymous access** — publish the `reader`-style pubkey on the demo
   page (gopher holes have no passwords) vs per-invite keys. Inherited
   from BRF-SSH-HOST OQ1.
3. **Port 22 vs 2222** — inherited from BRF-SSH-HOST OQ2; measure the
   noise, decide in the ADR.
4. **The v1 mirror set** — which silos ship. Cheap to add; start with
   two, grow on demand.

## References

- BRF-SSH-HOST — the host trial this extends (P0–P3)
- ADR-013 — ForceCommand, the shape both account shapes generalise
- BRF-ROOT-CONTAINMENT — the product-side fix; this brief is its
  stopgap
- The 2026-10-02 audit: `resolveJumpTarget` (`src/tui.ts:428`),
  launcher fallback (`src/launcher.ts:487`), `makePathValidator`
  (`src/root.ts:242`) — existence, not containment
