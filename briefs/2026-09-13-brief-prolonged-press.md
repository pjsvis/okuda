---
type: Brief
callsign: BRF-PROLONGED-PRESS
---

# Brief: The prolonged press — three gestures, one actuation, no leak

**Date:** 2026-09-13
**Status:** Open
**TD:** td-f62045 (epic) — td-edd765 tests, td-7add66 run buffer, td-b680b0
reducer, td-2cf549 drain, td-c38cd6 dogfood, td-e81b92 grammar ADR, td-51d5f4
pending-digit indicator
**Lineage:** the reader's report — a held `0` sprays the launcher's query box
with leftover zeroes; ADR-032's doubled-pair canon, which makes the fix safe
by construction; the keymap dogfood (td-b6d849) that would have caught it.

## Objective

A prolonged press of a digit is **one actuation**, not a stream of them. The
two-digit grammar takes the first two digits of a run, resolves the token, and
discards the remainder instead of re-arming. Nothing is left pending, and
nothing reaches the next consumer on the tty.

## The contract — three gestures, one token

The subsystem's output is **one token per gesture**, and the token does not
depend on which gesture produced it. Three physical affordances, one logical
actuation:

| Gesture | Physical shape | Bytes |
|---|---|---|
| Two delayed taps | `9` … as long as you like … `9` | 2, far apart |
| Fast double tap | `99` | 2, adjacent |
| Prolonged hold | `9999999999` | 2..N, at the repeat rate |

The reader picks the affordance by ergonomics, not by grammar: the hold is the
easiest under the hand, the delayed tap the most deliberate, the fast tap the
most practiced. All three resolve `99` and fire the clone exactly once.

**This is the brief's real contract, and it is stronger than "collapse a run."**
A run is one *spelling* of a gesture; the gesture is the unit, and it has three
spellings. Stated this way the requirement becomes checkable — for every digit
0–9 and every gesture, the subsystem emits **one** token, and it is the same
token.

The consequence, which follows from the equivalence itself and has to be
accepted rather than worked around: **the system cannot tell a hold from a
faster repetition of the same digit.** There is no key-up, and there are no
timeouts — so a run of `9`s is one gesture however the reader meant it. The pair
is grabbed at the second digit and **every further keystroke of that run is
swallowed**. Equivalence cuts both ways, and the fix honours it in both
directions or it does not honour it at all.

What that buys, and what it costs, is one sentence each. A hold, a fast double
tap and two delayed taps are the *same actuation* — and **a doubled pair cannot
be fired twice in a row without an intervening key.** That is not a defect to
engineer around; it is the allocation, and it says something useful about which
verbs may live in the doubled-pair space (Design questions).

## The abort affordance — already there, worth naming

