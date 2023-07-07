"use strict";
exports.__esModule = true;
var playerutils = require("utils/playerutils");
var validator = require("utils/validator");
var parser = require("utils/parser");
var strings_1 = require("utils/strings");
var timer_1 = require("api/timer");
var trycatch_1 = require("utils/trycatch");
var underscore_1 = require("utils/underscore");
var browser_1 = require("utils/browser");
var dom_1 = require("utils/dom");
var css_1 = require("utils/css");
var ajax_1 = require("utils/ajax");
var math_1 = require("utils/math");
var log_1 = require("utils/log");
var random_id_generator_1 = require("utils/random-id-generator");
// TODO: Deprecate in v9
function crossdomain(uri) {
    var URL = window.URL;
    try {
        var b = new URL(uri, location.origin);
        return location.protocol + '//' + location.host !== b.protocol + '//' + b.host;
    }
    catch (e) { /* no-op */ }
    return true;
}
// The predicate received the arguments (key, value) instead of (value, key)
var foreach = function (aData, fnEach) {
    for (var key in aData) {
        if (Object.prototype.hasOwnProperty.call(aData, key)) {
            fnEach(key, aData[key]);
        }
    }
};
var noop = function () {
    // noop
};
var helpers = Object.assign({}, parser, validator, playerutils, {
    addClass: dom_1.addClass,
    hasClass: dom_1.hasClass,
    removeClass: dom_1.removeClass,
    replaceClass: dom_1.replaceClass,
    toggleClass: dom_1.toggleClass,
    classList: dom_1.classList,
    styleDimension: dom_1.styleDimension,
    createElement: dom_1.createElement,
    emptyElement: dom_1.emptyElement,
    addStyleSheet: dom_1.addStyleSheet,
    bounds: dom_1.bounds,
    openLink: dom_1.openLink,
    replaceInnerHtml: dom_1.replaceInnerHtml,
    css: css_1.css,
    clearCss: css_1.clearCss,
    style: css_1.style,
    transform: css_1.transform,
    getRgba: css_1.getRgba,
    ajax: ajax_1.ajax,
    crossdomain: crossdomain,
    tryCatch: trycatch_1.tryCatch,
    Error: trycatch_1.JwError,
    Timer: timer_1["default"],
    log: log_1.log,
    genId: random_id_generator_1.genId,
    between: math_1.between,
    foreach: foreach,
    flashVersion: browser_1.flashVersion,
    isIframe: browser_1.isIframe,
    indexOf: underscore_1.indexOf,
    trim: strings_1.trim,
    pad: strings_1.pad,
    extension: strings_1.extension,
    hms: strings_1.hms,
    seconds: strings_1.seconds,
    prefix: strings_1.prefix,
    suffix: strings_1.suffix,
    noop: noop
});
if (__HEADLESS__) {
    Object.assign(helpers, {
        addClass: noop,
        hasClass: noop,
        removeClass: noop,
        replaceClass: noop,
        toggleClass: noop,
        classList: function () { return []; },
        createElement: function (html) { return document.createElement(html); },
        emptyElement: noop,
        addStyleSheet: noop,
        openLink: function (link, target, additionalOptions) {
            return console.error("[headless] utils.openLink(".concat(link, ", ").concat(target, ", ").concat(additionalOptions, ")"));
        },
        replaceInnerHtml: noop,
        css: noop,
        clearCss: noop,
        style: noop,
        transform: noop
    });
}
exports["default"] = helpers;
