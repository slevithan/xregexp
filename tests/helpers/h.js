if (typeof global === 'undefined') {
    global = window;
} else {
    global.XRegExp = require('../../xregexp-all');
}

// Ensure that all opt-in features are disabled when each spec starts
global.disableOptInFeatures = function() {
    XRegExp.uninstall('astral');
};

// Repeat a string the specified number of times
global.repeat = function(str, num) {
    return Array(num + 1).join(str);
};

// Property name used for extended regex instance data
global.REGEX_DATA = 'xregexp';

// Check for ES6 `u` flag support
global.hasNativeU = XRegExp._hasNativeFlag('u');
// Check for ES6 `y` flag support
global.hasNativeY = XRegExp._hasNativeFlag('y');
// Check for strict mode support
global.hasStrictMode = (function() {
    'use strict';

    return !this;
}());
