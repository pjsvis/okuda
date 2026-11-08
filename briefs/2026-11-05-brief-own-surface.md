---
type: Brief
callsign: BRF-OWN-SURFACE
---

# Brief: Own the glass for the session — the pair taken at entry and given back at exit

**Date:** 2026-11-05
**Status:** Ready

---

## Context

`ADR-GLASS-INK-073` refused `OSC 10`/`OSC 11` on the ground that it makes a pure
renderer stateful: a mutation of the glass's defaults with no restore, whose
residue (`SIGKILL`) outlives the process. That argument was written about **the
renderer** — `okuda <file>` to stdout, into a pipe, into scrollback — and there it
holds: there is no instantiation to bound.

**Gloam is the case the table did not consider, because Gloam is not a renderer
emitting to a surface; it is a program that has taken the surface.** It already
owns alt-screen, raw mode, the cursor, `SIGINT`/`SIGTERM`, `SIGWINCH` and a
documented exit order (`src/tui.ts:6-11`, `:742-743`, `:1465`, `:1527-1530`).
Adding the foreground/background defaults to that claim is the same act applied to
a different resource, not a new class of act.

Two observations from the session that produced this brief make the case stronger
than the record allowed for:

- **It dissolves the coverage objection rather than answering it.** A background
  cannot be painted from a stream of runs — `src/ansi.ts:206-210` paints only the
  line's own bytes, blank fence lines emit nothing, and the region below the last
  line stays the host's. That is an objection to painting *cells*. `OSC 11` does
  not paint cells; **it changes the paper**, so every unpainted cell is already our
  ground.
- **It dissolves the scrollback objection.** An alt-screen session writes no rows
  into the shell's log, so there is nothing durable to be wrong later.

What survives is narrow and mechanical, and this brief exists to measure it rather
than argue it.

## Warrant

