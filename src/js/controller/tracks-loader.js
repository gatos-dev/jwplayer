"use strict";
exports.__esModule = true;
exports.cancelXhr = exports.loadFile = void 0;
var vttcue_1 = require("parsers/captions/vttcue");
var core_loader_1 = require("../api/core-loader");
var ajax_1 = require("utils/ajax");
var parsers_1 = require("parsers/parsers");
var srt_1 = require("parsers/captions/srt");
var dfxp_1 = require("parsers/captions/dfxp");
var errors_1 = require("api/errors");
function loadFile(track, successHandler, errorHandler) {
    track.xhr = (0, ajax_1.ajax)(track.file, function (xhr) {
        xhrSuccess(xhr, track, successHandler, errorHandler);
    }, function (key, url, xhr, error) {
        errorHandler((0, errors_1.composePlayerError)(error, errors_1.ERROR_LOADING_CAPTIONS));
    });
}
exports.loadFile = loadFile;
function cancelXhr(tracks) {
    if (tracks) {
        tracks.forEach(function (track) {
            var xhr = track.xhr;
            if (xhr) {
                xhr.onload = null;
                xhr.onreadystatechange = null;
                xhr.onerror = null;
                if ('abort' in xhr) {
                    xhr.abort();
                }
            }
            delete track.xhr;
        });
    }
}
exports.cancelXhr = cancelXhr;
function convertToVTTCues(cues) {
    // VTTCue is available natively or polyfilled where necessary
    return cues.map(function (cue) { return new vttcue_1["default"](cue.begin, cue.end, cue.text); });
}
function xhrSuccess(xhr, track, successHandler, errorHandler) {
    var xmlRoot = xhr.responseXML ? xhr.responseXML.firstChild : null;
    var cues;
    var vttCues;
    // IE9 sets the firstChild element to the root <xml> tag
    if (xmlRoot) {
        if ((0, parsers_1.localName)(xmlRoot) === 'xml') {
            xmlRoot = xmlRoot.nextSibling;
        }
        // Ignore all comments
        while (xmlRoot && xmlRoot.nodeType === xmlRoot.COMMENT_NODE) {
            xmlRoot = xmlRoot.nextSibling;
        }
    }
    try {
        if (xmlRoot && (0, parsers_1.localName)(xmlRoot) === 'tt') {
            // parse dfxp track
            if (!xhr.responseXML) {
                throw new Error('Empty XML response');
            }
            cues = (0, dfxp_1["default"])(xhr.responseXML);
            vttCues = convertToVTTCues(cues);
            delete track.xhr;
            successHandler(vttCues);
        }
        else {
            // parse VTT/SRT track
            var responseText_1 = xhr.responseText;
            if (responseText_1.indexOf('WEBVTT') >= 0) {
                // make VTTCues from VTT track
                loadVttParser().then(function (VttParser) {
                    var parser = new VttParser(window);
                    vttCues = [];
                    parser.oncue = function (cue) {
                        vttCues.push(cue);
                    };
                    parser.onflush = function () {
                        delete track.xhr;
                        successHandler(vttCues);
                    };
                    // Parse calls onflush internally
                    parser.parse(responseText_1);
                })["catch"](function (error) {
                    delete track.xhr;
                    errorHandler((0, errors_1.convertToPlayerError)(null, errors_1.ERROR_LOADING_CAPTIONS, error));
                });
            }
            else {
                // make VTTCues from SRT track
                cues = (0, srt_1["default"])(responseText_1);
                vttCues = convertToVTTCues(cues);
                delete track.xhr;
                successHandler(vttCues);
            }
        }
    }
    catch (error) {
        delete track.xhr;
        errorHandler((0, errors_1.convertToPlayerError)(null, errors_1.ERROR_LOADING_CAPTIONS, error));
    }
}
function loadVttParser() {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return require.ensure(['parsers/captions/vttparser'], function (require) {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        return require('parsers/captions/vttparser')["default"];
    }, (0, core_loader_1.chunkLoadWarningHandler)(301131), 'vttparser');
}
