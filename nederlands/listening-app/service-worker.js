/* Minimal service worker — caches the static shell so the app icon launches
 * instantly even on a flaky connection. Audio (in IndexedDB) and OpenAI calls
 * are handled in the page itself. Strategy: network-first, fall back to cache. */

const CACHE = "luister-shell-v2";
const SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/styles.css",
  "./js/state.js",
  "./js/blob-store.js",
  "./js/ai.js",
  "./js/audio.js",
  "./js/views.js",
  "./js/selection-bar.js",
  "./js/app.js",
  "./icons/icon.svg",
  "./icons/icon-180.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      // Use addAll but ignore missing icon files during early dev
      Promise.all(SHELL.map((url) =>
        cache.add(url).catch(() => { /* tolerate missing icon files */ })
      ))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  // Only cache same-origin GETs
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // skip OpenAI etc

  event.respondWith(
    fetch(req)
      .then((resp) => {
        // Update cache in the background for next time
        const respClone = resp.clone();
        caches.open(CACHE).then((cache) => cache.put(req, respClone)).catch(() => {});
        return resp;
      })
      .catch(() => caches.match(req))
  );
});
