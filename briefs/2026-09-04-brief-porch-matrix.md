---
type: Brief
callsign: BRF-PORCH-MATRIX
---

# Brief: The porch matrix — click a URL, land in a terminal, read the silo

**Date:** 2026-09-04
**Status:** rejected — dropped 2026-10-13 (operator first pass)

## Context

the operator's goal, stated plainly: *"give users a URL that they can click; when they click, we want to be in a terminal, rendering markdown — that is what we do; over ssh if it must be; we do not want to send the data back to be rendered in the web page — no point."* `ssh://pjs@omarchy` already opens the porch from the Mac. What's missing is the rest of the matrix — iPhone, iPad mini, an Android device inside the projector — and the link-carrying schemes that land directly on a document instead of on a shell prompt.

This brief is a **test brief**: its deliverable is a verified matrix,
the handler scripts that make it true, and an honest record of what each
glass cannot do. It rides on ADR-030's live search (the thing you land
*in*), ADR-028's wire budget (the thing that makes mobile the real test),
and `docs/2026-09-04-stuf.md` (the dual-pattern windowing: tmux as the
remote virtual canvas for small glasses).

## The shape, in one line

`<a href="okuda://omarchy/ADR-LIVE-SEARCH-030">` → OS scheme handler →
`ssh -t omarchy -- tmux new -A -s silo gloam ADR-LIVE-SEARCH-030` →
okuda rendering on the device's glass. The data never touches the web
page; the link is a pointer.

## The landing command (one server-side decision)

Every device lands on the same command, parameterized by target:

```
tmux new -A -s silo ['gloam <target>']
```

tmux is the phone pattern (`stuf.md` Pattern 1): persistent across
carrier drops, zoomable (`prefix z`), and gives every device the same
session semantics. The scheme handler supplies the target; tmux supplies
the durability. `cd ~/okuda` precedes it so `detectRoot` fires (badge,
callsign resolver).

## The matrix

| Device | Link scheme | Handler | Terminal | Risk focus |
|---|---|---|---|---|
| Mac (control) | `okuda://` | app-bundle scheme handler → Ghostty/iTerm | native | baseline; everything works here first |
| omarchy (local) | direct shell | n/a — the server itself | any | the reference render |
| iPhone | `blink://run?cmd=...` | Blink Shell URL scheme | Blink | 40-col glass, touch keyboard, cellular wire, mosh? |
| iPad mini | `blink://run?cmd=...` | Blink Shell URL scheme | Blink | split view, 80+ cols, the real reading test |
| Android (projector) | `intent://` (Termux) | Termux intent, if Chrome permits | Termux | weakest link story; projector glass size unknown |

## What gets verified per device (the render checklist)

1. **Lands in okuda, not a shell** — the scheme handler carries the
   target: file path or callsign (both resolve; ADR-030 §3).
2. **Live search works** — type, rows re-rank (the `change:reload`
   self-spawn must survive inside tmux over the wire).
3. **The okudagram renders** — braille diagram, mermaid ASCII, footer
   identity run, silo badge. The braille on a 40-col iPhone glass is the
   honest risk; record what actually happens.
4. **The wire holds** — DECSET 2026 atomicity, scroll-repaint cost on
   cellular latency (ADR-028's findings, re-tested on the worst wire).
5. **Resize survives** — rotate the phone; the viewport re-anchors.
6. **Esc → picker → Esc → exit** — the loop closes cleanly through tmux.

## Work plan

1. [ ] `scripts/okuda-scheme.sh` — the client handler: parse
       `okuda://<host>/<target>`, host allowlist, `ssh -t` + tmux
       landing. Dumb by design; allowlist is the security boundary.
2. [ ] macOS registration — minimal app bundle with `CFBundleURLTypes`
       (scheme `okuda`), executable = the handler; registration steps in
       a docs page (one-time per Mac).
3. [ ] omarchy side — `gloam`, tmux, the silo path confirmed; a
       `just` recipe to print the landing command for a given target
       (the thing handlers call, testable locally).
4. [ ] iOS — Blink configured: host, key, and the `blink://run` URL
       pattern verified against a callsign and a file path. Record the
       exact URL format that works (Blink's scheme is versioned; the
       brief trusts the test, not the docs).
5. [ ] Android — Termux: ssh + okuda run manually first; then whether
       Chrome will fire `intent://` from a page. If it won't, record
       the honest result: Android joins via the porch (`ssh://` or
       manual) until a handler exists.
6. [ ] The matrix table filled in, glass by glass, with screenshots or
       transcripts committed under `docs/`.
7. [ ] `docs/okuda-scheme.md` — the user-facing page: the HTML snippet
       patterns, per-device setup, and the limitations list.

## Non-goals

- **No web rendering fallback.** The operator's constraint: the data
  never renders in the web page. If a device can't terminal, it waits —
  the failure mode is "no link", never "a worse copy in the browser".
- **No new server protocol.** ssh (+ optional mosh) only; the gopher
  feed exists separately and is out of scope here.
- **No auth redesign.** Keys already exist; the brief tests with what
  the boxes have.

## Acceptance

- From the Mac, clicking `okuda://omarchy/<callsign>` in a browser ends
  in a terminal rendering that document, inside tmux, on omarchy.
- From the iPhone and iPad mini, a `blink://` link does the same; the
  render checklist passes or is recorded as failed-with-reason.
- Android: an honest verdict — either the intent path works end to end
  or the brief records the blocking mechanism (Chrome intent policy,
  Termux capability) and the porch workaround.
- The handler refuses non-allowlisted hosts.
- `docs/okuda-scheme.md` exists and a stranger could follow it.

## Open questions

- **mosh vs ssh for mobile** — mosh survives IP changes and has local
  echo; but the okuda TUI repaints whole frames. Test `mosh omarchy --
  tmux new -A -s silo` on cellular before believing it. (Ladder
  discipline: ssh first, mosh only if the wire verdict demands it.)
- **Blink scheme exactness** — `blinkshell://run?key=...&cmd=...` vs
  `blink://`; the test decides.
- **Projector glass** — resolution and terminal size are unknown until
  we try; the brief accepts "recorded, unresolved".

## Sequencing

Mac + omarchy first (the control pair), then iPad mini (the reading
glass), then iPhone (the stress glass), then Android (the honest
maybe). Each landing is independently useful; the matrix is complete
when the last row says something true.

## Related

- ADR-030 — what you land in (the live search)
- ADR-028 — the wire is the budget; mobile is the wire's final exam
- `docs/2026-09-04-stuf.md` — dual-pattern windowing; tmux as the
  remote virtual canvas
- `docs/ssh-and-gopher.md`, `just ssh-serve` — the serve-side prior art
  (out of scope here, cited as the alternative already built)
- `docs/2026-09-04-nae-links-either.md` — the link philosophy this
  brief operationalizes: the link is a pointer, the silo is the truth
