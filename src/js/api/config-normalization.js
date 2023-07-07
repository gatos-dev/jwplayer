"use strict";
exports.__esModule = true;
exports.normalizeAspectRatio = exports.normalizeSize = void 0;
// Normalize width and height ending with 'px' to numbers
function normalizeSize(val) {
    if (val.slice && val.slice(-2) === 'px') {
        val = val.slice(0, -2);
    }
    return val;
}
exports.normalizeSize = normalizeSize;
// Convert aspectratio from "W:H" to a percentage
function normalizeAspectRatio(ar, width) {
    if (width.toString().indexOf('%') === -1) {
        return 0;
    }
    if (typeof ar !== 'string' || !ar) {
        return 0;
    }
    if (/^\d*\.?\d+%$/.test(ar)) {
        return ar;
    }
    var index = ar.indexOf(':');
    if (index === -1) {
        return 0;
    }
    var w = parseFloat(ar.substr(0, index));
    var h = parseFloat(ar.substr(index + 1));
    if (w <= 0 || h <= 0) {
        return 0;
    }
    return (h / w * 100) + '%';
}
exports.normalizeAspectRatio = normalizeAspectRatio;
