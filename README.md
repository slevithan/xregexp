[XRegExp](http://xregexp.com/)
==============================

XRegExp provides augmented, extensible JavaScript regular expressions. You get new syntax, flags, and methods beyond what browsers support natively. XRegExp is also a regular expression utility belt with tools to make your client-side grepping both simpler and more powerful, while freeing you from worrying about pesky cross-browser inconsistencies.


Usage examples
--------------

```html
<script src="xregexp.js"></script>
<script>
    var date, match, str, pos = 0, result = [];

    // named capture and x flag (free-spacing and comments)
    date = new XRegExp('(?<year>  [0-9]{4}) -?  # year  \n\
                        (?<month> [0-9]{2}) -?  # month \n\
                        (?<day>   [0-9]{2})     # day   ', 'x');

    // named capture properties on match result
    match = date.exec('2012-02-22');
    match.day; // -> '22'

    // named backreferences in replacement
    '2012-02-22'.replace(date, '${month}/${day}/${year}'); // -> '02/22/2012'

    str = '<a href="http://xregexp.com/api/">XRegExp</a>\
           <a href="http://google.org/">Google</a>';

    // get array of backreference-only arrays using XRegExp.forEach
    XRegExp.forEach(str, new XRegExp('<a href="([^"]+)">(.*?)</a>', 'is'), function (match) {
        this.push(match.slice(1));
    }, []);
    // -> [['http://xregexp.com/api/', 'XRegExp'], ['http://google.com/', 'Google']]

    // get array of numbers within <b> tags using XRegExp.matchChain
    XRegExp.matchChain('1 <b>2</b> 3 <b>4 a 56</b>', [/<b>.*?<\/b>/i, /\d+/]);
    // -> ['2', '4', '56']

    // XRegExp.matchChain can also pass forward and return specific backreferences
    XRegExp.matchChain(str, [
        {regex: /<a href="([^"]+)">/i, backref: 1},
        {regex: new XRegExp('(?i)^https?://(?<domain>[^/?#]+)'), backref: 'domain'}
    ]);
    // -> ['xregexp.com', 'google.org']

    // regexes get call and apply methods
    // first, some setup...
    function validate (str, validators) {
        for (var i = 0; i < validators.length; i++)
            if (!validators[i].call(null, str)) return false;
        return true;
    }

    // now we can pass both functions and regexes to our validator
    validate('password!', [
        function (str) {return str.length >= 8}, // Eight or more characters
        /[\W_]/ // At least one special character
    ]);
    // -> true

    // XRegExp.exec supports optional pos and sticky arguments
    str = '123a5';
    while (match = XRegExp.exec(str, XRegExp.cache('\d'), pos, true)) {
        result.push(match[0]);
        pos = regex.lastIndex;
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
    var word = XRegExp('\\p{L}+');
    console.log(word.test('Русский'));
    console.log(word.test('日本語'));
    console.log(word.test('العربية'));
</script>
```

More details [here](http://xregexp.com/plugins/#unicode).


Changelog
---------

* Historical changes: [Version history](http://xregexp.com/history/).
* Planned changes: [Roadmap](https://github.com/slevithan/XRegExp/wiki/Roadmap).
