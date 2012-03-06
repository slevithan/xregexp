[XRegExp](http://xregexp.com/) (v2.0.0-dev)
=============================================

XRegExp provides augmented, extensible JavaScript regular expressions. You get new syntax, flags, and methods beyond what browsers support natively. XRegExp is also a regular expression utility belt with tools to make your client-side grepping simpler and more powerful, while freeing you from worrying about pesky cross-browser inconsistencies and the dubious `lastIndex` property.


## A few examples

~~~ js
var date, dateStr, match, str, pos, result = [];

// Using named capture and the x flag (free-spacing and comments)
date = XRegExp('(?<year>  [0-9]{4}) -?  # year  \n\
                (?<month> [0-9]{2}) -?  # month \n\
                (?<day>   [0-9]{2})     # day   ', 'x');

// XRegExp.exec gives you named backreferences on the match result
dateStr = '2012-02-22';
match = XRegExp.exec(dateStr, date);
match.day; // -> '22'

// It also supports optional pos and sticky arguments
str = '<1><2><3><4>5<6>';
pos = 2;
while (match = XRegExp.exec(str, XRegExp.cache('<(\\d+)>'), pos, true)) {
    result.push(match[1]);
    pos = match.index + match[0].length;
}
// result -> ['2', '3', '4']

// XRegExp.replace allows named backreferences in replacements
XRegExp.replace(dateStr, date, '${month}/${day}/${year}'); // -> '02/22/2012'

// In fact, all XRegExps are RegExps and work perfectly with native methods
date.test(dateStr); // -> true

// The only caveat is that named captures must be referred to using numbered backreferences
dateStr.replace(date, '$2/$3/$1'); // -> '02/22/2012'

// If you want, you can extend native methods so you don't have to worry about this
XRegExp.install('natives');
dateStr.replace(date, '${month}/${day}/${year}'); // -> '02/22/2012'
dateStr.replace(date, function (match) {
    return match.month + '/' + match.day + '/' +match.year;
}); // -> '02/22/2012'
date.exec(dateStr).day; // -> 22

// Get an array of backreference-only arrays using XRegExp.forEach
str = '<a href="http://xregexp.com/api/">XRegExp</a>\
       <a href="http://www.google.com/">Google</a>';
XRegExp.forEach(str, XRegExp('<a href="([^"]+)">(.*?)</a>', 'is'), function (match) {
    this.push(match.slice(1));
}, []);
// -> [['http://xregexp.com/api/', 'XRegExp'], ['http://www.google.com/', 'Google']]

// Get an array of numbers within <b> tags using XRegExp.matchChain
XRegExp.matchChain('1 <b>2</b> 3 <b>4 a 56</b>', [/<b>.*?<\/b>/i, /\d+/]);
// -> ['2', '4', '56']

// You can also pass forward and return specific backreferences
XRegExp.matchChain(str, [
    {regex: /<a href="([^"]+)">/i, backref: 1},
    {regex: XRegExp('(?i)^https?://(?<domain>[^/?#]+)'), backref: 'domain'}
]);
// -> ['xregexp.com', 'www.google.com']

// XRegExp regexes get call and apply methods
// To demonstrate, let's first create the function we'll be using...
function filter (array, fn) {
    var res = [];
    array.forEach(function (el) {if (fn.call(null, el)) res.push(el);});
    return res;
}
// Now we can filter arrays using functions and regexes
filter(['a', 'ba', 'ab', 'b'], XRegExp('^a'));
// -> ['a', 'ab']
~~~

These examples should give you an idea of what's possible, but they don't show all of XRegExp's tricks. You can even augment XRegExp's regular expression syntax with addons (see below) or write your own. For the full scoop, see [API](http://xregexp.com/api/), [syntax](http://xregexp.com/syntax/), [flags](http://xregexp.com/flags/), [browser fixes](http://xregexp.com/cross_browser/), and [roadmap](https://github.com/slevithan/XRegExp/wiki/Roadmap).


## XRegExp Unicode Base (v1.0.0-dev)

First include the Unicode Base script:

~~~ html
<script src="xregexp.js"></script>
<script src="addons/unicode/xregexp-unicode-base.js"></script>
~~~

Then you can do this:

~~~ js
var unicodeWord = XRegExp('^\\p{L}+$');
unicodeWord.test('Русский'); // -> true
unicodeWord.test('日本語'); // -> true
unicodeWord.test('العربية'); // -> true
~~~

The base script adds `\p{L}` (and its alias, `\p{Letter}`), but other Unicode categories, scripts, and blocks require addon packages. Try these next examples after additionally including `xregexp-unicode-scripts.js`:

~~~ js
XRegExp('^\\p{Hiragana}+$').test('ひらがな'); // -> true
XRegExp('^[\\p{Latin}\\p{Common}]+$').test('Über Café.'); // -> true
~~~

XRegExp uses the Unicode 6.1 character database (released January 2012).

More details: [Addons: Unicode](http://xregexp.com/plugins/#unicode).


## XRegExp Match Recursive (v0.2.0-dev)

First include the Match Recursive script:

~~~ html
<script src="xregexp.js"></script>
<script src="addons/xregexp-matchrecursive.js"></script>
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

// Sticky mode via the y flag (works everywhere, not just where /y is natively supported)
str = '<1><<<2>>><3>4<5>';
XRegExp.matchRecursive(str, '<', '>', 'gy');
// -> ['1', '<<2>>', '3']
~~~

More details: [Addons: Match Recursive](http://xregexp.com/plugins/#matchRecursive).


## Changelog

* Historical changes: [Version history](http://xregexp.com/history/).
* Planned changes: [Roadmap](https://github.com/slevithan/XRegExp/wiki/Roadmap).


## Authors

XRegExp and addons by [Steven Levithan](http://stevenlevithan.com/).

Tools: Unicode range generators by [Mathias Bynens](http://mathiasbynens.be/). Source file concatenator by [Bjarke Walling](http://twitter.com/walling).

Fork me to show support, fix, and extend.

