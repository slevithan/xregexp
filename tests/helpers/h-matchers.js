beforeEach(function() {
    jasmine.addMatchers({
        // Similar to toEqual with arrays, but ignores custom properties of arrays. Useful when
        // comparing regex matches with array literals.
        toEqualMatch: function() {
            return {
                compare: function(actual, expected) {
                    var isA = jasmine.isA_;
                    var result = {};

                    if (isA('Array', actual)) {
                        if (!isA('Array', expected) || actual.length !== expected.length) {
                            result.pass = false;
                        } else {
                            for (var i = 0; i < actual.length; ++i) {
                                if (actual[i] !== expected[i]) {
                                    result.pass = false;
                                }
                            }
                            if (result.pass === undefined) {
                                result.pass = true;
                            }
                        }
                    } else {
                        result.pass = false;
                    }

                    return result;
                }
            };
        }
    });
});
