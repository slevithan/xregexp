/*
 * Runs a series of `expect` assertions, given a Unicode token name and arrays of code points that
 * should or should not be matched.
 */
function testUnicodeToken(name, options) {
    var pattern = '^\\p{' + name + '}$';
    var negated = '^\\P{' + name + '}$';
    var astralRegex = XRegExp(pattern, 'A');
    var negatedAstralRegex = XRegExp(negated, 'A');
    var bmpRegex;
    var negatedBmpRegex;
    var isBmpChar;

    if (options.isAstralOnly) {
        expect(function() {XRegExp(pattern);}).toThrow(SyntaxError);
        expect(function() {XRegExp(negated);}).toThrow(SyntaxError);
    } else {
        bmpRegex = XRegExp(pattern);
        negatedBmpRegex = XRegExp(negated);
    }

    if (options.valid) {
        options.valid.forEach(function(chr) {
            expect(astralRegex.test(chr)).toBe(true);
            expect(negatedAstralRegex.test(chr)).toBe(false);
            if (!options.isAstralOnly) {
                isBmpChar = chr.length === 1; //chr.codePointAt(0) === chr.charCodeAt(0)
                expect(bmpRegex.test(chr)).toBe(isBmpChar);
                expect(negatedBmpRegex.test(chr)).toBe(false);
            }
        });
    }

    if (options.invalid) {
        options.invalid.forEach(function(chr) {
            expect(astralRegex.test(chr)).toBe(false);
            expect(negatedAstralRegex.test(chr)).toBe(true);
            if (!options.isAstralOnly) {
                isBmpChar = chr.length === 1; //chr.codePointAt(0) === chr.charCodeAt(0)
                expect(bmpRegex.test(chr)).toBe(false);
                expect(negatedBmpRegex.test(chr)).toBe(isBmpChar);
            }
        });
    }
}

/*!
 * ES6 Unicode Shims 0.1
 * Steven Levithan © 2012 MIT License
 */

/**
 * Returns a string created using the specified sequence of Unicode code points. Accepts integers
 * between 0 and 0x10FFFF. Code points above 0xFFFF are converted to surrogate pairs. If a provided
 * integer is in the surrogate range, it produces an unpaired surrogate. Comes from accepted ES6
 * proposals.
 * @memberOf String
 * @param {Number} cp1, cp2... Sequence of Unicode code points.
 * @returns {String} String created from the specified code points.
 * @example
 *
 * // Basic use
 * String.fromCodePoint(0x41); // -> 'A'
 *
 * // Multiple code points; returns astral characters as surrogate pairs
 * String.fromCodePoint(0x20B20, 0x28B4E, 0x29DF6);
 * // Unlike String.fromCharCode, this correctly handles code points above 0xFFFF
 */
if (!String.fromCodePoint) {
    String.fromCodePoint = function () {
        var chars = [], point, offset, units, i;
        for (i = 0; i < arguments.length; ++i) {
            point = arguments[i];
            offset = point - 0x10000;
            units = point > 0xFFFF ? [0xD800 + (offset >> 10), 0xDC00 + (offset & 0x3FF)] : [point];
            chars.push(String.fromCharCode.apply(null, units));
        }
        return chars.join("");
    };
}

/**
 * Returns the numeric Unicode code point of the character at the given index. Here `pos` is the
 * code *unit* position. If it's the second surrogate of a pair or an unpaired starting surrogate,
 * the code unit of the surrogate is returned; otherwise the code point is derived from the
 * surrogate pair. Comes from accepted ES6 proposals.
 * @memberOf String.prototype
 * @param {Number} [pos=0] Code point index in the string. Defaults to `0` if not a number.
 * @returns {Number} Code point at the specified index. `NaN` if the index is less than `0` or
 *   greater than the string length.
 * @example
 *
 * var str = String.fromCodePoint(166734);
 * str.codePointAt(0); // -> 166734
 * // Unlike the charCodeAt method, this correctly handles code points above 0xFFFF
 */
/*if (!String.prototype.codePointAt) {
    String.prototype.codePointAt = function (pos) {
        pos = isNaN(pos) ? 0 : pos;
        var str = String(this),
            code = str.charCodeAt(pos),
            next = str.charCodeAt(pos + 1);
        // If a surrogate pair
        if (0xD800 <= code && code <= 0xDBFF && 0xDC00 <= next && next <= 0xDFFF) {
            return ((code - 0xD800) * 0x400) + (next - 0xDC00) + 0x10000;
        }
        return code;
    };
}*/
