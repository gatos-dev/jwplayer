"use strict";
exports.__esModule = true;
exports.getPlayAttemptFailedErrorCode = exports.composePlayerError = exports.convertToPlayerError = exports.PlayerError = exports.MSG_TECHNICAL_ERROR = exports.MSG_PROTECTED_CONTENT = exports.MSG_LIVE_STREAM_DOWN = exports.MSG_CANT_PLAY_IN_BROWSER = exports.MSG_CANT_LOAD_PLAYER = exports.MSG_BAD_CONNECTION = exports.MSG_CANT_PLAY_VIDEO = exports.ERROR_LOADING_TRANSLATIONS_EMPTY_RESPONSE = exports.ERROR_LOADING_TRANSLATIONS = exports.ERROR_LOADING_CAPTIONS = exports.ERROR_LOADING_PROVIDER = exports.ASYNC_PLAYLIST_ITEM_REJECTED = exports.ERROR_PLAYLIST_ITEM_MISSING_SOURCE = exports.ERROR_LOADING_PLAYLIST_ITEM = exports.SETUP_ERROR_LOADING_PROVIDER = exports.ERROR_LOADING_PLAYLIST = exports.ERROR_COMPLETING_SETUP = exports.SETUP_ERROR_ASYNC_SKIPPED_PLAYLIST = exports.SETUP_ERROR_LOADING_PLAYLIST = exports.SETUP_ERROR_LOADING_CORE_JS = exports.SETUP_ERROR_PROMISE_API_CONFLICT = exports.SETUP_ERROR_TIMEOUT = exports.SETUP_ERROR_UNKNOWN = void 0;
var underscore_1 = require("utils/underscore");
/** @module */
/**
 * @enum {ErrorCode} Base code for a setup failure.
 **/
exports.SETUP_ERROR_UNKNOWN = 100000;
/**
 * @enum {ErrorCode} Setup failed because it took longer than 30 seconds.
 */
exports.SETUP_ERROR_TIMEOUT = 100001;
/**
 * @enum {ErrorCode} Setup failed because the setup promise result was undefined.
 * This could be caused by 3rd party JavaScript interfering with native promises or an incomplete promise polyfill.
 */
exports.SETUP_ERROR_PROMISE_API_CONFLICT = 100002;
/**
 * @enum {ErrorCode} Setup failed because a core module failed to load.
 */
exports.SETUP_ERROR_LOADING_CORE_JS = 101000;
/**
 * @enum {ErrorCode} Setup failed because the playlist failed to load.
 */
exports.SETUP_ERROR_LOADING_PLAYLIST = 102000;
/**
 * @enum {ErrorCode} Setup failed because all items in the playlist were skipped by the async callback.
 */
exports.SETUP_ERROR_ASYNC_SKIPPED_PLAYLIST = 102700;
/**
 * @enum {ErrorCode} An exception occurred while completing player setup.
 */
exports.ERROR_COMPLETING_SETUP = 200001;
/**
 * @enum {ErrorCode} Playback stopped because the playlist failed to load.
 */
exports.ERROR_LOADING_PLAYLIST = 202000;
/**
 * @enum {ErrorCode} Setup failed because the initial provider failed to load.
 */
exports.SETUP_ERROR_LOADING_PROVIDER = 104000;
/**
 * @enum {ErrorCode} An error occurred when switching playlist items.
 */
exports.ERROR_LOADING_PLAYLIST_ITEM = 203000;
/**
 * @enum {ErrorCode} The current playlist item has no source media.
 */
exports.ERROR_PLAYLIST_ITEM_MISSING_SOURCE = 203640;
/**
 * @enum {ErrorCode} Reached the end of the playlist while skipping items via async callback.
 */
exports.ASYNC_PLAYLIST_ITEM_REJECTED = 203700;
/**
 * @enum {ErrorCode} Between playlist items, the required provider could not be loaded.
 */
exports.ERROR_LOADING_PROVIDER = 204000;
/**
 * @enum {ErrorCode} The play attempt failed for unknown reasons.
 */
var PLAY_ATTEMPT_FAILED_MISC = 303200;
/**
 * @enum {ErrorCode} The play attempt was interrupted for unknown reasons.
 */
var PLAY_ATTEMPT_FAILED_ABORT = 303210;
/**
 * @enum {ErrorCode} The play attempt was interrupted by a new load request.
 */
var PLAY_ATTEMPT_FAILED_ABORT_LOAD = 303212;
/**
 * @enum {ErrorCode} The play attempt was interrupted by a call to pause().
 */
