---
type: Debrief
callsign: DBF-FIRST-CONTACT
date: 2026-11-05
tags: [scripts, lint, gate, board, protocol, decisions]
agent: pi (ses_b78ac6)
environment: local
briefs: [BRF-FIRST-CONTACT]
---

# Debrief: First contact — the log got shorter, the board got honest, the protocol got general

**Date:** 2026-11-05
**Status:** Done — 1043 tests, `just check` 24/24 in 15s.
`ADR-GATE-TWO-RENDERS-085` and `ADR-GLOBAL-TERM-086` accepted.

## What was asked

Four things a fresh session reported about its own first contact: the check log
could not name its gate, the check log was mostly wallpaper, the ready list
served deferred work as startable, and the loaded protocol had grown to 33 KB of
narrative. The operator concurred with all four and said to proceed.

## What the work actually was

**The log names its gate.** The `&&` line is a named table
(`scripts/gates.sh`), fail-fast, with the failure's name, position and re-run
command printed *below* the evidence rather than walked backwards to. A clean
check is 24 lines, each one a gate's own answer, and `gates: 24/24 OK in 15s`.
The count fell from 127 lines not by cutting evidence but by moving every
reading behind its own address — `just seams`, `just ideas`, `just census`,
`just amp`, `just dates`, `just ref-census` — which is the *constructed wall*
distinction applied to a program's output: same bytes, one door.

**The board.** `just next` reads `td list --json`, separates claimed from
startable, normalises `"P2"` into a sortable number, and prints the depth it is
not showing.

**The protocol.** 490 lines / 33 KB → 385 / 25.9 KB, 13 silo callsigns → 0, and
every term and every **Test** kept verbatim.

## What the instruments caught on their author

Three, and each one within a minute of being written — which is the whole
argument for building an instrument instead of remembering a rule.

1. **The new td-ID gate caught this session's own brief** citing an ephemeral
   task ID in a persisted document. The per-token baseline named the token *and
   the line*, which the count baseline could not have done; that gate is one day
   old and its first live catch was its author. Same as the callsign checksum's
   first catch in October.
2. **The callsign checksum caught a forward reference** — a brief citing an ADR
   that did not exist yet. The remedy was to write the ADR, which was task four.
3. **`ref-census` caught the uncommitted branch** as "merged but still here",
   from zero commits. That is the gate refusing to let a branch exist without a
   claim.

## What was found that was not asked for

**`td list` caps at 50 rows and announces the cap on stdout.** Five hundred
lines of scripts were reading that JSON, three of them in ways where truncation
could hide a row: `next.ts` (the queue), `ref-census.ts` (it filters for
in-progress tasks across the whole board), `brief-queue.ts`. The cap notice also
mixes into the JSON, so a parser that survived the truncation was reading prose.
All three now pass `--limit 0`, and the trap is in `playbooks/td-playbook.md`
where the next session's startup will meet it. An instrument reporting a ceiling
as a fact is this silo's oldest complaint, found here inside its own board
reader.

**The contrast ladder had no reading door.** The gate was the only way to see
the evidence it judges: `--surface` without `--gate` demanded a pair, so the
ladder came out only as a side effect of passing `--gate`. It now has its own
door, and the two renders are asserted to end with the same line — if `just
check` and `just ranking --surface` ever disagree about one census, a test fails.

## What was hard

**Trimming the protocol without weakening it.** The rule was term, Test,
attribution-by-date — narration out, substance untouched. Two clauses needed
rewording rather than deletion: clause 3's `ADR-027` and clause 4's veto path
were load-bearing for the argument and dangled outside the silo, so each became
a rule stated on its own footing with the date as attribution. A claim keeps its
evidence; what it loses is the pretence that the evidence is universally
dereferenceable.

**Deciding what to do with four standing advisories.** Two were readings with no
door (the AMPER staleness calendar, the contrast rungs), one was a stale entry
naming a plate that had moved into another document (pruned), one was a genuine
debt (19 playbooks undated). Only the last needed a ticket. The lesson is the
ADR's four homes: ticket, growing baseline, delete, or move behind a reading's
address — and "it is only advice" is not one of them.

## What remains

The 19 undated playbooks and 113 uncorroborated date-prefixed names are work,
not wallpaper: they are ticketed. A date nobody verified is a claim, and the
house does not write claims it cannot pay for — the same reason the two
baseline entries pruned today were pruned only after the file behind them was
found moved rather than guessed at.
