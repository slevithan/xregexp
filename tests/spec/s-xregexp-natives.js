describe('When overridden, RegExp.prototype.exec()', function() {

    beforeEach(function() {
        XRegExp.install('natives');
    });

    // This is broken in old Firefox (tested in v2.0; it works in v8+), but not for any fault of
    // XRegExp. Uncomment this test if future XRegExp fixes it for old Firefox.
    /*it('should type convert an undefined argument to a string', function() {
        expect(/undefined/.exec()).toBeEquiv(['undefined']);
    });*/

    /*
     * NOTE: These specs should mirror those for RegExp.prototype.test, nonglobal
     * String.prototype.match, XRegExp.exec, and XRegExp.test as closely as possible.
     */

    // TODO: Copy/update specs from XRegExp.exec here

    /*
     * The following specs:
     * - Have no corresponding specs for XRegExp.exec and XRegExp.test.
     * - Are mirrored by RegExp.prototype.test and nonglobal String.prototype.match.
     */

    it('should ignore lastIndex and set the search start position at 0 for a nonglobal regex', function() {
        var regex = /x/;

        regex.lastIndex = 4;
        expect(regex.exec('123x5')).toBeEquiv(['x']);
    });

    /*
     * The following specs:
     * - Have no corresponding specs for XRegExp.exec, XRegExp.test, and nonglobal
     *   String.prototype.match.
     * - Are mirrored by RegExp.prototype.test.
     */

    it('should use lastIndex to set the search start position for a global regex', function() {
        var regex = /x/g;

        regex.lastIndex = 4;
        expect(regex.exec('123x5')).toBe(null);

        regex.lastIndex = 2;
        expect(regex.exec('123x5')).toBeEquiv(['x']);
    });

    it('should type convert lastIndex when setting the search start position', function() {
        var regex = /x/g;

        regex.lastIndex = '3';
        expect(regex.exec('123x5')).toBeEquiv(['x']);

        regex.lastIndex = '4';
        expect(regex.exec('123x5')).toBe(null);
    });

    /*
     * The following specs:
     * - Have no corresponding specs for RegExp.prototype.test and XRegExp.test.
     * - Are mirrored by XRegExp.exec and nonglobal String.prototype.match.
     */

    describe('provides extensions:', function() {

        // TODO: Copy/update named capture specs from XRegExp.exec here

        it('', function() {

        });

    });

});

describe('When overridden, RegExp.prototype.test()', function() {

    beforeEach(function() {
        XRegExp.install('natives');
    });

    /*
     * NOTE: These specs should mirror those for RegExp.prototype.exec, nonglobal
     * String.prototype.match, XRegExp.test, and XRegExp.exec as closely as possible.
     */

    // TODO: Copy/update specs from XRegExp.test here

    /*
     * The following specs:
     * - Have no corresponding specs for XRegExp.test and XRegExp.exec.
     * - Are mirrored by RegExp.prototype.exec and nonglobal String.prototype.match.
     */

    it('should ignore lastIndex and set the search start position at 0 for a nonglobal regex', function() {
        var regex = /x/;

        regex.lastIndex = 4;
        expect(regex.test('123x5')).toBe(true);
    });

    /*
     * The following specs:
     * - Have no corresponding specs for XRegExp.test, XRegExp.exec, and nonglobal
     *   String.prototype.match.
     * - Are mirrored by RegExp.prototype.exec.
     */

    it('should use lastIndex to set the search start position for a global regex', function() {
        var regex = /x/g;

        regex.lastIndex = 4;
        expect(regex.test('123x5')).toBe(false);

        regex.lastIndex = 2;
        expect(regex.test('123x5')).toBe(true);
    });

    it('should type convert lastIndex when setting the search start position', function() {
        var regex = /x/g;

        regex.lastIndex = '3';
        expect(regex.test('123x5')).toBe(true);

        regex.lastIndex = '4';
        expect(regex.test('123x5')).toBe(false);
    });

    // NOTE: The fixed RegExp.prototype.test does not provide any extensions to native handling

});

