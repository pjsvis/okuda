---
type: Brief
callsign: BRF-NECKBEARD-FZF
---

### Playbook: Hardening `fzf` for Gloam

> **Superseded** by `playbooks/gloam-launcher-playbook.md` (2026-08-27):
> "Written without the okuda context, defaulting to pattern-matching
> development. The preview pane it re-proposes is retired (with a
> documented casualty list); the `GLOAM_FZF_OPTS` env layer it invents
> is redundant (`env FZF_DEFAULT_OPTS=` already hermetics the picker);
> the pointer/marker/border chrome it adds benchmaxxes a bounded
> namespace; the clipboard grab is a different tool's verb. The one real
> signal — key handling — landed as verb-grammar parity: `Ctrl-U`/`Ctrl-D`
> rebound to page-up/down so they no longer contradict Gloam's
> half-page keys, `esc:cancel` for clear/done, `Ctrl-W` kept as the
> word-clear. Retired, not actioned."

---
When embedding `fzf` as an interactive document browser, relying on stock defaults guarantees user churn. By default, an accidental `Esc` destroys session state, queries get stuck, and raw terminal abort signals bubble up to your application layer.

The objective is to make `fzf` behave like an integrated document reader without requiring every user to manually hack their shell environment.

---

### Step 1: Encapsulate the Runtime Flags (Don't Trust User Dotfiles)

Never rely on the user having `FZF_DEFAULT_OPTS` set. Inject the standard runtime configuration directly into your wrapper script or Go/Rust binary spawn call.

```bash
#!/usr/bin/env bash
# gloam-finder: Wrapper to launch fzf with hardened interactive semantics

export GLOAM_FZF_OPTS="
  --layout=reverse
  --border=rounded
  --prompt='Gloam > '
  --pointer='◆'
  --marker='▶'
  --info=inline-right
  --tabstop=2
  --bind='esc:cancel'
  --bind='ctrl-u:clear-query'
  --bind='ctrl-y:execute-silent(printf %s {} | pbcopy 2>/dev/null || printf %s {} | xclip -sel c 2>/dev/null)'
  --bind='ctrl-/:toggle-preview'
  --preview='gloam render {}'
  --preview-window='right:60%:wrap'
"

# Prioritize ripgrep or fd if available, fallback to find
if command -v rg >/dev/null 2>&1; then
  FILE_CMD='rg --files --hidden --glob "!.git"'
elif command -v fd >/dev/null 2>&1; then
  FILE_CMD='fd --type f --hidden --exclude .git'
else
  FILE_CMD='find . -type f -not -path "*/.*"'
fi

eval "$FILE_CMD" | fzf ${GLOAM_FZF_OPTS} "$@"

```

---

### Step 2: Critical Bind Mappings for Document Browsing

| Keybinding | Action | Why It Matters in Gloam |
| --- | --- | --- |
| `esc:cancel` | Clear query / Exit | First press clears the search buffer; second press exits. Prevents accidental app crashes. |
| `ctrl-u:clear-query` | Atomic clear | Instant readline-style wipe without killing the process. |
| `ctrl-/:toggle-preview` | Toggle preview pane | Essential for laptop screens where a persistent 60% Markdown render causes layout wrapping issues. |
| `ctrl-y:execute-silent(...)` | Copy file path | Grabs the path to the system clipboard without terminating the viewer. |
| `alt-j / alt-k` (or `ctrl-d / ctrl-u`) | `preview-down / preview-up` | Lets users scroll the rendered document pane without switching focus. |

To add preview scrolling directly to your setup:

```bash
--bind='alt-j:preview-down,alt-k:preview-up,alt-d:preview-page-down,alt-u:preview-page-up'

```

---

### Step 3: Deployment & User Onboarding

1. **Ship sane defaults out-of-the-box:** Set these flags in your internal launcher so fresh installs "just work."
2. **Support custom overrides:** Allow a `GLOAM_FZF_OPTS_EXTRA` environment variable or read a `~/.config/gloam/fzf_opts` file so power users can append custom keybindings without modifying the core launcher.
3. **Handle Exit Codes Gracefully:** An `fzf` exit code of `130` (Interrupted / `Ctrl+C`) or `1` (No match / `Esc`) must return cleanly to the parent shell or TUI without printing stack traces or terminal clutter.

---

### The Opinion

Relying on end users to configure their own `FZF_DEFAULT_OPTS` to make your tool usable is an anti-pattern. Unix purity argues that tools should remain thin CLI shims; operational reality dictates that if hitting `Esc` drops a user back to a naked prompt while they were halfway through reading a document, they won't blame `fzf`—they will blame **Gloam**.

Ship the hardened interactive bindings as hardcoded defaults inside Gloam's runtime layer, expose a config escape hatch for users who want to remap keys, and treat `fzf` as an embedded UI engine rather than a raw shell pipe.