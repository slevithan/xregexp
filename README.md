[XRegExp](http://xregexp.com/)
==============================

XRegExp provides augmented, extensible JavaScript regular expressions. You get new syntax, flags, and methods beyond what browsers support natively. XRegExp is also a regular expression utility belt with tools to make your client-side grepping both simpler and more powerful, while freeing you from worrying about pesky cross-browser inconsistencies.


Usage examples
--------------

```html
<script src="xregexp.js"></script>
<script>
    // named capture and x flag (free-spacing and comments)
    var date = XRegExp('(?<year>  [0-9]{4}) -?  # year  \n\
                        (?<month> [0-9]{2}) -?  # month \n\
                        (?<day>   [0-9]{2})     # day   ', 'x');

    // named capture properties on match result
    var match = date.exec('2012-02-22');
    match.day; // -> '22'

    // named backreferences in replacement
    '2012-02-22'.replace(date, '${month}/${day}/${year}'); // -> '02/22/2012'

    // get array of numbers within <b> tags
    XRegExp.matchChain('1 <b>2</b> 3 <b>4 a 56</b>', [/<b>.*?<\/b>/i, /\d+/]);
    // -> ['2', '4', '56']

    var input = '<a href="http://xregexp.com/">XRegExp</a>\
                 <a href="http://google.com/">Google</a>';

    // get array of backreference-only arrays
    XRegExp.forEach(input, /<a href="([^"]+)">(.*?)<\/a>/, function (match) {
        this.push(match.slice(1));
    }, []);
    // -> [['http://xregexp.com/', 'XRegExp'], ['http://google.com/', 'Google']]
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
