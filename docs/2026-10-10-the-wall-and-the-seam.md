---
date: 2026-10-10
kind: design note — the silo guard: a wall built to stop exits, the requirements that kept exiting, and the seam that replaces it
lineage: the seam (`docs/2026-10-10-the-seam.md`); the composed unit's "alarm that fires on every render" (`docs/2026-10-10-the-composed-unit.md`); the removal at the sibling silo — cool-pi-extensions `decisions/025-remove-silo-extension.md`, commit `17edac7`
status: recorded
---

# The wall and the seam — the guard we built against a boundary that was a crossing

> A boundary that fires on the inside is not a boundary. It is an alarm that has
> to be turned off, and turning it off becomes the only way to work.

## What we built

A `pi` extension wrapped the bash tool with a soft filesystem boundary: any
*literal* argument naming a path outside the silo root returned **"I'm staying
in."** and exit code 1. Its stated job, from the operator: **stop the agent
leaving the silo.** Not hard isolation — its own header called it
"belt-and-braces over the Protocol's behavioural SILO DISCIPLINE" — but a wall
nonetheless: a *mechanism*, where the Protocol had a *disposition*.

The intent was honest. A cooperative agent drifting out of the repository is a
real failure mode, and a mechanical reminder is cheaper than vigilance. The
mistake was the shape of the mechanism — and, underneath it, the shape of the
boundary it assumed.

## The failure, measured

The path check was one regex, and it was unanchored —

```js
/(\/(?:[^\s/]+\/)*[^\s]*)|(~[^\s]*)/g   // "extract absolute and home paths"
```

— so it matched at *any* `/`, including the slash **inside** a relative path,
and handed the resolver a phantom absolute fragment. Reproduced against the pure
functions by the sibling silo (cool-pi-extensions, `decisions/025-remove-silo-extension.md`,
commit `17edac7`):

| command | token extracted | verdict |
|---|---|---|
| `ls src` | none | allow |
| `ls src/` | `/` | **BLOCK** |
| `cat src/vectors.ts` | `/vectors.ts` | **BLOCK** |
| `echo a/b` | `/b` | **BLOCK** |
| `rg "a/b" src` | `/b"` | **BLOCK** |
| `git diff HEAD~3..HEAD` | `~3..HEAD` | **BLOCK** |

Not a trailing-slash edge case: **any** relative path containing a `/` was
refused, and any `~` mid-token became `$HOME`. The guard blocked most file
operations. Its test suite covered `ls src` and not `ls src/`, so the false
positive was invisible to its own gate — the second defect: a detector with no
control.

## The tell

The tell is *where* it fired. A guard against **exits** fired on the **inside**.

This is the signature the composed unit had named hours earlier, for a different
apparatus: *an alarm that fires on every render of a growing view is an alarm
that is off* (`docs/2026-10-10-the-composed-unit.md`). A boundary that cannot
tolerate its own interior is not a boundary — it is friction, and the operator's
only rational response is to route around it (we began spelling absolute paths),
which trains a habit nobody wants and buys no safety.

## The mistake under the mistake

The guard enforced **containment** — "no path out" — as a zero-tolerance rule
over syntax. But look at what we kept *asking it to permit*:

- edit the sibling silo, cool-pi-extensions (a seam crossing);
- read `~/.pi` global config (the Decision 013 exception, carved precisely so the
  agent *could*);
- coordinate across sessions parked in other repositories.

**The requirements were the observation.** Every one of them was a legitimate
crossing, and together they falsified the premise. A silo was never a jail. It is
a **seam**: a boundary you *cross*, by declaring the crossing, with the receiver
owning the commit (`docs/2026-10-10-the-seam.md`). The invariant is not "nothing
crosses"; it is **"every crossing is attributable"** — a stranger can say what
wrote it, where it landed, who must commit it.

So the guard policed the wrong invariant. Containment is unenforceable on a
boundary whose work *is* crossing; attribution is enforceable, and it is
enforced by a declaration and a review, not by a regex over a shell string.

## What actually moved

The progression is not that we became laxer. It is that the frame changed once
the evidence was in:

- **Jail → seam.** From *never leave* to *crossings declare themselves*. The wall
  was built on the jail frame; the seam rule is the answer to the frame it stood
  in.
- **Mechanism → discipline → mechanism at the right layer.** The Protocol's SILO
  DISCIPLINE is behavioural, and the extension was belt-and-braces over it. But a
  *soft* belt is false confidence: the extension's own honest-scope section
  admits it cannot withstand runtime-constructed paths, and its tests
  *demonstrate* the escape. A belt that a thief walks through and that also trips
  the wearer is worse than no belt.
- **Agent layer → composition.** A wrapper that mediates a tool is the shape the
  lexicon names **No agent layer**: a fourth interface that stops the tool
  composing. Deleting it restores the actuator — relative paths, `--help`, every
  channel behaving as the tool intends.
- **One name, two referents.** The extension called its boundary *silo*; the
  Protocol calls *silo* a repository/semantic boundary. Two referents, one word
  — clause 4. The removal retires the misnomer as a side effect.

## The general law

> A boundary checked by a **filter on syntax** will fire on the normal path,
> because the normal path is made of exactly the syntax the filter cannot
> distinguish from the escape.

Enforcement that survives lives one layer up, where intent is known — a
declaration, a review, a commit — or one layer down, where the OS knows the
process — a sandbox, a container. The middle layer, the lexical wrapper, can only
ever be a *nudge*; and a nudge must not be allowed to **refuse**, or it is a wall
with a false-positive tax.

If the containment feature is ever wanted again, the record keeps the
requirement: **OS-level containment, or a non-blocking warning with
relative-path tests.** Not the blocking shape, re-tested — re-testing a wrong
shape only makes the false positives *covered*.

## Closing

We built a wall to stop ourselves leaving, and the first thing it taught us was
that the work *was* the leaving. The wall did not protect the boundary; it hid it
— behind a false positive that called the inside the outside. The seam names what
the wall could not: the boundary is real, the crossing is normal, and the only
thing owed at it is a declaration.

## References

- **The seam** — `docs/2026-10-10-the-seam.md`
- **The composed unit** — `docs/2026-10-10-the-composed-unit.md`
