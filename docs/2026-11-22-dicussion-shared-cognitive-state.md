# 2026-11-22-discussion-terminal-markdown-cognitive-space.md

**Status:** Revised Discussion Document

**Scope:** Terminal-Rendered Markdown & Pure-Text Cahier as the Shared Cognitive Space

**Related:** `Edinburgh Protocol`, `Cahier Architecture`, `marcus/td` Shared SQLite, `Omarchy` Tiling Control Surface

---

## 1. Premise & Pure-Text Constraint Envelope

When the shared interface between human and AI is constrained strictly to a **terminal Markdown viewer** backed by pure-text compilation, visual expression is intentionally bounded to four primitives:

1. **Structured Prose & Lists** (narrative, briefs, debriefs, ADRs)
2. **Tables** (multi-dimensional state matrices, dependency checks, invariants)
3. **Pure-Text Diagrams** (declarative Mermaid compiled at render time via our repurposed Rust Mermaid-to-Markdown component into Unicode/ASCII box-drawing)
4. **Scientific / Mathematical Notation** (LaTeX/Unicode equations for formal invariants, bounds, and state transitions)

By refusing raster graphics, Sixel/Kitty terminal escape protocols, and SVG conversions, we enforce an **Operational Heuristic invariant**: every byte rendered in the terminal or exported to the HTML **Cahier** remains 100% pure text—readable via `cat`, diffable in Git, parseable by LLMs with zero OCR/vision overhead, and immune to rendering drift.

---

## 2. Core Architectural Thesis: Terminal `/proc` + One-Way Cahier Projection

In Plan 9 and Linux, `/proc` exposes live system state as readable plain-text files. Extending our terminal Markdown viewer into a complete shared cognitive space applies that exact pattern to software delivery, while the **Cahier** acts as its bounded, read-only external projection:

> **The terminal Markdown viewer is a live proprioceptive readout of repository and agent state; the Cahier is a one-way, immutable snapshot of that bounded context for readers outside the terminal.**

```text
+-------------------------------------------------------------------------+
|                  SHARED COGNITIVE SPACE (TERMINAL TUI)                  |
|                                                                         |
|  [ Primary Pane: Canonical Doc ]      [ Dereferenced Panel (1-Deep) ]   |
|  - 2026-11-22-brief-auth.md           - 2026-11-20-adr-token-ttl.md     |
|  - Live STATUS.md / TENSION.md        - tmp/probe-latency-output.md     |
|  - Rust Mermaid -> Text Renderer      - td SQLite Dependency Slice      |
+-------------------+-----------------------------------+-----------------+
                    |                                   |
     One-Way Text Export                 Reads / Mutates via File System
                    |                                   |
                    v                                   v
+-----------------------------------+   +---------------------------------+
|      CAHIER (SINGLE HTML FILE)    |   |  Git Silo + Shared td SQLite    |
|  - Pure Text Only (No SVG/JS bloat|   |  - ISO-Dated MD Files           |
|  - 1-Level Dereferenced Panels    |   |  - Worktree-Scoped tmp/ Probes  |
|  - Read-Only External Consumption |   |  - Single Source of Truth       |
+-----------------------------------+   +---------------------------------+

```

### Key Properties of This Space

* **Perceptual Symmetry:** Agents author declarative Markdown (including Mermaid blocks); the Rust renderer compiles topologies into pure Unicode/ASCII box-drawing on the fly. Both human and model operate over the exact same text substrate.
* **Bounded Depth (1-Level Dereferencing):** Following a link opens the referenced artifact in an adjacent pane without replacing the primary document. Secondary links inside that panel remain inert, preventing unbounded context drift.
* **Strict One-Way Cahier Boundary:** When sharing state with stakeholders or reviewers who lack access to the terminal viewer, the compiler packages the primary document and its 1-level-deep references into a **single text-only HTML file**. The Cahier preserves the exact spatial and cognitive boundary of the terminal view as a read-only artifact—never a backchannel for mutating repo state.

---

## 3. Pushing the Four Pure-Text Primitives to Their Limits

