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
  who could not read any language when he built one. Render it: ᎣᏏᏲ —
  *osiyo*, hello.
* **Ogham** (U+1680) — ᚑᚌᚐᚋ — the edge-of-the-stone script; angular,
  terminal-native, reads from the bottom-left upward. Render the most
  common word in the surviving corpus: ᚋᚐᚊᚔ — *MAQI*, of the son.
* **Egyptian hieroglyphs** (U+13000) — one block above cuneiform (U+12000).
  The two oldest writing systems on earth are Unicode neighbours: 12000 and
  13000, the oldest addresses on the block. Render the classics: 𓂀 — the
  Eye of Horus; 𓋹 — *ankh*, life; 𓄤 — *nfr*, beautiful.
* **Linear B** (U+10000) — the very first Supplementary Plane block ever
  encoded; a syllabary for Greek that sat undeciphered for 3,000 years until
  Ventris cracked it, and turned out to be — receipts. Palatial accounting.
  The Bronze Age's NOW.md. Render the first five codepoints ever given to
  Plane 1: 𐀀𐀁𐀂𐀃𐀄 — *a e i o u*, the whole vowel bench of Mycenaean
  Greek.

### The South American gap

The operator asked for South American glyphs, and the answer is a gap — but
an instructive one:

* **The Andes had no glyph script to encode.** The hemisphere's great
  recording system was the *khipu* — knotted cord. Data, yes; glyphs, no.
  Nothing to render until someone can render knots, and there is no
  consensus on what the knots say.
* **The khipu is the anti-okuda medium.** It is compositing without
  rendering: a message bus made of wool, where the byte stream never meets
  a screen. The three-concerns split says compositing belongs to the
  environment — the Inca took that literally and outsourced display to the
  reader's hands.
* **One spicy claim, banked at preprint strength** (Hume's Razor applies,
  0 citations so far): a 2026 computational read of 619 khipu proposes a
  13-symbol syllabic channel in the knot turn-counts — tribute registers,
  censuses, judicial dossiers, an astronomical catalog. *Structured forms,
  none prose.* If true: the Inca had a spreadsheet 500 years before
  VisiCalc, and never once wrote a poem in it. The empire ran on NOW.md and
  had no &alpha.
* **Maya is the near miss — and not Klingon.** It is Mesoamerican, not
  South American, and it is *not yet* in Unicode, but it has a tentative
  roadmap slot (U+15500) and live 2026 proposals (Codical Maya, Classic
  Extended-A). Unlike pIqaD, this one is coming. When the block lands, it
  joins the corpus — the probe doc's first script with a living spoken
  descendant.

The pattern is the point: the glyph stress corpus wants scripts that survive
a fresh SSH session with no font shopping, and every Unicode-native script
above has a better true story than any fictional one. The Ea-nāṣir tablet is
a complaint about copper; Linear B is how you prove a lost language was
Greek; Sequoyah wrote Cherokee into existence from nothing.

## Probe 8 — the four vernaculars

A follow-up dogfood ruling (2026-09-02): Probe 6's gag generalizes. Real,
verifiable corpus text exists for all four of Probe 7's Unicode-native
scripts — spice present where the corpus has it, noted absent where it does
not, and no invention required anywhere. One line each, deadpan teaser,
translation withheld where there is anything to withhold. First-draft
caveat: three claims below failed independent review and were corrected
against the editions — the fixture must be verified before the renderer is
accused, and this fixture was not exempt:

* **Cherokee** (U+13A0) — ᏣᎳᎩ ᏧᎴᎯᏌᏅᎯ — the masthead of the Cherokee
  Phoenix, the first Native American newspaper, New Echota, 21 February
  1828, printed partly in the syllabary Sequoyah built from nothing. The
  first thing ever set in the type was Genesis 1:1–5, proof-printed in
  Boston in December 1827 before the press left for Georgia (Missionary
  Herald); the Lord's Prayer followed in issue one's Poetry column, and by
  the second issue the correspondence columns were arguing about land and
  offices. Georgia confiscated the press; the editor, Elias Boudinot, was
  killed in 1839 over the Treaty of New Echota. The script outlived the
  nation's printing.
* **Ogham** (U+1680) — CIIC 200, Coolmagort, Co. Kerry — ᚋᚐᚊᚔ ᚈᚈᚐᚂ ᚋᚐᚊᚔ
  ᚃᚑᚏᚌᚑᚄ ᚋᚐᚊᚔ ᚋᚒᚉᚑᚔ ᚈᚑᚔᚉᚐᚉ — MAQI-TTAL MAQI VORGOS MAQI MUCOI TOICAC,
  the edition reading (Macalister CIIC; Gippert TITUS) — a three-generation
  genealogy, carved bottom-left upward along a stone edge: Ttal, son of
  Vorgos, of the kin of Toica. The surviving corpus is roughly four hundred
  orthodox inscriptions (McManus counts 382), and every one is a gravestone
  or a claim of ownership. No poems, no prayers, no complaints — the oldest
  continuous prose in any Goidelic language is a burial register. If the
  Sumerian corpus is the ancient world's tabloid, ogham is its phone book,
  and the phone book has no plot. Verified spice-free; the verdict is the
  finding.
* **Egyptian hieroglyphs** (U+13000) — Papyrus Turin 55001 (Museo Egizio
  Cat. 2031), Deir el-Medina, Ramesside — in the edition's transliteration
  (Brawanski & Fischer-Elfert 2012, text 3):
  `nfr n.k kꜣt.ı͗ my m-sꜣ.ı͗ ẖr tꜣy.k mrwt ı͗ ḥnn.k` —
  a woman assesses the merits of one of her parts, issues an instruction
  about approaching from behind, and makes an appreciative remark about
  his. Champollion — the man who decoded the script — called this papyrus
  "an image of monstrous obscenity"; the Museo Egizio displayed the
  animal-cartoon section and kept the other section in its magazines from
  1965 until 2003. The brown-paper-bag anecdote has a rival.
* **Linear B** (U+10000) — PY Ta 641 — 𐀴𐀪𐀡𐀆 — ti-ri-po-de, two tripods,
  followed on the clay by a drawn tripod: the tablet that proved Ventris
  right. Blegen read the syllables against the picture of the pot and wrote
  "all this seems too good to be true. Is coincidence excluded?" The corpus
  is receipts again — but the spice is already there, literally: the Knossos
  Ga series counts perfumed oil with coriander on the manifest
  (ko-ri-a2-da-na), PY Un 267 records a man handing aromatic substances to
  an unguent-boiler, the Mycenae Ge series tallies sesame, and Hand 2,
  scribe of the Tripod Tablet, worked in the perfumed-oil wing. A Bronze Age
  inventory that smells.

Fixture honesty, per this document's own rule:

* **Cherokee** renders wherever the terminal font carries U+13A0; no
  conversion needed.
* **Ogham** Unicode renders horizontally; the original is carved vertically
  on a stone edge, read bottom-left upward. What appears on screen is a
  transliteration of the carving, not the carving.
* **Egyptian** — the Turin captions are **hieratic**, not hieroglyphic, so
  the quotable form is transliteration, exactly the Probe 6 precedent.
  Glyph-true Unicode is honest for the single-sign classics (𓂀 𓋹 𓄤) and
  approximate for running text — no ligatures, sign order flattened.
* **Linear B** — syllabograms and vessel ideograms are both in Plane 1;
  renders as-is, no fixture-construction step.

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
The probe corpus: Probes 1–8, rendered over SSH on a fresh machine — the
tofu-free constraint of Probe 7 is part of the acceptance.
