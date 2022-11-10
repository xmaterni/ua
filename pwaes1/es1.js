/* jshint esversion: 8 */


const es = {
    show(txt) {
        document.getElementById("div2").innerHTML = txt;
    },
    log(txt) {
        const h0 = document.getElementById("div2").innerHTML;
        const h1 = h0 + "<br>" + txt;
        document.getElementById("div2").innerHTML = h1;
    },
    clear() {
        document.getElementById("div2").innerHTML = '';
    }
};

const fn0 = function () {
    fetch("data/anag.json")
        .then(function (response) {
            if (!response.ok) {
                throw new Error("HTTP error, status = " + response.status);
            }
            es.log(response.type);
            es.log(response.url);
            es.log(response.status);
            es.log(response.statusText);
            es.log(response.ok);
            return response.text();
        })
        .then(function (text) {
            es.log(text);
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
            es.show(html);
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
            es.show(html);
        })
        .catch(function (err) {
            alert("fn2\n " + err);
        });
};

const fn3 = function () {
    const msg={
        msg:"message client"
    };
    postMessageToWorker(msg);
};


const fn4 = function () {
    UaLog.log("fn4 v. 1.0");
};
