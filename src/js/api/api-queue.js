"use strict";
exports.__esModule = true;
function ApiQueueDecorator(instance, queuedCommands, predicate) {
    var commandQueue = [];
    var undecoratedMethods = {};
    queuedCommands.forEach(function (command) {
        var method = instance[command];
        undecoratedMethods[command] = method;
        instance[command] = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (predicate()) {
                commandQueue.push({ command: command, args: args });
            }
            else {
                executeQueuedCommands();
                if (method) {
                    method.apply(this, args);
                }
            }
        };
    });
    function executeQueuedCommands() {
        while (commandQueue.length > 0) {
            var _a = commandQueue.shift(), command = _a.command, args = _a.args;
            (undecoratedMethods[command] || instance[command]).apply(instance, args);
        }
    }
    Object.defineProperty(this, 'queue', {
        enumerable: true,
        get: function () {
            return commandQueue;
        }
    });
    this.flush = executeQueuedCommands;
    this.empty = function () {
        commandQueue.length = 0;
    };
    this.off = function () {
        queuedCommands.forEach(function (command) {
            var method = undecoratedMethods[command];
            if (method) {
                instance[command] = method;
                delete undecoratedMethods[command];
            }
        });
    };
    this.destroy = function () {
        this.off();
        this.empty();
    };
}
exports["default"] = ApiQueueDecorator;
