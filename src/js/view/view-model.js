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
exports.PlayerViewModel = void 0;
var simplemodel_1 = require("model/simplemodel");
var changeEventRegEx = /^change:(.+)$/;
function dispatchDiffChangeEvents(viewModel, newAttributes, oldAttributes) {
    Object.keys(newAttributes).forEach(function (attr) {
        if (attr in newAttributes && newAttributes[attr] !== oldAttributes[attr]) {
            viewModel.trigger("change:".concat(attr), viewModel, newAttributes[attr], oldAttributes[attr]);
        }
    });
}
function removeListeners(instance, viewModel) {
    if (instance) {
        instance.off(null, null, viewModel);
    }
}
var PlayerViewModel = /** @class */ (function (_super) {
    __extends(PlayerViewModel, _super);
    function PlayerViewModel(playerModel, eventFilter) {
        var _this = _super.call(this) || this;
        _this._model = playerModel;
        _this._mediaModel = null;
        Object.assign(playerModel.attributes, {
            altText: '',
            fullscreen: false,
            logoWidth: 0,
            scrubbing: false
        });
        playerModel.on('all', function (type, objectOrEvent, value, previousValue) {
            if (objectOrEvent === playerModel) {
                objectOrEvent = _this;
            }
            if (!eventFilter || eventFilter(type, objectOrEvent, value, previousValue)) {
                _this.trigger(type, objectOrEvent, value, previousValue);
            }
        }, _this);
        playerModel.on('change:mediaModel', function (model, mediaModel) {
            _this.mediaModel = mediaModel;
        }, _this);
        return _this;
    }
    Object.defineProperty(PlayerViewModel.prototype, "mediaModel", {
        set: function (mediaModel) {
            var _this = this;
            var previousMediaModel = this._mediaModel;
            removeListeners(previousMediaModel, this);
            this._mediaModel = mediaModel;
            mediaModel.on('all', function (type, objectOrEvent, value, previousValue) {
                if (objectOrEvent === mediaModel) {
                    objectOrEvent = _this;
                }
                _this.trigger(type, objectOrEvent, value, previousValue);
            }, this);
            if (previousMediaModel) {
                dispatchDiffChangeEvents(this, mediaModel.attributes, previousMediaModel.attributes);
            }
        },
        enumerable: false,
        configurable: true
    });
    PlayerViewModel.prototype.get = function (attr) {
        var mediaModel = this._mediaModel;
        if (mediaModel && attr in mediaModel.attributes) {
            return mediaModel.get(attr);
        }
        return this._model.get(attr);
    };
    PlayerViewModel.prototype.set = function (attr, val) {
        return this._model.set(attr, val);
    };
    PlayerViewModel.prototype.getVideo = function () {
        return this._model.getVideo();
    };
    PlayerViewModel.prototype.destroy = function () {
        removeListeners(this._model, this);
        removeListeners(this._mediaModel, this);
        this.off();
    };
    return PlayerViewModel;
}(simplemodel_1["default"]));
exports.PlayerViewModel = PlayerViewModel;
var ViewModel = /** @class */ (function (_super) {
    __extends(ViewModel, _super);
    function ViewModel(playerModel) {
        var _this = _super.call(this, playerModel, function (type) {
            // Do not propagate attribute changes from the player model for attributes present in instream
            var instreamModel = _this._instreamModel;
            if (instreamModel) {
                var match = changeEventRegEx.exec(type);
                if (match) {
                    var attr = match[1];
                    if (attr in instreamModel.attributes) {
                        return false;
                    }
                }
            }
            return true;
        }) || this;
        _this._instreamModel = null;
        _this._playerViewModel = new PlayerViewModel(_this._model);
        playerModel.on('change:instream', function (model, instream) {
            _this.instreamModel = instream ? instream.model : null;
        }, _this);
        return _this;
    }
    Object.defineProperty(ViewModel.prototype, "player", {
        get: function () {
            return this._playerViewModel;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ViewModel.prototype, "instreamModel", {
        set: function (instreamModel) {
            var _this = this;
            var previousInstream = this._instreamModel;
            if (!previousInstream && !instreamModel) {
                return;
            }
            removeListeners(previousInstream, this);
            this._model.off('change:mediaModel', null, this);
            this._instreamModel = instreamModel;
            this.trigger('instreamMode', !!instreamModel);
            if (instreamModel) {
                instreamModel.on('all', function (type, objectOrEvent, value, previousValue) {
                    if (objectOrEvent === instreamModel) {
                        objectOrEvent = _this;
                    }
                    _this.trigger(type, objectOrEvent, value, previousValue);
                }, this);
                instreamModel.change('mediaModel', function (model, mediaModel) {
                    _this.mediaModel = mediaModel;
                }, this);
                dispatchDiffChangeEvents(this, instreamModel.attributes, this._model.attributes);
            }
            else if (previousInstream) {
                this._model.change('mediaModel', function (model, mediaModel) {
                    _this.mediaModel = mediaModel;
                }, this);
                var mergedAttributes = Object.assign({}, this._model.attributes, previousInstream.attributes);
                dispatchDiffChangeEvents(this, this._model.attributes, mergedAttributes);
            }
        },
        enumerable: false,
        configurable: true
    });
    ViewModel.prototype.get = function (attr) {
        var mediaModel = this._mediaModel;
        if (mediaModel && attr in mediaModel.attributes) {
            return mediaModel.get(attr);
        }
        var instreamModel = this._instreamModel;
        if (instreamModel && attr in instreamModel.attributes) {
            return instreamModel.get(attr);
        }
        return this._model.get(attr);
    };
    ViewModel.prototype.getVideo = function () {
        var instreamModel = this._instreamModel;
        if (instreamModel && instreamModel.getVideo()) {
            return instreamModel.getVideo();
        }
        return _super.prototype.getVideo.call(this);
    };
    ViewModel.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        removeListeners(this._instreamModel, this);
    };
    return ViewModel;
}(PlayerViewModel));
exports["default"] = ViewModel;
