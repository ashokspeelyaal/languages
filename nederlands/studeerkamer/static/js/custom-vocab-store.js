/* CustomVocab — server-backed. addBatch dedups against built-in + existing custom. */
(function () {
  let items = [];
  let booted = false;

  function bg(p) { return Promise.resolve(p).catch(() => {}); }
  function nowISO() { return new Date().toISOString(); }

  async function boot() {
    if (booted) return;
    booted = true;
    try { const r = await window.API.get("/api/custom-vocab"); items = r.items || []; } catch (e) { items = []; }
  }

  function list() { return items.slice(); }
  function count() { return items.length; }
  function coreCount() { return items.filter((i) => i.core).length; }

  async function addBatch(toAdd, meta = {}) {
    const r = await window.API.post("/api/custom-vocab/batch", { items: toAdd, meta });
    // refresh local cache
    try {
      const refreshed = await window.API.get("/api/custom-vocab");
      items = refreshed.items || [];
    } catch (e) {}
    return r;
  }

  async function remove(id) {
    items = items.filter((i) => i.id !== id);
    await bg(window.API.del("/api/custom-vocab/" + encodeURIComponent(id)));
  }

  async function removeBySource(sourceId) {
    items = items.filter((i) => i.sourceId !== sourceId);
    const r = await window.API.del("/api/custom-vocab/by-source/" + encodeURIComponent(sourceId)).catch(() => ({ deleted: 0 }));
    return r.deleted || 0;
  }

  function exportJSON() {
    const data = { schema: "b2vocab-custom", version: 1, exportedAt: nowISO(), items };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `b2vocab-custom-${nowISO().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }
  async function clearAll() {
    items = [];
    await bg(window.API.del("/api/custom-vocab"));
  }

  window.CustomVocab = { boot, list, addBatch, remove, removeBySource, count, coreCount, exportJSON, clearAll };
})();
