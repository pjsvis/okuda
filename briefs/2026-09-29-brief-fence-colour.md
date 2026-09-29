---
type: Brief
callsign: BRF-FENCE-COLOUR
date: 2026-09-29
---

# Brief: Fence colour — chroma at the mermaid seam, the terminal's palette as the theme

**Created:** 2026-09-29
**Status:** Done — shipped 2026-09-29, amended same-day (style monokai pinned
— see Amendment); td-dfa601: 444 tests green, `just check` green;
the showcase's own `typescript` fence now renders coloured — dogfood as acceptance)

> **Amendment (2026-09-29, same day).** The What's "no styles" clause was
> over-broad: a chroma style piped through `terminal16` is the emphasis
> *map* — which token class lands in which of the 16 slots — not the hue
> palette, which is the thing the rule banned and terminal16 never emits.
> The default style (swapoff) was measured out: it quantises identifiers —
> the bulk of every fence — to ANSI-white 37, gray on every dark terminal,
> so most of the code rendered dimmer than the prose around it. The
> operator's eye caught it ("the code colouring is visible but a bit
> muted"); the probe over styles settled it. `--style monokai` is pinned:
> cyan keywords, yellow function names (chroma classifies `Name.Function`
> separately), full-white identifiers, dim comments — the classic contrast
> structure. Dracula was tried and refuted (pastels quantise to
> yellow-everything). Nothing else in this brief moves; tests and smoke
> re-pinned to the monokai bytes.
**TD:** td-dfa601 (epic; P1 the fences, P2 the whole files)
**Branch:** feat/fence-colour
**Lineage:** the operator, verbatim: *"is there a basic code fence coloriser
for the terminal that we could use for code — not one of those themed things,
just a simple code colouring thing"*, then: *"the coloured code blocks make
the whole thing irresistable to techies"*, and: *"does this mean we could
render code files as well"*. The answer to the third is yes, and it is P2.
**Grounding:** the mermaid seam (`interceptMermaid` + token pre-pass — the
async-spawn pattern that exists because Bun.markdown handlers are sync),
ADR-004 / td-b81597 (fence elision — `elideToWidth`, `…` at the cut),
`DEPENDENCIES.md` (the external-binary pattern this joins).

## What

Coloured code fences, with one rule doing most of the work:

**The tool classifies tokens; the terminal supplies the hues.** The only
acceptable output is 16-colour ANSI class codes (SGR 31/32/33…), so the
terminal's own palette is the theme — a TrueColor Kool-Aid palette is a
themed thing wearing a hat, and the operator has already vetoed the hat.
No styles, no config, no 256-colour, no HTML hex. The reader's terminal
decides what a keyword looks like; okuda only says *this is one*.

## Why chroma

| Candidate | Verdict |
|---|---|
| **chroma** (Go) | Single static binary, stdin→stdout, zero chrome, no config files, no env vars. `--formatter terminal16` emits exactly the class codes above. Hugo's highlighter — lexer coverage is not a concern. |
| `bat` (installed) | A pager cosplaying a coloriser: TrueColor Monokai by default, gutter, config detection (`BAT_THEME`, `BAT_CONFIG_PATH`) — environment-dependent bytes. Can be tamed (`--plain --theme=ansi`) but its nature fights back. |
| GNU `source-highlight` | The most literally themeless (`-f esc`, 8 colours) — honest, crusty, fine. Runner-up. |
| `pygmentize` (installed) | Style-centric; a Python interpreter per fence is heavy for the job. |

`mermaid-to-md` set the pattern this follows: an external binary at a
spawned seam, version pinned in `DEPENDENCIES.md`, ANSI out, renderer
ignorant of the domain. chroma is the same weight class — one static Go
binary, no runtime, no state.

## How (P1 — the fences)

The handlers are sync; a spawned coloriser is not. Mermaid already solved
this: a pre-pass intercepts fences and leaves tokens. The same shape:

