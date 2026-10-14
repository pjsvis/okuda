**Title:** ‎Gemini – direct access to Google AI

**Date:** 14/10/2026

**Source:** [https://gemini.google.com/share/952ff5cec038?social_preview=false&skid=f2beb8f6-dbbf-4fa1-a485-3bb8bfad97d1](https://gemini.google.com/share/952ff5cec038?social_preview=false&skid=f2beb8f6-dbbf-4fa1-a485-3bb8bfad97d1)

---

# Page Structure Map
```text
‎Gemini – direct access to Google AI
├── 1. What Happened Since 1991?
├── 2. Lessons for AI-Assisted Work & Human Decision-Making
├── 3. Opinion: How to Leverage Checklist History for Success
│   ├── 1. Kill the "Approve/Reject" Button
│   ├── 2. Design for "Pause Points," Not Micro-Management
│   └── 3. Build "Yellow Box" Interruption Recovery
├── Interactive Comparison: Manual vs. Closed-Loop Decision Architecture
├── 1. The Operational Triage Matrix
├── 2. Playbook Actions: The 5 Core Protocols
├── 3. Interactive Playbook Simulator: Routing a Task Through the Gates
└── 4. Narrativised Bibliography: The Lineage of the Playbook
    ├── The Foundation: Why Humans Fail at Monitoring
    ├── The Pivot: Checklists as Socio-Technical Interfaces
    ├── The Quantitative Proof: Automation Bias & Levels of Automation
    ├── The Interruption & Electronic Era: Closed-Loop Sensing
    ├── Cross-Domain Translation: Pause Points & Moral Crumple Zones
    └── Quick Tuning Notes for Your Agents
```

---

https://share.gemini.google/XYCDgA8Ml0Nu

- https://ntrs.nasa.gov/citations/19910017830
- Human Factors of Flight Deck Checklists
- has work been done on the subject since this report
- if so, what lessons can we learn for computer use and decision making
- note that most AI assisted work involves the human making decisions at various points
- can we leverage checklist history to improve the changes for success
- \- opinion

Asaf Degani and Earl L. Wiener’s 1991 NASA report (*Human Factors of Flight-Deck Checklists: The Normal Checklist*) is essentially the foundational text on procedural human-machine interaction. Before they published it, aviation treated checklists as infallible pieces of paper; when a plane crashed because flaps weren't set, investigators just blamed "pilot error" for not reading the list. Degani and Wiener flipped the script by treating the checklist as a socio-technical interface vulnerable to bad design, production pressure, distraction, and cognitive fatigue.

If we look at modern AI-assisted workflows through an operational heuristic, the parallels are exact: **we have turned every knowledge worker into a glass-cockpit flight crew.** The AI acts as the Flight Management System (autopilot/auto-throttle), and the human is kept in the loop as the "monitoring pilot" making decisions at critical gates.

## 1. What Happened Since 1991?

A massive amount of research followed Degani and Wiener’s 1991 paper, moving horizontally from aviation into high-stakes medicine, nuclear ops, and software engineering:

- **The "Four P's" & The Ironies of Automation (1990s–2000s):** Degani and Wiener followed up in 1994 with the "Four P's" of procedure development (*Philosophy, Policies, Procedures, Practices*), addressing how procedures constantly drift in the real world. Around the same time, cognitive engineers like Raja Parasuraman and Sidney Dekker expanded on Lisanne Bainbridge’s *Ironies of Automation*—proving that the more reliable an automated system becomes, the worse a human becomes at monitoring it (**automation bias** and **complacency**).
- **Electronic & Context-Aware Checklists (2000s–2010s):** With the Boeing 777 and Airbus A380, NASA and Boeing researchers (like Barbara Burian and Key Dismukes) studied **Electronic Checklists (ECLs)** with *closed-loop sensing*. Instead of a pilot guessing if a valve is closed, the system senses the state and auto-completes the line, reserving human attention strictly for items the computer *cannot* verify. They also studied the **anatomy of interruptions**—how a 10-second radio call from Air Traffic Control causes a pilot to skip a critical step upon returning to the list.
- **Cross-Domain Migration (2009–Present):** Atul Gawande (*The Checklist Manifesto*) and Peter Pronovost dragged Degani and Wiener’s principles into surgery and ICUs. They discovered that in complex, dynamic environments, checklists fail when they try to dictate *how* an expert does their job, and succeed only when they enforce **pause points** and **communication alignment** at high-risk boundaries.

## 2. Lessons for AI-Assisted Work & Human Decision-Making

In AI-assisted work—whether reviewing AI-generated code, triaging legal/medical summaries, or orchestrating agentic workflows—the human is rarely typing from scratch. They are auditing, steering, and approving. Here is what 35 years of checklist history tells us about why those human decisions fail, and how to fix the architecture:

| Flight Deck Failure Mode | AI-Assisted Workflow Equivalent | The Operational Fix |
| --- | --- | --- |
| **"Look-Without-Seeing"**  Pilots stare directly at an unconfigured switch and reply "Check" out of muscle memory and expectation bias. | **LGTM Syndrome**  A human skims a 200-line AI pull request or synthesis, sees clean syntax/formatting, and clicks "Approve" while missing a hallucinated assumption. | **Active Readback over Passive Confirmation.** Never ask a human "Does this look right? \[Y/N\]". Force the human to input a specific constraint or select the governing assumption before the gate opens. |
| **Do-Verify vs. Challenge-Do-Verify**  Crews perform actions from memory under speed pressure, then use the checklist later as a rapid, mindless audit. | **Post-Hoc Rationalization**  The AI generates the complete output first; the human then tries to mentally reverse-engineer whether the logic holds up. | **Pre-Commit Alignment Gates.** Break the workflow so the human verifies the *plan* or *boundary conditions* (Challenge-Do) before the AI executes the heavy generation. |
| **Checklist Bloat (Production Pressure)**  Regulators add a new line after every incident until the checklist is 40 items long. Crews start skipping items to make gate times. | **Guardrail Fatigue**  Systems that throw 12 warnings, disclaimers, or low-risk confidence flags at the user on every run. The user develops banner blindness. | **Killer Items Only.** Degani & Wiener emphasized restricting normal checklists to "killer items"—things that, if missed, cause catastrophic failure and have no downstream backup. |
| **Open-Loop Redundancy**  Making a pilot manually verify a hydraulic pressure gauge that the onboard computer can already read and validate. | **Cognitive Waste**  Asking a human decision-maker to verify deterministic facts (syntax, schema compliance, basic math) that a deterministic script or linter could verify. | **Closed-Loop Sensing (ECL Model).** Automate deterministic checks silently. Only surface a decision gate to the human when the problem requires **value judgment, intent verification, or ambiguous trade-offs**. |

## 3. Opinion: How to Leverage Checklist History for Success

If we want human-in-the-loop AI to actually work rather than serving as a "moral crumple zone" (where the human is only in the loop to take the blame when the AI fails), we have to stop designing AI interfaces like chat boxes and start designing them like **Modern Electronic Flight Bags**.

### 1. Kill the "Approve/Reject" Button

In aviation, saying "Check" is a trap when the system is right 98% of the time. The human brain is biologically incapable of maintaining high vigilance during passive monitoring of a mostly reliable system. If an AI agent needs a human decision at a critical node, the interface should not offer an "Approve" button. It should use **forced-choice justification**: *"To proceed with this database migration, confirm whether failure recovery should prioritize \[A: Zero data loss\] or \[B: Sub-minute uptime\]."* You wake up the prefrontal cortex by asking for a parameter, not a rubber stamp.

### 2. Design for "Pause Points," Not Micro-Management

When Gawande adapted flight checklists for surgery, he didn't make a list saying "Pick up scalpel, cut skin." He instituted three **Pause Points**: before anesthesia, before incision, and before the patient leaves the room. In AI workflows, peppering the user with constant micro-decisions causes context-switching fatigue. Instead, let the AI run horizontally across a defined phase, then enforce a hard **Pause Point** at irreversible boundaries (e.g., before committing to state, before external API execution, or when shifting from architecture to implementation).

### 3. Build "Yellow Box" Interruption Recovery

One of the biggest killers in post-1991 aviation research was checklist interruption. When an AI agent goes off to think or execute a multi-step job for 90 seconds, the human switches tabs, checks Slack, and loses their mental model of the state machine. When they come back to make a decision, their situational awareness is zero. Good ECLs use a visual anchor (a physical or digital marker) showing not just *where* the workflow paused, but **what state changed right before the pause** and **what assumption is currently load-bearing**.

## Interactive Comparison: Manual vs. Closed-Loop Decision Architecture

To see how these human factors play out structurally, use the state diagram below to compare how cognitive load, failure probabilities, and human decision gates shift between a legacy manual checklist, a naive AI-assisted loop (the "rubber-stamp" trap), and a flight-deck-grade Closed-Loop AI workflow.

<iframe allow="xr-spatial-tracking; web-share" sandbox="allow-pointer-lock allow-popups allow-forms allow-popups-to-escape-sandbox allow-downloads allow-same-origin allow-scripts" src="https://5bfg6bue2b9941xc1sdarh2ahib75mgzh0w9ym7ejuco8edstu-h994388388.scf.usercontent.goog/gemini-code-immersive/shim.html?origin=https%3A%2F%2Fgemini.google.com&amp;cache=1"></iframe>

For a closer look at how routine tasks and psychological relief states ("Lacuna") degrade human vigilance in high-stakes environments, see this breakdown on

Complacency in Aviation Maintenance

, which illustrates why written procedures and active cross-checking remain essential countermeasures against human-in-the-loop oversight failures.

To apply these principles to your architecture:

- "...and succeed only when they enforce pause points and communication alignment at high-risk boundaries."
- interesting point
- "Does this look right" should be replaced with "what did you mean by..." in AI-human comms
- "Pre-Commit Alignment Gates" sounds promising, and automatable
- Killer items sounds good too, small issues can be circled back on, big issues have to be fixed immediately
- Closed loop sensing sounds good too
- lets refine our recommendations to a decision playbook for Agent-Human systems
- define the playbook actions
- include a narrativised bibliography

To turn 35 years of flight-deck human factors into an engineering spec for Agent-Human systems, we have to design around a core operational heuristic: **Human attention is a non-renewable, rapidly degrading resource.** Every time an agent interrupts a human for a trivial check, it drains the exact reservoir of vigilance needed to catch a catastrophic failure five minutes later.

Below is the **Agent-Human Decision Playbook**—a horizontal orchestration protocol that replaces passive "human-in-the-loop" rubber-stamping with active, closed-loop flight deck mechanics—followed by a narrativised bibliography of the research that built it.

## 1. The Operational Triage Matrix

Before an agent executes a step or interrupts the user, it routes the pending action through a 4-tier triage filter based on **Determinism** and **Blast Radius (Reversibility)**:

| Tier | Classification | Aviation Equivalent | System Action | Human Role |
| --- | --- | --- | --- | --- |
| **Tier 0** | **Deterministic & Verifiable**  Syntax, types, linting, schema validation, idempotent reads. | **Closed-Loop ECL Sensing**  Green auto-sensed indicator (e.g., gear down & locked). | **Silent Auto-Verify.** Run deterministic validators in the background. Suppress output unless a retry loop fails. | **Zero.** Never waste human eyeballs on what a parser can prove. |
| **Tier 1** | **Reversible Drift (Non-Killer)**  Naming conventions, minor refactors, non-breaking UI tweaks, formatting. | **Deferred Maintenance / Advisory**  Logged in the flight log for gate arrival; does not halt takeoff. | **Execute & Log to Audit Queue.** Agent makes a best-effort choice, logs the rationale, and keeps moving horizontally. | **Async Batch Review.** Circle back after the main workflow completes. |
| **Tier 2** | **Ambiguous Intent (Pre-Commit)**  Underspecified requirements, competing architectural trade-offs before generation. | **Challenge-Do-Verify**  Briefing the approach minimums *before* descending into weather. | **Pre-Commit Alignment Gate.** Halt *before* expensive generation. Trigger an Intent Disambiguation prompt. | **Active Steering.** Resolve the ambiguity ("What did you mean by...") before compute is spent. |
| **Tier 3** | **Irreversible "Killer Items"**  Destructive state mutations, schema drops, production deploys, external API writes, security auth changes. | **Mechanical Guarded Switch**  Red plastic cover that requires a two-step physical action and cross-crew callout. | **Hard Pause Point.** Freeze execution. Require a **Justify Engine** readback (parameter input, not Y/N). | **Explicit Authorization.** Verify the blast radius and supply the unlocking constraint. |

## 2. Playbook Actions: The 5 Core Protocols

When building or prompting an agentic workflow, encode these five concrete actions as the state-machine rules governing human handoffs:

### Action 1: Silent Closed-Loop Sensing (Pre-Filter)

Automate deterministic verification before any human interrupt

**Trigger:** Any agent output generation (code, config, data transformation).

**Execution:** The orchestrator pipes the agent's output directly into deterministic sensors (type-checkers, AST linters, unit test runners, dry-run compilers). If a check fails, the error feeds back into the agent horizontally for up to $N$ self-healing iterations. The human is **strictly shielded** from syntax errors, broken imports, or schema mismatches.

### Action 2: The Pre-Commit Alignment Gate

Automatable intent verification before heavy execution

**Trigger:** The agent detects multiple valid architectural paths or high prompt entropy *prior* to writing implementation code or executing a multi-step plan.

**Execution:** Instead of guessing and dumping 500 lines of code for the human to reverse-engineer, the agent emits a compact **Spec Manifest** (max 5 bullet points: State touched, Dependencies added, Edge-case policy). It halts until the human resolves the fork.

### Action 3: Intent Disambiguation ('What Did You Mean By...')

Replace passive 'Does this look right?' with active assumption probing

**Trigger:** Any Tier 2 or Tier 3 handoff where the agent had to infer an unstated constraint.

**Execution:** Ban the strings *"Does this look right?"*, *"Please review"*, and *"Should I proceed?"* from the agent's system prompt. Replace them with a mandatory **Assumption Challenge**:

- *Bad (Passive):* "I updated the auth middleware. Does this look good to merge?"
- *Good (Active):* "I scoped the token expiry check to fail-open on internal service timeouts. **What did you mean by 'resilient session handling'**—should internal timeouts \[A: Fail-open using cached claims\] or \[B: Hard-reject with 401\]?"

### Action 4: The 'Yellow Box' Context Re-Anchor

Interrupt recovery after asynchronous agent runtime

**Trigger:** The agent has been running autonomously for greater than 30 seconds before hitting a Pause Point.

**Execution:** Assume the human switched tabs and lost their mental model. When surfacing the Pause Point, render a 3-line **State Delta Header** (the "Yellow Box"):

1. **Completed silently:** `[3 files refactored, 14 tests green]`
2. **Current Pause Boundary:** `[About to execute database migration 004_drop_legacy_users]`
3. **Load-Bearing Assumption:** `[Assuming legacy_users table has zero active foreign-key readers in reporting service]`

### Action 5: Killer-Item Justify Gate & Non-Killer Deferral

Triage big issues immediately; batch small issues for later

**Trigger:** Execution boundary reached.

**Execution:**

- **For Killer Items (Tier 3):** The UI/CLI blocks execution and requires the human to either select a trade-off parameter or explicitly type/confirm the blast-radius variable (e.g., typing the target environment or selecting the rollback strategy).
- **For Non-Killer Drift (Tier 1):** The agent does *not* stop. It appends minor assumptions (e.g., *"Defaulted pagination limit to 50"*, *"Used snake\_case for helper"* ) to a non-blocking **Post-Flight Punchlist** that the human can review at their leisure after the job finishes.

## 3. Interactive Playbook Simulator: Routing a Task Through the Gates

Use the decision architecture diagram below to trace how an incoming task moves through the five playbook actions, and toggle the **Task Risk Profile** to see how the system dynamically routes around human interrupts for low-risk work while enforcing hard Justify Gates for Killer Items.

<iframe allow="xr-spatial-tracking; web-share" sandbox="allow-pointer-lock allow-popups allow-forms allow-popups-to-escape-sandbox allow-downloads allow-same-origin allow-scripts" src="https://0vvsgd9hadm0ve5c1bw39dvzsipzb881vgxxh9h8h4g8zikxno-h994388388.scf.usercontent.goog/gemini-code-immersive/shim.html?origin=https%3A%2F%2Fgemini.google.com&amp;cache=1"></iframe>

## 4. Narrativised Bibliography: The Lineage of the Playbook

To understand why these specific rules work, it helps to trace the intellectual lineage of how human-factors engineers figured out that "just paying more attention" is a fatally flawed system design.

### The Foundation: Why Humans Fail at Monitoring

The story actually begins eight years before the NASA checklist report, with **Lisanne Bainbridge’s (1983) *"Ironies of Automation"* (*Automatica*, 19(6), 775–779)**. Bainbridge identified the central paradox that haunts every AI workflow today: when you automate a system to remove human error, you leave the human to do only the tasks the designer couldn't figure out how to automate—plus the job of monitoring the automation. She proved that the human nervous system cannot maintain vigilance while passively watching a reliable machine. When the automation finally hits an edge case and hands control back, the human's mental model of the system state is cold, making their intervention *more* error-prone than if they had done the work manually.

### The Pivot: Checklists as Socio-Technical Interfaces

In **1991**, **Asaf Degani and Earl L. Wiener** published ***Human Factors of Flight-Deck Checklists: The Normal Checklist* (NASA Contractor Report 177549)**, followed by their **1994** companion piece, ***Philosophy, Policies, Procedures, and Practices: The Four 'P's of Flight-Deck Operations* (NASA-CR-177642)**. Studying accidents like Northwest Flight 255 (where a seasoned crew took off without flaps because a routine taxi interruption broke their checklist cadence), Degani and Wiener demolished the myth that checklists are simple memory aids. They introduced the distinction between *Challenge-Do-Verify* and *Do-Verify*, coined the concept of isolating **Killer Items** to combat production-pressure skipping, and demonstrated how expectation bias causes experienced operators to "look without seeing" when confirming a routine state.

### The Quantitative Proof: Automation Bias & Levels of Automation

Through the late 1990s and 2000s, **Raja Parasuraman, Thomas B. Sheridan, and Christopher D. Wickens** formalized how to split work between humans and machines in ***"A Model for Types and Levels of Human Interaction with Automation"* (2000, *IEEE Transactions on Systems, Man, and Cybernetics*, 30(3), 286–297)**, alongside **Kathleen L. Mosier and Linda J. Skitka’s** landmark work on **Automation Bias (1996)**. Mosier and Skitka showed experimentally that when a computer offers a recommendation, humans commit two distinct errors: *errors of omission* (failing to notice a problem because the computer didn't flag it) and *errors of commission* (blindly following a computer's flawed recommendation even when raw data right next to it contradicts it). This is the exact mechanism behind why "Does this look right?" fails: presenting a finished AI artifact primes the human brain toward an error of commission. Asking *"What did you mean by..."* breaks that priming by withholding the default stamp of approval.

### The Interruption & Electronic Era: Closed-Loop Sensing

As glass cockpits matured on the Boeing 777, **Loukia D. Loukopoulos, R. Key Dismukes, and Immanuel Barshi** published ***The Multitasking Myth: Handling Complexity in Real-World Operations* (2009, Ashgate)**, while **Barbara K. Burian** led NASA’s research into **Electronic Checklists (ECLs) and Emergency/Abnormal Procedures (2006–2014)**. Dismukes’ team mapped the exact cognitive mechanics of interruptions—showing that when a crew pauses a procedure for even 30 seconds to handle a secondary task, working memory dumps the procedural state pointer, leading to skipped steps upon resumption (hence our **Action 4: Yellow Box Re-Anchor**). Simultaneously, Burian’s work on closed-loop ECLs proved that offloading deterministic state-sensing to the machine dramatically reduced crew workload *only* when the interface clearly separated auto-sensed items from human-judgment items.

### Cross-Domain Translation: Pause Points & Moral Crumple Zones

Finally, two modern works bridge aviation directly to software and AI governance:

1. **Atul Gawande’s *The Checklist Manifesto* (2009)** and **Peter Pronovost’s ICU studies (*New England Journal of Medicine*, 2006)**: When translating Degani and Wiener’s work into operating rooms, Gawande realized you cannot script a complex surgery step-by-step—every patient is an edge case. Instead, surgical checklists succeed by enforcing **Pause Points** at phase transitions where the team verbally aligns on critical boundaries and edge-case plans before cutting.
2. **Madeleine Clare Elish’s *"Moral Crumple Zones: Cautionary Tales in Human-Robot Interaction"* (2019, *Engaging Science, Technology, and Society*, 5, 40–60)**: Elish analyzed how modern automated systems (from Air France 447 to self-driving cars) use the "human-in-the-loop" not to improve system safety, but to absorb legal and moral blame when poorly designed automation fails. Our playbook’s insistence on **Pre-Commit Alignment Gates** and **Closed-Loop Sensing** is the direct architectural antidote to the Moral Crumple Zone: it refuses to ask the human to verify things they are cognitively unequipped to catch, and focuses their authority strictly on intent, trade-offs, and high-consequence boundaries.

To operationalize this playbook into your Master Context:

Compile the 5-action Agent-Human Decision Playbook and Triage Matrix into a concise, drop-in Markdown system prompt (e.g., CLAUDE.md / Master Context module) that I can feed directly to my coding agents.

Drop this directly into your `CLAUDE.md`, `.cursorrules`, or Master Context injection file. It is written in imperative, token-efficient operational prose designed to constrain agent behavior without bloating your context window.

See docs/2026-10-14-flight-deck-checklist.md