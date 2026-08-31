> **Reconciled 2026-08-31 (ADR-WIRE-FORMAT-026).** The visual verdict of
> this document — bracket-paint `[11]` in OKLCH accent, the BBS/lynx
> cadence — is **adopted as renderer paint direction**, credited in full:
> the precedents are real and the cadence argument holds. The parser
> proposals (`<!-- #NN -->`, `<!-- vrl:NN -->`) are **considered and
> declined**: the wire grammar stays `%%okuda-rhs:NN%%` — greppable,
> collision-free, installed — and paint is downstream of the wire, so the
> bracket cadence lands without a single producer migrating. This
> document remains the paint-side precedent record; the wire-side
> contract is ADR-026.

The concept of **Vector Resource Locators (VRL)**—numbered, flat, two-keystroke viewport jumps over text matrices—is not an untested fantasy; it is the hidden bedrock of the most durable, high-speed interface architectures in computing history.

Every time humanity needed sub-second, zero-distraction information retrieval under mission-critical constraints, it built an exact variation of this system.

---

### 1. The Direct Historical Twins

#### A. The CMU ZOG / KMS System (1972–1989) — *The True Ancestor*

The closest real-world twin to the Gloam/VRL model was **ZOG**, developed at Carnegie Mellon and deployed in the 1980s aboard the nuclear aircraft carrier **USS Carl Vinson** (as KMS, the Knowledge Management System).

* **The Architecture:** Information was stored in fixed-size text "frames" (equivalent to bounded markdown files).
* **The Navigation:** Every frame presented a strict list of numbered/single-key vectors. You did not scroll or use a mouse; you struck a key and jumped instantly to the next frame.
* **The Performance:** It indexed over 20,000 frames of carrier technical manuals, ship status, and damage control procedures. Navy sailors operated it at blistering speeds because selection was bounded, stateless, and instantaneous.

#### B. Teletext / Ceefax / Minitel (1974–2012)

Before the World Wide Web bloated into megabytes of JavaScript, the UK's **BBC Ceefax** and France's **Minitel** ran on pure number-dialed text matrices:

* **The 3-Digit Vector:** You held a remote or terminal and punched `302` for football scores or `101` for headline news.
* **The Medium:** High-contrast, emissive CRT phosphors on dark backgrounds with block-character diagrams. No URLs, no DNS lookups, no CSS reflow—just a numerical frame register that loaded off the broadcast signal.

#### C. Gopher Protocol (RFC 1436, 1991)

Before HTTP took over, **Gopher** organized the internet as hierarchical menus of typed vectors:

* Early terminal clients presented text menus where every line had a numeric index (`1`, `2`, `3`...).
* You didn't click hyperlinks; you keyed the integer selector, the client dereferenced the tab-delimited resource locator string, and painted the next document.

---

### 2. Modern Terminal & Power-User Lineage

#### A. Keyboard Link-Hint Overlays (Vimium, Tridactyl, Avy)

In modern web browsers and Emacs, tools like **Vimium** and **Avy** implement the exact ergonomic mechanic:

* You strike a lead key (`f`), and the engine overlays a two-letter or two-digit coordinate over every addressable link on the glass.
* Striking the two characters immediately fires the jump without mouse movement or cursor tracking.

#### B. Classic Text Browsers (`lynx -number_links`, `w3m`)

* Running `lynx -number_links` automatically parses HTML documents, strips the visual noise, and stamps every outgoing link with an inline sequential integer `[1]`, `[2]`, `[14]`.
* Keying the number jumps directly to the resource.

#### C. BBS ANSI Door Menus (1980s–1990s)

* Dial-up BBS systems (Major BBS, Renegade) ran on 80x25 character matrices where navigation was driven by two-character hotkey traps (`[11] Files`, `[12] Messages`, `[99] Logoff`). The terminal read the keypress directly from the hardware buffer with zero debounce latency.

---

### The Comparison: VRL vs. Modern Web

