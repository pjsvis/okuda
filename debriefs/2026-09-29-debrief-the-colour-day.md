---
type: Debrief
callsign: DBF-COLOUR-DAY
---

# Debrief: The colour day — chroma, the shelf, and the curiosity that became a must-have

**Date:** 2026-09-29
**Status:** Shipped — five merges to `main`, `a3e53ff..790a7c6`: projection-losses (`f056dc2`), the SSH-host brief (`2ee1ab7`), fence-colour (`85da30c`), the onion grammar (`dcbb3d0`), the code shelf (`790a7c6`). 472 tests pass / 0 fail (435 at the day's open); `just check` green; colour-smoke and search-smoke green; binary fresh at HEAD. td ledger: td-4e1aa2, td-d95cf3, td-dfa601, td-169fc4 closed; td-ab533c in review (&alpha docs, rode the grammar branch); td-83cc47 open (SSH host — P1 build target and the trial remain).

The operator's line, on seeing the day assembled: *"we have just gone
from curiosity to must-have."* The thesis of this debrief is that the
line names the mechanism: nothing shipped today was individually new,
and the must-have lives entirely in the composition.

## Accomplishments

- **The morning spike, honestly scoped.** polyvis.net's Ionos webspace
  refuses exec and PTY both — SFTP is the only channel; nothing runs
  there, ever. The interim path (`pv-gloam`, the askpass helper, the
  `polyvis-sftp` alias) is documented as P0 of BRF-SSH-HOST, whose real
  question — where does the reading room live — is answered in-brief:
  Hostinger shared, no (the vendor's own capability doc bans compiled
  programs); a $2 VPS, yes; the vendor ADR waits on the trial.
- **Projection-losses closed.** The parked branch held finished work
  one session short of a record: the gate run, the brief's last
  checkbox, and the commit. 435 green, merged, td-4e1aa2 approved.
- **BRF-FENCE-COLOUR, both phases.** P1: tagged fences colour through
  chroma at the mermaid seam (async pre-pass + token, `code()` never
  colours). P2: a code file is a one-fence document — `wrapWholeFile`
  at the cli and tui source boundaries. Every degradation path
  (untagged, unknown tag, absent binary, `none` mode) is byte-identical
  to yesterday **by construction** — only successful pipes buy a token.
- **The monokai pin.** The operator's eye caught "muted"; the style
  probe settled why (the default quantises identifiers — the bulk of
  every fence — to ANSI-white 37, dimmer than prose) and what (monokai
  quantised: cyan keywords, yellow function names, full-white ground;
  dracula refuted — pastels collapse to yellow-everything). The brief's
  "no styles" clause was amended in place: a style through terminal16
  is the emphasis map, not the hue palette the rule banned.
- **The onion grammar landed.** Another session's work (td-d95cf3),
  verified before landing on its branch (468 tests, both smokes), then
  merged. The &alpha front-page docs (td-ab533c) rode the branch and
  await their own approval.
- **BRF-CODE-SHELF.** One Layer-0 rule: a query naming a positive `dir/`
  predicate scopes the candidate set to all files; predicate-less
  queries stay doc-scoped. `src/ spawnChroma` serves the function the
  shelf was built with; `render` returns 348 entries, zero from `src/`.
  The grammar is unchanged — the shelf is a scoping decision exactly
  where the onion's separation of concerns says it belongs.
- **The smokes.** `just colour-smoke` (freshness → three asserted input
  classes) and `just dogfood-colour` (the same, then the eye). Named
  for the search-smoke pattern; the pre-existing `dogfood` kept its
  name and its job (&alpha).

## Problems

- **The implementation was written on `main`.** After the brief's merge
  the working tree never switched back to the branch; the code was edited
  for an hour on `main`, and only the smoke's freshness link caught it —
  `okuda 0.1.0 (a3e53ff)` printed the wrong SHA. Nothing was committed;
  identical trees carried the edits cleanly. The witness was the version
  line. It earns its keep twice in one week.
- **The pipe-masked gate.** `just check 2>&1 | tail -2` chains on tail's
  exit code, not just's — a failing facade-lint (recipe comments >3
  words) rode into a pushed commit. Fixed forward by amend; the lesson
  is structural: a gate's stderr may be piped for display, but the gate
  itself must own the chain.
- **The "no change" render.** Three ways a render can lie about being
  current: a stale binary, a long-lived `--watch` process carrying
  pre-rebuild code in memory, and a stale corpus cache (pv-gloam's
  remote copy). The eyes cannot distinguish them; the version line and
  the smoke can. Assertions over eyeballs is not a slogan here — it is
  the day's central operating lesson.
- **A false claim in a shipped brief.** BRF-FENCE-COLOUR's P2 claimed
  the picker's "rg source already indexes" src files; the corpus was
  `--type md` gated. Caught by orientation, corrected in
  BRF-CODE-SHELF by visible amendment, not silent edit.
- **Pre-existing damage found by asking for real code.** The showcase's
  typescript fence had collapsed — its code joined its own comment run
  on one mangled line. The operator's "the current fence is just
  comments" was the finder; the fence was restored and python joined it.
- **chroma's unknown-lexer trap.** chroma never rejects an unknown
  `--lexer` — plaintext fallback, exit 0, empty stderr. "An unknown tag
  renders as today" is reachable only by validating against
  `chroma --list` before piping. The alias table is chroma's; okuda
  owns no map.

## Metrics

| Measure | Open | Close |
|---|---|---|
| tests | 435 pass / 0 fail | 472 pass / 0 fail |
| main | `a3e53ff` | `790a7c6` (5 merges) |
| dependencies | 8 | 9 (`chroma` 2.27.0, style-pinned) |
| input classes | `.md` | `.md` + every extension chroma aliases |
| corpus | `--type md` always | dir-scoped widening, 0 doc-query leakage |

## Legacy

- **The must-have is the composition.** Colour alone is a curiosity —
  every terminal has something. Whole-file rendering alone is a trick.
  The shelf alone is a flag. The assembly — search the repo, read the
  file, see the code, widen to restore — is the daily driver, and the
  assembly is the moat: each seam is commodity, the composition is ours.
- **Pins are the price of must-have.** chroma 2.27.0, monokai, and the
  exact bytes live in tests, smoke, and DEPENDENCIES. When the tool
  moves, the suite breaks loudly, on purpose. Must-have status makes
  breakage felt; pins make it *named*.
- **The next test of must-have-ness is already queued.** BRF-SSH-HOST's
  reading room: a thing the operator must have locally is the only
  thing worth serving from a port of one's own.