Because neither the terminal viewer nor the HTML Cahier relies on bitmaps or graphical widgets, each pure-text primitive carries explicit operational weight:

| Primitive | Cognitive Role | Concrete Implementation Pattern |
| --- | --- | --- |
| **Text & Checklists** | Intent, Reasoning & Decision Gates | Briefs, debriefs, and ADRs. Binary `[ ]` / `[x]` checkboxes act as deterministic sign-off gates parsed by `debrief-gate` before closing a worktree. |
| **Tables** | Live System Proprioception | Materialized views (`STATUS.md`, `TENSION.md`) generated from `marcus/td` SQLite and `git worktree list`—showing active worktrees, current focus, and unacknowledged interface tension. |
| **Pure-Text Diagrams** | Topological & State Alignment | Agents write declarative `mermaid` blocks; our Rust renderer compiles them deterministically into Unicode box-drawing (`╭─╮`, `──►`) for both terminal panes and Cahier HTML `<pre>` blocks. |
| **Sub-Cell Plots & Formulas** | Quantitative Telemetry & Bounds | Zero-dependency Unicode Braille (`⡀⡄⡆⡇`) sparklines/histograms for `tmp/` probe metrics alongside formal invariants (e.g., $\text{Latency}_{p99} \le 50\text{ms}$, $\sum \text{Active Worktrees} \le 4$). |

---

## 4. Synthetic Views: Turning the Viewer Into a Live Cockpit

To eliminate unclosed-action blindness across parallel worktrees without introducing notifications or chat threads, the viewer renders **synthetic pure-text Markdown views** materialized directly from ground truth:

### A. `STATUS.md` (The Global Plumb Line)

Queried directly from `marcus/td` (`$GIT_COMMON_DIR/.todos`) and `git worktree list`:

* Lists every active worktree, its bound Hyprland workspace, its current `td` focus task, and the age of its `tmp/` scratchpad.
* Surfaces stalled sessions or unclosed debriefs immediately on open.

### B. `TENSION.md` (Cross-Module Tensegrity Map)

Aggregates the `Interface Tension` headers across recent ISO-dated debriefs:

* Maps which module contracts shifted and which adjacent worktrees have not yet executed a boundary probe against the updated contract.

### C. `PROBE.md` (1-Level Deep Empirical Evidence)

Allows a brief or debrief to link directly to a formatted `tmp/` probe output, rendering raw command traces, exit codes, and Unicode Braille latency distributions in the secondary panel.

---

## 5. Adjacent Systems in the Wild (Comparative Matrix)

While no off-the-shelf tool combines all of our constraints, four lineages validate parts of this model:

| System / Lineage | Shared DNA | Where It Falls Short for Our Workflow |
| --- | --- | --- |
| **Plan 9 `/proc` & `9P`** | Exposes live system state as plain-text virtual files; reading inspects state, writing mutates control files. | OS-process focused; lacks structured narrative, ADRs, and multi-agent task semantics. |
| **Charm `glow` / Textual `frogmouth`** | Fast, keyboard-driven terminal Markdown rendering with local file browsing and clean table/code styling. | Passive document readers; lack 1-level-deep side-panel dereferencing and live synthetic state views. |
| **Emacs `org-mode` + `org-babel`** | Unifies plain-text task states, inline code execution, tables, and literate documentation in one buffer. | High configuration overhead, keybinding lock-in, and unbounded nesting complexity. |
| **Moldable Development (Glamorous Toolkit)** | Builds lightweight, domain-specific views over live system state so humans inspect invariants directly. | Heavy graphical Smalltalk environment; breaks pure-text Git portability and terminal-native workflows. |

---

## 6. Justify Engine Check: Risks & Guardrails

Any extension to the terminal Markdown viewer or Cahier compiler must pass three binary checks:

