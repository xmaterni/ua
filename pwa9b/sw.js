/*jshint esversion:8 */
// "use strict";

const CACHE_NAME = "pwa9b_2";

let ualog_status = false;

const swlog = function (txt) {
    console.log(txt);
    if (ualog_status) {
        const msg = buildPushMsgToClients(txt, "log");
        postMessageToClients(msg);
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

//messaggio inviato al client dal SW
const buildPushMsgToClients = function (rsp_data, rsp_cmd = "") {
    const msg = {
        rqs_cmd: "push",
        rsp_cmd: rsp_cmd,
        rsp_data: rsp_data
    };
    return msg;
};

//messaggio di risposta ad una reques
const buildRspMsgToClients = function (rsp_data, rqs = {}) {
    const rqs_cmd = rqs.rqs_cmd || "none";
    const rsp_cmd = rqs.rsp_cmd || "none";
    const msg = {
        rqs_cmd: rqs_cmd,
        rsp_cmd: rsp_cmd,
        rsp_data: rsp_data
    };
    return msg;
};

// receives message
self.addEventListener('message', (event) => {
    if (event.data) {
        const rqs = event.data || {};
        const rqs_cmd = rqs.rqs_cmd || "none";
        const rqs_data = rqs.rqs_data || "";

        if (rqs_cmd == "test") {
            const data = `received from client ${rqs_data}`;
            const msg = buildRspMsgToClients(data, rqs);
            postMessageToClients(msg);
        }
        else if (rqs_cmd == "toggle_ualog") {
            ualog_status = !ualog_status;
        }
        else if (rqs_cmd == "read_cache") {
            readCache().then((urls) => {
                const msg = buildRspMsgToClients(urls, rqs);
                postMessageToClients(msg);
            });
        }
        else {
            const s = `SW Error listener(messag)<br>
             rqs_cmd: ${rqs_cmd} Not Found.`;
            swlog(s);
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

const readCache = () => {
    swlog("readCache");
    return caches.open(CACHE_NAME).then((cache) => {
        return cache.keys();
    }).then((requests) => {
        const lst = [];
        for (let rqs of requests)
            lst.push(rqs.url);
        return lst;
    });
};


const config = {
    version: "sw_3",
    staticCacheItems: [
        "/ua/pwa9b/index.html",
        "/ua/pwa9b/style.less",
        "/ua/pwa9b/menu_h.less",
        "/ua/pwa9b/uajs/less.min.js",
        // "/ua/pwa9b/style.css",
        // "/ua/pwa9b/menu_h.css",

        "/ua/pwa9b/index.js",
        "/ua/pwa9b/app.js",
        // "/ua/pwa9b/sw.js",

        "/ua/pwa9b/uajs/uawindow.js",
        "/ua/pwa9b/uajs/uadrag.js",
        "/ua/pwa9b/uajs/ualog.js",
        "/ua/pwa9b/uajs/uajthl.js",

        "/ua/pwa9b/icons/maskable_icon_x192.png",
        "/ua/pwa9b/icons/maskable_icon_x384.png",
        "/ua/pwa9b/icons/maskable_icon_x512.png",

        "/ua/pwa9b/imgs/fox1.jpg",
        "/ua/pwa9b/imgs/fox2.jpg",
        "/ua/pwa9b/imgs/fox3.jpg",
        "/ua/pwa9b/imgs/fox4.jpg",

        "/ua/pwa9b/sounds/fox1.mp3",
        "/ua/pwa9b/sounds/fox2.mp3",
        "/ua/pwa9b/sounds/fox3.mp3",
        "/ua/pwa9b/sounds/fox4.mp3",

        "/ua/pwa9b/data/anag.json",
        "/ua/pwa9b/data/anag20.json",

        "/ua/pwa9b/favicon.ico"
    ]
};

self.addEventListener('install', (event) => {
    swlog("install " + config.version);
    event.waitUntil(caches.open(CACHE_NAME)
        .then((cache) => cache.addAll(config.staticCacheItems))
        .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    swlog("activate " + config.version);
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
    let strategy = "n";
    if (["document", "style", "image", "audio"].includes(dest))
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
