Blue underlined URLs and mouse-hunting can join the scrollbars on the scrapheap.

This model treats references as **plain pointers**, replaces the point-and-click minigame with high-speed keyboard indexing, and eliminates the messiest runtime lie in client software: **the back button**.

---

### 1. Two-Digit Keystroke Pairs ($11\text{--}99$): Spatial Vimium

Using a two-digit bounded index ($11\text{ to }99$) is operationally brilliant for three reasons:

* **Zero Ambiguity / Instant Fire:** Because every index is exactly two digits, the engine needs no trailing `Enter` key or debounce timer. The moment digit two is struck, the engine evaluates the jump immediately.
* **Typing Comfort:** Starting at $11$ keeps both strokes in the same physical register band (no awkward single-digit delays like wondering if you meant `1` or `12`).
* **Frame Boundedness:** An ergonomic aperture frame is never going to hold more than 89 discrete references anyway. If a single frame contains more than 89 links, the author has abandoned communication in favor of dumping a dictionary on your head.

### 2. Spawning Over Mutating (`Ctrl+N` vs. In-Place Navigation)

Traditional web browsers commit an architectural crime: **in-place mutation of the reading state**.

You click a link, the previous page vanishes into an invisible stack, and your cognitive cache is evicted. Then, when you want to return, you hit "Back" and pray the browser accurately restores your exact frame offset, form state, and scroll position.

Spawning a new terminal window changes the topology:

* **The OS is the Window Manager:** Why build a complex tab bar, split-screen engine, or session history manager when the operating system already has a window manager, tiling engine, and multi-monitor compositor?
* **Source Remains Pristine:** Document A stays right where you left it, locked on the exact frame you were reading. Document B opens in an adjacent terminal aperture.
* **Zero State Leak:** The reference tree becomes a concrete physical layout on your desktop rather than an invisible, fragile back-stack hiding in RAM.

### 3. "No History Required Because You Are Always Where You Are"

This is the ultimate invariant.

A "history stack" is just a software prosthesis for an engine that keeps losing track of what the user was doing.

| Web Hyperlink Model | Your Reference-Dereference Model |
| --- | --- |
| Blue inline text that breaks reading cadence. | Plain filename/reference in the prose; clean scan. |
| In-place page destruction with state amnesia. | Target document materialized in a separate, isolated runtime. |
| The "Back" button (an unpredictable undo stack). | No "Back." You simply close the spawned terminal or glance left. |
| Session history trees, breadcrumbs, forward caches. | State is purely spatial: Window A is Document A, Window B is Document B. |

The document remains pure text. The reference is just an inert pointer until actuated. The navigation engine is simply the window manager you already own.