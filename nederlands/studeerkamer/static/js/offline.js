/* Offline audio sync.
 *
 * On boot (after auth + Store.boot), this module:
 *  1. Fetches the canonical list of audio files the user owns from
 *     /api/audio/keys.
 *  2. Asks the service worker to prefetch any that aren't already in
 *     the studeerkamer-audio-v1 cache.
 *  3. Renders a small chip in the topbar showing cached/total + size,
 *     and lets you click to force a full re-sync or wipe the cache.
 *
 * If the page is loaded outside a PWA (no service worker), the chip
 * shows "—" and the manual sync button is disabled.
 */
(function () {
  const STATE = { total: 0, cached: 0, bytes: 0, syncing: false };

  function bytesHuman(n) {
    if (n >= 1024 * 1024 * 1024) return (n / (1024**3)).toFixed(2) + " GB";
    if (n >= 1024 * 1024) return (n / (1024**2)).toFixed(0) + " MB";
    if (n >= 1024) return (n / 1024).toFixed(0) + " kB";
    return n + " B";
  }

  function urlForKey(key) { return "/api/audio/key/" + encodeURI(key); }

  function renderChip() {
    let chip = document.getElementById("offline-chip");
    if (!chip) {
      const topbar = document.querySelector(".topbar");
      if (!topbar) return;
      chip = document.createElement("div");
      chip.id = "offline-chip";
      chip.className = "streak offline-chip";
      chip.title = "Offline audio · klik om opnieuw te synchroniseren";
      chip.style.cursor = "pointer";
      chip.style.marginLeft = "8px";
      chip.addEventListener("click", manualSync);
      // Slot it right after the streak chip if present.
      const streak = topbar.querySelector("#streak-chip");
      if (streak && streak.nextSibling) topbar.insertBefore(chip, streak.nextSibling);
      else topbar.appendChild(chip);
    }
    const label = STATE.syncing
      ? `⟳ ${STATE.cached}/${STATE.total}`
      : STATE.total === 0
        ? "⤓ —"
        : (STATE.cached >= STATE.total ? `✓ ${STATE.cached}` : `⤓ ${STATE.cached}/${STATE.total}`);
    chip.innerHTML = "";
    const a = document.createElement("span"); a.className = "streak-flame"; a.textContent = "📥";
    const b = document.createElement("span"); b.textContent = " " + label;
    const c = document.createElement("span"); c.className = "streak-label";
    c.textContent = " " + (STATE.bytes > 0 ? bytesHuman(STATE.bytes) : "audio");
    chip.append(a, b, c);
  }

  async function listServerKeys() {
    try {
      const r = await window.API.get("/api/audio/keys");
      return { keys: r.keys || [], totalSize: r.totalSize || 0 };
    } catch (e) {
      return { keys: [], totalSize: 0 };
    }
  }

  async function listCachedURLs() {
    if (!("caches" in window)) return new Set();
    try {
      const cache = await caches.open("studeerkamer-audio-v1");
      const reqs = await cache.keys();
      return new Set(reqs.map((r) => new URL(r.url).pathname));
    } catch (e) { return new Set(); }
  }

  function postToSW(msg) {
    return navigator.serviceWorker?.ready.then((reg) => {
      const sw = reg.active || navigator.serviceWorker.controller;
      if (sw) sw.postMessage(msg);
    });
  }

  async function sync({ force = false } = {}) {
    if (STATE.syncing) return;
    STATE.syncing = true;
    renderChip();
    const server = await listServerKeys();
    const cached = await listCachedURLs();
    STATE.total = server.keys.length;
    STATE.bytes = server.totalSize;
    STATE.cached = server.keys.filter((k) => cached.has(urlForKey(k.key).replace(/^https?:\/\/[^/]+/, ""))).length;
    renderChip();
    const missing = force
      ? server.keys.map((k) => urlForKey(k.key))
      : server.keys.filter((k) => !cached.has(urlForKey(k.key))).map((k) => urlForKey(k.key));
    if (!missing.length) {
      STATE.syncing = false;
      renderChip();
      return;
    }
    await postToSW({ type: "prefetch-audio", urls: missing });
  }

  async function manualSync() {
    if (STATE.syncing) return;
    if (!confirm(`Synchroniseer alle ${STATE.total || "?"} audio-bestanden naar dit apparaat?`)) return;
    await sync({ force: true });
  }

  function onSWMessage(e) {
    const m = e.data || {};
    if (m.type === "audio-prefetch-progress") {
      STATE.cached = m.done;
      STATE.total = m.total;
      renderChip();
    } else if (m.type === "audio-prefetch-done") {
      STATE.cached = m.ok;
      STATE.total = m.total;
      STATE.syncing = false;
      renderChip();
    }
  }

  function init() {
    if (!("serviceWorker" in navigator)) { renderChip(); return; }
    navigator.serviceWorker.addEventListener("message", onSWMessage);
    // Kick off a non-blocking sync shortly after boot.
    setTimeout(() => sync().catch(() => {}), 1500);
    // Also re-sync every 5 minutes while the app is open, cheap if there's nothing new.
    setInterval(() => sync().catch(() => {}), 5 * 60 * 1000);
  }

  window.OfflineAudio = { sync, manualSync, state: STATE };
  document.addEventListener("DOMContentLoaded", init);
})();
