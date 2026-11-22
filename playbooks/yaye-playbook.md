---
type: Playbook
callsign: PLY-YAYE
---

# The Yaye Review Playbook

## Purpose

This playbook defines **how to run a narrative trajectory review ("the Yaye Screening")** across a project's paper trail so an agent evaluates architectural coherence, pivot justification, and momentum without getting lost in implementation code.

Read it at a milestone boundary, after closing a complex brief, or whenever a project feels like it is drifting from its original intent.

## Context & Prerequisites

- **Target Scope:** A completed brief, an active epic, or a bounded milestone window.
- **Required Artefacts (The Screening):**
  - **Act I (Intent):** The governing brief(s) from `briefs/` or `.archive/briefs/`.
  - **Act II (Plot Twists):** The relevant architectural decision records from `decisions/`.
  - **Act III (Execution & Fallout):** The corresponding `debriefs/` and any `playbooks/` created or updated during the work[cite: 1].
- **Explicit Exclusion:** Do **not** feed raw source code or git diffs into the screening unless verifying a specific contradiction; the review tests the *record's* coherence, not the compiler's.
- **Governing Standards:** Must adhere to **The Evidence Rule** in `playbooks/playbooks-playbook.md` (`PLY-DOC`)[cite: 1].

## The Protocol

1. **Assemble the Reel.** Gather the chronological paper trail (`briefs/` → `decisions/` → `debriefs/` + `playbooks/`) for the target scope[cite: 1]. Verify that closed briefs have actually settled to `.archive/briefs/`[cite: 1] and that ADRs were not written purely post-hoc from memory[cite: 1].
2. **Pass 1 — The Yaye Gut-Check (Vibe & Momentum).** Deliver an immediate, unvarnished reaction to the project as a movie just watched. State what the core "goodness" of the thing is, whether the narrative holds together from Act I to Act III, and where the plot lost the audience. *(Note: Minor imprecision on module names is tolerated here if the overarching momentum is clear; an inability to articulate the "goodness" signals a structural narrative hole.)*
3. **Pass 2 — The *Cahiers du Cinéma* Deconstruction (Auteur & Tension).** Analyze the work like a Hollywood B-movie with hidden depth. Identify the core tension between the original brief's promise and the constraints encountered in execution. Classify every major pivot in `decisions/`[cite: 1] as either an **earned improvisation** (justified by a recorded constraint) or an **unforced studio compromise** (scope drift or unrecorded ADR[cite: 1]).
4. **Pass 3 — The Sequel Pitch (Playbook Readiness).** Inspect the resulting `playbooks/` and `debriefs/`[cite: 1] to define the premise for the next cycle. Name the recurring villain (anti-pattern, skipped step, or bottleneck) that must be written out of the next script.
5. **Audit the Record's Health.** Flag any documentation failure modes exposed during the screening (e.g., sanitized press-release debriefs, missing mid-flight ADRs[cite: 1], or playbooks promoted on a count rather than fallibility[cite: 1]).

## Standards & Patterns

- **Name Your Instruments (The Evidence Rule):** Every claim about project trajectory, pivot frequency, or goal alignment must cite the exact artefact callsign or path (`BRF-...`, `ADR-...`, `PLY-...`, or debrief filename) that establishes it[cite: 1]. Uncited vibes are only permitted in Pass 1; Pass 2 and Pass 3 require receipts[cite: 1].
- **Horizontal Over Vertical:** Evaluate the *temporal arc* across artefacts rather than auditing single files in isolation.
- **No Press Releases:** Maintain a grounded, candid critic's voice. If a brief turned out wrong and cost an argument, say so[cite: 1].

## Validation

The review is complete when:
- All three passes (Yaye Gut-Check, *Cahiers* Deconstruction, Sequel Pitch) are present in the output.
- Every structural assertion in Pass 2 and Pass 3 names its documentary instrument (`ADR-*`, `briefs/*`, `debriefs/*`, `playbooks/*`)[cite: 1].
- Any gaps discovered in the paper trail itself (e.g., an undocumented pivot) are logged as concrete follow-up actions rather than hand-waved away.