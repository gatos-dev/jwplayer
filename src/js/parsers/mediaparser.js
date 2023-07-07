"use strict";
exports.__esModule = true;
var parsers_1 = require("parsers/parsers");
var strings_1 = require("utils/strings");
var strings_2 = require("utils/strings");
var mediaparser = function (obj, item) {
    // Prefix for the MRSS namespace
    var PREFIX = 'media';
    var captions = [];
    for (var i = 0; i < (0, parsers_1.numChildren)(obj); i++) {
        var node = obj.childNodes[i];
        if (node.prefix === PREFIX) {
            if (!(0, parsers_1.localName)(node)) {
                continue;
            }
            switch ((0, parsers_1.localName)(node).toLowerCase()) {
                case 'content':
                    if ((0, strings_1.xmlAttribute)(node, 'duration')) {
                        item.duration = (0, strings_2.seconds)((0, strings_1.xmlAttribute)(node, 'duration'));
                    }
                    if ((0, strings_1.xmlAttribute)(node, 'url')) {
                        if (!item.sources) {
                            item.sources = [];
                        }
                        var sources = {
                            file: (0, strings_1.xmlAttribute)(node, 'url'),
                            type: (0, strings_1.xmlAttribute)(node, 'type'),
                            width: (0, strings_1.xmlAttribute)(node, 'width'),
                            label: (0, strings_1.xmlAttribute)(node, 'label')
                        };
                        var mediaTypes = findMediaTypes(node);
                        if (mediaTypes.length) {
                            sources.mediaTypes = mediaTypes;
                        }
                        item.sources.push(sources);
                    }
                    if ((0, parsers_1.numChildren)(node) > 0) {
                        item = mediaparser(node, item);
                    }
                    break;
                case 'title':
                    item.title = (0, parsers_1.textContent)(node);
                    break;
                case 'description':
                    item.description = (0, parsers_1.textContent)(node);
                    break;
                case 'guid':
                    item.mediaid = (0, parsers_1.textContent)(node);
                    break;
                case 'thumbnail':
                    if (!item.image) {
                        item.image = (0, strings_1.xmlAttribute)(node, 'url');
                    }
                    break;
                case 'group':
                    mediaparser(node, item);
                    break;
                case 'subtitle': {
                    var entry = {
                        file: (0, strings_1.xmlAttribute)(node, 'url'),
                        kind: 'captions'
                    };
                    if ((0, strings_1.xmlAttribute)(node, 'lang').length > 0) {
                        entry.label = getLabel((0, strings_1.xmlAttribute)(node, 'lang'));
                    }
                    captions.push(entry);
                    break;
                }
                default:
                    break;
            }
        }
    }
    if (!item.tracks) {
        item.tracks = [];
    }
    for (var i = 0; i < captions.length; i++) {
        item.tracks.push(captions[i]);
    }
    return item;
};
function getLabel(code) {
    var LANGS = {
        zh: 'Chinese',
        nl: 'Dutch',
        en: 'English',
        fr: 'French',
        de: 'German',
        it: 'Italian',
        ja: 'Japanese',
        pt: 'Portuguese',
        ru: 'Russian',
        es: 'Spanish'
    };
    if (LANGS[code]) {
        return LANGS[code];
    }
    return code;
}
function findMediaTypes(contentNode) {
    var mediaTypes = [];
    for (var i = 0; i < (0, parsers_1.numChildren)(contentNode); i++) {
        var node = contentNode.childNodes[i];
        if (node.prefix === 'jwplayer' && (0, parsers_1.localName)(node).toLowerCase() === 'mediatypes') {
            mediaTypes.push((0, parsers_1.textContent)(node));
        }
    }
    return mediaTypes;
}
exports["default"] = mediaparser;
