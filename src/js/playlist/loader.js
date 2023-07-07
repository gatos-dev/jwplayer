"use strict";
exports.__esModule = true;
var events_1 = require("events/events");
var parsers_1 = require("parsers/parsers");
var rssparser_1 = require("parsers/rssparser");
var ajax_1 = require("utils/ajax");
var backbone_events_1 = require("utils/backbone.events");
var errors_1 = require("api/errors");
var PlaylistLoader = function () {
    var _this = Object.assign(this, backbone_events_1["default"]);
    this.load = function (playlistfile) {
        (0, ajax_1.ajax)(playlistfile, playlistLoaded, function (message, file, url, error) {
            playlistError(error);
        });
    };
    this.destroy = function () {
        this.off();
    };
    // TODO: Type `loadedEvent` ajax oncomplete callback event object
    function playlistLoaded(loadedEvent) {
        try {
            var childNodes = loadedEvent.responseXML ? loadedEvent.responseXML.childNodes : null;
            var rss = null;
            var jsonObj = void 0;
            if (childNodes) {
                for (var i = 0; i < childNodes.length; i++) {
                    rss = childNodes[i];
                    // 8: Node.COMMENT_NODE (IE8 doesn't have the Node.COMMENT_NODE constant)
                    if (rss.nodeType !== 8) {
                        break;
                    }
                }
                if (rss && (0, parsers_1.localName)(rss) === 'xml') {
                    rss = rss.nextSibling;
                }
                if (rss && (0, parsers_1.localName)(rss) === 'rss') {
                    var rssPlaylist = (0, rssparser_1["default"])(rss);
                    jsonObj = Object.assign({ playlist: rssPlaylist }, rssPlaylist.feedData);
                }
            }
            // If the response is not valid RSS, check if it is JSON
            if (!jsonObj) {
                try {
                    var pl = JSON.parse(loadedEvent.responseText);
                    // If the response is not a JSON array, try to read playlist of the response
                    if (Array.isArray(pl)) {
                        jsonObj = { playlist: pl };
                    }
                    else if (Array.isArray(pl.playlist)) {
                        jsonObj = pl;
                    }
                    else {
                        throw Error('Playlist is not an array');
                    }
                }
                catch (e) {
                    throw new errors_1.PlayerError(errors_1.MSG_CANT_PLAY_VIDEO, 621, e);
                }
            }
            _this.trigger(events_1.PLAYLIST_LOADED, jsonObj);
        }
        catch (error) {
            playlistError(error);
        }
    }
    function playlistError(error) {
        if (error instanceof errors_1.PlayerError && !error.code) {
            error = new errors_1.PlayerError(errors_1.MSG_CANT_PLAY_VIDEO, 0);
        }
        _this.trigger(events_1.ERROR, error);
    }
};
exports["default"] = PlaylistLoader;
