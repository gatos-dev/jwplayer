"use strict";
exports.__esModule = true;
var clock_1 = require("utils/clock");
/**
 * The Timer used to measure player and playlist item QoE
 * @class Timer
 */
var Timer = /** @class */ (function () {
    function Timer() {
        this.startTimes = {};
        this.sum = {};
        this.counts = {};
        this.ticks = {};
    }
    // Profile methods
    /**
     * Start timing a method. Increment {@link TimerMetrics} count.
     * If the method was already started, but not finished, it's start will be reset.
     * @memberOf Timer
     * @instance
     * @param {string} methodName - The method or player state name.
     * @returns {void}
     */
    Timer.prototype.start = function (methodName) {
        this.startTimes[methodName] = (0, clock_1.dateTime)();
        this.counts[methodName] = this.counts[methodName] + 1 || 1;
    };
    /**
     * Finish timing a method. The time since `start` is added to {@link TimerMetrics#sums} sums.
     * @memberOf Timer
     * @instance
     * @param {string} methodName - The method or player state name.
     * @returns {void}
     */
    Timer.prototype.end = function (methodName) {
        if (!this.startTimes[methodName]) {
            return;
        }
        var now = (0, clock_1.dateTime)();
        var e = now - this.startTimes[methodName];
        delete this.startTimes[methodName];
        this.sum[methodName] = this.sum[methodName] + e || e;
    };
    /**
     * Output the timer metrics.
     * @memberOf Timer
     * @instance
     * @returns {TimerMetrics} The timing and count of all "tick" events tracked thus far.
     */
    Timer.prototype.dump = function () {
        // Add running sum of latest method
        // This lets `jwplayer().qoe().item.sums` return a tally of running playing/paused time
        var runningSums = Object.assign({}, this.sum);
        for (var methodName in this.startTimes) {
            if (Object.prototype.hasOwnProperty.call(this.startTimes, methodName)) {
                var now = (0, clock_1.dateTime)();
                var e = now - this.startTimes[methodName];
                runningSums[methodName] = runningSums[methodName] + e || e;
            }
        }
        return {
            counts: Object.assign({}, this.counts),
            sums: runningSums,
            events: Object.assign({}, this.ticks)
        };
    };
    // Profile events
    /**
     * Add or update an event timestamp. The timestamp "tick" is added to {@link TimerMetrics#events} events.
     * @memberOf Timer
     * @instance
     * @param {string} event - The event name.
     * @returns {void}
     */
    Timer.prototype.tick = function (event) {
        this.ticks[event] = (0, clock_1.dateTime)();
    };
    /**
     * Remove an event timestamp. The timestamp "tick" is removed from {@link TimerMetrics#events} events.
     * @memberOf Timer
     * @instance
     * @param {string} event - The event name.
     * @returns {void}
     */
    Timer.prototype.clear = function (event) {
        delete this.ticks[event];
    };
    /**
     * Get the difference between two events.
     * @memberOf Timer
     * @instance
     * @param {string} left - The first event name.
     * @param {string} right - The second event name.
     * @returns {number|null} The time between events, or null if not found.
     */
    Timer.prototype.between = function (left, right) {
        if (this.ticks[right] && this.ticks[left]) {
            return this.ticks[right] - this.ticks[left];
        }
        return null;
    };
    return Timer;
}());
exports["default"] = Timer;
