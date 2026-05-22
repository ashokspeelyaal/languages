/* CustomVocabStore — user-added vocabulary items, merged into the main corpus
 * via Views.activeItems(). Items have the same schema as built-in items plus
 * a 'source' field tagging where they came from. */
(function () {
  const KEY = "b2vocab.customItems.v1";

  function nowISO() { return new Date().toISOString(); }
  function makeId() { return "user-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 5); }

  function readAll() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }
  function writeAll(arr) { localStorage.setItem(KEY, JSON.stringify(arr)); }

  function list() { return readAll(); }

  /**
   * addBatch(items, meta) — bulk-insert items, deduplicating against existing
   * built-in + user items (case- and article-insensitive on dutch). Returns
   * {added, skipped} counts.
   */
  function addBatch(items, meta = {}) {
    const existing = readAll();
    const builtIn = (window.VOCAB_DATA && window.VOCAB_DATA.items) || [];
    const norm = (s) => String(s || "").toLowerCase()
      .replace(/^(de |het |een )/, "").trim();
    const seen = new Set([
      ...existing.map((i) => norm(i.dutch)),
      ...builtIn.map((i) => norm(i.dutch)),
    ]);
    let added = 0, skipped = 0;
    items.forEach((it) => {
      const key = norm(it.dutch);
      if (!key) { skipped += 1; return; }
      if (seen.has(key)) { skipped += 1; return; }
      seen.add(key);
      existing.push({
        id: makeId(),
        level: it.level || "B2",
        category: it.category || (meta.category || "Custom"),
        subcategory: meta.subcategory || null,
        dutch: it.dutch,
        english: it.english || "",
        exampleNL: it.exampleNL || meta.exampleNL || "",
        exampleEN: it.exampleEN || "",
        core: !!it.core,
        source: meta.source || "user",     // where it came from
        sourceId: meta.sourceId || null,   // e.g. listening exercise id
        addedAt: nowISO(),
      });
      added += 1;
    });
    writeAll(existing);
    return { added, skipped };
  }

  function remove(id) {
    writeAll(readAll().filter((i) => i.id !== id));
  }

  function removeBySource(sourceId) {
    const remaining = readAll().filter((i) => i.sourceId !== sourceId);
    writeAll(remaining);
    return remaining.length;
  }

  function count() { return readAll().length; }
  function coreCount() { return readAll().filter((i) => i.core).length; }

  function exportJSON() {
    const data = { schema: "b2vocab-custom", version: 1, exportedAt: nowISO(), items: readAll() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `b2vocab-custom-${nowISO().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function clearAll() { writeAll([]); }

  window.CustomVocab = { list, addBatch, remove, removeBySource, count, coreCount, exportJSON, clearAll };
})();
