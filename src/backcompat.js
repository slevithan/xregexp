// XRegExp BackCompat 1.0
// (c) 2012 Steven Levithan
// MIT License
// <http://xregexp.com>
// Provides backward compatibility with XRegExp 1.x

;var XRegExp;

if (XRegExp) {
(function () {
    "use strict";

    // Renamed matchWithinChain in 1.5.0
    XRegExp.matchWithinChain = XRegExp.matchChain;

    // Removed addFlags in 1.5.0
    RegExp.prototype.addFlags = function (flags) {
        var x = this._xregexp;
        var regex = new XRegExp(this.source, /\/([a-z]*)$/.exec(this + "")[1] + (flags || ""));
        if (x) {
            regex._xregexp = {
                source: x.source,
                captureNames: x.captureNames ? x.captureNames.slice(0) : null
            };
        }
        return regex;
    };

    // Removed forEachExec in 1.5.0
    RegExp.prototype.forEachExec = function (str, callback, context) {
        XRegExp.forEach(str, this, callback, context);
    };

    // Removed validate in 1.5.0
    RegExp.prototype.validate = function (str) {
        var regex = new RegExp("^(?:" + this.source + ")$(?!\\s)", /\/([a-z]*)$/.exec(this + "")[1]);
        if (this.global)
            this.lastIndex = 0;
        return str.search(regex) === 0;
    };

    // Removed execAll in 1.2.0
    RegExp.prototype.execAll = function (str) {
        return XRegExp.forEach(str, this, function (match) {this.push(match);}, []);
    };

})();
}

