/* State + ExerciseStore — localStorage backed. */
(function () {
  const SETTINGS_KEY = "luister.settings.v1";
  const EX_KEY = "luister.exercises.v1";
  const ACTIVE_KEY = "luister.active";

  const defaultSettings = {
    apiKey: "",
    chatModel: "gpt-5-mini",
    // TTS — provider switch + per-provider settings
    ttsProvider: "openai",          // "openai" | "azure"
    ttsModel: "gpt-4o-mini-tts",
    ttsVoice: "shimmer",
    azureKey: "",
    azureRegion: "westeurope",
    azureVoice: "nl-BE-DenaNeural",
    azureRate: "0%",                // SSML prosody rate, e.g. "-10%" slower
    outputLanguage: "Dutch (Belgian / Standard Dutch register)",
    durationMinutes: 2.5,
    callsByDay: {},
  };

  function readSettings() {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (!raw) return { ...defaultSettings };
      const parsed = JSON.parse(raw);
      return Object.assign({}, defaultSettings, parsed || {});
    } catch (e) {
      return { ...defaultSettings };
    }
  }
  function writeSettings(s) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  }

  let settings = readSettings();

  function getSettings() { return settings; }
  function patchSettings(patch) {
    settings = Object.assign({}, settings, patch);
    writeSettings(settings);
    return settings;
  }
  function bumpCallCount(kind) {
    const today = new Date().toISOString().slice(0, 10);
    if (!settings.callsByDay[today]) settings.callsByDay[today] = {};
    settings.callsByDay[today][kind] = (settings.callsByDay[today][kind] || 0) + 1;
    writeSettings(settings);
  }

  /* ============ Exercises ============ */
  function nowISO() { return new Date().toISOString(); }
  function makeId() { return "ex-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 6); }

  function readAll() {
    try {
      const raw = localStorage.getItem(EX_KEY);
      if (!raw) return [];
      return JSON.parse(raw) || [];
    } catch (e) { return []; }
  }
  function writeAll(arr) { localStorage.setItem(EX_KEY, JSON.stringify(arr)); }

  function list() {
    return readAll().slice().sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
  }
  function get(id) { return readAll().find((e) => e.id === id) || null; }

  function create(topic) {
    const ex = {
      id: makeId(),
      title: "Nieuwe oefening",
      topic: topic || "",
      createdAt: nowISO(),
      updatedAt: nowISO(),
      autoTitled: false,
      status: "new",            // new | generating | ready | error
      error: null,
      script: null,
      questions: [],
      vocab: [],
      grammar: [],
      audioKey: null,
      duration: 0,
      userAnswers: [],
    };
    const all = readAll();
    all.push(ex);
    writeAll(all);
    setActiveId(ex.id);
    return ex;
  }

  function update(id, patch) {
    const all = readAll();
    const i = all.findIndex((e) => e.id === id);
    if (i < 0) return null;
    all[i] = Object.assign({}, all[i], patch, { updatedAt: nowISO() });
    writeAll(all);
    return all[i];
  }

  function remove(id) {
    const all = readAll().filter((e) => e.id !== id);
    writeAll(all);
    if (getActiveId() === id) setActiveId(all[0] ? all[0].id : null);
  }

  function getActiveId() { return localStorage.getItem(ACTIVE_KEY); }
  function setActiveId(id) {
    if (id) localStorage.setItem(ACTIVE_KEY, id);
    else localStorage.removeItem(ACTIVE_KEY);
  }

  window.Store = {
    getSettings, patchSettings, bumpCallCount,
    list, get, create, update, remove,
    getActiveId, setActiveId,
  };
})();
