/*jshint esversion:8 */


document.getElementById("msg1").innerHTML = `app.js init() `;

const log = function (...args) {
  console.log(...args);
};

const ualog = function (...args) {
  UaLog.log(...args);
};


// const CHANNEL_MSG = "sw-messages";
const SW_NAME = "/ua/pwaes1/sw.js";


// if ("serviceWorker" in navigator) {
// navigator.serviceWorker
//   .register(SW_NAME, {
//     scope: "./",
//   })


if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register(SW_NAME)
    .then((registration) => {
      let sw;
      if (registration.installing) {
        sw = registration.installing;
        log('installing');
        log(`scope: ${registration.scope}`);
      } else if (registration.waiting) {
        sw = registration.waiting;
        log('waiting');
      } else if (registration.active) {
        sw = registration.active;
        navigator.serviceWorker.onmessage = receivesMessage;
        log('active');
        document.getElementById("msg2").innerHTML = "Service Worker Ativated";
      }
      if (sw) {
        sw.addEventListener("statechange", (e) => {
          log('statechange', e.target.state);
        });
      }
    })
    .catch((error) => {
      alert(`${SW_NAME} ${error}`);
    });
} else {
  alert("sercvie worker not in navigator");
}


const json2str = function (js, ln = '\n') {
  const es = Object.entries(js);
  const lst = es.map((kv) => `${kv[0]}:${kv[1]}`);
  return lst.join(ln);
};

//post message to worker
const postMessageToWorker = function (msg) {
  if (navigator.serviceWorker.controller) {
    // log(" post message to service worker");
    navigator.serviceWorker.controller.postMessage(msg);
  } else {
    log("No active ServiceWorker");
  }
};

const receivesMessage = function (event) {
  const data = event.data;
  if (typeof data == "string") {
    const html = data;
    ualog(html);

  } else {
    // const txt = json2str(data, "\n");
    const html = json2str(data, "<br>");
    ualog(html);
  }
};


function unregist() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      registration.unregister();
    });
  }
}

function unregistAll() {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (let registration of registrations) {
      registration.unregister();
    }
  });
}

function clearCaches() {
  caches.keys().then(function (names) {
    for (let name of names)
      caches.delete(name);
  });
}

function reset() {
  clearCaches();
  unregistAll();
}
