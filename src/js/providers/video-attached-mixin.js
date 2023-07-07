"use strict";
exports.__esModule = true;
var VideoAttachedMixin = {
    eventsOn_: function () {
        // noop
    },
    eventsOff_: function () {
        // noop
    },
    attachMedia: function () {
        this.eventsOn_();
    },
    detachMedia: function () {
        return this.eventsOff_();
    }
};
exports["default"] = VideoAttachedMixin;
