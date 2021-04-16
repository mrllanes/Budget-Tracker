// Used "template" from Activity 13ish MOST OF BOTTOM PORTION STAYS THE SAME???
const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";
const FILES_TO_CACHE = [
    "/",
    "/db.js",
    "/index.html",
    "/index.js",
    "/manifest.webmanifest",
    "/service-worker.js",
    "/styles.css",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png",
];

// install
self.addEventListener("install", function (evt) {
    // pre cache all static assets
    evt.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log("Opened cache.");
            cache.addAll(FILES_TO_CACHE);
        })
    );

    // tell the browser to activate this service worker immediately once it
    // has finished installing
    self.skipWaiting();
});

// fetch
self.addEventListener("fetch", function (evt) {
    if (evt.request.url.includes("/api/")) {
        evt.respondWith(
            caches
                .open(DATA_CACHE_NAME)
                .then((cache) => {
                    return fetch(evt.request)
                        .then((response) => {
                            // If the response was good, clone it and store it in the cache.
                            if (response.status === 200) {
                                cache.put(evt.request.url, response.clone());
                            }

                            return response;
                        })
                        .catch((err) => {
                            // Network request failed, try to get it from the cache.
                            return cache.match(evt.request);
                        });
                })
                .catch((err) => console.log(err))
        );

        return;
    }

    evt.respondWith(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.match(evt.request).then((response) => {
                return response || fetch(evt.request);
            });
        })
    );
});
