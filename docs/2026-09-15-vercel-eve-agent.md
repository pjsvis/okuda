# Vercel's Eve Agent

You called it accurately. The talk [00:12] is an almost textbook study of hitting the right operational insight, only to immediately package it into the exact kind of framework overhead the initial insight was supposed to replace.

You can watch the full presentation here: [How We Solved Agent Building — Andrew Qu, Vercel](http://www.youtube.com/watch?v=9dYcwOkpCE8).



## 1. The Actual Breakthrough: Flat Workspaces and Accumulated Notes

Andrew Qu’s narrative actually does the industry a service in the first ten minutes by candidly admitting that standard agent architecture patterns failed them:

* **The Prompt Dump & Multi-Agent Graphs Failed:** They started with mega-prompts [03:45], then built the obligatory multi-agent pipeline (Planner $\rightarrow$ Executor $\rightarrow$ Reporter) [04:57]. It hit a hard ceiling because decomposing the task into brittle sub-agent silos starved the model of holistic execution context [06:19].
* **The Claude Code Epiphany:** The lightbulb went on when they saw Claude Code [07:33]. What made it work wasn't a magic orchestration graph; it was giving the model **a flat filesystem, dumb bash primitives, and permission to explore** [08:13].
* **"Keep Notes as You Work":** When they hit repeat query patterns, their fix was remarkably grounded: run a background process that distills successful runs into flat Markdown/code files in a `skills/` folder [10:39]. The agent inspects these prior "notes" before executing, preventing cold-start hallucination without needing complex state-machine routing [10:56].

From an operational perspective, that’s the entire lesson: give an capable model an isolated execution shell, a place to read and write artifacts, and an evolving directory of procedural notes.



## 2. The Siren Call: "What if We Built Next.js for Agents?"

Right at the 12-minute mark [12:05], the engineering discipline gives way to vendor institutional instinct.

Instead of saying, *"Great, keep your agent harness minimal—just POSIX primitives, markdown runbooks, and a loop,"* the thesis becomes: **we need a prescriptive directory convention to declare infrastructure.**

Enter **Eve** [12:47]:

* Strict directory conventions (`/skills`, `/tools`, `/channels`) [12:36].
* "Framework-defined infrastructure" that binds runtime files directly to cloud primitives [12:18].
* A tidy bundle that happens to neatly map each conceptual box to a proprietary or managed service: Vercel Workflows for durability, Vercel Sandboxes for compute, Vercel Connect for credentials, and Vercel Observability for telemetry [13:36].



## 3. Operational Analysis: Horizontal Leverage vs. Vertical Capture

Evaluating this through a grounded systems lens highlights a classic pattern:

| Dimension | The Working Discovery (Claude Code / File Workspace) | The Framework Translation ("Eve") |
| --- | --- | --- |
| **System Abstraction** | Horizontal: Standard OS primitives (`ls`, `grep`, `bash`, files) that any model understands natively. | Vertical: Opinionated framework DSL and file layout conventions designed around an orchestration engine. |
| **Context Management** | Organic working memory: Model writes notes, reads schemas, and self-corrects against output logs. | Structured magic: Conventions that split logic across framework-managed hooks and loaders. |
| **Failure Modes** | Standard bash errors, visible in stdout. | Framework lifecycle quirks, adapter friction, and abstraction leaks. |
| **End Game** | Portable operational patterns across any runtime or sandbox. | Platform lock-in under the guise of developer convenience ("Next.js for Agents"). |

## The Bottom Line

The speaker was inches away from the fundamental truth of frontier model workflows: **the agent *is* the runtime, and the filesystem *is* the memory.**

Once you give an agent a shell and a persistent scratchpad to document its work, you don't need a heavy meta-framework to orchestrate it. But a company built on framework-defined deployment isn't in the business of telling engineers that a plain directory and a bash loop are all they really need.