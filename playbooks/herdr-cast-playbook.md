---
type: Playbook
callsign: PLY-HERDR-CAST
---

# Herdr cast playbook — casting documents to panes, scripting the host

## What this is

How to cast a silo document to a Herdr pane from a session, and how to
script the host generally. Herdr is the host: per the three concerns
(`docs/2026-08-20-origin-doc.md`), windowing belongs to it — okuda
renders, gloam selects, Herdr decides where things appear. This playbook
is the bridge: the control surface, the cast recipe, and the gotchas
learned by doing it once with the socket schema and once without.

## The three primitives (herdr.dev/docs/agent-automation)

| Primitive | Owns | Notes |
|---|---|---|
| **Layout** (`workspace`/`tab`/`pane split`) | topology | where terminals live |
| **Pane** (`pane run`/`send-text`/`send-keys`/`read`/`wait-output`) | raw terminals | run commands, read output, wait for matches |
| **Agent** (`agent start`/`prompt`/`wait`) | recognized coding agents | lifecycle state, prompts |

Rule of thumb: **panes for ordinary processes, agents for coding agents.**
`pane run` submits a command *with* Enter atomically (it honors
bracketed-paste); prefer it over `send-text` + `send-keys enter`.

## The cast recipe

The script: `bun scripts/cast.ts <file.md> [label]` —
creates a tab rooted in the silo, runs `./okuda <file>` in its root pane,
waits for the document to render, reports the pane id. The equivalent
by hand:

```bash
created=$(herdr tab create --cwd "$PWD" --label on-screen-now --focus)
pane_id=$(printf '%s\n' "$created" | jq -r '.result.root_pane.pane_id')
herdr pane run "$pane_id" ./okuda docs/showcase.md
herdr pane wait-output "$pane_id" --match showcase.md --timeout 15000
herdr pane read "$pane_id" --source visible --lines 40   # verify the render
herdr pane close "$pane_id"                              # clean up
```

The verification step matters: `pane wait-output --match <filename>`
confirms the document actually rendered before anything claims success.

## Gotchas (each learned the hard way, once)

1. **Capture IDs from JSON responses; never predict them.** `tab create`
   prints `.result.tab.tab_id` and `.result.root_pane.pane_id`. Herdr ids
   are workspace-qualified (`wC:pS`) and not guessable.
2. **`agent.*` targets agents; `pane.*` targets terminals.** A fresh tab
   is a raw shell pane with no agent — `herdr agent send-keys wC:pS …`
   fails with `agent_not_found`. Use `herdr pane run` / `pane read` for
   shell panes; `agent.*` only after `agent start` (which needs an
   available shell at its prompt and a supported `--kind`).
3. **`pane run` adds the Enter.** `send-text` and `send-keys` are
   low-level and non-submitting; use `run` for commands.
4. **Wait, then claim.** `pane wait-output --match <text> --timeout 15000`
   is the difference between "cast" and "cast, verified". Match on the
   filename; the render echoes it in the footer.
5. **The socket is there when the CLI isn't enough.** Newline-delimited
   JSON over `~/.config/herdr/herdr-client.sock` (protocol schema:
   `herdr api schema --json`); methods are dotted (`pane.send_input`,
   `pane.read`). The CLI wrappers cover casting; raw socket is for event
   subscriptions and protocol clients.

## Casting is the host's job — and that is the point

Per the three concerns, okuda never manages panes and Herdr never
renders markdown. The cast is the handshake between the two: gloam
selects, okuda renders, Herdr places. The `cast.ts` script is therefore
*thin* — three Herdr calls, no rendering logic, no layout opinions. If
it grows features, they belong in Herdr's config or a plugin
(`herdr plugin link`), not here.

## Sources

- herdr.dev/docs/cli-reference/ (the complete command tree)
- herdr.dev/docs/agent-automation/ (the three primitives, recipes)
- herdr.dev/docs/socket-api/ (newline-delimited JSON, protocol 17)
- `scripts/cast.ts` — the working cast script (spawnSync, JSON-captured
  ids, wait-verified)

## Related

- Brief: `briefs/2026-08-29-brief-herdr-dashboard.md` (the host's exhaust,
  composed)
- Doc: `docs/2026-08-30-gloam-seams.md` (the seams; Herdr is the windowing
  concern and the two-pane anchor/probe host)
- ADR: `decisions/025-mnemonic-namespace-model.md` (the silo the cast
  serves)
