"use strict";
exports.__esModule = true;
exports.loadFrom = exports.versionCheck = exports.repo = exports.getScriptPath = void 0;
var version_1 = require("version");
var validator_1 = require("utils/validator");
var getScriptPath = function (scriptName) {
    if (!__HEADLESS__) {
        var scripts = document.getElementsByTagName('script');
        for (var i = 0; i < scripts.length; i++) {
            var src = scripts[i].src;
            if (src) {
                var index = src.lastIndexOf('/' + scriptName);
                if (index >= 0) {
                    return src.substr(0, index + 1);
                }
            }
        }
    }
    return '';
};
exports.getScriptPath = getScriptPath;
// Gets the repository location from which modules and plugins are loaded by default
var repo = function () {
    if (__SELF_HOSTED__) {
        return (0, exports.getScriptPath)('jwplayer.js');
    }
    var playerRepo = __REPO__;
    var protocol = (playerRepo && (0, validator_1.isFileProtocol)()) ? 'https:' : '';
    return "".concat(protocol).concat(playerRepo);
};
exports.repo = repo;
// Is the player at least a minimum required version?
var versionCheck = function (target) {
    var tParts = ('0' + target).split(/\W/);
    var jParts = version_1.version.split(/\W/);
    var tMajor = parseFloat(tParts[0]);
    var jMajor = parseFloat(jParts[0]);
    if (tMajor > jMajor) {
        return false;
    }
    else if (tMajor === jMajor) {
        if (parseFloat('0' + tParts[1]) > parseFloat(jParts[1])) {
            return false;
        }
    }
    return true;
};
exports.versionCheck = versionCheck;
var loadFrom = function () {
    if (__DEBUG__ || __SELF_HOSTED__) {
        return (0, exports.getScriptPath)('jwplayer.js');
    }
    return (0, exports.repo)();
};
exports.loadFrom = loadFrom;
