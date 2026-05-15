const CACHE_NAME = 'nature-hub-v25';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './assets/favicon.svg',
  './assets/urlhub.png',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap',
  'https://fonts.gstatic.com/',
  'https://fonts.googleapis.com/icon?family=Material+Icons'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.map((k) => k !== CACHE_NAME && caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  const isApi = url.pathname.startsWith('/api/');

  if (isApi) {
    event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request).then((network) => {
        if (network.ok) {
            const copy = network.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return network;
      }).catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
