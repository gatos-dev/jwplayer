"use strict";
exports.__esModule = true;
function SharedMediaPool(sharedElement, mediaPool) {
    return Object.assign({}, mediaPool, {
        prime: function () {
            if (!sharedElement.src) {
                sharedElement.load();
            }
        },
        getPrimedElement: function () {
            return sharedElement;
        },
        clean: function () {
            mediaPool.clean(sharedElement);
        },
        recycle: function () {
            mediaPool.clean(sharedElement);
        }
    });
}
exports["default"] = SharedMediaPool;
