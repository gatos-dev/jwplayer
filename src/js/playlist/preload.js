"use strict";
exports.__esModule = true;
exports.getPreload = void 0;
var preloadValues = {
    none: true,
    metadata: true,
    auto: true
};
function getPreload(preload, fallback) {
    if (preloadValues[preload]) {
        return preload;
    }
    return preloadValues[fallback] ? fallback : 'metadata';
}
exports.getPreload = getPreload;
