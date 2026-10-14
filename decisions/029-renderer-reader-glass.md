---
type: ADR
callsign: ADR-RENDERER-READER-029
---

# Decision: Disambiguate the renderer, the reader, and the glass

**Date:** 2026-09-03
**Status:** Accepted — **amended 2026-10-14** (the fourth role: the composite is **the render**; `ADR-RETIRE-OKUDAGRAM-066`)

## Context

The scratchpad lexicon used "viewer" for the *software* ("the viewer
presents, it doesn't editorialise") and "reader" for the *human* ("the
reader who must search for the change"). Both words cross-wire:

- **"Viewer"** implies the human who views, but was used for the
  software. "The viewer uses the viewer to view documents" is the
  nonsense sentence the conflict produces.
- **"Reader"** was used for the human, but Glow (the upstream project)
  calls *itself* a reader — so "reader" has the same double-duty.

Three roles need three names: the human (views/reads), the software
(renders), the device (displays). English gives two verbs (view, read)
stretched across all three.

## Decision

**The renderer** is the software (okuda). **The reader** is the human.
**The terminal** / **the glass** is the device. Three roles, three
unambiguous nouns.

| Role | What it does | Term |
|---|---|---|
| The human | reads, forms opinions, decides | **the reader** |
| The software | renders markdown to bytes, fast | **okuda** / **the renderer** |
| The device | displays the bytes | **the terminal** / **the glass** |
| The composite | the bytes as laid out for this width | **the render** |

**Amendment, 2026-10-14** (`ADR-RETIRE-OKUDAGRAM-066`). This decision named
three roles and left the fourth unnamed — the *composite*, the bytes as laid out.
The gap was real, and a fan word ("okudagram") colonised it. It is now filled
from the same pattern the table already uses: the software **renders**, so its
output is **the render**, exactly as the human **reads** and the device is **the
glass**. One portion of a render is **a frame**; a drawing inside it is **a
diagram**. Three roles here, four now named, one referent each.

Where the scratchpad said "the viewer" meaning the software, it now
says **okuda** (the proper name) or **the renderer** (the role). Where
it said "the reader" meaning the human, that is unchanged — "reader" is
now unambiguous because the software no longer competes for the word.

The proper name (**okuda**) is preferred for the software in running
prose; the role name (**the renderer**) is used where the role, not the
instance, is the point (e.g., "a renderer that adds a settings panel has
an excuse"). **Gloam** is the launcher surface; **okuda** is the render
engine. The scratchpad is about the render engine, so "okuda" is the
right proper name there.

**"The CLI"** is an acceptable stopgap category word where the proper
name feels too specific and the role name too technical — but it is a
category, not a name, and should not be used where "okuda" or "the
renderer" would do.

## Alternatives Considered

| Alternative | Why Rejected |
|---|---|
| "The CLI" as the permanent term | A category, not a name. Disambiguates but doesn't identify. Like calling a car "the vehicle." |
| "The viewer" retained for software | Conflicts with the human sense; "the viewer uses the viewer" is nonsense. |
| "The reader" for software | Conflicts with Glow's self-description and with the human sense. |
| "The app" / "the tool" | Too generic; loses the rendering role. |

## Consequences

- The scratchpad is swept: "the viewer" → "okuda" / "the renderer"
  where it means the software; "the reader" retained where it means the
  human.
- Future prose uses the three-role vocabulary. The constitution
  (`system.md`) and AGENTS.md are unaffected — they already use "okuda"
  by name and "the agent" for the operator, which don't conflict.
- The vocabulary aligns with the three-concerns principle: the
  renderer is okuda's role; the reader is the human; the terminal is the
  host's. Three concerns, three owners, three names.

## Related

- `docs/2026-08-27-okudagram-scratchpad.md` — swept (the viewer →
  okuda/the renderer; the reader retained for the human)
- `decisions/018-retire-the-okw-term.md` — precedent: a naming policy
  recorded as an ADR and swept through the corpus
- `docs/2026-09-03-content-over-menu.md` — "okuda renders documents,
  not interfaces" (already uses the proper name correctly)
