const CACHE_NAME = 'finance-swiss-v1';
const ASSETS = [
  '/my-comp/finance-swiss-v18.html',
  '/my-comp/icons/finance-swiss-192.png',
  '/my-comp/icons/finance-swiss-512.png',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Network first for Drive API calls
  if (e.request.url.includes('googleapis.com') || e.request.url.includes('workers.dev')) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }
  // Cache first for app shell
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
      const clone = res.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
      return res;
    }))
  );
});
