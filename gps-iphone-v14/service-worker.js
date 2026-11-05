"use strict";

const CACHE_VERSION = "2026-11-05-daily-phone-mp4-pilot-v1";
const STATIC_CACHE = `pac-daily-phone-static-${CACHE_VERSION}`;
const OFFLINE_URL = "/ProAthleteCare-1/gps-iphone-v14/offline.html";

const PRECACHE_URLS = [
  OFFLINE_URL,
  "/ProAthleteCare-1/gps-iphone-v14/manifest.webmanifest",
  "/ProAthleteCare-1/gps-iphone-v14/css/style.css",
  "/ProAthleteCare-1/gps-iphone-v14/css/index.css",
  "/ProAthleteCare-1/gps-iphone-v14/js/site-lock.js",
  "/ProAthleteCare-1/gps-iphone-v14/js/pwa-register.js",
  "/ProAthleteCare-1/gps-iphone-v14/assets/images/AK_logo-256.png",
  "/ProAthleteCare-1/gps-iphone-v14/assets/icons/apple-touch-icon.png",
  "/ProAthleteCare-1/gps-iphone-v14/assets/icons/pwa-192.png",
  "/ProAthleteCare-1/gps-iphone-v14/assets/icons/pwa-512.png",
];

const NETWORK_ONLY_PREFIXES = [
  "/__/",
  "/api/",
  "/ProAthleteCare-1/gps-iphone-v14/admin.html",
  "/ProAthleteCare-1/gps-iphone-v14/pages/regist.html",
  "/ProAthleteCare-1/gps-iphone-v14/pages/auth-action.html",
  "/ProAthleteCare-1/gps-iphone-v14/pages/security.html",
  "/ProAthleteCare-1/gps-iphone-v14/pages/profile.html",
];

function isNetworkOnly(url) {
  const path = url.pathname;
  if (NETWORK_ONLY_PREFIXES.some((prefix) => path.startsWith(prefix))) return true;
  return ["token", "code", "oobCode", "apiKey"].some((key) => url.searchParams.has(key));
}

function isStaticAsset(pathname) {
  return /\.(?:css|js|png|jpg|jpeg|webp|svg|ico|woff2?|webmanifest)$/i.test(pathname);
}

function responseCanBeCached(response) {
  if (!response || !response.ok || response.type !== "basic") return false;
  const cacheControl = response.headers.get("Cache-Control") || "";
  return !/(?:no-store|private)/i.test(cacheControl);
}

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key.startsWith("pac-daily-phone-static-") && key !== STATIC_CACHE)
          .map((key) => caches.delete(key)),
      ))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin || isNetworkOnly(url)) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request, { cache: "no-store" })
        .catch(() => caches.match(OFFLINE_URL)),
    );
    return;
  }

  if (!isStaticAsset(url.pathname)) return;

  event.respondWith((async () => {
    const cache = await caches.open(STATIC_CACHE);
    const cached = await cache.match(request);
    const network = fetch(request).then(async (response) => {
      if (responseCanBeCached(response)) await cache.put(request, response.clone());
      return response;
    });
    if (cached) {
      // Revalidation is background work; an offline fetch must not reject unhandled.
      event.waitUntil(network.catch(() => undefined));
      return cached;
    }
    return network;
  })());
});
