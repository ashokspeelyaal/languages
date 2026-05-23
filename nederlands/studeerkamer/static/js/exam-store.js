/* ExamStore — server-backed. Same surface as the original. */
(function () {
  const ACTIVE_KEY = "studeerkamer.exams.active";
  let exams = [];
  let booted = false;

  function nowISO() { return new Date().toISOString(); }
  function makeId() { return "exam-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 6); }
  function bg(p) { return Promise.resolve(p).catch(() => {}); }
  function blankSection() { return { status: "pending", content: null, answers: null, grading: null }; }

  async function boot() {
    if (booted) return;
    booted = true;
    try { const r = await window.API.get("/api/exam"); exams = r.exams || []; } catch (e) { exams = []; }
  }

  function list() {
    return exams.slice().sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
  }
  function get(id) { return exams.find((e) => e.id === id) || null; }

  function create() {
    const id = makeId();
    const exam = {
      id,
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
    exams.unshift(exam);
    setActiveId(exam.id);
    bg(window.API.post("/api/exam", { id: exam.id, title: exam.title }));
    return exam;
  }

  function update(id, patch) {
    const ex = get(id);
    if (!ex) return null;
    Object.assign(ex, patch, { updatedAt: nowISO() });
    bg(window.API.patch("/api/exam/" + encodeURIComponent(id), patch));
    return ex;
  }

  function updateSection(id, section, patch) {
    const ex = get(id);
    if (!ex) return null;
    ex.sections[section] = Object.assign({}, ex.sections[section], patch);
    ex.updatedAt = nowISO();
    bg(window.API.patch("/api/exam/" + encodeURIComponent(id) + "/section/" + encodeURIComponent(section), patch));
    return ex;
  }

  function setCurrentSection(id, section) { return update(id, { currentSection: section }); }
  function complete(id) { return update(id, { completedAt: nowISO(), currentSection: "done" }); }

  function remove(id) {
    exams = exams.filter((e) => e.id !== id);
    if (getActiveId() === id) setActiveId(exams[0] ? exams[0].id : null);
    bg(window.API.del("/api/exam/" + encodeURIComponent(id)));
  }

  function getActiveId() { return localStorage.getItem(ACTIVE_KEY); }
  function setActiveId(id) {
    if (id) localStorage.setItem(ACTIVE_KEY, id);
    else localStorage.removeItem(ACTIVE_KEY);
  }
  function exportAll() {
    const data = { schema: "b2vocab-exams", version: 1, exportedAt: nowISO(), exams };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `b2vocab-exams-${nowISO().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  window.ExamStore = {
    boot, create, list, get, update, updateSection, setCurrentSection, complete, remove,
    getActiveId, setActiveId, exportAll,
  };
})();
