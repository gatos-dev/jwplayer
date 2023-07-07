"use strict";
exports.__esModule = true;
exports.cancelAnimationFrame = exports.requestAnimationFrame = void 0;
exports.requestAnimationFrame = window.requestAnimationFrame || polyfillRAF;
exports.cancelAnimationFrame = window.cancelAnimationFrame || clearTimeout;
function polyfillRAF(callback) {
    return setTimeout(callback, 17);
}
