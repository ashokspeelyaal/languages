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

  async function rawComplete({ system, user, messages, maxTokens = 800, json = false, model, reasoning = "minimal", kind }) {
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

  async function generateListeningExercise({ topic, durationMinutes, language, level }) {
    const s = settings();
    const targetLang = language || s.outputLanguage || "Dutch (Belgian / Standard Dutch register)";
    const lvl = (level || "B2").toUpperCase();
    const guidance = LEVEL_GUIDANCE[lvl] || LEVEL_GUIDANCE.B2;
    const dur = durationMinutes || s.durationMinutes || 2.5;
    const wpm = lvl === "B1" ? 125 : (lvl === "C1" ? 145 : 135);
    const targetWords = Math.round(dur * wpm);

    const system = [
      `You are a language-learning content generator. The learner wants to practise LISTENING in ${targetLang} on a topic they choose.`,
      `Produce a self-contained spoken-style piece of about ${targetWords} words (~${dur} minutes spoken) in ${targetLang}, NATURAL register, written so it reads aloud cleanly.`,
      "",
      guidance,
      "",
      "Then produce 5 multiple-choice comprehension questions calibrated to the same level, EXHAUSTIVE vocabulary (every word/phrase above A2 level — NO upper limit; could be 50-150 entries), and 3-5 grammar / collocation notes.",
      "",
      "Respond ONLY with valid JSON — no markdown, no commentary:",
      "{",
      '  "title": "<3-6 word title in ' + targetLang + ', no quotes>",',
      '  "script": "<the spoken-language text, paragraphs separated by a blank line>",',
      '  "questions": [',
      '    {"q":"<question>", "options":["a","b","c","d"], "correctIndex":0, "explanation":{"nl":"...", "en":"..."}}',
      "    // 5 questions total — mix gist, detail, inference",
      "  ],",
      '  "vocab": [',
      '    {"dutch":"<word/phrase from the script>", "english":"<short English gloss>", "note":"<optional one-line usage note>", "core":true|false, "level":"A2"|"B1"|"B2"|"C1"}',
      "    // EXHAUSTIVE: every word/phrase above A2 level. Skip only the most basic function words (de, het, een, en, is, was, voor, op, in, aan, met, ...).",
      "    // 'core': true ONLY for STRUCTURAL/closed-class words — conjunctions, prepositions, pronouns, modal particles, discourse markers, question words, negation, demonstratives, quantifiers, comparison particles, sentential adverbs, time/aspect markers. NOT lexical verbs/nouns/adjectives.",
      "    // 'level': your honest CEFR estimate.",
      "  ],",
      '  "grammar": [',
      '    {"point":"<short grammar/collocation title>", "explanation":"<2-3 sentence explanation in NL>"}',
      "  ]",
      "}",
      "",
      "Keep total JSON under 12000 tokens. Prioritise completeness in vocab; concise notes (max 1 line).",
    ].join("\n");

    const r = await complete({
      kind: "listening-gen",
      messages: [
        { role: "system", content: system },
        { role: "user", content: "Topic: " + topic },
      ],
      maxTokens: 13000,
      json: true,
      noCache: true,
    });
    return JSON.parse(r.text);
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
      '    "summary": "<one-sentence overall verdict in ' + targetLang + '>",',
      '    "criteria": {',
      '      "grammatica": <1-10>,',
      '      "lexicaal":   <1-10>,',
      '      "coherentie": <1-10>,',
      '      "register":   <1-10>,',
      '      "spelling":   <1-10>',
      "    }",
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
    });
    return JSON.parse(r.text);
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
    generateListeningExercise,
    correctEssay,
    extractVocab,
    transcribeWithTimestamps,
  };
})();
