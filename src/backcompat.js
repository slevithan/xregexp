/*!
 * XRegExp BackCompat v1.0.0-beta, 2012-03-31
 * (c) 2012 Steven Levithan <http://xregexp.com/>
 * MIT License
 */

/**
 * Provides backward compatibility with XRegExp v1.x.x
 */
(function (XRegExp) {
    "use strict";

/**
 * XRegExp v2.0.0 doesn't touch global objects/methods or allow syntax extensions by default. This
 * brings back the previous functionality.
 */
    XRegExp.install("natives methods extensibility");

/**
 * @deprecated As of XRegExp v2.0.0. Replaced by {@link #globalize}.
 */
    XRegExp.copyAsGlobal = XRegExp.globalize;

/**
 * @deprecated As of XRegExp v2.0.0. Replaced by {@link #exec}.
 */
    XRegExp.execAt = XRegExp.exec;

/**
 * @deprecated As of XRegExp v2.0.0. Replaced by {@link #forEach}.
 */
    XRegExp.iterate = XRegExp.forEach;

/**
 * @deprecated As of XRegExp v2.0.0. No relacement. To make this permanent,
 *   `delete XRegExp.install` afterward.
 */
    XRegExp.freezeTokens = function () {
        XRegExp.uninstall("extensibility");
    };

/**
 * @deprecated As of XRegExp v1.5.0. Replaced by {@link #matchChain}.
 */
    XRegExp.matchWithinChain = XRegExp.matchChain;

/**
 * @deprecated As of XRegExp v1.5.0. No replacement.
 */
    RegExp.prototype.addFlags = function (flags) {
        var regex = XRegExp(this.source, /\/([a-z]*)$/i.exec(String(this))[1] + (flags || "")),
            captureNames = this.xregexp ? this.xregexp.captureNames : null;
        regex.xregexp = {
            captureNames: captureNames ? captureNames.slice(0) : null,
            isNative: false // Always passed through `XRegExp`
        };
        return regex;
    };

/**
 * @deprecated As of XRegExp v1.5.0. No replacement.
 */
    RegExp.prototype.forEachExec = function (str, callback, context) {
        XRegExp.forEach(str, this, callback, context);
    };

/**
 * @deprecated As of XRegExp v1.5.0. No replacement.
 */
    RegExp.prototype.validate = function (str) {
        var regex = new RegExp("^(?:" + this.source + ")$(?!\\s)", /\/([a-z]*)$/i.exec(String(this))[1]);
        if (this.global) {
            this.lastIndex = 0;
        }
        return str.search(regex) === 0;
    };

/**
 * @deprecated As of XRegExp v1.2.0. No replacement.
 */
    RegExp.prototype.execAll = function (str) {
        return XRegExp.forEach(str, this, function (match) {
            this.push(match);
        }, []);
    };

}(XRegExp));

