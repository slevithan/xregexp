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
    RegExp.prototype.addFlags = function (s) {
        return clone(this, s);
    };

    // Removed forEachExec in 1.5.0
    RegExp.prototype.forEachExec = function (s, f, c) {
        return XRegExp.iterate(s, this, f, c);
    };

    // Removed validate in 1.5.0
    RegExp.prototype.validate = function (s) {
        var r = RegExp("^(?:" + this.source + ")$(?!\\s)", /\/([a-z]*)$/.exec(this + "")[1]);
        if (this.global)
            this.lastIndex = 0;
        return s.search(r) === 0;
    };

    // Removed execAll in 1.2.0
    RegExp.prototype.execAll = function (s) {
        var r = [];
        XRegExp.iterate(s, this, function (m) {r.push(m);});
        return r;
    };

})();
}

