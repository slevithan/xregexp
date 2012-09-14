(function() {
    var outputBox = document.getElementById('log');
    var suites = [];
    var bo = Benchmark.options;
    var bso = Benchmark.Suite.options;

    function log(msg) {
        outputBox.insertAdjacentHTML('beforeend', msg.replace(/\n/g, '<br>'));
    }

    window.run = function() {
        log('Sit back and relax; this might take a while.\n');
        suites[0].run();
    }

    function scrollToEnd() {
        window.scroll(0, document.body.scrollHeight);
    }

    bo.async = true;

    bso.onStart = function() {
        log('\n' + this.name + ':');
    };

    bso.onCycle = function(event) {
        log('\n' + String(event.target));
        scrollToEnd();
    };

    bso.onComplete = function() {
        log('\nFastest is ' + this.filter('fastest').pluck('name') + '\n');
        // Remove current suite from queue
        suites.shift();
        if (suites.length) {
            // Run next suite
            suites[0].run();
        } else {
            log('\nFinished. &#x263A;');
        }
        scrollToEnd();
    };

/*--------------------------------------
 *  Start of perf suites
 *------------------------------------*/

    (function() {
        var pattern = '^([.])\\1+$';

        suites.push(Benchmark.Suite('Constructor')
            .add('XRegExp with pattern cache flush', function() {
                XRegExp(pattern, 'g');
                XRegExp.cache.flush('patterns');
            })
            .add('XRegExp', function() {
                XRegExp(pattern, 'g');
            })
            .add('XRegExp.cache', function() {
                XRegExp.cache(pattern, 'g');
            })
            .add('RegExp', function() {
                new RegExp(pattern, 'g');
            })
        );
    }());

    (function() {
        var regexG = /(((?=x).)\2)+/g;
        var str = Array(30 + 1).join('hello world x ') + 'xx!';
        var pos = 5;

        XRegExp.install('natives');
        var fixedExec = RegExp.prototype.exec;
        XRegExp.uninstall('natives');

        suites.push(Benchmark.Suite('exec')
            .add('Native exec', function() {
                regexG.lastIndex = pos;
                regexG.exec(str);
            })
            .add('Shimmed exec', function() {
                regexG.lastIndex = pos;
                fixedExec.call(regexG, str);
            })
            .add('XRegExp.exec', function() {
                XRegExp.exec(str, regexG, pos);
            })
        );

        var numStrs = 2e5;
        var strs = [];
        var i;

        // Use lots of different strings to remove the benefit of Opera's regex/string match cache
        for (i = 0; i < numStrs; ++i) {
            strs.push(str + i);
        }

        suites.push(Benchmark.Suite('exec with ' + numStrs + ' different strings')
            .add('Native exec', function() {
                regexG.lastIndex = pos;
                regexG.exec(strs[++i] || strs[i=0]);
            })
            .add('Shimmed exec', function() {
                regexG.lastIndex = pos;
                fixedExec.call(regexG, strs[++i] || strs[i=0]);
            })
            .add('XRegExp.exec', function() {
                XRegExp.exec(strs[++i] || strs[i=0], regexG, pos);
            })
        );

        suites.push(Benchmark.Suite('Sticky exec with ' + numStrs + ' different strings')
            .add('Native exec', function() {
                regexG.lastIndex = pos;
                var match = regexG.exec(strs[++i] || strs[i=0]);
                if (match && match.index !== pos) {
                    match = null;
                }
            })
            .add('Shimmed exec', function() {
                regexG.lastIndex = pos;
                var match = fixedExec.call(regexG, strs[++i] || strs[i=0]);
                if (match && match.index !== pos) {
                    match = null;
                }
            })
            .add('XRegExp.exec', function() {
                var match = XRegExp.exec(strs[++i] || strs[i=0], regexG, pos, 'sticky');
            })
        );
    }());

    (function() {
        var str = Array(30 + 1).join('hello xx world ');

        suites.push(Benchmark.Suite('Iteration with a nonglobal regex')
            .add('replace with callback', function() {
                var r = /^|(((?=x).)\2)+/;
                var matches = [];
                if (!r.global) {
                    //r = XRegExp.globalize(r);
                    r = new RegExp(r.source, 'g' +
                        (r.ignoreCase ? 'i' : '') +
                        (r.multiline ? 'm' : '') +
                        (r.sticky ? 'y' : ''));
                }
                str.replace(r, function(match) {
                    matches.push(match);
                });
            })
            .add('while/exec', function() {
                var r = /^|(((?=x).)\2)+/;
                var matches = [];
                var match;
                if (r.global) {
                    r.lastIndex = 0;
                } else {
                    //r = XRegExp.globalize(r);
                    r = new RegExp(r.source, 'g' +
                        (r.ignoreCase ? 'i' : '') +
                        (r.multiline ? 'm' : '') +
                        (r.sticky ? 'y' : ''));
                }
                while (match = r.exec(str)) {
                    matches.push(match[0]);
                    if (r.lastIndex === match.index) {
                        ++r.lastIndex;
                    }
                }
            })
            .add('while/XRegExp.exec', function() {
                var r = /^|(((?=x).)\2)+/;
                var matches = [];
                var match;
                var pos = 0;
                while (match = XRegExp.exec(str, r, pos)) {
                    matches.push(match[0]);
                    pos = match.index + (match[0].length || 1);
                }
            })
            .add('XRegExp.forEach', function() {
                var r = /^|(((?=x).)\2)+/;
                var matches = XRegExp.forEach(str, r, function(match) {
                    this.push(match[0]);
                }, []);
            })
        );
    }());

    (function() {
        var str = Array(30 + 1).join('hello world ') + 'http://xregexp.com/path/to/file?q=1';
        var regexp = new RegExp('\\b([^:/?\\s]+)://([^/?\\s]+)([^?\\s]*)\\??([^\\s]*)');
        var xregexp   = XRegExp('\\b([^:/?\\s]+)://([^/?\\s]+)([^?\\s]*)\\??([^\\s]*)');

        suites.push(Benchmark.Suite('Regex object type')
            .add('RegExp object', function() {
                regexp.exec(str);
            })
            .add('XRegExp object', function() {
                xregexp.exec(str);
            })
        );

        var xregexpNamed4 =
            XRegExp('\\b(?<scheme> [^:/?\\s]+ ) ://   # aka protocol   \n' +
                    '   (?<host>   [^/?\\s]+  )       # domain name/IP \n' +
                    '   (?<path>   [^?\\s]*   ) \\??  # optional path  \n' +
                    '   (?<query>  [^\\s]*    )       # optional query', 'x');
        var xregexpNamed1 =
            XRegExp('\\b(?<scheme> [^:/?\\s]+ ) ://   # aka protocol   \n' +
                    '   (          [^/?\\s]+  )       # domain name/IP \n' +
                    '   (          [^?\\s]*   ) \\??  # optional path  \n' +
                    '   (          [^\\s]*    )       # optional query', 'x');
        var xregexpNumbered =
            XRegExp('\\b(          [^:/?\\s]+ ) ://   # aka protocol   \n' +
                    '   (          [^/?\\s]+  )       # domain name/IP \n' +
                    '   (          [^?\\s]*   ) \\??  # optional path  \n' +
                    '   (          [^\\s]*    )       # optional query', 'x');

        suites.push(Benchmark.Suite('Capturing')
            .add('Numbered capture', function() {
                XRegExp.exec(str, xregexpNumbered);
            })
            .add('Named capture (one name)', function() {
                XRegExp.exec(str, xregexpNamed1);
            })
            .add('Named capture (four names)', function() {
                XRegExp.exec(str, xregexpNamed4);
            })
        );
    }());

    suites.push(Benchmark.Suite('Unicode letter construction')
        .add('Incomplete set: /[a-z]/i', function() {
            XRegExp('(?i)[a-z]');
            XRegExp.cache.flush('patterns');
        })
        .add('BMP only: /\\pL/', function() {
            XRegExp('\\pL');
            XRegExp.cache.flush('patterns');
        })
        .add('Full Unicode: /\\pL/A', function() {
            XRegExp('(?A)\\pL');
            XRegExp.cache.flush('patterns');
        })
    );

    (function() {
        var asciiText = 'Now is the time for all good men to come to the aid of the party!';
        var mixedText = 'We are looking for a letter/word followed by an exclamation mark, ☃ ☃ ☃ ☃ ☃ and δοκεῖ δέ μοι καὶ Καρχηδόνα μὴ εἶναι!';
        var unicodeText = 'Зоммерфельд получил ряд важных результатов в рамках «старой квантовой теории», предшествовавшей появлению современной квантовой механики!';
        var unicodeText2 = 'როგორც სამედიცინო ფაკულტეტის ახალგაზრდა სტუდენტი, გევარა მთელს ლათინურ ამერიკაში მოგზაურობდა და იგი სწრაფად!';

        function test(regex) {
            regex.test(asciiText);
            regex.test(mixedText);
            regex.test(unicodeText);
            regex.test(unicodeText2);
        }

        var azCaselessChar = XRegExp('(?i)[a-z]!');
        var bmpLetterChar = XRegExp('\\pL!');
        var astralLetterChar = XRegExp('(?A)\\pL!');

        suites.push(Benchmark.Suite('Unicode letter matching')
            .add('a-z caseless', function() {
                test(azCaselessChar);
            })
            .add('\\pL', function() {
                test(bmpLetterChar);
            })
            .add('\\pL astral', function() {
                test(astralLetterChar);
            })
        );

        var azCaselessWord = XRegExp('(?i)[a-z]+!');
        var bmpLetterWord = XRegExp('\\pL+!');
        var astralLetterWord = XRegExp('(?A)\\pL+!');

        suites.push(Benchmark.Suite('Unicode word matching')
            .add('a-z caseless', function() {
                test(azCaselessWord);
            })
            .add('\\pL', function() {
                test(bmpLetterWord);
            })
            .add('\\pL astral', function() {
                test(astralLetterWord);
            })
        );
    }());
}());
