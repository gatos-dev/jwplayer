"use strict";
exports.__esModule = true;
exports.log = void 0;
/* eslint-disable no-console */
exports.log = (typeof console.log === 'function') ? console.log.bind(console) : noop;
function noop() {
    // noop
}
