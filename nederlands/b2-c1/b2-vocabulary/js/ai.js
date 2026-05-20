/* OpenAI wrapper.
 * - Browser-direct calls; key lives in localStorage only.
 * - Per-request cache so repeat clicks are free.
 * - Daily call counter for transparency + soft cap. */
(function () {
  const API_URL = "https://api.openai.com/v1/chat/completions";

  function settings() {
    return window.Store.state.settings;
  }
  function today() { return new Date().toISOString().slice(0, 10); }

  // Stable hash of a request (model + system + user). FNV-1a 32-bit.
  function hash(s) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return ("00000000" + (h >>> 0).toString(16)).slice(-8);
  }

  function cacheKey({ kind, system, user, model }) {
    return `${kind}:${model}:${hash(system + "" + user)}`;
  }

  function bumpCounter(kind) {
    const d = today();
    const log = window.Store.state.aiCallsByDay;
    if (!log[d]) log[d] = { total: 0, byKind: {} };
    log[d].total += 1;
    log[d].byKind[kind] = (log[d].byKind[kind] || 0) + 1;
    window.Store.save();
  }

  function todayCount() {
    const d = today();
    const log = window.Store.state.aiCallsByDay[d];
    return log ? log.total : 0;
  }

  // Resolve OpenAI completion. Throws on error.
  async function rawComplete({ system, user, maxTokens = 400, json = false, model }) {
    const key = settings().apiKey;
    if (!key) throw new Error("Geen API-sleutel ingesteld. Ga naar Instellingen.");
    const usedModel = model || settings().aiModel || "gpt-4o-mini";

    const body = {
      model: usedModel,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      max_tokens: maxTokens,
      temperature: 0.4,
    };
    if (json) body.response_format = { type: "json_object" };

    const resp = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + key,
      },
      body: JSON.stringify(body),
    });
    if (!resp.ok) {
      const txt = await resp.text().catch(() => "");
      if (resp.status === 401) throw new Error("API-sleutel ongeldig (401). Controleer in Instellingen.");
      if (resp.status === 429) throw new Error("Te veel aanvragen (429). Probeer over een minuut.");
      if (resp.status === 402) throw new Error("Betaling vereist (402). Controleer je OpenAI-account.");
      throw new Error(`OpenAI fout ${resp.status}: ${txt.slice(0, 200)}`);
    }
    const data = await resp.json();
    return (data.choices?.[0]?.message?.content || "").trim();
  }

  /**
   * High-level call with caching + counter.
   * opts = { kind, system, user, maxTokens, json, noCache }
   * Returns the response string (and the JSON-parsed object if json:true).
   */
  async function complete(opts) {
    if (!settings().aiEnabled) throw new Error("AI is uitgeschakeld. Aan zetten in Instellingen.");
    const model = opts.model || settings().aiModel || "gpt-4o-mini";
    const ck = cacheKey({ kind: opts.kind, system: opts.system, user: opts.user, model });
    const cache = window.Store.state.aiCache;
    if (!opts.noCache && cache[ck]) {
      return { text: cache[ck].response, cached: true, model };
    }
    const text = await rawComplete({ ...opts, model });
    cache[ck] = { response: text, ts: Date.now(), model };
    bumpCounter(opts.kind);
    window.Store.save();
    return { text, cached: false, model };
  }

  // Test the user's key by asking the API to list its own model
  async function testKey() {
    const r = await rawComplete({
      system: "You answer in one word.",
      user: "Say OK.",
      maxTokens: 5,
    });
    return r;
  }

  function clearCache() {
    window.Store.state.aiCache = {};
    window.Store.save();
  }

  function cacheSize() {
    return Object.keys(window.Store.state.aiCache || {}).length;
  }

  function recentCalls(days = 14) {
    const out = [];
    const log = window.Store.state.aiCallsByDay || {};
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      const e = log[iso] || { total: 0, byKind: {} };
      out.push({ iso, total: e.total, byKind: e.byKind });
    }
    return out;
  }

  function isConfigured() {
    return !!(settings().apiKey && settings().aiEnabled);
  }

  function softLimitReached() {
    return todayCount() >= (settings().aiSoftLimit || 50);
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
  };
})();
