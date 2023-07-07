"use strict";
exports.__esModule = true;
exports.Features = exports.OS = exports.Browser = void 0;
var browser_1 = require("utils/browser");
var browser_version_1 = require("./browser-version");
var os_version_1 = require("./os-version");
var userAgent = navigator.userAgent;
var noop = function () {
    // Do nothing
};
function supportsPassive() {
    var passiveOptionRead = false;
    if (!__HEADLESS__) {
        try {
            var opts = Object.defineProperty({}, 'passive', {
                get: function () { return (passiveOptionRead = true); }
            });
            window.addEventListener('testPassive', noop, opts);
            window.removeEventListener('testPassive', noop, opts);
        }
        catch (e) { /* noop */ }
    }
    return passiveOptionRead;
}
exports.Browser = {
    get androidNative() {
        return (0, browser_1.isAndroidNative)();
    },
    get chrome() {
        return (0, browser_1.isChrome)();
    },
    get edge() {
        return (0, browser_1.isEdge)();
    },
    get facebook() {
        return (0, browser_1.isFacebook)();
    },
    get firefox() {
        return (0, browser_1.isFF)();
    },
    get ie() {
        return (0, browser_1.isIE)();
    },
    get msie() {
        return (0, browser_1.isMSIE)();
    },
    get safari() {
        return (0, browser_1.isSafari)();
    },
    get version() {
        return (0, browser_version_1.browserVersion)(this, userAgent);
    }
};
exports.OS = {
    get android() {
        return (0, browser_1.isAndroid)();
    },
    get iOS() {
        return (0, browser_1.isIOS)();
    },
    get mobile() {
        return (0, browser_1.isMobile)();
    },
    get mac() {
        return (0, browser_1.isOSX)();
    },
    get iPad() {
        return (0, browser_1.isIPad)();
    },
    get iPhone() {
        return (0, browser_1.isIPod)();
    },
    get windows() {
        return userAgent.indexOf('Windows') > -1;
    },
    get tizen() {
        return (0, browser_1.isTizen)();
    },
    get tizenApp() {
        return (0, browser_1.isTizenApp)();
    },
    get version() {
        return (0, os_version_1.osVersion)(this, userAgent);
    }
};
exports.Features = {
    get flash() {
        return (0, browser_1.isFlashSupported)();
    },
    get flashVersion() {
        return (0, browser_1.flashVersion)();
    },
    get iframe() {
        return (0, browser_1.isIframe)();
    },
    get passiveEvents() {
        return supportsPassive();
    },
    get backgroundLoading() {
        return __HEADLESS__ || !(exports.OS.iOS || exports.Browser.safari || exports.OS.tizen);
    }
};
