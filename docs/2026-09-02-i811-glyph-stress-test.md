# The i811 stress test — glyphs, scripts, and the 80-column grid

> *"If an equation cannot be expressed on an 80-column character grid, it is
> probably over-parameterized."*

Provenance: distilled from a raw brainstorm paste (2026-08-31, rescued from
`docs/2026-09-30-i811-language-test.md` — future-dated, fence-unbalanced, and
doubled; the paste was decorated Stuff, the test vectors inside it are not).
The idea survives, tidied: **okuda has never been stressed outside Latin
single-width.** Everything below is a probe for the same question — does the
renderer hold the grid when the glyphs fight back?

## Probe 1 — scripts and BiDi

Eight invariant lines, one per script family. Each says the same thing in
its own register — direct instruction, no framework, pure text. The terminal
must not crash, must not reorder the RTL runs mid-line, and must keep the
vector labels `[NN]` reading left-to-right against right-to-left neighbours.

* **[11] SCOTS GAELIC** — *Chan eil feum air bathar-bog iom-fhillte; tha am
  facal sìmplidh gu leòr.* (Latin Extended-A)
* **[12] CLASSICAL GREEK** — *ὁ δὲ ἀνεξέταστος βίος βιωτὸς οὐ.* (Greek &
  Coptic)
* **[13] MANDARIN** — 意图明确，向量锁定。无需复杂框架，纯文本即是终极基质。
  (CJK — double-width against single-width neighbours on the same line)
* **[14] ARABIC** — التنفيذ المباشر دون أي تأخير أو تعقيد برمجي غير ضروري.
  (RTL + complex shaping, the BiDi stress)
* **[15] JAPANESE** — 【一号作戦】無駄なUIを排除し、テキストとベクトルだけで
  世界を統御する。(kana + kanji mix, CJK punctuation brackets)
* **[16] CYRILLIC** — Прямий наказ на склі. Немає місця для непотрібних
  абстракцій.
* **[17] UYGHUR** — تېكىست ۋە قۇرۇلما بىر گەۋدە. ھېچقانداق مۇرەككەپ كۆرۈنمە
  يۈزىنىڭ ھاجىتى يوق. (RTL Arabic script, distinct shaping — the second BiDi
  probe)
* **[18] SUMERIAN** — 𒀀 𒈾 𒂍 𒀀 𒈾 𒍢 𒅕 𒆠 𒉈 𒈠 — the Ea-nāṣir copper complaint,
  in cuneiform (U+12000 block, Plane 1). 3,800 years old and still a receipt.

The dispatch table the renderer must survive:

```text
VECTOR TARGET   SCRIPT SUBSTRATE                   SHAPING ENGINE
[11] Gàidhlig   Latin Extended-A                   Direct Bitmap
[12] Ἑλληνική   Greek & Coptic                     CoreText / Free
[13] 简体中文    CJK Unified Ideographs             GPU HarfBuzz
[14] العربية    Arabic Presentation Forms (RTL)    BiDi Line Engine
[15] 日本語      Hiragana / Katakana / Kanji        Mono-Spaced Grid
[18] 𒅴𒂠        Cuneiform (U+12000 – U+123FF)      Plane 1 Fallback
```

## Probe 2 — math on the grid

One line each; if it wraps, the test fails by its own standard.

* **Quantum / logic predicate:** `∀x ∈ 𝕊,  P(x) ⟹ ¬∃y s.t. Q(y) ∧ (y ⋈ x)`
* **Maxwell, curl form:** `∇ × 𝐄 = -∂𝐁/∂t  ∧  ∇ · 𝐁 = 0`
* **Shannon entropy:** `H(X) = - ∑ P(xᵢ) · log₂ P(xᵢ)   [i = 1 .. n]`
* **De Morgan + absorption:** `¬(A ∧ B) ≡ (¬A ∨ ¬B)  ∧  A ∨ (A ∧ B) ≡ A`

Multi-line character-cell equations (the paste's best work — equations as
okudagrams, not images):

```text
  1. DEFINITE INTEGRAL WITH STEP LIMITS:

         t₁
        ⌠
        ⎮  [ α · f(τ)² + β · ∇g(τ) ] dτ  ≥  Ω_crit
        ⌡
         t₀

  2. TENSOR COVARIANCE MATRIX (3×3):

        ⎡  σ_xx²    cov_xy   cov_xz  ⎤ ⎡ δx ⎤     ⎡ 0 ⎤
        ⎢  cov_yx   σ_yy²    cov_yz  ⎥ ⎢ δy ⎥  =  ⎢ 0 ⎥
        ⎣  cov_zx   cov_zy   σ_zz²   ⎦ ⎣ δz ⎦     ⎣ 0 ⎦
```

