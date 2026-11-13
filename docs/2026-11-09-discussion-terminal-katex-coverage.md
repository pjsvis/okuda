# Discussion: terminal KaTeX coverage — what the character grid can hold

**Date:** 2026-11-09
**Status:** Discussion — no decisions here. The decisions live in `decisions/`.
**Related:** `ADR-MATH-GRAMMAR-076`, `BRF-FONT-COVERAGE`, `BRF-SYMBOL-PLAIN`,
`docs/2026-11-04-font-coverage.md`, `docs/style-guide.md` (Maths section)

## The question

A restricted grammar for science symbols already exists in this silo: a
closed transliteration table (`MATH_GLYPHS`, 38 rows), digit-only scripts
(`MATH_SUP`/`MATH_SUB`), a fraction flattening that restores grouping, and an
all-or-nothing gate that leaves a span literal when the table runs out
(`ADR-MATH-GRAMMAR-076`). The table grows on corpus evidence, never on
anticipation, and the constraint that governs growth is stated: *a script may
be prettified only when the mapping is total* — digits have every form, letters
do not, so `_{max}` stays as written.

The speculative question is: **how much of KaTeX could this grammar support in a
terminal, if the terminal's character set were the only constraint?** Not "should
we build a KaTeX renderer" — that question is closed (`ADR-MATH-GRAMMAR-076`,
Alternatives: KaTeX rejected as a JS engine, a font set, and a layout
dependency). The question is narrower and prior to any implementation: what is
the ceiling the character grid imposes, and where does it break?

The answer matters because the silo's maths grammar is append-only on evidence,
and the evidence is measured against what terminals can draw. If the ceiling is
already reached, the table's growth policy is correct as-is. If it is not — if
there are codepoints the grid can hold and the table has not yet admitted — then
the growth policy has room to move before the architecture needs to.

## The ceiling, measured against Unicode

The terminal character grid is one cell per codepoint, no exceptions. Combining
marks were the one case that broke this (`\vec` → U+20D7, repaired 2026-11-04 to
ISO 80000-2 bold weight), and the repair was architectural rather than
cosmetic: no emitted codepoint is a combining mark, so width arithmetic and the
terminal's painting agree by construction (`docs/2026-11-04-font-coverage.md`).
That boundary is load-bearing for everything below.

### What the grid holds completely

**Superscript and subscript digits — total.** U+2070, U+00B9, U+00B2–U+00B3,
U+2074–U+2079 cover 0–9 for superscripts; U+2080–U+2089 cover 0–9 for
subscripts. The table already maps all of these (`MATH_SUP`, `MATH_SUB`), plus
U+207B (⁻) for negative superscripts. Every digit form measures one column.
This is done.

**Superscript operators — total.** U+207A (⁺), U+207B (⁻), U+207C (⁼),
U+207D (⁽), U+207E (⁾) exist for superscript +, −, =, (, ). Subscript operators
are the same: U+208A (₊), U+208B (₋), U+208C (₌), U+208D (₎), U+208E (₎). The
table does not map these today, and there is no evidence in the corpus for
them. They are available if a span needs them.

**Greek — total for the basic alphabet.** U+0391–U+03A9 (uppercase),
U+03B1–U+03C9 (lowercase) are present in every measured face, and the table
carries the subset the corpus uses: α, Δ, ε, π, μ, σ, ρ, τ, θ, Ω, ζ. The rest
(β, γ, η, ι, κ, λ, ν, ξ, ο, φ, χ, ψ, and the uppercase forms Γ, Θ, Λ, Ξ, Π, Σ,
Φ, Ψ) are one evidence line each — the codepoints are unproblematic.

**Operators and relations — broadly covered.** The table carries ≠, ≤, ≥, ≈, ±,
×, ·, ∈, ∑, ∝, ∼, ≫, →, ⟶, °. Unicode supplies more that the table does not yet
admit: ∉ (U+2209), ∋ (U+220B), ∪ (U+222A), ∩ (U+2229), ⊂ (U+2282), ⊃ (U+2283),
⊆ (U+2286), ⊇ (U+2287), ⊕ (U+2295), ⊖ (U+2296), ⊗ (U+2297), ∂ (U+2202), ∇
(U+2207), ∆ (U+2206), ∅ (U+2205), ∀ (U+2200), ∃ (U+2203). Each is a single
cell, each is in Noto Sans Mono and DejaVu Sans Mono, and each arrives on
evidence.

**Arrows — partial.** →, ⟶ are in the table. Unicode has ← (U+2190), ↔ (U+2194),
⇒ (U+21D2), ⇐ (U+21D0), ⇔ (U+21D4), ↑ (U+2191), ↓ (U+2193). Same situation:
available, not yet admitted.

