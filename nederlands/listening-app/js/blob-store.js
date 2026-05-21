/* BlobStore — IndexedDB wrapper for audio blobs. */
(function () {
  const DB_NAME = "luister-blobs";
  const DB_VERSION = 1;
  const STORE = "blobs";
  let dbPromise = null;

  function open() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: "key" });
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return dbPromise;
  }
  function tx(mode) { return open().then((db) => db.transaction(STORE, mode).objectStore(STORE)); }
  function asPromise(req) { return new Promise((r, j) => { req.onsuccess = () => r(req.result); req.onerror = () => j(req.error); }); }

  async function put(key, blob) {
    const os = await tx("readwrite");
    await asPromise(os.put({ key, blob, size: blob.size, type: blob.type, ts: Date.now() }));
    return key;
  }
  async function get(key) {
    const os = await tx("readonly");
    const row = await asPromise(os.get(key));
    return row ? row.blob : null;
  }
  async function getURL(key) {
    const blob = await get(key);
    return blob ? URL.createObjectURL(blob) : null;
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
        if (cur) { out.push({ key: cur.value.key, size: cur.value.size }); cur.continue(); }
        else resolve(out);
      };
      req.onerror = () => reject(req.error);
    });
  }
  async function totalSize() {
    return (await list()).reduce((a, r) => a + (r.size || 0), 0);
  }

  window.BlobStore = { put, get, getURL, remove, list, totalSize };
})();