var PLAY_ATTEMPT_FAILED_ABORT_PAUSE = 303213;
/**
 * @enum {ErrorCode} The play attempt failed because the user didn't interact with the document first.
 */
var PLAY_ATTEMPT_FAILED_NOT_ALLOWED = 303220;
/**
 * @enum {ErrorCode} The play attempt failed because no supported source was found.
 */
var PLAY_ATTEMPT_FAILED_NOT_SUPPORTED = 303230;
/**
 * @enum {ErrorKey}
 */
exports.ERROR_LOADING_CAPTIONS = 306000;
/**
 * @enum {ErrorKey}
 */
exports.ERROR_LOADING_TRANSLATIONS = 308000;
/**
 * @enum {ErrorKey}
 */
exports.ERROR_LOADING_TRANSLATIONS_EMPTY_RESPONSE = 308640;
/**
 * @enum {ErrorKey}
 */
exports.MSG_CANT_PLAY_VIDEO = 'cantPlayVideo';
/**
 * @enum {ErrorKey}
 */
exports.MSG_BAD_CONNECTION = 'badConnection';
/**
 * @enum {ErrorKey}
 */
exports.MSG_CANT_LOAD_PLAYER = 'cantLoadPlayer';
/**
 * @enum {ErrorKey}
 */
exports.MSG_CANT_PLAY_IN_BROWSER = 'cantPlayInBrowser';
/**
 * @enum {ErrorKey}
 */
exports.MSG_LIVE_STREAM_DOWN = 'liveStreamDown';
/**
 * @enum {ErrorKey}
 */
exports.MSG_PROTECTED_CONTENT = 'protectedContent';
/**
 * @enum {ErrorKey}
 */
exports.MSG_TECHNICAL_ERROR = 'technicalError';
/**
 * Class used to create "setupError" and "error" event instances.
 * @class PlayerError
 * @param {message} string - The error message.
 * @param {code} [ErrorCode] - The error code.
 * @param {sourceError} [Error] - The lower level error, caught by the player, which resulted in this error.
 */
var PlayerError = /** @class */ (function () {
    function PlayerError(key, code, sourceError) {
        this.code = (0, underscore_1.isValidNumber)(code) ? code : 0;
        this.sourceError = sourceError || null;
        if (key) {
            this.key = key;
        }
    }
    PlayerError.logMessage = function (code) {
        var suffix = code % 1000;
        var prefix = Math.floor((code - suffix) / 1000);
        var codeStr = code.toString();
        if (suffix >= 400 && suffix < 600) {
            codeStr = "".concat(prefix, "400-").concat(prefix, "599");
        }
        // Warnings are in the 3xx,xxx range
        var isWarning = code > 299999 && code < 400000;
        return "JW Player ".concat(isWarning ? 'Warning' : 'Error', " ").concat(code, ". For more information see https://developer.jwplayer.com/jw-player/docs/developer-guide/api/errors-reference#").concat(codeStr);
    };
    return PlayerError;
}());
exports.PlayerError = PlayerError;
function convertToPlayerError(key, code, error) {
    if (!(error instanceof PlayerError) || !error.code) {
        // Transform any unhandled error into a PlayerError so emitted events adhere to a uniform structure
        return new PlayerError(key, code, error);
    }
    return error;
}
exports.convertToPlayerError = convertToPlayerError;
function composePlayerError(error, superCode) {
    var playerError = convertToPlayerError(exports.MSG_TECHNICAL_ERROR, superCode, error);
    playerError.code = (error && (error instanceof PlayerError) && error.code || 0) + superCode;
    return playerError;
}
exports.composePlayerError = composePlayerError;
function getPlayAttemptFailedErrorCode(error) {
    var name = error.name, message = error.message;
    switch (name) {
        case 'AbortError':
            if (/pause/.test(message)) {
                return PLAY_ATTEMPT_FAILED_ABORT_PAUSE;
            }
            else if (/load/.test(message)) {
                return PLAY_ATTEMPT_FAILED_ABORT_LOAD;
            }
            return PLAY_ATTEMPT_FAILED_ABORT;
        case 'NotAllowedError':
            return PLAY_ATTEMPT_FAILED_NOT_ALLOWED;
        case 'NotSupportedError':
            return PLAY_ATTEMPT_FAILED_NOT_SUPPORTED;
        default:
            return PLAY_ATTEMPT_FAILED_MISC;
    }
}
exports.getPlayAttemptFailedErrorCode = getPlayAttemptFailedErrorCode;
