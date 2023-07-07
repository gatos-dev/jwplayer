"use strict";
exports.__esModule = true;
var validator_1 = require("utils/validator");
var strings_1 = require("utils/strings");
var Source = function (config) {
    // file is the only hard requirement
    if (!config || !config.file) {
        return;
    }
    var source = Object.assign({}, {
        'default': false,
        type: ''
    }, config);
    // normalize for odd strings
    source.file = (0, strings_1.trim)('' + source.file);
    // regex to check if mimetype is given
    var mimetypeRegEx = /^[^/]+\/(?:x-)?([^/]+)$/;
    var sType = source.type;
    if (mimetypeRegEx.test(sType)) {
        // if type is given as a mimetype
        source.mimeType = sType;
        source.type = sType.replace(mimetypeRegEx, '$1');
    }
    // check if the source is youtube or rtmp
    if ((0, validator_1.isYouTube)(source.file)) {
        source.type = 'youtube';
    }
    else if ((0, validator_1.isRtmp)(source.file)) {
        source.type = 'rtmp';
    }
    else if (!source.type) {
        source.type = (0, strings_1.extension)(source.file);
    }
    if (!source.type) {
        return;
    }
    // normalize types
    switch (source.type) {
        case 'm3u8':
        case 'vnd.apple.mpegurl':
            source.type = 'hls';
            break;
        case 'dash+xml':
            source.type = 'dash';
            break;
        // Although m4a is a container format, it is most often used for aac files
        // http://en.wikipedia.org/w/index.php?title=MPEG-4_Part_14
        case 'm4a':
            source.type = 'aac';
            break;
        case 'smil':
            source.type = 'rtmp';
            break;
        default:
            break;
    }
    // remove empty strings
    Object.keys(source).forEach(function (key) {
        if (source[key] === '') {
            delete source[key];
        }
    });
    return source;
};
exports["default"] = Source;
