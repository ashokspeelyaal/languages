/* BlobStore — server-backed audio storage. Same API as the original
 * IndexedDB version so callers don't need to change.
 *
 * Keys are no longer arbitrary client strings — they're upload paths the
 * server returns. We keep a local index (id → audioKey) for the legacy
 * callers that pass logical keys like "exam-123-q4". */
(function () {
  function parseKey(key) {
    // Logical key like "writing-wex-abc/main" — we use the prefix to
    // decide owner_type and owner_id. Fall back to free/free.
    const m = String(key || "").match(/^(writing|listening|exam|free)-([^/]+)(?:\/(.+))?$/);
    if (m) return { owner_type: m[1], owner_id: m[2], filename: m[3] || "audio" };
    return { owner_type: "free", owner_id: "free", filename: String(key || "audio").replace(/[^a-z0-9._-]/gi, "_") };
  }

  async function put(key, blob, meta = {}) {
    const { owner_type, owner_id, filename } = parseKey(key);
    const form = new FormData();
    form.append("file", blob, filename + ".mp3");
    form.append("owner_type", owner_type);
    form.append("owner_id", owner_id);
    form.append("key", filename);
    const r = await window.API.postForm("/api/audio/upload", form);
    return r.audioKey;
  }

  async function get(audioKey) {
    if (!audioKey) return null;
    const resp = await fetch("/api/audio/" + audioKey, { credentials: "same-origin" });
    if (!resp.ok) return null;
    return resp.blob();
  }

  async function getURL(audioKey) {
    const blob = await get(audioKey);
    return blob ? URL.createObjectURL(blob) : null;
  }

  async function remove(audioKey) {
    if (!audioKey) return;
    await window.API.del("/api/audio/" + audioKey).catch(() => {});
  }

  async function list() { return []; /* not used after port */ }
  async function totalSize() { return 0; }
  async function removeByPrefix(prefix) {
    // No-op on server-backed storage — exercises clean up their own audio
    // when deleted, via the writing/listening DELETE endpoints.
    return 0;
  }
  async function purgeOrphans() { return 0; }
  async function clearAll() { return 0; }

  window.BlobStore = { put, get, getURL, remove, list, totalSize, removeByPrefix, purgeOrphans, clearAll };
})();
