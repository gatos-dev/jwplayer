"use strict";
exports.__esModule = true;
exports.isDeepKeyCompliant = exports.typeOf = exports.isYouTube = exports.isRtmp = exports.isFileProtocol = exports.isHTTPS = exports.exists = void 0;
/** @module */
var protocol = window.location.protocol;
/**
 * @param {any} item - The variable to test.
 * @returns {boolean} Is the value of `item` null, undefined or an empty string?
 */
function exists(item) {
    switch (typeof (item)) {
        case 'string':
            return (item.length > 0);
        case 'object':
            return (item !== null);
        case 'undefined':
            return false;
        default:
            return true;
    }
}
exports.exists = exists;
/**
 * @returns {boolean} Is the current page hosted over HTTPS?
 */
function isHTTPS() {
    return protocol === 'https:';
}
exports.isHTTPS = isHTTPS;
/**
 * @returns {boolean} Is the current page hosted over the File protocol?
 */
function isFileProtocol() {
    return protocol === 'file:';
}
exports.isFileProtocol = isFileProtocol;
/**
 * @param {string} file - The path or url to a media file
 * @param {string} type - The type of the media parsed from a feed or the file extension.
 * @returns {boolean} Is `file` an RTMP link or does `type` equal 'rtmp'?
 */
function isRtmp(file, type) {
    return (file.indexOf('rtmp:') === 0 || type === 'rtmp');
}
exports.isRtmp = isRtmp;
/**
 * @param {string} path - The path or url to a media file
 * @param {string} type - The type of the media parsed from a feed or the media url.
 * @returns {boolean} Is `path` a YouTube link or does `type` equal 'youtube'?
 */
function isYouTube(path, type) {
    return (type === 'youtube') || (/^(http|\/\/).*(youtube\.com|youtu\.be)\/.+/).test(path);
}
exports.isYouTube = isYouTube;
/**
 * @param {any} value - The variable to test.
 * @returns {string} The typeof object, 'array' or 'null'.
 */
function typeOf(value) {
    if (value === null) {
        return 'null';
    }
    var typeofString = typeof value;
    if (typeofString === 'object') {
        if (Array.isArray(value)) {
            return 'array';
        }
    }
    return typeofString;
}
exports.typeOf = typeOf;
/**
 * Indicates whether or not the customObj has *at least* the same keys as the defaultObj; the customObj could have more keys.
 * @param {GenericObject} defaultObj - The object that determines the desired set of keys.
 * @param {GenericObject} customObj - The object we want to verify has, at least, the same keys as defaultObj.
 * @param {function} predicate - The function evaluating whether the property has a valid value and can be considered compliant. Inputs are the object and its key.
 * @returns {boolean} Does the customObj have at least the same keys as defaultObj, and do their properties also share the same keys ?
 */
function isDeepKeyCompliant(defaultObj, customObj, predicate) {
    var defaultKeys = Object.keys(defaultObj);
    return Object.keys(customObj).length >= defaultKeys.length &&
        defaultKeys.every(function (key) {
            var defaultValue = defaultObj[key];
            var customValue = customObj[key];
            if (defaultValue && typeof defaultValue === 'object') {
                if (customValue && typeof customValue === 'object') {
                    return isDeepKeyCompliant(defaultValue, customValue, predicate);
                }
                return false;
            }
            return predicate(key, defaultObj);
        });
}
exports.isDeepKeyCompliant = isDeepKeyCompliant;
