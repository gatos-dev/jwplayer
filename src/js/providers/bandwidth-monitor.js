"use strict";
exports.__esModule = true;
var events_1 = require("events/events");
var underscore_1 = require("utils/underscore");
// eslint-disable-next-line @typescript-eslint/no-redeclare
function BandwidthMonitor(provider, initialEstimate) {
    var bandwidthMonitorInterval;
    var bandwidthEstimate = initialEstimate;
    return {
        start: function () {
            this.stop();
            bandwidthMonitorInterval = window.setInterval(function () {
                var bwEstimate = provider.getBandwidthEstimate();
                if (!(0, underscore_1.isValidNumber)(bwEstimate)) {
                    return;
                }
                bandwidthEstimate = bwEstimate;
                provider.trigger(events_1.BANDWIDTH_ESTIMATE, {
                    bandwidthEstimate: bandwidthEstimate
                });
            }, 1000);
        },
        stop: function () {
            clearInterval(bandwidthMonitorInterval);
        },
        getEstimate: function () {
            return bandwidthEstimate;
        }
    };
}
exports["default"] = BandwidthMonitor;
