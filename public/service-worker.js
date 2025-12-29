const CACHE_NAME = "feel-string-v2025-12-29-1";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./assets/icons/logo.svg"
];

self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
          return null;
        })
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) {
        return cached;
      }

      return fetch(event.request)
        .then(response => {
          if (
            !response ||
            response.status !== 200 ||
            response.type === "opaque"
          ) {
            return response;
          }

          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          if (event.request.mode === "navigate") {
            return caches.match("./index.html");
          }
          return new Response("Offline", {
            status: 503,
            statusText: "Offline"
          });
        });
    })
  );
});
