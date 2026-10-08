---
type: Debrief
callsign: DBF-REGISTRY-TRUTH
---

# Debrief: Registry truth — the audit that found the paperwork lying

**Date:** 2026-10-03
**Status:** Done — main = f7dd2d8 pushed; review queue empty; zero `in_progress`; 19 brief entries match reality; the wrap-up protocol is in the playbook.

## What happened

Three sessions of fast work (containment, television, silcrow Ring B) had
out-run their paperwork. The audit, requested as "a snagging list of things
fixed but not incorporated," found the build honest and the registries lying
in three species:

1. **Done-but-open td issues** — td-c8b190 (fence truncation) shipped in main
   (13a952d) three weeks before anyone closed it; td-623d89 merged on owner
   review the same day.
2. **Open briefs for shipped code** — self-identical-link shipped 2026-09-26
   (565193d, `sameAddress`) with its brief saying `Open, TD: to create`;
   state-glyph render path P1+P2 landed with the brief saying the glyphs are
   plain text; the speech-seam proposal had its verdict (ADR-036) before it
   was written.
3. **Merged branches wearing live-work costumes** — 22 of them (13 local,
   9 remote), all fully merged into main. Pruned.

Plus the one genuine snag: **search-surface** — code on `feat/search-surface`
(cc3c0f9) since 2026-09-15, never merged, branch-only brief, td set never
closed. Three weeks behind main; a naive merge would revert newer work.

## The disposition (the current state, said out loud)

| Work | Verdict | Where it lives now |
|---|---|---|
| Root containment | **Done** — in main (f7dd2d8), pushed | td-623d89 closed |
| Television pin | **Parked** — deliberate, off main | brief on main says the gate (tv #999); code on the branch |
| Search surface | **Parked** — never merged, rotting | brief on main says the gate (rebase < rewrite); code + td set closed as parked |
| State-glyph P1+P2 | **Done** — in main | P3 tuning parked in the brief |
| Speech seam | **Done** — decided by ADR-036 | no code, by design |
| Live documents, speech stride, spoken grammar, capabilities doc, palette audit, SSH host | **Parked** — stalled mid-flight or never started | td closed as parked with refile pointers; briefs carry the gates |
| Self-link report | **No repro** — five scans, zero hits | refile with document + surface when next seen |

`td` now shows: nothing in review, nothing in progress, an open backlog that
means what it says. That is the definitive state.

## The fix, not just the cleanup

The systemic cause was a merge ritual that ended at the commit. The
**wrap-up protocol** (td-playbook.md, added this session) extends it:
commit → td close → brief flip → branch prune → debrief, all in the same
sitting. Moving fast makes the tidy-up *more* important, not less — velocity
without closure manufactures exactly the three falsehood species above.

## Known gaps (recorded, not solved)

- **Registry status vocabulary** — `ready`, `draft`, `proposal`, `pending`
  briefs all derive to INDEX `open`; `rejected`/`aborted` had no label at all
  (two hand-set this session). The four-word vocabulary wants a decision by
  the registry-playbook owner, not a sweep.
- **INDEX entries are derived once, never re-derived** — a flipped brief
  status does not propagate to its INDEX entry; the sweep script
  (hand-run) did it this time. The wrap-up protocol's "flip the brief" step
  must include the INDEX line.
- **The self-link** — reported once, never reproduced. Hume's razor: five
  scans found nothing; the nearest real case (label==URL doubling) was
  already fixed in the shipped binary.
