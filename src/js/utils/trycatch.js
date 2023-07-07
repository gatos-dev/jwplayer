"use strict";
exports.__esModule = true;
exports.JwError = exports.tryCatch = void 0;
var api_settings_1 = require("api/api-settings");
function tryCatch(fn, ctx, args) {
    if (args === void 0) { args = []; }
    // In debug mode, allow `fn` to throw exceptions
    if (api_settings_1["default"].debug) {
        return fn.apply(ctx || this, args);
    }
    // else catch exceptions and return a `JWError`
    try {
        return fn.apply(ctx || this, args);
    }
    catch (e) {
        return new JwError(fn.name, e);
    }
}
exports.tryCatch = tryCatch;
function JwError(name, error) {
    this.name = name;
    this.message = error.message || error.toString();
    this.error = error;
}
exports.JwError = JwError;
