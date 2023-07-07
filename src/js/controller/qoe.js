"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
exports.destroyQoe = exports.initQoe = void 0;
var events_1 = require("events/events");
var timer_1 = require("api/timer");
var TAB_HIDDEN = 'tabHidden';
var TAB_VISIBLE = 'tabVisible';
var QoeItem = /** @class */ (function (_super) {
    __extends(QoeItem, _super);
    function QoeItem() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    QoeItem.prototype.getFirstFrame = function () {
        var time = this.between(events_1.MEDIA_PLAY_ATTEMPT, events_1.MEDIA_FIRST_FRAME);
        // If time between the tab becoming visible and first frame is valid
        // and less than the time since play attempt, play was not attempted until the tab became visible
        var timeActive = this.between(TAB_VISIBLE, events_1.MEDIA_FIRST_FRAME);
        if (timeActive && time && timeActive > 0 && timeActive < time) {
            return timeActive;
        }
        return time;
    };
    return QoeItem;
}(timer_1["default"]));
// This is to provide a first frame event even when
//  a provider does not give us one.
var onTimeIncreasesGenerator = (function (callback) {
    var lastVal = 0;
    return function (evt) {
        var pos = evt.position;
        if (pos > lastVal) {
            callback(evt);
        }
        // sometimes the number will wrap around (ie 100 down to 0)
        //  so always update
        lastVal = pos;
    };
});
function unbindFirstFrameEvents(model, programController) {
    programController.off(events_1.MEDIA_PLAY_ATTEMPT, model._onPlayAttempt);
    programController.off(events_1.PROVIDER_FIRST_FRAME, model._triggerFirstFrame);
    programController.off(events_1.MEDIA_TIME, model._onTime);
    model.off('change:activeTab', model._onTabVisible);
    model._triggerFirstFrame = model._onTime = null;
}
function trackFirstFrame(model, programController) {
    if (model._onTabVisible) {
        unbindFirstFrameEvents(model, programController);
    }
    // When it occurs, send the event, and unbind all listeners
    var once = false;
    model._triggerFirstFrame = function (evt) {
        if (once || !programController.mediaController) {
            return;
        }
        // Only trigger firstFrame while playing or paused or providerFirstFrame
        // (ignores "time" events while loading/stalling/idle/complete)
        var mediaModel = programController.mediaController.mediaModel;
        var state = mediaModel.attributes.mediaState;
        if (state !== events_1.STATE_PLAYING && state !== events_1.STATE_PAUSED && evt.type !== events_1.PROVIDER_FIRST_FRAME) {
            return;
        }
        once = true;
        var qoeItem = model._qoeItem;
        qoeItem.tick(events_1.MEDIA_FIRST_FRAME);
        var time = qoeItem.getFirstFrame();
        programController.trigger(events_1.MEDIA_FIRST_FRAME, { loadTime: time });
        // Start firing visualQuality once playback has started
        mediaModel.off("change:".concat(events_1.MEDIA_VISUAL_QUALITY), null, mediaModel);
        mediaModel.change(events_1.MEDIA_VISUAL_QUALITY, function (changedMediaModel, eventData) {
            if (eventData) {
                programController.trigger(events_1.MEDIA_VISUAL_QUALITY, eventData);
            }
        }, mediaModel);
        unbindFirstFrameEvents(model, programController);
    };
    model._onTime = onTimeIncreasesGenerator(model._triggerFirstFrame);
    model._onPlayAttempt = function () {
        this._qoeItem.tick(events_1.MEDIA_PLAY_ATTEMPT);
    };
    // track visibility change
    model._onTabVisible = function (modelChanged, activeTab) {
        if (activeTab) {
            modelChanged._qoeItem.tick(TAB_VISIBLE);
        }
        else {
            modelChanged._qoeItem.tick(TAB_HIDDEN);
        }
    };
    model.on('change:activeTab', model._onTabVisible);
    programController.on(events_1.MEDIA_PLAY_ATTEMPT, model._onPlayAttempt, model);
    programController.once(events_1.PROVIDER_FIRST_FRAME, model._triggerFirstFrame);
    programController.on(events_1.MEDIA_TIME, model._onTime);
}
function initQoe(initialModel, programController) {
    function onMediaModel(model, mediaModel, oldMediaModel) {
        // finish previous item
        if (model._qoeItem && oldMediaModel) {
            model._qoeItem.end(oldMediaModel.get('mediaState'));
        }
        // reset item level qoe
        model._qoeItem = new QoeItem();
        model._qoeItem.tick(events_1.PLAYLIST_ITEM);
        model._qoeItem.start(mediaModel.get('mediaState'));
        trackFirstFrame(model, programController);
        mediaModel.on('change:mediaState', function (changeMediaModel, newstate, oldstate) {
            if (newstate !== oldstate) {
                model._qoeItem.end(oldstate);
                model._qoeItem.start(newstate);
            }
        });
    }
    initialModel.change('mediaModel', onMediaModel);
}
exports.initQoe = initQoe;
function destroyQoe(model, programController) {
    if (model._onTabVisible) {
        unbindFirstFrameEvents(model, programController);
    }
    model._qoeItem =
        model._triggerFirstFrame =
            model._onTime =
                model._onPlayAttempt =
                    model._onTabVisible = null;
}
exports.destroyQoe = destroyQoe;
