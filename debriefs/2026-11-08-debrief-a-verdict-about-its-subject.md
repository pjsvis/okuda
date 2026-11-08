---
type: Debrief
callsign: DBF-GATE-SUBJECT
date: 2026-11-08
tags: [build, gate, signature, shell, pipefail, decisions]
agent: pi (ses_c8836d)
environment: local
briefs: [BRF-GATE-RUNS-FILE]
---

# Debrief: A verdict is a fact about its subject — two gates that were not

**Date:** 2026-11-08
**Status:** Done — two defects repaired in one sitting, `just check` 24/24 green in
20s. `BRF-GATE-RUNS-FILE` shipped with `ADR-GATE-RUNS-FILE-088`; the second finding
shipped with `ADR-GATE-NO-RACE-089`. One operator action remains, not an agent's:
`just install`, which is what the missing `cahier` link always wanted.

## What was asked

A `just build` transcript:

```
signature-check: FAIL — cahier does not execute (exit 127)
  A build that compiles and cannot run is the artefact nobody checked.
  scripts/signature-check.sh: line 59: cahier: command not found
  Remedy: rebuild — 'just build' — and read the compile output.
```

The ask was orientation and an opinion. Orientation said `binary: STALE
(5f59b8c ≠ 2398aa0)` and nothing else, so the two objects in the transcript — the
binary and the gate — had to be separated by measurement rather than belief.

## What the work actually was

**The artifact was innocent, and one command said so.** `./cahier --version` →
`cahier (2398aa0)`, exit 0, stamped at `HEAD`. Against a message that had just
diagnosed it as unrunnable.

**The gate had two subjects.** `signature-check.sh:47` tests `[ -f "$BIN" ]` — a
filesystem question about the path `./cahier`. `signature-check.sh:59` runs
`"$BIN" --version` — a *command position*, which bash resolves through `$PATH`.
Given a bare name, those two disagree, and the gap is where a verdict about one
file became an execution of another, or of nothing. `~/.local/bin/cahier` had
never been created (`just install` was not run for it), so bash said `command not
found`, and the script read bash's words as the artifact's refusal.

**`okuda` had been passing on an accident.** `~/.local/bin/okuda` symlinks back
to `$(pwd)/okuda`, so `$PATH` landed on the verified bytes. Were it a copy, the
gate would have verified the fresh `./okuda` and printed

```
signature-check: OK — okuda executes (ELF has no code signature): okuda (5f59b8c)
```

— green, over a stale file, with the contradicting SHA inside its own success
line. The gate had never been wrong about `okuda`; it had never been right
either, because the subject was never pinned.

**`just check` never looked at `cahier` at all.** `gates.sh` ran the row with no
argument and the default is `okuda`. A gate's default is not coverage.

The repair is one `case`: normalise `$BIN` to `./$BIN` after the existence check,
so the magic read, the exec probe and the `codesign` call all name the one file
that was tested. The verdict now prints the path it ran — `OK — ./cahier
executes` — which is the cheapest possible instance of naming the subject.

## What was found that was not asked for

`just check` could not go green because `facade-lint` was dying with **zero bytes
and exit 141** — SIGPIPE — at gate 7/24. Invariant 1 derived the comment column
through `grep '#' | head -1 | awk`. `head -1` exits after a line, `grep` then
writes into a closed pipe, `pipefail` propagates 141, `set -e` aborts at the
assignment, before any diagnostic — the same silent-abort signature the script's
own precondition note exists to prevent, arrived at by a cause the note does not
name.

**It was a race, and that is worse than a break.** 12/12 untraced runs returned
141 on an unchanged tree; the identical command under `bash -x` passed with
`col=29`, because the tracing slowed the producer enough for `grep` to finish
writing first. The gate had been reported as *"`facade-lint.sh`'s silent exit 1"*
and left unfixed on 2026-09-21; it stayed invisible while the justfile's `#` lines
fit the 64 KiB pipe buffer, and surfaced as the facade it guards grew larger than
that buffer.

One `awk` reading to EOF fixed it: no early-exit reader, no fifo between a quitter
and a writer, two fewer processes. 15/15 untraced runs now exit 0, and an 8-word
recipe comment appended to the justfile still produces the named finding at exit 1
— the repair removed the race without softening the invariant.

## What the instruments caught on their author

