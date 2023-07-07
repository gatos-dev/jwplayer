"use strict";
exports.__esModule = true;
exports.dateTime = exports.now = void 0;
var date_1 = require("utils/date");
var performance = window.performance || {
    timing: {}
};
var startDate = performance.timing.navigationStart || (0, date_1.now)();
if (!('now' in performance)) {
    performance.now = function () { return ((0, date_1.now)() - startDate); };
}
function now() {
    return performance.now();
}
exports.now = now;
function dateTime() {
    return startDate + performance.now();
}
exports.dateTime = dateTime;
