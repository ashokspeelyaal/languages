/* ExamStore — multi-attempt CNaVT-C1 exam persistence, localStorage-backed. */
(function () {
  const EXAMS_KEY  = "b2vocab.exams.v1";
  const ACTIVE_KEY = "b2vocab.exams.active";

  function nowISO() { return new Date().toISOString(); }
  function makeId() {
    return "exam-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 6);
  }

  function readAll() {
    try {
      const raw = localStorage.getItem(EXAMS_KEY);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }
  function writeAll(arr) { localStorage.setItem(EXAMS_KEY, JSON.stringify(arr)); }

  function blankSection() {
    return { status: "pending", content: null, answers: null, grading: null };
  }

  function create() {
    const exam = {
      id: makeId(),
      type: "CNaVT-C1-EP",
      title: "Examen · " + new Date().toLocaleDateString("nl-BE", { day: "2-digit", month: "short", year: "numeric" }),
      createdAt: nowISO(),
      updatedAt: nowISO(),
      completedAt: null,
      currentSection: "lezen",
      sections: {
        lezen:      blankSection(),
        luisteren:  blankSection(),
        schrijven:  blankSection(),
        spreken:    blankSection(),
      },
    };
    const all = readAll();
    all.push(exam);
    writeAll(all);
    setActiveId(exam.id);
    return exam;
  }

  function list() {
    return readAll().slice().sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
  }
  function get(id) { return readAll().find((e) => e.id === id) || null; }

  function update(id, patch) {
    const all = readAll();
    const i = all.findIndex((e) => e.id === id);
    if (i < 0) return null;
    all[i] = Object.assign({}, all[i], patch, { updatedAt: nowISO() });
    writeAll(all);
    return all[i];
  }

  function updateSection(id, section, patch) {
    const exam = get(id);
    if (!exam) return null;
    exam.sections[section] = Object.assign({}, exam.sections[section], patch);
    return update(id, { sections: exam.sections });
  }

  function setCurrentSection(id, section) {
    return update(id, { currentSection: section });
  }

  function complete(id) {
    return update(id, { completedAt: nowISO(), currentSection: "done" });
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
    const data = { schema: "b2vocab-exams", version: 1, exportedAt: nowISO(), exams: readAll() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `b2vocab-exams-${nowISO().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  window.ExamStore = {
    create, list, get, update, updateSection, setCurrentSection, complete, remove,
    getActiveId, setActiveId, exportAll,
  };
})();
