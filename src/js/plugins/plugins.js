"use strict";
exports.__esModule = true;
exports.registerPlugin = void 0;
var loader_1 = require("plugins/loader");
var model_1 = require("plugins/model");
var pluginsModel = new model_1["default"]();
var registerPlugin = function (name, minimumVersion, pluginClass) {
    var plugin = pluginsModel.addPlugin(name);
    if (!plugin.js) {
        plugin.registerPlugin(name, minimumVersion, pluginClass);
    }
};
exports.registerPlugin = registerPlugin;
function loadPlugins(model, api) {
    var pluginsConfig = model.get('plugins');
    window.jwplayerPluginJsonp = exports.registerPlugin;
    var pluginLoader = model.pluginLoader =
        model.pluginLoader || new loader_1["default"]();
    return pluginLoader.load(api, pluginsModel, pluginsConfig, model).then(function (results) {
        if (model.attributes._destroyed) {
            // Player and plugin loader was replaced
            return;
        }
        delete window.jwplayerPluginJsonp;
        return results;
    });
}
exports["default"] = loadPlugins;
