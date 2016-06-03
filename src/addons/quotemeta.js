/*!
 * XRegExp Quote Meta 4.0
 * <xregexp.com>
 * Everlaw (c) 2016 MIT License
 */

module.exports = function(XRegExp) {
    'use strict';

    /**
     * Adds support for \Q..\E escape sequences, used in Java and Perl regular expressions. All
     * intervening characters are interpreted as literals instead of special regex characters.
     *
     * @requires XRegExp
     */

    XRegExp.addToken(
        // Non-greedy matching is important for patterns that have multiple escaped sequences.
        /\\Q((?!\\E).*?)\\E/,
        function(match) {
            return XRegExp.escape(match[1]);
        },
        {
            scope: 'all',
            leadChar: '\\'
        }
    );

};