1. **Does it preserve 100% pure-text legibility?** Whether inspected via `cat`, rendered in the terminal TUI, or opened in a text-only HTML Cahier, every diagram, table, and telemetry plot must remain pure UTF-8 text with zero binary assets or SVG fallbacks.
2. **Does it preserve the Cahier's one-way boundary?** The HTML Cahier is strictly an outbound, read-only snapshot stamped with the source Git SHA. External readers never mutate repo state through the Cahier; all state transitions occur inside the repository and shared `td` SQLite store.
3. **Does it enforce bounded cognitive load?** Dereferencing stays strictly **one level deep** in both the terminal split pane and the Cahier HTML panels. Secondary links inside a dereferenced panel remain inert text until promoted to the primary view.

---

## 7. Open Questions for Next Session

* **Synthetic Materialization:** Should `STATUS.md` and `TENSION.md` be virtual views generated in-memory when opened by the viewer, or ephemeral files regenerated on every `git` / `td` hook?
* **Braille Telemetry Standard:** Should we standardize a small Rust helper alongside our Mermaid-to-Markdown renderer to turn numeric `tmp/` probe arrays into fixed-width Unicode Braille sparklines?
* **In-Place Gate Toggling:** Should `[ ]` decision checkboxes be toggleable directly inside the terminal viewer (mutating the underlying ISO-dated file on disk), or edited exclusively via `$EDITOR`?

---

## 8. Narrativised Bibliography & Intellectual Lineage

The architecture outlined in this document synthesizes five distinct threads across systems engineering, biomechanics, and human-computer interaction:

* **Uniform Plain-Text Control Surfaces — Pike, R., Presotto, D., Thompson, K., & Trickey, H. (1995), *"Plan 9 from Bell Labs"*:** The foundational argument that a complex, distributed system becomes legible when every resource—processes, network sockets, windowing state—is exposed as a plain-text virtual file in a unified namespace. Our synthetic `STATUS.md` and `TENSION.md` views apply Plan 9’s `/proc` philosophy directly to multi-agent repository state: read a text file to inspect live system posture; mutate a text file to steer execution.
* **Programs as Human-Readable Narratives — Knuth, D. E. (1984 / 1992), *"Literate Programming"*:** Knuth inverted the traditional relationship between source code and documentation, insisting that software systems should be structured primarily for human comprehension rather than compiler convenience. Our ISO-dated `brief → debrief → ADR` pipeline updates literate programming for the agentic era—where the human steers intent and architectural invariants in structured prose, while agents handle code generation underneath.
* **Context-Specific Operational Lenses — Gîrba, T., & Wardley, S. (2024–2026), *"Rewilding Software Engineering" / Moldable Development (Glamorous Toolkit)*:** Gîrba’s central insight is that software is inherently shapeless, and engineers spend the majority of their cognitive budget simply trying to perceive system state. Moldable development solves this by building lightweight, custom views tailored to the immediate problem. We adopt this principle while stripping away heavy graphical environments, proving that pure-text terminal primitives (tables, Rust-rendered ASCII topologies, and 1-level-deep panels) provide sufficient shape without breaking Git portability.
* **Distributed In-Situ Mechanics & Continuous Tension — Levin, S. M. (1981–2015), *"Biotensegrity: The Mechanics of Biological Structures"*:** Levin demonstrated that living organisms do not operate as rigid, centrally calculated lever-and-fulcrum machines, but as pre-stressed, continuous-tension networks that resolve forces locally at the site of action. This serves as the structural blueprint for our **Edinburgh Protocol**: agents resolve local ground truth via `tmp/` boundary probes and deterministic spinal reflexes, while `Interface Tension` declarations propagate structural deltas horizontally across worktrees without central micromanagement.
* **Tactile Terminal Ergonomics & Agent-Native Environments — Heinemeier Hansson, D. (2025–2026), *Omarchy & The Age of Agents*:** DHH’s work on Arch/Hyprland as an agent-native workstation underscores why terminal-heavy, plain-text environments outperform locked-down GUI operating systems. By pairing Omarchy’s spatial tiling discipline with a strict one-workspace-per-brief limit and one-way pure-text HTML **Cahier** snapshots, we capture the speed of agent-driven development while preventing the cognitive fatigue of unclosed parallel loops.