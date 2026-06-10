/* ListeningStore — server-backed. Mirrors original sync API. */
(function () {
  const ACTIVE_KEY = "studeerkamer.listening.active";
  let exs = [];
  let booted = false;

  function nowISO() { return new Date().toISOString(); }
  function makeId() { return "lex-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 6); }
  function bg(p) { return Promise.resolve(p).catch(() => {}); }

  async function boot() {
    if (booted) return;
    booted = true;
    try {
      const r = await window.API.get("/api/listening");
      exs = r.exercises || [];
    } catch (e) { exs = []; }
  }

  function list() {
    return exs.slice().sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
  }
  function get(id) { return exs.find((e) => e.id === id) || null; }

  /* Create a new exercise.
   *  args: { title, level, script }  — script is required in the new flow
   *         (user provides the full text up front; AI never rewrites it).
   *  Returns the new exercise object with status="script_ready" if a script
   *  was supplied, "new" otherwise.
   */
  function create(args = {}) {
    const hasScript = !!(args.script && args.script.trim());
    const ex = {
      id: makeId(),
      title: args.title || "Nieuwe oefening",
      topic: args.topic || "",
      level: args.level || "B2",
      createdAt: nowISO(),
      updatedAt: nowISO(),
      autoTitled: !!args.title,
      status: hasScript ? "script_ready" : "new",
      error: null,
      script: hasScript ? args.script.trim() : null,
      questions: [],
      vocab: [],
      grammar: [],
      audioKey: null,
      wordTimings: null,
      sttText: null,
      userAnswers: [],
      pushedToCorpus: false,
    };
    exs.unshift(ex);
    setActiveId(ex.id);
    bg(window.API.post("/api/listening", {
      id: ex.id,
      title: ex.title,
      topic: ex.topic,
      level: ex.level,
      script: ex.script,
      status: ex.status,
    }));
    return ex;
  }

  function update(id, patch) {
    const ex = get(id);
    if (!ex) return null;
    Object.assign(ex, patch, { updatedAt: nowISO() });
    bg(window.API.patch("/api/listening/" + encodeURIComponent(id), patch));
    return ex;
  }

  function remove(id) {
    exs = exs.filter((e) => e.id !== id);
    if (getActiveId() === id) setActiveId(exs[0] ? exs[0].id : null);
    bg(window.API.del("/api/listening/" + encodeURIComponent(id)));
  }

  function getActiveId() { return localStorage.getItem(ACTIVE_KEY); }
  function setActiveId(id) {
    if (id) localStorage.setItem(ACTIVE_KEY, id);
    else localStorage.removeItem(ACTIVE_KEY);
  }
  function exportAll() {
    const data = { schema: "b2vocab-listening", version: 1, exportedAt: nowISO(), exercises: exs };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `b2vocab-listening-${nowISO().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  window.ListeningStore = { boot, list, get, create, update, remove, getActiveId, setActiveId, exportAll };
})();
