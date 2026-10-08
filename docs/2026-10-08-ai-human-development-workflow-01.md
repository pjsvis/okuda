**Title:** Why YYYY-MM-DD works — zero-cost information density
**Source:** cool-pi-extensions silo — `ai-development-workflow-01` (the ancestor corpus)
**Date:** 2026-10-08
**Written:** 2026-08-03 (the source date; the record's date is the landing date)
**Response:** `docs/2026-10-08-the-filename-is-a-record.md`

Prefixing filenames with an ISO 8601 date string (`YYYY-MM-DD-title.md`) is one of the highest-leverage, lowest-overhead conventions you can introduce into a time-bound workflow.

It aligns cleanly with the core principles of an **explicit, low-entropy workspace**.

---

## 1. Why `YYYY-MM-DD` Works: Zero-Cost Information Density

By embedding the date directly into the filename, you turn the file path into a **self-describing, zero-cost metadata index**:

```
briefs/
├── 2026-02-10-auth-token-refactor.md
├── 2026-03-01-database-migration-schema.md
├── 2026-03-15-payment-gateway-retry-logic.md
└── 2026-04-02-session-handling-update.md

```

From a single $O(1)$ directory listing (`ls briefs/`), both a human developer and an AI agent extract five critical metrics **without reading a single line of file content or parsing a YAML frontmatter block**:

1. **Chronological Topology:** Natural ASCII/lexicographical sorting
   automatically arranges files in exact execution order.

2. **Velocity & Tempo:** The gap between dates (`02-10` to `03-01` vs. `03-01`
   to `03-15`) reveals project rhythm, acceleration, or stalls.

3. **Age & Recency Decay:** Instantly flags stale briefs or ancient decisions
   that might need re-evaluation.

4. **Implicit Category/Type:** Placing them in `briefs/` establishes the OKF
   concept type without needing a database wrapper.

5. **Low-Token Inspection:** An AI agent scanning the file list burns almost
   zero tokens while gaining full situational awareness of project history.

---

## 2. The "Shannon Checksum" at the Directory Level

Just as co-located `README.md` files act as a checksum between intent and execution, date-prefixed filenames create a **checksum between timeline and progress**:

* **Expectation:** Briefs should progress steadily alongside active commits.

* **Anomaly Detection:** If a brief dated `2026-01-15` is sitting next to tasks
  in `marcus/td` marked as "In Progress" in August 2026, the **Shannon Checksum
  fails immediately**. The system has drifted. Either the brief was abandoned
  without a debrief, or scope creep broke the original contract.

You don't need a heavy enterprise project-management dashboard to spot this—the plain-text directory listing exposes the decay instantly.

---

## 3. How It Fits Into Our Complete Architecture

Adding `YYYY-MM-DD` prefixing completes the operational control plane we've laid out:

```
┌─────────────────────────────────────────────────────────┐
│ 1. TIME & SEQUENCE (YYYY-MM-DD Filenames)              │
│    Chronological Ordering, Tempo, Recency, Zero-Token   │
└──────────────────────────┬──────────────────────────────┘
                           │ Sets Timeline
                           ▼
┌─────────────────────────────────────────────────────────┐
│ 2. TASK STATE (marcus/td)                               │
│    In-Flight Memory: Active Locks, Current Tasks         │
└──────────────────────────┬──────────────────────────────┘
                           │ Drives
                           ▼
┌─────────────────────────────────────────────────────────┐
│ 3. OPERATIONAL VOCABULARY (Justfile)                    │
│    Hardened Commands: just brief, just debrief          │
└──────────────────────────┬──────────────────────────────┘
                           │ Enforces
                           ▼
┌─────────────────────────────────────────────────────────┐
│ 4. CO-LOCATED TRUTH (Plain-text READMEs & Briefs)       │
│    Invariants, Decision Rationale, Shannon Checksum      │
└─────────────────────────────────────────────────────────┘

```

When an agent enters the repo:

1. It lists `briefs/` and reads the **dates and titles** (Instant chronological
   context).

2. It checks `td` for the **active task ID and lease** (Current operational state).

3. It checks the co-located `README.md` for **invariants** (System rules).

4. It executes the brief using `just` targets (Deterministic execution).

---

## 4. Operational Takeaway

Relying on filesystem metadata (like OS file creation dates) is notoriously fragile because `git clone` or CI steps reset file creation timestamps.

By making the date **explicit in the filename itself**, the chronological state becomes immutable, diffable, and preserved across Git history. It is a simple, anti-fragile practice that keeps the workspace inspectable, low-entropy, and perfectly tailored for both humans and AI agents.