# **2026-11-22-discussion-software-bistability-macos-eink-mode.md**

**Status:** Implementation Runbook & Discussion Document  
**Scope:** Replicating E-Ink Cognitive Calm ("Software Bistability") on MacBook Air & Standard War-Room Displays  
**Related:** Edinburgh Protocol, Gloam Viewer, Keychron K0 Max Actuators, Cahier Architecture, Machine-Enforced Sociocracy (YOU NEED MES...)

# **1\. Current Posture: Why "Cool, Static Glass" Matters**

Dedicated e-ink monitors (Kaleido 3 / Carta 1300\) embody the physical ergonomics of the Edinburgh Protocol: bistable pigment capsules that move once on an explicit state transition and then sit completely still with zero refresh flicker, zero blue-light urgency, and paper-like reflective legibility.

When teams do not yet have dedicated e-ink panels at every workstation, we enforce Software Bistability on existing hardware (MacBook Air laptops, desktop LCD/OLED monitors, and conference projectors): stripping away cursor blink, UI animations, chromatic noise, and ambient screen glare so the display behaves like an ink-on-vellum Chapter House ledger rather than a 60 Hz notification engine.

# **2\. Physics & Ergonomics: E-Ink vs. Software Bistability**

| Dimension | Dedicated E-Ink Panel (Kaleido 3 / Carta 1300\) | Software Bistability on MacBook Air / LCD |
| :---- | :---- | :---- |
| **Frame Pacing & Motion** | 0 Hz when static; \~30 Hz during deliberate knob scrubbing or pane switches. | OS motion disabled; zero cursor blink; static ANSI/TUI rendering (`NO_COLOR=1`). |
| **Illumination & Glare** | Reflective ambient light; zero backlight flicker; matte paper surface. | Luminance matched to ambient room light (\~35-45% brightness) \+ warm Night Shift \+ optional matte PET screen protector. |
| **Chromatic Load** | Monochrome ink or muted pastel filter array. | System-level Greyscale filter \+ warm newsprint terminal palette (`#EAE6DF` / `#1C1B18`). |
| **Attention Signal** | Updates strictly on human `00-99` actuator input (`M1`/`M3`/`M4`). | Full-screen kiosk mode, hidden menu bar, Do Not Disturb locked on. |

# **3\. Step-by-Step Implementation: MacBook Air Setup Runbook**

## **Step 1: Native macOS Monochrome & Motion Kill**

Configure macOS Accessibility and Display settings to eliminate chromatic distractions, animations, and blinking cursors:

1. **Enable Hardware Greyscale:** Open System Settings \> Accessibility \> Display \> Color Filters, toggle Color Filters ON, and select Greyscale. *(Optional: Enable Accessibility Shortcuts so triple-clicking Touch ID toggles Greyscale on and off instantly.)*  
2. **Disable OS Animations & Blinking Cursors:** Open System Settings \> Accessibility \> Motion (or Display on older macOS releases) and enable:  
   * Reduce motion (eliminates window zoom and space-switching animations).  
   * Prefer non-blinking cursor (stops insertion-point blinking across system text fields).  
   * Auto-play animated images: OFF.  
3. **Match Ambient Paper Luminance:**  
   * Open System Settings \> Displays \> Night Shift, set schedule to Custom (`00:00` to `23:59`), and slide Color Temperature \~65% toward More Warm.  
   * Lower display brightness to \~35-45% so white backgrounds match the brightness of physical paper on the desk rather than glowing like a lamp.

## **Step 2: Terminal "Newsprint E-Ink" Profile (Zero Blink, Zero Glare)**

Create a dedicated `E-Ink Newsprint` terminal profile so Gloam, `td`, and CLI tools render like ink on warm paper:

* **Built-in Terminal.app:**  
  1. Press `Cmd + ,` \> Profiles \> duplicate Basic and rename it `E-Ink Newsprint`.  
  2. Set Background to warm vellum (`#EAE6DF`) and Text to deep charcoal ink (`#1C1B18`).  
  3. Under Cursor, select Block and uncheck Blink cursor.  
  4. Set font to SF Mono or JetBrains Mono at `14pt-15pt` with `1.25` line spacing.  
* **Ghostty / Alacritty / Kitty Configuration:**

```
# Newsprint E-Ink Theme (Bistable Terminal)
background = "EAE6DF"
foreground = "1C1B18"
cursor-color = "1C1B18"
cursor-style = "block"
cursor-style-blink = false
```

* **Silence CLI Spinners & ANSI Neon (`~/.zshrc`):**

```
export NO_COLOR=1
export TERM=xterm-mono
```

## **Step 3: Full-Screen Kiosk & War-Room Focus (`tmux`)**

Lock the viewport to the bounded two-pane Chapter House layout so nothing outside the active brief competes for attention:

1. **Native Full-Screen:** Press `Ctrl + Cmd + F` in the terminal and set System Settings \> Control Center \> Automatically hide and show the menu bar to Always.  
2. **Silence Notifications:** Enable Do Not Disturb in Control Center for the duration of the session.  
3. **Invariant Two-Pane `tmux` Layout:**

```
tmux set -g status off
tmux split-window -h
```

   Keep the primary brief and `00-99` decision gates on the left pane, and 1-level dereferenced evidence (`tmp/` probes and precedent ADRs) on the right pane.

## **Step 4: Physical Hardware & War-Room Projection Upgrades**

* **Matte Anti-Glare PET Film (\$15-\$30):** Applying a matte screen protector (e.g., Supershieldz or Mothca Matte) to a glossy MacBook Air eliminates specular reflections and gives the Retina panel a dry, paper-like surface texture.  
* **War-Room Wall Projection:** When projecting Gloam for group ratification with the wireless Keychron K0 Max, aim a standard projector at a matte wall—turning emissive pixels into passive, reflective light that mirrors a large-format e-ink status board.

# **4\. Verification Checklist (Pre-Session Gate)**

- [ ] System Greyscale active (`Accessibility > Display > Color Filters`).  
- [ ] OS motion reduced and system/terminal cursor blink disabled.  
- [ ] Screen luminance dimmed to match ambient room paper (\~35-45% \+ warm Night Shift).  
- [ ] `NO_COLOR=1` exported so agent and CLI output contains zero spinners or neon ANSI codes.  
- [ ] Terminal in full-screen kiosk mode with menu bar hidden, Do Not Disturb active, and `tmux` status bar hidden.

