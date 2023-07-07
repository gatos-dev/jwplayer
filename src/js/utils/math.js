"use strict";
exports.__esModule = true;
exports.between = void 0;
// Clamp the input number between min max values
var between = function (num, min, max) {
    return Math.max(Math.min(num, max), min);
};
exports.between = between;
