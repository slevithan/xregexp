describe('Unicode Base addon:', function() {

    describe('adds new regex syntax:', function() {

        (function() {
            var letters = (
                'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz' +
                'ÀÈÌÒÙàèìòùÁÉÍÓÚÝáéíóúýÂÊÎÔÛâêîôûÃÑÕãñõÄËÏÖÜŸäëïöüÿßºªØøÅåÆæÞþÐðŠšŽžИи' +
                '日本語' +
                'العربية'
            ).split('');
            var astralLetters = [
                String.fromCodePoint(0x1D7CB)
            ];
            var nonletters = (
                '0123456789' +
                '`~!@#$%^&*()-_=+[]{}<>\\/|;:\'",.?' +
                '©®™•§†‡¶½÷‰±°¢£€¥¤¡¿'
            ).split('');

            describe('\\p{L}, \\p{Letter}, and \\pL', function() {

                it('should match any BMP Unicode letter, in default (BMP) mode', function() {
                    letters.forEach(function(letter) {
                        expect(XRegExp('\\p{L}').test(letter)).toBe(true);
                        expect(XRegExp('\\p{Letter}').test(letter)).toBe(true);
                        expect(XRegExp('\\pL').test(letter)).toBe(true);
                    });
                });

                it('should not match any complete astral letter, in default (BMP) mode', function() {
                    astralLetters.forEach(function(astralLetter) {
                        expect(XRegExp('^\\p{L}$').test(astralLetter)).toBe(false);
                        expect(XRegExp('^\\p{Letter}$').test(astralLetter)).toBe(false);
                        expect(XRegExp('^\\pL$').test(astralLetter)).toBe(false);
                    });
                });

                it('should not match any Unicode nonletter, in default (BMP) mode', function() {
                    nonletters.forEach(function(nonletter) {
                        expect(XRegExp('\\p{L}').test(nonletter)).toBe(false);
                        expect(XRegExp('\\p{Letter}').test(nonletter)).toBe(false);
                        expect(XRegExp('\\pL').test(nonletter)).toBe(false);
                    });
                });

                it('should match any BMP Unicode letter, in astral mode', function() {
                    XRegExp.install('astral');

                    letters.forEach(function(letter) {
                        expect(XRegExp('\\p{L}').test(letter)).toBe(true);
                        expect(XRegExp('\\p{Letter}').test(letter)).toBe(true);
                        expect(XRegExp('\\pL').test(letter)).toBe(true);
                    });
                });

                it('should match any complete astral Unicode letter, in astral mode', function() {
                    XRegExp.install('astral');

                    astralLetters.forEach(function(astralLetter) {
                        expect(XRegExp('^\\p{L}$').test(astralLetter)).toBe(true);
                        expect(XRegExp('^\\p{Letter}$').test(astralLetter)).toBe(true);
                        expect(XRegExp('^\\pL$').test(astralLetter)).toBe(true);
                    });
                });

                it('should not match any Unicode nonletter, in astral mode', function() {
                    XRegExp.install('astral');

                    nonletters.forEach(function(nonletter) {
                        expect(XRegExp('\\p{L}').test(nonletter)).toBe(false);
                        expect(XRegExp('\\p{Letter}').test(nonletter)).toBe(false);
                        expect(XRegExp('\\pL').test(nonletter)).toBe(false);
                    });
                });

            });

            describe('\\P{L}, \\P{Letter}, \\PL, \\p{^L}, and \\p{^Letter}', function() {

                it('should not match any BMP Unicode letter, in default (BMP) mode', function() {
                    letters.forEach(function(letter) {
                        expect(XRegExp('\\P{L}').test(letter)).toBe(false);
                        expect(XRegExp('\\P{Letter}').test(letter)).toBe(false);
                        expect(XRegExp('\\PL').test(letter)).toBe(false);
                        expect(XRegExp('\\p{^L}').test(letter)).toBe(false);
                        expect(XRegExp('\\p{^Letter}').test(letter)).toBe(false);
                    });
                });

                it('should not match any complete astral letter, in default (BMP) mode', function() {
                    astralLetters.forEach(function(astralLetter) {
                        expect(XRegExp('^\\P{L}$').test(astralLetter)).toBe(false);
                        expect(XRegExp('^\\P{Letter}$').test(astralLetter)).toBe(false);
                        expect(XRegExp('^\\PL$').test(astralLetter)).toBe(false);
                        expect(XRegExp('^\\p{^L}$').test(astralLetter)).toBe(false);
                        expect(XRegExp('^\\p{^Letter}$').test(astralLetter)).toBe(false);
                    });
                });

                it('should match any Unicode nonletter, in default (BMP) mode', function() {
                    nonletters.forEach(function(nonletter) {
                        expect(XRegExp('\\P{L}').test(nonletter)).toBe(true);
                        expect(XRegExp('\\P{Letter}').test(nonletter)).toBe(true);
                        expect(XRegExp('\\PL').test(nonletter)).toBe(true);
                        expect(XRegExp('\\p{^L}').test(nonletter)).toBe(true);
                        expect(XRegExp('\\p{^Letter}').test(nonletter)).toBe(true);
                    });
                });

                it('should not match any BMP Unicode letter, in astral mode', function() {
                    XRegExp.install('astral');

                    letters.forEach(function(letter) {
                        expect(XRegExp('\\P{L}').test(letter)).toBe(false);
                        expect(XRegExp('\\P{Letter}').test(letter)).toBe(false);
                        expect(XRegExp('\\PL').test(letter)).toBe(false);
                        expect(XRegExp('\\p{^L}').test(letter)).toBe(false);
                        expect(XRegExp('\\p{^Letter}').test(letter)).toBe(false);
                    });
                });

                it('should not match any complete astral Unicode letter, in astral mode', function() {
                    XRegExp.install('astral');

                    astralLetters.forEach(function(astralLetter) {
                        expect(XRegExp('^\\P{L}$').test(astralLetter)).toBe(false);
                        expect(XRegExp('^\\P{Letter}$').test(astralLetter)).toBe(false);
                        expect(XRegExp('^\\PL$').test(astralLetter)).toBe(false);
                        expect(XRegExp('^\\p{^L}$').test(astralLetter)).toBe(false);
                        expect(XRegExp('^\\p{^Letter}$').test(astralLetter)).toBe(false);
                    });
                });

                it('should match any Unicode nonletter, in astral mode', function() {
                    XRegExp.install('astral');

                    nonletters.forEach(function(nonletter) {
                        expect(XRegExp('\\P{L}').test(nonletter)).toBe(true);
                        expect(XRegExp('\\P{Letter}').test(nonletter)).toBe(true);
                        expect(XRegExp('\\PL').test(nonletter)).toBe(true);
                        expect(XRegExp('\\p{^L}').test(nonletter)).toBe(true);
                        expect(XRegExp('\\p{^Letter}').test(nonletter)).toBe(true);
                    });
                });

            });
        }());

        describe('\\p{...}, \\P{...}, \\p{^...}, and single-letter-name forms', function() {

            it('should be directly quantifiable', function() {
                expect(XRegExp('^\\p{L}+$').test('Café')).toBe(true);
                expect(XRegExp('^\\pL+$').test('Café')).toBe(true);
            });

            it('should throw an exception for double negation \\P{^...}', function() {
                expect(function() {XRegExp('\\P{^L}');}).toThrow(SyntaxError);
                expect(function() {XRegExp('[\\P{^L}]');}).toThrow(SyntaxError);
                expect(function() {XRegExp('[^\\P{^L}]');}).toThrow(SyntaxError);
            });

            it('should throw an exception for \\p^ with a single-letter name', function() {
                expect(function() {XRegExp('\\p^L');}).toThrow(SyntaxError);
            });

            it('should use the first letter only as the name if not wrapped with {...}', function() {
                expect(XRegExp('^\\pLetter+$').test('Café')).toBe(false);
                expect(XRegExp('^\\pLetter+$').test('Aetterrrrr')).toBe(true);
            });

            it('should work within character classes', function() {
                expect(XRegExp('^[\\p{L}]+$').test('Café')).toBe(true);
                expect(XRegExp('^[\\pL]+$').test('Café')).toBe(true);
            });

            it('should work in negated form work within character classes', function() {
                expect(XRegExp('^[\\P{L}]+$').test('Café')).toBe(false);
                expect(XRegExp('^[\\PL]+$').test('Café')).toBe(false);
                expect(XRegExp('^[\\p{^L}]+$').test('Café')).toBe(false);
            });

            it('should work within negated character classes', function() {
                expect(XRegExp('^[^\\p{L}]+$').test('Café')).toBe(false);
                expect(XRegExp('^[^\\pL]+$').test('Café')).toBe(false);
            });

            it('should work in negated form within negated character classes', function() {
                expect(XRegExp('^[^\\P{L}]+$').test('Café')).toBe(true);
                expect(XRegExp('^[^\\PL]+$').test('Café')).toBe(true);
                expect(XRegExp('^[^\\p{^L}]+$').test('Café')).toBe(true);
            });

            it('should throw an exception within character classes, in astral mode', function() {
                XRegExp.install('astral');

                expect(function() {XRegExp('[\\p{L}]');}).toThrow(SyntaxError);
                expect(function() {XRegExp('[\\P{L}]');}).toThrow(SyntaxError);
                expect(function() {XRegExp('[\\pL]');}).toThrow(SyntaxError);
                expect(function() {XRegExp('[\\PL]');}).toThrow(SyntaxError);
            });

            it('should throw an exception for unrecognized names', function() {
                var unrecognizedNames = ['X', 'Unrecognized_Name'];

                unrecognizedNames.forEach(function(name) {
                    expect(function() {XRegExp('\\p{' + name + '}');}).toThrow(SyntaxError);
                    expect(function() {XRegExp('\\P{' + name + '}');}).toThrow(SyntaxError);
                    expect(function() {XRegExp('\\p{^' + name + '}');}).toThrow(SyntaxError);

                    if (name.length === 1) {
                        expect(function() {XRegExp('\\p' + name);}).toThrow(SyntaxError);
                        expect(function() {XRegExp('\\P' + name);}).toThrow(SyntaxError);
                    }
                });
            });

            it('should throw an exception if a name is not specified', function() {
                expect(function() {XRegExp('\\p{}');}).toThrow(SyntaxError);
                expect(function() {XRegExp('\\P{}');}).toThrow(SyntaxError);
                expect(function() {XRegExp('\\p{^}');}).toThrow(SyntaxError);

                // Erroring on bare \p and \P is actually handled by xregexp.js, not Unicode Base
                expect(function() {XRegExp('\\p');}).toThrow(SyntaxError);
                expect(function() {XRegExp('\\P');}).toThrow(SyntaxError);
            });

            it('should ignore spaces, underscores, hyphens, and casing in names', function() {
                expect(XRegExp('^\\p{ _-l --}+$').test('Café')).toBe(true);
            });

            it('should not ignore characters other than spaces, underscores, and hyphens in names', function() {
                expect(function() {XRegExp('\\p{L+}');}).toThrow(SyntaxError);
                expect(function() {XRegExp('\\p{.L}');}).toThrow(SyntaxError);
            });

            it('should require a negating caret to be the first character', function() {
                expect(function() {XRegExp('\\p{ ^L}');}).toThrow(SyntaxError);
            });

        });

    });

    describe('adds new regex flag A:', function() {

        (function() {
            var U_1D7CB = String.fromCodePoint(0x1D7CB);

            it('should match any astral letter with \\p{L} when using inline flag (?A)', function() {
                expect(XRegExp('(?A)^\\p{L}$').test(U_1D7CB)).toBe(true);
            });

            it('should match any astral letter with \\p{L} when using flag A', function() {
                expect(XRegExp('^\\p{L}$', 'A').test(U_1D7CB)).toBe(true);
            });

            it('should not match any astral letter with \\P{L} when using inline flag (?A)', function() {
                expect(XRegExp('(?A)^\\P{L}$').test(U_1D7CB)).toBe(false);
            });

            it('should not match any astral letter with \\P{L} when using flag A', function() {
                expect(XRegExp('^\\P{L}$', 'A').test(U_1D7CB)).toBe(false);
            });
        }());

        it('should throw an exception when using a Unicode token in a character class with inline flag (?A)', function() {
            expect(function() {XRegExp('(?A)[\\p{L}]');}).toThrow(SyntaxError);
        });

        it('should throw an exception when using a Unicode token in a character class with flag A', function() {
            expect(function() {XRegExp('[\\p{L}]', 'A');}).toThrow(SyntaxError);
        });

        it('should be equivalent to implicit astral-mode opt-in', function() {
            XRegExp.install('astral');
            var implicit = XRegExp('\\p{L}');

            XRegExp.uninstall('astral');
            var explicit = XRegExp('\\p{L}', 'A');

            expect(explicit).toBeEquiv(implicit);
        });

    });

    describe('XRegExp.addUnicodeData()', function() {

        it('should throw an exception when name is not provided', function() {
            expect(function() {
                XRegExp.addUnicodeData([{bmp: '0'}]);
            }).toThrow();
        });

        it('should throw an exception when no bmp or astral data is provided', function() {
            expect(function() {
                XRegExp.addUnicodeData([{name: 'NoData'}]);
            }).toThrow();
        });

        (function() {
            it('should successfully add token XDigit with alias Hexadecimal', function() {
                XRegExp.addUnicodeData([{
                    name: 'XDigit',
                    alias: 'Hexadecimal',
                    bmp: '0-9A-Fa-f'
                }]);

                expect(XRegExp('\\p{XDigit}\\p{Hexadecimal}').test('0F')).toBe(true);
            });

            it('should successfully add token NotXDigit as the inverse of XDigit', function() {
                XRegExp.addUnicodeData([{
                    name: 'NotXDigit',
                    inverseOf: 'XDigit'
                }]);

                expect(XRegExp('\\p{NotXDigit}\\P{NotXDigit}').test('Z0')).toBe(true);
            });
        }());

        it('should throw an exception on use if the inverseOf target is missing', function() {
            XRegExp.addUnicodeData([{
                name: 'MissingRef',
                inverseOf: 'MissingToken'
            }]);

            expect(function() {XRegExp('\\p{MissingRef}');}).toThrow(ReferenceError);
        });

        (function() {
            XRegExp.addUnicodeData([{name: 'AstralOnly', astral: '0'}]);

            it('should allow astral-only tokens to match, when in astral mode', function() {
                expect(XRegExp('\\p{AstralOnly}', 'A').test('0')).toBe(true);
            });

            it('should cause an exception to be thrown when using an astral-only token, when not in astral mode', function() {
                expect(function() {XRegExp('\\p{AstralOnly}');}).toThrow(SyntaxError);
            });
        }());

        (function() {
            XRegExp.addUnicodeData([{name: 'BmpOnly', bmp: '0'}]);

            it('should allow BMP-only tokens to match, when not in astral mode', function() {
                expect(XRegExp('\\p{BmpOnly}').test('0')).toBe(true);
            });

            it('should allow BMP-only tokens to match, when in astral mode', function() {
                expect(XRegExp('\\p{BmpOnly}', 'A').test('0')).toBe(true);
            });
        }());

        (function() {
            XRegExp.addUnicodeData([{name: 'BmpPlusAstral', bmp: '0', astral: '1'}]);

            it('should allow BMP+astral tokens to match BMP values, when not in astral mode', function() {
                expect(XRegExp('\\p{BmpPlusAstral}').test('0')).toBe(true);
            });

            it('should not allow BMP+astral tokens to match astral values, when not in astral mode', function() {
                expect(XRegExp('\\p{BmpPlusAstral}').test('1')).toBe(false);
            });

            it('should allow BMP+astral tokens to match BMP values, when in astral mode', function() {
                expect(XRegExp('\\p{BmpPlusAstral}', 'A').test('0')).toBe(true);
            });

            it('should allow BMP+astral tokens to match astral values, when in astral mode', function() {
                expect(XRegExp('\\p{BmpPlusAstral}', 'A').test('1')).toBe(true);
            });
        }());

    });

});

