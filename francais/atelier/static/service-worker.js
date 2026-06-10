/* PWA service worker.
 * - App shell: network-first with cache fallback (deploys land on next reload).
 * - /static/*: stale-while-revalidate.
 * - /api/audio/key/*: cache-first into a dedicated audio cache so audio
 *   plays offline once it's been fetched (or prefetched via message).
 * - /api/* everything else: network-only (data is canonical on the server).
 */
const SHELL_VERSION = "atelier-shell-v1";
const AUDIO_CACHE = "atelier-audio-v1";
const SHELL = [
  "/",
  "/login",
  "/manifest.webmanifest",
  "/static/css/styles.css",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(SHELL_VERSION).then((cache) => cache.addAll(SHELL)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((k) => k !== SHELL_VERSION && k !== AUDIO_CACHE).map((k) => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET") return;

  if (url.pathname.startsWith("/api/audio/key/")) {
    e.respondWith(audioCacheFirst(e.request));
    return;
  }
  if (url.pathname.startsWith("/api/")) return;
  if (url.pathname.startsWith("/static/") || url.pathname === "/manifest.webmanifest") {
    e.respondWith(swr(e.request));
    return;
  }
  e.respondWith(networkFirst(e.request));
});

async function networkFirst(request) {
  const cache = await caches.open(SHELL_VERSION);
  try {
    const resp = await fetch(request);
    if (resp && resp.ok) cache.put(request, resp.clone()).catch(() => {});
    return resp;
  } catch (e) {
    const cached = await cache.match(request);
    return cached || cache.match("/");
  }
}

async function swr(request) {
  const cache = await caches.open(SHELL_VERSION);
  const cached = await cache.match(request);
  const fetched = fetch(request).then((resp) => {
    if (resp && resp.ok) cache.put(request, resp.clone());
    return resp;
  }).catch(() => cached);
  return cached || fetched;
}

async function audioCacheFirst(request) {
  const cache = await caches.open(AUDIO_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const resp = await fetch(request);
    if (resp && resp.ok) {
      cache.put(request, resp.clone()).catch(() => {});
    }
    return resp;
  } catch (e) {
    return new Response("Hors ligne (audio absent du cache)", { status: 503 });
  }
}

self.addEventListener("message", (e) => {
  const data = e.data || {};
  if (data.type === "prefetch-audio" && Array.isArray(data.urls)) {
    e.waitUntil(prefetchAudio(data.urls));
  } else if (data.type === "purge-audio-cache") {
    e.waitUntil(caches.delete(AUDIO_CACHE).then(() => notifyAll({ type: "audio-cache-purged" })));
  } else if (data.type === "audio-cache-status") {
    e.waitUntil(reportStatus());
  }
});

async function prefetchAudio(urls) {
  const cache = await caches.open(AUDIO_CACHE);
  let ok = 0, failed = 0;
  for (const url of urls) {
    try {
      const hit = await cache.match(url);
      if (hit) { ok += 1; continue; }
      const resp = await fetch(url, { credentials: "same-origin" });
      if (resp && resp.ok) {
        await cache.put(url, resp.clone());
        ok += 1;
      } else {
        failed += 1;
      }
    } catch (err) {
      failed += 1;
    }
    notifyAll({ type: "audio-prefetch-progress", url, done: ok + failed, total: urls.length });
  }
  notifyAll({ type: "audio-prefetch-done", ok, failed, total: urls.length });
}

async function reportStatus() {
  const cache = await caches.open(AUDIO_CACHE);
  const keys = await cache.keys();
  notifyAll({ type: "audio-cache-status", count: keys.length });
}

async function notifyAll(msg) {
  const clients = await self.clients.matchAll({ includeUncontrolled: true });
  clients.forEach((c) => c.postMessage(msg));
}
