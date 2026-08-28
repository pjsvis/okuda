**Brief: `2026-08-28-brief-ssh-served-dynamic-markdown-portal.md**`

**Intent**
Provide a standalone, authenticated SSH portal that streams static repository documents and auto-refreshing operational dashboards rendered directly in Okuda's LCARS/Gloam terminal interface.

**Scope & Core Requirements**

* **SSH Daemon & Transport:**
* Embed a lightweight SSH daemon (e.g., via Bun / `ssh2`) listening on a dedicated port.


* Support anonymous public access or key-based authorization validated against GitHub user public keys.
* Direct incoming connections into an interactive PTY session running Okuda's browser loop (`src/tui.ts`).




* **Dynamic Document Polling Engine:**
* Implement an auto-refresh loop for flagged dynamic dashboard documents.
* **Cadence Invariant:** Polling rate is strictly fixed at **3 seconds** (0.33 Hz). Sub-second intervals are explicitly out of scope via the Foxtrot Oscar principle.


* Re-renders must use alternate screen buffer cursor-homing (`\x1b[H`) to ensure zero screen flicker during refresh cycles.


* Maintain active scroll-line anchors across ticks using bounded anchor fallback logic (`decisions/010-bounded-anchor-proportional-fallback.md`).




* **Layout & Terminal Lifecycle:**
* Bind SSH `window-change` events directly to Okuda's width and wrapping engine (`src/width.ts`, `src/wrap.ts`) to reflow on client resize without ANSI leakage.


* Consume keyboard events for navigation, manual refresh triggers, document switching, and palette cycling (`src/palette.ts`).





**Non-Goals**

* No shell access, command evaluation, or remote execution on the host.
* No high-frequency streaming, sub-second polling, or event-log streaming (`tail -f` modes); producers must pre-aggregate telemetry before writing.
* No write access or remote file modification.

**Acceptance Criteria**

* Connecting via `ssh -p <port> <host>` opens an interactive Okuda viewer.


* Dynamic status documents automatically refresh state every 3 seconds without viewport tearing, scroll reset, or noticeable flicker.


* SIGWINCH / terminal window resizes immediately trigger clean layout recomputation.


* Pressing `q` or `Ctrl+C` cleanly closes the SSH channel and tears down the session.