---
type: ADR
callsign: ADR-ENVIRONMENT-ANSWERS-068
date: 2026-10-17
---

# Decision: The environment answers first — declare, then convention, then refuse by name

**Date:** 2026-10-17
**Status:** Accepted — the operator concurred in conversation (*"we should be a bit
smarter than that"*); this record is the writing-down, not the deliberation
**Enforced by:** `tests/clone.test.ts` — a Linux box with `TERMINAL` unset must get
the named refusal, not a spawn spec; and `TERMINAL` set must be honoured

## Context

Three clone integrations build a spawn spec pointing at
`/Applications/Ghostty.app/Contents/MacOS/ghostty`, unconditionally (two call
sites, `src/clone.ts:244-252` and `src/clone.ts:272-281`). On Linux that path
cannot exist, and nothing refuses it: the verb returns a command that will fail
at `execve`, or succeeds and opens nothing. Two sibling verbs do it right —
`terminal` and `edit-terminal` refuse by platform with a named sentence
(`src/clone.ts:243`, `src/clone.ts:271`). So of five paths, **two refuse and three
guess**, and the guess is exactly what the file's own principle forbids: *"The
integration is DECLARED, not discovered"* (`src/clone.ts:5-9`) — a declaration
with no ladder, so a path nobody declared has nowhere to come from.

`BRF-DARWIN-CLOSE-OUT` framed two answers, and both are answers to the wrong
question — *who knows where a terminal lives?*

| Option | What it does | Cost |
| --- | --- | --- |
| A — resolve | probe `which("ghostty")`, then the bundle path, then refuse | every distro's install path becomes okuda's problem, forever; a window manager by increments |
| B — delete | remove the verbs; keep only the refusals | loses a verb that is in use today |

Neither is necessary, because the question is already answered in this same file,
one function over. `resolveEditor` (`src/clone.ts:111-131`) resolves an editor
through a ladder: **`OKUDA_EDITOR`** — okuda's own declaration, which may carry
arguments and wins outright — then a known GUI chain on `PATH`, then
**`VISUAL`/`EDITOR`**, then `vi`. It is documented, tested, and it never hardcodes
an application bundle except as a fact about the platform it is on.

The terminal integrations simply never received the same treatment.

## Decision

**One ladder, every external actuator.** In order, and the first that answers
wins:

1. **Declaration** — `OKUDA_TERMINAL`, `OKUDA_EDITOR`, `OKUDA_CHROME`. The
   user's own statement of where the thing is, argument string included. It
   outranks everything, because it is the only entry that is an *assertion*.
2. **Convention** — `$TERMINAL` for terminals, `$VISUAL` then `$EDITOR` for
   editors, `$BROWSER` for the paper rung. These are the Unix names for exactly
   this question, set once for the shell, and already honoured by everything
   that spawns anything.
3. **The platform's own fact** — the darwin bundle path, on darwin only, and only
   if it exists. A fallback, not an assumption.
4. **A named refusal** — the sentence `terminal` already uses at
   `src/clone.ts:183`, naming the variable to set and the host's own answer
   (`ghostty`, `tmux`, `cmd`).

**Never** a `which` sweep over distro paths (option A's cost). **Never** a spec
pointing at a path the running platform cannot have.

### Amended 2026-10-17, during implementation — two clauses

**The separator is assumed, not discovered.** The ladder says *which* program
opens a terminal; it does not say how that terminal is told to run a command
inside it. `-e` is assumed because it is the commonest form (ghostty, alacritty,
xterm, konsole, foot), and it is *not* universal — wezterm wants `start --`,
gnome-terminal wants `--`. Building a per-terminal syntax table is option A again,
in a different coat. The escape is the integration that already exists for exactly
this: `cmd`, which takes the whole invocation (`OKUDA_CLONE_CMD`). The ladder's
`-e` is a documented assumption with a named exit, not a guess.

**A second path of the same class was corrected in the same lines.** The two
ghostty specs built the document path with `resolve(doc)`, against the *process*
cwd, while taking an injected `cwd` and using it for the AppleScript `cd` and the
tmux `-c`. So the spec named a path resolved in one place and a terminal opened in
another. It is `resolve(cwd, doc)` in both now. Same defect as the bundle path —
a path asserted rather than derived — found because the new test pinned the
string.

`OKUDA_CLONE` (`src/tui.ts:853`, `src/tui.ts:869`) keeps its job — *which* verb —
and this ladder takes the other one: *what runs it*. The two were conflated, and
that conflation is the defect.

## Alternatives Considered

| Alternative | Why Rejected |
| --- | --- |
| A — probe `PATH` for each terminal | Correct on the box in front of you and wrong on every other; it makes the install path of every distro a permanent okuda concern. `AGENTS.md`'s Scope Discipline is the tiebreaker: opening a tab is the host's job |
| B — delete the verbs | The verbs are used. Deleting them removes a capability to avoid a resolution question, which is subtraction without discovery — the cost lands on the user, and a Herdr answer is still owed |
| Leave it, it works on this Mac | True, and it is how the three paths came to be wrong. The failures are silent on the platform where they cannot fire |

## Consequences

- **The verbs survive on Linux.** `TERMINAL=ghostty` works there; unset, the
  refusal names the variable. No distro path is ever hardcoded.
- **okuda stops knowing where a terminal lives** on any platform where the
  environment already said. The bundle path survives as a darwin fallback.
- **The class retires, not the instance.** `paper.ts:28` hardcodes Chrome the same
  way; it moves onto the same ladder rather than getting its own fix.
- **A silent failure becomes a loud one** — the whole point of `ADR-031`'s
  predecessor rule, stated plainly in `src/clone.ts:183`.
- **C does not settle whether okuda should open a tab at all.** It makes the
  integrations legible so that question can be argued on its merits; a bare
  refusal and a working verb are easier to choose between than either is to
  choose between while three spawn specs quietly disagree. The scope argument is
  still owed, and this decision does not pre-empt it.
- The behaviour change is to *resolution order*, not to the set of verbs, so
  nothing is reversed that a prior ADR decided: the hardcoded path was a
  convention with a comment attached, not a recorded choice. No palimpsest is
  owed, and that judgement is stated here so a later reader can disagree with it.

## Related

- `src/clone.ts:5-9` — *the integration is DECLARED, not discovered*: the
  principle this decision keeps, and gives a ladder to
- `src/clone.ts:199-231` — `resolveTerminal`, the implementation of this decision
- `src/clone.ts:243` — the refusal sentence that already existed, and the model
  for the other four
- `AGENTS.md` — three concerns, three owners; *opening a tab is the host's job,
  not the viewer's*
- `ADR-031` — the main document and its vectors, where the clone verb's
  **restricted grammar** is decided (`src/clone.ts:1` cites it correctly). It does
  **not** contain an honest-refusal rule; `BRF-DARWIN-CLOSE-OUT`'s lineage said it
  did, and that is corrected there rather than inherited here
- `briefs/2026-10-22-brief-darwin-close-out.md` — P2, which this decides
