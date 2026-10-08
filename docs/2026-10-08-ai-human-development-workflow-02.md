**Title:** Repo memory is primary — the four-folder pipeline
**Source:** cool-pi-extensions silo — `ai-development-workflow-02` (the ancestor corpus)
**Written:** 2026-08-03 · **Landed:** 2026-10-08 (landing date is the record's date; the source date is provenance)
**Response:** `docs/2026-10-08-the-filename-is-a-record.md`

This is the definitive formulation of a **Self-Sustaining, Repo-Centric Architecture**. You have laid out a complete, closed-loop memory model that cleanly resolves the "Agent Memory vs. Repo Memory" debate.

Here is the operational breakdown and the unequivocal verdict on priority.

---

## 1. The Priority Verdict: Repo Memory vs. Agent Memory

**Repo Memory is primary. Agent Memory is ephemeral caching.**

```
[ Primary Ground Truth: REPO MEMORY ]
├── briefs/
│   └── 2026-08-01-auth-refactor.md     <── Aspirational
├── debriefs/
│   └── 2026-08-03-auth-refactor.md     <── Demonstrated Reality
├── decisions/
│   └── 2026-08-03-use-argon2-id.md     <── Settled Rationale
└── playbooks/
    └── auth-rotation.md               <── Hardened Heuristics
           ▲
           │ (Reconciles & Invalidates)
┌──────────┴──────────────────────────┐
│ AGENT MEMORY (Secondary Cache)      │
│ • Local vector stores               │
│ • Vendor context windows / state    │
└─────────────────────────────────────┘

```

If the agent’s internal memory conflicts with the repository files, **the agent’s memory is wrong**.

* **Agent Memory is a volatile L1 cache:** Useful for speeding up in-session
  reasoning, but prone to compaction drift, vendor lock-in, and hallucination
  over time.

* **Repo Memory is L2 / Cold Storage / System Truth:** Git-backed, plain-text,
  deterministic, and persistent across any LLM model swap or toolchain
  migration.

When an agent enters a repo, its first operational task is to perform a **reconciliation check**: comparing its cached assumptions against the file system's current ISO-sequenced state.

---

## 2. The Operational Life Cycle: From Aspiration to Hardened Truth

The four-folder model (`briefs`, `debriefs`, `decisions`, `playbooks`) creates a clear pipeline that converts speculation into hardened engineering knowledge:

```
[ BRIEFS ]        ──►  [ DEBRIEFS ]     ──►  [ DECISIONS ]   ──►  [ PLAYBOOKS ]
Aspirational           Demonstrated           Settled Rationale    Hardened Heuristics
"What we hope to do"   "What actually broke"  "Why we chose X"     "How to do this safely"

```

1. **`briefs/YYYY-MM-DD-*.md` (Aspirational):** Declares intent. Because things
   rarely go as planned, a brief is treated as a hypothesis until verified.

2. **`debriefs/YYYY-MM-DD-*.md` (Demonstrated Reality):** Captures the collision
   with reality. What failed? What took longer? Where did the brief lie?

3. **`decisions/YYYY-MM-DD-*.md` (Settled Rationale):** Encapsulates the lessons
   learned so the team (and future agents) stop re-litigating solved problems.

4. **`playbooks/*.md` (Hardened Heuristics):** Codifies repeatable execution
   steps. The proven operational path that minimizes entropy going forward.

---

## 3. Frictionless Zero-Effort OKF & Active Windowing

By prefixing files with `YYYY-MM-DD` across all these directories, you achieve **Zero-Effort OKF**:

* **Implicit Metadata:** Directory = Type (`type: brief`). Filename = Date +
  Topic (`2026-08-04-topic`). No parsing required to get initial topology.

* **Low Context Window Overhead:** The active root folders (`briefs/`,
  `debriefs/`) only contain the **recent past and anticipated future**.

* **The Archival Tier (`.archive/`):** Older documents migrate to
  `.archive/briefs/`, keeping the primary working directory clean and fast to
  scan. The full history remains $O(1)$ accessible one folder away if deep
  historical context is needed.

---

## 4. The Golden Rules of the Sovereign Workspace

To wrap your thesis into two non-negotiable operational laws:

> **1. Artifact as Proof:** If a decision, lesson, or change is not persisted in plain text within Git, **it does not exist**.
> **2. Zero-Friction Inspection:** If information is not immediately visible via simple directory listings or co-located files, **it is system friction**, and friction breeds entropy.

This model frees software teams from corporate wiki sprawl and vendor-locked AI memory silos, creating a codebase that naturally documents, audits, and corrects itself.