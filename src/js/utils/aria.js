"use strict";
exports.__esModule = true;
function default_1(element, ariaLabel) {
    if (!element || !ariaLabel) {
        return;
    }
    element.setAttribute('aria-label', ariaLabel);
    element.setAttribute('role', 'button');
    element.setAttribute('tabindex', '0');
}
exports["default"] = default_1;
