"use strict";
/** @module */
exports.__esModule = true;
exports.CAST_AVAILABLE = exports.PLAYER_STATE = exports.SETUP_ERROR = exports.MEDIA_SEEKED = exports.MEDIA_LOADED = exports.MEDIA_PLAY_ATTEMPT_FAILED = exports.MEDIA_PLAY_ATTEMPT = exports.MEDIA_FIRST_FRAME = exports.MEDIA_ERROR = exports.CAST_SESSION = exports.PLAYLIST_COMPLETE = exports.DISPLAY_CLICK = exports.MEDIA_BUFFER_FULL = exports.MEDIA_BEFORECOMPLETE = exports.MEDIA_BEFOREPLAY = exports.MEDIA_SEEK = exports.READY = exports.MEDIA_COMPLETE = exports.AUTOSTART_NOT_ALLOWED = exports.AD_WARNING = exports.AD_TIME = exports.AD_SKIPPED = exports.AD_PLAY = exports.AD_PAUSE = exports.AD_META = exports.AD_MEDIA_LOADED = exports.AD_IMPRESSION = exports.AD_ERROR = exports.AD_COMPLETE = exports.AD_COMPANIONS = exports.AD_CLICK = exports.WARNING = exports.ERROR = exports.OUT = exports.ENTER = exports.MOVE = exports.OVER = exports.DOUBLE_CLICK = exports.CLICK = exports.DRAG_END = exports.DRAG_START = exports.DRAG = exports.STATE_STALLED = exports.STATE_LOADING = exports.STATE_ERROR = exports.STATE_PLAYING = exports.STATE_PAUSED = exports.STATE_COMPLETE = exports.STATE_IDLE = exports.STATE_BUFFERING = void 0;
exports.FLOAT = exports.BANDWIDTH_ESTIMATE = exports.NATIVE_FULLSCREEN = exports.BREAKPOINT = exports.INSTREAM_CLICK = exports.USER_ACTION = exports.PROVIDER_FIRST_FRAME = exports.PROVIDER_CHANGED = exports.CAPTIONS_CHANGED = exports.CAPTIONS_LIST = exports.LOGO_CLICK = exports.PLAYBACK_RATE_CHANGED = exports.SUBTITLES_TRACK_CHANGED = exports.SUBTITLES_TRACKS = exports.AUDIO_TRACK_CHANGED = exports.AUDIO_TRACKS = exports.PLAYLIST_LOADED = exports.PLAYLIST_ITEM = exports.RESIZE = exports.FULLSCREEN = exports.CONTROLS = exports.MEDIA_VISUAL_QUALITY = exports.MEDIA_LEVEL_CHANGED = exports.MEDIA_LEVELS = exports.MEDIA_META = exports.MEDIA_META_CUE_PARSED = exports.MEDIA_MUTE = exports.MEDIA_VOLUME = exports.MEDIA_TYPE = exports.MEDIA_RATE_CHANGE = exports.MEDIA_TIME = exports.MEDIA_BUFFER = void 0;
/**
 * The user pressed play, but sufficient data to start playback has not yet loaded.
   The buffering icon is visible in the display.
*/
exports.STATE_BUFFERING = 'buffering';
/**
 * Either playback has not started or playback was stopped due to a stop() call or an error.
   In this state, either the play or the error icon is visible in the display.
*/
exports.STATE_IDLE = 'idle';
/**
 * Playback has ended. The replay icon is visible in the display.
*/
exports.STATE_COMPLETE = 'complete';
/**
 * The video is currently paused. The play icon is visible in the display.
*/
exports.STATE_PAUSED = 'paused';
/**
 * The video is currently playing. No icon is visible in the display.
*/
exports.STATE_PLAYING = 'playing';
/**
 * Playback was stopped due to an error.
   In this state the error icon and a message are visible in the display.
*/
exports.STATE_ERROR = 'error';
/**
 * The user pressed play, but media has not yet loaded.
*/
exports.STATE_LOADING = 'loading';
/**
 * The user pressed play, but data is not being loaded.
*/
exports.STATE_STALLED = 'stalled';
// Touch Events
/**
 * Event triggered while dragging the observed element.
*/
exports.DRAG = 'drag';
/**
 * Event triggered when dragging the observed element begins.
*/
exports.DRAG_START = 'dragStart';
/**
 * Event triggered when dragging the observed element ends.
*/
exports.DRAG_END = 'dragEnd';
/**
 * Event triggered when a user clicks the observed element once.
*/
exports.CLICK = 'click';
/**
 * Event triggered when a user clicks the observed element twice consecutively.
*/
exports.DOUBLE_CLICK = 'doubleClick';
/**
 * Event triggered when the mouse is over the observed element.
*/
exports.OVER = 'over';
/**
 * Event triggered while the mouse moves over the observed element.
*/
exports.MOVE = 'move';
/**
 * Event triggered when a user presses the enter key on the observed element.
 */
