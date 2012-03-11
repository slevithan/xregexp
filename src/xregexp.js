/*!
 * XRegExp v2.0.0-beta
 * Copyright 2007-2012 Steven Levithan <http://xregexp.com/>
 * Available under the MIT License
 */

/**
 * XRegExp provides augmented, extensible JavaScript regular expressions. You get new syntax,
 * flags, and methods beyond what browsers support natively. XRegExp is also a regex utility belt
 * with tools to make your client-side grepping simpler and more powerful, while freeing you from
 * worrying about pesky cross-browser inconsistencies and the dubious `lastIndex` property. See
 * XRegExp's documentation (http://xregexp.com/) for more details.
 * @module xregexp
 * @requires N/A
 */

// Avoid running twice; that would duplicate tokens and could break references to native globals
;typeof XRegExp === "undefined" &&
function (root, undefined) {
"use strict";

/*--------------------------------------
 *  Constructor
 *------------------------------------*/

/**
 * Creates an extended regular expression object for matching text with a pattern. Differs from a
 * native regular expression in that additional syntax and flags are supported. The returned object
 * is in fact a native `RegExp` and works with all native methods.
 * @class XRegExp
 * @constructor
 * @param {String} pattern The text of the regular expression.
 * @param {String} [flags] Can have any combination of the following values:
 *   <li>`g` - global
 *   <li>`i` - ignore case
 *   <li>`m` - multiline anchors
 *   <li>`n` - explicit capture
 *   <li>`s` - dot matches all (aka singleline)
 *   <li>`x` - free-spacing and line comments (aka extended)
 *   <li>`y` - sticky (Firefox 3+ only)
 * @returns {RegExp} The extended regular expression object.
 * @example
 *
 * // With named capture and flag x
 * date = XRegExp('(?<year>  [0-9]{4}) -?  # year  \n\
 *                 (?<month> [0-9]{2}) -?  # month \n\
 *                 (?<day>   [0-9]{2})     # day   ', 'x');
 *
 * // Clones the regex, preserving special named capture properties
 * XRegExp(date);
 */
function XRegExp (pattern, flags) {
    if (X.isRegExp(pattern)) {
        if (flags !== undefined)
            throw new TypeError("can't supply flags when constructing one RegExp from another");
        return copy(pattern);
    }
    // Tokens become part of the regex construction process, so protect against infinite recursion
    // when an XRegExp is constructed within a token handler function
    if (isInsideConstructor)
        throw new Error("can't call the XRegExp constructor within token definition functions");
    var output = [],
        scope = defaultScope,
        tokenContext = {
            hasNamedCapture: false,
            captureNames: [],
            hasFlag: function (flag) {return flags.indexOf(flag) > -1;},
            setFlag: function (flag) {flags += flag;}
        },
        pos = 0,
        tokenResult, match, chr;
    pattern = pattern === undefined ? "" : pattern + "";
    flags = flags === undefined ? "" : flags + "";
    while (pos < pattern.length) {
        // Check for custom tokens at the current position
        tokenResult = runTokens(pattern, pos, scope, tokenContext);
        if (tokenResult) {
            output.push(tokenResult.output);
            pos += (tokenResult.match[0].length || 1);
        } else {
            // Check for native tokens (except character classes) at the current position
            if ((match = nativ.exec.call(nativeTokens[scope], pattern.slice(pos)))) {
                output.push(match[0]);
                pos += match[0].length;
            } else {
                chr = pattern.charAt(pos);
                if (chr === "[") scope = classScope;
                else if (chr === "]") scope = defaultScope;
                // Advance position by one character
                output.push(chr);
                pos++;
            }
        }
    }
    return augment(new R(output.join(""), nativ.replace.call(flags, flagClip, "")), tokenContext);
}


/*--------------------------------------
 *  Private variables
 *------------------------------------*/

// Shortcuts
var X = XRegExp,
    R = RegExp,
    S = String;

// Optional features; can be installed and uninstalled
var features = {
    natives: false,
    methods: false,
    extensibility: false
};

// Store native methods to use and restore ("native" is an ES3 reserved keyword)
var nativ = {
    exec: R.prototype.exec,
    test: R.prototype.test,
    match: S.prototype.match,
    replace: S.prototype.replace,
    split: S.prototype.split,
    // Hold these so they can be given back if present before XRegExp runs
    apply: R.prototype.apply,
    call: R.prototype.call
};

// Storage for fixed/extended native methods
var fixed = {};

// Storage for addon tokens
var tokens = [];

// Token scope bitflags
var classScope = 0x1,
    defaultScope = 0x2;

// Storage for regexes that match native regex syntax
var nativeTokens = {};
// Any native multicharacter token in character class scope (includes octals)
nativeTokens[classScope] = /^(?:\\(?:[0-3][0-7]{0,2}|[4-7][0-7]?|x[\dA-Fa-f]{2}|u[\dA-Fa-f]{4}|c[A-Za-z]|[\s\S]))/;
// Any native multicharacter token in default scope (includes octals, excludes character classes)
nativeTokens[defaultScope] = /^(?:\\(?:0(?:[0-3][0-7]{0,2}|[4-7][0-7]?)?|[1-9]\d*|x[\dA-Fa-f]{2}|u[\dA-Fa-f]{4}|c[A-Za-z]|[\s\S])|\(\?[:=!]|[?*+]\?|{\d+(?:,\d*)?}\??)/;

// Any backreference in replacement strings
var replacementToken = /\$(?:(\d\d?|[$&`'])|{([$\w]+)})/g;

// Nonnative and duplicate flags
var flagClip = /[^gimy]+|([\s\S])(?=[\s\S]*\1)/g;

// Any greedy/lazy quantifier
var quantifier = /^(?:[?*+]|{\d+(?:,\d*)?})\??/;

// Check for correct `exec` handling of nonparticipating capturing groups
var compliantExecNpcg = nativ.exec.call(/()??/, "")[1] === undefined;

// Check for correct handling of `lastIndex` after zero-length matches
var compliantLastIndexIncrement = function () {
    var x = /^/g;
    nativ.test.call(x, "");
    return !x.lastIndex;
}();

// Check for flag y support (Firefox 3+)
var hasNativeY = R.prototype.sticky !== undefined;

// Used to kill infinite recursion during XRegExp construction
var isInsideConstructor = false;

// Installed and uninstalled states for `XRegExp.addToken`
var addToken = {
    on: function (regex, handler, scope, trigger) {
        tokens.push({
            pattern: copy(regex, "g" + (hasNativeY ? "y" : "")),
            handler: handler,
            scope: scope || defaultScope,
            trigger: trigger || null
        });
    },
    off: function () {
        throw new Error("extensibility must be installed before running addToken");
    }
};


/*--------------------------------------
 *  Public properties/methods
 *------------------------------------*/

/**
 * The semantic version number.
 * @static
 * @memberOf XRegExp
 * @type String
 */
X.version = "2.0.0-beta";

/**
 * Bitflag for regex character class scope; used by addons.
 * @final
 * @memberOf XRegExp
 * @type Number
 */
X.INSIDE_CLASS = classScope;

/**
 * Bitflag for regex default scope; used by addons.
 * @final
 * @memberOf XRegExp
 * @type Number
 */
X.OUTSIDE_CLASS = defaultScope;

/**
 * Extends or changes XRegExp syntax and allows custom flags. This is used internally by XRegExp
 * and can be used to create XRegExp addons. `XRegExp.install('extensibility')` must be run before
 * calling this function, or an error is thrown. If more than one token can match the same string,
 * the last added wins.
 * @memberOf XRegExp
 * @param {RegExp} regex A regex object that matches the token being added.
 * @param {Function} handler A function that returns a new pattern string (using native regex
 *   syntax) to replace the matched pattern within all future XRegExp regexes. Invoked with two
 *   arguments: The match object, and the regex scope where the match was found. Has access to
 *   persistent properties of the regex being built through `this`.
 * @param {Number} [scope=XRegExp.OUTSIDE_CLASS] The regex scope where the token applies. Use
 *   bitwise OR to include multiple scopes.
 * @param {Function} [trigger] A function that returns `true` if the token should be applied; e.g.,
 *   if a flag is set. If `false` is returned, the matched pattern segment can be matched by other
 *   tokens. Has access to persistent properties of the regex being built through `this`, including
 *   function `this.hasFlag`.
 * @returns {undefined} N/A
 * @example
 *
 * // Adds support for escape sequences: \Q..\E and \Q..
 * XRegExp.addToken(
 *   /\\Q([\s\S]*?)(?:\\E|$)/,
 *   function (match) {return XRegExp.escape(match[1]);},
 *   XRegExp.INSIDE_CLASS | XRegExp.OUTSIDE_CLASS
 * );
 */
X.addToken = addToken.off;

/**
 * Caches and returns the result of calling `XRegExp(pattern, flags)`. On any subsequent call with
 * the same pattern and flag combination, the cached copy is returned.
 * @memberOf XRegExp
 * @param {String} pattern The text of the regular expression.
 * @param {String} [flags] Can have any combination of native and custom flags.
 * @returns {RegExp} The cached XRegExp object.
 * @example
 *
 * while (match = XRegExp.cache('.', 'gs').exec(str)) {
 *   // The regex is compiled once only
 * }
 */
X.cache = function (pattern, flags) {
    var key = pattern + "/" + (flags || "");
    return X.cache[key] || (X.cache[key] = X(pattern, flags));
};

/**
 * Escapes any regular expression metacharacters, for use when matching literal strings. The result
 * can safely be used at any point within a regex that uses any flags.
 * @memberOf XRegExp
 * @param {String} str The string to escape.
 * @returns {String} The escaped string.
 * @example
 *
 * XRegExp.escape('Escaped? [x]');
 */
X.escape = function (str) {
    return nativ.replace.call(str, /[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

// Accepts a string to search, regex to search with, position to start the search within the
// string (default: 0), and an optional Boolean indicating whether matches must start at-or-
// after the position or at the specified position only. This function ignores the `lastIndex`
// of the provided regex in its own handling, but updates the property for compatibility
X.exec = function (str, regex, pos, sticky) {
    var r2 = copy(regex, "g" + ((sticky && hasNativeY) ? "y" : "")),
        match;
    r2.lastIndex = pos = pos || 0;
    match = fixed.exec.call(r2, str); // Fixed `exec` required for `lastIndex` fix, etc.
    if (sticky && match && match.index !== pos)
        match = null;
    if (regex.global)
        regex.lastIndex = match ? r2.lastIndex : 0;
    return match;
};

// Executes `callback` once per match within `str`; returns `context`. Provides a simpler and
// cleaner way to iterate over regex matches compared to the traditional approaches of
// subverting `String.prototype.replace` or repeatedly calling `exec` within a `while` loop
X.forEach = function (str, regex, callback, context) {
    var r2 = X.globalize(regex),
        i = -1, match;
    while ((match = fixed.exec.call(r2, str))) { // Fixed `exec` required for `lastIndex` fix, etc.
        if (regex.global)
            regex.lastIndex = r2.lastIndex; // Doing this to follow expectations if `lastIndex` is checked within `callback`
        callback.call(context, match, ++i, str, regex);
        if (r2.lastIndex === match.index)
            r2.lastIndex++;
    }
    if (regex.global)
        regex.lastIndex = 0;
    return context;
};

// Accepts a `RegExp` instance; returns a copy with the `/g` flag set. The copy has a fresh
// `lastIndex` (set to zero). If you want to copy a regex without forcing the `global`
// property, use `XRegExp(regex)`. Do not use `RegExp(regex)` because it will not preserve
// special properties required for named capture
X.globalize = function (regex) {
    return copy(regex, "g");
};

/**
 * Installs optional features according to the specified options.
 * @memberOf XRegExp
 * @param {String|Object} options Options object.
 * @returns {undefined} N/A
 * @example
 *
 * // With an options object
 * XRegExp.install({
 *   // Overrides native regex methods with fixed/extended versions that support named
 *   // backreferences and fix numerous cross-browser bugs
 *   natives: true,
 *   // Copies the XRegExp.prototype.apply/call methods to RegExp.prototype
 *   methods: true,
 *   // Enables XRegExp syntax and flag extensibility (used by addons)
 *   extensibility: true
 * });
 *
 * // With an options string
 * XRegExp.install('natives methods');
 *
 * // Using a shortcut to install all optional features
 * XRegExp.install('all');
 */
X.install = function (options) {
    options = prepareOptions(options);
    if (!features.natives && options.natives) setNatives(true);
    if (!features.methods && options.methods) setMethods(true);
    if (!features.extensibility && options.extensibility) setExtensibility(true);
};

// Accepts any value; returns a Boolean indicating whether the argument is a `RegExp` object.
// Note that this is also `true` for regex literals and regexes created by the `XRegExp`
// constructor. This works correctly for variables created in another frame, when `instanceof`
// and `constructor` checks would fail to work as intended
X.isRegExp = function (value) {
    return Object.prototype.toString.call(value) === "[object RegExp]";
};

// Checks whether an optional feature is installed
X.isInstalled = function (feature) {
    return !!(features[feature]);
};

/**
 * Retrieves the matches from searching a string using a chain of regexes that successively search
 * within previous matches. The provided `chain` array can contain regexes and objects with `regex`
 * and `backref` properties. When a backreference is specified, the named or numbered backreference
 * is passed forward to the next regex or returned.
 * @memberOf XRegExp
 * @param {String} str The string to search.
 * @param {Array} chain Array of regexes that each search for matches within previous results.
 * @returns {Array} Strings matched by the last regex in the chain. Empty array if no matches.
 * @example
 *
 * // Basic usage; gets numbers within <b> tags
 * XRegExp.matchChain('1 <b>2</b> 3 <b>4 a 56</b>', [
 *   XRegExp('(?is)<b>.*?<\\/b>'),
 *   /\d+/
 * ]);
 *
 * // Passing forward and returning specific backreferences
 * XRegExp.matchChain(str, [
 *   {regex: /<a href="([^"]+)">/i, backref: 1},
 *   {regex: XRegExp('(?i)^https?://(?<domain>[^/?#]+)'), backref: 'domain'}
 * ]);
 */
X.matchChain = function (str, chain) {
    return function recurseChain (values, level) {
        var item = chain[level].regex ? chain[level] : {regex: chain[level]},
            regex = X.globalize(item.regex),
            matches = [], i;
        for (i = 0; i < values.length; i++) {
            X.forEach(values[i], regex, function (match) {
                matches.push(item.backref ? (match[item.backref] || "") : match[0]);
            });
        }
        return ((level === chain.length - 1) || !matches.length) ?
            matches : recurseChain(matches, level + 1);
    }([str], 0);
};

// Returns a new string with one or all matches of a pattern replaced by a replacement. The
// pattern can be a string or a regex, and the replacement can be a string or a function to be
// called for each match. An optional Boolean argument specifies whether to replace the first
// match only or all matches (overrides flag `/g`). Replacement strings can use `${n}` for
// named and numbered backreferences. Replacement functions can use named backreferences via
// `arguments[0].name`
X.replace = function (str, search, replacement, replaceAll) {
    var isRegex = X.isRegExp(search),
        search2 = search,
        result;
    if (isRegex) {
        if (replaceAll === undefined)
            replaceAll = search.global; // Follow flag g when `replaceAll` isn't explicit
        // Note that since a copy is used, `search`'s `lastIndex` isn't updated *during* replacement iterations
        search2 = copy(search, replaceAll ? "g" : "", replaceAll ? "" : "g");
    } else if (replaceAll) {
        search2 = new R(X.escape(search + ""), "g");
    }
    result = fixed.replace.call(str + "", search2, replacement); // Fixed `replace` required for named backreferences, etc.
    if (isRegex && search.global)
        search.lastIndex = 0; // Fixes IE, Safari bug (last tested IE 9, Safari 5.1)
    return result;
};

// Fixes browser bugs in the native `String.prototype.split`
X.split = function (str, separator, limit) {
    return fixed.split.call(str, separator, limit);
};

/**
 * Uninstalls optional features according to the specified options.
 * @memberOf XRegExp
 * @param {String|Object} options Options object.
 * @returns {undefined} N/A
 * @example
 *
 * // With an options object
 * XRegExp.uninstall({
 *   // Restores native regex methods
 *   natives: true,
 *   // Removes added RegExp.prototype methods, or restores to their original values
 *   methods: true,
 *   // Disables additional syntax and flag extensions
 *   extensibility: true
 * });
 *
 * // With an options string
 * XRegExp.uninstall('natives methods');
 *
 * // Using a shortcut to uninstall all optional features
 * XRegExp.uninstall('all');
 */
X.uninstall = function (options) {
    options = prepareOptions(options);
    if (features.natives && options.natives) setNatives(false);
    if (features.methods && options.methods) setMethods(false);
    if (features.extensibility && options.extensibility) setExtensibility(false);
};


/*--------------------------------------
 *  XRegExp.prototype methods
 *------------------------------------*/

// Accepts a context object and arguments array; returns the result of calling `exec` with the
// first value in the arguments array. the context is ignored but is accepted for congruity
// with `Function.prototype.apply`
X.prototype.apply = function (context, args) {
    return this.test(args[0]); // Intentionally doesn't specify fixed/native `test`
};

// Accepts a context object and string; returns the result of calling `exec` with the provided
// string. the context is ignored but is accepted for congruity with `Function.prototype.call`
X.prototype.call = function (context, str) {
    return this.test(str); // Intentionally doesn't specify fixed/native `test`
};


/*--------------------------------------
 *  Fixed/extended native methods
 *------------------------------------*/

// Adds named capture support (with backreferences returned as `result.name`), and fixes
// browser bugs in the native `RegExp.prototype.exec`
fixed.exec = function (str) {
    var match, name, r2, origLastIndex;
    if (!this.global)
        origLastIndex = this.lastIndex;
    match = nativ.exec.apply(this, arguments);
    if (match) {
        // Fix browsers whose `exec` methods don't consistently return `undefined` for
        // nonparticipating capturing groups
        if (!compliantExecNpcg && match.length > 1 && indexOf(match, "") > -1) {
            r2 = new R(this.source, nativ.replace.call(getNativeFlags(this), "g", ""));
            // Using `str.slice(match.index)` rather than `match[0]` in case lookahead allowed
            // matching due to characters outside the match
            nativ.replace.call((str + "").slice(match.index), r2, function () {
                for (var i = 1; i < arguments.length - 2; i++) {
                    if (arguments[i] === undefined)
                        match[i] = undefined;
                }
            });
        }
        // Attach named capture properties
        if (this._xregexp && this._xregexp.captureNames) {
            for (var i = 1; i < match.length; i++) {
                name = this._xregexp.captureNames[i - 1];
                if (name)
                   match[name] = match[i];
            }
        }
        // Fix browsers that increment `lastIndex` after zero-length matches
        if (!compliantLastIndexIncrement && this.global && !match[0].length && (this.lastIndex > match.index))
            this.lastIndex--;
    }
    if (!this.global)
        this.lastIndex = origLastIndex; // Fixes IE, Opera bug (last tested IE 9, Opera 11.6)
    return match;
};

// Fixes browser bugs in the native `RegExp.prototype.test`
fixed.test = function (str) {
    // Do this the easy way :-)
    return !!fixed.exec.call(this, str);
};

// Adds named capture support and fixes browser bugs in the native `String.prototype.match`
fixed.match = function (regex) {
    if (!X.isRegExp(regex))
        regex = new R(regex); // Use native `RegExp`
    if (regex.global) {
        var result = nativ.match.apply(this, arguments);
        regex.lastIndex = 0; // Fixes IE bug
        return result;
    }
    return fixed.exec.call(regex, this);
};

// Adds support for `${n}` tokens for named and numbered backreferences in replacement text,
// and provides named backreferences to replacement functions as `arguments[0].name`. Also
// fixes browser bugs in replacement text syntax when performing a replacement using a nonregex
// search value, and the value of a replacement regex's `lastIndex` property during replacement
// iterations and upon completion. Note that this doesn't support SpiderMonkey's proprietary
// third (`flags`) argument
fixed.replace = function (search, replacement) {
    var isRegex = X.isRegExp(search),
        captureNames, result, str, origLastIndex;
    if (isRegex) {
        if (search._xregexp) captureNames = search._xregexp.captureNames;
        if (!search.global) origLastIndex = search.lastIndex;
    } else {
        search += "";
    }
    if (Object.prototype.toString.call(replacement) === "[object Function]") {
        result = nativ.replace.call(this + "", search, function () {
            if (captureNames) {
                // Change the `arguments[0]` string primitive to a `String` object that can store properties
                arguments[0] = new S(arguments[0]);
                // Store named backreferences on `arguments[0]`
                for (var i = 0; i < captureNames.length; i++) {
                    if (captureNames[i])
                        arguments[0][captureNames[i]] = arguments[i + 1];
                }
            }
            // Update `lastIndex` before calling `replacement`.
            // Fixes IE, Chrome, Firefox, Safari bug (last tested IE 9, Chrome 17, Firefox 10, Safari 5.1)
            if (isRegex && search.global)
                search.lastIndex = arguments[arguments.length - 2] + arguments[0].length;
            return replacement.apply(null, arguments);
        });
    } else {
        str = this + ""; // Ensure `args[args.length - 1]` will be a string when given nonstring `this`
        result = nativ.replace.call(str, search, function () {
            var args = arguments; // Keep this function's `arguments` available through closure
            return nativ.replace.call(replacement + "", replacementToken, function ($0, $1, $2) {
                // Numbered backreference (without delimiters) or special variable
                if ($1) {
                    if ($1 === "$") return "$";
                    if ($1 === "&") return args[0];
                    if ($1 === "`") return args[args.length - 1].slice(0, args[args.length - 2]);
                    if ($1 === "'") return args[args.length - 1].slice(args[args.length - 2] + args[0].length);
                    // Else, numbered backreference
                    /* Assert: `$10` in replacement is one of:
                     *   1. Backreference 10, if 10 or more capturing groups exist.
                     *   2. Backreference 1 followed by `0`, if 1-9 capturing groups exist.
                     *   3. Otherwise, it's the literal string `$10`.
                     * Details:
                     *   - Backreferences cannot be more than two digits (enforced by `replacementToken`).
                     *   - `$01` is equivalent to `$1` if a capturing group exists, otherwise it's the string `$01`.
                     *   - There is no `$0` token (`$&` is the entire match).
                     */
                    var literalNumbers = "";
                    $1 = +$1; // Type-convert; drop leading zero
                    if (!$1) // `$1` was `0` or `00`
                        return $0;
                    while ($1 > args.length - 3) {
                        literalNumbers = S.prototype.slice.call($1, -1) + literalNumbers;
                        $1 = Math.floor($1 / 10); // Drop the last digit
                    }
                    return ($1 ? args[$1] || "" : "$") + literalNumbers;
                // Named backreference or delimited numbered backreference
                } else {
                    /* Assert: `${n}` in replacement is one of:
                     *   1. Backreference to numbered capture `n`. Differences from `$n`:
                     *     a. `n` can be more than two digits.
                     *     b. Backreference 0 is allowed, and is the entire match.
                     *   2. Backreference to named capture `n`, if it exists and is not a number overridden by numbered capture.
                     *   3. Otherwise, it's the literal string `${n}`.
                     */
                    var n = +$2; // Type-convert; drop leading zeros
                    if (n <= args.length - 3)
                        return args[n];
                    n = captureNames ? indexOf(captureNames, $2) : -1;
                    return n > -1 ? args[n + 1] : $0;
                }
            });
        });
    }
    if (isRegex) {
        if (search.global) search.lastIndex = 0; // Fixes IE, Safari bug (last tested IE 9, Safari 5.1)
        else search.lastIndex = origLastIndex; // Fixes IE, Opera bug (last tested IE 9, Opera 11.6)
    }
    return result;
};

