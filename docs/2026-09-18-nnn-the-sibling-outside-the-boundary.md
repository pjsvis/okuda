---
date: 2026-09-18
kind: design note — an external tool read as a witness, and the one pattern worth noting from it
lineage: the reader's link (github.com/jarun/nnn) and the word "opinion"; AGENTS.md (three concerns, three owners); docs/2026-09-05-no-tree-no-outline.md; docs/2026-09-06-protocol-free-text-identity.md. **Corrected 2026-09-19** — the "fzf owns the loop" claim below was an aborted brief's title read as a live position; see *The correction*.
status: closed as an opinion — nothing is proposed to be built, adopted, or depended on. One governance pattern noted. One claim corrected in place, 2026-09-19.
---

# nnn is a sibling, not a competitor — and the boundary is the reason

> ◆ nnn is ~150 KiB with no config file, no FPU, integer-only maths, and a handoff
> to `$NNN_OPENER`. That is okuda's own doctrine, stated by a project that has
> never heard of okuda.

**Corrected 2026-09-19.** The closing inference in *Where I would land* — that the
silo's recorded position is "fzf owns the loop" — is wrong. That brief is
**Aborted**; I read its title and not its status. The direction is now the
opposite: fzf retires. The wrong version is kept below, under its own heading,
because the error is the instructive part. Everything above that heading stands.

## What we are deciding

Nothing to build. The question is what nnn *is* to this silo: a competitor, a
dependency, a host, or a witness. The answer is the last one, and it is worth
twenty minutes of reading for two reasons — the convergence, and the one thing
worth noting.

## nnn in its own words

- **Its self-description.** "n³ The unorthodox terminal file manager" — "tiny
  (~150 KiB), nearly 0-config and incredibly fast."
- **Its stated intent.** "Designed to be unobtrusive with smart workflows to
  match the trains of thought."
- **Frugality as doctrine, not as a benchmark.** "Typically needs less than 3.5MB
  resident memory"; "Works with 8 colors (and xterm 256 colors)"; "No FPU usage
  (all integer maths, even for file size)"; "Tiny binary (typically around
  100KB)"; "1-column mode for smaller terminals and form factors."
- **No config file.** "No config file, minimal config with sensible defaults."
- **Refresh economy.** "Minimizes screen refresh with fast line redraws."
- **The handoff.** "Open with desktop opener or specify a custom opener"; a
  *File picker* mode; "List input stream of file paths from stdin or plugin."
- **Accessibility.** "Basic support for screen readers and braille displays."
- **Governance.** "A patch framework hosts sizable user-submitted patches which
  are subjective in nature."
- **Its tradition.** Listed on suckless.org/rocks.

## The boundary test, applied

The silo's gate for any "should we build X": *does X touch the byte stream or the
screen?* Compositing (where the text comes from) belongs to the environment;
windowing (where it appears) belongs to the host; rendering is okuda's whole job
(`AGENTS.md`).

nnn touches both excluded ends and neither included one. It **composites** — it is
a file picker; it decides where the text comes from. It **windows** — it draws its
own screen, contexts and all.

So it is outside the boundary. That is not a demotion. It is the doctrine working
as designed: nnn is precisely the kind of tool the doctrine says should exist, and
exist elsewhere.

## The convergence, which is the finding

Two projects, no contact, same dispositions. This is the part worth having read
the README for — it is evidence that the dispositions are *derived*, not taste.

| Disposition | nnn | okuda |
|---|---|---|
| Frugality as a design law | ~150 KiB, no FPU, integer maths | integer cell widths; one compiled binary |
| Refresh economy | "fast line redraws" | scroll-region repaint, synchronized output |
| Braille and screen readers | "basic support" | braille as an outbound sink |
| Handoff, not ownership | opener, picker, stdin list | "we don't care where the text comes from" |
| **No tree** | modes are light, detail, disk-usage, picker | no tree, no outline, no dial |

The last row is the one that matters. `docs/2026-09-05-no-tree-no-outline.md`
refuses the file tree as "the wrong scale" — a menu of names of things you have
not decided you want. nnn, whose users are *operators* who would have welcomed a
tree, offers none either: it shows one directory, filtered, and jumps on a unique
match. Two refusals arrived at independently, from opposite ends of the same
problem, is a much better argument for the position than either one alone.

