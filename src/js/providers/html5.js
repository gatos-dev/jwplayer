"use strict";
exports.__esModule = true;
var data_normalizer_1 = require("providers/data-normalizer");
var environment_1 = require("environment/environment");
var html5_android_hls_1 = require("providers/html5-android-hls");
var events_1 = require("events/events");
var video_listener_mixin_1 = require("providers/video-listener-mixin");
var video_actions_mixin_1 = require("providers/video-actions-mixin");
var video_attached_mixin_1 = require("providers/video-attached-mixin");
var stream_type_1 = require("providers/utils/stream-type");
var css_1 = require("utils/css");
var dom_1 = require("utils/dom");
var default_1 = require("providers/default");
var backbone_events_1 = require("utils/backbone.events");
var tracks_mixin_1 = require("providers/tracks-mixin");
var time_ranges_1 = require("utils/time-ranges");
var play_promise_1 = require("providers/utils/play-promise");
var underscore_1 = require("utils/underscore");
var date_1 = require("utils/date");
var errors_1 = require("api/errors");
/** @module */
/**
 @enum {ErrorCode} - The HTML5 media element encountered an error.
 */
var HTML5_BASE_MEDIA_ERROR = 224000;
/**
 @enum {ErrorCode} - The HTML5 media element's src was emptied or set to the page's location.
 */
var HTML5_SRC_RESET = 224005;
/**
 @enum {ErrorCode} - The HTML5 media element encountered a network error.
 */
var HTML5_NETWORK_ERROR = 221000;
/**
 @enum {ErrorCode} - The HTML5 media element encountered an error, resulting in an attempt to recover.
 */
