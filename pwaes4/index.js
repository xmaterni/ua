/* jshint esversion: 8 */
const hbar = "hbar";
const m1 = "m1";

const msg_prn = function (id, txt) {
    document.getElementById(id).innerHTML = txt;
};

const msg_log = function (id, txt) {
    const h0 = document.getElementById(id).innerHTML;
    const h1 = h0 + "<br>" + txt;
    document.getElementById(id).innerHTML = h1;
};

const msg_clear = function (id) {
    document.getElementById(id).innerHTML = '';
};


const clear = function () {
    msg_clear(m1);
};

const fn0 = function () {
    fetch("data/anag.json")
        .then(function (response) {
            if (!response.ok) {
                throw new Error("HTTP error, status = " + response.status);
            }
            msg_prn(m1, response.type);
            msg_log(m1, response.url);
            msg_log(m1, response.status);
            msg_log(m1, response.statusText);
            msg_log(m1, response.ok);
            return response.text();
        })
        .then(function (text) {
            msg_log(m1, text);
        })
        .catch(function (err) {
            alert("fn0\n " + err);
        });
};

const fn1 = function () {
    fetch("data/anag.json")
        .then(function (response) {
            if (!response.ok) {
                throw new Error("HTTP error, status = " + response.status);
            }
            return response.json();
        })
        .then(function (data) {
            const fnh = (d) => {
                return `
                <br/> 
                anagid:${d.anagid}<br/> 
                cognome:${d.cognome}<br/> 
                nome:${d.nome}<br/> 
                 `;
            };
            const html = UaJthl().set_template(fnh).append(data).text();
            msg_prn(m1, html);
        })
        .catch(function (err) {
            alert("fn1\n " + err);
        });
};

const fn2 = function () {
    fetch("data/anag20.json")
        .then(function (response) {
            if (!response.ok) {
                throw new Error("HTTP error, status = " + response.status);
            }
            return response.json();
        })
        .then(function (data) {
            const template = (d, i) => {
                return `${i}  ${d.id} ${d.cognome} ${d.nome}<br/>`;
            };
            const jt = UaJthl().set_template(template);
            jt.append_json_array(data, 1);
            const html = jt.text();
            msg_prn(m1, html);
        })
        .catch(function (err) {
            alert("fn2\n " + err);
        });
};

const fn3 = function () {
    const msg = {
        rqs_type: rqs_type_test,
        out: "prn",
        rqs: "test message from client"
    };
    postMessageToWorker(msg);
};

const fn4 = function () {
    const msg = {
        rqs_type: rqs_type_test,
        out: "log",
        rqs: "test log from client"
    };
    postMessageToWorker(msg);
};

const fn5 = function (name) {
    document.getElementById("m1").innerHTML = "";
    const img = document.createElement("img");
    img.src = "/ua/pwaes4/imgs/" + name + ".jpg";
    img.style.height = "100%";
    document.getElementById("m1").appendChild(img);
    const audio = new Audio("/ua/pwaes4/sounds/" + name + ".mp3");
    audio.play();
};
