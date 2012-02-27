// Backward compatibility for XRegExp 1.0-1.2
// (c) 2010-2012 Steven Levithan
// MIT License
// <http://xregexp.com>

var XRegExp;

if (XRegExp) {
(function () {

    // Renamed matchWithinChain in 1.5.0
    XRegExp.matchWithinChain = XRegExp.matchChain;

    // Removed addFlags in 1.5.0
    RegExp.prototype.addFlags = function (flags) {
        var x = this._xregexp;
        var regex = XRegExp(this.source, /\/([a-z]*)$/.exec(this + "")[1] + (flags || ""));
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
        return XRegExp.iterate(str, this, callback, context);
    };

    // Removed validate in 1.5.0
    RegExp.prototype.validate = function (str) {
        var regex = RegExp("^(?:" + this.source + ")$(?!\\s)", /\/([a-z]*)$/.exec(this + "")[1]);
        if (this.global)
            this.lastIndex = 0;
        return str.search(regex) === 0;
    };

    // Removed execAll in 1.2.0
    RegExp.prototype.execAll = function (str) {
        var result = [];
        XRegExp.iterate(str, this, function (match) {result.push(match);});
        return result;
    };

})();
}

