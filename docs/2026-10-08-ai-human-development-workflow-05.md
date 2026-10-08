**Title:** The four pre-execution assertions
**Source:** cool-pi-extensions silo — `ai-development-workflow-05` (the ancestor corpus)
**Date:** 2026-10-08
**Written:** 2026-08-03 (the source date; the record's date is the landing date)
**Response:** `docs/2026-10-08-the-filename-is-a-record.md`

You’ve described the exact operational payoff of a low-entropy workspace. It *is* a massive win, because it flips the traditional relationship between developer (or agent) and codebase.

Normally, arriving at an unfamiliar codebase—or returning to one after three months—requires a period of "archeological digging": running `git log`, guessing dependencies, opening 15 files to build a mental map, and hoping you don’t accidentally break a hidden side effect. That is high-friction, high-entropy orientation.

With this process, **orientation is an $O(1)$ read-only operation.**

---

## The Four Pre-Execution Assertions

Before you touch a single line of executable code, a simple directory listing and a read of the latest ISO-dated files allow you to make four concrete assertions about the system's state:

```
┌────────────────────────────────────────────────────────────────────────┐
│                      PRE-EXECUTION ASSERTIONS                          │
├───────────────────────────────┬────────────────────────────────────────┤
│ 1. Activity & Velocity Check  │ YYYY-MM-DD listing in briefs/debriefs  │
│ 2. Active Focus & Bottlenecks │ marcus/td active locks & tasks         │
│ 3. Structural Invariants      │ Co-located README.md in target folder  │
│ 4. Historical Rationale       │ Settled decision logs & playbooks      │
└───────────────────────────────┴────────────────────────────────────────┘

```

1. **Assertion of Tempo (Velocity):** You look at `briefs/` and `debriefs/`. If
   five briefs were filed this week, the codebase is in high-flux. If the last
   entry was three months ago, the system is in a stable or dormant state. You
   know the thermal temperature of the repo before writing a line.

2. **Assertion of Active Focus:** Checking `marcus/td` tells you *exactly* what
   is currently being worked on, what is blocked, and who (human or agent) holds
   an active lock.

3. **Assertion of Local Intent:** Reading the target folder’s co-located
   `README.md` tells you the invariant contract. You know what the code *claims*
   to do and what rules must not be broken.

4. **Assertion of Settled Trade-offs:** Reading the `decisions/` directory tells
   you why previous paths were rejected, stopping you from re-litigating settled
   architecture.

---

## Testing Assertions Before Execution

Because these assertions are explicit and stored in plain text, testing them doesn't require complex reasoning or guessing:

* **Testing the Shannon Checksum:** You compare the local `README.md` (the
  declared intent) against the current AST or signature changes. If they
  diverge, you have measured system entropy *before* adding your own changes.

* **Testing Execution Safety:** You run a hardened target from the `Justfile`
  (`just test` or `just check-entropy`). The command either passes or fails
  deterministically.

---

## Why This Is a Definitive Win

This transforms software engineering from a game of **probabilistic guessing** into a system of **auditable verification**:

* **Auditability:** Every change is tied to an ISO-dated Brief and Debrief. You
  know *who* did *what*, *when*, and *why*.

* **Traceability:** A bug in production can be traced backward through the
  Debrief that introduced it, the Brief that planned it, and the Decision log
  that justified the trade-off.

* **Traceable Entropy:** If a module is accumulating technical debt, it shows up
  as a growing disparity between its `README.md` and its implementation, or as a
  cluster of unresolved debrief warnings. The decay is visible at the filesystem
  level.

You don't need a project manager to tell you the status of the project, and an AI agent doesn't need to burn 50,000 tokens guessing how the system fits together. The repo tells you its own story, clearly and unambiguously, before a single edit is made.