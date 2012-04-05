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
 * @returns {String} Source of the regex, with edge anchors removed.
 */
    function deanchor(regex) {
        // Strip a leading `^` or `(?:)^`. The latter handles /x or (?#) cruft
        var pattern = regex.source.replace(/^(?:\(\?:\))?\^/, "");
        // Strip a trailing `$` or `$(?:)`, if it's not escaped (allow trailing `\$`)
        if (/\$$/.test(pattern.replace(/\\[\s\S]/g, ""))) {
            return pattern.replace(/\$(?:\(\?:\))?$/, "");
        }
        return pattern;
    }

/**
 * Builds regular expressions using named subpatterns, for readability and code reuse.
 * @memberOf XRegExp
 * @param {String} pattern XRegExp pattern using `{{..}}` for embedded subpatterns.
 * @param {Object} subs Named subpatterns as strings or regexes. If present, a leading ^ and
 *   trailing $ are stripped from subpatterns provided as regex objects.
 * @param {String} [flags] Any combination of XRegExp flags.
 * @returns {RegExp} Extended regular expression object.
 * @example
 *
 * var color = XRegExp.build('{{keyword}}|{{func}}|{{hex}}', {
 *   keyword: /red|tan|[a-z]{4,20}/,
 *   func: XRegExp.build('(?n)(rgb|hsl)a?\\((\\s*{{number}}%?\\s*,?\\s*){3,4}\\)', {
 *     number: /-?\d+(?:\.\d+)?/
 *   }),
 *   hex: /#(?:[0-9A-Fa-f]{1,2}){3}/
 * });
 */
    XRegExp.build = function (pattern, subs, flags) {
        var regex, p;
        data = {};
        try {
            for (p in subs) {
                if (subs.hasOwnProperty(p)) {
                    if (XRegExp.isRegExp(subs[p])) {
                        data[p] = deanchor(subs[p]);
                    } else {
                        // Passing through XRegExp ensures independent validity, lest a trailing
                        // unescaped `\` breaks the `(?:)` wrapper in edge cases
                        XRegExp(subs[p]);
                        data[p] = subs[p];
                    }
                }
            }
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
 * Only enabled for regexes created by XRegExp.build.
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

