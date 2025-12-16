// MENYRA Dummy Service Worker (placeholder)
// Später: caching, offline fallback, background sync, push

self.addEventListener("install", (event) => {
  self.skipWaiting();
});
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});
self.addEventListener("fetch", (event) => {
  // Dummy: no caching
});
