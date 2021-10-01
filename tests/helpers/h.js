if (typeof global === 'undefined') {
    global = window;
} else {
    global.XRegExp = require('../../xregexp-all');
}

// Ensure that all features are reset to default when each spec starts
global.resetFeatures = function() {
    XRegExp.uninstall('astral');
    XRegExp.install('namespacing');
};

// Property name used for extended regex instance data
global.REGEX_DATA = 'xregexp';

// Check for ES2021 `d` flag support
global.hasNativeD = XRegExp._hasNativeFlag('d');
// Check for ES2018 `s` flag support
global.hasNativeS = XRegExp._hasNativeFlag('s');
// Check for ES6 `u` flag support
global.hasNativeU = XRegExp._hasNativeFlag('u');
// Check for ES6 `y` flag support
global.hasNativeY = XRegExp._hasNativeFlag('y');
// Check for strict mode support
global.hasStrictMode = (function() {
    'use strict';

    return !this;
}());

// Naive polyfill of String.prototype.repeat
if (!String.prototype.repeat) {
    String.prototype.repeat = function(count) {
        return count ? Array(count + 1).join(this) : '';
    };
}
