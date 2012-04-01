[XRegExp](http://xregexp.com/)
==============================

XRegExp provides augmented, extensible JavaScript regular expressions. You get new syntax, flags, and methods beyond what browsers support natively. XRegExp is also a regular expression utility belt with tools to make your client-side grepping simpler and more powerful, while freeing you from worrying about pesky cross-browser inconsistencies and the dubious `lastIndex` property.


## Usage examples

Note that these examples take advantage of new features in XRegExp v2.0.0-beta ([details](https://github.com/slevithan/XRegExp/wiki/Roadmap)).

~~~ js
// Using named capture and flag x (free-spacing and line comments)
var date = XRegExp('(?<year>  [0-9]{4}) -?  # year  \n\
                    (?<month> [0-9]{2}) -?  # month \n\
                    (?<day>   [0-9]{2})     # day   ', 'x');

// XRegExp.exec gives you named backreferences on the match result
var match = XRegExp.exec('2012-02-22', date);
match.day; // -> '22'

// It also includes optional pos and sticky arguments
var pos = 2, result = [];
while (match = XRegExp.exec('<1><2><3><4>5<6>', /<(\d+)>/, pos, 'sticky')) {
    result.push(match[1]);
    pos = match.index + match[0].length;
} // result -> ['2', '3', '4']

// XRegExp.replace allows named backreferences in replacements
XRegExp.replace('2012-02-22', date, '${month}/${day}/${year}'); // -> '02/22/2012'
XRegExp.replace('2012-02-22', date, function (match) {
    return match.month + '/' + match.day + '/' +match.year;
}); // -> '02/22/2012'

// In fact, all XRegExps are RegExps and work perfectly with native methods
date.test('2012-02-22'); // -> true

// The *only* caveat is that named captures must be referred to using numbered backreferences
'2012-02-22'.replace(date, '$2/$3/$1'); // -> '02/22/2012'

// If you want, you can extend native methods so you don't have to worry about this
// Doing so also fixes numerous browser bugs in the native methods
XRegExp.install('natives');
'2012-02-22'.replace(date, '${month}/${day}/${year}'); // -> '02/22/2012'
'2012-02-22'.replace(date, function (match) {
    return match.month + '/' + match.day + '/' +match.year;
}); // -> '02/22/2012'
date.exec('2012-02-22').day; // -> 22

// Extract every other digit from a string using XRegExp.forEach
XRegExp.forEach("1a2345", /\d/, function (match, i) {
    if (i % 2) this.push(+match[0]);
}, []); // -> [2, 4]

// Get numbers within <b> tags using XRegExp.matchChain
XRegExp.matchChain('1 <b>2</b> 3 <b>4 a 56</b>', [
    XRegExp('(?is)<b>.*?<\\/b>'),
    /\d+/
]); // -> ['2', '4', '56']

// You can also pass forward and return specific backreferences
var html = '<a href="http://xregexp.com/">XRegExp</a>\
            <a href="http://www.google.com/">Google</a>';
XRegExp.matchChain(html, [
    {regex: /<a href="([^"]+)">/i, backref: 1},
    {regex: XRegExp('(?i)^https?://(?<domain>[^/?#]+)'), backref: 'domain'}
]); // -> ['xregexp.com', 'www.google.com']
~~~

These examples should give you an idea of what's possible, but XRegExp has plenty more tricks that aren't shown here. You can even augment XRegExp's regular expression syntax with addons (see below) or write your own. For the full scoop, see [API](http://xregexp.com/api/), [syntax](http://xregexp.com/syntax/), [flags](http://xregexp.com/flags/), and [browser fixes](http://xregexp.com/cross_browser/).


## XRegExp Unicode Base

First include the Unicode Base script:

~~~ html
<script src="xregexp.js"></script>
<script src="addons/unicode/unicode-base.js"></script>
~~~

Then you can do this:

~~~ js
var unicodeWord = XRegExp('^\\p{L}+$');
unicodeWord.test('Русский'); // -> true
unicodeWord.test('日本語'); // -> true
unicodeWord.test('العربية'); // -> true
~~~

The base script adds `\p{Letter}` and its alias `\p{L}`, but other Unicode categories, scripts, blocks, and properties require addon packages. Try these next examples after additionally including `unicode-scripts.js`:

~~~ js
XRegExp('^\\p{Hiragana}+$').test('ひらがな'); // -> true
XRegExp('^[\\p{Latin}\\p{Common}]+$').test('Über Café.'); // -> true
~~~

XRegExp uses the Unicode 6.1 character database (released January 2012).

More details: [Addons: Unicode](http://xregexp.com/plugins/#unicode).


## XRegExp.matchRecursive

First include the script:

~~~ html
<script src="xregexp.js"></script>
<script src="addons/matchrecursive.js"></script>
~~~

You can then match recursive constructs using XRegExp patterns as left and right delimiters:

~~~ js
var str = '(t((e))s)t()(ing)';
XRegExp.matchRecursive(str, '\\(', '\\)', 'g');
// -> ['t((e))s', '', 'ing']

// Extended information mode with valueNames
str = 'Here is <div>a <div>nested</div> tag</div> example.';
XRegExp.matchRecursive(str, '<div\\s*>', '</div>', 'gi', {
    valueNames: ['between', 'left', 'match', 'right']
});
// -> [['between', 'Here is ', 0, 8],
// ['left', '<div>', 8, 13],
// ['match', 'a <div>nested</div> tag', 13, 37],
// ['right', '</div>', 36, 42],
// ['between', ' example.', 42, 51]]

// Omitting unneeded parts with null valueNames, and using escapeChar
str = '...{1}\\{{function(x,y){return y+x;}}';
XRegExp.matchRecursive(str, '{', '}', 'g', {
    valueNames: ['literal', null, 'value', null],
    escapeChar: '\\'
});
// -> [['literal', '...', 0, 3],
// ['value', '1', 4, 5],
// ['literal', '\\{', 6, 8],
// ['value', 'function(x,y){return y+x;}', 9, 35]]

// Sticky mode via flag y
str = '<1><<<2>>><3>4<5>';
XRegExp.matchRecursive(str, '<', '>', 'gy');
// -> ['1', '<<2>>', '3']
~~~

More details: [Addons: Match Recursive](http://xregexp.com/plugins/#matchRecursive).


## XRegExp.build

First include the script:

~~~ html
<script src="xregexp.js"></script>
<script src="addons/build.js"></script>
~~~

You can then build complex regular expressions that use named subpatterns, for readability and code reuse:

~~~ js
var color = XRegExp.build("{{keyword}}|{{func}}|{{hex}}", {
    keyword: /^(?:red|tan|[a-z]{4,20})$/,
    func: XRegExp.build("^(?:rgb|hsl)a?\\((?:\\s*{{number}}%?\\s*,?\\s*){3,4}\\)$", {
        number: /^-?\d+(?:\.\d+)?$/
    }),
    hex: /^#(?:[0-9a-f]{1,2}){3}$/
});
~~~

The `{{…}}` syntax works only for regexes created by `XRegExp.build`. If present, a leading `^` and trailing `$` are stripped from subpatterns provided as regex objects.


## How to run server-side tests

~~~ bash
npm install -g qunit  # needed to run the tests
npm test  # in the xregexp root directory
~~~


## Changelog

* Historical changes: [Version history](http://xregexp.com/history/).
* Planned changes: [Roadmap](https://github.com/slevithan/XRegExp/wiki/Roadmap).


## About

XRegExp and addons copyright 2007-2012 by [Steven Levithan](http://stevenlevithan.com/).

Tools: Unicode range generators by [Mathias Bynens](http://mathiasbynens.be/). Source file concatenator by [Bjarke Walling](http://twitter.com/walling).

Thanks to [Lea Verou](http://lea.verou.me/) for the [inspiration](http://lea.verou.me/2011/03/create-complex-regexps-more-easily/) behind addon `XRegExp.build`.

All code released under the [MIT License](http://opensource.org/licenses/mit-license.php).

Fork me to show support, fix, and extend.

