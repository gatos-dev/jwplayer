"use strict";
exports.__esModule = true;
var events_1 = require("events/events");
var noop = function () { };
var returnFalse = (function () { return false; });
var getNameResult = { name: 'default' };
var returnName = (function () { return getNameResult; });
/** Audio Track information for tracks returned by {@link Api#getAudioTracks jwplayer().getAudioTracks()}
 * @typedef {object} AudioTrackOption
 * @property autoselect
 * @property defaulttrack
 * @property groupid
 * @property {string} language
 * @property {string} name
 */
/**
 * @typedef {option} QualityOption
 * @property {string} label
 * @property {number} [width]
 * @property {number} [height]
 * @property {number} [bitrate]
 */
// eslint-disable-next-line @typescript-eslint/no-redeclare
var DefaultProvider = {
    // This function is required to determine if a provider can work on a given source
    supports: returnFalse,
    // Basic playback features
    play: noop,
    pause: noop,
    preload: noop,
    load: noop,
    stop: noop,
    volume: noop,
    mute: noop,
    seek: noop,
    resize: noop,
    remove: noop,
    destroy: noop,
    setVisibility: noop,
    setFullscreen: noop,
    getFullscreen: returnFalse,
    supportsFullscreen: returnFalse,
    // If setContainer has been set, this returns the element.
    //  It's value is used to determine if we should remove the <video> element when setting a new provider.
    getContainer: noop,
    // Sets the parent element, causing provider to append <video> into it
    setContainer: noop,
    getName: returnName,
    getQualityLevels: noop,
    getCurrentQuality: noop,
    setCurrentQuality: noop,
    getAudioTracks: noop,
    getCurrentAudioTrack: noop,
    setCurrentAudioTrack: noop,
    getSeekRange: function () {
        return {
            start: 0,
            end: this.getDuration()
        };
    },
    setPlaybackRate: noop,
    getPlaybackRate: function () {
        return 1;
    },
    getBandwidthEstimate: function () {
        return null;
    },
    getLiveLatency: function () {
        return null;
    },
    attachMedia: noop,
    detachMedia: noop,
    init: noop,
    setState: function (newstate) {
        this.state = newstate;
        this.trigger(events_1.PLAYER_STATE, {
            newstate: newstate
        });
    },
    sendMediaType: function (sources) {
        var _a = sources[0], type = _a.type, mimeType = _a.mimeType;
        var isAudioFile = (type === 'aac' || type === 'mp3' || type === 'mpeg' ||
            (mimeType && mimeType.indexOf('audio/') === 0));
        this.trigger(events_1.MEDIA_TYPE, {
            mediaType: isAudioFile ? 'audio' : 'video'
        });
    },
    getDuration: function () {
        return 0;
    },
    trigger: noop
};
exports["default"] = DefaultProvider;
