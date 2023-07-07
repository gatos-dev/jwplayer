"use strict";
exports.__esModule = true;
exports.now = void 0;
exports.now = Date.now || function () {
    return new Date().getTime();
};