exports.ENTER = 'enter';
/**
 * Event triggered when the mouse is no longer over the observed element.
*/
exports.OUT = 'out';
// Script Loaders
/**
 * Event stream reproduction is stopped because of an error.
*/
exports.ERROR = exports.STATE_ERROR;
/**
 * Event triggered when a non-fatal error is encountered
 */
exports.WARNING = 'warning';
// Ad events
/**
 * Event triggered when an ad is clicked.
*/
exports.AD_CLICK = 'adClick';
/**
 * Event triggered once an ad tag is loaded containing companion creatives.
*/
exports.AD_COMPANIONS = 'adCompanions';
/**
 * Event triggered when an ad has completed playback.
*/
exports.AD_COMPLETE = 'adComplete';
/**
 * Event triggered when an error prevents the ad from playing.
*/
exports.AD_ERROR = 'adError';
/**
 * Event triggered based on the IAB definition of an ad impression. This occurs the instant a video ad begins to play.
*/
exports.AD_IMPRESSION = 'adImpression';
/**
 * Event triggered on instream adapter when vast media is loaded onto the video tag.
 */
exports.AD_MEDIA_LOADED = 'mediaLoaded';
/**
 * Event triggered when metadata is obtained during ad playback.
*/
exports.AD_META = 'adMeta';
/**
 * Event triggered when an ad is paused.
*/
exports.AD_PAUSE = 'adPause';
/**
 * Event triggered when an ad starts or is resumed.
*/
exports.AD_PLAY = 'adPlay';
/**
 * Event triggered when an ad is skipped.
*/
exports.AD_SKIPPED = 'adSkipped';
/**
 * Event triggered while ad playback is in progress.
*/
exports.AD_TIME = 'adTime';
/**
 *  Event triggered for ad warnings (i.e. non-fatal errors)
*/
exports.AD_WARNING = 'adWarning';
// Events
/**
 * Triggered when the browsers' autoplay setting prohibits autostarting playback.
 */
exports.AUTOSTART_NOT_ALLOWED = 'autostartNotAllowed';
/**
 * Event triggered when media playback ends because the last segment has been played.
*/
exports.MEDIA_COMPLETE = exports.STATE_COMPLETE;
/**
 * Event triggered when the player's setup is complete and is ready to be used.
    This is the earliest point at which any API calls should be made.
*/
exports.READY = 'ready';
/**
 * Event triggered when the playback position is either altered via API call, or due to user interaction.
*/
exports.MEDIA_SEEK = 'seek';
/**
 * Fired just before the player begins playing. At this point the player will not have begun playing or buffering.
    This is the ideal moment to insert preroll ads using the playAd() API
*/
exports.MEDIA_BEFOREPLAY = 'beforePlay';
/**
 * Fired just before the player completes playing. At this point the player will not have moved on to
    either showing the replay screen or advancing to the next playlistItem.
    This is the ideal moment to insert postroll ads using the playAd() API
*/
exports.MEDIA_BEFORECOMPLETE = 'beforeComplete';
/**
 * Fired when buffer has reached the maximum capacity.
*/
exports.MEDIA_BUFFER_FULL = 'bufferFull';
/**
 * Fired when a click on the video display is detected.
*/
exports.DISPLAY_CLICK = 'displayClick';
/**
 * Fired when the final item in a playlist has played its final segment and has ended.
*/
exports.PLAYLIST_COMPLETE = 'playlistComplete';
/**
 * Fired when changes to the casting status are detected, i.e. when connected or disconnected from a device.
*/
exports.CAST_SESSION = 'cast';
/**
 * Fired when an attempt to reproduce media results in a failure, causing the player to stop playback and go into idle mode.
*/
exports.MEDIA_ERROR = 'mediaError';
/**
 * Triggered by a video's first frame event, or the instant an audio file begins playback.
*/
exports.MEDIA_FIRST_FRAME = 'firstFrame';
/**
 * Triggered the moment a request to play content is made.
*/
exports.MEDIA_PLAY_ATTEMPT = 'playAttempt';
/**
 * Fired when playback is aborted or blocked. Pausing the video or changing the media results
 * in play attempts being aborted. In mobile browsers play attempts are blocked when not started by
 * a user gesture.
 */
exports.MEDIA_PLAY_ATTEMPT_FAILED = 'playAttemptFailed';
/**
 * Fired when media has been loaded into the player.
*/
exports.MEDIA_LOADED = 'loaded';
/**
 * Triggered when the video position changes after seeking, as opposed to MEDIA_SEEK which is triggered as a seek occurs.
*/
exports.MEDIA_SEEKED = 'seeked';
// Setup Events
/**
 * Triggered when the player's setup results in a failure.
*/
exports.SETUP_ERROR = 'setupError';
// Utility
/**
 * Triggered when the player's playback state changes.
*/
exports.PLAYER_STATE = 'state';
/**
 * Fired when devices are available for casting.
*/
exports.CAST_AVAILABLE = 'castAvailable';
// Model Changes
/**
 * Fired when the currently playing item loads additional data into its buffer.
    This only applies to VOD media; live streaming media (HLS/DASH) does not expose this behavior.
*/
exports.MEDIA_BUFFER = 'bufferChange';
/**
 * Fired as the playback position gets updated, while the player is playing.
*/
exports.MEDIA_TIME = 'time';
/**
 * Fired when the playbackRate of the video tag changes.
 */
