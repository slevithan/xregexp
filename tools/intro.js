/*!
 * XRegExp All 2.1.0-rc
 * <http://xregexp.com/>
 * Steven Levithan © 2012 MIT License
 */

;(function (definition) {
    // Don't turn on strict mode for this function, so we can assign to global.XRegExp

    // RequireJS
    if (typeof define === 'function') {
        define(definition);
    // CommonJS
    } else if (typeof exports === 'object') {
        exports.XRegExp = definition();
    // <script>
    } else {
        // Create global
        XRegExp = definition();
    }
}(function () {