describe('When overridden, String.prototype.match()', function() {

    beforeEach(function() {
        XRegExp.install('natives');
    });

    describe('with a global regex', function() {

        it('should return an array with all matches', function() {
            expect('a bc'.match(/(\w)/g)).toBeEquiv(['a', 'b', 'c']);
        });

        it('should return null if no match is found', function() {
            expect('a bc'.match(/x/g)).toBe(null);
        });

        it('should reset lastIndex to 0 when a match is found', function() {
            var regex = /x/g;
            regex.lastIndex = 1;
            '123x5'.match(regex);

            expect(regex.lastIndex).toBe(0);
        });

        it('should reset lastIndex to 0 when no match is found', function() {
            var regex = /x/g;
            regex.lastIndex = 1;
            '123'.match(regex);

            expect(regex.lastIndex).toBe(0);
        });

        it('should start the search at the beginning of the string, ignoring lastIndex', function() {
            var regex = /x/g;
            regex.lastIndex = 4;

            expect('123x5'.match(regex)).toBeTruthy();
        });

        it('should convert any nonstring context to a string (except null and undefined)', function() {
            expect(String.prototype.match.call(11, /1/g)).toBeEquiv(['1', '1']);
        });

        it('should throw an exception when called on null or undefined context, if strict mode is supported', function() {
            [null, undefined].forEach(function(value) {
                // This doesn't work the same when strict mode isn't supported, because the match
                // method will be called with the global object (window) as its context, rather
                // than null or undefined
                if (hasStrictMode) {
                    expect(function() {String.prototype.match.call(value, /x/g);}).toThrow(TypeError);
                } else {
                    // Keep the assertion count consistent cross-browser
                    expect(hasStrictMode).toBe(false);
                }
            });
        });

    });

    describe('with a nonglobal regex', function() {

        /*
         * NOTE: These specs should mirror those for RegExp.prototype.exec, RegExp.prototype.test,
         * XRegExp.exec, and XRegExp.test as closely as possible.
         */

        // TODO: Copy/update specs from RegExp.prototype.exec here

        /*
         * The following specs:
         * - Have no corresponding specs for RegExp.prototype.exec, RegExp.prototype.test,
         *   XRegExp.test, and XRegExp.exec.
         */

        it('should convert any provided non RegExp object to a RegExp', function() {
            // These don't error because, per the spec, the values are passed through new RegExp()
            // before being used as the context object for the (fixed) RegExp.prototype.exec
            var tests = [
                {str: '12', regex: '^(1)', result: ['1', '1']},
                // This would throw if the string was converted to an XRegExp rather than RegExp
                {str: '\x01', regex: '\\1', result: ['\x01']},
                // The converted value '[object Object]' creates a character class
                {str: '[obj]', regex: {}, result: ['o']},
                {str: 'null', regex: null, result: ['null']}
            ];

            tests.forEach(function(test) {
                expect(test.str.match(test.regex)).toBeEquiv(test.result);
            });

            // The native RegExp with an explicit undefined pattern incorrectly creates /undefined/
            // in Firefox 3 and 3.6 (but not v4)
            //expect('undefined'.match()).toBeEquiv(['']);
            //expect('undefined'.match(undefined)).toBeEquiv(['']);
        });

        it('should throw an exception when called on null or undefined context, if strict mode is supported', function() {
            [null, undefined].forEach(function(value) {
                // This doesn't work the same when strict mode isn't supported, because the match
                // method will be called with the global object (window) as its context, rather
                // than null or undefined
                if (hasStrictMode) {
                    expect(function() {String.prototype.match.call(value, /x/);}).toThrow(TypeError);
                } else {
                    // Keep the assertion count consistent cross-browser
                    expect(hasStrictMode).toBe(false);
                }
            });
        });

        /*
         * The following specs:
         * - Have no corresponding specs for RegExp.prototype.test and XRegExp.test.
         * - Are mirrored by RegExp.prototype.exec and XRegExp.exec.
         */

        describe('provides extensions:', function() {

            // TODO: Copy/update specs from RegExp.prototype.exec here

            it('', function() {

            });

        });

    });

});