// Fixes numerous browser bugs in the native `String.prototype.split`
fixed.split = function (s /*separator*/, limit) {
    // If separator `s` is not a regex, use the native `split`
    if (!X.isRegExp(s))
        return nativ.split.apply(this, arguments);
    var str = this + "",
        output = [],
        lastLastIndex = 0,
        match, lastLength;
    /* Values for `limit`, per the spec:
     * If undefined: 4294967295 // Math.pow(2, 32) - 1
     * If 0, Infinity, or NaN: 0
     * If a positive number: limit = Math.floor(limit); if (limit > 4294967295) limit -= 4294967296;
     * If a negative number: 4294967296 - Math.floor(Math.abs(limit))
     * If other: Type-convert, then use the above rules
     */
    limit = limit === undefined ?
        -1 >>> 0 : // Math.pow(2, 32) - 1
        limit >>> 0; // ToUint32(limit)
    // This is required if not `s.global`, and it avoids needing to set `s.lastIndex` to zero
    // and restore it to its original value when we're done using the regex
    s = X.globalize(s);
    while ((match = fixed.exec.call(s, str))) { // Fixed `exec` required for `lastIndex` fix, etc.
        if (s.lastIndex > lastLastIndex) {
            output.push(str.slice(lastLastIndex, match.index));
            if (match.length > 1 && match.index < str.length)
                Array.prototype.push.apply(output, match.slice(1));
            lastLength = match[0].length;
            lastLastIndex = s.lastIndex;
            if (output.length >= limit)
                break;
        }
        if (s.lastIndex === match.index)
            s.lastIndex++;
    }
    if (lastLastIndex === str.length)
        (!nativ.test.call(s, "") || lastLength) && output.push("");
    else
        output.push(str.slice(lastLastIndex));
    return output.length > limit ? output.slice(0, limit) : output;
};


