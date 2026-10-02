---
type: Debrief
callsign: DBF-SILCROW-EDGE
---

# Debrief: Silcrow edge cases — the guest handback, the self-mint, and the ephemeral queue

**Date:** 2026-10-02
**Status:** Done — both fixes on main (c9b6da4); td-181911 resolved; the
protocol ran its second and third end-to-end passes.

## What shipped

Two edge-case fixes, implemented by one pi session (01a0fc56) and reviewed by
another (01a0fd0f) through the five-step wrap-up protocol — branch, verify,
approve, ff-merge, push, prune:

1. **Heading style survives a guest paint** (td-290433, 6067af3). Inline
   guest paints (silcrows, doc-refs) close with a full reset that clobbered
   the enclosing heading style mid-line — white text until the wrap. Fix:
   `Styler.roleBoldOpen` (open() alone drops the weight channel) and
   `heading()` re-opens after every embedded reset — reset-then-reopen,
   honouring the wrap state machine's opens-with-full-reset invariant.
   Class-general: any role paint in any heading, both modes.
2. **A document's own callsign mints no vector** (td-e6e692, c9b6da4).
   `scanReferences` minted a vector for the document's own frontmatter
   callsign — a self-jump to the page already on the glass, plus a self-row
   in its own References section. Fix: read the frontmatter callsign the
   scanner already parses, skip exact self-equality. ADV-THE-PILE §12: the
   self-mint gone, vector 12 re-mints to the first genuine reference.

## The self-link, resolved — and why five scans found nothing

The owner's early report, *"a document linking to itself???"*, shelved as
no-repro after five markdown-source scans (inline, reference-style,
case-insensitive, silcrow refs, INDEX fields). The report was real; the
search was in the wrong substrate. The self-link never lived in the source
— it was minted in the **derived layer** by the very machinery that scans
for it: frontmatter callsign → vector → self-jump. Fix (2) is the repro.

**Lesson: when the operator reports what they saw at the glass, scan what
produces the visible artifact — the render pipeline — not only the source.**
Source scans prove nothing about the rendered page.

## The ephemeral queue — this debrief's reason to exist

A correction that invalidates an argument made this same session: *"the td
record is the right home for the resolution"* — no. **td data is ephemeral
and clone-local**: the issue descriptions, session logs, approve reasons,
and closure records never reach main; a fresh clone or another machine sees
none of them. AGENTS.md already teaches this — *td handoff (ephemeral) or docs/
(persistent), never briefs/ (ADR-017)* — and the argument was made
against the corpus's own rule.

So the durable record is here, not in td. The general rule:

* **td is the working queue** — fast, local, session- and machine-unique,
  correct for task churn, review state, and handoffs. Ephemeral by design.
* **The repo is the archive** — brief statuses, decisions, debriefs. What
  must survive a clone boundary lives only here.

**Match information type to substrate: a lesson written only to td is a
lesson one clone hoards.** The wrap-up protocol's five steps already encode
the split (step 2 is td-local hygiene; steps 3–5 are durable), but step 5's
*debrief when significant* must be read as *debrief when the lesson must
outlive the machine* — and the answer is more often yes than this session
first judged.

## Known caveat: td cannot see pi-session lines through one terminal

td's independence check conflated two pi sessions sharing this cwd's
terminal context (both mapped to ses_2c8c3c), forcing an audited
`--self-review` for td-290433 with the true implementer/reviewer split
recorded in the reason — which, per the section above, was itself
ephemeral. The durable version: **cross-session review through a shared
terminal needs the split said out loud in a durable artifact, or a
genuinely separate machine.**
