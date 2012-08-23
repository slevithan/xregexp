describe('XRegExp()', function() {

    it('should create objects that pass RegExp type checks', function() {
        expect(XRegExp('')).toEqual(jasmine.any(RegExp));
        expect(typeof XRegExp('')).toBe(typeof new RegExp(''));
        expect(XRegExp('') instanceof RegExp).toBe(true);
        expect(XRegExp('').constructor).toBe(RegExp);
        expect(Object.prototype.toString.call(XRegExp(''))).toBe('[object RegExp]');
    });

    it('should create a new instance, whether the "new" operator is used or not', function() {
        var regex = XRegExp('');

        expect(regex).toBeEquiv(XRegExp(''));
        expect(regex).toBeEquiv(XRegExp(regex));
        expect(regex).toBeEquiv(new XRegExp(''));
        expect(regex).toBeEquiv(new XRegExp(regex));

        expect(regex).not.toBe(XRegExp(''));
        expect(regex).not.toBe(XRegExp(regex));
        expect(regex).not.toBe(new XRegExp(''));
        expect(regex).not.toBe(new XRegExp(regex));
    });

    it('should create new instances without user-added properties, whether the "new" operator is used or not', function() {
        var regex = XRegExp('');
        regex.x = true;

        expect(XRegExp(regex).x).toBeUndefined();
        expect(new XRegExp(regex).x).toBeUndefined();
    });

    it('should use the instance for "this" in prototype methods, whether the "new" operator is used or not', function() {
        XRegExp.prototype.dummy = function() {return this;};

        expect(XRegExp('').dummy()).toEqual(jasmine.any(RegExp));
        expect(new XRegExp('').dummy()).toEqual(jasmine.any(RegExp));

        delete XRegExp.prototype.dummy;
    });

    it('should create an empty regex when given an empty pattern type', function() {
        // Pattern values that should generate an empty regex
        var emptyTypes = [
            // The native RegExp with an explicit undefined pattern incorrectly creates /undefined/
            // in Firefox 3 and 3.6 (but not v4)
            undefined,
            '',
            '(?:)',
            []
        ];
        // XRegExp follows the native RegExp. Chrome 20 follows the spec and converts empty
        // patterns to (?:), but Firefox 14.0.1, Safari 5.1.2, Opera 12, and IE 9 do not
        var isEmpty = function(regex) {
            return regex.source === '(?:)' || regex.source === '';
        };

        emptyTypes.forEach(function(item) {
            expect(isEmpty(XRegExp(item))).toBe(true);
        });

        // Implicit `undefined`
        expect(isEmpty(XRegExp())).toBe(true);
    });

    (function() {
        // Pattern values that should not generate an empty regex
        var nonemptyTypes = [
            {value: null, source: 'null'},
            {value: NaN, source: 'NaN'},
            {value: true, source: 'true'},
            {value: false, source: 'false'},
            {value: 1, source: '1'},
            {value: {}, source: '[object Object]'},
            {value: 'str', source: 'str'}
        ];

        it('should generate the same regex as RegExp when given a nonstring nonempty pattern', function() {
            nonemptyTypes.forEach(function(item) {
                expect(XRegExp(item.value)).toBeEquiv(new RegExp(item.value));
            });
        });

        it('should convert the pattern to a string when given a nonstring nonempty type', function() {
            nonemptyTypes.forEach(function(item) {
                expect(XRegExp(item.value).source).toBe(item.source);
            });

            // NOTE: Firefox (last tested 14.0.1) escapes forward slashes in strings when creating
            // a regex, so `XRegExp('/str/').source === '\\/str\\/'`
        });
    }());

    it('should set properties for native flags', function() {
        expect(XRegExp('', 'g').global).toBe(true);
        expect(XRegExp('', 'i').ignoreCase).toBe(true);
        expect(XRegExp('', 'm').multiline).toBe(true);

        if (hasNativeY) {
            expect(XRegExp('', 'y').sticky).toBe(true);
        } else {
            expect(function() {XRegExp('', 'y');}).toThrow(SyntaxError);
        }

        var regexGIM = XRegExp('', 'gim');
        expect(regexGIM.global).toBe(true);
        expect(regexGIM.ignoreCase).toBe(true);
        expect(regexGIM.multiline).toBe(true);
    });

    // These properties are `undefined`, but future ES may define them with value `false`
    it('should not set properties for nonnative flags', function() {
        expect(XRegExp('', 'n').explicitCapture).toBeFalsy();
        expect(XRegExp('', 's').singleline).toBeFalsy();
        expect(XRegExp('', 's').dotall).toBeFalsy();
        expect(XRegExp('', 's').dotAll).toBeFalsy();
        expect(XRegExp('', 'x').extended).toBeFalsy();
        // Flag A is added by Unicode Base
        //expect(XRegExp('', 'A').astral).toBeFalsy();
    });

    it('should not set properties for native flags that are not used', function() {
        expect(XRegExp('').global).toBe(false);
        expect(XRegExp('').ignoreCase).toBe(false);
        expect(XRegExp('').multiline).toBe(false);
        // Should be `false` or `undefined`, depending of whether flag y is supported natively
        expect(XRegExp('').sticky).toBeFalsy();
    });

    it('should throw an exception if duplicate native flags are used', function() {
        expect(function() {XRegExp('', 'gg');}).toThrow(SyntaxError);
        expect(function() {XRegExp('', 'ii');}).toThrow(SyntaxError);
        expect(function() {XRegExp('', 'mm');}).toThrow(SyntaxError);
        expect(function() {XRegExp('', 'mim');}).toThrow(SyntaxError);
    });

    it('should throw an exception if duplicate nonnative flags are used', function() {
        expect(function() {XRegExp('', 'nn');}).toThrow(SyntaxError);
        expect(function() {XRegExp('', 'ss');}).toThrow(SyntaxError);
        expect(function() {XRegExp('', 'xx');}).toThrow(SyntaxError);
        expect(function() {XRegExp('', 'xsx');}).toThrow(SyntaxError);
        // Flag A is added by Unicode Base
        //expect(function() {XRegExp('', 'AA');}).toThrow(SyntaxError);
    });

    it('should throw an exception if unknown flags are used', function() {
        expect(function() {XRegExp('', 'Z');}).toThrow(SyntaxError);
        expect(function() {XRegExp('', '?');}).toThrow(SyntaxError);
    });

    it('should store extended data on regex instances', function() {
        expect(XRegExp('')[REGEX_DATA]).toEqual(jasmine.any(Object));
        expect(XRegExp('')[REGEX_DATA].captureNames).toBe(null);
    });

    it('should copy provided RegExp objects', function() {
        var regex = /x/g;
        var copy = XRegExp(regex);

        expect(copy).toBeEquiv(regex);
        expect(copy).not.toBe(regex);
    });

    it('should throw an exception if providing flags when copying a regex', function() {
        expect(function() {XRegExp(/x/, 'g');}).toThrow(TypeError);
    });

    it('should reset lastIndex when copying a regex', function() {
        var regex = /x/g;
        regex.lastIndex = 2;

        expect(regex.lastIndex).toBe(2);
        expect(XRegExp(regex).lastIndex).toBe(0);
    });

    it('should not use XRegExp syntax when copying a regex originally built by RegExp', function() {
        expect(function() {XRegExp(/\00/);}).not.toThrow();
    });

    it('should preserve named capture properties when copying a regex', function() {
        expect(XRegExp(XRegExp('(?<name>a)'))[REGEX_DATA].captureNames).toContain('name');
    });

    describe('fixes regex syntax cross-browser:', function() {

        it('should use the correct JavaScript rules for empty character classes', function() {
            /* Traditional regex behavior is that a leading, unescaped ] within a character class
             * is treated as a literal character and does not end the character class. However,
             * this is not true for ES3/5, which states that [] is an empty set that will never
             * match (similar to (?!)) and [^] matches any single character (like [\s\S] or
             * [\0-\uFFFF]). IE < 9 and older versions of Safari use the traditional behavior,
             * rather than the correct ES3/5 behavior. Older versions of Opera reverse the correct
             * ES3/5 behavior, so that [] matches any character and [^] never matches. Regexes
             * created by XRegExp follow the ES3/5 standard behavior cross-browser.
             */

            expect(XRegExp('[]').test('a')).toBe(false);
            expect(XRegExp('[]]').test('a]')).toBe(false);
            expect(XRegExp('[]]').test(']')).toBe(false);

            expect(XRegExp('[^]').test('a')).toBe(true);
            expect(XRegExp('[^]]').test('a]')).toBe(true);
        });

    });

    describe('supports new regex syntax:', function() {

        describe('leading mode modifier', function() {

            it('should set properties for native flags', function() {
                expect(XRegExp('(?i)').ignoreCase).toBe(true);
                expect(XRegExp('(?m)').multiline).toBe(true);
    
                var regexIM = XRegExp('(?im)');
                expect(regexIM.ignoreCase).toBe(true);
                expect(regexIM.multiline).toBe(true);
            });

             // These properties are `undefined`, but future ES may define them with value `false`
            it('should not set properties for nonnative flags', function() {
                expect(XRegExp('(?n)').explicitCapture).toBeFalsy();
                expect(XRegExp('(?s)').singleline).toBeFalsy();
                expect(XRegExp('(?s)').dotall).toBeFalsy();
                expect(XRegExp('(?s)').dotAll).toBeFalsy();
                expect(XRegExp('(?x)').extended).toBeFalsy();
                // Flag A is added by Unicode Base
                //expect(XRegExp('(?A)').astral).toBeFalsy();
            });

            it('should throw an exception if flag g or y is included', function() {
                expect(function() {XRegExp('(?g)');}).toThrow(SyntaxError);
                expect(function() {XRegExp('(?y)');}).toThrow(SyntaxError);
                expect(function() {XRegExp('(?gi)');}).toThrow(SyntaxError);
                expect(function() {XRegExp('(?mg)');}).toThrow(SyntaxError);
            });

            it('should throw an exception if a nonleading mode modifier is used', function() {
                expect(function() {XRegExp('.(?i)');}).toThrow(SyntaxError);
                expect(function() {XRegExp('^(?i)');}).toThrow(SyntaxError);
            });

            it('should not throw an exception if duplicate flags are used', function() {
                expect(function() {XRegExp('(?ii)');}).not.toThrow();
                expect(function() {XRegExp('(?ss)');}).not.toThrow();
                expect(function() {XRegExp('(?isi)');}).not.toThrow();
            });

            it('should not throw an exception if the same flag is used in a mode modifier and the flags argument', function() {
                expect(function() {XRegExp('(?i)', 'i');}).not.toThrow();
                expect(function() {XRegExp('(?s)', 's');}).not.toThrow();
                expect(function() {XRegExp('(?is)', 'is');}).not.toThrow();
            });

            it('should be applied together with flags used in the flags argument', function() {
                var regex = XRegExp('(?is).', 'gm');

                expect(regex.ignoreCase).toBe(true);
                expect(regex.global).toBe(true);
                expect(regex.multiline).toBe(true);
                // Test nonnative flag s
                expect(regex.test('\n')).toBe(true);
            });

            it('should throw an exception if unknown flags are used', function() {
                expect(function() {XRegExp('(?Z)');}).toThrow(SyntaxError);
                expect(function() {XRegExp('(??)');}).toThrow(SyntaxError);
            });

        });

        describe('inline comments', function() {

            it('should be ignored', function() {
                expect(XRegExp('^a(?#)b$').test('ab')).toBe(true);
            });

            it('should apply a following quantifier to the preceding atom', function() {
                expect(XRegExp('^a(?#)+$').test('aaa')).toBe(true);
                expect(XRegExp('^a(?#)(?#)+$').test('aaa')).toBe(true);
            });

            it('should separate atoms', function() {
                expect(XRegExp('^(a)()()()()()()()()()\\1(?#)0$').test('aa0')).toBe(true);
            });

            it('should end after the first ")"', function() {
                expect(XRegExp('a(?# \r(?#)b').test('ab')).toBe(true);
                expect(function() {XRegExp('a(?# \r(?#))b');}).toThrow(SyntaxError);
            });

        });

        describe('named capture', function() {
            // Named capture *functionality* is tested by the specs for named backreference syntax,
            // XRegExp.exec, XRegExp.replace, etc.

            it('should allow the characters A-Z, a-z, 0-9, $, and _ to be used in capture names', function() {
                expect(XRegExp('(?<Az>x)').test('x')).toBe(true);
                expect(XRegExp('(?<_09>x)').test('x')).toBe(true);
                expect(XRegExp('(?<$>x)').test('x')).toBe(true);
            });

            it('should throw an exception if characters other than A-Z, a-z, 0-9, $, and _ are used in capture names', function() {
                expect(function() {XRegExp('(?<!>)');}).toThrow(SyntaxError);
                expect(function() {XRegExp('(?<?>)');}).toThrow(SyntaxError);
                expect(function() {XRegExp('(?<.>)');}).toThrow(SyntaxError);
                expect(function() {XRegExp('(?<<>)');}).toThrow(SyntaxError);
                expect(function() {XRegExp('(?<->)');}).toThrow(SyntaxError);
                expect(function() {XRegExp('(?<naïve>)');}).toThrow(SyntaxError);
                expect(function() {XRegExp('(?<Русский>)');}).toThrow(SyntaxError);
                expect(function() {XRegExp('(?<日本語>)');}).toThrow(SyntaxError);
            });

            it('should allow capture names to start with digits', function() {
                expect(XRegExp('(?<0a>x)').test('x')).toBe(true);
                expect(XRegExp('(?<1_1>x)').test('x')).toBe(true);
                expect(XRegExp('(?<234$>x)').test('x')).toBe(true);
            });

            it('should throw an exception if bare integers are used as capture names', function() {
                expect(function() {XRegExp('(?<0>)');}).toThrow(SyntaxError);
                expect(function() {XRegExp('(?<1>)');}).toThrow(SyntaxError);
                expect(function() {XRegExp('(?<234>)');}).toThrow(SyntaxError);
            });

            it('should throw an exception if reserved words are used as capture names', function() {
                // Only these names are reserved
                ['length', '__proto__'].forEach(function(name) {
                    expect(function() {XRegExp('(?<' + name + '>)');}).toThrow(SyntaxError);
                });
            });

            it('should allow reserved JavaScript keywords as capture names', function() {
                ['eval', 'for', 'function', 'if', 'throw'].forEach(function(keyword) {
                    expect(XRegExp('(?<' + keyword + '>x)').test('x')).toBe(true);
                });
            });

            it('should throw an exception if the same name is used for mutiple groups', function() {
                expect(function() {XRegExp('(?<A>)(?<A>)');}).toThrow(SyntaxError);
                expect(function() {XRegExp('(?<n1>)(?<n2>)(?<n1>)');}).toThrow(SyntaxError);
                expect(function() {XRegExp('(?<n1>(?<n1>))');}).toThrow(SyntaxError);
                expect(function() {XRegExp('.(?<$1>a).(.).(?<$1>b).');}).toThrow(SyntaxError);
            });

            it('should allow nested groups', function() {
                expect(XRegExp('(?<A>(?<B>(?<C>x)))').test('x')).toBe(true);
            });

            it('should allow empty groups', function() {
                expect(XRegExp('(?<name>)').test('')).toBe(true);
            });

            it('should not treat numbered backreferences to Python-style named capture as octals', function() {
                // XRegExp 2.0.0+ supports Python-style named capture syntax to avoid octal-related
                // errors in Opera. Recent Opera supports (?P<name>..) and (?P=name) based on
                // abandoned ES4 proposals
                expect(XRegExp('(?P<name>a)(b)\\2').test('abb')).toBe(true);
                expect(XRegExp('(?P<name>a)(b)\\1').test('aba')).toBe(true);
            });

        });

        describe('named backreferences', function() {

            it('should match the named backreference', function() {
                expect(XRegExp('(?<A>.)\\k<A>').test('aa')).toBe(true);
                expect(XRegExp('(?<A>.)\\k<A>').test('ab')).toBe(false);
                expect(XRegExp('(?<A>.)\\k<A>\\k<A>').test('aaa')).toBe(true);
            });

            it('should allow A-Z, a-z, 0-9, $, and _ in backreference names', function() {
                expect(XRegExp('(?<Az>x)\\k<Az>').test('xx')).toBe(true);
                expect(XRegExp('(?<_09>x)\\k<_09>').test('xx')).toBe(true);
                expect(XRegExp('(?<$>x)\\k<$>').test('xx')).toBe(true);
            });

            it('should not allow characters other than A-Z, a-z, 0-9, $, and _ in backreference names', function() {
                expect(function() {XRegExp('\\k<&>');}).toThrow(SyntaxError);
                expect(function() {XRegExp('\\k<\'>');}).toThrow(SyntaxError);
                expect(function() {XRegExp('\\k<`>');}).toThrow(SyntaxError);
            });

            it('should separate backreferences from following literal digits', function() {
                expect(XRegExp('(?<$1>A1)(2)(3)(4)(5)(6)(7)(8)(9)(B10)\\k<$1>0').test('A123456789B10A10')).toBe(true);
                expect(XRegExp('(?<$1>A)\\k<$1>2').test('AA2')).toBe(true);
            });

            it('should throw an exception for backreferences to unknown groups', function() {
                expect(function() {XRegExp('\\k<name>');}).toThrow(SyntaxError);
                expect(function() {XRegExp('(?<n1>)\\k<n2>');}).toThrow(SyntaxError);
            });

            it('should throw an exception for backreferences to capturing groups not opened to the left', function() {
                expect(function() {XRegExp('\\k<n>(?<n>)');}).toThrow(SyntaxError);
                expect(function() {XRegExp('(?<n1>)\\k<n2>(?<n2>)');}).toThrow(SyntaxError);
                expect(function() {XRegExp('(?<n>\\k<n>)');}).not.toThrow();
            });

        });

        describe('explicit numbered backreferences', function() {

            it('should match the numbered backreference', function() {
                expect(XRegExp('(.)\\k<1>').test('aa')).toBe(true);
                expect(XRegExp('(.)\\k<1>').test('ab')).toBe(false);
                expect(XRegExp('(.)\\k<1>\\k<1>').test('aaa')).toBe(true);
            });

            it('should allow leading zeros', function() {
                expect(XRegExp('(.)\\k<01>').test('aa')).toBe(true);
                expect(XRegExp('(.)\\k<001>').test('aa')).toBe(true);
            });

            it('should match named backreferences by number', function() {
                expect(XRegExp('(?<A>.)\\k<1>').test('aa')).toBe(true);
                expect(XRegExp('(?<A>.)\\k<1>').test('ab')).toBe(false);
                expect(XRegExp('(?<A>.)\\k<1>\\k<1>').test('aaa')).toBe(true);
            });

            it('should separate numbered backreferences from following literal digits', function() {
                expect(XRegExp('(A1)(2)(3)(4)(5)(6)(7)(8)(9)(B10)\\k<1>0').test('A123456789B10A10')).toBe(true);
                expect(XRegExp('(A)\\k<1>2').test('AA2')).toBe(true);
            });

            it('should throw an exception for backreferences to unknown groups', function() {
                expect(function() {XRegExp('\\k<1>');}).toThrow(SyntaxError);
                expect(function() {XRegExp('()\\k<2>');}).toThrow(SyntaxError);
            });

            it('should throw an exception for backreferences to capturing groups not opened to the left', function() {
                expect(function() {XRegExp('\\k<1>()');}).toThrow(SyntaxError);
                expect(function() {XRegExp('()\\k<2>()');}).toThrow(SyntaxError);
                expect(function() {XRegExp('(1)(2)(3)(4)(5)(6)(7)(8)(9)(10)\\k<11>(11)');}).toThrow(SyntaxError);
                expect(function() {XRegExp('(\\k<1>)');}).not.toThrow();
            });

            it('should not allow \\k<0> to refer to the entire match', function() {
                expect(function() {XRegExp('\\k<0>');}).toThrow(SyntaxError);
                expect(function() {XRegExp('\\k<00>');}).toThrow(SyntaxError);
            });

        });

        describe('strict error handling', function() {

            it('should throw an exception for octals except \\0 not followed by 0-9', function() {
                var octalPatterns = [
                    '\\1', '[\\1]', '\\01', '[\\01]', '\\001', '[\\001]', '\\0001',
                    // Not octals, but should throw anyway because \0 is followed by a digit
                    '[\\0001]', '\\00', '[\\00]'
                ];

                octalPatterns.forEach(function(pattern) {
                    expect(function() {XRegExp(pattern);}).toThrow(SyntaxError);
                });

                expect(function() {XRegExp('\\0');}).not.toThrow();
                expect(function() {XRegExp('[\\0]');}).not.toThrow();
            });

            it('should throw an exception for escaped literal numbers', function() {
                expect(function() {XRegExp('[\\8]');}).toThrow(SyntaxError);
            });

            it('should throw an exception for \\n-style backreferences followed by literal numbers', function() {
                expect(function() {XRegExp('(1)\\10');}).toThrow(SyntaxError);
                expect(function() {XRegExp('(1)(2)(3)(4)(5)(6)(7)(8)(9)(10)\\11');}).toThrow(SyntaxError);
                expect(function() {XRegExp('(1)(2)(3)(4)(5)(6)(7)(8)(9)(10)\\100');}).toThrow(SyntaxError);
            });

            it('should throw an exception for backreferences to capturing groups not opened to the left', function() {
                expect(function() {XRegExp('\\1(1)');}).toThrow(SyntaxError);
                expect(function() {XRegExp('(1)\\2(2)');}).toThrow(SyntaxError);
                expect(function() {XRegExp('(1)(2)(3)(4)(5)(6)(7)(8)(9)(10)\\11(11)');}).toThrow(SyntaxError);
                expect(function() {XRegExp('(\\1)');}).not.toThrow();
            });

            it('should throw an exception for unknown letter escapes', function() {
                var unknown = {
                    inDefault: ('A'  + 'CEFGHIJKLMNOPQRTUVXYZaeghijklmopqyz').split(''),
                    inClass:   ('AB' + 'CEFGHIJKLMNOPQRTUVXYZaeghijklmopqyz').split('')
                };
                var knownSingleChar = {
                    inDefault: ('B' + 'DSWbdfnrstvw').split(''),
                    inClass:   (''  + 'DSWbdfnrstvw').split('')
                };

                unknown.inDefault.forEach(function(letter) {
                    expect(function() {XRegExp('\\' + letter);}).toThrow(SyntaxError);
                });
                knownSingleChar.inDefault.forEach(function(letter) {
                    expect(function() {XRegExp('\\' + letter);}).not.toThrow();
                });

                unknown.inClass.forEach(function(letter) {
                    expect(function() {XRegExp('[\\' + letter + ']');}).toThrow(SyntaxError);
                });
                knownSingleChar.inClass.forEach(function(letter) {
                    expect(function() {XRegExp('[\\' + letter + ']');}).not.toThrow();
                });
            });

            it('should throw an exception for incomplete character references', function() {
                var badValues = ['\\c', '\\c!', '\\c0', '\\x', '\\xF', '\\xFG', '\\u', '\\uF',
                    '\\uFF', '\\uFFF', '\\uFFFG'];
                var goodValues = ['\\cZ', '\\cz', '\\xFF', '\\xff', '\\uFFFF', '\\uffff'];

                badValues.forEach(function(value) {
                    expect(function() {XRegExp(value);}).toThrow(SyntaxError);
                    expect(function() {XRegExp('[' + value + ']');}).toThrow(SyntaxError);
                });
                goodValues.forEach(function(value) {
                    expect(function() {XRegExp(value);}).not.toThrow();
                    expect(function() {XRegExp('[' + value + ']');}).not.toThrow();
                });
            });

        });

        // Covered by the specs for Unicode Base
        /*describe('Unicode', function() {
            //...
        });*/

    });

    describe('supports new flags:', function() {

        describe('n (explicit capture)', function() {

            it('should cause () to be noncapturing', function() {
                expect(XRegExp('()', 'n').exec('').length).toBe(1);
                expect(XRegExp('()').exec('').length).toBe(2);
            });

            it('should continue to treat (?:) as noncapturing', function() {
                expect(XRegExp('(?:)', 'n').exec('').length).toBe(1);
                expect(XRegExp('(?:)()', 'n').exec('').length).toBe(1);
            });

            it('should continue to allow (?<name>) for capturing', function() {
                expect(XRegExp('(?<name>)', 'n').exec('').length).toBe(2);
                expect(XRegExp('(?<name>)()', 'n').exec('').length).toBe(2);
            });

            it('should not count () toward backreference numbers', function() {
                expect(XRegExp('^(a)(?<n>b)\\1$', 'n').test('abb')).toBe(true);
                expect(function() {XRegExp('(a)\\1', 'n');}).toThrow(SyntaxError);
            });

            it('should not apply within character classes', function() {
                expect(XRegExp('^[()]+$', 'n').test(')))(')).toBe(true);
                expect(XRegExp('[()]', 'n').test('?:')).toBe(false);
            });

            it('should be activated by a leading mode modifier with flag n', function() {
                expect(XRegExp('(?n)()')).toBeEquiv(XRegExp('()', 'n'));
                expect(XRegExp('(?n)()').exec('')[1]).toBeUndefined();
            });

        });

        describe('s (dot matches all)', function() {

            it('should cause dot to match any character including line breaks', function() {
                var strWithNewlines = 'A 1!\r\n\u2028\u2029';

                expect(XRegExp('^.+$', 's').test(strWithNewlines)).toBe(true);
                expect(XRegExp('^.+$').test(strWithNewlines)).toBe(false);
            });

            it('should not apply within character classes', function() {
                expect(XRegExp('^[.]+$', 's').test('...')).toBe(true);
                expect(XRegExp('[.]', 's').test('ab\n')).toBe(false);
            });

            it('should be activated by a leading mode modifier with flag s', function() {
                expect(XRegExp('(?s).')).toBeEquiv(XRegExp('.', 's'));
                expect(XRegExp('(?s)^.$').test('\n')).toBe(true);
            });

        });

        describe('x (free spacing and line comments)', function() {

            it('should cause ASCII whitespace to be ignored', function() {
                // Basic whitespace supported by all browsers. Old IE doesn't support \v in
                // strings, so use \x0B instead
                var ws = '\t\n\x0B\f\r ';

                expect(XRegExp('^a' + ws + 'b$', 'x').test('ab')).toBe(true);
                expect(XRegExp('^a' + ws + 'b$').test('ab')).toBe(false);
            });

            // Additional ES5 and Unicode 4.0.1-6.2.0 whitespace. Not all browsers support these,
            // so leave them out. Firefox (last tested v14.0.1) doesn't treat U+FEFF as whitespace.
            // This code point is whitespace in ES5 only; not in ES3 or Unicode (Unicode 1.1.5
            // added it to Zs, but Unicode 2.0.14 moved it to Cf). Chrome 20, Safari 5.1.2, Opera
            // 12, and IE 9 all treat it as whitespace. When emulating IE 7/8, IE 9 does not
            // support any non-ASCII whitespace
            /*it('should cause Unicode whitespace to be ignored', function() {
                var ws = '\xA0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008' +
                    '\u2009\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF';

                expect(XRegExp('^a' + ws + 'b$', 'x').test('ab')).toBe(true);
            });*/

            it('should cause line comments to be ignored until the next line break', function() {
                // When emulating IE 7/8, IE 9 matches everything but \n with a dot (even including
                // \r, \u2028, and \u2029), unlike the real IE 7/8. The dot is used to determine
                // where line comments end, so other line breaks have been removed from this test.
                // Safari < 5.1 matches \u2028 and \u2029 with a dot
                var newlines = ['\n'];

                newlines.forEach(function(newline) {
                    expect(XRegExp('^a#comment' + newline + 'b\n$', 'x').test('ab')).toBe(true);
                });
            });

            it('should cause line comments to be ignored until the end of the string if there is no following line break', function() {
                expect(XRegExp('^a#comment b$', 'x').test('ac')).toBe(true);
            });

            it('should allow mixing whitespace and line comments', function() {
                expect(XRegExp('^a#comment\r\nb$', 'x').test('ab')).toBe(true);
                expect(XRegExp('\f^ a \t\n ##comment\n #\rb $ # ignored', 'x').test('ab')).toBe(true);
            });

            it('should apply a following quantifier to the preceding atom', function() {
                expect(XRegExp('^a +$', 'x').test('aaa')).toBe(true);
                expect(XRegExp('^a#comment\n+$', 'x').test('aaa')).toBe(true);
                expect(XRegExp('^a  #comment\n +$', 'x').test('aaa')).toBe(true);
                expect(XRegExp('^a  (?#comment) #comment\n +$', 'x').test('aaa')).toBe(true);
            });

            it('should separate atoms', function() {
                expect(XRegExp('^(a)()()()()()()()()()\\1 0$', 'x').test('aa0')).toBe(true);
                expect(XRegExp('^(a)()()()()()()()()()\\1#\n0$', 'x').test('aa0')).toBe(true);
            });

            it('should not apply within character classes', function() {
                expect(XRegExp('^ [A #]+ $', 'x').test('# ##A')).toBe(true);
            });

            it('should be activated by a leading mode modifier with flag x', function() {
                expect(XRegExp('(?x)a b')).toBeEquiv(XRegExp('a b', 'x'));
                expect(XRegExp('(?x)^a b$').test('ab')).toBe(true);
            });

        });

        describe('A (astral), via the Unicode Base addon', function() {

            it('', function() {
                // Covered by the specs for Unicode Base
            });

        });

    });

    describe('allows XRegExp.prototype extensions:', function() {

        XRegExp.prototype.call = function(context, str) {
            return this.test(str);
        };

        it('should be available for XRegExp instances', function() {
            expect(typeof new XRegExp('').call).toBe('function');
            expect(typeof XRegExp('').call).toBe('function');
            expect(typeof XRegExp(XRegExp('')).call).toBe('function');
            expect(typeof XRegExp.globalize(XRegExp('')).call).toBe('function');
        });

        it('should be available for copied RegExp instances', function() {
            expect(typeof /x/.call).toBe('undefined');
            expect(typeof XRegExp(/x/).call).toBe('function');
            expect(typeof XRegExp.globalize(/x/).call).toBe('function');
        });

        it('should handle context correctly', function() {
            var regex = XRegExp('x');
            expect(regex.call(null, 'x')).toBe(regex.test('x'));
            expect(regex.call(null, 'y')).toBe(regex.test('y'));
        });

    });

});

describe('XRegExp.version', function() {

    it('should be a string', function() {
        expect(typeof XRegExp.version).toBe('string');
    });

    it('should be composed of three dot-delimited parts', function() {
        expect(XRegExp.version.split('.').length).toBe(3);
    });

    it('should have numeric major and minor parts', function() {
        var parts = XRegExp.version.split('.');

        expect(isNaN(+parts[0])).toBe(false);
        expect(isNaN(+parts[1])).toBe(false);
    });

});