/*--------------------------------------
 *  Built-in tokens
 *------------------------------------*/

// Default scope is `XRegExp.OUTSIDE_CLASS`.
// The most frequently used tokens are added last

// Temporarily install
X.install("extensibility");

// Shortcut
var XAdd = X.addToken;

/* Unicode token: \p{..}, \P{..}, or \p{^..}
 * This is merely a placeholder that reserves Unicode token syntax. It is overriden by the XRegExp
 * Unicode Base addon
 */
XAdd(/\\[pP]{\^?[^}]*}/,
    function () {
        throw new ReferenceError("Unicode tokens require XRegExp Unicode Base");
    },
    X.INSIDE_CLASS | X.OUTSIDE_CLASS
);

/* Empty character class: [] or [^]
 * Fixes a critical cross-browser syntax inconsistency. Unless this is standardized (per the spec),
 * regex syntax cannot be accurately parsed because character class endings cannot be determined
 */
XAdd(/\[\^?]/,
    function (match) {
        // For cross-browser compatibility with ES3, convert [] to \b\B and [^] to [\s\S].
        // (?!) should work like \b\B, but is unreliable in Firefox
        return match[0] === "[]" ? "\\b\\B" : "[\\s\\S]";
    }
);

/* Comment pattern: (?# )
 * Inline comments are an alternative to the line comments allowed in free-spacing mode (flag x)
 */
