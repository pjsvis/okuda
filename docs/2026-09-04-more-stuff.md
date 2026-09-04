# APERTURE(1) — System Manager's Manual

**NAME**

`aperture` — discrete stepped viewport for stream text and markdown

---

### SYNOPSIS

```bash
aperture [OPTIONS] [FILE]
cat FILE | aperture [OPTIONS]

```

---

### DESCRIPTION

`aperture` is a deterministic, non-paginated document viewport. It ingests an arbitrary stream of text or Markdown and frames it dynamically into the current terminal grid coordinates.

It rejects the skeuomorphic abstraction of pages, continuous vertical drift, and horizontal displacement. The active terminal window is treated as an aperture of fixed boundary $W \times H$. Content is packed into discrete frames up to natural syntactic boundaries (sentence, block, or section seams) and yielded to the user. Traversal occurs via single-step discrete transitions.

Navigation within `aperture` adheres strictly to the **Three Topological Invariants**:

1. At offset `0`, you are at the **beginning**.
2. At `EOF`, you are at the **end**.
3. Between these points, you are in the **middle**.

No progress meters, scrollbars, or percentage scrubbers are provided. If navigational signposts are required, they must be authored directly into the content stream.

---

### INVARIANTS & GEOMETRY

* **Width Constraint:** Document Width $= W - \epsilon$, where $W$ is the current terminal column count and $\epsilon$ is cell padding. The document possesses no intrinsic natural width. If content is too wide, the user expands the window.
* **No Horizontal Scroll:** Horizontal scrolling is treated as a hard failure mode. Under no circumstance shall `aperture` spawn a horizontal panning vector.
* **Stepped Frame Traversal:** Movement through the document is quantized. Advancing discards the expired frame and renders the next packed frame instantly without kinetic scrolling.

---

### REFERENCES AND DEREFERENCING

Inline hyperlink underlines and mouse-driven URL traversal are omitted. Local file references in the stream are assigned deterministic, two-digit indices in the range `11` to `99`.

When a document is framed, local reference targets do not expose interactive in-place mutations. The source document state remains invariant.

**To dereference a target:**

1. Press `Ctrl+N` to arm dereference mode.
2. Enter the two-digit numeric vector (e.g., `42`).

Upon receipt of the second digit, `aperture` evaluates the pointer immediately and spawns the target document in an isolated execution context. The parent frame remains intact at its current offset. There is no "Back" button; history is purely spatial.

---

### ENVIRONMENT & MULTIPLEXING

`aperture` implements zero internal windowing code, delegating layout entirely to the host environment:

* **Pattern 1: TMUX / Screen (Constrained & Mobile Displays)**
When run within an active `$TMUX` environment (e.g., remote SSH sessions or mobile terminal emulators), dereferencing via `Ctrl+N` issues a split or new-window instruction directly to the multiplexer socket. The user leverages native multiplexer primitives (such as zoom toggle `prefix + z`) to manage focus.
* **Pattern 2: Desktop Window Manager (Workstations)**
When run in a graphical workstation environment (e.g., under a tiling window manager), `aperture` delegates spawns to the local desktop launcher or terminal binary, materializing the new frame in a native sibling window.

---

### OPTIONS

| Flag | Long Option | Description |
| --- | --- | --- |
| `-p <CELLS>` | `--padding=<CELLS>` | Set internal margin padding $\epsilon$ in character cells. Defaults to `2`. |
| `-s` | `--break-sentence` | Snap frame packing boundaries to terminal punctuation (`.`, `!`, `?`) rather than paragraph blocks. |
| `-m <MODE>` | `--multiplexer=<MODE>` | Set reference spawning mechanism: `auto` (default), `tmux`, `split-h`, `split-v`, or `native`. |
| `-v` | `--version` | Print version and system invariant declarations, then exit. |
| `-h` | `--help` | Print minimal usage instructions and exit. |

---

### KEYBINDINGS

* **`Space`**, **`l`**, **`j`** — Step forward to the next frame.
* **`b`**, **`h`**, **`k`** — Step backward to the previous frame.
* **`Ctrl+N`** — Arm two-digit reference selector.
* **`11`–`99**` — Dereference armed pointer index (immediately spawns target document).
* **`q`** — Close the active aperture and return control to the parent shell.

---

### EXIT STATUS

* **`0`** — Successful traversal or clean user exit via `q`.
* **`1`** — Stream read error or invalid argument.
* **`2`** — Dereference failure (target file non-existent or permission denied).