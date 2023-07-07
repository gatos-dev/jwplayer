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
exports.AsyncItemController = void 0;
var playlist_1 = require("playlist/playlist");
var errors_1 = require("api/errors");
// Type only imports
var item_1 = require("playlist/item");
var AsyncItemError = /** @class */ (function (_super) {
    __extends(AsyncItemError, _super);
    function AsyncItemError(message) {
        var _this = _super.call(this, message) || this;
        _this.code = errors_1.ASYNC_PLAYLIST_ITEM_REJECTED;
        return _this;
    }
    return AsyncItemError;
}(Error));
var AsyncItemController = /** @class */ (function () {
    function AsyncItemController(index, model, api) {
        var _this = this;
        this.index = index;
        this.model = model;
        this.api = api;
        this.promise = new Promise(function (resolve, reject) {
            _this.resolve = resolve;
            _this.reject = reject;
        });
        this.async = null;
        this.asyncPromise = null;
        this.rejected = false;
    }
    Object.defineProperty(AsyncItemController.prototype, "callback", {
        set: function (handler) {
            this.async = handler;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AsyncItemController.prototype, "skipped", {
        get: function () {
            return this.rejected;
        },
        enumerable: false,
        configurable: true
    });
    AsyncItemController.prototype.run = function () {
        var _this = this;
        var _a = this, api = _a.api, async = _a.async, index = _a.index, model = _a.model, resolve = _a.resolve, reject = _a.reject, promise = _a.promise;
        var playlist = model.get('playlist');
        var playlistItem = this.getItem(index);
        if (!playlistItem) {
            var message = index === -1 ? 'No recs item' : "No playlist item at index ".concat(index);
            this.rejected = true;
            reject(new Error(message));
        }
        if (async) {
            this.clear();
            var asyncPromise = this.asyncPromise = async.call(api, playlistItem, index);
            if (asyncPromise && asyncPromise.then) {
                asyncPromise.then(function (item) {
                    if (item && item !== playlistItem && playlist === model.get('playlist')) {
                        var newItem = _this.replace(item);
                        if (newItem) {
                            resolve(newItem);
                            return;
                        }
                    }
                    resolve(playlistItem);
                })["catch"](function (error) {
                    var setActiveItemError = new AsyncItemError('Item skipped by playlist item callback');
                    setActiveItemError.sourceError = error;
                    _this.rejected = true;
                    reject(setActiveItemError);
                });
            }
            else {
                this.asyncPromise = null;
            }
        }
        if (!this.asyncPromise) {
            resolve(playlistItem);
        }
        return promise;
    };
    AsyncItemController.prototype.getItem = function (index) {
        var model = this.model;
        if (index === -1) {
            return model.get('nextUp');
        }
        var playlist = model.get('playlist');
        return playlist[index];
    };
    AsyncItemController.prototype.replace = function (item) {
        var _a = this, index = _a.index, model = _a.model;
        var newItem = (0, playlist_1.normalizePlaylistItem)(model, new item_1["default"](item), item.feedData || {});
        if (newItem) {
            if (index === -1) {
                model.set('nextUp', newItem);
            }
            else {
                var playlist = model.get('playlist');
                playlist[index] = newItem;
            }
            return newItem;
        }
    };
    AsyncItemController.prototype.clear = function () {
        this.async = null;
    };
    AsyncItemController.prototype.destroy = function () {
        this.model =
            this.api =
                this.promise =
                    this.resolve =
                        this.reject =
                            this.async =
                                this.asyncPromise = null;
    };
    return AsyncItemController;
}());
exports.AsyncItemController = AsyncItemController;