var HTML5_BASE_WARNING = 324000;
var clearTimeout = window.clearTimeout;
var _name = 'html5';
var noop = function () { };
function _setupListeners(eventsHash, videoTag) {
    Object.keys(eventsHash).forEach(function (eventName) {
        videoTag.removeEventListener(eventName, eventsHash[eventName]);
        videoTag.addEventListener(eventName, eventsHash[eventName]);
    });
}
function _removeListeners(eventsHash, videoTag) {
    Object.keys(eventsHash).forEach(function (eventName) {
        videoTag.removeEventListener(eventName, eventsHash[eventName]);
    });
}
function VideoProvider(_playerId, _playerConfig, mediaElement) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    var _this = this;
    // Current media state
    _this.state = events_1.STATE_IDLE;
    // Are we buffering due to seek, or due to playback?
    _this.seeking = false;
    // Value of mediaElement.currentTime on last "timeupdate" used for decode error retry workaround
    _this.currentTime = -1;
    // Attempt to reload video on error
    _this.retries = 0;
    _this.maxRetries = 3;
    // Toggle for a bug in iOS and Safari where you are unable to seek in initially muted streams
    _this.muteToggle = environment_1.OS.iOS || environment_1.Browser.safari;
    var loadAndParseHlsMetadata = _playerConfig.loadAndParseHlsMetadata;
    _this.loadAndParseHlsMetadata = loadAndParseHlsMetadata === undefined ? true : !!loadAndParseHlsMetadata;
    var minDvrWindow = _playerConfig.minDvrWindow;
    // Always render natively in iOS and Safari, where HLS is supported.
    // Otherwise, use native rendering when set in the config for browsers that have adequate support.
    // FF, IE & Edge are excluded due to styling/positioning drawbacks.
    // The following issues need to be addressed before we enable native rendering in Edge:
    // https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/8120475/
    // https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/12079271/
    function renderNatively(configRenderNatively) {
        if (environment_1.OS.iOS || environment_1.Browser.safari) {
            return true;
        }
        return configRenderNatively && environment_1.Browser.chrome;
    }
    var MediaEvents = {
        progress: function () {
            video_listener_mixin_1["default"].progress.call(_this);
            // Workaround for an issue in Safari 14 that causes muted, autostarted HLS streams to infinitely buffer.
            // Bug Report: https://feedbackassistant.apple.com/feedback/9097587
            if (isAudioStream()) {
                _toggleMute();
            }
            checkStaleStream();
        },
        timeupdate: function () {
            if (_this.currentTime >= 0) {
                // Reset error retries after concurrent timeupdate events
                _this.retries = 0;
            }
            _this.currentTime = _videotag.currentTime;
            // Keep track of position before seek in iOS fullscreen
            if (_iosFullscreenState && _timeBeforeSeek !== _videotag.currentTime) {
                setTimeBeforeSeek(_videotag.currentTime);
            }
            video_listener_mixin_1["default"].timeupdate.call(_this);
            checkStaleStream();
            if (environment_1.Browser.ie) {
                checkVisualQuality();
            }
        },
        resize: checkVisualQuality,
        ended: function () {
            _currentQuality = -1;
            clearTimeouts();
            video_listener_mixin_1["default"].ended.call(_this);
        },
        loadedmetadata: function () {
            var duration = _this.getDuration();
            if (_androidHls && duration === Infinity) {
                duration = 0;
            }
            var metadata = {
                metadataType: 'media',
                duration: duration,
                height: _videotag.videoHeight,
                width: _videotag.videoWidth,
                seekRange: _this.getSeekRange()
            };
            if (_this.fairplay) {
                metadata.drm = 'fairplay';
            }
            _this.trigger(events_1.MEDIA_META, metadata);
            checkVisualQuality();
        },
        durationchange: function () {
            if (_androidHls) {
                return;
            }
            video_listener_mixin_1["default"].progress.call(_this);
        },
        loadeddata: function () {
            checkStartDateTime();
            _setAudioTracks(_videotag.audioTracks);
            _checkDelayedSeek(_this.getDuration());
        },
        canplay: function () {
            if (_canSeek) {
                return;
            }
            _canSeek = true;
            if (!_androidHls) {
                _setMediaType();
            }
            checkVisualQuality();
            video_listener_mixin_1["default"].canplay.call(_this);
        },
        seeking: function () {
            var timeBeforeSeek = _timeBeforeSeek;
            var offset = _seekToTime !== null ? timeToPosition(_seekToTime) : _this.getCurrentTime();
            var position = timeToPosition(timeBeforeSeek);
            _timeBeforeSeek = _seekToTime;
            _seekToTime = null;
            _delayedSeek = 0;
            _this.seeking = true;
            _this.trigger(events_1.MEDIA_SEEK, {
                position: position,
                offset: offset,
                duration: _this.getDuration(),
                currentTime: timeBeforeSeek,
                seekRange: _this.getSeekRange(),
                metadata: {
                    currentTime: timeBeforeSeek
                }
            });
        },
        seeked: function () {
            video_listener_mixin_1["default"].seeked.call(_this);
            _this.ensureMetaTracksActive();
        },
        waiting: function () {
            if (_this.seeking || _this.video.seeking) {
                _this.setState(events_1.STATE_LOADING);
            }
            else if (_this.state === events_1.STATE_PLAYING) {
                if (_this.atEdgeOfLiveStream()) {
                    _this.setPlaybackRate(1);
                }
                _this.stallTime = _this.video.currentTime;
                _this.setState(events_1.STATE_STALLED);
            }
        },
        webkitbeginfullscreen: function (e) {
            _iosFullscreenState = true;
            _sendFullscreen(e);
        },
        webkitendfullscreen: function (e) {
            _iosFullscreenState = false;
            _sendFullscreen(e);
        },
        error: function () {
            var video = _this.video;
            var error = video.error;
            var errorCode = (error && error.code) || -1;
            if ((errorCode === 3 || errorCode === 4) && _this.retries < _this.maxRetries) {
                // Workaround Safari bug https://bugs.webkit.org/show_bug.cgi?id=195452
                //  and stale manifests
                _this.trigger(events_1.WARNING, new errors_1.PlayerError(null, HTML5_BASE_WARNING + errorCode - 1, error));
                _this.retries++;
                _videotag.load();
                if (_this.currentTime !== -1) {
                    _canSeek = false;
                    _this.seek(_this.currentTime);
                    _this.currentTime = -1;
                }
                return;
            }
            var code = HTML5_BASE_MEDIA_ERROR;
            var key = errors_1.MSG_CANT_PLAY_VIDEO;
            if (errorCode === 1) {
                code += errorCode;
            }
            else if (errorCode === 2) {
                key = errors_1.MSG_BAD_CONNECTION;
                code = HTML5_NETWORK_ERROR;
            }
            else if (errorCode === 3 || errorCode === 4) {
                code += errorCode - 1;
                if (errorCode === 4 && video.src === location.href) {
                    code = HTML5_SRC_RESET;
                }
            }
            else {
                key = errors_1.MSG_TECHNICAL_ERROR;
            }
            _clearVideotagSource();
            _this.trigger(events_1.MEDIA_ERROR, new errors_1.PlayerError(key, code, error));
        }
    };
    Object.keys(video_listener_mixin_1["default"]).forEach(function (eventName) {
        if (!MediaEvents[eventName]) {
            var mixinEventHandler_1 = video_listener_mixin_1["default"][eventName];
            MediaEvents[eventName] = function (e) {
                mixinEventHandler_1.call(_this, e);
            };
        }
    });
    Object.assign(this, backbone_events_1["default"], video_actions_mixin_1["default"], video_attached_mixin_1["default"], tracks_mixin_1["default"], {
        renderNatively: renderNatively(_playerConfig.renderCaptionsNatively),
        eventsOn_: function () {
            _setupListeners(MediaEvents, _videotag);
        },
        eventsOff_: function () {
            _removeListeners(MediaEvents, _videotag);
        },
        detachMedia: function () {
            video_attached_mixin_1["default"].detachMedia.call(_this);
            clearTimeouts();
            // Stop listening to track changes so disabling the current track doesn't update the model
            this.removeTracksListener(_videotag.textTracks, 'change', this.textTrackChangeHandler);
            this.removeTracksListener(_videotag.textTracks, 'addtrack', this.addTrackHandler);
            if (this.videoLoad) {
                _videotag.load = this.videoLoad;
            }
            // Prevent sideloaded tracks from showing during ad playback
            if (_shouldToggleTrackOnDetach()) {
                this.disableTextTrack();
            }
        },
        attachMedia: function () {
            video_attached_mixin_1["default"].attachMedia.call(_this);
            _canSeek = false;
            // If we were mid-seek when detached, we want to allow it to resume
            this.seeking = false;
            // In case the video tag was modified while we shared it
            _videotag.loop = !!_playerConfig.loop;
            // override load so that it's not used to reset the video tag by external JavaScript (iOS ads)
            if (environment_1.OS.iOS && !this.videoLoad) {
                var videoLoad_1 = this.videoLoad = _videotag.load;
                _videotag.load = function () {
                    if (_videotag.src === location.href) {
                        if (_currentQuality === -1) {
                            _currentQuality = _pickInitialQuality(_levels);
                        }
                        _setVideotagSource(_levels[_currentQuality]);
                        if (_this.state === events_1.STATE_PLAYING) {
                            _videotag.play();
                        }
                        _this.trigger(events_1.WARNING, new errors_1.PlayerError(null, HTML5_BASE_WARNING + 5, new Error('video.load() was called after setting video.src to empty while playing video')));
                        return;
                    }
                    return videoLoad_1.call(_videotag);
                };
            }
            // If there was a showing sideloaded track disabled in detached, re-enable it
            if (_shouldToggleTrackOnDetach()) {
                this.enableTextTrack();
            }
            if (this.renderNatively) {
                this.setTextTracks(this.video.textTracks);
            }
            this.addTracksListener(_videotag.textTracks, 'change', this.textTrackChangeHandler);
        },
        isLive: function () {
            return _videotag.duration === Infinity;
        }
    });
    var _videotag = mediaElement;
    // wait for maria's quality level changes to merge
    var visualQuality = { level: {} };
    // Prefer the config timeout, which is allowed to be 0 and null by default
    var _staleStreamDuration = _playerConfig.liveTimeout !== null
        ? _playerConfig.liveTimeout
        : 3 * 10 * 1000;
    var _canSeek = false; // true on valid time event
    var _delayedSeek = 0;
    var _seekToTime = null;
    var _timeBeforeSeek = null;
    var _levels;
    var _currentQuality = -1;
    var _iosFullscreenState = false;
    var _beforeResumeHandler = noop;
    var _audioTracks = null;
    var _currentAudioTrackIndex = -1;
    var _staleStreamTimeout = -1;
    var _stale = false;
    var _lastEndOfBuffer = null;
    var _androidHls = false;
    var dvrEnd = null;
    var dvrPosition = null;
    var dvrUpdatedTime = 0;
    this.video = _videotag;
    this.supportsPlaybackRate = true;
    this.startDateTime = 0;
    function checkVisualQuality() {
        var level = visualQuality.level;
        if (level.width !== _videotag.videoWidth || level.height !== _videotag.videoHeight) {
            // Exit if we're not certain that the stream is audio or the level is unknown
            if ((!_videotag.videoWidth && !isAudioStream()) || _currentQuality === -1) {
                return;
            }
            _this.ensureMetaTracksActive();
            level.width = _videotag.videoWidth;
            level.height = _videotag.videoHeight;
            _setMediaType();
            visualQuality.reason = visualQuality.reason || 'auto';
            var mode = _levels[_currentQuality].type === 'hls' ? 'auto' : 'manual';
            level.index = _currentQuality;
            level.label = _levels[_currentQuality].label;
            _this.trigger(events_1.MEDIA_VISUAL_QUALITY, {
                reason: visualQuality.reason,
                mode: mode,
                bitrate: 0,
                level: {
                    width: level.width,
                    height: level.height,
                    index: level.index,
                    label: level.label
                }
            });
            visualQuality.reason = '';
        }
    }
    function checkStartDateTime() {
        var vtag = _videotag;
        if (vtag.getStartDate) {
            var startDate = vtag.getStartDate();
            var startDateTime = startDate.getTime ? startDate.getTime() : NaN;
            if (startDateTime !== _this.startDateTime && !isNaN(startDateTime)) {
                _this.setStartDateTime(startDateTime);
            }
        }
    }
    _this.setStartDateTime = function (startDateTime) {
        _this.startDateTime = startDateTime;
        var programDateTime = new Date(startDateTime).toISOString();
        var _a = _this.getSeekRange(), start = _a.start, end = _a.end;
        start = Math.max(0, start);
        end = Math.max(start, end + 10);
        var metadataType = 'program-date-time';
        var metadata = {
            metadataType: metadataType,
            programDateTime: programDateTime,
            start: start,
            end: end
        };
        var cue = _this.createCue(start, end, JSON.stringify(metadata));
        _this.addVTTCue({
            type: 'metadata',
            cue: cue
        });
    };
    function setTimeBeforeSeek(currentTime) {
        _timeBeforeSeek = currentTime;
    }
    _this.getCurrentTime = function () {
        return getPosition(_videotag.currentTime);
    };
    function timeToPosition(currentTime) {
        var seekRange = _this.getSeekRange();
        if (_this.isLive() && (0, stream_type_1.isDvr)(seekRange.end - seekRange.start, minDvrWindow)) {
            return Math.min(0, currentTime - seekRange.end);
        }
        return currentTime;
    }
    function getPosition(currentTime) {
        var seekRange = _this.getSeekRange();
        if (_this.isLive()) {
            var rangeUpdated = !dvrPosition || Math.abs(dvrEnd - seekRange.end) > 1;
            if (rangeUpdated) {
                updateDvrPosition(seekRange);
                _this.ensureMetaTracksActive();
            }
            if ((0, stream_type_1.isDvr)(seekRange.end - seekRange.start, minDvrWindow)) {
                return dvrPosition;
            }
        }
        return currentTime;
    }
    function updateDvrPosition(seekRange) {
        dvrEnd = seekRange.end;
        dvrPosition = Math.min(0, _videotag.currentTime - dvrEnd);
        dvrUpdatedTime = (0, date_1.now)();
    }
    _this.getDuration = function () {
        var duration = _videotag.duration;
        // Don't sent time event on Android before real duration is known
        if (_androidHls && (duration === Infinity && _videotag.currentTime === 0) || isNaN(duration)) {
            return 0;
        }
        var end = _getSeekableEnd();
        if (_this.isLive() && end) {
            var seekableDuration = end - _getSeekableStart();
            if ((0, stream_type_1.isDvr)(seekableDuration, minDvrWindow)) {
                // Player interprets negative duration as DVR
                duration = -seekableDuration;
            }
        }
        return duration;
    };
    _this.getSeekRange = function () {
        var seekRange = {
            start: 0,
            end: 0
        };
        var seekable = _videotag.seekable;
        if (seekable.length) {
            seekRange.end = _getSeekableEnd();
            seekRange.start = _getSeekableStart();
        }
        else if ((0, underscore_1.isFinite)(_videotag.duration)) {
            seekRange.end = _videotag.duration;
        }
        return seekRange;
    };
    _this.getLiveLatency = function () {
        var latency = null;
        var end = _getSeekableEnd();
        if (_this.isLive() && end) {
            latency = end + ((0, date_1.now)() - dvrUpdatedTime) / 1000 - _videotag.currentTime;
        }
        return latency;
    };
    function _checkDelayedSeek(duration) {
        // Don't seek when _delayedSeek is set to -1 in _completeLoad
        if (_delayedSeek && _delayedSeek !== -1 && duration && duration !== Infinity) {
            _this.seek(_delayedSeek);
        }
    }
    // Wait for quality levels work to merge
    function _getPublicLevels(levels) {
        var publicLevels;
        if (Array.isArray(levels) && levels.length > 0) {
            publicLevels = levels.map(function (level, i) {
                return {
                    label: level.label || i
                };
            });
        }
        return publicLevels;
    }
    function setPlaylistItem(item) {
        _this.currentTime = -1;
        minDvrWindow = item.minDvrWindow;
        _levels = item.sources;
        _currentQuality = _pickInitialQuality(_levels);
    }
    function _pickInitialQuality(levels) {
        var currentQuality = Math.max(0, _currentQuality);
        var label = _playerConfig.qualityLabel;
        if (levels) {
            for (var i = 0; i < levels.length; i++) {
                if (levels[i]["default"]) {
                    currentQuality = i;
                }
                if (label && levels[i].label === label) {
                    return i;
                }
            }
        }
        visualQuality.reason = 'initial choice';
        if (!visualQuality.level.width || !visualQuality.level.height) {
            visualQuality.level = {};
        }
        return currentQuality;
    }
    function _play() {
        var resumingPlayback = _videotag.paused && _videotag.played && _videotag.played.length;
        if (resumingPlayback && _this.isLive() && !(0, stream_type_1.isDvr)(_getSeekableEnd() - _getSeekableStart(), minDvrWindow)) {
            _this.clearTracks();
            _videotag.load();
        }
        return _videotag.play() || (0, play_promise_1["default"])(_videotag);
    }
    function _completeLoad(startTime) {
        _this.currentTime = -1;
        _delayedSeek = 0;
        clearTimeouts();
        var previousSource = _videotag.src;
        var sourceElement = document.createElement('source');
        sourceElement.src = _levels[_currentQuality].file;
        var sourceChanged = (sourceElement.src !== previousSource);
        if (sourceChanged) {
            _setVideotagSource(_levels[_currentQuality]);
            // Do not call load if src was not set. load() will cancel any active play promise.
            if (previousSource) {
                _videotag.load();
            }
        }
        else if (startTime === 0 && _videotag.currentTime > 0) {
            // Load event is from the same video as before
            // restart video without dispatching seek event
            _delayedSeek = -1;
            _this.seek(startTime);
        }
        // Check if we have already seeked the mediaElement before _completeLoad has been called
        if (startTime > 0 && _videotag.currentTime !== startTime) {
            _this.seek(startTime);
        }
        var publicLevels = _getPublicLevels(_levels);
        if (publicLevels) {
            _this.trigger(events_1.MEDIA_LEVELS, {
                levels: publicLevels,
                currentQuality: _currentQuality
            });
        }
        if (_levels.length && _levels[0].type !== 'hls') {
            _setMediaType();
        }
    }
    // Safari has a bug where our disable of an embedded rendered track causes
    //  the track to not display when we re-attach the media. We can avoid this
    //  by only disabling the track if sideloaded in safari
    function _shouldToggleTrackOnDetach() {
        if (!environment_1.Browser.safari) {
            return true;
        }
        var track = _this.getCurrentTextTrack();
        return track && track.sideloaded;
    }
    function _setVideotagSource(source) {
        _audioTracks = null;
        _currentAudioTrackIndex = -1;
        if (!visualQuality.reason) {
            visualQuality.reason = 'initial choice';
            visualQuality.level = {};
        }
        _canSeek = false;
        var sourceElement = document.createElement('source');
        sourceElement.src = source.file;
        var sourceChanged = (_videotag.src !== sourceElement.src);
        if (sourceChanged) {
            _videotag.src = source.file;
        }
    }
    function _clearVideotagSource() {
        if (_videotag) {
            _this.disableTextTrack();
            _videotag.removeAttribute('preload');
            _videotag.removeAttribute('src');
            (0, dom_1.emptyElement)(_videotag);
            (0, css_1.style)(_videotag, {
                objectFit: ''
            });
            _currentQuality = -1;
            // Don't call load in iE9/10
            if (!environment_1.Browser.msie && 'load' in _videotag) {
                _videotag.load();
            }
        }
    }
    function _getSeekableStart() {
        var start = Infinity;
        ['buffered', 'seekable'].forEach(function (range) {
            var timeRange = _videotag[range];
            var index = timeRange ? timeRange.length : 0;
            while (index--) {
                var rangeStart = Math.min(start, timeRange.start(index));
                if ((0, underscore_1.isFinite)(rangeStart)) {
                    start = rangeStart;
                }
            }
        });
        return start;
    }
    function _getSeekableEnd() {
        var end = 0;
        ['buffered', 'seekable'].forEach(function (range) {
            var timeRange = _videotag[range];
            var index = timeRange ? timeRange.length : 0;
            while (index--) {
                var rangeEnd = Math.max(end, timeRange.end(index));
                if ((0, underscore_1.isFinite)(rangeEnd)) {
                    end = rangeEnd;
                }
            }
        });
        return end;
    }
    this.stop = function () {
        clearTimeouts();
        _clearVideotagSource();
        this.clearTracks();
        // IE/Edge continue to play a video after changing video.src and calling video.load()
        // https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/5383483/ (not fixed in Edge 14)
        if (environment_1.Browser.ie) {
            _videotag.pause();
        }
        this.setState(events_1.STATE_IDLE);
    };
    this.destroy = function () {
        var addTrackHandler = _this.addTrackHandler, cueChangeHandler = _this.cueChangeHandler, textTrackChangeHandler = _this.textTrackChangeHandler;
        var textTracks = _videotag.textTracks;
        _this.off();
        if (_this.videoLoad) {
            _videotag.load = _this.videoLoad;
        }
        _beforeResumeHandler = noop;
        _removeListeners(MediaEvents, _videotag);
        _this.removeTracksListener(_videotag.audioTracks, 'change', _audioTrackChangeHandler);
        _this.removeTracksListener(textTracks, 'change', textTrackChangeHandler);
        _this.removeTracksListener(textTracks, 'addtrack', addTrackHandler);
        if (cueChangeHandler) {
            for (var i = 0, len = textTracks.length; i < len; i++) {
                textTracks[i].removeEventListener('cuechange', cueChangeHandler);
            }
        }
    };
    this.init = function (item) {
        _this.retries = 0;
        _this.maxRetries = item.adType ? 0 : 3;
        setPlaylistItem(item);
        var source = _levels[_currentQuality];
        _androidHls = (0, html5_android_hls_1.isAndroidHls)(source);
        if (_androidHls) {
            // Playback rate is broken on Android HLS
            _this.supportsPlaybackRate = false;
            // Android HLS doesnt update its times correctly so it always falls in here.  Do not allow it to stall.
            MediaEvents.waiting = noop;
        }
        _this.eventsOn_();
        // the loadeddata event determines the mediaType for HLS sources
        if (_levels.length && _levels[0].type !== 'hls') {
            this.sendMediaType(_levels);
        }
        visualQuality.reason = '';
    };
    this.preload = function (item) {
        setPlaylistItem(item);
        var source = _levels[_currentQuality];
        var preload = source.preload || 'metadata';
        if (preload !== 'none') {
            _videotag.setAttribute('preload', preload);
            _setVideotagSource(source);
        }
    };
    this.load = function (item) {
        setPlaylistItem(item);
        _videotag.loop = !!_playerConfig.loop;
        _completeLoad(item.starttime);
        this.setupSideloadedTracks(item.tracks);
    };
    this.play = function () {
        _beforeResumeHandler();
        return _play();
    };
    this.pause = function () {
        clearTimeouts();
        _beforeResumeHandler = function () {
            var unpausing = _videotag.paused && _videotag.currentTime;
            if (unpausing && _this.isLive()) {
                var end = _getSeekableEnd();
                var seekableDuration = end - _getSeekableStart();
                var isLiveNotDvr = !(0, stream_type_1.isDvr)(seekableDuration, minDvrWindow);
                var behindLiveEdge = end - _videotag.currentTime;
                if (isLiveNotDvr && end && (behindLiveEdge > 15 || behindLiveEdge < 0)) {
                    // resume playback at edge of live stream
                    _seekToTime = Math.max(end - 10, end - seekableDuration);
                    if (!(0, underscore_1.isFinite)(_seekToTime)) {
                        return;
                    }
                    setTimeBeforeSeek(_videotag.currentTime);
                    _videotag.currentTime = _seekToTime;
                }
            }
        };
        _videotag.pause();
    };
    this.seek = function (seekToPosition) {
        var seekRange = _this.getSeekRange();
        var seekToTime = seekToPosition;
        if (seekToPosition < 0) {
            seekToTime += seekRange.end;
        }
        if (!_canSeek) {
            _canSeek = !!_getSeekableEnd();
        }
        if (_canSeek) {
            _toggleMute();
            _delayedSeek = 0;
            // setting currentTime can throw an invalid DOM state exception if the video is not ready
            try {
                _this.seeking = true;
                if (_this.isLive() && (0, stream_type_1.isDvr)(seekRange.end - seekRange.start, minDvrWindow)) {
                    dvrPosition = Math.min(0, seekToTime - dvrEnd);
                    if (seekToPosition < 0) {
                        var timeSinceUpdate = Math.min(12, ((0, date_1.now)() - dvrUpdatedTime) / 1000);
                        seekToTime += timeSinceUpdate;
                    }
                }
                _seekToTime = seekToTime;
                setTimeBeforeSeek(_videotag.currentTime);
                _videotag.currentTime = seekToTime;
            }
            catch (e) {
                _this.seeking = false;
                _delayedSeek = seekToTime;
            }
        }
        else {
            _delayedSeek = seekToTime;
            // Firefox isn't firing canplay event when in a paused state
            // https://bugzilla.mozilla.org/show_bug.cgi?id=1194624
            if (environment_1.Browser.firefox && _videotag.paused) {
                _play();
            }
        }
    };
    function _audioTrackChangeHandler() {
        var _selectedAudioTrackIndex = -1;
        var tracks = _videotag.audioTracks;
        for (var i = 0; i < tracks.length; i++) {
            if (tracks[i].enabled) {
                _selectedAudioTrackIndex = i;
                break;
            }
        }
        _setCurrentAudioTrack(_selectedAudioTrackIndex);
    }
    function _sendFullscreen(e) {
        _this.trigger(events_1.NATIVE_FULLSCREEN, {
            target: e.target,
            jwstate: _iosFullscreenState
        });
    }
    this.setVisibility = function (state) {
        state = !!state;
        if (state || environment_1.OS.android) {
            // Changing visibility to hidden on Android < 4.2 causes
            // the pause event to be fired. This causes audio files to
            // become unplayable. Hence the video tag is always kept
            // visible on Android devices.
            (0, css_1.style)(_this.container, {
                visibility: 'visible',
                opacity: 1
            });
        }
        else {
            (0, css_1.style)(_this.container, {
                visibility: '',
                opacity: 0
            });
        }
    };
    this.setFullscreen = function (state) {
        state = !!state;
        // This implementation is for iOS and Android WebKit only
        // This won't get called if the player container can go fullscreen
        if (state) {
            try {
                var enterFullscreen = _videotag.webkitEnterFullscreen ||
                    _videotag.webkitEnterFullScreen;
                if (enterFullscreen) {
                    enterFullscreen.apply(_videotag);
                }
            }
            catch (error) {
                // object can't go fullscreen
                return false;
            }
            return _this.getFullscreen();
        }
        var exitFullscreen = _videotag.webkitExitFullscreen ||
            _videotag.webkitExitFullScreen;
        if (exitFullscreen) {
            exitFullscreen.apply(_videotag);
        }
        return state;
    };
    _this.getFullscreen = function () {
        return _iosFullscreenState || !!_videotag.webkitDisplayingFullscreen;
    };
    this.setCurrentQuality = function (quality) {
        if (_currentQuality === quality) {
            return;
        }
        if (quality >= 0) {
            if (_levels && _levels.length > quality) {
                _currentQuality = quality;
                visualQuality.reason = 'api';
                visualQuality.level = {};
                this.trigger(events_1.MEDIA_LEVEL_CHANGED, {
                    currentQuality: quality,
                    levels: _getPublicLevels(_levels)
                });
                // The playerConfig is not updated automatically, because it is a clone
                // from when the provider was first initialized
                _playerConfig.qualityLabel = _levels[quality].label;
                _completeLoad(_videotag.currentTime || 0);
                _play();
            }
        }
    };
    this.setPlaybackRate = function (playbackRate) {
        // Set defaultPlaybackRate so that we do not send ratechange events when setting src
        _videotag.playbackRate = _videotag.defaultPlaybackRate = playbackRate;
    };
    this.getPlaybackRate = function () {
        return _videotag.playbackRate;
    };
    this.getCurrentQuality = function () {
        return _currentQuality;
    };
    this.getQualityLevels = function () {
        if (Array.isArray(_levels)) {
            return _levels.map(function (level) { return (0, data_normalizer_1.qualityLevel)(level); });
        }
        return [];
    };
    this.getName = function () {
        return { name: _name };
    };
    this.setCurrentAudioTrack = _setCurrentAudioTrack;
    this.getAudioTracks = _getAudioTracks;
    this.getCurrentAudioTrack = _getCurrentAudioTrack;
    // eslint-disable-next-line no-undef
    function _setAudioTracks(tracks) {
        _audioTracks = null;
        if (!tracks) {
            return;
        }
        if (tracks.length) {
            for (var i = 0; i < tracks.length; i++) {
                if (tracks[i].enabled) {
                    _currentAudioTrackIndex = i;
                    break;
                }
            }
            if (_currentAudioTrackIndex === -1) {
                _currentAudioTrackIndex = 0;
                tracks[_currentAudioTrackIndex].enabled = true;
            }
            _audioTracks = (0, underscore_1.map)(tracks, function (track) {
                var _track = {
                    name: track.label || track.language,
                    language: track.language
                };
                return _track;
            });
        }
        _this.addTracksListener(tracks, 'change', _audioTrackChangeHandler);
        if (_audioTracks) {
            _this.trigger(events_1.AUDIO_TRACKS, { currentTrack: _currentAudioTrackIndex, tracks: _audioTracks });
        }
    }
    function _setCurrentAudioTrack(index) {
        if (_videotag && _videotag.audioTracks && _audioTracks &&
            index > -1 && index < _videotag.audioTracks.length && index !== _currentAudioTrackIndex) {
            _videotag.audioTracks[_currentAudioTrackIndex].enabled = false;
            _currentAudioTrackIndex = index;
            _videotag.audioTracks[_currentAudioTrackIndex].enabled = true;
            _this.trigger(events_1.AUDIO_TRACK_CHANGED, { currentTrack: _currentAudioTrackIndex,
                tracks: _audioTracks });
        }
    }
    function _getAudioTracks() {
        return _audioTracks || [];
    }
    function _getCurrentAudioTrack() {
        return _currentAudioTrackIndex;
    }
    function isAudioStream() {
        if (_videotag.readyState < 2 && _videotag.buffered.length === 0) {
            return;
        }
        return _videotag.videoHeight === 0;
    }
    function _setMediaType() {
        var isAudio = isAudioStream();
        if (typeof isAudio !== 'undefined') {
            var mediaType = isAudio ? 'audio' : 'video';
            _this.trigger(events_1.MEDIA_TYPE, { mediaType: mediaType });
        }
    }
    // Workaround for a bug in iOS and Safari where you are unable to seek in initially muted streams
    // Bug Report: https://feedbackassistant.apple.com/feedback/9070511
    function _toggleMute() {
        if (_this.muteToggle && _videotag.muted) {
            var isAudio = isAudioStream();
            if (typeof isAudio === 'undefined') {
                return;
            }
            var isPlaying = !_videotag.paused;
            _videotag.muted = _this.muteToggle = false;
            if (isAudio) {
                // For audio-only set muted back to player config value
                _videotag.muted = _playerConfig.mute;
            }
            else {
                // Only re-mute and resume if media has video (autoplay muted)
                _videotag.muted = true;
                // Autostart players may be paused after toggle
                if (isPlaying && _videotag.paused) {
                    _videotag.play();
                }
            }
        }
    }
    // If we're live and the buffer end has remained the same for some time, mark the stream as stale and check if the stream is over
    function checkStaleStream() {
        // Never kill a stale live stream if the timeout was configured to 0
        if (_staleStreamDuration === 0) {
            return;
        }
        var endOfBuffer = (0, time_ranges_1["default"])(_videotag.buffered);
        var live = _this.isLive();
        // Don't end if we have noting buffered yet, or cannot get any information about the buffer
        if (live && endOfBuffer && _lastEndOfBuffer === endOfBuffer) {
            if (_staleStreamTimeout === -1) {
                _staleStreamTimeout = window.setTimeout(function () {
                    _stale = true;
                    checkStreamEnded();
                }, _staleStreamDuration);
            }
        }
        else {
            clearTimeouts();
            _stale = false;
        }
        _lastEndOfBuffer = endOfBuffer;
    }
    function checkStreamEnded() {
        if (_stale && _this.atEdgeOfLiveStream()) {
            _this.trigger(events_1.MEDIA_ERROR, new errors_1.PlayerError(errors_1.MSG_LIVE_STREAM_DOWN, HTML5_ERROR_LIVE_STREAM_DOWN_OR_ENDED));
            return true;
        }
        return false;
    }
    function clearTimeouts() {
        clearTimeout(_staleStreamTimeout);
        _staleStreamTimeout = -1;
    }
}
Object.assign(VideoProvider.prototype, default_1["default"]);
VideoProvider.getName = function () {
    return { name: 'html5' };
};
exports["default"] = VideoProvider;
/**
 *
 @enum {ErrorCode} - The HTML5 live stream is down or has ended.
 */
var HTML5_ERROR_LIVE_STREAM_DOWN_OR_ENDED = 220001;
