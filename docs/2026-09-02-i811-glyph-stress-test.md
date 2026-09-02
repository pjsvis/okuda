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

## Probe 5 — the background question

Dogfood finding (2026-09-02, over SSH): every fenced probe on this page
painted a dark panel — the `okuda` preset's `code-background: #1a1530`,
the LCARS affordance — and against the terminal's own background it read
as a second background behind a perfectly adequate one. Ugly and
superfluous; the preset now emits none. But that is a *verdict*, not a
law — the colour tuning session (td-8ece4e, then td-b4bae8) should check
the background options once, properly: a dimmer register, a border-only
affordance, or a per-mode bg (fences vs tables vs diagrams), before we say
Foxtrot Oscar to backgrounds entirely. If no option beats the terminal's
own background, none survives.

## Probe 6 — the spicy tablets

A dogfood ruling from the operator: the Ea-nāṣir receipt is retired from
headline duty — the internet has had two hundred years of meme-time with it
and it is now the oldest hackneyed joke in the oldest medium. The corpus,
though, is genuinely, verifiably spicy, and the gag is structural: the stories
below are rendered exactly as they come down to us, and the translations are
withheld. You would have to know Sumerian to tell what happens. The scholars
who published these knew exactly what they were sitting on — the author of
the standard study of this corpus reports carrying it around in a
brown-paper bag.

One line each, renderable transliteration where the editions give it, deadpan
teaser otherwise:

* **Šu-Suen A 20** (ETCSL 2.4.4.1) —
  `kaš-a-ni-gen7 gal4-la-ni ze2-ba-am3` —
  a comparison is drawn between two things she has. The tavern-keeper is
  involved. Sweetness is mentioned.
* **Inanna-Dumuzi P, col. ii 24–27** (ETCSL 4.08.16) —
  `ma-a gal4-la-gu10 du6 du8-du8-a a ma-a-ra / ki-sikil-gen a-ba-a
  ur11-ru-a-bi / gal4-la-gu10 ki duru5 a ma-ra` —
  irrigation is discussed at length, and someone asks a question about
  who exactly is going to do the ploughing.
* **Šu-Suen B 9, 11** (ETCSL 2.4.4.2) —
  `mu-ti-in ag2 ze2-ze2-ba du5-mu-u8-AK / e2 ki-nu2-a lal3 hab2
  du11-ga-ba` —
  the speaker requests to perform certain unnamed sweet things, and
  describes a bedroom that has been made, somehow, moist.
* **Inanna-Dumuzi B1 35–56** (ETCSL 4.08.28) — a shepherd shows his sister a
  nature documentary, scene by scene, and explains what the animals are
  doing. The sister is slow to grasp the allegory.
* **Inanna and Šu-kale-tuda** (ETCSL 1.3.3) — a gardener, a sleeping goddess,
  a poplar tree; then the wells of the land fill with blood, three
  nationwide manhunts, and a sentence no storyteller since has bettered:
  you will die, but your name will live in songs.
* **Enlil and Ninlil** (ETCSL 1.2.1) — what the chief god did in the boat, the
  exile it earned him, the three disguises he wore to get back, and the
  four children who resulted.
* **Inanna and Enki** (ETCSL 1.3.1) — of the hundred-odd arts of civilization
  Enki hands over while drunk, exactly one needs no translation even in
  transliteration: the kissing of the phallus. Civilization, it turns out,
  has always had this on the list.

Fixture honesty, per this document's own rule (the fixture is verified before
the renderer is accused): the lines above are **transliteration** — sign
names in Latin, renders everywhere, and the honest quotable form of the
editions. Glyph-true cuneiform for these stories requires sign-form
conversion from the editions' transliterations (aBZL sign table, or
Cuneify) — a fixture-construction step for the brief, not a renderer
complaint.

## Probe 7 — constructed scripts, and the Klingon verdict

The operator asked for Klingon. The answer is no, and the reason is a better
story than the script would have been:

* **Klingon (pIqaD) is not in Unicode and likely never will be.** The Unicode
  Consortium rejected it in 1997 for lack of usage, again in 2016 despite
  evidence (a comic book, a Monopoly set, a legal brief — yes, really), and
  declined to reconsider in 2021. The blocker is Paramount's IP. It lives
  only in the Private Use Area (U+F8D0–U+F8FF, ConScript registry) behind
  fan fonts, and Noto refuses PUA outright.
* **What that means for okuda:** over a bare SSH session — the dogfood
  environment — PUA renders as tofu. A pIqaD line would probe the font
  installation, not the renderer. That is a false failure signal, the thing
  this document exists to prevent.
* **The tofu probe, optional negative control:** one deliberately PUA line,
  labelled *expected: empty boxes*. The only failure mode is a crash. Good
  experimental design has a negative control; this would be ours.

The scripts that *are* commonly available and still carry flair — Unicode
native, present in system terminal fonts, each with a story:

* **Cherokee** (U+13A0) — ᏣᎳᎩ — a script with a named inventor, Sequoyah,
  who could not read any language when he built one.
* **Ogham** (U+1680) — ᚑᚌᚐᚋ — the edge-of-the-stone script; angular,
  terminal-native, reads from the bottom-left upward.
* **Egyptian hieroglyphs** (U+13000) — 𓂀 — one block above cuneiform
  (U+12000). The two oldest writing systems on earth are Unicode
  neighbours: 12000 and 13000, the oldest addresses on the block.
* **Linear B** (U+10000) — 𐀀 — the very first Supplementary Plane block ever
  encoded; a syllabary for Greek that sat undeciphered for 3,000 years until
  Ventris cracked it, and turned out to be — receipts. Palatial accounting.
  The Bronze Age's NOW.md.

The pattern is the point: the glyph stress corpus wants scripts that survive
a fresh SSH session with no font shopping, and every Unicode-native script
above has a better true story than any fictional one. The Ea-nāṣir tablet is
a complaint about copper; Linear B is how you prove a lost language was
Greek; Sequoyah wrote Cherokee into existence from nothing.

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
then scoping follows the evidence. Fixture work first: the transliteration
lines of Probe 6 are quotable now; glyph-true cuneiform needs a sign-form
converter (aBZL/Cuneify) built or borrowed before the renderer is accused.
The probe corpus: Probes 1–7, rendered over SSH on a fresh machine — the
tofu-free constraint of Probe 7 is part of the acceptance.
