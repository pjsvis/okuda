Here is the updated, finalized discussion document (`2026-11-22-discussion-deterministic-decision-process-in-silos.md`) incorporating the ISO-date Datum Plane ("the past is a... something or other"), the anti-hoof pre-stacked gate rule, and the Chain Home radar vs. progress-meter sedative critique:

# 2026-11-22-discussion-deterministic-decision-process-in-silos.md

**Status:** Finalized Discussion Document

**Scope:** Repeatable Human-Agent Decision Process, Datum-Plane Archaeology, Pre-Stacked Gates, & Operator Discernment

**Related:** `Edinburgh Protocol`, `Gloam Viewer`, `Keychron K0 Max Actuators`, `Cahier Architecture`, `marcus/td`

---

## 1. Core Thesis: Externalized Precedent Over Opaque Agent Memory

The dominant industry narrative claims that AI systems become useful when given opaque, persistent "memories"—vector stores and hidden conversational summaries that silently accumulate context over time. In high-stakes domains—whether software architecture or a solicitor reviewing a complex transaction with their team—opaque memory is a liability. Nobody wants an assistant that *vaguely recalls* an agreement; you need an auditable, repeatable posture where current state, supporting evidence, and open decisions are laid out identically every single time.

> **Our process replaces simulated neural memory with a deterministic state machine over plain text that remembers only what was explicitly ratified, backed by empirical proof, in a format that never changes.**

---

## 2. The ISO-Date Datum Plane: "Before" vs. "After"

In brownfield repositories and mature organizations, teams often stall trying to rewrite or reconcile years of undocumented folklore. Instead, we establish a strict forward-only **Datum Plane** using ISO-date prefixes (`YYYY-MM-DD-*.md`):

> **The future starts now; the past is a "something or other"—probe it before you trust it.**

* **"After" (`YYYY-MM-DD-` files) = Trusted Context:** Governed precedent produced under the invariant four-block protocol, backed by empirical `tmp/` probes and ratified `[x]` gates. Every fresh `new-up` agent knows immediately what is law.
* **"Before" (Undated legacy files) = Read-Only Archaeology:** Never renamed, never churned, and never trusted on faith. When an active brief intersects with an undated legacy file, we dereference it 1-level deep, test its assertions against reality with a runnable `tmp/` probe, and ratify the verified truth above the datum plane.

---

## 3. The Universal Silo & Uniform Grammar

Every project, codebase, or client matter lives inside a self-contained **Silo** (a Git repository governed by standard security protocols). Because **Gloam** renders every brief, matter status, and decision gate in the exact same invariant layout, participants develop immediate spatial muscle memory:

```text
+-----------------------------------------------------------------------------+
|                    GLOAM SHARED COGNITIVE SPACE (INVARIANT)                 |
|                                                                             |
|  [ Primary Pane: Current Posture & Gates ]  [ Dereferenced Panel (1-Deep) ] |
|  1. Status Summary (Where we stand)         - Referenced Clause / ADR       |
|  2. Rust-Compiled Topology / Flow           - Empirical tmp/ Probe Output   |
|  3. Pre-Stacked Decision Gates (00-99):     - Supporting Precedent File     |
|     [x] 01 Ratified -> Unblocks Execution                                   |
|     [-] 02 Deferred -> Punted to Long Grass                                 |
|     [ ] 03 Open     -> Needs Decision Now                                   |
+--------------------------------------+--------------------------------------+
                                       |
         Mutated In-Situ via Handheld 00-99 Actuator (Passed Around Room)
                                       |
         +-----------------------------+-----------------------------+
         |                                                           |
         v                                                           v
+---------------------------------+                 +-------------------------+
|   THE SILO (Single Source)      |                 |  CAHIER (1-Way Export)  |
| - ISO-Dated MD Files (Datum)    |                 | - SHA-Stamped HTML Text |
| - Shared td SQLite Task Graph   |                 | - Offline Stakeholder   |
| - Standard Repo Access Security |                 |   Scenario Review       |
+---------------------------------+                 +-------------------------+

```

---

## 4. The Three-State Actuator Cycle & "The Long Grass" Diagnostic

Collaborative meetings stall when participants are forced to debate unripe decisions or resolve contentious edge cases on the spot. By constraining every decision gate to a three-state cycle—driven by `00–99` numeric actuators in **Decision Mode** (`M3`)—we turn specification and review into a fast, low-friction decision fest:

| Gate State | Actuator Semantics | Downstream Operational Effect |
| --- | --- | --- |
| **`[ ]` Undecided** | Pre-stacked open item requiring attention to advance status. | Downstream tasks remain blocked in `marcus/td`; agents wait for human ratification. |
| **`[x]` Ratified** | Explicitly approved by unanimous room consent against visible 1-level evidence. | Commits immediately to disk; unblocks daily-driver tasks so agents start executing before the meeting ends. |
| **`[-]` Deferred** | **Punted into the long grass** without argument. | Clears the active meeting table without losing state; tracked on `@STATUS.md` so the team returns to it on schedule. |

### Why "The Long Grass" Never Obscures Avoidance

