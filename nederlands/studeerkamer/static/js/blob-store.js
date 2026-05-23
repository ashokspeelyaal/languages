/* BlobStore — server-backed audio storage with the original opaque-key
 * semantics preserved.
 *
 * Views do:
 *   await BlobStore.put("listening-{id}", blob);
 *   ListeningStore.update(id, { audioKey: "listening-{id}" });
 *   ...later...
 *   await BlobStore.getURL("listening-{id}")
 *
 * Same logical key for both put and get. The server parses the key, derives
 * the on-disk path under data/audio/{user_id}/.../, never exposes user_id
 * to the client.
 */
(function () {
  async function put(logicalKey, blob /*, meta */) {
    const form = new FormData();
    form.append("file", blob, "audio.mp3");
    await window.API.postForm("/api/audio/key/" + encodeURI(logicalKey), form);
    return logicalKey;
  }

  async function get(logicalKey) {
    if (!logicalKey) return null;
    const resp = await fetch("/api/audio/key/" + encodeURI(logicalKey),
                             { credentials: "same-origin" });
    if (!resp.ok) return null;
    return resp.blob();
  }

  async function getURL(logicalKey) {
    const blob = await get(logicalKey);
    return blob ? URL.createObjectURL(blob) : null;
  }

  async function remove(logicalKey) {
    if (!logicalKey) return;
    await window.API.del("/api/audio/key/" + encodeURI(logicalKey)).catch(() => {});
  }

  // The original removeByPrefix cleared all blobs under a prefix (e.g.
  // every audio key for an exam when that exam was deleted). The server-
  // side DELETE endpoints for writing/listening/exam already clean up the
  // on-disk audio directory, so we just no-op here.
  async function removeByPrefix(/* prefix */) { return 0; }
  async function purgeOrphans(/* activeKeys */) { return 0; }
  async function clearAll() { return 0; }

  async function list() { return []; }
  async function totalSize() { return 0; }

  window.BlobStore = { put, get, getURL, remove, list, totalSize, removeByPrefix, purgeOrphans, clearAll };
})();
