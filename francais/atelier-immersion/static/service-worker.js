/* Minimal SW: cache the app shell, network-first elsewhere. */
const SHELL = "immersion-shell-v1";
const SHELL_FILES = ["/", "/login", "/manifest.webmanifest", "/static/css/styles.css"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(SHELL).then((c) => c.addAll(SHELL_FILES)).catch(() => {}));
  self.skipWaiting();
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== SHELL).map((k) => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  if (url.pathname.startsWith("/api/")) return; // network only
  e.respondWith((async () => {
    try {
      const r = await fetch(e.request);
      const c = await caches.open(SHELL);
      if (r.ok && url.pathname.startsWith("/static/")) c.put(e.request, r.clone()).catch(() => {});
      return r;
    } catch {
      return (await caches.match(e.request)) || (await caches.match("/"));
    }
  })());
});
