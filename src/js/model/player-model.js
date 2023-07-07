"use strict";
exports.__esModule = true;
exports.DEFAULT_DVR_SEEK_LIMIT = exports.DEFAULT_MIN_DVR_WINDOW = exports.INITIAL_MEDIA_STATE = exports.INITIAL_PLAYER_STATE = void 0;
var events_1 = require("events/events");
exports.INITIAL_PLAYER_STATE = {
    audioMode: false,
    itemMeta: {},
    playbackRate: 1,
    playRejected: false,
    state: events_1.STATE_IDLE,
    itemReady: false,
    controlsEnabled: false
};
exports.INITIAL_MEDIA_STATE = {
    position: 0,
    duration: 0,
    buffer: 0,
    currentTime: 0
};
exports.DEFAULT_MIN_DVR_WINDOW = 120;
exports.DEFAULT_DVR_SEEK_LIMIT = 25;
