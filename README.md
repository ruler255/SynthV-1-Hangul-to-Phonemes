# SynthV-1-Hangul-to-Phonemes
A script to convert Korean Hangul lyrics into Mandarin X-SAMPA phonemes in Synthesizer V Studio 1.<br>
<br>
Testing has shown better rythmic and smoothness results than SynthV 2's native Korean, due to:
 - Vowel Alignment: By shortening plosives (p/b/k), the vowel nucleus (the meat of the sound) lands exactly on the beat, whereas SV2's AI often lets the consonant "drag" the timing.
 - Deterministic Liaison: Unlike SV2, which "guesses" how to link notes, your script forces resyllabification, ensuring zero-latency transitions in fast passages.
<br>
Demo:<br>
https://youtu.be/coK8p-KVqIM

## Requirements
- Synthesizer V Studio 1.11.0 or later
- A Mandarin Chinese voicebank (native Mandarin will sound significantly better, but any voicebank will work)

## Features
- Full Hangul decomposition with all 19 initials, 21 vowels, and 28 finals
- Liaison (연음) with complex coda splitting
- Nasalization, aspiration, and tensification between notes
- Glide-blocking on liaison
- Handles cases like "없어" (eobs-eo → 업서 eob-seo, correct liaison of complex coda ㅄ), "독립" (dog-lib → 동닙 dong-nip, ㄹ nasalization), and "않아" (an-ha → 아나 a-na, ㅎ deletion after nasal). 
- Empirically tuned vowel mappings (like `j A` for ㅕ, `t yE` for 돼) that sound more natural than phonetically "correct" ones
- Automatic per-phoneme duration and strength attributes
- Optional hieut (ㅎ) deletion between sonorants
- Non-Hangul characters (English, numbers, punctuation) are ignored by the script. English lyrics will need to be handled separately.

## How to Use
1. Download the script and place it in your SynthV scripts folder:
   - **Windows:** `%UserProfile%\Documents\Dreamtonics\Synthesizer V Studio\scripts`
   - **Mac:** `~/Documents/Dreamtonics/Synthesizer V Studio/scripts`
2. In SynthV, open the Scripts menu and click **Rescan Scripts**
3. Type or paste the Korean characters directly into the lyric field. SynthV accepts Hangul natively
4. Select the notes you want to convert
5. Go to the Scripts menu and click **Hangul Phoneme Converter**
6. You will be prompted whether to enable ㅎ (hieut) deletion and whether to use `A` or `7` — examples are provided in the dialog
7. Done. You may need one or two small manual tweaks afterward, but that's it

## Limitations
- Mandarin X-SAMPA has no equivalent for eo (ㅓ). The closest approximation, `7`, is slightly too dark. This is a constraint of the phoneme set. A new feature implemented allows you to choose between `A` and `7` depending on what works best for the voicebank. Generally, `A` sounds more realistic<br>
- There is also no equivalent for rieul (ㄹ). ` r\`` ` [with only one backtick] is slightly too rhotic, so it was revised to ` z`` ` [again, only one backtick] but this generally does not pose any issues<br>
- This is **not** a replacement for native Korean synthesis (e.g. Synthesizer V 2). If something sounds off, it is fundamentally a limitation of approximating Korean with Mandarin phonemes, not an issue with the script<br>
- Only tested with more recent AI voicebanks. Confirmed working well with: **Mai, Haiyi AI, Stardust, Popy AI, Noa Hex**. Older voicebanks may produce poor results

## Why Mandarin?
Synthesizer V 1 has no native Korean engine. Mandarin shares enough phonetically with Korean that a tuned mapping can produce near-native results.
