const CACHE_NAME = 'appkit-v1';
const urlsToCache = [
  '/frontend/',
  '/frontend/index.html',
  '/frontend/login.html',
  '/frontend/dashboard.html',
  '/frontend/manifest.json',
  '/frontend/css/tokens.css',
  '/frontend/css/base.css',
  '/frontend/css/components.css',
  '/frontend/css/layout.css',
  '/frontend/css/advanced.css',
  '/frontend/js/config.js',
  '/frontend/js/api.js',
  '/frontend/js/auth.js',
  '/frontend/js/navigation.js',
  '/frontend/js/components/toast.js',
  '/frontend/js/components/modal.js',
  '/frontend/favicon.svg',
  '/frontend/assets/icons/icon-192.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      );
    })
  );
});
