/*!
 * XRegExp.build v0.1.0-rc, 2012-04-04
 * (c) 2012 Steven Levithan <http://xregexp.com/>
 * MIT License
 * Based on RegExp.create by Lea Verou <http://lea.verou.me/>
 */

(function (XRegExp) {
    "use strict";

    var data = null;

/**
 * Strips a regex's leading ^ and trailing $ anchors, if present.
 * @private
 * @param {RegExp} regex Regex to process.
 * @returns {String} Source of the regex, with leading and trailing anchors removed.
 */
    function deanchor(regex) {
        // Also strips `(?:)` before ^ and after $, in case they were included by an addon like /x
        return regex.source.replace(/^(?:\(\?:\))?\^|\$(?:\(\?:\))?$/g, "");
    }

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
                data[p] = XRegExp.isRegExp(subs[p]) ? deanchor(subs[p]) : subs[p];
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

    XRegExp.install("extensibility");

/* Adds named subpattern syntax to XRegExp: {{..}}
 * Only enabled for regexes created using XRegExp.build.
 */
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

/*
 * Known issues:
 * - A trailing unescaped backslash in provided subpatterns should be an error but isn't in the
 *   following edge case (that would otherwise itself be an error):
 *   `XRegExp.build('{{n}})', {n: '\\'})`. Note the pattern's trailing parenthesis. This works
 *   because subpatterns are encased in `(?:)`, so the example becomes `(?:\))`.
 * - Trailing escaped `\$` (to match a literal `$`) in subpatterns provided as RegExp objects
 *   should not be stripped. But they are, and an error is thrown due to the trailing unescaped
 *   backslash. Workaround: Provide the subpattern as a string. `'...\\$'`.
 */

