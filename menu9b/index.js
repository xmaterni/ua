/* jshint esversion: 8 */

const msg_prn = function (txt) {
    document.querySelector('.item1').innerHTML = txt;
};

const op = function (e) {
    msg_prn(e.innerHTML);
};
