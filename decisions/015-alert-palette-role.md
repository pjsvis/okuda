---
type: ADR
callsign: ADR-ALERT-PALETTE-015
---

# Decision: An `alert` palette role for the fetch-state stamp's `failed` channel

**Date:** 2026-08-27
**Status:** Accepted

## Context

The fetch-state stamp (`briefs/2026-08-27-brief-fetch-state-stamp.md`,
td-a27b86) reports three fetch outcomes with glyph-only colouring:
`●` changed (amber), `○` same (muted), `✗` failed. The brief's LCARS
section names the constraint: `failed` **must not be confusable with
`changed`**, and `changed` already occupies the amber channel
(`strong` / `badge-bg` `#ffaa00` in the okuda preset, `#ffb86c` in
Dracula). Colouring `failed` as a third shade of orange collapses the
alarm into "more activity" — the opposite of the alarm semantics
B'Elanna ejecting the warp core on a `status: red` she can't tell from
a dead feed needs.

ADR-006 point 84 set the standing discipline: *"If a future diagram
channel needs a distinct hue, it must justify why the existing channels
fail first."* That discipline was scoped to diagram channels; this ADR
extends the same principle to the chrome layer. The justification
test is identical: name the role, show why every existing channel fails,
then add the role. The `failed` state runs that test and no existing
role passes it.

## The justification — why every existing channel fails

| Candidate role | Hex (okuda / dracula) | Why it fails for `failed` |
| --- | --- | --- |
| `strong` | `#dfa21a` / `#ffb86c` | The amber `changed` already lives here; reusing it makes `failed` read as "more activity," not "source lost" — the exact collision the brief exists to prevent |
| `badge-bg` | `#ffaa00` / `#ff79c6` | The footer badge's own background; colouring the stamp with it fuses the stamp into the badge (the brief's "contamination" — a coloured badge reads as the document's time, which the first temporal directive forbids) |
| `link` / `link-url` | `#66ddff` / `#00af5f`, `#4d9e7a` / `#8be9fd` | Sea-green / cyan — navigational channels; an alarm in sea-green reads as "go somewhere," the push-model signal the stamp refuses |
| `blockquote` | `#7788aa` / `#767676` | Gray — already the `same` / recedes register; `failed` would be indistinguishable from nominal |
| `heading` / `table-header` | `#99ccff` / `#bd93f9` | Blue / purple — structural channels; an alarm in structural colour reads as "a heading changed," not "the feed is gone" |
| `emphasis` | `#e0b45c` / `#f1fa8c` | Yellow — adjacent to amber on the wheel; at glyph size, confusable with `changed` under glare or a warm terminal profile |

No existing channel is red; no existing channel carries alarm
semantics; every existing channel either collides with `changed`,
fuses with the badge, or reads as a navigational/structural signal
rather than a safety-critical one. The non-confusability requirement
is unmet by the full existing set. **A new role is justified.**

## Decision

Add an `alert` role to the palette — a high-contrast red, the
safety-critical channel. Hex:

- **okuda preset:** `#ff5555`
- **dracula preset:** `#ff5555` (Dracula's own red — parity with `glow`,
  which renders red at this byte)

