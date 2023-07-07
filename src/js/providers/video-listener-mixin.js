"use strict";
exports.__esModule = true;
var events_1 = require("events/events");
var math_1 = require("utils/math");
var VideoListenerMixin = {
    canplay: function () {
        // If we're not rendering natively text tracks will be provided from another source - don't duplicate them here
        if (this.renderNatively) {
            this.setTextTracks(this.video.textTracks);
        }
        this.trigger(events_1.MEDIA_BUFFER_FULL);
    },
    play: function () {
        this.stallTime = -1;
        if (!this.video.paused && this.state !== events_1.STATE_PLAYING) {
            this.setState(events_1.STATE_LOADING);
        }
    },
    loadedmetadata: function () {
        var metadata = {
            metadataType: 'media',
            duration: this.getDuration(),
            height: this.video.videoHeight,
            width: this.video.videoWidth,
            seekRange: this.getSeekRange()
        };
        var drmUsed = this.drmUsed;
        if (drmUsed) {
            metadata.drm = drmUsed;
        }
        this.trigger(events_1.MEDIA_META, metadata);
    },
    timeupdate: function () {
        var currentTime = this.video.currentTime;
        var position = this.getCurrentTime();
        var duration = this.getDuration();
        if (isNaN(duration)) {
            return;
        }
        if (!this.seeking && !this.video.paused &&
            (this.state === events_1.STATE_STALLED || this.state === events_1.STATE_LOADING) &&
            this.stallTime !== currentTime) {
            this.stallTime = -1;
            this.setState(events_1.STATE_PLAYING);
            this.trigger(events_1.PROVIDER_FIRST_FRAME);
        }
        var timeEventObject = {
            position: position,
            duration: duration,
            currentTime: currentTime,
            seekRange: this.getSeekRange(),
            metadata: {
                currentTime: currentTime
            }
        };
        var latency = this.getLiveLatency();
        if (latency !== null) {
            timeEventObject.latency = latency;
            if (this.getTargetLatency) {
                var targetLatency = this.getTargetLatency();
                if (targetLatency !== null) {
                    timeEventObject.targetLatency = targetLatency;
                }
            }
        }
        // only emit time events when playing or seeking
        if (this.state === events_1.STATE_PLAYING || (this.seeking && this.state !== events_1.STATE_IDLE)) {
            this.trigger(events_1.MEDIA_TIME, timeEventObject);
        }
    },
    click: function (evt) {
        this.trigger(events_1.CLICK, evt);
    },
    volumechange: function () {
        var video = this.video;
        this.trigger(events_1.MEDIA_VOLUME, {
            volume: Math.round(video.volume * 100)
        });
        this.trigger(events_1.MEDIA_MUTE, {
            mute: video.muted
        });
    },
    seeking: function () {
        // TODO: Use trigger(MEDIA_SEEK) implementation from html5 removed from hlsjs/shaka providers
        if (this.state === events_1.STATE_LOADING) {
            // Ignore seeks performed by shaka-player and hls.js to jump initial buffer gap before play
            var bufferStart = this.video.buffered.length ? this.video.buffered.start(0) : -1;
            if (this.video.currentTime === bufferStart) {
                return;
            }
        }
        else if (this.state === events_1.STATE_IDLE) {
            return;
        }
        this.seeking = true;
    },
    seeked: function () {
        if (!this.seeking) {
            return;
        }
        this.seeking = false;
        this.trigger(events_1.MEDIA_SEEKED);
    },
    playing: function () {
        // When stalling, STATE_PLAYING is only set on timeupdate
        // because Safari and Firefox will fire "playing" before playback recovers from stalling
        if (this.stallTime === -1) {
            // Here setting STATE_PLAYING ensures a quick recovery from STATE_LOADING after seeking
            this.setState(events_1.STATE_PLAYING);
        }
        this.trigger(events_1.PROVIDER_FIRST_FRAME);
    },
    pause: function () {
        // Sometimes the browser will fire "complete" and then a "pause" event
        if (this.state === events_1.STATE_COMPLETE) {
            return;
        }
        if (this.video.ended) {
            return;
        }
        if (this.video.error) {
            return;
        }
        // If "pause" fires before "complete", we still don't want to propagate it
        if (this.video.currentTime === this.video.duration) {
            return;
        }
        this.setState(events_1.STATE_PAUSED);
    },
    progress: function () {
        var dur = this.getDuration();
        if (dur <= 0 || dur === Infinity) {
            return;
        }
        var buf = this.video.buffered;
        if (!buf || buf.length === 0) {
            return;
        }
        var buffered = (0, math_1.between)(buf.end(buf.length - 1) / dur, 0, 1);
        this.trigger(events_1.MEDIA_BUFFER, {
            bufferPercent: buffered * 100,
            position: this.getCurrentTime(),
            duration: dur,
            currentTime: this.video.currentTime,
            seekRange: this.getSeekRange()
        });
    },
    ratechange: function () {
        this.trigger(events_1.MEDIA_RATE_CHANGE, { playbackRate: this.video.playbackRate });
    },
    ended: function () {
        if (this.state !== events_1.STATE_IDLE && this.state !== events_1.STATE_COMPLETE) {
            this.trigger(events_1.MEDIA_COMPLETE);
        }
    }
};
exports["default"] = VideoListenerMixin;
