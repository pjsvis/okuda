# Superlogical Server Architecture

Mitchell Hashimoto’s breakdown of the **Superlogical** server architecture (`[https://www.youtube.com/watch?v=T5gV6anSt-4](https://www.youtube.com/watch?v=T5gV6anSt-4)`) isn't just a flex on `tmux` [[03:07]—it’s a blueprint for how to make terminal-native tooling survive an agent-heavy, multi-session workload [[01:58]].

If we apply an **Operational Heuristic** to **Gloam** (your markdown renderer) and your SSH workflows, the core takeaway is shifting from *stateless, synchronous rendering* to *parkable, binary-snapshotted state*.

## 1. Applications for Gloam (The Markdown Renderer)

Right now, CLI markdown renderers typically parse, layout, and emit ANSI escape sequences every time they’re invoked—treating every render as a cold start. If Gloam is going to be read by both humans and fleets of AI agents [[01:58]] across long-lived sessions, it hits the exact same memory/CPU wall Hashimoto describes [[01:29]].

* **Binary Snapshot Caching (The "Parked" Document):** Just as Superlogical serializes terminal emulator state to disk after 60 seconds of idle PTY reads [[04:20]] (achieving ~400 KB per full terminal vs. `tmux`'s ~5 MB [[03:16]]), Gloam shouldn't re-parse the AST or re-calculate terminal line-wrapping on every view. Compile the rendered ANSI/cell buffer into a compressed binary snapshot on disk. Rehydrating a pre-laid-out buffer takes microseconds [[06:19]], making instant "resume" across multiple open docs practically free in RAM.
* **Lazy Rehydration on Resize/Input:** Notice how Superlogical only unparks on a PTY read that actually mutates screen state [[05:10]]—not on arbitrary client attachments [[05:16]]. Gloam can serve a parked binary snapshot directly to a viewer without spinning up a full parser/layout engine unless the underlying `.md` file mutates or a `SIGWINCH` (terminal resize) invalidates the wrap width.
* **Agent-Native Output Modes:** Agents are spawning massive volumes of sessions to read docs, specs, and logs [[02:13]]. If Gloam sits in that pipeline, it needs a fast-path bypass: when `stdout` isn't a TTY (or when an agent attaches), skip the heavy ANSI styling/layout tree entirely or stream raw semantic chunks so you don't burn CPU cycles formatting boxes for an LLM.

## 2. Why SSH Is Directly Relevant

Hashimoto points out that agents are spinning up orders of magnitude more SSH and execution sessions than humans ever did [[02:13]]. Traditional SSH + `tmux` breaks down here because each session pins dedicated memory, scrollback buffers, and OS threads [[07:39]].

* **Zero-Compute Reattachment over Flaky Links:** If you run Gloam over SSH (e.g., reading remote runbooks, ADRs, or agent-generated reports), mobile or flaky connections cause constant attach/detach churn. Superlogical solves this by streaming the compressed binary snapshot straight from disk to the attaching client *without unparking the session in RAM* [[11:12]]. Adopting that pattern means remote clients can reconnect to a Gloam pager session over SSH with zero server-side memory spike.
* **Decoupling I/O Polling from Active Rendering:** Hashimoto’s second trick—moving idle file descriptors out of dedicated blocking OS threads into a single `kqueue`/`epoll` loop [[08:12]]—is gold for SSH-forwarded tools. If Gloam is watching (`--watch`) a log or markdown file over an SSH session while you aren't actively looking at that pane, dropping the watcher into a low-overhead event loop instead of hot-polling saves substantial server overhead across dozens of open SSH tabs.

## Opinion & The Justify Engine Check

Hashimoto’s core thesis—*if you design for the excessive scale of 100,000 AI agents, the single-human experience becomes effortlessly fast* [[02:36]]—is dead on, **with one major caveat for Gloam**.

Don't over-engineer Gloam into a daemonized multiplexer prematurely. Every optimization in this video sits on the **performance triangle** (trading memory for disk I/O and engineering complexity) [[10:06]].

* **Where it's justified:** Implementing a simple content-addressed binary cache (hash of `file_contents + terminal_width + theme` -> pre-rendered ANSI stream) and keeping file-watching purely event-driven (`inotify`/`kqueue`) when idle. That gives you 80% of Superlogical's "instant rehydration, near-zero idle footprint" magic with almost zero architectural bloat.
* **Where it's overkill:** Building custom thread-parking heuristics or encrypted disk-swap state inside a markdown renderer. Leave the PTY and thread-level parking to the host multiplexer (like Superlogical or Ghostty) [[06:50]] and keep Gloam focused on being a razor-sharp, fast-hydrating rendering engine.