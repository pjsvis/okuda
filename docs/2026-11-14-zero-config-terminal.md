## Architectural Brief: Deterministic Zero-Config Markdown Navigator

### 1. System Philosophy & Scope

This specification defines a single-binary, zero-configuration, zero-state Terminal User Interface (TUI) designed for modern GPU-accelerated terminal emulators (Ghostty, Alacritty, Kitty, WezTerm).

Rather than adapting to unpredictable host environment themes, shell configurations, or external dotfiles, the executable treats the terminal purely as a deterministic character-cell framebuffer. All visual parameters, perceptual color presets, and navigation geometries are compiled directly into the binary as immutable constants. Only terminal viewport dimensions (`SIGWINCH` / `TIOCGWINSZ`) are evaluated dynamically at runtime.



### 2. Visual Contract & Perceptual Calibration

Upon initialization, the application enters the alternate screen buffer (`\033[?1049h`), hides the native terminal cursor (`\033[?25l`), and injects Operating System Command (OSC) escape sequences to override the host terminal's foreground (`OSC 10`), background (`OSC 11`), and cursor (`OSC 12`) colors. On termination (`SIGINT`, `SIGTERM`, or explicit quit), the application emits `OSC 110`, `OSC 111`, `OSC 112`, restores the cursor (`\033[?25h`), and exits the alternate screen buffer (`\033[?1049l`).

#### Compiled Perceptual Presets (`1`–`9`)

The binary embeds nine calibrated `fg`/`bg`/cursor triplets spanning high-glare daylight, neutral ambient, and low-fatigue dark environments. Slot `2` serves as the compiled launch default.

| Slot | Preset Name | Background (`OSC 11`) | Foreground (`OSC 10`) | Accent / Cursor (`OSC 12`) | Target Environment |
| --- | --- | --- | --- | --- | --- |
| **1** | Pitch Stark | `#000000` | `#ffffff` | `#ffff00` | Direct sunlight / maximum contrast |
| **2** | Gruvbox Hard Dark *(Default)* | `#1d2021` | `#ebdbb2` | `#fabd2f` | Balanced warm dark baseline |
| **3** | Tokyo Night Hard | `#16161e` | `#c0caf5` | `#7aa2f7` | Cool high-acuity dark |
| **4** | Everforest Hard Dark | `#272e33` | `#d3c6aa` | `#e69875` | Low-glare muted dark |
| **5** | Amber Phosphor | `#141008` | `#ffb000` | `#ffd866` | Zero blue-light nocturnal work |
| **6** | Green Phosphor P31 | `#0b140d` | `#33ff66` | `#99ffbb` | High-contrast monochrome phosphor |
| **7** | Solarized High-Contrast | `#fdf6e3` | `#073642` | `#d33682` | Bright indoor / office lighting |
| **8** | Paper & Ink | `#f4f1ea` | `#2b2b2b` | `#b5482a` | Low-glare daylight reading |
| **9** | Modus Operandi | `#ffffff` | `#000000` | `#005a9c` | Uncompromising daylight legibility |

#### Live Calibration & Lock-In Loop

* **Trigger:** Pressing `=` (or `Ctrl+P`) enters **Calibration Overlay Mode** without obscuring the active Markdown list.
* **Preview (`1`–`9`):** Pressing any digit `1`–`9` immediately emits the corresponding `OSC 10/11/12` triplet, allowing live contrast verification against actual document text.
* **Lock (`0`):** Pressing `0` commits the active preset for the remainder of the process lifetime and returns focus to List Mode.

#### Theme-Kill Switch (Monochrome Mode)

