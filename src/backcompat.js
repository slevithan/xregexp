/*!
 * XRegExp BackCompat v1.0.0-beta
 * Copyright 2012 Steven Levithan <http://xregexp.com/>
 * Available under the MIT License
 */

/**
 * Provides backward compatibility with XRegExp v1.x.x
 */
(function (XRegExp) {
    "use strict";

// XRegExp v2.0.0 doesn't touch global objects/methods or allow syntax extensions by default
    XRegExp.install("natives methods extensibility");

// Renamed in XRegExp v2.0.0
    XRegExp.copyAsGlobal = XRegExp.globalize;

// Renamed in XRegExp v2.0.0
    XRegExp.execAt = XRegExp.exec;

// Renamed in XRegExp v2.0.0
    XRegExp.iterate = XRegExp.forEach;

// Removed in XRegExp v2.0.0. To make this permanent, `delete XRegExp.install` afterward
    XRegExp.freezeTokens = function () {
        XRegExp.uninstall("extensibility");
    };

// Renamed in XRegExp v1.5.0
    XRegExp.matchWithinChain = XRegExp.matchChain;

// Removed in XRegExp v1.5.0
    RegExp.prototype.addFlags = function (flags) {
        var regex = XRegExp(this.source, /\/([a-z]*)$/i.exec(String(this))[1] + (flags || "")),
            captureNames = this.xregexp ? this.xregexp.captureNames : null;
        regex.xregexp = {
            captureNames: captureNames ? captureNames.slice(0) : null,
            isNative: false // Always passed through `XRegExp`
        };
        return regex;
    };

// Removed in XRegExp v1.5.0
    RegExp.prototype.forEachExec = function (str, callback, context) {
        XRegExp.forEach(str, this, callback, context);
    };

// Removed in XRegExp v1.5.0
    RegExp.prototype.validate = function (str) {
        var regex = new RegExp("^(?:" + this.source + ")$(?!\\s)", /\/([a-z]*)$/i.exec(String(this))[1]);
        if (this.global) {
            this.lastIndex = 0;
        }
        return str.search(regex) === 0;
    };

// Removed in XRegExp v1.2.0
    RegExp.prototype.execAll = function (str) {
        return XRegExp.forEach(str, this, function (match) {
            this.push(match);
        }, []);
    };

}(XRegExp));

