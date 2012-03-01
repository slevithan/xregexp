[XRegExp](http://xregexp.com/)
==============================

XRegExp provides augmented, extensible JavaScript regular expressions. You get new syntax, flags, and methods beyond what browsers support natively. XRegExp is also a regular expression utility belt with tools to make your client-side grepping both simpler and more powerful, while freeing you from worrying about pesky cross-browser inconsistencies.


Usage examples
--------------

```html
<script src="xregexp.js"></script>
<script>
    var date, match, str, pos = 0, result = [];

    // named capture and the x flag (free-spacing and comments)
    date = new XRegExp('(?<year>  [0-9]{4}) -?  # year  \n\
                        (?<month> [0-9]{2}) -?  # month \n\
                        (?<day>   [0-9]{2})     # day   ', 'x');

    // named capture properties on the match result
    match = date.exec('2012-02-22');
    match.day; // -> '22'

    // named backreferences in the replacement
    '2012-02-22'.replace(date, '${month}/${day}/${year}'); // -> '02/22/2012'

    str = '<a href="http://xregexp.com/api/">XRegExp</a>\
           <a href="http://google.org/">Google</a>';

    // get an array of backreference-only arrays using XRegExp.forEach
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
    // -> ['xregexp.com', 'google.org']

    // regexes get call and apply methods
    // first, the setup...
    function validate (str, validators) {
        for (var i = 0; i < validators.length; i++)
            if (!validators[i].call(null, str)) return false;
        return true;
    }

    // now we can pass both functions and regexes to our validator
    validate('password!', [
        function (str) {return str.length >= 8}, // eight or more characters
        new XRegExp('[\\W_]') // at least one special character
    ]);
    // -> true

    // XRegExp.exec supports optional pos and sticky arguments
    str = '<1><2><3>4<5>';
    while (match = XRegExp.exec(str, XRegExp.cache('<(\\d+)>'), pos, true)) {
        result.push(match[1]);
        pos = match.index + match[0].length;
    }
    // result -> ['1', '2', '3']
</script>
```

For the full scoop, see [API](http://xregexp.com/api/), [syntax](http://xregexp.com/syntax/), [flags](http://xregexp.com/flags/), and [browser fixes](http://xregexp.com/cross_browser/).


Unicode Base addon usage examples
---------------------------------

```html
<script src="xregexp.js"></script>
<script src="addons/unicode/xregexp-unicode-base.js"></script>
<script>
    var unicodeWord = XRegExp('^\\p{L}+$');
    unicodeWord.test('Русский'); // -> true
    unicodeWord.test('日本語'); // -> true
    unicodeWord.test('العربية'); // -> true
</script>

<!-- \p{L} is included in the base script, but other categories, scripts,
and blocks require addon packages -->
<script src="addons/unicode/xregexp-unicode-scripts.js"></script>
<script>
    XRegExp('^\\p{Katakana}+$').test('カタカナ'); // -> true
</script>
```

XRegExp uses the Unicode 6.1 character database (released 2012-01). More details [here](http://xregexp.com/plugins/#unicode).


Match Recursive addon usage examples
---------------------------------

```html
<script src="xregexp.js"></script>
<script src="addons/xregexp-matchrecursive.js"></script>
<script>
    var input = '(t((e))s)t()(ing)';
    XRegExp.matchRecursive(input, '\\(', '\\)', 'g');
    // -> ['t((e))s', '', 'ing']

    // ignoring escaped delimiters
    input = 't\\{e\\\\{s{t\\{i}ng}';
    XRegExp.matchRecursive(input, '{', '}', 'g', {escapeChar: '\\'});
    // -> ['s{t\\{i}ng']

    // extended information mode with valueNames
    input = 'Here is <div>a <div>nested</div> tag.</div>';
    XRegExp.matchRecursive(input, '<div\s*>', '</div>', 'i',
                           {valueNames: ['text', 'left', 'match', 'right']});
    // ->
    // [['text', 'Here is ', 0, 8],
    //  ['left', '<div>', 8, 13],
    //  ['match', 'a <div>nested</div> tag.', 13, 37],
    //  ['right', '</div>', 37, 43]]

    // omitting unneeded parts with null valueNames
    input = '...{1}..{function(x,y){return y+x;}}';
    XRegExp.matchRecursive(input, '{', '}', 'g',
                           {valueNames: ['literal', null, 'value', null]});
    // ->
    // [['literal', '...', 0, 3],
    //  ['value', '1', 4, 5],
    //  ['literal', '..', 6, 8],
    //  ['value', 'function(x,y){return y+x;}', 9, 35]]

    // sticky mode
    input = '<1><2><3>4<5>';
    XRegExp.matchRecursive(input, '<', '>', 'gy');
    // -> ['1', '2', '3']
</script>
```


Changelog
---------

* Historical changes: [Version history](http://xregexp.com/history/).
* Planned changes: [Roadmap](https://github.com/slevithan/XRegExp/wiki/Roadmap).

