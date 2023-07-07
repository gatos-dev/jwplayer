"use strict";
exports.__esModule = true;
exports.numChildren = exports.getChildNode = exports.textContent = exports.localName = void 0;
var strings_1 = require("utils/strings");
function localName(node) {
    var name = '';
    if (node) {
        if (node.localName) {
            name = node.localName;
        }
        else if (node.baseName) {
            name = node.baseName;
        }
    }
    return name;
}
exports.localName = localName;
function textContent(node) {
    var text = '';
    if (node) {
        if (node.textContent) {
            text = (0, strings_1.trim)(node.textContent);
        }
        else if (node.text) {
            text = (0, strings_1.trim)(node.text);
        }
    }
    return text;
}
exports.textContent = textContent;
function getChildNode(parent, index) {
    return parent.childNodes[index];
}
exports.getChildNode = getChildNode;
function numChildren(parent) {
    if (parent.childNodes) {
        return parent.childNodes.length;
    }
    return 0;
}
exports.numChildren = numChildren;
