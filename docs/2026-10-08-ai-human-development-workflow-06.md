**Title:** Playbook: sovereign agentic workspace (zero-effort OKF)
**Source:** cool-pi-extensions silo — `ai-development-workflow-06` (the ancestor corpus)
**Written:** 2026-08-03 · **Landed:** 2026-10-08 (landing date is the record's date; the source date is provenance)
**Response:** `docs/2026-10-08-the-filename-is-a-record.md`
**Correction (2026-10-08):** the contract-vs-reality question below is okuda's **facade** check (Map vs. Territory); the man is **Jacques** Derrida, and the lexicon reserves *the Derrida Question* for the consideration-set gate. See the response.

That retrofitting property is the ultimate killer feature. Because this process relies on pure file-system topology—standard Markdown, standard ISO dates, and standard shell controls—you don't need a multi-month migration or a greenfield repo to adopt it. You don't ask permission from a vendor, you don't install an enterprise server, and you don't refactor a single line of application code.

You just drop the control plane onto the repo today, and the system instantly begins accumulating low-friction structure.

Here is the hardened playbook to capture the methodology from start to finish.

---

```markdown
# Playbook: Sovereign Agentic Workspace (Zero-Effort OKF)

**Type:** Hardened Operational Heuristic  
**Scope:** Repository-Centric Process & Memory Control Plane  
**Prerequisites:** Git, Markdown, `just`, `marcus/td` (or equivalent plain-text task runner)

---

## 1. Core Principles

1. **Repo Memory Over Agent Memory:** The repo is the sovereign, immutable ground truth. Agent memory is an ephemeral L1 cache that must be reconciled against the file system upon every session entry.
2. **Artifact as Proof:** If intent, lessons, or state changes are not persisted in plain text within Git, they do not exist.
3. **Zero-Friction Inspection:** Information must be readable via $O(1)$ file listing. If context requires custom database queries or proprietary UI access, it is system friction.
4. **Continuous Reconciliation:** Software is a process, not a static artifact. Every module maintains a co-located `README.md` that serves as a continuous Shannon Checksum against implementation drift.

---

## 2. Directory Layout & Topology

Create the following root control folders. Prefix all operational entries with ISO dates (`YYYY-MM-DD`).

```text
.
├── .archive/              <── Deprecated context (1 step away from active view)
│   ├── briefs/
│   └── debriefs/
├── briefs/                <── YYYY-MM-DD-*.md (Aspirational hypotheses)
├── debriefs/              <── YYYY-MM-DD-*.md (Demonstrated reality / post-execution)
├── decisions/              <── YYYY-MM-DD-*.md (Settled architecture & rationale)
├── playbooks/              <── Hardened execution heuristics (like this file)
├── marcus/
│   └── td/                <── Plain-text atomic task tracking & locks
└── Justfile               <── Operational command protocol

```

---

## 3. Retrofitting Protocol (Day 1 Integration)

Retrofitting a mature codebase requires zero application code changes. Execute these four steps to initialize:

```
[ Step 1: Control Folders ] ──► [ Step 2: Minimal Justfile ] ──► [ Step 3: Invariant Anchor ] ──► [ Step 4: First ISO Brief ]
Create briefs/ debriefs/      Bind build/test commands        Add simple README.md to       Declare first active work
decisions/ playbooks/         into standard endpoints         high-churn target module      item in briefs/

```

1. **Bootstrap Topology:** Run `mkdir -p briefs debriefs decisions playbooks .archive/{briefs,debriefs}`.
2. **Define the Interface:** Create a root `Justfile` to map essential project commands (build, test, check, brief, debrief).
3. **Anchor Key Modules:** Add a minimal `README.md` to the single module currently experiencing the highest churn. Define its core invariants in under 10 lines.
4. **File the Initial Brief:** Write `briefs/YYYY-MM-DD-initial-baseline.md` to state current focus.

---

## 4. The Two-Job Execution Cycle

Every unit of work (executed by human or agent) must follow the **Brief/Debrief Loop**:

```
   ┌──────────────────────────────────────────────────────────┐
   │ 1. READ ASSERTIONS                                       │
   │    • Check briefs/, debriefs/, and marcus/td             │
   │    • Read target module README.md                        │
   └────────────────────────────┬─────────────────────────────┘
                                │
                                ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 2. WRITE BRIEF                                           │
   │    • Create briefs/YYYY-MM-DD-topic.md                   │
   │    • Treat as ASPIRATIONAL until executed                │
   └────────────────────────────┬─────────────────────────────┘
                                │
                                ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 3. EXECUTE & RECONCILE                                   │
   │    • Run task via `just` commands                        │
   │    • Update local module README.md if invariants shift    │
   └────────────────────────────┬─────────────────────────────┘
                                │
                                ▼
   ┌──────────────────────────────────────────────────────────┐
   │ 4. WRITE DEBRIEF                                         │
   │    • Create debriefs/YYYY-MM-DD-topic.md                 │
   │    • Record DEMONSTRATED REALITY (failures, deltas)      │
   │    • Solidify recurring patterns into decisions/         │
   └──────────────────────────────────────────────────────────┘

```

---

## 5. Epistemic Guardrails (The Audit)

Before accepting any agent output or structural change, validate it using these two operational questions:

### A. The James Watt Question (Thermodynamic Efficiency)

* *Does this mechanism reduce token/cognitive overhead, or does it burn friction turning its own gears?*
* **Rule:** Prefer plain-text file reads and standard shell utilities over complex vector search layers or custom orchestration servers unless $O(1)$ file reading fails.

### B. The Daniel Derrida Question (Contract vs. Reality)

* *Where is the delta between what we claim the system is doing and what the code is executing?*
* **Rule:** If the implementation shifts, the co-located `README.md` must shift in the same commit. Mismatched contracts fail the Shannon Checksum and trigger a debrief flag.

---

## 6. Maintenance & Active Windowing

* **Active Horizon:** Keep only recent past and active future documents in root `briefs/` and `debriefs/`.
* **Archival Trigger:** When a project phase completes or root directories become cluttered, move older entries into `.archive/briefs/` or `.archive/debriefs/`.
* **Zero-Entropy Rule:** Full history remains $O(1)$ accessible one directory away, keeping context window usage minimal and deterministic for every entry.

```

---

This playbook gives you a self-contained, agent-agnostic control plane. Drop it into any repository, start enforcing the two-job execution cycle, and watch the repo manage its own memory effortlessly.

```