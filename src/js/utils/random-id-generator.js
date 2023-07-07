"use strict";
exports.__esModule = true;
exports.genId = exports.FEED_SHOWN_ID_LENGTH = void 0;
exports.FEED_SHOWN_ID_LENGTH = 12;
// Taken from the Analytics repo (src/js/utils/general_utils.ts)
function randomAlphaNumericString() {
    try {
        var crypto_1 = window.crypto || window.msCrypto;
        if (crypto_1 && crypto_1.getRandomValues) {
            return crypto_1.getRandomValues(new Uint32Array(1))[0].toString(36);
        }
    }
    catch (e) { /* ignore */ }
    return Math.random().toString(36).slice(2, 9);
}
function genId(length) {
    var str = '';
    while (str.length < length) {
        str += randomAlphaNumericString();
    }
    return str.slice(0, length);
}
exports.genId = genId;
