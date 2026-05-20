/* BlobStore — minimal IndexedDB wrapper for binary blobs.
 * Used for audio (TTS output + user mic recordings). Keeps the 5 MB localStorage
 * budget free for chat history, exam metadata, progress and SRS state. */
(function () {
  const DB_NAME = "b2vocab-blobs";
  const DB_VERSION = 1;
  const STORE = "blobs";

  let dbPromise = null;

  function open() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE)) {
          const os = db.createObjectStore(STORE, { keyPath: "key" });
          os.createIndex("byTs", "ts");
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return dbPromise;
  }

  function tx(mode) {
    return open().then((db) => db.transaction(STORE, mode).objectStore(STORE));
  }
  function asPromise(req) {
    return new Promise((resolve, reject) => {
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function put(key, blob, meta = {}) {
    const os = await tx("readwrite");
    await asPromise(os.put({
      key,
      blob,
      size: blob.size,
      type: blob.type,
      ts: Date.now(),
      meta,
    }));
    return key;
  }

  async function get(key) {
    const os = await tx("readonly");
    const row = await asPromise(os.get(key));
    return row ? row.blob : null;
  }

  async function getURL(key) {
    const blob = await get(key);
    if (!blob) return null;
    return URL.createObjectURL(blob);
  }

  async function remove(key) {
    const os = await tx("readwrite");
    await asPromise(os.delete(key));
  }

  async function list() {
    const os = await tx("readonly");
    return new Promise((resolve, reject) => {
      const out = [];
      const req = os.openCursor();
      req.onsuccess = () => {
        const cur = req.result;
        if (cur) {
          const v = cur.value;
          out.push({ key: v.key, size: v.size || 0, type: v.type, ts: v.ts });
          cur.continue();
        } else {
          resolve(out);
        }
      };
      req.onerror = () => reject(req.error);
    });
  }

  async function totalSize() {
    const all = await list();
    return all.reduce((a, x) => a + (x.size || 0), 0);
  }

  // Remove rows where key prefix matches (e.g. delete all audio for an exam)
  async function removeByPrefix(prefix) {
    const all = await list();
    const matches = all.filter((x) => x.key.startsWith(prefix));
    for (const m of matches) await remove(m.key);
    return matches.length;
  }

  // Bulk: remove blobs not referenced by any exam (orphans)
  async function purgeOrphans(activeKeys) {
    const active = new Set(activeKeys);
    const all = await list();
    let n = 0;
    for (const x of all) {
      if (!active.has(x.key)) { await remove(x.key); n += 1; }
    }
    return n;
  }

  async function clearAll() {
    const os = await tx("readwrite");
    await asPromise(os.clear());
  }

  window.BlobStore = {
    put, get, getURL, remove, list, totalSize, removeByPrefix, purgeOrphans, clearAll,
  };
})();