**The degree sign — done.** `^{\circ}` → °, landed 2026-10-30.

### What the grid holds partially

**Superscript Latin letters — irregular.** U+1D2C–U+1D5C (modifier letters)
supply a partial uppercase alphabet in superscript form: ᴬ ᴮ ᴰ ᴱ ᴳ ᴴ ᴵ ᴶ ᴷ ᴸ ᴹ
ᴺ ᴼ ᴾ ᴿ ᵀ ᵁ ⱽ ᵂ. That is 19 of 26 — no C, F, Q, S, X, Y, Z. Lowercase
superscripts are worse: ᵃ ᵇ ᶜ ᵈ ᵉ ᶠ ᵍ ʰ ⁱ ʲ ᵏ ˡ ᵐ ⁿ ᵒ ᵖ ʳ ˢ ᵗ ᵘ ᵛ ʷ ˣ ʸ ᶻ exist
across U+1D41–U+1D5B and U+02B0–U+02B8, but they are modifier letters drawn from
different Unicode blocks with inconsistent vertical metrics — some sit high,
some sit at the baseline, and a terminal font that draws them at all does so
unreliably.

The existing policy is correct: a partial alphabet works once and fails on the
fourth equation, and a failure there reads as a rendering bug rather than as a
policy (`ADR-MATH-GRAMMAR-076`, *A script may be prettified only when the
mapping is total*). The policy should not change for letters. The gap is in the
policy's own terms: the superscript digit table is total because every digit has
a form, and the letter table is refused because not every letter does. There is
no third option — the Unicode Consortium did not provide one.

**Subscript Latin letters — worse.** U+2090–U+209C supply 13 lowercase
subscripts: ₐ ₑ ₕ ᵢ ⱼ ₖ ₗ ₘ ₙ ₒ ₚ ᵣ ₛ ₜ ᵤ ᵥ ₓ. Missing: b, c, d, f, g, q, w,
y, z. There are no subscript uppercase letters in Unicode at all. The policy's
refusal is correct here too, and stronger: the gap is larger.

**Math Alphanumeric Symbols (U+1D400–U+1D7FF) — not viable.** This is the range
for bold/italic/script/fraktur math letters: 𝐱, 𝒙, 𝑥, 𝔁. KaTeX uses these for
`\mathbf`, `\mathit`, `\mathcal`, `\mathfrak`. Noto Sans Mono has partial
coverage; every terminal monospace face measured has none. JuliaMono covers 64
of the 64 emitted codepoints today, but the emitted set does not include this
range, and for good reason: a codepoint that renders as tofu on seven of eight
measured faces is not a transliteration, it is a defect. This range should not
be admitted.

### What the grid cannot hold

These are the things the character grid was never designed for, and no font
stack fixes them:

**Fractions.** A fraction needs two rows; a cell has one. The flattening
(`\frac{X}{Y}` → `X/Y` with grouping restored) is the correct linearisation and
is already landed. The alternative — stacking with box-drawing — was measured
and rejected: `eqn` → `groff` emits overstrike soup rather than stacked layout
(`ADR-MATH-GRAMMAR-076`, Alternatives). The two-dimensional door is the
`mermaid` fence, and there is only one of them.

**Square roots spanning content.** `\sqrt{x+1}` needs an overline bar over
arbitrary-width content. The standalone √ (U+221A) is a single-cell glyph and
could be admitted on evidence; the spanning form cannot. The style guide
already documents the linear alternative: `√(x+1)` with brackets.

**Stacked limits.** `\sum_{n=0}^{\infty}` needs n=0 below and ∞ above. The ∑
glyph exists and is in the table; the limit placement does not. The style
guide's linear form — `∑ n=0..inf x_i` — is the authoring answer, not a
renderer fallback.

**Matrices, case splits, aligned systems.** Two-dimensional structures. The
`mermaid` fence is the door, and the ADR is explicit: *"a notation is admissible
if it linearises to text; if it needs two dimensions it is a diagram and takes
the existing door."*

**Accents over variables.** `\bar{x}`, `\hat{x}` — combining diacritics
(U+0304, U+0302) exist but terminal rendering is unreliable. The `\vec` repair
established the precedent: when a combining mark cannot be borrowed from a
fallback, the renderer emits weight (ISO 80000-2) or declines. `\dot{m}` → ṁ
(U+0307) is the one exception, kept because U+0307 is present in every measured
face. A new accent would need the same measurement before admission.

**Spacing control.** `\,`, `\;`, `\quad` — no fine-grained horizontal control in
a character grid. The whitespace rule (`stripMathSpace`) already handles this:
gaps are kept beside relations and operators, dropped everywhere else, and
never invented. This is the grid's constraint, and the rule is correct for it.

