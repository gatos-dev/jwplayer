"use strict";
exports.__esModule = true;
exports.mediaControllerListener = exports.providerListener = void 0;
var underscore_1 = require("utils/underscore");
var events_1 = require("events/events");
function providerListener(type, data) {
    var mediaModel = this.mediaModel;
    var event = Object.assign({}, data, {
        type: type
    });
    switch (type) {
        case events_1.MEDIA_TYPE:
            if (mediaModel.get(events_1.MEDIA_TYPE) === event.mediaType) {
                return;
            }
            mediaModel.set(events_1.MEDIA_TYPE, event.mediaType);
            break;
        case events_1.MEDIA_VISUAL_QUALITY:
            mediaModel.set(events_1.MEDIA_VISUAL_QUALITY, Object.assign({}, data));
            return;
        case events_1.MEDIA_MUTE:
            // Only forward and queue mute changes
            if (data[events_1.MEDIA_MUTE] === this.model.getMute()) {
                return;
            }
            break;
        case events_1.PLAYER_STATE: {
            var newstate = data.newstate;
            if (newstate === events_1.STATE_IDLE) {
                this.thenPlayPromise.cancel();
                mediaModel.srcReset();
            }
            // Always fire change:mediaState to keep player model in sync
            var previousState = mediaModel.attributes.mediaState;
            mediaModel.attributes.mediaState = newstate;
            mediaModel.trigger('change:mediaState', mediaModel, newstate, previousState);
            break;
        }
        case events_1.MEDIA_COMPLETE:
            this.beforeComplete = true;
            this.trigger(events_1.MEDIA_BEFORECOMPLETE, event);
            if (this.attached && !this.background) {
                this._playbackComplete();
            }
            return;
        case events_1.MEDIA_ERROR:
            if (mediaModel.get('setup')) {
                this.thenPlayPromise.cancel();
                mediaModel.srcReset();
            }
            else {
                // A MEDIA_ERROR received before setup is a preload error
                // We stop propagation here allow the player to try loading once more when playback is initiated
                // MEDIA_ERROR codes are in the 200,000 range; adding 100,000 puts it in the 300,000 warning range.
                type = events_1.WARNING;
                event.code += 100000;
            }
            break;
        case events_1.MEDIA_META: {
            var _a = data, duration = _a.duration, metadataType = _a.metadataType, seekRange = _a.seekRange;
            if (!metadataType) {
                event.metadataType = 'unknown';
            }
            if ((0, underscore_1.isValidNumber)(duration)) {
                mediaModel.set('seekRange', seekRange);
                mediaModel.set('duration', duration);
            }
            break;
        }
        case events_1.MEDIA_BUFFER:
            mediaModel.set('buffer', data.bufferPercent);
        /* falls through to update duration while media is loaded */
        case events_1.MEDIA_TIME: {
            var timeData = data;
            mediaModel.set('seekRange', timeData.seekRange);
            mediaModel.set('position', timeData.position);
            mediaModel.set('currentTime', timeData.currentTime);
            var duration = timeData.duration;
            if ((0, underscore_1.isValidNumber)(duration)) {
                mediaModel.set('duration', duration);
            }
            if (type === events_1.MEDIA_TIME && 'starttime' in this.item) {
                delete this.item.starttime;
            }
            break;
        }
        case events_1.MEDIA_SEEKED: {
            // After seeking, if the video tag is in a paused state, update the player state to "paused"
            var mediaElement = this.mediaElement;
            if (mediaElement && mediaElement.paused) {
                mediaModel.set('mediaState', 'paused');
            }
            break;
        }
        case events_1.MEDIA_LEVELS:
            mediaModel.set(events_1.MEDIA_LEVELS, data.levels);
        /* falls through to update current level */
        case events_1.MEDIA_LEVEL_CHANGED: {
            var _b = data, currentQuality = _b.currentQuality, levels = _b.levels;
            if (currentQuality > -1 && levels.length > 1) {
                mediaModel.set('currentLevel', parseInt(currentQuality));
            }
            break;
        }
        case events_1.AUDIO_TRACKS:
            mediaModel.set(events_1.AUDIO_TRACKS, data.tracks);
        /* falls through to update current track */
        case events_1.AUDIO_TRACK_CHANGED: {
            var _c = data, currentTrack = _c.currentTrack, tracks = _c.tracks;
            if (currentTrack > -1 && tracks.length > 0 && currentTrack < tracks.length) {
                mediaModel.set('currentAudioTrack', parseInt(currentTrack));
            }
            break;
        }
        default:
            break;
    }
    this.trigger(type, event);
}
exports.providerListener = providerListener;
function mediaControllerListener(type, event) {
    var model = this.model;
    switch (type) {
        case events_1.PLAYER_STATE:
            // This "return" is important because
            //  we are choosing to not propagate model event.
            //  Instead letting the master controller do so
            return;
        case events_1.MEDIA_VOLUME:
            model.set(events_1.MEDIA_VOLUME, event[events_1.MEDIA_VOLUME]);
            return;
        case events_1.MEDIA_MUTE:
            model.set(events_1.MEDIA_MUTE, event[events_1.MEDIA_MUTE]);
            return;
        case events_1.MEDIA_RATE_CHANGE:
            model.set('playbackRate', event.playbackRate);
            return;
        case events_1.MEDIA_META: {
            Object.assign(model.get('itemMeta'), event.metadata);
            break;
        }
        case events_1.MEDIA_LEVEL_CHANGED:
            model.persistQualityLevel(event.currentQuality, event.levels);
            break;
        case events_1.SUBTITLES_TRACK_CHANGED:
            model.persistVideoSubtitleTrack(event.currentTrack, event.tracks);
            break;
        case events_1.MEDIA_TIME:
            if (event.targetLatency) {
                model.set('dvrSeekLimit', event.targetLatency);
            }
        /* falls through to to trigger model event off model */
        case events_1.MEDIA_SEEK:
        case events_1.MEDIA_SEEKED:
        case events_1.NATIVE_FULLSCREEN:
        case events_1.SUBTITLES_TRACKS:
        case 'subtitlesTracksData':
            model.trigger(type, event);
            break;
        case events_1.BANDWIDTH_ESTIMATE: {
            model.persistBandwidthEstimate(event.bandwidthEstimate);
            return;
        }
        default:
    }
    this.trigger(type, event);
}
exports.mediaControllerListener = mediaControllerListener;