* **Trigger:** Pressing `\` (or `Ctrl+M`) toggles `monochrome_mode`.
* **Behavior:** Suppresses all ANSI 16/256/TrueColor syntax or accent attributes while preserving the locked `OSC 10`/`11` foreground/background pair. Visual hierarchy is rendered exclusively via SGR typographic attributes: normal weight, dim (`\033[2m`), bold (`\033[1m`), underline (`\033[4m`), and reverse video (`\033[7m`) for active row focus and search-term highlights.



### 3. Coordinate Geometry: The 80-Actuator Paged Grid

Traditional line-by-line scrolling is eliminated in favor of direct $O(1)$ spatial addressing across paginated views.

* **Address Space:** Two-digit coordinates spanning `12` through `98`, excluding:
* Leading-zero numbers (`00`–`09`)
* `10`
* All identical-digit pairs (`11`, `22`, `33`, `44`, `55`, `66`, `77`, `88`, `99`)


* **Capacity:** Exactly **80 actuators per page** (`12`–`19`, `20`, `21`, `23`–`29`, ..., `90`–`98`).
* **Logical Binding:** Coordinates remain bound to the logical item slot on the current page rather than physical screen Y-coordinates, preventing coordinate drift when inline detail lines expand.
* **Viewport Budgeting:** Each page renders up to 80 single-line file entries, plus 2 dynamically injected detail lines beneath the currently focused item, plus 2 chrome lines (header/filter bar and status/buffer bar). If terminal height $H < 84$, the renderer dynamically caps the active page slice to $\min(80, H - 4)$ items while preserving the exact `12`–`98` actuator sequence from the top of the slice.



### 4. Interaction State Machine & Keymap

The input loop operates with **zero input timeouts**. Partial two-digit chords persist indefinitely until completed or explicitly canceled, eliminating race conditions or accidental triggers.

```
[LIST MODE] ──(TAB)──> [FILTER MODE]
     ▲                       │
     └──────(TAB/ENTER)──────┘
     │
     ├──(1..9)──> [PENDING CHORD: d_] ──(valid 2nd digit)──> Focus Row + Expand 2 Lines
     │                    │
     │                    └──(0 or ESC)──> Cancel Chord (return to LIST MODE)
     │
     ├──(ENTER)─> Execute / Read Focused Document
     └──(SPACE/B)─> Page Forward / Page Backward

```

#### Complete Keybinding Matrix

| Mode | Key / Input | Action |
| --- | --- | --- |
| **List Mode** | `1`–`9` (First Digit) | Enters `[PENDING CHORD]` state (`d_`); dims all rows not matching prefix `d` so valid second-digit targets stand out. |
| **List Mode** | `0`–`9` (Second Digit) | If `d1 + d2` forms a valid actuator in `12`–`98`, clears buffer, focuses the target row, and renders its **2 inline detail lines**. Invalid pairs (e.g., `d1 == d2` or `10`) are ignored without clearing the first digit. |
| **List Mode** | `0` (No Pending Chord) | Collapses the currently expanded 2-line preview and clears row focus. |
| **List Mode** | `ENTER` | Opens the currently focused Markdown document in the built-in full-screen pager (or `$PAGER` / `$EDITOR` fallback). |
| **List Mode** | `SPACE` / `B` | Advances to next page / returns to previous page; resets any pending chord or expanded preview. |
| **List Mode** | `TAB` | Switches input focus to **Filter Mode**. |
| **List Mode** | `=` / `\` | Enters **Calibration Overlay (`1`–`9`, `0` lock)** / Toggles **Monochrome Mode**. |
| **List Mode** | `Q` / `Ctrl+C` | Restores host terminal OSC defaults and exits cleanly. |
| **Filter Mode** | Printable ASCII / UTF-8 | Appends to live search query; filters file corpus by filename and body content, dynamically re-indexing matches into `12`–`98` actuators. |
| **Filter Mode** | `Backspace` | Deletes last character from filter query and updates live results. |
| **Filter Mode** | `TAB` or `ENTER` | Locks current filter and returns focus to **List Mode** for immediate two-digit actuation. |



### 5. Inline Two-Line Inspection Contract

Selecting an actuator (`12`–`98`) expands two indented detail lines directly beneath the selected row without leaving the index view:

* **When Filter Query is Active:** Displays the first two matching lines from the target Markdown file, with matched substrings highlighted (amber/accent in standard mode; reverse-video `\033[7m` in monochrome mode).
* **When Filter Query is Empty:** Displays the first H1/title line and the first non-empty body line of the Markdown file, enabling rapid structural triage across an unfiltered directory.



### 6. Implementation & Delivery Constraints

* **Target Languages:** Rust (using raw `termios` + direct ANSI/OSC `BufWriter` stdout, zero heavy TUI framework overhead) or Go (`golang.org/x/term`), compiled as a stripped static binary (`< 2 MB`).
* **Zero External Files:** No `~/.config`, no XDG paths, no SQLite/JSON caches, and no runtime environment variable sniffing (`NO_COLOR`, `LS_COLORS`, and `TERM` theme hints are intentionally ignored).
* **Tmux Passthrough Support:** When `$TMUX` is detected in the environment, `OSC 10/11/12` and `OSC 110/111/112` sequences are automatically wrapped in DCS passthrough envelopes (`\033Ptmux;\033...\033\\`).

