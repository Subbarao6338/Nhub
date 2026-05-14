const CACHE_NAME = 'epic-toolbox-v22';
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

// Install Event - Pre-cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Pre-caching core assets');
      return cache.addAll(ASSETS_TO_CACHE);
    }).catch(err => {
      console.error('Service Worker: Cache addition failed during installation:', err);
    })
  );
  self.skipWaiting();
});

// Activate Event - Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Clearing Old Cache', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event - Strategic Caching
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  const isLocal = url.origin === self.location.origin;
  const isApi = url.pathname.startsWith('/api/');
  const isExternalImage = event.request.destination === 'image' && !isLocal;
  const isFont = url.origin.includes('fonts.googleapis.com') ||
                 url.origin.includes('fonts.gstatic.com') ||
                 url.pathname.endsWith('.woff2') ||
                 url.pathname.endsWith('.woff') ||
                 url.pathname.endsWith('.ttf');

  // API Strategy: Network First, then Cache
  if (isLocal && isApi) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse.ok) {
            const cacheCopy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, cacheCopy);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
    return;
  }

  // Fonts/Icons: Cache First, then Network
  if (isFont) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        return cachedResponse || fetch(event.request).then((networkResponse) => {
          if (networkResponse.ok) {
            const cacheCopy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cacheCopy));
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // Static Assets & Local Images: Stale-While-Revalidate
  if (isLocal || isExternalImage) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        const matchOptions = { ignoreSearch: true };
        return cache.match(event.request, matchOptions).then((cachedResponse) => {
          const fetchPromise = fetch(event.request).then((networkResponse) => {
            if (networkResponse.ok) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          }).catch((err) => {
            console.log("Fetch failed, returning cached response if available", err);
            // Fallback for missing images
            if (event.request.destination === 'image') {
              return cachedResponse || caches.match('./assets/urlhub.png');
            }
            return cachedResponse;
          });
          return cachedResponse || fetchPromise;
        });
      })
    );
  }
});
