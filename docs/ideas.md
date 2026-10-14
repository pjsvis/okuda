# The idea ledger

Ideas live here until they are worth a promise. One **entry per idea**, appended,
never reorganised. An entry is a line, a sentence, and a **trigger** — the
observation that would make the idea worth doing. A trigger is what separates an
idea from a slogan, and this file is the only place in the silo where an idea can
be written down without costing an hour.

**The test for what belongs here.** Read the entry back: does it say *we will*?
Then it is a decision already made — it belongs to a brief (`BRF-…`) or to the
board. This file holds only what says *wouldn't it be interesting if*. A second
copy of the board is a **parallel store**, which this silo refuses
(`playbooks/registry-playbook.md:139`).

**Promotion is the only exit.** An idea leaves when it is promoted — into a brief,
or into an epic, whose section it will then belong to — and the entry records
where. Refusal is an outcome too, and says why. Clusters are the visible unit:
when several entries name the same cluster word, that cluster is one decision
waiting to be named, not several.

**This file is not a tier.** No callsign, no registry, no status vocabulary —
the record register, uncoded, because a callsign is earned when something cites
the document (`ADR-DOCUMENT-LIFECYCLE-057`). It is a **record**, in `docs/`.

**It falsifies itself.** `just ideas` prints the count, the clusters, and the
promotion ratio. If the line count grows and the promotions do not, the ledger is
a graveyard — it has failed at the one thing it is for — and it should be deleted
rather than curated. `ADR-IDEA-LEDGER-064` carries that as the decision's own
falsifier, not as a later discovery.

**How to read an entry**

```markdown
- **`slug`** · the date raised · `cluster` · the outcome
  the idea, in one sentence
  **Trigger:** the observation that would make it worth doing
```

The outcome is `open`, `promoted: <callsign>`, or `refused: <why>`.

---

- **`brief-promotion-field`** · 2026-10-14 · `process` · **open**
  A brief should declare where it came from — a ledger slug, an operator call, a
  defect — so that promotion is visible on the brief and not only in this file.
  **Trigger:** the origin of a landed brief cannot be answered from the page, or
  a wall of briefs whose `Promoted from:` reads `direct` by reflex — which is
  itself the finding, the way ten unrecognised status words were
  (`ADR-BRIEF-LIFECYCLE-061`). Raised in the briefs-backlog review, deferred
  from `BRF-IDEA-LEDGER`.

- **`debrief-filename-token`** · 2026-10-14 · `record` · **open**
  A debrief's basename should announce its tier, as a brief's does
  (`…-brief-slug.md`), so a basename quoted out of context says what it is.
  **Trigger:** a document quotes a debrief by bare basename and a reader cannot
  tell its tier from the name — while the *directory* still covers the case.
  Deferred from `ADR-RECORD-LINKAGE-065` as out of proportion to its blast
  radius (47 renames and every citation).

- **`remote-is-one-decision`** · 2026-10-14 · `remote` · **open**
  The parked remote family — `BRF-SSH-BLOG`, `BRF-SSH-SERVED`, `BRF-SSH-SERVED-2`,
  `BRF-SSH-TUI`, `BRF-SSH-HOST`, `BRF-AI-DOC` — may be one decision about what
  remote is *for*, rather than six deferred briefs; if so, six entries collapse
  into one and the pile is the shape of the unasked question.
  **Trigger:** the parked pile is re-read and the same question is asked of each
  member in turn. The parking itself says so: they were parked 2026-10-14 "to
  reconsider what remote is for" (`docs/2026-10-14-the-refused.md`).
