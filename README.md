[XRegExp](http://xregexp.com/)
==============================

XRegExp provides augmented, extensible JavaScript regular expressions. You get new syntax, flags, and methods beyond what browsers support natively. XRegExp is also a regular expression utility belt with tools to make your client-side grepping simpler and more powerful, while freeing you from worrying about pesky cross-browser inconsistencies and the unreliable `lastIndex` property.


A few usage examples
--------------------

```html
<script src="xregexp.js"></script>
<script>
    var date, match, str, pos = 0, result = [];

    // named capture and the x flag (free-spacing and comments)
    date = new XRegExp('(?<year>  [0-9]{4}) -?  # year  \n\
                        (?<month> [0-9]{2}) -?  # month \n\
                        (?<day>   [0-9]{2})     # day   ', 'x');

    // XRegExp.exec gives you named capture properties on the match result
    match = XRegExp.exec('2012-02-22', date);
    match.day; // -> '22'

    // XRegExp.replace lets you use named backreferences in the replacement
    XRegExp.replace('2012-02-22', date, '${month}/${day}/${year}');
    // -> '02/22/2012'

    // get an array of backreference-only arrays using XRegExp.forEach
    str = '<a href="http://xregexp.com/api/">XRegExp</a>\
           <a href="http://google.com/">Google</a>';
    XRegExp.forEach(str, new XRegExp('<a href="([^"]+)">(.*?)</a>', 'is'), function (match) {
        this.push(match.slice(1));
    }, []);
    // -> [['http://xregexp.com/api/', 'XRegExp'], ['http://google.com/', 'Google']]

    // get an array of numbers within <b> tags using XRegExp.matchChain
    XRegExp.matchChain('1 <b>2</b> 3 <b>4 a 56</b>', [/<b>.*?<\/b>/i, /\d+/]);
    // -> ['2', '4', '56']

    // XRegExp.matchChain can also pass forward and return specific backreferences
    XRegExp.matchChain(str, [
        {regex: /<a href="([^"]+)">/i, backref: 1},
        {regex: new XRegExp('(?i)^https?://(?<domain>[^/?#]+)'), backref: 'domain'}
    ]);
    // -> ['xregexp.com', 'google.com']

    // regexes created by XRegExp get call and apply methods
    // first, the setup...
    function filter (array, fn) {
        var res = [];
        array.forEach(function (el) {if (fn.call(null, el)) res.push(el);});
        return res;
    }
    // now we can filter arrays using functions and regexes
    filter(['a', 'ba', 'ab', 'b'], new XRegExp('^a'));
    // -> ['a', 'ab']

    // XRegExp.exec supports optional pos and sticky arguments
    str = '<1><2><3>4<5>';
    while (match = XRegExp.exec(str, XRegExp.cache('<(\\d+)>'), pos, true)) {
        result.push(match[1]);
        pos = match.index + match[0].length;
    }
    // result -> ['1', '2', '3']
</script>
```

There's plenty more that isn't shown in these examples. You can even augment XRegExp's regular expression syntax with addons or write your own. For the full scoop, see [API](http://xregexp.com/api/), [syntax](http://xregexp.com/syntax/), [flags](http://xregexp.com/flags/), and [browser fixes](http://xregexp.com/cross_browser/).


Unicode Base addon usage examples
---------------------------------

```html
<script src="xregexp.js"></script>
<script src="addons/unicode/xregexp-unicode-base.js"></script>
<script>
    var unicodeWord = new XRegExp('^\\p{L}+$');
    unicodeWord.test('Русский'); // -> true
    unicodeWord.test('日本語'); // -> true
    unicodeWord.test('العربية'); // -> true
</script>

<!-- \p{L} is included in the base script, but other categories, scripts,
and blocks require addon packages -->
<script src="addons/unicode/xregexp-unicode-scripts.js"></script>
<script>
    new XRegExp('^\\p{Katakana}+$').test('カタカナ'); // -> true
</script>
```

XRegExp uses the Unicode 6.1 character database (released 2012-01). More details [here](http://xregexp.com/plugins/#unicode).


Match Recursive addon usage examples
------------------------------------

```html
<script src="xregexp.js"></script>
<script src="addons/xregexp-matchrecursive.js"></script>
<script>
    var str = '(t((e))s)t()(ing)';
    XRegExp.matchRecursive(str, '\\(', '\\)', 'g');
    // -> ['t((e))s', '', 'ing']

    // extended information mode with valueNames
    str = 'Here is <div>a <div>nested</div> tag</div> example.';
    XRegExp.matchRecursive(str, '<div\s*>', '</div>', 'gi', {
        valueNames: ['between', 'left', 'match', 'right']
    });
    // -> [ ['between', 'Here is ', 0, 8],
    // ['left', '<div>', 8, 13],
    // ['match', 'a <div>nested</div> tag', 13, 37],
    // ['right', '</div>', 36, 42],
    // ['between', ' example.', 42, 51] ]

    // omitting unneeded parts with null valueNames, and using escapeChar
    str = '...{1}\\{{function(x,y){return y+x;}}';
    XRegExp.matchRecursive(str, '{', '}', 'g', {
        valueNames: ['literal', null, 'value', null],
        escapeChar: '\\'
    });
    // -> [ ['literal', '...', 0, 3],
    // ['value', '1', 4, 5],
    // ['literal', '\\{', 6, 8],
    // ['value', 'function(x,y){return y+x;}', 9, 35] ]

    // sticky mode via the y flag
    str = '<1><<<2>>><3>4<5>';
    XRegExp.matchRecursive(str, '<', '>', 'gy');
    // -> ['1', '<<2>>', '3']
</script>
```

More details [here](http://xregexp.com/plugins/#matchRecursive).


Changelog
---------

* Historical changes: [Version history](http://xregexp.com/history/).
* Planned changes: [Roadmap](https://github.com/slevithan/XRegExp/wiki/Roadmap).

