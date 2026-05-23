/* WritingStore — server-backed. Mirrors original sync API. */
(function () {
  const ACTIVE_KEY = "studeerkamer.writing.active";
  let exs = [];
  let booted = false;

  function nowISO() { return new Date().toISOString(); }
  function makeId() { return "wex-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 6); }
  function bg(p) { return Promise.resolve(p).catch(() => {}); }

  async function boot() {
    if (booted) return;
    booted = true;
    try {
      const r = await window.API.get("/api/writing");
      exs = r.exercises || [];
    } catch (e) { exs = []; }
  }

  function list() {
    return exs.slice().sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
  }
  function get(id) { return exs.find((e) => e.id === id) || null; }

  function create(essayText, opts = {}) {
    const ex = {
      id: makeId(),
      title: "Nieuwe correctie",
      level: opts.level || "B2",
      sourceEssay: essayText || "",
      createdAt: nowISO(),
      updatedAt: nowISO(),
      autoTitled: false,
      status: "new",
      error: null,
      sentences: [],
      correctedFull: "",
      vocab: [],
      grammar: [],
      score: null,
      audioKey: null,
      wordTimings: null,
      sttText: null,
      pushedToCorpus: false,
    };
    exs.unshift(ex);
    setActiveId(ex.id);
    bg(window.API.post("/api/writing", {
      id: ex.id, title: ex.title, level: ex.level, sourceEssay: ex.sourceEssay,
    }));
    return ex;
  }

  function update(id, patch) {
    const ex = get(id);
    if (!ex) return null;
    Object.assign(ex, patch, { updatedAt: nowISO() });
    bg(window.API.patch("/api/writing/" + encodeURIComponent(id), patch));
    return ex;
  }

  function remove(id) {
    exs = exs.filter((e) => e.id !== id);
    if (getActiveId() === id) setActiveId(exs[0] ? exs[0].id : null);
    bg(window.API.del("/api/writing/" + encodeURIComponent(id)));
  }

  function getActiveId() { return localStorage.getItem(ACTIVE_KEY); }
  function setActiveId(id) {
    if (id) localStorage.setItem(ACTIVE_KEY, id);
    else localStorage.removeItem(ACTIVE_KEY);
  }
  function exportAll() {
    const data = { schema: "b2vocab-writing", version: 1, exportedAt: nowISO(), exercises: exs };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `b2vocab-writing-${nowISO().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  window.WritingStore = { boot, list, get, create, update, remove, getActiveId, setActiveId, exportAll };
})();
