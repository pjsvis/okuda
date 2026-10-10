---
type: Brief
callsign: BRF-SEAM-AUDIT
---

# Brief: The seam audit — the input path, where a run was mistaken for a spelling

**Date:** 2026-10-10
**Status:** Open
**TD:** (to create)

## Context

Two failures this session share one shape: a comment named a feature whose
referent was three files away, and the feature it named **does not work**. Both
are seam failures — the codebase splits a feature across files (lex → decode →
apply), each unit is tested, and the seam between them is not. This brief audits
the input seam, fixes what it finds, and states the criterion the other seams
will be held to.

## Objective

Audit the input seam — `splitKeyEvents`, `decodeKey`, `applyKey` — correct the
`[[`/`]]` run so it fires at typing speed, add the integration test the units
never had, and apply the comment-referent rule to those files.

## Evidence

Field report (2026-10-10): `{`/`}` move the render; `[` and `]` alone do nothing
(unbound); **`[[`/`]]` do nothing**. `tmp/bracket-probe.ts` drives the real lexer
and reducer under two chunkings:

| input | reads | result |
|---|---|---|
| `]]` | one chunk | `frame-down` |
| `]]` | two chunks (`]`, `]`) | **nothing** |
| `[[` | two chunks | **nothing** |
| `}` | one byte | `para-down` |

The cause: `splitKeyEvents` pairs the brackets **within one read**
(`src/keygrammar.ts:96`), but two bracket keypresses arrive as two reads. Each
lone `]` decodes to null (`src/tui.ts:141`), so the pair never forms. `{`/`}`
work because they are single bytes.

Every unit is green: `decodeKey` maps the pair (`src/tui.ts:141-142`),
`applyKey` performs it (`src/tui.ts:1160-1166`), and `snapFrame`/`headingLines`
are tested (`tests/frames.test.ts`). **Unit-green, seam-dead** — the class this
audit exists for.

## Scope

**In:** the input seam only — `src/keygrammar.ts`, `src/tui.ts` (the reducer and
its buffers), `src/frames.ts`; the `[[`/`]]` fix; an integration test driving the
real lexer + reducer across separate reads; the comment-referent pass over those
three files.

**Out:** the corpus-wide comment sweep — the other seams (vectors, render,
search) are follow-on passes under the same criterion; the `system.md` lexicon
entry for the rule (drafted, not documented; a separate call).

## Preconditions

- [x] The `[[`/`]]` behaviour is reproduced — `tmp/bracket-probe.ts`, above.
      **Verified 2026-10-10.**

## Work Plan

1. [ ] Decide the mechanism: the lexer keeps only the terminal's **spellings**
      (escape sequences, one write); a two-tap **run** (`]]`, `[[`) belongs to a
      stateful buffer, the digit run's model. Generalise `advanceNumBuffer`, or
      add a sibling bracket buffer.
2. [ ] Fix; keep the bracket run and the digit run from swallowing each other's
      taps.
3. [ ] Add the seam test: two reads, real lexer + reducer, assert
      frame-down/frame-up.
4. [ ] Comment-referent pass over the three files: every comment names its own
      contract, or points to the referent. The `splitKeyEvents` comment no longer
      names the jump.
5. [ ] State the criterion in one place, so the follow-on seams have a written
      rule to cite.

## Acceptance Criteria

- Two `]` keypresses at typing speed (two reads) fire frame-down; two `[` fire
  frame-up.
- An integration test drives the real lexer + reducer with **two separate reads**
  and asserts the motion.
- The three files' comments name referents in scope or point to them.

## Notes

The design error, named: `]]` was treated as a terminal **spelling** — encoded
within one read, like `↑` = `ESC [ A` — when it is a **run**: two keypresses,
like `99`. The unit that owns a run is the stateful buffer, not the lexer. The
lexer's own comment states the principle (*"a run is not a spelling"*) and then
the code violates it.

The comment-referent rule (general; a candidate for `system.md`): **a comment is
a claim about a function, and it owes a referent in that function's scope, or an
explicit pointer to where the referent lives.** Test: name the symbol in this
file that cashes the comment's claim.

Exit interaction: the reducer stops at the first session-ending event
(BRF-PROLONGED-PRESS layer 2); the bracket buffer must not delay or reorder that.

## Related

- BRF-OKUDAGRAM-STEP — the frame motions (`[[`/`]]`) and the page/paragraph strides
- BRF-PROLONGED-PRESS — the run buffer and the latch this generalises
- `tests/frames.test.ts` — the motion's unit test (green while the seam is dead)
- `tmp/bracket-probe.ts` — the reproduction
