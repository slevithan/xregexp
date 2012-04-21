/*!
 * XRegExp.build v0.1.0-rc-2, 2012-04-21
 * (c) 2012 Steven Levithan <http://xregexp.com/>
 * MIT License
 * Based on RegExp.create by Lea Verou <http://lea.verou.me/>
 */

(function (XRegExp) {
    "use strict";

    var data = null;

/**
 * Strips a leading ^ and trailing $ anchor, if present.
 * @private
 * @param {String} pattern Pattern to process.
 * @returns {String} Pattern with edge anchors removed.
 */
    function deanchor(pattern) {
        var end$ = /\$(?:\(\?:\))?$/;
        // Strip a leading `^` or `(?:)^`. The latter handles /x or (?#) cruft
        pattern = pattern.replace(/^(?:\(\?:\))?\^/, "");
        // Strip a trailing unescaped `$` or `$(?:)`
        if (end$.test(pattern.replace(/\\[\s\S]/g, ""))) {
            return pattern.replace(end$, "");
        }
        return pattern;
    }

/**
 * Throw an error if the provided pattern includes backreferences.
 * @private
 * @param {String} pattern Pattern to check for backreferences.
 */
    function banBackrefs(pattern) {
        // Disallow backrefs, since they wouldn't be independent to subpatterns or the outer regex
        if (/\\[1-9]/.test(pattern.replace(/\\[0\D]|\[(?:[^\\\]]|\\[\s\S])*]/g, ""))) {
            throw new SyntaxError("can't use backreferences with XRegExp.build");
        }
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
 * XRegExp.build('(?i)\\b{{month}}{{separator}}{{year}}\\b', {
 *   month: XRegExp.build('{{monthAbbr}}|{{monthName}}', {
 *     monthAbbr: /Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/,
 *     monthName: /January|February|March|April|May|June|July|August|September|October|November|December/
 *   }),
 *   separator: /,? /,
 *   year: /\d{4}/
 * });
 */
    XRegExp.build = function (pattern, subs, flags) {
        var regex, p;
        data = {};
        try {
            for (p in subs) {
                if (subs.hasOwnProperty(p)) {
                    if (XRegExp.isRegExp(subs[p])) {
                        // Deanchoring allows embedding independently useful anchored regexes
                        data[p] = deanchor(subs[p].source);
                    } else {
                        // Passing to XRegExp enables entended syntax and also ensures independent
                        // validity, lest an unescaped `(`, `)`, `[`, or trailing `\` breaks the
                        // `(?:)` wrapper
                        data[p] = XRegExp(subs[p]).source;
                        // Because of how this is set up, the `{{..}}` syntax is active in
                        // subpatterns provided as strings; thus throws an "undefined property"
                        // error. This is good, but may be unexpected
                    }
                    banBackrefs(data[p]);
                }
            }
            regex = XRegExp(pattern, flags);
            banBackrefs(regex.source);
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
                throw new ReferenceError("undefined property " + match[0]);
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

