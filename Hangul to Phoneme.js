// ============================================================
//  Hangul Phoneme Converter for SynthV Studio 1.11+
//  Converts Hangul lyrics to X-SAMPA phonemes and applies
//  duration/strength attributes per the provided mapping rules.
// ============================================================

function getClientInfo() {
  return {
    name:             "Hangul Phoneme Converter",
    category:         "Korean Tools",
    author:           "",
    versionNumber:    1.7,
    minEditorVersion: 0x010B00   // SynthV Studio 1.11.0
  };
}

// ─── Time constants (SynthV blicks) ──────────────────────────
var QUARTER = 705600000;
var EIGHTH  = QUARTER / 2;

// ─── CHOSEONG (Initial Consonants, 19 entries) ───────────────
var CHOSEONG_MAP = [
  ["k"],       // 0  ㄱ
  ["k", "k"],     // 1  ㄲ
  ["n"],       // 2  ㄴ
  ["t"],       // 3  ㄷ
  ["t", "t"],     // 4  ㄸ
  ["l"],       // 5  ㄹ   (flap; SynthV uses "l" or "r\`"? We'll keep "l" for now)
  ["m"],       // 6  ㅁ
  ["p"],       // 7  ㅂ
  ["p", "p"],     // 8  ㅃ
  ["s"],       // 9  ㅅ
  ["s", "s"],     // 10 ㅆ
  [],          // 11 ㅇ  (silent)
  ["ts\\"],    // 12 ㅈ
  ["ts\\", "ts\\"],  // 13 ㅉ   (fortis affricate – adjust if your voice bank uses a different symbol)
  ["ts\\h"],   // 14 ㅊ
  ["kh"],      // 15 ㅋ
  ["th"],      // 16 ㅌ
  ["ph"],      // 17 ㅍ
  ["x"],       // 18 ㅎ
];

// ─── JUNGSEONG (Vowels, 21 entries) ─────────────────────────
var JUNGSEONG_MAP = [
  ["a"],             // 0  ㅏ
  ["e"],             // 1  ㅐ
  ["j", "a"],        // 2  ㅑ
  ["j", "e"],        // 3  ㅒ
  ["7"],             // 4  ㅓ
  ["e"],             // 5  ㅔ
  ["j", "7"],        // 6  ㅕ
  ["j", "e"],        // 7  ㅖ
  ["o"],             // 8  ㅗ
  ["ua"],        // 9  ㅘ   (w + a)
  ["yE"],        // 10 ㅙ
  ["ue"],        // 11 ㅚ   (or "o i"? We'll use "w e")
  ["j", "o"],        // 12 ㅛ
  ["u"],             // 13 ㅜ
  ["w", "7"],        // 14 ㅝ   (w + 7)
  ["w", "e"],        // 15 ㅞ
  ["w", "i"],        // 16 ㅟ
  ["j", "u"],        // 17 ㅠ
  ["i\\"],           // 18 ㅡ
  ["ie"],      // 19 ㅢ
  ["i"],             // 20 ㅣ
];

// ─── JONGSEONG (Final Consonants, 28 entries; index 0 = none) ─
var JONGSEONG_MAP = [
  [],      // 0  (none)
  ["k"], // 1  ㄱ 
  ["k"], // 2  ㄲ
  ["k"], // 3  ㄳ
  ["n"],   // 4  ㄴ
  ["n"],   // 5  ㄵ
  ["n"],   // 6  ㄶ
  ["t"],   // 7  ㄷ
  ["r\\`"],   // 8  ㄹ
  ["k"],   // 9  ㄺ
  ["m"],   // 10 ㄻ
  ["r\\`"],   // 11 ㄼ
  ["r\\`"],   // 12 ㄽ
  ["r\\`"],   // 13 ㄾ
  ["p"],   // 14 ㄿ
  ["r\\`"],   // 15 ㅀ
  ["m"],   // 16 ㅁ
  ["p"], // 17 ㅂ
  ["p"], // 18 ㅄ
  ["t"], // 19 ㅅ
  ["t"], // 20 ㅆ
  ["N"],   // 21 ㅇ   (velar nasal)
  ["t"], // 22 ㅈ
  ["t"], // 23 ㅊ
  ["k"], // 24 ㅋ
  ["t"], // 25 ㅌ
  ["p"], // 26 ㅍ
  ["t"], // 27 ㅎ
];

