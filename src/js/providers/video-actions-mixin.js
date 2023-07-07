"use strict";
exports.__esModule = true;
var environment_1 = require("environment/environment");
var css_1 = require("utils/css");
var time_ranges_1 = require("utils/time-ranges");
var VideoActionsMixin = {
    container: null,
    volume: function (vol) {
        this.video.volume = Math.min(Math.max(0, vol / 100), 1);
    },
    mute: function (state) {
        this.video.muted = !!state;
        if (!this.video.muted) {
            // Remove muted attribute once user unmutes so the video element doesn't get
            // muted by the browser when the src changes or on replay
            this.video.removeAttribute('muted');
        }
    },
    resize: function (width, height, stretching) {
        var video = this.video;
        var videoWidth = video.videoWidth, videoHeight = video.videoHeight;
        if (!width || !height || !videoWidth || !videoHeight) {
            return;
        }
        var styles = {
            objectFit: '',
            width: '',
            height: ''
        };
        var aspectPlayer = width / height;
        var aspectVideo = videoWidth / videoHeight;
        if (stretching === 'uniform') {
            // Snap video to edges to eliminate letterboxing of less than 3px on either edge
            var letterBarPixels = void 0;
            if (aspectPlayer > aspectVideo) {
                letterBarPixels = width - width / (aspectPlayer / aspectVideo);
            }
            else {
                letterBarPixels = height - height / (aspectVideo / aspectPlayer);
            }
            if (letterBarPixels < 6) {
                styles.objectFit = 'fill';
                stretching = 'exactfit';
            }
        }
        // Prior to iOS 9, object-fit worked poorly
        // object-fit is not implemented in IE or Android Browser in 4.4 and lower
        // http://caniuse.com/#feat=object-fit
        // feature detection may work for IE but not for browsers where object-fit works for images only
        var fitVideoUsingTransforms = environment_1.Browser.ie || (environment_1.OS.iOS && (environment_1.OS.version.major || 0) < 9) || environment_1.Browser.androidNative;
        if (fitVideoUsingTransforms) {
            if (stretching !== 'uniform') {
                styles.objectFit = 'contain';
                // Use transforms to center and scale video in container
                var scaleX = 1;
                var scaleY = 1;
                if (stretching === 'none') {
                    if (aspectPlayer > aspectVideo) {
                        scaleX = scaleY = Math.ceil(videoHeight * 100 / height) / 100;
                    }
                    else {
                        scaleX = scaleY = Math.ceil(videoWidth * 100 / width) / 100;
                    }
                }
                else if (stretching === 'fill') {
                    if (aspectPlayer > aspectVideo) {
                        scaleX = scaleY = aspectPlayer / aspectVideo;
                    }
                    else {
                        scaleX = scaleY = aspectVideo / aspectPlayer;
                    }
                }
                else if (stretching === 'exactfit') {
                    if (aspectPlayer > aspectVideo) {
                        scaleX = aspectPlayer / aspectVideo;
                        scaleY = 1;
                    }
                    else {
                        scaleX = 1;
                        scaleY = aspectVideo / aspectPlayer;
                    }
                }
                (0, css_1.transform)(video, "matrix(".concat(scaleX.toFixed(2), ", 0, 0, ").concat(scaleY.toFixed(2), ", 0, 0)"));
            }
            else {
                styles.top = styles.left = styles.margin = '';
                (0, css_1.transform)(video, '');
            }
        }
        (0, css_1.style)(video, styles);
    },
    getContainer: function () {
        return this.container;
    },
    setContainer: function (element) {
        this.container = element;
        if (this.video.parentNode !== element) {
            element.appendChild(this.video);
        }
    },
    removeFromContainer: function () {
        var _a = this, container = _a.container, video = _a.video;
        this.container = null;
        if (container && container === video.parentNode) {
            container.removeChild(video);
        }
    },
    remove: function () {
        this.stop();
        this.destroy();
        this.removeFromContainer();
    },
    atEdgeOfLiveStream: function () {
        if (!this.isLive()) {
            return false;
        }
        // currentTime doesn't always get to the end of the buffered range
        var timeFudge = 2;
        return ((0, time_ranges_1["default"])(this.video.buffered) - this.video.currentTime) <= timeFudge;
    }
};
exports["default"] = VideoActionsMixin;
