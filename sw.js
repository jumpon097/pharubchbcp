const CACHE_NAME = 'bcp-pharmacy-cache-v2026-09-07-r6';
const APP_SHELL = [
  './','./index.html','./manifest.json','./icon-192.png','./icon-512.png','./favicon.png','./ดอกบัว5.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(names => Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  // ฐานข้อมูลกลาง: network-first เพื่อเห็นเวอร์ชันใหม่ทันที
  if (url.origin === self.location.origin && url.pathname.includes('/data/')) {
    event.respondWith(
      fetch(event.request, {cache:'no-store'}).then(res => {
        const copy = res.clone();
        if (res.ok) caches.open(CACHE_NAME).then(c => c.put(event.request, copy)).catch(()=>{});
        return res;
      }).catch(() => caches.match(event.request))
    );
    return;
  }

  // App shell / CDN: cache-first แล้วเติม cache เมื่อออนไลน์
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(res => {
        const copy = res.clone();
        if (event.request.method === 'GET' && (res.ok || res.type === 'opaque')) {
          caches.open(CACHE_NAME).then(c => c.put(event.request, copy)).catch(()=>{});
        }
        return res;
      }).catch(() => {
        if (event.request.mode === 'navigate') return caches.match('./index.html');
      });
    })
  );
});
