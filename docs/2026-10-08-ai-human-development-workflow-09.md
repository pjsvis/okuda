**Title:** Dual-layer telemetry — intent vs. recency
**Source:** cool-pi-extensions silo — `ai-development-workflow-09` (the ancestor corpus)
**Date:** 2026-10-08
**Written:** 2026-08-03 (the source date; the record's date is the landing date)
**Response:** `docs/2026-10-08-the-filename-is-a-record.md`

That distinction about `marcus/td` is critical. Treating local task states as ephemeral L1 cache while elevating committed artifacts (`briefs/`, `debriefs/`, `decisions/`) as the immutable L2/L3 ground truth protects the workflow from tracking noise.

You avoid micro-managing uncommitted, transient work-in-progress, while ensuring that anything meant to persist is backed by an auditable commit.

Adding **filesystem metadata** (like `mtime` or Git commit timestamps) directly onto those persisted artifacts creates a dual-layer telemetry model that requires nothing more than core OS utilities and basic Git access.

---

## Dual-Layer Telemetry: Intent vs. Recency

By capturing both the ISO filename (declared intent/historical anchor) and the file modification/commit timestamp (actual execution activity), a manager gets two distinct signals:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        DUAL-LAYER TELEMETRY                            │
├───────────────────┬───────────────────┬────────────────────────────────┤
│ ISO FILENAME DATE │ FILE MTIME / GIT  │ SYSTEM INTERPRETATION          │
│ (Declared Intent) │ (Last Touched)    │                                │
├───────────────────┼───────────────────┼────────────────────────────────┤
│ 2026-08-01        │ 2026-08-04 (Today)│ ACTIVE REVISION: Old plan      │
│                   │                   │ currently being executed/edited│
├───────────────────┼───────────────────┼────────────────────────────────┤
│ 2026-08-04 (Today)│ 2026-08-04 (Today)│ FRESH INTENT: Newly drafted    │
│                   │                   │ brief or closed debrief        │
├───────────────────┼───────────────────┼────────────────────────────────┤
│ 2026-07-10        │ 2026-07-10        │ STABLE/COMPLETED: Settled      │
│                   │                   │ historical artifact            │
└───────────────────┴───────────────────┴────────────────────────────────┘

```

When a manager sees an older brief (`2026-07-15-auth-refactor.md`) whose `mtime` or `git log -1 --format="%cd"` was updated *two hours ago*, they know instantly that active surgery or reconciliation is happening on that exact initiative **today**—without asking anyone for a status update.

---

## The "Top Sight to Drill-Down" Hierarchy

Because this control plane sits entirely inside Git repositories, manager visibility scales smoothly from high-level portfolio heatmaps down to specific line edits across two simple environments:

```
                  [ PORTFOLIO TELEMETRY ]
             (Cross-repo bash script parsing)
                         │
                         ▼
          ┌──────────────┴──────────────┐
          │                             │
          ▼                             ▼
   [ REMOTE READ ]               [ LOCAL DRILL ]
   (GitHub/GitLab)             (Specific Clone)
   • Read committed artifacts  • Read uncommitted mtime
   • View PR deltas            • Inspect WIP drafts
   • Verify Shannon Checksums  • Run local `just` tools

```

1. **Top Sight (The Fleet View):** A single script iterates over local workspace
   clones or queries the GitHub API to parse directory trees, `mtime`s, and
   commit timestamps across 50 repos.

2. **Remote Drill (Committed Ground Truth):** If a repo shows an anomaly (e.g.,
   a brief with high activity but no debrief), the manager clicks into the repo
   on GitHub to read the plain-text file directly in the browser.

3. **Local Drill (WIP / Workspace Inspection):** If working directly within a
   local clone environment, the manager runs terminal commands (`ls -lt
   briefs/`, `git status`) to inspect uncommitted operational state before it
   ever hits origin.

---

## The Zero-SaaS Architecture Stack

This entire management infrastructure costs $0, requires zero servers, and introduces zero security vulnerabilities:

* **Control Plane:** Plain-text Markdown files (`briefs/`, `debriefs/`,
  `decisions/`).

* **Storage & Access Control:** GitHub / GitLab (leveraging existing team SSH
  keys and IAM).

* **Telemetry Collector:** A 30-line POSIX Bash script using `find`, `stat`, and
  `git log`.

* **Reader / Interface:** Neovim, VS Code, or the GitHub Web UI.

---

## Verdict

This fulfills the **James Watt Question** to perfection.

Corporate engineering management typically burns millions on Jira dashboards, status syncs, and telemetry platforms that only incentivize vanity metrics. By replacing that bloated machinery with simple filesystem metadata, you gain higher-fidelity operational visibility at near-zero energy cost.

The repo remains a self-contained, auditable state machine where top-sight steering is an intrinsic property of the filesystem itself.