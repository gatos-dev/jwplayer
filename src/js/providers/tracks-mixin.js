"use strict";
exports.__esModule = true;
var tracks_loader_1 = require("controller/tracks-loader");
var tracks_helper_1 = require("controller/tracks-helper");
var id3Parser_1 = require("providers/utils/id3Parser");
var environment_1 = require("environment/environment");
var events_1 = require("events/events");
var underscore_1 = require("utils/underscore");
var Tracks = {
    _itemTracks: null,
    _textTracks: null,
    _currentTextTrackIndex: -1,
    _tracksById: null,
    _cuesByTrackId: null,
    _cachedVTTCues: null,
    _metaCuesByTextTime: null,
    _unknownCount: 0,
    _activeCues: null,
    _cues: null,
    textTrackChangeHandler: null,
    addTrackHandler: null,
    cueChangeHandler: null,
    renderNatively: false,
    _initTextTracks: function () {
        this._textTracks = [];
        this._tracksById = {};
        this._metaCuesByTextTime = {};
        this._cuesByTrackId = {};
        this._cachedVTTCues = {};
        this._cues = {};
        this._activeCues = {};
        this._unknownCount = 0;
    },
    addTracksListener: function (tracks, eventType, handler) {
        if (!tracks) {
            return;
        }
        // Always remove existing listener
        this.removeTracksListener(tracks, eventType, handler);
        if (this.instreamMode) {
            return;
        }
        if (tracks.addEventListener) {
            tracks.addEventListener(eventType, handler);
        }
        else {
            tracks['on' + eventType] = handler;
        }
    },
    removeTracksListener: function (tracks, eventType, handler) {
        if (!tracks) {
            return;
        }
        if (tracks.removeEventListener && handler) {
            tracks.removeEventListener(eventType, handler);
        }
        else {
            tracks['on' + eventType] = null;
        }
    },
    clearTracks: function () {
        var _this = this;
        (0, tracks_loader_1.cancelXhr)(this._itemTracks);
        var _tracksById = this._tracksById;
        if (_tracksById) {
            Object.keys(_tracksById).forEach(function (trackId) {
                if (trackId.indexOf('nativemetadata') === 0) {
                    var metadataTrack = _tracksById[trackId];
                    if (_this.cueChangeHandler) {
                        metadataTrack.removeEventListener('cuechange', _this.cueChangeHandler);
                    }
                    _removeCues(_this.renderNatively, [metadataTrack], true);
                }
            });
        }
        this._itemTracks = null;
        this._textTracks = null;
        this._tracksById = null;
        this._cuesByTrackId = null;
        this._metaCuesByTextTime = null;
        this._unknownCount = 0;
        this._currentTextTrackIndex = -1;
        this._activeCues = {};
        this._cues = {};
        if (this.renderNatively) {
            var tracks = this.video.textTracks;
            if (this.textTrackChangeHandler) {
                // Removing listener first to ensure that removing cues does not trigger it unnecessarily
                this.removeTracksListener(tracks, 'change', this.textTrackChangeHandler);
            }
            _removeCues(this.renderNatively, tracks, true);
        }
    },
    clearMetaCues: function () {
        var _this = this;
        var _a = this, _tracksById = _a._tracksById, _cachedVTTCues = _a._cachedVTTCues;
        if (_tracksById && _cachedVTTCues) {
            Object.keys(_tracksById).forEach(function (trackId) {
                if (trackId.indexOf('nativemetadata') === 0) {
                    var metadataTrack = _tracksById[trackId];
                    _removeCues(_this.renderNatively, [metadataTrack], false);
                    metadataTrack.mode = 'hidden';
                    metadataTrack.inuse = true;
                    if (metadataTrack._id) {
                        _cachedVTTCues[metadataTrack._id] = {};
                    }
                }
            });
        }
    },
    clearCueData: function (trackId) {
        // Clear track cues to prevent duplicates
        var _cachedVTTCues = this._cachedVTTCues;
        if (_cachedVTTCues && _cachedVTTCues[trackId]) {
            _cachedVTTCues[trackId] = {};
            if (this._tracksById) {
                this._tracksById[trackId].data = [];
            }
        }
    },
    disableTextTrack: function () {
        var track = this.getCurrentTextTrack();
        if (track) {
            // FF does not remove the active cue from the dom when the track is hidden, so we must disable it
            track.mode = 'disabled';
            // IOS native captions does not remove the active cue from the dom when the track is disabled, so we must hide it
            var trackId = track._id;
            if ((trackId && isNativeCaptionsOrSubtitles(trackId)) || (this.renderNatively && environment_1.OS.iOS)) {
                track.mode = 'hidden';
            }
        }
    },
    enableTextTrack: function () {
        var track = this.getCurrentTextTrack();
        if (track) {
            track.mode = 'showing';
        }
    },
    getCurrentTextTrack: function () {
        if (this._textTracks) {
            return this._textTracks[this._currentTextTrackIndex];
        }
    },
    getSubtitlesTrack: function () {
        return this._currentTextTrackIndex;
    },
    addTextTracks: function (tracksArray) {
        var _this = this;
        var textTracks = [];
        if (!tracksArray) {
            return textTracks;
        }
        if (!this._textTracks) {
            this._initTextTracks();
        }
        tracksArray.forEach(function (itemTrack) {
            // only add valid and supported kinds https://developer.mozilla.org/en-US/docs/Web/HTML/Element/track
            if (itemTrack.includedInManifest || (itemTrack.kind && !isCaptionsOrSubtitles(itemTrack.kind))) {
                return;
            }
            var textTrackAny = _this._createTrack(itemTrack);
            _this._addTrackToList(textTrackAny);
            textTracks.push(textTrackAny);
            if (itemTrack.file) {
                itemTrack.data = [];
                (0, tracks_loader_1.loadFile)(itemTrack, function (vttCues) {
                    textTrackAny.sideloaded = true;
                    _this.addVTTCuesToTrack(textTrackAny, vttCues);
                }, function (error) {
                    _this.trigger(events_1.WARNING, error);
                });
            }
        });
        if (this._textTracks && this._textTracks.length) {
            this.trigger(events_1.SUBTITLES_TRACKS, { tracks: this._textTracks });
        }
        return textTracks;
    },
    setTextTracks: function (tracks) {
        var _this = this;
        this._currentTextTrackIndex = -1;
        if (!tracks) {
            return;
        }
        if (!this._textTracks) {
            this._initTextTracks();
        }
        else {
            var _tracksById_1 = this._tracksById;
            this._activeCues = {};
            this._cues = {};
            // Remove the 608 captions track that was mutated by the browser
            this._unknownCount = 0;
            this._textTracks = this._textTracks.filter(function (track) {
                var trackId = track._id;
                if (_this.renderNatively && trackId && isNativeCaptionsOrSubtitles(trackId)) {
                    delete _tracksById_1[trackId];
                    return false;
                }
                else if (track.name && track.name.indexOf('Unknown') === 0) {
                    _this._unknownCount++;
                }
                if (trackId.indexOf('nativemetadata') === 0 && track.inBandMetadataTrackDispatchType === 'com.apple.streaming') {
                    // Remove the ID3 track from the cache
                    delete _tracksById_1[trackId];
                }
                return true;
            }, this);
        }
        // filter for 'subtitles' or 'captions' tracks
        if (tracks.length) {
            var i = 0;
            var len = tracks.length;
            var _tracksById = this._tracksById;
            var _cuesByTrackId = this._cuesByTrackId;
            for (i; i < len; i++) {
                var track = tracks[i];
                var trackId = track._id || '';
                if (!trackId) {
                    if (track.inuse === false && isCaptionsOrSubtitles(track.kind) && this.renderNatively) {
                        // ignore native captions tracks from previous items that no longer can be re-used
                        track._id = 'native' + track.kind + i;
                        continue;
                    }
                    if (isCaptionsOrSubtitles(track.kind) || track.kind === 'metadata') {
                        trackId = track._id = 'native' + track.kind + i;
                        if (!track.label && track.kind === 'captions') {
                            // track label is read only in Safari
                            // 'captions' tracks without a label need a name in order for the cc menu to work
                            var labelInfo = (0, tracks_helper_1.createLabel)(track, this._unknownCount);
                            track.name = labelInfo.label;
                            this._unknownCount = labelInfo.unknownCount;
                        }
                    }
                    else {
                        trackId = track._id = (0, tracks_helper_1.createId)(track, this._textTracks ? this._textTracks.length : 0);
                    }
                    if (_tracksById[trackId]) {
                        // tracks without unique ids must not be marked as "inuse"
                        continue;
                    }
                    track.inuse = true;
                }
                if (!track.inuse || _tracksById[trackId]) {
                    continue;
                }
                // setup TextTrack
                if (track.kind === 'metadata') {
                    // track mode needs to be "hidden", not "showing", so that cues don't display as captions in Firefox
                    track.mode = 'hidden';
                    var handler = this.cueChangeHandler = this.cueChangeHandler || cueChangeHandler.bind(this);
                    track.removeEventListener('cuechange', handler);
                    track.addEventListener('cuechange', handler);
                    _tracksById[trackId] = track;
                }
                else if (isCaptionsOrSubtitles(track.kind)) {
                    var mode = track.mode;
                    var cue = void 0;
                    // By setting the track mode to 'hidden', we can determine if the track has cues
                    track.mode = 'hidden';
                    if ((!track.cues || !track.cues.length) && track.embedded) {
                        // There's no method to remove tracks added via: video.addTextTrack.
                        // This ensures the 608 captions track isn't added to the CC menu until it has cues
                        continue;
                    }
                    if (mode !== 'disabled' || isNativeCaptionsOrSubtitles(trackId)) {
                        track.mode = mode;
                    }
                    // Parsed cues may not have been added to this track yet
                    if (_cuesByTrackId[trackId] && !_cuesByTrackId[trackId].loaded) {
                        var cues = _cuesByTrackId[trackId].cues;
                        while ((cue = cues.shift())) {
                            _addCueToTrack(this.renderNatively, track, cue);
                        }
                        track.mode = mode;
                        _cuesByTrackId[trackId].loaded = true;
                    }
                    this._addTrackToList(track);
                }
            }
        }
        if (this.renderNatively) {
            this.addTrackListeners(tracks);
        }
        if (this._textTracks && this._textTracks.length) {
            this.trigger(events_1.SUBTITLES_TRACKS, { tracks: this._textTracks });
        }
    },
    addTrackListeners: function (tracks) {
        // Only bind and set this.textTrackChangeHandler once so that removeEventListener works
        var handler = this.textTrackChangeHandler = this.textTrackChangeHandler || textTrackChangeHandler.bind(this);
        this.removeTracksListener(tracks, 'change', handler);
        this.addTracksListener(tracks, 'change', handler);
        if ((environment_1.Browser.edge && environment_1.Browser.ie) || environment_1.Browser.firefox) {
            // Listen for TextTracks added to the videotag after the onloadeddata event in legacy Edge and Firefox,
            // NOT Safari! Handling this event in Safari 12 and lower results in captions not rendering after
            // instream or live restart (JW8-10815, JW8-11006)
            handler = this.addTrackHandler = this.addTrackHandler || addTrackHandler.bind(this);
            this.removeTracksListener(tracks, 'addtrack', handler);
            this.addTracksListener(tracks, 'addtrack', handler);
        }
    },
    setupSideloadedTracks: function (itemTracks) {
        // Add tracks if we're starting playback or resuming after a midroll
        if (!this.renderNatively) {
            return;
        }
        // Determine if the tracks are the same and the embedded + sideloaded count = # of tracks in the controlbar
        itemTracks = itemTracks || null;
        var alreadyLoaded = itemTracks === this._itemTracks;
        if (!alreadyLoaded) {
            (0, tracks_loader_1.cancelXhr)(this._itemTracks);
        }
        this._itemTracks = itemTracks;
        if (!itemTracks) {
            return;
        }
        if (!alreadyLoaded) {
            this.disableTextTrack();
            this._clearSideloadedTextTracks();
            this.addTextTracks(itemTracks);
        }
    },
    setSubtitlesTrack: function (menuIndex) {
        if (!this.renderNatively) {
            if (this.setCurrentSubtitleTrack) {
                this.setCurrentSubtitleTrack(menuIndex - 1);
            }
            return;
        }
        if (!this._textTracks) {
            return;
        }
        // 0 = 'Off'
        if (menuIndex === 0) {
            this._textTracks.forEach(function (track) {
                track.mode = track.embedded ? 'hidden' : 'disabled';
            });
        }
        // Track index is 1 less than controlbar index to account for 'Off' = 0.
        // Prevent unnecessary track change events
        if (this._currentTextTrackIndex === menuIndex - 1) {
            return;
        }
        // Turn off current track
        this.disableTextTrack();
        // Set the provider's index to the model's index, then show the selected track if it exists
        this._currentTextTrackIndex = menuIndex - 1;
        var track = this.getCurrentTextTrack();
        if (track) {
            track.mode = 'showing';
        }
        // Update the model index since the track change may have come from a browser event
        this.trigger(events_1.SUBTITLES_TRACK_CHANGED, {
            currentTrack: this._currentTextTrackIndex + 1,
            tracks: this._textTracks
        });
    },
    createCue: function (start, end, content) {
        var MetaCue = window.VTTCue || window.TextTrackCue;
        // Set a minimum duration for the cue
        // VTTCues must have a duration for "cuechange" to be dispatched
        var cueEnd = Math.max(end || 0, start + 0.25);
        return new MetaCue(start, cueEnd, content);
    },
    addVTTCue: function (cueData, cacheKey) {
        if (!this._tracksById) {
            this._initTextTracks();
        }
        var trackId = cueData.track ? cueData.track : 'native' + cueData.type;
        var track = this._tracksById[trackId];
        var label = cueData.type === 'captions' ? 'Unknown CC' : 'ID3 Metadata';
        var vttCue = cueData.cue;
        if (!track) {
            var itemTrack = {
                kind: cueData.type,
                _id: trackId,
                label: label,
                'default': false
            };
            if (this.renderNatively || itemTrack.kind === 'metadata') {
                track = this._createTrack(itemTrack);
                track.embedded = true;
                this.setTextTracks(this.video.textTracks);
            }
            else {
                track = this.addTextTracks([itemTrack])[0];
            }
        }
        if (this._cacheVTTCue(track, vttCue, cacheKey)) {
            var useTrackCueHelper = this.renderNatively || track.kind === 'metadata';
            if (useTrackCueHelper) {
                _addCueToTrack(useTrackCueHelper, track, vttCue);
            }
            else {
                track.data.push(vttCue);
            }
            return vttCue;
        }
        return null;
    },
    addVTTCuesToTrack: function (track, vttCues) {
        if (!this.renderNatively) {
            return;
        }
        var trackId = track._id;
        var _tracksById = this._tracksById;
        var _cuesByTrackId = this._cuesByTrackId;
        var textTrack = _tracksById[trackId];
        // the track may not be on the video tag yet
        if (!textTrack) {
            if (!_cuesByTrackId) {
                _cuesByTrackId = this._cuesByTrackId = {};
            }
            _cuesByTrackId[trackId] = { cues: vttCues, loaded: false };
            return;
        }
        // Cues already added
        if (_cuesByTrackId[trackId] && _cuesByTrackId[trackId].loaded) {
            return;
        }
        var cue;
        _cuesByTrackId[trackId] = { cues: vttCues, loaded: true };
        while ((cue = vttCues.shift())) {
            _addCueToTrack(this.renderNatively, textTrack, cue);
        }
    },
    parseNativeID3Cues: function (cues, previousCues) {
        var lastCue = cues[cues.length - 1];
        if (previousCues && previousCues.length === cues.length &&
            (lastCue._parsed || cuesMatch(previousCues[previousCues.length - 1], lastCue))) {
            return;
        }
        var dataCueSets = [];
        var parsedDataCueSets = [];
        var dataCueSetIndex = -1;
        var startTime = -1;
        var previousStart = -1;
        for (var i = 0; i < cues.length; i++) {
            var cue = cues[i];
            if (!cue._extended && !!(cue.data || cue.value)) {
                if (cue.startTime !== startTime || cue.endTime === null) {
                    previousStart = startTime;
                    startTime = cue.startTime;
                    var previousSet = dataCueSets[dataCueSetIndex];
                    dataCueSets[++dataCueSetIndex] = [];
                    parsedDataCueSets[dataCueSetIndex] = [];
                    // increase id3 cue duration to a minimum of 0.25s up to next id3 cue start to ensure
                    // "cuechange" event is fired and it is added to activeCues when currentTime intersects cue range
                    var gap = startTime - previousStart;
                    if (previousSet && gap > 0) {
                        // eslint-disable-next-line max-depth
                        for (var j = 0; j < previousSet.length; j++) {
                            var previousCue = previousSet[j];
                            previousCue.endTime = startTime;
                            previousCue._extended = true;
                        }
                    }
                }
                dataCueSets[dataCueSetIndex].push(cue);
                if (!cue._parsed) {
                    parsedDataCueSets[dataCueSetIndex].push(cue);
                    if (cue.endTime - startTime < 0.25) {
                        cue.endTime = startTime + 0.25;
                    }
                    cue._parsed = true;
                }
            }
        }
        for (var i = 0; i < parsedDataCueSets.length; i++) {
            if (parsedDataCueSets[i].length) {
                var event_1 = getId3CueMetaEvent(parsedDataCueSets[i]);
                this.trigger(events_1.MEDIA_META_CUE_PARSED, event_1);
            }
        }
    },
    triggerActiveCues: function (currentActiveCues, previousActiveCues) {
        var _this = this;
        var dataCues = currentActiveCues.filter(function (cue) {
            // Prevent duplicate meta events for cues that were active in the previous "cuechange" event
            if (previousActiveCues && previousActiveCues.some(function (prevCue) { return cuesMatch(cue, prevCue); })) {
                return false;
            }
            if (cue.data) {
                return true;
            }
            var event = cue.text ? getTextCueMetaEvent(cue) : null;
            if (event) {
                if (event.metadataType === 'emsg') {
                    event.metadata = event.metadata || {};
                    event.metadata.messageData = cue.value;
                }
                _this.trigger(events_1.MEDIA_META, event);
            }
            else if (cue.value) {
                return true;
            }
            return false;
        });
        if (dataCues.length) {
            var event_2 = getId3CueMetaEvent(dataCues);
            this.trigger(events_1.MEDIA_META, event_2);
        }
    },
    ensureMetaTracksActive: function () {
        // Safari sometimes disables metadata tracks after seeking. It does this without warning,
        // breaking API metadata event functionality.
        // Ensure metadata tracks are enabled in "hidden" mode.
        var tracks = this.video.textTracks;
        var len = tracks.length;
        for (var i = 0; i < len; i++) {
            var track = tracks[i];
            if (track.kind === 'metadata' && track.mode === 'disabled') {
                track.mode = 'hidden';
            }
        }
    },
    _cacheVTTCue: function (track, vttCue, cacheKey) {
        var trackKind = track.kind;
        var trackId = track._id;
        var _cachedVTTCues = this._cachedVTTCues;
        if (!_cachedVTTCues[trackId]) {
            _cachedVTTCues[trackId] = {};
        }
        var cachedCues = _cachedVTTCues[trackId];
        var cacheKeyTime;
        switch (trackKind) {
            case 'captions':
            case 'subtitles': {
                // VTTCues should have unique start and end times, even in cases where there are multiple
                // active cues. This is safer than ensuring text is unique, which may be violated on seek.
                // Captions within .05s of each other are treated as unique to account for
                // quality switches where start/end times are slightly different.
                cacheKeyTime = cacheKey || Math.floor(vttCue.startTime * 20);
                var cacheLine = '_' + (vttCue.line || 'auto');
                var cacheValue = Math.floor(vttCue.endTime * 20);
                var cueExists = cachedCues[cacheKeyTime + cacheLine] || cachedCues[(cacheKeyTime + 1) + cacheLine] || cachedCues[(cacheKeyTime - 1) + cacheLine];
                if (cueExists && Math.abs(cueExists - cacheValue) <= 1) {
                    return false;
                }
                cachedCues[cacheKeyTime + cacheLine] = cacheValue;
                return true;
            }
            case 'metadata': {
                var text = vttCue.data ? new Uint8Array(vttCue.data).join('') : vttCue.text;
                cacheKeyTime = cacheKey || vttCue.startTime + text;
                if (cachedCues[cacheKeyTime]) {
                    return false;
                }
                cachedCues[cacheKeyTime] = vttCue.endTime;
                return true;
            }
            default:
                return false;
        }
    },
    _addTrackToList: function (track) {
        this._textTracks.push(track);
        this._tracksById[track._id] = track;
    },
    _createTrack: function (itemTrack) {
        var track;
        var labelInfo = (0, tracks_helper_1.createLabel)(itemTrack, this._unknownCount);
        var label = labelInfo.label;
        this._unknownCount = labelInfo.unknownCount;
        if (this.renderNatively || itemTrack.kind === 'metadata') {
            var tracks = this.video.textTracks;
            // TextTrack label is read only, so we'll need to create a new track if we don't
            // already have one with the same label
            track = (0, underscore_1.findWhere)(tracks, { label: label });
            if (!track) {
                track = this.video.addTextTrack(itemTrack.kind, label, itemTrack.language || '');
            }
            track["default"] = itemTrack["default"];
            track.mode = 'disabled';
            track.inuse = true;
        }
        else {
            track = itemTrack;
            track.data = track.data || [];
        }
        if (!track._id) {
            track._id = (0, tracks_helper_1.createId)(itemTrack, this._textTracks ? this._textTracks.length : 0);
        }
        return track;
    },
    _clearSideloadedTextTracks: function () {
        // Clear VTT textTracks
        if (!this._textTracks) {
            return;
        }
        var nonSideloadedTracks = this._textTracks.filter(function (track) {
            return track.embedded || track.groupid === 'subs';
        });
        this._initTextTracks();
        var _tracksById = this._tracksById;
        nonSideloadedTracks.forEach(function (track) {
            _tracksById[track._id] = track;
        });
        this._textTracks = nonSideloadedTracks;
    }
};
function textTrackChangeHandler() {
    var textTracks = this.video.textTracks;
    var inUseTracks = (0, underscore_1.filter)(textTracks, function (track) {
        return (track.inuse || !track._id) && isCaptionsOrSubtitles(track.kind);
    });
    if (!this._textTracks || _tracksModified.call(this, inUseTracks)) {
        this.setTextTracks(textTracks);
        return;
    }
    // If a caption/subtitle track is showing, find its index
    var selectedTextTrackIndex = -1;
    for (var i = 0; i < this._textTracks.length; i++) {
        if (this._textTracks[i].mode === 'showing') {
            selectedTextTrackIndex = i;
            break;
        }
    }
    // Notifying the model when the index changes keeps the current index in sync in iOS Fullscreen mode
    if (selectedTextTrackIndex !== this._currentTextTrackIndex) {
        this.setSubtitlesTrack(selectedTextTrackIndex + 1);
    }
}
function _tracksModified(inUseTracks) {
    var _textTracks = this._textTracks;
    var _tracksById = this._tracksById;
    // Need to add new textTracks coming from the video tag
    if (inUseTracks.length > _textTracks.length) {
        return true;
    }
    // Tracks may have changed in Safari after an ad
    for (var i = 0; i < inUseTracks.length; i++) {
        var track = inUseTracks[i];
        if (!track._id || !_tracksById[track._id]) {
            return true;
        }
    }
    return false;
}
// Used in MS Edge to get tracks from the videotag as they're added
function addTrackHandler(e) {
    var track = e.track;
    if (track && track._id) {
        return;
    }
    this.setTextTracks(this.video.textTracks);
}
function cueChangeHandler(e) {
    var track = e.target;
    var activeCues = track.activeCues, cues = track.cues;
    var trackId = track._id;
    var _cues = this._cues;
    var _activeCues = this._activeCues;
    if (cues && cues.length) {
        var previousCues = _cues[trackId];
        _cues[trackId] = Array.prototype.slice.call(cues);
        this.parseNativeID3Cues(cues, previousCues);
    }
    else {
        delete _cues[trackId];
    }
    if (activeCues && activeCues.length) {
        var previousActiveCues = _activeCues[trackId];
        var currentActiveCues = _activeCues[trackId] = Array.prototype.slice.call(activeCues);
        this.triggerActiveCues(currentActiveCues, previousActiveCues);
    }
    else {
        delete _activeCues[trackId];
    }
}
// ////////////////////
// //// PRIVATE METHODS
// ////////////////////
function _addCueToTrack(renderNatively, track, vttCue) {
    // IE/Edge will throw an exception if cues are not inserted in time order: https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/13183203/
    if (environment_1.Browser.ie) {
        var cue = vttCue;
        if (renderNatively || track.kind === 'metadata') {
            // There's no support for the VTTCue interface in IE/Edge.
            // We need to convert VTTCue to TextTrackCue before adding them to the TextTrack
            // This unfortunately removes positioning properties from the cues
            cue = new window.TextTrackCue(vttCue.startTime, vttCue.endTime, vttCue.text);
            if (vttCue.value) {
                cue.value = vttCue.value;
            }
        }
        insertCueInOrder(track, cue);
    }
    else {
        try {
            track.addCue(vttCue);
        }
        catch (error) {
            console.error(error);
        }
    }
}
function insertCueInOrder(track, vttCue) {
    var temp = [];
    // If the track mode is 'disabled', track.cues will be null; set it to hidden so that we can access.
    var mode = track.mode;
    track.mode = 'hidden';
    var cues = track.cues;
    if (cues) {
        for (var i = cues.length - 1; i >= 0; i--) {
            if (cues[i].startTime > vttCue.startTime) {
                temp.unshift(cues[i]);
                track.removeCue(cues[i]);
            }
            else {
                break;
            }
        }
    }
    try {
        track.addCue(vttCue);
        temp.forEach(function (cue) { return track.addCue(cue); });
    }
    catch (error) {
        console.error(error);
    }
    // Restore the original track state
    track.mode = mode;
}
function _removeCues(renderNatively, tracks, removeCustomAttributes) {
    if (tracks && tracks.length) {
        (0, underscore_1.each)(tracks, function (track) {
            var trackId = track._id || '';
            if (removeCustomAttributes) {
                track._id = undefined;
            }
            // Let IE, Edge and Safari handle cleanup of non-sideloaded text tracks for native rendering
            if ((environment_1.Browser.ie || environment_1.Browser.safari) && renderNatively && /^(native|subtitle|cc)/.test(trackId)) {
                return;
            }
            // Cues are inaccessible if the track is disabled. While hidden,
            // we can remove cues while the track is in a non-visible state
            // Set to disabled before hidden to ensure active cues disappear
            if (!environment_1.Browser.ie || track.mode !== 'disabled') {
                // Avoid setting the track to disabled if it is already so. This prevents an exception when trying
                // to set the mode on Edge
                track.mode = 'disabled';
                track.mode = 'hidden';
            }
            if (track.cues) {
                for (var i = track.cues.length; i--;) {
                    track.removeCue(track.cues[i]);
                }
            }
            if (!track.embedded) {
                track.mode = 'disabled';
            }
            track.inuse = false;
        });
    }
}
function isCaptionsOrSubtitles(kind) {
    return kind === 'captions' || kind === 'subtitles';
}
function isNativeCaptionsOrSubtitles(trackId) {
    return (/^native(?:captions|subtitles)/).test(trackId);
}
function getTextCueMetaEvent(cue) {
    var metadata;
    try {
        metadata = JSON.parse(cue.text);
    }
    catch (e) {
        return null;
    }
    var event = {
        metadataType: metadata.metadataType,
        metadataTime: cue.startTime,
        metadata: metadata
    };
    if (metadata.programDateTime) {
        event.programDateTime = metadata.programDateTime;
    }
    return event;
}
function getId3CueMetaEvent(dataCues) {
    var metadata = (0, id3Parser_1.parseID3)(dataCues);
    var metadataTime = dataCues[0].startTime;
    return {
        metadataType: 'id3',
        metadataTime: metadataTime,
        metadata: metadata
    };
}
function cuesMatch(cue1, cue2) {
    return cue1.startTime === cue2.startTime &&
        cue1.endTime === cue2.endTime &&
        cue1.text === cue2.text &&
        cue1.data === cue2.data &&
        JSON.stringify(cue1.value) === JSON.stringify(cue2.value);
}
exports["default"] = Tracks;
