"use strict";
exports.__esModule = true;
exports["default"] = (function () {
    if ('hidden' in document) {
        return function () {
            return !document.hidden;
        };
    }
    if ('webkitHidden' in document) {
        return function () {
            return !document.webkitHidden;
        };
    }
    // document.hidden not supported
    return function () {
        return true;
    };
}());
