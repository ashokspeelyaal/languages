/* Minimal PWA service worker.
 * - Caches the app shell so we boot offline.
 * - Network-only for /api/* (data is canonical on the server).
 * - Stale-while-revalidate for /static/* (CSS, JS, fonts).
 * - Cache name versioned: bump CACHE_VERSION to invalidate after deploys.
 */
const CACHE_VERSION = "studeerkamer-v1";
const SHELL = [
  "/",
  "/login",
  "/manifest.webmanifest",
  "/static/css/styles.css",
  "/static/js/d3.v7.min.js",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(SHELL)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  // API: always go to network — data is canonical there.
  if (url.pathname.startsWith("/api/")) return;
  // Static: SWR
  if (url.pathname.startsWith("/static/") || url.pathname === "/manifest.webmanifest") {
    e.respondWith(swr(e.request));
    return;
  }
  // App shell (/, /login): cache-first with network fallback.
  e.respondWith(
    caches.match(e.request).then((cached) =>
      cached || fetch(e.request).catch(() => caches.match("/"))
    )
  );
});

async function swr(request) {
  const cache = await caches.open(CACHE_VERSION);
  const cached = await cache.match(request);
  const fetched = fetch(request).then((resp) => {
    if (resp && resp.ok) cache.put(request, resp.clone());
    return resp;
  }).catch(() => cached);
  return cached || fetched;
}
