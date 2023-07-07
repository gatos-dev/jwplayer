"use strict";
exports.__esModule = true;
exports.limit = void 0;
// Helper function to wrap a function so that it can only be executed
// a limited number of times before being "silenced"
// Can be reset to allow the target function to be invoked again
var limit = function (fn, maxTimes) {
    var times = 0;
    var wrapper = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        times++;
        if (times < maxTimes) {
            return fn.apply(this, args);
        }
    };
    return Object.assign(wrapper, {
        reset: function () {
            times = 0;
        },
        shush: function () {
            times = Infinity;
        }
    });
};
exports.limit = limit;
