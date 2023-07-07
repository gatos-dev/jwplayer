"use strict";
exports.__esModule = true;
var css_1 = require("utils/css");
var dom_1 = require("utils/dom");
var environment_1 = require("environment/environment");
var Title = /** @class */ (function () {
    function Title(_model) {
        this.model = _model.player;
        this.truncated = _model.get('__ab_truncated') && !environment_1.Browser.ie;
    }
    // This is normally shown/hidden by states
    //   these are only used for when no title exists
    Title.prototype.hide = function () {
        (0, css_1.style)(this.el, { display: 'none' });
    };
    Title.prototype.show = function () {
        (0, css_1.style)(this.el, { display: '' });
    };
    Title.prototype.setup = function (titleEl) {
        this.el = titleEl;
        if (!this.el) {
            return;
        }
        // Perform the DOM search only once
        var arr = this.el.getElementsByTagName('div');
        this.title = arr[0];
        this.description = arr[1];
        if (this.truncated) {
            this.el.classList.add('jw-ab-truncated');
        }
        this.model.on('change:logoWidth', this.update, this);
        this.model.change('playlistItem', this.playlistItem, this);
    };
    Title.prototype.update = function (model) {
        var titleStyle = {};
        var logo = model.get('logo');
        if (logo) {
            // Only use Numeric or pixel ("Npx") margin values
            var margin = 1 * parseInt(('' + logo.margin).replace('px', ''));
            var padding = model.get('logoWidth') + (isNaN(margin) ? 0 : margin + 10);
            if (logo.position === 'top-left') {
                titleStyle.paddingLeft = padding;
            }
            else if (logo.position === 'top-right') {
                titleStyle.paddingRight = padding;
            }
        }
        (0, css_1.style)(this.el, titleStyle);
    };
    Title.prototype.playlistItem = function (model, item) {
        if (!item) {
            return;
        }
        if (model.get('displaytitle') || model.get('displaydescription')) {
            var title = '';
            var description = '';
            if (typeof item.title === 'string' && model.get('displaytitle')) {
                title = item.title;
            }
            if (typeof item.description === 'string' && model.get('displaydescription')) {
                description = item.description;
            }
            this.updateText(title, description);
        }
        else {
            this.hide();
        }
    };
    Title.prototype.updateText = function (title, description) {
        if (!this.title || !this.description) {
            return;
        }
        (0, dom_1.replaceInnerHtml)(this.title, (0, dom_1.HTMLSafeString)(title));
        (0, dom_1.replaceInnerHtml)(this.description, (0, dom_1.HTMLSafeString)(description));
        if (this.title.firstChild || this.description.firstChild) {
            this.show();
        }
        else {
            this.hide();
        }
    };
    Title.prototype.element = function () {
        return this.el;
    };
    return Title;
}());
exports["default"] = Title;
