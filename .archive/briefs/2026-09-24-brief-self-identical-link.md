---
type: Brief
callsign: BRF-SELF-IDENTICAL-LINK
date: 2026-09-24
---

# Brief: The self-identical link — when the label is the address, say it once

**Created:** 2026-09-24
**Status:** Done — shipped 2026-09-26 (565193d, `sameAddress` in `src/ansi.ts:37`): the label-is-the-address case renders once, in the destination paint; the four probe cases verified at the glass. Found done-but-open by the 2026-10-03 registry audit (td-a8f9d9).
**TD:** none needed — shipped with 565193d before the issue was filed.
**Lineage:** the operator, verbatim (2026-09-24): *"currently we seem to get the URL as text and destination in two different colours — should we just show the URL if they are the same."* The probe (`tmp/url-dedup-probe.md`, rendered 2026-09-24) confirmed the doubling on the four cases below.
**Extends:** the Pass C link contract (2026-08-24, `src/ansi.ts` + `src/palette.ts`): rose label + visible cyan-underlined URL, no OSC 8 — the URL *is* displayed. This brief adds one clause to that contract; nothing else in it moves.

## Objective

When the link label **is** the address, render the address **once**, in the destination paint. When the label names and the URL addresses (the designed case), the two-part paint stands unchanged.

## Why — measured, not asserted

`tmp/url-dedup-probe.md`, rendered 2026-09-24 through `bun src/cli.ts`:

| Case | Renders today | Verdict |
|---|---|---|
| Bare autolink `<https://example.com>` | the URL **twice** — orange label, green underlined twin | the label carries zero information; the doubling is decorated Stuff |
| `[https://example.com](https://example.com)` | doubled, two colours | same |
| `[https://example.com/](https://example.com)` (slash variant) | doubled — no comparison ever happens | same |
| `[the okuda repo](https://github.com/…)` | label + URL, two-part | **the designed case** — keep |

Bare autolinks are the common wild case: every `<https://…>` in a README doubles today, because the parser hands us text = href.

## Design — the contract, in one clause

**Dedup iff `sameAddress(label, href)`** — true when the label, ANSI-stripped, equals the href exactly (any link — a relative self-link `[foo](foo)` is the same zero-information case), **or** when both are scheme-shaped (`^scheme://`) and equal modulo trailing slashes. Stop there: no case-folding, no percent-decoding, no http/https equivalence — every rule beyond the root-slash makes semantic claims about URLs that will one day be wrong. The slash rule is safe *only because* both strings are addresses: even where `…/a/` and `…/a` are genuinely different resources, the click goes to the href regardless, and the label never said anything the href didn't.

**The destination paint survives.** The surviving string *is* the address; underline is the "this is live" mark; rose is for labels. A string painted rose beside a green twin of itself is the two-truths confusion that started this.

**Both modes, one predicate.** The dedup lives in `styler.link` (`src/ansi.ts`) — both the truecolor and none-mode branches — so the parity invariant (the two modes emit the same visible text, or line breaks differ) holds by construction: both emit the URL once.

**One stripper.** The label arrives inline-rendered; `sameAddress` strips via `width.ts`'s `stripANSI` — the existing escape classifier, not a new one (ADR-010's `stripForAnchor` lockstep lesson: never mint a second mirror of the SGR format while one exists).

**Unaffected, named:** noun-phrase labels (the authoring playbook's rule governs the case where a label *exists*); relative `.md` links and their silcrow badges (`annotateSource` positions at the occurrence end — the badge follows the deduped occurrence); `mailto:` (scheme regex requires `//` — a shortened label keeps the two-part paint); images; OSC 8 (the settled Pass C reversal, not reopened).

## Alternatives considered

| Alternative | Why rejected |
|---|---|
| Rose paint survives the dedup | The surviving string is the address, not a label; underline is the live mark |
| Normalize beyond trailing slash (case, percent-decode, scheme equivalence) | Over-clever — semantic claims about URLs, gamed by the next edge |
| Dedup only `http(s)://`-shaped labels | `[foo](foo)` — the relative self-link — is the same zero-information case; exact equality covers it by the same argument |
| Always show label only (glow-faithful) | Reverses the Pass C contract: the operator's terminal requires the URL visible |
| OSC-8 clickable, URL hidden | The settled 2026-08-24 reversal; not reopened |

## Scope

**In:** `src/ansi.ts` — `sameAddress` (exported, pure) + both `styler.link` branches + the interface doc comment; tests in `tests/ansi-palette.test.ts` (styler-level: dedup once, destination paint, none-mode parity) and `tests/render.test.ts` (document-level: bare autolink once, slash variant once, noun label two-part).

**Out:** OSC 8; `.md`-link painting; the authoring playbook; the vectors system (badges ride along unaffected).

## Preconditions

- [x] **P-1 — the doubling reproduces** on all four cases (`tmp/url-dedup-probe.md`). **Verified 2026-09-24.**
- [ ] **P-2 — the corpus spot-check**: no noun-phrase link regresses (the render test is the gate; corpus dogfood on the next read).

## Related

- Pass C link contract: `src/ansi.ts` `link()` impl + `src/palette.ts` `link-text`/`link-url` roles (converged 2026-08-24)
- `src/width.ts` `stripANSI` — the one stripper this reuses
- `playbooks/authoring-playbook.md` "Link labels are noun phrases" — the authoring guardrail for the two-part case
- `tmp/url-dedup-probe.md` — the four-case evidence
- ADR-010's lockstep lesson (`stripForAnchor`/`finalize`) — why no second ANSI stripper
- td: to create at wire time
