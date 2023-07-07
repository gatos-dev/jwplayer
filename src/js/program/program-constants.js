"use strict";
exports.__esModule = true;
exports.BACKGROUND_LOAD_MIN_OFFSET = exports.BACKGROUND_LOAD_OFFSET = exports.MEDIA_POOL_SIZE = void 0;
// The number of tags allocated in the media pool
exports.MEDIA_POOL_SIZE = 4;
// The number of seconds before a BGL trigger at which we should start background loading. This ensures that we have
// kicked off background loading before being able to transition to that item
exports.BACKGROUND_LOAD_OFFSET = 5;
// The minimum time from the start of a video in which we can background load
exports.BACKGROUND_LOAD_MIN_OFFSET = 1;
