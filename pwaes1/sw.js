/*jshint esversion:8 */
// "use strict";

const swlog = function (...args) {
    console.log(...args);
};

const logRequest = function (request) {
    swlog("-----------------------------");
    swlog("url:" + request.url);
    swlog("destination:" + request.destination);
    // const s = JSON.stringify(request.headers);
    // swlog("SW headers:" + s);
    swlog("method:" + request.method);
    swlog("mode:" + request.mode);
    // swlog("SW cache:" + request.cache);

    const url = new URL(request.url);
    // swlog("hostname:" + url.hostname);
    // swlog("host:" + url.host);
    // swlog("port:" + url.port);
    swlog("pathname:" + url.pathname);
    swlog("origin:" + url.origin);
    swlog(".............................");
};


// receives message
self.addEventListener('message', (event) => {
    swlog("SW message: ", event.data);
    if (event.data) {
        event.data.status = "received from SW";
        postMessageToClients(event.data);
    }
});

// post message
const postMessageToClients = function (message) {
    return self.clients.matchAll().then(clients => {
        return Promise.all(clients.map(client => {
            return client.postMessage(message);
        }));
    });
};

////////////////////////////

const CACHE_NAME = "pwaes1_1";

const config = {
    version: "sw0",
    staticCacheItems: [
        "/ua/pwaes1/index.html",
        "/ua/pwaes1/style.css",
        "/ua/pwaes1/icons/icon-144x144.png",
        "/ua/pwaes1/uajs/uawindow.js",
        "/ua/pwaes1/uajs/uadrag.js",
        "/ua/pwaes1/uajs/ualog.js",
        "/ua/pwaes1/uajs/uajthl.js",
        "/ua/pwaes1/app.js",
        "/ua/pwaes1/es1.js",
        "/ua/pwaes1/sw.js",
        "/ua/pwaes1/data/anag.json",
        "/ua/pwaes1/data/anag20.json",
        "/ua/pwaes1/favicon.ico"
    ]
};

self.addEventListener('install', (event) => {
    swlog("install ", config.version);
    event.waitUntil(caches.open(CACHE_NAME)
        .then((cache) => cache.addAll(config.staticCacheItems))
        .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    swlog("activate ", config.version);
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((cache_key) => {
                    if (cache_key !== CACHE_NAME) {
                        return caches.delete(cache_key);
                    }
                })
            );
        }).then(() => {
            swlog("Old caches are cleared!");
            return self.clients.claim();
        })
    );
});


///////////////////////
// fetch
///////////////////////

const networkOnly = (event) => {
    event.respondWith(fetch(event.request));
};

const networkFirst = (event) => {
    event.respondWith(fetch(event.request)
        .then((networkResponse) => {
            swlog("networkFirst net");
            return caches.open(CACHE_NAME)
                .then((cache) => {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                });
        })
        .catch(() => {
            swlog("networkFirst cache");
            return caches.match(event.request);
        })
    );
};


const cacheFirst = (event) => {
    event.respondWith(caches.open(CACHE_NAME)
        .then((cache) => {
            return cache.match(event.request.url)
                .then((cachedResponse) => {
                    if (cachedResponse) {
                        swlog("cacheFirst cache");
                        return cachedResponse;
                    }
                    return fetch(event.request)
                        .then((fetchedResponse) => {
                            swlog("cacheFirst net");
                            cache.put(event.request, fetchedResponse.clone());
                            return fetchedResponse;
                        });
                });
        }));
};


//cache first and network update cache 
//else 
//network and update cache)
const staleWhileRevalidate = (event) => {
    event.respondWith(caches.open(CACHE_NAME)
        .then((cache) => {
            return cache.match(event.request.url)
                .then((cachedResponse) => {
                    if (cachedResponse) {
                        swlog("staleWhileRevalidate cache");
                        fetch(event.request)
                            .then((networkResponse) => {
                                cache.put(event.request, networkResponse.clone());
                            });
                        return cachedResponse;
                    }
                    else {
                        swlog("staleWhileRevalidate net");
                        return fetch(event.request)
                            .then((networkResponse) => {
                                cache.put(event.request, networkResponse.clone());
                                return networkResponse;
                            });
                    }
                });
        }));
};

self.addEventListener('fetch', (event) => {
    logRequest(event.request);
    if (navigator.onLine) {
        swlog("online");
    } else {
        swlog("offline");
    }
    const dest = event.request.destination;
    const mode = event.request.mode;

    let strategy = "n";
    if (["document", "style", "image"].includes(dest))
        strategy = "cn";
    else if (["script"].includes(dest))
        strategy = "svr";
    if (mode == "cors")
        strategy = "nc";

    if (strategy == "n") {
        swlog("network only");
        return networkOnly(event);
    }
    else if (strategy == "nc") {
        swlog("network first");
        return networkFirst(event);
    }
    else if (strategy == "cn") {
        swlog("cache first");
        return cacheFirst(event);
    }
    else if (strategy == "svr") {
        swlog("staleWhileRevalidate");
        return staleWhileRevalidate(event);
    }
    else {
        swlog("fetch null");
        return;
    }
});
