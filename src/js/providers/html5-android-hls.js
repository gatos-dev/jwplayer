"use strict";
exports.__esModule = true;
exports.isAndroidHls = void 0;
var environment_1 = require("environment/environment");
function isAndroidHls(source) {
    if (source.type === 'hls' && environment_1.OS.android) {
        if (source.androidhls === false) {
            return false;
        }
        // Allow Android hls playback on versions 4.1 and above, excluding Firefox (which does not support HLS in any version)
        return !environment_1.Browser.firefox && parseFloat(environment_1.OS.version.version || '0') >= 4.4;
    }
    return null;
}
exports.isAndroidHls = isAndroidHls;
