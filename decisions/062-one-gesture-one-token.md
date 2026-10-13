---
type: ADR
callsign: ADR-ONE-GESTURE-062
date: 2026-10-13
---

# Decision: One gesture, one token — how a digit run resolves, and why there is no clock

**Date:** 2026-10-13
**Status:** Accepted

## Context

`ADR-REPEATED-DIGIT-ACTUATORS-032` settled **which** pairs are actuators: the
doubled pairs. It says nothing about **how a run of one digit becomes a token** —
how many taps, how fast, and what a hold is. That rule arrived separately and has
never been written down at the decision tier, which is a real gap rather than a
tidiness complaint: a comment is not a contract, and the code comment that carries
this one also promises a mechanism the rulings deleted (see *Consequences*).

**Two homes, one design, no home.** The contract was specified in
`briefs/2026-09-13-brief-prolonged-press.md` (BRF-PROLONGED-PRESS) — three states,
eight transitions, no clock — and the **code landed on 2026-10-10 inside a
different brief entirely**, `BRF-SEAM-AUDIT`, which generalised the buffer to span
reads so `]]` and `[[` fire again (`ef23743`, `src/tui.ts` `advanceRunBuffer`).
The seam-audit brief records the debt honestly (*"the run buffer and the latch
this generalises"*), and the prolonged-press epic's implementation tasks were
never filed against the board. So the design and its implementation are recorded
under two briefs, the epic reads as untouched, and the rule itself is in neither.

The system is three gestures, one outcome: **two delayed taps, a fast double tap,
and a prolonged hold all produce the same single token.** A tty has no key-up
event, so the reader's three physical affordances are one byte-stream, and the
grammar's job is to make them indistinguishable.

## Decision

**A run of one tap resolves at the second tap, stays spent, and swallows the rest
of the run. Only a different key ends it.** The machine — three states, eight
transitions, **no clock**:

| State | Input | Next | Output |
| --- | --- | --- | --- |
| `Empty` | a tap | `Held` | — |
| `Empty` | any other key | `Empty` | — |
| `Held` | the **same** tap | `Spent` | **the doubled-pair token** |
| `Held` | a **different** tap | `Empty` | the mixed-pair (vector) token |
| `Held` | any other key — `ESC`, or motion | `Empty` | — (the abort) |
| `Spent` | the **same** tap | `Spent` | — (swallowed: the run's remainder) |
| `Spent` | a **different** tap | `Held` | — (a new run begins) |
| `Spent` | any other key | `Empty` | — |

Three properties fall out of the table, and they are the whole design:

- **`Held` is the only state that produces a token, and it produces exactly one on
  either kind of second tap.** Both exits carry one token and only one. That *is*
  the "one gesture, one token" contract — visible in the machine rather than
  asserted about it.
- **Only a doubled pair can have a tail.** A mixed pair resolves out of `Held` into
  `Empty`, so a vector is never latched and there is nothing to swallow. `Spent`
  exists because a run of one tap is the only input that can produce the same
  token twice.
- **`Spent` has no time-based exit.** Its only ways out are a different tap and a
  non-tap. That is why a doubled pair is one-shot, and it is stated in the table
  rather than hidden in a constant.

**The abort is every non-tap, not just `ESC`.** `tapOf` returns null for anything
that is not a digit, `[` or `]`, so an arrow key, a page key or `ESC` all clear a
half-typed pair. The brief's table said *"`ESC`, or motion"* and the code is
exactly that; stated here because it is the *ambient* escape — the reader need not
learn an abort verb, only that doing anything else cancels.

## Why there is no clock

**No timeout, no deadline, no de-bounce, anywhere in the input path.** The buffer
waits for the next keypress and nothing but a keypress ends the wait: two taps a
second apart are a pair, and two taps an hour apart are a pair. The reader's tempo
is not an input to the grammar.

The reason is not austerity. **A clock is the one mechanism that can make a
deliberate gesture fail for being slow** — the reader holds a key with intent and
the machine calls it two presses, or presses twice deliberately and the machine
calls it a hold. Every other input rule here fails *toward* the reader's intent;
a timer is the only one that can fail against it.

The house owns timers (`tui.ts`'s flash register, `cli.ts`'s redraw) and this
deliberately borrows none of them: those decide when to **paint**, and the input
grammar stays clock-free. The one clock left in the neighbourhood is the exit
drain, and that is about the tty queue after okuda releases the terminal — not the
reader's tempo.

**Two accepted costs, each with its answer.** A doubled pair is a **one-shot
slot** — `99 … 99` fires once — and the answer is allocation rather than a fix:
repeatable verbs belong in the **vector** space, where the mixed pair is never
latched (`1212` fires two jumps back to back), and every bound doubled pair is a
one-shot system verb already. A pending digit **never expires** — so it must be
**visible**, an obligation `BRF-PROLONGED-PRESS` names and this ADR deliberately
does not fold in: the abort answers *how do I get out of it*; only rendering
answers *how do I know I am in it*.

## Alternatives Considered

| Alternative | Why Rejected |
|---|---|
| Collapse the run in the lexer (`splitKeyEvents`) | The lexer collapses terminal **spellings** (`]]` is one key in two bytes); a run is one key spelled many times, and collapsing repetitions is the reducer's job. The lexer sees one read, so it would pass the probe and fail in the reader's hands: at ~30 Hz against an idle event loop each repeat byte lands in its own read |
| A quiet period (a trailing-edge de-bounce) | Ruled out and **deleted, not deferred** — it is a clock in the input path, and by the argument above a clock is the one mechanism that can fail a deliberate gesture. It was also needed only to make two *repeats* of the same actuator distinguishable, which the vector space already provides |
| A read-scoped swallow | Measured wrong: the pair is grabbed again at bytes 4, 6, 8, 10 — five actuations from one hold, which is the reported defect |
| Expiry on the pending digit | Same clock, same objection; the cost is answered by visibility instead |

## Consequences

**The code comment was corrected with this ADR.** `advanceRunBuffer`'s header
said *"the parked quiet period (the latch's eventual expiry) is IO and lives in
the caller when it lands"* — which **contradicts the ruling**: the quiet period is
deleted, not parked, and a comment that promises a deleted mechanism invites a
future reader to un-delete it. It now states the no-clock rule and points here.

**What this costs, recorded and not re-litigated:** a pending digit waits forever,
and a doubled pair is one-shot. Both accepted; both answered (`ESC` for the first,
the vector space for the second).

**The board gap is named, not repaired here.** The epic's implementation tasks
were never filed, so `BRF-PROLONGED-PRESS` reads as untouched while its mechanism
is in the code. Filing retroactive tasks for landed work is not worth the ceremony;
what was missing was the **decision record**, and that is this.

**The escape is broader than one key.** `Held → Empty` fires on any non-tap, so
the reader's abort is "type anything else". `docs/2026-09-05-keyboard-controls.md`
should name the three gestures and this abort beside the digit bindings.

## Related

- `ADR-REPEATED-DIGIT-ACTUATORS-032` — **which** pairs are actuators; this is how a run resolves to one
- `briefs/2026-09-13-brief-prolonged-press.md` — the design, and the table above in full
- `briefs/2026-10-10-brief-seam-audit.md` — where the code actually landed, and the debt it records
- `src/tui.ts` — `advanceRunBuffer`, `tapOf`, `advanceNumBuffer`
- `tests/tui.test.ts`, `tests/input-seam.test.ts` — the gesture matrix
- `BRF-PROLONGED-PRESS` — the design, and the pending-state obligation this owes
- `docs/2026-09-05-keyboard-controls.md` — the reader-facing surface this owes a paragraph
