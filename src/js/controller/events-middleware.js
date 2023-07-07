"use strict";
exports.__esModule = true;
function middleware(model, type, currentState) {
    var newState = currentState;
    switch (type) {
        case 'time':
        case 'beforePlay':
        case 'pause':
        case 'play':
        case 'ready': {
            var viewable = model.get('viewable');
            // Don't add viewable to events if we don't know we're viewable
            if (viewable !== undefined) {
                // Emit viewable as 0 or 1
                newState = Object.assign({}, currentState, { viewable: viewable });
            }
            break;
        }
        default: {
            break;
        }
    }
    return newState;
}
exports["default"] = middleware;
