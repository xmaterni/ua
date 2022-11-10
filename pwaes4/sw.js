/*jshint esversion:8 */
// "use strict";

let ualog_status = false;

const rqs_type_test="test";
const rqs_type_cmd="cmd";

const rsp_type_log="log";
const rsp_type_test="test";

const swlog = function (txt) {
    console.log(txt);
    if (ualog_status) {
        const data = {
            rsp_type: rsp_type_log,
            rsp: txt
        };
        postMessageToClients(data);
    }
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
    if (event.data) {
        const rqs_type = event.data.rqs_type || "";
        if (rqs_type == rqs_type_test) {
            event.data.rsp_type = rsp_type_test;
            event.data.rsp = "received test message from client";
            postMessageToClients(event.data);
        }
        else if (rqs_type == rqs_type_cmd) {
            const rqs = event.data.rqs || "";
            if (rqs == "toggle_ualog") {
                ualog_status = !ualog_status;
            }
        }
        else {
            swlog(`rqs_type Error: ${rqs_type}`);
        }
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



const CACHE_NAME = "pwaes4_2";

const config = {
    version: "sw_3",
    staticCacheItems: [
        "/ua/pwaes4/index.html",
        "/ua/pwaes4/style.less",

        "/ua/pwaes4/icons/icon-144x144.png",

        "/ua/pwaes4/imgs/fox1.jpg",
        "/ua/pwaes4/imgs/fox2.jpg",
        "/ua/pwaes4/imgs/fox3.jpg",
        "/ua/pwaes4/imgs/fox4.jpg",

        "/ua/pwaes4/sounds/fox1.mp3",
        "/ua/pwaes4/sounds/fox2.mp3",
        "/ua/pwaes4/sounds/fox3.mp3",
        "/ua/pwaes4/sounds/fox4.mp3",

        "/ua/pwaes4/uajs/uawindow.js",
        "/ua/pwaes4/uajs/uadrag.js",
        "/ua/pwaes4/uajs/ualog.js",
        "/ua/pwaes4/uajs/uajthl.js",
        "/ua/pwaes4/uajs/less.min.js",

        "/ua/pwaes4/index.js",
        "/ua/pwaes4/app.js",
        // "/ua/pwaes4/sw.js",

        "/ua/pwaes4/data/anag.json",
        "/ua/pwaes4/data/anag20.json",

        "/ua/pwaes4/favicon.ico"
    ]
};

self.addEventListener('install', (event) => {
    swlog("install "+ config.version);
    event.waitUntil(caches.open(CACHE_NAME)
        .then((cache) => cache.addAll(config.staticCacheItems))
        .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    swlog("activate "+ config.version);
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
    // logRequest(event.request);
    const dest = event.request.destination;
    const mode = event.request.mode;
    const info = "";
    // 
    let strategy ="n";
    if (["document", "style", "image","audio"].includes(dest))
        strategy = "cn";
    else if (["script"].includes(dest))
        strategy = "svr";
    if (mode == "cors")
        strategy = "nc";
    // 
    if (strategy == "n") {
        swlog(`network only (${info})`);
        return networkOnly(event);
    }
    else if (strategy == "nc") {
        swlog(`network first (${info})`);
        return networkFirst(event);
    }
    else if (strategy == "cn") {
        swlog(`cache first (${info})`);
        return cacheFirst(event);
    }
    else if (strategy == "svr") {
        swlog(`staleWhileRevalidate (${info})`);
        return staleWhileRevalidate(event);
    }
    else {
        swlog("fetch null");
        return;
    }
});
