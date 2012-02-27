// XRegExp addon: Match Recursive 0.1.1
// (c) 2009-2010 Steven Levithan
// MIT License
// <http://xregexp.com>

var XRegExp;

if (!XRegExp) {
    throw ReferenceError("XRegExp must be loaded before the Match Recursive addon");
}

/* accepts a string to search, left and right delimiters as regex pattern strings, optional regex
flags (may include non-native s, x, and y flags), and an options object which allows setting an
escape character and changing the return format from an array of matches to a two-dimensional array
of string parts with extended position data. returns an array of matches (optionally with extended
data), allowing nested instances of left and right delimiters. use the g flag to return all
matches, otherwise only the first is returned. if delimiters are unbalanced within the subject
data, an error is thrown.

this function admittedly pushes the boundaries of what can be accomplished sensibly without a
"real" parser. however, by doing so it provides flexible and powerful recursive parsing
capabilities with minimal code weight.

warning: the `escapeChar` option is considered experimental and might be changed or removed in
future versions.

unsupported features:
  - backreferences within delimiter patterns when using `escapeChar`.
  - although providing delimiters as regex objects adds the minor feature of independent delimiter
    flags, it introduces other limitations and is better not used. */

XRegExp.matchRecursive = function (str, left, right, flags, options) {
    var options      = options || {},
        escapeChar   = options.escapeChar,
        vN           = options.valueNames,
        flags        = flags || "",
        global       = flags.indexOf("g") > -1,
        ignoreCase   = flags.indexOf("i") > -1,
        multiline    = flags.indexOf("m") > -1,
        sticky       = flags.indexOf("y") > -1,
        // sticky mode has its own handling in this function, which means you can use flag "y" even
        // in browsers which don't support it natively
        flags        = flags.replace(/y/g, ""),
        left         = left  instanceof RegExp ? (left.global  ? left  : XRegExp.copyAsGlobal(left))  : XRegExp(left,  "g" + flags),
        right        = right instanceof RegExp ? (right.global ? right : XRegExp.copyAsGlobal(right)) : XRegExp(right, "g" + flags),
        output       = [],
        openTokens   = 0,
        delimStart   = 0,
        delimEnd     = 0,
        lastOuterEnd = 0,
        outerStart, innerStart, leftMatch, rightMatch, escaped, esc;

    if (escapeChar) {
        if (escapeChar.length > 1)
            throw SyntaxError("can't supply more than one escape character");
        if (multiline)
            throw TypeError("can't supply escape character when using the multiline flag");
        escaped = XRegExp.escape(escapeChar);
        // Escape pattern modifiers:
        //   g - not needed here
        //   i - included
        //   m - **unsupported**, throws error
        //   s - handled by XRegExp when delimiters are provided as strings
        //   x - handled by XRegExp when delimiters are provided as strings
        //   y - not needed here; supported by other handling in this function
        esc = RegExp(
            "^(?:" + escaped + "[\\S\\s]|(?:(?!" + left.source + "|" + right.source + ")[^" + escaped + "])+)+",
            ignoreCase ? "i" : ""
        );
    }

    while (true) {
        // advance the starting search position to the end of the last delimiter match. a couple
        // special cases are also covered:
        //   - if using an escape character, advance to the next delimiter's starting position,
        //     skipping any escaped characters
        //   - first time through, reset lastIndex in case delimiters were provided as regexes
        left.lastIndex = right.lastIndex = delimEnd +
            (escapeChar ? (esc.exec(str.slice(delimEnd)) || [""])[0].length : 0);

        leftMatch  = left.exec(str);
        rightMatch = right.exec(str);

        // only keep the result which matched earlier in the string
        if (leftMatch && rightMatch) {
            if (leftMatch.index <= rightMatch.index)
                 rightMatch = null;
            else leftMatch  = null;
        }

        // paths*:
        // leftMatch | rightMatch | openTokens | result
        // 1         | 0          | 1          | ...
        // 1         | 0          | 0          | ...
        // 0         | 1          | 1          | ...
        // 0         | 1          | 0          | throw
        // 0         | 0          | 1          | throw
        // 0         | 0          | 0          | break
        // * - does not include the sticky mode special case
        //   - the loop ends after the first completed match if not in global mode

        if (leftMatch || rightMatch) {
            delimStart = (leftMatch || rightMatch).index;
            delimEnd   = (leftMatch ? left : right).lastIndex;
        } else if (!openTokens) {
            break;
        }

        if (sticky && !openTokens && delimStart > lastOuterEnd)
            break;

        if (leftMatch) {
            if (!openTokens++) {
                outerStart = delimStart;
                innerStart = delimEnd;
            }
        } else if (rightMatch && openTokens) {
            if (!--openTokens) {
                if (vN) {
                    if (vN[0] && outerStart > lastOuterEnd)
                               output.push([vN[0], str.slice(lastOuterEnd, outerStart), lastOuterEnd, outerStart]);
                    if (vN[1]) output.push([vN[1], str.slice(outerStart,   innerStart), outerStart,   innerStart]);
                    if (vN[2]) output.push([vN[2], str.slice(innerStart,   delimStart), innerStart,   delimStart]);
                    if (vN[3]) output.push([vN[3], str.slice(delimStart,   delimEnd),   delimStart,   delimEnd]);
                } else {
                    output.push(str.slice(innerStart, delimStart));
                }
                lastOuterEnd = delimEnd;
                if (!global)
                    break;
            }
        } else {
            // reset lastIndex in case delimiters were provided as regexes
            left.lastIndex = right.lastIndex = 0;
            throw Error("subject data contains unbalanced delimiters");
        }

        // if the delimiter matched an empty string, advance delimEnd to avoid an infinite loop
        if (delimStart === delimEnd)
            delimEnd++;
    }

    if (global && !sticky && vN && vN[0] && str.length > lastOuterEnd)
        output.push([vN[0], str.slice(lastOuterEnd), lastOuterEnd, str.length]);

    // reset lastIndex in case delimiters were provided as regexes
    left.lastIndex = right.lastIndex = 0;

    return output;
};

