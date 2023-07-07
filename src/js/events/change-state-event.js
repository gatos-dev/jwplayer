"use strict";
exports.__esModule = true;
var events_1 = require("events/events");
// The api should dispatch an idle event when the model's state changes to complete
// This is to avoid conflicts with the complete event and to maintain legacy event flow
function normalizeApiState(newstate) {
    if (newstate === events_1.STATE_COMPLETE || newstate === events_1.STATE_ERROR) {
        return events_1.STATE_IDLE;
    }
    return newstate;
}
function normalizeReason(newstate, reason) {
    if (newstate === events_1.STATE_BUFFERING) {
        return reason === events_1.STATE_STALLED ? reason : events_1.STATE_LOADING;
    }
    return reason;
}
function ChangeStateEvent(model, newstate, oldstate) {
    newstate = normalizeApiState(newstate);
    oldstate = normalizeApiState(oldstate);
    // do not dispatch idle a second time after complete
    if (newstate !== oldstate) {
        // buffering, playing and paused states become:
        // buffer, play and pause events
        var type = newstate.replace(/(?:ing|d)$/, '');
        var reason = normalizeReason(newstate, model.mediaModel.get('mediaState'));
        var evt = {
            type: type,
            newstate: newstate,
            oldstate: oldstate,
            reason: reason
        };
        // add reason for play/pause events
        if (type === 'play') {
            evt.playReason = model.get('playReason');
        }
        else if (type === 'pause') {
            evt.pauseReason = model.get('pauseReason');
        }
        this.trigger(type, evt);
    }
}
exports["default"] = ChangeStateEvent;
