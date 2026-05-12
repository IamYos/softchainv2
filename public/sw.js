// Softchain service worker — aggressive cache for the entire frontend.
//
// Strategy:
//   - Next.js hashed assets (/_next/static/*): cache-first, immutable.
//   - Fonts / icons / images / iframe-engine assets: cache-first.
//   - HTML navigations: stale-while-revalidate (instant, then refresh).
//   - Everything else same-origin: stale-while-revalidate.
//   - /api/* and Next server actions: bypass.
//
// Bump CACHE_VERSION to invalidate all caches on next activation.

const CACHE_VERSION = "softchain-cache-v1";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const PAGES_CACHE = `${CACHE_VERSION}-pages`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;
const ALL_CACHES = [STATIC_CACHE, PAGES_CACHE, RUNTIME_CACHE];

const ASSET_EXT = /\.(woff2?|ttf|otf|eot|jpe?g|png|gif|webp|avif|svg|ico|mp4|webm|css|js|json)$/i;

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) =>
      cache.addAll(["/", "/manifest.webmanifest"]).catch(() => undefined),
    ),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => !ALL_CACHES.includes(k))
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("message", (event) => {
  const data = event.data;
  if (!data || typeof data !== "object") return;

  if (data.type === "PREFETCH_ROUTES" && Array.isArray(data.routes)) {
    event.waitUntil(prefetchRoutes(data.routes));
  }
});

async function prefetchRoutes(routes) {
  const cache = await caches.open(PAGES_CACHE);
  await Promise.all(
    routes.map(async (path) => {
      try {
        const req = new Request(path, { credentials: "same-origin" });
        const existing = await cache.match(req);
        if (existing) return;
        const res = await fetch(req);
        if (res.ok) await cache.put(req, res.clone());
      } catch {
        // network unreachable — ignore
      }
    }),
  );
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Bypass: API, Next server actions, RSC payloads with auth, hot-reload.
  if (url.pathname.startsWith("/api/")) return;
  if (url.pathname.startsWith("/_next/data/")) return;
  if (req.headers.get("next-action")) return;
  if (req.headers.get("rsc")) return;
  if (url.pathname.startsWith("/_next/webpack-hmr")) return;

  // Immutable hashed assets — cache forever, network only on miss.
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(req, STATIC_CACHE));
    return;
  }

  // Static asset folders we own.
  if (
    url.pathname.startsWith("/fonts/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/solutions/") ||
    url.pathname.startsWith("/vendor/") ||
    ASSET_EXT.test(url.pathname)
  ) {
    event.respondWith(cacheFirst(req, STATIC_CACHE));
    return;
  }

  // HTML navigations — show cache instantly, refresh in background.
  if (
    req.mode === "navigate" ||
    (req.headers.get("accept") || "").includes("text/html")
  ) {
    event.respondWith(staleWhileRevalidate(req, PAGES_CACHE));
    return;
  }

  event.respondWith(staleWhileRevalidate(req, RUNTIME_CACHE));
});

async function cacheFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  if (cached) return cached;
  const res = await fetch(req);
  if (res && res.ok && res.status === 200) {
    cache.put(req, res.clone()).catch(() => undefined);
  }
  return res;
}

async function staleWhileRevalidate(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  const network = fetch(req)
    .then((res) => {
      if (res && res.ok && res.status === 200) {
        cache.put(req, res.clone()).catch(() => undefined);
      }
      return res;
    })
    .catch(() => cached);
  return cached || network;
}
