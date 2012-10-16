/*!
 * XRegExp-All 3.0.0-pre
 * <http://xregexp.com/>
 * Steven Levithan © 2012 MIT License
 */

// Module systems magic dance
;(function(definition) {
    // Don't turn on strict mode for this function, so it can assign to global
    var self;

    // RequireJS
    if (typeof define === 'function') {
        define(definition);
    // CommonJS
    } else if (typeof exports === 'object') {
        self = definition();
        // Use Node.js's `module.exports`. This supports both `require('xregexp')` and
        // `require('xregexp').XRegExp`
        (typeof module === 'object' ? (module.exports = self) : exports).XRegExp = self;
    // <script>
    } else {
        // Create global
        XRegExp = definition();
    }
}(function() {
