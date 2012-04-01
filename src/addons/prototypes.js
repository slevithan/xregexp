/*!
 * XRegExp Prototype Methods v0.1.0-dev, 2012-04-01
 * (c) 2012 Steven Levithan <http://xregexp.com/>
 * MIT License
 */

/**
 * Adds a variety of methods to XRegExp.prototype, to be inherited by all XRegExp regexes. Regexes
 * copied by XRegExp also get XRegExp.prototype methods. Hence, the following work equivalently:
 *
 * XRegExp('[a-z]', 'ig').call(null, 'abc');
 * XRegExp(/[a-z]/ig).call(null, 'abc');
 * XRegExp.globalize(/[a-z]/i).call(null, 'abc');
 */
(function (XRegExp) {
    "use strict";

/**
 * Copy properties of `b` to `a`.
 * @private
 * @param {Object} a Object that will receive new properties.
 * @param {Object} b Object whose properties will be copied.
 * @returns {Object} Augmented `a` object.
 */
    function extend(a, b) {
        for (var p in b) {
            b.hasOwnProperty(p) && (a[p] = b[p]);
        }
        return a;
    }

    extend(XRegExp.prototype, {

/**
 * Calls an XRegExp object's `test` method with the first value in the provided arguments array.
 * @memberOf XRegExp.prototype
 * @param {*} context Ignored. Accepted only for congruity with `Function.prototype.apply`.
 * @param {Array} args Array with the string to search as its first value.
 * @returns {Boolean} Whether the regex matched the provided value.
 * @example
 *
 * XRegExp('[a-z]').apply(null, ['abc']); // -> true
 */
        apply: function (context, args) {
            return this.test(args[0]);
        },

/**
 * Calls an XRegExp object's `test` method with the provided string.
 * @memberOf XRegExp.prototype
 * @param {*} context Ignored. Accepted only for congruity with `Function.prototype.call`.
 * @param {String} str String to search.
 * @returns {Boolean} Whether the regex matched the provided value.
 * @example
 *
 * XRegExp('[a-z]').call(null, 'abc'); // -> true
 */
        call: function (context, str) {
            return this.test(str);
        },

/**
 * Alias of {@link #XRegExp.forEach}.
 * @memberOf XRegExp.prototype
 * @example
 *
 * XRegExp('\\d').forEach('1a2345', function (match, i) {
 *   if (i % 2) this.push(+match[0]);
 * }, []);
 * // -> [2, 4]
 */
        forEach: function (str, callback, context) {
            return XRegExp.forEach(str, this, callback, context);
        },

/**
 * Alias of {@link #XRegExp.globalize}.
 * @memberOf XRegExp.prototype
 * @example
 *
 * var globalCopy = XRegExp('regex').globalize();
 * globalCopy.global; // -> true
 */
        globalize: function () {
            return XRegExp.globalize(this);
        },

/**
 * Alias of {@link #XRegExp.exec}.
 * @memberOf XRegExp.prototype
 * @example
 *
 * var match = XRegExp('U\\+(?<hex>[0-9A-F]{4})').xexec('U+2620');
 * match.hex; // -> '2620'
 */
        xexec: function (str, pos, sticky) {
            return XRegExp.exec(str, this, pos, sticky);
        },

/**
 * Alias of {@link #XRegExp.replace}.
 * @memberOf XRegExp.prototype
 * @example
 *
 * var name = XRegExp('(?<first>\\w+) (?<last>\\w+)');
 * name.xreplace('John Smith', '${last}, ${first}');
 * // -> 'Smith, John'
 */
        xreplace: function (str, replacement, scope) {
            return XRegExp.replace(str, this, replacement, scope);
        },

/**
 * Alias of {@link #XRegExp.split}.
 * @memberOf XRegExp.prototype
 * @example
 *
 * XRegExp('(?i)([a-z]+)(\\d+)').xsplit('..word1..');
 * // -> ['..', 'word', '1', '..']
 */
        xsplit: function (str, limit) {
            return XRegExp.split(str, this, limit);
        }

    });

}(XRegExp));

