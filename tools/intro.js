/*!
 * XRegExp All 2.1.0-rc
 * <http://xregexp.com/>
 * Steven Levithan © 2012 MIT License
 */

;(function (definition) {
    // Don't turn on strict mode for this function, so it can assign to global
    var self;

    // RequireJS
    if (typeof define === 'function') {
        define(definition);
    // CommonJS
    } else if (typeof exports === 'object') {
        self = definition();
        // Use Node.js's module.exports spec extension
        (typeof module === 'object' ? (module.exports = self) : exports).XRegExp = self;
    // <script>
    } else {
        // Create global
        XRegExp = definition();
    }
}(function () {
