/* PWA service worker.
 * - App shell: cache-first.
 * - /static/*: stale-while-revalidate.
 * - /api/audio/key/*: cache-first into a dedicated audio cache so audio
 *   plays offline once it's been fetched (or prefetched via message).
 * - /api/* everything else: network-only (data is canonical on the server).
 *
 * The audio cache lives in a separate cache name from the shell so we
 * can purge it independently and so a shell version bump doesn't blow
 * away possibly-large audio downloads.
 */
const SHELL_VERSION = "studeerkamer-shell-v2";
const AUDIO_CACHE = "studeerkamer-audio-v1";
const SHELL = [
  "/",
  "/login",
  "/manifest.webmanifest",
  "/static/css/styles.css",
  "/static/js/d3.v7.min.js",
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

  // Audio: cache-first into the dedicated audio cache. Falls back to
  // network and stores the response transparently. Works offline once
  // the file has been seen at least once.
  if (url.pathname.startsWith("/api/audio/key/")) {
    e.respondWith(audioCacheFirst(e.request));
    return;
  }
  // Everything else /api/*: network-only.
  if (url.pathname.startsWith("/api/")) return;
  // Static: SWR.
  if (url.pathname.startsWith("/static/") || url.pathname === "/manifest.webmanifest") {
    e.respondWith(swr(e.request));
    return;
  }
  // App shell.
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request).catch(() => caches.match("/")))
  );
});

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
      // Clone before returning since the body is a single-shot stream.
      cache.put(request, resp.clone()).catch(() => {});
    }
    return resp;
  } catch (e) {
    return new Response("Offline (audio niet in cache)", { status: 503 });
  }
}

/* ---- Prefetch: client posts { type: "prefetch-audio", urls: [...] } ----
 * SW fetches each URL into the audio cache in series (to avoid spiking
 * memory on large libraries) and posts per-URL progress back so the
 * client can update the topbar chip.
 */
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
