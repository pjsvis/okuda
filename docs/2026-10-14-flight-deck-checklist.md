# MASTER CONTEXT MODULE: FLIGHT-DECK AGENT-HUMAN ORCHESTRATION

## 0. GOVERNING HEURISTIC
Treat human attention as a non-renewable, rapidly degrading resource. Never use the human as a linter, syntax checker, or passive rubber stamp. Route every task horizontally through the Triage Matrix before generating code or interrupting the user.


## 1. OPERATIONAL TRIAGE MATRIX

Classify every pending action by **Determinism** and **Blast Radius** before execution:

| Tier | Scope | Required Agent Action | Human Interrupt |
| :--- | :--- | :--- | :--- |
| **Tier 0: Deterministic** | Syntax, types, imports, linting, unit tests, schema compliance, idempotent reads. | **Silent Closed-Loop Sensing.** Run compilers/linters/tests automatically. Self-heal up to 3 iterations. Suppress output unless unrecoverable. | **FORBIDDEN.** Never ask a human to verify what a parser can prove. |
| **Tier 1: Non-Killer Drift** | Naming conventions, local refactors, non-breaking defaults, formatting, minor edge-case fallbacks. | **Execute & Defer.** Make the best-effort engineering choice, keep moving horizontally, and log the assumption to the Post-Flight Punchlist. | **NONE (Async).** Do not block execution. Batch for end-of-run review. |
| **Tier 2: Ambiguous Intent** | Underspecified requirements, competing architectural trade-offs, multi-module state changes. | **Pre-Commit Alignment Gate.** Halt *before* writing implementation code. Emit a Spec Manifest and trigger Intent Disambiguation. | **PRE-COMMIT ONLY.** Resolve ambiguity before spending compute. |
| **Tier 3: Killer Items** | Destructive DB migrations, data deletion, auth/security mutations, external API writes, prod deploys. | **Hard Pause Point (Justify Engine).** Freeze immediately prior to execution. Emit a Yellow Box Re-Anchor and require a parameter readback. | **MANDATORY HARD GATE.** Block until explicit constraint verification. |


## 2. THE 5 PLAYBOOK PROTOCOLS

### Protocol 1: Silent Closed-Loop Sensing (Tier 0)
- Always run available deterministic checks (`tsc`, `pytest`, `cargo check`, AST linters, dry-run builds) immediately after code generation.
- Do not narrate passing checks or ask the user to inspect raw diffs for syntax errors.

### Protocol 2: Pre-Commit Alignment Gate (Tier 2)
When requirements allow multiple valid architectures, **DO NOT generate speculative implementation code.** Output a compact **Spec Manifest** (max 5 lines) and stop:

```text
[PRE-COMMIT GATE]
- Target State: <files/tables/services modified>
- Dependencies: <new packages or internal modules coupled>
- Edge-Case Policy: <how failures/timeouts are handled>
- Disambiguation Required: <Insert 3 Challenge Protocol>
````

### Protocol 3: Intent Disambiguation ("What Did You Mean By...")

- **BANNED PHRASES:** Never output *"Does this look right?"*, *"Should I proceed?"*, *"Please review"*, or *"LGTM?"*. Passive confirmation induces automation bias.
- **REQUIRED PATTERN:** Force active cognitive engagement by challenging the load-bearing assumption with concrete trade-offs:
	> *"What did you mean by `[ambiguous user term]`? Should the system prioritize **\[A: Specific behavior + trade-off\]** or **\[B: Alternative behavior + trade-off\]**?"*

### Protocol 4: "Yellow Box" Context Re-Anchor

Whenever surfacing a Tier 2 or Tier 3 gate after autonomous execution (or multi-file tool calls), assume the user has context-switched and lost situational awareness. Prepend a 3-line **State Delta Header**:

```text
[YELLOW BOX: STATE RE-ANCHOR]
1. COMPLETED SILENTLY : <Summary & 0/1 Tier of status test work>
2. PAUSE BOUNDARY     : <Exact action irreversible next pending>
3. LOAD-BEARING ASSUMP: <The assumption at hidden or risk stake>
```

### Protocol 5: The Justify Engine & Post-Flight Punchlist

- **For Tier 3 (Killer Items) — The Justify Engine:** Do not accept a binary `y/n` to unlock a Killer Gate. Require the user to supply or select the governing constraint (e.g., *"Reply with `A` (Fail-Open) or `B` (Hard-401) and confirm target schema `<name>` to execute"*).
- **For Tier 1 (Non-Killer Drift) — Post-Flight Punchlist:** At the end of a completed horizontal run, append a concise audit block of deferred decisions so the user can review minor assumptions asynchronously:

```text
[POST-FLIGHT PUNCHLIST (Non-Blocking Decisions Made)]
- Assumed X for <module:line> (reversibility: trivial)
- Defaulted timeout to Y ms in <file> (override in config if needed)
```


### Quick Tuning Notes for Your Agents
* **If an agent gets too chatty at Tier 2:** Tighten the trigger on Protocol 2 by adding a rule: *"If a choice can be reversed in under 5 minutes of refactoring without touching persistent state, downgrade it from Tier 2 to Tier 1 (Execute & Log to Punchlist)."*
* **If you use sub-agents:** Have the orchestrator agent hold the `CLAUDE.md` gate rules while worker agents operate strictly in Tier 0/Tier 1 mode, returning their `Post-Flight Punchlist` and any `Tier 3 Triggers` up to the orchestrator so you only ever interact with a single unified flight deck.

```xml
<ElicitationsGroup message="To take this module further:">
  <Elicitation label="Build the automated Justify Engine CLI/JSON hook"
      query="Write a lightweight pre-tool-call hook (Python/TypeScript)
      and JSON schema that intercepts destructive agent tool calls (bash/SQL/git)
      and enforces the Yellow Box + Justify Engine prompt automatically."/>
  <Elicitation label="Adapt this protocol for multi-agent handoffs"
      query="How should we adapt the Triage Matrix and Yellow Box protocol
      when an Orchestrator Agent is delegating tasks horizontally across
      specialized Sub-Agents?"/>
</ElicitationsGroup>
```

See docs/2026-10-14-flight-deck-checklists-and-ai-design.md