// Test for complex codas that require liaison handling (ㄳ, ㄵ, ㄶ, ㄼ, ㄽ, ㄾ, ㄿ, ㅀ, ㅄ)
var complexCodaLiaison = {
  "ㄳ": { stay: "ㄱ", move: "ㅅ" },
  "ㄵ": { stay: "ㄴ", move: "ㅈ" },
  "ㄶ": { stay: "ㄴ", move: "ㅎ" },
  "ㄼ": { stay: "ㄹ", move: "ㅂ" },
  "ㄽ": { stay: "ㄹ", move: "ㅅ" },
  "ㄾ": { stay: "ㄹ", move: "ㅌ" },
  "ㄿ": { stay: "ㄹ", move: "ㅍ" },
  "ㅀ": { stay: "ㄹ", move: "ㅎ" },
  "ㅄ": { stay: "ㅂ", move: "ㅅ" },
};

// Jamo character lists for reference
var CHOSEONG_JAMO = ["ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
var JUNGSEONG_JAMO = ["ㅏ","ㅐ","ㅑ","ㅒ","ㅓ","ㅔ","ㅕ","ㅖ","ㅗ","ㅘ","ㅙ","ㅚ","ㅛ","ㅜ","ㅝ","ㅞ","ㅟ","ㅠ","ㅡ","ㅢ","ㅣ"];
var JONGSEONG_JAMO = ["","ㄱ","ㄲ","ㄳ","ㄴ","ㄵ","ㄶ","ㄷ","ㄹ","ㄺ","ㄻ","ㄼ","ㄽ","ㄾ","ㄿ","ㅀ","ㅁ","ㅂ","ㅄ","ㅅ","ㅆ","ㅇ","ㅈ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];

// Jamo index maps for quick lookup
var CHOSEONG_INDEX = {};
for (var i = 0; i < CHOSEONG_JAMO.length; i++) CHOSEONG_INDEX[CHOSEONG_JAMO[i]] = i;
var JUNGSEONG_INDEX = {};
for (var i = 0; i < JUNGSEONG_JAMO.length; i++) JUNGSEONG_INDEX[JUNGSEONG_JAMO[i]] = i;
var JONGSEONG_INDEX = {};
for (var i = 0; i < JONGSEONG_JAMO.length; i++) JONGSEONG_INDEX[JONGSEONG_JAMO[i]] = i;

function getPhoneme(jamo, position) {
  if (position === "initial") {
    var idx = CHOSEONG_INDEX[jamo];
    return idx !== undefined ? CHOSEONG_MAP[idx] : [];
  } else if (position === "final") {
    var idx = JONGSEONG_INDEX[jamo];
    return idx !== undefined ? JONGSEONG_MAP[idx] : [];
  } else if (position === "vowel") {
    var idx = JUNGSEONG_INDEX[jamo];
    return idx !== undefined ? JUNGSEONG_MAP[idx] : [];
  }
  return [];
}

// ─── Hangul Decomposition ─────────────────────────────────────
function isHangulSyllable(ch) {
  var c = ch.charCodeAt(0);
  return c >= 0xAC00 && c <= 0xD7A3;
}

function decomposeHangul(ch) {
  var code = ch.charCodeAt(0) - 0xAC00;
  var choseong  = Math.floor(code / 28 / 21);
  var jungseong = Math.floor(code / 28) % 21;
  var jongseong = code % 28;
  return { choseong: choseong, jungseong: jungseong, jongseong: jongseong };
}

// ─── Syllable → Token List ────────────────────────────────────
function syllableToTokens(ch) {
  var dec = decomposeHangul(ch);
  var tokens = [];
  var choJamo = CHOSEONG_JAMO[dec.choseong];
  var choTokens = CHOSEONG_MAP[dec.choseong];
  for (var i = 0; i < choTokens.length; i++) {
    tokens.push({ token: choTokens[i], role: "initial", jamo: choJamo });
  }
  var jungJamo = JUNGSEONG_JAMO[dec.jungseong];
  var jungTokens = JUNGSEONG_MAP[dec.jungseong];
  for (var i = 0; i < jungTokens.length; i++) {
    tokens.push({ token: jungTokens[i], role: "vowel", jamo: jungJamo });
  }
  var jongJamo = JONGSEONG_JAMO[dec.jongseong];
  var jongTokens = JONGSEONG_MAP[dec.jongseong];
  for (var i = 0; i < jongTokens.length; i++) {
    tokens.push({ token: jongTokens[i], role: "final", jamo: jongJamo });
  }
  return tokens;
}

// ─── Phonological Rules ───────────────────────────────────────
function applyRules(tokens) {
  var result = [];
  for (var i = 0; i < tokens.length; i++) {
    result.push({ token: tokens[i].token, role: tokens[i].role });
  }
  var nextShortenInitial = false;

  for (var i = 0; i < result.length; i++) {
    // Rule: iE → j 7
    if (result[i].token === "i" && i+1 < result.length && result[i+1].token === "E") {
      result[i].token = "j";
      result[i+1].token = "7";
    }

    // Rule: vowel sequence 'u 7' (ㅝ context) → 'w 7'
    if (result[i].token === "u" && result[i].role === "vowel" &&
        i+1 < result.length && result[i+1].token === "7" && result[i+1].role === "vowel") {
      result[i].token = "w";
      result[i+1].token = "7";
    }

    // Rule: 'u i' → 'u :\i' (의 reduction) – only if mapping produces "u i"
    if (result[i].token === "u" && i+1 < result.length && result[i+1].token === "i") {
      result[i+1].token = ":\\i";
      if (i+1 === result.length-1) nextShortenInitial = true;
    }

    // Rule: remove spurious length mark prefixes
    if (result[i].token === ":n") result[i].token = "n";
    if (result[i].token === ":N") result[i].token = "N";
  }

  return [result, nextShortenInitial];
}

// ─── Hieut Deletion Helper ────────────────────────────────────
// Returns true for vowels, nasals (n N m), and liquids (l r\`)
// These are the environments where ㅎ weakens/deletes in natural Korean speech
// Replace the isSonorant helper with this null-safe version
function isSonorant(tok) {
  if (!tok || tok.role === undefined) return false;
  if (tok.role === "vowel") return true;
  var t = tok.token;
  return t === "n" || t === "N" || t === "m" || t === "l" || t === "r\\`";
}

// Apply phonological rules between adjacent notes V2 (nasalization, aspiration, tensification). Added hieot deletion in intervocalic position and liaison blocking for glide-initial vowels. Also added a separate liaison pass before this to handle final consonant movement, which is necessary for correct application of these rules in many cases.
function applyPhonologicalRulesBetweenNotes(noteData, hieutDeletion) {
  for (var i = 0; i < noteData.length - 1; i++) {
    var curr = noteData[i];
    var next = noteData[i + 1];
    if (curr.tokens.length === 0 || next.tokens.length === 0) continue;

    var lastTok = curr.tokens[curr.tokens.length - 1];
    var firstTok = next.tokens[0];

    // --- ㅎ deletion after sonorants (vowel, nasal, liquid) ---
    // Covers: intervocalic (원히→워니), post-nasal (않아→아나, 많이→마니),
    // post-liquid (ㅀ complex codas like 잃어→이러), and sonorant+ㅎ in general
    if (isSonorant(lastTok) && firstTok.token === "x" && firstTok.role === "initial") {
    if (hieutDeletion) next.tokens.shift();
    continue;
    }

    // Only consider if last is final and first is initial (or vowel? but usually initial)
    if (lastTok.role !== "final" || (firstTok.role !== "initial" && firstTok.role !== "vowel")) continue;

    var lastJamo = lastTok.jamo;
    var firstJamo = firstTok.jamo;

    // --- Nasalization ---
    var nasalizationMap = {
      "ㄱ": "ㅇ", "ㄲ": "ㅇ", "ㅋ": "ㅇ", "ㄳ": "ㅇ", "ㄺ": "ㅇ",
      "ㄷ": "ㄴ", "ㄸ": "ㄴ", "ㅌ": "ㄴ", "ㅅ": "ㄴ", "ㅆ": "ㄴ",
      "ㅈ": "ㄴ", "ㅉ": "ㄴ", "ㅊ": "ㄴ", "ㅎ": "ㄴ",
      "ㅂ": "ㅁ", "ㅃ": "ㅁ", "ㅍ": "ㅁ", "ㅄ": "ㅁ", "ㄿ": "ㅁ"
    };
    if ((firstJamo === "ㄴ" || firstJamo === "ㅁ") && nasalizationMap[lastJamo]) {
      var newJamo = nasalizationMap[lastJamo];
      var newPhonemes = getPhoneme(newJamo, "final");
      if (newPhonemes.length > 0) {
        lastTok.token = newPhonemes[0];
        lastTok.jamo = newJamo;
      }
      continue;
    }

    // --- Aspiration ---
    var aspirationMap = {
      "ㄱ": "ㅋ", "ㄲ": "ㅋ", "ㅋ": "ㅋ",
      "ㄷ": "ㅌ", "ㄸ": "ㅌ", "ㅌ": "ㅌ",
      "ㅂ": "ㅍ", "ㅃ": "ㅍ", "ㅍ": "ㅍ"
    };

    // Case 1: final ㅎ + initial stop
    if (lastJamo === "ㅎ" && aspirationMap[firstJamo]) {
      var newJamo = aspirationMap[firstJamo];
      var newPhonemes = getPhoneme(newJamo, "initial");
      if (newPhonemes.length > 0) {
        firstTok.token = newPhonemes[0];
        firstTok.jamo = newJamo;
        // Remove the final ㅎ
        curr.tokens.pop();
      }
      continue; // Skip tensification for this pair
    }

    // Case 2: final stop + initial ㅎ
    if (aspirationMap[lastJamo] && firstJamo === "ㅎ") {
      var newJamo = aspirationMap[lastJamo];
      var newPhonemes = getPhoneme(newJamo, "initial");
      if (newPhonemes.length > 0) {
        firstTok.token = newPhonemes[0];
        firstTok.jamo = newJamo;
        // Remove the final stop
        curr.tokens.pop();
      }
      continue; // Skip tensification for this pair
    }

    // --- Tensification --- (only if no aspiration happened)
    var plainToFortis = {
      "ㄱ": "ㄲ", "ㄷ": "ㄸ", "ㅂ": "ㅃ", "ㅅ": "ㅆ", "ㅈ": "ㅉ"
    };
    var stopSet = {
      "ㄱ":1, "ㄲ":1, "ㅋ":1, "ㄳ":1, "ㄺ":1,
      "ㄷ":1, "ㄸ":1, "ㅌ":1,
      "ㅂ":1, "ㅃ":1, "ㅍ":1, "ㅄ":1, "ㄿ":1,
      "ㅅ":1, "ㅆ":1,
      "ㅈ":1, "ㅉ":1, "ㅊ":1,
      "ㅎ":1
    };
    if (stopSet[lastJamo] && plainToFortis[firstJamo]) {
      var newJamo = plainToFortis[firstJamo];
      var newPhonemes = getPhoneme(newJamo, "initial");
      if (newPhonemes.length > 0) {
        firstTok.token = newPhonemes[0];
        firstTok.jamo = newJamo;
      }
    }
  }
}

// ─── Two‑pass processing for liaison ───────────────────────────
function processNotesWithLiaison(notes, hieutDeletion) {
  // Pass 1: collect syllable data for each note
  var noteData = [];
  for (var i = 0; i < notes.length; i++) {
    var note = notes[i];
    var lyrics = note.getLyrics().trim();
    var rawTokens = [];
    if (lyrics) {
      for (var j = 0; j < lyrics.length; j++) {
        var ch = lyrics.charAt(j);
        if (isHangulSyllable(ch)) {
          var sylTokens = syllableToTokens(ch);
          for (var k = 0; k < sylTokens.length; k++) {
            rawTokens.push(sylTokens[k]);
          }
        }
      }
    }
    noteData.push({
      note: note,
      tokens: rawTokens,
      originalTokens: rawTokens.slice(),
    });
    }

  // Liaison pass: move final consonant to next note if next note starts with a vowel (null initial)
  for (var i = 0; i < noteData.length - 1; i++) {
    var curr = noteData[i];
    var next = noteData[i + 1];
    if (curr.tokens.length === 0 || next.tokens.length === 0) continue;

    // Check if current note ends with a consonant (final)
    var lastTok = curr.tokens[curr.tokens.length - 1];
    if (lastTok.role !== "final") continue;

    // Check if next note's first token is a vowel (meaning it has no initial consonant)
    // In Korean, a vowel at the beginning of a syllable means the initial was null (ㅇ)
    var firstVowelToken = next.tokens[0];
    if (firstVowelToken.role !== "vowel") continue;
    // Don't liaise into glide-initial vowels (ㅟ, ㅘ, ㅛ, ㅝ, ㅠ, ㅑ, ㅕ, etc.)
    // Their leading u/j acts as a glide onset, blocking liaison
    if (firstVowelToken.token === "w" || firstVowelToken.token === "j") continue;

    // Move the final consonant to become the initial of the next note
    var jamo = lastTok.jamo; // the original Hangul jamo character
    var initialTokens = [];

    // --- Complex coda liaison handling ---
    if (complexCodaLiaison[jamo]) {
    var cl = complexCodaLiaison[jamo];
    // Update the coda to the staying consonant's phoneme
    var stayPhonemes = getPhoneme(cl.stay, "final");
    if (stayPhonemes.length > 0) {
        lastTok.token = stayPhonemes[0];
        lastTok.jamo = cl.stay;
    }
    // Move the second consonant as the onset of the next note
    var movePhonemes = getPhoneme(cl.move, "initial");
    for (var ti = movePhonemes.length - 1; ti >= 0; ti--) {
        next.tokens.unshift({ token: movePhonemes[ti], role: "initial", jamo: cl.move });
    }
    continue;
    }

    // Map final jamo to the correct initial phoneme(s)
    if (jamo === "ㅅ") initialTokens = ["s"];
    else if (jamo === "ㄷ") initialTokens = ["t"];
    else if (jamo === "ㅌ") initialTokens = ["th"];
    else if (jamo === "ㅆ") initialTokens = ["s"];
    else if (jamo === "ㅈ") initialTokens = ["ts\\"];
    else if (jamo === "ㅊ") initialTokens = ["ts\\h"];
    else if (jamo === "ㄱ") initialTokens = ["k"];
    else if (jamo === "ㄲ") initialTokens = ["k"];
    else if (jamo === "ㅋ") initialTokens = ["kh"];
    else if (jamo === "ㅂ") initialTokens = ["p"];
    else if (jamo === "ㅃ") initialTokens = ["p"];
    else if (jamo === "ㅍ") initialTokens = ["ph"];
    else if (jamo === "ㄹ") initialTokens = ["l"]; // will become tap via liquid rule
    else if (jamo === "ㅁ") initialTokens = ["m"];
    else if (jamo === "ㄴ") initialTokens = ["n"];
    else if (jamo === "ㅇ") initialTokens = []; // silent
    else {
      // fallback: use the original token (for complex clusters or unknown)
      initialTokens = [lastTok.token];
    }

    // Insert each initial token (preserving order) at the beginning of the next note
    for (var ti = initialTokens.length - 1; ti >= 0; ti--) {
      var movedToken = { token: initialTokens[ti], role: "initial", jamo: jamo };
      next.tokens.unshift(movedToken);
    }

    // Remove the final token from the current note
    curr.tokens.pop();
  }

  // Apply additional phonological rules (nasalization, aspiration, tensification)
  applyPhonologicalRulesBetweenNotes(noteData, hieutDeletion);

  // Pass 2: generate phonemes and attributes for each note using the updated tokens
  var prevLastToken = null;
  var shortenNextInitial = false;

  for (var i = 0; i < noteData.length; i++) {
    var data = noteData[i];
    var note = data.note;
    var rawTokens = data.tokens;

    if (rawTokens.length === 0) {
      // No Hangul in this note – skip
      prevLastToken = null;
      shortenNextInitial = false;
      continue;
    }

    // Apply phonological rules (diphthong splitting, etc.)
    var ruleResultArray = applyRules(rawTokens);
    var tokens = ruleResultArray[0];               // renamed for clarity
    var nextShortenInitial = ruleResultArray[1];

    // Ensure any final ㄹ that became "l" is corrected to lateral "r\`"
    for (var t = 0; t < tokens.length; t++) {
      if (tokens[t].role === "final" && tokens[t].token === "l") {
        tokens[t].token = "r\\`";
      }
    }

    // Assemble phoneme string
    var phonemeParts = [];
    for (var t = 0; t < tokens.length; t++) {
      phonemeParts.push(tokens[t].token);
    }
    var phonemeString = phonemeParts.join(" ");

    // Compute attributes
    var noteDuration = note.getDuration();
    var durArray = new Array(tokens.length);
    var strArray = new Array(tokens.length);

    for (var t = 0; t < tokens.length; t++) {
      var token = tokens[t].token;
      var role  = tokens[t].role;
      var prevToken = (t === 0) ? prevLastToken : tokens[t-1].token;

      var attrs = computeAttrs(token, role, noteDuration, prevToken);
      var dur = attrs.duration;
      var str = attrs.strength;

      // Rule 9: [j] before [6] → 85% duration for j
      if (token === "j" && t+1 < tokens.length && tokens[t+1].token === "6") {
        dur = 0.85;
      }

      // Rule: shorten first initial to 20% if flagged by previous 의
      if (t === 0 && role === "initial" && shortenNextInitial) {
        dur = 0.2;
      }

      durArray[t] = dur;
      strArray[t] = str;
    }

    // Commit to note
    note.setPhonemes(phonemeString);
    var attrsObj = note.getAttributes();
    attrsObj.dur = durArray;
    attrsObj.strength = strArray;
    note.setAttributes(attrsObj);

    // Update context for next note
    prevLastToken = tokens.length > 0 ? tokens[tokens.length-1].token : null;
    shortenNextInitial = nextShortenInitial;
  }
}

// ─── Duration / Strength Attribute Rules ─────────────────────
function computeAttrs(token, role, noteDuration, prevToken) {
  var dur = 1.0;
  var str = 1.0;

  // Rule 1: [s] → 50% duration
  if (token === "s") dur = 0.5;

  // Rule 2: [7] → 20% strength
  if (token === "7") str = 0.2;

  // Rule 3: Initial [n] [m] → 80% duration; 50% if note ≤ eighth
  if (role === "initial" && (token === "n" || token === "m")) {
    dur = noteDuration <= EIGHTH ? 0.5 : 0.8;
  }

  // Rule 4: Initial [l] → 30% duration
  if (role === "initial" && token === "l") dur = 0.3;

  // Rule 5: Final [n] → 50% duration if note ≥ eighth
  if (role === "final" && token === "n" && noteDuration >= EIGHTH) dur = 0.5;

  // Rule 6: [n] [N] [m] [l] → 75% strength
  if (token === "n" || token === "N" || token === "m" || token === "l") str = 0.75;

  // Rule 7: Initial [t] [p] [k] (plain) → 90% duration
  if (role === "initial" && (token === "t" || token === "p" || token === "k")) dur = 0.9;

  // Rule 8: [r\`] → 70% duration, 50% strength
  if (token === "r\\`") { dur = 0.7; str = 0.5; }

  // Rules 10 & 11: [x] (ㅎ)
  if (token === "x") {
    if (prevToken && (prevToken === "n" || prevToken === "N" || prevToken === "m" ||
                      prevToken === "t" || prevToken === "p" || prevToken === "k" ||
                      prevToken === "t_}" || prevToken === "p_}" || prevToken === "k_}" ||
                      prevToken === "th" || prevToken === "ph" || prevToken === "kh" ||
                      prevToken === "ts\\h" || prevToken === "ts\\_}" || prevToken === "ts\\")) {
      // after nasal or stop → 30% duration, 40% strength
      dur = 0.3;
      str = 0.4;
    } else {
      // elsewhere → 60% strength only
      str = 0.6;
    }
  }

  // Rule 12: [ph] [th] [kh] [ts\h] → 110% duration, 125% strength
  if (token === "ph" || token === "th" || token === "kh" || token === "ts\\h") {
    dur = 1.1;
    str = 1.25;
  }

  return { duration: dur, strength: str };
}

// ─── Per-Note Processing ──────────────────────────────────────
function processNote(note, prevNoteLastToken, shortenNextInitial) {
  var lyrics = note.getLyrics().trim();
  if (!lyrics) {
    return { lastToken: prevNoteLastToken, shortenNextInitial: false };
  }

  // Collect raw tokens from every Hangul syllable in the lyric field
  var rawTokens = [];
  for (var j = 0; j < lyrics.length; j++) {
    var ch = lyrics.charAt(j);
    if (isHangulSyllable(ch)) {
      var sylTokens = syllableToTokens(ch);
      for (var k = 0; k < sylTokens.length; k++) {
        rawTokens.push(sylTokens[k]);
      }
    }
  }

  if (rawTokens.length === 0) {
    return { lastToken: prevNoteLastToken, shortenNextInitial: false };
  }

  // Apply phonological rules (diphthong splitting, etc.)
  var ruleResultArray = applyRules(rawTokens);
  var ruleTokens = ruleResultArray[0];
  var nextShortenInitial = ruleResultArray[1];
  var tokens = ruleTokens;

  // Assemble phoneme string for SynthV
  var phonemeParts = [];
  for (var i = 0; i < tokens.length; i++) {
    phonemeParts.push(tokens[i].token);
  }
  var phonemeString = phonemeParts.join(" ");

  // Compute per-phoneme attributes
  var noteDuration = note.getDuration();
  var durArray = new Array(tokens.length);
  var strArray = new Array(tokens.length);

  for (var i = 0; i < tokens.length; i++) {
    var token = tokens[i].token;
    var role  = tokens[i].role;
    var prevToken = (i === 0) ? prevNoteLastToken : tokens[i-1].token;

    var attrs = computeAttrs(token, role, noteDuration, prevToken);
    var dur = attrs.duration;
    var str = attrs.strength;

    // Rule 9: [j] before [6] → 85% duration for j
    if (token === "j" && i+1 < tokens.length && tokens[i+1].token === "6") {
      dur = 0.85;
    }

    // Rule: shorten first initial to 20% if flagged by previous 의
    if (i === 0 && role === "initial" && shortenNextInitial) {
      dur = 0.2;
    }

    durArray[i] = dur;
    strArray[i] = str;
  }

  // Commit phonemes and attributes to the note
  note.setPhonemes(phonemeString);

  var attrs = note.getAttributes();
  attrs.dur = durArray;
  attrs.strength = strArray;
  note.setAttributes(attrs);

  var lastToken = tokens.length > 0 ? tokens[tokens.length-1].token : prevNoteLastToken;
  return { lastToken: lastToken, shortenNextInitial: nextShortenInitial };
}

// ─── Helper: get all selected notes, including those inside groups ──
function getAllSelectedNotes(selection) {
  var notes = [];
  var mainNotes = selection.getSelectedNotes();
  for (var i = 0; i < mainNotes.length; i++) {
    notes.push(mainNotes[i]);
  }
  var groups = selection.getSelectedGroups();
  for (var g = 0; g < groups.length; g++) {
    var groupNotes = groups[g].getNotes();
    for (var n = 0; n < groupNotes.length; n++) {
      notes.push(groupNotes[n]);
    }
  }
  return notes;
}

function setLanguageToMandarin(notes) {
  for (var i = 0; i < notes.length; i++) {
    var note = notes[i];
    var attrs = note.getAttributes();
    attrs.language = "cmn";  // ISO 639-3 code for Mandarin Chinese
    note.setAttributes(attrs);
  }
}

// ─── Entry Point ──────────────────────────────────────────────
function main() {
  var selection = SV.getMainEditor().getSelection();
  var notes = getAllSelectedNotes(selection);

  if (notes.length === 0) {
    SV.showMessageBox("Hangul Converter", "No notes selected.");
    SV.finish();
    return;
  }

  SV.showOkCancelBoxAsync(
    "Hieut (ㅎ) Deletion",
    "Apply ㅎ deletion after sonorants?\n\n" +
    "Examples:\n" +
    "  원히  →  [워니]\n" +
    "  않아  →  [아나]\n" +
    "  많이  →  [마니]\n" +
    "  잃어  →  [이러]\n\n" +
    "OK = yes (recommended)   Cancel = no",
    function(hieutDeletion) {
      notes.sort(function(a, b) {
        return a.getOnset() - b.getOnset();
      });

      setLanguageToMandarin(notes);
      processNotesWithLiaison(notes, hieutDeletion);

      SV.showMessageBoxAsync("Hangul Converter", "Conversion complete. Make sure to set the language to Mandarin for proper phoneme rendering.", function() {
        SV.finish();
      });
    }
  );

}
