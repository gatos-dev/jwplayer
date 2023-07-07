"use strict";
exports.__esModule = true;
exports.isPercentage = exports.suffix = exports.prefix = exports.offsetToSeconds = exports.seconds = exports.hms = exports.extension = exports.xmlAttribute = exports.pad = exports.trim = void 0;
var underscore_1 = require("utils/underscore");
var parseFloat = window.parseFloat;
function trim(inputString) {
    return inputString.replace(/^\s+|\s+$/g, '');
}
exports.trim = trim;
function pad(str, length, padder) {
    str = '' + str;
    padder = padder || '0';
    while (str.length < length) {
        str = padder + str;
    }
    return str;
}
exports.pad = pad;
// Get the value of a case-insensitive attribute in an XML node
function xmlAttribute(xml, attribute) {
    var attributes = xml.attributes;
    for (var attrib = 0; attrib < attributes.length; attrib++) {
        if (attributes[attrib].name && attributes[attrib].name.toLowerCase() === attribute.toLowerCase()) {
            return attributes[attrib].value.toString();
        }
    }
    return '';
}
exports.xmlAttribute = xmlAttribute;
function extension(path) {
    if (!path || path.substr(0, 4) === 'rtmp') {
        return '';
    }
    var azureFormatMatches = (/[(,]format=(m3u8|mpd)-/i).exec(path);
    if (azureFormatMatches) {
        return azureFormatMatches[1];
    }
    var fileExtension = path.replace(/^.+?\.(\w+)(?:[;].*)?(?:[?#].*)?$/, '$1');
    if (fileExtension !== path) {
        return fileExtension.toLowerCase();
    }
    path = path.split('?')[0].split('#')[0];
    if (path.lastIndexOf('.') > -1) {
        return path.substr(path.lastIndexOf('.') + 1, path.length).toLowerCase();
    }
    return '';
}
exports.extension = extension;
// Convert seconds to HH:MN:SS.sss
function hms(secondsNumber) {
    var h = (secondsNumber / 3600) | 0;
    var m = ((secondsNumber / 60) | 0) % 60;
    var s = secondsNumber % 60;
    return pad(h.toString(), 2) + ':' + pad(m.toString(), 2) + ':' + pad(s.toFixed(3), 6);
}
exports.hms = hms;
// Convert a time-representing string to a number
function seconds(time, frameRate) {
    if (!time) {
        return 0;
    }
    if ((0, underscore_1.isValidNumber)(time)) {
        return time;
    }
    var input = time.replace(',', '.');
    var lastChar = input.slice(-1);
    var arr = input.split(':');
    var arrLength = arr.length;
    var sec = 0;
    if (lastChar === 's') {
        sec = parseFloat(input);
    }
    else if (lastChar === 'm') {
        sec = parseFloat(input) * 60;
    }
    else if (lastChar === 'h') {
        sec = parseFloat(input) * 3600;
    }
    else if (arrLength > 1) {
        var secIndex = arrLength - 1;
        if (arrLength === 4) {
            // if frame is included in the string, calculate seconds by dividing by frameRate
            if (frameRate) {
                sec = parseFloat(arr[secIndex]) / frameRate;
            }
            secIndex -= 1;
        }
        sec += parseFloat(arr[secIndex]);
        sec += parseFloat(arr[secIndex - 1]) * 60;
        if (arrLength >= 3) {
            sec += parseFloat(arr[secIndex - 2]) * 3600;
        }
    }
    else {
        sec = parseFloat(input);
    }
    if (!(0, underscore_1.isValidNumber)(sec)) {
        return 0;
    }
    return sec;
}
exports.seconds = seconds;
// Convert an offset string to a number; supports conversion of percentage offsets
function offsetToSeconds(offset, duration, frameRate) {
    if ((0, underscore_1.isString)(offset) && offset.slice(-1) === '%') {
        var percent = parseFloat(offset);
        if (!duration || !(0, underscore_1.isValidNumber)(duration) || !(0, underscore_1.isValidNumber)(percent)) {
            return null;
        }
        return duration * percent / 100;
    }
    return seconds(offset, frameRate);
}
exports.offsetToSeconds = offsetToSeconds;
function prefix(arr, add) {
    return arr.map(function (val) { return add + val; });
}
exports.prefix = prefix;
function suffix(arr, add) {
    return arr.map(function (val) { return val + add; });
}
exports.suffix = suffix;
function isPercentage(value) {
    return !!value && (0, underscore_1.isString)(value) && value.slice(-1) === '%';
}
exports.isPercentage = isPercentage;