exports.MEDIA_RATE_CHANGE = 'ratechange';
/**
 * Fired when a loaded item's media type is detected.
*/
exports.MEDIA_TYPE = 'mediaType';
/**
 * Fired when the playback volume is altered.
*/
exports.MEDIA_VOLUME = 'volume';
/**
 * Fired when media is muted;
*/
exports.MEDIA_MUTE = 'mute';
/**
 * Fired when metadata embedded in the media file is obtained.
 */
exports.MEDIA_META_CUE_PARSED = 'metadataCueParsed';
/**
 * Fired when metadata embedded in the media file is obtained.
*/
exports.MEDIA_META = 'meta';
/**
 * Fired when the list of available quality levels is updated.
*/
exports.MEDIA_LEVELS = 'levels';
/**
 * Fired when the active quality level is changed.
*/
exports.MEDIA_LEVEL_CHANGED = 'levelsChanged';
/**
 * Fired when the visual quality of media is updated.
 */
exports.MEDIA_VISUAL_QUALITY = 'visualQuality';
/**
 * Fired when controls are enabled or disabled by a script.
*/
exports.CONTROLS = 'controls';
/**
 * Fired when the player toggles to/from fullscreen.
*/
exports.FULLSCREEN = 'fullscreen';
/**
 * Fired when the player's on-page dimensions have changed. Is not fired in response to a fullscreen change.
*/
exports.RESIZE = 'resize';
/**
 * Fired when a new playlist item has been loaded into the player.
*/
exports.PLAYLIST_ITEM = 'playlistItem';
/**
 * Fired when an entirely new playlist has been loaded into the player.
*/
exports.PLAYLIST_LOADED = 'playlist';
/**
 * Fired when the list of available audio tracks is updated. Happens shortly after a playlist item starts playing.
*/
exports.AUDIO_TRACKS = 'audioTracks';
/**
 * Fired when the active audio track is changed.
    Happens in response to e.g. a user clicking the audio tracks menu or a script calling setCurrentAudioTrack().
*/
exports.AUDIO_TRACK_CHANGED = 'audioTrackChanged';
/**
 * Fired when the list of available subtitle tracks is updated. Happens shortly after a playlist item starts playing.
 */
exports.SUBTITLES_TRACKS = 'subtitlesTracks';
/**
 * Fired when the active subtitle track is changed.
 Happens in response to e.g. a user clicking the subtitle tracks menu or a script calling setCurrentSubtitleTrack().
 */
exports.SUBTITLES_TRACK_CHANGED = 'subtitlesTrackChanged';
/**
 * Fired when the playback rate has been changed.
*/
exports.PLAYBACK_RATE_CHANGED = 'playbackRateChanged';
// View Component Actions
/**
 * Fired when a click has been detected on the logo element.
*/
exports.LOGO_CLICK = 'logoClick';
// Model - Captions
/**
 * Fired when the list of available captions tracks changes.
    This event is the ideal time to set default captions with the API.
*/
exports.CAPTIONS_LIST = 'captionsList';
/**
 * Triggered whenever the active captions track is changed manually or via API.
*/
exports.CAPTIONS_CHANGED = 'captionsChanged';
// Provider Communication
/**
 * Fired the provider being utilized by JW Player for a particular media file is replaced by a new provider.
*/
exports.PROVIDER_CHANGED = 'providerChanged';
/**
 * Triggered when a provider begins playback to signal availability of first frame.
*/
exports.PROVIDER_FIRST_FRAME = 'providerFirstFrame';
// UI Events
/**
 * Fired when user activity is detected on the targeted element.
*/
exports.USER_ACTION = 'userAction';
/**
 * Fired when the instream adapter detects a click.
*/
exports.INSTREAM_CLICK = 'instreamClick';
/**
 * Triggered when the player is resized to a width in a different breakpoint category.
*/
exports.BREAKPOINT = 'breakpoint';
/**
 * Triggered when receiving a native 'fullscreenchange' event from a video tag
*/
exports.NATIVE_FULLSCREEN = 'fullscreenchange';
/**
 * Triggered when a new bandwidth estimate is available
 */
exports.BANDWIDTH_ESTIMATE = 'bandwidthEstimate';
/**
 * Triggered when the player starts/stops floating
 */
exports.FLOAT = 'float';
