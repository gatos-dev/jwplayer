"use strict";
exports.__esModule = true;
var errors_1 = require("api/errors");
var utils_1 = require("plugins/utils");
var PluginLoader = function () {
    this.load = function (api, pluginsModel, pluginsConfig, model) {
        // Must be a hash map
        if (!pluginsConfig || typeof pluginsConfig !== 'object') {
            return Promise.resolve();
        }
        return Promise.all(Object.keys(pluginsConfig).filter(function (pluginUrl) { return pluginUrl; })
            .map(function (pluginUrl) {
            var pluginConfig = pluginsConfig[pluginUrl];
            return pluginsModel.setupPlugin(pluginUrl).then(function (plugin) {
                if (model.attributes._destroyed) {
                    return;
                }
                return (0, utils_1.configurePlugin)(plugin, pluginConfig, api);
            })["catch"](function (error) {
                pluginsModel.removePlugin(pluginUrl);
                if (!error.code) {
                    return new errors_1.PlayerError(null, (0, utils_1.getPluginErrorCode)(pluginUrl), error);
                }
                return error;
            });
        }));
    };
};
exports["default"] = PluginLoader;
