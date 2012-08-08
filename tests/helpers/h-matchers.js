beforeEach(function() {

    this.addMatchers({

        // Compared to toEqual, ignore custom properties of arrays and regexes. Also avoids the ===
        // strict equality test in browsers that report typeof regexes as 'function'
        toBeEquiv: function(b) {
            var a = this.actual;
            var isA = jasmine.isA_;

            // Compare array values and the length property, ignoring any other properties
            if (isA('Array', a)) {
                if (!isA('Array', b)) {
                    return false;
                }
                if (a.length !== b.length) {
                    return false;
                }
                for (var i = 0; i < a.length; ++i) {
                    if (a[i] !== b[i]) {
                        return false;
                    }
                }
                return true;
            // Compare regex source and flags, ignoring any other properties
            // Ref: <https://github.com/pivotal/jasmine/pull/234>
            // Ref: <https://github.com/pivotal/jasmine/issues/259>
            } else if (isA('RegExp', a)) {
                return isA('RegExp', b) &&
                    a.source === b.source &&
                    a.global === b.global &&
                    a.ignoreCase === b.ignoreCase &&
                    a.multiline === b.multiline &&
                    a.sticky === b.sticky;
            }

            // Fallback
            return this.env.equals_(a, b);
        },

        // Ref: <https://github.com/pivotal/jasmine/pull/254>
        /*toBeNaN: function() {
            var a = this.actual;
            this.message = function() {
                return 'Expected ' + jasmine.pp(a) + (this.isNot ? ' not' : '') + ' to be NaN.';
            };
            return a !== a;
        },*/

        // Compared to the built-in toThrow, compare error types rather than error messages. Also
        // account for the RegExpError type used by old IE.
        // Ref: <https://github.com/pivotal/jasmine/issues/227>
        toThrow: function(expected) {
            var exception;

            if (typeof this.actual !== 'function') {
                throw new Error('Actual is not a function');
            }

            try {
                this.actual();
            } catch (e) {
                exception = e;
            }

            this.message = function() {
                if (exception) {
                    return 'Expected function' + (this.isNot ? ' not' : '') + ' to throw ' +
                        (expected ? expected.name : 'an exception') + ', but it threw ' +
                        (exception.name || exception);
                }
                return 'Expected function to throw an exception.';
            };

            if (exception) {
                return expected === jasmine.undefined ||
                    exception instanceof expected ||
                    // Old IE emulation triggers the nonstandard error type RegExpError on bad RegExp syntax
                    (typeof RegExpError === 'function' && exception instanceof RegExpError && expected === SyntaxError);
            }
            return false;
        }

    });

});
