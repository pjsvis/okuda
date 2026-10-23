# Brief: Omarchy Shared Cognition Agent

**Date:** 2026-10-23 **Status:** Open

## Context

Omarchy provides a modern tiling environment and dynamic wallpaper plugins but maintains a zero-discovery baseline that treats user onboarding as a hazing ritual. Users face an actuator soup of unmapped modifier keys and blank voids without knowing the machine's state or native capabilities. This brief establishes the intent to replace the dead wallpaper with a rendered shared-cognition projection surface and an explicit, queryable designation interface.

## Objective

Implement a shared-cognition wallpaper projection and a zero-friction capability query endpoint so that users and agents instantly understand the machine's active actuator grammar upon boot.

## Evidence

* Zero out-of-the-box discovery mechanisms exist in standard Omarchy distributions; users must inspect raw config files (`sxhkdrc`, `hyprland.conf`) to find keybindings.

* Current wallpapers consume rendering cycles purely for aesthetics (e.g., motion loops) without conveying system topology or state.

## Scope

**In:**

* A rendering script that generates a live Markdown/diagram manifest of active keybindings and hardware state directly onto the desktop wallpaper canvas.

* A native command-line and prompt-bar endpoint (`omarchy-state --query`) that outputs the system's designation and active actuator capabilities.

* Precondition validation checks for required rendering and wallpaper integration dependencies.

**Out:**

* Full graphical configuration UI panels (settings menus).

* Dynamic real-time OS performance telemetry graphs (CPU/RAM monitors) beyond core actuator grammar mapping.

## Preconditions

* \[ \] Verify Hyprland or equivalent window manager environment is active and supports root-layer canvas manipulation or backdrop widget embedding.

* \[ \] Verify markdown rendering libraries (`glow` or equivalent terminal/canvas renderer) are available in the local execution path.

## Work Plan

1. \[ \] Create the state-inspection script to parse active keybinding maps into a structured capability manifest.

2. \[ \] Build the wallpaper projection generator that compiles the manifest into a crisp, readable markdown diagram canvas.

3. \[ \] Implement the `omarchy-state --query` endpoint for instant agent/user designation lookup.

4. \[ \] Wire the projection renderer into the Omarchy session initialization routine.

## Acceptance Criteria

* Executing `omarchy-state --query` returns a structured manifest of available actuators and system designation within 200ms.

* The desktop backdrop renders the live capability manifest and actuator grammar map without requiring manual user intervention on boot.

* All acceptance checks pass by command verification rather than subjective visual inspection.

## Notes

Avoid ambiguous wording or hidden dependencies. Keep the wallpaper projection crisp and free of extraneous clutter to ensure immediate comprehension for first-time users or incoming agents.