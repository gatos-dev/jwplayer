"use strict";
exports.__esModule = true;
var parsers_1 = require("parsers/parsers");
var strings_1 = require("utils/strings");
var parser_1 = require("utils/parser");
var parseEntry = function (obj, itm) {
    var PREFIX = 'jwplayer';
    var def = 'default';
    var label = 'label';
    var file = 'file';
    var type = 'type';
    var sources = [];
    var tracks = [];
    var result = itm;
    for (var i = 0; i < obj.childNodes.length; i++) {
        var node = obj.childNodes[i];
        if (node.prefix === PREFIX) {
            var _localName = (0, parsers_1.localName)(node);
            if (_localName === 'source') {
                delete itm.sources;
                sources.push({
                    file: (0, strings_1.xmlAttribute)(node, file),
                    'default': (0, strings_1.xmlAttribute)(node, def),
                    label: (0, strings_1.xmlAttribute)(node, label),
                    type: (0, strings_1.xmlAttribute)(node, type)
                });
            }
            else if (_localName === 'track') {
                delete itm.tracks;
                tracks.push({
                    file: (0, strings_1.xmlAttribute)(node, file),
                    'default': (0, strings_1.xmlAttribute)(node, def),
                    kind: (0, strings_1.xmlAttribute)(node, 'kind'),
                    label: (0, strings_1.xmlAttribute)(node, label)
                });
            }
            else {
                itm[_localName] = (0, parser_1.serialize)((0, parsers_1.textContent)(node));
                if (_localName === 'file' && itm.sources) {
                    // jwplayer namespace file should override existing source
                    // (probably set in MediaParser)
                    delete itm.sources;
                }
            }
        }
        if (!itm[file]) {
            itm[file] = itm.link;
        }
    }
    if (sources.length) {
        itm.sources = [];
        for (var i = 0; i < sources.length; i++) {
            var source = sources[i];
            if (source.file.length > 0) {
                source[def] = (sources[i][def] === 'true');
                if (!source.label) {
                    delete source.label;
                }
                result.sources.push(source);
            }
        }
    }
    if (tracks.length) {
        itm.tracks = [];
        for (var i = 0; i < tracks.length; i++) {
            var track = tracks[i];
            if (track.file && track.file.length > 0) {
                track[def] = (tracks[i][def] === 'true');
                track.kind = (!tracks[i].kind.length) ? 'captions' : tracks[i].kind;
                if (!track.label) {
                    delete track.label;
                }
                result.tracks.push(track);
            }
        }
    }
    return result;
};
exports["default"] = parseEntry;
