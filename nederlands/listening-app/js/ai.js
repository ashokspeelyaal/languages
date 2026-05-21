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
      "Then produce 5 multiple-choice comprehension questions, 8-12 useful vocabulary items, and 3-5 grammar / collocation notes.",
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
      "    // 8-12 entries; pick items at C1-level (collocations, idioms, register markers), not basic words",
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
      "Keep total JSON under 5000 tokens.",
    ].join("\n");

    const body = {
      model: usedModel,
      messages: [
        { role: "system", content: system },
        { role: "user", content: "Topic: " + topic },
      ],
      max_completion_tokens: 4000,
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

  window.AI = { generateExercise, tts, testKey, complete, isConfigured };
})();
