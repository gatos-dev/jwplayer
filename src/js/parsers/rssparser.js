"use strict";
exports.__esModule = true;
var parsers_1 = require("parsers/parsers");
var strings_1 = require("utils/strings");
var mediaparser_1 = require("parsers/mediaparser");
var jwparser_1 = require("parsers/jwparser");
var item_1 = require("playlist/item");
function parseRss(dat) {
    var arr = [];
    arr.feedData = {};
    for (var i = 0; i < (0, parsers_1.numChildren)(dat); i++) {
        var node = (0, parsers_1.getChildNode)(dat, i);
        var name_1 = (0, parsers_1.localName)(node).toLowerCase();
        if (name_1 === 'channel') {
            for (var j = 0; j < (0, parsers_1.numChildren)(node); j++) {
                var subNode = (0, parsers_1.getChildNode)(node, j);
                var nodeName = (0, parsers_1.localName)(subNode).toLowerCase();
                if (nodeName === 'item') {
                    arr.push(parseItem(subNode));
                }
                else if (nodeName) {
                    arr.feedData[nodeName] = (0, parsers_1.textContent)(subNode);
                }
            }
        }
    }
    return arr;
}
exports["default"] = parseRss;
// Translate RSS item to playlist item.
function parseItem(obj) {
    var item = {};
    for (var i = 0; i < obj.childNodes.length; i++) {
        var node = obj.childNodes[i];
        var name_2 = (0, parsers_1.localName)(node);
        if (!name_2) {
            continue;
        }
        switch (name_2.toLowerCase()) {
            case 'enclosure':
                item.file = (0, strings_1.xmlAttribute)(node, 'url');
                break;
            case 'title':
                item.title = (0, parsers_1.textContent)(node);
                break;
            case 'guid':
                item.mediaid = (0, parsers_1.textContent)(node);
                break;
            case 'pubdate':
                item.date = (0, parsers_1.textContent)(node);
                break;
            case 'description':
                item.description = (0, parsers_1.textContent)(node);
                break;
            case 'link':
                item.link = (0, parsers_1.textContent)(node);
                break;
            case 'category':
                if (item.tags) {
                    item.tags += (0, parsers_1.textContent)(node);
                }
                else {
                    item.tags = (0, parsers_1.textContent)(node);
                }
                break;
            default:
                break;
        }
    }
    return new item_1["default"]((0, jwparser_1["default"])(obj, (0, mediaparser_1["default"])(obj, item)));
}
