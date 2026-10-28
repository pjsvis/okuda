---
type: ADR
callsign: ADR-GLASS-INK-073
date: 2026-10-28
---

# Decision: The glass owns its ink — okuda owns only the relations between its roles

**Date:** 2026-10-28
**Status:** Accepted — closes the palette-brightness family, which has been open
since 2026-08-26 and whose two briefs disagree with each other
**Enforced by:** `tests/render.test.ts` — *body ink* — for the declaration point
(the default emits no escape: okuda asserts no absolute ink). The closure of the
family itself is `nothing — advice`, and that is said rather than implied.

## Context

Four proposals to change how bright the page is arrived inside two days:

1. **Attenuate dense prose per block**, keyed on wrapped line count (refused the
   same day; `ADR-BODY-INK-072`'s alternatives table).
2. **A global lightness scale** over the palette (`BRF-PALETTE-LIGHTNESS`,
   rejected 2026-10-14 on evidence that a global knob dims the already-quiet
   roles and destroys the census hierarchy).
3. **The same knot in OKLCH**, with a live `+`/`-` keybind (`BRF-OKLCH-TUNING`,
   pending since 2026-08-28, contradicting the brief above; the contradiction is
   recorded at `docs/2026-09-05-palette-page.md:21`).
4. **Set the terminal's defaults at runtime** via `OSC 10`/`OSC 11` (refused in
   conversation; the reasoning is now this record).

All four are the same request in different registers: *the page is too bright,
and the renderer should do something about it.* The principal's ruling closed
the family: **the foreground and background are not ours to adjust.** This
decision says why that is a boundary rather than a preference, so the next
proposal meets a test instead of a precedent.

## Decision

**Absolute luminance and contrast belong to the glass. okuda owns only the
relative hierarchy among its own roles.**

| what | owner | how it is set |
|---|---|---|
| the ground (background) | the terminal | `background`, `theme`, `background-opacity` |
| the default ink (foreground) | the terminal | `foreground`, `theme` |
| contrast adaptation | the terminal | `minimum-contrast`, `bold-color`, `faint-opacity`, `alpha-blending` |
| how bright a heading is *relative to* prose | okuda | the palette |
| how prose sits *relative to* the accents | okuda, **declared** | `body` in `~/.config/okuda/palette.json` |

`body` survives this decision and is not tuning: it ships **empty** (no ink, the
glass's foreground inherited), so okuda asserts no absolute colour. It exists so
a principal can state a *relation* — "my prose should be quieter than your
amber" — that no terminal setting can express, because the terminal cannot tell
prose from a heading from an emphasis: they are all its foreground.

**Both briefs are rejected and the family is closed.** `BRF-OKLCH-TUNING` is
rejected and archived; `BRF-PALETTE-LIGHTNESS` was already rejected. A future
proposal may reopen it only by showing that the terminal's own instruments cannot
reach the case — the gate `BRF-PALETTE-LIGHTNESS` named, unmet since August and
not met here either.

## The mechanism note, which is the reason not to reach for `minimum-contrast`

The suggestion that prompted this record was Ghostty's `minimum-contrast`. Read
against its reference (2026-10-28), it is **a floor, not a ceiling**: it compares
foreground against background and, when the ratio is *below* the setting, forces
the text to black or white; the default is `1`, which is no enforcement. It
cannot lower excessive contrast, and at any value above the default it can only
push text *brighter*. It is therefore not the instrument for "too bright" — the
instrument is `foreground`, or a different `theme`. The distinction matters
because a knob that reads as the answer and does the opposite costs a session to
diagnose; the maintainers' own advice on the option is *choose a theme with the
contrast you want*.

That advice is this decision, from the terminal's author rather than from us.

## Alternatives Considered

| Alternative | Why Rejected |
|---|---|
| `OSC 10`/`OSC 11` set at runtime, restored on exit | A mutation of the glass's state, from inside the byte stream. Defaults are per-window or per-terminal, so it re-grounds the sibling pane in this repo's own two-pane workflow; there is no "restore previous" (only `OSC 110`/`111`, which reset to *initial*); and an abnormal exit — `SIGKILL`, panic, tmux detach — leaves the glass altered after the viewer is gone. It also makes a pure renderer stateful for a cosmetic gain. |
| `OSC 11;?` query, then derive the ink | The honest version, and the only one that would make body ink *derived* rather than declared. Costs a read seam (async, needs a timeout, hostile to hermetic tests), fails wherever the ground is not a colour (image, per-pane theme, pipe with no tty), and would derive one role from a measured surface while every accent stays a fixed hex — rigour applied to a tenth of the page. Deferred, not refused. |
| `minimum-contrast` as the documented answer | A floor, not a ceiling (above). Documented here so the mistake is not repeated. |
| Reject the body role too, on the same ground | Over-correction. The terminal cannot express a *relation* between prose and okuda's accents; leaving `body` out does not remove the opinion, it just makes the opinion unauthorable. |
| Keep either brightness brief parked | A parked brief with a live contradiction is a decision deferred indefinitely. The keep-class is for refusals; a never-decided document is how the family stayed open for two months. |

## Consequences

**What became easier:**

- **One answer to "it's too bright".** Change the terminal, once, for every
  program; or set `body` in the palette override if the complaint is about the
  *relation* to okuda's accents rather than the page.
- **The family is closed by a test.** *Does the proposal change how bright the
  page is, or how the parts read against each other?* The first is the glass's.
  The second is ours, and must be authored.
- **The registry agrees with itself.** Two briefs that contradicted each other
  are now both rejected for one reason, and the palette page's "they disagree on
  ground truth" note has an answer.

**What became harder:**

- **A real ambient-light need now has no owner here.** Someone rendering by
  daylight will want a dimmer page and be told it is their terminal's business.
  That is the correct boundary and it is still a cost (`ADR-PROSE-MEASURE-071`
  accepted the same shape for width).
- **The next brightness proposal will arrive anyway**, because it arrives from a
  feeling rather than from the record. This ADR is what makes that arrival
  cheap: it is answered by one table, not re-argued.

**Constraints this imposes:**

- **No renderer-side absolute-luminance knob**: not a `--brightness`, not an
  `OKUDA_LIGHTNESS`, not a scale applied at `loadPalette`. If one is ever built
  it is because a *measured* failure shows the terminal cannot cover the case,
  and that measurement is the price of admission.
- **`body` stays empty by default**, and stays a constant per document. Its
  value is a declared relation, never derived from length, density or viewport
  (`ADR-BODY-INK-072`).
- **`OSC` emission remains refused.** okuda emits no OSC today — `src/wrap.ts`
  parses OSC 8 only to measure it and ignores anything else; `src/ansi.ts`
  refuses OSC 8 links on purpose. A device-state mutation would be the first,
  and it does not belong in a renderer that is a pure function of source, width
  and palette.

## Related

- `ADR-BODY-INK-072` — the declaration point this decision leaves standing, and
  its refused alternatives table, where proposal 1 above is recorded.
- `ADR-PANE-NOT-CANVAS-069` and `AGENTS.md` (*Scope Discipline*) — the three
  owners; the glass's configuration is the host's, and this is that rule applied
  to ink rather than width.
- `ADR-PROSE-MEASURE-071` — the same boundary one axis over, and the source of
  *a declaration, not a cap*.
- `docs/2026-09-05-palette-page.md` — the OKLCH analysis, which stays useful for
  tuning *relative* luminances within the palette; what it may no longer be used
  for is a page-level dial.
- Ghostty reference, `minimum-contrast` / `foreground` / `background` (read
  2026-10-28).