**A callsign for a decision nobody wrote.** `ADR-GATE-NO-RACE-089` first closed
its "what became harder" paragraph with a citation to a decision on deferrals —
a plausible, well-formed, checksum-valid callsign naming something that does not
exist. Grep found nothing; the citation was minted to decorate a true sentence
with an authority it had not earned. Replaced with the rule's real home
(`AGENTS.md`, Rules of Engagement 7). The instinct to invent a citation is the
anti-pattern the Edinburgh Protocol calls confabulation, and it arrived wearing
the house's own typography. (The phantom callsign is not reproduced here: like
the td ID below, a lint cannot tell a mention from a use. It was corrected before
the ADR's first commit, so it left no trace in the tree — which is precisely why
the slip is written down here, in the one tier whose job is the record of what
nearly shipped.)

**A td ID in a commit message.** The commit for the facade fix ended by citing the
td issue it closed, by its literal ID, beside the callsign. The One-Way Valve says
persisted records cite callsigns and SHAs; td is local and ephemeral. (The ID is
not reproduced here: use-versus-mention is a distinction no lint can draw, so this
document does not ask it to.) No gate reads commit messages, so nothing would
have caught it — and it was amended out by hand, which is the honest place for
that repair to happen. The observation worth keeping: **the valve is enforced
across six directories and not across `git log`.** Whether that is a gap or a
deliberate boundary is unstated, and this sitting did not decide it.

**A criterion recorded as met while unsatisfiable.** `BRF-CAHIER-BINARY` line 62
accepted *"`signature-check.sh cahier` OK"* as done, while work-plan item 4 — `just
install` linking `cahier` — was never performed. The criterion could read `OK`
only in a state that item would have created. Corrected in place with the reason,
not deleted: a brief that edits away its own mistake cannot be checked, which is
the lesson `ADR-SCOPE-FAMILY-087`'s correction carried three commits earlier.

## What was hard

The facade defect resisted the obvious diagnostic. `bash scripts/facade-lint.sh;
echo $?` printed `141` and *nothing else* — no finding, no line number, no
statement. The trail came from `bash -x`, which **passed**: the instrument that
normally reveals a bug was the one that hid it, because tracing altered the
timing that caused it. What finally named it was reading the script's pipeline
against its own header comment, which had already written down the symptom
(*"aborts before any diagnostic — exit 1 with zero bytes"*) for a different cause.
A document can describe a failure mode precisely and still not recognise it.

The second difficulty was quieter: the repaired gate could not be committed
green. `decide` was stale from the new brief, `amp-briefs` from the new brief row,
so no ordering of commits left `just check` passing at an intermediate point. The
derived region therefore rides in the defect commit, and the commit body says
why — a small violation of *one logical change per commit* made legible, rather
than a `--no-verify` performed quietly.

## What remains

- **`just install`** — an operator action, not an agent's. It creates
  `~/.local/bin/cahier`, and `BRF-CAHIER-BINARY` work-plan item 4 is still
  unchecked. `just build` no longer needs it; `just fresh` still does, because
  freshness is a claim about the link and `fresh.sh` owns that question.
- **`BRF-GATE-RUNS-FILE`** is landed with its code and its ADR. It closes with the
  next `td review`, not with this document.
- **The two tasks this sitting opened and closed** are in td, and are deliberately
  not named here: the One-Way Valve (persisted records cite callsigns and SHAs)
  exempts only `playbooks/td-playbook.md` and `decisions/TEMPLATE.md`, and this
  document is neither. The first draft of this debrief cited both IDs; the lint
  would have found them, and it is worth stating that the valve binds the
  debrief that documents it.
- **The valve has no gate over commit messages** (above). Undecided: a seventh
  scan, or a stated boundary.
- **`playbooks` report 19 documents with no declared date** — pre-existing
  wallpaper on every `reg-sync` run, printed faithfully and acted on by nobody.
  Per `ADR-GATE-TWO-RENDERS-085` that is not advice; it is either a ticket or a
  reading behind its own address, and it has been neither for some time.

## The lesson, in one line

Both gates failed the same way: **a verdict that is not a fact about its
subject**. One had a path and a name for the same argument; the other had a
stream and a prefix of that stream, decided by whoever lost a race. The repair in
both cases was not to check harder but to stop holding two things and calling
them one.
