"use strict";
exports.__esModule = true;
var dom_1 = require("utils/dom");
var parser;
function svgParse(svgXml) {
    if (!parser) {
        parser = new DOMParser();
    }
    return (0, dom_1.sanitizeElementAttributes)((0, dom_1.sanitizeScriptNodes)(parser.parseFromString(svgXml, 'image/svg+xml').documentElement));
}
exports["default"] = svgParse;
