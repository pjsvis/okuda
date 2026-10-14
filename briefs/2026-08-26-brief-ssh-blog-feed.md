---
type: Brief
callsign: BRF-SSH-BLOG
---

# Brief: SSH Blog Feed — the Gopher-Serve v1

**Date:** 2026-08-26
**Status:** parked — the SSH family is parked pending a decision on what remote is for (2026-10-13)

## Depends on

`feat/ssh-forcecommand` branch (sshd sandbox, `scripts/sshd-test.sh`); `playbooks/gloam-launcher-playbook.md` (the loop)

## What

Serve the blog-posts folder over SSH as a navigable reading feed: connect,
get the browse → read → browse loop, quit, disconnect. A gopher hole with
a Gloam badge instead of a selector prompt.

1. **Promote the launcher to a script** — `scripts/gloam-serve.sh`: the
   fd/fzf loop rooted at a served root (default `blog-posts/`), hermetic
   `env FZF_DEFAULT_OPTS=`, `--no-mouse`, alt-scroll discipline (1007 off
   in picker, on in read), query reseed. No `~/.zshrc` dependence —
   ForceCommand environments are not login shells.
2. **Wire it as the ForceCommand target** in the sandboxed sshd
   (`sshd-test.sh` serve shape): a dedicated `sshd` on a nonstandard port,
   ForceCommand → the script, served root pinned by config. The existing
   single-doc `view` recipes stay; `serve` learns a `--root` shape.
3. **The loop is the whole UX**: pick (fzf, keyboard), read (Gloam TUI,
   top of doc, space/b page, r reload), back to the picker. Esc ends the
   session and the connection.

## Why

The launcher loop was built for one reader and works for strangers: same
terminal bytes, same hermetic picker, same reader. Precedent:
`ssh blog.hashicorp.com` — the terminal as a publishing medium is a real
tradition (Hashicorp did it; the tildeverse never died). The asset
ledger is nearly complete (reader: done; loop: done; sandbox: done on
`feat/ssh-forcecommand`; client: proven on iPad/Echo). v1 is config
wearing a brief's clothes.

## Constraints

- **Sandbox first.** The served surface is a multi-document directory,
  not a single pinned doc — the ForceCommand review that covered
  `view <doc>` must be re-run for the loop shape before any port is
  exposed beyond localhost. `sshd-test.sh` stays the pattern: dedicated
  sshd, nonstandard port, no system sshd involvement.
- **No authentication design here.** Keys-only is assumed (the sandbox's
  existing discipline); the *feed* is content, not identity. If public
  exposure ever happens, that's its own brief (and probably its own ADR).
- **fzf over PTY:** the picker needs a PTY (fzf is a full-screen TUI);
  ForceCommand + `internal-sftp` shapes don't provide one. The wrapper
  must exec through a PTY allocation — test this in the sandbox, not in
  production theory.

## Out of scope

- Document links between posts (v2 — `2026-08-26-brief-document-links.md`).
- Publishing pipelines to Medium/Substack/GitHub Pages — those remain the
  distribution channels; the gopher-serve is the *origin* artefact, the
  thing we point to when we hold our heads high. See
  `decisions/011-gopher-serve-as-origin.md` (to be written with v1).

## Verification

- Sandbox: `just ssh-serve <root>` → local connect lands in the loop;
  Esc exits and drops the connection; no shell prompt is ever reachable.
- Client: iPad/Echo over LAN — same session shape as the dogfood loop.
- Regression: `just ssh-view doc`, `just ssh-test` still pass untouched.
