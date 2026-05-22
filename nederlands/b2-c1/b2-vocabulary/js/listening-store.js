/* ListeningStore — multi-exercise listening practice persistence. */
(function () {
  const EX_KEY = "b2vocab.listening.v1";
  const ACTIVE_KEY = "b2vocab.listening.active";

  function nowISO() { return new Date().toISOString(); }
  function makeId() { return "lex-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 6); }

  function readAll() {
    try {
      const raw = localStorage.getItem(EX_KEY);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }
  function writeAll(arr) { localStorage.setItem(EX_KEY, JSON.stringify(arr)); }

  function list() { return readAll().slice().sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || "")); }
  function get(id) { return readAll().find((e) => e.id === id) || null; }

  function create(topic, opts = {}) {
    const ex = {
      id: makeId(),
      title: "Nieuwe oefening",
      topic: topic || "",
      level: opts.level || "B2",                // B1 | B2 | C1
      createdAt: nowISO(),
      updatedAt: nowISO(),
      autoTitled: false,
      status: "new",
      error: null,
      script: null,
      questions: [],
      vocab: [],
      grammar: [],
      audioKey: null,
      userAnswers: [],
      pushedToCorpus: false,
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
  function exportAll() {
    const data = { schema: "b2vocab-listening", version: 1, exportedAt: nowISO(), exercises: readAll() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `b2vocab-listening-${nowISO().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  window.ListeningStore = { list, get, create, update, remove, getActiveId, setActiveId, exportAll };
})();
