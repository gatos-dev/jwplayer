"use strict";
exports.__esModule = true;
exports.timeFormatAria = exports.timeFormat = exports.parseDimension = exports.serialize = exports.parseXML = exports.isAbsolutePath = exports.getAbsolutePath = void 0;
var validator_1 = require("utils/validator");
var underscore_1 = require("utils/underscore");
// Returns the absolute file path based on a relative filepath, and optional base path
function getAbsolutePath(path, base) {
    if (!base || !(0, validator_1.exists)(base)) {
        base = document.location.href;
    }
    if (!(0, validator_1.exists)(path)) {
        return '';
    }
    if (isAbsolutePath(path)) {
        return path;
    }
    var protocol = base.substring(0, base.indexOf('://') + 3);
    var domain = base.substring(protocol.length, base.indexOf('/', protocol.length + 1));
    var patharray;
    if (path.indexOf('/') === 0) {
        patharray = path.split('/');
    }
    else {
        var basepath = base.split('?')[0];
        basepath = basepath.substring(protocol.length + domain.length + 1, basepath.lastIndexOf('/'));
        patharray = basepath.split('/').concat(path.split('/'));
    }
    var result = [];
    for (var i = 0; i < patharray.length; i++) {
        if (patharray[i] && (0, validator_1.exists)(patharray[i]) && patharray[i] !== '.') {
            if (patharray[i] === '..') {
                result.pop();
            }
            else {
                result.push(patharray[i]);
            }
        }
    }
    return protocol + domain + '/' + result.join('/');
}
exports.getAbsolutePath = getAbsolutePath;
function isAbsolutePath(path) {
    return /^(?:(?:https?|file):)?\/\//.test(path);
}
exports.isAbsolutePath = isAbsolutePath;
// Returns an XML object for the given XML string, or null if the input cannot be parsed.
function parseXML(input) {
    var parsedXML = null;
    try {
        parsedXML = (new window.DOMParser()).parseFromString(input, 'text/xml');
        // In Firefox the XML doc may contain the parsererror, other browsers it's further down
        if (parsedXML.querySelector('parsererror')) {
            parsedXML = null;
        }
    }
    catch (e) { /* Expected when content is not XML */ }
    return parsedXML;
}
exports.parseXML = parseXML;
// Returns the `val` argument:
// as null if undefined
// as a boolean for string values 'true' and 'false'
// as a number for numeric strings with a character length of 5 or less
function serialize(val) {
    if (val === undefined) {
        return null;
    }
    if (typeof val === 'string' && val.length < 6) {
        var lowercaseVal = val.toLowerCase();
        if (lowercaseVal === 'true') {
            return true;
        }
        if (lowercaseVal === 'false') {
            return false;
        }
        if (!(0, underscore_1.isNaN)(Number(val)) && !(0, underscore_1.isNaN)(parseFloat(val))) {
            return Number(val);
        }
    }
    return val;
}
exports.serialize = serialize;
// Returns the integer value a of css string (e.g. '420px')
function parseDimension(dimension) {
    if ((0, underscore_1.isValidNumber)(dimension)) {
        return dimension;
    }
    if (dimension === '') {
        return 0;
    }
    if (dimension.lastIndexOf('%') > -1) {
        return dimension;
    }
    return parseInt(dimension.replace('px', ''), 10);
}
exports.parseDimension = parseDimension;
// Returns a formatted time string from "mm:ss" to "hh:mm:ss" for the given number of seconds
function timeFormat(sec, allowNegative) {
    if ((0, underscore_1.isNaN)(sec)) {
        sec = parseInt(sec.toString());
    }
    if ((0, underscore_1.isNaN)(sec) || !isFinite(sec) || (sec <= 0 && !allowNegative)) {
        return '00:00';
    }
    // If negative add a minus sign
    var prefix = (sec < 0) ? '-' : '';
    sec = Math.abs(sec);
    var hrs = Math.floor(sec / 3600);
    var mins = Math.floor((sec - hrs * 3600) / 60);
    var secs = Math.floor(sec % 60);
    return prefix + (hrs ? hrs + ':' : '') + (mins < 10 ? '0' : '') + mins + ':' + (secs < 10 ? '0' : '') + secs;
}
exports.timeFormat = timeFormat;
// Returns a formatted time string from "mm:ss" to "hh:mm:ss" for the given number of seconds
function timeFormatAria(sec) {
    if ((0, underscore_1.isNaN)(sec)) {
        sec = parseInt(sec.toString());
    }
    if ((0, underscore_1.isNaN)(sec) || !isFinite(sec) || sec <= 0) {
        return '0 seconds';
    }
    var hrs = Math.floor(sec / 3600);
    var mins = Math.floor((sec - hrs * 3600) / 60);
    var secs = Math.floor(sec % 60);
    var hrsString = (hrs > 1 ? ' hours, ' : (hrs === 1 ? ' hour, ' : ''));
    var minsString = (mins > 1 ? ' minutes, ' : (mins === 1 ? ' minute, ' : ''));
    var secsString = (secs !== 1 ? ' seconds' : (secs === 1 ? ' second' : ''));
    // TODO: I18n!!
    return (hrs ? hrs + hrsString : '') + (mins ? mins + minsString : '') + secs + secsString;
}
exports.timeFormatAria = timeFormatAria;
