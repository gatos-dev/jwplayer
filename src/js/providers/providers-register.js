"use strict";
exports.__esModule = true;
var providers_loaded_1 = require("providers/providers-loaded");
var providers_supported_1 = require("providers/providers-supported");
var default_1 = require("providers/default");
var underscore_1 = require("utils/underscore");
var backbone_events_1 = require("utils/backbone.events");
function registerProvider(provider) {
    var name = provider.getName().name;
    // Only register the provider if it isn't registered already.  This is an issue on pages with multiple embeds.
    if (providers_loaded_1.ProvidersLoaded[name]) {
        return;
    }
    // If there isn't a "supports" val for this guy
    if (!(0, underscore_1.find)(providers_supported_1.SupportsMatrix, (0, underscore_1.matches)({ name: name }))) {
        if (!(0, underscore_1.isFunction)(provider.supports)) {
            throw new Error('Tried to register a provider with an invalid object');
        }
        // The most recent provider will be in the front of the array, and chosen first
        providers_supported_1.SupportsMatrix.unshift({
            name: name,
            supports: provider.supports
        });
    }
    if (__HEADLESS__) {
        (0, underscore_1.defaults)(provider.prototype, backbone_events_1["default"]);
    }
    // Fill in any missing properties with the defaults - looks at the prototype chain
    (0, underscore_1.defaults)(provider.prototype, default_1["default"]);
    // After registration, it is loaded
    providers_loaded_1.ProvidersLoaded[name] = provider;
}
exports["default"] = registerProvider;
