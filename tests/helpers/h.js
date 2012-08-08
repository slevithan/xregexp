// Ensure that all opt-in features are disabled when each spec starts
beforeEach(function() {
    XRegExp.uninstall('natives astral');
});

// Repeat a string the specified number of times
function repeat(str, num) {
    return Array(num + 1).join(str);
}

// Property name used for extended regex instance data
var REGEX_DATA = 'xregexp';

// Check for flag y support
var hasNativeY = RegExp.prototype.sticky !== undefined;

// Check for strict mode support
var hasStrictMode = (function() {'use strict'; return !this;}());

// Add the complete ES5 Array.prototype.forEach shim from <https://github.com/kriskowal/es5-shim>.
// Commented out the `if (i in self)` sparse array check because it causes this to skip keys with
// explicit undefined in IE < 9.
(function() {
    function _toString(obj) {
        return Object.prototype.toString.call(obj);
    }
    var prepareString = "a"[0] != "a";
        // ES5 9.9
        // http://es5.github.com/#x9.9
    var toObject = function (o) {
        if (o == null) { // this matches both null and undefined
            throw new TypeError("can't convert "+o+" to object");
        }
        // If the implementation doesn't support by-index access of
        // string characters (ex. IE < 9), split the string
        if (prepareString && typeof o == "string" && o) {
            return o.split("");
        }
        return Object(o);
    };
    // ES5 15.4.4.18
    // http://es5.github.com/#x15.4.4.18
    // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/array/forEach
    if (!Array.prototype.forEach) {
        Array.prototype.forEach = function forEach(fun /*, thisp*/) {
            var self = toObject(this),
                thisp = arguments[1],
                i = -1,
                length = self.length >>> 0;

            // If no callback function or if callback is not a callable function
            if (_toString(fun) != "[object Function]") {
                throw new TypeError(); // TODO message
            }

            while (++i < length) {
                //if (i in self) {
                    // Invoke the callback function with call, passing arguments:
                    // context, property value, property key, thisArg object context
                    fun.call(thisp, self[i], i, self);
                //}
            }
        };
    }
}());
