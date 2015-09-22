/*!
 * XRegExp-All 3.0.0
 * <http://xregexp.com/>
 * Steven Levithan (c) 2012-2015 MIT License
 */

// Module systems magic dance. Don't use strict mode for this function, so it can assign to global.
;(function(root, definition) {
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
        root.XRegExp = definition();
    }
}(this, function() {
