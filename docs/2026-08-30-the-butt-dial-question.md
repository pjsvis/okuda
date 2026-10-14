# The butt-dial question

> Logged 2026-08-30. Status: **discussion, no decision, no action.** If the
> temptation resurfaces a third time, it graduates to a one-paragraph ADR
> ("bare digits never fire") purely to stop relitigating.

> **Terminology (2026-10-14).** The word *okudagram* is retired — the composite is **the render**, one portion is **the frame**, a drawing is **a diagram** (`ADR-RETIRE-OKUDAGRAM-066`). This record keeps its words; the ADR is the map.

The butt-dial has been ignored long enough. This is the memo it deserves.

The scenario: type `55` to jump to a doc, mean to type `u` to return, and
instead type `00` — because after a run of digits the hand is still in
digit mode. The keystream fires. You are somewhere you didn't choose.
Herdr's answer is a CTRL+B mode gate; that's the flat-tax school. There are
cheaper schools.

---

### Three species, three guards

Not all butt-dials are the same animal, and each dies to a different guard:

| Species | Example | What kills it |
|---|---|---|
| Mode continuation | `u` → `00` (hand still in digit mode) | Bare digits that are inert |
| Adjacent digit | `54` → `55` (fat-finger) | The number visible pre-commit, correctable |
| Wrong letter | `q` for `u` | Only a gate — or undo |

Species 1 and 2 share a root cause: **digits are the only ambiguous prefix.**
Letters self-terminate — `u` means `u`. Nothing in the keystream says whether
`55` is `5,5` or `55`, so digits shouldn't be allowed to commit on their own.

### From the wild

- **The pagers (1979–forever).** `less`/`man`: digits echo in the corner and
  do *nothing* until Enter. Bare numbers can't butt-dial because they never
  fire. The pending number is legible and backspace-able. Kills species 1 and
  2 simultaneously. The echo line is our own chrome — this is redesigning our
  output, not the content.
- **Vim.** A count is inert until an operator consumes it; `55` followed by
  nothing is nothing. And the jumplist (`ctrl-o`) is vim's `u` — the real
  safety net is cheap reversal, not prevention.
- **Zed (Nov 2025).** Refined which-key timeouts: *pure* prefixes stay
  pending indefinitely; only genuinely ambiguous sequences (where the prefix
  is itself a complete binding) get the 1-second flush. Timeout where
  ambiguity is real, patience where it isn't.
- **The leader-key flat tax (tmux/wezterm/Herdr CTRL+B).** Two-key chord for
  every action to prevent rare error. Correct for tools that can do
  irreversible things (close a pane, kill a process). We can't.
- **The cautionary tale (Claude Code's tracker).** Tab accidentally toggling
  thinking mode; Escape interrupting long queries; and — the masterpiece —
  making `ctrl+b` require a *double tap* to avoid tmux conflicts, which
  created a new butt-dial where double-tapping ctrl+b backgrounds your
  running process. **Every guard manufactures its own failure mode.**
- **Hold-to-confirm.** The kitty keyboard protocol reports key *release*
  events, so "hold the digit, watch the ring" is buildable — but support is
  ~58% of terminals (no Terminal.app, no GNOME). A portability tax to prevent
  briefly viewing the wrong doc. No.

### The actuarial position

Gate price should be proportionate to maximum loss. okuda is a read-only
viewer: the worst butt-dial is *being briefly somewhere else*, and the
back-stack already absorbs that. So the correct premium is near zero:

1. Digit strings are **pending and echoed** — inert until Enter (or a
   consumer key), visible in the status line, correctable, expiring as a
   no-op.
2. **Validation**: `00` isn't a doc ID — flash the error, discard. Strict
   targets turn mode-continuation into a harmless flicker.
3. `u` stays naked. Undo is the guard that never needs a guard.

---

### The freeze is the same question, one scale up

Passing a tablet to someone and fumbling the pass is the butt-dial's touch
cousin — garbage input, no intent. The existing concept already covers it:
the **tied-to-the-mast freeze** (SLIPPY → FROZEN, brief
2026-08-29-brief-okudagram-frame) — no input; refresh on demand.

The discriminator a timeout will never have: **during a handoff, nobody
intends anything.** Normal use has occasional unintentional keys amid real
input; a device in transit has *no* real input, by definition. That's why
heuristic guards (grace periods, debounce) punish honest users while a
deliberate freeze-before-pass is exactly right.

Open questions for when this graduates:

- **Two scopes, one primitive?** The per-panel study freeze (SLIPPY sub-state)
  and a whole-view handoff freeze may be one freeze primitive with two
  consumers — the elision pattern again.
- **The unlock must be un-fumbleable** — deliberate repetition, a chord, a
  dwell; something a grabbing hand won't produce. The fumble happens on both
  ends (giver mid-pass, receiver on catch).
- **The screen is the manual.** The frozen state must display its own unlock
  affordance (slide-to-unlock precedent). We have state glyphs and status
  chrome; a freeze whose escape hatch is memory is a trap, not a guard —
  Claude Code's double-tap lesson, generalised.
- **The escape hatch stays live.** Quit (or its equivalent) should survive
  freezing, or a confused receiver is locked in a room with no door handle.

### Adjacency note

The index-and-jump build (td-9d9981 — two-digit jump buffer, backstack) will
meet this at construction time. This document is the memo it reads.
