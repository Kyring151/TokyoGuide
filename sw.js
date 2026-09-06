/* 东京自由行手册 PWA 离线脚本 · network-first：联网永远取最新，断网用缓存 */
const CACHE_NAME = 'tokyoguide-v14';
const CORE_ASSETS = ['./index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(CORE_ASSETS)).catch(() => {}));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const sameOrigin = new URL(req.url).origin === self.location.origin;
  e.respondWith(
    fetch(req).then(res => {
      if (sameOrigin && res && res.status === 200) {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(c => { try { c.put(req, copy); } catch (_) {} });
      }
      return res;
    }).catch(() => caches.match(req).then(hit => hit || caches.match('./index.html')))
  );
});
