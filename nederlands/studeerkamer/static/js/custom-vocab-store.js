/* CustomVocab — server-backed with optimistic local cache.
 *
 * addBatch / remove / removeBySource / clearAll are SYNC like the original
 * (views read return.added etc immediately). Local dedup is authoritative
 * for the return value; the server call goes in the background and is
 * idempotent (the server dedup runs again). */
(function () {
  let items = [];
  let booted = false;

  function bg(p) { return Promise.resolve(p).catch(() => {}); }
  function nowISO() { return new Date().toISOString(); }
  function makeId() { return "user-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 5); }
  function norm(s) {
    return String(s || "").toLowerCase().replace(/^(de |het |een )/, "").trim();
  }

  async function boot() {
    if (booted) return;
    booted = true;
    try { const r = await window.API.get("/api/custom-vocab"); items = r.items || []; } catch (e) { items = []; }
  }

  function list() { return items.slice(); }
  function count() { return items.length; }
  function coreCount() { return items.filter((i) => i.core).length; }

  function addBatch(toAdd, meta = {}) {
    const builtIn = (window.VOCAB_DATA && window.VOCAB_DATA.items) || [];
    const seen = new Set([
      ...items.map((i) => norm(i.dutch)),
      ...builtIn.map((i) => norm(i.dutch)),
    ]);
    let added = 0, skipped = 0;
    const toPost = [];
    (toAdd || []).forEach((it) => {
      const k = norm(it.dutch);
      if (!k || seen.has(k)) { skipped += 1; return; }
      seen.add(k);
      items.push({
        id: makeId(),
        level: it.level || "B2",
        category: it.category || meta.category || "Custom",
        subcategory: meta.subcategory || null,
        dutch: it.dutch,
        english: it.english || "",
        exampleNL: it.exampleNL || meta.exampleNL || "",
        exampleEN: it.exampleEN || "",
        core: !!it.core,
        source: meta.source || "user",
        sourceId: meta.sourceId || null,
        addedAt: nowISO(),
      });
      toPost.push(it);
      added += 1;
    });
    if (toPost.length) {
      bg(window.API.post("/api/custom-vocab/batch", { items: toPost, meta }));
    }
    return { added, skipped };
  }

  function remove(id) {
    items = items.filter((i) => i.id !== id);
    bg(window.API.del("/api/custom-vocab/" + encodeURIComponent(id)));
  }

  function removeBySource(sourceId) {
    const before = items.length;
    items = items.filter((i) => i.sourceId !== sourceId);
    const removed = before - items.length;
    bg(window.API.del("/api/custom-vocab/by-source/" + encodeURIComponent(sourceId)));
    return removed;
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

  function clearAll() {
    items = [];
    bg(window.API.del("/api/custom-vocab"));
  }

  window.CustomVocab = { boot, list, addBatch, remove, removeBySource, count, coreCount, exportJSON, clearAll };
})();
