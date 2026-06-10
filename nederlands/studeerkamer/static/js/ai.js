/* AI client. All requests go through /api/ai/* (server has the keys).
 * Keeps the same surface as the original ai.js so views don't need to change. */
(function () {
  function settings() { return window.Store.state.settings; }
  function today() { return new Date().toISOString().slice(0, 10); }

  // FNV-1a hash for the in-memory request cache (free repeat clicks).
  function hash(s) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return ("00000000" + (h >>> 0).toString(16)).slice(-8);
  }
  function cacheKey({ kind, src, model }) { return `${kind}:${model}:${hash(src)}`; }

  function bumpCounterLocal(kind) {
    const d = today();
    const log = window.Store.state.aiCallsByDay;
    if (!log[d]) log[d] = { total: 0, byKind: {} };
    log[d].total += 1;
    log[d].byKind[kind] = (log[d].byKind[kind] || 0) + 1;
  }
  function todayCount() {
    const d = today();
    const log = window.Store.state.aiCallsByDay[d];
    return log ? log.total : 0;
  }

  async function rawComplete({ system, user, messages, maxTokens = 800, json = false, model, reasoning = "low", kind }) {
    const usedModel = model || settings().aiModel || "gpt-5-mini";
    const body = {
      kind: kind || "complete",
      model: usedModel,
      maxTokens,
      json,
      reasoning,
    };
    if (Array.isArray(messages) && messages.length) body.messages = messages;
    else { body.system = system || ""; body.user = user || ""; }
    const r = await window.API.post("/api/ai/complete", body);
    return r.text || "";
  }

  async function complete(opts) {
    if (!settings().aiEnabled) throw new Error("AI is uitgeschakeld. Aan zetten in Instellingen.");
    if (!window.Store.state.aiConfig.openai) {
      throw new Error("Server heeft geen OpenAI-sleutel geconfigureerd (.env: OPENAI_API_KEY).");
    }
    const model = opts.model || settings().aiModel || "gpt-5-mini";
    const ckSource = opts.messages ? JSON.stringify(opts.messages) : (opts.system || "") + " " + (opts.user || "");
    const ck = cacheKey({ kind: opts.kind, src: ckSource, model });
    const cache = window.Store.state.aiCache;
    if (!opts.noCache && cache[ck]) {
      return { text: cache[ck].response, cached: true, model };
    }
    const text = await rawComplete({ ...opts, model });
    if (!opts.noCache) cache[ck] = { response: text, ts: Date.now(), model };
    bumpCounterLocal(opts.kind);
    return { text, cached: false, model };
  }

  async function testKey() {
    return rawComplete({
      kind: "test",
      system: "You answer in one word.",
      user: "Say OK.",
      maxTokens: 5,
    });
  }
  function clearCache() { window.Store.state.aiCache = {}; }
  function cacheSize() { return Object.keys(window.Store.state.aiCache || {}).length; }

  // Sync, like the original. Reads from Store.state.aiCallsByDay which
  // boot() has already populated from /api/ai/usage. Background mutations
  // (bumpCounterLocal) keep it fresh in-session.
  function recentCalls(days = 14) {
    const out = [];
    const log = window.Store.state.aiCallsByDay || {};
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      const e = log[iso] || { total: 0, byKind: {} };
      out.push({ iso, total: e.total || 0, byKind: e.byKind || {} });
    }
    return out;
  }

  function isConfigured() {
    return !!(settings().aiEnabled && window.Store.state.aiConfig.openai);
  }
  function softLimitReached() {
    return todayCount() >= (settings().aiSoftLimit || 50);
  }

  /* ============ OpenAI TTS / Azure TTS (proxied) ============ */
  async function openaiTTS(text, opts = {}) {
    const s = settings();
    return window.API.postBlob("/api/ai/tts", {
      provider: "openai",
      text,
      model: opts.model || s.ttsModel || "gpt-4o-mini-tts",
      voice: opts.voice || s.ttsVoice || "shimmer",
      instructions: opts.instructions,
    });
  }
  async function azureTTS(text, opts = {}) {
    const s = settings();
    return window.API.postBlob("/api/ai/tts", {
      provider: "azure",
      text,
      region: opts.region || s.azureRegion,
      voice: opts.voice || s.azureVoice || "nl-BE-DenaNeural",
      rate: opts.rate || s.azureRate || "0%",
    });
  }
  async function generateSpeech(text) {
    const provider = settings().ttsProvider || "openai";
    return provider === "azure" ? azureTTS(text) : openaiTTS(text);
  }
  async function testAzureKey() {
    const blob = await azureTTS("Hallo.");
    return blob.size > 0;
  }

  /* ============ Listening exercise generation ============ */
  const LEVEL_GUIDANCE = {
    B1: [
      "TARGET LEVEL: CEFR B1 — intermediate.",
      "Sentences: mostly simple to moderately complex. Limited subordinate clauses.",
      "Vocabulary: common everyday and practical, frequent collocations. Simple idioms only.",
      "Topics: concrete, familiar (daily life, hobbies, travel, work basics, short news items).",
      "Register: neutral, conversational. Avoid academic/legal/literary phrasing.",
      "Tempo target: ~125 words/min equivalent.",
    ].join("\n"),
    B2: [
      "TARGET LEVEL: CEFR B2 — upper-intermediate.",
      "Sentences: mix of simple and complex. Subordinate clauses, passive voice, hypotheticals OK.",
      "Vocabulary: broader — current events, work, education, society. Some idioms, common formal markers.",
      "Topics: concrete + some abstract (opinions, comparisons, social issues).",
      "Register: neutral to slightly formal, e.g. journalistic.",
      "Tempo target: ~135 words/min equivalent.",
    ].join("\n"),
    C1: [
      "TARGET LEVEL: CEFR C1 — advanced.",
      "Sentences: complex syntax, nominalisations, embedded clauses, varied connectors.",
      "Vocabulary: abstract, nuanced, idiomatic; precise register-appropriate word choice; formal/academic collocations expected.",
      "Topics: abstract, professional, academic, policy, philosophical.",
      "Register: formal/academic/editorial as the topic warrants.",
      "Tempo target: ~145 words/min equivalent.",
    ].join("\n"),
  };

  /* ============ Vocab / questions / grammar from a user-authored script ============
   * The script is authored by the user. We never modify it — we only
   * read it to produce content for studying. Three separate calls so
   * each stays under Cloudflare's 100s edge timeout and so they can
   * run in parallel from runBuildPhase for shorter total wall-time.
   */

  async function extractListeningVocab({ script, level, language }) {
    const s = settings();
    const targetLang = language || s.outputLanguage || "Dutch (Belgian / Standard Dutch register)";
    const lvl = (level || "B2").toUpperCase();
    const guidance = LEVEL_GUIDANCE[lvl] || LEVEL_GUIDANCE.B2;

    const system = [
      `You extract vocabulary from a ${targetLang} listening script for a B1-C1 learner.`,
      "EXHAUSTIVE — every word/phrase above A2. NO upper limit; 50-150 entries is typical.",
      "",
      guidance,
      "",
      "Skip only the most basic A2 function words (de, het, een, en, of, maar, ook, dat, dit, is, was, voor, op, in, aan, met, om, niet, ja, hij, zij, ik, je, jij, wij, jullie, hun, zo, nu, dan, hier, daar). When in doubt INCLUDE it. Preserve form as it appears in the script.",
      "",
      "Respond ONLY with valid JSON — no markdown:",
      "{",
      '  "vocab": [',
      '    {"dutch":"<word/phrase from script>", "english":"<short gloss>", "note":"<optional one-line note>", "core":true|false, "level":"A2"|"B1"|"B2"|"C1"}',
      "    // core=true ONLY for STRUCTURAL/closed-class words (conjunctions, prepositions, pronouns, modal particles, discourse markers, question words, negation, demonstratives, quantifiers, comparison particles, sentential adverbs, time/aspect markers).",
      "  ]",
      "}",
    ].join("\n");

    const r = await complete({
      kind: "listening-vocab",
      messages: [
        { role: "system", content: system },
        { role: "user", content: "Script:\n\n" + script },
      ],
      maxTokens: 9000,
      json: true,
      noCache: true,
      model: settings().aiContentModel || "gpt-5.4",
    });
    const parsed = JSON.parse(r.text);
    return Array.isArray(parsed.vocab) ? parsed.vocab : [];
  }

  /* Split the script into sentence chunks (~5 sentences each). The user
   * wants ~one question per sentence, so we run question generation per
   * chunk in parallel — single-shot generation for the whole script
   * would blow past Cloudflare's 100s edge timeout. Splitting on
   * paragraph + sentence boundaries keeps each chunk locally coherent.
   */
  function chunkScriptForQuestions(script, sentencesPerChunk = 5) {
    if (!script) return [];
    // Sentence-ish split: keep the punctuation with the sentence, treat
    // newlines as soft boundaries. Quote-aware enough for B1-C1 prose.
    const sentences = script
      .replace(/\s+/g, " ")
      .split(/(?<=[.!?…])\s+(?=[A-ZÀ-Ý"'„""'(])/g)
      .map((s) => s.trim())
      .filter(Boolean);
    if (!sentences.length) return [];
    const chunks = [];
    for (let i = 0; i < sentences.length; i += sentencesPerChunk) {
      chunks.push(sentences.slice(i, i + sentencesPerChunk).join(" "));
    }
    return chunks;
  }

  async function extractQuestionsForChunk({ fullScript, chunk, chunkIndex, totalChunks, level, language }) {
    const s = settings();
    const targetLang = language || s.outputLanguage || "Dutch (Belgian / Standard Dutch register)";
    const lvl = (level || "B2").toUpperCase();
    const guidance = LEVEL_GUIDANCE[lvl] || LEVEL_GUIDANCE.B2;

    const system = [
      `You write multiple-choice comprehension questions in ${targetLang}. Quality matters more than speed.`,
      "",
      `You will receive the FULL script (for context — references, anaphora, theme) AND a CURRENT CHUNK of consecutive sentences from it. Generate questions ONLY about the sentences in the CURRENT CHUNK. (You may resolve references using the full script.)`,
      "",
      "QUANTITY: aim for ROUGHLY ONE QUESTION PER SENTENCE in the chunk. Skip only purely connective fillers ('Dat is leuk.', 'Oké.'). A 5-sentence chunk should produce 4-6 questions. No upper limit if a sentence is dense.",
      "",
      "VARIETY: across the chunk, rotate question types — never two of the same type in a row. Use a mix of:",
      "  • literal recall (what does the speaker say about X?)",
      "  • detail (number / where / when / who)",
      "  • inference (what does the speaker imply?)",
      "  • cause / consequence ('Waarom …?', 'Daardoor …?')",
      "  • vocab-in-context (wat betekent <word> in deze zin?)",
      "  • reference resolution (waar verwijst 'dat' / 'hij' naar?)",
      "  • paraphrase (welke zin betekent hetzelfde als …?)",
      "  • speaker attitude / register (hoe staat de spreker tegenover X?)",
      "",
      "QUALITY:",
      "  • Each question must have a single unambiguously correct answer.",
      "  • Distractors must be PLAUSIBLE — drawn from the script's world, similar in length and register, not obviously wrong.",
      "  • Avoid trick questions, double negatives, and 'all of the above'.",
      "  • The question + correct option must NOT verbatim-quote the script — paraphrase.",
      "  • Explanation cites the specific phrase from the script that supports the answer.",
      "",
      guidance,
      "",
      "Respond ONLY with valid JSON — no markdown, no commentary:",
      "{",
      '  "questions": [',
      '    {"q":"<question in ' + targetLang + '>",',
      '     "options":["a","b","c","d"],',
      '     "correctIndex":0,',
      '     "explanation":{"nl":"<korte uitleg + de citaat-frase>", "en":"<same in English>"}}',
      "  ]",
      "}",
    ].join("\n");

    const userMsg = [
      `FULL SCRIPT (chunk ${chunkIndex + 1} of ${totalChunks} — for context only):`,
      fullScript,
      "",
      "CURRENT CHUNK (generate questions about these sentences):",
      chunk,
    ].join("\n\n");

    const r = await complete({
      kind: "listening-questions",
      messages: [
        { role: "system", content: system },
        { role: "user", content: userMsg },
      ],
      maxTokens: 4000,
      json: true,
      noCache: true,
      model: settings().aiContentModel || "gpt-5.4",
    });
    const parsed = JSON.parse(r.text);
    return Array.isArray(parsed.questions) ? parsed.questions : [];
  }

  async function extractListeningQuestions({ script, level, language }) {
    const chunks = chunkScriptForQuestions(script, 5);
    if (!chunks.length) return [];
    // Fan out — each chunk is its own HTTP request, so Cloudflare's 100s
    // edge timeout applies per-call. Wall-time = slowest single chunk.
    const results = await Promise.all(chunks.map((chunk, i) =>
      extractQuestionsForChunk({
        fullScript: script,
        chunk,
        chunkIndex: i,
        totalChunks: chunks.length,
        level,
        language,
      }).catch((e) => {
        console.warn("question chunk " + (i + 1) + "/" + chunks.length + " failed:", e.message);
        return [];   // a single chunk failing shouldn't lose the whole set
      })
    ));
    return results.flat();
  }

  async function extractListeningGrammar({ script, level, language }) {
    const s = settings();
    const targetLang = language || s.outputLanguage || "Dutch (Belgian / Standard Dutch register)";
    const lvl = (level || "B2").toUpperCase();
    const guidance = LEVEL_GUIDANCE[lvl] || LEVEL_GUIDANCE.B2;

    const system = [
      `You write 3-5 short grammar / collocation notes drawn from a ${targetLang} listening script.`,
      "Each note: a title + a 2-3 sentence explanation referencing the script. Notes calibrated to the learner's level.",
      "",
      guidance,
      "",
      "Respond ONLY with valid JSON — no markdown:",
      "{",
      '  "grammar": [',
      '    {"point":"<short title>", "explanation":"<2-3 sentence explanation in ' + targetLang + '>"}',
      "    // 3-5 entries",
      "  ]",
      "}",
    ].join("\n");

    const r = await complete({
      kind: "listening-grammar",
      messages: [
        { role: "system", content: system },
        { role: "user", content: "Script:\n\n" + script },
      ],
      maxTokens: 1800,
      json: true,
      noCache: true,
      model: settings().aiContentModel || "gpt-5.4",
    });
    const parsed = JSON.parse(r.text);
    return Array.isArray(parsed.grammar) ? parsed.grammar : [];
  }

  /* ============ STT (Whisper word timestamps) ============ */
  async function transcribeWithTimestamps(blob, opts = {}) {
    const form = new FormData();
    form.append("file", blob, "audio.mp3");
    form.append("language", opts.language || "nl");
    form.append("word_timings", "true");
    if (opts.prompt) form.append("prompt", opts.prompt);
    const data = await window.API.postForm("/api/ai/transcribe", form);
    return { text: data.text || "", words: data.words || [] };
  }

  /* ============ Correct user-written essay (Schrijven section) ============ */
  const CORRECTION_GUIDANCE = {
    B1: [
      "TARGET LEVEL: CEFR B1 — be lenient.",
      "Only flag clear errors: subject-verb agreement, basic word order, missing/wrong articles, wrong verb tenses, sentence-start capitalisation, proper-noun capitalisation, obvious wrong word choice.",
      "Do NOT fix register issues, do NOT replace correct simple phrasing with more elaborate variants, do NOT invent stylistic improvements.",
      "Tone of explanations: encouraging, concise.",
    ].join("\n"),
    B2: [
      "TARGET LEVEL: CEFR B2 — moderate strictness.",
      "Flag all B1 errors plus: missing 'het' in superlatives, wrong/missing preposition collocations (denken AAN, leuk vinden AAN), missing reflexives, common false friends, verb-final in subordinate clauses, weak connectors.",
      "Do NOT replace correct B1-style simple sentences with complex ones for style. Preserve learner's complexity level.",
    ].join("\n"),
    C1: [
      "TARGET LEVEL: CEFR C1 — pedantic, CNaVT-examinator strict.",
      "Flag every B1 + B2 error plus: register mismatches, weak/unidiomatic collocations, structural redundancy, awkward word order even when grammatical, missing nuance words, suboptimal connectors for cohesion.",
      "Still preserve the learner's voice and complexity level; do NOT inflate simple correct sentences. 'Mooier' is not a reason to change.",
    ].join("\n"),
  };

  async function correctEssay({ essay, level, language }) {
    const s = settings();
    const targetLang = language || s.outputLanguage || "Dutch (Belgian / Standard Dutch register)";
    const lvl = (level || "B2").toUpperCase();
    const guidance = CORRECTION_GUIDANCE[lvl] || CORRECTION_GUIDANCE.B2;

    const system = [
      `You are a strict ${targetLang} writing coach. The learner has written an essay and wants sentence-by-sentence corrections at CEFR ${lvl}.`,
      "",
      guidance,
      "",
      "Respond ONLY with valid JSON — no markdown, no commentary:",
      "{",
      `  "title": "<3-6 word title in ${targetLang} summarising the essay, no quotes>",`,
      '  "sentences": [',
      "    {",
      '      "original": "<exact original sentence as written>",',
      '      "corrected": "<corrected version (same sentence if no changes needed)>",',
      '      "needed": true|false,',
      '      "notes": [',
      "        {",
      '          "error": "<exact citation of the wrong phrase>",',
      '          "fix": "<the right replacement>",',
      `          "rule": "<1-2 sentence explanation in ${targetLang} of the underlying rule>",`,
      '          "rubric": "Grammatica" | "Lexicaal" | "Register" | "Coherentie" | "Spelling"',
      "        }",
      "      ]",
      "    }",
      "    // one entry per sentence in the essay, in original order",
      "  ],",
      '  "correctedFull": "<the complete corrected essay as connected prose, paragraphs preserved with blank lines>",',
      '  "score": {',
      '    "overall": <number 1-10>,',
      '    "summary":     {"nl": "<one-sentence verdict in ' + targetLang + '>",  "en": "<same verdict in English>"},',
      '    "criteria": {',
      '      "grammatica": {"score": <1-10>, "nl": "<2-3 sentence qualitative comment in ' + targetLang + '>", "en": "<same in English>"},',
      '      "lexicaal":   {"score": <1-10>, "nl": "...", "en": "..."},',
      '      "coherentie": {"score": <1-10>, "nl": "...", "en": "..."},',
      '      "register":   {"score": <1-10>, "nl": "...", "en": "..."},',
      '      "spelling":   {"score": <1-10>, "nl": "...", "en": "..."}',
      "    },",
      '    "improvements": [',
      '      {"nl": "<concrete actionable suggestion in ' + targetLang + '>", "en": "<same in English>"},',
      '      {"nl": "...", "en": "..."},',
      '      {"nl": "...", "en": "..."}',
      "      // exactly THREE strategic top-priority improvements — not sentence-level fixes (those go in `sentences[].notes`).",
      "      // Pick the three changes that would raise the overall score most.",
      "    ]",
      "  },",
      '  "vocab": [',
      '    {"dutch":"<word/phrase from the corrected version>", "english":"<short gloss>", "note":"<optional usage note>", "core":true|false, "level":"A2|B1|B2|C1"}',
      "    // EXHAUSTIVE — every word/phrase above A2 level from the corrected version. NO upper limit, 50-150 is typical.",
      "    // core=true ONLY for structural/closed-class words.",
      "  ],",
      '  "grammar": [',
      '    {"point":"<short grammar/collocation title>", "explanation":"<2-3 sentence explanation>"}',
      "    // 3-5 grammar/collocation lessons drawn from the actual mistakes or interesting structures in this essay",
      "  ]",
      "}",
      "",
      "KEY RULES:",
      "- Split the original essay into sentences exactly as the user wrote them. One JSON entry per sentence.",
      "- For sentences with no errors, set needed=false and copy original verbatim to corrected. Empty notes array.",
      "- 'notes' must cite specific words/phrases from THIS sentence, not abstract advice.",
      "- 'correctedFull' must be the actual deliverable text — joinable as prose, with proper sentence spacing.",
      "- SCORING: 'overall' and each sub-criterion rate how well the essay meets the chosen " + lvl + " level. 10 = no flaws at this level; 1 = pervasive issues. Be honest, not generous.",
      "- ANTI-HALLUCINATION: NEVER invent acronyms, organisation names, dates, or facts about the user. If the user wrote 'CNaVT', do NOT change it to anything else. Proper nouns and acronyms stay verbatim unless they are objectively misspelled.",
      "- PROOFREAD YOUR OUTPUT: do not introduce new typos. Every Dutch word you write must be spelled correctly. Re-check the final JSON before returning it.",
      "- Keep notes concise; rule explanations max 2 sentences.",
      "- Keep total JSON under 14000 tokens.",
    ].join("\n");

    const r = await complete({
      kind: "essay-correct",
      messages: [
        { role: "system", content: system },
        { role: "user", content: "Essay:\n\n" + essay },
      ],
      maxTokens: 15000,
      json: true,
      noCache: true,
      // Heavy correction path — content model, not chat model.
      model: settings().aiContentModel || "gpt-5.4",
    });
    return JSON.parse(r.text);
  }

  /* ============ Dutch spelling validation (self-critique pass) ============
   * GPT-5 occasionally invents plausible-looking but non-existent Dutch
   * compounds in generated text (e.g. "baanrekeneprojecten" for
   * "baanbrekende projecten"). A separate focused call catches them — the
   * monolithic generation prompt underinvests in this because it's
   * juggling six other concerns.
   *
   * Returns an array of {original, fix} pairs. Only objective spelling
   * errors — never style, register, or grammar changes.
   */
  async function validateDutchSpelling(text) {
    if (!text || text.length < 20) return [];
    const system = [
      "Je bent een strenge Nederlandse spellingcontroleur.",
      "Bekijk de tekst zin per zin en vind ALLE objectieve spelfouten:",
      "- Niet-bestaande woorden (verzonnen samenstellingen, typfouten)",
      "- Letterlijke spelfouten: ontbrekende, dubbele of verkeerde letters",
      "- Niet-bestaande werkwoordvormen of vervoegingen",
      "- Eigen woorden die geen erkend Nederlands woord zijn (bv. 'zonelijke', 'streekt', 'voogd' waar 'volgt' bedoeld is)",
      "NEGEER:",
      "- Stijl, register",
      "- Belgisch-Nederlands vs Hollands-Nederlands verschillen",
      "- Eigennamen, acroniemen, leenwoorden",
      "Antwoord ALLEEN met geldige JSON, geen markdown:",
      '{ "fixes": [ { "original": "<exact verkeerd geschreven woord>", "fix": "<correcte vorm>" } ] }',
      "Als er geen fouten zijn, antwoord met { \"fixes\": [] }.",
      "Voorbeelden van wat WEL moet worden gevangen:",
      '  "baanrekeneprojecten" → "baanbrekende projecten"',
      '  "lijft" (waar bedoeld blijft) → "blijft"',
      '  "defineert" → "definieert"',
      '  "rijkt" (waar reikt bedoeld) → "reikt"',
      '  "ontsag" → "ontzag"',
      '  "zonelijke" → "ongekende"',
      '  "Sponsordeels" → "Sponsordeals"',
      '  "streekt" (waar spreekt bedoeld) → "spreekt"',
      '  "voogd" (waar volgt bedoeld) → "volgt"',
      '  "resteerde" (waar presteerde) → "presteerde"',
      "Voorbeelden van wat NIET gefixt mag worden (laat met rust):",
      "  'middenklasse' (correct samenstelling)",
      "  'CNaVT' (acroniem)",
      "  'India' (eigennaam)",
      "Wees grondig — als je twijfelt of een woord bestaat, kijk er naar in mentale woordenboek. Liever te veel dan te weinig fixes.",
    ].join("\n");
    const r = await complete({
      kind: "spelling-check",
      messages: [
        { role: "system", content: system },
        { role: "user", content: text },
      ],
      maxTokens: 2500,
      json: true,
      noCache: true,
      model: "gpt-5.5",   // validation hardcoded to strongest — kosten zijn klein voor zo'n korte call
    });
    try {
      const parsed = JSON.parse(r.text);
      return Array.isArray(parsed.fixes) ? parsed.fixes.filter((f) => f && f.original && f.fix && f.original !== f.fix) : [];
    } catch (e) {
      return [];
    }
  }

  /* ============ Dutch usage validation (second self-critique pass) ============
   * Complements validateDutchSpelling: catches errors a spelling check
   * deliberately doesn't (grammar declension, wrong-word-but-spelled-correctly,
   * weird capitalization, particle/pronoun misuse).
   */
  async function validateDutchUsage(text) {
    if (!text || text.length < 20) return [];
    const system = [
      "Je bent een strenge Nederlandse taalkundige (CNaVT C1-niveau). Lees ZIN PER ZIN — eerst grammaticale kern (onderwerp/werkwoord), dan rest.",
      "Bekijk de tekst en vind UITSLUITEND deze categorieën fouten:",
      "1. Verkeerde adjectiefverbuiging (bv. 'ijzere discipline' → 'ijzeren discipline')",
      "2. Werkwoorden die correct gespeld zijn maar de verkeerde betekenis hebben in deze context (bv. 'beten' waar 'batten' bedoeld is)",
      "3. Verkeerde of ontbrekende voornaamwoorden / partikels (bv. 'verwacht dat te uitblinkt' → 'verwacht dat je uitblinkt')",
      "4. Subject-verb mismatches: enkelvoudig werkwoord met meervoudig onderwerp of omgekeerd, vooral met onpersoonlijke 'men/je/ze'",
      "5. Vreemd of niet-natuurlijk gekozen voornaamwoord als onderwerp (bv. 'Als ze in België over X vraagt' — wie is 'ze'? Beter: 'Als men over X spreekt' of 'Als je het over X hebt')",
      "6. Onnodige hoofdletters middenin de zin (bv. 'bij Roem' → 'bij roem'). Eigennamen en taalnamen mogen wel hoofdletters hebben.",
      "7. Verkeerde collocaties of voorzetselgebruik (bv. 'denken voor' → 'denken aan')",
      "8. Werkwoordsvolgorde in bijzinnen (PV moet aan het einde staan)",
      "9. Verkeerd hulpwerkwoord bij perfectum (hebben vs zijn)",
      "NEGEER:",
      "- Pure spelfouten (die gebeuren in een andere pas)",
      "- Belgisch-Nederlands vs Hollands-Nederlands verschillen op woordkeuze-niveau",
      "- Stilistische voorkeur als de zin grammaticaal juist is",
      "Antwoord ALLEEN met geldige JSON, geen markdown. ELKE fix moet kort genoeg zijn voor whole-word substitutie:",
      '{ "fixes": [ { "original": "<exacte frase zoals geschreven, max 5 woorden>", "fix": "<correcte vorm>" } ] }',
      "Als er geen fouten zijn, antwoord met { \"fixes\": [] }.",
      "Wees grondig. Lees elke zin twee keer. Liever te veel dan te weinig fixes.",
    ].join("\n");
    const r = await complete({
      kind: "usage-check",
      messages: [
        { role: "system", content: system },
        { role: "user", content: text },
      ],
      maxTokens: 2500,
      json: true,
      noCache: true,
      model: "gpt-5.5",   // validation hardcoded to strongest
    });
    try {
      const parsed = JSON.parse(r.text);
      return Array.isArray(parsed.fixes) ? parsed.fixes.filter((f) => f && f.original && f.fix && f.original !== f.fix) : [];
    } catch (e) {
      return [];
    }
  }

  /* Apply spelling/usage fixes to a string.
   * - Single-word fixes use word-boundary regex so substrings don't bleed.
   * - Multi-word fixes (from validateDutchUsage) match the whole phrase
   *   literally so we don't accidentally rewrite text that just shares a
   *   prefix.
   */
  function applySpellingFixes(text, fixes) {
    if (!text || !fixes || !fixes.length) return text;
    let out = text;
    for (const { original, fix } of fixes) {
      const safe = original.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      // Multi-word phrases skip the \b prefix so they match phrasing
      // that starts mid-clause.
      const isPhrase = /\s/.test(original);
      const re = new RegExp(isPhrase ? safe : "\\b" + safe + "\\b", "g");
      out = out.replace(re, fix);
    }
    return out;
  }

  /* ============ Re-extract vocab from existing script ============ */
  async function extractVocab({ script, language }) {
    const s = settings();
    const targetLang = language || s.outputLanguage || "Dutch (Belgian / Standard Dutch register)";
    const system = [
      `You extract vocabulary from a ${targetLang} text for a B1-C1 learner.`,
      "Goal: EXHAUSTIVE extraction. Every word/phrase above A2 level. NO upper limit.",
      "Include every B1+ verb/adjective/abstract noun/compound noun/derivation/collocation/multi-word expression/domain term/connector above A2.",
      "Skip only the most basic A2 function words (de, het, een, en, of, maar, ook, dat, dit, is, was, voor, op, in, aan, met, om, niet, ja, hij, zij, ik, je, jij, wij, jullie, hun, zo, nu, dan, hier, daar).",
      "When in doubt INCLUDE it.",
      "Preserve form as it appears in the script.",
      "Respond ONLY with valid JSON: {\"vocab\": [{\"dutch\":\"...\", \"english\":\"...\", \"note\":\"...\", \"core\":true|false, \"level\":\"A2|B1|B2|C1\"}]}",
      "core=true ONLY for structural/closed-class words (conjunctions, prepositions, pronouns, modal particles, discourse markers, question words, negation, demonstratives, quantifiers, comparison particles, sentential adverbs, time/aspect markers).",
      "level: honest CEFR estimate.",
      "Keep notes concise (max 1 line each).",
    ].join("\n");
    const r = await complete({
      kind: "vocab-extract",
      messages: [{ role: "system", content: system }, { role: "user", content: "Script:\n\n" + script }],
      maxTokens: 10000,
      json: true,
      noCache: true,
    });
    const parsed = JSON.parse(r.text);
    return Array.isArray(parsed.vocab) ? parsed.vocab : [];
  }

  window.AI = {
    complete,
    testKey,
    clearCache,
    cacheSize,
    todayCount,
    recentCalls,
    isConfigured,
    softLimitReached,
    openaiTTS,
    azureTTS,
    generateSpeech,
    testAzureKey,
    extractListeningVocab,
    extractListeningQuestions,
    extractListeningGrammar,
    correctEssay,
    extractVocab,
    transcribeWithTimestamps,
    validateDutchSpelling,
    validateDutchUsage,
    applySpellingFixes,
  };
})();
