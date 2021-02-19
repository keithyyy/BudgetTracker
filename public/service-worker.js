const CACHE_NAME = "my-budget-cache-v1"
const DATA_CACHE_NAME = "data-cache-v1"

const THINGS_TO_CACHE = [
    "/",
    "/index.html",
    "/db.js",
    "/styles.css",
    "/index.js",
    "/manifest.webmanifest",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png",
];

// install
self.addEventListener("install", function(evt) {
    // setting up our cache
    evt.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log(`cache opened`)
            cache.addAll(THINGS_TO_CACHE)
        })
    )
        // tell browser to use this service worker right after it installs
    self.skipWaiting();
});

// activate
self.addEventListener("activate", function(evt) {
    evt.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(keyList.map(key => {
                if(key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                    return caches.delete(key)
                }
            }))
        })
    )
    evt.clients.claim();
})

// fetch
self.addEventListener("fetch", function(evt) {
    if (evt.request.url.includes("/api/")) {
      evt.respondWith(
        caches.open(DATA_CACHE_NAME).then(cache => {
          return fetch(evt.request)
            .then(response => {
              // If the response was good, clone it and store it in the cache.
              if (response.status === 200) {
                cache.put(evt.request.url, response.clone());
              }
  
              return response;
            })
            .catch(err => {
              // Network request failed, try to get it from the cache.
              return cache.match(evt.request);
            });
        }).catch(err => console.log(err))
      );
  
      return;
    }
  
    evt.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return cache.match(evt.request).then(response => {
          return response || fetch(evt.request);
        });
      })
    );
});
  