## The assessment

For a restricted grammar focused on **basic scientific notation** — the physics
and chemistry a document like `docs/2026-10-30-server-blades-in-space.md`
actually uses — the character grid's ceiling is **well above where the table
sits today**. The table has 38 rows; the codepoints the grid can hold and the
table has not yet admitted include:

- The remaining Greek alphabet (15 lowercase, 10 uppercase — one evidence line
  each)
- Set-theoretic operators (∉ ∋ ∪ ∩ ⊂ ⊃ ⊆ ⊇ ⊕ ⊖ ⊗ ∅ ∀ ∃)
- Calculus symbols (∂ ∇ ∆)
- Additional arrows (← ↔ ⇒ ⇐ ⇔ ↑ ↓)
- Superscript/subscript operators (⁺ ⁻ ⁼ ⁽ ⁾ and subscript forms)

Each of these is a single-cell codepoint present in the faces the silo
measures, and each arrives on the same terms every existing row did: a tracked
span that needs it, ranked on whether that span carries a relation
(`ADR-MATH-GRAMMAR-076`, *Vocabulary arrives on evidence, and is ranked on
relations*).

The ceiling the grid **cannot** cross is structural, not lexical:

- Two-dimensional notation (fractions, stacked limits, matrices) — the grid's
  one-cell, one-row constraint. Already answered: linearise or take the
  `mermaid` door.
- Alphabetic scripts (superscript/subscript letters) — Unicode's partial
  alphabets. Already answered: the totality policy, which is correct and should
  not change.
- Math Alphanumeric Symbols (bold/italic/script/fraktur letters) — font
  coverage. Already answered: not viable on measured faces.
- Combining accents — positioning reliability. Already answered by the `\vec`
  precedent: weight or decline.

## What this means for the growth policy

The policy in `ADR-MATH-GRAMMAR-076` is:

1. *One dimension → the table. Two dimensions → the door that already exists.*
2. *Vocabulary arrives on evidence, and is ranked on relations.*
3. *A script may be prettified only when the mapping is total.*

The ceiling analysis confirms all three. The first and third are architectural —
they describe what the grid can hold, and the grid's constraints have not
changed. The second is a growth policy, and the ceiling says it has room to
operate: there are single-cell codepoints the grid can hold and the table has
not yet admitted, and each one is admissible on the same terms as every existing
row.

The one observation worth recording is about the **second constraint's
ranking**. The corpus today is one physics-heavy document and the style guide's
demos. A document that uses set theory, calculus, or logic notation would
unblock different commands — ∂, ∇, ∈, ⊆ — and the ranking on relations would
admit them in a different order than a second orbital-habitat document would.
The policy handles this correctly (evidence is evidence, regardless of domain),
but it is worth noting that the table's current shape is a reflection of one
domain, and the ceiling is domain-independent.

## Open questions

- **Is the superscript operator set worth admitting preemptively?** ⁺ ⁻ ⁼ ⁽ ⁾
  and their subscript forms are total over their domain (every operator has a
  form), every one is single-cell, and the corpus does not use them. The policy
  says evidence first — but the totality argument that admitted digits applies
  here too. Is the policy's evidence requirement a constraint on *when*, or on
  *whether*? (The ADR's own words: *"rows added in anticipation is the one the
  gate then honours wrongly"* — which suggests the answer is no, and the
  evidence requirement is the point, not the overhead.)

- **Does the font stack matter to this discussion?** The silo measures font
  coverage (`just fonts`) and ships a plain mode (`--symbols=plain`) for hosts
  whose faces are poor. The ceiling analysis above assumes a face in the
  measured range (DejaVu Sans Mono or better). For a face below that range
  (PT Mono at 36/64), the ceiling is lower — but the plain mode is the answer
  for that host, not a smaller table. Is this the right split, or should the
  table's growth policy consider the intersection across all measured faces
  rather than the primary?

- **Is there a domain the corpus should recruit?** The table's shape reflects
  physics. A chemistry document would surface different needs (subscript
  formulas, states of matter), a logic document would surface others (∀ ∃ ⊨),
  a probability document others (𝔼 𝔽 — which are in the non-viable range).
  The policy says evidence first, but evidence requires a document. Is there a
  document the silo should track to broaden the evidence base, or does the
  policy wait for one to arrive?

- **Should the style guide's Maths section document the ceiling?** Today it
  documents what renders and what to write instead. It does not document *why*
  the boundary is where it is — the grid's constraints, the totality policy,
  the font measurement. A reader who hits the boundary (a declined span) can
  infer the policy from the ADR, but the style guide is the author's guide, and
  the ADR is the architect's. Is the ceiling an authoring concern or an
  architectural one?