When a team repeatedly punts a gate into `[-]` (the long grass), it exposes one of two realities: either the required `tmp/` empirical probe genuinely does not exist yet, or the team is dodging an uncomfortable trade-off without an empirical excuse. Because `@STATUS.md` tracks the ISO-date age and deferral count of every `[-]` gate at the top of the Silo, nothing stays hidden for long: once a deferred item crosses its staleness threshold, it automatically promotes itself to become the primary brief of a dedicated meeting.

---

## 5. Meeting Mechanics: Pre-Stacked Gates, No Hoof Improvisation, & Passing the Wand

Traditional meetings convert expensive synchronous attention into sunk costs—or rely on live AI transcript summarization to conjure half-baked "decision lists" on the hoof without empirical resistance. Because our rules live in the invariant Markdown format and hardware actuators rather than organizational hierarchy, **even a junior team member can chair a session and drive it cleanly to closure**:

1. **Pre-Stacked Gates Only (No Decisions on the Hoof):** We enter the room with pre-stacked `00–99` gates backed by 1-level `tmp/` probes. Meetings harvest pre-prepared decisions; they do not manufacture unprobed ones out of thin air. If a genuinely new fork arises mid-session, we **skid it forward** into a fresh `YYYY-MM-DD-brief-[slug].md` stub to be probed properly before the next session.
2. **Passing the Actuator Around the Room:** The wireless **Keychron K0 Max** (`00–99` keypad + rotary knob) is not glued to the chair's hand. Any attendee who wants to challenge a premise or argue a specific direction can take the actuator, punch in the two-digit code to pull their supporting `tmp/` probe or precedent into the right-hand **Gloam** panel, and make their case directly from the available evidence on the wall.
3. **Consent Over Argument (Unanimous Commit or Punt):** We make decisions and move on—no re-litigating settled commits, no endless circular debates. For each gate, unanimous consent flips it to `[x]`; any reasoned objection or missing evidence flips it to `[-]` without argument.
4. **Git Commit as the Closing Gavel (`M3`):** Every session is a deterministic transaction. The meeting's artifact is not a separate set of minutes someone writes later—the **Git commit diff itself is the outcome**. Waiting `new-up` agents immediately pick up the newly unblocked tasks in isolated worktrees.
5. **Post-Meeting AI Critique & Offline Cahier (`M4`):** Immediately post-commit, an agent runs a **Justify Engine critique** over newly ratified `[x]` gates against `@TENSION.md` and existing ADRs—flagging any contradictory choice for deferral. External stakeholders receive a SHA-stamped, pure-text HTML **Cahier** (`M4`).

---

## 6. Operator Discernment Over Progress-Bar Sedatives (The Chain Home Rule)

Modern AI tools love linear progress bars (`10% -> 50% -> 90%`) and passive summaries. A linear progress meter is a sedative, not a control surface: it trains the human operator when *not* to pay attention while hiding the last 10% where structural edge cases and architectural lies live.

> **In our Chain Home radar analogy, a progress bar is the equivalent of a dial that just says *"Defending Britain: 65% Complete"*—completely useless when you actually need to spot a low-flying formation hiding in sea clutter and vector a squadron to intercept it.**

By eliminating fake percentage estimates and forcing human operators—especially junior staff mentored by veteran engineers—to read raw `tmp/` waveforms, inspect `Interface Tension`, and flip discrete `00–99` gates, **Gloam** keeps the human firmly on the radar scope rather than asleep in the passenger seat.

---

## 7. Standard Reusable Document Format (The Invariant Skeleton)

To ensure every session feels identical—whether engineering a distributed module, progressing a legal matter, or scoping a client engagement—every actionable document in the Silo follows the exact same four-block skeleton:

```markdown
# YYYY-MM-DD-[type]-[slug].md

## 1. Current Posture (Where We Stand)
Concise statement of current state, active worktree/matter stage, and what this brief unlocks.

## 2. Topology & Invariants (Pure-Text Map)
Rust-compiled Mermaid box diagram or structured table showing coupled dependencies and constraints.

## 3. Bounded Context (1-Level References)
- [01: Supporting ADR / Precedent](./2026-11-20-adr-example.md)
- [02: Empirical Probe / Evidence](./tmp/probe-output.md)

## 4. Decision Gates (00-99 Actuators)
- [ ] `03` **Primary Direction:** Ratify baseline approach backed by Probe `02`
- [ ] `04` **Secondary Edge Case:** Approve fallback or punt (`[-]`) to next cycle

```

---

## 8. Efficacy Over Theater: Research Directly Into Action

Ultimately, the key to this entire architecture is not the technology—it is the **efficacy of the decision-making**:

* **No Lossy Presentation Abstraction:** We do the research as we always do, and we stop wasting time abstracting honest engineering or domain work into corporate slide decks. Whether pitching internally or co-scoping with a client, the raw Silo *is* the presentation.
* **Even a "No" Produces a Durable Asset:** Whether a proposal is approved or rejected, nobody leaves in limbo. Even if a client or team says no, both sides walk away with a clean, SHA-stamped **Cahier** (`M4`) record of the exact evidence examined and the gates declined—available offline for non-attendees to review without playing telephone.
* **Immediate Return to Base:** Back at base, the team reviews the committed Silo diff in **Gloam**, sees exactly what was ratified (`[x]`) and what was punted (`[-]`), and immediately determines the next move. Collect data, decide, and act.