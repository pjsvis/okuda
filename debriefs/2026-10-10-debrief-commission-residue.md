---
type: Debrief
callsign: DBF-COMMISSION-RESIDUE
date: 2026-10-10
---

# Debrief: The commissioning residue — a procedure, a stamper, and the same class twice

**Date:** 2026-10-10
**Status:** Done
**Briefs:** `BRF-COMMISSION-BLANDINGS` — the extraction this task performed; the
commissioning itself is still open
**Commits:** `2aed00a` (the procedure + stamper) · `30d64a2` (review fixes) ·
`bbb3377` (R1/R2) · `bf4e5cb` (the field note)

## What happened

The constitutional residue was extracted into a procedure and a tool: a
commissioning playbook (`PLY-COMMISSION`), a `templates/silo/` skeleton, a
`scripts/new-silo.sh` stamper, and a `just new-silo` recipe. It landed after two
review rounds, both of which found real defects, and both of which found the
**same class** of defect.

## The three blockers — a procedure that failed if followed

**B1 — the checklist contradicted its own tool.** Step 2 ran `git init`; step 3
ran the stamper, which refuses a target that already exists. Followed literally,
the procedure breaks at step 3. *A procedural document has to be executed, not
proofread* — and the reviewer could not execute it, the implementer could not
either, so it fell to the fixer.

**B2 — one page disagreed with itself.** The checklist said day-1 `just check`
was `reg-sync --all`; the field note and the shipped justfile said named tiers.
The fix was not a judgement call: running `--all` in a directory with no tier
dirs reports `index.md MISSING` for every register and exits non-zero. *Name the
mechanism and run it* — the claim is now stated with its failure.

**B3 — the barnacle class, in the document written to prevent it.** The
silo-playbook says *"a silo starts with the playbooks folder and the root files.
Nothing else"* and *"do not create a folder until you need the folder."* The
commissioning playbook shipped three registers at birth, citing silo-playbook as
the authority and overriding it without amending it. Two documents disagreeing
is one barnacle; a document citing an authority it contradicts is the class the
commissioning playbook exists to name.

## The two residuals — the count, and the reading

**R1 — a sentence written from intent, not from the tree.** The reconciliation
asserted that the three registry-floor folders *"each carry a document at
birth."* Only one does; the other two hold a registry and a generated `index.md`,
which is derived and excluded from every scan. The fix chosen was **(b)**:
restate the floor honestly as a **registry** floor, not a document floor, and say
that the exception is justified by the *contract* (a dated name, front matter, an
index that agrees with the directory) rather than by content. Option (a) —
shipping a founding brief and a house playbook so the sentence became true — was
rejected: it adds imposed content at birth and contradicts the procedure's own
*"minimal at the edge."* **Prefer the honest restatement over the accommodating
artefact.**

**R2 — a behaviour reported from a count.** The empty-directory tolerance was
declared working after a run against a `mkdir`'d directory. But the guard used
`ls -A`, which lists dotfiles, so the case its own comment named — a directory
already `git init`ed — was **refused**. The count passed; the reading was never
taken.

**And the rule that caught both is printed on the page that failed them:**

> *The count is the control, the reading is the judge.*

That is the commissioning playbook's own acceptance rule for generated indexes,
turning out to govern the procedure's claims about *itself*. It is now recorded
in the playbook's field notes, because it caught the same class twice in one
afternoon and will do so again.

## What the method got right

- **Reproduction over reasoning.** B2 was settled by running `--all` and reading
  the failure, not by arguing about `reg-sync`.
- **The isolated worktree.** Fixes were made off the shared tree — the shared
  tree was sitting on the branch under review, and the previous occurrence of
  that pattern put a stray symlink on `origin`.
- **The one-way valve, caught mid-edit.** The acceptance line was about to cite a
  task id; persisted documents cite callsigns and SHAs, so it cites the brief.
- **The honest restatement** (R1 above), which is the same discipline the
  keep-class asks of a refused design: say what is, not what would read better.

## The independence problem — worth recording

The implementer's session **could not execute**: mutating commands were refused,
and the only way to re-run the stamper is to run it. So the review's one
unverifiable line — *"dry-run into tmp/ green"* — could not be repaired by
handing the work back; the fix had to move to a session that could run things.

The standard that emerged, and it is the stricter one: **the approver must
neither have implemented nor reviewed.** After a rejected first round, that
emptied the field — implementer, reviewer, and fixer all ineligible — and the
operator approved. That is the right fallback, and it is worth stating because it
is exactly what the barnacle test is about: *an approval that misdescribes who
checked what.* Three roles, named, with the operator closing the loop.

## What is next

- **The template's real acceptance is its first use** — provisioning Blandings
  (`BRF-COMMISSION-BLANDINGS`). Until that lands, `PLY-COMMISSION` is canonical
  as the *procedure* and unproven as the *template*, and the playbook now says so
  rather than reading as accepted-by-use.
- **Open question, unchanged:** where the procedure lives once it leaves the
  incubator — by the general/local test.
- The stamper is `just new-silo` in this silo: `templates/silo/` is a skeleton,
  and the Protocol and registry tooling are copied from the live source at stamp
  time — **stamp, don't mirror**, so there is one authority.

## Related

- `playbooks/commissioning-playbook.md` — the procedure, and its field notes
- `playbooks/silo-playbook.md` — what a silo is; the registry floor, reconciled
- `templates/README.md` — the stamper, and stamp-don't-mirror
- `docs/2026-10-09-silo-genesis.md` — the sequence this tool implements
- `briefs/2026-10-10-brief-commission-blandings.md` — the first run, pending
