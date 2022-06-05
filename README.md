# XRegExp 5.1.1

[![Build Status](https://github.com/slevithan/xregexp/workflows/Node.js%20CI/badge.svg)](https://github.com/slevithan/xregexp/actions)

XRegExp provides augmented (and extensible) JavaScript regular expressions. You get modern syntax and flags beyond what browsers support natively. XRegExp is also a regex utility belt with tools to make your grepping and parsing easier, while freeing you from regex cross-browser inconsistencies and other annoyances.

XRegExp supports all native ES6 regular expression syntax. It supports ES5+ browsers, and you can use it with Node.js or as a RequireJS module. Over the years, many of XRegExp's features have been adopted by new JavaScript standards (named capturing, Unicode properties/scripts/categories, flag `s`, sticky matching, etc.), so using XRegExp can be a way to extend these features into older browsers.

## Performance

XRegExp compiles to native `RegExp` objects. Therefore regexes built with XRegExp perform just as fast as native regular expressions. There is a tiny extra cost when compiling a pattern for the first time.

## Named capture breaking change in XRegExp 5

XRegExp 5 introduced a breaking change where named backreference properties now appear on the result's `groups` object (following ES2018), rather than directly on the result. To restore the old handling so you don't need to update old code, run the following line after importing XRegExp:

```js
XRegExp.uninstall('namespacing');
```

XRegExp 4.1.0 and later allow introducing the new behavior without upgrading to XRegExp 5 by running `XRegExp.install('namespacing')`.

Following is the most commonly needed change to update code for the new behavior:

```js
// Change this
const name = XRegExp.exec(str, regexWithNamedCapture).name;

// To this
const name = XRegExp.exec(str, regexWithNamedCapture).groups.name;
```

See below for more examples of using named capture with `XRegExp.exec` and `XRegExp.replace`.

## Usage examples

```js
// Using named capture and flag x for free-spacing and line comments
const date = XRegExp(
    `(?<year>  [0-9]{4} ) -?  # year
     (?<month> [0-9]{2} ) -?  # month
     (?<day>   [0-9]{2} )     # day`, 'x');

// XRegExp.exec provides named backreferences on the result's groups property
let match = XRegExp.exec('2021-02-22', date);
match.groups.year; // -> '2021'

// It also includes optional pos and sticky arguments
let pos = 3;
const result = [];
while (match = XRegExp.exec('<1><2><3>4<5>', /<(\d+)>/, pos, 'sticky')) {
    result.push(match[1]);
    pos = match.index + match[0].length;
}
// result -> ['2', '3']

// XRegExp.replace allows named backreferences in replacements
XRegExp.replace('2021-02-22', date, '$<month>/$<day>/$<year>');
// -> '02/22/2021'
XRegExp.replace('2021-02-22', date, (...args) => {
    // Named backreferences are on the last argument
    const groups = args[args.length - 1];
    return `${groups.month}/${groups.day}/${groups.year}`;
});
// -> '02/22/2021'

// XRegExps compile to RegExps and work with native methods
date.test('2021-02-22');
// -> true
// However, named captures must be referenced using numbered backreferences
// if used with native methods
'2021-02-22'.replace(date, '$2/$3/$1');
// -> '02/22/2021'

// Use XRegExp.forEach to extract every other digit from a string
const evens = [];
XRegExp.forEach('1a2345', /\d/, (match, i) => {
    if (i % 2) evens.push(+match[0]);
});
// evens -> [2, 4]

// Use XRegExp.matchChain to get numbers within <b> tags
XRegExp.matchChain('1 <b>2</b> 3 <B>4 \n 56</B>', [
    XRegExp('<b>.*?</b>', 'is'),
    /\d+/
]);
// -> ['2', '4', '56']

// You can also pass forward and return specific backreferences
const html =
    `<a href="https://xregexp.com/">XRegExp</a>
     <a href="https://www.google.com/">Google</a>`;
XRegExp.matchChain(html, [
    {regex: /<a href="([^"]+)">/i, backref: 1},
    {regex: XRegExp('(?i)^https?://(?<domain>[^/?#]+)'), backref: 'domain'}
]);
// -> ['xregexp.com', 'www.google.com']

// Merge strings and regexes, with updated backreferences
XRegExp.union(['m+a*n', /(bear)\1/, /(pig)\1/], 'i', {conjunction: 'or'});
// -> /m\+a\*n|(bear)\1|(pig)\2/i
```

These examples give the flavor of what's possible, but XRegExp has more syntax, flags, methods, options, and browser fixes that aren't shown here. You can also augment XRegExp's regular expression syntax with addons (see below) or write your own. See [xregexp.com](https://xregexp.com/) for details.

## Addons

You can either load addons individually, or bundle all addons with XRegExp by loading `xregexp-all.js` from https://unpkg.com/xregexp/xregexp-all.js.

### Unicode

If not using `xregexp-all.js`, first include the Unicode Base script and then one or more of the addons for Unicode categories, properties, or scripts.

Then you can do this:

```js
// Test some Unicode scripts
// Can also use the Script= prefix to match ES2018: \p{Script=Hiragana}
XRegExp('^\\p{Hiragana}+$').test('ひらがな'); // -> true
XRegExp('^[\\p{Latin}\\p{Common}]+$').test('Über Café.'); // -> true

// Test the Unicode categories Letter and Mark
// Can also use the short names \p{L} and \p{M}
const unicodeWord = XRegExp.tag()`^\p{Letter}[\p{Letter}\p{Mark}]*$`;
unicodeWord.test('Русский'); // -> true
unicodeWord.test('日本語'); // -> true
unicodeWord.test('العربية'); // -> true
```

By default, `\p{…}` and `\P{…}` support the Basic Multilingual Plane (i.e. code points up to `U+FFFF`). You can opt-in to full 21-bit Unicode support (with code points up to `U+10FFFF`) on a per-regex basis by using flag `A`. This is called *astral mode*. You can automatically add flag `A` for all new regexes by running `XRegExp.install('astral')`. When in astral mode, `\p{…}` and `\P{…}` always match a full code point rather than a code unit, using surrogate pairs for code points above `U+FFFF`.

```js
// Using flag A to match astral code points
XRegExp('^\\p{S}$').test('💩'); // -> false
XRegExp('^\\p{S}$', 'A').test('💩'); // -> true
// Using surrogate pair U+D83D U+DCA9 to represent U+1F4A9 (pile of poo)
XRegExp('^\\p{S}$', 'A').test('\uD83D\uDCA9'); // -> true

// Implicit flag A
XRegExp.install('astral');
XRegExp('^\\p{S}$').test('💩'); // -> true
```

Opting in to astral mode disables the use of `\p{…}` and `\P{…}` within character classes. In astral mode, use e.g. `(\pL|[0-9_])+` instead of `[\pL0-9_]+`.

XRegExp uses Unicode 14.0.0.

### XRegExp.build

Build regular expressions using named subpatterns, for readability and pattern reuse:

```js
const time = XRegExp.build('(?x)^ {{hours}} ({{minutes}}) $', {
    hours: XRegExp.build('{{h12}} : | {{h24}}', {
        h12: /1[0-2]|0?[1-9]/,
        h24: /2[0-3]|[01][0-9]/
    }),
    minutes: /^[0-5][0-9]$/
});

time.test('10:59'); // -> true
XRegExp.exec('10:59', time).groups.minutes; // -> '59'
```

Named subpatterns can be provided as strings or regex objects. A leading `^` and trailing unescaped `$` are stripped from subpatterns if both are present, which allows embedding independently-useful anchored patterns. `{{…}}` tokens can be quantified as a single unit. Any backreferences in the outer pattern or provided subpatterns are automatically renumbered to work correctly within the larger combined pattern. The syntax `({{name}})` works as shorthand for named capture via `(?<name>{{name}})`. Named subpatterns cannot be embedded within character classes.

#### XRegExp.tag (included with XRegExp.build)

Provides tagged template literals that create regexes with XRegExp syntax and flags:

```js
XRegExp.tag()`\b\w+\b`.test('word'); // -> true

const hours = /1[0-2]|0?[1-9]/;
const minutes = /(?<minutes>[0-5][0-9])/;
const time = XRegExp.tag('x')`\b ${hours} : ${minutes} \b`;
time.test('10:59'); // -> true
XRegExp.exec('10:59', time).groups.minutes; // -> '59'

const backref1 = /(a)\1/;
const backref2 = /(b)\1/;
XRegExp.tag()`${backref1}${backref2}`.test('aabb'); // -> true
```

`XRegExp.tag` does more than just interpolation. You get all the XRegExp syntax and flags, and since it reads patterns as raw strings, you no longer need to escape all your backslashes. `XRegExp.tag` also uses `XRegExp.build` under the hood, so you get all of its extras for free. Leading `^` and trailing unescaped `$` are stripped from interpolated patterns if both are present (to allow embedding independently useful anchored regexes), interpolating into a character class is an error (to avoid unintended meaning in edge cases), interpolated patterns are treated as atomic units when quantified, interpolated strings have their special characters escaped, and any backreferences within an interpolated regex are rewritten to work within the overall pattern.

### XRegExp.matchRecursive

A robust and flexible API for matching recursive constructs using XRegExp pattern strings as left and right delimiters:

```js
const str1 = '(t((e))s)t()(ing)';
XRegExp.matchRecursive(str1, '\\(', '\\)', 'g');
// -> ['t((e))s', '', 'ing']

// Extended information mode with valueNames
const str2 = 'Here is <div> <div>an</div></div> example';
XRegExp.matchRecursive(str2, '<div\\s*>', '</div>', 'gi', {
    valueNames: ['between', 'left', 'match', 'right']
});
/* -> [
{name: 'between', value: 'Here is ',       start: 0,  end: 8},
{name: 'left',    value: '<div>',          start: 8,  end: 13},
{name: 'match',   value: ' <div>an</div>', start: 13, end: 27},
{name: 'right',   value: '</div>',         start: 27, end: 33},
{name: 'between', value: ' example',       start: 33, end: 41}
] */

// Omitting unneeded parts with null valueNames, and using escapeChar
const str3 = '...{1}.\\{{function(x,y){return {y:x}}}';
XRegExp.matchRecursive(str3, '{', '}', 'g', {
    valueNames: ['literal', null, 'value', null],
    escapeChar: '\\'
});
/* -> [
{name: 'literal', value: '...',  start: 0, end: 3},
{name: 'value',   value: '1',    start: 4, end: 5},
{name: 'literal', value: '.\\{', start: 6, end: 9},
{name: 'value',   value: 'function(x,y){return {y:x}}', start: 10, end: 37}
] */

// Sticky mode via flag y
const str4 = '<1><<<2>>><3>4<5>';
XRegExp.matchRecursive(str4, '<', '>', 'gy');
// -> ['1', '<<2>>', '3']

// Skipping unbalanced delimiters instead of erroring
const str5 = 'Here is <div> <div>an</div> unbalanced example';
XRegExp.matchRecursive(str5, '<div\\s*>', '</div>', 'gi', {
    unbalanced: 'skip'
});
// -> ['an']
```

By default, `XRegExp.matchRecursive` throws an error if it scans past an unbalanced delimiter in the target string. Multiple alternative options are available for handling unbalanced delimiters.

## Installation and usage

In browsers (bundle XRegExp with all of its addons):

```html
<script src="https://unpkg.com/xregexp/xregexp-all.js"></script>
```

Using [npm](https://www.npmjs.com/):

```bash
npm install xregexp
```

In [Node.js](https://nodejs.org/en/):

```js
const XRegExp = require('xregexp');
```

## Contribution guide

1. Fork the repository and clone the forked version locally.
2. Ensure you have the `typescript` module installed globally.
3. Run `npm install`.
4. Ensure all tests pass with `npm test`.
5. Add tests for new functionality or that fail from the bug not fixed.
6. Implement functionality or bug fix to pass the test.

## Credits

XRegExp project collaborators are:

- [Steven Levithan](https://blog.stevenlevithan.com/)
- [Joseph Frazier](https://github.com/josephfrazier)
- [Mathias Bynens](https://mathiasbynens.be/)

Thanks to all contributors and others who have submitted code, provided feedback, reported bugs, and inspired new features.

XRegExp is released under the [MIT License](https://mit-license.org/). Learn more at [xregexp.com](https://xregexp.com/).