describe('Unicode Blocks addon:', function() {

    it('should require the "In" prefix for block names (unprefixed names are not allowed)', function() {
        expect(function() {XRegExp('\\p{InBasic_Latin}');}).not.toThrow();
        expect(function() {XRegExp('\\p{Basic_Latin}');}).toThrow(SyntaxError);
    });

    it('should not allow the "Is" prefix for block names', function() {
        expect(function() {XRegExp('\\p{IsBasic_Latin}');}).toThrow(SyntaxError);
    });

    it('should handle \\p{InBasic_Latin}', function() {
        testUnicodeToken('InBasic_Latin', {
            valid: ['A']
        });
    });

    it('should handle astral-only \\p{InAegean_Numbers}', function() {
        testUnicodeToken('InAegean_Numbers', {
            isAstralOnly: true,
            valid: [String.fromCodePoint(0x10100)]
        });
    });

    // TODO: Add complete specs

});

describe('Unicode Categories addon:', function() {
    // Tests for category L/Letter are included in the Unicode Base specs

    it('should not allow the "In" prefix for category names', function() {
        expect(function() {XRegExp('\\p{InP}');}).toThrow(SyntaxError);
    });

    it('should not allow the "Is" prefix for category names', function() {
        expect(function() {XRegExp('\\p{IsP}');}).toThrow(SyntaxError);
    });

    it('should handle \\p{Cn}', function() {
        testUnicodeToken('Cn', {
            invalid: [/* Unicode 6.2.0 */ '\u20BA']
        });
    });

    it('should handle \\p{Ll}', function() {
        testUnicodeToken('Ll', {
            valid: ['a', 'и', 'ᾀ', 'ǉ', String.fromCodePoint(0x1D7CB)],
            invalid: ['A', 'И', '!']
        });

        /*
         * Special case: Category Ll (and Lu) is handled differently depending on whether negation
         * is performed before or after case folding. No attempt is made to adjust this, so these
         * tests simply track the current (inconsistent and weird) handling. It's hard to say what
         * is correct because behavior for these cases is highly inconsistent across regex flavors.
         * The key point is that, with flag i, [\P{Ll}] is different than \P{Ll} and [^\p{Ll}].
         * This does not apply to Unicode tokens other than Ll and Lu. Browsers are also
         * inconsistent about how flag i works with some uncommon code points (e.g., Chrome 21
         * doesn't let ᾀ match ᾈ, and Firefox 14 doesn't let ǉ match the titlecase ǈ), so just test
         * common code points.
         */
        expect(XRegExp.match('AaИи!', XRegExp('\\p{Ll}',    'gi'))).toBeEquiv(['A', 'a', 'И', 'и']);
        expect(XRegExp.match('AaИи!', XRegExp('[\\p{Ll}]',  'gi'))).toBeEquiv(['A', 'a', 'И', 'и']);
        expect(XRegExp.match('AaИи!', XRegExp('[^\\P{Ll}]', 'gi'))).toBeEquiv([]);
        expect(XRegExp.match('AaИи!', XRegExp('\\P{Ll}',    'gi'))).toBeEquiv(['!']);
        expect(XRegExp.match('AaИи!', XRegExp('[^\\p{Ll}]', 'gi'))).toBeEquiv(['!']);
        expect(XRegExp.match('AaИи!', XRegExp('[\\P{Ll}]',  'gi'))).toBeEquiv(['A', 'a', 'И', 'и', '!']);
    });

    it('should handle \\p{P}', function() {
        testUnicodeToken('P', {
            valid: ['-', '\u00BF', '\u301C'],
            invalid: ['0']
        });
    });

    it('should handle \\p{Pe}', function() {
        testUnicodeToken('Pe', {
            valid: [')', '\u300B'],
            invalid: ['0']
        });
    });

    it('should handle \\p{S}', function() {
        testUnicodeToken('S', {
            valid: ['$', '\u20B9', /* Unicode 6.2.0 */ '\u20BA', String.fromCodePoint(0x1F4A9)],
            invalid: ['0']
        });
    });

    it('should handle \\p{Sc}', function() {
        testUnicodeToken('Sc', {
            valid: ['$', '\u20B9', /* Unicode 6.2.0 */ '\u20BA'],
            invalid: ['0']
        });
    });

    // TODO: Add complete specs

});

