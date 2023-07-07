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
exports.MediaModel = void 0;
var environment_1 = require("environment/environment");
var simplemodel_1 = require("model/simplemodel");
var player_model_1 = require("model/player-model");
var events_1 = require("events/events");
var underscore_1 = require("utils/underscore");
var strings_1 = require("utils/strings");
var providers_1 = require("providers/providers");
// Represents the state of the player
var Model = /** @class */ (function (_super) {
    __extends(Model, _super);
    function Model() {
        var _this = _super.call(this) || this;
        _this.providerController = null;
        _this._provider = null;
        _this.addAttributes({
            mediaModel: new MediaModel(),
            minDvrWindow: player_model_1.DEFAULT_MIN_DVR_WINDOW,
            dvrSeekLimit: player_model_1.DEFAULT_DVR_SEEK_LIMIT
        });
        return _this;
    }
    Model.prototype.setup = function (config) {
        config = config || {};
        this._normalizeConfig(config);
        Object.assign(this.attributes, config, player_model_1.INITIAL_PLAYER_STATE);
        this.providerController = new providers_1["default"](this.getConfiguration());
        this.setAutoStart();
        return this;
    };
    Model.prototype.getConfiguration = function () {
        var config = this.clone();
        var mediaModelAttributes = config.mediaModel.attributes;
        Object.keys(player_model_1.INITIAL_MEDIA_STATE).forEach(function (key) {
            config[key] = mediaModelAttributes[key];
        });
        config.instreamMode = !!config.instream;
        delete config.instream;
        delete config.mediaModel;
        return config;
    };
    Model.prototype.persistQualityLevel = function (quality, levels) {
        var currentLevel = levels[quality] || {};
        var label = currentLevel.label;
        // Default to null if bitrate is bad, or when the quality to persist is "auto" (bitrate is undefined in this case)
        var bitrate = (0, underscore_1.isValidNumber)(currentLevel.bitrate) ? currentLevel.bitrate : null;
        this.set('bitrateSelection', bitrate);
        this.set('qualityLabel', label);
    };
    Model.prototype.setActiveItem = function (index) {
        var item = this.get('playlist')[index];
        this.resetItem(item);
        this.attributes.playlistItem = null;
        this.set('item', index);
        this.set('minDvrWindow', item.minDvrWindow);
        this.set('dvrSeekLimit', item.dvrSeekLimit || player_model_1.DEFAULT_DVR_SEEK_LIMIT);
        this.set('playlistItem', item);
    };
    Model.prototype.setMediaModel = function (mediaModel) {
        if (this.mediaModel && this.mediaModel !== mediaModel) {
            this.mediaModel.off();
        }
        mediaModel = mediaModel || new MediaModel();
        this.mediaModel = mediaModel;
        syncPlayerWithMediaModel(mediaModel);
    };
    Model.prototype.destroy = function () {
        this.attributes._destroyed = true;
        this.off();
        if (this._provider) {
            this._provider.off(null, null, this);
            this._provider.destroy();
            this._provider = null;
        }
        if (this.mediaModel) {
            this.mediaModel.off();
        }
        this.providerController = null;
    };
    Model.prototype.getVideo = function () {
        return this._provider;
    };
    Model.prototype.setFullscreen = function (state) {
        state = !!state;
        if (state !== this.get('fullscreen')) {
            this.set('fullscreen', state);
        }
    };
    Model.prototype.getProviders = function () {
        return this.providerController;
    };
    Model.prototype.setVolume = function (volume) {
        if (!(0, underscore_1.isValidNumber)(volume)) {
            return;
        }
        var vol = Math.min(Math.max(0, volume), 100);
        this.set('volume', vol);
        var mute = (vol === 0);
        if (mute !== (this.getMute())) {
            this.setMute(mute);
        }
    };
    Model.prototype.getMute = function () {
        return this.get('autostartMuted') || this.get('mute');
    };
    Model.prototype.setMute = function (mute) {
        if (mute === undefined) {
            mute = !(this.getMute());
        }
        this.set('mute', !!mute);
        if (!mute) {
            var volume = Math.max(10, this.get('volume'));
            this.set('autostartMuted', false);
            this.setVolume(volume);
        }
    };
    Model.prototype.setStreamType = function (streamType) {
        this.set('streamType', streamType);
        if (streamType === 'LIVE') {
            this.setPlaybackRate(1);
        }
    };
    Model.prototype.setProvider = function (provider) {
        this._provider = provider;
        syncProviderProperties(this, provider);
    };
    Model.prototype.resetProvider = function () {
        this._provider = null;
        this.set('provider', undefined);
    };
    Model.prototype.setPlaybackRate = function (playbackRate) {
        if (!(0, underscore_1.isNumber)(playbackRate)) {
            return;
        }
        // Clamp the rate between 0.25x and 4x
        playbackRate = Math.max(Math.min(playbackRate, 4), 0.25);
        if (this.get('streamType') === 'LIVE') {
            playbackRate = 1;
        }
        this.set('defaultPlaybackRate', playbackRate);
        if (this._provider && this._provider.setPlaybackRate) {
            this._provider.setPlaybackRate(playbackRate);
        }
    };
    Model.prototype.persistCaptionsTrack = function () {
        var track = this.get('captionsTrack');
        if (track) {
            // update preference if an option was selected
            this.set('captionLabel', track.name);
        }
        else {
            this.set('captionLabel', 'Off');
        }
    };
    Model.prototype.setVideoSubtitleTrack = function (trackIndex, tracks) {
        this.set('captionsIndex', trackIndex);
        /*
         * Tracks could have changed even if the index hasn't.
         * Need to ensure track has data for captionsrenderer.
         */
        if (trackIndex && tracks && trackIndex <= tracks.length && tracks[trackIndex - 1].data) {
            this.set('captionsTrack', tracks[trackIndex - 1]);
        }
    };
    Model.prototype.persistVideoSubtitleTrack = function (trackIndex, tracks) {
        this.setVideoSubtitleTrack(trackIndex, tracks);
        this.persistCaptionsTrack();
    };
    // Mobile players always wait to become viewable.
    // Desktop players must have autostart set to viewable
    Model.prototype.setAutoStart = function (autoStart) {
        if (autoStart !== undefined) {
            this.set('autostart', autoStart);
        }
        var autoStartOnMobile = !!(environment_1.OS.mobile && this.get('autostart'));
        this.set('playOnViewable', autoStartOnMobile || this.get('autostart') === 'viewable');
    };
    Model.prototype.resetItem = function (item) {
        var position = item ? (0, strings_1.seconds)(item.starttime) : 0;
        var duration = item ? (0, strings_1.seconds)(item.duration) : 0;
        var mediaModel = this.mediaModel;
        this.set('playRejected', false);
        this.attributes.itemMeta = {};
        mediaModel.set('position', position);
        mediaModel.set('currentTime', 0);
        mediaModel.set('duration', duration);
    };
    Model.prototype.persistBandwidthEstimate = function (bwEstimate) {
        if (!(0, underscore_1.isValidNumber)(bwEstimate)) {
            return;
        }
        this.set('bandwidthEstimate', bwEstimate);
    };
    Model.prototype._normalizeConfig = function (cfg) {
        var floating = cfg.floating;
        if (floating && !!floating.disabled) {
            delete cfg.floating;
        }
    };
    return Model;
}(simplemodel_1["default"]));
var syncProviderProperties = function (model, provider) {
    model.set('provider', provider.getName());
    if (model.get('instreamMode') === true) {
        provider.instreamMode = true;
    }
    // Attempt setting the playback rate to be the user selected value
    model.setPlaybackRate(model.get('defaultPlaybackRate'));
    // Set playbackRate because provider support for playbackRate may have changed and not sent an update
    model.set('supportsPlaybackRate', provider.supportsPlaybackRate);
    model.set('playbackRate', provider.getPlaybackRate());
    model.set('renderCaptionsNatively', provider.renderNatively);
};
function syncPlayerWithMediaModel(mediaModel) {
    // Sync player state with mediaModel state
    var mediaState = mediaModel.get('mediaState');
    mediaModel.trigger('change:mediaState', mediaModel, mediaState, mediaState);
}
// Represents the state of the provider/media element
var MediaModel = /** @class */ (function (_super) {
    __extends(MediaModel, _super);
    function MediaModel() {
        var _this = _super.call(this) || this;
        _this.addAttributes({
            mediaState: events_1.STATE_IDLE
        });
        return _this;
    }
    MediaModel.prototype.srcReset = function () {
        Object.assign(this.attributes, {
            setup: false,
            started: false,
            preloaded: false,
            visualQuality: null,
            buffer: 0,
            currentTime: 0
        });
    };
    return MediaModel;
}(simplemodel_1["default"]));
exports.MediaModel = MediaModel;
exports["default"] = Model;
