[XRegExp](http://xregexp.com/)
==============================

XRegExp provides augmented, extensible JavaScript regular expressions. You get new syntax, flags, and methods beyond what browsers support natively. XRegExp is also a regular expression utility belt with tools to simplify your client-side grepping while obviating cross-browser inconsistencies.


Usage examples
--------------

```html
<script src="xregexp.js"></script>
<script>
    var date = XRegExp('(?<year>  [0-9]{4}) -?  # year  \n\
                        (?<month> [0-9]{2}) -?  # month \n\
                        (?<day>   [0-9]{2})     # day   ', 'x');

    var match = date.exec('2012-02-22');
    console.log(match.day);
    console.log('2012-02-22'.replace(date, '${month}/${day}/${year}'));

    console.log(XRegExp.matchChain('1 <b>2</b> 3 <b>4 a 56</b>',
                                   [/<b>.*?<\/b>/i, /\d+/]));
</script>
```

For the full scoop, see [API](http://xregexp.com/api/), [syntax](http://xregexp.com/syntax/), [flags](http://xregexp.com/flags/), and [browser fixes](http://xregexp.com/cross_browser/).


Unicode plugin usage examples
-----------------------------

```html
    <script src="xregexp.js"></script>
    <script src="xregexp-unicode-base.js"></script>
    <script>
        var word = XRegExp('\\p{L}+');
        console.log(word.test('Русский'));
        console.log(word.test('日本語'));
        console.log(word.test('العربية'));
    </script>
```

More details [here](http://xregexp.com/plugins/).


Changelog
---------

See [version history](http://xregexp.com/history/).