## The one thing worth noting

The patch framework. nnn's maintainer declines to merge "sizable user-submitted
patches which are subjective in nature" and hosts them *outside the tree* instead.

That is this silo's own move, one tier over. okuda says *foxtrot oscar* to the
shite and gives the refusal a home in `decisions/`. nnn's `patches/` and okuda's
`decisions/` are the same shape: **a home for the rejected-but-legitimate.**

The difference is the direction of the record. nnn hosts the *code* of the
rejected feature; okuda records the *reason* for the rejection. Both keep the
rejection visible; only one keeps it runnable. Neither is obviously right — nnn's
version means the feature exists and is maintained by someone; okuda's means the
boundary is documented and the code stays clean. Noted, not adopted.

## What is not in question

- **That nnn is good.** It is. The README is unusually disciplined and the
  feature list is honest about its own edges.
- **That "cool" is a real signal.** Taste is real but not processable — the NASA
  lesson: even the man who named Apollo could not articulate a rubric
  (`docs/2026-08-30-naming-like-nasa.md`). But taste applied to *adoption* still
  needs a gate, and the gate here is the boundary test. Cool is a reason to
  read something, not a reason to depend on it.
- **That the convergence is meaningful.** It is the interesting finding, and the
  only part of this note that has any claim on the silo's attention.

## Where I would land

**A witness, not a dependency and not a host.** Use it; do not import it.

The second half of this section was wrong when it was written. It is kept below
under its own heading, because the error is the interesting part.

### As written, 2026-09-18

> The one thing that would move me: if okuda's launcher ever had to work without
> `fzf`. nnn proves a hand-rolled filter is viable at 100 KB — but the silo's
> recorded position is that fzf owns the loop, and viability is not a reason to
> build a second answer to a solved question. Evidence for the position, not
> against it.

### The correction, 2026-09-19

**Two errors, and the first is a reading error of a specific kind.**

- **There was no recorded position that "fzf owns the loop."**
  `briefs/2026-08-29-brief-fzf-owns-the-loop.md` is **Aborted (2026-08-30)** — its
  own head block says so, and `ADR-TTY-ACTIVE-INPUT-023` was aborted in the same
  pass. I read the *title* of an aborted brief and took it for the position. The
  standing instruction is to read the branch, not the string; this is the same
  failure one level up — **read the status, not the title.** The live position was
  `decisions/030-live-search-picker.md` (Accepted): fzf stays, as the picker, with
  `--bind=change:reload(...)`.
- **And that live position is itself being reversed.** The reader's direction,
  2026-09-19: *"remove the fzf dependency and build our own search TUI in GLoam"*
  (`briefs/2026-09-19-brief-gloam-owns-the-loop.md`). So the paragraph's
  conclusion — *"viability is not a reason to build a second answer to a solved
  question"* — argues against a thing now intended, on the authority of a decision
  now superseded.

**What survives.** The boundary test, the convergence finding, the tree refusal,
and the patch-framework note. Nothing above *Where I would land* is affected. What
dies is an inference drawn from a title.

## Related

- `AGENTS.md` — three concerns, three owners; the boundary test applied above
- `docs/2026-09-05-no-tree-no-outline.md` — the tree refusal nnn independently shares
- `docs/2026-09-06-protocol-free-text-identity.md` — the protocol we did not build
- `docs/2026-08-30-naming-like-nasa.md` — taste is real but not processable
- `docs/2026-09-11-the-exemplar-register.md` — checked and **declined**. The
  register collects fixed carriers with unresolved tensions; nnn resolves. Adding
  it would have been the category error the register's own preamble warns about.
- `briefs/2026-08-29-brief-fzf-owns-the-loop.md` — **Aborted.** The title I mistook
  for a position; read its head block
- `decisions/030-live-search-picker.md` — the live position this note missed
- `briefs/2026-09-19-brief-gloam-owns-the-loop.md` — the reversal, and the reading
  error's correction
