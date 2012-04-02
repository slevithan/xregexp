/*!
 * XRegExp.build v0.1.0-rc, 2012-04-02
 * (c) 2012 Steven Levithan <http://xregexp.com/>
 * MIT License
 * Based on RegExp.create by Lea Verou <http://lea.verou.me/>
 */

(function (XRegExp) {
    "use strict";

    var data = null;

    XRegExp.install("extensibility");

/**
 * Builds complex regular expressions using named subpatterns, for readability and code reuse.
 * @memberOf XRegExp
 * @param {String} pattern XRegExp pattern using `{{..}}` for embedded subpatterns.
 * @param {Object} subs Named subpatterns as strings or regexes. If present, a leading ^ and
 *   trailing $ are stripped from subpatterns provided as regex objects.
 * @param {String} [flags] Any combination of XRegExp flags.
 * @returns {RegExp} Extended regular expression object.
 * @example
 *
 * var color = XRegExp.build("{{keyword}}|{{func}}|{{hex}}", {
 *   keyword: /^(?:red|tan|[a-z]{4,20})$/,
 *   func: XRegExp.build("^(?:rgb|hsl)a?\\((?:\\s*{{number}}%?\\s*,?\\s*){3,4}\\)$", {
 *     number: /^-?\d+(?:\.\d+)?$/
 *   }),
 *   hex: /^#(?:[0-9a-f]{1,2}){3}$/
 * });
 */
    XRegExp.build = function (pattern, subs, flags) {
        var p, regex;
        data = {};
        for (p in subs) {
            if (subs.hasOwnProperty(p)) {
                data[p] = XRegExp.isRegExp(subs[p]) ? subs[p].source.replace(/^\^|\$$/g, "") : subs[p];
            }
        }
        try {
            regex = XRegExp(pattern, flags);
        } catch (err) {
            throw err;
        } finally {
            data = null; // Reset
        }
        return regex;
    };

    XRegExp.addToken(
        /{{([\w$]+)}}/,
        function (match) {
            if (!data.hasOwnProperty(match[1])) {
                throw new ReferenceError("unknown property: " + match[1]);
            }
            return "(?:" + data[match[1]] + ")";
        },
        {
            trigger: function () {
                return !!data;
            },
            scope: "all"
        }
    );

}(XRegExp));

