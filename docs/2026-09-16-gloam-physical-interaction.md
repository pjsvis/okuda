This document captures the physical interaction primitives, keymaps, and acoustic ergonomics of the blind notetaker and screen-reader operator, formalizing how these mechanics integrate into GLoam and the Okuda projection surface.

---

# GLoam Architecture Discussion Document

**Document Class:** `explainers/`

**Call-Sign:** `EXP-019`

**Topic:** Ergonomic Primitives, Braille Chords, NATO Phonics, and Shared Projection Surfaces

---

## 1. Ergonomic Foundation: Screen Reader Keys & Braille Chording

Blind operators do not point and click; they traverse documents using discrete tactile actuators. Two primary hardware profiles dominate: standard mechanical QWERTY keyboards and 8-key refreshable Braille displays.

### The QWERTY Screen Reader Modifiers (NVDA, JAWS, VoiceOver)

In screen reader workflows, a designated modifier key transforms the entire keyboard into a navigation pad:

* **The Desktop Modifier:** `Insert` (or `Caps Lock`).
* **The Laptop Modifier:** `Caps Lock` held continuously.
* **The Screen-Reader "Review Cursor":** Allows walking text by character, word, line, or paragraph independently of the system insertion caret.

### Braille Cell Chording (Perkins Layout)

Dedicated notetakers use an 8-key Perkins-style layout. Keys are positioned under eight resting fingers with two central thumb actuators:

```
[ Dot 7 ] [ Dot 3 ] [ Dot 2 ] [ Dot 1 ]   [ Space / Thumb ]   [ Dot 4 ] [ Dot 5 ] [ Dot 6 ] [ Dot 8 ]
  (Pinky)   (Ring)   (Middle)  (Index)                             (Index)  (Middle)   (Ring)   (Pinky)

```

* **Dots 1–6:** Form the standard Braille cell (alphabet, numerals, contracted shorthand).
* **Dots 7 & 8:** Backspace / Left Delete (`Dot 7`) and Enter / Newline (`Dot 8`).
* **Space Bar:** Serves as the primary chord modifier (`Space + Dots`).

---

## 2. Common Actuators, Chords, and Operations

| Function | Standard QWERTY / Screen Reader | Perkins Braille Chord | GLoam Operational Behavior |
| --- | --- | --- | --- |
| **Next Heading** | `H` | `Space + H` (`Dots 1-2-5`) | Jumps forward to next Markdown `#` or `##` boundary |
| **Previous Heading** | `Shift + H` | `Space + Dot 7 + H` | Jumps backward to previous heading boundary |
| **Actuate Reference ($\S$)** | `Enter` (on silcrow anchor) | `Dot 8` (on silcrow anchor) | Latch to child document (State A $\rightarrow$ State B) |
| **Return to Trunk** | `Backspace` | `Dot 7` | Idempotent return to parent document (State B $\rightarrow$ State A) |
| **Speed Throttle Up** | `Caps + PageUp` or `Ctrl + Alt + Up` | `Space + Dots 3-4-5` | Increments speech synthesis by +50 wpm |
| **Speed Throttle Down** | `Caps + PageDown` or `Ctrl + Alt + Down` | `Space + Dots 1-2-6` | Decrements speech synthesis by -50 wpm |
| **Character Inspect** | `NumPad 2` or `Caps + Left/Right` | `Space + Dot 1` / `Dot 4` | Moves by single character; reads letter |
| **NATO Spell Mode** | Double-tap `NumPad 2` or `Caps + .` | `Space + Dots 1-3-4` | Re-speaks current character in NATO phonetic |
| **Room Broadcast** | User-defined hotkey (`F12` / `Caps + B`) | `Space + Dots 1-2` | Mirrors current buffer at 160 wpm over room speakers |

---

## 3. NATO Phonetic Mode: Acoustic Disambiguation

NATO phonetic mode is an essential precision tool, not a novelty. In high-speed text-to-speech (450+ wpm), consonants like *B, D, C, E, P, T, V, Z* blur together into identical acoustic bursts.

### Use Cases in GLoam

* **Call-Sign Verification:** When an operator resolves `DEC-042` vs `DEC-052`, or reads a hash prefix, a single keystroke announces: *"Delta-Echo-Charlie dash Zero-Four-Two"*.
* **Slug Dictation / Spell-and-Save:** During document creation, if the speech model records an ambiguous identifier, the operator chords NATO verification to ensure the target filename on disk is exact before committing.
* **Differentiating Critical Technical Values:** Disambiguating flags in playbooks (`-v` vs `-b`, `gRPC` vs `CRPC`).

---

## 4. The Okuda Glass/Wall Projection Surface

Projecting a blind operator's session onto a shared glass wall or screen bridges auditory navigation and spatial team comprehension.

### Synchronization Architecture

```
[ Blind Operator Terminal ]
        │
        │ Event Stream: { doc: "playbooks/failover.md", section: 2, offset: 412, wpm: 520 }
        ▼
[ Okuda Projection Renderer ]
        │
        ├─▶ 1. Steady Viewport: Retains stable visual paragraph context (no jerky scrolling)
        ├─▶ 2. Rubricated Reticle: Glowing highlight around the active sentence/heading
        ├─▶ 3. Silcrow Drawer: Visual side-car pops up when § reference is latched
        └─▶ 4. Call-Sign Breadcrumb: Shows active position in the Silo hierarchy

```

### Team Ergonomics

1. **Zero Auditory Clutter for the Room:** The operator keeps their synth at 500 wpm in their earpiece. The room remains quiet.
2. **Visual Ambient Tracking:** Sighted peers look at the glass surface and see exactly where the operator is working via the rubricated reticle.
3. **On-Demand Public Voice:** When a critical finding is reached, the operator hits `Broadcast` (`Space + Dots 1-2`). GLoam synthesizes that single paragraph over room speakers at conversational speed (160 wpm) while highlighting the phrase in bold red on the wall.

---

## 5. Practical Implementation Checklist for GLoam

* [ ] **Map the 2-Register Latch:** Bind `Enter` / `Dot 8` to step into the referenced $\S$ document, and `Backspace` / `Dot 7` to return to the parent document.
* [ ] **Expose the Speech Rate Throttle:** Provide single-stroke keybindings to increment/decrement synthesizer rate by steps of 50 wpm across the 150–600 wpm range.
* [ ] **Implement NATO Double-Tap:** Pressing the inspect key once reads the letter; a second tap within 300ms emits the NATO phonetic term.
* [ ] **Emit Projection Telemetry:** Broadcast a lightweight JSON event stream over local WebSocket or IPC containing current file path, active section heading, active line text, and latched reference status.