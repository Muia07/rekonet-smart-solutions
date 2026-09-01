// Rekonet Inv Systems Service Worker v6.0
// HTML, CSS, and JS are always fetched from the network so deploys
// appear without a hard refresh. Other static assets may be cached.
const CACHE_NAME = "rekonet-v7";
const OFFLINE_URLS = ["/", "/index.html"];

function shouldBypassCache(request) {
  const url = new URL(request.url);
  const path = url.pathname;
  if (request.mode === "navigate") return true;
  if (request.destination === "document") return true;
  if (request.destination === "script" || request.destination === "style") return true;
  if (path.endsWith(".html") || path.endsWith(".js") || path.endsWith(".css")) return true;
  if (path.endsWith(".webmanifest") || path === "/sw.js") return true;
  if (path === "/" || path === "/index.html") return true;
  return false;
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(OFFLINE_URLS).catch(() => undefined))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names.map((name) => (name !== CACHE_NAME ? caches.delete(name) : undefined))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  if (!event.request.url.startsWith(self.location.origin)) return;

  const networkRequest = new Request(event.request, { cache: "no-store" });

  if (shouldBypassCache(event.request)) {
    event.respondWith(
      fetch(networkRequest).catch(() =>
        caches.match(event.request).then((cached) => cached || caches.match("/"))
      )
    );
    return;
  }

  event.respondWith(
    fetch(networkRequest)
      .then((response) => {
        if (response && response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() =>
        caches.match(event.request).then((cached) => {
          if (cached) return cached;
          if (event.request.mode === "navigate") return caches.match("/");
          return undefined;
        })
      )
  );
});
