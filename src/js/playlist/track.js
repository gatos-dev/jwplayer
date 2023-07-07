"use strict";
exports.__esModule = true;
var VALID_TRACK_KINDS = ['captions', 'metadata', 'thumbnails', 'chapters'];
function validTrackKind(tk) {
    return VALID_TRACK_KINDS.indexOf(tk) !== -1;
}
/**
 * A media source variant present in a playlist item
 * @internal
 * @typedef {object} PlaylistItemTrack
 * @property {'captions'|'subtitles'|'chapters'|'thumbnails'} kind - The kind of track.
 * @property {boolean} default - Enable the track by default.
 */
var Track = function (config) {
    // File is the only required attr
    if (!config || !config.file) {
        return;
    }
    var trackConfig = Object.assign({}, {
        kind: 'captions',
        'default': false
    }, config);
    trackConfig.kind = validTrackKind(trackConfig.kind) ? trackConfig.kind : 'captions';
    // Disable dot notation due to default being a reserved word
    // eslint-disable-next-line dot-notation
    trackConfig['default'] = !!trackConfig['default'];
    return trackConfig;
};
exports["default"] = Track;
