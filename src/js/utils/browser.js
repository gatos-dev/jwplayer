"use strict";
exports.__esModule = true;
exports.flashVersion = exports.isFlashSupported = exports.isIframe = exports.isMobile = exports.isAndroid = exports.isAndroidNative = exports.isIOS = exports.isSafari = exports.isIE = exports.isChrome = exports.isTizenApp = exports.isTizen = exports.isMSIE = exports.isEdge = exports.isFacebook = exports.isOSX = exports.isIPad = exports.isIPod = exports.isIETrident = exports.isFF = void 0;
function userAgentMatch(regex) {
    return navigator.userAgent.match(regex) !== null;
}
var isIPadOS13 = function () { return navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1; };
var isFF = function () { return userAgentMatch(/firefox\//i); };
exports.isFF = isFF;
var isIETrident = function () { return userAgentMatch(/trident\/.+rv:\s*11/i); };
exports.isIETrident = isIETrident;
var isIPod = function () { return userAgentMatch(/iP(hone|od)/i); };
exports.isIPod = isIPod;
var isIPad = function () { return userAgentMatch(/iPad/i) || isIPadOS13(); };
exports.isIPad = isIPad;
var isOSX = function () { return userAgentMatch(/Macintosh/i) && !isIPadOS13(); };
exports.isOSX = isOSX;
// Check for Facebook App Version to see if it's Facebook
var isFacebook = function () { return userAgentMatch(/FBAV/i); };
exports.isFacebook = isFacebook;
var isEdge = function () { return userAgentMatch(/\sEdge?\/\d+/i); };
exports.isEdge = isEdge;
var isMSIE = function () { return userAgentMatch(/msie/i); };
exports.isMSIE = isMSIE;
var isTizen = function () { return userAgentMatch(/SMART-TV/); };
exports.isTizen = isTizen;
var isTizenApp = function () { return (0, exports.isTizen)() && !userAgentMatch(/SamsungBrowser/); };
exports.isTizenApp = isTizenApp;
var isChrome = function () { return userAgentMatch(/\s(?:(?:Headless)?Chrome|CriOS)\//i) &&
    !(0, exports.isEdge)() &&
    !userAgentMatch(/UCBrowser/i); };
exports.isChrome = isChrome;
// Exclude Chromium Edge ("Edg/") from isIE
var isIE = function () { return !userAgentMatch(/\sEdg\/\d+/i) && ((0, exports.isEdge)() || (0, exports.isIETrident)() || (0, exports.isMSIE)()); };
exports.isIE = isIE;
var isSafari = function () { return (userAgentMatch(/safari/i) &&
    !userAgentMatch(/(?:Chrome|CriOS|chromium|android|phantom)/i)) &&
    !(0, exports.isTizen)(); };
exports.isSafari = isSafari;
var isIOS = function () { return userAgentMatch(/iP(hone|ad|od)/i) || isIPadOS13(); };
exports.isIOS = isIOS;
function isAndroidNative() {
    // Android Browser appears to include a user-agent string for Chrome/18
    if (userAgentMatch(/chrome\/[123456789]/i) && !userAgentMatch(/chrome\/18/i) && !(0, exports.isFF)()) {
        return false;
    }
    return (0, exports.isAndroid)();
}
exports.isAndroidNative = isAndroidNative;
var isAndroid = function () { return userAgentMatch(/Android/i) && !userAgentMatch(/Windows Phone/i); };
exports.isAndroid = isAndroid;
var isMobile = function () { return (0, exports.isIOS)() || (0, exports.isAndroid)() || userAgentMatch(/Windows Phone/i); };
exports.isMobile = isMobile;
var isIframe = function () {
    if (typeof exports.isIframe.mock_ === 'boolean') {
        return exports.isIframe.mock_;
    }
    try {
        return window.self !== window.top;
    }
    catch (e) {
        return true;
    }
};
exports.isIframe = isIframe;
exports.isIframe.mock_ = null;
// Always returns false as flash support is discontinued
var isFlashSupported = function () { return false; };
exports.isFlashSupported = isFlashSupported;
// Always returns 0 as flash support is discontinued
var flashVersion = function () { return 0; };
exports.flashVersion = flashVersion;