describe('When overridden, String.prototype.replace()', function() {

    beforeEach(function() {
        XRegExp.install('natives');
    });

    /*
     * NOTE: These specs should mirror those for XRegExp.replace as closely as possible.
     */

    it('should replace the first match only when given a nonglobal regex', function() {
        expect('aaa'.replace(/a/, 'b')).toBe('baa');
    });

    it('should replace all matches when given a global regex', function() {
        expect('aaa'.replace(/a/g, 'b')).toBe('bbb');
    });

    it('should replace the first match only when given a string as the search pattern', function() {
        expect('aaa'.replace('a', 'b')).toBe('baa');
    });

    it('should not type convert a string search pattern to a regex', function() {
        expect('aaa'.replace('a(a)', 'b')).toBe('aaa');
        expect('a(a)a'.replace('a(a)', 'b')).toBe('ba');
    });

    it('should handle single-digit backreference $1 in the replacement string', function() {
        expect('aaa'.replace(/a(a)/, '$1b')).toBe('aba');

        // Backreference to a nonparticipating capturing group
        expect('test'.replace(/t|(e)/g, '$1')).toBe('es');
    });

    it('should handle double-digit backreferences $01, $10, and $99 in the replacement string', function() {
        expect('aaa'.replace(/a(a)/, '$01b')).toBe('aba');
        expect('aaa'.replace(new RegExp('a' + repeat('()', 9) + '(a)'), '$10b')).toBe('aba');
        expect('aaa'.replace(new RegExp('a' + repeat('()', 98) + '(a)'), '$99b')).toBe('aba');
    });

    it('should end backreferences in the replacement string after two digits', function() {
        expect('aaa'.replace(new RegExp('a' + repeat('()', 99) + '(a)'), '$100b')).toBe('0ba');
    });

    // NOTE: IE < 9 incorrectly treats all occurrences of $ as literal text when performing a
    // replacement based on a search value that is not a regex. XRegExp restores the special
    // meaning of $$, $&, etc. for all replacements.

    it('should handle backreference $& in the replacement string', function() {
        expect('aaa'.replace(/aa/, '$&b')).toBe('aaba');
        expect('aaa'.replace('aa', '$&b')).toBe('aaba');
    });

    it("should handle right context token $' in the replacement string", function() {
        expect('aaa'.replace(/aa/, "$'b")).toBe('aba');
        expect('aaa'.replace('aa', "$'b")).toBe('aba');
    });

    it('should handle left context token $` in the replacement string', function() {
        expect('xaaa'.replace(/aa/, '$`b')).toBe('xxba');
        expect('xaaa'.replace('aa', '$`b')).toBe('xxba');
    });

    it('should handle token $$ in the replacement string', function() {
        expect('aaa'.replace(/aa/, '$$b')).toBe('$ba');
        expect('aaa'.replace('aa', '$$b')).toBe('$ba');
    });

    it('should allow a function to generate the replacement', function() {
        expect('aaa'.replace(/a/, function() {return 'b';})).toBe('baa');
        expect('aaa'.replace(/a/g, function() {return 'b';})).toBe('bbb');
        expect('aaa'.replace('a', function() {return 'b';})).toBe('baa');
    });

    it('should allow using backreferences with replacement functions', function() {
        expect('aaa'.replace(/aa/, function($0) {return $0 + 'b';})).toBe('aaba');
        expect('aaa'.replace(/a(a)/, function($0, $1) {return $1 + 'b';})).toBe('aba');
        expect('aaa'.replace('aa', function($0) {return $0 + 'b';})).toBe('aaba');
    });

    // Firefox (last tested v14.0.1) provides empty strings instead of undefined, but not for any
    // fault of XRegExp
    /*it('should provide undefined within replacement functions for nonparticipating capturing groups', function() {
        expect('y'.replace(/(x)?y/, function($0, $1) {return String($1);})).toBe('undefined');
        expect('y'.replace(/(x)?y/, function($0, $1) {return $1;})).toBe('undefined');
    });*/

    it('should not substitute tokens returned by replacement functions', function() {
        // Regex search...
        expect('aaa'.replace(/a(a)/, function($0, $1) {return '$1';})).toBe('$1a');
        expect('aaa'.replace(/a/, function() {return '$&';})).toBe('$&aa');

        // String search...
        // This is broken in Safari (tested in Safari 5.1.2/7534.52.7), but not for any fault of
        // XRegExp. Uncomment this test if future XRegExp fixes it for Safari.
        //expect('aaa'.replace('a', function() {return '$&';})).toBe('$&aa');
    });

    it('should allow using the match position within replacement functions', function() {
        expect('xaaa'.replace(/a/, function($0, pos) {return '' + pos;})).toBe('x1aa');
        expect('xaaa'.replace(/a/g, function($0, pos) {return '' + pos;})).toBe('x123');
        expect('xaaa'.replace(/(a)/g, function($0, $1, pos) {return '' + pos;})).toBe('x123');
        expect('xaaa'.replace('a', function($0, pos) {return '' + pos;})).toBe('x1aa');
    });

    it('should allow using the source string within replacement functions', function() {
        expect('xaaa'.replace(/a/, function($0, pos, str) {return str;})).toBe('xxaaaaa');
        expect('xaaa'.replace(/(a)/, function($0, $1, pos, str) {return str;})).toBe('xxaaaaa');
        expect('xaaa'.replace('a', function($0, pos, str) {return str;})).toBe('xxaaaaa');
    });

    it('should return string as the typeof the last argument in replacement functions', function() {
        // NOTE: This tests a fix for IE < 9, which doesn't get this correct natively

        expect('100'.replace(/0/, function($0, pos, str) {return typeof str;})).toBe('1string0');
        expect(new String('100').replace(/0/, function($0, pos, str) {return typeof str;})).toBe('1string0');
        expect(String.prototype.replace.call(100, /0/, function($0, pos, str) {return typeof str;})).toBe('1string0');
    });

    it('should handle nonstring context when using a replacement text token that references the subject text', function() {
        expect(String.prototype.replace.call(0, /^/, '$`')).toBe('0');
    });

    it('should not modify the lastIndex of a nonglobal regex', function() {
        var regex = /x/;

        '123x567'.replace(regex, '_');
        expect(regex.lastIndex).toBe(0);

        regex.lastIndex = 1;
        '123x567'.replace(regex, '_');
        expect(regex.lastIndex).toBe(1);

        'nomatch'.replace(regex, '_');
        expect(regex.lastIndex).toBe(1);
    });

    it('should reset the lastIndex of a global regex to 0', function() {
        var regex = /x/g;

        regex.lastIndex = 1;
        '123x567'.replace(regex, '_');
        expect(regex.lastIndex).toBe(0);

        regex.lastIndex = 1;
        'nomatch'.replace(regex, '_');
        expect(regex.lastIndex).toBe(0);
    });

    it('should ignore lastIndex when setting the search start position', function() {
        [/x/, /x/g].forEach(function(regex) {
            regex.lastIndex = 5;
            expect('123x567'.replace(regex, '_')).toBe('123_567');
        });
    });

    it('should update lastIndex during replacement iterations', function() {
        var regex = /x/g;
        var interimLastIndex = 0;
        '1x2'.replace(regex, function() {
            interimLastIndex = regex.lastIndex;
        });

        expect(interimLastIndex).toBe(2);
    });

    it('should convert any provided nonstring search to a string', function() {
        var values = [
            {target: '10x10',     search: 10,        replacement: 'x', expected: 'xx10'},
            {target: 'xaaa,ba,b', search: ['a','b'], replacement: 'x', expected: 'xaaxa,b'},
            {target: 'undefined', search: undefined, replacement: 'x', expected: 'x'}
        ];

        values.forEach(function(value) {
            expect(value.target.replace(value.search, value.replacement)).toBe(value.expected);
        });

        // Implicit undefined search and replacement
        expect('undefined'.replace()).toBe('undefined');
    });

    it('should convert any provided nonstring/nonfunction replacement to a string', function() {
        var values = [
            {target: 'xaaa', search: /a/g, replacement: 1.1,       expected: 'x1.11.11.1'},
            {target: 'xaaa', search: /a/g, replacement: ['a','b'], expected: 'xa,ba,ba,b'},
            {target: 'x',    search: /x/,  replacement: /x/,       expected: '/x/'},
            {target: 'xaaa', search: /a/,  replacement: undefined, expected: 'xundefinedaa'}
        ];

        values.forEach(function(value) {
            expect(value.target.replace(value.search, value.replacement)).toBe(value.expected);
        });

        // Implicit undefined replacement
        expect('xaaa'.replace(/a/)).toBe('xundefinedaa');
    });

    it('should convert any nonstring context to a string (except null and undefined)', function() {
        var values = [
            100,
            {},
            true,
            false,
            NaN,
            ['a']
        ];

        values.forEach(function(value) {
            expect(String.prototype.replace.call(value, /^/, 'x')).toBe('x' + value);
        });
    });

    it('should throw an exception when called on null or undefined context, if strict mode is supported', function() {
        [null, undefined].forEach(function(value) {
            // This doesn't work the same when strict mode isn't supported, because the replace
            // method will be called with the global object (window) as its context, rather
            // than null or undefined
            if (hasStrictMode) {
                expect(function() {String.prototype.replace.call(value, /^/, '');}).toThrow(TypeError);
            } else {
                // Keep the assertion count consistent cross-browser
                expect(hasStrictMode).toBe(false);
            }
        });
    });

    describe('provides extensions:', function() {

        it('should allow accessing named backreferences in a callback function as properties of the first argument', function() {
            expect('abc'.replace(XRegExp('(?<name>.).'), function(match) {
                return ':' + match.name + ':';
            })).toBe(':a:c');
        });

        describe('supports new replacement text syntax:', function() {

            describe('backreference $0', function() {

                it('should work like $&', function() {
                    expect('xaaa'.replace(/aa/, '$0b')).toBe('xaaba');
                    expect('xaaa'.replace('aa', '$0b')).toBe('xaaba');
                });

                it('should be allowed as $00', function() {
                    expect('xaaa'.replace(/aa/, '$00b')).toBe('xaaba');
                });

                it('should end after two zeros', function() {
                    expect('xaaa'.replace(/aa/, '$000b')).toBe('xaa0ba');
                    expect('xaaa'.replace(/aa/, '$001b')).toBe('xaa1ba');
                });

            });

            describe('named backreferences', function() {

                it('should return the named backreference', function() {
                    expect('test'.replace(XRegExp('(?<test>t)', 'g'), ':${test}:')).toBe(':t:es:t:');

                    // Backreference to a nonparticipating capturing group
                    expect('test'.replace(XRegExp('t|(?<test>t)', 'g'), ':${test}:')).toBe('::es::');
                });

                it('should throw an exception for backreferences to unknown group names', function() {
                    expect(function() {'test'.replace(XRegExp('(?<test>t)', 'g'), ':${x}:');}).toThrow(SyntaxError);
                });

            });

            describe('explicit numbered backreferences', function() {

                it('should return the numbered backreference', function() {
                    expect('test'.replace(/(.)./g, '${1}')).toBe('ts');

                    // Backreference to a nonparticipating capturing group
                    expect('test'.replace(/t|(e)/g, '${1}')).toBe('es');
                });

                it('should allow leading zeros', function() {
                    expect('test'.replace(/(.)./g, '${01}')).toBe('ts');
                    expect('test'.replace(/(.)./g, '${001}')).toBe('ts');
                });

                it('should return named backreferences by number', function() {
                    expect('test'.replace(XRegExp('(?<name>.).', 'g'), '${1}')).toBe('ts');
                });

                it('should separate numbered backreferences from following literal digits', function() {
                    expect('test'.replace(new RegExp('(.).', 'g'), '${1}0')).toBe('t0s0');
                    expect('test'.replace(new RegExp('(.).' + repeat('()', 9), 'g'), '${1}0')).toBe('t0s0');
                });

                it('should throw an exception for backreferences to unknown group numbers', function() {
                    expect(function() {'test'.replace(/t/, '${1}');}).toThrow(SyntaxError);
                    expect(function() {'test'.replace(/(t)/, '${2}');}).toThrow(SyntaxError);
                });

                it('should allow ${0} to refer to the entire match', function() {
                    expect('test'.replace(/../g, '${0}:')).toBe('te:st:');
                    expect('test'.replace(/../g, '${00}:')).toBe('te:st:');
                    expect('test'.replace(/../g, '${000}:')).toBe('te:st:');
                });

                it('should support backreferences 100 and greater, if the browser does natively', function() {
                    // IE < 9 doesn't allow backreferences greater than \99 *within* a regex, but
                    // XRegExp still allows backreferences to groups 100+ within replacement text
                    try {
                        // Regex with 1,000 capturing groups. This fails in Firefox 4-6 (but not v3.6
                        // or v7+) with `InternalError: regular expression too complex`
                        var lottaGroups = new RegExp([
                            '^(a)\\1', repeat('()', 8),
                            '(b)\\10', repeat('()', 89),
                            '(c)', repeat('()', 899),
                            '(d)$'
                        ].join(''));

                        expect('aabbcd'.replace(lottaGroups, '${0} ${01} ${001} ${0001} ${1} ${10} ${100} ${1000}')).toBe('aabbcd a a a a b c d');
                        // For comparison...
                        expect('aabbcd'.replace(lottaGroups, '$0 $01 $001 $0001 $1 $10 $100 $1000')).toBe('aabbcd a aabbcd1 aabbcd01 a b b0 b00');
                    } catch (err) {
                        // Keep the assertion count consistent cross-browser
                        expect(true).toBe(true);
                        expect(true).toBe(true);
                    }
                });

            });

            describe('strict error handling', function() {

                it('should throw an exception for backreferences to unknown group numbers', function() {
                    expect(function() {'xaaa'.replace(/aa/, '$1b');}).toThrow(SyntaxError);
                    expect(function() {'xaaa'.replace(/aa/, '$01b');}).toThrow(SyntaxError);
                    expect(function() {'xaaa'.replace(/a(a)/, '$2b');}).toThrow(SyntaxError);
                    expect(function() {'xa(a)a'.replace('a(a)', '$1b');}).toThrow(SyntaxError);
                });

            });

        });

    });

});

describe('When overridden, String.prototype.split()', function() {

    beforeEach(function() {
        XRegExp.install('natives');
    });

    /*
     * NOTE: These specs should mirror those for XRegExp.split as closely as possible.
     */

    // TODO: Copy/update specs from XRegExp.split here

    // NOTE: The fixed String.prototype.split does not provide any extensions to native handling

});
