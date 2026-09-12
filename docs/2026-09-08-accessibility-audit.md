### GLoam Architecture & Accessibility Master Summary

---

#### 1. Core Transport & Display Substrate

* **Transport:** Native SSH/shell pipe stream; ingress and egress are strictly character-based (no DOM, no JavaScript engines, no CSS reflows).
* **Display Paradigm:** Michael Okuda / LCARS-inspired chromatic perimeter layout. Flat, high-contrast, spatially locked quadrant tiles.
* **A11y Substrate Advantage:** Ingress and egress are inherently semantic text. Screen readers and refreshable Braille displays ingest pure serial data directly from the terminal buffer without parsing complex accessibility trees or losing focus to asynchronous web updates.

---

#### 2. Spatial Grid & Coordinate Determinism

* **Anchor-Locked Focus:** Viewport position is anchored to a semantic point within the document. Zooming, font scaling, or terminal dimension changes re-render outward from that fixed anchor, preventing the cursor from flying off-screen.
* **`SIGWINCH` Re-Rendering:** Triggered on terminal resize (`TIOCGWINSZ`). Panning or expanding frames unmasks lateral columns and vertical context around the anchor rather than causing arbitrary line wrapping or layout reflow.
* **Hard RHS Truncation & Elision:** Wide code-blocks, Markdown tables, and Rust-rendered Mermaid diagrams hard-clip at the right-hand boundary with explicit elision marks (`…`, `»`). Vertical line coordinates remain completely stable; the viewport width merely dictates how much horizontal data is visible.
* **Framing System Paging:** Replaces smooth/parallax scrolling with discrete chunk advancement (`Space` forward, `b` backward), eliminating scroll drift, motion sickness, and GPU rendering overhead.

---

#### 3. Bounded Traversal & Out-of-Band Referencing

* **Local Silcrows ($\S$):** Sequential two-digit numeric anchors starting at `12` per document (`12`, `13`, `14`... up to `98`).
* **Strict Depth Ceiling:** Traversal is hard-bounded to **one level deep**, eliminating hyperlinking rabbit holes and preserving operator working memory.
* **Rubricated Clones:** Dereferencing a silcrow spawns a secondary terminal pane containing the referenced target, visually rubricating (contrasting/amber-highlighting) the cited passage while keeping the primary frame intact.
* **Registered Folder Callsigns:** Designated folders/documents carry unique mnemonic callsigns. These act as global silcrows for out-of-band (OOB) signaling (e.g., in team chats, remote shell pipes, or runbooks) with rubrication applied at the receiving user’s discretion.
* **High-Precision Root Search:** Seeded from the folder/repo root; filters strictly to minimize returned matches, preventing auditory and cognitive overload.

---

#### 4. The Spasm-Safe Input Protocol

* **Elimination of Doubled Targets:** Numeric pairs where digits match ($22, 33, 44, 55, 66, 77, 88$) are **permanently excluded** from being local document silcrows.
* **Spasm/Clonus Mitigation:**
* If an involuntary muscle spasm, tremor, or switch chatter causes an immediate double-strike on a key (e.g., `5` $\rightarrow$ `5`), it is impossible to trigger an unintended document jump, because `55` does not exist as an executable jump target.
* Rapid repeats under a temporal hardware/software debounce threshold ($<100\text{--}120\text{ ms}$) are discarded as chatter.


* **System Utility of Doubled Keys:** Because doubled pairs ($11, 22\dots88$) cannot jump documents, they are reserved strictly for system-level meta commands or modal chords that require an explicit secondary confirmation key or intentional sustain threshold.

---

### Key Takeaway on Accessibility Scope

The spasm/tremor edge case was the critical motor-control hurdle for rapid numeric ingress. By combining **consecutive numbering starting at 12**, **skipping double numbers**, and **temporal repeat filtering**, the two-stroke addressing model remains accessible to users with tremors, spasticity, or switch-pedal setups while maintaining zero-latency execution for operators using rapid keyboard entry.