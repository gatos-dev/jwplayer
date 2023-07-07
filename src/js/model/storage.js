"use strict";
exports.__esModule = true;
var parser_1 = require("utils/parser");
var api_settings_1 = require("api/api-settings");
var storage = {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
    removeItem: function (itemName) { }
};
try {
    storage = window.localStorage || storage;
}
catch (e) { /* ignore */ }
var Storage = /** @class */ (function () {
    function Storage(namespace, persistItems) {
        this.namespace = namespace;
        this.items = persistItems;
    }
    Storage.prototype.getAllItems = function () {
        var _this = this;
        return this.items.reduce(function (memo, key) {
            var val = storage["".concat(_this.namespace, ".").concat(key)];
            if (val) {
                memo[key] = key !== 'captions' ? (0, parser_1.serialize)(val) : JSON.parse(val);
            }
            return memo;
        }, {});
    };
    Storage.prototype.track = function (model) {
        var _this = this;
        this.items.forEach(function (key) {
            model.on("change:".concat(key), function (changeModel, value) {
                try {
                    if (key === 'captions') {
                        value = JSON.stringify(value);
                    }
                    storage["".concat(_this.namespace, ".").concat(key)] = value;
                }
                catch (e) {
                    // ignore QuotaExceededError unless debugging
                    if (api_settings_1["default"].debug) {
                        console.error(e);
                    }
                }
            });
        });
    };
    Storage.prototype.clear = function () {
        var _this = this;
        this.items.forEach(function (key) {
            storage.removeItem("".concat(_this.namespace, ".").concat(key));
        });
    };
    return Storage;
}());
exports["default"] = Storage;