1. **Intercept.** Tagged, non-mermaid fences are captured pre-render;
   content + lexer piped to chroma (`--formatter terminal16`,
   `--lexer <tag>`), ANSI output stashed against the fence, token left
   for the `code()` handler — which already emits RAW-protected,
   never-wrapped, elided lines.
2. **Elision is ANSI-aware.** `elideToWidth` measures the cut column
   ignoring SGR sequences — a coloured line elides at the same column
   its uncoloured twin does. (The wrap/elide machinery already handles
   ANSI in `wrapANSI`; the fence path reuses that discipline.)
3. **Untagged fences: byte-identical to today.** No tag, no colour —
   deterministic over clever. Same for **unknown tags**: no lexer
   guessing, no chroma fallback detection; the fence renders as today.
4. **Absent binary: degrade, don't die.** No chroma on the box → the
   fence renders exactly as today, uncoloured. A viewer that loses its
   code because an optional coloriser is missing is a chip pan fire.
   (The distinction from mermaid is deliberate: mermaid fences without
   the binary have nothing to show; code fences always have the code.)
5. **`DEPENDENCIES.md`.** Entry + verified date + platforms note — the
   linux x64 static binary rides with `build-linux` and the reading
   room's provisioning without a second thought.

## How (P2 — whole files)

A code file is a one-fence document. The pipeline after P1 already
knows what to do with a fence; the only new thing is normalisation at
the source boundary: recognise a non-markdown input by extension, wrap
its content as a single tagged fence, hand it to the same render. No
text is invented or merged — the file *is* the fence, so this is input
normalisation, not compositing, and "we don't care where the text
comes from" is the constitution already saying yes.

- **The lexer choice** rides chroma's alias table via the extension-as-tag
  (`--filename` was the brief's letter; the implementation uses one path for
  fences and files alike — `--lexer py` resolves `py` whether it arrived as a
  fence tag or a `.py` extension — same ownership property: the map stays
  chroma's).
- **The fork, recorded:** renderer-level normalisation (recommended —
  one function, deterministic, testable, every consumer gets it) vs
  launcher-level wrapping (`{ echo '```py'; cat f; }` — keeps the
  renderer pure but taxes every consumer forever). The fork lives here
  in the brief, not an ADR: nothing recorded is reversed, and the
  origin doc's out-of-scope list (CommonMark, TUIs, HTML) never named
  input classes. If the scope line wants redrawing on paper, it lands
  with the implementation commit.
- **The consumers appear on their own:** the gloam picker can offer
  `src/` files (its `rg` source already indexes them), and the SSH
  reading room can serve source, not just docs — BRF-SSH-HOST's room
  gets a second shelf without asking.

## Acceptance criteria

- [x] A tagged `python` fence renders with chroma's terminal16 bytes,
      pinned exactly in tests.
- [x] An untagged fence is byte-identical to today's render.
- [x] An unknown language tag renders as untagged — deterministic, no
      detection.
- [x] With chroma absent from the box, every fence renders as today and
      no error escapes to the reader.
- [x] A coloured line longer than the width elides at the same column
      as its uncoloured twin (ANSI invisible to the ruler).
- [x] P2: `okuda src/render.ts` renders as one coloured fence — the
      dogfood case and the smoke test in one.
- [x] `just check` green; DEPENDENCIES.md entry verified with a date.

## Out of scope

- **Inline code.** Backticks in prose are body text; colouring them is
  a different job with different constraints. One job per brief.
- **Themes, styles, 256/TrueColor.** The rule above is the rule.
- **Language detection.** Tags and extensions only — both are claims,
  not guesses.
- **Mermaid fences.** Their path is their own (ADR-004 lineage).

## References

- `src/render.ts` — `code()` (RAW-protected, elided, never wrapped),
  `interceptMermaid` (the pre-pass + token pattern), `elideToWidth`
- ADR-004, td-b81597 — the fence-elision decision and primitive
- `DEPENDENCIES.md` — the external-binary pattern chroma joins
- BRF-SSH-HOST — the reading room that gains a source shelf
- `docs/2026-08-20-origin-doc.md` — scope: what okuda renders
