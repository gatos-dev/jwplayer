"use strict";
exports.__esModule = true;
/**
 * A simple data structure for containing both of the background loading objects.
 * currentMedia is the currently active item which has been put into the background during ad playback.
 * nextMedia is an item which is preloading in the background which may be selected in the future. It is usually the
 * next item in the playlist, or the next up item in a recommendations feed.
 * @returns {BackgroundMedia}
 */
/**
 * @typedef {Object} BackgroundMedia
 * @property {MediaController} currentMedia - The mediaController which has been placed into the background during playback.
 * @property {Item} nextItem - The playlist item loading in the background.
 * @property {Promise} nextMedia - A promise representing the media loading in the background. Resolves with the mediaController.
 * @constructor
 */
// eslint-disable-next-line @typescript-eslint/no-redeclare
function BackgroundMedia() {
    var currentMedia = null;
    var nextMedia = null;
    return {
        setNext: function (item, loadPromise) {
            nextMedia = { item: item, loadPromise: loadPromise };
        },
        isNext: function (item) {
            return !!(nextMedia && JSON.stringify(nextMedia.item.sources[0]) === JSON.stringify(item.sources[0]));
        },
        updateNext: function (item) {
            if (nextMedia) {
                nextMedia.item = item;
            }
        },
        clearNext: function () {
            nextMedia = null;
        },
        get nextLoadPromise() {
            return nextMedia ? nextMedia.loadPromise : null;
        },
        get currentMedia() {
            return currentMedia;
        },
        set currentMedia(mediaController) {
            currentMedia = mediaController;
        }
    };
}
exports["default"] = BackgroundMedia;
