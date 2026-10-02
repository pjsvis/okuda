---
type: Debrief
callsign: DBF-ROOT-CONTAINMENT
---

# Debrief: Root containment — existence is not permission, and the test knew it

**Date:** 2026-10-02
**Status:** Done — BRF-ROOT-CONTAINMENT shipped (f7dd2d8, main, the same
sitting the brief was filed); td-623d89 closed by the registry-truth
audit; BRF-DEMO-SANDBOX (td-662690) stays open — its sandbox is now
defence-in-depth, not load-bearing. The disposition row lives in
DBF-REGISTRY-TRUTH; this debrief is the lesson record beneath it.

## What happened

A public-demo question (an Ionos VPS, a range of sanitized silo
mirrors, gloam browsed two ways — remote gloam over SSH, local gloam
against the remote repos) became an audit of the jump chain, two briefs
filed the same sitting (ops-side BRF-DEMO-SANDBOX, product-side
BRF-ROOT-CONTAINMENT), and the P1 product fix implemented and merged
before the VPS was ever provisioned. The demo made the boundary
load-bearing; the fix made it structural.

The audit found four seams, not three — cli.ts carries its own copy of
the existence-only `resolveTarget` beside the launcher's. Duplicated
predicate, duplicated hole.

## What was built

* `isWithinRoot` (`src/root.ts`) — the containment predicate: realpath
  BOTH sides or NEITHER. A missing side degrades the PAIR to the lexical
  basis — one realpath against one lexical breaks on macOS's
  /var→/private/var tmpdir seam.
* Threading, no surgery: `resolveJumpTarget` gains the root param (the
  TUI receives the silo root via options — handed down, never detected);
  both `resolveTarget` builders (launcher + cli) gain the conjunct;
  `makePathValidator` gains the conjunct and, en route, its first
  working absolute arm.
* `readOnlyActive()` (keygrammar — a declaration beside the bindings):
  `OKUDA_READONLY=1` retires `09`/`99` to flashes — no write path
  computed, no spawn.
* 16 new assertions across root/tui/keygrammar. 520 green; `just check`
  green.

## What the dogfood showed — the plan's two lies, both caught by tests

1. **The brief's OQ2 assumption was wrong.** "resolve() collapses
  symlinks before the predicate" — `path.resolve` is lexical; it never
  follows a symlink. The first implementation shipped that assumption;
  the test written to prove it (the brief's own words: "prove it, not
  assume it") broke it within the hour. The predicate moved to
  `realpathSync`; the brief carries a dated amendment. The OQ2 phrasing
  was the system working.
2. **A latent bug two audit passes missed.** `path.join` is
  segment-wise: an absolute target joins into nonsense, so
  `makePathValidator` had NEVER validated absolute mentions — before
  the audit, before the fix. The audit read the predicate as
  "existsSync, not containment" and missed that one arm was
  structurally dead. Fixing containment gave absolutes a real arm:
  absolute in-root mentions now paint as silcrows for the first time.

## Lessons

* A test written to prove an assumption is the cheapest audit there is —
  the assumption it kills is worth more than the coverage it adds.
* Reading what code *checks* is not reading what code *reaches*. The
  first reading found the risk (existence without containment); the
  second found the dead arm. Budget for both.

## References

* BRF-ROOT-CONTAINMENT — the brief, with its dated OQ2 amendment
* BRF-DEMO-SANDBOX / td-662690 — what the containment was for; still
  open
* DBF-REGISTRY-TRUTH — the disposition table this debrief sits beneath