The two converge by **deliberate coincidence, not by contract.** Every
other role diverges by preset identity (okuda's sand/sea voice vs
Dracula's neon). `alert` is the one role where **alarm-universality
beats per-preset identity**: a red alarm reads as a red alarm on every
bridge, and B'Elanna's warp-core ejection does not change colour when
the bridge repaints. The stamp is chrome (like `badge-bg`), and chrome
may diverge by identity — but the *alarm* channel within chrome is
preset-independent on purpose. A future palette that wants its own red
may override `alert` via the user-override file; the contract requires
only that `alert` be red and distinct from every other role in that
palette.

## Scope of the change

- `src/palette.ts`: `Role` gains `"alert"`; `Palette = Record<Role,
  string>` widens by one; `DRACULA_PALETTE` gains `alert: "#ff5555"`.
- `src/palettes/okuda.json`: gains `"alert": "#ff5555"`.
- `loadPalette`'s override loop already iterates `key in merged`, so
  user overrides of `alert` work for free — no loader change.
- `src/ansi.ts`'s `Styler.role(name: keyof Palette, …)` is generic;
  `role("alert", "✗")` works without a new emitter. Under `none`
  (NO_COLOR / TERM=dumb), `role` returns the glyph plain — the `!`
  fallback carries the urgency the red carried, so the alarm survives
  the loss of colour (NO_COLOR parity invariant, ADR-006).
- No render-path change: `alert` is consumed only by the chrome layer
  (the stamp cell, when it lands). The renderer never emits `alert` for
  markdown content — alarm is a fetch-state channel, not a document
  channel. A markdown author cannot colour text `alert`.

## Alternatives Considered

| Alternative | Why Rejected |
| --- | --- |
| Colour `failed` as a third shade of amber (`strong`/`badge-bg`) | The collision the brief exists to prevent; `failed` reads as "more activity," not "source lost." Fails the non-confusability test in one move |
| Reuse `link` (sea-green) or `link-url` (cyan) for `failed` | Navigational channels; an alarm in sea-green reads as "go somewhere," the push-model signal the stamp explicitly refuses (permitting, not demanding) |
| Reuse `blockquote` (gray) for `failed` | Indistinguishable from `same`/recedes; the reader cannot tell "feed gone" from "all quiet" — the exact lie the substrate fix removed |
| Make `alert` per-preset divergent (okuda red ≠ dracula red) | Defensible by the per-preset precedent, but alarm-universality is the stronger principle here; divergence buys identity at the cost of a portable alarm semantic. The override file remains the escape valve for a palette that wants its own red |
| No colour for `failed`; glyph-only (`✗` uncoloured, muted) | The `✗` in muted reads as "closed," not "alarm"; the glyph shape alone does not carry urgency at a glance. Red is the channel the eye already knows for "this needs attention now" — stripping it weakens the one state that must draw the eye |
| Ship `failed` colouring as amber now, add `alert` later | A `failed` state that ships confusable with `changed` is a regression in alarm semantics, not a deferral; the substrate already reports `failed` honestly, so colouring it dishonestly is worse than not colouring it. The role must land with the chrome, or the chrome waits for the role |

## Consequences

**What became easier:**
- The stamp's `failed` state has a colour that cannot be confused with
  `changed`, `same`, or the badge — the non-confusability requirement
  is met by construction, not by tuning.
- A future chrome signal that needs an alarm channel (a transport
  error, a parse failure surfacing to the footer) reuses `alert`
  without a new role — the channel is named, not invented per feature.
- `role("alert", …)` is available to the styler wherever a fetch-state
  glyph is emitted; no special-case emitter.

**What became harder:**
- The palette contract widens by one role; every preset must define
  `alert` or the `Palette = Record<Role, string>` type is unsatisfied
  (caught at compile time — `okuda.json` and `DRACULA_PALETTE` both
  gain the key in this ADR's landing commit).
- The contract tests must assert `alert` byte-exactly in both presets
  (the parity invariant is per-role, not per-preset-wholesale).
- The discipline now covers chrome as well as diagrams: a future chrome
  channel needing a distinct hue runs the same justification test this
  ADR runs. One precedent, two surfaces.

**Constraints this imposes:**
- `alert` is red, in every preset, and distinct from every other role
  in that preset. A preset that violates this is buggy by contract.
- `alert` is never emitted by the markdown render path — it is a
  fetch-state / chrome channel only. Reusing it for document content
  (e.g. colouring an author's "WARNING" blockquote red) would be a
  category error: alarm is the viewer's voice, not the author's.
- The NO_COLOR parity invariant holds: `role("alert", "✗")` under
  `none` returns `✗` (or `!` per the brief's glyph fallback); the alarm
  degrades to glyph shape, not to a coloured cell. Plain output is the
  coloured output minus escapes.

## Related
- Brief: `briefs/2026-08-27-brief-fetch-state-stamp.md` (the stamp;
  its LCARS section names the non-confusability requirement this role
  satisfies)
- State map: `docs/2026-08-27-fetch-state-stamp-states.md` (the three
  states + nine transitions the chrome will consume `alert` against)
- Extends the discipline of: `decisions/006-glow-dark-palette.md`
  (point 84 — "a future channel needs a distinct hue, it must justify
  why the existing channels fail first"; here applied to the chrome
  layer)
- Supersedes: none (new role, no prior `alert` decision)
- td: `td-a27b86`