**Overcomplete Documentation, Barnacle Scraping, and the End of Drift**

In software development, documentation is usually treated as a trailing tax: write the code, ship it, and then write half-hearted wiki pages that decay into fiction within a month. The result is silent, systemic drift. Unchecked assumptions accumulate like barnacles on the hull of an uninspected ship, slowing everything down until the entire vessel becomes unsteerable.

We inverted the process: make documentation the primary execution surface, bound it into strict silos, and record intent before touching the engine.

---

**Overcomplete by Design: Scraping the Hull**

Most systems fail from under-specification. When architecture lives in Slack threads, ambient team memory, or scattered PR comments, dead abstractions and architectural cruft ("barnacles") have infinite dark corners in which to thrive.

In a system built on explicit **briefs** (`briefs/`), architectural decisions (`decisions/`), and operational playbooks (`playbooks/`), documentation is deliberately overcomplete:

* **Every state transition begins as declared intent:** You define the *what*, the *why*, and the explicit *out of scope* boundaries in a brief before building.
* **Cruft has nowhere to hide:** If a line of code, an ANSI formatting routine, or an extra dependency does not trace back to an ADR or brief, it is instantly recognized as unanchored ballast and scraped off.


* **Zero Ambient Drift:** Boundaries are not guidelines; they are mechanical invariants enforced by the parser and the silo structure.



---

**The Bounded Context: Sandboxes for Humans and Agents**

When you hand an autonomous AI agent or an on-call engineer an open-ended codebase, cognitive failure is inevitable.

By compartmentalizing systems into strict **silos**, the operational scope is bounded:

* The agent’s search sweep is limited to deterministic tools (`ripgrep`/`fzf`) scanning only the active silo.


* The AI never hallucinates execution plans from nothing; it reads the explicit brief, synthesizes the active decision records, and stays on rails.


* The human operator never needs to load the entire company’s global state into their head—only the single, framed document slice in front of them.



---

**The Reflection Surface: Okuda Over SSH**

The bridge between this documented intent and live reality is **Gloam/Okuda** streamed over standard SSH:

* **The Tactical PADD:** The terminal renders structured CommonMark ASTs inside an anchored LCARS frame. You get the physical stillness of a printed page or a Kindle—no fragile gestures, no sprawling browser tabs, no accidental modal chaos.


* **The `?` Semantic Tricorder:** Pressing `?` invokes a read-only agent over the active document tree. It doesn't run arbitrary commands; it scans, extracts the exact playbook section or decision record, and projects it on screen.


* **Hands-Free Checklists:** Runbooks are plain Markdown checklists. A local speech pipeline reads out steps over TTS, while voice input advances the active section, backed entirely by the ground truth checked into the repository.



---

**What's Not to Like?**

When intent is recorded upfront, actions are tracked against briefs, and state transitions reflect across a lightweight, zero-dependency terminal frame, the traditional "application" layer evaporates.

You get deterministic execution, auditable history, and an operational surface stripped clean of barnacles. You declare what should exist, let the machine transition state, and inspect reality through the glass.