/ เปลี่ยนเลข Version ทุกครั้งที่มีการอัปเดตไฟล์ index.html ใหม่
// เพื่อให้เครื่องของ User ดึงข้อมูลใหม่ไปทับของเก่า
const CACHE_NAME = 'bcp-pharmacy-cache-v1.0';

// รายชื่อไฟล์เริ่มต้นที่ต้องการให้โหลดเก็บไว้ในเครื่องทันทีที่เข้าเว็บครั้งแรก
const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
  // หากคุณมีรูปไอคอนแยกต่างหาก ให้ใส่ชื่อไฟล์ลงไปที่นี่ด้วย เช่น './icon-192.png'
];

// 1. Install Event: โหลดไฟล์พื้นฐานมาเก็บไว้ใน Cache
self.addEventListener('install', event => {
  self.skipWaiting(); // บังคับให้ Service Worker ตัวใหม่ทำงานทันที
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] เปิดกล่อง Cache สำเร็จ');
        return cache.addAll(urlsToCache);
      })
  );
});

// 2. Activate Event: เคลียร์ Cache เวอร์ชันเก่าทิ้ง (เมื่อมีการเปลี่ยนเลข Version)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] ลบ Cache เก่า:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch Event: ดักจับการเรียกใช้ไฟล์ (Offline Strategy)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 3.1 ถ้ามีไฟล์ใน Cache ให้ดึงจากเครื่องมาแสดงเลย (Offline)
        if (response) {
          return response;
        }

        // 3.2 ถ้ายังไม่มีใน Cache ให้วิ่งไปดึงจาก Internet (รวมถึงพวกไฟล์ CDN เช่น qr.js, xlsx.js, fonts)
        return fetch(event.request).then(
          function(networkResponse) {
            // เช็คว่าการดึงข้อมูลจากเน็ตสำเร็จหรือไม่
            if(!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            // 3.3 ถ้าดึงจากเน็ตสำเร็จ ให้ Copy (Clone) ไฟล์นั้นเก็บลง Cache ไว้ใช้รอบหน้าตอน Offline ด้วย!
            var responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then(function(cache) {
                // เก็บเฉพาะ request ที่เป็น http/https (ป้องกัน error จาก protocol อื่นๆ)
                if (event.request.url.startsWith('http')) {
                    cache.put(event.request, responseToCache);
                }
              });

            return networkResponse;
          }
        ).catch(function(error) {
            console.log('[Service Worker] ออฟไลน์สมบูรณ์แบบ และหาไฟล์ไม่พบ: ', error);
        });
      })
  );
});
