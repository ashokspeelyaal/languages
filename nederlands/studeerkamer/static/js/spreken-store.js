/* SprekenStore — server-backed, same shape as ListeningStore / WritingStore. */
(function () {
  const ACTIVE_KEY = "studeerkamer.spreken.active";
  let exs = [];
  let booted = false;

  function nowISO() { return new Date().toISOString(); }
  function makeId() { return "sp-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 6); }
  function bg(p) { return Promise.resolve(p).catch(() => {}); }

  async function boot() {
    if (booted) return;
    booted = true;
    try { const r = await window.API.get("/api/spreken"); exs = r.exercises || []; }
    catch (e) { exs = []; }
  }

  function list() {
    return exs.slice().sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
  }
  function get(id) { return exs.find((e) => e.id === id) || null; }

  function create(opts = {}) {
    const ex = {
      id: makeId(),
      title: "Nieuwe opname",
      topic: opts.topic || "",
      level: opts.level || "B2",
      createdAt: nowISO(),
      updatedAt: nowISO(),
      status: "new",
      error: null,
      originalAudioKey: null,
      originalTranscript: null,
      originalWordTimings: null,
      pronunciation: null,
      correctedText: null,
      correctedAudioKey: null,
      correctedWordTimings: null,
      sentences: [],
      score: null,
      vocab: [],
      grammar: [],
      autoTitled: false,
      pushedToCorpus: false,
    };
    exs.unshift(ex);
    setActiveId(ex.id);
    bg(window.API.post("/api/spreken", { id: ex.id, title: ex.title, topic: ex.topic, level: ex.level }));
    return ex;
  }

  function update(id, patch) {
    const ex = get(id);
    if (!ex) return null;
    Object.assign(ex, patch, { updatedAt: nowISO() });
    bg(window.API.patch("/api/spreken/" + encodeURIComponent(id), patch));
    return ex;
  }

  function remove(id) {
    exs = exs.filter((e) => e.id !== id);
    if (getActiveId() === id) setActiveId(exs[0] ? exs[0].id : null);
    bg(window.API.del("/api/spreken/" + encodeURIComponent(id)));
  }

  function getActiveId() { return localStorage.getItem(ACTIVE_KEY); }
  function setActiveId(id) {
    if (id) localStorage.setItem(ACTIVE_KEY, id);
    else localStorage.removeItem(ACTIVE_KEY);
  }

  window.SprekenStore = { boot, list, get, create, update, remove, getActiveId, setActiveId };
})();