| Attribute | Modern Web URL / DOM | The ZOG / Ceefax / VRL Model |
| --- | --- | --- |
| **Addressing** | Opaque strings (`/api/v1/d8f2a...`) | Bounded registers (`[11 : 99]`) |
| **Input Latency** | Mouse hunt-and-click or tap | Two physical keypresses ($O(1)$) |
| **Cognitive Load** | Unbounded links scattered across canvas | Bounded vector list ($\le 10$ choices) |
| **Payload** | Megabytes of layout engines & scripts | Plain-text Markdown + comment offsets |
| **Medium Match** | Blinding white reflow panes | High-contrast character matrix on dark glass |

Whenever the world discarded the mouse, killed the latency, and put a human operator under real operational pressure, it arrived at the exact same conclusion: **numbered vectors on a character grid beat the web every single time.**

---

To keep the raw text pristine for humans, agents, and standard markdown tools, the markup syntax needs to satisfy three hard invariants:

1. **Standard Markdown Invariant:** Invisible in vanilla markdown viewers (pure HTML/Markdown comment).
2. **Deterministic Parser Invariant:** Trivial regex/lexer extraction with zero ambiguity.
3. **Ergonomic Rendering Invariant:** Clean visual distinction on the character matrix without turning into visual clutter.

---

### 1. The Source Markup Syntax

Use an explicit, namespaced Markdown comment directly preceding or wrapping the target link:

```markdown
<!-- vrl:11 target="2026-08-30-actuation-cycle-brief.md" -->
[The Actuation Cycle Brief](2026-08-30-actuation-cycle-brief.md)

```

*Or the even leaner inline directive:*

```markdown
[The Actuation Cycle Brief](2026-08-30-actuation-cycle-brief.md) <!-- #11 -->

```

* **Why this wins:**
* If viewed on GitHub, Obsidian, or a basic pager (`cat`/`less`), it renders as an ordinary, clean markdown link.
* The Gloam parser matches `<!--\s*#?([1-9][0-9])\s*-->` or `<!--\s*vrl:([1-9][0-9]).*?-->` in a single pass and populates the `register[11]` dispatch table.



---

### 2. The Rendered Visual Form on the Terminal Matrix

How should the terminal paint it?

| Candidate Format | Visual Example | Assessment |
| --- | --- | --- |
| `(#11)` or `(11)` | `(#11) Actuation Brief` | Too noisy; extra punctuation crowds the reading flow. |
| `#11` | `#11 Actuation Brief` | Conflicts visually with Markdown H1 `# Heading` syntax. |
| `11` (Bare text) | `11 Actuation Brief` | Ambiguous; looks like a numbered list item. |
| **`[11]` with OKLCH Accent** | **`[11] The Actuation Brief`** | **The Clear Winner.** |

---

### 3. The Recommended Rendering Treatment

Render the two digits in **bracketed, high-contrast accent color**, followed by an **OSC 8-wrapped text label**:

```text
\e[38;2;R;G;Bm[11]\e[0m \e]8;;silo://2026-08-30-actuation-cycle-brief.md\e\\The Actuation Cycle Brief\e]8;;\e\\

```

```
[ Visual Terminal Output ]
 [11]  The Actuation Cycle Brief
  │                 │
  │                 └── Clickable via OSC 8 (Standard Text Color)
  └──────────────────── High-Contrast Signal Color (OKLCH Accent)

```

* **Visual Cadence:** The square bracket `[11]` echoes both the classic link syntax of the terminal era (BBS, Lynx) and tactical telemetry dials.
* **Color Anchoring:** The brackets and number are rendered in a distinct high-contrast OKLCH signal hue (e.g., crisp amber or cold phosphor cyan), while the document title sits in standard foreground text.
* **Dual Operation:**
* Keyboard: Hit `1` then `1`.
* Mouse: Click anywhere on `The Actuation Cycle Brief`.
* Agent: Inspects the source comment and link target directly.



Clean in source, unmistakable on glass.