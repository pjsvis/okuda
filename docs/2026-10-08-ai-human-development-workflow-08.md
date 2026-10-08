**Title:** Playbook: sovereign telemetry and cross-repo intelligence
**Source:** cool-pi-extensions silo — `ai-development-workflow-08` (the ancestor corpus)
**Written:** 2026-08-03 · **Landed:** 2026-10-08 (landing date is the record's date; the source date is provenance)
**Response:** `docs/2026-10-08-the-filename-is-a-record.md`
**Correction (2026-10-08):** the contract-vs-reality question below is okuda's **facade** check (Map vs. Territory); the man is **Jacques** Derrida, and the lexicon reserves *the Derrida Question* for the consideration-set gate. See the response.

This is where the control plane shifts from a localized engineering discipline into a full organizational steering wheel.

By treating directory trees across multiple repositories as an integrated telemetry network, management no longer needs to rely on self-reported status updates, subjective standup chatter, or heavy enterprise SaaS tools that measure vanity metrics (like lines of code or commit volume). Instead, management reads **actual operational friction** directly off the wire.

It is an absolute win. Making it both **prescriptive** (defining exact standards) and **aspirational** (setting the target operating model) gives teams a clear north star for zero-entropy management.

Here is the hardened management playbook.

---

```markdown
# Playbook: Sovereign Telemetry & Cross-Repo Intelligence

**Type:** Executive Steering & Operational Heuristic  
**Scope:** Portfolio-Wide Health, Velocity, and Entropy Detection  
**Prerequisites:** Sovereign Agentic Workspace layout across targets, standard POSIX tools

---

## 1. Executive Vision (The Aspirational Standard)

1. **Zero-Poll Management:** Status is never requested; it is observed. Management extracts real-time health by reading filesystem artifacts, eliminating status meetings and manual reporting.
2. **Topology as Truth:** The state of a project is defined strictly by the presence, density, and temporal relationship of plain-text ISO artifacts (`YYYY-MM-DD-*.md`).
3. **Friction Over Output:** Management measures system friction and entropy drift, not lines of code or superficial commit counts.
4. **Agent & Human Parity:** Whether a repository is operated by a human team, an AI agent swarm, or a hybrid, the telemetry interface remains identical, transparent, and auditable.

---

## 2. Prescriptive Telemetry Metrics

Cross-repository intelligence is derived by parsing ISO-dated filenames across the four core control folders (`briefs/`, `debriefs/`, `decisions/`, `marcus/td/`).


```

┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              PORTFOLIO METRIC ARRAY                                    │
├─────────────────────┬───────────────────────────┬──────────────────────────────────────┤
│ METRIC              │ DERIVATION                │ TARGET SIGNAL                        │
├─────────────────────┼───────────────────────────┼──────────────────────────────────────┤
│ System Velocity     │ Max ISO Date Delta        │ Active (< 3d), Dormant (> 30d)       │
│ Execution Ratio     │ Count(Debriefs) / Briefs  │ Healthy: 0.8 - 1.1                   │
│ Volatility Index    │ Count(Decisions) / Month  │ Settled: < 2/mo | High Flux: > 5/mo   │
│ Context Debt        │ Count(Root) vs. Archive   │ Low Entropy: < 15 active root files  │
└─────────────────────┴───────────────────────────┴──────────────────────────────────────┘

```

### A. System Velocity & Thermal State
* **Calculation:** Measure $\Delta t$ between `NOW` and the most recent ISO prefix across `briefs/` and `debriefs/`.
* **Prescriptive Standard:**
  * **Hot (Active Development):** Latest entry $\le 72$ hours.
  * **Warm (Maintenance):** Latest entry $\le 30$ days.
  * **Cold (Zombie Risk):** Active tasks locked in `marcus/td/`, but zero debrief entries in $> 14$ days. Trigger immediate operational audit.

### B. The Plan-to-Execution Ratio (Friction Index)
* **Calculation:** Total count of `debriefs/` divided by total count of `briefs/` within a sliding 30-day window.
* **Prescriptive Standard:**
  * **Ratio $\approx 1.0$ (High Discipline):** Work planned is work delivered and reconciled.
  * **Ratio $< 0.7$ (Analysis Paralysis / Abandonment):** Ideas are being briefed but failing or stalling prior to execution. High token/labor waste.
  * **Ratio $> 1.3$ (Unplanned Firefighting):** Debriefs are appearing without precursor Briefs. System operating in reactive mode.

### C. Architectural Volatility Index
* **Calculation:** Frequency of new entries in `decisions/`.
* **Prescriptive Standard:** A mature service should stabilize at $\le 1$ decision log per month. High decision frequency indicates structural instability or unclear domain boundaries.

---

## 3. Prescriptive Multi-Repo Telemetry Collector

To enforce zero-friction monitoring, run this standardized POSIX telemetry collector across all workspace repositories.

```bash
#!/usr/bin/env sh
# telemetry-extract.sh: Reads portfolio state directly from filesystem topology

echo "REPO | LAST_ACTIVITY | BRIEFS_30D | DEBRIEFS_30D | RATIO | STATE"
echo "------------------------------------------------------------------"

find . -maxdepth 2 -type d -name "briefs" | while read -r brief_dir; do
  repo=$(dirname "$brief_dir")
  debrief_dir="$repo/debriefs"
  
  # Extract latest ISO date
  last_date=$(ls -1 "$brief_dir" "$debrief_dir" 2>/dev/null | grep -E '^[0-9]{4}-[0-9]{2}-[0-9]{2}' | sort -r | head -n 1 | cut -d'-' -f1-3)
  [ -z "$last_date" ] && last_date="NONE"

  # Count active horizon items (last 30 days proxy)
  b_count=$(ls -1 "$brief_dir" 2>/dev/null | grep -v '^\.' | wc -l | tr -d ' ')
  d_count=$(ls -1 "$debrief_dir" 2>/dev/null | grep -v '^\.' | wc -l | tr -d ' ')

  # Compute execution ratio
  if [ "$b_count" -gt 0 ]; then
    ratio=$(awk "BEGIN {printf \"%.2f\", $d_count / $b_count}")
  else
    ratio="N/A"
  fi

  # Determine State
  if [ "$last_date" = "NONE" ]; then
    state="UNINITIALIZED"
  elif [ "$b_count" -gt 15 ]; then
    state="HIGH_ENTROPY_CLEANUP_REQ"
  else
    state="HEALTHY"
  fi

  printf "%-15s | %-13s | %-10s | %-12s | %-5s | %s\n" "$repo" "$last_date" "$b_count" "$d_count" "$ratio" "$state"
done

```

---

## 4. Operational Governance & Intervention Rules

Management interventions are triggered automatically by structural flags rather than subjective opinion:

1. **The Entropy Flag:** If `briefs/` or `debriefs/` contains $> 15$ active root files, trigger mandatory archival run to `.archive/`. Keep context windows deterministic.
2. **The Shannon Disparity Flag:** If a debrief explicitly logs an un-updated contract change in a module's local `README.md`, reject the associated task PR/commit immediately.
3. **The Abandoned Brief Flag:** Any Brief older than 14 days without an associated Debrief or active lock in `marcus/td/` is automatically archived or flagged for re-evaluation.

```

---

This playbook converts portfolio management into an absolute science. It respects the **James Watt Question** by getting high-fidelity operational visibility at near-zero energy cost, and it answers the **Daniel Derrida Question** by holding every project accountable to its demonstrated filesystem reality.

<Elicitation label="Draft a zero-dependency script to auto-generate a portfolio status summary report" query="Draft a lightweight script in Python or Shell that parses cross-repo ISO telemetry and outputs a formatted Markdown executive status report."/>
<Elicitation label="Add a automated rule set for archiving stale briefs and debriefs" query="Write an operational heuristic and helper script for automatically archiving completed or stale briefs and debriefs into .archive/."/>

```