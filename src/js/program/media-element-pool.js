"use strict";
exports.__esModule = true;
exports.createMediaElement = void 0;
var program_constants_1 = require("program/program-constants");
function MediaElementPool() {
    var maxPrimedTags = program_constants_1.MEDIA_POOL_SIZE;
    var elements = [];
    var pool = [];
    if (!__HEADLESS__) {
        for (var i = 0; i < maxPrimedTags; i++) {
            var mediaElement = createMediaElement();
            elements.push(mediaElement);
            pool.push(mediaElement);
            primeMediaElementForPlayback(mediaElement);
        }
    }
    // Reserve an element exclusively for ads
    var adElement = pool.shift();
    // Reserve an element exclusively for feature testing.
    var testElement = pool.shift();
    var primed = false;
    return {
        primed: function () {
            return primed;
        },
        prime: function () {
            elements.forEach(primeMediaElementForPlayback);
            primed = true;
        },
        played: function () {
            primed = true;
        },
        getPrimedElement: function () {
            return pool.shift() || null;
        },
        getAdElement: function () {
            return adElement;
        },
        getTestElement: function () {
            return testElement;
        },
        clean: function (mediaElement) {
            // Try to clean the media element so that we don't see frames of the previous video when reusing a tag
            // We don't want to call load again if the media element is already clean
            if (!mediaElement.src) {
                return;
            }
            mediaElement.removeAttribute('src');
            try {
                mediaElement.load();
            }
            catch (e) {
                // Calling load may throw an exception, but does not result in an error state
            }
        },
        recycle: function (mediaElement) {
            if (mediaElement && !pool.some(function (element) { return element === mediaElement; })) {
                this.clean(mediaElement);
                pool.push(mediaElement);
            }
        },
        syncVolume: function (volume) {
            var vol = Math.min(Math.max(0, volume / 100), 1);
            elements.forEach(function (e) {
                e.volume = vol;
            });
        },
        syncMute: function (muted) {
            elements.forEach(function (e) {
                e.muted = muted;
            });
        }
    };
}
exports["default"] = MediaElementPool;
function primeMediaElementForPlayback(mediaElement) {
    // If we're in a user-gesture event call load() on video to allow async playback
    if (!mediaElement.src) {
        mediaElement.load();
    }
}
function createMediaElement(options) {
    var mediaElement = document.createElement('video');
    mediaElement.className = 'jw-video jw-reset';
    mediaElement.setAttribute('tabindex', '-1');
    mediaElement.setAttribute('disableRemotePlayback', '');
    mediaElement.setAttribute('webkit-playsinline', '');
    mediaElement.setAttribute('playsinline', '');
    if (options) {
        Object.keys(options).forEach(function (option) {
            mediaElement.setAttribute(option, options[option]);
        });
    }
    return mediaElement;
}
exports.createMediaElement = createMediaElement;
