# SynthV-1-Hangul-to-Phonemes
A script to convert Korean Hangul lyrics into Mandarin X-SAMPA phonemes in Synthesizer V Studio 1.
Video and audio demonstrations provided.

## Requirements
- Synthesizer V Studio 1.11.0 or later
- A Mandarin Chinese voicebank (native Mandarin will sound significantly better, but any voicebank will work)

## Features
- Full Hangul decomposition with all 19 initials, 21 vowels, and 28 finals
- Liaison (연음) with complex coda splitting
- Nasalization, aspiration, and tensification between notes
- Glide-blocking on liaison
- Empirically tuned vowel mappings (like `j 7` for ㅕ, `t yE` for 돼) that sound more natural than phonetically "correct" ones
- Automatic per-phoneme duration and strength attributes
- Optional ㅎ deletion between sonorants
- Non-Hangul characters (English, numbers, punctuation) are ignored by the script. English lyrics will need to be handled separately.

## How to Use
1. Download the script and place it in your SynthV scripts folder:
   - **Windows:** `%UserProfile%\Documents\Dreamtonics\Synthesizer V Studio\scripts`
   - **Mac:** `~/Documents/Dreamtonics/Synthesizer V Studio/scripts`
2. In SynthV, open the Scripts menu and click **Rescan Scripts**
3. Type or paste the Korean characters directly into the lyric field. SynthV accepts Hangul natively
4. Select the notes you want to convert
5. Go to the Scripts menu and click **Hangul Phoneme Converter**
6. You will be prompted whether to enable ㅎ (hieut) deletion — examples are provided in the dialog. OK = Yes, Cancel = No
7. Done. You may need one or two small manual tweaks afterward, but that's it

## Limitations
- Mandarin X-SAMPA has no equivalent for eo (ㅓ). The closest approximation, `7`, is slightly too dark. This is a constraint of the phoneme set and cannot be worked around.<br>
- There is also no equivalent for rieul (ㄹ). ` r\`` ` [with only one backtick] is slightly too rhotic, but this generally does not pose any issues.
- This is **not** a replacement for native Korean synthesis (e.g. Synthesizer V 2). If something sounds off, it is fundamentally a limitation of approximating Korean with Mandarin phonemes, not an issue with the script.
- Only tested with more recent AI voicebanks. Confirmed working well with: **Mai, Haiyi AI, Stardust, Popy AI, Noa Hex**. Older voicebanks may produce poor results.

## Why Mandarin?
Synthesizer V 1 has no native Korean engine. Mandarin shares enough phonetically with Korean that a tuned mapping can produce near-native results.
