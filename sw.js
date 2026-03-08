const CACHE = 'thefitness-v1';
const ASSETS = [
  './fitness-1.html',
  './fitness-manifest.json',
  './fitness-icon-192.png',
  './fitness-icon-512.png',
  'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap',
];

// Install — cache core assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS).catch(() => {}))
  );
  self.skipWaiting();
});

// Activate — clear old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — network first, fallback to cache
self.addEventListener('fetch', e => {
  // Skip non-GET and Google API requests (always need network)
  if (e.request.method !== 'GET') return;
  if (e.request.url.includes('googleapis.com') || e.request.url.includes('accounts.google.com')) return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Cache fresh response
        if (res && res.status === 200 && res.type !== 'opaque') {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