The pending digit waits **forever**. There is no expiry, so the reader needs a
deliberate way out of a half-typed pair — and it exists: a lone `ESC` stands the
buffer down (`tui.ts:747–749`, keyboard-controls' "ESC cancels partial vector"),
and so does any non-digit (motion, escape sequence, letters), because the
buffer's contract is that a non-digit cancels a pending token so a stray
keystroke never ambushes a half-typed one.

So "abort a delayed keystroke after the first key" is **already implemented**.
This brief does not build it; it names it as part of the gesture's grammar and
records that the abort is the *only* thing that ends a pending digit besides
completing it. Nothing new to write — but it belongs in the keyboard-controls
doc beside the three gestures, because a reader who does not know the abort
exists will experience a waiting buffer as a stuck one.

## The finding — measured, not inferred

`tmp/burst-probe.ts` feeds a burst through the real lexer (`splitKeyEvents`)
and the real buffer (`advanceNumBuffer`):

```text
hold 0 (exit):   10 bytes -> 10 events -> 5 actuators   ["0 -> exit" x5]
hold 9 (clone):  10 bytes -> 10 events -> 5 actuators   ["99 -> clone" x5]
hold 1 (pocket): 10 bytes -> 10 events -> 5 actuators   ["11 -> null" x5]

control, distinct digits:
1 then 2:          2 bytes ->  2 events -> 1 actuator   ["12 -> vector"]
two double-taps:   4 bytes ->  4 events -> 2 actuators  ["11 -> null","22 -> null"]
```

**A held key fires its actuator once per pair.** The search box is the visible
end of it; the clone is the damaging end. The reader noticed the zeroes because
exit is the one actuator whose surplus has somewhere to go.

**The pair count is a property of the buffer, not of the read.** `numBuffer`
lives in the caller (`tui.ts:499`) and `advanceNumBuffer` is pure, so the buffer
accumulates across reads by construction: ten identical digits are five pairs
whether they arrive as one chunk or as ten. Chunking decides *where* the pairs
fall, never *how many* there are. That single fact is what makes this a state
question rather than a lexer question — and it is why the fix moved (below).

Three findings, in order of severity:

1. **N/2 actuations per burst.** Holding `9` runs the clone verb five times in
   one press. Holding `0` exits five times — idempotent, because `cleanup()`
   guards on `cleaned`, but only by accident.
2. **The reducer does not stop when the session ends.** `onKey` loops over
   every event in the read (`tui.ts:838`); `applyKey` resolves `exit` to
   `cleanup()` and returns, and the loop carries on with the rest of the read.
   A digit pair arriving in the same read as the exit key is still reduced —
   so `0012` would call `jumpTo(12)` against a terminal that has already been
   restored. Not yet observed; derivable from the loop.
3. **The unread remainder belongs to whoever reads next.** Once `cleanup()`
   removes the listener, bytes still arriving from the held key sit unread.
   The next consumer on the same tty is the launcher's query box. That is the
   reader's report, and it is the symptom this brief exists to fix.

## Why the collapse is safe — the canon does the work

A run of identical digits, reduced to its first two, can only ever be a
**doubled pair**. By ADR-032's canon every doubled pair is an actuator, never a
jump: `00` exit, `99` clone, `11`–`88` the pocket. Vectors are *mixed* digits,
12–98.

So collapsing runs can never swallow a legitimate jump — not in any document,
not for any binding, not now and not after the pocket is bound. The fix is
safe by construction rather than by enumeration, which is the strongest form
of argument available in this grammar.

## The fix — two layers, plus one note

**The first draft of this brief put the collapse in the lexer. It does not
belong there**, and the argument is worth keeping because it is the whole
reason the fix is small:

- **`]]` is one key spelled in two bytes. `99` is one key spelled nine times.**
  Different categories. The lexer's job is to undo the *terminal's* spellings —
  escape sequences, the `]]`/`[[` pairs — so the reducer sees logical keys. A
  digit run is not a spelling; it is the same logical key repeated. Collapsing
  it in the lexer would put the same fact in two places.
- **A lexer collapse only works when the whole run lands in one read.** At a
  terminal repeat rate of ~30 Hz against a fast event loop, the run arrives as
  ten reads of one byte, the lexer sees ten runs of length one, and the collapse
  does nothing — five clones, exactly as reported. The fix would work in the
  probe and fail in the reader's hands, which is the worst failure mode
  available.
- **The run buffer subsumes it in every case.** One read of ten bytes or ten
  reads of one byte, the result is the same: one actuation.

So:

1. **The run buffer (`advanceNumBuffer`, `src/tui.ts:367`).** The buffer learns
   that a digit run is a run. It resolves at two as it does today, then *stays
   resolved*: the remainder of that run is discarded rather than re-arming the
   grammar. Any different digit starts a fresh run; any non-digit clears it, as
   now. This is the reader's own phrasing — *capture the run, take the first
   two, dispose of the rest* — expressed in the one place that already owns
   token formation. `advanceNumBuffer` stays pure; `NumBufferStep` gains the run
   state.
   - Shape: `NumBuffer` becomes `{ keys: string; spent: boolean } | null`, and
     a doubled-pair resolution returns the run still held (`spent: true`)
     instead of `null`. A vector resolution is unaffected — mixed digits cannot
     repeat within a run, so only a doubled pair can have a tail.
   - **The swallow.** Once the pair is grabbed the latch stays set, and every
     further same-digit keystroke is discarded. A different key clears it (a new
     run begins); a non-digit clears it (the abort). This is the reader's own
     phrasing — *grab the actuator pair and swallow the rest of the keystrokes* —
     and the latch is nothing more than that sentence given state.
     - **Why the swallow cannot be scoped to the current read.** "Swallow the
       rest of the keystrokes" reads naturally as "the rest of this burst", and
       that would be enough if a hold arrived as one burst. It does not: at a
       repeat rate of ~30 Hz against an idle event loop each repeat byte lands
       in its own read, so a read-scoped swallow would grab the pair at byte 2
       and grab it again at byte 4, then 6, 8, 10 — five clones, exactly the
       reported bug. The latch must persist across reads; only a different byte
       ends it. The same argument as the lexer, one layer down.
   - Ripple: seven assertions in `tests/tui.test.ts:509–542` encode the current
     `{ buffer: null, token }` shape on resolution and must be revised with it.
2. **The reducer stop (`onKey` / `applyKey`, `src/tui.ts:838`).** The session
   ending stops the loop. `applyKey` reports that it ended the session; `onKey`
   breaks. Load-bearing on its own, independently of the burst: it is what stops
   a jump from being applied after `cleanup()`.
3. **The drain (`cleanup`, `src/tui.ts:851`) — one sequencing note.** A bounded
   read-and-discard window, so a key still held at exit does not spray the next
   consumer. **Order matters:** `cleanup()` currently removes the listener and
   then pauses, which leaves any bytes already buffered *inside the Node stream*
   (not merely in the tty queue) to be delivered to whoever attaches next — the
   launcher's readline. The window must therefore be a discarding listener
   installed *before* the removal, held for the window, then removed and paused.
   This is the layer to dogfood rather than trust: it is a heuristic on a queue,
   not a property of the grammar.

The contract in one picture — three affordances, one token:

```mermaid
title: Three gestures, one token
flowchart LR
    D[two delayed taps] --> R[one gesture]
    F[fast double tap] --> R
    H[prolonged hold] --> R
    R --> T[one token]
```

The machine behind it, exactly — the picture above is the *contract*, this table
is the *implementation of it*. Three states, eight transitions, **no clock**:

| State | Input | Next | Output |
| --- | --- | --- | --- |
| `Empty` | a digit | `Held` | — |
| `Empty` | any other key | `Empty` | — |
| `Held` | the **same** digit | `Spent` | the doubled-pair token |
| `Held` | a **different** digit | `Empty` | the mixed-pair (vector) token |
| `Held` | any other key — `ESC`, or motion | `Empty` | — (the abort) |
| `Spent` | the **same** digit | `Spent` | — (swallowed: the run's remainder) |
| `Spent` | a **different** digit | `Held` | — (a new run begins) |
| `Spent` | any other key | `Empty` | — |

Three properties fall out of the table, and they are the whole design:

- **`Held` is the only state that produces a token, and it produces one on
  either kind of second digit.** Both of its exits carry a token and exactly
  one. That *is* the "one gesture, one token" contract — visible in the machine
  rather than asserted about it.
- **Only a doubled pair can have a tail.** A mixed pair resolves out of `Held`
  and lands in `Empty`, so a vector is never latched: there is nothing to
  swallow. `Spent` exists precisely because a run of one digit is the only input
  that can produce the same token twice.
- **`Spent` has no time-based exit.** Its only ways out are a different key and
  a non-digit. That is the whole reason a doubled pair is one-shot, and it is
  stated in the table rather than hidden in a constant.

**Why a table and not a state-machine diagram.** The renderer cannot draw this
one faithfully — it drops edges it cannot route, silently. A nine-transition
version of this machine at `flowchart LR` rendered six edges; the two that share
a node pair (`Held → Empty`, `Spent → Empty`) collapse to a single edge carrying
one label, the second gone without a warning. Even a terse six-edge version lost
a label and truncated another. In a design record a diagram that quietly omits a
transition is worse than no diagram, so the exact contract is a table and the
picture is the one thing the renderer draws cleanly.

## Design questions

- **Lexer or reducer?** The reducer, and the distinction is the point: the
  lexer collapses *spellings* (`]]`, escape sequences), the reducer collapses
  *repetitions*. Putting the run in the lexer would also make the fix depend on
  chunking, which is a property of the terminal we do not control. Settled
  against the lexer; recorded because the lexer is the intuitive answer and the
  next reader will reach for it.
- **Does the canon need the rule written down?** Yes, and more strongly than the
  first draft argued. The rule is no longer "collapse byte runs" (a lexer fact);
  it is the **gesture rule** — *one gesture, one token; the pair is grabbed at
  the second digit; the rest of the run is swallowed; only a different key ends
  it*. That is a statement about the doubled-pair canon's semantics, not about
  bytes: the doubled pairs are exactly the tokens a hold can reach, which is why
  they are the tokens the rule governs. It earns a line beside ADR-032 rather
  than living in a buffer's comment. Parked: land it with the References-section
  ADR so the two grammar records move together.
- **Can the same actuator fire twice in a row?** No — and with no timeouts that
  is a *decision*, not an oversight, so it should be made deliberately rather
  than discovered. A tty reports key-down only, and no content signal says a run
  has ended except a different byte. So a doubled pair is **one-shot**: `99` …
  `99` fires once, and a second clone needs an intervening key. The alternative
  was a clock, and clocks are ruled out — rightly, because a timer is the one
  mechanism that can make a *deliberate* gesture fail, and the three gestures
  exist precisely so that no gesture can fail for being slow.
- **So which verbs may live in the doubled-pair space?** This is where the cost
  turns into information. **A doubled pair is a one-shot slot.** Every bound
  actuator already is one: `00` exits, `99` clones the document — repeating
  either is meaningless. The pocket's `11`–`88` therefore inherits a rule worth
  writing into its ledger: *a verb that needs rapid repetition does not belong in
  the doubled-pair space.* It belongs in the **vector** space, and the asymmetry
  is not accidental — a vector is mixed digits, so its second digit differs from
  its first and it is never latched. `1212` fires two jumps back to back with no
  intervening key; `9999` fires one clone. That is a clean allocation —
  repeatable verbs to the vectors, one-shot system verbs to the doubled pairs —
  and it falls out of ADR-032's own canon instead of being bolted onto it.
- **Does equivalence make accidental actuation easier?** It makes it *smaller*.
  A leaned-on key fires **once** instead of five times — a 5× blast becomes a 1×
  actuation. It does not *prevent* accidental actuation and should not try:
  requiring a minimum hold would be the timeout by another name, and it would
  make the three gestures unequal, which is the thing this brief exists to
  prevent. The honest claim is that the fix reduces the blast *radius* of a
  stray key, not its incidence.
- **Is a pending digit visible?** No — and with no expiry that is the one real
  hole left. `numBuffer` is never read by the painter: the reader can press `9`,
  be interrupted, and have no way to see that a `9` is waiting. Under a timeout
  that would be harmless, because the digit would expire; with none it waits
  forever, and the reader's next `9` — minutes later — fires a clone they did
  not intend and cannot explain. **A design with no expiry obliges a visible
  pending state.** The abort affordance answers *how do I get out of it*; only
  rendering answers *how do I know I am in it*. Small, and in our own domain:
  the footer already has a hints row and a flash register. Parked as its own
  task rather than folded in, because it is a rendering change with a UX
  consequence, not part of the grammar fix.
- **Is there any digit whose run must not collapse?** No — the canon proves
  none. Recorded rather than assumed, because it is the kind of thing that is
  true today and quietly false after a renumbering.

## Non-goals

- **No lexer change.** `splitKeyEvents` is not touched. The `]]`/`[[` pairs and
  the escape sequences keep riding whole; a digit run is a different category of
  fact and is handled where repetitions belong (see "The fix").
- **No timeouts. None, anywhere in the input path.** No deadline between the two
  digits of a pair, no expiry on a pending digit, no de-bounce on a resolved
  one. The buffer waits for the next keypress, and nothing but a keypress ends
  the wait. Two `1`s a second apart are still `11`; two `1`s an hour apart are
  still `11`. The reader's tempo is not an input to the grammar.
  - **What this costs, stated once and then not re-litigated:** a pending digit
    waits forever, and a doubled pair is one-shot. Both are accepted, and each
    has an answer — the abort (`ESC`) for the first, the vector space for the
    second. What is *not* acceptable is a design in which a deliberate gesture
    can fail for being slow, which is the failure a clock buys.
- **No debounce borrowed from the painting path.** The house has timer idioms
  (`tui.ts:530` flash, `cli.ts:243` redraw) and this brief deliberately does not
  borrow them. Those timers are about when to *paint*; the input grammar stays
  clock-free.
- **No change to the two-digit space.** No binding moves, no token is freed.
- **No new binding for the pocket.** The collapse is what makes the pocket safe
  to bind, not the binding itself.

## Scope

**In:**

- The run state in `advanceNumBuffer` and `NumBufferStep` (`src/tui.ts:357–375`),
  plus the buffer's declared type at `tui.ts:499`.
- The session-end signal from `applyKey` to `onKey` (`src/tui.ts:742`, `838`).
- The bounded drain in `cleanup` (`src/tui.ts:851`), with the listener-ordering
  fix.
- Tests: the gesture matrix, the distinct-digit controls, the no-timeout
  guarantee, the one-shot expectation, the abort, and the revision of the seven
  existing `advanceNumBuffer` assertions (`tests/tui.test.ts:509–542`).

**Out:**

- `src/keygrammar.ts` — no change at all.
- **Any timer in the input path**, including the quiet period this brief's
  earlier draft proposed. Removed, not deferred.
- **The pending-digit indicator** — its own task. This brief records the
  obligation and does not build it.
- The abort affordance — already implemented (`tui.ts:747–749`); this brief
  names it in the grammar and documents it, and changes nothing.
- The pocket's first binding, and the rule that a doubled pair is a one-shot
  slot (recorded for the pocket's ledger; not this brief's edit).
- Any change to the actuator canon itself (a line beside it is in scope; a
  revision is not).
- The launcher's own input handling. The drain is ours because we still own the
  terminal at the moment of exit; the box is the host's from the moment we
  release it.

## Work Plan

1. [ ] **The gesture matrix as a test first** — `tmp/burst-probe.ts` becomes
      `tests/` assertions, written as the contract rather than the mechanism: for
      every digit 0–9, a delayed double tap, a fast double tap and a prolonged
      hold each emit exactly one token, and it is the same token. Plus: a run of
      any length emits one token; `99` then `99` emits one, not two; `1212`
      emits two vectors; `1122` emits two actuators; a pending digit survives an
      arbitrary wait; `ESC` clears a pending digit.
2. [ ] **The run buffer** — `advanceNumBuffer` resolves at two, holds the run
      spent, and swallows the remainder until a different byte. No clock.
      Revise the seven existing assertions to the new shape.
3. [ ] **Reducer stop** — `applyKey` reports session end; `onKey` breaks.
4. [ ] **Drain** — discarding listener for a bounded window, installed before
      the removal, then remove and pause. This is the one place a clock is
      allowed, because it is about the tty queue *after* we have released the
      terminal, not about the reader's tempo.
5. [ ] **Dogfood** — the three gestures by hand, per digit: hold each a full
      second, double-tap each fast, tap each slowly — one actuation each, and
      the same one. Then `99` twice in a row (one clone: the one-shot slot, felt
      rather than assumed), `ESC` after a single digit (the abort), and a digit
      left pending for a full minute before its partner (it still fires, because
      nothing expires). Then exit with a held `0` and confirm an empty launcher
      query box — the reader's own acceptance test.

## Acceptance Criteria

* **The three gestures are equivalent.** For every digit 0–9, a delayed double
  tap, a fast double tap, and a prolonged hold each emit exactly **one** token,
  and it is the same token.
* A run of any length emits one token — three identical digits fire once, ten
  identical digits fire once. Three is the canonical case, and the one chunking
  cannot rescue.
* **No timeout exists.** A pending digit survives an arbitrary wait: the same
  token fires whether the second digit follows in a millisecond or a minute.
* **The abort works.** A lone `ESC` after a first digit clears it and the next
  digit starts clean; any non-digit does the same.
* **A doubled pair is one-shot.** `99` followed by `99` fires **one** clone; a
  second needs an intervening key. By contrast `1212` fires **two** vectors with
  no intervening key — the asymmetry that allocates repeatable verbs to the
  vector space.
* A hold of `1` immediately followed by a hold of `2` fires two actuations
  (`11` then `22`) with no intervening key.
* A held `0` leaves nothing pending and puts nothing in the launcher's query
  box.
* `12` still yields one vector; `1122` still yields two actuators; `1212` still
  yields two vectors.
* After the session ends, no further key in the same read is applied (no
  `jumpTo` after `cleanup`).
* After any gesture, for every digit 0–9, no *pending* digit remains (a spent
  run is not a pending one), and the next *different* digit starts cleanly.
* `just check` passes and `bun test` is green.

## Risks

- **A doubled pair is one-shot, and a pending digit never expires.** Both follow
  from the no-timeout rule and both are accepted. The residual risk is the
  *combination*: a forgotten pending digit plus a later same-digit press fires an
  actuation the reader did not intend and cannot explain. The abort answers that
  only for a reader who knows the abort exists — which is why the pending-digit
  indicator is recorded as its own task rather than dropped, and why the abort
  belongs in the keyboard-controls doc beside the three gestures.
- **The one-shot rule constrains the pocket.** A verb that needs rapid repetition
  cannot live at `11`–`88`. Recorded for the pocket's ledger; not a defect.
- **The drain is a heuristic**, and it is the one place a clock is allowed. A
  window too short misses the tail; too long eats the reader's next keystroke.
  Bound it, dogfood it, and do not ship it on the argument alone. The
  listener-ordering detail is the part most likely to be got wrong, because the
  bug it fixes is invisible until the launcher's box shows it.
- **The buffer's return shape changes**, and seven existing assertions encode the
  old one. Revise them deliberately — they are the contract, not the
  implementation.
- **The unobserved case in finding 2** becomes observable only once layer 2
  lands: until the loop can stop, there is no way to see that it should have.
- **The renderer cannot draw this machine** (see The fix). The table is the
  contract for that reason; do not "restore" a diagram of the transitions without
  first confirming the art still contains all eight.

## Related

- ADR-032 — the doubled-pair canon: every doubled pair is an actuator, which is
  what makes the collapse safe
- ADR-021 — the jump-token numbering the vectors live in
- td-b6d849 — the keyboard dogfood (in review): this is the defect it was
  looking for
- td-101a0f — the keymap reference: the run rule belongs in the one refereed
  place
- `docs/2026-09-05-keyboard-controls.md` — the grammar's control surface
- `docs/2026-09-05-double-key-actuators.md` — the doubled-pair idea before it
  was canon
- `docs/2026-08-31-actuator-inputs.md` — the input path
- `docs/2026-09-08-actuator-noise.md` — what an actuator does when nothing
  should happen
- `tests/tui.test.ts:509–542` — the two-digit state machine's existing contract,
  which this brief revises
- `src/tui.ts:747–749` — the lone-`ESC` stand-down: the abort affordance this
  brief names, already implemented, which is why nothing is built for it
- `tmp/burst-probe.ts` — the measurement behind the finding
- `tmp/mmd-probe.md` — the renderer's fence behaviour, and where the dropped-edge
  limitation behind "a table, not a diagram" was found
