# writing for TTS 

Writing for text-to-speech (TTS) requires treating the text like a script for an actor who has zero intuition and takes everything literally.

## **Structure & Cadence**

* **Keep sentences short to moderate (15–20 words max).** Long, multi-clause run-ons force the engine into awkward pitch rises or monotone flatlines as it runs out of breath simulation.
* **Write for the ear, not the eye.** Use natural speech rhythms and conversational phrasing. If reading a sentence out loud makes you stumble, a voice engine will mangle it.
* **Avoid dense parentheses.** TTS engines rarely lower their pitch or drop their volume for parenthetical remarks—they usually plow straight through without signaling a shift in thought.

## **Punctuation as Audio Cues**

* **Commas create micro-pauses; periods create full stops.** If a synthesizer rushes past an important distinction, insert a comma.
* **Use em dashes (—) or ellipses (...) deliberately.** They often produce a natural, contemplative pause or a sudden break, which can humanize neural voices.
* **Avoid back-to-back punctuation.** Combinations like `?!` or `...?!` can confuse the prosody model or trigger glitchy intonation spikes.

## **Numbers, Symbols & Formatting**

* **Spell out ambiguous numbers.** Engines struggle with context: write "two thousand twenty-six" or "twenty twenty-six" depending on whether it's a quantity or a year.
* **Spell out units and symbols.** Replace `%`, `$`, `&`, and `/` with "percent," "dollars," "and," or "or/per." A raw string like `$50` is often read correctly, but `$50M` might come out as "dollar fifty M" on older or less context-aware engines.
* **Format phone numbers and codes with spaces or hyphens.** Write `5 5 5, 0 1 9 9` or group them distinctly so the engine reads digits individually rather than trying to read it as "five billion..."

## **Acronyms, Abbreviations & Homographs**

* **Handle initialisms explicitly.** If an acronym is meant to be spelled letter-by-letter (like API or URL), capitalize each letter or separate them with periods/spaces (`A-P-I`) if the engine tries to pronounce it as a single nonsensical word.
* **Avoid Latin abbreviations.** Replace *e.g.*, *i.e.*, and *etc.* with "for example," "that is," and "and so forth."
* **Watch out for heteronyms.** Words spelled the same but pronounced differently based on context (e.g., *read* [reed/red], *lead* [leed/led], *record* [noun vs. verb]) are prime failure points. Reword sentences to eliminate the ambiguity if the voice engine picks the wrong pronunciation.

## **Markup & Advanced Control**

* **Use SSML (Speech Synthesis Markup Language) when supported.** If your platform accepts SSML, use tags to enforce precision:
* `<break time="500ms"/>` for explicit timing control.
* `<say-as interpret-as="cardinal">` or `<say-as interpret-as="telephone">` to eliminate number guesswork.
* `<phoneme>` with IPA (International Phonetic Alphabet) for proper nouns, brand names, or niche technical jargon that the engine mispronounces.

| Tag | Primary Attributes | Example | What It Controls |
| --- | --- | --- | --- |
| `<speak>` | None (root tag) | `<speak>Hello world.</speak>` | Wraps the entire SSML document; required by all compliant parsers. |
| `<break>` | `time`, `strength` | `<break time="300ms"/>` or `<break strength="medium"/>` | Pauses audio output. `strength` accepts `none`, `x-weak`, `weak`, `medium`, `strong`, `x-strong`. |
| `<say-as>` | `interpret-as`, `format` | `<say-as interpret-as="cardinal">12345</say-as>` | Explicit interpretation: `cardinal`, `ordinal`, `characters` (spells letters), `digits`, `telephone`, `date`. |
| `<prosody>` | `rate`, `pitch`, `volume` | `<prosody rate="fast" pitch="+2st" volume="-3dB">Alert</prosody>` | Acoustic properties. Supports relative percentages (`+20%`), absolute values, semitones (`st`), or presets (`slow`, `high`). |
| `<emphasis>` | `level` | `<emphasis level="strong">Never</emphasis> touch that.` | Adjusts pitch and volume dynamically to stress a word. Levels: `strong`, `moderate`, `reduced`, `none`. |
| `<sub>` | `alias` | `<sub alias="World Wide Web Consortium">W3C</sub>` | Text replacement; the synthesizer speaks the alias instead of the enclosed text. |
| `<phoneme>` | `alphabet`, `ph` | `<phoneme alphabet="ipa" ph="təˈmeɪtoʊ">tomato</phoneme>` | Enforces exact pronunciation using standard phonetic alphabets (`ipa` or `x-sampa`). |
| `<audio>` | `src`, `clipBegin`, `clipEnd` | `<audio src="[https://example.com/chime.mp3](https://example.com/chime.mp3)"/>` | Plays recorded audio files or sound effects inline with synthetic speech. |
| `<p>`, `<s>` | None | `<p><s>Sentence one.</s><s>Sentence two.</s></p>` | Paragraph and sentence delimiters; provides structure for automated prosodic phrasing. |

---

## **Common `<say-as>` Interpretations**

* **Spell individual letters:**
```xml
<say-as interpret-as="characters">SQL</say-as>

```


*(Audio: "S-Q-L")*
* **Dates with ambiguous separators:**
```xml
<say-as interpret-as="date" format="mdy">04/05/2026</say-as>

```


*(Audio: "April fifth, twenty twenty-six")*
* **Telephone & grouped sequences:**
```xml
<say-as interpret-as="telephone">800-555-0199</say-as>

```


*(Audio: Reads grouped digits naturally rather than hundreds or billions)*
* **Ordinal numbers:**
```xml
<say-as interpret-as="ordinal">1</say-as>

```


*(Audio: "first")*

---

## **Practical Implementation Note**

Support varies significantly across neural TTS providers:

* **Amazon Polly** and **Google Cloud Text-to-Speech** support the core W3C standard closely, including `<phoneme>` and `<say-as>`.
* **Azure Speech Services** provides deep support for `<mstts:express-as>`, allowing you to assign emotional styles (e.g., `style="customerservice"`, `style="cheerful"`).
* **ElevenLabs and modern conversational models** often ignore granular SSML tags (or support only `<break>`), relying instead on punctuation, ellipses, and prompt conditioning to guide prosody.