**The probe decides, and the brief is rejected — not parked — if it says no.**
`scripts/probe-osc.ts` must print `OWNED-ABLE` on **both** hosts (the Mac's own
terminal, and the Omarchy box's Ghostty under its pane host) before any of the work
plan below is authorised. The two failure modes are the reason:

| probe says | meaning | consequence |
|---|---|---|
| `OWNED-ABLE` | the pair is read, the set takes, the restore returns the host's own value | proceed |
| `NO REPLY` | no read → **no give-back** → ownership is a leak | reject this brief |
| `set had NO EFFECT` | the host answers queries and ignores sets | reject; the pin remains the only mechanism |
| answered but `RESTORE DID NOT MATCH` | we cannot give it back | reject |

**A give-back we cannot perform is not ownership.** That sentence is the whole
safety model, and the probe is written to enforce it: it refuses to set without a
successful read, and refuses under a multiplexer unless forced.

## Evidence

- **The pin is not deliverable; an instantiation-owned pair is.** `npm i -g` cannot
  ship a per-host override, and `BRF-PAIR-DELIVERED`'s mechanism needs a human to
  install it and a re-themer to re-apply it. A viewer whose job is to orient a
  stranger on an unconfigured machine gets nothing from the pin.
- **The cost of not owning it is measured.** Unpinned, an Omarchy light theme puts
  **16 of 21** on-ground roles under 3:1 on flexoki-light and **19 of 21** on
  catppuccin-latte, with `state-todo` at **1.15:1** — the alarm lamp at the
  ground's own luminance, while the prose still reads (`ADR-LEGIBILITY-SURFACE-090`).
- **The arithmetic acquires a silent error term the moment the host composites.**
  At `background-opacity = 0.9` over white the reference ground becomes `#383533`
  and the ink ratio falls **10.6 → 7.87**; `muted` drops to 1.59:1 and no gate can
  see it. Owning an *opaque* pair removes the term for the duration.
- **`SIGKILL` residue is a wash.** It leaves the alt screen up and raw mode on,
  exactly as it would leave our pair set, and the remedy is the same: `reset`.

## Objective

Gloam owns the glass's foreground and background for the duration of a session,
using a pair this repo already measures, and gives back **byte-for-byte** the
strings the host supplied — on every exit path that is ours to control.

## Scope

**In:** the Gloam TUI session (`bin/gloam.ts` → `src/launcher.ts` → `src/tui.ts`),
session-scoped ownership, the read-gate, the restore, a way to turn it off.

**Out, deliberately:**

- **The stdout renderer.** `okuda <file>` inherits, as today. There is no
  instantiation to bound and the scrollback objection is real there.
- **Cell-level backgrounds**, including reviving `code-background`. The probe's
  finding is that changing the paper is the correct instrument; painting runs is
  not.
- **Multiplexer passthrough.** Under `$TMUX`, Herdr's pane env or `$STY`, refuse
  and inherit: the blast radius is panes we do not own.
- **`OSC 4` (palette entries), `OSC 12` (cursor), `OSC 110/111` (reset-to-initial).**
  Only the two defaults, so the pair is exactly what the gates measure.
- **A light/dark switch inside the run.** The card is chosen once, from the read,
  at entry.

## Preconditions

1. `bun scripts/probe-osc.ts` run **in a real pane** on both hosts, with `--set`,
   reporting `OWNED-ABLE`. Paste the receipt into this brief when it lands.
2. A pty-free test seam, in the shape `tests/tui.test.ts` already uses: the
   lifecycle is a **pure function returning an ordered byte list**, and the loop
   writes it. `syncWrap` and `decodeKey` are the precedent — no spawn, no pty.

## Work Plan

**Phase 1 — the lifecycle, as bytes.** A module exporting
`surfacePlan(host, pair) → { enter: string[]; leave: string[] }` and
`surfaceCommand(host, pair) → "own" | "inherit"` (the fail-closed decision, pure:
a host record in, a verdict out). Tests assert: the enter order (read → trust →
set fg → set bg), the leave order (**restore fg/bg first, then `1049l`**, so the
main screen never shows a frame of our ground), the refusal cases (no read, a
multiplexer marker, no tty), and that `surfacePlan` emits nothing at all when the
verdict is `inherit`.

**Phase 2 — the session.** `src/tui.ts` enters the pair immediately after the alt
screen and leaves it in the documented exit order before `EXIT_ALT`; the launcher
owns the session boundary and does **not** re-own per document
(`src/launcher.ts:36-44` toggles the alt screen per document — the pair is not a
document resource). Signals covered by the existing handler path; the `finally`
in the probe is the pattern.

**Phase 3 — the switch, the receipt, the amendment.** `--no-own-surface` (and an
env opt-out) for a principal whose terminal already holds the pair; one line on the
debug channel when the verdict is `inherit` and why; `ADR-GLASS-INK-073` amended —
**the refusal is lifted for Gloam's instantiation and stands for the stdout
renderer** — with the probe's receipt as the price of admission; `just probe-osc`
recipe; a debrief.

## Acceptance Criteria

1. `gates.sh` green, including a new `surface` gate running the Phase 1 pure tests.
2. `surfacePlan` emits **no byte** when the verdict is `inherit` — asserted, not
   assumed. A fail-closed path that emits a read is still a state change.
3. The exit order is exactly: restore fg → restore bg → `EXIT_ALT`. A test pins the
   sequence, because the FOUT fix is one level down and this is the same bug.
4. The pair restored is the **string** the host sent (`rgb:…`), not a re-serialised
   hex; a test covers the `rgb:` and `#rrggbb` spellings.
5. `--no-own-surface` produces a byte stream identical to today's, asserted by
   rendering the same document in both modes.
6. On a host that answers nothing, the session is indistinguishable from today's
   except for one debug line — no set, no restore, no residue.
7. The ADR amendment names the probe and the hosts it passed on, and a host that
   fails it is named, not assumed away.

## Notes

- **The read is the seam, and its cost is real**: it is async, it needs a timeout
  (150ms is the probe's default; the session should be tighter and is worth
  measuring), and it can be answered by the wrong party. That is why the probe's
  multiplexer test is a *declared limit* rather than a fact: a host that proxies
  silently reads as a plain terminal.
- **Do not pick the pair from the read out of politeness.** The read tells us what
  the host had; the *card* is chosen from `referencePair()` or the derived light
  card (`scripts/lightcard.ts`), because those are the pairs the gates measure.
  Using the host's own pair would be inheriting with extra steps.
- **What this does not fix:** the minutes in a cooking packet. Owning the ground
  makes the page's arithmetic true; it says nothing about which tokens carry the
  decision.

## Related

- `decisions/073-the-glass-owns-its-ink.md` — the refusal this brief asks to scope
- `decisions/090-the-legibility-surface.md` — the three instruments, and the pair
- `briefs/2026-11-03-brief-pair-delivered.md` — the pin, which remains for every
  path that has no instantiation
- `scripts/probe-osc.ts` — the warrant's instrument
- `src/tui.ts` — the exit order this adds a line to
