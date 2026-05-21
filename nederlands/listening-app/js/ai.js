/* OpenAI wrappers — chat completion + TTS. */
(function () {
  const CHAT_URL = "https://api.openai.com/v1/chat/completions";
  const TTS_URL  = "https://api.openai.com/v1/audio/speech";

  function key() {
    const k = window.Store.getSettings().apiKey;
    if (!k) throw new Error("Geen API-sleutel ingesteld. Open Instellingen.");
    return k;
  }

  /* ============ Chat completion (script + Q + vocab + grammar) ============ */
  async function generateExercise({ topic, durationMinutes, language, model }) {
    const s = window.Store.getSettings();
    const usedModel = model || s.chatModel || "gpt-5-mini";
    const targetLang = language || s.outputLanguage || "Dutch (Belgian / Standard Dutch register)";
    const dur = durationMinutes || s.durationMinutes || 2.5;
    const targetWords = Math.round(dur * 145); // ~145 wpm natural speech

    const system = [
      `You are a language-learning content generator. The learner wants to practise LISTENING in ${targetLang} on a topic they choose.`,
      `Produce a self-contained spoken-style piece of about ${targetWords} words (~${dur} minutes spoken) in ${targetLang}, NATURAL register, written so it reads aloud cleanly.`,
      "Then produce 5 multiple-choice comprehension questions, EXHAUSTIVE vocabulary (every word/phrase above A2 level — there is NO upper limit; could be 50-150 entries depending on script density), and 3-5 grammar / collocation notes.",
      "",
      "Respond ONLY with valid JSON in this exact shape — no markdown, no commentary:",
      "{",
      '  "title": "<short 3-6 word title in ' + targetLang + ', no quotes>",',
      '  "script": "<the spoken-language text, paragraphs separated by a blank line, no headings>",',
      '  "questions": [',
      '    {"q":"<question>", "options":["a","b","c","d"], "correctIndex":0, "explanation":{"nl":"...", "en":"..."}}',
      '    // 5 questions total',
      "  ],",
      '  "vocab": [',
      '    {"dutch":"<word or phrase from the script>", "english":"<short English gloss>", "note":"<optional one-line usage note>"}',
      "    // EXHAUSTIVE EXTRACTION — extract EVERY word and phrase above A2 level. No artificial limit.",
      "    // INCLUDE all of these (do not be selective):",
      "    //   - every B1+ verb (e.g. vermijden, biedt, vermijdt, dwingt, oplopen, inzetten)",
      "    //   - every B1+ adjective (e.g. aantrekkelijk, omslachtig, betrouwbaar, onderhoudbaar, pragmatisch, performance-kritisch)",
      "    //   - every abstract noun (e.g. geheugenveiligheid, vrijgave, betrouwbaarheid, maturiteit, leercurve, valkuilen)",
      "    //   - every compound noun (e.g. compilatietijden, ecosfeer, pakketbeheer, scriptingtalen)",
      "    //   - every derived form / nominalization (e.g. allocatie, vervanging, controle)",
      "    //   - every collocation and multi-word expression (e.g. 'bekend staan om', 'aan te treffen aan')",
      "    //   - every domain-specific term and technical jargon used",
      "    //   - every connector / discourse marker above A2 (e.g. tegelijkertijd, daarnaast, natuurlijk, toch, voor wie)",
      "    //",
      "    // SKIP only the most basic A2 function words: de, het, een, en, of, maar, ook, dat, dit, is, was, voor, op, in, aan, met, om, niet, ja, hij, zij, ik, je, jij, wij, jullie, hun, zo, nu, dan, hier, daar.",
      "    // When in doubt INCLUDE it. A learner who already knows the word doesn't lose anything by seeing it; missing one they don't know is worse.",
      "    // Preserve form as it appears in the script (e.g. 'aan de bel trekken' as one unit, not 'bel').",
      "    // Aim for completeness, not curation. 80-150 entries is normal for a dense script.",
      "  ],",
      '  "grammar": [',
      '    {"point":"<short grammar / collocation title>", "explanation":"<2-3 sentence explanation in NL>"}',
      "    // 3-5 entries",
      "  ]",
      "}",
      "",
      "QUESTION RULES:",
      "- Questions and options in " + targetLang + ".",
      "- Mix question types: gist, detail, inference.",
      "- Explanations in BOTH NL and EN.",
      "- correctIndex 0-based.",
      "- Distractors must be plausible but unambiguously wrong.",
      "",
      "SCRIPT RULES:",
      "- Sound natural when read aloud. No bullet lists. No headings. Connected prose.",
      "- Use varied sentence length and registered vocabulary appropriate for B2-C1 learners.",
      "- If the topic is non-Dutch (e.g. an Indian musician), keep proper names accurate but discuss them in " + targetLang + ".",
      "",
      "Keep total JSON under 12000 tokens. Vocab list can be long — prioritise completeness over brevity in the vocab section, but keep notes concise (max 1 line each).",
    ].join("\n");

    const body = {
      model: usedModel,
      messages: [
        { role: "system", content: system },
        { role: "user", content: "Topic: " + topic },
      ],
      max_completion_tokens: 13000,
      response_format: { type: "json_object" },
      reasoning_effort: "minimal",
    };

    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + key() },
      body: JSON.stringify(body),
    });
    if (!resp.ok) {
      const t = await resp.text().catch(() => "");
      throw new Error(`Generatie fout ${resp.status}: ${t.slice(0, 200)}`);
    }
    const data = await resp.json();
    window.Store.bumpCallCount("generate");
    const text = data.choices?.[0]?.message?.content || "{}";
    return JSON.parse(text);
  }

  /* ============ Re-extract vocab from an existing script ============ */
  // Cheap — no TTS, no question generation, just the maximalist vocab pass.
  async function extractVocab({ script, language, model }) {
    const s = window.Store.getSettings();
    const usedModel = model || s.chatModel || "gpt-5-mini";
    const targetLang = language || s.outputLanguage || "Dutch (Belgian / Standard Dutch register)";

    const system = [
      `You extract vocabulary from a ${targetLang} text for a B1-C1 learner.`,
      "Goal: EXHAUSTIVE extraction. Pull every word and phrase above A2 level. NO upper limit.",
      "",
      "INCLUDE all of these (do not be selective):",
      "  - every B1+ verb",
      "  - every B1+ adjective",
      "  - every abstract noun",
      "  - every compound noun",
      "  - every derived form / nominalization",
      "  - every collocation and multi-word expression (kept as a unit)",
      "  - every domain-specific term and technical jargon",
      "  - every connector / discourse marker above A2",
      "",
      "SKIP only the most basic A2 function words: de, het, een, en, of, maar, ook, dat, dit, is, was, voor, op, in, aan, met, om, niet, ja, hij, zij, ik, je, jij, wij, jullie, hun, zo, nu, dan, hier, daar.",
      "When in doubt INCLUDE it. A learner who already knows the word doesn't lose anything by seeing it; missing one they don't know is worse.",
      "Preserve form as it appears (e.g. 'aan de bel trekken' as one unit).",
      "Aim for completeness, not curation. 80-150 entries is normal for a dense script.",
      "",
      "Respond ONLY with valid JSON: {\"vocab\": [{\"dutch\":\"...\", \"english\":\"...\", \"note\":\"...\"}]}",
      "Keep notes concise (max 1 line each).",
    ].join("\n");

    const body = {
      model: usedModel,
      messages: [
        { role: "system", content: system },
        { role: "user", content: "Script:\n\n" + script },
      ],
      max_completion_tokens: 10000,
      response_format: { type: "json_object" },
      reasoning_effort: "minimal",
    };

    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + key() },
      body: JSON.stringify(body),
    });
    if (!resp.ok) {
      const t = await resp.text().catch(() => "");
      throw new Error(`Vocab-extractie fout ${resp.status}: ${t.slice(0, 200)}`);
    }
    const data = await resp.json();
    window.Store.bumpCallCount("vocab-reextract");
    const text = data.choices?.[0]?.message?.content || "{}";
    const parsed = JSON.parse(text);
    return Array.isArray(parsed.vocab) ? parsed.vocab : [];
  }

  /* ============ TTS ============ */
  async function tts(text, opts = {}) {
    const s = window.Store.getSettings();
    const model = opts.model || s.ttsModel || "gpt-4o-mini-tts";
    const voice = opts.voice || s.ttsVoice || "shimmer";
    const body = {
      model,
      input: text,
      voice,
      response_format: "mp3",
    };
    if (model === "gpt-4o-mini-tts") {
      body.instructions = "Spreek natuurlijk en helder, met goede prosodie, alsof je een podcast of radioprogramma inleest. Tempo: rustig.";
    }
    const resp = await fetch(TTS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + key() },
      body: JSON.stringify(body),
    });
    if (!resp.ok) {
      const t = await resp.text().catch(() => "");
      throw new Error(`TTS fout ${resp.status}: ${t.slice(0, 200)}`);
    }
    const blob = await resp.blob();
    window.Store.bumpCallCount("tts");
    return blob;
  }

  /* ============ Azure Speech TTS (Belgian voices) ============ */
  function escapeXML(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }

  async function azureTTS(text, opts = {}) {
    const s = window.Store.getSettings();
    const azKey = s.azureKey;
    const region = (opts.region || s.azureRegion || "westeurope").trim();
    if (!azKey) throw new Error("Geen Azure-sleutel ingesteld. Open Instellingen.");

    const voice = opts.voice || s.azureVoice || "nl-BE-DenaNeural";
    const rate = opts.rate || s.azureRate || "0%";
    const lang = voice.startsWith("nl-BE") ? "nl-BE" : (voice.startsWith("nl-NL") ? "nl-NL" : "nl-BE");

    const ssml = `<speak version='1.0' xml:lang='${lang}'>` +
      `<voice name='${voice}'>` +
      (rate && rate !== "0%" ? `<prosody rate='${escapeXML(rate)}'>${escapeXML(text)}</prosody>` : escapeXML(text)) +
      `</voice></speak>`;

    const url = `https://${encodeURIComponent(region)}.tts.speech.microsoft.com/cognitiveservices/v1`;
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": azKey,
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
        "User-Agent": "luisteren-app/1.0",
      },
      body: ssml,
    });
    if (!resp.ok) {
      const t = await resp.text().catch(() => "");
      if (resp.status === 401) throw new Error("Azure-sleutel ongeldig (401). Controleer in Instellingen.");
      if (resp.status === 403) throw new Error("Azure-toegang geweigerd (403) — controleer regio en quota.");
      if (resp.status === 404) throw new Error(`Azure-eindpunt niet gevonden — klopt de regio '${region}'?`);
      if (resp.status === 429) throw new Error("Te veel Azure-aanvragen (429). Probeer over een minuut.");
      throw new Error(`Azure TTS fout ${resp.status}: ${t.slice(0, 200)}`);
    }
    const blob = await resp.blob();
    window.Store.bumpCallCount("azure-tts");
    return blob;
  }

  /* ============ Dispatcher — picks provider from settings ============ */
  async function generateSpeech(text) {
    const provider = window.Store.getSettings().ttsProvider || "openai";
    if (provider === "azure") return azureTTS(text);
    return tts(text);
  }

  async function testAzureKey() {
    // A 2-character TTS is the cheapest valid request to verify auth + region
    const blob = await azureTTS("Hallo.");
    return blob.size > 0;
  }

  /* ============ Generic chat completion (used by selection-bar) ============ */
  async function complete({ system, user, messages, maxTokens, json, model, reasoning }) {
    const s = window.Store.getSettings();
    const usedModel = model || s.chatModel || "gpt-5-mini";
    const msgs = Array.isArray(messages) && messages.length
      ? messages
      : [
          { role: "system", content: system || "" },
          { role: "user", content: user || "" },
        ];
    const body = {
      model: usedModel,
      messages: msgs,
      max_completion_tokens: maxTokens || 600,
      reasoning_effort: reasoning || "minimal",
    };
    if (json) body.response_format = { type: "json_object" };

    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + key() },
      body: JSON.stringify(body),
    });
    if (!resp.ok) {
      const t = await resp.text().catch(() => "");
      if (resp.status === 401) throw new Error("API-sleutel ongeldig (401). Controleer in Instellingen.");
      if (resp.status === 429) throw new Error("Te veel aanvragen (429). Probeer over een minuut.");
      throw new Error(`OpenAI fout ${resp.status}: ${t.slice(0, 200)}`);
    }
    const data = await resp.json();
    window.Store.bumpCallCount("complete");
    return { text: (data.choices?.[0]?.message?.content || "").trim(), model: usedModel };
  }

  function isConfigured() {
    return !!window.Store.getSettings().apiKey;
  }

  /* ============ Test connection ============ */
  async function testKey() {
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + key() },
      body: JSON.stringify({
        model: window.Store.getSettings().chatModel || "gpt-5-mini",
        messages: [{ role: "user", content: "Say OK." }],
        max_completion_tokens: 10,
      }),
    });
    if (!resp.ok) {
      const t = await resp.text().catch(() => "");
      throw new Error(`${resp.status}: ${t.slice(0, 200)}`);
    }
    const data = await resp.json();
    return (data.choices?.[0]?.message?.content || "").trim();
  }

  window.AI = { generateExercise, extractVocab, tts, azureTTS, generateSpeech, testKey, testAzureKey, complete, isConfigured };
})();
