"use strict";
exports.__esModule = true;
var plugin_1 = require("plugins/plugin");
var log_1 = require("utils/log");
var utils_1 = require("plugins/utils");
var pluginsRegistered = {};
var PluginModel = /** @class */ (function () {
    function PluginModel() {
    }
    PluginModel.prototype.setupPlugin = function (url) {
        var registeredPlugin = this.getPlugin(url);
        if (registeredPlugin) {
            if (registeredPlugin.url !== url && !__HEADLESS__) {
                (0, log_1.log)("JW Plugin \"".concat((0, utils_1.getPluginName)(url), "\" already loaded from \"").concat(registeredPlugin.url, "\". Ignoring \"").concat(url, ".\""));
            }
            return registeredPlugin.promise;
        }
        var plugin = this.addPlugin(url);
        if (__HEADLESS__) {
            return Promise.reject("Skipping loading of unsupported js plugin \"".concat(url, "\" in headless player."));
        }
        return plugin.load();
    };
    PluginModel.prototype.addPlugin = function (url) {
        var pluginName = (0, utils_1.getPluginName)(url);
        var plugin = pluginsRegistered[pluginName];
        if (!plugin) {
            plugin = new plugin_1["default"](url);
            pluginsRegistered[pluginName] = plugin;
        }
        return plugin;
    };
    PluginModel.prototype.getPlugin = function (name) {
        return pluginsRegistered[(0, utils_1.getPluginName)(name)];
    };
    PluginModel.prototype.removePlugin = function (name) {
        delete pluginsRegistered[(0, utils_1.getPluginName)(name)];
    };
    PluginModel.prototype.getPlugins = function () {
        return pluginsRegistered;
    };
    return PluginModel;
}());
exports["default"] = PluginModel;
