"use strict";
exports.__esModule = true;
exports.supportsType = exports.SupportsMatrix = void 0;
var html5_android_hls_1 = require("providers/html5-android-hls");
var validator_1 = require("utils/validator");
var video_1 = require("utils/video");
var MimeTypes = {
    aac: 'audio/mp4',
    mp4: 'video/mp4',
    f4v: 'video/mp4',
    m4v: 'video/mp4',
    mov: 'video/mp4',
    mp3: 'audio/mpeg',
    mpeg: 'audio/mpeg',
    ogv: 'video/ogg',
    ogg: 'video/ogg',
    oga: 'video/ogg',
    vorbis: 'video/ogg',
    webm: 'video/webm',
    // The following are not expected to work in Chrome
    f4a: 'video/aac',
    m3u8: 'application/vnd.apple.mpegurl',
    m3u: 'application/vnd.apple.mpegurl',
    hls: 'application/vnd.apple.mpegurl'
};
exports.SupportsMatrix = __HEADLESS__ ? [] : [
    {
        name: 'html5',
        supports: supportsType
    }
];
function supportsType(source) {
    if (__HEADLESS__ || !video_1["default"] || !video_1["default"].canPlayType) {
        return false;
    }
    if ((0, html5_android_hls_1.isAndroidHls)(source) === false) {
        return false;
    }
    var file = source.file;
    var type = source.type;
    // Ensure RTMP files are not seen as videos
    if ((0, validator_1.isRtmp)(file, type)) {
        return false;
    }
    var mimeType = source.mimeType || MimeTypes[type];
    // Not OK to use HTML5 with no extension
    if (!mimeType) {
        return false;
    }
    // source.mediaTypes is an Array of media types that MediaSource must support for the stream to play
    // Ex: ['video/webm; codecs="vp9"', 'audio/webm; codecs="vorbis"']
    var mediaTypes = source.mediaTypes;
    if (mediaTypes && mediaTypes.length) {
        mimeType = [mimeType].concat(mediaTypes.slice()).join('; ');
    }
    // Last, but not least, we ask the browser
    // (But only if it's a video with an extension known to work in HTML5)
    return !!video_1["default"].canPlayType(mimeType);
}
exports.supportsType = supportsType;
