"use strict";
exports.__esModule = true;
exports.inInteraction = void 0;
function inInteraction(event) {
    event = event || window.event;
    return !!event && /^(?:mouse|pointer|touch|gesture|click|key)/.test(event.type);
}
exports.inInteraction = inInteraction;