## Probe 3 — circuit gestalt

```text
  AND GATE                     OR GATE                      NOT GATE (INVERTER)
  ┌───────┐                    ┌───────┐
A ┤       │                  A ┤        ╲                 A ───►|▶o─── Q (¬A)
  │  AND  ├─ Q (A ∧ B)         │   OR    )─ Q (A ∨ B)
B ┤       │                  B ┤        ╱
  └───────┘                    └───────┘

  NAND GATE (UNIVERSAL)        XOR GATE (PARITY)            SR LATCH
  ┌───────┐                    ┌───────┐                  S ───┐   ┌───┐
A ┤       │                  A ┤ )     │                       └───┤NOR├─── Q ──┐
  │ NAND  ├──o Q (¬(A ∧ B))    │  )XOR   )─ Q (A ⊕ B)          ┌───┤   │        │
B ┤       │                  B ┤ )     │                   ┌───┼───└───┘        │
  └───────┘                    └───────┘                   │   │                │
                                                           │   └───┬───┐        │
                                                           │       │NOR├─── Q̄ ──┘
                                                           └─── R ─┤   │
                                                                   └───┘
```

## Probe 4 — the FSM truth table

The jump-key state machine, stated as hardware. Note the input alphabet:
`AMPER` is a state transition here — the vocabulary document and the logic
document agree.

```text
┌────────────┬────────────┬────────────────────────┬─────────────┬────────────┐
│ CURRENT S  │ INPUT (E)  │ BOOLEAN EQUATION       │ NEXT S'     │ OUTPUT (Ω) │
├────────────┼────────────┼────────────────────────┼─────────────┼────────────┤
│ 00 [IDLE]  │ 0          │ ¬S₁ ∧ ¬S₀ ∧ ¬E         │ 00 [IDLE]   │ 0 (SILENT) │
│ 00 [IDLE]  │ 1 (AMPER)  │ ¬S₁ ∧ ¬S₀ ∧  E         │ 01 [LISTEN] │ 1 (ACK)    │
│ 01 [LISTEN]│ 0 (TIMEOUT)│ ¬S₁ ∧  S₀ ∧ ¬E         │ 00 [IDLE]   │ 0 (RESET)  │
│ 01 [LISTEN]│ 1 (VECTOR) │ ¬S₁ ∧  S₀ ∧  E         │ 10 [DISP]   │ 1 (LOCKED) │
│ 10 [DISP]  │ X (KEY_u)  │  S₁ ∧ ¬S₀ ∧  U         │ 00 [IDLE]   │ 0 (UNWIND) │
│ 10 [DISP]  │ 1 (COMMIT) │  S₁ ∧ ¬S₀ ∧  E         │ 11 [ACTU]   │ 1 (STRK)   │
│ 11 [ACTU]  │ X (DONE)   │  S₁ ∧  S₀              │ 00 [IDLE]   │ 0 (FLUSH)  │
└────────────┴────────────┴────────────────────────┴─────────────┴────────────┘
```

## What this would prove, and what it costs

The paste claimed "verified across UTF-8 terminal pipeline, zero dependencies
added" — no evidence accompanied the claim, and Hume's Razor applies. What is
actually true: okuda's render path has only ever been exercised in Latin
single-width. The open questions, in ascending order of pain:

1. **Width** — does the word-wrapper count CJK double-width cells correctly,
   or does it wrap early and leave ragged right edges?
2. **BiDi** — okuda does no BiDi reordering; RTL lines render in logical
   order, which most terminals then display in visual order. Does the
   result read, or does the bracket paint and padding fight the terminal?
3. **Plane 1** — does the code-agnostic width function know cuneiform is
   wide? (The East Asian Width table says ambiguous; terminals disagree.)
4. **Fences** — the paste itself had 19 fence markers, an odd number. The
   first failure of this test was in the paste, not the renderer. That is
   the finding worth keeping: the fixture must be verified before the
   renderer is accused.

Candidate brief material: **BRF-GLYPH-STRESS** — probe doc + whatever
width/BiDi fixes fall out. Small to start (one doc, render it, observe),
then scoping follows the evidence.