describe('Unicode Properties addon:', function() {

    it('should not allow the "In" prefix for property names', function() {
        expect(function() {XRegExp('\\p{InASCII}');}).toThrow(SyntaxError);
    });

    it('should not allow the "Is" prefix for property names', function() {
        expect(function() {XRegExp('\\p{IsASCII}');}).toThrow(SyntaxError);
    });

    it('should handle \\p{Alphabetic}', function() {
        testUnicodeToken('Alphabetic', {
            valid: ['A', 'a', 'Å', 'å', '日', 'ي'],
            invalid: ['0', '$']
        });
    });

    it('should handle \\p{Any}', function() {
        testUnicodeToken('Any', {
            valid: [String.fromCodePoint(0x10000), '\uD800', '\uDC00', 'A']
        });
    });

    it('should handle \\p{ASCII}', function() {
        testUnicodeToken('ASCII', {
            valid: ['\0', '\x7F'],
            invalid: ['\x80']
        });
    });

    it('should handle \\p{Assigned}', function() {
        testUnicodeToken('Assigned', {
            valid: [String.fromCodePoint(0x10000), '\uD800', '\uDC00', 'A', /* Unicode 6.2.0 */ '\u20BA']
        });
    });

    // TODO: Add complete specs

});

describe('Unicode Scripts addon:', function() {

    it('should not allow the "In" prefix for script names', function() {
        expect(function() {XRegExp('\\p{InLatin}');}).toThrow(SyntaxError);
    });

    it('should not allow the "Is" prefix for script names', function() {
        expect(function() {XRegExp('\\p{IsLatin}');}).toThrow(SyntaxError);
    });

    it('should handle \\p{Katakana}', function() {
        testUnicodeToken('Katakana', {
            valid: ['カ', 'タ', 'ナ'],
            invalid: ['A', 'B', 'C']
        });
    });

    it('should handle \\p{Arabic}', function() {
        testUnicodeToken('Arabic', {
            valid: [/* Unicode 6.2.0 */ '\u065F']
        });
    });

    it('should handle \\p{Inherited}', function() {
        testUnicodeToken('Inherited', {
            invalid: [/* Unicode 6.2.0 */ '\u065F']
        });
    });

    it('should handle \\p{Common}', function() {
        testUnicodeToken('Common', {
            valid: [/* Unicode 6.2.0 */ '\u20BA']
        });
    });

    // TODO: Add complete specs

});
