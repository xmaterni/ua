/*jshint esversion:8 */

const rqs_type_test = "test";
const rqs_type_log = "log";
const rqs_type_cmd = "cmd";

const log = function (...args) {
  console.log(...args);
};

const ualog = function (...args) {
  UaLog.log(...args);
};

const app_info = function (txt) {
  msg_prn(hbar, txt);
};

const app_log = function (txt) {
  msg_prn(m1, txt);
};


const SW_NAME = "/ua/pwa9b/sw.js";

let SW_STATE = "unregistred";

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register(SW_NAME)
    .then((registration) => {
      let sw;
      if (registration.installing) {
        sw = registration.installing;
        SW_STATE = "installing";
        log('installing');
        log(`scope: ${registration.scope}`);
      } else if (registration.waiting) {
        sw = registration.waiting;
        SW_STATE = "waiting";
        log('waiting');
      } else if (registration.active) {
        sw = registration.active;
        navigator.serviceWorker.onmessage = receivesMessage;
        SW_STATE = "active";
        log('active');
      }
      if (sw) {
        sw.addEventListener("statechange", (e) => {
          log('statechange', e.target.state);
        });
      }
      app_info(`SW ${SW_NAME}&nbsp;${SW_STATE.toUpperCase()}`);
    })
    .catch((error) => {
      alert(`Error(0) app.js\n${SW_NAME}\n ${error}`);
    });
} else {
  alert(`Erroro(1) app-js \n${SW_NAME} not in navigator`);
}

const json2str = function (js, ln = '\n') {
  const es = Object.entries(js);
  const lst = es.map((kv) => `${kv[0]}:${kv[1]}`);
  return lst.join(ln);
};

//post message to worker
const postMessageToWorker = function (msg) {
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage(msg);
  } else {
    alert(`Error(4) app.js ServiceWorker not activated \n ${SW_NAME}`);
  }
};

const receivesMessage = function (event) {
  const msg = event.data;
  const rsp_type = msg.rsp_type || "";

  if (rsp_type == rqs_type_test) {
    const out = msg.out || "";
    if (out == 'prn') {
      const html = json2str(msg, "<br>");
      app_log(html);
    }
    else {
      alert(`Error(2) app.js response \n ${out}`);
    }
  }
  else if (rsp_type == rqs_type_log) {
    const txt = msg.rsp;
    ualog(txt);
  }
  else if (rsp_type == rqs_type_cmd) {
    const rsp_name=msg.rsp_name || "";
    if(rsp_name=="cache_list"){
      const html = json2str(msg.rsp, "<br>");
      app_log(html);
    }
    else{
      app_log(`Response Error <br> rsp_name:${rsp_nsmr}`);
    }
  }
  else {
    app_log(`Response Error <br> ${rsp_type}`);
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
  reload();
}

function reload() {
  window.location.reload();
}

function toggleUaLog() {
  const msg = {
    rqs_type: rqs_type_cmd,
    rqs: "toggle_ualog"
  };
  postMessageToWorker(msg);
}

function readCache() {
  const msg = {
    rqs_type: rqs_type_cmd,
    rqs: "read_cache"
  };
  postMessageToWorker(msg);

}
