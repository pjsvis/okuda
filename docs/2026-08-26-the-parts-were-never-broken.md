# The parts were never broken

*2026-08-26. Lessons from the launcher session — one browser-less file
picker became a debugging education. The porch doc covers the zapper;
the census covers the palette; this covers the composition.*

## The finding, stated once

Every hard bug this session had the same structure: **three working
parts, one unagreed contract.** The wheel scrolled (correct), the
terminal translated (correct), the reader parsed (correct) — and the
experience was broken, because nobody had agreed who speaks which arrow
dialect, whose config owns the preview, or which direction the list is
displayed. Composition doesn't fail on broken parts; it fails on
undocumented assumptions between them.

## The lessons

**1. Ask which layer translates the input — and what its fallback is.**
The wheel's five incarnations (list-scroll, window-drag, synthesized
arrows, preview churn, home) were the same momentum stream falling
through routing layers, each with a "helpful" fallback that re-routed
it. Terminals never let an input die. The kill only worked when issued
at the layer that owns translation before any app exists. *Don't ask
which flag silences it here; ask which layer translates it, then audit
its fallbacks.*

**2. "Which channel is the complaint in?"** Three misdiagnoses, one
lesson: the user's report arrives through one channel (what the eye
saw) and the instrument reads another. "Reverse alpha" was display
direction, not collation — my sort test verified a channel the user
wasn't complaining about. "Bold gold overshadows the heading" was true
at equal luminance, because census luminance × typographic weight =
perceived brightness. The numbers narrow the search; the human closes
it. Instrumented judgement, not instrument replacement — and before
theorising, ask what the *top* of their screen shows.

**3. Blast radius decides permission.** The wheel in the picker was
unanimously banned when a misfire re-ran preview processes (chaos);
welcomed home when a misfire costs one visible row (mild overshoot).
The cause never changed — momentum vs a short discrete list — only the
consequence did. Judge features by the worst thing a misfire can do,
not by the misfire itself.

**4. One verb, one policy.** The alt-scroll dance (off around the
picker, on around the reader, restore after) existed because the wheel
was good in one surface and bad in the other. When both surfaces wanted
the same verb (scroll), the dance collapsed to a single line: the wheel
scrolls whatever surface is active. Complexity should be proportional
to genuine disagreement between surfaces — no more.

**5. Ordered corpora want filters, not search engines.** fzf's fuzzy
rank assumes the list has no canonical order. ISO-date-prefixed files
*are* an order, so score-ranking was vandalism and `--exact
--tiebreak=index` (narrow in place) is the honest verb. The kicker: the
date-first naming convention made the violation *visible* — the prefix
is a built-in test oracle. Naming discipline paid back at QA time.

**6. Hermetic by default.** A global `FZF_DEFAULT_OPTS` silently
married a bat preview to our preview-less picker. In a composition,
every participant's ambient config is part of your program. The
launcher travels with `env FZF_DEFAULT_OPTS=` — a tool that inherits
invisible preferences isn't yours.

**7. Cheap-to-reverse beats correct.** The launcher's final virtue
isn't any setting — it's that every setting costs one line to flip,
with revert criteria written in the playbook next to the choice. The
destination isn't the right configuration; it's configurations cheap
enough that being wrong is survivable.

**8. The reader auditions the parser.** `decodeKey` handled one arrow
dialect for weeks; j/k masked the gap (single bytes have no dialects).
Dogfooding across two machines and an iPad found it — not comfort,
coverage. A new client is a test case you didn't write.

## The compression

Stuff into Things, the composition edition: the parts were never
broken; the *contracts between them* were Stuff. Naming them — in
playbooks, in briefs, in this file — is the Thing.
