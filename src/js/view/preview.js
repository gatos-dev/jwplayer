"use strict";
exports.__esModule = true;
var css_1 = require("utils/css");
var Preview = /** @class */ (function () {
    function Preview(_model) {
        this.model = _model;
        this.image = null;
    }
    Preview.prototype.setup = function (el) {
        this.el = el;
        this.hasZoomThumbnail = this.model.get('_abZoomThumbnail');
        if (this.hasZoomThumbnail) {
            this.zoomOriginX = Math.ceil(Math.random() * 100) + '%';
            this.zoomOriginY = Math.ceil(Math.random() * 100) + '%';
            this.model.on('change:viewable', this.pauseZoomThumbnail, this);
            this.model.on('change:isFloating', this.enableZoomThumbnail, this);
        }
    };
    Preview.prototype.setImage = function (img) {
        // Remove onload function from previous image
        var image = this.image;
        if (image) {
            image.onload = null;
        }
        this.image = null;
        var backgroundImage = '';
        if (typeof img === 'string') {
            backgroundImage = 'url("' + img + '")';
            image = this.image = new Image();
            image.src = img;
        }
        if (this.hasZoomThumbnail) {
            this.imageEl = document.createElement('div');
            (0, css_1.style)(this.imageEl, {
                backgroundImage: backgroundImage
            });
            if (this.el) {
                this.el.appendChild(this.imageEl);
            }
            this.enableZoomThumbnail();
        }
        else {
            (0, css_1.style)(this.el, {
                backgroundImage: backgroundImage
            });
        }
    };
    Preview.prototype.enableZoomThumbnail = function () {
        var _this = this;
        if (!this.hasZoomThumbnail || this.model.get('isFloating')) {
            return;
        }
        clearTimeout(this.zoomThumbnailTimeout);
        this.zoomThumbnailTimeout = window.setTimeout(function () {
            if (_this.imageEl) {
                _this.imageEl.classList.add('jw-ab-zoom-thumbnail');
                _this.imageEl.style.transformOrigin = _this.zoomOriginX + ' ' + _this.zoomOriginY;
            }
        }, 2000);
    };
    Preview.prototype.pauseZoomThumbnail = function () {
        clearTimeout(this.zoomThumbnailTimeout);
        if (this.imageEl) {
            this.imageEl.style.animationPlayState = this.model.get('viewable') ? 'running' : 'paused';
        }
    };
    Preview.prototype.removeZoomThumbnail = function () {
        clearTimeout(this.zoomThumbnailTimeout);
        if (this.imageEl) {
            this.imageEl.classList.remove('jw-ab-zoom-thumbnail');
        }
    };
    Preview.prototype.resize = function (width, height, stretching) {
        var _this = this;
        if (stretching === 'uniform') {
            if (width) {
                this.playerAspectRatio = width / height;
            }
            if (!this.playerAspectRatio ||
                !this.image ||
                !validState(this.model.get('state'))) {
                return;
            }
            // snap image to edges when the difference in aspect ratio is less than 9%
            var image = this.image;
            var backgroundSize = null;
            if (image) {
                if (image.width === 0) {
                    image.onload = function () {
                        _this.resize(width, height, stretching);
                    };
                    return;
                }
                var imageAspectRatio = image.width / image.height;
                if (Math.abs(this.playerAspectRatio - imageAspectRatio) < 0.09) {
                    backgroundSize = 'cover';
                }
            }
            (0, css_1.style)(this.el, {
                backgroundSize: backgroundSize
            });
        }
    };
    Preview.prototype.element = function () {
        return this.el;
    };
    Preview.prototype.destroy = function () {
        if (this.hasZoomThumbnail) {
            this.removeZoomThumbnail();
            this.model.off(null, null, this);
        }
    };
    return Preview;
}());
function validState(state) {
    return state === 'complete' || state === 'idle' || state === 'error' || state === 'buffering';
}
exports["default"] = Preview;
