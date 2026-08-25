# Brief: Gloam — the TUI Footer Signature

**Date:** 2026-08-23
**Status:** Open (unparked 2026-08-24; TUI control plane in flight — `briefs/2026-08-23-brief-okuda-tui-control-plane.md`, td-52db41)
**Gated on:** Okuda's TUI mode (unparked — the control plane is being implemented; the footer ships with it)

## What

When Okuda grows a TUI with a status bar (Glow shows "Glow" in the bottom-right), Okuda signs itself **Gloam** in the same position. Four letters, bottom-right, muted.

```
                                ...Gloam
```

## Why the name

* **Scots provenance.** *Gloaming* is Scots for twilight — "roamin' in the gloamin'" is Harry Lauder. A Scots-dusk word as the signature of a viewer built under the Edinburgh Protocol is the same thread the whole project pulls from.
* **A nod, not a parody.** Glow → Gloam: both light-words, one replaces the other. Close enough to read as a respectful reference to the incumbent; far enough to be its own word with its own texture (dusk, dimming, the in-between). It rhymes with the replaced without being the replaced.
* **A footer, not a product name.** Okuda is the binary (Michael Okuda, LCARS, the design philosophy). Gloam is the screen's quiet signature — the place Glow signs itself. Two names for two roles: the engine is Okuda, the screen is Gloam. A footer is the one place obscurity is a feature — the audience is terminal-native, and a signature that sends you to a dictionary is better than one that explains itself.

## Scope when unparked

* Footer text in the TUI status bar, bottom-right, muted (`#6e6a86` / Muted palette role).
* No second binary, no subcommand, no separate brand. Gloam is a 4-letter flourish in one render path, not a product surface.
* Visible only in the TUI; the streaming renderer (`okuda <file>`, `okuda <file> --watch`) stays footer-free — it prints the document and exits.

## Out of scope

* The TUI itself (a full Bubble Tea-style file tree, scroll, mouse). That's a future brief's call.
* Any Gloam branding beyond the footer. The moment "Gloam" becomes a second product name, a subcommand, or a meeting, it's benchmaxxing the signature instead of the screen.

## Why it's parked

The TUI is out of scope (brief 002 explicitly defers it; brief 003 implements the streaming renderer + `--watch`, not a status bar). A footer is a TUI concern; without a TUI there is no bottom-right to sign. This brief captures the name and the rationale so a future session doesn't re-derive it from scratch — the idea is legitimate, the step is not yet reached, and both are worth recording.
