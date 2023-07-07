"use strict";
//     Backbone.js 1.1.2
exports.__esModule = true;
exports.triggerSafe = exports.trigger = exports.off = exports.once = exports.on = void 0;
var Events = /** @class */ (function () {
    function Events() {
    }
    /**
     * Adds an event listener.
     * @param {string} name - The event name. Passing "all" will bind the callback to all events.
     * @param {function} callback - The event callback.
     * @param {any} [context] - The context to apply to the callback's function invocation.
     * @returns {any} `this` context for chaining.
     */
    Events.prototype.on = function (name, callback, context) {
        if (!eventsApi(this, 'on', name, [callback, context]) || !callback) {
            return this;
        }
        var _events = this._events || (this._events = {});
        var events = _events[name] || (_events[name] = []);
        events.push({ callback: callback, context: context });
        return this;
    };
    /**
     * Adds an event listener which is triggered at most once.
     * The listener is removed after the first call.
     * @param {string} name - The event name. Passing "all" will bind the callback to all events.
     * @param {function} callback - The event callback.
     * @param {any} [context] - The context to apply to the callback's function invocation.
     * @returns {any} `this` context for chaining.
     */
    Events.prototype.once = function (name, callback, context) {
        if (!eventsApi(this, 'once', name, [callback, context]) || !callback) {
            return this;
        }
        var count = 0;
        var self = this;
        var onceCallback = function () {
            if (count++) {
                return;
            }
            self.off(name, onceCallback);
            // eslint-disable-next-line prefer-rest-params
            callback.apply(this, arguments);
        };
        onceCallback._callback = callback;
        return this.on(name, onceCallback, context);
    };
    /**
     * Removes one or more callbacks.
     * @param {string} [name] - The event name. If null, all bound callbacks for all events will be removed.
     * @param {function} [callback] - If null, all callbacks for the event will be removed.
     * @param {any} [context] - If null, all callbacks with that function will be removed.
     * @returns {any} `this` context for chaining.
     */
    Events.prototype.off = function (name, callback, context) {
        if (!this._events || !eventsApi(this, 'off', name, [callback, context])) {
            return this;
        }
        if (!name && !callback && !context) {
            delete this._events;
            return this;
        }
        var names = name ? [name] : Object.keys(this._events);
        for (var i = 0, l = names.length; i < l; i++) {
            name = names[i];
            var events = this._events[name];
            if (events) {
                var retain = this._events[name] = [];
                if (callback || context) {
                    for (var j = 0, k = events.length; j < k; j++) {
                        var ev = events[j];
                        if ((callback && callback !== ev.callback && callback !== ev.callback._callback) ||
                            (context && context !== ev.context)) {
                            retain.push(ev);
                        }
                    }
                }
                if (!retain.length) {
                    delete this._events[name];
                }
            }
        }
        return this;
    };
    /**
     * Trigger one or many events, firing all bound callbacks. Callbacks are
     * passed the same arguments as `trigger`, apart from the event name
     * (unless you're listening on `"all"`, which will cause your callback to
     * receive the true name of the event as the first argument).
     * @param {string} name - The event name.
     * @param {...any} args - Event callback arguments.
     * @returns {any} `this` context for chaining.
     */
    Events.prototype.trigger = function (name) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (!this._events) {
            return this;
        }
        if (!eventsApi(this, 'trigger', name, args)) {
            return this;
        }
        var events = this._events[name];
        var allEvents = this._events.all;
        if (events) {
            triggerEvents(events, args, this);
        }
        if (allEvents) {
            // eslint-disable-next-line prefer-rest-params
            triggerEvents(allEvents, arguments, this);
        }
        return this;
    };
    /**
     * "Safe" version of `trigger` that causes each callback's execution
     * to be wrapped in a try-catch block
     * @param {string} name - The event name.
     * @param {...any} args - Event callback arguments.
     * @returns {any} `this` context for chaining.
     */
    Events.prototype.triggerSafe = function (name) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (!this._events) {
            return this;
        }
        if (!eventsApi(this, 'trigger', name, args)) {
            return this;
        }
        var events = this._events[name];
        var allEvents = this._events.all;
        if (events) {
            triggerEvents(events, args, this, name);
        }
        if (allEvents) {
            // eslint-disable-next-line prefer-rest-params
            triggerEvents(allEvents, arguments, this, name);
        }
        return this;
    };
    return Events;
}());
exports["default"] = Events;
// Add static methods to class for legacy use - Object.assign(this, Events)
exports.on = Events.prototype.on;
exports.once = Events.prototype.once;
exports.off = Events.prototype.off;
exports.trigger = Events.prototype.trigger;
exports.triggerSafe = Events.prototype.triggerSafe;
Events.on = exports.on;
Events.once = exports.once;
Events.off = exports.off;
Events.trigger = exports.trigger;
// Regular expression used to split event strings.
var eventSplitter = /\s+/;
// Implement fancy features of the Events API such as multiple event
// names `"change blur"` and jQuery-style event maps `{change: action}`
// in terms of the existing API.
function eventsApi(obj, action, name, rest) {
    if (!name) {
        return true;
    }
    // Handle event maps.
    if (typeof name === 'object') {
        for (var key in name) {
            if (Object.prototype.hasOwnProperty.call(name, key)) {
                // eslint-disable-next-line prefer-spread
                obj[action].apply(obj, [key, name[key]].concat(rest));
            }
        }
        return false;
    }
    // Handle space separated event names.
    if (eventSplitter.test(name)) {
        var names = name.split(eventSplitter);
        for (var i = 0, l = names.length; i < l; i++) {
            // eslint-disable-next-line prefer-spread
            obj[action].apply(obj, [names[i]].concat(rest));
        }
        return false;
    }
    return true;
}
function triggerEvents(events, args, context, catchExceptionsForName) {
    var i = -1;
    var l = events.length;
    while (++i < l) {
        var ev = events[i];
        if (catchExceptionsForName) {
            try {
                ev.callback.apply(ev.context || context, args);
            }
            catch (e) {
                /* eslint-disable no-console */
                console.log('Error in "' + catchExceptionsForName + '" event handler:', e);
            }
        }
        else {
            ev.callback.apply(ev.context || context, args);
        }
    }
}