XAdd(/\(\?#[^)]*\)/,
    function (match) {
        // Keep tokens separated unless the following token is a quantifier
        return nativ.test.call(quantifier, match.input.slice(match.index + match[0].length)) ? "" : "(?:)";
    }
);

/* Leading mode modifier, with any combination of flags imnsx: (?imnsx)
 * Does not support: ..(?i), (?-i), (?i-m), (?i: ), (?i)(?m), etc.
 */
XAdd(/^\(\?([imnsx]+)\)/,
    function (match) {
        this.setFlag(match[1]);
        return "";
    }
);

/* Named backreference: \k<name>
 * Backreference names can use the characters A–Z, a–z, 0–9, _, and $ only
 */
XAdd(/\\k<([\w$]+)>/,
    function (match) {
        var index = indexOf(this.captureNames, match[1]);
        // Keep backreferences separate from subsequent literal numbers. Preserve back-
        // references to named groups that are undefined at this point as literal strings
        return index > -1 ?
            "\\" + (index + 1) + (isNaN(match.input.charAt(match.index + match[0].length)) ? "" : "(?:)") :
            match[0];
    }
);

/* Whitespace and line comments, in free-spacing mode (aka extended mode, flag x) only
 */
XAdd(/(?:\s+|#.*)+/,
    function (match) {
        // Keep tokens separated unless the following token is a quantifier
        return nativ.test.call(quantifier, match.input.slice(match.index + match[0].length)) ? "" : "(?:)";
    },
    X.OUTSIDE_CLASS,
    function () {return this.hasFlag("x");}
);

/* Dot, in dotall mode (aka singleline mode, flag s) only
 */
XAdd(/\./,
    function () {return "[\\s\\S]";},
    X.OUTSIDE_CLASS,
    function () {return this.hasFlag("s");}
);

/* Named capturing group; match the opening delimiter only: (?<name>
 * Capture names can use the characters A–Z, a–z, 0–9, _, and $ only. Names cannot be integers
 */
XAdd(/\(\?<([$\w]+)>/,
    function (match) {
        if (!isNaN(match[1])) // Avoid incorrect lookups since named backreferences are added to match arrays
            throw new SyntaxError("cannot use an integer as capture name");
        this.captureNames.push(match[1]);
        this.hasNamedCapture = true;
        return "(";
    }
);

/* Capturing group; match the opening parenthesis only.
 * Required for support of named capturing groups. Also adds explicit capture mode (flag n)
 */
XAdd(/\((?!\?)/,
    function () {
        if (this.hasFlag("n")) {
            return "(?:";
        } else {
            this.captureNames.push(null);
            return "(";
        }
    }
);

// Revert to default state
X.uninstall("extensibility");


/*--------------------------------------
 *  Private helper functions
 *------------------------------------*/

function augment (regex, details) {
    return extend(regex, {
        _xregexp: {captureNames: details.hasNamedCapture ? details.captureNames : null},
        // Can't automatically inherit these methods since the XRegExp constructor returns a
        // nonprimitive value
        apply: X.prototype.apply,
        call: X.prototype.call
    });
}

/**
 * Returns a new copy of a `RegExp` object (with its `lastIndex` zeroed), preserving properties
 * required for named capture. Allows adding and removing flags while copying the regex.
 * @private
 * @param {RegExp} regex The regex to copy.
 * @param {String} [addFlags] List of flags to be added while copying the regex.
 * @param {String} [removeFlags] List of flags to be removed while copying the regex.
 * @returns {RegExp} A new copy of the regex, possibly with modified flags.
 */
function copy (regex, addFlags, removeFlags) {
    if (!X.isRegExp(regex))
        throw new TypeError("type RegExp expected");
    var x = regex._xregexp,
        flags = getNativeFlags(regex) + (addFlags || "");
    if (removeFlags)
        flags = nativ.replace.call(flags, new R("[" + removeFlags + "]+", "g"), ""); // Would need to escape `removeFlags` if this wasn't private
    if (x) {
        // Compiling the current (rather than precompilation) source preserves the effects of nonnative source flags
        regex = X(regex.source, flags);
        regex._xregexp = {captureNames: x.captureNames ? x.captureNames.slice(0) : null};
    } else {
        // Remove duplicate flags to avoid throwing
        flags = nativ.replace.call(flags, /([\s\S])(?=[\s\S]*\1)/g, "");
        // Don't use `XRegExp`; avoid searching for special tokens and adding special properties
        regex = new R(regex.source, flags);
    }
    return regex;
}

/**
 * Copy properties of `b` to `a`.
 * @private
 * @param {Object} a The property-receiving object.
 * @param {Object} b The property-providing object.
 * @returns {Object} The augmented `a` object.
 */
function extend (a, b) {
    for (var p in b)
        b.hasOwnProperty(p) && (a[p] = b[p]);
    return a;
}

function getNativeFlags (regex) {
    //return nativ.exec.call(/\/([a-z]*)$/i, regex + "")[1];
    return (regex.global     ? "g" : "") +
           (regex.ignoreCase ? "i" : "") +
           (regex.multiline  ? "m" : "") +
           (regex.extended   ? "x" : "") + // Proposed for ES4; included in AS3
           (regex.sticky     ? "y" : ""); // Included in Firefox 3+
}

function indexOf (array, item, from) {
    if (Array.prototype.indexOf) // Use the native array method if available
        return array.indexOf(item, from);
    for (var i = from || 0; i < array.length; i++) {
        if (array[i] === item)
            return i;
    }
    return -1;
}

/**
 * Prepares an options object from the given value.
 * @private
 * @param {String|Object} value The value to convert to an options object.
 * @returns {Object} The options object.
 */
function prepareOptions (value) {
    value = value || {};
    if (value === "all" || value.all)
        value = {natives: true, methods: true, extensibility: true};
    else if (typeof value === "string")
        value = X.forEach(value, /[^\s,]+/, function (m) {this[m] = true;}, {});
    return value;
}

function runTokens (pattern, index, scope, context) {
    var i = tokens.length,
        result, match, t;
    // Protect against constructing XRegExps within token handler and trigger functions
    isInsideConstructor = true;
    // Must reset `isInsideConstructor`, even if a `trigger` or `handler` throws
    try {
        while (i--) { // Run in reverse order
            t = tokens[i];
            if ((scope & t.scope) && (!t.trigger || t.trigger.call(context))) {
                t.pattern.lastIndex = index;
                match = fixed.exec.call(t.pattern, pattern); // Fixed `exec` here allows use of named backreferences, etc.
                if (match && match.index === index) {
                    result = {
                        output: t.handler.call(context, match, scope),
                        match: match
                    };
                    break;
                }
            }
        }
    } catch (err) {
        throw err;
    } finally {
        isInsideConstructor = false;
    }
    return result;
}

function setExtensibility (on) {
    X.addToken = addToken[on ? "on" : "off"];
    features.extensibility = on;
}

function setMethods (on) {
    if (on) {
        R.prototype.apply = X.prototype.apply;
        R.prototype.call = X.prototype.call;
    } else {
        // Restore methods if they existed before XRegExp ran; otherwise delete
        nativ.apply ? R.prototype.apply = nativ.apply : delete R.prototype.apply;
        nativ.call ? R.prototype.call = nativ.call : delete R.prototype.call;
    }
    features.methods = on;
}

function setNatives (on) {
    R.prototype.exec = (on ? fixed : nativ).exec;
    R.prototype.test = (on ? fixed : nativ).test;
    S.prototype.match = (on ? fixed : nativ).match;
    S.prototype.replace = (on ? fixed : nativ).replace;
    S.prototype.split = (on ? fixed : nativ).split;
    features.natives = on;
}


/*--------------------------------------
 *  Expose XRegExp
 *------------------------------------*/

if (typeof exports === "undefined")
    root.XRegExp = X; // Create global varable
else // For CommonJS enviroments
    exports.XRegExp = X;

}(this);

