/*!
 * XRegExp BackCompat v1.0.0-dev
 * Copyright 2012 Steven Levithan <http://xregexp.com/>
 * Available under the MIT License
 * Provides backward compatibility with XRegExp 1.x
 */

;(function () {
    "use strict";

    // XRegExp v2.0.0 no longer automatically overrides natives, extends
    // RegExp.prototype, or allows syntax extensions
    XRegExp.install("natives methods extensibility");

    // renamed in XRegExp v2.0.0
    XRegExp.copyAsGlobal = XRegExp.globalize;

    // renamed in XRegExp v2.0.0
    XRegExp.execAt = XRegExp.exec;

    // renamed in XRegExp v2.0.0
    XRegExp.iterate = XRegExp.forEach;

    // removed in XRegExp v2.0.0. If you want this functionality to be
    // permanent, `delete XRegExp.install` afterward
    XRegExp.freezeTokens = function () {
        XRegExp.uninstall("extensibility");
    };

    // renamed in XRegExp v1.5.0
    XRegExp.matchWithinChain = XRegExp.matchChain;

    // removed in XRegExp v1.5.0
    RegExp.prototype.addFlags = function (flags) {
        var regex = new XRegExp(this.source, /\/([a-z]*)$/i.exec(this + "")[1] + (flags || "")),
            x = this._xregexp;
        if (x) {
            regex._xregexp = {
                source: x.source,
                captureNames: x.captureNames ? x.captureNames.slice(0) : null
            };
        }
        return regex;
    };

    // removed in XRegExp v1.5.0
    RegExp.prototype.forEachExec = function (str, callback, context) {
        XRegExp.forEach(str, this, callback, context);
    };

    // removed in XRegExp v1.5.0
    RegExp.prototype.validate = function (str) {
        var regex = new RegExp("^(?:" + this.source + ")$(?!\\s)", /\/([a-z]*)$/i.exec(this + "")[1]);
        if (this.global)
            this.lastIndex = 0;
        return str.search(regex) === 0;
    };

    // removed in XRegExp v1.2.0
    RegExp.prototype.execAll = function (str) {
        return XRegExp.forEach(str, this, function (match) {this.push(match);}, []);
    };

}());

