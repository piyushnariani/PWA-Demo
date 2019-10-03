var CACHE_STATIC = 'static';
var CACHE_STATIC_VERSION = '6';
var CACHE_STATIC_NAME = CACHE_STATIC + "-v" + CACHE_STATIC_VERSION;

var CACHE_DYNAMIC = 'dynamic';
var CACHE_DYNAMIC_VERSION = '5';
var CACHE_DYNAMIC_NAME = CACHE_DYNAMIC + "-v" + CACHE_DYNAMIC_VERSION;

self.addEventListener('install', function(event) {
    console.log('[Service Worker] Installing service worker...', event);
    event.waitUntil(
        caches.open(CACHE_STATIC_NAME)
            .then(function(cache) {
                console.log('[SW] Precaching App Shell');
                cache.addAll([
                    '/',
                    '/index.html',
                    '/fallback.html',
                    '/src/js/app.js',
                    '/src/js/feed.js',
                    '/src/js/promise.js',
                    '/src/js/fetch.js',
                    '/src/js/material.min.js',
                    '/src/css/app.css',
                    '/src/css/feed.css',
                    '/src/images/main-image.jpg',
                    'https://fonts.googleapis.com/css?family=Roboto:400,700',
                    'https://fonts.googleapis.com/icon?family=Material+Icons',
                    'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
                ]);
            })
    )
});

self.addEventListener('activate', function(event) {
    console.log('[Service Worker] Activating Service worker...', event);
    event.waitUntil(
        caches.keys()
            .then(function(keyList) {
                return Promise.all(keyList.map(function(key) {
                    if(key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME){
                        console.log('[SW] Removing old cache.', key);
                        return caches.delete(key);
                    }
                }));
            })
    );
    return self.clients.claim();
});

//Cache with network fallback strategy
// self.addEventListener('fetch', function(event) {
//     event.respondWith(
//         caches.match(event.request)
//             .then(function(response) {
//                 if(response) {
//                     return response;
//                 } else {
//                     return fetch(event.request)
//                         .then(function(res){
//                             return caches.open(CACHE_DYNAMIC_NAME)
//                                 .then(function(cache) {
//                                     cache.put(event.request.url, res.clone());
//                                     return res;
//                                 });
//                         })
//                         .catch(function(err){
//                             return caches.open(CACHE_STATIC_NAME)
//                                     .then(function(cache){
//                                         return cache.match('/fallback.html');
//                                     });
//                         });
//                 }
//             })
//     );
// });

//Cache Only strategy
// self.addEventListener('fetch', function(event){
//     event.respondWith(caches.match(event.request));
// });

//Network only strategy
// self.addEventListener('fetch', function(event){
//     event.respondWith(fetch(event.request));
// });

//Network with cache fallback strategy
// self.addEventListener('fetch', function(event){
//     event.respondWith(
//         fetch(event.request)
//             .then(function(res){
//                 return caches.open(CACHE_DYNAMIC_NAME)
//                     .then(function(cache){
//                         cache.put(event.request.url, res.clone());
//                         return res;
//                     });
//             })
//             .catch(function(err){
//                 return caches.match(event.request);
//             })
//     );
// });

//Cache then network strategy
self.addEventListener('fetch', function(event){
    var url = 'https://httpbin.org/get';
    if(event.request.url.indexOf(url) > -1){
        event.respondWith(
            caches.open(CACHE_DYNAMIC_NAME)
                .then(function(cache){
                    return fetch(event.request)
                            .then(function(response){
                                cache.put(event.request, response.clone());
                                return response;
                            });
                })
        );
    } else {
        event.respondWith(
            caches.match(event.request)
                .then(function(response){
                    if(response){
                        return response;
                    } else {
                        return fetch(event.request)
                            .then(function(res){
                                return caches.open(CACHE_DYNAMIC_NAME)
                                    .then(function(cache){
                                        cache.put(event.request.url, res.clone());
                                        return res;
                                    });
                            })
                            .catch(function(err){
                                return caches.open(CACHE_STATIC_NAME)
                                    .then(function(cache){
                                        return cache.match('/fallback.html');
                                    });
                            });
                    }
                })
        );
    }
})