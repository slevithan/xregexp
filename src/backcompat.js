/*!
 * XRegExp BackCompat v1.0.0-dev
 * Copyright 2012 Steven Levithan <http://xregexp.com/>
 * Available under the MIT License
 * Provides backward compatibility with XRegExp 1.x
 */

;(function () {
    "use strict";

    // overriding natives, adding RegExp.prototype methods, and allowing syntax extensions became
    // optional features in XRegExp v1.6.0
    XRegExp.install("natives methods extensibility");

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

