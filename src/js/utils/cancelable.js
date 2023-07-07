"use strict";
exports.__esModule = true;
var Cancelable = /** @class */ (function () {
    function Cancelable(callback) {
        this.callback = callback;
    }
    Cancelable.prototype.async = function () {
        var _this = this;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return Promise.resolve().then(function () {
            if (_this.callback !== null) {
                return _this.callback.apply(_this, args);
            }
        });
    };
    Cancelable.prototype.cancel = function () {
        this.callback = null;
    };
    Cancelable.prototype.cancelled = function () {
        return this.callback === null;
    };
    return Cancelable;
}());
function cancelable(callback) {
    return new Cancelable(callback);
}
exports["default"] = cancelable;
