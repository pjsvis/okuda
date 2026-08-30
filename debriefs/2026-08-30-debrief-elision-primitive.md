---
type: Debrief
callsign: DBF-ELISION-PRIMITIVE
date: 2026-08-30
tags: [elision, code-fences, tables, menus, role-fit, adr-004, adr-014, adr-022, palimpsest, dogfood]
agent: pi (ses_9e4b52)
environment: local
td: td-b81597
branch: feat/gloam-launcher
---

# Debrief: elision primitive — one primitive, two consumers, and an ADR that got superseded mid-build

## Context

The brief (`briefs/2026-08-28-brief-elision-primitive.md`) fired on a
dogfood finding: long lines inside code fences wrapped, and there was no
horizontal ellipsis. On inspection this was two manifestations of one root
cause — the elision primitive was designed (scratchpad), decided
(ADR-014), and never built. ADR-014 was Accepted while the code at
`renderTable` still shrink-wrapped: the map and the territory had
diverged.

Between the brief and the build, ADR-022 (right-anchored role layout,
2026-08-29) landed and reframed the table consumer before any code was
written. The build followed the reframe, not the original brief.

## Accomplishments

- **The primitive — `elideToWidth` (`51df8f1`).** The shipped
  `truncateDisplay` (index-and-jump) already *was* the primitive under
  another name; renamed to the brief's vocabulary and fixed a width
  bug hiding in plain sight: `scanRuns` yields per-grapheme measured
  widths, but the truncator walked code points at one column each —
  CJK and emoji were miscounted and wide clusters could split. Now
  whole graphemes at measured width; a straddling cluster drops whole,
  the marker takes its place. Contract pinned: fits unchanged,
  overflows end `…`, SGR closed at the cut, never exceeds budget,
  NO_COLOR parity (the marker is content, not styling).

- **Consumer 1 — code fences elide (`2a9d171`).** The `code` handler and
  the mermaid checksum block elide each line to the content width:
  emitted lines are never wider than the terminal, so the terminal
  never soft-wraps what okuda lets through. ADR-004's fence exception
  ("overflow ugly by design") closed by eliding, not wrapping — the
  lesser-evil exception existed only because wrapping was the sole
  alternative. Mermaid ASCII *diagrams* stay verbatim (art is art; the
  binary authors to width). Showcase teaching moved in the same
  change.

- **Consumer 2 — menu tables role-fit (`04c1c42`).** The wiring the
  compositor already hides in the row's HTML comment (`<!-- %%okuda-rhs:NN%% path -->`) becomes the renderer's menu declaration:
  the `text` handler emits a string-tag for the wired comment, the
  `td` handler consumes it (the cell is marked wired), and a 3-column
  wired table renders by ADR-022's closed pattern — number at the far
  right edge (the floor), callsign its stable home, slug truncating
  with `…` (the transition rung) then suppressing below a 4-col
  budget; freed space stays empty left, widening reverses the ladder.
  Degenerate widths elide the callsign; the number keeps its home.
  The mid-token callsign wrap that broke the address column — the
  thing ADR-022 was written to fix — is dead. reg-menu's 50-char
  slug cap retired: the compositor emits full content, the renderer
  truncates to the live budget (no compositor guessing a width it
  doesn't have).

- **ADR-014 closed — Superseded, not Deferred.** The reframe meant
  ADR-014's generic-table elision would never be built: ADR-022's
  scope gate returns prose tables to wrap ("a truncated reason loses
  the point, a wrapped one keeps it"). Marking 014 Accepted::Deferred
  would have been honest parking; leaving it Accepted-while-contradicted
  was the entropy this task exists to close. Superseded with a
  palimpsest record: the anti-shrink-wrap doctrine survives in the
  menu role fit and in `elideToWidth` (fences); the generic half is
  reversed by the 022 gate. Showcase, style-guide, and tables-monster
  teachings corrected in the same change; the INDEX entry updated.

## What surprised me

- **The primitive already existed.** The brief (2026-08-28) said the
  elision primitive was "never built — anywhere." It had been, as
  `truncateDisplay`, by the index-and-jump work — under a name the
  brief didn't use and with a width bug neither it nor anyone had
  caught. The first task of building the primitive was recognising it
  was already there.

- **The width bug.** `scanRuns` does the hard work (grapheme-aware,
  EAW-aware, ANSI-aware) and hands the truncator per-grapheme measured
  widths. The truncator ignored the measurement and counted code
  points. The infrastructure was correct; the consumer threw the
  information away. A useful reminder that "the width engine already
  is grapheme-aware" is not transitive — each consumer has to actually
  use what the engine provides.

- **The reframe happened in the gap.** The brief assumed one consumer
  for the table half (edge elision for generic tables). ADR-022, decided
  the day after the brief, reversed that — and the build correctly
  followed the later decision rather than the earlier brief. The ADR
  corpus is the authority once a decision is recorded; a brief that
  predates a superseding ADR is aspirational history, not a spec.

## What I'd do differently

- **Catch the status-propagation gap.** `reg-sync` derives `status`
  for *missing* entries but not for *existing* ones — so flipping an
  ADR's Status line doesn't reach `INDEX.jsonl`, and the audit reports
  "0 stale" because it only checks file membership. The map/territory
  check this task exists to perform should probably extend to status
  drift. (Out of scope here; noted for the audit task.)

- **Name the primitive once.** `truncateDisplay` shipped before the
  brief named `elideToWidth`. Had the primitive been named for its
  doctrine at first use, the brief's "never built" claim would have
  been obviously false and the rename would have been unnecessary.
  Vocabulary is anti-entropy; name the thing you'll keep.

## Related

- Brief: `briefs/2026-08-28-brief-elision-primitive.md` (Done)
- ADR-004 `decisions/004-hard-wrap-mandate.md` (fence exception amended)
- ADR-014 `decisions/014-table-elision-over-shrink-wrap.md` (Superseded)
- ADR-022 `decisions/022-right-anchored-role-layout.md` (the reframe)
- Scratchpad `docs/2026-08-27-okudagram-scratchpad.md` (the elision fringe)
- td-b81597
