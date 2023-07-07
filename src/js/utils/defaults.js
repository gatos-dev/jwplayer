"use strict";
exports.__esModule = true;
// Adds properties to the first object from the rest
// Does not add properties which exist anywhere in the object or it's prototype chain (no shadowing, no overriding)
function defaults(obj) {
    var rest = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        rest[_i - 1] = arguments[_i];
    }
    rest.forEach(function (source) {
        if (source) {
            for (var prop in source) {
                if (!(prop in obj)) {
                    obj[prop] = source[prop];
                }
            }
        }
    });
    return obj;
}
exports["default"] = defaults;
