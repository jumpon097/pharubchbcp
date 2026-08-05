const CACHE_NAME = 'bcp-pharmacy-cache-v2026-08-05-r5-embedded-db';
const urlsToCache = [
  './','./index.html','./manifest.json','./icon-192.png','./icon-512.png','./favicon.png','./ดอกบัว5.png'
];
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(names => Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(fetch(event.request).then(response => {
    const copy = response.clone();
    if (response && (response.status === 200 || response.type === 'opaque')) {
      caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy)).catch(()=>{});
    }
    return response;
  }).catch(() => caches.match(event.request).then(r => r || caches.match('./index.html'))));
});
