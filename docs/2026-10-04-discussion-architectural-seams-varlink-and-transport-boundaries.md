# **Architectural Discussion: Transport Boundaries, Raw Streams, and Gloam/Okuda**

> **Terminology (2026-10-14).** The word *okudagram* is retired — the composite is **the render**, one portion is **the frame**, a drawing is **a diagram** (`ADR-RETIRE-OKUDAGRAM-066`). This record keeps its words; the ADR is the map.

**Document Type:** Architecture & Operational Heuristic Discussion Paper  
**Status:** Active Discussion  
**Focus:** Decoupling Transport from Presentation, Varlink/Stream Upgrades, and the Operational Heuristic in Gloam & Okuda

# **1\. Executive Summary & Core Conflict**

Recent discussions surrounding systemd machine APIs (Poettering, 2026\) challenge the traditional pattern of remote node management: running interactive shells and ad-hoc scripts over SSH to execute commands and render outputs remotely.

In Gloam and Okuda, this maps directly to how remote documents are fetched, rendered, and navigated. When an operator views Markdown across nodes, two conflicting paradigms emerge:

1. **The Remote Presentation Trap (TUI over TTY):** Running the renderer (e.g. Okuda or mdv) remotely inside an interactive SSH session.  
2. **The Clean Edge Projection (Byte Stream over Transport):** Treating the remote node strictly as a state/file store and streaming bytes across an authenticated boundary to a local renderer.

This paper evaluates this design seam against existing project commitments: ADR-028 ("the wire is the budget"), the Triad of Bounded Execution, and the Okudagram projection model.

# **2\. Theoretical Alignment: Poettering's Node API vs. Gloam/Okuda Principles**

| Dimension | Poettering's Systemd / Varlink Thesis | Gloam / Okuda Architecture | Operational Synthesis |
| :---- | :---- | :---- | :---- |
| **Execution Boundary** | Eliminate ad-hoc shell scripts/agents; use typed, declarative IPC (Varlink). | Avoid hidden graph traversals; flat filesystem anchors (α, \&orient); horizontal POSIX pipes. | Remote machines store and serve state; they do not negotiate interactive UI shells. |
| **Transport vs Presentation** | SFTP and payloads care only about stdin/stdout streams, not SSH TTYs; upgrade streams directly. | Text is the durable truth. Formatting and framing (Okuda TUI) are runtime projections. | Keep the wire focused on byte streams (ADR-028). The client's terminal owns the render loop and viewport. |
| **Operational Triad** | Predictable machine lifecycles via systemd notify / transient units (Setup \-\> Execution \-\> Teardown). | Universal Triad: Get Ready (& anchors), Do the Job (11-99 vectors), Tidy Up ('u' reset). | Navigation state remains local; teardown returns operator to hub without orphan remote TTY sessions. |

# **3\. The Operational Heuristic: Deconstructing the Remote Markdown Pipeline**

Applying the Three-Beat Heuristic (Setup, Execution, Teardown) exposes the failure modes of remote-rendered TUIs:

## **A. The Anti-Pattern: Server-Side TUI over SSH**

* **Setup:** Establish SSH session with PTY allocation (`ssh -t`); negotiate terminal dimensions, terminfo capabilities, and ANSI escape compatibilities.  
* **Execution:** Remote machine parses Markdown AST, calculates wrapping, emits escape codes for color palettes, and manages pager state. Latency directly impairs scrolling, jumping, and search.  
* **Teardown:** Trapped nested processes (pager \-\> subshell \-\> ssh). Disconnects leave orphaned agent processes or broken cursor/raw mode terminal states.

## **B. The Gloam/Okuda Approach: Remote Storage, Edge Projection**

* **Setup:** Establish simple byte stream connection (SSH exec, SFTP channel, or Varlink stream upgrade) without TTY allocation. Read target vector or \&anchor.  
* **Execution:** Stream raw Markdown bytes. Okuda runs locally: the local terminal handles the viewport, palette audit, keyboard bindings, and vector jumps (11-99). The remote link has zero latency penalty on scrolling.  
* **Teardown:** Pipe closes cleanly upon EOF. The local state machine cleanly resets to hub ('u') without remote debris.

# **4\. Key Implications for the Okuda Roadmap**

1. **Adherence to ADR-028 ("The Wire is the Budget"):**  
   * Transmitting raw Markdown text over the wire consumes orders of magnitude fewer bytes than streaming repeated ANSI redraw frames or delta updates across a pseudo-terminal.  
   * Bandwidth and latency budgets are spent strictly on payload data and metadata, not terminal control sequences.  
2. **Decoupled Viewer Architecture (mdv / Okuda Engine):**  
   * Treat Okuda as a pure client-side sink accepting standard POSIX streams: `ssh host 'cat path/to/doc.md' | okuda -` or via an SFTP/Varlink socket plugin.  
   * Avoid implementing server-side daemon or agent modes for rendering. The node should expose simple, authenticated byte access.  
3. **Multi-Host Silo Navigation:**  
   * Navigating remote Gloam silos should query flat file manifests or directory vectors, pulling raw \&orient and \&alpha anchors across the boundary rather than launching nested remote sessions.

# **5\. Decision & Proposed Actions**

* **Incorporate:** Formally document that Okuda remains an edge-rendered projection engine. Remote integration must be achieved via byte transport (SSH exec pipe, SFTP stream, or future Varlink bridge) rather than interactive remote TTY shells.  
* **Implement Test Fixtures:** Ensure Okuda's CLI cleanly accepts `stdin` pipelines for remote stream ingestion without expecting a direct local file descriptor.

