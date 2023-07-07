"use strict";
exports.__esModule = true;
var error_1 = require("templates/error");
var dom_1 = require("utils/dom");
var css_1 = require("utils/css");
function ErrorContainer(model, error) {
    var message = error.message, code = error.code;
    var html = (0, error_1["default"])(model.get('id'), message, model.get('localization').errors.errorCode, code.toString());
    var width = model.get('width');
    var height = model.get('height');
    var element = (0, dom_1.createElement)(html);
    (0, css_1.style)(element, {
        width: width.toString().indexOf('%') > 0 ? width : "".concat(width, "px"),
        height: height.toString().indexOf('%') > 0 ? height : "".concat(height, "px")
    });
    return element;
}
exports["default"] = ErrorContainer;
