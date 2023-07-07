"use strict";
exports.__esModule = true;
exports.configurePlugin = exports.getPluginErrorCode = exports.getPluginName = void 0;
// Extract a plugin name from a string
var getPluginName = function (url) {
    // Regex locates the characters after the last slash, until it encounters a dash.
    return url.replace(/^(.*\/)?([^-]*)-?.*\.(js)$/, '$2');
};
exports.getPluginName = getPluginName;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getPluginErrorCode(pluginURL) {
    return 305000;
}
exports.getPluginErrorCode = getPluginErrorCode;
function configurePlugin(pluginObj, pluginConfig, api) {
    var pluginName = pluginObj.name;
    var pluginOptions = Object.assign({}, pluginConfig);
    if (__HEADLESS__) {
        var pluginInstance_1 = pluginObj.getNewInstance(api, pluginOptions);
        api.addPlugin(pluginName, pluginInstance_1);
        return pluginInstance_1;
    }
    var div = document.createElement('div');
    div.id = api.id + '_' + pluginName;
    div.className = 'jw-plugin jw-reset';
    var pluginInstance = pluginObj.getNewInstance(api, pluginOptions, div);
    api.addPlugin(pluginName, pluginInstance);
    return pluginInstance;
}
exports.configurePlugin = configurePlugin;
