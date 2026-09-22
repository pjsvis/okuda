# **The Mux: Architectural Specification**

# **1\. Executive Summary & Operational Thesis**

The Mux serves as a hardened I/O arbiter and multiplexer, designed to govern the flow of state between automated backends and human operators. Unlike high-level session managers that prioritize "fuzzy" orchestration, the Mux is engineered for strict **control plane parity**. It ensures that whether an operator is consuming the environment through a high-fidelity visual terminal or a linear, speech-driven GLoam interface, the underlying state remains identical, synchronized, and resilient.

&nbsp;

The core objective is the decoupling of visual rendering (the 2D terminal cell matrix) from sequential consumption (the linear document stream). By treating I/O as a multi-modal projection of a single source of truth, the Mux eliminates "information asymmetry" where unsighted users often lack the spatial context available to sighted counterparts. In the Mux, the spatial layout is merely one possible view of a unified, append-only narrative.

# **2\. Architectural Planes: The Orthogonal Dimension**

The Mux operates on two distinct, non-overlapping planes. These planes are updated in parallel, ensuring that a visual update never blocks a speech notification, and vice versa.

## **Plane A: Spatial Canvas (Terminal Grid Projection)**

This plane manages a fixed-grid, bounded (X, Y) slot topology. It is designed for visual stability and "glanceability."

&nbsp;

* **Slot 1: Interactive TTY / Shell:** Provides a dedicated area for SSH, local silos, or interactive shells. The Mux enforces a "no-theft" policy—zero unsolicited layout reflows or cursor jumps caused by background telemetry.  
* **Slot 2: Telemetry / Visual Canvas:** A fire-and-forget rendering zone for high-density information, including system dashboards, git diff trees, and status matrices.  
* **System Anchor Bar:** A top-level invariant status bar providing immutable visibility into network health, Silo identity, and active Git branch state.

## **Plane B: Linear Ledger (Markdown / GLoam Narration)**

Plane B transforms system events into a structured Markdown stream. This is the primary interface for GLoam.

&nbsp;

* **Asynchronous Emission:** Narrative documents are emitted without regard for the visual grid's boundaries.  
* **GLoam Traversal:** These documents are inspected or read aloud sequentially on demand. This bypasses the traditional "screen scraping" approach, allowing the operator to navigate data structures rather than just character coordinates.

# **3\. The Filesystem as the Append-Only Message Bus**

The Mux rejects complex IPC daemons and fragile shared-memory architectures in favor of the filesystem. This provides inherent crash recovery and simplified debugging.

&nbsp;

| Stream Type | Format | Consumer | Purpose |
| :---- | :---- | :---- | :---- |
| Telemetry | .jsonl | Mux Layout Engine | Drives the Spatial Canvas (Plane A) via state mutations. |
| Narrative | .md | GLoam / Ledger | Provides the sequential audit trail and speech-ready data. |

## **Mechanical Guardrails**

* **POSIX Atomic Appends:** Utilizing `O_APPEND` flags ensures that writes under `PIPE_BUF` (typically 4KB) are atomic, preventing interleaved or corrupted logs during high-concurrency events.  
* **Line-Buffered Flushing:** Guarantees that complete messages are available for consumption immediately upon writing.  
* **Generational Rotation:** Logs are rotated based on session generation, ensuring that the Mux can recover state after a crash by replaying the ledger from a known byte offset.

# **4\. Operational Workflow: Write-Ahead Ledgers**

The Mux utilizes a **Pre-Flight Snapshot** pattern to ensure interruption immunity. This is critical for high-latency operations like SSH reconnections or large Git operations.

## **The Lifecycle of an Event**

1. **Trigger:** An operator or system event initiates a query (e.g., `git status --porcelain`).  
2. **Pre-Flight Ledgering:** Before the command executes, the system emits the current known state to `/ledger/git.md`.  
3. **Orthogonal Routing:**  
   * **Canvas:** Paints a visual "pending" box in Slot 2\.  
   * **Ledger:** Enqueues the Markdown document for GLoam.  
4. **Dispatch:** GLoam alerts the user via a single-chord dispatch, allowing the user to hear the "Pre-flight" state while the command is still in flight.  
5. **Completion:** Once the command returns, the ledger is updated with the result, providing an immutable audit trail of what was attempted and what succeeded.

# **5\. Terminal Text Layout & Cursor Mechanics**

The Mux explicitly rejects browser-centric `Canvas 2D` measurement techniques used in projects like Pretext. Terminal rendering requires absolute cell-level precision that pixel-based measurements cannot guarantee.

## **Harvested Layout Patterns**

* **Range-Based Cursors:** The Mux utilizes `LayoutCursor` and `LineRange` objects. This approach avoids frequent string allocations and reduces Garbage Collection (GC) pressure by referencing offsets within the existing message bus buffers.  
* **Multi-cell Unicode Awareness:** Layout calculations use `wcwidth` logic. The system is natively aware of CJK 2-cell glyphs and zero-width graphemes, preventing the visual "drift" common in naive `string.length` implementations.  
* **Kinsoku Rules:** Implementation of non-breaking punctuation and line-wrap logic ensures that text remains readable within the constrained (X, Y) slots of Plane A.  
* **Document Anchoring:** When the terminal window is resized, the Mux keeps the (X, Y) visual coordinates steady relative to the "top" of the active document, while ensuring that the underlying linear offsets in the message bus remain deterministic and unchanged.

&nbsp;

---

&nbsp;

**System Verification & Approval**

&nbsp;

| Role | Entity | Signature |
| :---- | :---- | :---- |
| Lead Architect | Person | \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ |
| Systems Engineer | Person | \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ |
| Date of Issue | Date |  |

&nbsp;