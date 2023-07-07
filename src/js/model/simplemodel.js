"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var backbone_events_1 = require("utils/backbone.events");
var SimpleModel = /** @class */ (function (_super) {
    __extends(SimpleModel, _super);
    function SimpleModel() {
        var _this = _super.call(this) || this;
        _this.attributes = Object.create(null);
        return _this;
    }
    SimpleModel.prototype.addAttributes = function (attributes) {
        var _this = this;
        Object.keys(attributes).forEach(function (attr) {
            _this.add(attr, attributes[attr]);
        });
    };
    SimpleModel.prototype.add = function (attr, value) {
        var _this = this;
        Object.defineProperty(this, attr, {
            get: function () { return _this.attributes[attr]; },
            set: function (val) {
                _this.set(attr, val);
            },
            enumerable: false
        });
        this.attributes[attr] = value;
    };
    SimpleModel.prototype.get = function (attr) {
        return this.attributes[attr];
    };
    SimpleModel.prototype.set = function (attr, val) {
        if (this.attributes[attr] === val) {
            return;
        }
        var oldVal = this.attributes[attr];
        this.attributes[attr] = val;
        this.trigger('change:' + attr, this, val, oldVal);
    };
    SimpleModel.prototype.clone = function () {
        var cloned = {};
        var attributes = this.attributes;
        if (attributes) {
            /* eslint guard-for-in: 0 */
            for (var prop in attributes) {
                cloned[prop] = attributes[prop];
            }
        }
        return cloned;
    };
    SimpleModel.prototype.change = function (name, callback, context) {
        // Register a change handler and immediately invoke the callback with the current value
        this.on('change:' + name, callback, context);
        var currentVal = this.get(name);
        callback.call(context, this, currentVal, currentVal);
        return this;
    };
    return SimpleModel;
}(backbone_events_1["default"]));
exports["default"] = SimpleModel;
