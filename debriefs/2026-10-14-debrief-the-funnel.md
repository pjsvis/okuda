---
type: Debrief
callsign: DBF-FUNNEL
date: 2026-10-14
tags: [process, record, gates, briefs, debriefs]
agent: pi
environment: local
briefs: [BRF-IDEA-LEDGER]
---

# Debrief: The funnel — an intake gate, and the edge that was missing

One sitting. The briefs backlog had reached 71 live documents, 59 of them at
`open` and 3 at `ready`, against a lifecycle (`ADR-BRIEF-LIFECYCLE-061`) whose
four positions had one occupant. The diagnosis was structural rather than
disciplinary: the tier table admitted exactly one document for work — a brief,
which is a *promise* — so an idea had nowhere cheaper to be written, so every
idea became a promise, and the open list counted documents instead of decisions.
This sitting added the missing row and closed the other end.

## What landed

- **`docs/ideas.md`, the idea ledger** (`ADR-IDEA-LEDGER-064`) — one entry per
  idea in the record register: a slug, a cluster, a date, and a **trigger**. Not
  a tier: no callsign, no registry, no status vocabulary, so an entry cannot mint
  a code. Promotion into a brief or an epic is its only exit.
- **`scripts/idea-lint.ts`** — the trigger gate, plus the reading the decision
  named as its own falsifier: promoted / total. A ledger that grows while
  promoting nothing is deleted, not curated.
- **The tier row and the route** (`playbooks/playbooks-playbook.md`) — the
  intake gate as a row with its Answers and Lifetime, marked *not a tier*; the
  rule in `playbooks/briefs-playbook.md` that a brief is written for a promoted
  idea; and the demotion rule: an idea going back to the ledger is a
  **rejection**, not a parking, because `parked` does not settle.
- **A debrief declares its briefs** (`ADR-RECORD-LINKAGE-065`) —
  `briefs: [BRF-…]` in frontmatter, callsigns and not paths, `[]` for work with
  no brief. `scripts/debrief-link-lint.ts` gates resolution and ratchets coverage
  against a shrink-only baseline.
- **26 of 46 debriefs now declare** — each backfilled from a pointer its author
  had already written in the body, frontmatter only, never the frozen prose.
  No edge was inferred.

Landing records `fb11f60` and `e93a712`; `BRF-IDEA-LEDGER` settled to
`.archive/briefs/` on the normal ritual, so its citations still resolve
(`ADR-ARCHIVE-RESOLUTION`).

## What the gates found, which is the interesting part

**1. The prose pass caught the ledger's own spec.** `prose-check --strict-leaks`
failed on `docs/ideas.md`: the "how to read an entry" line was printing its own
`**`. The fix was to show the format in a fenced block — which then exposed a
second thing: `parseLedger` was scanning raw lines, so a spec in a fence would
have parsed as a malformed entry. **A gate that reads the document defining it
will read the definition as content.** The parser now skips fences, and the
test says so.

**2. The checksum caught the author, in the commit message.** Three citations of
`ADR-ARCHIVE-RESOLUTION` — a number the callsign does not carry — failed
`callsign-lint`, *including in the message of the commit that introduced them*.
The unpushed range is exactly where amending is cheap, and it was amended. The
residue from the last sitting was the same class: a callsign cited by its number
alone.

**3. A new branch cannot pass `just check` before its first commit.**
`ref-census` reads a branch whose tip is in `main` as **MERGED** and fails the
gate — which is correct for a stale branch and unavoidable for an unborn one. So
the working order is *commit, then check, then amend*; the tidy rule "check
before every commit" has an exception at the branch point that nobody had
written down. `just check` was green on the tip, so the landing is honest — but
the order was forced, not chosen.

**4. `facade-lint` refused a four-word recipe comment.** Minor, and reported
because the class matters: the gate polices the facade's terse comments, and it
worked on the first recipe added by an agent in a while.

## What is owed

- **20 debriefs remain undeclared**, baselined by name. The lint prints the
  coverage on every run — *payment owed: read, do not infer* — so the debt is
  named rather than allowed. It is paid by reading, one at a time, which is the
  whole reason the field exists.
- **The ledger holds 3 entries and has promoted none** (0%). That is correct for
  a container one day old, and it is also the falsifier: at 20 entries with no
  promotions, the ledger goes. The seeds are real and each cites where it was
  raised — `brief-promotion-field`, `debrief-filename-token`, and
  `remote-is-one-decision`, the last of which proposes that the six parked
  remote briefs are one unasked question rather than six deferred ones.
- **The compression of the 59** is not done and is not this brief's. It is one
  cluster at a time: name the cluster, decide it once, promote the slices, and
  **reject** the rest into the archive with the callsign carried in the ledger
  line. The parked remote family is the natural first candidate.
- **`&briefs.md` still shows `BRF-TABLE-SLOT-INSTRUMENT` at `· open`** though it
  landed — pre-existing staleness found while filing this brief's row, and not
  touched.

## Lessons, stated so they can be tested

- **A cheap container needs a gate, and the gate should be the thing the
  expensive container cannot require.** A brief demands acceptance criteria and
  can never demand a trigger; the ledger's whole value is the trigger, so the
  trigger is what it gates.
- **A named row changes behaviour; a resolution does not.** This is
  `ADR-SESSION-HANDOFFS-017` again, now with a second instance: the drift stopped
  wherever the category had a row in the table.
- **A gate reads the document that defines it.** Fences, specs and examples are
  content to a naive parser; the lint must be told what is not data.
- **The unreadable-reference class is never one gate's business.** This sitting
  was caught twice by two different gates (`prose-check`, `callsign-lint`) and
  once by a third (`facade-lint`), and each catch was in a file written minutes
  earlier by the same hand.

## Continuity

The next sitting re-reads this and `just orient`; nothing here is carried in
memory. The idea ledger is `docs/ideas.md` and its gate is on `just check`; the
debrief linkage is in frontmatter and its baseline only shrinks.
