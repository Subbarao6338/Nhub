const CACHE_NAME = 'url-hub-v6';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/style.css',
  './js/hub.js',
  './data/url_links.json',
  './data/url_cat.json',
  './assets/favicon.svg',
  './assets/urlhub.png',
  'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap',
  'https://fonts.googleapis.com/icon?family=Material+Icons'
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Use cache.addAll to ensure all critical assets are cached
      // If one fails, the installation will fail, which is correct for PWAs
      return cache.addAll(ASSETS_TO_CACHE);
    }).catch(err => {
      console.error('Service Worker: Cache addition failed during installation:', err);
    })
  );
  self.skipWaiting();
});

// Activate Event
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

// Fetch Event - Stale-While-Revalidate Strategy with error handling
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Skip cross-origin requests unless they are fonts/icons we specifically care about
  // This avoids errors with analytics or other external tracking if they exist
  const url = new URL(event.request.url);
  const isCachableOrigin = url.origin === self.location.origin ||
                          url.origin.includes('fonts.googleapis.com') ||
                          url.origin.includes('fonts.gstatic.com');

  if (!isCachableOrigin) {
    // For external images (favicons), try to serve from cache if network fails
    if (event.request.destination === 'image') {
      event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
          return cachedResponse || fetch(event.request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const cacheCopy = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cacheCopy));
            }
            return networkResponse;
          }).catch(() => {
            // If both fail, return the fallback favicon
            return caches.match('./assets/favicon.svg');
          });
        })
      );
    }
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        const fetchedResponse = fetch(event.request).then((networkResponse) => {
          // If the network response is valid, update the cache
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch((err) => {
          console.warn('Service Worker: Network fetch failed for', event.request.url, err);
          // For images, if network fails and no cache, try fallback
          if (event.request.destination === 'image') {
            return cachedResponse || caches.match('./assets/favicon.svg');
          }
          return cachedResponse;
        });

        // Return the cached response immediately if it exists, or wait for the network response
        return cachedResponse || fetchedResponse;
      });
    })
  );
});
