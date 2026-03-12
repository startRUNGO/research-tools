const CACHE_NAME = 'research-tools-v1';
const ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './css/base.css',
    './css/components.css',
    './css/latex.css',
    './css/svg-editor.css',
    './css/sections.css',
    './css/responsive.css',
    './js/i18n.js',
    './js/ui-core.js',
    './js/navigation.js',
    './js/latex.js',
    './js/svg-editor.js',
    './js/models.js',
    './js/text-tools.js',
    './js/markdown.js',
    './js/references.js',
    './js/ai-features.js',
    './js/share.js'
];

// Install: cache all static assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
    );
    self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

// Fetch: network-first for CDN resources, cache-first for local assets
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // Network-first for CDN (MathJax etc.)
    if (url.origin !== location.origin) {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                    return response;
                })
                .catch(() => caches.match(event.request))
        );
        return;
    }

    // Cache-first for local assets
    event.respondWith(
        caches.match(event.request).then(cached => {
            if (cached) {
                // Update cache in background
                fetch(event.request).then(response => {
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, response));
                }).catch(() => {});
                return cached;
            }
            return fetch(event.request).then(response => {
                const clone = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                return response;
            });
        })
    );
});
