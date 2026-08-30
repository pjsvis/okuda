# Fetch-state stamp — the state machine

**Date:** 2026-08-27
**Kind:** design map.
**Brief:** `briefs/2026-08-27-brief-fetch-state-stamp.md` (td-a27b86)
**Substrate landed:** `src/tui.ts` — `gateFetch`, `renderEqual`, the
discriminated-union read path (commit `dbf1d17`).
**Colour landed:** ADR-015 — the `alert` role (`#ff5555`, commit `b8e1a0a`).

Three states, nine transitions, two gates.

---

## The three states

The stamp reports *our observation*: when we last looked, and what we
found. Three values, one enum, no overlap.

| State | Glyph | Colour | Meaning | Content viewport |
| --- | --- | --- | --- | --- |
| `changed` | `●` | amber | fetch ok, rendered content differs from previous | repaint |
| `same` | `○` | muted | fetch ok, rendered content identical (the gate held) | no repaint |
| `failed` | `✗` | red (`alert`, ADR-015) | fetch threw or source gone | no repaint — retain last-known-good |

The word "checked" is load-bearing and the glyph is the only state-coloured
element — the timestamp and filename stay muted (provenance, not alarm).
NO_COLOR degrades to `*` / `.` / `!`.

---

## The diagram

States labelled with their decided glyph. The glyph is the only
state-coloured element in the footer; the colour is an attribute of
that character, not a second signal.

```mermaid
stateDiagram-v2
    [*] --> Changed●: first ok
    [*] --> Failed✗: first fail
    Changed● --> Same○: ok equal
    Changed● --> Changed●: ok differs
    Changed● --> Failed✗: fail
    Same○ --> Changed●: ok differs
    Same○ --> Same○: ok equal
    Same○ --> Failed✗: fail
    Failed✗ --> Changed●: ok differs
    Failed✗ --> Same○: ok equal
    Failed✗ --> Failed✗: fail
```

Three nodes, every pair connected both ways, plus two self-loops per
node — a fully-connected graph where any state can reach any other.

> **Deprecated** in `b8e1a0a` (ADR-015): "pre-ADR-015 — states uncoloured,
> the `alert` role unjustified, the two-gate structure unmarked. The
> abstract graph before the identity landed; retired, not retained."

---

## Two gates

The content gate and the stamp gate are two gates, not one. Content
repaints on `changed` only; the footer (timestamp + glyph) repaints on
every fetch outcome — the brief's "set on every fetch." A single
boolean cannot express both, so the chrome layer repaints the footer
unconditionally on fetch and the viewport conditionally on `changed`.

| From | Trigger | To | Content | Footer |
| --- | --- | --- | --- | --- |
| `*` | first ok | `changed` | yes | yes |
| `*` | first fail | `failed` | yes (blank) | yes |
| `changed` | ok, equal | `same` | no | yes (`●`→`○`) |
| `changed` | ok, differs | `changed` | yes | yes |
| `changed` | fail | `failed` | no (retain) | yes (`●`→`✗`) |
| `same` | ok, differs | `changed` | yes | yes (`○`→`●`) |
| `same` | ok, equal | `same` | no | yes (time only) |
| `same` | fail | `failed` | no (retain) | yes (`○`→`✗`) |
| `failed` | ok, differs | `changed` | yes | yes (`✗`→`●`) |
| `failed` | ok, equal | `same` | no | yes (`✗`→`○`) |
| `failed` | fail | `failed` | no (retain) | yes (time only) |

Content repaints on 3 of 9; the footer repaints on all 9.

---

## Decisions

1. **Two gates — yes.** Footer repaints on every fetch outcome; content
   viewport repaints on `changed` only. The substrate's `gateFetch`
   boolean is the content gate; the chrome layer adds the footer
   repaint outside that gate.
2. **Recovery reads `same` — yes.** `failed → same` (source recovered,
   content unchanged to the last-known-good we retained) shows `✗` → `○`
   with no content motion. The recovery *is* the glyph transition;
   making it `changed` would conflate "the situation changed" with "the
   content changed," and the stamp reports content state.
3. **`alert` palette role — yes.** Landed ADR-015 (`#ff5555`, red, both
   presets — alarm-universality over per-preset identity; chrome-only,
   never emitted for markdown content).

### Non-decisions (noted, no action)

- **Initial vs subsequent `changed`** share `●` — "content arrived" and
  "content moved" carry no different action for the reader.
- **`same` is absorbing** — no decay, no "stale" state; staleness is
  inferred from the timestamp, not the glyph (the "permitting, not
  demanding" property).
- **No loading state** — rejected; the stamp is pull-model, a heartbeat
  would be push.
- **`failed` initial vs subsequent** share `✗`; the retain-on-failure
  branch handles both via `prev ?? []`.

---

## Related

- Brief: `briefs/2026-08-27-brief-fetch-state-stamp.md`
- Substrate: `src/tui.ts` — `gateFetch`, `renderEqual`, `Fetch`, `FetchState`
- Colour: `decisions/015-alert-palette-role.md`
- Sibling: `briefs/2026-08-26-brief-tui-live-documents.md` (fs.watch feeds
  the same gate)
- td: `td-a27b86`