/* WritingStore — Schrijven exercise persistence. Mirrors ListeningStore. */
(function () {
  const EX_KEY = "b2vocab.writing.v1";
  const ACTIVE_KEY = "b2vocab.writing.active";

  function nowISO() { return new Date().toISOString(); }
  function makeId() { return "wex-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 6); }

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

  function create(essayText, opts = {}) {
    const ex = {
      id: makeId(),
      title: "Nieuwe correctie",
      level: opts.level || "B2",
      sourceEssay: essayText || "",
      createdAt: nowISO(),
      updatedAt: nowISO(),
      autoTitled: false,
      status: "new",                  // new | generating | ready | error
      error: null,
      sentences: [],
      correctedFull: "",
      vocab: [],
      grammar: [],
      score: null,                    // { overall, summary, criteria: {...} } after AI runs
      audioKey: null,                 // null until user clicks 'Genereer audio'
      wordTimings: null,
      sttText: null,
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
    const data = { schema: "b2vocab-writing", version: 1, exportedAt: nowISO(), exercises: readAll() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `b2vocab-writing-${nowISO().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  window.WritingStore = { list, get, create, update, remove, getActiveId, setActiveId, exportAll };
})();
